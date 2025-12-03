import { db } from "./db";
import { categories, businesses, services } from "@shared/schema";

const defaultCategories = [
  {
    name: "Berber",
    nameEn: "Barber",
    slug: "barber",
    description: "Profesionalno šišanje",
    icon: "scissors",
    gradient: "gradient-barber",
    iconColor: "#F9FAFB",
    textColor: "#F9FAFB",
    subtextColor: "#E5E7EB",
  },
  {
    name: "Kafići",
    nameEn: "Cafes",
    slug: "cafes",
    description: "Rezervišite stolove",
    icon: "coffee",
    gradient: "gradient-cafe",
    iconColor: "#57534E",
    textColor: "#292524",
    subtextColor: "#57534E",
  },
  {
    name: "Ljepota",
    nameEn: "Beauty",
    slug: "beauty",
    description: "Saloni & spa",
    icon: "sparkles",
    gradient: "gradient-beauty",
    iconColor: "#7C3AED",
    textColor: "#5B21B6",
    subtextColor: "#6D28D9",
  },
  {
    name: "Wellness",
    nameEn: "Wellness",
    slug: "wellness",
    description: "Um i tijelo",
    icon: "activity",
    gradient: "gradient-wellness",
    iconColor: "#059669",
    textColor: "#047857",
    subtextColor: "#059669",
  },
  {
    name: "Sport",
    nameEn: "Sports",
    slug: "sports",
    description: "Tereni i treninzi",
    icon: "globe",
    gradient: "gradient-sports",
    iconColor: "#2563EB",
    textColor: "#1E40AF",
    subtextColor: "#2563EB",
  },
  {
    name: "Usluge",
    nameEn: "Services",
    slug: "services",
    description: "Kućne popravke",
    icon: "wrench",
    gradient: "gradient-services",
    iconColor: "#CA8A04",
    textColor: "#854D0E",
    subtextColor: "#A16207",
  },
];

const sampleBusinesses = [
  {
    name: "Classic Cuts",
    description: "Tradicionalna berbernica sa modernim stilom. Nudimo sve vrste frizura i njege brade.",
    address: "Ulica Maršala Tita 15",
    city: "Sarajevo",
    phone: "+387 33 123 456",
    email: "info@classiccuts.ba",
    rating: "4.8",
    reviewCount: 234,
    distance: "2.3 km",
    isSponsored: true,
    openTime: "09:00",
    closeTime: "20:00",
    slotDuration: 30,
    categorySlug: "barber",
  },
  {
    name: "The Gentleman's Room",
    description: "Premium berber salon za moderne džentlmene. Luksuzno iskustvo.",
    address: "Ferhadija 28",
    city: "Sarajevo",
    phone: "+387 33 234 567",
    email: "hello@gentlemansroom.ba",
    rating: "4.9",
    reviewCount: 189,
    distance: "1.8 km",
    isSponsored: true,
    openTime: "08:00",
    closeTime: "21:00",
    slotDuration: 45,
    categorySlug: "barber",
  },
  {
    name: "Sharp Edges",
    description: "Moderni berber studio sa focus na precizno šišanje i fade stilove.",
    address: "Branilaca Sarajeva 12",
    city: "Sarajevo",
    phone: "+387 33 345 678",
    email: "sharp@edges.ba",
    rating: "4.7",
    reviewCount: 156,
    distance: "3.1 km",
    isSponsored: false,
    openTime: "10:00",
    closeTime: "19:00",
    slotDuration: 30,
    categorySlug: "barber",
  },
  {
    name: "Bella Vista Salon",
    description: "Salon ljepote sa kompletnim tretmanima za kosu, nokte i lice.",
    address: "Titova 5",
    city: "Sarajevo",
    phone: "+387 33 456 789",
    email: "info@bellavista.ba",
    rating: "4.6",
    reviewCount: 312,
    distance: "1.2 km",
    isSponsored: false,
    openTime: "09:00",
    closeTime: "20:00",
    slotDuration: 60,
    categorySlug: "beauty",
  },
  {
    name: "Zen Wellness Centar",
    description: "Opuštanje uma i tijela. Masaže, saune i wellness tretmani.",
    address: "Zmaja od Bosne 50",
    city: "Sarajevo",
    phone: "+387 33 567 890",
    email: "zen@wellness.ba",
    rating: "4.9",
    reviewCount: 278,
    distance: "2.5 km",
    isSponsored: true,
    openTime: "08:00",
    closeTime: "22:00",
    slotDuration: 60,
    categorySlug: "wellness",
  },
  {
    name: "Cafe Central",
    description: "Tradicionalna sarajevska kafana sa najboljom kafom u gradu.",
    address: "Baščaršija 1",
    city: "Sarajevo",
    phone: "+387 33 678 901",
    email: "cafe@central.ba",
    rating: "4.5",
    reviewCount: 456,
    distance: "0.8 km",
    isSponsored: false,
    openTime: "07:00",
    closeTime: "23:00",
    slotDuration: 30,
    categorySlug: "cafes",
  },
  {
    name: "Sport Arena",
    description: "Sportski kompleks sa terenima za fudbal, košarku i tenis.",
    address: "Olimpijska 1",
    city: "Sarajevo",
    phone: "+387 33 789 012",
    email: "arena@sport.ba",
    rating: "4.7",
    reviewCount: 198,
    distance: "4.2 km",
    isSponsored: false,
    openTime: "06:00",
    closeTime: "23:00",
    slotDuration: 60,
    categorySlug: "sports",
  },
];

