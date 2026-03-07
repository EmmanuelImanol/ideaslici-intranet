import { Area } from 'src/areas/entities/area.entity';

export interface LoginResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    role: string;
    area: Area;
    firstName: string;
    lastName: string;
  };
}
