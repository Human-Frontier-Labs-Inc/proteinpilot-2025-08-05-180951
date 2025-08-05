import { BookOpen, Camera, TrendingUp, UtensilsCrossed, Plus } from "lucide-react";

export const tools = [
  {
    label: "Quick Add Food",
    icon: Plus,
    href: "/quick-add",
    color: "text-blue-600",
    bgColor: "bg-blue-600/10",
    description: "Add food to your daily log"
  },
  {
    label: "Food Log",
    icon: UtensilsCrossed,
    color: "text-green-600",
    bgColor: "bg-green-600/10",
    href: "/food-log",
    description: "View your daily nutrition history"
  },
  {
    label: "Scan Food",
    icon: Camera,
    href: "/scan",
    color: "text-purple-600",
    bgColor: "bg-purple-600/10",
    description: "Take a photo to identify food"
  },
  {
    label: "Meal Plans",
    icon: BookOpen,
    color: "text-orange-600",
    bgColor: "bg-orange-600/10",
    href: "/meal-plans",
    description: "Plan your meals for the week"
  },
  {
    label: "Progress & Insights",
    icon: TrendingUp,
    href: "/insights",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    description: "Track your protein goals over time"
  },
];
