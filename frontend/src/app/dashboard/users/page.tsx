'use client';

import { useState, useEffect, useMemo } from 'react';
import { LuSearch, LuUserPlus, LuTrash2, LuUserPen, LuLayers } from 'react-icons/lu';
import { usersService } from '@/services/users.service';
import { User, Role } from '@/interfaces/user.interface';
import toast from 'react-hot-toast';
import UserModal from '@/components/user/UserModal';
import { ConfirmDeleteModal } from '@/components/user/ConfirmDeleteModal';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (user: User): void => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleClose = (): void => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const stats = useMemo(() => {
    const total = users.length;
    const byArea: Record<string, { count: number; color: string }> = {};

    users.forEach((u) => {
      const areaName = u.area?.name || 'Sin Asignar';
      const areaColor = u.area?.colorClass || 'bg-slate-100 text-slate-500';
      if (!byArea[areaName]) {
        byArea[areaName] = { count: 0, color: areaColor };
      }
      byArea[areaName].count++;
    });

    return { total, byArea: Object.entries(byArea) };
  }, [users]);

  const loadUsers = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await usersService.getAll();
      setUsers(data);
    } catch {
      toast.error("Error al cargar la lista de usuarios");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (id: number, name: string) => {
    setUserToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    
    try {
      setIsDeleting(true);
      await usersService.delete(userToDelete.id);
      toast.success(`${userToDelete.name} eliminado de la red`);
      loadUsers();
      setIsDeleteModalOpen(false);
    } catch {
      toast.error("No se pudo completar la operación");
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesArea = selectedArea
        ? (u.area?.name || 'Sin Asignar') === selectedArea
        : true;

      return matchesSearch && matchesArea;
    });
  }, [users, searchTerm, selectedArea]);

  const getInitials = (f: string, l: string): string =>
    `${f?.[0] ?? ''}${l?.[0] ?? ''}`.toUpperCase() || 'N';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-[95%] mx-auto pb-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">NEXUS<span className="text-blue-600">.</span>ID</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] ml-1">Directorio de Capital Humano</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Nombre, email o departamento..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-950 text-white p-4 rounded-2xl hover:bg-blue-600 transition-all shadow-2xl hover:scale-105 active:scale-95 group"
          >
            <LuUserPlus size={24} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>

      {/* 📈 SECCIÓN DE ESTADÍSTICAS RÁPIDAS */}
      <div className="flex gap-4 overflow-x-auto py-4 pl-3 no-scrollbar rounded-2xl">
        {/* Botón para resetear filtro */}
        <button
          onClick={() => setSelectedArea(null)}
          className={`relative min-w-40 p-6 rounded-3xl border transition-all duration-300 flex flex-col items-start justify-between h-32 ${selectedArea === null
              ? 'bg-slate-900 border-slate-900 shadow-xl shadow-slate-200'
              : 'bg-white border-slate-100 hover:border-slate-300 text-slate-400'
            }`}
        >
          <div className="flex flex-col items-start">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${selectedArea === null ? 'text-blue-400' : 'text-slate-400'}`}>
              Universo
            </span>
            <span className={`text-xs font-bold ${selectedArea === null ? 'text-slate-400' : 'text-slate-500'}`}>
              NEXUS_TOTAL
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-black tracking-tighter ${selectedArea === null ? 'text-white' : 'text-slate-900'}`}>
              {stats.total}
            </span>
            <span className={`text-[10px] font-bold ${selectedArea === null ? 'text-slate-500' : 'text-slate-400'}`}>PAX</span>
          </div>

          {/* Indicador activo Minimalista */}
          {selectedArea === null && (
            <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          )}
        </button>

        {/* Tarjetas de Áreas Dinámicas */}
        {stats.byArea.map(([name, data]) => {
          const isActive = selectedArea === name;
          // Extraemos solo la clase de texto del colorClass (ej. text-blue-600)
          const textColor = data.color.split(' ').find(c => c.startsWith('text-')) || 'text-slate-600';

          return (
            <button
              key={name}
              onClick={() => setSelectedArea(name)}
              className={`relative min-w-45 p-6 rounded-3xl border transition-all duration-300 flex flex-col items-start justify-between h-32 group ${isActive
                  ? 'bg-white border-slate-900 shadow-xl shadow-slate-100 ring-1 ring-slate-950'
                  : 'bg-white border-slate-100 hover:bg-slate-50/50'
                }`}
            >
              <div className="flex flex-col items-start w-full">
                <div className="flex justify-between items-center w-full">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] truncate max-w-30 ${textColor}`}>
                    {name}
                  </span>
                  {isActive && <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />}
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Departamento</span>
              </div>

              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black tracking-tighter transition-colors ${isActive ? 'text-slate-950' : 'text-slate-800'}`}>
                  {data.count.toString().padStart(2, '0')}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Miembros</span>
              </div>

              {/* Línea de acento inferior para el estado activo */}
              <div className={`absolute bottom-0 left-6 right-6 h-1 rounded-t-full transition-all duration-300 ${isActive ? 'bg-slate-900 opacity-100' : 'bg-transparent opacity-0'
                }`} />
            </button>
          );
        })}

        {filteredUsers.length === 0 ? (
          <div className="bg-slate-50 rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-black uppercase tracking-widest">No hay usuarios en este departamento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mapeo de filteredUsers (tus tarjetas de usuario) */}
          </div>
        )}
      </div>

      {/* GRID DE USUARIOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-[2.5rem] p-8 flex flex-col items-center space-y-5 border border-slate-50 shadow-sm animate-pulse"
            >
              {/* AVATAR SKELETON */}
              <div className="relative">
                <div className="w-24 h-24 bg-slate-100 rounded-3xl" />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-slate-200 rounded-full border-4 border-white" />
              </div>

              {/* INFO SKELETON */}
              <div className="space-y-3 w-full flex flex-col items-center pt-2">
                <div className="h-5 bg-slate-200 rounded-lg w-3/4" /> {/* Nombre */}

                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-slate-100 rounded-full" />
                  <div className="h-3 bg-slate-100 rounded-md w-24" /> {/* Área */}
                </div>

                <div className="h-3 bg-slate-50 rounded-md w-1/2" /> {/* Email */}
              </div>

              {/* BUTTONS SKELETON */}
              <div className="flex items-center gap-3 w-full justify-center pt-2">
                <div className="h-11 bg-slate-50 rounded-2xl w-24" />
                <div className="h-11 bg-slate-50 rounded-2xl w-24" />
              </div>
            </div>
          ))
        ) : filteredUsers.map((user) => (
          <div
            key={user.id}
            className="group relative bg-white rounded-[2.5rem] p-1 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 animate-in fade-in zoom-in-95"
          >
            <div className="absolute inset-0 bg-linear-to-br from-blue-600/10 via-transparent to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]" />

            <div className="relative bg-white m-px p-8 rounded-[2.4rem] flex flex-col items-center text-center space-y-5">

              {/* AVATAR SECTION - Ahora usa el color del área */}
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
                <div className={`relative w-24 h-24 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-2xl border border-white/10 group-hover:scale-105 transition-transform duration-500 ${user.area?.colorClass ? user.area.colorClass.replace('bg-', 'bg-') : 'bg-slate-900'}`}>
                  {getInitials(user.firstName, user.lastName)}
                </div>

                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-xl border-4 border-white whitespace-nowrap ${user.role === Role.ADMIN ? 'bg-red-500 text-white' :
                  user.role === Role.GERENTE ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'
                  }`}>
                  {user.role}
                </div>
              </div>

              {/* USER INFO */}
              <div className="space-y-1 w-full pt-2">
                <h3 className="font-black text-slate-900 text-lg uppercase tracking-tighter truncate leading-tight">
                  {user.firstName} {user.lastName}
                </h3>

                {/* 🛠️ BADGE DE ÁREA INTEGRADO */}
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <LuLayers size={12} className="text-slate-300" />
                  <span className={`text-[10px] font-black uppercase tracking-tight ${user.area?.colorClass ? user.area.colorClass.split(' ')[1] : 'text-slate-400'}`}>
                    {user.area?.name || 'Sin Asignar'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 font-bold tracking-tight truncate opacity-60 mt-1">
                  {user.email}
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-3 w-full justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                <button
                  onClick={() => handleEdit(user)}
                  className="flex-1 max-w-25 py-3 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 font-bold text-[10px] uppercase"
                >
                  <LuUserPen size={16} /> Editar
                </button>
                <button
                  onClick={() => openDeleteConfirm(user.id, `${user.firstName} ${user.lastName}`)}
                  className="flex-1 max-w-25 py-3 bg-slate-50 text-slate-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 font-bold text-[10px] uppercase"
                >
                  <LuTrash2 size={16} /> Borrar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDelete}
        loading={isDeleting}
        title="Eliminar Acceso"
        message={`¿Estás seguro de que deseas revocar permanentemente el acceso a ${userToDelete?.name}? Esta acción no se puede deshacer.`}
      />

      <UserModal
        isOpen={isModalOpen}
        onClose={handleClose}
        onSuccess={loadUsers}
        userToEdit={selectedUser}
      />
    </div>
  );
}