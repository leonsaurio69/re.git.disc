import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Header } from "@/components/Header";
import { TourCard } from "@/components/TourCard";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

import machuPicchu from "@assets/generated_images/machu_picchu_dramatic_sunrise.png";
import beach from "@assets/generated_images/caribbean_mexico_beach_paradise.png";
import rome from "@assets/generated_images/rome_colosseum_golden_hour.png";
import maleGuide from "@assets/generated_images/latino_male_tour_guide_portrait.png";
import femaleGuide from "@assets/generated_images/latina_female_tour_guide_portrait.png";

// todo: remove mock functionality
const allTours = [
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
  },
  {
    id: "t4",
    title: "Valle Sagrado y Mercado de Pisac",
    location: "Cusco, Perú",
    price: 79,
    duration: "1 día",
    maxGroupSize: 10,
    rating: 4.6,
    reviewCount: 67,
    imageUrl: machuPicchu,
    guideAvatarUrl: maleGuide,
    guideName: "Carlos Mendoza",
  },
  {
    id: "t5",
    title: "Cenotes Secretos de la Riviera Maya",
    location: "Playa del Carmen, México",
    price: 120,
    duration: "5 horas",
    maxGroupSize: 6,
    rating: 4.9,
    reviewCount: 95,
    imageUrl: beach,
    guideAvatarUrl: femaleGuide,
    guideName: "María González",
  },
  {
    id: "t6",
    title: "Vaticano Sin Colas - Tour Exclusivo",
    location: "Roma, Italia",
    price: 199,
    duration: "4 horas",
    maxGroupSize: 12,
    rating: 4.8,
    reviewCount: 156,
    imageUrl: rome,
    guideAvatarUrl: maleGuide,
    guideName: "Marco Rossi",
  },
];

const categories = [
  { id: "adventure", label: "Aventura" },
  { id: "cultural", label: "Cultural" },
  { id: "nature", label: "Naturaleza" },
  { id: "food", label: "Gastronomía" },
  { id: "historical", label: "Histórico" },
  { id: "beach", label: "Playa" },
];

function FilterPanel() {
  const [priceRange, setPriceRange] = useState([0, 500]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-semibold">Rango de Precio</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={500}
          step={10}
          className="mb-2"
          data-testid="slider-price-range"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Categorías</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox id={category.id} data-testid={`checkbox-category-${category.id}`} />
              <Label htmlFor={category.id} className="cursor-pointer">
                {category.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Duración</h3>
        <div className="space-y-2">
          {["Menos de 4 horas", "4-8 horas", "1 día", "Varios días"].map((duration, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Checkbox id={`duration-${i}`} data-testid={`checkbox-duration-${i}`} />
              <Label htmlFor={`duration-${i}`} className="cursor-pointer">
                {duration}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full" data-testid="button-apply-filters">
        Aplicar Filtros
      </Button>
    </div>
  );
}

export default function ToursPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Explorar Tours</h1>
            <p className="text-muted-foreground">
              Descubre experiencias únicas en los destinos más increíbles
            </p>
          </div>

          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar tours por destino, nombre..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-tours"
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden" data-testid="button-open-filters">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filtros
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterPanel />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex gap-8">
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-24 rounded-md border p-4">
                <h2 className="mb-4 font-semibold">Filtros</h2>
                <FilterPanel />
              </div>
            </aside>

            <div className="flex-1">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Mostrando {allTours.length} tours
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {allTours.map((tour) => (
                  <TourCard key={tour.id} {...tour} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
