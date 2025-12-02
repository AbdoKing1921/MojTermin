import { Link } from "wouter";
import { Coffee, Sparkles, Scissors, Activity, CircleDot, Wrench } from "lucide-react";
import type { Category } from "@shared/schema";

interface CategoryCardProps {
  category: Category;
}

const iconMap: Record<string, typeof Coffee> = {
  coffee: Coffee,
  sparkles: Sparkles,
  scissors: Scissors,
  activity: Activity,
  globe: CircleDot,
  wrench: Wrench,
};

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = iconMap[category.icon] || Coffee;

  return (
    <Link
      href={`/category/${category.slug}`}
      className={`category-card focus-ring ${category.gradient} rounded-2xl p-5 text-left soft-shadow flex-shrink-0 w-44 block`}
      data-testid={`category-card-${category.slug}`}
    >
      <div 
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: `${category.iconColor}15` }}
      >
        <Icon 
          className="w-7 h-7" 
          style={{ color: category.iconColor }}
          strokeWidth={2}
        />
      </div>
      <h3 
        className="text-base font-bold mb-1"
        style={{ color: category.textColor }}
      >
        {category.name}
      </h3>
      <p 
        className="text-xs"
        style={{ color: category.subtextColor }}
      >
        {category.description}
      </p>
    </Link>
  );
}

// Default categories for initial rendering
export const defaultCategories: Category[] = [
  {
    id: "1",
    name: "Kafići",
    nameEn: "Cafes",
    slug: "cafes",
    description: "Rezervišite stolove",
    icon: "coffee",
    gradient: "gradient-cafe",
    iconColor: "#57534E",
    textColor: "#292524",
    subtextColor: "#57534E",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Ljepota",
    nameEn: "Beauty",
    slug: "beauty",
    description: "Saloni & spa",
    icon: "sparkles",
    gradient: "gradient-beauty",
    iconColor: "#7C3AED",
    textColor: "#5B21B6",
    subtextColor: "#6D28D9",
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Berber",
    nameEn: "Barber",
    slug: "barber",
    description: "Profesionalno šišanje",
    icon: "scissors",
    gradient: "gradient-barber",
    iconColor: "#F9FAFB",
    textColor: "#F9FAFB",
    subtextColor: "#E5E7EB",
    createdAt: new Date(),
  },
  {
    id: "4",
    name: "Wellness",
    nameEn: "Wellness",
    slug: "wellness",
    description: "Um i tijelo",
    icon: "activity",
    gradient: "gradient-wellness",
    iconColor: "#059669",
    textColor: "#047857",
    subtextColor: "#059669",
    createdAt: new Date(),
  },
  {
    id: "5",
    name: "Sport",
    nameEn: "Sports",
    slug: "sports",
    description: "Tereni i treninzi",
    icon: "globe",
    gradient: "gradient-sports",
    iconColor: "#2563EB",
    textColor: "#1E40AF",
    subtextColor: "#2563EB",
    createdAt: new Date(),
  },
  {
    id: "6",
    name: "Usluge",
    nameEn: "Services",
    slug: "services",
    description: "Kućne popravke",
    icon: "wrench",
    gradient: "gradient-services",
    iconColor: "#CA8A04",
    textColor: "#854D0E",
    subtextColor: "#A16207",
    createdAt: new Date(),
  },
];
