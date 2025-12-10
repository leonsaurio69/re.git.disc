import { BookingsTable, type Booking } from "../BookingsTable";

const mockBookings: Booking[] = [
  {
    id: "b1",
    tourTitle: "Machu Picchu Adventure",
    tourLocation: "Cusco, Perú",
    clientName: "Ana García",
    date: "2024-01-15",
    guests: 2,
    totalPrice: 598,
    status: "confirmed",
  },
  {
    id: "b2",
    tourTitle: "Beach Paradise Tour",
    tourLocation: "Cancún, México",
    clientName: "Pedro López",
    date: "2024-01-18",
    guests: 4,
    totalPrice: 396,
    status: "pending",
  },
  {
    id: "b3",
    tourTitle: "Rome Historical Walk",
    tourLocation: "Roma, Italia",
    clientName: "María Sánchez",
    date: "2024-01-10",
    guests: 3,
    totalPrice: 447,
    status: "completed",
  },
];

export default function BookingsTableExample() {
  return (
    <div className="w-full">
      <BookingsTable bookings={mockBookings} userRole="guide" />
    </div>
  );
}
