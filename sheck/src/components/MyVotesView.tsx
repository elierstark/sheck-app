import React, { useState, useEffect } from 'react';
import { User, EventItem } from '../types';
import { formatDateTime } from '../utils/time';
import { History, CheckCircle2, ArrowRight, ExternalLink, Inbox } from 'lucide-react';

interface MyVotesViewProps {
  currentUser: User;
  onSelectEvent: (eventId: string) => void;
  onExplore: () => void;
}

interface VoteHistoryItem {
  vote_id: string;
  event_id: string;
  event_title: string;
  event_status: 'upcoming' | 'active' | 'closed';
  option_id: string;
  option_title: string;
  timestamp: string;
}

export const MyVotesView: React.FC<MyVotesViewProps> = ({
  currentUser,
  onSelectEvent,
  onExplore
}) => {
  const [votes, setVotes] = useState<VoteHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserVotes = async () => {
      try {
        const res = await fetch(`/api/votes/user/${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          setVotes(data.votes || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserVotes();
  }, [currentUser.id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm text-slate-500 font-medium">Cargando historial de votos...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-16 px-4 sm:px-6">
      
      <div className="py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-blue-600" />
            Historial de Participación
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Registro inmutable de los votos emitidos con la cuenta <strong>{currentUser.email}</strong>.
          </p>
        </div>
      </div>

      {votes.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Aún no has participado en ninguna votación
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Explora los eventos activos en tiempo real y emite tu voto con tu cuenta de Google.
          </p>
          <button
            id="btn-explore-events-empty"
            onClick={onExplore}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
          >
            Explorar Eventos en Vivo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {votes.map((item) => (
            <div
              key={item.vote_id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      item.event_status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : (item.event_status === 'closed' ? 'bg-slate-100 text-slate-700' : 'bg-blue-100 text-blue-800')
                    }`}>
                      {item.event_status === 'active' ? 'EN VIVO' : (item.event_status === 'closed' ? 'FINALIZADO' : 'PRÓXIMO')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {formatDateTime(item.timestamp)}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-1">
                    {item.event_title}
                  </h3>

                  <div className="text-xs text-blue-700 font-semibold mt-1 flex items-center gap-1.5">
                    <span>Opción elegida:</span>
                    <span className="bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 text-blue-900 font-bold">
                      {item.option_title}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  onClick={() => onSelectEvent(item.event_id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition-colors"
                >
                  Ver Resultados
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
