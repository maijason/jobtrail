import { GoogleGenAI } from "@google/genai";
import type { GenerateJson } from "@/lib/requirements";

// Flash-Lite is Google's cheapest tier and is plenty for extraction.
// Override with GEMINI_MODEL in .env.local.
const DEFAULT_MODEL = "gemini-3.5-flash-lite";

export function createGeminiGenerateJson(): GenerateJson {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set. Add it to .env.local.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  return async ({ prompt, schema }) => {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: schema,
        temperature: 0,
        // Caps the cost of a single call.
        maxOutputTokens: 4096,
      },
    });

    if (!response.text) {
      throw new Error("Gemini returned an empty response.");
    }
    return JSON.parse(response.text);
  };
}
