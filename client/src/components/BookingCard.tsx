import { useState } from "react";
import { Calendar, Users, CreditCard, Check } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface BookingCardProps {
  tourTitle: string;
  pricePerPerson: number;
  maxGroupSize: number;
  onBook?: (data: { date: string; guests: number }) => void;
}

export function BookingCard({ tourTitle, pricePerPerson, maxGroupSize, onBook }: BookingCardProps) {
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const totalPrice = pricePerPerson * guests;
  const serviceFee = Math.round(totalPrice * 0.1);
  const grandTotal = totalPrice + serviceFee;

  const handleBook = () => {
    setIsLoading(true);
    if (onBook) {
      onBook({ date, guests });
    } else {
      console.log("Booking:", { date, guests, totalPrice: grandTotal });
    }
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">${pricePerPerson}</span>
          <span className="text-base font-normal text-muted-foreground">/ persona</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="booking-date">Fecha del Tour</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="booking-date"
              type="date"
              className="pl-10"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              data-testid="input-booking-date"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="booking-guests">Número de Viajeros</Label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="booking-guests"
              type="number"
              min={1}
              max={maxGroupSize}
              className="pl-10"
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
              data-testid="input-booking-guests"
            />
          </div>
          <p className="text-xs text-muted-foreground">Máximo {maxGroupSize} personas por grupo</p>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>${pricePerPerson} x {guests} viajeros</span>
            <span>${totalPrice}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tarifa de servicio</span>
            <span>${serviceFee}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span data-testid="text-booking-total">${grandTotal}</span>
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <Button
          className="w-full"
          size="lg"
          onClick={handleBook}
          disabled={!date || isLoading}
          data-testid="button-confirm-booking"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {isLoading ? "Procesando..." : "Reservar Ahora"}
        </Button>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <Check className="h-3 w-3" />
          Cancelación gratuita hasta 24h antes
        </p>
      </CardFooter>
    </Card>
  );
}
