"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle, AlertCircle, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationProps {
  proteinConsumed: number;
  proteinGoal: number;
  lastMealTime?: Date;
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
  icon: React.ComponentType<{ className?: string }>;
  timestamp: Date;
  dismissed?: boolean;
}

export function ProteinNotifications({ 
  proteinConsumed, 
  proteinGoal, 
  lastMealTime 
}: NotificationProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    generateNotifications();
  }, [proteinConsumed, proteinGoal, lastMealTime]);

  const generateNotifications = () => {
    const newNotifications: Notification[] = [];
    const now = new Date();
    const progressPercentage = (proteinConsumed / proteinGoal) * 100;
    const hoursFromLastMeal = lastMealTime 
      ? (now.getTime() - lastMealTime.getTime()) / (1000 * 60 * 60)
      : 0;

    // Goal achievement notification
    if (progressPercentage >= 100) {
      newNotifications.push({
        id: 'goal-achieved',
        type: 'success',
        title: '🎉 Goal Achieved!',
        message: `You've reached your daily protein goal of ${proteinGoal}g!`,
        icon: CheckCircle,
        timestamp: now
      });
    }
    // Close to goal notification
    else if (progressPercentage >= 80) {
      newNotifications.push({
        id: 'close-to-goal',
        type: 'info',
        title: '💪 Almost There!',
        message: `You're ${Math.round(proteinGoal - proteinConsumed)}g away from your goal!`,
        icon: Target,
        timestamp: now
      });
    }
    // Halfway reminder
    else if (progressPercentage >= 50 && progressPercentage < 80) {
      newNotifications.push({
        id: 'halfway',
        type: 'info',
        title: '⚡ Halfway There!',
        message: `Great progress! You're at ${Math.round(progressPercentage)}% of your daily goal.`,
        icon: Target,
        timestamp: now
      });
    }

    // Time-based reminders
    const currentHour = now.getHours();
    
    // Morning reminder (if it's past 10 AM and protein is low)
    if (currentHour >= 10 && currentHour < 12 && progressPercentage < 20) {
      newNotifications.push({
        id: 'morning-reminder',
        type: 'warning',
        title: '🌅 Morning Protein',
        message: 'Start your day strong with a protein-rich breakfast!',
        icon: AlertCircle,
        timestamp: now
      });
    }

    // Lunch reminder (if it's past 1 PM and protein is low)
    if (currentHour >= 13 && currentHour < 15 && progressPercentage < 40) {
      newNotifications.push({
        id: 'lunch-reminder',
        type: 'warning',
        title: '🥗 Lunch Time',
        message: 'Don\'t forget to include protein in your lunch!',
        icon: AlertCircle,
        timestamp: now
      });
    }

    // Evening reminder (if it's past 6 PM and protein is low)
    if (currentHour >= 18 && currentHour < 20 && progressPercentage < 70) {
      newNotifications.push({
        id: 'evening-reminder',
        type: 'warning',
        title: '🍽️ Evening Boost',
        message: `You need ${Math.round(proteinGoal - proteinConsumed)}g more protein today!`,
        icon: AlertCircle,
        timestamp: now
      });
    }

    // Long gap since last meal
    if (lastMealTime && hoursFromLastMeal > 4 && progressPercentage < 90) {
      newNotifications.push({
        id: 'meal-gap',
        type: 'warning',
        title: '⏰ Meal Reminder',
        message: 'It\'s been a while since your last meal. Consider a protein snack!',
        icon: AlertCircle,
        timestamp: now
      });
    }

    setNotifications(prev => {
      // Only add new notifications that don't already exist
      const existingIds = prev.map(n => n.id);
      const filtered = newNotifications.filter(n => !existingIds.includes(n.id));
      return [...prev, ...filtered].slice(-5); // Keep only last 5 notifications
    });
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, dismissed: true } : n)
    );
  };

  const activeNotifications = notifications.filter(n => !n.dismissed);

  if (activeNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {activeNotifications.map(notification => (
        <Card key={notification.id} className={cn(
          "border-l-4 transition-all duration-300",
          notification.type === 'success' && "border-l-green-500 bg-green-50",
          notification.type === 'warning' && "border-l-orange-500 bg-orange-50",
          notification.type === 'info' && "border-l-blue-500 bg-blue-50"
        )}>
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <notification.icon className={cn(
                  "h-5 w-5 mt-0.5",
                  notification.type === 'success' && "text-green-600",
                  notification.type === 'warning' && "text-orange-600",
                  notification.type === 'info' && "text-blue-600"
                )} />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissNotification(notification.id)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Hook for managing notification preferences
export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState({
    goalReminders: true,
    mealReminders: true,
    achievementAlerts: true,
    reminderFrequency: 'normal' as 'low' | 'normal' | 'high'
  });

  const updatePreference = (key: keyof typeof preferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    // In a real app, save to localStorage or API
    localStorage.setItem('proteinpilot-notifications', JSON.stringify({
      ...preferences,
      [key]: value
    }));
  };

  useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem('proteinpilot-notifications');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load notification preferences:', error);
      }
    }
  }, []);

  return { preferences, updatePreference };
}