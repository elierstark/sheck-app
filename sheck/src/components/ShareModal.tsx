import React, { useState } from 'react';
import { EventItem } from '../types';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Smartphone, 
  QrCode, 
  ExternalLink,
  MessageCircle,
  Twitter,
  Facebook,
  Send,
  Linkedin
} from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, event }) => {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  // Compute canonical event URL
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}`
    : 'https://sheck.app';
  
  const eventUrl = `${baseUrl}?event=${event.id}`;
  
  const shareTitle = `🗳️ ¡Vota en SHECK! ${event.title}`;
  const shareText = `Participa ahora en la votación en tiempo real "${event.title}" en SHECK:`;
  const fullShareMessage = `${shareTitle}\n${shareText}\n${eventUrl}`;

  // Social Share URL Handlers
  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const tweetText = `🗳️ Participa en la votación en vivo "${event.title}" en SHECK`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(eventUrl)}&hashtags=SHECK,VotacionEnVivo,GoogleSignIn`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}&quote=${encodeURIComponent(fullShareMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(shareTitle)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Native Web Share API (Mobile / Android)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SHECK: ${event.title}`,
          text: `Vota en tiempo real en SHECK: ${event.title}`,
          url: eventUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  // Copy Link to Clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(eventUrl)}&color=0f172a&bgcolor=ffffff`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 z-10 animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Compartir Evento
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Invita a otros a votar en SHECK</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Event Preview Card */}
        <div className="my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              Votación en SHECK
            </div>
            <div className="text-xs font-bold text-slate-900 truncate">
              {event.title}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {event.options.length} opciones • {event.total_votes} votos
            </div>
          </div>
        </div>

        {/* Social Sharing Grid */}
        <div className="mb-5">
          <p className="text-xs font-bold text-slate-700 mb-2.5">
            Compartir en Redes Sociales:
          </p>

          <div className="grid grid-cols-4 gap-2">
            
            {/* WhatsApp */}
            <button
              id="share-whatsapp-btn"
              onClick={handleShareWhatsApp}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition-all hover:scale-102 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs group-hover:bg-emerald-600 transition-colors">
                <MessageCircle className="w-5 h-5 fill-white text-emerald-500" />
              </div>
              <span className="text-[11px] font-bold">WhatsApp</span>
            </button>

            {/* Twitter / X */}
            <button
              id="share-twitter-btn"
              onClick={handleShareTwitter}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 transition-all hover:scale-102 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-xs group-hover:bg-slate-800 transition-colors">
                <Twitter className="w-5 h-5 fill-white text-black" />
              </div>
              <span className="text-[11px] font-bold">Twitter (X)</span>
            </button>

            {/* Facebook */}
            <button
              id="share-facebook-btn"
              onClick={handleShareFacebook}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80 transition-all hover:scale-102 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:bg-blue-700 transition-colors">
                <Facebook className="w-5 h-5 fill-white text-blue-600" />
              </div>
              <span className="text-[11px] font-bold">Facebook</span>
            </button>

            {/* Telegram */}
            <button
              id="share-telegram-btn"
              onClick={handleShareTelegram}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/80 transition-all hover:scale-102 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs group-hover:bg-sky-600 transition-colors">
                <Send className="w-4 h-4 ml-0.5" />
              </div>
              <span className="text-[11px] font-bold">Telegram</span>
            </button>

          </div>

          {/* Additional Quick Action: LinkedIn + Native Mobile Share */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={handleShareLinkedIn}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
            >
              <Linkedin className="w-4 h-4 text-blue-700 fill-blue-700" />
              <span>LinkedIn</span>
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>Compartir Nativo</span>
              </button>
            )}
          </div>
        </div>

        {/* Copy Direct Link Box */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Enlace Directo del Evento:</span>
            {copied && (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                ¡Enlace copiado al portapapeles!
              </span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={eventUrl}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono select-all focus:outline-hidden focus:border-blue-500"
            />
            <button
              id="copy-event-url-btn"
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                copied
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copiar
                </>
              )}
            </button>
          </div>
        </div>

        {/* QR Code Toggle Section */}
        <div className="pt-3 border-t border-slate-100">
          <button
            onClick={() => setShowQr(!showQr)}
            className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>{showQr ? 'Ocultar Código QR' : 'Mostrar Código QR para Móviles'}</span>
          </button>

          {showQr && (
            <div className="mt-3 p-4 bg-white border border-slate-200 rounded-2xl text-center shadow-inner animate-in fade-in slide-in-from-top-2">
              <p className="text-[11px] text-slate-500 mb-2 font-medium">
                Escanea con la cámara de tu teléfono para abrir este evento en SHECK:
              </p>
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-40 h-40 mx-auto rounded-xl border border-slate-200 p-2 bg-white shadow-xs"
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
