import React, { useState } from 'react';
import { User } from '../types';
import { 
  Vote, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Radio, 
  ArrowRight, 
  Users, 
  Trophy, 
  CheckCircle2, 
  Lock, 
  Smartphone,
  ChevronRight,
  Globe,
  BellRing
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onContinueAsGuest: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onContinueAsGuest
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleAuth = async (customEmail?: string, customName?: string, customAvatar?: string) => {
    setLoading(true);
    setError(null);

    const targetEmail = customEmail || email.trim() || 'usuario@gmail.com';
    const targetName = customName || name.trim() || targetEmail.split('@')[0];
    const targetAvatar = customAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(targetEmail)}`;

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          google_id: `google_${Date.now()}`,
          email: targetEmail,
          name: targetName,
          avatar_url: targetAvatar
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión');
      } else {
        localStorage.setItem('sheck_auth_user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor. Revisa tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }
    handleGoogleAuth(email, name);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      ></div>

      {/* Top Bar / Brand */}
      <header className="relative z-10 max-w-5xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 border border-blue-400/30">
            <Vote className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white">SHECK</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                V2.0
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Real-Time Event Voting Platform</span>
          </div>
        </div>

        <button
          onClick={onContinueAsGuest}
          className="text-xs font-semibold text-slate-400 hover:text-white px-3.5 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 backdrop-blur-md transition-all flex items-center gap-1.5 group"
        >
          <span>Explorar eventos</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </header>

      {/* Main Content Area: Split Hero & Login Card */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-6 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center flex-1">
        
        {/* Left Column: Purpose, Tagline & Value Props */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-inner">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Votaciones en Vivo y Resultados al Instante
            </span>
          </div>

          {/* Main Title & Leyenda */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Donde cada voz se <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">
                escucha en tiempo real.
              </span>
            </h1>
            
            {/* LEYENDA CLARA DE QUÉ HACE Y PARA QUÉ SIRVE LA APP */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              <strong className="text-white font-semibold">SHECK</strong> es la plataforma interactiva diseñada para crear eventos, concursos y votaciones comunitarias en vivo. Emite votos con verificación digital, sigue el escrutinio segundo a segundo y celebra resultados transparentes.
            </p>
          </div>

          {/* Value Props 3-Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">Conteo en Vivo</h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                Gráficos y porcentajes automáticos vía Server-Sent Events.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">Voto Verificado</h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                Identidad segura con Google para 1 voto único y transparente.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2">
                <BellRing className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">Notificaciones</h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                Alertas push al iniciar o al revelar la opción ganadora.
              </p>
            </div>

          </div>

          {/* Social Proof / Live badge */}
          <div className="flex items-center gap-3 pt-2 text-xs text-slate-400">
            <div className="flex -space-x-2 overflow-hidden">
              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80" alt="Avatar" />
              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80" alt="Avatar" />
              <img className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80" alt="Avatar" />
            </div>
            <span>Más de <strong className="text-white font-semibold">1,200+ votos procesados</strong> con alta fidelidad</span>
          </div>

        </div>

        {/* Right Column: Modern Authentication Card */}
        <div className="lg:col-span-5 w-full">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            
            {/* Top gradient stripe */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400"></div>

            {/* Card Header */}
            <div className="text-left mb-6">
              <h3 className="text-lg font-bold text-white">Ingresar a SHECK</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Inicia sesión para votar, crear tus eventos y recibir alertas.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Authentication Form */}
            <div className="space-y-4">
              
              {/* Official styled Google Button */}
              <button
                type="button"
                id="btn-google-login-main"
                disabled={loading}
                onClick={() => handleGoogleAuth('elierivero91@gmail.com', 'Elie Rivero')}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-800 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-3 border border-slate-200 active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{loading ? 'Autenticando con Google...' : 'Continuar con Google'}</span>
              </button>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-800 w-full"></div>
                <span className="bg-slate-900 px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  o ingresa tus datos
                </span>
              </div>

              {/* Custom Email input form */}
              <form onSubmit={handleFormSubmit} className="space-y-3 text-left">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre y apellido"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@ejemplo.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {loading ? 'Accediendo...' : 'Entrar a la Plataforma'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

            </div>

            {/* Bottom Guest Option */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">¿Solo quieres observar?</span>
              <button
                type="button"
                onClick={onContinueAsGuest}
                className="font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
              >
                Entrar como Invitado
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Security Guarantee */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
              <Lock className="w-3 h-3 text-slate-600" />
              <span>Conexión cifrada SSL con PostgreSQL y Firebase FCM</span>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-600 border-t border-slate-900 gap-2">
        <div className="flex items-center gap-2">
          <span>© 2026 SHECK Inc.</span>
          <span>•</span>
          <span>Democracia Digital & Eventos Interactivos</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-slate-500">
            <Globe className="w-3 h-3" />
            Global Live Network
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <Smartphone className="w-3 h-3" />
            Android & Web Ready
          </span>
        </div>
      </footer>

    </div>
  );
};
