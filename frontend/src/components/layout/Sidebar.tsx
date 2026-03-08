'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { SIDEBAR_LINKS } from '@/interfaces/navigation.interface';
import {
  LuLayoutDashboard,
  LuUsers,
  LuFileText,
  LuLogOut,
  LuMenu,
  LuX,
  LuLayers // 🛠️ Importamos el nuevo icono
} from 'react-icons/lu';
import { IconType } from 'react-icons';

const APP_NAME = "NEXUS";

const ICON_MAP: Record<string, IconType> = {
  dashboard: LuLayoutDashboard,
  users: LuUsers,
  files: LuFileText,
  areas: LuLayers, // 🛠️ Mapeamos el icono para el gestor de áreas
};

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  if (!user) return null;

  const filteredLinks = SIDEBAR_LINKS.filter((link) =>
    link.allowedRoles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <>
      {/* Botón Móvil (Hamburguesa) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 rounded-xl bg-slate-900 p-2.5 text-white lg:hidden shadow-2xl border border-slate-700 active:scale-95 transition-transform"
      >
        {isOpen ? <LuX size={22} /> : <LuMenu size={22} />}
      </button>

      {/* Overlay con Blur para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-md lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Contenedor Sidebar */}
      {/* Contenedor Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-45 w-72 bg-slate-950 text-slate-300 transition-all duration-300 ease-in-out border-r border-slate-800 lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
      >
        {/* Agregamos overflow-hidden al padre para que no scrollee todo el aside, sino solo el nav */}
        <div className="flex h-full flex-col overflow-hidden pb-safe">

          {/* Header de Identidad NEXUS (Mantenemos flex-shrink-0 para que no se aplaste) */}
          <div className="flex shrink-0 flex-col items-center justify-center py-8 px-6">
            <div className="bg-blue-600 p-2 rounded-xl mb-3 shadow-lg shadow-blue-900/40">
              <LuLayers className="text-white" size={28} />
            </div>
            <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">
              {APP_NAME}<span className="text-blue-500">.</span>
            </h2>
          </div>

          {/* Menú de Navegación (flex-1 y overflow-y-auto permite que esta sea la única parte que scrollea) */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-4 custom-scrollbar">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
              Menú Principal
            </p>
            {filteredLinks.map((link) => {
              const Icon = ICON_MAP[link.icon] || LuFileText;
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'hover:bg-slate-900 hover:text-white text-slate-400'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={20} />
                    {link.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Perfil de Usuario y Logout (flex-shrink-0 para que NUNCA se esconda) */}
          <div className="shrink-0 border-t border-slate-900 bg-slate-950 p-4 space-y-3">
            <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-slate-900/40 border border-slate-800/50">
              <div className="h-9 w-9 rounded-xl bg-linear-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/20 text-white font-black text-sm shrink-0">
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-white truncate leading-none mb-1">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-[9px] text-blue-500 truncate uppercase font-black tracking-widest">
                  {user.area?.name || 'Nexus User'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-red-500/5 px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 transition-all duration-300 hover:bg-red-500 hover:text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-95 border border-red-500/20"
            >
              {/* Efecto de brillo interno al hacer hover */}
              <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />

              <LuLogOut size={18} className="transition-transform group-hover:-translate-x-1" />
              <span>Finalizar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}