import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { UserRoleType, SafeUser } from "@shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET || "tourexplora-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface JwtPayload {
  userId: number;
  email: string;
  role: UserRoleType;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(user: SafeUser): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role as UserRoleType,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

// Authentication middleware
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No autorizado. Token no proporcionado." });
  }

  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({ message: "No autorizado. Token inválido o expirado." });
  }

  req.user = payload;
  next();
}

// Role validation middleware factory
export function requireRole(...roles: UserRoleType[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autorizado." });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "Acceso denegado. No tienes permisos para esta acción." 
      });
    }

    next();
  };
}

// Remove password from user object
export function sanitizeUser(user: any): SafeUser {
  const { password, ...safeUser } = user;
  return safeUser;
}
