import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    const whereClause: any = {};

    if (search) {
      whereClause.name = {
        contains: search,
        mode: 'insensitive'
      };
    }

    if (category) {
      whereClause.category = category;
    }

    const foodItems = await prisma.foodItem.findMany({
      where: whereClause,
      orderBy: [
        { verified: 'desc' }, // Verified items first
        { name: 'asc' }
      ],
      take: 50 // Limit results for performance
    });

    return NextResponse.json(foodItems);
  } catch (error) {
    console.error("[FOOD_ITEMS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      brand,
      category,
      calories,
      protein,
      carbohydrates,
      fat,
      fiber,
      sugar,
      sodium,
      servingSize,
      servingUnit,
    } = body;

    if (!name || !category || calories === undefined || protein === undefined || carbohydrates === undefined || fat === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const foodItem = await prisma.foodItem.create({
      data: {
        name,
        brand,
        category,
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbohydrates: parseFloat(carbohydrates),
        fat: parseFloat(fat),
        fiber: fiber ? parseFloat(fiber) : null,
        sugar: sugar ? parseFloat(sugar) : null,
        sodium: sodium ? parseFloat(sodium) : null,
        servingSize: servingSize ? parseFloat(servingSize) : 100,
        servingUnit: servingUnit || 'g',
        verified: false // User-created items are not verified by default
      }
    });

    return NextResponse.json(foodItem);
  } catch (error) {
    console.error("[FOOD_ITEMS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}