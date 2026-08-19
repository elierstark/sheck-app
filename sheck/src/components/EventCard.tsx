import React, { useState, useEffect } from 'react';
import { EventItem } from '../types';
import { getTimeRemaining, formatDateTime } from '../utils/time';
import { ShareModal } from './ShareModal';
import { 
  Clock, 
  Users, 
  CheckCircle2, 
  Trophy, 
  ArrowRight, 
  CheckSquare,
  Sparkles,
  Share2
} from 'lucide-react';

interface EventCardProps {
  event: EventItem;
  onSelect: (event: EventItem) => void;
  hasUserVoted?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSelect, hasUserVoted }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [timeState, setTimeState] = useState(() => 
    getTimeRemaining(event.start_time, event.end_time)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeState(getTimeRemaining(event.start_time, event.end_time));
    }, 1000);
    return () => clearInterval(interval);
  }, [event.start_time, event.end_time]);

  const isLive = !timeState.isUpcoming && !timeState.isExpired;
  const isClosed = timeState.isExpired || event.status === 'closed';

  // Find winning option if closed
  const winningOption = isClosed
    ? event.options.reduce((prev, current) => (prev.votes_count > current.votes_count ? prev : current), event.options[0])
    : null;

  return (
    <>
      <div 
        id={`event-card-${event.id}`}
        className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col hover:border-blue-400"
      >
        {/* Event Header Image & Status Badges */}
        <div 
          onClick={() => onSelect(event)}
          className="relative h-44 w-full overflow-hidden bg-slate-900 cursor-pointer"
        >
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />

          {/* Status Pill Top-Left */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {isLive && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse"></span>
                EN VIVO
              </span>
            )}
            {timeState.isUpcoming && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-sm">
                PRÓXIMO
              </span>
            )}
            {isClosed && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-200 shadow-sm border border-slate-700">
                FINALIZADO
              </span>
            )}

            {hasUserVoted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-sm">
                <CheckCircle2 className="w-3 h-3" />
                Votaste
              </span>
            )}
          </div>

          {/* Voting Rule Top-Right */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-950/70 text-white backdrop-blur-md border border-white/10">
              <CheckSquare className="w-3 h-3 text-blue-400" />
              {event.voting_rule === 'single' ? 'Voto Único' : 'Voto Múltiple'}
            </span>
          </div>

          {/* Live Countdown Bottom-Left */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
            <div className="flex items-center gap-1.5 drop-shadow">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span className={isLive ? 'text-emerald-300 font-mono font-bold text-xs' : 'text-slate-200 font-mono text-xs'}>
                {timeState.formatted}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-200 drop-shadow text-xs font-semibold">
              <Users className="w-3.5 h-3.5" />
              <span>{event.total_votes} {event.total_votes === 1 ? 'voto' : 'votos'}</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div onClick={() => onSelect(event)} className="cursor-pointer">
            {/* Creator Profile */}
            <div className="flex items-center gap-2 mb-2">
              <img
                src={event.creator_avatar}
                alt={event.creator_name}
                className="w-5 h-5 rounded-full object-cover border border-slate-200"
                referrerPolicy="no-referrer"
              />
              <span className="text-xs text-slate-500 truncate font-medium">Por {event.creator_name}</span>
              <span className="text-slate-300 text-xs">•</span>
              <span className="text-xs text-slate-400">{formatDateTime(event.start_time)}</span>
            </div>

            {/* Event Title & Snippet */}
            <h3 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {event.title}
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {event.description}
            </p>

            {/* Options Summary Preview */}
            <div className="mt-4 space-y-2">
              {isClosed && winningOption && winningOption.votes_count > 0 ? (
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Opción Ganadora
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {winningOption.title}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-amber-700">{winningOption.percentage}%</div>
                    <div className="text-[10px] text-amber-600">{winningOption.votes_count} v.</div>
                  </div>
                </div>
              ) : (
                // Top 2 options bar preview
                event.options.slice(0, 2).map((opt) => (
                  <div key={opt.id} className="text-xs">
                    <div className="flex justify-between text-slate-700 font-medium mb-1">
                      <span className="truncate pr-2">{opt.title}</span>
                      <span className="font-mono text-slate-600 font-bold shrink-0">{opt.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${opt.percentage}%` }}
                      />
                    </div>
                  </div>
                ))
              )}

              {event.options.length > 2 && !isClosed && (
                <div className="text-[11px] text-slate-400 font-medium text-center pt-1">
                  + {event.options.length - 2} opciones adicionales
                </div>
              )}
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              id={`btn-share-card-${event.id}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowShareModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Compartir en WhatsApp, Twitter, Facebook"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Compartir</span>
            </button>

            <button
              id={`btn-open-event-${event.id}`}
              onClick={() => onSelect(event)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all group-hover:bg-blue-600 group-hover:text-white"
            >
              {isClosed ? 'Ver Resultados' : (hasUserVoted ? 'Ver En Vivo' : 'Votar Ahora')}
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        event={event}
      />
    </>
  );
};

