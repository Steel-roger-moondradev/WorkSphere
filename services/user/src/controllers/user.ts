import { authenticatedRequest } from "../middleware/auth.js";
import TryCatch from "../utils/./TryCatch.js";
import getBuffer from "../utils/buffer.js";
import sql from "../utils/db.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import axios from "axios";

export const myProfile = TryCatch(
  async (req: authenticatedRequest, res, next) => {
    const user = req.user;
    res.json(user);
  },
);

type UploadResponse = {
  url: string;
  public_id: string;
};
export const getProfile = TryCatch(
  async (req: authenticatedRequest, res, next) => {
    const { userId } = req.params;
    const users = await sql`
        SELECT u.user_id,u.name,u.email,u.phone_number,u.role,u.bio,u.resume,
        u.profile_pic,ARRAY_AGG(s.name) FILTER(WHERE s.name IS NOT NULL) as skills FROM users u 
        LEFT JOIN users_skills us ON us.user_id=u.user_id LEFT JOIN skills s ON s.skill_id=us.skill_id
        WHERE u.user_id=${userId}
        GROUP BY u.user_id
        `;

    if (users.length === 0) {
      res.status(404).json({
        message: "User does not exist",
      });
      return;
    }
    const isOwnProfile = req.user?.user_id === Number(userId);
    const user = users[0];
    user.skills = user.skills || [];
    if (!isOwnProfile) {
      delete user.email;
      delete user.phone_number;
    }
    const userObject = user;
    res.json({
      userObject,
    });
  },
);
export const updateProfile = TryCatch(
  async (req: authenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler("Token does not exist", 401);
    }
    const { name, phone_number, bio } = req.body;
    const newname = name || user.name;
    const new_phone_number = phone_number || user.phone_number;
    const newbio = bio || user.bio;
    const [updatedprofile] = await sql`
    UPDATE users SET name=${newname},phone_number=${new_phone_number},bio=${newbio}
    WHERE user_id=${user.user_id}
    RETURNING user_id,name,bio,phone_number,email,role,profile_pic,resume;
    `;
    const userObject = updatedprofile;
    res.json({
      message: "Profile is updated successfully",
      userObject,
    });
  },
);

export const updatePic = TryCatch(
  async (req: authenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler("Authentication is required", 401);
    }
    console.log("user that we have is :", user);
    const file = req.file;
    if (!file) {
      throw new ErrorHandler("Image is required", 400);
    }
    console.log("file that we have is :", file);

    const old_file_id = user.profile_pic_public_key;
    const buffer = getBuffer(file);
    if (!buffer || !buffer.content) {
      throw new ErrorHandler("failed to generate Image", 400);
    }
    console.log("buffer that we have is :", buffer);

    const { data } = await axios.post<UploadResponse>(
      `${process.env.UPLOAD_SERVICES}/api/utils/upload`,
      { buffer: buffer.content, public_id: old_file_id },
    );
    console.log("data that we have is :", data);

    const [updateUser] = await sql`
        UPDATE users 
        SET profile_pic = ${data.url},
            profile_pic_public_key = ${data.public_id}
        WHERE user_id = ${user.user_id}
        RETURNING user_id,name,bio,phone_number,email,role,profile_pic,resume
`;
    const userObject = updateUser;
    res.json({
      message: "Profile pic is Updated",
      userObject,
    });
  },
);

export const updateResume = TryCatch(
  async (req: authenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler("Authentication is required", 401);
    }
    const file = req.file;
    if (!file) {
      throw new ErrorHandler("Resume is required", 400);
    }
    const old_file_id = user.resume_public_id;
    const buffer = getBuffer(file);
    if (!buffer || !buffer.content) {
      throw new ErrorHandler("failed to generate Resume", 400);
    }
    const { data } = await axios.post<UploadResponse>(
      `${process.env.UPLOAD_SERVICES}/api/utils/upload`,
      { buffer: buffer.content, public_id: old_file_id },
    );
    const [updateUser] = await sql`
        UPDATE users 
        SET resume = ${data.url},
            resume_public_id = ${data.public_id}
        WHERE user_id = ${user.user_id}
        RETURNING user_id,name,bio,phone_number,email,role,profile_pic,resume
`;
    const userObject = updateUser;
    res.json({
      message: "Resume is Updated",
      userObject,
    });
  },
);

