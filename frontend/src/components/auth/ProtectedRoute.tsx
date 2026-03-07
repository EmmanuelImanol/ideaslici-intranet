'use client';

import { useAuthStore } from '@/store/auth.store';
import { useHydration } from '@/hooks/useHydration';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, token } = useAuthStore();
  const isHydrated = useHydration();
  const router = useRouter();

  useEffect(() => {
    // EL CAMBIO CLAVE: Solo redirigimos si YA terminó de leer el disco (isHydrated)
    // y realmente no encontró un token.
    if (isHydrated && !token) {
      console.log('🚫 Guardia: No hay token en el disco. Redirigiendo al Login.');
      router.replace('/login');
    }

    // Validación de roles
    if (isHydrated && allowedRoles && user && !allowedRoles.includes(user.role)) {
      console.log('🚫 Guardia: Rol no permitido.');
      router.replace('/unauthorized');
    }
  }, [isHydrated, token, user, allowedRoles, router]);

  // 1. Mientras el sistema está "despertando" (leyendo localStorage), 
  // no mostramos nada para evitar el parpadeo.
  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-blue-500 animate-pulse font-medium">Verificando acceso...</div>
      </div>
    );
  }

  // 2. Si ya hidrató pero no hay token, bloqueamos el renderizado 
  // mientras el useEffect hace la redirección.
  if (!token) return null;

  // 3. Si todo está bien, mostramos el contenido protegido.
  return <>{children}</>;
}