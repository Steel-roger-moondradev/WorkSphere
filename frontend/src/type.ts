import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import { ReactNode } from "react";

export interface JobOptions {
  title: string;
  responsibilities: string;
  why: string;
}

export interface SkillsToLearn {
  title: string;
  why: string;
  how: string;
}

export interface SkillCategory {
  category: string;
  skills: SkillsToLearn[];
}

export interface LearningApproach {
  title: string;
  points: string[];
}

export interface CareerGuideResponse {
  summary: string;
  jobOptions: JobOptions[];
  skillsToLearn: SkillCategory[];
  learningApproach: LearningApproach;
}
export interface Dummy {
  score: number;
  feedback: string;
}
export interface scoreBreakdown {
  formatting: Dummy;
  keywords: Dummy;
  structure: Dummy;
  readability: Dummy;
}

export interface suggestions {
  category: string;
  issue: string;
  recommendation: string;
  priority: "high" | "medium" | "low";
}
export interface ResumeAnalysisResponse {
  atsScore: number;
  scoreBreakdown: scoreBreakdown;
  suggestions: suggestions[];
  strengths: string[];
  summary: string;
}
export interface User {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  role: string;
  bio: string | null;
  resume: string | null;
  profile_pic: string | null;
  profile_pic_public_key: string | null;
  resume_public_id: string | null;
  subscription: string | null;
  skills: string[];
}
export interface AppContextType {
  user: User | null;
  loading: boolean;
  applicationsLoading: boolean;
  btnLoading: boolean;
  isAuth: boolean;
  btnloadingR: boolean;
  btnLoadingE: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  setBtnloading: React.Dispatch<React.SetStateAction<boolean>>;
  profileUpdatepic: (formData: any) => Promise<void>;
  ResumeUpdate: (formData: any) => Promise<void>;
  profileUpdate: (
    name: string,
    phone_number: string,
    bio: string | "",
    email: string,
  ) => Promise<void>;
  applications: Application[] | null;
  fetchIndividualApplication: () => Promise<void>;
  setApplications: React.Dispatch<React.SetStateAction<Application[] | null>>;
}
export interface AppProviderProps {
  children: ReactNode;
}
export interface LoginResponse {
  message: string;
  userObject: User;
  accessToken: string;
}
export interface InfoProps {
  user: User | null;
  isAuthorised: boolean;
}
export interface Company {
  company_id: number;
  name: string;
  description: string;
  website: string;
  logo: string | null;
  logo_public_id: string | null;
  recruiter_id: number;
  created_at: Timestamp;
  jobs: Job[] | null;
}
export interface CompanyProps {
  isAuthorised: boolean;
}

export interface Job {
  job_id: number;
  title: string;
  description: string;
  salary: number;
  location: string;
  job_type: "internship" | "full-time" | "part-time" | "contract";
  openings: number;
  role: string;
  work_location: "on-site" | "hybrid" | "remote";
  company_id: number;
  company_name: string;
  company_logo: string | null;
  posted_by_recruiter_id: number;
  created_at: Timestamp;
  is_active: boolean;
}
export interface Application {
  application_id: number;
  job_id: number;
  applicant_id: number;
  applicant_email: string;
  status: "submitted" | "rejected" | "hired";
  resume: string;
  applied_at: string;
  subscribed: boolean;
  job_title: string;
  job_salary: number;
  job_location: string;
}
