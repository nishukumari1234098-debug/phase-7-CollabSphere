import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

console.log("Gemini key loaded in controller:", Boolean(apiKey));

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

async function generateAIResponse(prompt) {
  if (!ai) {
    throw new Error("GEMINI_API_KEY missing in backend/.env");
  }

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
}


export async function explainCode(req, res) {
  try {
    const { code } = req.body;

    if (!code?.trim()) {
      return res.status(400).json({ message: "Code is required." });
    }

    const result = await generateAIResponse(
      `Explain this code in simple language with examples:\n\n${code}`
    );

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Explain code error:", error.message);
    return res.status(500).json({ message: "Unable to explain code." });
  }
}

export async function generateDocs(req, res) {
  try {
    const { code } = req.body;

    if (!code?.trim()) {
      return res.status(400).json({ message: "Code is required." });
    }

    const result = await generateAIResponse(
      `Generate clear documentation for this code. Include purpose, parameters, and usage where applicable:\n\n${code}`
    );

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Generate docs error:", error.message);
    return res.status(500).json({ message: "Unable to generate documentation." });
  }
}

export async function generateReadme(req, res) {
  try {
    const { projectName, description, code } = req.body;

    if (!projectName?.trim()) {
      return res.status(400).json({ message: "Project name is required." });
    }

    const result = await generateAIResponse(
      `Create a useful README.md in Markdown format.
Project: ${projectName}
Description: ${description || "Not provided"}
Code or project details:
${code || "Not provided"}

Include overview, features, technologies, installation, usage, and future improvements. Do not invent features that are not supported by the provided details.`
    );

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Generate README error:", error.message);
    return res.status(500).json({ message: "Unable to generate README." });
  }
}
