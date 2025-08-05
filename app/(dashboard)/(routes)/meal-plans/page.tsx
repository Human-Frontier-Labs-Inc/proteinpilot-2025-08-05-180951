"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus, Calendar, Target, Sparkles, ShoppingCart } from "lucide-react";
import { toast } from 'sonner'

import Heading from "@/components/heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";

interface MealPlanDay {
  day: string;
  meals: {
    breakfast: MealItem[];
    lunch: MealItem[];
    dinner: MealItem[];
    snacks: MealItem[];
  };
  totalProtein: number;
  totalCalories: number;
}

interface MealItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  protein: number;
  calories: number;
  category: string;
}

interface MealPlan {
  id: string;
  name: string;
  description: string;
  days: MealPlanDay[];
  proteinGoal: number;
  calorieGoal: number;
  isActive: boolean;
  createdAt: string;
}

export default function MealPlansPage() {
  const router = useRouter();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [activePlan, setActivePlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadMealPlans();
  }, []);

  const loadMealPlans = async () => {
    try {
      // Mock meal plans
      const mockMealPlans: MealPlan[] = [
        {
          id: "plan_1",
          name: "High Protein Week",
          description: "Optimized for muscle building with 150-180g protein daily",
          proteinGoal: 150,
          calorieGoal: 2000,
          isActive: true,
          createdAt: new Date().toISOString(),
          days: generateMockWeekPlan()
        }
      ];
      
      setMealPlans(mockMealPlans);
      setActivePlan(mockMealPlans.find(p => p.isActive) || null);
    } catch (error) {
      console.error('Error loading meal plans:', error);
      toast.error("Failed to load meal plans");
    } finally {
      setLoading(false);
    }
  };

  const generateMockWeekPlan = (): MealPlanDay[] => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return days.map(day => ({
      day,
      meals: {
        breakfast: [
          { id: '1', name: 'Greek Yogurt with Berries', quantity: 150, unit: 'g', protein: 15, calories: 150, category: 'dairy' },
          { id: '2', name: 'Granola', quantity: 30, unit: 'g', protein: 3, calories: 120, category: 'grains' }
        ],
        lunch: [
          { id: '3', name: 'Chicken Breast', quantity: 120, unit: 'g', protein: 37, calories: 198, category: 'protein' },
          { id: '4', name: 'Quinoa', quantity: 80, unit: 'g', protein: 3.5, calories: 96, category: 'grains' },
          { id: '5', name: 'Mixed Vegetables', quantity: 100, unit: 'g', protein: 2, calories: 40, category: 'vegetables' }
        ],
        dinner: [
          { id: '6', name: 'Salmon Fillet', quantity: 150, unit: 'g', protein: 37.5, calories: 312, category: 'protein' },
          { id: '7', name: 'Sweet Potato', quantity: 100, unit: 'g', protein: 2, calories: 86, category: 'vegetables' },
          { id: '8', name: 'Broccoli', quantity: 100, unit: 'g', protein: 2.8, calories: 34, category: 'vegetables' }
        ],
        snacks: [
          { id: '9', name: 'Protein Shake', quantity: 30, unit: 'g', protein: 24, calories: 120, category: 'supplements' },
          { id: '10', name: 'Almonds', quantity: 20, unit: 'g', protein: 4.2, calories: 116, category: 'nuts' }
        ]
      },
      totalProtein: 0,
      totalCalories: 0
    })).map(day => ({
      ...day,
      totalProtein: Object.values(day.meals).flat().reduce((sum, item) => sum + item.protein, 0),
      totalCalories: Object.values(day.meals).flat().reduce((sum, item) => sum + item.calories, 0)
    }));
  };

  const generateNewPlan = async () => {
    setGenerating(true);
    try {
      // Simulate AI meal plan generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPlan: MealPlan = {
        id: `plan_${Date.now()}`,
        name: "Custom Protein Plan",
        description: "AI-generated plan based on your preferences",
        proteinGoal: 160,
        calorieGoal: 2100,
        isActive: false,
        createdAt: new Date().toISOString(),
        days: generateMockWeekPlan()
      };
      
      setMealPlans(prev => [newPlan, ...prev]);
      toast.success("New meal plan generated!");
    } catch (error) {
      toast.error("Failed to generate meal plan");
    } finally {
      setGenerating(false);
    }
  };

  const activatePlan = (planId: string) => {
    setMealPlans(prev => prev.map(plan => ({
      ...plan,
      isActive: plan.id === planId
    })));
    
    const activated = mealPlans.find(p => p.id === planId);
    setActivePlan(activated || null);
    toast.success("Meal plan activated!");
  };

  const generateShoppingList = (plan: MealPlan) => {
    const ingredients = new Map<string, { quantity: number; unit: string; category: string }>();
    
    plan.days.forEach(day => {
      Object.values(day.meals).flat().forEach(item => {
        const existing = ingredients.get(item.name);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          ingredients.set(item.name, {
            quantity: item.quantity,
            unit: item.unit,
            category: item.category
          });
        }
      });
    });
    
    const shoppingList = Array.from(ingredients.entries()).map(([name, details]) => ({
      name,
      ...details
    }));
    
    // In a real app, this would open a shopping list or integrate with grocery delivery
    console.log('Shopping List:', shoppingList);
    toast.success("Shopping list generated! Check console for details.");
  };

  const getMealIcon = (meal: string) => {
    const icons: { [key: string]: string } = {
      breakfast: "🍳",
      lunch: "🥗", 
      dinner: "🍽️",
      snacks: "🍎"
    };
    return icons[meal] || "🍽️";
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      protein: "🥩",
      dairy: "🥛",
      supplements: "💊",
      grains: "🌾",
      vegetables: "🥬",
      fruits: "🍎",
      nuts: "🥜"
    };
    return icons[category] || "🍽️";
  };

  return (
    <div>
      <Heading
        title="Meal Plans"
        description="Plan your meals to reach your protein goals"
        icon={BookOpen}
        iconColor="text-orange-600"
        bgColor="bg-orange-600/10"
      />

      <div className="px-4 lg:px-8 space-y-6">
        {/* Generate New Plan */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Create New Meal Plan</h3>
                <p className="text-muted-foreground">
                  Generate a personalized meal plan based on your protein goals
                </p>
              </div>
              <Button 
                onClick={generateNewPlan}
                disabled={generating}
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader className="mr-2 h-4 w-4" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Plan
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Plan */}
        {activePlan && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {activePlan.name}
                    <Badge variant="secondary">Active</Badge>
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {activePlan.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => generateShoppingList(activePlan)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Shopping List
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Weekly Overview */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {activePlan.days.map((day) => (
                  <Card key={day.day} className="p-3 text-center">
                    <h4 className="font-medium text-sm mb-2">{day.day.slice(0, 3)}</h4>
                    <div className="space-y-1">
                      <p className="text-xs text-blue-600 font-semibold">
                        {day.totalProtein.toFixed(0)}g
                      </p>
                      <p className="text-xs text-muted-foreground">protein</p>
                      <Progress 
                        value={(day.totalProtein / activePlan.proteinGoal) * 100} 
                        className="h-1"
                      />
                    </div>
                  </Card>
                ))}
              </div>

              {/* Sample Day Details */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Sample Day: {activePlan.days[0]?.day}
                </h4>
                
                {activePlan.days[0] && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(activePlan.days[0].meals).map(([mealType, items]) => (
                      <Card key={mealType} className="p-4">
                        <h5 className="font-medium mb-3 flex items-center gap-2">
                          <span>{getMealIcon(mealType)}</span>
                          {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                        </h5>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div key={item.id} className="text-sm">
                              <div className="flex items-center gap-1 mb-1">
                                <span className="text-xs">{getCategoryIcon(item.category)}</span>
                                <span className="font-medium">{item.name}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {item.quantity}{item.unit} • {item.protein}g protein
                              </p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Meal Plans */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Meal Plans</h3>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader />
            </div>
          ) : mealPlans.length === 0 ? (
            <Empty label="No meal plans yet. Generate your first plan above!" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mealPlans.map((plan) => (
                <Card key={plan.id} className={plan.isActive ? "ring-2 ring-blue-500" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      {plan.isActive && <Badge>Active</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Daily Protein Goal:</span>
                        <span className="font-semibold text-blue-600">
                          {plan.proteinGoal}g
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Daily Calories:</span>
                        <span className="font-semibold">
                          {plan.calorieGoal} cal
                        </span>
                      </div>
                      
                      {!plan.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => activatePlan(plan.id)}
                          className="w-full"
                        >
                          <Target className="mr-2 h-4 w-4" />
                          Activate Plan
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}