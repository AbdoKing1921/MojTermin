import { useQuery } from "@tanstack/react-query";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ProfileHeader } from "@/components/ProfileHeader";
import { SearchInput } from "@/components/SearchInput";
import { CategoryCard, defaultCategories } from "@/components/CategoryCard";
import { BusinessCard } from "@/components/BusinessCard";
import { CategorySkeleton, CardSkeleton } from "@/components/LoadingSpinner";
import { ChevronRight, TrendingUp, Grid3X3, Star } from "lucide-react";
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
      <header className="px-5 pt-6 pb-6 bg-gradient-to-b from-primary/5 to-transparent">
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
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm">
                <Grid3X3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground" data-testid="text-categories-title">
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
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center shadow-sm">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground" data-testid="text-popular-title">
                  Popularno
                </h2>
                <p className="text-xs text-muted-foreground">Najbolje ocijenjeni saloni</p>
              </div>
            </div>
            <Link href="/search" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-full">
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
              <div className="flex flex-col items-center justify-center w-full py-16 bg-muted/30 rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                  <Star className="w-7 h-7 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Nema dostupnih salona
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Vratite se uskoro
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
