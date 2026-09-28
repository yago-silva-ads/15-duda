import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Volume2, VolumeX, Music } from 'lucide-react';
import cherrySingleImg from '../assets/images/cherry_single_1790609399261.jpg';
import crumpledWhitePaperImg from '../assets/images/crumpled_white_paper_1790619755732.jpg';
import { sound } from '../utils/audio';
import { cozyMusic } from '../utils/cozyMusic';

interface EnvelopeCoverProps {
  isOpen: boolean;
  onOpen: () => void;
}

export const EnvelopeCover: React.FC<EnvelopeCoverProps> = ({ isOpen, onOpen }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleOpenClick = (e?: React.SyntheticEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!isOpen) {
      // Desbloqueia e inicia áudio no toque do celular
      cozyMusic.unlock();
      cozyMusic.start();
      sound.playEnvelopeOpen();
      onOpen();
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sound.enabled = nextState;
  };

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          key="envelope-cover"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, delay: 0.6 } }}
          className="absolute inset-0 z-40 overflow-hidden cursor-pointer select-none perspective-1000 touch-manipulation"
          onClick={handleOpenClick}
          onTouchEnd={handleOpenClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Aba Esquerda do Envelope */}
          <motion.div
            initial={{ rotateY: 0 }}
            exit={{ rotateY: -115, x: '-15%', transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } }}
            className="absolute top-0 left-0 w-1/2 h-full bg-[#fbf9f4] shadow-[4px_0_20px_rgba(0,0,0,0.22)] origin-left border-r border-[#d4cbbe] z-20 flex flex-col justify-between p-4"
            style={{
              backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.65), rgba(248, 245, 238, 0.7)), url("${crumpledWhitePaperImg}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'left center',
            }}
          >
            {/* Vinco / Textura fina */}
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-black/15 to-transparent pointer-events-none" />
            
            {/* Top Bar sutil com botão de áudio */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSound}
                className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-all text-xs cursor-pointer shadow-xs"
                title={soundEnabled ? "Desativar som" : "Ativar som"}
              >
                {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
            </div>
            
            <div />
          </motion.div>

          {/* Aba Direita do Envelope */}
          <motion.div
            initial={{ rotateY: 0 }}
            exit={{ rotateY: 115, x: '15%', transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } }}
            className="absolute top-0 right-0 w-1/2 h-full bg-[#f8f5ee] shadow-[-4px_0_20px_rgba(0,0,0,0.22)] origin-right border-l border-[#d4cbbe] z-20 flex flex-col justify-between p-4"
            style={{
              backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.65), rgba(248, 245, 238, 0.7)), url("${crumpledWhitePaperImg}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'right center',
            }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/15 to-transparent pointer-events-none" />
            <div />
            <div />
          </motion.div>

          {/* Elemento Central: Cereja Realista + "toque para abrir" */}
          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.4 } }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none"
          >
            <motion.div
              animate={{
                scale: isHovered ? [1, 1.05, 1] : [1, 1.02, 1],
                y: isHovered ? [0, -3, 0] : [0, -2, 0]
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative flex flex-col items-center cursor-pointer"
            >
              {/* Brilho pulsante suave atrás da cereja */}
              <div className="absolute -inset-4 rounded-full bg-rose-400/20 blur-xl animate-pulse pointer-events-none" />

              {/* Imagem da Cereja Aquarela */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden flex items-center justify-center p-1 bg-white/40 shadow-sm border border-stone-200/50 backdrop-blur-[1px]">
                <img
                  src={cherrySingleImg}
                  alt="Cereja - Toque para abrir convite da Duda"
                  className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Frase curvada/estilizada "toque para abrir" como no Canva */}
              <div className="mt-4 flex flex-col items-center">
                <span className="font-script text-3xl sm:text-4xl text-[#8d141e] font-bold tracking-wide drop-shadow-sm">
                  toque para abrir
                </span>
                <span className="text-xs sm:text-sm tracking-[0.2em] uppercase text-stone-600 font-bold font-sans mt-1 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-rose-600 animate-spin" />
                  clique no convite
                </span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
