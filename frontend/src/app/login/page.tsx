'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { LoginDto } from '@/interfaces/auth.dto';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false); // Estado para el botón

  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // 1. Iniciamos estado de carga
    setIsLoading(true);

    try {
      // 2. Realizamos la petición única al servicio
      const data = await authService.login(formData);
      if (data.access_token && data.user) {
        // 3. Guardamos en Zustand (esto sincroniza con localStorage)
        setAuth(data.access_token, data.user);
        toast.success(`Bienvenido, ${data.user.firstName}`);
        // 4. Delay de 150ms para asegurar la persistencia en disco
        // Esto evita que el Middleware o ProtectedRoute redirija al login por falta de token
        setTimeout(() => {
          router.replace('/dashboard');
        }, 150);

      } else {
        toast.error('Error en la comunicación con el servidor');
      }

    } catch (error: unknown) {
      // Manejo de errores tipado (sin any)
      let errorMessage = 'Credenciales incorrectas o error de conexión';

      if (error instanceof Error) {
        // Si usas Axios, podrías extraer el mensaje del servidor específicamente
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || error.message;
      }
      toast.error(errorMessage);
    } finally {
      // Solo detenemos el loading si el componente no ha sido desmontado por la redirección
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-6 rounded-xl bg-slate-800 p-8 shadow-2xl border border-slate-700"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tighter uppercase">Intranet</h1>
          <p className="text-slate-400 mt-2">Inicia sesión para continuar</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              disabled={isLoading}
              className="w-full rounded-lg bg-slate-700 border-none text-white p-3 focus:ring-2 focus:ring-blue-500 transition-all outline-none disabled:opacity-50"
              placeholder="ejemplo@intranet.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              required
              disabled={isLoading}
              className="w-full rounded-lg bg-slate-700 border-none text-white p-3 focus:ring-2 focus:ring-blue-500 transition-all outline-none disabled:opacity-50"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
        </button>
      </form>
    </div>
  );
}