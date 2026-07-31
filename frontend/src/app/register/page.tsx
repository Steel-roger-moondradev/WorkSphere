"use client";

import { useappdata } from "@/context/AppContext";
import { useState } from "react";
import { auth_service } from "../../context/AppContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LoginResponse } from "@/type";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import axios from "axios";
import {
  User,
  Mail,
  Lock,
  Phone,
  FileText,
  AlignLeft,
  Briefcase,
} from "lucide-react";

const register = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<string>("");
  const [name, setName] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [bio, setBio] = useState("");

  const {
    user,
    loading,
    btnLoading,
    isAuth,
    setUser,
    setLoading,
    setIsAuth,
    setBtnloading,
  } = useappdata();
  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBtnloading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("phone_number", phone_number);
    formData.append("role", role);

    if (role == "jobseeker") {
      formData.append("bio", bio);
      if (resume) formData.append("resume", resume);
    }

    try {
      const { data } = await axios.post<LoginResponse>(
        `${auth_service}/api/auth/register`,
        formData,
      );
      if (!data || !data.token || !data.userObject) {
        throw new Error("Invalid response");
      }
      Cookies.set("token", data.token, {
        secure: true,
        expires: 15,
        path: "/",
      });
      toast.success(data.message);
      setIsAuth(true);
      setUser(data.userObject);
      router.push("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message);
      setIsAuth(false);
    } finally {
      setBtnloading(false);
    }
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-white via-purple-50 to-purple-100 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950 flex items-center justify-center px-4">
      {/* Card */}
      <div className="w-full max-w-3xl bg-white/80 dark:bg-slate-900/75 border border-white/60 dark:border-slate-700/70 backdrop-blur-lg shadow-xl rounded-3xl p-8 animate-fadeIn">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Create Account
        </h1>
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Join and start your journey 🚀
        </p>

        {/* Form */}
        <form
          onSubmit={submitHandler}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* Role */}
          {role ? (
            <></>
          ) : (
            <>
              <div className="col-span-2 relative">
                <Briefcase
                  className="absolute left-3 top-3 text-slate-400 dark:text-slate-500"
                  size={18}
                />
                <select
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition"
                  onChange={(e) => {
                    setRole(e.target.value);
                  }}
                >
                  <option value="">Select Role</option>
                  <option value="jobseeker">Job Seeker</option>
                  <option value="recruiter">Recruiter</option>
                </select>
              </div>
            </>
          )}
          {role && (
            <>
              <div className="col-span-2 relative">
                <Briefcase
                  className="absolute left-3 top-3 text-slate-400 dark:text-slate-500"
                  size={18}
                />
                <select
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition"
                  onChange={(e) => {
                    setRole(e.target.value);
                  }}
                  value={role}
                >
                  <option value="">Select Role</option>
                  <option value="jobseeker">Job Seeker</option>
                  <option value="recruiter">Recruiter</option>
                </select>
              </div>

              {/* Name */}
              <div className="relative">
                <User
                  className="absolute left-3 top-3 text-slate-400 dark:text-slate-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition"
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-slate-400 dark:text-slate-500"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition"
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-slate-400 dark:text-slate-500"
                  size={18}
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition"
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <Phone
                  className="absolute left-3 top-3 text-slate-400 dark:text-slate-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition"
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                  }}
                />
              </div>
              {role == "jobseeker" && (
                <>
                  {/* Resume */}
                  <div className="col-span-2 relative">
                    <FileText
                      className="absolute left-3 top-3 text-slate-400 dark:text-slate-500"
                      size={18}
                    />
                    <input
                      type="file"
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 file:text-slate-700 dark:file:text-slate-200 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition"
                      accept="application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setResume(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                  {/* Bio */}
                  <div className="col-span-2 relative">
                    <AlignLeft
                      className="absolute left-3 top-3 text-slate-400 dark:text-slate-500"
                      size={18}
                    />
                    <textarea
                      placeholder="Short Bio"
                      rows={3}
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-purple-500 dark:focus:border-purple-400 outline-none transition"
                      onChange={(e) => setBio(e.target.value)}
                    ></textarea>
                  </div>
                </>
              )}

              {/* Button */}
              <Button
                type="submit"
                disabled={btnLoading}
                className="w-full bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-400 text-white shadow-md shadow-purple-500/20 dark:shadow-purple-900/40 transition-all duration-300"
              >
                {btnLoading ? "Registering user..." : "Register"}
              </Button>
            </>
          )}
        </form>
      </div>

      {/* Animations */}
      <style>
        {`
          .animate-fadeIn {
            animation: fadeIn 0.6s ease-in-out;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default register;
