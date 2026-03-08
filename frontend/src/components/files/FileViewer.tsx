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
  // 🛠️ 1. Usamos la variable de entorno para que apunte a Render en producción
  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  const fileUrl = `${API_URL}/files/view/${filename}`;
  
  const officeExtensions = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
  const fileExtension = originalName.toLowerCase().substring(originalName.lastIndexOf('.'));

  // 2. Definimos los MimeTypes conocidos de Office
  const officeMimeTypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  // 3. Detección Híbrida: Si coincide el MimeType O la extensión, es Office
  const isOffice = officeMimeTypes.includes(mimeType) || officeExtensions.includes(fileExtension);

  const isImage = mimeType.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtension);
  const isPDF = mimeType === 'application/pdf' || fileExtension === '.pdf';

  // Visor de Office con embed.aspx (más compatible)
  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-2 md:p-10">
      <div className="relative w-full h-[90vh] md:h-full max-w-6xl bg-white rounded-4xl md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* BARRA SUPERIOR */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-900 truncate">{originalName}</h3>
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest truncate">{mimeType}</p>
          </div>
          <button 
            onClick={onClose}
            className="ml-4 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
          >
            <LuX size={24} />
          </button>
        </div>

        {/* CONTENIDO DEL VISOR */}
        <div className="flex-1 bg-slate-50 flex items-center justify-center overflow-hidden relative">
          {isImage ? (
            <div className="relative w-full h-full p-4">
               {/* Usamos img normal para evitar problemas de dominios configurados en next.config.js */}
               <Image src={fileUrl} alt={originalName} className="w-full h-full object-contain" priority/>
            </div>
          ) : isPDF ? (
            <iframe src={`${fileUrl}#toolbar=0`} className="w-full h-full border-none" title={originalName} />
          ) : isOffice ? (
            <iframe 
              src={officeViewerUrl} 
              className="w-full h-full border-none bg-white" 
              title={originalName}
              frameBorder="0"
            />
          ) : (
            <div className="text-center space-y-4 p-6">
              <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto">
                <LuFileWarning size={40} />
              </div>
              <div className="space-y-2">
                <p className="text-slate-900 font-bold">Vista previa no disponible</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto uppercase tracking-widest font-bold">
                  Este formato requiere descarga para su visualización segura
                </p>
                <a 
                  href={fileUrl} 
                  download={originalName}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-slate-950 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                >
                  <LuExternalLink size={16} /> Descargar Archivo
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};