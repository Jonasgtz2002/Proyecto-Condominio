'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { passwordService } from '@/services/password.service';

export default function PasswordPage() {
  const [email, setEmail] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [estado, setEstado] = useState<
    'success' | 'error' | null
  >(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !nuevaPassword) return;

    setLoading(true);
    setEstado(null);
    setErrorMsg('');

    try {
      await passwordService.changePassword({
        email,
        nuevaPassword,
      });

      setEstado('success');
      setEmail('');
      setNuevaPassword('');
    } catch (error: any) {
      const msg =
        error?.response?.data?.error ||
        error?.message ||
        'Error al cambiar la contraseña';

      setErrorMsg(msg);
      setEstado('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#efefef] text-[#111]">
      <div className="mx-auto w-full max-w-[900px] px-4 md:px-6 py-8 space-y-6">

        {/* Header */}
        <section>
          <h1 className="font-extrabold tracking-tight text-[clamp(1.8rem,3vw,3rem)] leading-tight">
            Restablecer contraseña
          </h1>
          <p className="mt-1 font-semibold text-[#626262] text-[clamp(1rem,1.8vw,1.4rem)]">
            Ingresa tu correo electrónico y define una nueva contraseña
          </p>
        </section>

        {/* Franja roja */}
        <div className="w-full bg-[#ec625b] rounded-md px-4 py-2">
          <p className="text-center text-white font-bold text-[clamp(.9rem,1.4vw,1.2rem)] leading-snug">
            Verifica que el correo pertenezca al usuario antes de actualizar la contraseña
          </p>
        </div>

        {/* Formulario */}
        <section className="space-y-4">
          <h2 className="font-extrabold text-[clamp(1.4rem,2.5vw,2rem)]">
            Actualización de credenciales
          </h2>

          <form onSubmit={handleSubmit} className="max-w-[700px] space-y-4">

            {/* Email */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                required
                className="w-full h-12 md:h-14 rounded-xl border-[3px] border-black bg-[#f3f3f3] px-4 text-[clamp(1rem,1.2vw,1.2rem)] placeholder:text-[#696969] outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <input
                type="password"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                placeholder="Nueva contraseña"
                required
                className="w-full h-12 md:h-14 rounded-xl border-[3px] border-black bg-[#f3f3f3] px-4 text-[clamp(1rem,1.2vw,1.2rem)] placeholder:text-[#696969] outline-none"
              />
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto h-12 md:h-14 px-6 rounded-xl bg-[#6272c8] hover:bg-[#5262b6] text-white text-[clamp(1rem,1.3vw,1.2rem)] font-semibold inline-flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Cambiar contraseña
                </>
              )}
            </button>
          </form>

          {/* Success */}
          {estado === 'success' && (
            <div className="rounded-lg border border-green-300 bg-green-50 p-4 max-w-[700px]">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="w-6 h-6" />
                <p className="text-lg font-bold">
                  Contraseña actualizada correctamente
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {estado === 'error' && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4 max-w-[700px]">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p className="text-lg font-bold">
                  Error al actualizar contraseña
                </p>
              </div>
              <p className="mt-1 text-sm text-red-600">{errorMsg}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}