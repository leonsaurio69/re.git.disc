import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard, Users, Map, Calendar, DollarSign, 
  Settings, LogOut, Shield, MapPin, Loader2, AlertCircle 
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
import { useAuth } from "@/lib/auth-context";
import { adminApi, toursApi } from "@/lib/api";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, tab: "overview" as const },
  { title: "Usuarios", icon: Users, tab: "users" as const },
  { title: "Tours", icon: Map, tab: "tours" as const },
  { title: "Reservas", icon: Calendar, tab: "bookings" as const },
  { title: "Finanzas", icon: DollarSign, tab: "finances" as const },
  { title: "Configuración", icon: Settings, tab: "settings" as const },
];

type TabType = "overview" | "users" | "tours" | "bookings" | "finances" | "settings";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      setLocation("/login");
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: () => adminApi.getStats(),
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: () => adminApi.getUsers(),
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: allBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/admin/bookings"],
    queryFn: () => adminApi.getAllBookings(),
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: tours } = useQuery({
    queryKey: ["/api/tours"],
    queryFn: () => toursApi.getAll(),
    enabled: isAuthenticated && user?.role === "admin",
  });

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  const displayUsers: UserData[] = users?.map((u: any) => ({
    id: u.id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    status: "active",
    createdAt: u.createdAt || new Date().toISOString(),
  })) || [];

  const displayBookings: Booking[] = allBookings?.map((booking: any) => ({
    id: booking.id.toString(),
    tourTitle: booking.tour?.title || "Tour",
    tourLocation: booking.tour?.location || "Ubicación",
    clientName: booking.user?.name || "Cliente",
    date: booking.date,
    guests: booking.guests,
    totalPrice: booking.totalPrice,
    status: booking.status,
  })) || [];

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
                        onClick={() => setActiveTab(item.tab)}
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
                <SidebarMenuButton onClick={handleLogout} data-testid="sidebar-admin-logout">
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
              <span className="text-sm text-muted-foreground">Admin: {user?.name}</span>
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Panel de Administración</h1>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatsCard
                    title="Total Usuarios"
                    value={stats?.totalUsers || displayUsers.length}
                    icon={Users}
                    subtitle="Usuarios registrados"
                    trend={{ value: 15, isPositive: true }}
                  />
                  <StatsCard
                    title="Tours Activos"
                    value={stats?.totalTours || tours?.length || 0}
                    icon={Map}
                    subtitle="Tours publicados"
                    trend={{ value: 8, isPositive: true }}
                  />
                  <StatsCard
                    title="Reservas Totales"
                    value={stats?.totalBookings || displayBookings.length}
                    icon={Calendar}
                    subtitle="Reservas realizadas"
                    trend={{ value: 23, isPositive: true }}
                  />
                  <StatsCard
                    title="Ingresos Totales"
                    value={`$${stats?.totalRevenue || displayBookings.reduce((acc, b) => acc + b.totalPrice, 0)}`}
                    icon={DollarSign}
                    subtitle="Ganancias totales"
                    trend={{ value: 18, isPositive: true }}
                  />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Usuarios Recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {usersLoading ? (
                        <div className="flex h-32 items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : displayUsers.length > 0 ? (
                        <UsersTable users={displayUsers.slice(0, 5)} onAction={(id, action) => console.log(action, id)} />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No hay usuarios registrados</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Reservas Recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {bookingsLoading ? (
                        <div className="flex h-32 items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : displayBookings.length > 0 ? (
                        <BookingsTable bookings={displayBookings.slice(0, 5)} userRole="admin" />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-center">
                          <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No hay reservas aún</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
                {usersLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : displayUsers.length > 0 ? (
                  <UsersTable users={displayUsers} onAction={(id, action) => console.log(action, id)} />
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <Users className="mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">No hay usuarios registrados</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Todas las Reservas</h1>
                {bookingsLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : displayBookings.length > 0 ? (
                  <BookingsTable bookings={displayBookings} userRole="admin" />
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">No hay reservas aún</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {(activeTab === "tours" || activeTab === "finances" || activeTab === "settings") && (
              <div className="flex h-64 items-center justify-center">
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Esta sección estará disponible pronto
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
