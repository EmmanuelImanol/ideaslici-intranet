'use client';
import { useRef, useState, useEffect } from 'react';
import { LuX, LuFileText, LuLoader, LuLayers, LuShieldCheck } from 'react-icons/lu';
import { Area } from '@/interfaces/area.interface';
import { areasService } from '@/services/areas.service';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  uploading: boolean;
  onClose: () => void;
  // 🛠️ Cambiamos 'category: string' por 'areaId: number'
  onUpload: (file: File, title: string, areaId: number) => Promise<void>;
}

export const UploadFileModal = ({ isOpen, uploading, onClose, onUpload }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 🛠️ Estados para las Áreas
  const [areas, setAreas] = useState<Area[]>([]);
  const [loadingAreas, setLoadingAreas] = useState(true);

  const [formData, setFormData] = useState({ 
    title: '', 
    areaId: '' // Lo manejamos como string para el select
  });

  // 🛠️ Cargar áreas reales al abrir el modal
  useEffect(() => {
    if (isOpen) {
      const loadAreas = async () => {
        try {
          setLoadingAreas(true);
          const data = await areasService.getAll();
          setAreas(data);
          // Opcional: Seleccionar la primera área por defecto
          if (data.length > 0) setFormData(prev => ({ ...prev, areaId: data[0].id.toString() }));
        } catch {
          toast.error("Error al sincronizar departamentos");
        } finally {
          setLoadingAreas(false);
        }
      };
      loadAreas();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting || uploading || !selectedFile || !formData.title || !formData.areaId) {
      toast.error("Por favor, completa todos los campos");
      return;
    }

    try {
      setIsSubmitting(true);
      // 🛠️ Enviamos el areaId como número
      await onUpload(selectedFile, formData.title, Number(formData.areaId));
      
      setFormData({ title: '', areaId: '' });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onClose();
    } catch (error) {
      console.error("Error en el modal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] w-full max-w-md p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto border border-white/20">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">NEXUS<span className="text-blue-600">.</span>CLOUD</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carga de Documentación</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <LuX size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* TÍTULO */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Título del Documento</label>
            <input
              type="text" 
              placeholder="Ej: Manual de Identidad V1"
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm transition-all"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          {/* SELECTOR DE ÁREA DINÁMICO */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Asignar a Departamento</label>
            <div className="relative">
              <LuLayers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                disabled={loadingAreas}
                className="w-full pl-12 pr-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm appearance-none disabled:opacity-50"
                value={formData.areaId}
                onChange={e => setFormData(prev => ({ ...prev, areaId: e.target.value }))}
              >
                {loadingAreas ? (
                  <option>Cargando áreas...</option>
                ) : (
                  areas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name.toUpperCase()}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
          
          {/* DROPZONE */}
          <div 
            onClick={() => !isSubmitting && fileInputRef.current?.click()} 
            className={`group border-2 border-dashed rounded-[2.5rem] p-10 text-center cursor-pointer transition-all duration-300 ${
              selectedFile ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-200'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={e => setSelectedFile(e.target.files?.[0] || null)} 
            />
            <div className={`mx-auto mb-4 w-16 h-16 rounded-3xl flex items-center justify-center transition-colors ${selectedFile ? 'bg-blue-600 text-white' : 'bg-white text-slate-300 shadow-sm'}`}>
              <LuFileText size={32} />
            </div>
            <p className="text-slate-900 font-black text-xs uppercase tracking-tighter truncate px-2">
              {selectedFile ? selectedFile.name : 'Arrastra o selecciona un archivo'}
            </p>
            {!selectedFile && <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Tamaño máximo: 50MB</p>}
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <LuShieldCheck className="text-emerald-500" size={16} />
            <p className="text-[9px] text-emerald-700 font-bold uppercase tracking-tight leading-none">Cifrado de grado militar activo</p>
          </div>

          <button
            type="button"
            disabled={uploading || isSubmitting || !selectedFile || !formData.title}
            onClick={handleSubmit}
            className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] shadow-xl hover:bg-blue-600 transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
          >
            { (uploading || isSubmitting) ? (
              <div className="flex items-center justify-center gap-2">
                <LuLoader className="animate-spin" size={18} />
                <span>Subiendo a Nexus Cloud...</span>
              </div>
            ) : (
              'Publicar en Intranet'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};