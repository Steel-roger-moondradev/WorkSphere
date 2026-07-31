import { authenticatedRequest } from "../middleware/auth.js";
import getBuffer from "../utils/buffer.js";
import sql from "../utils/db.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import TryCatch from "../utils/TryCatch.js";
import axios from "axios";
import { emailQueue } from "../utils/queue.js";
import { applicationStatusUpdateTemplate } from "../utils/templateStatusupdation.js";

type UploadResponse = {
  url: string;
  public_id: string;
};
export const createCompany = TryCatch(
  async (req: authenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler("Authentication is required", 401);
    }
    const role = await sql`
    SELECT role FROM users WHERE user_id=${user.user_id}
    `;
    const userRole = role[0];

    if (userRole.role == "jobseeker") {
      throw new ErrorHandler("only recruiter is allowed", 401);
    }
    const { name, website, description } = req.body;

    if (!name || !description || !website) {
      throw new ErrorHandler("Data is not enough to list as a company", 400);
    }
    const existing = await sql`
    SELECT company_id FROM companies WHERE name=${name}
    `;
    if (existing.length > 0) {
      throw new ErrorHandler("Company name already exists", 400);
    }
    const file = req.file;
    if (!file) {
      throw new ErrorHandler("Unable to fetch logo", 400);
    }
    const buffer = getBuffer(file);

    const { data } = await axios.post<UploadResponse>(
      `${process.env.UPLOAD_SERVICES}/api/utils/upload`,
      { buffer: buffer.content },
    );
    if (!data) {
      throw new ErrorHandler("Error in uploading", 400);
    }

    const [company] = await sql`
    INSERT INTO companies(name,description,website,logo,logo_public_id,recruiter_id)
    VALUES (${name},${description},${website},${data.url},${data.public_id},${user.user_id})
    RETURNING *
    `;

    if (!company) {
      throw new ErrorHandler("Error in creating company", 400);
    }
    res.json({
      message: "Company listed successfully",
      company,
    });
  },
);

export const companyDelete = TryCatch(
  async (req: authenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler("Authentication is required", 401);
    }
    const [userRole] = await sql`
    SELECT role FROM users WHERE user_id=${user.user_id}
    `;

    if (!userRole) {
      throw new ErrorHandler("User role not found", 400);
    }

    if (userRole.role == "jobseeker") {
      throw new ErrorHandler("only recruiter is allowed", 401);
    }
    const { company } = req.params;
    const [deleteCompany] = await sql`
        DELETE FROM companies WHERE name=${company} AND recruiter_id=${user.user_id} RETURNING *;
    `;
    if (!deleteCompany) {
      throw new ErrorHandler(
        "Company does not exist or you are not authorized",
        400,
      );
    }
    res.json({
      message: "Company is deleted successfully",
      deleteCompany,
    });
  },
);

export const createJob = TryCatch(
  async (req: authenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler("Authentication is required", 401);
    }
    const Usersrole = await sql`
    SELECT role FROM users WHERE user_id=${user.user_id}
    `;
    const userRole = Usersrole[0];

    if (userRole.role == "jobseeker") {
      throw new ErrorHandler("only recruiter is allowed", 401);
    }
    const {
      title,
      description,
      salary,
      location,
      openings,
      job_type,
      work_location,
      role,
      company_id,
    } = req.body;

    if (
      !title ||
      !description ||
      !salary ||
      !location ||
      !openings ||
      !job_type ||
      !work_location ||
      !role ||
      !company_id
    ) {
      throw new ErrorHandler("Data is insufficient", 401);
    }

    const [company] = await sql`
    SELECT name FROM companies WHERE company_id=${company_id}
    AND recruiter_id=${user.user_id}
    `;

    if (!company) {
      throw new ErrorHandler(
        "Company does not exist or you are not authorized",
        400,
      );
    }

    const [newJob] = await sql`
    INSERT INTO jobs(title,description,salary,location,openings,job_type,work_location,role,company_id,posted_by_recruiter_id)
    VALUES(${title},${description},${salary},${location},${openings},${job_type},${work_location},${role},${company_id},${user.user_id})
    RETURNING *
    `;

    res.json({
      message: "Job is created",
      newJob,
    });
  },
);

export const updateJob = TryCatch(
  async (req: authenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler("Authentication is required", 401);
    }
    const Usersrole = await sql`
    SELECT role FROM users WHERE user_id=${user.user_id}
    `;
    const userRole = Usersrole[0];

    if (userRole.role == "jobseeker") {
      throw new ErrorHandler("only recruiter is allowed", 401);
    }
    const {
      title,
      description,
      salary,
      location,
      openings,
      job_type,
      work_location,
      role,
      company_id,
      is_active,
    } = req.body;

    if (
      !title ||
      !description ||
      !salary ||
      !location ||
      !openings ||
      !job_type ||
      !work_location ||
      !role
    ) {
      throw new ErrorHandler("Data is insufficient", 401);
    }

    const [updatedJob] = await sql`
    UPDATE  jobs
    SET title=${title},description=${description},salary=${salary},location=${location},openings=${openings},job_type=${job_type},work_location=${work_location},role=${role},posted_by_recruiter_id=${user.user_id},is_active=${is_active}
    WHERE job_id=${req.params.job_id}
    RETURNING *
    `;

    res.json({
      message: "Job is updated",
      updatedJob,
    });
  },
);

