'use client';

import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Trash2, X, Search } from 'lucide-react';
import { ApiAnuncio } from '@/types';

export default function AnunciosPage() {
  const { anuncios, fetchAnuncios, agregarAnuncio, actualizarAnuncio, eliminarAnuncio, session } = useStore();

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnuncio, setEditingAnuncio] = useState<ApiAnuncio | null>(null);
  const [query, setQuery] = useState('');

  const [formData, setFormData] = useState({
    titulo: '',
    mensaje: '',
  });

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

    try {
      if (editingAnuncio) {
        await actualizarAnuncio(editingAnuncio.id_anuncio, {
          titulo: formData.titulo,
          mensaje: formData.mensaje,
        });
      } else {
        await agregarAnuncio({
          titulo: formData.titulo,
          mensaje: formData.mensaje,
          id_admin_fk: session.user?.id_admin || session.user?.apiUserId,
        });
      }
      closeModal();
    } catch (err) {
      console.error('Error guardando anuncio:', err);
    }
  };

  const openModal = (anuncio?: ApiAnuncio) => {
    if (anuncio) {
      setEditingAnuncio(anuncio);
      setFormData({
        titulo: anuncio.titulo,
        mensaje: anuncio.mensaje,
      });
    } else {
      setEditingAnuncio(null);
      setFormData({
        titulo: '',
        mensaje: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAnuncio(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar este anuncio?')) {
      try { await eliminarAnuncio(id); }
      catch (err) { console.error('Error eliminando anuncio:', err); }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-gray-500">Cargando anuncios...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
            Anuncios
          </h1>
          <p className="mt-2 text-xl font-semibold text-gray-600">
            Publique avisos para los residentes
          </p>
        </div>

        <button
          type="button"
          onClick={() => console.log('Cerrar sesión')}
          className="rounded-full border-2 border-red-400 px-7 py-2.5 text-base font-semibold text-gray-900 transition hover:bg-red-50"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Barra (buscar + nuevo comunicado) */}
      <div className="mt-10 flex items-center justify-between gap-6">
        {/* Buscador */}
        <div className="flex w-full max-w-2xl items-center gap-3">
          <div className="flex h-12 w-full items-center gap-2 rounded-xl border-2 border-black px-3">
            <Search className="h-5 w-5 text-black" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar"
              className="h-full w-full bg-transparent text-base text-gray-900 placeholder:text-gray-500 outline-none"
            />
          </div>

          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B63D6] shadow-sm transition hover:opacity-90"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Nuevo comunicado */}
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 rounded-xl bg-[#5B63D6] px-5 py-2.5 text-base font-semibold text-white shadow-sm transition hover:opacity-90"
        >
          <span className="text-lg leading-none">+</span>
          Nuevo Comunicado
        </button>
      </div>

      {/* Contenedor con scroll */}
      <div className="mt-4 rounded-xl border-2 border-gray-300 bg-white p-3">
        <div className="h-[520px] overflow-y-auto pr-2">
          <div className="space-y-4">
            {anunciosFiltrados.map((anuncio) => (
              <div
                key={anuncio.id_anuncio}
                className="relative rounded-xl border-2 border-gray-300 bg-white p-5"
              >
                {/* Trash */}
                <button
                  onClick={() => handleDelete(anuncio.id_anuncio)}
                  className="absolute right-4 top-4 rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-6 w-6" />
                </button>

                <h3 className="text-2xl font-extrabold text-gray-900">
                  {anuncio.titulo || 'Titulo'}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {anuncio.fecha_publicacion ? new Date(anuncio.fecha_publicacion).toLocaleDateString('sv-SE') : (anuncio.createdAt ? new Date(anuncio.createdAt).toLocaleDateString('sv-SE') : '')}
                </p>

                <p className="mt-3 text-base text-gray-900">
                  {anuncio.mensaje || 'Cuerpo del comunicado'}
                </p>

                {/* Acciones */}
                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => console.log('Archivo')}
                    className="rounded-xl bg-[#5B63D6] px-6 py-2.5 text-base font-semibold text-white transition hover:opacity-90"
                  >
                    Archivo
                  </button>

                  <button
                    type="button"
                    onClick={() => openModal(anuncio)}
                    className="rounded-xl bg-[#5B63D6] px-6 py-2.5 text-base font-semibold text-white transition hover:opacity-90"
                  >
                    Editar
                  </button>
                </div>
              </div>
            ))}

            {anunciosFiltrados.length === 0 && (
              <div className="rounded-xl border-2 border-dashed border-gray-300 p-10 text-center text-gray-500">
                No hay anuncios para mostrar.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal (compacto) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-5">
              <h2 className="text-xl font-extrabold text-gray-900">
                {editingAnuncio ? 'Editar Anuncio' : 'Nuevo Comunicado'}
              </h2>
              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Título del anuncio"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none focus:border-[#5B63D6] focus:ring-2 focus:ring-[#5B63D6]/30"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Cuerpo del comunicado
                </label>
                <textarea
                  value={formData.mensaje}
                  onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                  placeholder="Contenido del anuncio..."
                  rows={6}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 outline-none focus:border-[#5B63D6] focus:ring-2 focus:ring-[#5B63D6]/30"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full rounded-xl border border-gray-300 py-3 text-base font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#5B63D6] py-3 text-base font-bold text-white transition hover:opacity-90"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}