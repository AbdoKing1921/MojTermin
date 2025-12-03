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
      className={`category-card focus-ring ${category.gradient} rounded-xl p-4 text-left soft-shadow flex-shrink-0 w-40 block`}
      data-testid={`category-card-${category.slug}`}
    >
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
        style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
      >
        <Icon 
          className="w-5 h-5 text-white" 
          strokeWidth={2}
        />
      </div>
      <h3 className="text-sm font-semibold text-white mb-0.5">
        {category.name}
      </h3>
      <p className="text-xs text-white/70">
        {category.description}
      </p>
    </Link>
  );
}

export const defaultCategories: Category[] = [
  {
    id: "1",
    name: "Kafići",
    nameEn: "Cafes",
    slug: "cafes",
    description: "Rezervišite stolove",
    icon: "coffee",
    gradient: "gradient-cafe",
    iconColor: "#FFFFFF",
    textColor: "#FFFFFF",
    subtextColor: "#FFFFFF",
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
    iconColor: "#FFFFFF",
    textColor: "#FFFFFF",
    subtextColor: "#FFFFFF",
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
    iconColor: "#FFFFFF",
    textColor: "#FFFFFF",
    subtextColor: "#FFFFFF",
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
    iconColor: "#FFFFFF",
    textColor: "#FFFFFF",
    subtextColor: "#FFFFFF",
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
    iconColor: "#FFFFFF",
    textColor: "#FFFFFF",
    subtextColor: "#FFFFFF",
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
    iconColor: "#FFFFFF",
    textColor: "#FFFFFF",
    subtextColor: "#FFFFFF",
    createdAt: new Date(),
  },
];
