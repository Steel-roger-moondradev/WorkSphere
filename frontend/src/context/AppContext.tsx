"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  AppContextType,
  Application,
  AppProviderProps,
  LoginResponse,
  User,
} from "../type";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";

export const utils_service =
  process.env.NEXT_PUBLIC_UTILS_SERVICE || "http://localhost:5001";

export const auth_service =
  process.env.NEXT_PUBLIC_AUTH_SERVICE || "http://localhost:5000";

export const user_service =
  process.env.NEXT_PUBLIC_USER_SERVICE || "http://localhost:5002";

export const job_service =
  process.env.NEXT_PUBLIC_JOB_SERVICE || "http://localhost:5003";

export const payment_service =
  process.env.NEXT_PUBLIC_PAYMENT_SERVICE || "http://localhost:5004";

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [btnLoading, setBtnloading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [btnloadingR, setBtnloadingR] = useState(false);
  const [btnLoadingE, setBtnloadingE] = useState(false);
  const [applications, setApplications] = useState<Application[] | null>(null);

  async function fetchUser() {
    const token = Cookies.get("token");
    if (!token) {
      setIsAuth(false);
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await axios.get(`${user_service}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(data as User);
      setIsAuth(true);
    } catch (error: any) {
      console.log(error);
      setIsAuth(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function profileUpdatepic(formData: any) {
    setBtnloading(true);
    try {
      const token = Cookies.get("token");
      const { data } = await axios.put<LoginResponse>(
        `${user_service}/api/user/update/pic`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success("Profile updated successfully");
      await fetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setBtnloading(false);
    }
  }

  async function ResumeUpdate(formData: any) {
    setBtnloadingR(true);
    try {
      const token = Cookies.get("token");
      const { data } = await axios.put<LoginResponse>(
        `${user_service}/api/user/update/resume`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      toast.success("Resume updated successfully");
      await fetchUser();
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setBtnloadingR(false);
    }
  }

  async function profileUpdate(
    name: string,
    phone_number: string,
    bio: string | "",
    email: string,
  ) {
    try {
      setBtnloadingE(true);
      const token = Cookies.get("token");
      const payload = bio
        ? { name, email, phone_number, bio }
        : { name, email, phone_number };

      const { data } = await axios.put<LoginResponse>(
        `${user_service}/api/user/update/profile`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      await fetchUser();
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setBtnloadingE(false);
    }
  }

  const fetchIndividualApplication = async () => {
    setLoading(true);
    try {
      const token = Cookies.get("token");
      if (!token) {
        toast.error("Authentication is required");
        return;
      }
      const { data } = await axios.get(`${user_service}/api/user/alljobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setApplications(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser(), fetchIndividualApplication();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        applicationsLoading,
        btnLoading,
        isAuth,
        btnloadingR,
        btnLoadingE,
        setUser,
        setLoading,
        setIsAuth,
        setBtnloading,
        profileUpdatepic,
        ResumeUpdate,
        profileUpdate,
        applications,
        fetchIndividualApplication,
        setApplications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppProvider };
export const useappdata = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useappdata must be wrapped in AppContext");
  }
  return context;
};
