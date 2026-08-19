import React, { useState, useRef } from 'react';
import { User, CreateEventPayload, VotingRule } from '../types';
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Calendar, 
  Clock, 
  CheckSquare, 
  Sparkles, 
  Layers, 
  Check, 
  AlertCircle,
  UploadCloud,
  FileImage,
  Link,
  X,
  RefreshCw
} from 'lucide-react';

interface CreateEventViewProps {
  currentUser: User;
  onEventCreated: (newEventId: string) => void;
  onCancel: () => void;
}

const PRESET_BANNERS = [
  {
    title: 'Hackathon & Tech',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80'
  },
  {
    title: 'Conferencia & Keynote',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'
  },
  {
    title: 'Desarrollo Mobile',
    url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&auto=format&fit=crop&q=80'
  },
  {
    title: 'Diseño & UI/UX',
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80'
  },
  {
    title: 'Team Building & Viajes',
    url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'
  }
];

export const CreateEventView: React.FC<CreateEventViewProps> = ({
  currentUser,
  onEventCreated,
  onCancel
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_BANNERS[0].url);
  const [bannerSourceType, setBannerSourceType] = useState<'upload' | 'preset' | 'url'>('upload');
  const [uploadedBannerName, setUploadedBannerName] = useState<string | null>(null);
  const [isDraggingBanner, setIsDraggingBanner] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const [votingRule, setVotingRule] = useState<VotingRule>('single');

  // Format initial start & end date
  const now = new Date();
  const defaultStart = new Date(now.getTime() + 1000 * 60).toISOString().slice(0, 16);
  const defaultEnd = new Date(now.getTime() + 1000 * 60 * 60 * 2).toISOString().slice(0, 16);

  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);

  // Dynamic Options
  const [options, setOptions] = useState<Array<{ title: string; image_url: string; image_name?: string }>>([
    { title: 'Opción 1: Propuesta Alpha', image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&auto=format&fit=crop&q=80' },
    { title: 'Opción 2: Propuesta Beta', image_url: 'https://images.unsplash.com/photo-1558441719-2347b73f861b?w=300&auto=format&fit=crop&q=80' },
    { title: 'Opción 3: Propuesta Gamma', image_url: '' }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Banner File Upload
  const handleBannerFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP, GIF).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('La imagen es demasiado grande. El tamaño máximo recomendado es de 8 MB.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
        setUploadedBannerName(file.name);
        setBannerSourceType('upload');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Option File Upload
  const handleOptionFileSelect = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido para la opción.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen de la opción no debe superar 5 MB.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const updated = [...options];
        updated[index].image_url = event.target.result as string;
        updated[index].image_name = file.name;
        setOptions(updated);
      }
    };
    reader.readAsDataURL(file);
  };

  // Set Preset End Time Duration
  const setQuickDuration = (minutes: number) => {
    const s = new Date(startTime);
    const e = new Date(s.getTime() + minutes * 60 * 1000);
    setEndTime(e.toISOString().slice(0, 16));
  };

  const handleAddOption = () => {
    if (options.length >= 8) {
      setError('El límite máximo es de 8 opciones por evento.');
      return;
    }
    setOptions([...options, { title: `Opción ${options.length + 1}`, image_url: '' }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      setError('Un evento requiere al menos 2 opciones de votación.');
      return;
    }
    setOptions(options.filter((_, idx) => idx !== index));
  };

  const handleOptionChange = (index: number, field: 'title' | 'image_url', val: string) => {
    const updated = [...options];
    updated[index][field] = val;
    if (field === 'image_url') {
      updated[index].image_name = undefined;
    }
    setOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('El título del evento es obligatorio.');
      return;
    }

    if (new Date(endTime) <= new Date(startTime)) {
      setError('La fecha y hora de fin debe ser posterior al inicio.');
      return;
    }

    const validOptions = options.filter((o) => o.title.trim().length > 0);
    if (validOptions.length < 2) {
      setError('Debes definir al menos 2 opciones con nombre válido.');
      return;
    }

    setSubmitting(true);

    try {
      const payload: CreateEventPayload = {
        title: title.trim(),
        description: description.trim(),
        image_url: imageUrl,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        voting_rule: votingRule,
        options: validOptions.map(o => ({ title: o.title, image_url: o.image_url || undefined })),
        user_id: currentUser.id
      };

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al crear el evento');
      } else {
        onEventCreated(data.event.id);
      }
    } catch (err) {
      setError('Error de red al comunicarse con el backend.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 px-4 sm:px-6">
      
      <div className="py-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Crear Nuevo Evento de Votación
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configura los parámetros, temporalidad de inicio/fin y las opciones para que los usuarios voten en tiempo real.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Fields (Left 7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Basic Info */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Información Principal
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Título del Evento *
              </label>
              <input
                id="input-event-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Elección del Mejor Proyecto Hackathon 2026"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Descripción / Instrucciones
              </label>
              <textarea
                id="input-event-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explica a los participantes el objetivo y el criterio de votación..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Banner Image Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Imagen de Portada del Evento
                </label>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setBannerSourceType('upload')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                      bannerSourceType === 'upload'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    Subir archivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerSourceType('preset')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                      bannerSourceType === 'preset'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <FileImage className="w-3.5 h-3.5" />
                    Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerSourceType('url')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                      bannerSourceType === 'url'
                        ? 'bg-white text-indigo-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Link className="w-3.5 h-3.5" />
                    Enlace URL
                  </button>
                </div>
              </div>

              {/* Mode 1: File Upload with Drag & Drop */}
              {bannerSourceType === 'upload' && (
                <div className="space-y-2">
                  <input
                    ref={bannerFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleBannerFileSelect(e.target.files[0]);
                      }
                    }}
                  />

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingBanner(true);
                    }}
                    onDragLeave={() => setIsDraggingBanner(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingBanner(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleBannerFileSelect(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => bannerFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDraggingBanner
                        ? 'border-indigo-600 bg-indigo-50/70 scale-[1.01]'
                        : 'border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {uploadedBannerName ? `Archivo cargado: ${uploadedBannerName}` : 'Arrastra y suelta tu imagen aquí, o haz clic para explorar'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Soporta PNG, JPG, WebP o GIF (hasta 8MB)
                        </p>
                      </div>
                      <button
                        type="button"
                        className="mt-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs"
                      >
                        {imageUrl && uploadedBannerName ? 'Cambiar imagen' : 'Seleccionar desde mi dispositivo'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode 2: Presets Grid */}
              {bannerSourceType === 'preset' && (
                <div className="space-y-2">
                  <div className="grid grid-cols-5 gap-2">
                    {PRESET_BANNERS.map((banner) => (
                      <button
                        key={banner.title}
                        type="button"
                        onClick={() => {
                          setImageUrl(banner.url);
                          setUploadedBannerName(null);
                        }}
                        className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all group ${
                          imageUrl === banner.url ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img src={banner.url} alt={banner.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                        {imageUrl === banner.url && (
                          <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white stroke-[3]" />
                          </div>
                        )}
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] font-semibold text-white py-0.5 px-1 truncate text-center">
                          {banner.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode 3: Direct URL */}
              {bannerSourceType === 'url' && (
                <div className="space-y-1.5">
                  <input
                    id="input-event-image"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value);
                      setUploadedBannerName(null);
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 block">
                    Pega un enlace HTTPS directo a cualquier imagen en internet.
                  </span>
                </div>
              )}

              {/* Banner Thumbnail Preview bar */}
              {imageUrl && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-100/80 border border-slate-200">
                  <img src={imageUrl} alt="Banner Preview" className="w-16 h-10 rounded-lg object-cover border border-slate-300 shrink-0" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-slate-800 block truncate">
                      {uploadedBannerName || 'Portada Seleccionada'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Lista para el evento
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrl(PRESET_BANNERS[0].url);
                      setUploadedBannerName(null);
                      setBannerSourceType('preset');
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white transition-colors"
                    title="Restablecer imagen predeterminada"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Timing & Duration */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Temporalidad y Cierre Automático
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fecha y Hora de Inicio
                </label>
                <input
                  id="input-event-start"
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fecha y Hora de Fin (Cierre)
                </label>
                <input
                  id="input-event-end"
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                />
              </div>
            </div>

            {/* Quick Timing Presets for Testing */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Ajuste rápido de duración desde el inicio:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setQuickDuration(15)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  +15 minutos (Test Rápido)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(60)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  +1 hora
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(60 * 24)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  +24 horas (1 día)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(60 * 24 * 7)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  +7 días
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Voting Rule */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              Reglas de Votación
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                id="rule-single-vote"
                onClick={() => setVotingRule('single')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  votingRule === 'single'
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">Voto Único</span>
                  {votingRule === 'single' && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Cada usuario registrado con Google puede emitir <strong>1 solo voto</strong> en total.
                </p>
              </div>

              <div
                id="rule-multiple-vote"
                onClick={() => setVotingRule('multiple')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  votingRule === 'multiple'
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">Selección Múltiple</span>
                  {votingRule === 'multiple' && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  El usuario puede apoyar <strong>múltiples opciones</strong> dentro del mismo evento.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Voting Options */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Opciones del Evento ({options.length})
              </h2>

              <button
                id="btn-add-option"
                type="button"
                onClick={handleAddOption}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir Opción
              </button>
            </div>

            <div className="space-y-3">
              {options.map((opt, idx) => (
                <div 
                  key={idx} 
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>

                    <input
                      id={`input-option-title-${idx}`}
                      type="text"
                      required
                      value={opt.title}
                      onChange={(e) => handleOptionChange(idx, 'title', e.target.value)}
                      placeholder={`Título de la opción ${idx + 1}`}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500 font-medium"
                    />

                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Eliminar opción"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Option Image Controls: File upload or URL */}
                  <div className="pl-8 space-y-2">
                    <div className="flex items-center gap-2">
                      <label 
                        htmlFor={`file-option-${idx}`}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{opt.image_url ? 'Cambiar archivo' : 'Subir imagen'}</span>
                        <input
                          id={`file-option-${idx}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleOptionFileSelect(idx, e.target.files[0]);
                            }
                          }}
                        />
                      </label>

                      <div className="flex-1 flex items-center gap-1.5 bg-white px-2.5 py-1 border border-slate-200 rounded-lg">
                        <Link className="w-3 h-3 text-slate-400 shrink-0" />
                        <input
                          type="url"
                          value={opt.image_name ? '' : opt.image_url}
                          onChange={(e) => handleOptionChange(idx, 'image_url', e.target.value)}
                          placeholder={opt.image_name ? `Imagen cargada: ${opt.image_name}` : 'O pega una URL (https://...)'}
                          className="flex-1 text-[11px] text-slate-600 font-mono focus:outline-hidden bg-transparent"
                        />
                      </div>
                    </div>

                    {/* Option Image Preview */}
                    {opt.image_url && (
                      <div className="flex items-center gap-2 p-1.5 bg-indigo-50/60 rounded-xl border border-indigo-100 max-w-fit">
                        <img 
                          src={opt.image_url} 
                          alt={`Opción ${idx + 1}`} 
                          className="w-8 h-8 rounded-lg object-cover border border-indigo-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[11px] font-semibold text-indigo-900 max-w-[200px] truncate">
                          {opt.image_name || 'Imagen asignada'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...options];
                            updated[idx].image_url = '';
                            updated[idx].image_name = undefined;
                            setOptions(updated);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Quitar imagen"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>

            <button
              id="btn-create-event-submit"
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center gap-2"
            >
              {submitting ? 'Creando evento...' : 'Publicar Evento de Votación'}
            </button>
          </div>
        </div>

        {/* Live Card Preview (Right 5 cols on Desktop) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Vista Previa de Tarjeta Móvil
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="relative h-40 bg-slate-900">
                <img
                  src={imageUrl}
                  alt={title || 'Portada'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                    VISTA PREVIA
                  </span>
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white text-xs font-bold line-clamp-1">
                  {title || 'Título del Evento'}
                </div>
              </div>

              <div className="p-4 space-y-3">
                <p className="text-xs text-slate-500 line-clamp-2">
                  {description || 'Sin descripción todavía...'}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  {options.slice(0, 3).map((o, i) => (
                    <div key={i} className="text-xs p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="font-medium text-slate-700 truncate">{o.title || `Opción ${i + 1}`}</span>
                      <span className="text-[10px] text-slate-400 font-mono">0%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
              💡 <strong>Regla:</strong> Los usuarios que ingresen con Google Sign-In verán la cuenta regresiva en vivo y podrán votar según las reglas configuradas.
            </div>
          </div>
        </div>

      </form>

    </div>
  );
};
