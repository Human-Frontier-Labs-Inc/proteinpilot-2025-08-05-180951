"use client";

import * as z from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Clock, Zap } from "lucide-react";
import { toast } from 'sonner'
import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import Heading from "@/components/heading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";

const quickAddSchema = z.object({
  quantity: z.number().min(0.1, "Quantity must be greater than 0"),
  mealType: z.string().min(1, "Meal type is required"),
});

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  category: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
  verified: boolean;
}

interface RecentFood {
  id: string;
  foodItem: FoodItem;
  quantity: number;
  mealType: string;
  consumedAt: string;
}

export default function QuickAddPage() {
  const router = useRouter();
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [recentFoods, setRecentFoods] = useState<RecentFood[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const form = useForm<z.infer<typeof quickAddSchema>>({
    resolver: zodResolver(quickAddSchema),
    defaultValues: {
      quantity: 100,
      mealType: getCurrentMealType(),
    },
  });

  useEffect(() => {
    fetchFoodItems();
    fetchRecentFoods();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 2) {
      handleSearch(searchTerm);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  function getCurrentMealType() {
    const hour = new Date().getHours();
    if (hour < 11) return "breakfast";
    if (hour < 15) return "lunch";
    if (hour < 19) return "dinner";
    return "snack";
  }

  const fetchFoodItems = async () => {
    try {
      // For demo purposes, use the seeded data
      const mockFoodItems: FoodItem[] = [
        {
          id: "1",
          name: "Chicken Breast",
          category: "protein",
          brand: "Generic",
          calories: 165,
          protein: 31,
          carbohydrates: 0,
          fat: 3.6,
          servingSize: 100,
          servingUnit: "g",
          verified: true
        },
        {
          id: "2",
          name: "Greek Yogurt",
          category: "dairy",
          brand: "Generic",
          calories: 100,
          protein: 10,
          carbohydrates: 6,
          fat: 5,
          servingSize: 100,
          servingUnit: "g",
          verified: true
        },
        {
          id: "3",
          name: "Eggs",
          category: "protein",
          brand: "Generic",
          calories: 155,
          protein: 13,
          carbohydrates: 1.1,
          fat: 11,
          servingSize: 100,
          servingUnit: "g",
          verified: true
        },
        {
          id: "4",
          name: "Whey Protein Powder",
          category: "supplements",
          brand: "Generic",
          calories: 103,
          protein: 20,
          carbohydrates: 2,
          fat: 1,
          servingSize: 25,
          servingUnit: "g",
          verified: true
        }
      ];
      setFoodItems(mockFoodItems);
    } catch (error) {
      console.error('Error fetching food items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentFoods = async () => {
    try {
      // Mock recent foods based on current time
      const mockRecentFoods: RecentFood[] = [
        {
          id: "recent_1",
          foodItem: {
            id: "1",
            name: "Chicken Breast",
            category: "protein",
            brand: "Generic",
            calories: 165,
            protein: 31,
            carbohydrates: 0,
            fat: 3.6,
            servingSize: 100,
            servingUnit: "g",
            verified: true
          },
          quantity: 150,
          mealType: "lunch",
          consumedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ];
      setRecentFoods(mockRecentFoods);
    } catch (error) {
      console.error('Error fetching recent foods:', error);
    }
  };

  const handleSearch = async (term: string) => {
    setSearching(true);
    try {
      const filtered = foodItems.filter(food =>
        food.name.toLowerCase().includes(term.toLowerCase()) ||
        food.category.toLowerCase().includes(term.toLowerCase())
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching foods:', error);
    } finally {
      setSearching(false);
    }
  };

  const selectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setSearchTerm("");
    setSearchResults([]);
  };

  const addRecentFood = (recentFood: RecentFood) => {
    setSelectedFood(recentFood.foodItem);
    form.setValue("quantity", recentFood.quantity);
    form.setValue("mealType", recentFood.mealType);
  };

  const onSubmit = async (values: z.infer<typeof quickAddSchema>) => {
    if (!selectedFood) {
      toast.error("Please select a food item");
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Added ${values.quantity}g of ${selectedFood.name} to ${values.mealType}!`);
      
      // Reset form
      form.reset({
        quantity: 100,
        mealType: getCurrentMealType(),
      });
      setSelectedFood(null);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      toast.error("Failed to add food. Please try again.");
    }
  };

  const mealTypes = [
    { value: "breakfast", label: "🍳 Breakfast" },
    { value: "lunch", label: "🥗 Lunch" },
    { value: "dinner", label: "🍽️ Dinner" },
    { value: "snack", label: "🍎 Snack" },
  ];

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

  const calculatedNutrition = selectedFood && form.watch("quantity") ? {
    calories: (selectedFood.calories * form.watch("quantity")) / selectedFood.servingSize,
    protein: (selectedFood.protein * form.watch("quantity")) / selectedFood.servingSize,
    carbohydrates: (selectedFood.carbohydrates * form.watch("quantity")) / selectedFood.servingSize,
    fat: (selectedFood.fat * form.watch("quantity")) / selectedFood.servingSize,
  } : null;

  return (
    <div className="max-w-2xl mx-auto">
      <Heading
        title="Quick Add Food"
        description="Quickly add food to your daily log"
        icon={Zap}
        iconColor="text-blue-600"
        bgColor="bg-blue-600/10"
      />

      <div className="px-4 lg:px-8 space-y-6">
        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for foods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Search Results</h4>
                {searchResults.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => selectFood(food)}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getCategoryIcon(food.category)}</span>
                      <div>
                        <p className="font-medium">{food.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {food.protein}g protein • {food.calories} cal
                        </p>
                      </div>
                    </div>
                    {food.verified && (
                      <Badge variant="secondary" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {searching && (
              <div className="mt-4 flex items-center justify-center">
                <Loader />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Foods */}
        {recentFoods.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Recent Foods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentFoods.map((recent) => (
                <div
                  key={recent.id}
                  onClick={() => addRecentFood(recent)}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getCategoryIcon(recent.foodItem.category)}</span>
                    <div>
                      <p className="font-medium">{recent.foodItem.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {recent.quantity}g • {recent.mealType}
                      </p>
                    </div>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Selected Food & Add Form */}
        {selectedFood && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">{getCategoryIcon(selectedFood.category)}</span>
                {selectedFood.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity (g)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.1"
                              min="0.1"
                              placeholder="100"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="mealType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meal</FormLabel>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {mealTypes.map((meal) => (
                                  <SelectItem key={meal.value} value={meal.value}>
                                    {meal.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Nutrition Preview */}
                  {calculatedNutrition && (
                    <div className="p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-3 text-center">Nutrition Preview</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-orange-600">
                            {calculatedNutrition.calories.toFixed(0)}
                          </p>
                          <p className="text-xs text-muted-foreground">Calories</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-blue-600">
                            {calculatedNutrition.protein.toFixed(1)}g
                          </p>
                          <p className="text-xs text-muted-foreground">Protein</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">
                            {calculatedNutrition.carbohydrates.toFixed(1)}g
                          </p>
                          <p className="text-xs text-muted-foreground">Carbs</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">
                            {calculatedNutrition.fat.toFixed(1)}g
                          </p>
                          <p className="text-xs text-muted-foreground">Fat</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add to {form.watch("mealType")}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Popular Foods */}
        {!selectedFood && searchTerm === "" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Popular High-Protein Foods</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader />
                </div>
              ) : (
                <div className="space-y-2">
                  {foodItems.slice(0, 4).map((food) => (
                    <div
                      key={food.id}
                      onClick={() => selectFood(food)}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getCategoryIcon(food.category)}</span>
                        <div>
                          <p className="font-medium">{food.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {food.protein}g protein per {food.servingSize}g
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-blue-600">
                          {food.protein}g
                        </p>
                        <p className="text-xs text-muted-foreground">protein</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}