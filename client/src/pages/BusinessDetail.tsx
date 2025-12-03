import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Star, MapPin, Clock, Phone, Mail, MessageSquare, Send } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { LoadingScreen } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Business, Service, Review, User } from "@shared/schema";

interface ReviewWithUser extends Review {
  user?: User;
}

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: business, isLoading: businessLoading } = useQuery<Business>({
    queryKey: ["/api/businesses", id],
  });

  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/businesses", id, "services"],
  });

  const { data: reviews } = useQuery<ReviewWithUser[]>({
    queryKey: [`/api/businesses/${id}/reviews`],
  });

  const submitReviewMutation = useMutation({
    mutationFn: async (data: { rating: number; comment: string }) => {
      return apiRequest("POST", "/api/reviews", {
        businessId: id,
        ...data,
      });
    },
    onSuccess: () => {
      toast({ title: "Hvala!", description: "Vaša recenzija je uspješno objavljena" });
      setShowReviewForm(false);
      setRating(5);
      setComment("");
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${id}/reviews`] });
      queryClient.invalidateQueries({ queryKey: ["/api/businesses", id] });
    },
    onError: () => {
      toast({ title: "Greška", description: "Nije moguće objaviti recenziju", variant: "destructive" });
    },
  });

  const handleSubmitReview = () => {
    if (rating < 1 || rating > 5) return;
    submitReviewMutation.mutate({ rating, comment: comment.trim() || undefined } as any);
  };

  if (businessLoading) {
    return (
      <MobileContainer>
        <LoadingScreen />
      </MobileContainer>
    );
  }

  if (!business) {
    return (
      <MobileContainer>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Biznis nije pronađen</p>
        </div>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      {/* Hero Image */}
      <div className="relative h-44 business-gradient-1">
        {business.imageUrl ? (
          <img 
            src={business.imageUrl} 
            alt={business.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-white/40 text-xl font-semibold">
                {business.name.charAt(0)}
              </span>
            </div>
          </div>
        )}
        
        {/* Back Button */}
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 w-9 h-9 rounded-lg bg-white/90 backdrop-blur-sm"
            data-testid="button-back"
            aria-label="Nazad"
          >
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </Button>
        </Link>

        {/* Sponsored Badge */}
        {business.isSponsored && (
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-0.5 rounded">
            Sponzorisano
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-5 py-5 pb-24 scroll-smooth">
        {/* Business Info */}
        <div className="mb-5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground mb-2" data-testid="text-business-name">
            {business.name}
          </h1>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-foreground">
                {business.rating || "0.0"}
              </span>
              <span className="text-xs text-muted-foreground">
                ({business.reviewCount || 0} recenzija)
              </span>
            </div>
          </div>

          {business.description && (
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {business.description}
            </p>
          )}

          {/* Contact Info */}
          <div className="space-y-2 p-3 bg-secondary/50 rounded-lg">
            {business.address && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{business.address}, {business.city}</span>
              </div>
            )}
            {business.phone && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{business.phone}</span>
              </div>
            )}
            {business.email && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>{business.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>
                {business.openTime || "09:00"} - {business.closeTime || "18:00"}
              </span>
            </div>
          </div>
        </div>

        {/* Services */}
        {services && services.length > 0 && (
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Usluge</h2>
            <div className="space-y-2">
              {services.map((service) => (
                <div 
                  key={service.id}
                  className="p-3 bg-card rounded-lg border border-border flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-medium text-foreground">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {service.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {service.duration} min
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    {service.price} KM
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Recenzije ({reviews?.length || 0})
            </h2>
            {isAuthenticated && !showReviewForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReviewForm(true)}
                className="text-xs"
                data-testid="button-write-review"
              >
                Napišite recenziju
              </Button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="p-4 bg-card rounded-lg border border-border mb-4" data-testid="review-form">
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">Vaša ocjena</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                      data-testid={`star-${star}`}
                    >
                      <Star 
                        className={`w-6 h-6 transition-colors ${
                          star <= rating 
                            ? "fill-amber-400 text-amber-400" 
                            : "text-muted-foreground/30"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Opišite vaše iskustvo... (opcionalno)"
                className="resize-none mb-3 text-sm"
                rows={3}
                data-testid="input-review-comment"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSubmitReview}
                  disabled={submitReviewMutation.isPending}
                  className="text-xs"
                  data-testid="button-submit-review"
                >
                  <Send className="w-3 h-3 mr-1" />
                  {submitReviewMutation.isPending ? "Šaljem..." : "Objavi"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReviewForm(false)}
                  className="text-xs"
                  data-testid="button-cancel-review"
                >
                  Odustani
                </Button>
              </div>
            </div>
          )}

          {/* Reviews List */}
          {reviews && reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div 
                  key={review.id}
                  className="p-3 bg-card rounded-lg border border-border"
                  data-testid={`review-${review.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {(review.user?.firstName?.[0] || "K").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {review.user?.firstName || "Korisnik"}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${
                                star <= (review.rating || 0)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground/20"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {new Date(review.createdAt!).toLocaleDateString("sr-Latn")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Još nema recenzija</p>
              <p className="text-xs text-muted-foreground/60">Budite prvi koji će ostaviti recenziju</p>
            </div>
          )}
        </div>
      </main>

      {/* Book Button */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 py-4 bg-card/95 backdrop-blur-sm border-t border-border">
        <Link href={`/book/${business.id}`}>
          <Button 
            className="w-full h-11 text-sm font-semibold rounded-lg"
            data-testid="button-book"
          >
            Zakažite termin
          </Button>
        </Link>
      </footer>
    </MobileContainer>
  );
}
