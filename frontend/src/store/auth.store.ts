import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState } from '@/interfaces/auth.interface';
import { User } from '@/interfaces/user.interface'; // Importamos la versión completa del User

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      // Registramos el token y el usuario completo (con firstName y lastName)
      setAuth: (token: string, user: User) => set({ 
        token, 
        user 
      }),

      logout: () => {
        // Al setear a null, persist actualiza automáticamente el localStorage por nosotros
        set({ token: null, user: null });
        
        // Opcional: Limpiar cualquier rastro de cookies o estados adicionales
        // No es estrictamente necesario borrar el item manual si usamos set({ ...null })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Evitamos problemas de hidratación en Next.js asegurando que 
      // el estado solo se cargue en el cliente
    }
  )
);