export const addSkill = TryCatch(
  async (req: authenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler("Authentication is required", 401);
    }
    const userId = user.user_id;
    const { skillName } = req.body;
    let wasSkillAdded = false;
    try {
      // to make our query a whole transaction
      await sql`BEGIN`;

      const skillRows = await sql`
        INSERT INTO skills(name)
        VALUES (${skillName.trim().toLowerCase()})
        ON CONFLICT (name)
        DO UPDATE SET name=EXCLUDED.name
        RETURNING skill_id
        `;
      if (skillRows.length === 0) {
        throw new ErrorHandler("Failed to resolve skill", 500);
      }
      const skillId = skillRows[0].skill_id;
      const insertionResult = await sql`
        INSERT INTO users_skills(user_id,skill_id)
        VALUES (${userId},${skillId})
        ON CONFLICT(user_id,skill_id)
        DO NOTHING 
        RETURNING user_id
        `;
      if (insertionResult.length > 0) {
        wasSkillAdded = true;
      }
      await sql`COMMIT`;
    } catch (error: any) {
      await sql`ROLLBACK`;
      throw error;
    }
    if (!wasSkillAdded) {
      return res.status(200).json({
        message: "User already have this skill",
      });
    }
    res.status(200).json({
      message: `${skillName.trim()} is added as a skill successfully`,
    });
  },
);
export const deleteSkill = TryCatch(
  async (req: authenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler("Authentication is required", 401);
    }
    const userId = user.user_id;
    const { skillName } = req.body;
    if (!skillName || skillName.trim() === "") {
      throw new ErrorHandler("No skill provided to Delete", 400);
    }
    const result =
      await sql`DELETE FROM users_skills WHERE user_id=${userId} AND
    skill_id=(SELECT skill_id FROM skills WHERE name=(${skillName.trim().toLowerCase()}))
    RETURNING user_id`;
    if (result.length === 0) {
      throw new ErrorHandler(
        `${skillName.trim().toLowerCase()} as Skill not found`,
        400,
      );
    }
    res.json({
      message: `${skillName.trim().toLowerCase()} is deleted Successfully`,
    });
  },
);
export const applyForJob = TryCatch(async (req: authenticatedRequest, res) => {
  const user = req.user;
  if (!user) {
    throw new ErrorHandler("Authentication is required", 401);
  }
  if (user.role != "jobseeker") {
    throw new ErrorHandler("Forbidden request", 403);
  }
  const { job_id } = req.body || {};
  const resume = user.resume;
  const applicant_id = user.user_id;

  if (!job_id || !resume) {
    console.log(job_id);
    console.log(resume);
    console.log(applicant_id);
    throw new ErrorHandler("Data is insufficient", 400);
  }
  const job = await sql`SELECT is_active FROM jobs WHERE job_id=${job_id}`;

  if (job.length === 0 || job[0].is_active == false) {
    throw new ErrorHandler("Job does not exists", 400);
  }

  const time = Date.now();
  const subTime = user.subscription ? new Date(user.subscription).getTime() : 0;
  const subscribed = subTime > time;
  let jobApplied;
  try {
    [jobApplied] = await sql`
    INSERT INTO applications (job_id,applicant_id,applicant_email,resume,subscribed)
    VALUES(${job_id},${applicant_id},${user.email},${resume},${subscribed})
    `;
  } catch (error: any) {
    if (error.code === 23505) {
      throw new ErrorHandler("You have already registered", 409);
    }
    throw error;
  }

  res.json({
    message: "Applied for job",
    jobApplied,
  });
});
export const getAllApllications = TryCatch(
  async (req: authenticatedRequest, res) => {
    const appliedJobs = await sql`
    SELECT a.*, j.title as job_title, j.salary as job_salary,j.location as job_location FROM applications a JOIN jobs j ON j.job_id=a.job_id WHERE a.applicant_id=${req.user?.user_id}
    `;
    res.json(appliedJobs);
  },
);
