import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNavigation } from "@/components/BottomNavigation";
import { BusinessCard } from "@/components/BusinessCard";
import { LoadingScreen } from "@/components/LoadingSpinner";
import { NoBusinessesEmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import type { Category, Business } from "@shared/schema";
import { defaultCategories } from "@/components/CategoryCard";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: category, isLoading: categoryLoading } = useQuery<Category>({
    queryKey: ["/api/categories", slug],
  });

  const { data: businesses, isLoading: businessesLoading } = useQuery<Business[]>({
    queryKey: ["/api/businesses", { categorySlug: slug }],
  });

  // Find category from defaults if API doesn't return it
  const displayCategory = category || defaultCategories.find(c => c.slug === slug);

  if (categoryLoading) {
    return (
      <MobileContainer>
        <LoadingScreen />
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      {/* Header */}
      <header className="px-6 pt-8 pb-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full bg-secondary"
              data-testid="button-back"
              aria-label="Nazad"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground" data-testid="text-category-name">
              {displayCategory?.name || "Kategorija"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {displayCategory?.description || "Pronađite najbolje usluge"}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 py-6 pb-24 scroll-smooth">
        {businessesLoading ? (
          <LoadingScreen />
        ) : businesses?.length ? (
          <div className="grid gap-4">
            {businesses.map((business, index) => (
              <div key={business.id} className="w-full">
                <Link href={`/business/${business.id}`} className="block">
                  <div className="category-card soft-shadow rounded-2xl overflow-hidden bg-card flex">
                    <div className={`w-24 h-24 business-gradient-${(index % 4) + 1} flex items-center justify-center flex-shrink-0`}>
                      {business.imageUrl ? (
                        <img 
                          src={business.imageUrl} 
                          alt={business.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/20" />
                      )}
                    </div>
                    <div className="p-4 flex-1 min-w-0">
                      <h3 className="text-base font-bold text-foreground truncate">
                        {business.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {business.city || "Lokacija"}
                        {business.distance && ` • ${business.distance}`}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {business.rating || "0.0"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({business.reviewCount || 0} recenzija)
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <NoBusinessesEmptyState />
        )}
      </main>

      <BottomNavigation />
    </MobileContainer>
  );
}