const sampleServices = [
  // Barber services
  { name: "Muško šišanje", description: "Klasično muško šišanje", price: "15.00", duration: 30, businessName: "Classic Cuts" },
  { name: "Brada trimanje", description: "Oblikovanje i trimanje brade", price: "10.00", duration: 20, businessName: "Classic Cuts" },
  { name: "Šišanje + Brada", description: "Kompletna usluga", price: "22.00", duration: 45, businessName: "Classic Cuts" },
  { name: "Premium šišanje", description: "Luksuzno iskustvo sa masažom", price: "35.00", duration: 45, businessName: "The Gentleman's Room" },
  { name: "Fade šišanje", description: "Moderni fade stilovi", price: "20.00", duration: 40, businessName: "Sharp Edges" },
  
  // Beauty services
  { name: "Žensko šišanje", description: "Šišanje i oblikovanje", price: "25.00", duration: 45, businessName: "Bella Vista Salon" },
  { name: "Manikir", description: "Klasični manikir", price: "15.00", duration: 30, businessName: "Bella Vista Salon" },
  { name: "Pedikir", description: "Klasični pedikir", price: "20.00", duration: 45, businessName: "Bella Vista Salon" },
  
  // Wellness services
  { name: "Relax masaža", description: "60 minuta opuštajuće masaže", price: "50.00", duration: 60, businessName: "Zen Wellness Centar" },
  { name: "Sauna sesija", description: "Pristup sauni", price: "20.00", duration: 60, businessName: "Zen Wellness Centar" },
  
  // Cafe services
  { name: "Rezervacija stola (2 osobe)", description: "Sto za 2 osobe", price: "0.00", duration: 60, businessName: "Cafe Central" },
  { name: "Rezervacija stola (4 osobe)", description: "Sto za 4 osobe", price: "0.00", duration: 90, businessName: "Cafe Central" },
  
  // Sports services
  { name: "Fudbalski teren (1h)", description: "Rezervacija terena za mali fudbal", price: "60.00", duration: 60, businessName: "Sport Arena" },
  { name: "Teniski teren (1h)", description: "Rezervacija teniskog terena", price: "30.00", duration: 60, businessName: "Sport Arena" },
];

export async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Check if categories exist
    const existingCategories = await db.select().from(categories);
    if (existingCategories.length === 0) {
      console.log("Inserting categories...");
      await db.insert(categories).values(defaultCategories);
    }

    // Get category IDs
    const allCategories = await db.select().from(categories);
    const categoryMap = new Map(allCategories.map(c => [c.slug, c.id]));

    // Check if businesses exist
    const existingBusinesses = await db.select().from(businesses);
    if (existingBusinesses.length === 0) {
      console.log("Inserting businesses...");
      const businessData = sampleBusinesses.map(b => ({
        name: b.name,
        description: b.description,
        address: b.address,
        city: b.city,
        phone: b.phone,
        email: b.email,
        rating: b.rating,
        reviewCount: b.reviewCount,
        distance: b.distance,
        isSponsored: b.isSponsored,
        openTime: b.openTime,
        closeTime: b.closeTime,
        slotDuration: b.slotDuration,
        categoryId: categoryMap.get(b.categorySlug)!,
        isActive: true,
      }));
      await db.insert(businesses).values(businessData);
    }

    // Get business IDs
    const allBusinesses = await db.select().from(businesses);
    const businessMap = new Map(allBusinesses.map(b => [b.name, b.id]));

    // Check if services exist
    const existingServices = await db.select().from(services);
    if (existingServices.length === 0) {
      console.log("Inserting services...");
      const serviceData = sampleServices.map(s => ({
        name: s.name,
        description: s.description,
        price: s.price,
        duration: s.duration,
        businessId: businessMap.get(s.businessName)!,
        isActive: true,
      }));
      await db.insert(services).values(serviceData);
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
