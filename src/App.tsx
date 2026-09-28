/**
 * XV da Duda — mobile-first guest experience.
 * Preserva as artes/componentes originais do projeto e prioriza o RSVP.
 */
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, Music2, Share2 } from 'lucide-react';
import { EnvelopeCover } from './components/EnvelopeCover';
import { MainInvitationCard } from './components/MainInvitationCard';
import { GiftSuggestionsView } from './components/GiftSuggestionsView';
import { ObservationsView } from './components/ObservationsView';
import { LocationModal } from './components/LocationModal';
import { RsvpModal } from './components/RsvpModal';
import { CalendarModal } from './components/CalendarModal';
import { SpotifyMiniPlayer } from './components/SpotifyMiniPlayer';
import { sound } from './utils/audio';

type ActivePage = 'convite' | 'observacoes' | 'presentes';

type LocalRsvp = {
  name?: string;
  status?: 'confirmed' | 'declined';
};

export default function App() {
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [activePage, setActivePage] = useState<ActivePage>('convite');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [userRsvp, setUserRsvp] = useState<LocalRsvp | null>(null);

  const refreshLocalRsvp = () => {
    try {
      const saved = localStorage.getItem('duda_user_rsvp');
      setUserRsvp(saved ? JSON.parse(saved) : null);
    } catch {
      setUserRsvp(null);
    }
  };

  useEffect(() => {
    refreshLocalRsvp();
    const onStorage = () => refreshLocalRsvp();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (!isRsvpModalOpen) refreshLocalRsvp();
  }, [isRsvpModalOpen]);

  const handleOpenEnvelope = () => {
    sound.playClick();
    setIsEnvelopeOpen(true);
  };

  const handleShare = async () => {
    sound.playClick();
    const data = {
      title: 'XV da Duda 🍒✨',
      text: 'Você está convidado para o XV da Duda. Abra o convite e confirme sua presença:',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // usuário cancelou ou navegador não permitiu; usa clipboard abaixo
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2200);
    } catch {
      // nada a fazer
    }
  };

  const statusLabel = userRsvp?.status === 'confirmed'
    ? 'Presença confirmada'
    : userRsvp?.status === 'declined'
      ? 'Resposta enviada'
      : 'Você vai ao XV da Duda?';

  const statusCaption = userRsvp?.status
    ? 'Toque para alterar sua resposta'
    : 'Responda em menos de 20 segundos';

  return (
    <div className="min-h-[100dvh] w-full bg-[#ece8e1] text-[#1d1d1f] flex items-center justify-center overflow-hidden relative selection:bg-[#7b071c] selection:text-white">
      {/* Fundo neutro: deixa o Canva ser protagonista. */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,.95),rgba(236,232,225,.86)_42%,rgba(225,219,210,.95)_100%)]" />

      <div className="relative z-10 w-full h-[100dvh] sm:h-[860px] sm:max-h-[94vh] max-w-[430px] sm:rounded-[30px] overflow-hidden bg-[#e8e2d8] sm:shadow-[0_30px_90px_rgba(0,0,0,.28)] sm:border sm:border-black/10">
        <EnvelopeCover isOpen={isEnvelopeOpen} onOpen={handleOpenEnvelope} />

        <div className={`relative w-full h-full overflow-hidden ${isEnvelopeOpen && activePage === 'convite' ? 'pb-[82px]' : ''}`}>
          <AnimatePresence mode="wait">
            {activePage === 'convite' && (
              <motion.div
                key="page-convite"
                initial={{ opacity: 0, scale: 0.992 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.992 }}
                transition={{ duration: 0.22 }}
                className="w-full h-full"
              >
                <MainInvitationCard
                  onOpenObservacoes={() => setActivePage('observacoes')}
                  onOpenComoChegar={() => setIsLocationModalOpen(true)}
                  onOpenConfirmarPresenca={() => setIsRsvpModalOpen(true)}
                  onOpenSugestoesPresentes={() => setActivePage('presentes')}
                  onOpenCalendar={() => setIsCalendarModalOpen(true)}
                />
              </motion.div>
            )}

            {activePage === 'observacoes' && (
              <motion.div
                key="page-observacoes"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.22 }}
                className="w-full h-full"
              >
                <ObservationsView onBack={() => setActivePage('convite')} />
              </motion.div>
            )}

            {activePage === 'presentes' && (
              <motion.div
                key="page-presentes"
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -14 }}
                transition={{ duration: 0.22 }}
                className="w-full h-full"
              >
                <GiftSuggestionsView onBack={() => setActivePage('convite')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Utilidades discretas. Spotify é secundário, RSVP é a ação principal. */}
        {isEnvelopeOpen && (
          <div className="absolute top-[max(10px,env(safe-area-inset-top))] right-3 z-30 flex items-center gap-2">
            <SpotifyMiniPlayer />
            <button
              type="button"
              onClick={handleShare}
              aria-label="Compartilhar convite"
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-xl border border-black/10 shadow-lg flex items-center justify-center text-[#1d1d1f] active:scale-95 transition-transform"
            >
              {copiedLink ? <Check size={17} className="text-emerald-600" /> : <Share2 size={16} />}
            </button>
          </div>
        )}

        {/* CTA persistente — foco real do produto: saber quem vai. */}
        {isEnvelopeOpen && !isRsvpModalOpen && activePage === 'convite' && (
          <div className="absolute left-0 right-0 bottom-0 z-30 px-2.5 pb-[max(9px,calc(env(safe-area-inset-bottom)+7px))] pt-7 bg-gradient-to-t from-[#e8e2d8] via-[#e8e2d8]/88 to-transparent pointer-events-none">
            <div className="pointer-events-auto min-h-[66px] rounded-[22px] bg-white/82 backdrop-blur-2xl border border-white/70 shadow-[0_12px_35px_rgba(0,0,0,.18)] px-3 py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 shrink-0 rounded-full ${userRsvp?.status === 'confirmed' ? 'bg-emerald-500' : userRsvp?.status === 'declined' ? 'bg-zinc-400' : 'bg-[#7b071c]'}`} />
                <div className="min-w-0 leading-tight">
                  <strong className="block truncate text-[13px] tracking-[-.01em] text-[#1d1d1f]">{statusLabel}</strong>
                  <span className="block truncate text-[10.5px] mt-1 text-[#6e6e73]">{statusCaption}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRsvpModalOpen(true)}
                className="shrink-0 min-w-[94px] h-11 rounded-[15px] bg-[#1d1d1f] text-white text-[13px] font-semibold shadow-md active:scale-[.98] transition-transform"
              >
                {userRsvp?.status ? 'Editar' : 'Responder'}
              </button>
            </div>
          </div>
        )}
      </div>

      <LocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
      <CalendarModal isOpen={isCalendarModalOpen} onClose={() => setIsCalendarModalOpen(false)} />
      <RsvpModal
        isOpen={isRsvpModalOpen}
        onClose={() => {
          setIsRsvpModalOpen(false);
          refreshLocalRsvp();
        }}
      />
    </div>
  );
}
