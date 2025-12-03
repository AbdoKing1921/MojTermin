import { Link } from "wouter";
import { Coffee, Sparkles, Scissors, Heart, Dumbbell, Wrench } from "lucide-react";
import type { Category } from "@shared/schema";

interface CategoryCardProps {
  category: Category;
}

const iconMap: Record<string, typeof Coffee> = {
  coffee: Coffee,
  sparkles: Sparkles,
  scissors: Scissors,
  activity: Heart,
  globe: Dumbbell,
  wrench: Wrench,
};

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = iconMap[category.icon] || Coffee;

  return (
    <Link
      href={`/category/${category.slug}`}
      className={`block ${category.gradient} rounded-2xl p-4 text-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md hover:shadow-lg overflow-hidden relative`}
      data-testid={`category-card-${category.slug}`}
    >
      {/* Decorative circles */}
      <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-white/5" />
      
      <div className="relative z-10">
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 bg-white/20 backdrop-blur-sm shadow-inner"
        >
          <Icon 
            className="w-7 h-7 text-white drop-shadow-sm" 
            strokeWidth={1.8}
          />
        </div>
        <h3 className="text-sm font-bold text-white tracking-wide">
          {category.name}
        </h3>
        <p className="text-[11px] text-white/80 mt-1 font-medium">
          {category.description}
        </p>
      </div>
    </Link>
  );
}

export const defaultCategories: Category[] = [
  {
    id: "1",
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
    id: "2",
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
    id: "3",
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
