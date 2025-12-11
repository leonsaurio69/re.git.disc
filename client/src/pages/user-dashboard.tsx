import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard, Calendar, User, Settings, LogOut, MapPin, 
  Loader2, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { bookingsApi } from "@/lib/api";
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

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  confirmed: "default",
  completed: "outline",
  cancelled: "destructive",
};

export default function UserDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated or wrong role - but only after auth is fully loaded
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    } else if (!authLoading && isAuthenticated && user?.role !== "user") {
      // User has wrong role, redirect to correct dashboard
      if (user?.role === "guide") {
        setLocation("/guide/dashboard");
      } else if (user?.role === "admin") {
        setLocation("/admin/dashboard");
      }
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["/api/bookings"],
    queryFn: () => bookingsApi.getMyBookings(),
    enabled: isAuthenticated,
  });

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton data-testid="sidebar-dashboard">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton data-testid="sidebar-bookings">
                      <Calendar className="h-4 w-4" />
                      <span>Mis Reservas</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton data-testid="sidebar-profile">
                      <User className="h-4 w-4" />
                      <span>Mi Perfil</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton data-testid="sidebar-settings">
                      <Settings className="h-4 w-4" />
                      <span>Configuración</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto border-t p-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} data-testid="sidebar-logout">
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center justify-between gap-4 border-b px-4">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Hola, {user?.name}
              </span>
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            <div className="space-y-6">
              <h1 className="text-2xl font-bold">Mi Dashboard</h1>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Reservas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{bookings?.length || 0}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Próximos Tours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {bookings?.filter(b => b.status === "confirmed").length || 0}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Tours Completados
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {bookings?.filter(b => b.status === "completed").length || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h2 className="mb-4 text-xl font-semibold">Mis Reservas</h2>
                {bookings && bookings.length > 0 ? (
                  <div className="grid gap-4">
                    {bookings.map((booking: any) => (
                      <Card key={booking.id}>
                        <CardContent className="flex items-center justify-between gap-4 p-4">
                          <div className="flex-1">
                            <h3 className="font-medium">{booking.tour?.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              <MapPin className="mr-1 inline h-3 w-3" />
                              {booking.tour?.location}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              <Calendar className="mr-1 inline h-3 w-3" />
                              {new Date(booking.date).toLocaleDateString("es")} - {booking.guests} viajeros
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={statusVariants[booking.status]}>
                              {statusLabels[booking.status]}
                            </Badge>
                            <p className="mt-1 text-lg font-bold">${booking.totalPrice}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="mb-4 text-muted-foreground">
                        Aún no tienes reservas. Explora nuestros tours y reserva tu próxima aventura.
                      </p>
                      <Link href="/tours">
                        <Button data-testid="button-explore-tours">Explorar Tours</Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
