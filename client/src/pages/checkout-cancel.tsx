import { useLocation } from "wouter";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CheckoutCancel() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
            <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl" data-testid="text-checkout-cancel-title">
            Pago Cancelado
          </CardTitle>
          <CardDescription className="text-base">
            El proceso de pago fue cancelado. No se ha realizado ningún cargo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Si tuviste algún problema durante el pago o cambiaste de opinión, 
            puedes volver a intentarlo o explorar otros tours.
          </p>
          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={() => window.history.back()} data-testid="button-try-again">
              <RefreshCw className="mr-2 h-4 w-4" />
              Intentar de Nuevo
            </Button>
            <Button variant="outline" onClick={() => setLocation("/tours")} data-testid="button-back-to-tours">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Tours
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
