import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized, token missing" });
    }
    const token = authHeader.split(" ")[1];
    const payload = jsonwebtoken.verify(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY
    );
    next();
  } catch (error) {
    res.status(401).send("unauthorized, token expired");
  }
}
