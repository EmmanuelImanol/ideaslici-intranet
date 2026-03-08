'use client';

import { useAuthStore } from '@/store/auth.store';
import { StatCard } from '@/interfaces/dashboard.interface';
import { LuFiles, LuUsers, LuShieldCheck, LuArrowUpRight, LuClock } from 'react-icons/lu';
import { useHydration } from '@/hooks/useHydration';
import { useEffect, useState } from 'react';
import { filesService } from '@/services/files.service'; // Importación tipada
import { usersService } from '@/services/users.service';
import { FileActivity } from '@/interfaces/file.interface';

export default function DashboardPage() {
  const [fileCount, setFileCount] = useState<number | string>('--');
  const [userCount, setUserCount] = useState<number | string>('--');
  const [activities, setActivities] = useState<FileActivity[]>([]); // Tipado estricto
  
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isHydrated = useHydration();

  useEffect(() => {
    const fetchStats = async (): Promise<void> => {
      if (!isHydrated || !token) return;

      try {
        // 1. Cargamos lo que todos pueden ver
        const [fCount, recentData] = await Promise.all([
          filesService.getCount(),
          filesService.getRecent()
        ]);
        
        setFileCount(fCount);
        setActivities(recentData);

        // 2. Cargamos estadísticas de administración solo si el rol lo permite
        // Nota: Asegúrate de que 'admin' y 'gerente' coincidan con tu Enum del backend
        const privilegedRoles = ['admin', 'gerente', 'ADMIN', 'GERENTE']; 
        
        if (user?.role && privilegedRoles.includes(user.role)) {
          // Usamos el endpoint de conteo que ahora es simple en el backend
          const uCount = await usersService.getCount(); 
          setUserCount(uCount);
        }
      } catch (error: unknown) {
        console.error("Error en Dashboard:", error);
      }
    };

    fetchStats();
  }, [isHydrated, token, user?.role]);

  if (!isHydrated || !user || !token) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // Configuración de tarjetas filtradas por rol
  const statsConfig: StatCard[] = [
    {
      label: 'Repositorio de Archivos',
      value: fileCount.toString(),
      icon: LuFiles,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      allowedRoles: ['admin', 'gerente', 'empleado'],
    },
    {
      label: 'Usuarios del Sistema',
      value: userCount.toString(),
      icon: LuUsers,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      allowedRoles: ['admin', 'gerente'],
    },
    {
      label: 'Seguridad de Red',
      value: 'Activa',
      icon: LuShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      allowedRoles: ['admin'],
    },
  ];

  const visibleStats = statsConfig.filter(stat => stat.allowedRoles.includes(user.role));

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-8 animate-in fade-in duration-700">
      
      {/* SECCIÓN DE BIENVENIDA */}
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
          {user.role === 'empleado' ? 'Área de Colaboración' : 'Panel de Control'}
        </h1>
        <p className="text-slate-500 font-medium">
          Bienvenido, <span className="text-blue-600 font-bold">{user.firstName} {user.lastName}</span>
        </p>
      </header>

      {/* GRID DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {visibleStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm flex items-center gap-5">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* FEED DE ACTIVIDAD REAL */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Actividad Reciente
            <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-1 rounded-full uppercase">En vivo</span>
          </h3>
          <LuClock className="text-slate-300" />
        </div>

        <div className="divide-y divide-slate-50">
          {activities.length > 0 ? (
            activities.map((act) => (
              <div key={act.id} className="py-4 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <LuFiles size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{act.originalName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      Por {act.uploadedBy.firstName} {act.uploadedBy.lastName} • {new Date(act.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <LuArrowUpRight className="text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
            ))
          ) : (
            <p className="text-center py-6 text-slate-400 italic text-sm">No se detecta actividad aún.</p>
          )}
        </div>
      </div>
    </div>
  );
}