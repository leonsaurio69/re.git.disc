import { MapPin, Clock, Users, Star, Check, X, Calendar } from "lucide-react";
import { Header } from "@/components/Header";
import { BookingCard } from "@/components/BookingCard";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

import machuPicchu from "@assets/generated_images/machu_picchu_dramatic_sunrise.png";
import maleGuide from "@assets/generated_images/latino_male_tour_guide_portrait.png";

// todo: remove mock functionality
const tourData = {
  id: "t1",
  title: "Aventura Épica en Machu Picchu - Camino del Inca",
  location: "Cusco, Perú",
  price: 299,
  duration: "4 días",
  maxGroupSize: 12,
  rating: 4.9,
  reviewCount: 128,
  description: `Embárcate en una aventura inolvidable a través del legendario Camino del Inca hacia Machu Picchu. Esta experiencia de 4 días te llevará por antiguos senderos incas, pasando por ruinas históricas, paisajes de montaña impresionantes y ecosistemas únicos.

Caminaremos por senderos que han sido utilizados durante siglos, visitando sitios arqueológicos fascinantes antes de llegar a la majestuosa ciudadela de Machu Picchu al amanecer. Una experiencia que combina aventura, historia y naturaleza.`,
  includes: [
    "Guía certificado bilingüe",
    "Entradas a Machu Picchu",
    "Transporte desde Cusco",
    "3 noches de camping",
    "Todas las comidas durante el trek",
    "Equipo de camping",
    "Porteadores",
  ],
  excludes: [
    "Vuelos internacionales",
    "Seguro de viaje",
    "Propinas",
    "Comidas no mencionadas",
    "Gastos personales",
  ],
  itinerary: [
    { day: 1, title: "Cusco - Wayllabamba", description: "Recojo en hotel y viaje al kilómetro 82. Inicio del trek hacia Wayllabamba (3,000m)." },
    { day: 2, title: "Paso Warmiwañusca", description: "Ascenso al punto más alto (4,200m). Descenso al campamento Pacaymayo." },
    { day: 3, title: "Ruinas de Phuyupatamarca", description: "Visita a ruinas incas y descenso hacia Wiñaywayna." },
    { day: 4, title: "Machu Picchu", description: "Llegada a Machu Picchu al amanecer. Tour guiado de la ciudadela." },
  ],
  guide: {
    name: "Carlos Mendoza",
    avatarUrl: maleGuide,
    bio: "Guía certificado con más de 10 años de experiencia en el Camino del Inca. Apasionado por compartir la historia y cultura de mi tierra.",
    rating: 4.9,
    tourCount: 8,
  },
};

export default function TourDetailsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                <MapPin className="mr-1 h-3 w-3" />
                {tourData.location}
              </Badge>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{tourData.rating}</span>
                <span className="text-muted-foreground">({tourData.reviewCount} reseñas)</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold" data-testid="text-tour-title">
              {tourData.title}
            </h1>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-2">
            <div className="aspect-video overflow-hidden rounded-md">
              <img
                src={machuPicchu}
                alt={tourData.title}
                className="h-full w-full object-cover"
                data-testid="img-tour-main"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square overflow-hidden rounded-md">
                <img src={machuPicchu} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="aspect-square overflow-hidden rounded-md">
                <img src={machuPicchu} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="aspect-square overflow-hidden rounded-md">
                <img src={machuPicchu} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="aspect-square overflow-hidden rounded-md">
                <img src={machuPicchu} alt="" className="h-full w-full object-cover" />
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
                    <p className="font-medium">{tourData.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-muted-foreground">Grupo</p>
                    <p className="font-medium">Hasta {tourData.maxGroupSize}</p>
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
                  {tourData.description}
                </p>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="mb-4 text-xl font-semibold">Tu Guía</h2>
                <div className="flex items-start gap-4 rounded-md border p-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={tourData.guide.avatarUrl} alt={tourData.guide.name} />
                    <AvatarFallback>{tourData.guide.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{tourData.guide.name}</h3>
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{tourData.guide.rating}</span>
                      <span>|</span>
                      <span>{tourData.guide.tourCount} tours</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{tourData.guide.bio}</p>
                  </div>
                </div>
              </section>

              <Separator className="my-8" />

              <section className="mb-8">
                <h2 className="mb-4 text-xl font-semibold">Itinerario</h2>
                <div className="space-y-4">
                  {tourData.itinerary.map((item) => (
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
                    {tourData.includes.map((item, i) => (
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
                    {tourData.excludes.map((item, i) => (
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
                tourTitle={tourData.title}
                pricePerPerson={tourData.price}
                maxGroupSize={tourData.maxGroupSize}
              />
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
