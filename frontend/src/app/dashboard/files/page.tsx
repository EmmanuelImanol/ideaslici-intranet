'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LuSearch, LuFileText, LuChevronRight,
  LuDownload, LuTrash2, LuPlus,
  LuChevronLeft,
  LuMaximize
} from 'react-icons/lu';
import { useAuthStore } from '@/store/auth.store';
import { filesService } from '@/services/files.service';
import { FileMetadata } from '@/interfaces/file.interface';
import { ConfirmDeleteModal } from '@/components/files/ConfirmDeleteModal';
import { UploadFileModal } from '@/components/files/UploadFileModal';
import { FileViewer } from '@/components/files/FileViewer';
import toast from 'react-hot-toast';

export default function FilesPage() {
  // 1. URL dinámica para producción (Render)
  const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3000';
  
  const { user } = useAuthStore();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeFile, setActiveFile] = useState<FileMetadata | null>(null);
  const [fileToDelete, setFileToDelete] = useState<{ id: number; title: string } | null>(null);

  const [showMobileVisor, setShowMobileVisor] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const isOfficeFile = (filename: string) => {
    return /\.(docx|xlsx|pptx|doc|xls|ppt)$/i.test(filename);
  };

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await filesService.getAll();
      setFiles(data);
      if (data.length > 0 && !activeFile) {
        setActiveFile(data[0]);
      }
    } catch (error) {
      console.error("Error cargando archivos:", error);
      toast.error("No se pudieron cargar los archivos");
    } finally {
      setLoading(false);
    }
  }, [activeFile]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // 2. handleUpload corregido con areaId y sin 'any'
  const handleUpload = async (file: File, title: string, areaId: number) => {
    if (uploading) return;
    setUploading(true);

    // Nota: Asegúrate que filesService.upload acepte (file, title, areaId)
    const uploadPromise = filesService.upload(file, title, areaId);

    toast.promise(uploadPromise, {
      loading: 'Subiendo archivo a Nexus...',
      success: `"${title}" subido correctamente`,
      error: 'Error al subir el archivo',
    });

    try {
      await uploadPromise;
      setIsModalOpen(false);
      await loadFiles();
    } catch (error) {
      console.error("Error en la subida:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (e: React.MouseEvent, id: number, title: string) => {
    e.stopPropagation();
    setFileToDelete({ id, title });
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    const deletePromise = filesService.delete(fileToDelete.id);

    toast.promise(deletePromise, {
      loading: 'Moviendo a la papelera...',
      success: 'Documento eliminado',
      error: 'No se pudo eliminar',
    });

    try {
      await deletePromise;
      setFiles(prev => prev.filter(file => file.id !== fileToDelete.id));
      if (activeFile?.id === fileToDelete.id) {
        setActiveFile(null);
        setShowMobileVisor(false);
      }
      setFileToDelete(null);
    } catch (error) {
      console.error(error);
    }
  };

  const filteredFiles = useMemo(() => {
    return files.filter(f =>
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.originalName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [files, searchTerm]);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4 w-[98%] mx-auto py-2 animate-in fade-in duration-500">

      {/* HEADER BUSCADOR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm gap-4">
        <div className={showMobileVisor ? 'hidden md:block' : 'block'}>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Repositorio Nexus</h1>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Documentación Oficial</p>
        </div>

        <div className={`flex items-center gap-3 w-full md:max-w-2xl ${showMobileVisor ? 'hidden md:flex' : 'flex'}`}>
          <div className="relative flex-1">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o título..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {(user?.role === 'admin' || user?.role === 'gerente') && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 active:scale-95"
            >
              <LuPlus size={20} />
              <span className="hidden md:inline">Subir Archivo</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden relative">
        {/* LISTADO DE ARCHIVOS */}
        <div className={`w-full md:w-80 lg:w-96 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col overflow-hidden transition-all duration-300 ${showMobileVisor ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b bg-slate-50/50 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Documentos</span>
            <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">{filteredFiles.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {loading ? (
              <div className="p-4 space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-slate-100 rounded-2xl w-full" />)}
              </div>
            ) : filteredFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => { setActiveFile(file); setShowMobileVisor(true); }}
                className={`group p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between border ${activeFile?.id === file.id
                  ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                  : 'hover:bg-blue-50 border-transparent text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {(user?.role === 'admin' || user?.role === 'gerente') && (
                    <button
                      onClick={(e) => handleDeleteRequest(e, file.id, file.title)}
                      className={`p-2 rounded-lg transition-colors ${activeFile?.id === file.id ? 'hover:bg-red-500 text-blue-200 hover:text-white' : 'hover:bg-red-50 text-slate-300 hover:text-red-600'}`}
                    >
                      <LuTrash2 size={16} />
                    </button>
                  )}
                  <div className={`p-2 rounded-lg ${activeFile?.id === file.id ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                    <LuFileText size={18} />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-bold text-sm truncate">{file.title}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-tighter ${activeFile?.id === file.id ? 'text-blue-100' : 'text-slate-400'}`}>
                      {file.area?.name || 'General'}
                    </span>
                  </div>
                </div>
                <LuChevronRight size={16} className={activeFile?.id === file.id ? 'opacity-100' : 'opacity-0'} />
              </div>
            ))}
          </div>
        </div>

        {/* VISOR DE ARCHIVOS */}
        <div className={`flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col min-h-0 overflow-hidden relative transition-all duration-300 ${!showMobileVisor ? 'hidden md:flex' : 'flex'}`}>
          {activeFile ? (
            <>
              <div className="p-4 border-b flex justify-between items-center bg-white shrink-0 z-10">
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={() => setShowMobileVisor(false)} className="md:hidden p-2 bg-slate-100 rounded-lg">
                    <LuChevronLeft size={20} />
                  </button>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm truncate">{activeFile.title}</h3>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                      {isOfficeFile(activeFile.storageName) ? 'Documento de Office' : 'Visualización Nexus'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsViewerOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                  >
                    <LuMaximize size={16} /> <span className="hidden lg:inline">Expandir Vista</span>
                  </button>

                  <a
                    href={`${API_URL}/api/files/view/${activeFile.storageName}`}
                    download={activeFile.originalName}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-all"
                  >
                    <LuDownload size={16} /> <span className="hidden lg:inline">Descargar</span>
                  </a>
                </div>
              </div>

              <div className="flex-1 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                {activeFile.storageName.match(/\.(mp4|webm|ogg)$/i) ? (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <video
                      key={activeFile.id}
                      controls
                      className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white/10"
                      src={`${API_URL}/api/files/view/${activeFile.storageName}`}
                    />
                  </div>
                ) : isOfficeFile(activeFile.storageName) ? (
                  <div className="text-center p-8 space-y-4">
                    <LuFileText size={60} className="text-slate-600 mx-auto animate-pulse" />
                    <p className="text-white font-bold text-sm">Vista previa limitada</p>
                    <p className="text-slate-400 text-[10px] max-w-xs mx-auto uppercase tracking-widest font-bold">
                      Descarga el archivo para verlo con la aplicación de escritorio
                    </p>
                  </div>
                ) : (
                  <iframe
                    key={activeFile.id}
                    src={`${API_URL}/api/files/view/${activeFile.storageName}#toolbar=0`}
                    className="w-full h-full border-none absolute inset-0 bg-white"
                    title="Visor Nexus"
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4 bg-slate-50/50">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100">
                <LuFileText size={40} strokeWidth={1} className="text-slate-200" />
              </div>
              <p className="font-bold text-slate-400 text-sm">Selecciona un documento para visualizar</p>
            </div>
          )}
        </div>
      </div>

      {/* MODALES */}
      {isViewerOpen && activeFile && (
        <FileViewer
          filename={activeFile.storageName}
          originalName={activeFile.originalName}
          mimeType={activeFile.mimeType || 'application/octet-stream'}
          onClose={() => setIsViewerOpen(false)}
        />
      )}

      <ConfirmDeleteModal
        isOpen={!!fileToDelete}
        title={fileToDelete?.title || ''}
        onClose={() => setFileToDelete(null)}
        onConfirm={confirmDelete}
      />

      <UploadFileModal
        isOpen={isModalOpen}
        uploading={uploading}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
}