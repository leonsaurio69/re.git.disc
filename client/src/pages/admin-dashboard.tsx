import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  LayoutDashboard, Users, Map, Calendar, DollarSign, 
  Settings, LogOut, Shield, MapPin, Loader2, AlertCircle,
  UserCheck, FileText, Check, X, Eye, TrendingUp, Percent
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StatsCard } from "@/components/StatsCard";
import { BookingsTable, type Booking } from "@/components/BookingsTable";
import { UsersTable, type UserData } from "@/components/UsersTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth-context";
import { adminApi, toursApi } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, tab: "overview" as const },
  { title: "Guías Pendientes", icon: UserCheck, tab: "pending-guides" as const },
  { title: "Usuarios", icon: Users, tab: "users" as const },
  { title: "Tours", icon: Map, tab: "tours" as const },
  { title: "Reservas", icon: Calendar, tab: "bookings" as const },
  { title: "Finanzas", icon: DollarSign, tab: "finances" as const },
  { title: "Configuración", icon: Settings, tab: "settings" as const },
];

type TabType = "overview" | "pending-guides" | "users" | "tours" | "bookings" | "finances" | "settings";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  approved: "bg-green-500/10 text-green-600 dark:text-green-400",
  rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
  active: "bg-green-500/10 text-green-600 dark:text-green-400",
  inactive: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedGuide, setSelectedGuide] = useState<any>(null);
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Redirect if not authenticated or wrong role - but only after auth is fully loaded
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    } else if (!authLoading && isAuthenticated && user?.role !== "admin") {
      // User has wrong role, redirect to correct dashboard
      if (user?.role === "user") {
        setLocation("/dashboard");
      } else if (user?.role === "guide") {
        setLocation("/guide/dashboard");
      }
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

  const { data: tours, isLoading: toursLoading } = useQuery({
    queryKey: ["/api/admin/tours"],
    queryFn: () => adminApi.getAllTours(),
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: pendingGuides, isLoading: pendingLoading } = useQuery({
    queryKey: ["/api/admin/guides/pending"],
    queryFn: () => adminApi.getPendingGuides(),
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: commissionData } = useQuery({
    queryKey: ["/api/admin/settings/commission"],
    queryFn: () => adminApi.getCommissionRate(),
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: revenue } = useQuery({
    queryKey: ["/api/admin/revenue"],
    queryFn: () => adminApi.getRevenue(),
    enabled: isAuthenticated && user?.role === "admin",
  });

  useEffect(() => {
    if (commissionData?.commissionRate) {
      setCommissionRate(commissionData.commissionRate);
    }
  }, [commissionData]);

  const approveGuideMutation = useMutation({
    mutationFn: (userId: number) => adminApi.approveGuide(userId),
    onSuccess: () => {
      toast({ title: "Guía aprobado exitosamente" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guides/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedGuide(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const rejectGuideMutation = useMutation({
    mutationFn: (userId: number) => adminApi.rejectGuide(userId),
    onSuccess: () => {
      toast({ title: "Guía rechazado" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/guides/pending"] });
      setSelectedGuide(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleUserMutation = useMutation({
    mutationFn: (userId: number) => adminApi.toggleUserActive(userId),
    onSuccess: () => {
      toast({ title: "Estado de usuario actualizado" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateCommissionMutation = useMutation({
    mutationFn: (rate: number) => adminApi.setCommissionRate(rate),
    onSuccess: () => {
      toast({ title: "Comisión actualizada" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/commission"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const handleUserAction = (id: string, action: string) => {
    const numId = parseInt(id);
    if (action === "toggle") {
      toggleUserMutation.mutate(numId);
    }
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
    status: u.active ? "active" : "inactive",
    createdAt: u.createdAt || new Date().toISOString(),
    guideStatus: u.guideProfile?.status,
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

  const pendingCount = pendingGuides?.length || 0;

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
                        data-testid={`sidebar-admin-${item.title.toLowerCase().replace(" ", "-")}`}
                        className={activeTab === item.tab ? "bg-sidebar-accent" : ""}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                        {item.tab === "pending-guides" && pendingCount > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {pendingCount}
                          </Badge>
                        )}
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
                    title="Guías Pendientes"
                    value={stats?.pendingGuides || pendingCount}
                    icon={UserCheck}
                    subtitle="Por aprobar"
                    trend={{ value: pendingCount, isPositive: false }}
                  />
                  <StatsCard
                    title="Tours Activos"
                    value={stats?.totalTours || tours?.length || 0}
                    icon={Map}
                    subtitle="Tours publicados"
                    trend={{ value: 8, isPositive: true }}
                  />
                  <StatsCard
                    title="Comisiones"
                    value={`$${stats?.totalCommissions || revenue?.totalCommissions || 0}`}
                    icon={DollarSign}
                    subtitle="Ganancias plataforma"
                    trend={{ value: 18, isPositive: true }}
                  />
                </div>

                {pendingCount > 0 && (
                  <Card className="border-yellow-500/50 bg-yellow-500/5">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <UserCheck className="h-8 w-8 text-yellow-500" />
                        <div>
                          <p className="font-medium">
                            {pendingCount} guía{pendingCount > 1 ? "s" : ""} pendiente{pendingCount > 1 ? "s" : ""} de aprobación
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Revisa y aprueba las solicitudes de nuevos guías
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => setActiveTab("pending-guides")}
                        data-testid="button-view-pending-guides"
                      >
                        Ver Solicitudes
                      </Button>
                    </CardContent>
                  </Card>
                )}

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
                        <div className="space-y-3">
                          {displayUsers.slice(0, 5).map((u) => (
                            <div 
                              key={u.id} 
                              className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                            >
                              <div>
                                <p className="font-medium">{u.name}</p>
                                <p className="text-sm text-muted-foreground">{u.email}</p>
                              </div>
                              <Badge variant="outline">{u.role}</Badge>
                            </div>
                          ))}
                        </div>
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
                      <CardTitle>Resumen Financiero</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Ingresos Totales</span>
                        <span className="font-bold">${revenue?.totalRevenue || stats?.totalRevenue || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Comisiones ({commissionRate}%)</span>
                        <span className="font-bold text-green-600 dark:text-green-400">
                          ${revenue?.totalCommissions || stats?.totalCommissions || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Reservas Completadas</span>
                        <span className="font-bold">{revenue?.completedBookings || stats?.completedBookings || 0}</span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Pagos a Guías Pendientes</span>
                          <span className="text-lg font-bold">
                            ${revenue?.pendingPayouts || 0}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "pending-guides" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Guías Pendientes de Aprobación</h1>

                {pendingLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : pendingGuides && pendingGuides.length > 0 ? (
                  <div className="grid gap-4">
                    {pendingGuides.map((item: any) => (
                      <Card key={item.profile.id}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-4">
                              <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                  <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-semibold">{item.user?.name}</h3>
                                  <p className="text-sm text-muted-foreground">{item.user?.email}</p>
                                </div>
                              </div>

                              <div className="grid gap-2 md:grid-cols-3">
                                {item.profile.businessName && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Negocio</p>
                                    <p className="font-medium">{item.profile.businessName}</p>
                                  </div>
                                )}
                                {item.profile.languages?.length > 0 && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Idiomas</p>
                                    <p className="font-medium">{item.profile.languages.join(", ")}</p>
                                  </div>
                                )}
                                {item.profile.specialties?.length > 0 && (
                                  <div>
                                    <p className="text-sm text-muted-foreground">Especialidades</p>
                                    <p className="font-medium">{item.profile.specialties.join(", ")}</p>
                                  </div>
                                )}
                              </div>

                              {item.documents?.length > 0 && (
                                <div>
                                  <p className="mb-2 text-sm text-muted-foreground">
                                    Documentos ({item.documents.length})
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {item.documents.map((doc: any) => (
                                      <Badge 
                                        key={doc.id} 
                                        variant={doc.verified ? "default" : "secondary"}
                                      >
                                        <FileText className="mr-1 h-3 w-3" />
                                        {doc.name}
                                        {doc.verified && <Check className="ml-1 h-3 w-3" />}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => setSelectedGuide(item)}
                                data-testid={`button-view-guide-${item.profile.userId}`}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Detalles
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600"
                                onClick={() => approveGuideMutation.mutate(item.profile.userId)}
                                disabled={approveGuideMutation.isPending}
                                data-testid={`button-approve-guide-${item.profile.userId}`}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive"
                                onClick={() => rejectGuideMutation.mutate(item.profile.userId)}
                                disabled={rejectGuideMutation.isPending}
                                data-testid={`button-reject-guide-${item.profile.userId}`}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Rechazar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <UserCheck className="mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">No hay guías pendientes de aprobación</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
                
                <Tabs defaultValue="all" className="w-full">
                  <TabsList>
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="clients">Clientes</TabsTrigger>
                    <TabsTrigger value="guides">Guías</TabsTrigger>
                    <TabsTrigger value="admins">Admins</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="mt-4">
                    {usersLoading ? (
                      <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <UsersTable 
                        users={displayUsers} 
                        onAction={handleUserAction} 
                      />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="clients" className="mt-4">
                    <UsersTable 
                      users={displayUsers.filter(u => u.role === "client")} 
                      onAction={handleUserAction} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="guides" className="mt-4">
                    <UsersTable 
                      users={displayUsers.filter(u => u.role === "guide")} 
                      onAction={handleUserAction} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="admins" className="mt-4">
                    <UsersTable 
                      users={displayUsers.filter(u => u.role === "admin")} 
                      onAction={handleUserAction} 
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {activeTab === "tours" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Gestión de Tours</h1>
                
                {toursLoading ? (
                  <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : tours && tours.length > 0 ? (
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tour</TableHead>
                            <TableHead>Guía</TableHead>
                            <TableHead>Precio</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tours.map((tour: any) => (
                            <TableRow key={tour.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{tour.title}</p>
                                  <p className="text-sm text-muted-foreground">{tour.location}</p>
                                </div>
                              </TableCell>
                              <TableCell>{tour.guide?.name || "N/A"}</TableCell>
                              <TableCell>${tour.price}</TableCell>
                              <TableCell>
                                <Badge className={tour.active ? statusColors.active : statusColors.inactive}>
                                  {tour.active ? "Activo" : "Inactivo"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => setLocation(`/tours/${tour.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                      <Map className="mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">No hay tours registrados</p>
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

            {activeTab === "finances" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Finanzas</h1>

                <div className="grid gap-4 md:grid-cols-3">
                  <StatsCard
                    title="Ingresos Totales"
                    value={`$${revenue?.totalRevenue || stats?.totalRevenue || 0}`}
                    icon={DollarSign}
                    subtitle="Histórico"
                  />
                  <StatsCard
                    title="Comisiones Ganadas"
                    value={`$${revenue?.totalCommissions || stats?.totalCommissions || 0}`}
                    icon={TrendingUp}
                    subtitle={`${commissionRate}% por reserva`}
                  />
                  <StatsCard
                    title="Pagos Pendientes"
                    value={`$${revenue?.pendingPayouts || 0}`}
                    icon={DollarSign}
                    subtitle="Por pagar a guías"
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Configuración de Comisiones</CardTitle>
                    <CardDescription>
                      Establece el porcentaje de comisión que cobra la plataforma
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="commission">Porcentaje de Comisión</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="commission"
                            type="number"
                            min="0"
                            max="100"
                            value={commissionRate}
                            onChange={(e) => setCommissionRate(Number(e.target.value))}
                            className="w-24"
                            data-testid="input-commission-rate"
                          />
                          <Percent className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <Button
                        onClick={() => updateCommissionMutation.mutate(commissionRate)}
                        disabled={updateCommissionMutation.isPending}
                        data-testid="button-save-commission"
                      >
                        {updateCommissionMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Guardar
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Esta comisión se aplicará a todas las nuevas reservas. Los cambios no afectan reservas existentes.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Configuración</h1>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración General</CardTitle>
                    <CardDescription>
                      Ajusta la configuración de la plataforma
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">Comisión de Plataforma</p>
                        <p className="text-sm text-muted-foreground">
                          Porcentaje que cobra la plataforma por cada reserva
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-lg">
                        {commissionRate}%
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div>
                        <p className="font-medium">Moneda Principal</p>
                        <p className="text-sm text-muted-foreground">
                          Moneda utilizada para todas las transacciones
                        </p>
                      </div>
                      <Badge variant="secondary">USD</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </main>
        </div>
      </div>

      <Dialog open={!!selectedGuide} onOpenChange={() => setSelectedGuide(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Guía</DialogTitle>
            <DialogDescription>
              Revisa la información del guía antes de aprobar
            </DialogDescription>
          </DialogHeader>
          
          {selectedGuide && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Nombre</Label>
                  <p className="font-medium">{selectedGuide.user?.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedGuide.user?.email}</p>
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <p className="font-medium">{selectedGuide.user?.phone || "No especificado"}</p>
                </div>
                <div>
                  <Label>Ubicación</Label>
                  <p className="font-medium">{selectedGuide.user?.location || "No especificada"}</p>
                </div>
              </div>

              {selectedGuide.profile?.businessName && (
                <div>
                  <Label>Nombre del Negocio</Label>
                  <p className="font-medium">{selectedGuide.profile.businessName}</p>
                </div>
              )}

              {selectedGuide.profile?.experience && (
                <div>
                  <Label>Experiencia</Label>
                  <p className="text-sm">{selectedGuide.profile.experience}</p>
                </div>
              )}

              {selectedGuide.documents?.length > 0 && (
                <div>
                  <Label>Documentos Subidos</Label>
                  <div className="mt-2 space-y-2">
                    {selectedGuide.documents.map((doc: any) => (
                      <div 
                        key={doc.id} 
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{doc.name}</span>
                        </div>
                        <Badge variant={doc.verified ? "default" : "secondary"}>
                          {doc.verified ? "Verificado" : "Pendiente"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedGuide(null)}>
              Cerrar
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectGuideMutation.mutate(selectedGuide?.profile?.userId)}
              disabled={rejectGuideMutation.isPending}
            >
              Rechazar
            </Button>
            <Button
              onClick={() => approveGuideMutation.mutate(selectedGuide?.profile?.userId)}
              disabled={approveGuideMutation.isPending}
            >
              {approveGuideMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Aprobar Guía
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
