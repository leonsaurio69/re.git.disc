import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  LayoutDashboard, Map, Calendar, DollarSign, 
  Settings, LogOut, Plus, MapPin, Loader2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StatsCard } from "@/components/StatsCard";
import { BookingsTable, type Booking } from "@/components/BookingsTable";
import { TourCard } from "@/components/TourCard";
import { TourForm } from "@/components/TourForm";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";
import { toursApi, bookingsApi, guidesApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import defaultTourImage from "@assets/generated_images/machu_picchu_dramatic_sunrise.png";
import defaultGuideImage from "@assets/generated_images/latino_male_tour_guide_portrait.png";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, tab: "overview" as const },
  { title: "Mis Tours", icon: Map, tab: "tours" as const },
  { title: "Reservas", icon: Calendar, tab: "bookings" as const },
  { title: "Ganancias", icon: DollarSign, tab: "earnings" as const },
  { title: "Configuración", icon: Settings, tab: "settings" as const },
];

type TabType = "overview" | "tours" | "bookings" | "earnings" | "settings";

export default function GuideDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "guide")) {
      setLocation("/login");
    }
  }, [authLoading, isAuthenticated, user, setLocation]);

  const { data: myTours, isLoading: toursLoading } = useQuery({
    queryKey: ["/api/guide/tours"],
    queryFn: () => toursApi.getMyTours(),
    enabled: isAuthenticated && user?.role === "guide",
  });

  const { data: guideBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/guide/bookings"],
    queryFn: () => bookingsApi.getGuideBookings(),
    enabled: isAuthenticated && user?.role === "guide",
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/guide/stats"],
    queryFn: () => guidesApi.getStats(),
    enabled: isAuthenticated && user?.role === "guide",
  });

  const createTourMutation = useMutation({
    mutationFn: (data: any) => toursApi.create(data),
    onSuccess: () => {
      toast({ title: "Tour creado exitosamente" });
      setIsCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/guide/tours"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
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

  if (!isAuthenticated || user?.role !== "guide") {
    return null;
  }

  const displayTours = myTours?.map((tour: any) => ({
    id: tour.id,
    title: tour.title,
    location: tour.location,
    price: tour.price,
    duration: tour.duration,
    maxGroupSize: tour.maxGroupSize || 10,
    rating: tour.rating || 0,
    reviewCount: tour.reviewCount || 0,
    imageUrl: tour.imageUrl || defaultTourImage,
    guideAvatarUrl: user?.avatarUrl || defaultGuideImage,
    guideName: user?.name || "Guía",
  })) || [];

  const displayBookings: Booking[] = guideBookings?.map((booking: any) => ({
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
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Panel de Guía</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => setActiveTab(item.tab)}
                        data-testid={`sidebar-guide-${item.title.toLowerCase().replace(" ", "-")}`}
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
                <SidebarMenuButton onClick={handleLogout} data-testid="sidebar-guide-logout">
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center justify-between gap-4 border-b px-4">
            <SidebarTrigger data-testid="button-guide-sidebar-toggle" />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hola, {user?.name}</span>
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h1 className="text-2xl font-bold">Dashboard de Guía</h1>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-create-tour">
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Tour
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-[600px]">
                      <TourForm onSubmit={(data) => createTourMutation.mutate(data)} />
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatsCard
                    title="Tours Activos"
                    value={stats?.totalTours || displayTours.length}
                    icon={Map}
                    subtitle="Tours publicados"
                  />
                  <StatsCard
                    title="Reservas Pendientes"
                    value={stats?.pendingBookings || displayBookings.filter(b => b.status === "pending").length}
                    icon={Calendar}
                    subtitle="Por confirmar"
                    trend={{ value: 5, isPositive: true }}
                  />
                  <StatsCard
                    title="Clientes Este Mes"
                    value={stats?.clientsThisMonth || displayBookings.reduce((acc, b) => acc + b.guests, 0)}
                    icon={MapPin}
                    subtitle="Viajeros"
                  />
                  <StatsCard
                    title="Ingresos del Mes"
                    value={`$${stats?.revenueThisMonth || displayBookings.reduce((acc, b) => acc + b.totalPrice, 0)}`}
                    icon={DollarSign}
                    subtitle="Ganancias"
                    trend={{ value: 12, isPositive: true }}
                  />
                </div>

                <div>
                  <h2 className="mb-4 text-xl font-semibold">Reservas Recientes</h2>
                  {bookingsLoading ? (
                    <div className="flex h-32 items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : displayBookings.length > 0 ? (
                    <BookingsTable
                      bookings={displayBookings.slice(0, 5)}
                      userRole="guide"
                      onAction={(id, action) => console.log(action, id)}
                    />
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                        <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No tienes reservas aún</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {activeTab === "tours" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h1 className="text-2xl font-bold">Mis Tours</h1>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-create-tour-2">
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Tour
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-[600px]">
                      <TourForm onSubmit={(data) => createTourMutation.mutate(data)} />
                    </DialogContent>
                  </Dialog>
                </div>

                {toursLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : displayTours.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {displayTours.map((tour: any) => (
                      <TourCard key={tour.id} {...tour} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <Map className="mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="mb-4 text-muted-foreground">
                        No has creado ningún tour aún
                      </p>
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Crear mi primer tour
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Mis Reservas</h1>
                {bookingsLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : displayBookings.length > 0 ? (
                  <BookingsTable
                    bookings={displayBookings}
                    userRole="guide"
                    onAction={(id, action) => console.log(action, id)}
                  />
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">No tienes reservas aún</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {(activeTab === "earnings" || activeTab === "settings") && (
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
