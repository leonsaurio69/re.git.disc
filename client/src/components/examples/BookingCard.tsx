import { BookingCard } from "../BookingCard";

export default function BookingCardExample() {
  return (
    <div className="w-full max-w-sm">
      <BookingCard
        tourTitle="Aventura en Machu Picchu"
        pricePerPerson={299}
        maxGroupSize={12}
      />
    </div>
  );
}
