import { Star, MapPin, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export interface GuideCardProps {
  id: string;
  name: string;
  location: string;
  avatarUrl?: string;
  rating: number;
  reviewCount: number;
  tourCount: number;
  specialties: string[];
  verified?: boolean;
  onViewProfile?: (id: string) => void;
}

export function GuideCard({
  id,
  name,
  location,
  avatarUrl,
  rating,
  reviewCount,
  tourCount,
  specialties,
  verified = false,
  onViewProfile,
}: GuideCardProps) {
  const handleViewProfile = () => {
    if (onViewProfile) {
      onViewProfile(id);
    } else {
      console.log("View guide profile:", id);
    }
  };

  return (
    <Card className="overflow-visible">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className="text-2xl">{name.charAt(0)}</AvatarFallback>
            </Avatar>
            {verified && (
              <div className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1">
                <Award className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>
          
          <h3 className="mb-1 text-lg font-semibold" data-testid={`text-guide-name-${id}`}>
            {name}
          </h3>
          <p className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {location}
          </p>
          
          <div className="mb-3 flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({reviewCount})</span>
          </div>
          
          <p className="mb-3 text-sm text-muted-foreground">
            {tourCount} tours disponibles
          </p>
          
          <div className="mb-4 flex flex-wrap justify-center gap-1">
            {specialties.slice(0, 3).map((specialty) => (
              <Badge key={specialty} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={handleViewProfile}
            data-testid={`button-view-guide-${id}`}
          >
            Ver Perfil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
