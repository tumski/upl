import { getIronSession } from "iron-session";
import { type Context } from "./trpc";
import { sessionOptions } from "./session";

export async function createContext({ req, res }: { req: Request; res: Response }): Promise<Context> {
  const session = await getIronSession(req, res, sessionOptions);
  const locale = req.headers.get("x-locale") || "en";

  return {
    session,
    locale,
  };
}
