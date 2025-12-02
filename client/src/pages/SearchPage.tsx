import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { MobileContainer } from "@/components/MobileContainer";
import { BottomNavigation } from "@/components/BottomNavigation";
import { SearchInput } from "@/components/SearchInput";
import { BusinessCard } from "@/components/BusinessCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { NoSearchResultsEmptyState } from "@/components/EmptyState";
import { CategoryCard, defaultCategories } from "@/components/CategoryCard";
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
      <header className="px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold text-foreground mb-4" data-testid="text-search-title">
          Pretraga
        </h1>
        <SearchInput 
          placeholder="Pretražite biznise, usluge..." 
          defaultValue={searchQuery}
          onSearch={setSearchQuery}
        />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-6 pb-24 scroll-smooth">
        {searchQuery ? (
          // Search Results
          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
              Rezultati za "{searchQuery}"
            </h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : searchResults?.length ? (
              <div className="space-y-4">
                {searchResults.map((business, index) => (
                  <Link key={business.id} href={`/business/${business.id}`} className="block">
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
                ))}
              </div>
            ) : (
              <NoSearchResultsEmptyState query={searchQuery} />
            )}
          </div>
        ) : (
          // Browse Categories
          <div>
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
              Pregledaj kategorije
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {displayCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className={`category-card focus-ring ${category.gradient} rounded-2xl p-5 text-left soft-shadow block`}
                  data-testid={`search-category-${category.slug}`}
                >
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
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNavigation />
    </MobileContainer>
  );
}
