import { getIronSession } from "iron-session";
import { type Context, sessionConfig } from "./trpc";

export async function createContext({ req, res }: { req: Request; res: Response }): Promise<Context> {
  const session = await getIronSession(req, res, sessionConfig);
  const locale = req.headers.get("x-locale") || "en";

  return {
    session,
    locale,
  };
}
