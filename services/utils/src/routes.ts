import express from "express";
import { v2 as cloudinary } from "cloudinary";
import { GoogleGenAI } from "@google/genai";
import { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

const route = express.Router();

route.post("/upload", async (req: Request, res: Response) => {
  console.log("req.body that we have is :", req.body);
  try {
    const { buffer, public_id } = req.body;
    if (public_id) {
      await cloudinary.uploader.destroy(buffer);
    }
    const cloud = await cloudinary.uploader.upload(buffer);

    res.json({
      url: cloud.secure_url,
      public_id: cloud.public_id,
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
});

route.post("/resume-analyzer", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Resume analyzer route is not available in production mode",
  });
});
route.post("/carrer", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Career route is not available in production mode",
  });
});

// } else {
//   const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//   route.post("/carrer", async (req: Request, res: Response) => {
//     let { skills } = req.body;
//     if (!skills) {
//       return res.status(400).json({
//         message: "Skills not found",
//       });
//     }
//     const prompt = `
// Based on the following skills: ${skills}.
// Please act as a career advisor and generate a career path suggestion.
// Your entire response must be in a valid JSON format. Do not include any text or markdown
// formatting outside of the JSON structure.
// The JSON object should have the following structure:
// {
// "summary": "A brief, encouraging summary of the user's skill set and their general job
// title.",
// "jobOptions": [
// {
// "title": "The name of the job role.",
// "responsibilities": "A description of what the user would do in this role.",
// "why": "An explanation of why this role is a good fit for their skills."
// }
// ],
// "skillsToLearn": [
// {
// "category": "A general category for skill improvement (e.g., 'Deepen Your Existing Stack
// Mastery', 'DevOps & Cloud').",
// "skills": [
// {
// "title": "The name of the skill to learn.",
// "why": "Why learning this skill is important.",
// "how": "Specific examples of how to learn or apply this skill."
// }
// ]
// }
// ],
// "learningApproach": {
// "title": "How to Approach Learning",
// "points": ["A bullet point list of actionable advice for learning."]
// }
// }
// `;
//     let jsonResponse;
//     try {
//       const response = await ai.models.generateContent({
//         model: "gemini-3-flash-preview",
//         contents: prompt,
//       });
//       try {
//         const rawtext = response.text
//           ?.replace(/```json/g, "")
//           .replace(/```/g, "")
//           .trim();
//         if (!rawtext) {
//           throw Error("Ai is not able to produce valid response");
//         }
//         jsonResponse = JSON.parse(rawtext);
//         res.json(jsonResponse);
//       } catch (error: any) {
//         return res.status(500).json({
//           message: "AI return response that was not valid",
//           response: response.text,
//         });
//       }
//     } catch (error: any) {
//       res.status(400).json({
//         message: error.message,
//       });
//     }
//   });

//   route.post("/resume-analyzer", async (req: Request, res: Response) => {
//     const { pdfbase64 } = req.body;
//     if (!pdfbase64) {
//       return res.status(500).json({
//         message: "Pdf is not found",
//       });
//     }
//     const prompt = `
// You are an expert ATS (Applicant Tracking System) analyzer. Analyze the following resume
// and provide:
// 1. An ATS compatibility score (0-100)
// 2. Detailed suggestions to improve the resume for better ATS performance
// Your entire response must be in valid JSON format. Do not include any text or markdown
// formatting outside of the JSON structure.
// The JSON object should have the following structure:

// {
// "atsScore": 85,
// "scoreBreakdown": {
// "formatting": {
// "score": 90,
// "feedback": "Brief feedback on formatting"
// },
// "keywords": {
// "score": 80,
// "feedback": "Brief feedback on keyword usage"
// },
// "structure": {
// "score": 85,
// "feedback": "Brief feedback on resume structure"
// },
// "readability": {
// "score": 88,
// "feedback": "Brief feedback on readability"
// }
// },
// "suggestions": [
// {
// "category": "Category name (e.g., 'Formatting', 'Content', 'Keywords',
// 'Structure')",
// "issue": "Description of the issue found",
// "recommendation": "Specific actionable recommendation to fix it",
// "priority": "high/medium/low"
// }
// ],
// "strengths": [
// "List of things the resume does well for ATS"
// ],
// "summary": "A brief 2-3 sentence summary of the overall ATS performance"
// }
// Focus on:
// - File format and structure compatibility
// - Proper use of standard section headings
// - Keyword optimization
// - Formatting issues (tables, columns, graphics, special characters)
// - Contact information placement
// - Date formatting
// - Use of action verbs and quantifiable achievements
// - Section organization and flow
// `;
//     try {
//       const response = await ai.models.generateContent({
//         model: "gemini-3-flash-preview",
//         contents: [
//           {
//             role: "user",
//             parts: [
//               {
//                 text: prompt,
//               },
//               {
//                 inlineData: {
//                   mimeType: "application/pdf",
//                   data: pdfbase64.replace(/^data:application\/pdf;base64,/, ""),
//                 },
//               },
//             ],
//           },
//         ],
//       });
//       let jsonResponse;
//       try {
//         const rawtext = response.text
//           ?.replace(/```json/g, "")
//           .replace(/```/g, "")
//           .trim();
//         if (!rawtext) {
//           throw Error("Ai is not able to produce valid response");
//         }
//         jsonResponse = JSON.parse(rawtext);
//         res.json(jsonResponse);
//       } catch (error: any) {
//         return res.status(500).json({
//           message: "AI return response that was not valid",
//           response: response.text,
//         });
//       }
//     } catch (error: any) {
//       res.status(400).json({
//         message: error.message,
//       });
//     }
//   });
export default route;
