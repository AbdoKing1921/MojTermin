import { Button } from "@/components/ui/button";
import { Calendar, Clock, Shield, CheckCircle, ArrowRight, Scissors, Sparkles, Coffee } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";

export default function Landing() {
  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 text-center">
          {/* Logo */}
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mb-5">
            <Calendar className="w-7 h-7 text-primary-foreground" />
          </div>
          
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2" data-testid="text-app-title">
            MojTermin
          </h1>
          <p className="text-muted-foreground text-sm mb-8 max-w-xs leading-relaxed" data-testid="text-tagline">
            Profesionalna platforma za zakazivanje termina. Brzo, pouzdano i jednostavno.
          </p>

          {/* Feature List */}
          <div className="w-full max-w-xs space-y-3 mb-8">
            <div className="flex items-center gap-3 text-left p-3 bg-secondary/50 rounded-lg">
              <Clock className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Rezervišite u sekundi</p>
                <p className="text-xs text-muted-foreground">Bez čekanja i poziva</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left p-3 bg-secondary/50 rounded-lg">
              <Shield className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Sigurna platforma</p>
                <p className="text-xs text-muted-foreground">Vaši podaci su zaštićeni</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-left p-3 bg-secondary/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Potvrda rezervacije</p>
                <p className="text-xs text-muted-foreground">SMS i email obavještenja</p>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <a href="/api/login" className="w-full max-w-xs">
            <Button 
              className="w-full h-12 text-sm font-semibold rounded-lg gap-2"
              data-testid="button-get-started"
            >
              Prijavite se
              <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
          
          <p className="text-xs text-muted-foreground mt-3">
            Besplatna registracija · Google, GitHub ili email
          </p>
        </div>

        {/* Bottom Categories */}
        <div className="px-6 pb-6 pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground text-center mb-3">
            Više od 100+ biznisa
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-barber flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div className="w-10 h-10 rounded-lg gradient-beauty flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="w-10 h-10 rounded-lg gradient-cafe flex items-center justify-center">
              <Coffee className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}
