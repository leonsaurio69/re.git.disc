import { MapPin, Shield, Clock, Star } from "lucide-react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { TourCard } from "@/components/TourCard";
import { GuideCard } from "@/components/GuideCard";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import heroImage from "@assets/generated_images/caribbean_mexico_beach_paradise.png";
import machuPicchu from "@assets/generated_images/machu_picchu_dramatic_sunrise.png";
import beach from "@assets/generated_images/caribbean_mexico_beach_paradise.png";
import rome from "@assets/generated_images/rome_colosseum_golden_hour.png";
import maleGuide from "@assets/generated_images/latino_male_tour_guide_portrait.png";
import femaleGuide from "@assets/generated_images/latina_female_tour_guide_portrait.png";

// todo: remove mock functionality
const featuredTours = [
  {
    id: "t1",
    title: "Aventura Épica en Machu Picchu - Camino del Inca",
    location: "Cusco, Perú",
    price: 299,
    duration: "4 días",
    maxGroupSize: 12,
    rating: 4.9,
    reviewCount: 128,
    imageUrl: machuPicchu,
    guideAvatarUrl: maleGuide,
    guideName: "Carlos Mendoza",
    featured: true,
  },
  {
    id: "t2",
    title: "Paraíso Tropical - Snorkel y Playa Privada",
    location: "Cancún, México",
    price: 99,
    duration: "6 horas",
    maxGroupSize: 8,
    rating: 4.8,
    reviewCount: 85,
    imageUrl: beach,
    guideAvatarUrl: femaleGuide,
    guideName: "María González",
    featured: true,
  },
  {
    id: "t3",
    title: "Roma Imperial - Tour Histórico Completo",
    location: "Roma, Italia",
    price: 149,
    duration: "8 horas",
    maxGroupSize: 15,
    rating: 4.7,
    reviewCount: 203,
    imageUrl: rome,
    guideAvatarUrl: maleGuide,
    guideName: "Marco Rossi",
    featured: false,
  },
];

// todo: remove mock functionality
const featuredGuides = [
  {
    id: "g1",
    name: "Carlos Mendoza",
    location: "Cusco, Perú",
    avatarUrl: maleGuide,
    rating: 4.9,
    reviewCount: 128,
    tourCount: 8,
    specialties: ["Aventura", "Trekking", "Historia Inca"],
    verified: true,
  },
  {
    id: "g2",
    name: "María González",
    location: "Cancún, México",
    avatarUrl: femaleGuide,
    rating: 4.8,
    reviewCount: 85,
    tourCount: 12,
    specialties: ["Playa", "Snorkel", "Cultura Maya"],
    verified: true,
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Guías Verificados",
    description: "Todos nuestros guías pasan por un proceso de verificación riguroso",
  },
  {
    icon: Clock,
    title: "Flexibilidad Total",
    description: "Cancela gratis hasta 24 horas antes del tour",
  },
  {
    icon: Star,
    title: "Experiencias Únicas",
    description: "Accede a experiencias exclusivas creadas por locales",
  },
  {
    icon: MapPin,
    title: "Destinos Increíbles",
    description: "Explora los lugares más asombrosos del mundo",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        <HeroSection backgroundImage={heroImage} />

        <section className="py-16" data-testid="section-featured-tours">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-3xl font-bold">Tours Destacados</h2>
                <p className="mt-2 text-muted-foreground">
                  Las experiencias más populares elegidas por viajeros
                </p>
              </div>
              <Link href="/tours">
                <Button variant="outline" data-testid="link-view-all-tours">
                  Ver todos los tours
                </Button>
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredTours.map((tour) => (
                <TourCard key={tour.id} {...tour} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted/50 py-16" data-testid="section-benefits">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold">¿Por qué elegirnos?</h2>
              <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
                TourExplora te conecta con guías locales expertos para vivir experiencias auténticas
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => (
                <Card key={benefit.title}>
                  <CardContent className="p-6 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 font-semibold">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16" data-testid="section-featured-guides">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-3xl font-bold">Guías Destacados</h2>
                <p className="mt-2 text-muted-foreground">
                  Conoce a nuestros guías locales mejor calificados
                </p>
              </div>
              <Link href="/guides">
                <Button variant="outline" data-testid="link-view-all-guides">
                  Ver todos los guías
                </Button>
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {featuredGuides.map((guide) => (
                <GuideCard key={guide.id} {...guide} />
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary py-16 text-primary-foreground" data-testid="section-become-guide">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold">¿Eres guía turístico?</h2>
            <p className="mb-8 text-lg opacity-90">
              Únete a nuestra comunidad de guías y comparte tu pasión con viajeros de todo el mundo. 
              Crea tus propios tours y genera ingresos haciendo lo que amas.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" data-testid="button-become-guide">
                Conviértete en Guía
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
