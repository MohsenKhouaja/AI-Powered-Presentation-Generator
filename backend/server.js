import express from "express";
import cors from "cors";
import { generatePresentation } from "./api.js";
const app = express();
const port = 3001;

// Update CORS configuration to allow multiple origins
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", async (req, res) => {
 
   const presentation = await generatePresentation();
  res.send(presentation); 
});
app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
