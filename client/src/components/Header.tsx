import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, Search, X, User, LogIn, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  isLoggedIn?: boolean;
  userRole?: "client" | "guide" | "admin";
  userName?: string;
}

export function Header({ isLoggedIn = false, userRole, userName }: HeaderProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold" data-testid="text-logo">TourExplora</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden flex-1 max-w-md md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar destinos, tours..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search"
              />
            </div>
          </form>

          <nav className="hidden items-center gap-2 md:flex">
            <Link href="/tours">
              <Button variant="ghost" data-testid="link-tours">Explorar</Button>
            </Link>
            {!isLoggedIn ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" data-testid="link-login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button data-testid="link-register">Registrarse</Button>
                </Link>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid="button-user-menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem data-testid="menu-item-profile">
                    Mi Perfil
                  </DropdownMenuItem>
                  {userRole === "guide" && (
                    <DropdownMenuItem data-testid="menu-item-my-tours">
                      Mis Tours
                    </DropdownMenuItem>
                  )}
                  {userRole === "client" && (
                    <DropdownMenuItem data-testid="menu-item-my-bookings">
                      Mis Reservas
                    </DropdownMenuItem>
                  )}
                  {userRole === "admin" && (
                    <DropdownMenuItem data-testid="menu-item-admin">
                      Panel Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem data-testid="menu-item-logout">
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <ThemeToggle />
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar destinos, tours..."
                  className="w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-mobile"
                />
              </div>
            </form>
            <nav className="flex flex-col gap-2">
              <Link href="/tours">
                <Button variant="ghost" className="w-full justify-start">Explorar</Button>
              </Link>
              {!isLoggedIn ? (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="w-full justify-start">
                      <LogIn className="mr-2 h-4 w-4" />
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full">Registrarse</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/profile">
                    <Button variant="ghost" className="w-full justify-start">Mi Perfil</Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start text-destructive">
                    Cerrar Sesión
                  </Button>
                </>
              )}
              <div className="flex justify-start pt-2">
                <ThemeToggle />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
