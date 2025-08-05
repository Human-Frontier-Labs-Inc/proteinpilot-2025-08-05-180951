"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ArrowRight, Target, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";

import { tools } from "./constants";

interface DailyStats {
  dailyTotals: {
    protein: number;
    calories: number;
    carbohydrates: number;
    fat: number;
  };
  proteinGoal: number;
  calorieGoal: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyStats();
  }, []);

  const fetchDailyStats = async () => {
    try {
      const response = await fetch('/api/user/daily-stats');
      if (response.ok) {
        const data = await response.json();
        setDailyStats(data);
      }
    } catch (error) {
      console.error('Error fetching daily stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const proteinProgress = dailyStats 
    ? Math.min((dailyStats.dailyTotals.protein / dailyStats.proteinGoal) * 100, 100)
    : 0;

  const proteinRemaining = dailyStats 
    ? Math.max(dailyStats.proteinGoal - dailyStats.dailyTotals.protein, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center">
          Welcome to ProteinPilot
        </h2>
        <p className="text-muted-foreground font-light text-sm md:text-lg text-center">
          Track your protein intake and reach your fitness goals
        </p>
      </div>

      {/* Today's Progress */}
      <div className="px-4 md:px-20 lg:px-32">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Today's Progress - {format(new Date(), 'EEEE, MMM d')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">
                      {dailyStats?.dailyTotals.protein.toFixed(1) || 0}g
                      <span className="text-sm font-normal text-muted-foreground ml-1">
                        / {dailyStats?.proteinGoal || 150}g protein
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {proteinRemaining.toFixed(1)}g remaining
                    </p>
                  </div>
                  <Button 
                    onClick={() => router.push('/quick-add')}
                    size="sm"
                    className="ml-4"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Quick Add
                  </Button>
                </div>
                <Progress value={proteinProgress} className="w-full" />
                
                {/* Quick nutrition stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold">
                      {dailyStats?.dailyTotals.calories.toFixed(0) || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      {dailyStats?.dailyTotals.carbohydrates.toFixed(1) || 0}g
                    </p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">
                      {dailyStats?.dailyTotals.fat.toFixed(1) || 0}g
                    </p>
                    <p className="text-xs text-muted-foreground">Fat</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          {tools.map((tool) => (
            <Card
              onClick={() => router.push(tool.href)}
              key={tool.href}
              className="p-4 border-black/5 flex items-center justify-between hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center gap-x-4">
                <div className={cn("p-2 w-fit rounded-md", tool.bgColor)}>
                  <tool.icon className={cn("w-8 h-8", tool.color)} />
                </div>
                <div>
                  <div className="font-semibold">{tool.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {tool.description}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
