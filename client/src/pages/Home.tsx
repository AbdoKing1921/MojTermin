import { useQuery } from "@tanstack/react-query";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNavigation } from "@/components/BottomNavigation";
import { ProfileHeader } from "@/components/ProfileHeader";
import { SearchInput } from "@/components/SearchInput";
import { CategoryCard, defaultCategories } from "@/components/CategoryCard";
import { BusinessCard } from "@/components/BusinessCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { Category, Business } from "@shared/schema";

export default function Home() {
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: popularBusinesses, isLoading: businessesLoading } = useQuery<Business[]>({
    queryKey: ["/api/businesses/popular"],
  });

  const displayCategories = categories?.length ? categories : defaultCategories;

  return (
    <MobileContainer>
      {/* Header */}
      <header className="px-6 pt-8 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1" data-testid="text-app-name">
              MojTermin
            </h1>
            <p className="text-sm text-muted-foreground" data-testid="text-tagline">
              Zakažite bilo šta, bilo kada
            </p>
          </div>
          <ProfileHeader />
        </div>

        <SearchInput placeholder="Pretražite usluge..." />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 pb-24 scroll-smooth">
        {/* Categories Section */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4" data-testid="text-categories-title">
            Kategorije
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar cursor-grab active:cursor-grabbing">
            {categoriesLoading ? (
              <div className="flex items-center justify-center w-full py-8">
                <LoadingSpinner />
              </div>
            ) : (
              displayCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))
            )}
          </div>
        </section>

        {/* Popular Businesses Section */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4" data-testid="text-popular-title">
            Popularni biznisi
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar cursor-grab active:cursor-grabbing">
            {businessesLoading ? (
              <div className="flex items-center justify-center w-full py-8">
                <LoadingSpinner />
              </div>
            ) : popularBusinesses?.length ? (
              popularBusinesses.map((business, index) => (
                <BusinessCard 
                  key={business.id} 
                  business={business} 
                  index={index}
                />
              ))
            ) : (
              <div className="flex items-center justify-center w-full py-8">
                <p className="text-sm text-muted-foreground">
                  Nema dostupnih biznisa
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
