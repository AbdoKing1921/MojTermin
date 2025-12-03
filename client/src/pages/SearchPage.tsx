import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { Star } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNavigation } from "@/components/BottomNavigation";
import { SearchInput } from "@/components/SearchInput";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { NoSearchResultsEmptyState } from "@/components/EmptyState";
import { defaultCategories } from "@/components/CategoryCard";
import type { Business, Category } from "@shared/schema";
import { Link } from "wouter";

export default function SearchPage() {
  const searchParams = useSearch();
  const urlQuery = new URLSearchParams(searchParams).get("q") || "";
  const [searchQuery, setSearchQuery] = useState(urlQuery);

  useEffect(() => {
    setSearchQuery(urlQuery);
  }, [urlQuery]);

  const { data: searchResults, isLoading } = useQuery<Business[]>({
    queryKey: [`/api/search?q=${encodeURIComponent(searchQuery)}`],
    enabled: searchQuery.length > 0,
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const displayCategories = categories?.length ? categories : defaultCategories;

  return (
    <MobileContainer>
      {/* Header */}
      <header className="px-5 pt-6 pb-4">
        <h1 className="text-xl font-semibold tracking-tight text-foreground mb-3" data-testid="text-search-title">
          Pretraga
        </h1>
        <SearchInput 
          placeholder="Pretražite biznise, usluge..." 
          defaultValue={searchQuery}
          onSearch={setSearchQuery}
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-5 pb-20 scroll-smooth">
        {searchQuery ? (
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Rezultati za "{searchQuery}"
            </h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : searchResults?.length ? (
              <div className="space-y-3">
                {searchResults.map((business, index) => (
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
              <NoSearchResultsEmptyState query={searchQuery} />
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Pregledaj kategorije
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {displayCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className={`${category.gradient} rounded-xl p-4 text-left block hover:opacity-90 transition-opacity`}
                  data-testid={`search-category-${category.slug}`}
                >
                  <h3 
                    className="text-sm font-semibold"
                    style={{ color: category.textColor }}
                  >
                    {category.name}
                  </h3>
                  <p 
                    className="text-xs mt-0.5"
                    style={{ color: category.subtextColor }}
                  >
                    {category.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </MobileContainer>
  );
}
