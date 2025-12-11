import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  LayoutDashboard, Map, Calendar, DollarSign, 
  Settings, LogOut, Plus, MapPin, Loader2, AlertCircle,
  User, FileText, Upload, CheckCircle, Clock, XCircle,
  Star, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StatsCard } from "@/components/StatsCard";
import { BookingsTable, type Booking } from "@/components/BookingsTable";
import { TourCard } from "@/components/TourCard";
import { TourForm } from "@/components/TourForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
  DialogHeader,
  DialogTitle,
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
  { title: "Perfil", icon: User, tab: "profile" as const },
  { title: "Mis Tours", icon: Map, tab: "tours" as const },
  { title: "Reservas", icon: Calendar, tab: "bookings" as const },
  { title: "Ganancias", icon: DollarSign, tab: "earnings" as const },
  { title: "Documentos", icon: FileText, tab: "documents" as const },
];

type TabType = "overview" | "profile" | "tours" | "bookings" | "earnings" | "documents";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  approved: "bg-green-500/10 text-green-600 dark:text-green-400",
  rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
  suspended: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

const statusLabels: Record<string, string> = {
  pending: "Pendiente de Aprobación",
  approved: "Aprobado",
  rejected: "Rechazado",
  suspended: "Suspendido",
};

export default function GuideDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if not authenticated or wrong role - but only after auth is fully loaded
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    } else if (!authLoading && isAuthenticated && user?.role !== "guide") {
      // User has wrong role, redirect to correct dashboard
      if (user?.role === "user") {
        setLocation("/dashboard");
      } else if (user?.role === "admin") {
        setLocation("/admin/dashboard");
      }
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

  const { data: guideProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/guide/profile"],
    queryFn: () => guidesApi.getProfile(),
    enabled: isAuthenticated && user?.role === "guide",
  });

  const { data: earnings } = useQuery({
    queryKey: ["/api/guide/earnings"],
    queryFn: () => guidesApi.getEarnings(),
    enabled: isAuthenticated && user?.role === "guide",
  });

  const { data: documents } = useQuery({
    queryKey: ["/api/guide/documents"],
    queryFn: () => guidesApi.getDocuments(),
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

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => guidesApi.updateProfile(data),
    onSuccess: () => {
      toast({ title: "Perfil actualizado" });
      queryClient.invalidateQueries({ queryKey: ["/api/guide/profile"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      bookingsApi.updateStatus(id, status),
    onSuccess: () => {
      toast({ title: "Reserva actualizada" });
      queryClient.invalidateQueries({ queryKey: ["/api/guide/bookings"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const handleBookingAction = (id: string, action: string) => {
    const numId = parseInt(id);
    if (action === "confirm") {
      updateBookingMutation.mutate({ id: numId, status: "confirmed" });
    } else if (action === "complete") {
      updateBookingMutation.mutate({ id: numId, status: "completed" });
    } else if (action === "cancel") {
      updateBookingMutation.mutate({ id: numId, status: "cancelled" });
    }
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
    active: tour.active,
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

  const profileStatus = guideProfile?.status || "pending";
  const isApproved = profileStatus === "approved";

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
                        className={activeTab === item.tab ? "bg-sidebar-accent" : ""}
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
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-guide-sidebar-toggle" />
              {!isApproved && (
                <Badge className={statusColors[profileStatus]}>
                  {statusLabels[profileStatus]}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Hola, {user?.name}</span>
              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {!isApproved && (
              <Card className="mb-6 border-yellow-500/50 bg-yellow-500/5">
                <CardContent className="flex items-center gap-4 p-4">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="font-medium">Tu cuenta está pendiente de aprobación</p>
                    <p className="text-sm text-muted-foreground">
                      Completa tu perfil y sube los documentos requeridos para acelerar el proceso.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h1 className="text-2xl font-bold">Dashboard de Guía</h1>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        data-testid="button-create-tour"
                        disabled={!isApproved}
                        title={!isApproved ? "Tu cuenta debe estar aprobada para crear tours" : ""}
                      >
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
                    value={stats?.totalTours || displayTours.filter(t => t.active).length}
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
                    title="Calificación"
                    value={stats?.averageRating?.toFixed(1) || "0.0"}
                    icon={Star}
                    subtitle={`${stats?.totalReviews || 0} reseñas`}
                  />
                  <StatsCard
                    title="Ganancias Netas"
                    value={`$${stats?.netEarnings || 0}`}
                    icon={DollarSign}
                    subtitle="Este mes"
                    trend={{ value: 12, isPositive: true }}
                  />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
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
                        <div className="space-y-3">
                          {displayBookings.slice(0, 5).map((booking) => (
                            <div 
                              key={booking.id} 
                              className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                            >
                              <div>
                                <p className="font-medium">{booking.tourTitle}</p>
                                <p className="text-sm text-muted-foreground">
                                  {booking.clientName} - {booking.guests} personas
                                </p>
                              </div>
                              <Badge variant="outline">{booking.status}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <AlertCircle className="mb-4 h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No tienes reservas aún</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Resumen de Ganancias</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Ingresos Totales</span>
                          <span className="font-bold">${earnings?.totalEarnings || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Comisiones Plataforma</span>
                          <span className="text-destructive">-${earnings?.totalCommissions || 0}</span>
                        </div>
                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Ganancias Netas</span>
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                              ${(earnings?.totalEarnings || 0) - (earnings?.totalCommissions || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Mi Perfil</h1>
                
                <div className="grid gap-6 lg:grid-cols-3">
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Información del Perfil</CardTitle>
                        <CardDescription>
                          Completa tu perfil para aumentar tu visibilidad
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {profileLoading ? (
                          <div className="flex h-32 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin" />
                          </div>
                        ) : (
                          <form 
                            className="space-y-4"
                            onSubmit={(e) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              updateProfileMutation.mutate({
                                businessName: formData.get("businessName"),
                                experience: formData.get("experience"),
                                specialties: (formData.get("specialties") as string)?.split(",").map(s => s.trim()),
                                languages: (formData.get("languages") as string)?.split(",").map(s => s.trim()),
                                certifications: (formData.get("certifications") as string)?.split(",").map(s => s.trim()),
                              });
                            }}
                          >
                            <div className="grid gap-4 md:grid-cols-2">
                              <div className="space-y-2">
                                <Label htmlFor="businessName">Nombre del Negocio</Label>
                                <Input 
                                  id="businessName" 
                                  name="businessName"
                                  defaultValue={guideProfile?.businessName || ""} 
                                  placeholder="Ej: Tours Aventura Perú"
                                  data-testid="input-business-name"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="languages">Idiomas (separados por coma)</Label>
                                <Input 
                                  id="languages" 
                                  name="languages"
                                  defaultValue={guideProfile?.languages?.join(", ") || ""} 
                                  placeholder="Español, Inglés, Francés"
                                  data-testid="input-languages"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="specialties">Especialidades (separadas por coma)</Label>
                              <Input 
                                id="specialties" 
                                name="specialties"
                                defaultValue={guideProfile?.specialties?.join(", ") || ""} 
                                placeholder="Trekking, Historia, Gastronomía"
                                data-testid="input-specialties"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="certifications">Certificaciones (separadas por coma)</Label>
                              <Input 
                                id="certifications" 
                                name="certifications"
                                defaultValue={guideProfile?.certifications?.join(", ") || ""} 
                                placeholder="Guía oficial, Primeros auxilios, Montañismo"
                                data-testid="input-certifications"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="experience">Experiencia</Label>
                              <Textarea 
                                id="experience" 
                                name="experience"
                                defaultValue={guideProfile?.experience || ""} 
                                placeholder="Describe tu experiencia como guía turístico..."
                                rows={4}
                                data-testid="input-experience"
                              />
                            </div>
                            <Button 
                              type="submit" 
                              disabled={updateProfileMutation.isPending}
                              data-testid="button-save-profile"
                            >
                              {updateProfileMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : null}
                              Guardar Cambios
                            </Button>
                          </form>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Estado de Verificación</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          {profileStatus === "approved" ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : profileStatus === "rejected" ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          )}
                          <div>
                            <p className="font-medium">{statusLabels[profileStatus]}</p>
                            <p className="text-sm text-muted-foreground">
                              {profileStatus === "pending" 
                                ? "Tu perfil está siendo revisado" 
                                : profileStatus === "approved"
                                ? "Puedes crear y publicar tours"
                                : "Contacta soporte para más información"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Completitud del perfil</span>
                            <span className="font-medium">
                              {guideProfile?.profileCompleteness || 0}%
                            </span>
                          </div>
                          <Progress value={guideProfile?.profileCompleteness || 0} />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Estadísticas</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Tours Completados</span>
                          <span className="font-bold">{stats?.completedBookings || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Total Clientes</span>
                          <span className="font-bold">{stats?.totalClients || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Calificación</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold">{stats?.averageRating?.toFixed(1) || "0.0"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "tours" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h1 className="text-2xl font-bold">Mis Tours</h1>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        data-testid="button-create-tour-2"
                        disabled={!isApproved}
                        title={!isApproved ? "Tu cuenta debe estar aprobada para crear tours" : ""}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Tour
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-auto sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Crear Nuevo Tour</DialogTitle>
                      </DialogHeader>
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
                      <div key={tour.id} className="relative">
                        {!tour.active && (
                          <Badge 
                            variant="secondary" 
                            className="absolute right-2 top-2 z-10"
                          >
                            Inactivo
                          </Badge>
                        )}
                        <TourCard {...tour} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <Map className="mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="mb-4 text-muted-foreground">
                        {isApproved 
                          ? "No has creado ningún tour aún"
                          : "Tu cuenta debe estar aprobada para crear tours"}
                      </p>
                      {isApproved && (
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Crear mi primer tour
                        </Button>
                      )}
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
                    onAction={handleBookingAction}
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

            {activeTab === "earnings" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Ganancias</h1>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <StatsCard
                    title="Ingresos Totales"
                    value={`$${earnings?.totalEarnings || 0}`}
                    icon={DollarSign}
                    subtitle="Histórico"
                  />
                  <StatsCard
                    title="Comisiones"
                    value={`$${earnings?.totalCommissions || 0}`}
                    icon={TrendingUp}
                    subtitle="10% de cada reserva"
                  />
                  <StatsCard
                    title="Ganancias Netas"
                    value={`$${(earnings?.totalEarnings || 0) - (earnings?.totalCommissions || 0)}`}
                    icon={DollarSign}
                    subtitle="Después de comisiones"
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Historial de Pagos</CardTitle>
                    <CardDescription>
                      Tus pagos recibidos y pendientes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {earnings?.payouts?.length > 0 ? (
                      <div className="space-y-3">
                        {earnings.payouts.map((payout: any) => (
                          <div 
                            key={payout.id} 
                            className="flex items-center justify-between rounded-lg border p-4"
                          >
                            <div>
                              <p className="font-medium">${payout.amount}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(payout.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge 
                              variant={payout.status === "paid" ? "default" : "secondary"}
                            >
                              {payout.status === "paid" ? "Pagado" : "Pendiente"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <DollarSign className="mb-4 h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No hay pagos registrados</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Documentos</h1>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Documentos Requeridos</CardTitle>
                    <CardDescription>
                      Sube los documentos necesarios para completar tu verificación
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {["identity", "license", "certificate", "insurance"].map((docType) => {
                        const doc = documents?.find((d: any) => d.type === docType);
                        const labels: Record<string, string> = {
                          identity: "Documento de Identidad",
                          license: "Licencia de Guía",
                          certificate: "Certificación Turística",
                          insurance: "Seguro de Responsabilidad",
                        };
                        
                        return (
                          <Card key={docType}>
                            <CardContent className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">{labels[docType]}</p>
                                  {doc ? (
                                    <p className="text-sm text-muted-foreground">
                                      {doc.verified ? "Verificado" : "Pendiente de verificación"}
                                    </p>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">No subido</p>
                                  )}
                                </div>
                              </div>
                              {doc ? (
                                doc.verified ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <Clock className="h-5 w-5 text-yellow-500" />
                                )
                              ) : (
                                <Button size="sm" variant="outline">
                                  <Upload className="mr-2 h-4 w-4" />
                                  Subir
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
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
