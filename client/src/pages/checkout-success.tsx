import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, ArrowRight, Loader2, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";

export default function CheckoutSuccess() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const bookingId = params.get("booking_id");
  const [retryCount, setRetryCount] = useState(0);

  const { data: booking, isLoading, refetch } = useQuery({
    queryKey: ["/api/bookings", bookingId],
    enabled: !!bookingId,
    refetchInterval: (data: any) => {
      if (data?.status === "confirmed" || data?.paymentStatus === "paid") {
        return false;
      }
      if (retryCount < 10) {
        return 2000;
      }
      return false;
    },
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
  }, []);

  useEffect(() => {
    if (booking && (booking.status === "pending" || booking.paymentStatus === "pending")) {
      setRetryCount(prev => prev + 1);
    }
  }, [booking]);

  const isConfirmed = booking?.status === "confirmed" || booking?.paymentStatus === "paid";
  const isPending = booking?.status === "pending" && booking?.paymentStatus === "pending";
  const isProcessing = isLoading || (isPending && retryCount < 10);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <Loader2 className="h-10 w-10 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <CardTitle className="text-2xl">Procesando Pago</CardTitle>
            <CardDescription className="text-base">
              Estamos confirmando tu pago con Stripe. Esto puede tomar unos segundos...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (isPending && retryCount >= 10) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
              <Clock className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
            </div>
            <CardTitle className="text-2xl">Pago en Proceso</CardTitle>
            <CardDescription className="text-base">
              Tu pago se está procesando. Esto puede tomar unos minutos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Si completaste el pago, tu reserva será confirmada automáticamente.
              Puedes revisar el estado en tu panel de reservas.
            </p>
            <div className="flex flex-col gap-2 pt-4">
              <Button onClick={() => refetch()} variant="outline" data-testid="button-check-again">
                Verificar Estado
              </Button>
              <Button onClick={() => setLocation("/dashboard")} data-testid="button-go-to-dashboard">
                Ver Mis Reservas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!bookingId || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl">Reserva No Encontrada</CardTitle>
            <CardDescription className="text-base">
              No pudimos encontrar los detalles de tu reserva.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/dashboard")} data-testid="button-go-to-dashboard">
              Ver Mis Reservas
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl" data-testid="text-checkout-success-title">
            Pago Exitoso
          </CardTitle>
          <CardDescription className="text-base">
            Tu reserva ha sido confirmada y pagada correctamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Recibirás un correo electrónico con los detalles de tu reserva. 
            El guía se pondrá en contacto contigo para coordinar los detalles del tour.
          </p>
          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={() => setLocation("/dashboard")} data-testid="button-go-to-dashboard">
              Ver Mis Reservas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setLocation("/tours")} data-testid="button-explore-more">
              Explorar Más Tours
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
