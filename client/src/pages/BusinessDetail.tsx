import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Star, MapPin, Clock, Phone, Mail, MessageSquare, Send, ChevronRight, Sparkles, Calendar, Heart, CheckCircle, Navigation } from "lucide-react";
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
  
  const isCurrentlyOpen = () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const openTime = business.openTime || "09:00";
    const closeTime = business.closeTime || "18:00";
    return currentTime >= openTime && currentTime < closeTime;
  };
  
  const isOpen = isCurrentlyOpen();

  return (
    <MobileContainer>
      {/* Hero Image with Gradient Overlay */}
      <div className={`relative h-64 ${gradientClass}`}>
        {business.imageUrl ? (
          <img 
            src={business.imageUrl} 
            alt={business.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10" />
            <div className="absolute top-1/4 -left-12 w-24 h-24 rounded-full bg-white/5" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute bottom-1/3 -right-8 w-20 h-20 rounded-full bg-white/8" />
            <div className="w-28 h-28 rounded-3xl bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-2xl relative z-10 border border-white/20">
              <span className="text-white text-5xl font-bold drop-shadow-lg">
                {business.name.charAt(0)}
              </span>
            </div>
          </div>
        )}
        
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        
        {/* Back Button */}
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 left-4 w-11 h-11 rounded-xl bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg"
            data-testid="button-back"
            aria-label="Nazad"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
        </Link>

        {/* Top Right Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
          {business.isSponsored && (
            <Badge className="bg-amber-400 text-amber-900 border-0 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Top izbor
            </Badge>
          )}
          <Badge 
            className={`${isOpen ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'} border-0 shadow-lg`}
            data-testid="badge-status"
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            {isOpen ? 'Otvoreno' : 'Zatvoreno'}
          </Badge>
        </div>

        {/* Business Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg" data-testid="text-business-name">
            {business.name}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-white">
                {business.rating || "0.0"}
              </span>
            </div>
            <span className="text-sm text-white/90">
              {business.reviewCount || 0} recenzija
            </span>
            {business.city && (
              <div className="flex items-center gap-1 text-white/80">
                <Navigation className="w-3.5 h-3.5" />
                <span className="text-sm">{business.city}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-5 py-6 pb-32 scroll-smooth">
        {/* Description */}
        {business.description && (
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            {business.description}
          </p>
        )}

        {/* Contact Info Card */}
        <Card className="p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Informacije</h2>
          </div>
          <div className="space-y-4">
            {business.address && (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Adresa</p>
                  <p className="text-sm font-medium text-foreground">{business.address}, {business.city}</p>
                </div>
              </div>
            )}
            {business.phone && (
              <a href={`tel:${business.phone}`} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Telefon</p>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{business.phone}</p>
                </div>
              </a>
            )}
            {business.email && (
              <a href={`mailto:${business.email}`} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{business.email}</p>
                </div>
              </a>
            )}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Radno vrijeme</p>
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {business.openTime || "09:00"} - {business.closeTime || "18:00"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Services */}
        {services && services.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-500" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Usluge</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {services.map((service, idx) => (
                <Card
                  key={service.id}
                  className="p-4 hover:border-primary/30 hover:shadow-md transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Heart className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center mt-auto">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {service.duration} min
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-amber-500" />
              </div>
              <h2 className="text-base font-semibold text-foreground">
                Recenzije ({reviews?.length || 0})
              </h2>
            </div>
            {isAuthenticated && !showReviewForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReviewForm(true)}
                className="h-9 rounded-xl"
                data-testid="button-write-review"
              >
                Napišite
              </Button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <Card className="p-5 mb-4 shadow-sm" data-testid="review-form">
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-3">Vaša ocjena</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none p-1.5 hover:scale-110 transition-transform rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10"
                      data-testid={`star-${star}`}
                    >
                      <Star 
                        className={`w-8 h-8 transition-colors ${
                          star <= rating 
                            ? "fill-amber-400 text-amber-400 drop-shadow-sm" 
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
                className="resize-none mb-4 text-sm rounded-xl"
                rows={3}
                data-testid="input-review-comment"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitReviewMutation.isPending}
                  className="rounded-xl"
                  data-testid="button-submit-review"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitReviewMutation.isPending ? "Šaljem..." : "Objavi recenziju"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowReviewForm(false)}
                  className="rounded-xl"
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
                  className="p-4 shadow-sm"
                  data-testid={`review-${review.id}`}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-11 h-11 ring-2 ring-primary/10">
                      <AvatarFallback className="text-sm bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold">
                        {(review.user?.firstName?.[0] || "K").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-foreground">
                          {review.user?.firstName || "Korisnik"}
                        </span>
                        <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md">
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
                      <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
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
            <Card className="p-8 text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-7 h-7 text-muted-foreground/40" />
              </div>
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
            className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            data-testid="button-book"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Zakažite termin
            <ChevronRight className="w-5 h-5 ml-1" />
          </Button>
        </Link>
      </footer>
    </MobileContainer>
  );
}
