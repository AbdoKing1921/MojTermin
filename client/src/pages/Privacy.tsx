import { ArrowLeft, Calendar } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Privacy() {
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
        <h1 className="text-3xl font-bold tracking-tight mb-8">Politika privatnosti</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-muted-foreground">
            Posljednje ažuriranje: Decembar 2024.
          </p>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Uvod</h2>
            <p className="text-muted-foreground leading-relaxed">
              MojTermin ("mi", "nas", "naš") posvećen je zaštiti vaše privatnosti. Ova Politika 
              privatnosti objašnjava kako prikupljamo, koristimo, čuvamo i štitimo vaše lične podatke 
              kada koristite našu platformu.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">2. Podaci koje prikupljamo</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Prikupljamo sljedeće vrste podataka:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Identifikacioni podaci:</strong> ime, prezime, email adresa</li>
              <li><strong>Kontakt podaci:</strong> broj telefona (opciono)</li>
              <li><strong>Podaci o rezervacijama:</strong> historija rezervacija, preferencije</li>
              <li><strong>Tehnički podaci:</strong> IP adresa, tip uređaja, verzija preglednika</li>
              <li><strong>Podaci o korištenju:</strong> kako koristite platformu</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">3. Kako koristimo vaše podatke</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Vaše podatke koristimo za:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Pružanje i održavanje naše Usluge</li>
              <li>Upravljanje vašim korisničkim računom</li>
              <li>Obradu i potvrdu rezervacija</li>
              <li>Slanje obavještenja i podsjetnika</li>
              <li>Poboljšanje naše platforme i korisničkog iskustva</li>
              <li>Komunikaciju s vama u vezi s podrškom</li>
              <li>Zaštitu od prevara i zloupotrebe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">4. Dijeljenje podataka</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Vaše podatke dijelimo sa:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Pružaocima usluga:</strong> biznisi kod kojih rezervišete termine dobijaju 
                potrebne informacije za pružanje usluge</li>
              <li><strong>Tehničkim partnerima:</strong> provajderi usluga koji nam pomažu u radu 
                platforme (npr. hosting, email servisi)</li>
              <li><strong>Zakonski zahtjevi:</strong> kada smo obavezni po zakonu</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Nikada ne prodajemo vaše lične podatke trećim stranama.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">5. Sigurnost podataka</h2>
            <p className="text-muted-foreground leading-relaxed">
              Koristimo industrijski standardne mjere zaštite uključujući:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>SSL/TLS enkripciju za prijenos podataka</li>
              <li>Šifrirano čuvanje osjetljivih podataka</li>
              <li>Redovne sigurnosne provjere</li>
              <li>Ograničen pristup podacima samo ovlaštenim osobama</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">6. Vaša prava (GDPR)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Imate pravo na:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Pristup:</strong> zatražiti kopiju vaših podataka</li>
              <li><strong>Ispravku:</strong> zatražiti ispravak netačnih podataka</li>
              <li><strong>Brisanje:</strong> zatražiti brisanje vaših podataka</li>
              <li><strong>Ograničenje obrade:</strong> ograničiti kako koristimo vaše podatke</li>
              <li><strong>Prenosivost:</strong> dobiti vaše podatke u strukturiranom formatu</li>
              <li><strong>Prigovor:</strong> uložiti prigovor na određene vrste obrade</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Za ostvarivanje ovih prava, kontaktirajte nas na: privacy@mojtermin.ba
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">7. Kolačići (Cookies)</h2>
            <p className="text-muted-foreground leading-relaxed">
              Koristimo kolačiće za:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li><strong>Neophodni kolačići:</strong> omogućavaju osnovne funkcije platforme</li>
              <li><strong>Analitički kolačići:</strong> pomažu nam razumjeti kako koristite platformu</li>
              <li><strong>Funkcionalni kolačići:</strong> pamte vaše preferencije</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Možete upravljati kolačićima putem postavki vašeg preglednika.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Čuvanje podataka</h2>
            <p className="text-muted-foreground leading-relaxed">
              Vaše podatke čuvamo onoliko dugo koliko je potrebno za pružanje Usluge ili dok 
              ne zatražite brisanje. Nakon brisanja računa, vaši podaci će biti trajno uklonjeni 
              u roku od 30 dana, osim ako zakon zahtijeva duže čuvanje.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">9. Djeca</h2>
            <p className="text-muted-foreground leading-relaxed">
              Naša Usluga nije namijenjena osobama mlađim od 18 godina. Ne prikupljamo svjesno 
              podatke od maloljetnika. Ako otkrijemo da smo prikupili podatke od maloljetnika, 
              odmah ćemo ih obrisati.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">10. Izmjene politike</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ova Politika privatnosti može biti povremeno ažurirana. O značajnim promjenama 
              ćemo vas obavijestiti putem email-a ili obavještenja na platformi. Preporučujemo 
              da povremeno pregledate ovu stranicu.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mt-8 mb-4">11. Kontakt</h2>
            <p className="text-muted-foreground leading-relaxed">
              Za sva pitanja u vezi s ovom Politikom privatnosti ili zaštitom podataka, 
              kontaktirajte nas na:
            </p>
            <ul className="list-none mt-4 space-y-1 text-muted-foreground">
              <li>Email: privacy@mojtermin.ba</li>
              <li>Adresa: Sarajevo, Bosna i Hercegovina</li>
            </ul>
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
