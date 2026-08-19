import React, { useState, useEffect } from 'react';
import { User, NotificationItem } from '../types';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  Trophy, 
  Vote, 
  Radio, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  Smartphone, 
  Send,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface NotificationCenterProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onSelectEvent: (eventId: string) => void;
  onNotificationCountChange?: (unreadCount: number) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSelectEvent,
  onNotificationCountChange
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Check Web Push permissions on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/notifications/user/${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
        if (onNotificationCountChange) {
          onNotificationCountChange(data.unread_count || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentUser.id]);

  // Connect to SSE stream for live instant notifications
  useEffect(() => {
    const eventSource = new EventSource(`/api/notifications/stream/${currentUser.id}`);

    eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.type === 'NEW_NOTIFICATION' && payload.data) {
          const newNotif: NotificationItem = payload.data;
          setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
          setUnreadCount((prev) => prev + 1);
          if (onNotificationCountChange) {
            onNotificationCountChange(unreadCount + 1);
          }

          // Show native browser notification if granted
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(newNotif.title, {
                body: newNotif.body,
                icon: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=128&auto=format&fit=crop&q=80'
              });
            } catch (err) {
              console.warn('Native notification blocked in iframe/sandbox context:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error parsing notification SSE:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [currentUser.id, unreadCount, onNotificationCountChange]);

  // Request Push Permission & Register FCM Token
  const handleEnablePush = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        setPushPermission(permission);

        const generatedToken = `fcm_${currentUser.id}_${Date.now()}_device_token_web`;
        setFcmToken(generatedToken);

        // Register token with backend
        await fetch('/api/notifications/fcm/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: generatedToken,
            user_id: currentUser.id,
            platform: 'web'
          })
        });

        setStatusMessage('¡Notificaciones Push de Firebase activadas exitosamente!');
        setTimeout(() => setStatusMessage(null), 4000);
      } catch (err) {
        console.error('Error requesting notification permission:', err);
      }
    } else {
      // Simulate registration for environments without Notification API
      const simToken = `fcm_${currentUser.id}_simulated_web_token`;
      setFcmToken(simToken);
      setStatusMessage('Dispositivo registrado en Firebase Cloud Messaging');
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Mark single notification as read
  const handleMarkAsRead = async (notifId: string) => {
    try {
      await fetch(`/api/notifications/${notifId}/read`, { method: 'POST' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
      );
      const newCount = Math.max(0, unreadCount - 1);
      setUnreadCount(newCount);
      if (onNotificationCountChange) {
        onNotificationCountChange(newCount);
      }
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id })
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      if (onNotificationCountChange) {
        onNotificationCountChange(0);
      }
    } catch (err) {
      console.error('Error marking all read:', err);
    }
  };

  // Send Test Push Notifications
  const handleSendTestPush = async (type: 'event_upcoming' | 'event_closed') => {
    setIsSendingTest(true);
    try {
      const res = await fetch('/api/notifications/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          type
        })
      });

      if (res.ok) {
        setStatusMessage(
          type === 'event_upcoming'
            ? '🚀 Notificación FCM de evento próximo enviada'
            : '🏆 Notificación FCM de evento finalizado enviada'
        );
        setTimeout(() => setStatusMessage(null), 4000);
        fetchNotifications();
      }
    } catch (err) {
      console.error('Error sending test push:', err);
    } finally {
      setIsSendingTest(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / (1000 * 60));
    if (mins < 1) return 'Hace un momento';
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours} h`;
    return new Date(dateStr).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                Centro de Notificaciones Push
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white">
                    {unreadCount}
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Firebase Cloud Messaging (FCM)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast message */}
        {statusMessage && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* FCM Push Connection Banner */}
        <div className="p-4 bg-gradient-to-br from-indigo-50/80 to-blue-50/50 border-b border-indigo-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800">
                Estado de Firebase Messaging
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700">
              {pushPermission === 'granted' ? 'Permiso Concedido' : 'Permiso Local'}
            </span>
          </div>

          <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
            Recibe avisos inmediatos en tu navegador y app móvil cuando un evento esté por iniciar o finalice con el ganador anunciado.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleEnablePush}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Activar / Probar Push
            </button>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
                Marcar leídas
              </button>
            )}
          </div>
        </div>

        {/* Push Simulation Actions */}
        <div className="px-4 py-3 bg-slate-50/60 border-b border-slate-200 flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Simular FCM:
          </span>
          <button
            disabled={isSendingTest}
            onClick={() => handleSendTestPush('event_upcoming')}
            className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1 shadow-2xs"
          >
            <Clock className="w-3 h-3 text-amber-500" />
            Evento Próximo
          </button>
          <button
            disabled={isSendingTest}
            onClick={() => handleSendTestPush('event_closed')}
            className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1 shadow-2xs"
          >
            <Trophy className="w-3 h-3 text-emerald-500" />
            Votación Finalizada
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pt-3 flex items-center justify-between border-b border-slate-100">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-colors ${
                filter === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`pb-2.5 text-xs font-bold border-b-2 transition-colors ${
                filter === 'unread'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              No leídas ({unreadCount})
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">No hay notificaciones</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {filter === 'unread' ? 'Has leído todas tus notificaciones' : 'Cuando se programen o finalicen eventos recibirás avisos push aquí.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUpcoming = notif.type === 'event_upcoming';
              const isClosed = notif.type === 'event_closed';

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    if (!notif.read) handleMarkAsRead(notif.id);
                    if (notif.event_id) {
                      onSelectEvent(notif.event_id);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-2xl transition-all cursor-pointer group flex gap-3 ${
                    notif.read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/70'
                  }`}
                >
                  {/* Icon badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isClosed
                        ? 'bg-amber-100 text-amber-700'
                        : isUpcoming
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isClosed ? (
                      <Trophy className="w-4 h-4" />
                    ) : isUpcoming ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>

                  {/* Body content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className={`text-xs leading-snug line-clamp-1 ${notif.read ? 'font-semibold text-slate-800' : 'font-bold text-slate-900'}`}>
                        {notif.title}
                      </h3>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {notif.body}
                    </p>

                    {/* Winner or Event info chips */}
                    {notif.data?.winner_option_title && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold">
                        <Trophy className="w-3 h-3 text-amber-600" />
                        <span>Ganador: {notif.data.winner_option_title} ({notif.data.winner_option_percentage}%)</span>
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{formatTimeAgo(notif.created_at)}</span>
                      <span className="text-blue-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Ver evento <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-500" />
            <span>FCM SSE Gateway activo</span>
          </div>
          <span>SHECK Push v2.4</span>
        </div>

      </div>
    </div>
  );
};
