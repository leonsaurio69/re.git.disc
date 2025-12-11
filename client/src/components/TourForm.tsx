import { useState } from "react";
import { MapPin, Clock, Users, DollarSign, FileText, Image, ListPlus, ListMinus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface TourFormProps {
  initialData?: {
    id?: number;
    title: string;
    location: string;
    description: string;
    price: number;
    duration: string;
    maxGroupSize: number;
    category: string;
    imageUrl?: string;
    includes?: string[];
    excludes?: string[];
    requirements?: string;
    difficulty?: string;
    active?: boolean;
    featured?: boolean;
  };
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  isEditing?: boolean;
  isPending?: boolean;
}

const categories = [
  { value: "adventure", label: "Aventura" },
  { value: "cultural", label: "Cultural" },
  { value: "nature", label: "Naturaleza" },
  { value: "food", label: "Gastronomía" },
  { value: "historical", label: "Histórico" },
  { value: "beach", label: "Playa" },
  { value: "trekking", label: "Trekking" },
  { value: "city", label: "Ciudad" },
];

const difficulties = [
  { value: "easy", label: "Fácil" },
  { value: "moderate", label: "Moderado" },
  { value: "challenging", label: "Desafiante" },
  { value: "difficult", label: "Difícil" },
];

export function TourForm({ initialData, onSubmit, onCancel, isEditing = false, isPending = false }: TourFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [duration, setDuration] = useState(initialData?.duration || "");
  const [maxGroupSize, setMaxGroupSize] = useState(initialData?.maxGroupSize?.toString() || "10");
  const [category, setCategory] = useState(initialData?.category || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "moderate");
  const [requirements, setRequirements] = useState(initialData?.requirements || "");
  const [includes, setIncludes] = useState<string[]>(initialData?.includes || ["Guía profesional", "Transporte"]);
  const [excludes, setExcludes] = useState<string[]>(initialData?.excludes || ["Propinas", "Seguro de viaje"]);
  const [active, setActive] = useState(initialData?.active !== false);
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [newInclude, setNewInclude] = useState("");
  const [newExclude, setNewExclude] = useState("");

  const handleAddInclude = () => {
    if (newInclude.trim()) {
      setIncludes([...includes, newInclude.trim()]);
      setNewInclude("");
    }
  };

  const handleRemoveInclude = (index: number) => {
    setIncludes(includes.filter((_, i) => i !== index));
  };

  const handleAddExclude = () => {
    if (newExclude.trim()) {
      setExcludes([...excludes, newExclude.trim()]);
      setNewExclude("");
    }
  };

  const handleRemoveExclude = (index: number) => {
    setExcludes(excludes.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title,
      location,
      description,
      price: parseFloat(price),
      duration,
      maxGroupSize: parseInt(maxGroupSize),
      category,
      imageUrl: imageUrl || null,
      difficulty,
      requirements: requirements || null,
      includes,
      excludes,
      active,
      featured,
    };
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tour-title">Nombre del Tour *</Label>
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
          <Label htmlFor="tour-location">Ubicación *</Label>
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
          <Label htmlFor="tour-description">Descripción *</Label>
          <Textarea
            id="tour-description"
            placeholder="Describe tu tour, qué verán los viajeros, qué experiencia vivirán..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            data-testid="input-tour-description"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tour-price">Precio por persona (USD) *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="tour-price"
                type="number"
                min="1"
                step="0.01"
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
            <Label htmlFor="tour-duration">Duración *</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="tour-duration"
                placeholder="Ej: 4 horas, 2 días"
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
            <Label htmlFor="tour-group-size">Tamaño máximo del grupo *</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="tour-group-size"
                type="number"
                min="1"
                max="100"
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
            <Label htmlFor="tour-category">Categoría *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="tour-category" data-testid="select-tour-category">
                <SelectValue placeholder="Selecciona categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tour-difficulty">Dificultad</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger id="tour-difficulty" data-testid="select-tour-difficulty">
                <SelectValue placeholder="Selecciona dificultad" />
              </SelectTrigger>
              <SelectContent>
                {difficulties.map((diff) => (
                  <SelectItem key={diff.value} value={diff.value}>
                    {diff.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tour-image">URL de Imagen Principal</Label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="tour-image"
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                className="pl-10"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                data-testid="input-tour-image"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tour-requirements">Requisitos para participantes</Label>
          <Textarea
            id="tour-requirements"
            placeholder="Ej: Buena condición física, ropa cómoda, zapatos de trekking..."
            rows={2}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            data-testid="input-tour-requirements"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Qué incluye</Label>
            <div className="space-y-2">
              {includes.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 rounded-md bg-green-50 dark:bg-green-950/30 px-3 py-1.5 text-sm text-green-700 dark:text-green-300">
                    {item}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveInclude(index)}
                    className="h-7 w-7"
                  >
                    <ListMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Añadir..."
                  value={newInclude}
                  onChange={(e) => setNewInclude(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddInclude())}
                />
                <Button type="button" variant="outline" size="icon" onClick={handleAddInclude} data-testid="button-add-include">
                  <ListPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Qué NO incluye</Label>
            <div className="space-y-2">
              {excludes.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1 rounded-md bg-red-50 dark:bg-red-950/30 px-3 py-1.5 text-sm text-red-700 dark:text-red-300">
                    {item}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveExclude(index)}
                    className="h-7 w-7"
                  >
                    <ListMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  placeholder="Añadir..."
                  value={newExclude}
                  onChange={(e) => setNewExclude(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddExclude())}
                />
                <Button type="button" variant="outline" size="icon" onClick={handleAddExclude} data-testid="button-add-exclude">
                  <ListPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 rounded-md border p-4">
          <div className="flex items-center gap-3">
            <Switch
              id="tour-active"
              checked={active}
              onCheckedChange={setActive}
              data-testid="switch-tour-active"
            />
            <Label htmlFor="tour-active" className="cursor-pointer">
              Tour Activo
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="tour-featured"
              checked={featured}
              onCheckedChange={setFeatured}
              data-testid="switch-tour-featured"
            />
            <Label htmlFor="tour-featured" className="cursor-pointer">
              Destacado
            </Label>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        {onCancel && (
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel} data-testid="button-cancel-tour">
            Cancelar
          </Button>
        )}
        <Button type="submit" className="flex-1" disabled={isPending} data-testid="button-submit-tour">
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : isEditing ? (
            "Guardar Cambios"
          ) : (
            "Crear Tour"
          )}
        </Button>
      </div>
    </form>
  );
}
