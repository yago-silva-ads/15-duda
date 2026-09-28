import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Sparkles, Shirt, Heart } from 'lucide-react';
import leopardPatternImg from '../assets/images/leopard_print_pattern_1790609467383.jpg';
import { INVITATION_DATA } from '../data/invitationData';
import { sound } from '../utils/audio';

interface ObservationsViewProps {
  onBack: () => void;
}

export const ObservationsView: React.FC<ObservationsViewProps> = ({ onBack }) => {
  return (
    <div
      className="relative w-full h-full flex flex-col p-2 sm:p-4 overflow-y-auto overflow-x-hidden select-none pb-24 overscroll-contain"
      style={{
        backgroundImage: `url("${leopardPatternImg}")`,
        backgroundSize: '280px 280px',
        backgroundRepeat: 'repeat',
      }}
    >
      {/* Moldura de Papel Cartão Escuro Estilo Canva (Página 4) */}
      <div className="relative z-10 w-full max-w-md mx-auto my-1 sm:my-auto rounded-2xl shadow-[0_16px_50px_rgba(0,0,0,0.95)] border-2 border-stone-800/90 p-4 sm:p-6 flex flex-col text-stone-100 bg-[#1c1a1a]/95 backdrop-blur-xs">
        
        {/* Top bar com botão Voltar */}
        <div className="relative z-10 flex items-center justify-between w-full pb-2 border-b border-white/10">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white transition-colors py-1 px-2.5 rounded-lg bg-black/60 hover:bg-black/80 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Voltar ao Convite</span>
          </button>

          <span className="text-[11px] font-mono tracking-widest text-amber-300/90 uppercase flex items-center gap-1 font-bold">
            <Sparkles size={12} className="text-amber-400" />
            Guia da Festa
          </span>
        </div>

        {/* TÍTULO EM CALIGRAFIA VERMELHA (CANVA PÁGINA 4) */}
        <div className="relative z-10 text-center py-2 sm:py-3">
          <h2
            className="font-script text-6xl sm:text-7xl text-[#ff3347] font-bold tracking-wide leading-none select-none"
            style={{
              textShadow: '3px 3px 6px rgba(0,0,0,0.95), 0 0 18px rgba(255,51,71,0.4)',
            }}
          >
            Observações
          </h2>
        </div>

        {/* LISTA DE REGRAS E OBSERVAÇÕES (Fiel ao Canva com Letras Maiores para Óculos) */}
        <div className="relative z-10 space-y-3 my-2 text-[15px] sm:text-[16.5px] leading-relaxed">
          {INVITATION_DATA.rules.map((rule) => {
            const isImportant = rule.highlight;
            return (
              <div
                key={rule.id}
                className={`flex items-start gap-3 p-2 rounded-xl transition-colors ${
                  isImportant
                    ? 'bg-rose-950/60 border-l-4 border-rose-500 pl-3 text-rose-100'
                    : 'text-stone-100'
                }`}
              >
                <span className="text-rose-400 font-extrabold text-xl leading-none mt-0.5 shrink-0">•</span>
                <div className="flex-1 font-sans">
                  <div className="leading-snug">
                    <span className={isImportant ? 'font-bold text-white text-[15px] sm:text-[17px]' : 'font-medium text-stone-100'}>
                      {rule.title}
                    </span>
                  </div>
                  {rule.subtitle && (
                    <div
                      className={`text-[13.5px] sm:text-[15px] mt-1 ${
                        isImportant ? 'text-amber-200 font-semibold italic' : 'text-stone-300 italic'
                      }`}
                    >
                      {rule.subtitle}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* DESTAQUE DE DRESS CODE ANOS 2000'S & CORES */}
        <div className="relative z-10 my-2 p-3 rounded-xl bg-black/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm sm:text-base">
          <div className="flex items-center gap-2">
            <Shirt size={18} className="text-rose-400 shrink-0" />
            <span className="text-stone-200">
              <strong className="text-white font-bold">Dress Code:</strong> Anos 2000 (Y2K)
            </span>
          </div>
          <span className="text-xs sm:text-sm text-amber-300 font-bold">
            Proibido vermelho & oncinha
          </span>
        </div>

        {/* FRASES FINAIS DE ENCERRAMENTO IDENTICAS AO CANVA */}
        <div className="relative z-10 text-center mt-3 pt-3 border-t border-white/15 flex flex-col items-center">
          <p className="font-serif-display italic text-2xl sm:text-3xl text-[#ffebee] leading-tight font-semibold">
            Aproveite esse momento comigo!
          </p>
          <h3 className="font-sans font-black text-xl sm:text-2xl text-white tracking-wider mt-1.5 uppercase flex items-center gap-2">
            <span>Te espero lá!</span>
            <Heart size={20} className="fill-rose-500 text-rose-500 inline-block animate-pulse" />
          </h3>
        </div>
      </div>
    </div>
  );
};
