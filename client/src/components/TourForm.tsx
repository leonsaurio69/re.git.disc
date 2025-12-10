import { useState } from "react";
import { MapPin, Clock, Users, DollarSign, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TourFormProps {
  initialData?: {
    title: string;
    location: string;
    description: string;
    price: number;
    duration: string;
    maxGroupSize: number;
    category: string;
  };
  onSubmit?: (data: any) => void;
  isEditing?: boolean;
}

export function TourForm({ initialData, onSubmit, isEditing = false }: TourFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [duration, setDuration] = useState(initialData?.duration || "");
  const [maxGroupSize, setMaxGroupSize] = useState(initialData?.maxGroupSize?.toString() || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const data = {
      title,
      location,
      description,
      price: parseFloat(price),
      duration,
      maxGroupSize: parseInt(maxGroupSize),
      category,
    };
    if (onSubmit) {
      onSubmit(data);
    } else {
      console.log("Tour submitted:", data);
    }
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar Tour" : "Crear Nuevo Tour"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Actualiza la información de tu tour"
            : "Completa los detalles de tu nuevo tour turístico"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tour-title">Nombre del Tour</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="tour-title"
                placeholder="Ej: Aventura en Machu Picchu"
                className="pl-10"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                data-testid="input-tour-title"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tour-location">Ubicación</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="tour-location"
                placeholder="Ej: Cusco, Perú"
                className="pl-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                data-testid="input-tour-location"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tour-description">Descripción</Label>
            <Textarea
              id="tour-description"
              placeholder="Describe tu tour, qué incluye, qué verán los viajeros..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              data-testid="input-tour-description"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tour-price">Precio por persona (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="tour-price"
                  type="number"
                  min="1"
                  placeholder="150"
                  className="pl-10"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  data-testid="input-tour-price"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tour-duration">Duración</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="tour-duration"
                  placeholder="Ej: 4 horas"
                  className="pl-10"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  required
                  data-testid="input-tour-duration"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tour-group-size">Tamaño máximo del grupo</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="tour-group-size"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="10"
                  className="pl-10"
                  value={maxGroupSize}
                  onChange={(e) => setMaxGroupSize(e.target.value)}
                  required
                  data-testid="input-tour-group-size"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tour-category">Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="tour-category" data-testid="select-tour-category">
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adventure">Aventura</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="nature">Naturaleza</SelectItem>
                  <SelectItem value="food">Gastronomía</SelectItem>
                  <SelectItem value="historical">Histórico</SelectItem>
                  <SelectItem value="beach">Playa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Imágenes del Tour</Label>
            <div className="flex items-center justify-center rounded-md border border-dashed p-8">
              <div className="text-center">
                <Image className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Arrastra imágenes aquí o haz clic para seleccionar
                </p>
                <Button type="button" variant="outline" className="mt-2" data-testid="button-upload-images">
                  Subir Imágenes
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" data-testid="button-cancel-tour">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading} data-testid="button-submit-tour">
            {isLoading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Crear Tour"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
