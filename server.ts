import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Gemini Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // AI Resume Parsing Endpoint
  app.post("/api/ai/parse-resume", async (req, res) => {
    let { resumeText, fileBase64, fileType } = req.body;
    
    try {
      // If it's a PDF, extract text first
      if (fileBase64 && fileType === "application/pdf") {
        const buffer = Buffer.from(fileBase64, 'base64');
        if (pdf && pdf.PDFParse) {
          const parser = new pdf.PDFParse({ data: buffer });
          const result = await parser.getText();
          resumeText = result.text;
          await parser.destroy();
        } else {
          // Fallback to legacy function-based API
          const parsePdf = typeof pdf === "function" ? pdf : (pdf.default || pdf);
          const data = await parsePdf(buffer);
          resumeText = data.text;
        }
      }

      if (!resumeText || resumeText.length < 5) {
        return res.status(400).json({ error: "No readable text found in resume." });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", // Using gemini-2.5-flash for maximum reliability and speed
        contents: `You are an expert HR Recruitment Assistant. 
        Analyze the following resume text and extract structured information into a valid JSON object.
        
        CRITICAL RULES:
        1. If information is missing, use null or empty array.
        2. Format experience as objects with { title, company, duration, description }.
        3. Provide a concise, professional 'candidateSummary' (max 2 sentences).
        4. Normalize 'skills' into a flat array of strings.
        5. Extract professional links under 'links' object with fields: linkedin (string), github (string), portfolio (string).

        OUTPUT FIELDS:
        - name (string)
        - email (string)
        - phone (string)
        - skills (array of strings)
        - experience (array of objects)
        - education (array of strings)
        - candidateSummary (string)
        - links (object containing linkedin, github, portfolio)

        RESUME TEXT:
        ${resumeText}`,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const resultText = response.text;
      if (!resultText) throw new Error("Empty AI response");
      
      res.json(JSON.parse(resultText));
    } catch (error) {
      console.error("AI Parse Error:", error);
      res.status(500).json({ error: "Failed to parse resume content." });
    }
  });

  // AI Interview Question Generation
  app.post("/api/ai/generate-questions", async (req, res) => {
    const { jobTitle, jobDescription, candidateExperience } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate 5 technical interview questions for a ${jobTitle} role.
        Context: ${jobDescription}
        Candidate Experience: ${candidateExperience}
        Output should be a JSON array of questions.`,
        config: { responseMimeType: "application/json" }
      });
      res.json(JSON.parse(response.text || "[]"));
    } catch (error) {
      res.status(500).json({ error: "Failed to generate questions" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
