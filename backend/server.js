import express from "express";
import cors from "cors";

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

app.get("/", (req, res) => {
  res.send("Hello from the backend server!");
});
app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});
