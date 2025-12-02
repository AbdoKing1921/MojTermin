import { Link } from "wouter";
import { Home, ArrowLeft } from "lucide-react";
import { MobileContainer } from "@/components/MobileContainer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <MobileContainer>
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
        <div className="w-20 h-20 rounded-3xl bg-secondary flex items-center justify-center mb-6">
          <span className="text-4xl font-bold text-muted-foreground">404</span>
        </div>
        
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Stranica nije pronađena
        </h1>
        <p className="text-muted-foreground text-base mb-8 max-w-xs">
          Stranica koju tražite ne postoji ili je premještena.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/">
            <Button className="w-full gap-2" data-testid="button-go-home">
              <Home className="w-5 h-5" />
              Nazad na početnu
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="w-full gap-2"
            onClick={() => window.history.back()}
            data-testid="button-go-back"
          >
            <ArrowLeft className="w-5 h-5" />
            Nazad
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
}
