import { ArrowLeft, Calendar } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" data-testid="link-back-home">
              <Button variant="ghost" size="icon" className="mr-3" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">MojTermin</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Uslovi korištenja</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Posljednje ažuriranje: Decembar 2024.
          </p>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Prihvatanje uslova</h2>
            <p className="text-muted-foreground leading-relaxed">
              Korištenjem MojTermin platforme ("Usluga"), prihvatate ove Uslove korištenja. 
              Ako se ne slažete s bilo kojim dijelom uslova, molimo vas da ne koristite Uslugu.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Opis usluge</h2>
            <p className="text-muted-foreground leading-relaxed">
              MojTermin je online platforma za zakazivanje termina koja omogućava korisnicima 
              da pronalaze i rezervišu termine kod različitih pružaoca usluga (saloni, frizeri, 
              wellness centri, itd.). Vlasnicima biznisa pružamo alate za upravljanje terminima, 
              zaposlenima i klijentima.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">3. Registracija i korisnički račun</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Morate imati najmanje 18 godina da biste koristili Uslugu.</li>
              <li>Odgovorni ste za održavanje sigurnosti vašeg računa.</li>
              <li>Morate pružiti tačne i potpune informacije prilikom registracije.</li>
              <li>Zabranjeno je dijeljenje pristupnih podataka s trećim stranama.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Pravila korištenja</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Korisnici se obavezuju da neće:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Koristiti Uslugu za nezakonite aktivnosti</li>
              <li>Lažno se predstavljati kao druga osoba ili entitet</li>
              <li>Slati spam ili neželjene poruke</li>
              <li>Pokušavati pristupiti tuđim računima</li>
              <li>Ometati rad platforme na bilo koji način</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Rezervacije i otkazivanje</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Rezervacije su obavezujuće i očekuje se da ih poštujete.</li>
              <li>Otkazivanje je moguće do 24 sata prije termina bez naplate.</li>
              <li>Višestruko propuštanje termina može rezultirati suspenzijom računa.</li>
              <li>Svaki biznis može imati dodatne uslove za otkazivanje.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Za vlasnike biznisa</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Odgovorni ste za tačnost informacija o vašem biznisu.</li>
              <li>Morate pružati usluge kao što je navedeno na platformi.</li>
              <li>Obavezni ste poštovati sve lokalne zakone i propise.</li>
              <li>MojTermin zadržava pravo uklanjanja biznisa koji krše ove uslove.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Intelektualno vlasništvo</h2>
            <p className="text-muted-foreground leading-relaxed">
              Svi sadržaji na platformi (logo, dizajn, tekstovi, softver) su vlasništvo 
              MojTermin-a i zaštićeni su zakonima o intelektualnom vlasništvu. Neovlašteno 
              kopiranje ili distribucija je zabranjena.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Ograničenje odgovornosti</h2>
            <p className="text-muted-foreground leading-relaxed">
              MojTermin nije odgovoran za kvalitet usluga koje pružaju biznisi na platformi. 
              Svi sporovi između korisnika i pružaoca usluga rješavaju se direktno među stranama. 
              Platforma služi isključivo kao posrednik u zakazivanju termina.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">9. Izmjene uslova</h2>
            <p className="text-muted-foreground leading-relaxed">
              Zadržavamo pravo izmjene ovih Uslova u bilo kom trenutku. O značajnim 
              promjenama ćemo vas obavijestiti putem email-a ili obavještenja na platformi. 
              Nastavkom korištenja Usluge prihvatate izmijenjene uslove.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">10. Kontakt</h2>
            <p className="text-muted-foreground leading-relaxed">
              Za sva pitanja u vezi s ovim Uslovima korištenja, kontaktirajte nas na: 
              info@mojtermin.ba
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-border mt-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 MojTermin. Sva prava zadržana.
          </p>
        </div>
      </footer>
    </div>
  );
}
