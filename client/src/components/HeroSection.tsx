import { useState } from "react";
import { Search, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeroSectionProps {
  backgroundImage: string;
  onSearch?: (query: { destination: string; date: string; guests: string }) => void;
}

export function HeroSection({ backgroundImage, onSearch }: HeroSectionProps) {
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ destination, date, guests });
    } else {
      console.log("Search:", { destination, date, guests });
    }
  };

  return (
    <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl" data-testid="text-hero-title">
          Descubre Experiencias Únicas
        </h1>
        <p className="mb-8 max-w-2xl text-lg text-white/90 md:text-xl" data-testid="text-hero-subtitle">
          Conecta con guías locales y vive aventuras inolvidables en los destinos más increíbles del mundo
        </p>

        <form
          onSubmit={handleSearch}
          className="w-full max-w-4xl rounded-md bg-background/95 p-4 shadow-lg backdrop-blur-sm md:p-6"
        >
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="¿A dónde quieres ir?"
                className="pl-10"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                data-testid="input-hero-destination"
              />
            </div>
            <div className="relative md:col-span-1">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="date"
                className="pl-10"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                data-testid="input-hero-date"
              />
            </div>
            <div className="relative md:col-span-1">
              <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="number"
                placeholder="Viajeros"
                min="1"
                className="pl-10"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                data-testid="input-hero-guests"
              />
            </div>
            <Button type="submit" className="md:col-span-1" data-testid="button-hero-search">
              <Search className="mr-2 h-4 w-4" />
              Buscar Tours
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
