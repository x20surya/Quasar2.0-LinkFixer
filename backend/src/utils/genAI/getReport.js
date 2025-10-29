import { GoogleGenAI } from "@google/genai";

export async function getReport(data) {
const ai = new GoogleGenAI({ apiKey: process.env.AI_API_KEY });
  const instructions = `Please analyze the following data and assume you are a web scraper who is reporting a data on each broken link of the website. also rate results from 1 to 10. Give me only the Analysis of broken links,  Data:`;
      const prompt = `${instructions}\n${JSON.stringify(data, null, 2)}`
      const aiReport = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
      });
      return aiReport
}