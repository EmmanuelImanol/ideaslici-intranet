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
  LuChevronRight,
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
      <aside
        className={`fixed left-0 top-0 z-45 h-screen w-72 bg-slate-950 text-slate-300 transition-all duration-300 ease-in-out border-r border-slate-800 lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
      >
        <div className="flex h-full flex-col">

          {/* Header de Identidad NEXUS */}
          <div className="flex flex-col items-center justify-center py-10 px-6">
            <div className="bg-blue-600 p-2 rounded-xl mb-3 shadow-lg shadow-blue-900/40">
              {/* Cambiamos el icono estático por uno que represente NEXUS o dejamos el Dashboard */}
              <LuLayers className="text-white" size={28} />
            </div>
            <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">
              {APP_NAME}<span className="text-blue-500">.</span>
            </h2>
            <div className="mt-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {user.role} Portal
              </span>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-4 custom-scrollbar">
            <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
              Menú Principal
            </p>
            {filteredLinks.map((link) => {
              // Si el icono no está en el mapa, usamos uno por defecto
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
                    <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-blue-400 transition-colors'} />
                    {link.label}
                  </div>
                  {isActive && <LuChevronRight size={16} className="animate-in slide-in-from-left-2" />}
                </Link>
              );
            })}
          </nav>

          {/* Perfil de Usuario y Logout */}
          <div className="border-t border-slate-900 p-6 space-y-4">
            <div className="flex items-center gap-3 px-2">
              <div className="h-9 w-9 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-600/20 text-blue-500 font-black text-sm">
                {user.firstName ? user.firstName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-white truncate">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-[10px] text-slate-500 truncate uppercase font-bold tracking-tighter">
                  Área: {user.area?.name || 'S/A'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-400 transition-all hover:bg-red-500/10 active:scale-95"
            >
              <LuLogOut size={20} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}