import type { UUID } from "node:crypto";

declare global {
  namespace Express {
    interface Request {
      authenticatedUserId?: UUID;
    }
  }
}
