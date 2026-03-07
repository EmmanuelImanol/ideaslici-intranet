import { IconType } from 'react-icons';

export interface StatCard {
  label: string;
  value: string;
  icon: IconType;
  color: string;
  bg: string;
  allowedRoles: string[]; // Para que el Dashboard también sea dinámico
}