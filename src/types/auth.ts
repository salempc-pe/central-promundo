export const SUPER_ADMIN_EMAIL = "paulosalem8@gmail.com";

export type EstadoAcceso = "pendiente" | "aprobado" | "denegado";
export type RolUsuario = "admin" | "broker_senior" | "broker_junior";

export interface SolicitudAcceso {
  id: string;
  authId?: string | null;
  nombre: string;
  email: string;
  avatarUrl?: string | null;
  rol: RolUsuario;
  estadoAcceso: EstadoAcceso;
  fechaSolicitud: string | Date;
  fechaResolucion?: string | Date | null;
  resueltoPor?: string | null;
  notas?: string | null;
  activo: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AuthSessionUser {
  id: string;
  email: string;
  nombre: string;
  avatarUrl?: string | null;
  rol: RolUsuario;
  estadoAcceso: EstadoAcceso;
  isSuperAdmin: boolean;
}
