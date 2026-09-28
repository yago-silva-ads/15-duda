import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Check, QrCode, ArrowLeft, Heart, Sparkles, Gift } from 'lucide-react';
import leopardPatternImg from '../assets/images/leopard_print_pattern_1790609467383.jpg';
import burgundyPaperImg from '../assets/images/crumpled_burgundy_paper_1790609441394.jpg';
import lipsGrillzImg from '../assets/images/y2k_red_lips_grillz_1790609430529.jpg';
import { INVITATION_DATA } from '../data/invitationData';
import { sound } from '../utils/audio';

interface GiftSuggestionsViewProps {
  onBack: () => void;
}

export const GiftSuggestionsView: React.FC<GiftSuggestionsViewProps> = ({ onBack }) => {
  const [copiedPix, setCopiedPix] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('duda_chosen_gifts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleCopyPix = () => {
    sound.playClick();
    navigator.clipboard.writeText(INVITATION_DATA.pix.key);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const toggleItemFavorite = (id: string) => {
    sound.playClick();
    setSelectedItems((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('duda_chosen_gifts', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  return (
    <div
      className="relative w-full h-full flex flex-col p-2 sm:p-4 overflow-y-auto overflow-x-hidden select-none pb-24 overscroll-contain"
      style={{
        backgroundImage: `url("${leopardPatternImg}")`,
        backgroundSize: '280px 280px',
        backgroundRepeat: 'repeat',
      }}
    >
      {/* Moldura de Papel Cartão Vinho Estilo Canva (Página 3) */}
      <div
        className="relative z-10 w-full max-w-md mx-auto my-1 sm:my-auto rounded-2xl shadow-[0_16px_45px_rgba(0,0,0,0.9)] border-2 border-stone-800/80 p-4 sm:p-5 flex flex-col text-stone-100 overflow-hidden"
        style={{
          backgroundColor: '#430d14',
          backgroundImage: `linear-gradient(rgba(67, 13, 20, 0.90), rgba(35, 5, 10, 0.94)), url("${burgundyPaperImg}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Botão Voltar no Topo */}
        <div className="flex items-center justify-between w-full pb-2 border-b border-white/10">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="flex items-center gap-1.5 text-xs text-stone-300 hover:text-white transition-colors py-1 px-2.5 rounded-lg bg-black/50 hover:bg-black/70 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Voltar ao Convite</span>
          </button>

          <span className="text-[11px] font-mono tracking-widest text-rose-300/90 uppercase flex items-center gap-1 font-bold">
            <Gift size={13} className="text-rose-400" />
            Lista de Desejos
          </span>
        </div>

        {/* TÍTULO EM CALIGRAFIA VERMELHA (NÍTIDO, GRANDE E LEGÍVEL) */}
        <div className="relative text-center py-2 sm:py-3">
          <h2
            className="font-script text-5xl sm:text-6xl text-[#ff3347] font-bold tracking-wide leading-none select-none"
            style={{
              textShadow: '3px 3px 6px rgba(0,0,0,0.95), 0 0 16px rgba(255,51,71,0.4)',
            }}
          >
            Sugestões de Presentes
          </h2>
          <p className="font-serif-display italic text-base sm:text-lg text-[#fbeee0] mt-1 font-medium">
            Ideias carinhosas para quem quiser me presentear
          </p>
        </div>

        {/* LISTA DE SUGESTÕES DE PRESENTES (Fiel ao Canva com Letras Maiores) */}
        <div className="space-y-3 my-2 text-stone-100 leading-snug">
          {INVITATION_DATA.giftSuggestions.map((gift) => {
            const isSaved = selectedItems.includes(gift.id);
            return (
              <div
                key={gift.id}
                onClick={() => toggleItemFavorite(gift.id)}
                className={`flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                  isSaved
                    ? 'bg-rose-950/85 border-2 border-rose-500/60 text-white shadow-sm'
                    : 'bg-black/35 hover:bg-black/50 border border-white/10 text-stone-100'
                }`}
                title="Toque para salvar o que você pretende levar"
              >
                <span className="text-rose-400 font-extrabold text-xl leading-none mt-0.5 shrink-0">•</span>
                <div className="flex-1">
                  <div className="font-sans font-bold text-[15px] sm:text-[17px] text-white flex items-center justify-between">
                    <span>{gift.title}</span>
                    {isSaved && (
                      <span className="text-xs text-rose-100 bg-rose-900 px-2.5 py-0.5 rounded-full border border-rose-400 font-semibold shadow-xs">
                        Vou dar este ❤️
                      </span>
                    )}
                  </div>
                  {gift.detail && (
                    <div className="font-sans text-xs sm:text-sm text-rose-200 mt-1 font-medium italic">
                      {gift.detail}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ÁREA DO PIX COM BOTÃO DE COPIAR EM DESTAQUE */}
        <div className="mt-3 p-3.5 rounded-xl bg-black/55 border border-white/15 flex flex-col gap-2.5 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-sm text-stone-200 font-sans">
              <span className="font-semibold text-white">Meu PIX é: </span>
              <span className="font-mono text-base sm:text-lg text-amber-300 font-black select-all tracking-wider ml-1">
                {INVITATION_DATA.pix.key}
              </span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowQrModal(true);
                }}
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white transition-colors cursor-pointer border border-white/10"
                title="Visualizar QR Code Pix"
              >
                <QrCode size={18} />
              </button>

              <button
                onClick={handleCopyPix}
                className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {copiedPix ? (
                  <>
                    <Check size={16} className="text-white" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copiar PIX</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-stone-300 font-medium">
            Favorecido: <strong className="text-white">{INVITATION_DATA.pix.recipient}</strong> ({INVITATION_DATA.pix.bank})
          </div>
        </div>

        {/* MENSAGEM FINAL + FOTO DOS LÁBIOS COM GRILLZ (CANVA PÁGINA 3) */}
        <div className="relative mt-3.5 pt-2 flex items-end justify-between min-h-[85px]">
          {/* Lábios com Grillz no Canto Inferior Esquerdo como no Canva */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 -mb-2 -ml-1 rounded-full overflow-hidden drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)] border-2 border-amber-400/60 ring-2 ring-rose-500/40 shrink-0">
            <img
              src={lipsGrillzImg}
              alt="Lábios Vermelhos com Grillz Y2K"
              className="w-full h-full object-cover filter contrast-115 scale-110"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Texto de Agradecimento com Coração */}
          <div className="flex-1 text-right pl-3">
            <p className="text-xs sm:text-sm text-stone-300 font-sans leading-tight">
              Caso não consiga trazer algo, tudo bem!
            </p>
            <p className="font-serif-display italic text-xl sm:text-2xl text-[#ffebee] mt-1 leading-tight flex items-center justify-end gap-1.5 font-bold">
              <span>Sua presença é o maior presente!</span>
              <Heart size={18} className="fill-rose-500 text-rose-500 inline-block animate-pulse shrink-0" />
            </p>
          </div>
        </div>
      </div>

      {/* Modal QR Code Pix */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setShowQrModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#24060b] border border-rose-500/40 p-5 rounded-2xl max-w-xs w-full text-center shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-serif-display text-base text-rose-100 font-semibold mb-1">
                QR Code Pix
              </h3>
              <p className="text-xs text-stone-300 mb-3">
                Escaneie com o app do seu banco
              </p>

              <div className="w-48 h-48 mx-auto bg-white p-3 rounded-xl shadow-inner flex flex-col items-center justify-center">
                <div className="w-full h-full border-2 border-stone-800 rounded p-1 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <div className="w-8 h-8 bg-stone-900 rounded-xs" />
                    <div className="w-8 h-8 bg-stone-900 rounded-xs" />
                  </div>
                  <div className="text-center font-mono text-[10px] text-stone-800 font-bold tracking-tighter">
                    PIX • DUDA XV
                  </div>
                  <div className="flex justify-between">
                    <div className="w-8 h-8 bg-stone-900 rounded-xs" />
                    <div className="w-4 h-4 bg-rose-600 rounded-xs self-end" />
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-rose-200 font-mono">
                {INVITATION_DATA.pix.key}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleCopyPix}
                  className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold shadow-md active:scale-95 cursor-pointer"
                >
                  {copiedPix ? 'Copiado!' : 'Copiar Chave'}
                </button>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="py-2 px-3 rounded-xl bg-stone-800 text-stone-300 text-xs hover:text-white cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
