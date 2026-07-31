import app from "./app.js";
import sql from "./utils/db.js";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

async function initDB() {
  try {
    await sql`
        DO $$
        BEGIN
            IF NOT EXISTS(SELECT 1 FROM pg_type WHERE typname='job_type')
            THEN CREATE TYPE job_type as ENUM('internship','full-time','part-time','contract');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='work_location')
            THEN CREATE TYPE  work_location as ENUM('on-site','hybrid','remote');
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname='application_status')
            THEN CREATE TYPE application_status as ENUM('hired','rejected','submitted');
            END IF;
        END$$;
        `;
    await sql`
        CREATE TABLE IF NOT EXISTS companies(
        company_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description text ,
        website VARCHAR(255) NOT NULL,
        logo VARCHAR(255) NOT NULL,
        logo_public_id VARCHAR(255) NOT NULL,
        recruiter_id INTEGER NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        `;

    await sql`
        CREATE TABLE IF NOT EXISTS jobs(
        job_id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        salary NUMERIC(10,2),
        location VARCHAR(255),
        job_type job_type NOT NULL,
        openings NUMERIC(3,1) NOT NULL,
        role VARCHAR(255) NOT NULL,
        work_location  work_location NOT NULL,
        company_id INTEGER NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
        posted_by_recruiter_id INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        is_active BOOLEAN DEFAULT true
        )
        `;
    await sql`
        CREATE TABLE IF NOT EXISTS applications(
        application_id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
        applicant_id INTEGER NOT NULL,
        applicant_email VARCHAR(255) NOT NULL,
        status application_status NOT NULL DEFAULT 'submitted',
        resume VARCHAR(255) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        subscribed BOOLEAN,
        UNIQUE(job_id,application_id)
        )
        `;

    // Enables fast ILIKE matching on job title/location for search filters.
    await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`;

    await sql`CREATE INDEX IF NOT EXISTS idx_companies_recruiter_id ON companies(recruiter_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_companies_name_recruiter_id ON companies(name, recruiter_id)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_jobs_active_created_at ON jobs(is_active, created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_jobs_title_trgm ON jobs USING GIN (title gin_trgm_ops)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_jobs_location_trgm ON jobs USING GIN (location gin_trgm_ops)`;

    await sql`CREATE INDEX IF NOT EXISTS idx_applications_job_subscribed_applied ON applications(job_id, subscribed DESC, applied_at ASC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON applications(applicant_id)`;
    console.log("✅ Database is created/checked");
  } catch (error: any) {
    console.log("❌ Error in database");
    console.error(error);
    process.exit(1);
  }
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

initDB()
  .then(() =>
    app.listen(process.env.PORT, () => {
      console.log(
        `JOB server is listening on http://localhost:${process.env.PORT}`,
      );
    }),
  )
  .catch((err) => {
    console.log(err);
  });
