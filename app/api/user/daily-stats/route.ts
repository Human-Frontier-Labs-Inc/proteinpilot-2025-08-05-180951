import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getUserDailyStats } from "@/lib/user-profile";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");
    
    const date = dateParam ? new Date(dateParam) : new Date();
    const stats = await getUserDailyStats(date);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[DAILY_STATS_GET]", error);
    
    // If user profile doesn't exist, return default values
    if (error instanceof Error && error.message.includes("User profile not found")) {
      return NextResponse.json({
        userProfile: null,
        dailyTotals: {
          calories: 0,
          protein: 0,
          carbohydrates: 0,
          fat: 0
        },
        foodLogs: [],
        proteinGoal: 150,
        calorieGoal: 2000
      });
    }
    
    return new NextResponse("Internal Error", { status: 500 });
  }
}