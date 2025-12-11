import { MapPin, Shield, Clock, Star, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { TourCard } from "@/components/TourCard";
import { GuideCard } from "@/components/GuideCard";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toursApi, guidesApi } from "@/lib/api";

import heroImage from "@assets/generated_images/caribbean_mexico_beach_paradise.png";
import defaultTourImage from "@assets/generated_images/machu_picchu_dramatic_sunrise.png";
import defaultGuideImage from "@assets/generated_images/latino_male_tour_guide_portrait.png";

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
  const { data: featuredTours, isLoading: toursLoading } = useQuery({
    queryKey: ["/api/tours/featured"],
    queryFn: () => toursApi.getFeatured(6),
  });

  const { data: guides, isLoading: guidesLoading } = useQuery({
    queryKey: ["/api/guides"],
    queryFn: () => guidesApi.getAll(),
  });

  const displayTours = featuredTours?.map((tour: any) => ({
    id: tour.id,
    title: tour.title,
    location: tour.location,
    price: tour.price,
    duration: tour.duration,
    maxGroupSize: tour.maxGroupSize || 10,
    rating: tour.rating || 4.8,
    reviewCount: tour.reviewCount || 0,
    imageUrl: tour.imageUrl || defaultTourImage,
    guideAvatarUrl: tour.guide?.avatarUrl || defaultGuideImage,
    guideName: tour.guide?.name || "Guía Experto",
    featured: tour.featured,
  })) || [];

  const displayGuides = guides?.slice(0, 4).map((guide: any) => ({
    id: guide.id,
    name: guide.name,
    location: guide.location || "Guía Verificado",
    avatarUrl: guide.avatarUrl || defaultGuideImage,
    rating: guide.rating || 4.8,
    reviewCount: guide.reviewCount || 0,
    tourCount: guide.tourCount || 0,
    specialties: ["Aventura", "Cultura"],
    verified: guide.verified || false,
  })) || [];

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
            {toursLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : displayTours.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayTours.map((tour: any) => (
                  <TourCard key={tour.id} {...tour} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No hay tours disponibles aún. ¡Sé el primero en crear uno!
                  </p>
                  <Link href="/register">
                    <Button className="mt-4">Registrarse como Guía</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
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
            {guidesLoading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : displayGuides.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {displayGuides.map((guide: any) => (
                  <GuideCard key={guide.id} {...guide} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-muted-foreground">
                    ¡Únete como guía y comparte tus experiencias!
                  </p>
                </CardContent>
              </Card>
            )}
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
