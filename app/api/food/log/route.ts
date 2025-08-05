import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";
import { getOrCreateUserProfile } from "@/lib/user-profile";
import { mockAuth } from "@/lib/mock-auth";

export async function POST(req: Request) {
  try {
    const { userId } = mockAuth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Ensure user profile exists
    await getOrCreateUserProfile();

    const body = await req.json();
    const { 
      foodItemId, 
      quantity, 
      unit = "g", 
      mealType, 
      consumedAt 
    } = body;

    if (!foodItemId || !quantity || !mealType) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get the food item to calculate nutrition
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: foodItemId }
    });

    if (!foodItem) {
      return new NextResponse("Food item not found", { status: 404 });
    }

    // Calculate nutrition based on quantity
    const multiplier = quantity / foodItem.servingSize;
    const calculatedNutrition = {
      calories: foodItem.calories * multiplier,
      protein: foodItem.protein * multiplier,
      carbohydrates: foodItem.carbohydrates * multiplier,
      fat: foodItem.fat * multiplier
    };

    // Create food log entry
    const foodLog = await prisma.foodLog.create({
      data: {
        userId,
        foodItemId,
        quantity: parseFloat(quantity),
        unit,
        mealType,
        consumedAt: consumedAt ? new Date(consumedAt) : new Date(),
        calories: calculatedNutrition.calories,
        protein: calculatedNutrition.protein,
        carbohydrates: calculatedNutrition.carbohydrates,
        fat: calculatedNutrition.fat
      },
      include: {
        foodItem: true
      }
    });

    return NextResponse.json(foodLog);
  } catch (error) {
    console.error("[FOOD_LOG_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = mockAuth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const mealType = searchParams.get("mealType");

    let startDate = new Date();
    let endDate = new Date();

    if (date) {
      startDate = new Date(date);
      endDate = new Date(date);
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const whereClause: any = {
      userId,
      consumedAt: {
        gte: startDate,
        lte: endDate
      }
    };

    if (mealType) {
      whereClause.mealType = mealType;
    }

    const foodLogs = await prisma.foodLog.findMany({
      where: whereClause,
      include: {
        foodItem: true
      },
      orderBy: {
        consumedAt: "desc"
      }
    });

    return NextResponse.json(foodLogs);
  } catch (error) {
    console.error("[FOOD_LOG_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = mockAuth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const logId = searchParams.get("id");

    if (!logId) {
      return new NextResponse("Log ID required", { status: 400 });
    }

    // Verify the log belongs to the user
    const foodLog = await prisma.foodLog.findFirst({
      where: {
        id: logId,
        userId
      }
    });

    if (!foodLog) {
      return new NextResponse("Food log not found", { status: 404 });
    }

    await prisma.foodLog.delete({
      where: { id: logId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[FOOD_LOG_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}