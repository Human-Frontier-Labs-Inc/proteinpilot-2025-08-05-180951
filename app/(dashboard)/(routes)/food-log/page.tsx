"use client";

import * as z from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, Plus, Trash2, Edit } from "lucide-react";
import { toast } from 'sonner'
import { useForm } from "react-hook-form";
import { format } from "date-fns";

import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import Heading from "@/components/heading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { useProModal } from "@/hooks/use-pro-modal";

const formSchema = z.object({
  foodName: z.string().min(1, "Food name is required"),
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
}

interface FoodLog {
  id: string;
  quantity: number;
  unit: string;
  mealType: string;
  consumedAt: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  foodItem: FoodItem;
}

export default function FoodLogPage() {
  const router = useRouter();
  const proModal = useProModal();
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      foodName: "",
      quantity: 100,
      mealType: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    fetchFoodLogs();
    fetchFoodItems();
  }, []);

  const fetchFoodLogs = async () => {
    try {
      const response = await fetch('/api/food/log');
      if (response.ok) {
        const data = await response.json();
        setFoodLogs(data);
      }
    } catch (error) {
      console.error('Error fetching food logs:', error);
      toast.error("Failed to load food logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodItems = async () => {
    try {
      const response = await fetch('/api/food/items');
      if (response.ok) {
        const data = await response.json();
        setFoodItems(data);
      }
    } catch (error) {
      console.error('Error fetching food items:', error);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedFood) {
      toast.error("Please select a food item");
      return;
    }

    try {
      const response = await fetch('/api/food/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodItemId: selectedFood.id,
          quantity: values.quantity,
          mealType: values.mealType,
        }),
      });

      if (response.ok) {
        const newLog = await response.json();
        setFoodLogs(prev => [newLog, ...prev]);
        form.reset();
        setSelectedFood(null);
        toast.success("Food logged successfully!");
      } else {
        toast.error("Failed to log food");
      }
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      router.refresh();
    }
  };

  const deleteLog = async (logId: string) => {
    try {
      const response = await fetch(`/api/food/log?id=${logId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFoodLogs(prev => prev.filter(log => log.id !== logId));
        toast.success("Food log deleted");
      } else {
        toast.error("Failed to delete food log");
      }
    } catch (error) {
      toast.error("Failed to delete food log");
    }
  };

  const mealTypes = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snack", label: "Snack" },
  ];

  return (
    <div>
      <Heading
        title="Food Log"
        description="Track your daily food intake and protein consumption."
        icon={UtensilsCrossed}
        iconColor="text-green-600"
        bgColor="bg-green-600/10"
      />

      <div className="px-4 lg:px-8">
        {/* Add Food Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Food Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    name="foodName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Food Item</FormLabel>
                        <FormControl>
                          <Select
                            value={selectedFood?.id || ""}
                            onValueChange={(value) => {
                              const food = foodItems.find(f => f.id === value);
                              setSelectedFood(food || null);
                              field.onChange(food?.name || "");
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a food item" />
                            </SelectTrigger>
                            <SelectContent>
                              {foodItems.map((food) => (
                                <SelectItem key={food.id} value={food.id}>
                                  {food.name} ({food.protein}g protein)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

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
                            disabled={isLoading}
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
                        <FormLabel>Meal Type</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select meal type" />
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

                  <div className="flex items-end">
                    <Button
                      type="submit"
                      disabled={isLoading || !selectedFood}
                      className="w-full"
                    >
                      {isLoading ? "Adding..." : "Add to Log"}
                    </Button>
                  </div>
                </div>

                {selectedFood && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Nutrition Info (per {form.watch("quantity")}g)</h4>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Calories:</span>
                        <p>{((selectedFood.calories * form.watch("quantity")) / selectedFood.servingSize).toFixed(0)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Protein:</span>
                        <p>{((selectedFood.protein * form.watch("quantity")) / selectedFood.servingSize).toFixed(1)}g</p>
                      </div>
                      <div>
                        <span className="font-medium">Carbs:</span>
                        <p>{((selectedFood.carbohydrates * form.watch("quantity")) / selectedFood.servingSize).toFixed(1)}g</p>
                      </div>
                      <div>
                        <span className="font-medium">Fat:</span>
                        <p>{((selectedFood.fat * form.watch("quantity")) / selectedFood.servingSize).toFixed(1)}g</p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Food Logs */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Today's Food Log</h3>
          {loading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          {foodLogs.length === 0 && !loading && (
            <Empty label="No food entries yet. Start tracking your protein!" />
          )}
          
          {foodLogs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{log.foodItem.name}</h4>
                      <span className="text-sm text-muted-foreground">
                        ({log.mealType})
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {log.quantity}g • {format(new Date(log.consumedAt), 'h:mm a')}
                    </p>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Calories:</span>
                        <p>{log.calories.toFixed(0)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Protein:</span>
                        <p className="text-blue-600 font-semibold">{log.protein.toFixed(1)}g</p>
                      </div>
                      <div>
                        <span className="font-medium">Carbs:</span>
                        <p>{log.carbohydrates.toFixed(1)}g</p>
                      </div>
                      <div>
                        <span className="font-medium">Fat:</span>
                        <p>{log.fat.toFixed(1)}g</p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteLog(log.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}