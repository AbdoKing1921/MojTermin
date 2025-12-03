import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { ArrowLeft, Star } from "lucide-react";
import { Link } from "wouter";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNavigation } from "@/components/BottomNavigation";
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
    queryKey: [`/api/businesses?categorySlug=${slug}`],
  });

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
      <header className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
              className="w-9 h-9 rounded-lg"
              data-testid="button-back"
              aria-label="Nazad"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-base font-semibold text-foreground" data-testid="text-category-name">
              {displayCategory?.name || "Kategorija"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {displayCategory?.description || "Pronađite najbolje usluge"}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-5 py-5 pb-20 scroll-smooth">
        {businessesLoading ? (
          <LoadingScreen />
        ) : businesses?.length ? (
          <div className="space-y-3">
            {businesses.map((business, index) => (
              <Link key={business.id} href={`/business/${business.id}`} className="block">
                <div className="bg-card rounded-xl border border-border overflow-hidden flex hover:border-primary/30 transition-colors">
                  <div className={`w-20 h-20 business-gradient-${(index % 4) + 1} flex items-center justify-center flex-shrink-0`}>
                    {business.imageUrl ? (
                      <img 
                        src={business.imageUrl} 
                        alt={business.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <span className="text-white/60 text-sm font-medium">
                          {business.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {business.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {business.city || "Lokacija"}
                      {business.distance && ` • ${business.distance}`}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold text-foreground">
                        {business.rating || "0.0"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({business.reviewCount || 0})
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
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
