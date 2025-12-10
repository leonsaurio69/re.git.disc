import { Clock, MapPin, Users, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface TourCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  duration: string;
  maxGroupSize: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  guideAvatarUrl?: string;
  guideName: string;
  featured?: boolean;
  onBook?: (id: string) => void;
}

export function TourCard({
  id,
  title,
  location,
  price,
  duration,
  maxGroupSize,
  rating,
  reviewCount,
  imageUrl,
  guideAvatarUrl,
  guideName,
  featured = false,
  onBook,
}: TourCardProps) {
  const handleBook = () => {
    if (onBook) {
      onBook(id);
    } else {
      console.log("Booking tour:", id);
    }
  };

  return (
    <Card className="group overflow-visible transition-transform duration-200 hover:scale-[1.02]">
      <div className="relative aspect-video overflow-hidden rounded-t-md">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          data-testid={`img-tour-${id}`}
        />
        <Badge
          className="absolute left-3 top-3"
          variant="secondary"
          data-testid={`badge-location-${id}`}
        >
          <MapPin className="mr-1 h-3 w-3" />
          {location}
        </Badge>
        {featured && (
          <Badge className="absolute right-3 top-3" variant="default">
            Destacado
          </Badge>
        )}
        <div className="absolute bottom-3 right-3">
          <Avatar className="border-2 border-background">
            <AvatarImage src={guideAvatarUrl} alt={guideName} />
            <AvatarFallback>{guideName.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">({reviewCount} reseñas)</span>
        </div>
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold" data-testid={`text-tour-title-${id}`}>
          {title}
        </h3>
        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {duration}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            Hasta {maxGroupSize} personas
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-2xl font-bold" data-testid={`text-tour-price-${id}`}>
              ${price}
            </span>
            <span className="text-sm text-muted-foreground"> / persona</span>
          </div>
          <Button onClick={handleBook} data-testid={`button-book-${id}`}>
            Reservar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
