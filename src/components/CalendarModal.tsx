import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, X, ExternalLink, Download, Clock, MapPin, Check } from 'lucide-react';
import { getGoogleCalendarUrl, downloadIcsCalendarFile, getOutlookCalendarUrl } from '../utils/calendar';
import { sound } from '../utils/audio';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose }) => {
  const [downloadedIcs, setDownloadedIcs] = React.useState(false);

  if (!isOpen) return null;

  const handleGoogle = () => {
    sound.playClick();
    window.open(getGoogleCalendarUrl(), '_blank');
  };

  const handleAppleIcs = () => {
    sound.playClick();
    downloadIcsCalendarFile();
    setDownloadedIcs(true);
    setTimeout(() => setDownloadedIcs(false), 3000);
  };

  const handleOutlook = () => {
    sound.playClick();
    window.open(getOutlookCalendarUrl(), '_blank');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
        onClick={() => {
          sound.playClick();
          onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.92, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.92, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#240a0e] border border-rose-600/40 rounded-2xl max-w-sm w-full p-5 text-stone-100 shadow-2xl relative overflow-hidden"
          style={{
            backgroundImage: `radial-gradient(circle at top right, rgba(190, 24, 93, 0.15), transparent 70%)`
          }}
        >
          {/* Botão Fechar */}
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>

          {/* Cabeçalho */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <Calendar size={22} />
            </div>
            <div>
              <h3 className="font-serif-display text-lg text-rose-100 font-bold leading-tight">
                Salvar na sua Agenda
              </h3>
              <p className="text-xs text-rose-300/90 font-medium">Não perca o aniversário da Duda!</p>
            </div>
          </div>

          {/* Card Resumo do Evento */}
          <div className="bg-black/45 border border-white/15 rounded-xl p-3.5 mb-4 space-y-1.5 text-xs text-stone-200">
            <div className="font-bold text-white text-sm">XV da Duda</div>
            <div className="flex items-center gap-2 text-rose-200 font-medium">
              <Clock size={14} className="text-rose-400 shrink-0" />
              <span>Sábado, 12 de Dezembro de 2026 • 13h às 21h</span>
            </div>
            <div className="flex items-center gap-2 text-stone-300">
              <MapPin size={14} className="text-rose-400 shrink-0" />
              <span className="truncate">Chácara Recanto dos Sonhos - Suzano, SP</span>
            </div>
          </div>

          {/* Opções de Calendário */}
          <div className="space-y-2.5">
            <button
              onClick={handleGoogle}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold flex items-center justify-between shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Calendar size={16} />
                <span>Google Agenda</span>
              </span>
              <ExternalLink size={15} />
            </button>

            <button
              onClick={handleAppleIcs}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-sm font-semibold flex items-center justify-between border border-white/15 active:scale-95 transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Download size={16} className="text-rose-400" />
                <span>Apple Calendar / iPhone (.ics)</span>
              </span>
              {downloadedIcs ? <Check size={16} className="text-emerald-400" /> : <span className="text-xs text-stone-400">Baixar</span>}
            </button>

            <button
              onClick={handleOutlook}
              className="w-full py-2 px-4 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 text-xs font-medium flex items-center justify-between border border-white/10 active:scale-95 transition-all cursor-pointer"
            >
              <span>Outlook / Hotmail</span>
              <ExternalLink size={14} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
