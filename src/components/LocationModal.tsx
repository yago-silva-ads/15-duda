import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, ExternalLink, Copy, Check, X, Car, Waves } from 'lucide-react';
import { INVITATION_DATA } from '../data/invitationData';
import { sound } from '../utils/audio';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    sound.playClick();
    navigator.clipboard.writeText(`${INVITATION_DATA.location.name}, ${INVITATION_DATA.location.address}, ${INVITATION_DATA.location.city}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenMaps = () => {
    sound.playClick();
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(INVITATION_DATA.location.address)}`, '_blank');
  };

  const handleOpenWaze = () => {
    sound.playClick();
    window.open(`https://waze.com/ul?q=${encodeURIComponent(INVITATION_DATA.location.address)}`, '_blank');
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
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>

          {/* Cabeçalho */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-full bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-serif-display text-lg text-rose-100 font-semibold leading-tight">
                Como Chegar
              </h3>
              <p className="text-xs text-rose-300/80">Local do XV da Duda</p>
            </div>
          </div>

          {/* Endereço detalhado */}
          <div className="bg-black/50 border border-white/15 rounded-xl p-4 mb-4 shadow-md">
            <div className="text-base font-bold text-white">
              {INVITATION_DATA.location.name}
            </div>
            <div className="text-sm text-stone-200 mt-1.5 leading-snug">
              {INVITATION_DATA.location.address}
            </div>
            <div className="text-xs sm:text-sm text-stone-300 mt-0.5">
              {INVITATION_DATA.location.city}
            </div>
            <div className="text-xs sm:text-sm text-amber-300 font-medium mt-2 flex items-center gap-1.5">
              <span className="font-bold">Ponto de ref.:</span>
              <span>{INVITATION_DATA.location.reference}</span>
            </div>

            <button
              onClick={handleCopy}
              className="mt-3.5 w-full py-2 px-3 rounded-lg bg-white/15 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>{copied ? "Endereço Copiado!" : "Copiar Endereço Completo"}</span>
            </button>
          </div>

          {/* Botões de Abertura de GPS */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <button
              onClick={handleOpenMaps}
              className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Navigation size={16} />
              <span>Google Maps</span>
            </button>

            <button
              onClick={handleOpenWaze}
              className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all border border-white/15 active:scale-95 cursor-pointer"
            >
              <ExternalLink size={16} />
              <span>Waze</span>
            </button>
          </div>

          {/* Informações adicionais */}
          <div className="space-y-2 text-xs text-stone-300 border-t border-white/10 pt-3">
            <div className="flex items-center gap-2 text-stone-300">
              <Car size={14} className="text-rose-400 shrink-0" />
              <span>Estacionamento privativo disponível no local</span>
            </div>
            <div className="flex items-center gap-2 text-stone-300">
              <Waves size={14} className="text-cyan-400 shrink-0" />
              <span>Área de piscina liberada (tragam roupa de banho)</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
