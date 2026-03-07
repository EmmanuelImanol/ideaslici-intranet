import { Area } from 'src/areas/entities/area.entity';
import { Role } from 'src/common/interfaces/roles.enum';

export interface JwtPayload {
  sub: number; // ID del usuario
  email: string;
  role: Role; // El rol proveniente de tu Enum
  area?: Area;
  iat?: number; // Issued at (opcional)
  exp?: number; // Expiration (opcional)
}
