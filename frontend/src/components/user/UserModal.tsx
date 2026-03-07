'use client';

import { useState, FormEvent, useEffect } from 'react';
import { LuX, LuUser, LuMail, LuLock, LuCheck, LuLayers, LuLoaderCircle } from 'react-icons/lu';
import { Role, CreateUserDto, User } from '@/interfaces/user.interface';
import { Area } from '@/interfaces/area.interface';
import { usersService } from '@/services/users.service';
import { areasService } from '@/services/areas.service';
import toast from 'react-hot-toast';
import axios from 'axios';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToEdit?: User | null;
}

export default function UserModal({ isOpen, onClose, onSuccess, userToEdit }: UserModalProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingAreas, setLoadingAreas] = useState<boolean>(false);

  const [formData, setFormData] = useState<CreateUserDto>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: Role.EMPLEADO,
    areaId: undefined
  });

  useEffect(() => {
    if (isOpen) {
      const fetchAreas = async () => {
        try {
          setLoadingAreas(true);
          const data = await areasService.getAll();
          setAreas(data);
        } catch {
          toast.error("Error al sincronizar departamentos");
        } finally {
          setLoadingAreas(false);
        }
      };
      fetchAreas();
    }
  }, [isOpen]);

  useEffect(() => {
    if (userToEdit && isOpen) {
      setFormData({
        firstName: userToEdit.firstName,
        lastName: userToEdit.lastName,
        email: userToEdit.email,
        role: userToEdit.role,
        password: '', 
        areaId: userToEdit.area?.id
      });
    } else if (!userToEdit && isOpen) {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: Role.EMPLEADO,
        areaId: undefined
      });
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      if (userToEdit) {
        // 🛠️ FIX 1: Limpiamos el objeto para no enviar password vacío en actualización
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...updateData } = formData;
        
        await usersService.update(userToEdit.id, updateData);
        toast.success("Perfil actualizado");
      } else {
        await usersService.register(formData);
        toast.success("Usuario registrado");
      }
      onSuccess();
      onClose();
    } catch (error) {
      if(axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error en el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] sm:rounded-[3rem] shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">

        {/* HEADER */}
        <div className="p-6 sm:p-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
              <LuUser size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-tight">
                {userToEdit ? 'Editar Perfil' : 'NEXUS.ID'}
              </h2>
              <p className="text-[9px] sm:text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em]">
                Módulo de Identidad
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <LuX size={20} />
          </button>
        </div>

        {/* 🛠️ FIX 2: Agregamos id="user-form" para vincular con el botón del footer */}
        <form 
          id="user-form"
          onSubmit={handleSubmit} 
          className="p-6 sm:p-8 space-y-5 overflow-y-auto custom-scrollbar"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nombre</label>
              <input
                required
                type="text"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold transition-all"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Apellido</label>
              <input
                required
                type="text"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold transition-all"
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Email Corporativo</label>
            <div className="relative">
              <LuMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                required
                type="email"
                className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold transition-all"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Departamento / Área</label>
            <div className="relative">
              <LuLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                required
                className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold transition-all appearance-none"
                value={formData.areaId || ''}
                onChange={e => setFormData({ ...formData, areaId: Number(e.target.value) })}
              >
                <option value="" disabled>Seleccionar departamento...</option>
                {areas.map(area => (
                  <option key={area.id} value={area.id}>{area.name.toUpperCase()}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                {loadingAreas ? <LuLoaderCircle className="animate-spin text-blue-600" size={16} /> : <LuLayers className="text-slate-300" size={14} />}
              </div>
            </div>
          </div>

          {!userToEdit && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Contraseña Temporal</label>
              <div className="relative">
                <LuLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="password"
                  className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold transition-all"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Nivel de Acceso</label>
            <div className="grid grid-cols-1 xs:grid-cols-3 p-1 bg-slate-100 rounded-2xl gap-1">
              {[Role.EMPLEADO, Role.GERENTE, Role.ADMIN].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: r })}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    formData.role === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {formData.role === r && <LuCheck size={12} />}
                  {r}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* FOOTER */}
        <div className="p-6 sm:p-8 border-t border-slate-100 bg-white shrink-0">
          <button
            form="user-form" // 🛠️ FIX 3: Vinculamos el botón al ID del formulario
            type="submit"
            disabled={loading}
            className="w-full py-4 sm:py-5 bg-slate-950 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <LuLoaderCircle className="animate-spin" size={16} /> : (userToEdit ? 'Actualizar Registro' : 'Registrar Colaborador')}
          </button>
        </div>
      </div>
    </div>
  );
}