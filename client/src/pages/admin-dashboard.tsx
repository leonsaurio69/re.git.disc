import { useState } from "react";
import { Link } from "wouter";
import { 
  LayoutDashboard, Users, Map, Calendar, DollarSign, 
  Settings, LogOut, Shield, MapPin, TrendingUp 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StatsCard } from "@/components/StatsCard";
import { BookingsTable, type Booking } from "@/components/BookingsTable";
import { UsersTable, type UserData } from "@/components/UsersTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// todo: remove mock functionality
const mockUsers: UserData[] = [
  { id: "u1", name: "Carlos Mendoza", email: "carlos@example.com", role: "guide", status: "active", createdAt: "2023-06-15" },
  { id: "u2", name: "Ana García", email: "ana@example.com", role: "client", status: "active", createdAt: "2023-08-20" },
  { id: "u3", name: "Pedro López", email: "pedro@example.com", role: "guide", status: "pending", createdAt: "2024-01-05" },
  { id: "u4", name: "María Sánchez", email: "maria@example.com", role: "client", status: "active", createdAt: "2023-11-10" },
];

// todo: remove mock functionality
const mockBookings: Booking[] = [
  { id: "b1", tourTitle: "Machu Picchu Adventure", tourLocation: "Cusco, Perú", clientName: "Ana García", date: "2024-01-15", guests: 2, totalPrice: 598, status: "confirmed" },
  { id: "b2", tourTitle: "Beach Paradise Tour", tourLocation: "Cancún, México", clientName: "Pedro López", date: "2024-01-18", guests: 4, totalPrice: 396, status: "pending" },
  { id: "b3", tourTitle: "Rome Historical Walk", tourLocation: "Roma, Italia", clientName: "María Sánchez", date: "2024-01-10", guests: 3, totalPrice: 447, status: "completed" },
];

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard },
  { title: "Usuarios", icon: Users },
  { title: "Tours", icon: Map },
  { title: "Reservas", icon: Calendar },
  { title: "Finanzas", icon: DollarSign },
  { title: "Configuración", icon: Settings },
];

type TabType = "overview" | "users" | "bookings";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b p-4">
            <Link href="/" className="flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="font-bold">TourExplora</span>
            </Link>
            <Badge variant="secondary" className="mt-2">
              <Shield className="mr-1 h-3 w-3" />
              Admin
            </Badge>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Administración</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => {
                          if (item.title === "Dashboard") setActiveTab("overview");
                          else if (item.title === "Usuarios") setActiveTab("users");
                          else if (item.title === "Reservas") setActiveTab("bookings");
                        }}
                        data-testid={`sidebar-admin-${item.title.toLowerCase()}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto border-t p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton data-testid="sidebar-admin-logout">
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center justify-between gap-4 border-b px-4">
            <SidebarTrigger data-testid="button-admin-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Panel de Administración</h1>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatsCard
                    title="Ingresos Totales"
                    value="$45,230"
                    subtitle="Este mes"
                    icon={DollarSign}
                    trend={{ value: 15, isPositive: true }}
                  />
                  <StatsCard
                    title="Usuarios Activos"
                    value="1,234"
                    icon={Users}
                    trend={{ value: 8, isPositive: true }}
                  />
                  <StatsCard
                    title="Tours Publicados"
                    value="89"
                    icon={Map}
                    trend={{ value: 12, isPositive: true }}
                  />
                  <StatsCard
                    title="Reservas"
                    value="456"
                    subtitle="Este mes"
                    icon={Calendar}
                    trend={{ value: 5, isPositive: true }}
                  />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Actividad Reciente
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { action: "Nuevo guía registrado", user: "Pedro López", time: "hace 5 min" },
                          { action: "Reserva confirmada", user: "Ana García", time: "hace 15 min" },
                          { action: "Tour creado", user: "Carlos Mendoza", time: "hace 1 hora" },
                          { action: "Pago procesado", user: "María Sánchez", time: "hace 2 horas" },
                        ].map((activity, i) => (
                          <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                            <div>
                              <p className="font-medium">{activity.action}</p>
                              <p className="text-sm text-muted-foreground">{activity.user}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">{activity.time}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Estadísticas de Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-primary" />
                            <span>Clientes</span>
                          </div>
                          <span className="font-medium">1,089</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                            <span>Guías</span>
                          </div>
                          <span className="font-medium">142</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-orange-500" />
                            <span>Administradores</span>
                          </div>
                          <span className="font-medium">3</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h2 className="mb-4 text-xl font-semibold">Usuarios Recientes</h2>
                  <UsersTable users={mockUsers.slice(0, 4)} />
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
                <UsersTable users={mockUsers} />
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Todas las Reservas</h1>
                <BookingsTable bookings={mockBookings} userRole="admin" />
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
