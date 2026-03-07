import { Role } from './user.interface';

export interface NavItem {
  label: string;
  href: string;
  icon: string; 
  allowedRoles: Role[];
}

export const SIDEBAR_LINKS: NavItem[] = [
  { 
    label: 'Dashboard', 
    href: '/dashboard', 
    icon: 'dashboard', 
    allowedRoles: [Role.ADMIN, Role.GERENTE, Role.EMPLEADO] 
  },
  { 
    label: 'Usuarios', 
    href: '/dashboard/users', 
    icon: 'users', 
    allowedRoles: [Role.ADMIN] 
  },
  // 🛠️ NUEVA RUTA: Gestión de Áreas
  { 
    label: 'Áreas', 
    href: '/dashboard/areas',
    icon: 'areas', 
    allowedRoles: [Role.ADMIN] 
  },
  { 
    label: 'Archivos', 
    href: '/dashboard/files', 
    icon: 'files', 
    allowedRoles: [Role.ADMIN, Role.GERENTE, Role.EMPLEADO] 
  },
];