import { GoogleGenAI } from "@google/genai";
import process from "process";
import dotenv from "dotenv";
dotenv.config({ quiet: true });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generatePresentation() {
  console.log("Generating presentation...");
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `make presentation about ai
            make 10 slides, content in markdown
            The response must be *only* a JSON array that strictly adheres to the provided schema.
            Do not include any introductory or explanatory text outside of the JSON.
          `,
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            content: { type: "string" },
          },
          required: ["id", "title", "content"],
        },
      },
    },
  });
  return response.text.toString();
}