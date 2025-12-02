import { Button } from "@/components/ui/button";
import { Calendar, Clock, Star, ArrowRight, Sparkles, Scissors, Coffee } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";

export default function Landing() {
  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
          {/* Logo / Icon */}
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center mb-6 soft-shadow-lg">
            <Calendar className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-3" data-testid="text-app-title">
            MojTermin
          </h1>
          <p className="text-muted-foreground text-base mb-8 max-w-xs" data-testid="text-tagline">
            Zakažite bilo šta, bilo kada. Vaš omiljeni salon, kafić ili termin na dohvat ruke.
          </p>

          {/* Feature Icons */}
          <div className="flex items-center justify-center gap-6 mb-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Brzo</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Pouzdano</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Jednostavno</span>
            </div>
          </div>

          {/* Login Button */}
          <a href="/api/login" className="w-full max-w-xs">
            <Button 
              className="w-full py-6 text-base font-bold rounded-2xl gap-2"
              data-testid="button-get-started"
            >
              Započni besplatno
              <ArrowRight className="w-5 h-5" />
            </Button>
          </a>
          
          <p className="text-xs text-muted-foreground mt-4">
            Prijavite se putem Google, GitHub ili email-a
          </p>
        </div>

        {/* Bottom Categories Preview */}
        <div className="px-6 pb-8">
          <p className="text-sm font-medium text-muted-foreground text-center mb-4">
            Popularne kategorije
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-barber flex items-center justify-center soft-shadow">
              <Scissors className="w-7 h-7 text-gray-100" />
            </div>
            <div className="w-14 h-14 rounded-2xl gradient-beauty flex items-center justify-center soft-shadow">
              <Sparkles className="w-7 h-7 text-purple-600" />
            </div>
            <div className="w-14 h-14 rounded-2xl gradient-cafe flex items-center justify-center soft-shadow">
              <Coffee className="w-7 h-7 text-stone-600" />
            </div>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
