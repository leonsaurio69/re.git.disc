import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Map, Calendar, DollarSign, Users, 
  Settings, LogOut, Plus, Menu, MapPin 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { StatsCard } from "@/components/StatsCard";
import { BookingsTable, type Booking } from "@/components/BookingsTable";
import { TourCard } from "@/components/TourCard";
import { TourForm } from "@/components/TourForm";
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

import machuPicchu from "@assets/generated_images/machu_picchu_dramatic_sunrise.png";
import maleGuide from "@assets/generated_images/latino_male_tour_guide_portrait.png";

// todo: remove mock functionality
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
    tourTitle: "Valle Sagrado Tour",
    tourLocation: "Cusco, Perú",
    clientName: "Pedro López",
    date: "2024-01-18",
    guests: 4,
    totalPrice: 316,
    status: "pending",
  },
  {
    id: "b3",
    tourTitle: "Machu Picchu Adventure",
    tourLocation: "Cusco, Perú",
    clientName: "María Sánchez",
    date: "2024-01-10",
    guests: 3,
    totalPrice: 897,
    status: "completed",
  },
];

// todo: remove mock functionality
const myTours = [
  {
    id: "t1",
    title: "Aventura Épica en Machu Picchu",
    location: "Cusco, Perú",
    price: 299,
    duration: "4 días",
    maxGroupSize: 12,
    rating: 4.9,
    reviewCount: 128,
    imageUrl: machuPicchu,
    guideAvatarUrl: maleGuide,
    guideName: "Carlos Mendoza",
    featured: true,
  },
  {
    id: "t2",
    title: "Valle Sagrado y Mercado de Pisac",
    location: "Cusco, Perú",
    price: 79,
    duration: "1 día",
    maxGroupSize: 10,
    rating: 4.6,
    reviewCount: 67,
    imageUrl: machuPicchu,
    guideAvatarUrl: maleGuide,
    guideName: "Carlos Mendoza",
  },
];

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/guide/dashboard" },
  { title: "Mis Tours", icon: Map, href: "/guide/tours" },
  { title: "Reservas", icon: Calendar, href: "/guide/bookings" },
  { title: "Ganancias", icon: DollarSign, href: "/guide/earnings" },
  { title: "Configuración", icon: Settings, href: "/guide/settings" },
];

type TabType = "overview" | "tours" | "bookings";

export default function GuideDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => {
                          if (item.title === "Dashboard") setActiveTab("overview");
                          else if (item.title === "Mis Tours") setActiveTab("tours");
                          else if (item.title === "Reservas") setActiveTab("bookings");
                        }}
                        data-testid={`sidebar-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
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
                <SidebarMenuButton data-testid="sidebar-logout">
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
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
                      <TourForm onSubmit={() => setIsCreateDialogOpen(false)} />
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatsCard
                    title="Ingresos del Mes"
                    value="$2,450"
                    icon={DollarSign}
                    trend={{ value: 12, isPositive: true }}
                  />
                  <StatsCard
                    title="Reservas"
                    value="18"
                    subtitle="Este mes"
                    icon={Calendar}
                    trend={{ value: 8, isPositive: true }}
                  />
                  <StatsCard
                    title="Tours Activos"
                    value="2"
                    icon={Map}
                  />
                  <StatsCard
                    title="Calificación"
                    value="4.9"
                    subtitle="Promedio"
                    icon={Users}
                  />
                </div>

                <div>
                  <h2 className="mb-4 text-xl font-semibold">Reservas Recientes</h2>
                  <BookingsTable bookings={mockBookings.slice(0, 3)} userRole="guide" />
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
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
                      <TourForm onSubmit={() => setIsCreateDialogOpen(false)} />
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {myTours.map((tour) => (
                    <TourCard key={tour.id} {...tour} />
                  ))}
                </div>
              </div>
            )}

            {activeTab === "bookings" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Todas las Reservas</h1>
                <BookingsTable bookings={mockBookings} userRole="guide" />
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
