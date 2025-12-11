import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Clock, Users, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toursApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TourAvailabilityManagerProps {
  tourId: number;
  tourTitle: string;
  maxGroupSize: number;
}

export function TourAvailabilityManager({ tourId, tourTitle, maxGroupSize }: TourAvailabilityManagerProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("09:00");
  const [newSpots, setNewSpots] = useState(maxGroupSize.toString());

  const { data: availability, isLoading } = useQuery({
    queryKey: ["/api/tours", tourId, "availability"],
    queryFn: () => toursApi.getAvailability(tourId),
  });

  const addMutation = useMutation({
    mutationFn: (data: { date: string; startTime: string; availableSpots: number }) =>
      toursApi.addAvailability(tourId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours", tourId, "availability"] });
      toast({ title: "Disponibilidad añadida", description: "La fecha ha sido añadida correctamente" });
      setIsAddDialogOpen(false);
      setNewDate("");
      setNewTime("09:00");
      setNewSpots(maxGroupSize.toString());
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (availId: number) => toursApi.deleteAvailability(tourId, availId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tours", tourId, "availability"] });
      toast({ title: "Eliminado", description: "La disponibilidad ha sido eliminada" });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) {
      toast({ title: "Error", description: "Selecciona una fecha", variant: "destructive" });
      return;
    }
    addMutation.mutate({
      date: newDate,
      startTime: newTime,
      availableSpots: parseInt(newSpots) || maxGroupSize,
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isPastDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const sortedAvailability = availability?.slice().sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  ) || [];

  const futureAvailability = sortedAvailability.filter((a: any) => !isPastDate(a.date));
  const pastAvailability = sortedAvailability.filter((a: any) => isPastDate(a.date));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Disponibilidad
            </CardTitle>
            <CardDescription>
              Gestiona las fechas disponibles para {tourTitle}
            </CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-availability">
                <Plus className="mr-2 h-4 w-4" />
                Añadir Fecha
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleAdd}>
                <DialogHeader>
                  <DialogTitle>Añadir Disponibilidad</DialogTitle>
                  <DialogDescription>
                    Añade una nueva fecha disponible para tu tour
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="avail-date">Fecha *</Label>
                    <Input
                      id="avail-date"
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      required
                      data-testid="input-availability-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avail-time">Hora de inicio</Label>
                    <Input
                      id="avail-time"
                      type="time"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      data-testid="input-availability-time"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avail-spots">Lugares disponibles</Label>
                    <Input
                      id="avail-spots"
                      type="number"
                      min="1"
                      max={maxGroupSize}
                      value={newSpots}
                      onChange={(e) => setNewSpots(e.target.value)}
                      data-testid="input-availability-spots"
                    />
                    <p className="text-xs text-muted-foreground">
                      Máximo permitido: {maxGroupSize} personas
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={addMutation.isPending} data-testid="button-confirm-availability">
                    {addMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Añadir
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : futureAvailability.length === 0 && pastAvailability.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="mb-4 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">No hay fechas disponibles</p>
            <p className="text-sm text-muted-foreground">
              Añade fechas para que los clientes puedan reservar tu tour
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {futureAvailability.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Próximas fechas</h4>
                <div className="space-y-2">
                  {futureAvailability.map((avail: any) => (
                    <div
                      key={avail.id}
                      className="flex items-center justify-between gap-4 rounded-md border p-3"
                      data-testid={`availability-item-${avail.id}`}
                    >
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium capitalize">{formatDate(avail.date)}</span>
                        </div>
                        {avail.startTime && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {avail.startTime}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="secondary" className="text-xs">
                            {avail.availableSpots} lugares
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(avail.id)}
                        data-testid={`button-delete-availability-${avail.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pastAvailability.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Fechas pasadas</h4>
                <div className="space-y-2 opacity-50">
                  {pastAvailability.slice(0, 5).map((avail: any) => (
                    <div
                      key={avail.id}
                      className="flex items-center justify-between gap-4 rounded-md border p-3"
                    >
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{formatDate(avail.date)}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Pasada
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar disponibilidad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Las reservas existentes para esta fecha no se verán afectadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
