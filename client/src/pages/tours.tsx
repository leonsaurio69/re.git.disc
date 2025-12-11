import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Loader2, X, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { TourCard } from "@/components/TourCard";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const durations = [
  { id: "short", label: "Menos de 4 horas", maxHours: 4 },
  { id: "half-day", label: "4-8 horas", minHours: 4, maxHours: 8 },
  { id: "full-day", label: "1 día", minHours: 8, maxHours: 24 },
  { id: "multi-day", label: "Varios días", minHours: 24 },
];

const sortOptions = [
  { value: "recommended", label: "Recomendados" },
  { value: "price-asc", label: "Precio: Menor a Mayor" },
  { value: "price-desc", label: "Precio: Mayor a Menor" },
  { value: "rating", label: "Mejor Calificados" },
];

interface FilterState {
  priceRange: [number, number];
  categories: string[];
  durations: string[];
  location: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApply: () => void;
  onReset: () => void;
  locations: string[];
}

function FilterPanel({ filters, onFiltersChange, onApply, onReset, locations }: FilterPanelProps) {
  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(c => c !== categoryId)
      : [...filters.categories, categoryId];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const toggleDuration = (durationId: string) => {
    const newDurations = filters.durations.includes(durationId)
      ? filters.durations.filter(d => d !== durationId)
      : [...filters.durations, durationId];
    onFiltersChange({ ...filters, durations: newDurations });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-semibold">Ubicación</h3>
        <Select 
          value={filters.location} 
          onValueChange={(value) => onFiltersChange({ ...filters, location: value })}
        >
          <SelectTrigger data-testid="select-location">
            <SelectValue placeholder="Todas las ubicaciones" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las ubicaciones</SelectItem>
            {locations.map(loc => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Rango de Precio</h3>
        <Slider
          value={filters.priceRange}
          onValueChange={(value) => onFiltersChange({ ...filters, priceRange: value as [number, number] })}
          min={0}
          max={1000}
          step={10}
          className="mb-2"
          data-testid="slider-price-range"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${filters.priceRange[0]}</span>
          <span>${filters.priceRange[1]}+</span>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold">Categorías</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox 
                id={category.id} 
                checked={filters.categories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
                data-testid={`checkbox-category-${category.id}`} 
              />
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
          {durations.map((duration) => (
            <div key={duration.id} className="flex items-center space-x-2">
              <Checkbox 
                id={`duration-${duration.id}`}
                checked={filters.durations.includes(duration.id)}
                onCheckedChange={() => toggleDuration(duration.id)}
                data-testid={`checkbox-duration-${duration.id}`} 
              />
              <Label htmlFor={`duration-${duration.id}`} className="cursor-pointer">
                {duration.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={onApply} className="flex-1" data-testid="button-apply-filters">
          Aplicar Filtros
        </Button>
        <Button onClick={onReset} variant="outline" data-testid="button-reset-filters">
          Limpiar
        </Button>
      </div>
    </div>
  );
}

const defaultFilters: FilterState = {
  priceRange: [0, 1000],
  categories: [],
  durations: [],
  location: "all",
};

export default function ToursPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(defaultFilters);
  const [sortBy, setSortBy] = useState("recommended");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: tours, isLoading } = useQuery({
    queryKey: ["/api/tours"],
    queryFn: () => toursApi.getAll(),
  });

  const displayTours = useMemo(() => {
    return tours?.map((tour: any) => ({
      id: tour.id,
      title: tour.title,
      location: tour.location,
      price: tour.price,
      duration: tour.duration,
      category: tour.category,
      maxGroupSize: tour.maxGroupSize || 10,
      rating: tour.rating || 4.8,
      reviewCount: tour.reviewCount || 0,
      imageUrl: tour.imageUrl || defaultTourImage,
      guideAvatarUrl: tour.guide?.avatarUrl || defaultGuideImage,
      guideName: tour.guide?.name || "Guía Experto",
    })) || [];
  }, [tours]);

  const locations = useMemo(() => {
    const uniqueLocations = new Set(displayTours.map(t => t.location));
    return Array.from(uniqueLocations).filter(Boolean).sort();
  }, [displayTours]);

  const parseDuration = (duration: string): number => {
    const lower = duration.toLowerCase();
    const numMatch = duration.match(/\d+/);
    const num = numMatch ? parseInt(numMatch[0]) : 0;
    
    if (lower.includes("día") || lower.includes("day")) {
      return num * 24;
    }
    if (lower.includes("hora") || lower.includes("hour")) {
      return num;
    }
    return num;
  };

  const matchesDuration = (tourDuration: string, selectedDurations: string[]): boolean => {
    if (selectedDurations.length === 0) return true;
    
    const hours = parseDuration(tourDuration);
    
    return selectedDurations.some(d => {
      const config = durations.find(dur => dur.id === d);
      if (!config) return false;
      
      const minOk = !config.minHours || hours >= config.minHours;
      const maxOk = !config.maxHours || hours < config.maxHours;
      return minOk && maxOk;
    });
  };

  const filteredAndSortedTours = useMemo(() => {
    let result = displayTours.filter((tour: any) => {
      const matchesSearch = 
        tour.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPrice = 
        tour.price >= appliedFilters.priceRange[0] && 
        (appliedFilters.priceRange[1] >= 1000 || tour.price <= appliedFilters.priceRange[1]);
      
      const matchesCategory = 
        appliedFilters.categories.length === 0 || 
        appliedFilters.categories.includes(tour.category);
      
      const matchesDur = matchesDuration(tour.duration, appliedFilters.durations);
      
      const matchesLocation = 
        appliedFilters.location === "all" || 
        tour.location === appliedFilters.location;

      return matchesSearch && matchesPrice && matchesCategory && matchesDur && matchesLocation;
    });

    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [displayTours, searchQuery, appliedFilters, sortBy]);

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setMobileFiltersOpen(false);
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const removeFilter = (type: string, value?: string) => {
    const newFilters = { ...appliedFilters };
    
    switch (type) {
      case "category":
        newFilters.categories = newFilters.categories.filter(c => c !== value);
        break;
      case "duration":
        newFilters.durations = newFilters.durations.filter(d => d !== value);
        break;
      case "location":
        newFilters.location = "all";
        break;
      case "price":
        newFilters.priceRange = [0, 1000];
        break;
    }
    
    setFilters(newFilters);
    setAppliedFilters(newFilters);
  };

  const hasActiveFilters = 
    appliedFilters.categories.length > 0 ||
    appliedFilters.durations.length > 0 ||
    appliedFilters.location !== "all" ||
    appliedFilters.priceRange[0] > 0 ||
    appliedFilters.priceRange[1] < 1000;

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

          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="relative min-w-[200px] flex-1">
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
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px]" data-testid="select-sort">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden" data-testid="button-open-filters">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filtros
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">
                      {appliedFilters.categories.length + appliedFilters.durations.length + 
                       (appliedFilters.location !== "all" ? 1 : 0) +
                       (appliedFilters.priceRange[0] > 0 || appliedFilters.priceRange[1] < 1000 ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterPanel 
                    filters={filters}
                    onFiltersChange={setFilters}
                    onApply={handleApplyFilters}
                    onReset={handleResetFilters}
                    locations={locations}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {hasActiveFilters && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtros activos:</span>
              
              {appliedFilters.location !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  <MapPin className="h-3 w-3" />
                  {appliedFilters.location}
                  <button 
                    onClick={() => removeFilter("location")}
                    className="ml-1 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {(appliedFilters.priceRange[0] > 0 || appliedFilters.priceRange[1] < 1000) && (
                <Badge variant="secondary" className="gap-1">
                  ${appliedFilters.priceRange[0]} - ${appliedFilters.priceRange[1]}
                  <button 
                    onClick={() => removeFilter("price")}
                    className="ml-1 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              
              {appliedFilters.categories.map(cat => (
                <Badge key={cat} variant="secondary" className="gap-1">
                  {categories.find(c => c.id === cat)?.label}
                  <button 
                    onClick={() => removeFilter("category", cat)}
                    className="ml-1 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              {appliedFilters.durations.map(dur => (
                <Badge key={dur} variant="secondary" className="gap-1">
                  {durations.find(d => d.id === dur)?.label}
                  <button 
                    onClick={() => removeFilter("duration", dur)}
                    className="ml-1 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleResetFilters}
                data-testid="button-clear-all-filters"
              >
                Limpiar todo
              </Button>
            </div>
          )}

          <div className="flex gap-8">
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-24 z-10 rounded-md border p-4">
                <h2 className="mb-4 font-semibold">Filtros</h2>
                <FilterPanel 
                  filters={filters}
                  onFiltersChange={setFilters}
                  onApply={handleApplyFilters}
                  onReset={handleResetFilters}
                  locations={locations}
                />
              </div>
            </aside>

            <div className="flex-1">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredAndSortedTours.length > 0 ? (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground" data-testid="text-tour-count">
                      Mostrando {filteredAndSortedTours.length} de {displayTours.length} tours
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredAndSortedTours.map((tour: any) => (
                      <TourCard key={tour.id} {...tour} />
                    ))}
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                    <Search className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="mb-2 font-medium">No se encontraron tours</p>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery || hasActiveFilters
                        ? "Intenta ajustar tus filtros o buscar algo diferente" 
                        : "No hay tours disponibles aún"}
                    </p>
                    {hasActiveFilters && (
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={handleResetFilters}
                      >
                        Limpiar filtros
                      </Button>
                    )}
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
