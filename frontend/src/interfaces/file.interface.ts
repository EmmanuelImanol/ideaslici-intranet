import { User } from "./user.interface";

// 1. Interfaz base para evitar repeticiones
interface BaseFile {
  id: number;
  originalName: string;
  size: number;
  createdAt: string;
}

// 2. Interfaz completa para la metadata (lo que usas en el listado general)
export interface FileMetadata extends BaseFile {
  title: string;
  category: string;
  description?: string;
  storageName: string;
  mimeType: string; // Unificamos a camelCase como en NestJS
}

// 3. Interfaz para el Feed de Actividad (con la relación cargada)
export interface FileActivity extends BaseFile {
  // 🛠️ SOLUCIÓN: Eliminamos 'any' y usamos la relación 'uploadedBy' que definiste en Nest
  uploadedBy: User; 
  mimeType: string;
  filename: string;
}

// 4. Interfaz para la respuesta del servidor al subir
export interface FileUploadResponse {
  message: string;
  data: FileMetadata;
}