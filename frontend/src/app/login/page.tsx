"use client";

import { useappdata } from "@/context/AppContext";
import { useEffect, useState } from "react";
import { auth_service } from "../../context/AppContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LoginResponse } from "@/type";
import Cookies from "js-cookie";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import axios from "axios";

const login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [btnLoading, setBtnloading] = useState(false);
  const { user, loading, isAuth, setUser, setIsAuth } = useappdata();

  useEffect(() => {
    if (loading) return;
    if (isAuth) {
      router.replace("/");
    }
  }, [loading, isAuth, router]);

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBtnloading(true);
    if (isAuth) {
      router.push("/");
      return;
    }
    try {
      const { data } = await axios.post<LoginResponse>(
        `${auth_service}/api/auth/login`,
        { email, password },
        {
          withCredentials: true,
        },
      );
      if (!data || !data.token || !data.userObject) {
        throw new Error("Invalid response");
      }
      toast.success(data.message);
      Cookies.set("token", data.token, {
        secure: true,
        expires: 15,
        path: "/",
      });
      setUser(data.userObject);
      setIsAuth(true);
      router.push("/");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login Failed");
      setIsAuth(false);
    } finally {
      setBtnloading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-background via-background to-muted/40 text-foreground px-4">
      {/* Animated Card */}
      <Card className="w-full max-w-md shadow-xl rounded-2xl transition-all duration-500 hover:scale-[1.02] bg-background/80 border border-border/60 backdrop-blur-md">
        <CardContent className="p-6 space-y-6">
          {/* Heading */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground text-sm">
              Login to continue to Work Sphere
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submitHandler} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-background/70 border-border text-foreground"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-background/70 border-border text-foreground"
                required
              />
            </div>

            {/* Forgot Password */}
            <div className="text-right text-sm">
              <Link
                href="/forgot"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={btnLoading}
              className="w-full bg-linear-to-r from-indigo-500 to-purple-500 hover:shadow-indigo-500/30 transition-all duration-300 text-white"
            >
              {btnLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default login;
