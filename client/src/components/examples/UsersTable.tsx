import { UsersTable, type UserData } from "../UsersTable";

const mockUsers: UserData[] = [
  {
    id: "u1",
    name: "Carlos Mendoza",
    email: "carlos@example.com",
    role: "guide",
    status: "active",
    createdAt: "2023-06-15",
  },
  {
    id: "u2",
    name: "Ana García",
    email: "ana@example.com",
    role: "client",
    status: "active",
    createdAt: "2023-08-20",
  },
  {
    id: "u3",
    name: "Pedro López",
    email: "pedro@example.com",
    role: "guide",
    status: "pending",
    createdAt: "2024-01-05",
  },
  {
    id: "u4",
    name: "Admin Principal",
    email: "admin@tourexplora.com",
    role: "admin",
    status: "active",
    createdAt: "2023-01-01",
  },
];

export default function UsersTableExample() {
  return (
    <div className="w-full">
      <UsersTable users={mockUsers} />
    </div>
  );
}
