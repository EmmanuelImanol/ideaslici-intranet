'use client';

import { useState, useEffect, useCallback } from 'react';
import { LuPlus, LuPencil, LuCheck, LuLoaderCircle } from 'react-icons/lu'; // 🛠️ Eliminado LuTrash2
import { Area, CreateAreaInput, UpdateAreaInput } from '@/interfaces/area.interface';
import { areasService } from '@/services/areas.service';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const COLOR_OPTIONS = [
  { name: 'Azul', class: 'bg-blue-100 text-blue-600 border-blue-200' },
  { name: 'Esmeralda', class: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
  { name: 'Púrpura', class: 'bg-purple-100 text-purple-600 border-purple-200' },
  { name: 'Ámbar', class: 'bg-amber-100 text-amber-600 border-amber-200' },
  { name: 'Rosa', class: 'bg-rose-100 text-rose-600 border-rose-200' },
  { name: 'Slate', class: 'bg-slate-100 text-slate-600 border-slate-200' },
  { name: 'Índigo', class: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
  { name: 'Cian', class: 'bg-cyan-100 text-cyan-600 border-cyan-200' },
  { name: 'Naranja', class: 'bg-orange-100 text-orange-600 border-orange-200' },
  { name: 'Lima', class: 'bg-lime-100 text-lime-600 border-lime-200' },
  { name: 'Fucsia', class: 'bg-fuchsia-100 text-fuchsia-600 border-fuchsia-200' },
  { name: 'Rojo', class: 'bg-red-100 text-red-600 border-red-200' },
];

export default function AreaManagerPage() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { token } = useAuthStore();

  const [formData, setFormData] = useState<CreateAreaInput>({
    name: '',
    colorClass: COLOR_OPTIONS[0].class
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateAreaInput>({});

  const fetchAreas = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await areasService.getAll();
      setAreas(data);
    } catch {
      toast.error("Error al cargar las áreas");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await areasService.create(formData);
      toast.success(`Área "${formData.name}" creada`);
      setFormData({ name: '', colorClass: COLOR_OPTIONS[0].class });
      await fetchAreas();
    } catch (error) {
      if(axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Error al crear");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      await areasService.update(id, editFormData);
      toast.success("Área actualizada");
      setEditingId(null);
      await fetchAreas();
    } catch (error) {
      if(axios.isAxiosError(error)) toast.error("Error al actualizar");
    }
  };

  // 🛠️ Función handleDelete eliminada completamente

  return (
    <div className="max-w-350 mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col gap-1 px-2">
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter italic">
          NEXUS<span className="text-blue-600">.</span> AREAS
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Gestión de Departamentos</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: CREACIÓN */}
        <div className="xl:col-span-1">
          <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 sticky top-8">
            <div className="mb-8">
              <h2 className="font-black text-slate-800 text-xl tracking-tight">Nuevo Registro</h2>
              <div className="h-1 w-10 bg-blue-600 mt-1 rounded-full" />
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Identificador</label>
                <input 
                  type="text"
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none text-sm font-bold transition-all placeholder:text-slate-300"
                  placeholder="Ej: Marketing Digital"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Paleta Visual</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 xl:grid-cols-4 gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, colorClass: color.class })}
                      className={`h-10 rounded-xl border-4 transition-all ${color.class} ${
                        formData.colorClass === color.class ? 'border-slate-900 scale-95' : 'border-transparent hover:scale-105'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button 
                disabled={isSubmitting}
                type="submit"
                className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? <LuLoaderCircle className="animate-spin" size={20} /> : <LuPlus size={20} />}
                Registrar Área
              </button>
            </form>
          </div>
        </div>

        {/* LISTADO DE ÁREAS */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Departamentos Activos</h3>
            <div className="h-px flex-1 mx-4 bg-slate-100 hidden sm:block" />
            <span className="text-[10px] bg-slate-950 text-white px-4 py-1.5 rounded-full font-black tracking-tighter">
              {areas.length} TOTAL
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {loading ? (
               [...Array(4)].map((_, i) => <div key={i} className="h-40 bg-slate-100 rounded-[2.5rem] animate-pulse" />)
            ) : areas.map((area) => (
              <div 
                key={area.id}
                className="group bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col justify-between min-h-45"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {editingId === area.id ? (
                      <input 
                        autoFocus
                        className="text-lg font-black bg-slate-50 border-b-4 border-blue-500 outline-none w-full pb-1"
                        value={editFormData.name || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        onBlur={() => handleUpdate(area.id)}
                      />
                    ) : (
                      <div className="space-y-2">
                        <span className={`inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${area.colorClass}`}>
                          {area.name}
                        </span>
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">ID: AREA-00{area.id}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    {editingId === area.id ? (
                      <button onClick={() => handleUpdate(area.id)} className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
                        <LuCheck size={18} />
                      </button>
                    ) : (
                      <div className="flex gap-1">
                        <button 
                          onClick={() => { setEditingId(area.id); setEditFormData({ name: area.name, colorClass: area.colorClass }); }}
                          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        >
                          <LuPencil size={18} />
                        </button>
                        {/* 🛠️ Botón de borrar eliminado de aquí */}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-end justify-between mt-8 border-t border-slate-50 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Volumen Docs</span>
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">{area._count?.files || 0}</span>
                  </div>
                  <div className="flex -space-x-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="w-9 h-9 rounded-full bg-slate-100 border-4 border-white shadow-sm ring-1 ring-slate-100 flex items-center justify-center overflow-hidden">
                         <div className="w-full h-full bg-linear-to-br from-slate-200 to-slate-300" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}