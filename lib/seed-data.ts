import { prisma } from "@/lib/prismadb";

export async function seedFoodItems() {
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
      name: "Salmon Fillet",
      category: "protein",
      brand: "Generic",
      calories: 208,
      protein: 25,
      carbohydrates: 0,
      fat: 12,
      fiber: 0,
      sugar: 0,
      sodium: 59,
      servingSize: 100,
      servingUnit: "g",
      verified: true
    },
    {
      name: "Quinoa",
      category: "grains",
      brand: "Generic",
      calories: 120,
      protein: 4.4,
      carbohydrates: 22,
      fat: 1.9,
      fiber: 2.8,
      sugar: 0.9,
      sodium: 7,
      servingSize: 100,
      servingUnit: "g",
      verified: true
    },
    {
      name: "Almonds",
      category: "nuts",
      brand: "Generic",
      calories: 579,
      protein: 21,
      carbohydrates: 22,
      fat: 50,
      fiber: 12,
      sugar: 4.4,
      sodium: 1,
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
    },
    {
      name: "Broccoli",
      category: "vegetables",
      brand: "Generic",
      calories: 34,
      protein: 2.8,
      carbohydrates: 7,
      fat: 0.4,
      fiber: 2.6,
      sugar: 1.5,
      sodium: 33,
      servingSize: 100,
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

// Run this if called directly
if (require.main === module) {
  seedFoodItems()
    .then(() => {
      console.log("Database seeded successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error seeding database:", error);
      process.exit(1);
    });
}