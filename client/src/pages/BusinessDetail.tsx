import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Star, MapPin, Clock, Phone, Mail, MessageSquare, Send, ChevronRight, Sparkles } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { LoadingScreen } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Business, Service, Review, User } from "@shared/schema";

interface ReviewWithUser extends Review {
  user?: User;
}

const gradients = [
  "business-gradient-1",
  "business-gradient-2",
  "business-gradient-3",
  "business-gradient-4",
];

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

  const gradientClass = gradients[0];

  return (
    <MobileContainer>
      {/* Hero Image with Gradient Overlay */}
      <div className={`relative h-56 ${gradientClass}`}>
        {business.imageUrl ? (
          <img 
            src={business.imageUrl} 
            alt={business.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
              <span className="text-white/60 text-3xl font-bold">
                {business.name.charAt(0)}
              </span>
            </div>
          </div>
        )}
        
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Back Button */}
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm hover:bg-white"
            data-testid="button-back"
            aria-label="Nazad"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
        </Link>

        {/* Sponsored Badge */}
        {business.isSponsored && (
          <Badge className="absolute top-4 right-4">
            <Sparkles className="w-3 h-3 mr-1" />
            Top
          </Badge>
        )}

        {/* Business Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h1 className="text-xl font-bold text-white mb-1" data-testid="text-business-name">
            {business.name}
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-md">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-white">
                {business.rating || "0.0"}
              </span>
            </div>
            <span className="text-sm text-white/80">
              ({business.reviewCount || 0} recenzija)
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-5 py-5 pb-28 scroll-smooth">
        {/* Description */}
        {business.description && (
          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
            {business.description}
          </p>
        )}

        {/* Contact Info Card */}
        <Card className="p-4 mb-6">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Informacije
          </h2>
          <div className="space-y-3">
            {business.address && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-muted-foreground">{business.address}, {business.city}</span>
              </div>
            )}
            {business.phone && (
              <a href={`tel:${business.phone}`} className="flex items-center gap-3 text-sm group">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Phone className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-muted-foreground group-hover:text-primary transition-colors">{business.phone}</span>
              </a>
            )}
            {business.email && (
              <a href={`mailto:${business.email}`} className="flex items-center gap-3 text-sm group">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Mail className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-muted-foreground group-hover:text-primary transition-colors">{business.email}</span>
              </a>
            )}
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-green-600 dark:text-green-400 font-medium">
                Otvoreno {business.openTime || "09:00"} - {business.closeTime || "18:00"}
              </span>
            </div>
          </div>
        </Card>

        {/* Services */}
        {services && services.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Usluge
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className="p-4 hover:border-primary/30 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-muted-foreground">
                      {service.duration} min
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {service.price} KM
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Recenzije ({reviews?.length || 0})
            </h2>
            {isAuthenticated && !showReviewForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReviewForm(true)}
                className="text-xs h-8"
                data-testid="button-write-review"
              >
                Napišite recenziju
              </Button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <Card className="p-4 mb-4" data-testid="review-form">
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Vaša ocjena</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none p-1 hover:scale-110 transition-transform"
                      data-testid={`star-${star}`}
                    >
                      <Star 
                        className={`w-7 h-7 transition-colors ${
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
                className="resize-none mb-4 text-sm"
                rows={3}
                data-testid="input-review-comment"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSubmitReview}
                  disabled={submitReviewMutation.isPending}
                  data-testid="button-submit-review"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  {submitReviewMutation.isPending ? "Šaljem..." : "Objavi recenziju"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReviewForm(false)}
                  data-testid="button-cancel-review"
                >
                  Odustani
                </Button>
              </div>
            </Card>
          )}

          {/* Reviews List */}
          {reviews && reviews.length > 0 ? (
            <div className="space-y-3">
              {reviews.map((review) => (
                <Card 
                  key={review.id}
                  className="p-4"
                  data-testid={`review-${review.id}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="text-sm bg-primary/10 text-primary font-semibold">
                        {(review.user?.firstName?.[0] || "K").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-foreground">
                          {review.user?.firstName || "Korisnik"}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= (review.rating || 0)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-muted-foreground/20"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                          {review.comment}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground/60">
                        {new Date(review.createdAt!).toLocaleDateString("sr-Latn", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground mb-1">Još nema recenzija</p>
              <p className="text-xs text-muted-foreground/60">Budite prvi koji će ostaviti recenziju</p>
            </Card>
          )}
        </div>
      </main>

      {/* Book Button - Fixed Bottom */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md px-5 py-4 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
        <Link href={`/book/${business.id}`}>
          <Button 
            className="w-full h-12 text-base font-semibold rounded-xl shadow-lg"
            data-testid="button-book"
          >
            Zakažite termin
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </Link>
      </footer>
    </MobileContainer>
  );
}
