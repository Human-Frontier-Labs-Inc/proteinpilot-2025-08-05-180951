import { prisma } from "@/lib/prismadb";
import { mockAuth } from "@/lib/mock-auth";

export async function getOrCreateUserProfile() {
  const { userId } = mockAuth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user profile already exists
  let userProfile = await prisma.userProfile.findUnique({
    where: { userId }
  });

  // Create profile if it doesn't exist
  if (!userProfile) {
    userProfile = await prisma.userProfile.create({
      data: {
        userId,
        proteinGoalDaily: 150, // Default protein goal
        activityLevel: "moderate",
        shareDataForResearch: false,
        allowNotifications: true
      }
    });
  }

  return userProfile;
}

export async function updateUserProfile(data: {
  proteinGoalDaily?: number;
  calorieGoalDaily?: number;
  weight?: number;
  height?: number;
  activityLevel?: string;
  dietaryRestrictions?: string;
  allergies?: string;
}) {
  const { userId } = mockAuth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return await prisma.userProfile.update({
    where: { userId },
    data
  });
}

export async function getUserDailyStats(date = new Date()) {
  const { userId } = mockAuth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get user profile and today's food logs
  const [userProfile, foodLogs] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { userId }
    }),
    prisma.foodLog.findMany({
      where: {
        userId,
        consumedAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        foodItem: true
      }
    })
  ]);

  if (!userProfile) {
    throw new Error("User profile not found");
  }

  // Calculate daily totals
  const dailyTotals = foodLogs.reduce((totals, log) => {
    return {
      calories: totals.calories + log.calories,
      protein: totals.protein + log.protein,
      carbohydrates: totals.carbohydrates + log.carbohydrates,
      fat: totals.fat + log.fat
    };
  }, {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0
  });

  return {
    userProfile,
    dailyTotals,
    foodLogs,
    proteinGoal: userProfile.proteinGoalDaily || 150,
    calorieGoal: userProfile.calorieGoalDaily || 2000
  };
}