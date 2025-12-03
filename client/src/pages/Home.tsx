import { useQuery } from "@tanstack/react-query";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ProfileHeader } from "@/components/ProfileHeader";
import { SearchInput } from "@/components/SearchInput";
import { CategoryCard, defaultCategories } from "@/components/CategoryCard";
import { BusinessCard } from "@/components/BusinessCard";
import { CategorySkeleton, CardSkeleton } from "@/components/LoadingSpinner";
import { ChevronRight, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "wouter";
import type { Category, Business } from "@shared/schema";

export default function Home() {
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: popularBusinesses, isLoading: businessesLoading } = useQuery<Business[]>({
    queryKey: ["/api/businesses/popular"],
  });

  const rawCategories = categories?.length ? categories : defaultCategories;
  const displayCategories = [...rawCategories].sort((a, b) => {
    if (a.slug === "barber") return -1;
    if (b.slug === "barber") return 1;
    return 0;
  });

  return (
    <MobileContainer>
      {/* Header */}
      <header className="px-5 pt-6 pb-5 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground" data-testid="text-app-name">
              MojTermin
            </h1>
            <p className="text-sm text-muted-foreground mt-1" data-testid="text-tagline">
              Zakažite bilo šta, bilo kada
            </p>
          </div>
          <ProfileHeader />
        </div>

        <SearchInput placeholder="Pretražite salone, usluge..." />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 scroll-smooth">
        {/* Categories Section */}
        <section className="px-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground" data-testid="text-categories-title">
                  Kategorije
                </h2>
                <p className="text-xs text-muted-foreground">Izaberite vrstu usluge</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {categoriesLoading ? (
              <>
                <CategorySkeleton />
                <CategorySkeleton />
                <CategorySkeleton />
                <CategorySkeleton />
                <CategorySkeleton />
                <CategorySkeleton />
              </>
            ) : (
              displayCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))
            )}
          </div>
        </section>

        {/* Popular Businesses Section */}
        <section className="px-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground" data-testid="text-popular-title">
                  Popularno
                </h2>
                <p className="text-xs text-muted-foreground">Najbolje ocijenjeni saloni</p>
              </div>
            </div>
            <Link href="/search" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              Vidi sve
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {businessesLoading ? (
              <>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </>
            ) : popularBusinesses?.length ? (
              popularBusinesses.slice(0, 6).map((business, index) => (
                <BusinessCard 
                  key={business.id}
                  business={business} 
                  index={index}
                  variant="horizontal"
                />
              ))
            ) : (
              <div className="flex items-center justify-center w-full py-12 bg-muted/30 rounded-2xl">
                <p className="text-sm text-muted-foreground">
                  Nema dostupnih salona
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNavigation />
    </MobileContainer>
  );
}
