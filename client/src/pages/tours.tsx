import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { TourCard } from "@/components/TourCard";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toursApi } from "@/lib/api";

import defaultTourImage from "@assets/generated_images/machu_picchu_dramatic_sunrise.png";
import defaultGuideImage from "@assets/generated_images/latino_male_tour_guide_portrait.png";

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

  const { data: tours, isLoading } = useQuery({
    queryKey: ["/api/tours"],
    queryFn: () => toursApi.getAll(),
  });

  const displayTours = tours?.map((tour: any) => ({
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
  })) || [];

  const filteredTours = displayTours.filter((tour: any) =>
    tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tour.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredTours.length > 0 ? (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {filteredTours.length} tours
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredTours.map((tour: any) => (
                      <TourCard key={tour.id} {...tour} />
                    ))}
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchQuery 
                        ? "No se encontraron tours con esos criterios" 
                        : "No hay tours disponibles aún"}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
