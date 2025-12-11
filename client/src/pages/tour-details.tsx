import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Clock, Users, Star, Check, X, Calendar, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { BookingCard } from "@/components/BookingCard";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toursApi } from "@/lib/api";

import defaultTourImage from "@assets/generated_images/machu_picchu_dramatic_sunrise.png";
import defaultGuideImage from "@assets/generated_images/latino_male_tour_guide_portrait.png";

const defaultItinerary = [
  { day: 1, title: "Día 1", description: "Inicio del tour y orientación." },
  { day: 2, title: "Día 2", description: "Exploración de los principales sitios." },
];

const defaultIncludes = [
  "Guía profesional",
  "Transporte",
  "Entradas incluidas",
];

const defaultExcludes = [
  "Vuelos",
  "Seguro de viaje",
  "Propinas",
];

export default function TourDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: tour, isLoading, error } = useQuery({
    queryKey: ["/api/tours", id],
    queryFn: () => toursApi.getById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <MapPin className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-2 text-xl font-bold">Tour no encontrado</h2>
              <p className="mb-4 text-muted-foreground">
                El tour que buscas no existe o ha sido eliminado.
              </p>
              <Button onClick={() => setLocation("/tours")}>
                Ver todos los tours
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const tourImage = tour.imageUrl || defaultTourImage;
  const guideImage = tour.guide?.avatarUrl || defaultGuideImage;
  const guideName = tour.guide?.name || "Guía Experto";
  const itinerary = defaultItinerary;
  const includes = defaultIncludes;
  const excludes = defaultExcludes;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                <MapPin className="mr-1 h-3 w-3" />
                {tour.location}
              </Badge>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{tour.rating || 4.8}</span>
                <span className="text-muted-foreground">({tour.reviewCount || 0} reseñas)</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold" data-testid="text-tour-title">
              {tour.title}
            </h1>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-2">
            <div className="aspect-video overflow-hidden rounded-md">
              <img
                src={tourImage}
                alt={tour.title}
                className="h-full w-full object-cover"
                data-testid="img-tour-main"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square overflow-hidden rounded-md">
                <img src={tourImage} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="aspect-square overflow-hidden rounded-md">
                <img src={tourImage} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="aspect-square overflow-hidden rounded-md">
                <img src={tourImage} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="aspect-square overflow-hidden rounded-md">
                <img src={tourImage} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex-1">
              <div className="mb-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-muted-foreground">Duración</p>
                    <p className="font-medium">{tour.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-muted-foreground">Grupo</p>
                    <p className="font-medium">Hasta {tour.maxGroupSize || 10}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-muted-foreground">Disponibilidad</p>
                    <p className="font-medium">Todo el año</p>
                  </div>
                </div>
              </div>

              <section className="mb-8">
                <h2 className="mb-4 text-xl font-semibold">Descripción</h2>
                <p className="whitespace-pre-line text-muted-foreground">
                  {tour.description}
                </p>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="mb-4 text-xl font-semibold">Tu Guía</h2>
                <div className="flex items-start gap-4 rounded-md border p-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={guideImage} alt={guideName} />
                    <AvatarFallback>{guideName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{guideName}</h3>
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{tour.guide?.rating || 4.8}</span>
                      <span>|</span>
                      <span>{tour.guide?.verified ? "Guía verificado" : "Guía"}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Guía profesional con experiencia en este destino.
                    </p>
                  </div>
                </div>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="mb-4 text-xl font-semibold">Itinerario</h2>
                <div className="space-y-4">
                  {itinerary.map((item) => (
                    <div key={item.day} className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                        {item.day}
                      </div>
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <Separator className="my-8" />

              <section className="grid gap-8 md:grid-cols-2">
                <div>
                  <h2 className="mb-4 text-xl font-semibold">Incluye</h2>
                  <ul className="space-y-2">
                    {includes.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="mb-4 text-xl font-semibold">No Incluye</h2>
                  <ul className="space-y-2">
                    {excludes.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <X className="h-4 w-4 text-red-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>

            <aside className="lg:w-80">
              <BookingCard
                tourId={Number(id)}
                tourTitle={tour.title}
                pricePerPerson={Number(tour.price)}
                maxGroupSize={tour.maxGroupSize || 10}
              />
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
