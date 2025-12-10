import { DollarSign, Users, Calendar, Star } from "lucide-react";
import { StatsCard } from "../StatsCard";

export default function StatsCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Ingresos Totales"
        value="$12,450"
        subtitle="Este mes"
        icon={DollarSign}
        trend={{ value: 12, isPositive: true }}
      />
      <StatsCard
        title="Reservas"
        value="48"
        subtitle="Este mes"
        icon={Calendar}
        trend={{ value: 8, isPositive: true }}
      />
      <StatsCard
        title="Clientes"
        value="156"
        subtitle="Total"
        icon={Users}
        trend={{ value: 5, isPositive: true }}
      />
      <StatsCard
        title="Calificación"
        value="4.8"
        subtitle="Promedio"
        icon={Star}
      />
    </div>
  );
}
