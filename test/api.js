import { GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import process from "process";
import dotenv from "dotenv";
dotenv.config({ quiet: true });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function main() {
  const contents = [
    {
      text: `using this document make presentation of the form
          [
            {
              "id": 1,
              "title": "",
              "content": ""
            }
          ]
          make 10 slides, content in markdown 
      `,
    },
    {
      inlineData: {
        mimeType: "application/pdf",
        data: Buffer.from(fs.readFileSync("example.pdf")).toString("base64"),
      },
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
  });
  fs.writeFileSync("presentation.json", response.text.toString());
}

main();
