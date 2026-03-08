'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { authService } from '@/services/auth.service';
import { LoginDto } from '@/interfaces/auth.dto';
import toast from 'react-hot-toast';
import axios, { AxiosError } from 'axios';
import { LuLoaderCircle, LuCircleAlert } from 'react-icons/lu';
import { ApiErrorResponse } from '@/interfaces/user.interface';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false); // Estado para Recordarme

  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: '',
  });

  // 🛠️ Efecto para cargar el email guardado
  useEffect(() => {
    const savedEmail = localStorage.getItem('nexus_remember_email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await authService.login(formData);
      
      if (data.access_token && data.user) {
        // Lógica de Recordarme
        if (rememberMe) {
          localStorage.setItem('nexus_remember_email', formData.email);
        } else {
          localStorage.removeItem('nexus_remember_email');
        }

        setAuth(data.access_token, data.user);
        toast.success(`Bienvenido, ${data.user.firstName}`);
        
        setTimeout(() => {
          router.replace('/dashboard');
        }, 150);
      }
    } catch (error: unknown) {
      let finalMessage = 'Error de conexión con el servidor';

      // 🛠️ Cero 'any': Usamos AxiosError con el genérico de nuestra interfaz
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<ApiErrorResponse>;
        const message = serverError.response?.data?.message;
        
        finalMessage = Array.isArray(message) 
          ? message[0] 
          : message || serverError.message;
      }

      setErrorMsg(finalMessage);
      toast.error(finalMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-6 rounded-[2.5rem] bg-slate-800 p-10 shadow-2xl border border-slate-700 animate-in fade-in zoom-in-95 duration-500"
        noValidate
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">NEXUS.ID</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">Módulo de Autenticación</p>
        </div>

        {/* 🛠️ ALERTA DE ERROR VISUAL */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 animate-shake">
            <LuCircleAlert className="text-red-500 shrink-0" size={18} />
            <p className="text-xs font-bold text-red-400 uppercase tracking-tight">{errorMsg}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Email Corporativo</label>
            <input
              type="email"
              name="email"
              required
              disabled={isLoading}
              className="w-full rounded-2xl bg-slate-700/50 border border-slate-600 text-white p-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none disabled:opacity-50 font-bold text-sm"
              placeholder="usuario@nexus.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Contraseña</label>
            <input
              type="password"
              name="password"
              required
              disabled={isLoading}
              className="w-full rounded-2xl bg-slate-700/50 border border-slate-600 text-white p-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none disabled:opacity-50 font-bold text-sm"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* 🛠️ CHECKBOX DE RECORDARME */}
          <div className="flex items-center gap-2 ml-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="remember" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer select-none">
              Recordar mi usuario
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-2xl bg-blue-600 py-5 font-black text-white uppercase text-[10px] tracking-[0.2em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20 disabled:bg-slate-700 disabled:text-slate-500 flex items-center justify-center gap-3 active:scale-95"
        >
          {isLoading ? <LuLoaderCircle className="animate-spin" size={18} /> : 'Entrar al Sistema'}
        </button>
      </form>
    </div>
  );
}