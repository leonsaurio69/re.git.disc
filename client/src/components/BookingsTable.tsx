import { Calendar, MapPin, User, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface Booking {
  id: string;
  tourTitle: string;
  tourLocation: string;
  clientName: string;
  clientAvatar?: string;
  date: string;
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

interface BookingsTableProps {
  bookings: Booking[];
  userRole: "guide" | "client" | "admin";
  onAction?: (bookingId: string, action: string) => void;
}

const statusLabels: Record<Booking["status"], string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

const statusVariants: Record<Booking["status"], "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  confirmed: "default",
  completed: "outline",
  cancelled: "destructive",
};

export function BookingsTable({ bookings, userRole, onAction }: BookingsTableProps) {
  const handleAction = (bookingId: string, action: string) => {
    if (onAction) {
      onAction(bookingId, action);
    } else {
      console.log("Booking action:", { bookingId, action });
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tour</TableHead>
            {userRole !== "client" && <TableHead>Cliente</TableHead>}
            <TableHead>Fecha</TableHead>
            <TableHead className="text-center">Viajeros</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id} data-testid={`row-booking-${booking.id}`}>
              <TableCell>
                <div>
                  <p className="font-medium">{booking.tourTitle}</p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {booking.tourLocation}
                  </p>
                </div>
              </TableCell>
              {userRole !== "client" && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={booking.clientAvatar} alt={booking.clientName} />
                      <AvatarFallback>{booking.clientName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{booking.clientName}</span>
                  </div>
                </TableCell>
              )}
              <TableCell>
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-3 w-3" />
                  {booking.date}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <User className="h-3 w-3" />
                  {booking.guests}
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">
                ${booking.totalPrice}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariants[booking.status]}>
                  {statusLabels[booking.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid={`button-booking-actions-${booking.id}`}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleAction(booking.id, "view")}>
                      Ver Detalles
                    </DropdownMenuItem>
                    {booking.status === "pending" && userRole === "guide" && (
                      <DropdownMenuItem onClick={() => handleAction(booking.id, "confirm")}>
                        Confirmar
                      </DropdownMenuItem>
                    )}
                    {booking.status !== "cancelled" && booking.status !== "completed" && (
                      <DropdownMenuItem
                        onClick={() => handleAction(booking.id, "cancel")}
                        className="text-destructive"
                      >
                        Cancelar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
