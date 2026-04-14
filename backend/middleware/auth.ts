import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized, token missing" });
    }
    const token = authHeader.split(" ")[1];
    const payload = jsonwebtoken.verify(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
    );
    if (!payload || typeof payload !== "object" || !("sub" in payload)) {
      return res.status(401).json({ message: "Unauthorized, invalid token" });
    }
    req.authenticatedUserId = payload.sub;
    next();
  } catch (error) {
    const message =
      error instanceof jsonwebtoken.TokenExpiredError
        ? "Unauthorized, token expired"
        : "Unauthorized, invalid token";
    return res.status(401).json({ message });
  }
}

export default authMiddleware;
