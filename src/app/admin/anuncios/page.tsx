'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Trash2, X, Search, Paperclip } from 'lucide-react';
import { ApiAnuncio } from '@/types';

export default function AnunciosPage() {
  const { anuncios, fetchAnuncios, agregarAnuncio, actualizarAnuncio, eliminarAnuncio, session } = useStore();

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnuncio, setEditingAnuncio] = useState<ApiAnuncio | null>(null);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    titulo: '',
    mensaje: '',
  });
  const [archivoNombre, setArchivoNombre] = useState<string | null>(null);
  const [archivoFile, setArchivoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try { await fetchAnuncios(); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  const anunciosFiltrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return anuncios;
    return anuncios.filter((a) => {
      const t = (a.titulo || '').toLowerCase();
      const c = (a.mensaje || '').toLowerCase();
      return t.includes(q) || c.includes(q);
    });
  }, [anuncios, query]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      if (editingAnuncio) {
        const fd = new FormData();
        fd.append('titulo', formData.titulo);
        fd.append('mensaje', formData.mensaje);
        if (archivoFile) fd.append('archivo', archivoFile);
        await actualizarAnuncio(editingAnuncio.id_anuncio, fd);
      } else {
        const fd = new FormData();
        fd.append('titulo', formData.titulo);
        fd.append('mensaje', formData.mensaje);
        fd.append('id_admin_fk', String(session.user?.id_admin || ''));
        if (archivoFile) fd.append('archivo', archivoFile);
        await agregarAnuncio(fd);
      }
      setSuccessMsg(editingAnuncio ? 'Anuncio actualizado' : 'Anuncio creado');
      setTimeout(() => setSuccessMsg(null), 3000);
      closeModal();
    } catch (err: any) {
      setFormError('Error al guardar el anuncio');
    } finally {
      setSaving(false);
    }
  };

  const openModal = (anuncio?: ApiAnuncio) => {
    setFormError(null);
    if (anuncio) {
      setEditingAnuncio(anuncio);
      setFormData({ titulo: anuncio.titulo, mensaje: anuncio.mensaje });
      setArchivoNombre(anuncio.ruta_archivo || null);
      setArchivoFile(null); // existing file already on server
    } else {
      setEditingAnuncio(null);
      setFormData({ titulo: '', mensaje: '' });
      setArchivoNombre(null);
      setArchivoFile(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAnuncio(null);
    setArchivoNombre(null);
    setArchivoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este anuncio?')) {
      try { await eliminarAnuncio(id); }
      catch (err) { console.error(err); }
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><p>Cargando...</p></div>;

  return (
    <div className="min-h-screen bg-white px-4 sm:px-8 py-6 sm:py-8">
      {/* Encabezado */}
      <div className="mb-2">
        <h1 className="text-2xl sm:text-4xl md:text-[42px] leading-tight font-extrabold text-black">
          Panel de administración
        </h1>
        <p className="mt-1 text-base sm:text-lg md:text-[20px] font-semibold text-gray-400">
          Gestión de la unidad habitacional
        </p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl md:text-[28px] leading-tight font-bold text-black">
          Anuncios
        </h2>
      </div>

      <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6">
        <div className="flex w-full sm:max-w-2xl items-center gap-3">
          <div className="flex h-12 w-full items-center gap-2 rounded-xl border-2 border-black px-3">
            <Search className="h-5 w-5 text-black" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar" className="h-full w-full bg-transparent outline-none" />
          </div>
          <button className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#5B63D6]"><Search className="h-5 w-5 text-white" /></button>
        </div>

        <button onClick={() => openModal()} className="flex items-center justify-center gap-2 rounded-xl bg-[#5B63D6] px-5 py-2.5 text-base font-semibold text-white transition hover:opacity-90 whitespace-nowrap">
          <span className="text-lg leading-none">+</span> Nuevo Comunicado
        </button>
      </div>

      {/* Listado de Anuncios */}
      <div className="mt-4 rounded-xl border-2 border-gray-300 bg-white p-3">
        <div className="h-[520px] overflow-y-auto pr-2">
          <div className="space-y-4">
            {anunciosFiltrados.map((anuncio) => (
              <div key={anuncio.id_anuncio} className="relative rounded-xl border-2 border-gray-300 bg-white p-5">
                <button onClick={() => handleDelete(anuncio.id_anuncio)} className="absolute right-4 top-4 text-red-500"><Trash2 className="h-6 w-6" /></button>
                <h3 className="text-2xl font-extrabold text-gray-900">{anuncio.titulo || 'Titulo'}</h3>
                <p className="mt-1 text-sm text-gray-500">{anuncio.fecha_publicacion ? new Date(anuncio.fecha_publicacion).toLocaleDateString() : 'Fecha'}</p>
                <p className="mt-3 text-base text-gray-900">{anuncio.mensaje || 'Cuerpo del comunicado'}</p>
                {anuncio.ruta_archivo && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-[#5B63D6] font-semibold">
                    <Paperclip className="h-4 w-4" />
                    <span>{anuncio.ruta_archivo.split('/').pop()}</span>
                  </div>
                )}
                <div className="mt-8 flex justify-end gap-3">
                  {anuncio.ruta_archivo && (
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/${anuncio.ruta_archivo.replace(/^\/+/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-[#5B63D6] px-6 py-2.5 font-semibold text-white flex items-center gap-2 hover:opacity-90 transition"
                    >
                      <Paperclip className="h-4 w-4" /> Archivo
                    </a>
                  )}
                  <button onClick={() => openModal(anuncio)} className="rounded-xl bg-[#5B63D6] px-6 py-2.5 font-semibold text-white">Editar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL ESTILO MOCKUP */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl overflow-hidden rounded-[30px] bg-white shadow-2xl border border-gray-200">
            {/* Header Mockup */}
            <div className="bg-[#5f6ec9] px-8 py-4 flex items-center justify-center text-white">
              <h2 className="text-2xl font-semibold tracking-wide">
                {editingAnuncio ? '+ Editar Comunicado' : '+ Nuevo Comunicado'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {formError && <div className="text-red-600 font-bold text-center">{formError}</div>}

              {/* Input Titulo */}
              <div className="space-y-2">
                <label className="text-2xl font-bold text-black ml-2 block">Titulo</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="ej. José Martínez"
                  className="w-full h-14 bg-white border-2 border-gray-300 rounded-[20px] px-6 text-lg focus:border-[#5f6ec9] outline-none placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Input Cuerpo */}
              <div className="space-y-2">
                <label className="text-2xl font-bold text-black ml-2 block">Cuerpo del comunicado</label>
                <textarea
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                  placeholder="ej. José Martínez"
                  rows={4}
                  className="w-full bg-white border-2 border-gray-300 rounded-[25px] p-6 text-lg focus:border-[#5f6ec9] outline-none placeholder:text-gray-400 resize-none"
                  required
                />
              </div>

              {/* Archivo adjunto */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setArchivoNombre(file.name);
                    setArchivoFile(file);
                  }
                }}
              />

              {archivoNombre && (
                <div className="flex items-center gap-3 rounded-2xl border-2 border-gray-300 px-5 py-3">
                  <Paperclip className="h-5 w-5 text-[#5f6ec9]" />
                  <span className="flex-1 text-base font-semibold text-gray-700 truncate">{archivoNombre}</span>
                  <button
                    type="button"
                    onClick={() => { setArchivoNombre(null); setArchivoFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="text-red-400 hover:text-red-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex flex-col items-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#636ec6] text-white px-8 py-3 rounded-2xl font-bold text-xl flex items-center gap-2 hover:brightness-110 transition shadow-md"
                >
                  <Paperclip className="h-5 w-5" /> Adjuntar Archivo
                </button>

                <div className="flex w-full gap-4 pt-4">
                   <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 h-14 border-2 border-gray-300 rounded-[20px] font-bold text-xl text-gray-500 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 h-14 bg-[#5f6ec9] text-white rounded-[20px] font-extrabold text-2xl hover:brightness-110 shadow-lg"
                  >
                    {saving ? '...' : 'Publicar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}