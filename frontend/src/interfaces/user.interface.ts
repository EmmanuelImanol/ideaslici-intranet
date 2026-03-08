import { Area } from "./area.interface";

export enum Role {
  ADMIN = 'admin',
  GERENTE = 'gerente',
  EMPLEADO = 'empleado'
}

export interface ApiErrorResponse {
  message: string | string[];
  error: string;
  statusCode: number;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  area?: Area;
  createdAt?: string;
  updatedAt?: string;
}

// Interfaz para la creación (omitimos el ID y fechas que genera el server)
export interface CreateUserDto extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  password: string;
  areaId?: number;
}

export type UpdateUserDto = Partial<CreateUserDto>;