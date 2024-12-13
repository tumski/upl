import { NextResponse } from "next/server";
import { checkTopazStatus } from "@/utils/topaz-status-checker";

// Vercel Cron Job handler
export async function GET(req: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await checkTopazStatus();
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error in Topaz status cron job:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Configure the route to run every 5 minutes
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes in seconds
