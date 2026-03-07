'use client';

import { LuTriangleAlert } from 'react-icons/lu';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

export const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, message, loading }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
        
        <div className="p-8 flex flex-col items-center text-center">
          {/* ICONO DE ADVERTENCIA */}
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6 ring-8 ring-red-50/50">
            <LuTriangleAlert size={40} />
          </div>

          <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-2">
            {title}
          </h3>
          <p className="text-xs font-bold text-slate-400 leading-relaxed px-4 uppercase tracking-tighter">
            {message}
          </p>
        </div>

        <div className="p-6 bg-slate-50 flex flex-col gap-2">
          <button
            disabled={loading}
            onClick={onConfirm}
            className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-lg shadow-red-100 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Confirmar Eliminación'}
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-4 bg-white text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:text-slate-900 transition-all"
          >
            Cancelar Operación
          </button>
        </div>
      </div>
    </div>
  );
};