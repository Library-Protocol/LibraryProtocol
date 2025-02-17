'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateAIResponse(prompt: string) {
  try {
    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const result = await model.generateContent(prompt);

    
return result.response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch response");
  }
}
