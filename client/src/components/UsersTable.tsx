import { MoreHorizontal, Shield, User, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface UserData {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "client" | "guide" | "admin";
  status: "active" | "inactive" | "pending";
  createdAt: string;
}

interface UsersTableProps {
  users: UserData[];
  onAction?: (userId: string, action: string) => void;
}

const roleLabels: Record<UserData["role"], string> = {
  client: "Cliente",
  guide: "Guía",
  admin: "Administrador",
};

const roleIcons: Record<UserData["role"], typeof User> = {
  client: User,
  guide: Compass,
  admin: Shield,
};

const statusLabels: Record<UserData["status"], string> = {
  active: "Activo",
  inactive: "Inactivo",
  pending: "Pendiente",
};

const statusVariants: Record<UserData["status"], "default" | "secondary" | "destructive"> = {
  active: "default",
  inactive: "destructive",
  pending: "secondary",
};

export function UsersTable({ users, onAction }: UsersTableProps) {
  const handleAction = (userId: string, action: string) => {
    if (onAction) {
      onAction(userId, action);
    } else {
      console.log("User action:", { userId, action });
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Registro</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const RoleIcon = roleIcons[user.role];
            return (
              <TableRow key={user.id} data-testid={`row-user-${user.id}`}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="gap-1">
                    <RoleIcon className="h-3 w-3" />
                    {roleLabels[user.role]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariants[user.status]}>
                    {statusLabels[user.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.createdAt}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" data-testid={`button-user-actions-${user.id}`}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAction(user.id, "view")}>
                        Ver Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction(user.id, "edit")}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.status === "active" ? (
                        <DropdownMenuItem
                          onClick={() => handleAction(user.id, "deactivate")}
                          className="text-destructive"
                        >
                          Desactivar
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleAction(user.id, "activate")}>
                          Activar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
