import express from "express";

const authRouter = express.Router();

authRouter.post("/login", async (req, res) => {
  const email = req.email;
  const password = req.password;
  const b = await verifyUserCredentials(email, password);
  if (b) {
    generateToken;
  } else {
    //return fail status
  }
});
authRouter.post("/register", async (req, res) => {
  const email = req.email;
  const password = req.password;
  const b = await createNewUser(email, password);
  if (b) {
    generateToken;
  } else {
    //return fail status
  }
});
authRouter.post("/refresh", async (req, res) => {
  const token = req.headers.split(" ")[1];
  const b = await verifyToken(token);
  if (b) {
    generateToken;
  } else {
    //return fail status
  }ù
});
