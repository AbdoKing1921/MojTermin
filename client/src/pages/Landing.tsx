import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Clock, Shield, CheckCircle, ArrowRight, Scissors, Sparkles, Coffee, 
  Users, BarChart3, Bell, Star, MessageSquare, Phone, Mail, MapPin,
  Smartphone, Building2, Zap, Globe, Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Poruka poslana!",
      description: "Javićemo vam se uskoro.",
    });
    setContactForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold tracking-tight">MojTermin</span>
            </div>
            <div className="flex items-center gap-3">
              <a href="#cjenovnik" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block" data-testid="link-pricing">
                Cjenovnik
              </a>
              <a href="#kontakt" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block" data-testid="link-contact">
                Kontakt
              </a>
              <a href="/api/login" data-testid="link-login-nav">
                <Button size="sm" className="gap-1.5" data-testid="button-login-nav">
                  Prijava
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="secondary" className="mb-4 px-3 py-1">
              <Zap className="w-3 h-3 mr-1" />
              Već 100+ salona koristi MojTermin
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4 animate-fade-in">
              Zakazivanje termina
              <span className="gradient-text block sm:inline"> jednostavno i brzo</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              Profesionalna platforma koja povezuje klijente sa salonima, frizerima, wellness centrima i svim uslužnim djelatnostima. 
              Bez poziva, bez čekanja.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="/api/login" data-testid="link-hero-cta">
                <Button size="lg" className="w-full sm:w-auto gap-2 h-12 px-8" data-testid="button-hero-cta">
                  Počnite besplatno
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <a href="#kako-radi" data-testid="link-how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8" data-testid="button-how-it-works">
                  Kako radi?
                </Button>
              </a>
            </div>
          </div>

          {/* Category Icons */}
          <div className="flex items-center justify-center gap-4 mt-12">
            <div className="w-12 h-12 rounded-xl gradient-barber flex items-center justify-center shadow-lg">
              <Scissors className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 rounded-xl gradient-beauty flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 rounded-xl gradient-wellness flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 rounded-xl gradient-cafe flex items-center justify-center shadow-lg">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div className="w-12 h-12 rounded-xl gradient-sports flex items-center justify-center shadow-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* What is MojTermin */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Šta je MojTermin?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Univerzalna platforma za online zakazivanje termina koja pomaže i klijentima i vlasnicima biznisa
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Za klijente</CardTitle>
                <CardDescription>
                  Pronađite i zakažite termin u omiljenom salonu za samo par klikova
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Pregled slobodnih termina u realnom vremenu
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    SMS i email podsjetnici
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Historija rezervacija
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Recenzije i ocjene
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Za vlasnike biznisa</CardTitle>
                <CardDescription>
                  Profesionalni sistem za upravljanje terminima i klijentima
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Upravljanje zaposlenima i uslugama
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Fleksibilno radno vrijeme i pauze
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Analitika i izvještaji
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Automatske notifikacije
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="kako-radi" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Kako radi?
            </h2>
            <p className="text-muted-foreground">
              Tri jednostavna koraka do vašeg termina
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Pronađite salon</h3>
              <p className="text-sm text-muted-foreground">
                Pretražite salone po kategoriji, lokaciji ili imenu. Pogledajte recenzije i usluge.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Odaberite termin</h3>
              <p className="text-sm text-muted-foreground">
                Izaberite uslugu, datum i slobodan termin koji vam odgovara. Odaberite željenog frizera.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Potvrdite rezervaciju</h3>
              <p className="text-sm text-muted-foreground">
                Primite potvrdu putem SMS-a i email-a. Podsjetnik dan prije termina.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Businesses */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Benefiti za vaš biznis
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sve što vam treba za efikasno upravljanje terminima i rastom biznisa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <Clock className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Ušteda vremena</h3>
                <p className="text-sm text-muted-foreground">
                  Automatizujte zakazivanje i smanjite broj propuštenih poziva. 
                  Klijenti sami biraju termine 24/7.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <BarChart3 className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Analitika i uvidi</h3>
                <p className="text-sm text-muted-foreground">
                  Pratite broj rezervacija, najpopularnije usluge i prihod. 
                  Donosite odluke na osnovu podataka.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Bell className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Automatske notifikacije</h3>
                <p className="text-sm text-muted-foreground">
                  SMS i email podsjetnici smanjuju broj propuštenih termina. 
                  Klijenti uvijek stignu na vrijeme.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Users className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Upravljanje timom</h3>
                <p className="text-sm text-muted-foreground">
                  Dodajte zaposlene, dodijelite usluge i upravljajte radnim vremenom 
                  svakog člana tima posebno.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Star className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Recenzije i reputacija</h3>
                <p className="text-sm text-muted-foreground">
                  Gradite povjerenje kroz pozitivne recenzije. Odgovarajte na 
                  povratne informacije klijenata.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Shield className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Sigurnost podataka</h3>
                <p className="text-sm text-muted-foreground">
                  Vaši podaci i podaci klijenata su zaštićeni najnovijim 
                  sigurnosnim standardima.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="cjenovnik" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Cjenovnik
            </h2>
            <p className="text-muted-foreground">
              Odaberite plan koji odgovara vašem biznisu
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-xl">Basic</CardTitle>
                <CardDescription>Za male salone</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">Besplatno</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Do 50 rezervacija mjesečno
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    1 zaposleni
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Osnovne notifikacije
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Email podrška
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6" data-testid="button-plan-basic">
                  Počnite besplatno
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-primary shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary">Najpopularniji</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Pro</CardTitle>
                <CardDescription>Za rastuće biznise</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">29 KM</span>
                  <span className="text-muted-foreground">/mjesečno</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Neograničene rezervacije
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Do 5 zaposlenih
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    SMS + email notifikacije
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Analitika i izvještaji
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Prioritetna podrška
                  </li>
                </ul>
                <Button className="w-full mt-6" data-testid="button-plan-pro">
                  Probajte 14 dana besplatno
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-xl">Enterprise</CardTitle>
                <CardDescription>Za veće organizacije</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">79 KM</span>
                  <span className="text-muted-foreground">/mjesečno</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Sve iz Pro plana
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Neograničen broj zaposlenih
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Više lokacija
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    API pristup
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    Dedicirani account manager
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6" data-testid="button-plan-enterprise">
                  Kontaktirajte nas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="kontakt" className="py-16 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                Kontaktirajte nas
              </h2>
              <p className="text-muted-foreground mb-8">
                Imate pitanja? Želite demo? Javite nam se i odgovorićemo u roku od 24 sata.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">info@mojtermin.ba</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Telefon</p>
                    <p className="text-sm text-muted-foreground">+387 33 123 456</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Adresa</p>
                    <p className="text-sm text-muted-foreground">Sarajevo, Bosna i Hercegovina</p>
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Ime i prezime</label>
                    <Input 
                      placeholder="Vaše ime" 
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      required
                      data-testid="input-contact-name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email adresa</label>
                    <Input 
                      type="email" 
                      placeholder="vas@email.com" 
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      required
                      data-testid="input-contact-email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Poruka</label>
                    <Textarea 
                      placeholder="Kako vam možemo pomoći?" 
                      className="min-h-[120px]"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      required
                      data-testid="input-contact-message"
                    />
                  </div>
                  <Button type="submit" className="w-full" data-testid="button-send-message">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Pošaljite poruku
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Spremni za početak?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Pridružite se stotinama zadovoljnih salona koji već koriste MojTermin za upravljanje terminima.
          </p>
          <a href="/api/login" data-testid="link-cta-register">
            <Button size="lg" variant="secondary" className="gap-2" data-testid="button-cta-register">
              Registrujte se besplatno
              <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Calendar className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold">MojTermin</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/terms" className="hover:text-foreground transition-colors" data-testid="link-terms">Uslovi korištenja</a>
              <a href="/privacy" className="hover:text-foreground transition-colors" data-testid="link-privacy">Privatnost</a>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 MojTermin. Sva prava zadržana.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
