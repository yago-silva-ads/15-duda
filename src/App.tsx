/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Smartphone, 
  Maximize2, 
  Gift, 
  FileText, 
  Mail, 
  Share2,
  Check,
  Music,
  Lock,
  Table
} from 'lucide-react';
import { EnvelopeCover } from './components/EnvelopeCover';
import { MainInvitationCard } from './components/MainInvitationCard';
import { GiftSuggestionsView } from './components/GiftSuggestionsView';
import { ObservationsView } from './components/ObservationsView';
import { LocationModal } from './components/LocationModal';
import { RsvpModal } from './components/RsvpModal';
import { CalendarModal } from './components/CalendarModal';
import { SpreadsheetView } from './components/SpreadsheetView';
import { fetchRsvps } from './services/rsvpService';
import { sound } from './utils/audio';
import { cozyMusic } from './utils/cozyMusic';

type ActivePage = 'convite' | 'observacoes' | 'presentes' | 'planilha';

export default function App() {
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [activePage, setActivePage] = useState<ActivePage>('convite');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [rsvpModalTab, setRsvpModalTab] = useState<'form' | 'list'>('form');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isFullScreenView, setIsFullScreenView] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [rsvpsCount, setRsvpsCount] = useState<number>(0);

  const loadCounts = async () => {
    try {
      const data = await fetchRsvps();
      setRsvpsCount(data.length);
    } catch {
      //
    }
  };

  useEffect(() => {
    loadCounts();
  }, [activePage, isRsvpModalOpen]);

  useEffect(() => {
    const handleFirstTouch = () => {
      cozyMusic.unlock();
    };
    window.addEventListener('touchstart', handleFirstTouch, { passive: true, once: true });
    window.addEventListener('click', handleFirstTouch, { once: true });
    return () => {
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('click', handleFirstTouch);
    };
  }, []);

  const handleOpenEnvelope = () => {
    // Iniciar a música no primeiro toque do celular
    cozyMusic.unlock();
    cozyMusic.start();
    setIsMusicPlaying(true);
    setIsEnvelopeOpen(true);
  };

  const handleResetEnvelope = () => {
    sound.playClick();
    setIsEnvelopeOpen(false);
    setActivePage('convite');
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sound.enabled = nextState;
  };

  const toggleMusic = () => {
    sound.playClick();
    const playing = cozyMusic.toggle();
    setIsMusicPlaying(playing);
  };

  const handleShare = async () => {
    sound.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'XV da Duda - Convite Interativo',
          text: 'Você foi convidado para o XV da Duda no dia 12 de Dezembro! Abra o convite interativo e confirme sua presença:',
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback
      }
    }
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] w-full bg-[#1c080c] text-stone-100 flex flex-col items-center justify-center p-0 sm:p-3 md:p-6 overflow-hidden relative selection:bg-rose-700 selection:text-white">
      {/* Background Decorativo Suave com Tons Vinho e Champanhe */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-rose-950/25 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-stone-900/30 rounded-full blur-3xl" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(220, 38, 38, 0.05) 0%, transparent 70%)`
          }}
        />
      </div>

      {/* Top Bar no Desktop */}
      <header className="w-full max-w-2xl hidden sm:flex items-center justify-between py-1.5 px-3 mb-1 z-20 text-xs text-stone-400">
        <div className="flex items-center gap-2 font-medium text-stone-300">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span className="tracking-wide">XV da Duda • 12 de Dezembro</span>
          <span className="text-stone-700">|</span>
          <button
            onClick={() => {
              sound.playClick();
              setIsEnvelopeOpen(true);
              setActivePage('planilha');
            }}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-white/10 text-stone-400 hover:text-rose-300 text-xs transition-colors"
            title="Acesso restrito da anfitriã com senha"
          >
            <Lock size={11} className="text-rose-400" />
            <span>Área da Anfitriã</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Botão de Música Aaliyah R&B Anos 2000 */}
          <button
            onClick={toggleMusic}
            className={`p-1.5 px-3 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              isMusicPlaying
                ? 'bg-rose-950/90 text-rose-200 border border-rose-500/50 shadow-[0_0_12px_rgba(225,29,72,0.3)]'
                : 'bg-stone-800/80 text-stone-400 hover:text-white'
            }`}
            title={isMusicPlaying ? "Pausar música da Aaliyah" : "Tocar música da Aaliyah"}
          >
            <Music size={13} className={isMusicPlaying ? 'animate-bounce text-rose-400' : ''} />
            <span className="text-[11px] font-medium tracking-wide">
              {isMusicPlaying ? 'Aaliyah R&B ♪' : 'Tocar Aaliyah'}
            </span>
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors flex items-center gap-1"
            title={soundEnabled ? "Desativar efeitos sonoros" : "Ativar efeitos sonoros"}
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>

          {isEnvelopeOpen && (
            <button
              onClick={handleResetEnvelope}
              className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors flex items-center gap-1"
              title="Fechar envelope novamente"
            >
              <RotateCcw size={13} />
              <span className="hidden md:inline text-[11px]">Reabrir</span>
            </button>
          )}

          <button
            onClick={() => setIsFullScreenView(!isFullScreenView)}
            className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
            title={isFullScreenView ? "Modo celular" : "Expandir"}
          >
            {isFullScreenView ? <Smartphone size={13} /> : <Maximize2 size={13} />}
          </button>

          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-rose-200 hover:text-white transition-colors flex items-center gap-1"
            title="Compartilhar Convite"
          >
            {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
          </button>
        </div>
      </header>

      {/* CONTAINER PRINCIPAL DO CONVITE (FORMATO CANVA / SMARTPHONE STORY) */}
      <div 
        className={`relative z-10 w-full h-[100dvh] sm:h-[820px] transition-all duration-300 ${
          activePage === 'planilha'
            ? 'max-w-4xl sm:max-h-[92vh] sm:rounded-3xl'
            : isFullScreenView 
            ? 'max-w-xl sm:h-[880px] rounded-none sm:rounded-3xl' 
            : 'max-w-[420px] sm:max-h-[92vh] sm:rounded-3xl'
        } shadow-[0_20px_60px_rgba(0,0,0,0.85)] border-0 sm:border border-stone-800/80 bg-[#e8e2d8] overflow-hidden flex flex-col justify-between`}
      >
        {/* Camada 1: Envelope de Capa Fechado com Dobradiça e Cereja */}
        {activePage !== 'planilha' && (
          <EnvelopeCover 
            isOpen={isEnvelopeOpen} 
            onOpen={handleOpenEnvelope} 
          />
        )}

        {/* Camada 2: Conteúdo Interno do Convite */}
        <div className="relative w-full h-full flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {activePage === 'convite' && (
              <motion.div
                key="page-convite"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <MainInvitationCard
                  onOpenObservacoes={() => setActivePage('observacoes')}
                  onOpenComoChegar={() => setIsLocationModalOpen(true)}
                  onOpenConfirmarPresenca={(tab) => {
                    setRsvpModalTab(tab || 'form');
                    setIsRsvpModalOpen(true);
                  }}
                  onOpenSugestoesPresentes={() => setActivePage('presentes')}
                  onOpenPlanilha={() => {
                    setIsEnvelopeOpen(true);
                    setActivePage('planilha');
                  }}
                  onOpenCalendar={() => setIsCalendarModalOpen(true)}
                />
              </motion.div>
            )}

            {activePage === 'observacoes' && (
              <motion.div
                key="page-observacoes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <ObservationsView onBack={() => setActivePage('convite')} />
              </motion.div>
            )}

            {activePage === 'presentes' && (
              <motion.div
                key="page-presentes"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <GiftSuggestionsView onBack={() => setActivePage('convite')} />
              </motion.div>
            )}

            {activePage === 'planilha' && (
              <motion.div
                key="page-planilha"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full"
              >
                <SpreadsheetView
                  onBack={() => setActivePage('convite')}
                  onOpenNewRsvp={() => setIsRsvpModalOpen(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BARRA INFERIOR DE NAVEGAÇÃO ENTRE PÁGINAS COM TOCADOR DE MÚSICA DO CANVA */}
        {(isEnvelopeOpen || activePage === 'planilha') && (
          <div className="relative z-20 w-full bg-[#141213]/95 backdrop-blur-md border-t border-white/10 px-3 py-2 flex items-center justify-between text-xs shrink-0">
            {/* Navegação entre páginas */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  sound.playClick();
                  setActivePage('convite');
                }}
                className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activePage === 'convite' ? 'text-rose-400 font-bold' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Mail size={16} />
                <span className="text-[11px]">Convite</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActivePage('observacoes');
                }}
                className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activePage === 'observacoes' ? 'text-rose-400 font-bold' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <FileText size={16} />
                <span className="text-[11px]">Observações</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActivePage('presentes');
                }}
                className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activePage === 'presentes' ? 'text-rose-400 font-bold' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Gift size={16} />
                <span className="text-[11px]">Presentes</span>
              </button>

              {activePage === 'planilha' && (
                <button
                  onClick={() => {
                    sound.playClick();
                    setActivePage('planilha');
                  }}
                  className="flex flex-col items-center gap-1 text-rose-400 font-semibold cursor-pointer"
                >
                  <Table size={16} />
                  <span className="text-[11px]">Planilha</span>
                </button>
              )}
            </div>

            {/* Widget de Música Idêntico ao Print do Canva */}
            <button
              onClick={toggleMusic}
              className="bg-[#221c1e] hover:bg-[#2c2427] border border-white/15 text-stone-100 rounded-full py-1 px-2.5 shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              title="Trilha sonora Aaliyah R&B"
            >
              <div className="w-6 h-6 rounded-md bg-sky-200 text-stone-900 flex items-center justify-center font-bold shrink-0">
                <Music size={13} className={isMusicPlaying ? 'animate-bounce' : ''} />
              </div>

              <div className="text-left leading-tight">
                <div className="text-[10px] font-bold text-rose-200">
                  {isMusicPlaying ? 'Música ligada' : 'Música pausada'}
                </div>
                <div className="text-[9px] text-stone-400 truncate max-w-[80px]">
                  Cherry Y2K Night
                </div>
              </div>

              <div className="flex items-end gap-0.5 h-2.5 pl-0.5">
                <span className={`w-0.5 bg-rose-400 rounded-full transition-all ${isMusicPlaying ? 'h-2.5 animate-pulse' : 'h-1'}`} />
                <span className={`w-0.5 bg-rose-300 rounded-full transition-all ${isMusicPlaying ? 'h-2 animate-bounce' : 'h-1'}`} />
                <span className={`w-0.5 bg-rose-400 rounded-full transition-all ${isMusicPlaying ? 'h-2.5 animate-pulse' : 'h-1'}`} />
              </div>
            </button>
          </div>
        )}
      </div>

      {/* MODAIS INTERATIVOS */}
      <CalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
      />

      <LocationModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
      />

      <RsvpModal 
        isOpen={isRsvpModalOpen} 
        onClose={() => setIsRsvpModalOpen(false)}
        initialTab={rsvpModalTab}
        onOpenSpreadsheet={() => {
          setIsEnvelopeOpen(true);
          setActivePage('planilha');
        }}
      />

      {/* Dica de rodapé e link secreto da anfitriã para celular */}
      <footer className="mt-2 text-center text-[11px] text-stone-500 flex items-center justify-center gap-2">
        <span>XV da Duda • 12 de Dezembro</span>
        <span className="text-stone-700">•</span>
        <button
          onClick={() => {
            sound.playClick();
            setIsEnvelopeOpen(true);
            setActivePage('planilha');
          }}
          className="text-stone-600 hover:text-stone-400 transition-colors flex items-center gap-1 text-[10px]"
          title="Acesso restrito da anfitriã"
        >
          <Lock size={10} />
          <span>Painel</span>
        </button>
      </footer>
    </div>
  );
}
