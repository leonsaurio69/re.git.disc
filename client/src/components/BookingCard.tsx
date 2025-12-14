import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Calendar, Users, CreditCard, Check, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth-context";
import { bookingsApi, toursApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BookingCardProps {
  tourId: number;
  tourTitle: string;
  pricePerPerson: number;
  maxGroupSize: number;
}

export function BookingCard({ tourId, tourTitle, pricePerPerson, maxGroupSize }: BookingCardProps) {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState<string>("");
  const [guests, setGuests] = useState(1);

  const { data: availability, isLoading: availabilityLoading } = useQuery({
    queryKey: ["/api/tours", tourId, "availability"],
    queryFn: () => toursApi.getAvailability(tourId),
  });

  const selectedAvailability = availability?.find(
    (a: any) => a.id.toString() === selectedAvailabilityId
  );

  const availableSpots = selectedAvailability
    ? selectedAvailability.availableSpots - (selectedAvailability.bookedSpots || 0)
    : maxGroupSize;

  const effectiveMaxGuests = Math.min(maxGroupSize, availableSpots);

  useEffect(() => {
    if (guests > effectiveMaxGuests) {
      setGuests(Math.max(1, effectiveMaxGuests));
    }
  }, [effectiveMaxGuests, guests]);

  const totalPrice = pricePerPerson * guests;
  const serviceFee = Math.round(totalPrice * 0.1);
  const grandTotal = totalPrice + serviceFee;

  const bookingMutation = useMutation({
    mutationFn: (data: { tourId: number; date: string; guests: number; availabilityId?: number }) =>
      bookingsApi.create(data),
    onSuccess: () => {
      toast({
        title: "Reserva creada",
        description: `Tu reserva para "${tourTitle}" ha sido enviada. El guía la confirmará pronto.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tours", tourId, "availability"] });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo completar la reserva",
        variant: "destructive",
      });
    },
  });

  const handleBook = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para hacer una reserva",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    if (user?.role === "guide") {
      toast({
        title: "No permitido",
        description: "Los guías no pueden hacer reservas. Inicia sesión como cliente.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAvailabilityId || !selectedAvailability) {
      toast({
        title: "Selecciona una fecha",
        description: "Por favor selecciona una fecha disponible para tu reserva",
        variant: "destructive",
      });
      return;
    }

    bookingMutation.mutate({
      tourId,
      date: selectedAvailability.date,
      guests,
      availabilityId: parseInt(selectedAvailabilityId),
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isPastDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const futureAvailability = availability?.filter((a: any) => !isPastDate(a.date) && a.active) || [];

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-baseline gap-2">
          <span className="text-2xl font-bold" data-testid="text-price-per-person">${pricePerPerson}</span>
          <span className="text-base font-normal text-muted-foreground">/ persona</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Fecha del Tour</Label>
          {availabilityLoading ? (
            <div className="flex h-10 items-center justify-center rounded-md border">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : futureAvailability.length > 0 ? (
            <Select value={selectedAvailabilityId} onValueChange={setSelectedAvailabilityId}>
              <SelectTrigger data-testid="select-booking-date">
                <SelectValue placeholder="Selecciona una fecha" />
              </SelectTrigger>
              <SelectContent>
                {futureAvailability.map((avail: any) => {
                  const spots = avail.availableSpots - (avail.bookedSpots || 0);
                  const isFull = spots <= 0;
                  return (
                    <SelectItem
                      key={avail.id}
                      value={avail.id.toString()}
                      disabled={isFull}
                    >
                      <div className="flex items-center gap-2">
                        <span className="capitalize">{formatDate(avail.date)}</span>
                        {avail.startTime && (
                          <span className="text-muted-foreground">- {avail.startTime}</span>
                        )}
                        <Badge variant={isFull ? "destructive" : spots <= 3 ? "secondary" : "outline"} className="ml-2">
                          {isFull ? "Agotado" : `${spots} cupos`}
                        </Badge>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center gap-2 rounded-md border p-3 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>No hay fechas disponibles para este tour</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="booking-guests">Número de Viajeros</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="booking-guests"
              type="number"
              min={1}
              max={effectiveMaxGuests}
              className="pl-10"
              value={guests}
              onChange={(e) => setGuests(Math.min(parseInt(e.target.value) || 1, effectiveMaxGuests))}
              disabled={!selectedAvailabilityId}
              data-testid="input-booking-guests"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedAvailabilityId
              ? `Cupos disponibles: ${availableSpots} (máx. ${maxGroupSize} por grupo)`
              : `Máximo ${maxGroupSize} personas por grupo`}
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between gap-2 text-sm">
            <span>${pricePerPerson} x {guests} viajero{guests > 1 ? "s" : ""}</span>
            <span>${totalPrice}</span>
          </div>
          <div className="flex justify-between gap-2 text-sm">
            <span>Tarifa de servicio (10%)</span>
            <span>${serviceFee}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between gap-2 font-semibold">
          <span>Total</span>
          <span data-testid="text-booking-total">${grandTotal}</span>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button
          className="w-full"
          size="lg"
          onClick={handleBook}
          disabled={!selectedAvailabilityId || bookingMutation.isPending || availableSpots <= 0}
          data-testid="button-confirm-booking"
        >
          {bookingMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Reservar Ahora
            </>
          )}
        </Button>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Check className="h-3 w-3" />
          Cancelación gratuita hasta 24h antes
        </p>
        {!isAuthenticated && (
          <p className="text-xs text-muted-foreground">
            <Button variant="ghost" className="h-auto p-0 text-xs underline" onClick={() => setLocation("/login")}>
              Inicia sesión
            </Button>
            {" "}para hacer una reserva
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
