import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface UserPayload extends JwtPayload {
      userId: string;
      role: "superadmin" | "admin" | "subadmin" | "user";
      username: string;
      email: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
