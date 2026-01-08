import express from "express";
import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const authRouter = express.Router();
/* interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
} */

const accessTokenExpirationSeconds = 15 * 60;
const refreshTokenExpirationSeconds = 30 * 24 * 60 * 60;
const JWT_ACCESS_TOKEN_SECRET_KEY = process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
const JWT_REFRESH_TOKEN_SECRET_KEY = process.env.JWT_REFRESH_TOKEN_SECRET_KEY;

if (!JWT_ACCESS_TOKEN_SECRET_KEY || !JWT_REFRESH_TOKEN_SECRET_KEY) {
  const missing = [];
  if (!JWT_ACCESS_TOKEN_SECRET_KEY) missing.push("JWT_ACCESS_TOKEN_SECRET_KEY");
  if (!JWT_REFRESH_TOKEN_SECRET_KEY)
    missing.push("JWT_REFRESH_TOKEN_SECRET_KEY");
  const message = `Missing env var(s): ${missing.join(", ")}`;
  console.error(message);
  throw new Error(message);
}

async function createAuthTokens(req, res, success, userId) {
  if (success) {
    const accessTokenPayload = {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + accessTokenExpirationSeconds,
    };
    const refreshTokenPayload = {
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + accessTokenExpirationSeconds,
    };
    const accesToken = jsonwebtoken.sign(
      accessTokenPayload,
      JWT_ACCESS_TOKEN_SECRET_KEY,
      {
        algorithm: "HS256",
      }
    );
    const refreshToken = jsonwebtoken.sign(
      refreshTokenPayload,
      JWT_REFRESH_TOKEN_SECRET_KEY,
      {
        algorithm: "HS256",
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/refresh",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(201).send({ accesToken });
  } else {
    res.status(401).send({ error: "Authentication failed" });
  }
}

authRouter.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const { success, userId } = await verifyUserCredentials(email, password);
  createAuthTokens(req, res, success, userId);
});
authRouter.post("/register", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const { success, userId } = await createNewUser(email, password);
  createAuthTokens(req, res, success, userId);
});

authRouter.post("/refresh", async (req, res) => {
  try {
    const payload = jsonwebtoken.verify(
      req.cookies.refreshToken,
      JWT_REFRESH_TOKEN_SECRET_KEY
    );
    const accessTokenPayload = {
      sub: payload.sub,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + accessTokenExpirationSeconds,
    };
    const accessToken = jsonwebtoken.sign(
      accessTokenPayload,
      JWT_ACCESS_TOKEN_SECRET_KEY,
      {
        algorithm: "HS256",
      }
    );
    res.status(200).send({ accessToken });
  } catch (error) {
    if (
      error?.name === "TokenExpiredError" ||
      error?.name === "JsonWebTokenError"
    ) {
      return res.status(401).send({ error: "Authentication failed" });
    }
    console.error("Error refreshing token", error);
    res.status(500).send("internal server error");
  }
});

export default authRouter;
