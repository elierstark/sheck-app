import React, { useState, useEffect } from 'react';
import { EventItem, User, Option } from '../types';
import { getTimeRemaining, formatDateTime } from '../utils/time';
import confetti from 'canvas-confetti';
import { ShareModal } from './ShareModal';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  CheckCircle2, 
  Trophy, 
  Sparkles, 
  Share2, 
  RotateCcw, 
  StopCircle, 
  ShieldAlert, 
  Check, 
  Radio, 
  CheckSquare, 
  Layers, 
  QrCode,
  Terminal,
  ExternalLink,
  MessageCircle,
  Twitter,
  Facebook,
  Copy
} from 'lucide-react';

interface EventDetailProps {
  eventId: string;
  currentUser: User;
  onBack: () => void;
  onEventUpdated: () => void;
}

export const EventDetail: React.FC<EventDetailProps> = ({
  eventId,
  currentUser,
  onBack,
  onEventUpdated
}) => {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [userVotedOptions, setUserVotedOptions] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteSuccessMessage, setVoteSuccessMessage] = useState<string | null>(null);
  const [confettiFired, setConfettiFired] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showApiInspector, setShowApiInspector] = useState(false);

  // Time remaining state
  const [timeState, setTimeState] = useState(() => ({
    totalMs: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    isUpcoming: false,
    formatted: ''
  }));

  // Fetch Event Data
  const fetchEventData = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}?user_id=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
        setUserVotedOptions(data.user_voted_options || []);
        setTimeState(getTimeRemaining(data.event.start_time, data.event.end_time));
      }
    } catch (err) {
      console.error('Error fetching event:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [eventId, currentUser.id]);

  // Real-time Server-Sent Events (SSE) Listener
  useEffect(() => {
    if (!eventId) return;

    const eventSource = new EventSource(`/api/events/${eventId}/stream`);

    eventSource.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        if (parsed.type === 'EVENT_UPDATE' && parsed.data) {
          setEvent(parsed.data);
          setTimeState(getTimeRemaining(parsed.data.start_time, parsed.data.end_time));
        }
      } catch (err) {
        console.error('SSE Parse error', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [eventId]);

  // Dynamic 1-second Countdown Interval
  useEffect(() => {
    if (!event) return;

    const timer = setInterval(() => {
      const remaining = getTimeRemaining(event.start_time, event.end_time);
      setTimeState(remaining);

      // Trigger celebration if it just expired and there are votes
      if (remaining.isExpired && !confettiFired && event.total_votes > 0) {
        setConfettiFired(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [event, confettiFired]);

  // Option selection logic
  const handleToggleOption = (optId: string) => {
    if (!event || timeState.isExpired || userVotedOptions.length > 0) return;

    setVoteError(null);
    setVoteSuccessMessage(null);

    if (event.voting_rule === 'single') {
      setSelectedOptions([optId]);
    } else {
      if (selectedOptions.includes(optId)) {
        setSelectedOptions(selectedOptions.filter((id) => id !== optId));
      } else {
        setSelectedOptions([...selectedOptions, optId]);
      }
    }
  };

  // Submit Vote
  const handleVoteSubmit = async () => {
    if (selectedOptions.length === 0) {
      setVoteError('Por favor selecciona al menos una opción para emitir tu voto.');
      return;
    }

    setSubmittingVote(true);
    setVoteError(null);

    try {
      const res = await fetch(`/api/events/${eventId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          optionIds: selectedOptions,
          userId: currentUser.id
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setVoteError(data.error || 'No se pudo registrar el voto');
      } else {
        setEvent(data.event);
        setUserVotedOptions(data.user_voted_options || []);
        setSelectedOptions([]);
        setVoteSuccessMessage('¡Tu voto fue registrado exitosamente en tiempo real!');
        onEventUpdated();

        // Little micro-confetti
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.7 }
        });
      }
    } catch (err) {
      setVoteError('Error de red al enviar el voto.');
    } finally {
      setSubmittingVote(false);
    }
  };

  // Admin action: Force close event (for testing winner announcement)
  const handleForceClose = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/close`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
        onEventUpdated();
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.5 }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin action: Reset votes (for demo testing)
  const handleResetVotes = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}/reset-votes`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
        setUserVotedOptions([]);
        setSelectedOptions([]);
        setVoteSuccessMessage('Votos reiniciados para pruebas.');
        onEventUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !event) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-slate-500 font-medium">Cargando evento y sincronizando votos en tiempo real...</p>
      </div>
    );
  }

  const isLive = !timeState.isUpcoming && !timeState.isExpired;
  const isClosed = timeState.isExpired || event.status === 'closed';
  const hasAlreadyVoted = userVotedOptions.length > 0;

  // Find winning option
  const winningOption = isClosed
    ? event.options.reduce((prev, current) => (prev.votes_count > current.votes_count ? prev : current), event.options[0])
    : null;

  return (
    <div className="max-w-4xl mx-auto pb-16 px-4 sm:px-6">
      
      {/* Top Bar Navigation & Actions */}
      <div className="flex items-center justify-between py-4">
        <button
          id="btn-back-to-events"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Eventos
        </button>

        <div className="flex items-center gap-2">
          <button
            id="btn-api-inspector"
            onClick={() => setShowApiInspector(!showApiInspector)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-600" />
            Ver JSON / Endpoint
          </button>
          
          <button
            id="btn-share-event"
            onClick={() => setShowShareModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Compartir
          </button>
        </div>
      </div>

      {/* Main Event Card / Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        
        {/* Cover Header */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover opacity-85"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLive && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse"></span>
                  VOTACIÓN EN VIVO
                </span>
              )}
              {timeState.isUpcoming && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-blue-600 text-white shadow-lg">
                  PRÓXIMAMENTE
                </span>
              )}
              {isClosed && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-slate-800 text-slate-200 border border-slate-700">
                  VOTACIÓN FINALIZADA
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-md border border-white/10">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                {event.voting_rule === 'single' ? 'Regla: 1 Solo Voto' : 'Regla: Voto Múltiple'}
              </span>
            </div>
          </div>

          {/* Bottom Title & Countdown within Cover */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 text-white">
            <div className="flex items-center gap-2 mb-2 text-xs text-slate-300">
              <img
                src={event.creator_avatar}
                alt={event.creator_name}
                className="w-5 h-5 rounded-full object-cover border border-white/30"
                referrerPolicy="no-referrer"
              />
              <span>Creado por <strong className="text-white">{event.creator_name}</strong></span>
              <span>•</span>
              <span>{formatDateTime(event.start_time)}</span>
            </div>

            <h1 className="text-xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-md">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Live Countdown Ribbon */}
        <div className={`px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b ${
          isLive ? 'bg-emerald-50/70 border-emerald-100' : (isClosed ? 'bg-slate-50 border-slate-200' : 'bg-blue-50/70 border-blue-100')
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isLive ? 'bg-emerald-600 text-white' : (isClosed ? 'bg-slate-700 text-white' : 'bg-blue-600 text-white')
            }`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {isLive ? 'Tiempo Restante' : (isClosed ? 'Estado del Evento' : 'Cuenta Regresiva')}
              </div>
              <div className="text-base sm:text-lg font-black font-mono text-slate-900">
                {timeState.formatted}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Participación
              </div>
              <div className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-1.5 justify-end">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>{event.total_votes} {event.total_votes === 1 ? 'voto total' : 'votos totales'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="p-6 text-sm text-slate-600 leading-relaxed border-b border-slate-100">
            {event.description}
          </div>
        )}

        {/* Social Share Bar */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Share2 className="w-4 h-4 text-blue-600" />
            <span>Compartir evento en redes:</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* WhatsApp */}
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🗳️ ¡Vota en SHECK! ${event.title}\nParticipa ahora en la votación en tiempo real: ${typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?event=${event.id}` : ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs transition-all hover:scale-102"
              title="Compartir en WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span>WhatsApp</span>
            </a>

            {/* Twitter / X */}
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🗳️ Vota en vivo en SHECK: "${event.title}"`)}&url=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?event=${event.id}` : '')}&hashtags=SHECK,VotacionEnVivo`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-xs transition-all hover:scale-102"
              title="Compartir en Twitter (X)"
            >
              <Twitter className="w-3.5 h-3.5 fill-white" />
              <span>Twitter</span>
            </a>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?event=${event.id}` : '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all hover:scale-102"
              title="Compartir en Facebook"
            >
              <Facebook className="w-3.5 h-3.5 fill-white" />
              <span>Facebook</span>
            </a>

            {/* More Options / QR Code */}
            <button
              onClick={() => setShowShareModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-blue-600" />
              <span>QR y Más</span>
            </button>
          </div>
        </div>

        {/* Winner Highlight Card (When Closed) */}
        {isClosed && winningOption && (
          <div className="p-6 bg-gradient-to-br from-amber-500/10 via-amber-50 to-white border-b border-amber-200">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Opción Ganadora Confirmada
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                  {winningOption.title}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Con <strong>{winningOption.votes_count} votos</strong> ({winningOption.percentage}% de preferencia).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Options List & Voting Section */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Opciones de Votación ({event.options.length})
            </h2>

            {hasAlreadyVoted && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                Has votado como {currentUser.name}
              </span>
            )}
          </div>

          {/* Option Cards */}
          <div className="space-y-3.5">
            {event.options.map((option) => {
              const isSelected = selectedOptions.includes(option.id);
              const isUserVote = userVotedOptions.includes(option.id);
              const isWinner = isClosed && winningOption?.id === option.id;

              return (
                <div
                  key={option.id}
                  id={`option-card-${option.id}`}
                  onClick={() => handleToggleOption(option.id)}
                  className={`relative rounded-2xl border p-4 transition-all duration-200 ${
                    isWinner 
                      ? 'border-amber-300 bg-amber-50/40 ring-2 ring-amber-400/50'
                      : isUserVote
                      ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/30'
                      : isSelected
                      ? 'border-2 border-blue-600 bg-blue-50 ring-2 ring-blue-600/30 cursor-pointer shadow-xs'
                      : !hasAlreadyVoted && isLive
                      ? 'border-slate-200 hover:border-blue-400 hover:bg-slate-50 cursor-pointer'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    
                    {/* Checkbox / Radio Selection Icon */}
                    {isLive && !hasAlreadyVoted && (
                      <div className="shrink-0">
                        {event.voting_rule === 'single' ? (
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        ) : (
                          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Option Thumbnail Image (if exists) */}
                    {option.image_url && (
                      <img
                        src={option.image_url}
                        alt={option.title}
                        className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    )}

                    {/* Option Title & Badges */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-slate-900">
                          {option.title}
                        </span>

                        {isUserVote && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                            <Check className="w-3 h-3" />
                            Tu Voto
                          </span>
                        )}

                        {isWinner && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                            <Trophy className="w-3 h-3" />
                            Ganador
                          </span>
                        )}
                      </div>

                      {/* Vote Count & Percentages */}
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-1 font-medium">
                        <span>{option.votes_count} {option.votes_count === 1 ? 'voto' : 'votos'}</span>
                        <span className="font-mono font-bold text-blue-600">{option.percentage}%</span>
                      </div>

                      {/* Animated Progress Bar */}
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            isWinner
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                              : isUserVote
                              ? 'bg-emerald-500'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${option.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback & Submission Box */}
          {voteError && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
              {voteError}
            </div>
          )}

          {voteSuccessMessage && (
            <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              {voteSuccessMessage}
            </div>
          )}

          {/* Voting Action Button */}
          {isLive && !hasAlreadyVoted && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="text-xs text-slate-500 font-medium">
                {event.voting_rule === 'single'
                  ? 'Selecciona 1 opción y presiona Confirmar.'
                  : 'Puedes seleccionar una o más opciones.'}
              </div>

              <button
                id="btn-submit-vote"
                onClick={handleVoteSubmit}
                disabled={submittingVote || selectedOptions.length === 0}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl text-sm font-bold bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white shadow-lg shadow-slate-900/10 transition-all flex items-center justify-center gap-2"
              >
                {submittingVote ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Registrando voto...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirmar Voto ({selectedOptions.length})
                  </>
                )}
              </button>
            </div>
          )}

          {/* Locked State when User Already Voted */}
          {hasAlreadyVoted && isLive && (
            <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-xs font-semibold text-slate-700">
                🔒 Tu participación en este evento ha sido guardada de forma segura.
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Los resultados se actualizan en vivo en esta pantalla a medida que otros participantes votan.
              </p>
            </div>
          )}

          {isClosed && (
            <div className="mt-6 p-4 rounded-2xl bg-slate-100 border border-slate-200 text-center">
              <p className="text-xs font-bold text-slate-700">
                La votación ha concluido y el resultado es final.
              </p>
            </div>
          )}
        </div>

        {/* Developer Sandbox Controls */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>Panel de Pruebas & Simulación:</span>
          </div>

          <div className="flex items-center gap-2">
            {isLive && (
              <button
                id="btn-admin-force-close"
                onClick={handleForceClose}
                className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold transition-colors flex items-center gap-1"
              >
                <StopCircle className="w-3 h-3" />
                Forzar Cierre (Probar Ganador)
              </button>
            )}

            <button
              id="btn-admin-reset-votes"
              onClick={handleResetVotes}
              className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reiniciar Votos
            </button>
          </div>
        </div>
      </div>

      {/* API Inspector Modal / Sheet */}
      {showApiInspector && (
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 mb-6 shadow-xl border border-slate-800 text-xs font-mono">
          <div className="flex items-center justify-between mb-3 text-slate-400 border-b border-slate-800 pb-2">
            <span className="font-bold text-emerald-400">REST API Endpoint para Android / Retrofit:</span>
            <button onClick={() => setShowApiInspector(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="space-y-2">
            <div className="text-slate-300">
              <strong className="text-indigo-400">GET</strong> /api/events/{event.id}?user_id={currentUser.id}
            </div>
            <div className="text-slate-300">
              <strong className="text-emerald-400">POST</strong> /api/events/{event.id}/vote
            </div>
            <div className="bg-slate-950 p-3 rounded-lg text-[11px] text-slate-300 overflow-x-auto">
              <pre>{JSON.stringify({
                optionIds: selectedOptions.length > 0 ? selectedOptions : [event.options[0]?.id],
                userId: currentUser.id
              }, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal 
        isOpen={showShareModal} 
        onClose={() => setShowShareModal(false)} 
        event={event} 
      />

    </div>
  );
};
