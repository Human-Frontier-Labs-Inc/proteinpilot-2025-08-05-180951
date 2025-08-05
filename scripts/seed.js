const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedFoodItems() {
  const basicFoods = [
    {
      name: "Chicken Breast",
      category: "protein",
      brand: "Generic",
      calories: 165,
      protein: 31,
      carbohydrates: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      sodium: 74,
      servingSize: 100,
      servingUnit: "g",
      verified: true
    },
    {
      name: "Greek Yogurt",
      category: "dairy",
      brand: "Generic",
      calories: 100,
      protein: 10,
      carbohydrates: 6,
      fat: 5,
      fiber: 0,
      sugar: 6,
      sodium: 46,
      servingSize: 100,
      servingUnit: "g",
      verified: true
    },
    {
      name: "Eggs",
      category: "protein",
      brand: "Generic",
      calories: 155,
      protein: 13,
      carbohydrates: 1.1,
      fat: 11,
      fiber: 0,
      sugar: 1.1,
      sodium: 124,
      servingSize: 100,
      servingUnit: "g",
      verified: true
    },
    {
      name: "Whey Protein Powder",
      category: "supplements",
      brand: "Generic",
      calories: 103,
      protein: 20,
      carbohydrates: 2,
      fat: 1,
      fiber: 0,
      sugar: 2,
      sodium: 50,
      servingSize: 25,
      servingUnit: "g",
      verified: true
    }
  ];

  for (const food of basicFoods) {
    await prisma.foodItem.upsert({
      where: { name: food.name },
      update: {},
      create: food
    });
  }

  console.log(`Seeded ${basicFoods.length} food items`);
}

seedFoodItems()
  .then(() => {
    console.log("Database seeded successfully");
    prisma.$disconnect();
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
    prisma.$disconnect();
    process.exit(1);
  });