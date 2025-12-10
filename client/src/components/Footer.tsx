import { Link } from "wouter";
import { MapPin, Mail, Phone } from "lucide-react";
import { SiFacebook, SiInstagram, SiX } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Newsletter subscription submitted");
  };

  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">TourExplora</span>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Conectamos viajeros con guías locales para crear experiencias turísticas únicas e inolvidables.
            </p>
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" data-testid="link-facebook">
                <SiFacebook className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" data-testid="link-instagram">
                <SiInstagram className="h-5 w-5" />
              </Button>
              <Button size="icon" variant="ghost" data-testid="link-twitter">
                <SiX className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Explorar</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tours" className="text-muted-foreground hover:text-foreground">
                  Todos los Tours
                </Link>
              </li>
              <li>
                <Link href="/guides" className="text-muted-foreground hover:text-foreground">
                  Guías Turísticos
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="text-muted-foreground hover:text-foreground">
                  Destinos Populares
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-muted-foreground hover:text-foreground">
                  Categorías
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Soporte</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-foreground">
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/become-guide" className="text-muted-foreground hover:text-foreground">
                  Conviértete en Guía
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Newsletter</h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Recibe las mejores ofertas y destinos directamente en tu correo.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <Input
                type="email"
                placeholder="tu@email.com"
                data-testid="input-newsletter"
              />
              <Button type="submit" data-testid="button-subscribe">
                Suscribir
              </Button>
            </form>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                info@tourexplora.com
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +1 (555) 123-4567
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TourExplora. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
