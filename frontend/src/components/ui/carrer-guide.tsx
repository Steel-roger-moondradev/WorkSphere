"use client";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Delete,
  FileText,
  Loader2,
  Pencil,
  Sparkles,
  X,
} from "lucide-react";

import React, { useState } from "react";
import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Label } from "./label";
import { Input } from "./input";
import { CareerGuideResponse } from "@/type";
import axios from "axios";
import { toast } from "react-hot-toast";
import { utils_service } from "@/context/AppContext";

const CarrerGuide = () => {
  const [open, setOpen] = useState(false);
  const [skills, setSkill] = useState<string[]>([]);
  const [currentSkills, setCurrentSkills] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CareerGuideResponse | null>(null);
  const [result, setResult] = useState(false);

  function addskills() {
    const skill = currentSkills.trim().toLowerCase();
    if (skill && !skills.includes(skill)) {
      setSkill((prev) => [...prev, skill]);
      setCurrentSkills("");
    }
  }

  function removeSkills(skillstoremove: string) {
    setSkill(skills.filter((s) => s !== skillstoremove));
  }

  function handlekeypress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addskills();
    }
  }
  function resetdialog() {
    setOpen(false);
    setSkill([]);
    setCurrentSkills("");
    setResult(false);
    setResponse(null);
  }

  function handleOpen() {
    setResponse(null);
    setOpen(true);
  }

  const getcarrerguide = async () => {
    if (skills.length === 0) {
      toast.error("Please add at least one skill");
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${utils_service}/api/utils/carrer`, {
        skills: skills,
      });

      setResponse(data);
      setResult(true);
      toast.success(data?.message || "Carrer guidance generated");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      {/* HEADER */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border bg-linear-to-r from-blue-50 to-indigo-50 shadow-md hover:shadow-lg transition hover:scale-105 dark:text-black">
          <Sparkles size={16} className="text-blue-600 animate-pulse" />
          <span className="text-sm font-medium">
            AI-Powered Career Guidance
          </span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold mt-6 mb-4">
          Discover Your{" "}
          <span className="bg-linear-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent animate-linear">
            Career Path
          </span>
        </h2>
        <p className="text-lg opacity-70 max-w-2xl mx-auto mb-10">
          Get personalized career guidance and learning roadmaps based on your
          skills
        </p>

        <div className="flex justify-center">
          <Button
            onClick={handleOpen}
            className="group px-8 py-5 text-base bg-linear-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2"
          >
            <Sparkles className="group-hover:rotate-12 transition" />
            Get Career Guidance
            <ArrowRight className="group-hover:translate-x-1 transition" />
          </Button>
        </div>
      </div>

      {!response ? (
        <>
          {/* DIALOG */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md animate-in fade-in zoom-in-95 duration-300">
              <DialogHeader>
                <DialogTitle className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-blue-50 shadow  dark:text-black">
                    <Sparkles size={16} className="text-blue-600" />
                    Enter your Skills
                  </div>
                </DialogTitle>

                <DialogDescription className="text-center">
                  Add your technical skills to receive personalized
                  recommendations
                </DialogDescription>
              </DialogHeader>

              {/* INPUT */}
              <div>
                <Label htmlFor="skill">Add Skills</Label>
                <Input
                  id="skill"
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                  onKeyDown={handlekeypress}
                  placeholder="e.g React, Node"
                  className="mt-3 focus:ring-2 focus:ring-indigo-500 transition"
                />

                <Button
                  type="button"
                  onClick={addskills}
                  className="mt-4 w-full bg-indigo-500 hover:bg-indigo-600 transition"
                >
                  Add Skill
                </Button>
              </div>

              {/* SKILLS LIST */}
              {skills.length > 0 && (
                <div className="space-y-3 mt-4">
                  <p className="text-sm font-medium">
                    Skills ({skills.length})
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <div
                        key={s}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-linear-to-r from-blue-100 to-indigo-100 border hover:scale-105 transition dark:text-black"
                      >
                        <span className="text-sm">{s}</span>
                        <button
                          onClick={() => removeSkills(s)}
                          className="text-white bg-red-500 rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 transition"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FOOTER */}
              <DialogFooter>
                {loading ? (
                  <div className="flex items-center gap-2 text-indigo-600 animate-pulse mr-30">
                    <Loader2 className="animate-spin" size={22} />
                    Analyzing your skills...
                  </div>
                ) : (
                  <Button
                    className="w-full bg-linear-to-r from-indigo-500 to-purple-500 text-white hover:scale-105 transition"
                    onClick={getcarrerguide}
                  >
                    Generate AI Recommendation
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <>
          <Dialog open={result} onOpenChange={setResult}>
            <DialogContent className="max-h-[90vh] flex flex-col max-w-6xl">
              <DialogHeader>
                <DialogTitle>Your Ai Assistance</DialogTitle>
              </DialogHeader>
              {/* SCROLLABLE BODY */}
              <div className="flex-1 overflow-y-auto mt-6 space-y-10 pr-2">
                {/* SUMMARY */}
                <div>
                  <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-500" />
                    Summary
                  </h3>
                  <p className="text-muted-foreground">{response?.summary}</p>
                </div>

                {/* JOB OPTIONS */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-indigo-500" />
                    Career Options
                  </h3>

                  {response?.jobOptions?.map((job, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-xl border shadow hover:shadow-lg transition hover:scale-[1.02] mt-6"
                    >
                      <h4 className="text-lg font-semibold">
                        Job-Title:-{job?.title}
                      </h4>
                      <p className="text-sm mt-2 opacity-80">
                        Job-responsibilities:- {job?.responsibilities}
                      </p>
                      <p className="text-sm mt-2 text-indigo-500">
                        Why: {job?.why}
                      </p>
                    </div>
                  ))}
                </div>

                {/* SKILLS */}
                <div>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Pencil className="w-6 h-6 text-indigo-500" />
                    Skills to Learn
                  </h3>

                  {response?.skillsToLearn?.map((category, i) => (
                    <div key={i} className="mb-6">
                      <h4 className="text-lg font-semibold mb-2 text-indigo-500">
                        Category:-{category?.category}
                      </h4>

                      {category?.skills?.map((skill, j) => (
                        <div
                          key={j}
                          className="mt-4 p-4 rounded-lg border bg-muted/30 hover:scale-[1.02] transition"
                        >
                          <h5 className="font-medium">Skill:-{skill?.title}</h5>
                          <p className="text-sm mt-1 opacity-80">
                            Why:-{skill?.why}
                          </p>
                          <p className="text-sm mt-1 text-muted-foreground">
                            How: {skill?.how}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* LEARNING APPROACH */}
                <h3 className="text-2xl font-bold mb-4  items-center gap-2 text-black dark:text-white">
                  <div className="flex items-center">
                    <BookOpen className="w-6 h-6 text-indigo-500" />
                    &nbsp;&nbsp;Learning Approach:-
                  </div>
                  <div className="mt-3  text-indigo-500">
                    {response?.learningApproach?.title}
                  </div>
                </h3>
                <div className="p-6 rounded-xl border bg-linear-to-r from-blue-50 to-indigo-50">
                  <ul className="list-disc ml-5 space-y-2">
                    {response?.learningApproach?.points?.map((point, i) => (
                      <li key={i} className="text-sm dark:text-black">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* FIXED FOOTER */}
              <DialogFooter>
                <Button onClick={resetdialog} className="px-8 py-5">
                  Reset
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* animation styles */}
      <style jsx>{`
        .animate-linear {
          background-size: 200% 200%;
          animation: linear 5s ease infinite;
        }
        @keyframes linear {
          0%,
          100% {
            background-position: left;
          }
          50% {
            background-position: right;
          }
        }
      `}</style>
    </div>
  );
};

export default CarrerGuide;
