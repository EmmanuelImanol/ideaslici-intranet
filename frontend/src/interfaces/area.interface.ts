import { FileMetadata } from "./file.interface";

export interface Area {
  id: number;
  name: string;
  colorClass: string;
  createdAt: string;
  // Relación opcional: solo vendrá si haces un "LeftJoin" en el backend
  files?: FileMetadata[]; 
  // Podrías añadir un contador para no traer todos los archivos
  _count?: {
    files: number;
    users: number;
  };
}

// Útil para los formularios de creación (omitimos el ID y fechas)
export type CreateAreaInput = Omit<Area, 'id' | 'createdAt' | 'files' | '_count'>;

// Útil para actualizaciones (todos los campos opcionales)
export type UpdateAreaInput = Partial<CreateAreaInput>;