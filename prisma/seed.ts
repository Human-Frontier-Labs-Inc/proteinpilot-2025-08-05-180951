const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test user profile
  const userProfile = await prisma.userProfile.upsert({
    where: { userId: 'user_mock_123456789' },
    update: {},
    create: {
      userId: 'user_mock_123456789',
      proteinGoalDaily: 150.0,
      dietaryRestrictions: 'none',
      allergies: 'none',
    },
  });

  console.log('✅ User profile created:', userProfile.id);

  // Create food items
  const foodItems = [
    {
      name: 'Chicken Breast',
      brand: 'Generic',
      category: 'protein',
      calories: 165,
      protein: 31,
      carbohydrates: 0,
      fat: 3.6,
      servingSize: 100,
      servingUnit: 'g',
      verified: true,
    },
    {
      name: 'Greek Yogurt',
      brand: 'Generic',
      category: 'dairy',
      calories: 100,
      protein: 10,
      carbohydrates: 6,
      fat: 5,
      servingSize: 100,
      servingUnit: 'g',
      verified: true,
    },
    {
      name: 'Eggs',
      brand: 'Generic',
      category: 'protein',
      calories: 155,
      protein: 13,
      carbohydrates: 1.1,
      fat: 11,
      servingSize: 100,
      servingUnit: 'g',
      verified: true,
    },
    {
      name: 'Whey Protein Powder',
      brand: 'Generic',
      category: 'supplements',
      calories: 103,
      protein: 20,
      carbohydrates: 2,
      fat: 1,
      servingSize: 25,
      servingUnit: 'g',
      verified: true,
    },
    {
      name: 'Salmon Fillet',
      brand: 'Generic',
      category: 'protein',
      calories: 208,
      protein: 25,
      carbohydrates: 0,
      fat: 12,
      servingSize: 100,
      servingUnit: 'g',
      verified: true,
    },
    {
      name: 'Quinoa',
      brand: 'Generic',
      category: 'grains',
      calories: 120,
      protein: 4.4,
      carbohydrates: 22,
      fat: 1.9,
      servingSize: 100,
      servingUnit: 'g',
      verified: true,
    },
  ];

  for (const item of foodItems) {
    const foodItem = await prisma.foodItem.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    });
    console.log(`✅ Food item created: ${foodItem.name}`);
  }

  // Create some sample food logs for the current day
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Get the created food items
  const chickenBreast = await prisma.foodItem.findFirst({ where: { name: 'Chicken Breast' } });
  const greekYogurt = await prisma.foodItem.findFirst({ where: { name: 'Greek Yogurt' } });
  const eggs = await prisma.foodItem.findFirst({ where: { name: 'Eggs' } });

  if (chickenBreast && greekYogurt && eggs) {
    const foodLogs = [
      {
        userId: 'user_mock_123456789',
        foodItemId: greekYogurt.id,
        quantity: 150,
        unit: 'g',
        mealType: 'breakfast',
        consumedAt: new Date(startOfDay.getTime() + 8 * 60 * 60 * 1000), // 8 AM
        // Calculate nutrition based on quantity
        calories: (greekYogurt.calories * 150) / greekYogurt.servingSize,
        protein: (greekYogurt.protein * 150) / greekYogurt.servingSize,
        carbohydrates: (greekYogurt.carbohydrates * 150) / greekYogurt.servingSize,
        fat: (greekYogurt.fat * 150) / greekYogurt.servingSize,
      },
      {
        userId: 'user_mock_123456789',
        foodItemId: eggs.id,
        quantity: 100,
        unit: 'g',
        mealType: 'breakfast',
        consumedAt: new Date(startOfDay.getTime() + 8 * 60 * 60 * 1000 + 15 * 60 * 1000), // 8:15 AM
        calories: (eggs.calories * 100) / eggs.servingSize,
        protein: (eggs.protein * 100) / eggs.servingSize,
        carbohydrates: (eggs.carbohydrates * 100) / eggs.servingSize,
        fat: (eggs.fat * 100) / eggs.servingSize,
      },
      {
        userId: 'user_mock_123456789',
        foodItemId: chickenBreast.id,
        quantity: 120,
        unit: 'g',
        mealType: 'lunch',
        consumedAt: new Date(startOfDay.getTime() + 12 * 60 * 60 * 1000), // 12 PM
        calories: (chickenBreast.calories * 120) / chickenBreast.servingSize,
        protein: (chickenBreast.protein * 120) / chickenBreast.servingSize,
        carbohydrates: (chickenBreast.carbohydrates * 120) / chickenBreast.servingSize,
        fat: (chickenBreast.fat * 120) / chickenBreast.servingSize,
      },
    ];

    for (const log of foodLogs) {
      const foodLog = await prisma.foodLog.create({
        data: log,
      });
      console.log(`✅ Food log created: ${log.quantity}g ${log.mealType}`);
    }
  }

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });