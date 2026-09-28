import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, MessageCircle, Gift, Calendar, Share2, Check } from 'lucide-react';
import cherryDoubleImg from '../assets/images/cherry_double_1790609410867.jpg';
import leopardStarImg from '../assets/images/leopard_star_1790609420774.jpg';
import burgundyPaperImg from '../assets/images/crumpled_burgundy_paper_1790609441394.jpg';
import crumpledWhitePaperImg from '../assets/images/crumpled_white_paper_1790619755732.jpg';
import { sound } from '../utils/audio';

interface MainInvitationCardProps {
  onOpenObservacoes: () => void;
  onOpenComoChegar: () => void;
  onOpenConfirmarPresenca: (tab?: 'form' | 'list') => void;
  onOpenSugestoesPresentes: () => void;
  onOpenPlanilha?: () => void;
  onOpenCalendar: () => void;
}

export const MainInvitationCard: React.FC<MainInvitationCardProps> = ({
  onOpenObservacoes,
  onOpenComoChegar,
  onOpenConfirmarPresenca,
  onOpenSugestoesPresentes,
  onOpenCalendar,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [userRsvp, setUserRsvp] = useState<{ name: string; status: string } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('duda_user_rsvp');
      if (saved) {
        setUserRsvp(JSON.parse(saved));
      }
    } catch {
      //
    }
  }, []);

  const handleShare = async () => {
    sound.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'XV da Duda 🍒✨',
          text: 'Você está convidado para a festa de 15 anos da Duda! Confira o convite:',
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    // CONTAINER COM FUNDO DE PAPEL BRANCO / BEGE AMASSADO DO CANVA
    <div
      className="relative w-full h-full flex flex-col items-center justify-center p-3 select-none overflow-hidden"
      style={{
        backgroundImage: `url("${crumpledWhitePaperImg}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* CARTÃO RETANGULAR DE PAPEL BORDÔ AMASSADO DO CANVA */}
      <div
        className="relative z-10 w-[310px] sm:w-[335px] max-w-[94vw] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.65)] py-5 px-4 flex flex-col items-center text-center overflow-visible border border-stone-900/30"
        style={{
          backgroundColor: '#4e0c15',
          backgroundImage: `linear-gradient(rgba(78, 12, 21, 0.88), rgba(42, 6, 12, 0.94)), url("${burgundyPaperImg}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* CEREJAS DUPLAS NO TOPO ESQUERDO (SOBREPONDO A BORDA COMO NO CANVA) */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: -6 }}
          transition={{ type: 'spring', damping: 14, stiffness: 120, delay: 0.2 }}
          className="absolute -top-7 -left-7 w-20 h-20 z-20 pointer-events-none drop-shadow-[0_6px_12px_rgba(0,0,0,0.45)]"
        >
          <img
            src={cherryDoubleImg}
            alt="Cerejas Duda"
            className="w-full h-full object-contain filter brightness-105"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* ESTRELA DE ONCINHA NO TOPO DIREITO (SOBREPONDO A BORDA COMO NO CANVA) */}
        <motion.div
          initial={{ scale: 0, rotate: 30 }}
          animate={{ scale: 1, rotate: 14 }}
          transition={{ type: 'spring', damping: 14, stiffness: 120, delay: 0.3 }}
          className="absolute -top-8 -right-8 w-22 h-22 z-20 pointer-events-none drop-shadow-[0_6px_14px_rgba(0,0,0,0.6)]"
        >
          <div 
            className="w-full h-full overflow-hidden"
            style={{
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
            }}
          >
            <img
              src={leopardStarImg}
              alt="Estrela Oncinha"
              className="w-full h-full object-cover filter contrast-125"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>

        {/* TÍTULO PRINCIPAL: XV da Duda (Caligrafia Cursiva Vermelha Idêntica ao Canva) */}
        <div className="pt-1 flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="font-script text-6xl sm:text-7xl text-[#d42738] tracking-wide select-none leading-none drop-shadow-[0_2px_8px_rgba(212,39,56,0.35)]"
            style={{
              textShadow: '2px 2px 4px rgba(0,0,0,0.85), -1px -1px 0px rgba(255,255,255,0.12)',
            }}
          >
            XV da Duda
          </motion.h1>

          {/* Frase de Convite (Caligrafia Cursiva Branca/Creme do Canva) */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="font-vibes text-2xl sm:text-3xl text-[#f5ebd9] mt-2 max-w-[270px] leading-tight tracking-wide drop-shadow-sm px-1"
          >
            Você está convidado a participar desse momento especial comigo!
          </motion.p>

          {/* Data e Horário (Exatamente como na Página 2 do Canva) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-3 flex flex-col items-center"
          >
            <div className="font-vibes text-3xl sm:text-4xl text-[#ffe1e5] tracking-wide drop-shadow-sm">
              12 de Dezembro
            </div>
            <div className="font-sans font-bold text-lg text-white tracking-wider mt-0.5 drop-shadow-md">
              13hrs às 21hrs
            </div>
          </motion.div>

          {/* BOTÃO "OBSERVAÇÕES" (Pílula Clara com Letras Cursivas Vinho do Canva) */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              sound.playClick();
              onOpenObservacoes();
            }}
            className="mt-4 w-52 sm:w-56 py-1.5 px-5 bg-[#dfd6c8] hover:bg-[#eae3d8] text-[#76051a] rounded-full shadow-[0_6px_18px_rgba(0,0,0,0.4)] border border-[#baa995] flex items-center justify-center transition-all cursor-pointer group active:scale-95"
          >
            <span className="font-vibes text-2xl sm:text-3xl font-normal tracking-wide group-hover:scale-105 transition-transform">
              Observações
            </span>
          </motion.button>
        </div>

        {/* SEÇÃO INFERIOR: 3 BOTÕES DE AÇÃO CIRCULARES IDÊNTICOS AO CANVA */}
        <div className="w-full pt-4 pb-1">
          <div className="grid grid-cols-3 gap-2.5 max-w-[270px] mx-auto">
            {/* Botão 1: Como chegar */}
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sound.playClick();
                onOpenComoChegar();
              }}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full bg-[#dfd6c8] group-hover:bg-[#eae3d8] text-[#5c131d] flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.45)] border border-[#baa995] transition-all">
                <MapPin size={24} className="stroke-[2.2] group-hover:scale-110 transition-transform" />
              </div>
              <span className="mt-1.5 text-xs font-sans font-medium text-stone-200 text-center leading-tight tracking-wide">
                Como<br />chegar
              </span>
            </motion.div>

            {/* Botão 2: Confirmar Presença (Ícone de Balão de Conversa WhatsApp do Canva) */}
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sound.playClick();
                onOpenConfirmarPresenca(userRsvp ? 'list' : 'form');
              }}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full bg-[#dfd6c8] group-hover:bg-[#eae3d8] text-[#5c131d] flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.45)] border border-[#baa995] transition-all relative">
                <MessageCircle size={24} className="stroke-[2.2] group-hover:scale-110 transition-transform" />
                {userRsvp?.status === 'confirmed' && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold shadow-xs">
                    ✓
                  </span>
                )}
              </div>
              <span className="mt-1.5 text-xs font-sans font-medium text-stone-200 text-center leading-tight tracking-wide">
                Confirmar<br />Presença
              </span>
            </motion.div>

            {/* Botão 3: Sugestões de Presentes */}
            <motion.div
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                sound.playClick();
                onOpenSugestoesPresentes();
              }}
              className="flex flex-col items-center cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-full bg-[#dfd6c8] group-hover:bg-[#eae3d8] text-[#5c131d] flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.45)] border border-[#baa995] transition-all">
                <Gift size={24} className="stroke-[2.2] group-hover:scale-110 transition-transform" />
              </div>
              <span className="mt-1.5 text-xs font-sans font-medium text-stone-200 text-center leading-tight tracking-wide">
                Sugestões de<br />Presentes
              </span>
            </motion.div>
          </div>

          {/* Links discretos de apoio no rodapé do cartão */}
          <div className="flex items-center justify-center gap-3 mt-3 pt-2 border-t border-white/10 text-[11px] text-stone-300">
            <button
              onClick={() => {
                sound.playClick();
                onOpenCalendar();
              }}
              className="flex items-center gap-1 hover:text-rose-300 transition-colors py-0.5 px-2 rounded-md bg-black/25 hover:bg-black/35 cursor-pointer"
            >
              <Calendar size={12} className="text-rose-400" />
              <span>Salvar na Agenda</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1 hover:text-rose-300 transition-colors py-0.5 px-2 rounded-md bg-black/25 hover:bg-black/35 cursor-pointer"
            >
              {copiedLink ? <Check size={12} className="text-emerald-400" /> : <Share2 size={12} className="text-rose-400" />}
              <span>{copiedLink ? "Copiado!" : "Compartilhar"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
