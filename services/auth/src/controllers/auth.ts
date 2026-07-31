import sql from "../utils/db.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import TryCatch from "../utils/TryCatch.js";
import bcrypt from "bcrypt";
import getBuffer from "../utils/buffer.js";
import axios from "axios";
import jwt, { JwtPayload } from "jsonwebtoken";
import { forgotPasswordTemplate } from "../utils/forgotpassword.js";
import { connection } from "../utils/redis.js";
import { emailQueue } from "../utils/queue.js";

export const registerUser = TryCatch(async (req, res) => {
  const { name, email, password, phone_number, role, bio } = req.body;

  if (!email || !name || !password || !phone_number || !role) {
    throw new ErrorHandler("Input data is incomplete", 409);
  }
  //checking if user already exists
  const checkUser = await sql`SELECT email from users where email=${email}`;
  if (checkUser.length > 0) {
    //if exists throw error
    throw new ErrorHandler("User already exists", 409);
  }

  const hashpassword = await bcrypt.hash(password, 10);

  //if not exists then create new user
  let userObject;
  if (role == "recruiter") {
    const [user] =
      await sql`INSERT INTO users (email, name, password ,phone_number ,role)
                                    VALUES (${email},${name},${hashpassword},${phone_number},${role}) RETURNING
                                    user_id,name,email,password,phone_number,role,created_at`;
    userObject = user;
  } else if (role == "jobseeker") {
    const file = req.file;
    if (!file) {
      throw new ErrorHandler("Resume is needed for jobseekers", 400);
    }
    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
      throw new ErrorHandler("Internal Sever Error", 500);
    }
    const { data } = await axios.post(
      `${process.env.UPLOAD_SERVICES}/api/utils/upload`,
      { buffer: fileBuffer.content },
    );
    if (!data) {
      throw new ErrorHandler("problem in axios", 500);
    }
    const [user] =
      await sql`INSERT INTO users (email, name, password ,phone_number ,role,bio,resume,resume_public_id)
                                    VALUES (${email},${name},${hashpassword},${phone_number},${role},${bio},${data.url},${data.public_id}) RETURNING
                                    user_id,name,email,phone_number,role,created_at,bio,resume`;
    userObject = user;
  }
  if (userObject) {
    const secret = process.env.JWT_SECRET as string;

    const payload = {
      id: userObject.user_id,
    };

    const token = jwt.sign(payload, secret, {
      expiresIn: "1d",
    });
    return res.json({
      message: "User have been registered",
      userObject,
      token,
    });
  }
});

export const loginUser = TryCatch(async (req, res) => {
  const { email: eml, password: pswd } = req.body;
  if (!eml || !pswd) {
    throw new ErrorHandler("Incomplete Credentials", 400);
  }
  const user = await sql`
        SELECT u.user_id,u.name,u.email,u.password,u.phone_number,u.bio,u.resume,u.profile_pic,u.subscription,
        u.role,ARRAY_AGG(s.name) FILTER(WHERE s.name IS NOT NULL) as skills FROM users u LEFT JOIN users_skills us on us.user_id=u.user_id 
        LEFT JOIN skills s ON s.skill_id=us.skill_id
        WHERE email=${eml}
        GROUP BY u.user_id;
    `;

  const userObject = user[0];

  if (!userObject) {
    throw new ErrorHandler("Invalid credentials", 400);
  }
  const matchPassword = await bcrypt.compare(pswd, userObject.password);
  if (!matchPassword) {
    throw new ErrorHandler("Invalid credentials", 400);
  }
  delete userObject.password;
  userObject.skills = userObject.skills || [];

  const token = jwt.sign(
    {
      id: userObject.user_id,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1d",
    },
  );

  return res.status(200).json({
    message: "User logged in",
    userObject,
    token,
  });
});

export const forgetPassword = TryCatch(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    throw new ErrorHandler("Email is required", 400);
  }
  const userObject =
    await sql`SELECT email,user_id FROM users WHERE email=${email}`;
  if (userObject.length === 0) {
    res.json("Mail has been send if email exists");
    return;
  }
  const user = userObject[0];
  const resetToken = jwt.sign(
    {
      emailId: user.email,
      type: "reset",
    },
    process.env.RESET_PASS_TKN as string,
    { expiresIn: "15m" },
  );
  await connection.set(`reset:${email}`, resetToken, "EX", 900);
  const resetLink = `${process.env.FRONTEND_URL}/reset/${resetToken}`;
  const message = {
    to: email,
    subject: "reset-password",
    html: forgotPasswordTemplate(resetLink),
  };
  try {
    console.log("Queuing email job for password reset");
    await emailQueue.add("forgot-password", message);
    console.log("Email job queued successfully for password reset");
    res.status(200).json({
      success: true,
      message: "Password reset email queued",
    });
  } catch (error) {
    console.error("Failed to enqueue email job:", error);

    res.status(500).json({
      success: false,
      message: "Could not process your request.",
    });
  }

  // publishToProducer(process.env.KAFKA_TOPIC as string, message).catch(
  //   (error) => {
  //     console.log("failed to send message");
  //   },
  // );
});

export const resetPassword = TryCatch(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;
  let decoded: any;
  try {
    decoded = jwt.verify(token as string, process.env.RESET_PASS_TKN as string);
  } catch (error: any) {
    throw new ErrorHandler("Token is expired", 400);
  }
  if (decoded.type != "reset") {
    throw new ErrorHandler("INVALID TOKEN TYPE", 400);
  }
  let email = decoded.emailId;
  const storedToken = await connection.get(`reset:${email}`);
  if (!storedToken || storedToken != token) {
    throw new ErrorHandler("Token is expired", 400);
  }
  const users =
    await sql`SELECT user_id, password from users WHERE email=${email}`;
  if (users.length === 0) {
    throw new ErrorHandler("user not found", 404);
  }
  let user = users[0];
  const hashPassword = await bcrypt.hash(password, 10);
  await sql`UPDATE users SET password=${hashPassword} where user_id=${user.user_id}`;
  await connection.del(`reset:${email}`);
  res.json({ message: "Your password is updated successfully" });
});

export const usercount = TryCatch(async (req, res) => {
  const result = await sql`SELECT COUNT(*)::int AS count FROM users`;
  if (!result) {
    throw new ErrorHandler("Failed to retrieve user count", 500);
  }
  res.json(result[0].count);
});

export const refreshToken = TryCatch(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    throw new ErrorHandler("Unauthorized", 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);

  const storedToken = await connection.get(
    `refresh:${decoded as JwtPayload}.id`,
  );

  if (storedToken !== token) {
    throw new ErrorHandler("Invalid session", 401);
  }

  const accessToken = jwt.sign(
    { id: decoded as JwtPayload }.id,
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: "15m" },
  );

  res.json({ accessToken });
});

export const logout = TryCatch(async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string);

    await connection.del(`refresh:${decoded as JwtPayload}.id`);
  }

  res.clearCookie("refreshToken");

  res.json({
    message: "Logged out",
  });
});
