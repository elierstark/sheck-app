import React, { useState, useEffect } from 'react';
import { User, EventItem } from './types';
import { Navbar } from './components/Navbar';
import { EventCard } from './components/EventCard';
import { EventDetail } from './components/EventDetail';
import { CreateEventView } from './components/CreateEventView';
import { MyVotesView } from './components/MyVotesView';
import { MobileFrame } from './components/MobileFrame';
import { UserSwitcherModal } from './components/UserSwitcherModal';
import { NotificationCenter } from './components/NotificationCenter';
import { LoginScreen } from './components/LoginScreen';
import { 
  Vote, 
  Search, 
  PlusCircle, 
  Sparkles, 
  Radio, 
  CheckCircle2, 
  Layers, 
  Code2, 
  Smartphone,
  Trophy,
  Users,
  Activity,
  Database,
  ShieldCheck,
  Zap,
  Server,
  LogIn
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('sheck_auth_user');
      return !!saved;
    } catch {
      return false;
    }
  });

  const [isGuest, setIsGuest] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('sheck_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: 'usr_1',
      google_id: '109876543210987654321',
      name: 'Elie Rivero',
      email: 'elierivero91@gmail.com',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      created_at: new Date().toISOString()
    };
  });

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [userVotedEventIds, setUserVotedEventIds] = useState<string[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'events' | 'create' | 'my-votes'>('events');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'closed' | 'mine'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isMobileFrame, setIsMobileFrame] = useState(true);
  const [showGoogleAuthModal, setShowGoogleAuthModal] = useState(false);
  const [showNotificationsDrawer, setShowNotificationsDrawer] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch Users and Events
  const fetchData = async () => {
    try {
      // Fetch users
      const usersRes = await fetch('/api/users');
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setAllUsers(uData.users || []);
        const found = uData.users.find((u: User) => u.id === currentUser.id);
        if (found) setCurrentUser(found);
      }

      // Fetch events
      const eventsRes = await fetch('/api/events');
      if (eventsRes.ok) {
        const eData = await eventsRes.json();
        setEvents(eData.events || []);
      }

      // Fetch user votes
      if (currentUser.id) {
        const votesRes = await fetch(`/api/votes/user/${currentUser.id}`);
        if (votesRes.ok) {
          const vData = await votesRes.json();
          const votedIds = Array.from(new Set(vData.votes.map((v: { event_id: string }) => v.event_id))) as string[];
          setUserVotedEventIds(votedIds);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser.id]);

  // Check URL params for direct event linking
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const eventParam = params.get('event');
    if (eventParam) {
      setSelectedEventId(eventParam);
    }
  }, []);

  const handleSelectEvent = (event: EventItem) => {
    setSelectedEventId(event.id);
  };

  const handleEventCreated = (newEventId: string) => {
    fetchData();
    setSelectedEventId(newEventId);
    setActiveTab('events');
  };

  // Filtered Events
  const filteredEvents = events.filter((evt) => {
    if (statusFilter === 'active' && evt.status !== 'active') return false;
    if (statusFilter === 'upcoming' && evt.status !== 'upcoming') return false;
    if (statusFilter === 'closed' && evt.status !== 'closed') return false;
    if (statusFilter === 'mine' && evt.user_id !== currentUser.id) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = evt.title.toLowerCase().includes(q);
      const matchDesc = evt.description.toLowerCase().includes(q);
      const matchCreator = evt.creator_name.toLowerCase().includes(q);
      const matchOptions = evt.options.some((o) => o.title.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchCreator || matchOptions;
    }

    return true;
  });

  const activeEventsCount = events.filter((e) => e.status === 'active').length;
  const totalVotesAcrossAll = events.reduce((acc, curr) => acc + (curr.total_votes || 0), 0);

  const handleLogout = () => {
    localStorage.removeItem('sheck_auth_user');
    setIsAuthenticated(false);
    setIsGuest(false);
  };

  // If user is not authenticated and did not opt to browse as guest, show the dedicated Login Screen
  if (!isAuthenticated && !isGuest) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          setIsGuest(false);
          fetchData();
        }}
        onContinueAsGuest={() => {
          setIsGuest(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      
      {/* Guest Mode Notice Banner */}
      {isGuest && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Estás navegando en <strong>Modo Invitado</strong> (Solo lectura).</span>
          </div>
          <button
            onClick={() => {
              setIsGuest(false);
              setIsAuthenticated(false);
            }}
            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow-xs"
          >
            <LogIn className="w-3 h-3" />
            Iniciar Sesión con Google
          </button>
        </div>
      )}

      {/* Primary Top Navigation */}
      <Navbar
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={(u) => {
          setCurrentUser(u);
          fetchData();
        }}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'events') setSelectedEventId(null);
        }}
        isMobileFrame={isMobileFrame}
        setIsMobileFrame={setIsMobileFrame}
        onOpenGoogleAuthModal={() => setShowGoogleAuthModal(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setShowNotificationsDrawer(true)}
        onLogout={handleLogout}
        isGuest={isGuest}
      />

      {/* Main Content Area (supports wrapping in MobileFrame) */}
      <main className="flex-1">
        <MobileFrame 
          enabled={isMobileFrame} 
          onToggle={() => setIsMobileFrame(false)}
        >
          
          {/* VIEW 1: Create Event Form */}
          {activeTab === 'create' && (
            <CreateEventView
              currentUser={currentUser}
              onEventCreated={handleEventCreated}
              onCancel={() => setActiveTab('events')}
            />
          )}

          {/* VIEW 3: My Personal Votes History */}
          {activeTab === 'my-votes' && (
            <MyVotesView
              currentUser={currentUser}
              onSelectEvent={(id) => {
                setSelectedEventId(id);
                setActiveTab('events');
              }}
              onExplore={() => setActiveTab('events')}
            />
          )}

          {/* VIEW 4: Events List / Event Detail (Main Experience) */}
          {activeTab === 'events' && (
            selectedEventId ? (
              <EventDetail
                eventId={selectedEventId}
                currentUser={currentUser}
                onBack={() => setSelectedEventId(null)}
                onEventUpdated={fetchData}
              />
            ) : (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                
                {/* Hero / Quick Stats Bar */}
                <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
                  <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="max-w-xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-3 backdrop-blur-xs">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        SHECK • Eventos y Votaciones en Tiempo Real
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                        Crea eventos y vota en vivo con tu cuenta de Google.
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                        Conteo en vivo sincronizado con SSE, enlaces directos para compartir en WhatsApp, Facebook y Twitter, y soporte nativo para Android.
                      </p>
                    </div>

                    {/* Stats Tiles */}
                    <div className="grid grid-cols-3 gap-3 shrink-0">
                      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700 text-center">
                        <div className="text-xl sm:text-2xl font-black text-emerald-400 flex items-center justify-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                          {activeEventsCount}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                          En Vivo
                        </div>
                      </div>

                      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700 text-center">
                        <div className="text-xl sm:text-2xl font-black text-blue-400">
                          {totalVotesAcrossAll}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                          Votos Totales
                        </div>
                      </div>

                      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700 text-center">
                        <div className="text-xl sm:text-2xl font-black text-slate-200">
                          {events.length}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                          Eventos
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Grid with Telemetry Aside & Event Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                  
                  {/* Left Column: Filters & Events (3 Cols) */}
                  <div className="lg:col-span-3 space-y-6">
                    
                    {/* Filters & Search Control Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                      
                      {/* Filter Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        <button
                          id="filter-all"
                          onClick={() => setStatusFilter('all')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            statusFilter === 'all'
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Todos ({events.length})
                        </button>

                        <button
                          id="filter-active"
                          onClick={() => setStatusFilter('active')}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            statusFilter === 'active'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          En Vivo ({events.filter((e) => e.status === 'active').length})
                        </button>

                        <button
                          id="filter-upcoming"
                          onClick={() => setStatusFilter('upcoming')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            statusFilter === 'upcoming'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Próximos ({events.filter((e) => e.status === 'upcoming').length})
                        </button>

                        <button
                          id="filter-closed"
                          onClick={() => setStatusFilter('closed')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            statusFilter === 'closed'
                              ? 'bg-slate-700 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Finalizados ({events.filter((e) => e.status === 'closed').length})
                        </button>

                        <button
                          id="filter-mine"
                          onClick={() => setStatusFilter('mine')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                            statusFilter === 'mine'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          Creados por Mí
                        </button>
                      </div>

                      {/* Search Bar + Create Button */}
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 sm:w-56">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            id="search-events-input"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar eventos..."
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
                          />
                        </div>

                        <button
                          id="btn-create-event-cta"
                          onClick={() => setActiveTab('create')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all shrink-0"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Nuevo</span>
                        </button>
                      </div>

                    </div>

                    {/* Events Grid */}
                    {loading ? (
                      <div className="py-16 text-center bg-white rounded-3xl border border-slate-200">
                        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-xs text-slate-500 font-medium">Sincronizando eventos y votos en tiempo real...</p>
                      </div>
                    ) : filteredEvents.length === 0 ? (
                      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-xs">
                        <Vote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-slate-900 mb-1">
                          No se encontraron eventos en esta categoría
                        </h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                          Prueba cambiando los filtros de búsqueda o crea tu propio evento de votación en segundos.
                        </p>
                        <button
                          onClick={() => setActiveTab('create')}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          Crear Primer Evento
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredEvents.map((event) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            onSelect={handleSelectEvent}
                            hasUserVoted={userVotedEventIds.includes(event.id)}
                          />
                        ))}
                      </div>
                    )}

                  </div>

                  {/* Right Column: Telemetry, Google Auth Flow & System Status (1 Col) */}
                  <div className="space-y-6">
                    
                    {/* Activity Feed Widget */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-blue-600" />
                          Actividad Reciente
                        </h3>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </div>

                      <div className="space-y-3.5">
                        <div className="flex items-start gap-2.5">
                          <div className="w-2 h-2 mt-1 rounded-full bg-emerald-500 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-slate-900">Voto registrado</p>
                            <p className="text-[11px] text-slate-500">
                              {currentUser.name} participó en un evento
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <div className="w-2 h-2 mt-1 rounded-full bg-blue-500 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-slate-900">Evento en curso</p>
                            <p className="text-[11px] text-slate-500">
                              {activeEventsCount} votaciones activas en vivo
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 opacity-60">
                          <div className="w-2 h-2 mt-1 rounded-full bg-slate-400 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-slate-700">Canal SSE sincronizado</p>
                            <p className="text-[11px] text-slate-500">Transmisión de conteo lista</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Google Auth Flow Widget */}
                    <div className="bg-slate-900 text-slate-300 rounded-3xl p-5 border border-slate-800 shadow-xs">
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        Google Auth Flow
                      </h3>

                      <div className="relative pl-4 border-l border-slate-800 space-y-4">
                        <div className="relative">
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-blue-500 rounded-full ring-4 ring-slate-900" />
                          <p className="text-xs font-bold text-white">Credential Manager</p>
                          <p className="text-[10px] text-slate-400">Inicia login nativo en Android</p>
                        </div>

                        <div className="relative">
                          <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-4 ring-slate-900" />
                          <p className="text-xs font-bold text-white">JWT Validation</p>
                          <p className="text-[10px] text-slate-400">Envío de ID Token a Node.js API</p>
                        </div>
                      </div>
                    </div>

                    {/* API Status Card */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Estado del Backend
                      </p>

                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">REST Endpoints</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold">
                            ACTIVO
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">WebSocket / SSE</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold">
                            ACTIVO
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">Google OAuth 2.0</span>
                          <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-extrabold">
                            LISTO
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                          Arquitectura Node.js Express con validación de tokens RS256 de Google Identity.
                        </p>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )
          )}

        </MobileFrame>
      </main>

      {/* Google Sign-In Simulation Modal */}
      <UserSwitcherModal
        isOpen={showGoogleAuthModal}
        onClose={() => setShowGoogleAuthModal(false)}
        onUserAuthenticated={(user) => {
          setCurrentUser(user);
          fetchData();
        }}
      />

      {/* Firebase Cloud Messaging (FCM) Notification Center Drawer */}
      <NotificationCenter
        currentUser={currentUser}
        isOpen={showNotificationsDrawer}
        onClose={() => setShowNotificationsDrawer(false)}
        onSelectEvent={(eventId) => {
          setSelectedEventId(eventId);
          setActiveTab('events');
        }}
        onNotificationCountChange={(count) => setUnreadNotificationsCount(count)}
      />

    </div>
  );
}
