'use client';

import Image from 'next/image';
import { LuFileWarning, LuExternalLink, LuX } from 'react-icons/lu';

interface FileViewerProps {
  filename: string;
  mimeType: string;
  originalName: string;
  onClose: () => void;
}

export const FileViewer = ({ filename, mimeType, originalName, onClose }: FileViewerProps) => {
  const API_URL = 'http://localhost:3000/api/files';
  const fileUrl = `${API_URL}/view/${filename}`;
  
  // Detectamos si es un formato de Office
  const isOffice = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ].includes(mimeType);

  const isImage = mimeType.startsWith('image/');
  const isPDF = mimeType === 'application/pdf';

  // Visor de Office (Requiere que el servidor sea público, si es localhost se descargará)
  const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 md:p-10">
      <div className="relative w-full h-full max-w-6xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col">
        
        {/* BARRA SUPERIOR */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{originalName}</h3>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{mimeType}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
          >
            <LuX size={24} />
          </button>
        </div>

        {/* CONTENIDO DEL VISOR */}
        <div className="flex-1 bg-slate-50 flex items-center justify-center overflow-hidden">
          {isImage ? (
            <Image src={fileUrl} alt={originalName} className="max-w-full max-h-full object-contain shadow-lg" />
          ) : isPDF ? (
            <iframe src={fileUrl} className="w-full h-full border-none" title={originalName} />
          ) : isOffice ? (
            <iframe src={officeViewerUrl} className="w-full h-full border-none" title={originalName} />
          ) : (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto">
                <LuFileWarning size={40} />
              </div>
              <div className="space-y-2">
                <p className="text-slate-900 font-bold">No hay vista previa disponible</p>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">Este formato debe descargarse para ser visualizado en tu equipo.</p>
                <a 
                  href={fileUrl} 
                  download 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all"
                >
                  <LuExternalLink size={16} /> Descargar archivo
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};