export const getAllCompanies = TryCatch(
  async (req: authenticatedRequest, res, next) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler("Authentication is required", 401);
    }

    const company = await sql`
    SELECT * FROM companies WHERE recruiter_id=${user?.user_id}
    `;
    if (!company) {
      throw new ErrorHandler("No company found for this recruiter", 400);
    }
    res.json(company);
  },
);

export const getAllCompanyDetails = TryCatch(async (req, res, next) => {
  const [companyDetails] = await sql`
    SELECT c.*, COALESCE(
    (SELECT json_agg(j.*) FROM jobs j WHERE j.company_id=c.company_id),
    '[]'::json
    )AS jobs 
    FROM companies c WHERE c.company_id=${req.params.companyId}
    GROUP BY c.company_id
    `;
  if (!companyDetails) {
    throw new ErrorHandler("This company does not exist", 400);
  }
  res.json(companyDetails);
});

export const getAllActiveJobs = TryCatch(async (req, res) => {
  const { title, location } = req.query;

  const jobs = await sql`
    SELECT j.job_id,j.title,j.description,j.salary,j.location,j.job_type,j.openings,j.role,j.work_location,j.company_id,c.name as company_name,c.logo as company_logo 
    FROM jobs j 
    JOIN companies c
    ON j.company_id=c.company_id
    WHERE j.is_active=true
    ${title ? sql`AND j.title ILIKE ${`%${title}%`}` : sql``}
    ${location ? sql`AND j.location ILIKE ${`%${location}%`}` : sql``}
    ORDER BY j.created_at DESC
    `;

  res.json({
    message: "All active jobs",
    jobs,
  });
});
export const getSingleJob = TryCatch(async (req, res) => {
  const [job] = await sql`
    SELECT * FROM jobs j WHERE j.job_id=${req.params?.jobId};
    `;
  if (!job) {
    throw new ErrorHandler("This job does not exist", 400);
  }
  res.json(job);
});

export const getAllApplicationsForJob = TryCatch(
  async (req: authenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler("Authentication is required", 401);
    }
    const Usersrole = await sql`
    SELECT role FROM users WHERE user_id=${user?.user_id}
    `;
    const userRole = Usersrole[0];

    if (userRole.role == "jobseeker") {
      throw new ErrorHandler("only recruiter is allowed", 401);
    }
    const { jobId } = req.params;
    if (!jobId) {
      throw new ErrorHandler("Invalid job to find", 400);
    }
    const applications = await sql`
    SELECT * FROM applications 
    WHERE job_id=${jobId}
    ORDER BY subscribed DESC,applied_at ASC
    `;
    res.json({
      message: "All applications are",
      applications,
    });
  },
);
export const selectapplicants = TryCatch(
  async (req: authenticatedRequest, res) => {
    const user = req.user;
    if (!user) {
      throw new ErrorHandler("Authentication is required", 401);
    }
    const Usersrole = await sql`
    SELECT role FROM users WHERE user_id=${user?.user_id}
    `;
    const userRole = Usersrole[0];

    if (userRole.role == "jobseeker") {
      throw new ErrorHandler("only recruiter is allowed", 401);
    }
    const { id } = req.params;
    const [application] = await sql`
    SELECT job_id,applicant_email FROM applications
    WHERE application_id=${id}
    `;
    if (!application) {
      throw new ErrorHandler("no applicant exists", 400);
    }
    const [job] =
      await sql`SELECT posted_by_recruiter_id,title FROM jobs WHERE job_id=${application.job_id}`;
    if (!job) {
      throw new ErrorHandler("no job exists", 400);
    }
    if (job.posted_by_recruiter_id != user.user_id) {
      throw new ErrorHandler("You are not allowed", 401);
    }
    const [updatedApplicant] =
      await sql`UPDATE applications SET status=${req.body.status} WHERE application_id=${id} RETURNING *`;
    if (!updatedApplicant) {
      throw new ErrorHandler("Error in status updating", 400);
    }
    const message = {
      to: application.applicant_email,
      subject: "STATUS-UPDATION",
      html: applicationStatusUpdateTemplate(job.title),
    };
    try {
      await emailQueue.add("STATUS-UPDATION", message);

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

    res.json({
      message: "Status is updated",
      job,
      updatedApplicant,
    });
  },
);

export const jobcount = TryCatch(async (req, res) => {
  const count = await sql`
    SELECT COUNT(*) FROM jobs WHERE is_active=true
    `;
  if (!count) {
    throw new ErrorHandler("Failed to retrieve job count", 500);
  }
  res.json(count[0].count);
});
export const companycount = TryCatch(async (req, res) => {
  const count = await sql`
    SELECT COUNT(*) FROM companies 
    `;
  if (!count) {
    throw new ErrorHandler("Failed to retrieve company count", 500);
  }
  res.json(count[0].count);
});
