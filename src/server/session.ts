import { SessionOptions } from "iron-session";
import { z } from "zod";

// Define session data schema
export const sessionSchema = z.object({
  user: z.object({
    email: z.string().email(),
    id: z.string().uuid(),
  }).optional(),
});

export type SessionData = z.infer<typeof sessionSchema>;

// Session configuration
export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: "upl_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // 30 days in seconds
    maxAge: 30 * 24 * 60 * 60,
  },
};

// Type declaration for iron-session
declare module "iron-session" {
  interface IronSessionData extends SessionData {}
}
