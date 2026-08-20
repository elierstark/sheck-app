import React, { useState } from 'react';
import { User } from '../types';
import { 
  Vote, 
  PlusCircle, 
  History, 
  Code2, 
  Smartphone, 
  Monitor, 
  UserCheck, 
  ChevronDown,
  Sparkles,
  LogOut,
  ShieldCheck,
  Bell
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  activeTab: 'events' | 'create' | 'my-votes';
  setActiveTab: (tab: 'events' | 'create' | 'my-votes') => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  onOpenGoogleAuthModal: () => void;
  unreadNotificationsCount?: number;
  onOpenNotifications: () => void;
  onLogout?: () => void;
  isGuest?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  activeTab,
  setActiveTab,
  isMobileFrame,
  setIsMobileFrame,
  onOpenGoogleAuthModal,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onLogout,
  isGuest = false
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div 
            id="brand-logo-container"
            onClick={() => setActiveTab('events')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">SHECK</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  En Vivo
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">Eventos y Votaciones en Tiempo Real</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            <button
              id="nav-tab-events"
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'events'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Vote className="w-4 h-4" />
              Eventos
            </button>

            <button
              id="nav-tab-create"
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'create'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Crear Evento
            </button>

            <button
              id="nav-tab-my-votes"
              onClick={() => setActiveTab('my-votes')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'my-votes'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              Mis Votos
            </button>
          </nav>

          {/* Right Controls: Notification Bell + View Switcher + User Account Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* FCM Push Notifications Bell Button */}
            <button
              id="btn-notifications-bell"
              onClick={onOpenNotifications}
              title="Notificaciones Push de Firebase (FCM)"
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Toggle Mobile Phone Mockup vs Desktop */}
            <button
              id="toggle-mobile-frame"
              onClick={() => setIsMobileFrame(!isMobileFrame)}
              title={isMobileFrame ? "Cambiar a vista expandida de escritorio" : "Ver en simulador de pantalla móvil Android"}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                isMobileFrame
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
              }`}
            >
              {isMobileFrame ? <Smartphone className="w-3.5 h-3.5 text-blue-600" /> : <Monitor className="w-3.5 h-3.5 text-slate-500" />}
              <span>{isMobileFrame ? 'Simulador Activo' : 'Vista Simulador'}</span>
            </button>

            {/* Google Sign-In Profile Menu */}
            <div className="relative">
              <button
                id="user-profile-button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-3 pl-2 pr-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-full transition-all text-left shadow-xs"
              >
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    {currentUser.name}
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600 inline" />
                  </div>
                  <div className="text-[10px] text-slate-500 leading-none truncate max-w-[130px] font-medium">
                    {currentUser.email}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserDropdown(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Cuenta Google Vinculada
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">{currentUser.name}</div>
                      <div className="text-xs text-slate-500 truncate">{currentUser.email}</div>
                      <div className="mt-1 text-[10px] text-slate-400 font-mono">
                        google_id: {currentUser.google_id.substring(0, 16)}...
                      </div>
                    </div>

                    {allUsers.length > 1 && (
                      <div className="px-3 py-2">
                        <div className="text-[11px] font-semibold text-slate-500 mb-1.5 px-2">
                          Cuentas guardadas en este dispositivo:
                        </div>
                        <div className="space-y-1">
                          {allUsers.map((u) => (
                            <button
                              key={u.id}
                              id={`switch-user-${u.id}`}
                              onClick={() => {
                                onSelectUser(u);
                                setShowUserDropdown(false);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left text-xs transition-colors ${
                                currentUser.id === u.id
                                  ? 'bg-blue-50 text-blue-800 font-semibold'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <img
                                  src={u.avatar_url}
                                  alt={u.name}
                                  className="w-5 h-5 rounded-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="truncate">{u.name}</span>
                              </div>
                              {currentUser.id === u.id && <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-slate-100 pt-1.5 px-2 space-y-1">
                      <button
                        id="btn-open-google-login-modal"
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenGoogleAuthModal();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Cambiar / Nuevo Google ID
                      </button>

                      {onLogout && (
                        <button
                          id="btn-logout"
                          onClick={() => {
                            setShowUserDropdown(false);
                            onLogout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          Cerrar Sesión (Pantalla de Login)
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-100 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${
              activeTab === 'events' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'
            }`}
          >
            <Vote className="w-3.5 h-3.5" />
            Eventos
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${
              activeTab === 'create' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Crear
          </button>
          <button
            onClick={() => setActiveTab('my-votes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${
              activeTab === 'my-votes' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Mis Votos
          </button>
        </div>
      </div>
    </header>
  );
};
