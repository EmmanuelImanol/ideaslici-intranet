'use client';
import { LuTrash2 } from 'react-icons/lu';

interface Props {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const ConfirmDeleteModal = ({ isOpen, title, onClose, onConfirm }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <LuTrash2 size={36} />
          </div>
          
          <h3 className="text-2xl font-bold text-slate-900 mb-2">¿Confirmar borrado?</h3>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            El documento <span className="font-bold text-slate-800 italic">&quot;{title}&quot;</span> se moverá a la papelera.
          </p>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={onConfirm}
              className="w-full py-4 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95 order-1"
            >
              Sí, eliminar
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all active:scale-95 order-2"
            >
              No, cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};