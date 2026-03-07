import { User } from "./user.interface";
import { Area } from "./area.interface"; // 🛠️ Importante importar la interfaz de Area

// 1. Interfaz base para evitar repeticiones
interface BaseFile {
  id: number;
  originalName: string;
  size: number;
  createdAt: string;
}

// 2. Interfaz completa para la metadata (Lo que usas en el listado y el visor)
export interface FileMetadata extends BaseFile {
  title: string;
  storageName: string;
  mimeType: string;
  description?: string;
  areaId: number;   // 🛠️ Agregado para el manejo de IDs
  area?: Area;      // 🛠️ SOLUCIÓN: Agregamos la relación para que TS reconozca 'file.area'
}

// 3. Interfaz para el Feed de Actividad (Con el usuario que subió)
export interface FileActivity extends BaseFile {
  uploadedBy: User; 
  mimeType: string;
  filename: string;
}

// 4. Interfaz para la respuesta del servidor al subir
export interface FileUploadResponse {
  message: string;
  data: FileMetadata;
}