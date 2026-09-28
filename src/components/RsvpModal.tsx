import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, CheckCircle2, XCircle, Users, X, Send, Sparkles, Phone, Table, Check, Search, Calendar, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { INVITATION_DATA } from '../data/invitationData';
import { submitRsvp, fetchRsvps, RsvpEntry } from '../services/rsvpService';
import { sound } from '../utils/audio';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSpreadsheet?: () => void;
  initialTab?: 'form' | 'list';
}

export const RsvpModal: React.FC<RsvpModalProps> = ({ 
  isOpen, 
  onClose, 
  onOpenSpreadsheet,
  initialTab = 'form'
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'list'>(initialTab);
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'yes' | 'no'>('yes');
  const [adultsCount, setAdultsCount] = useState(1);
  const [kidsCount, setKidsCount] = useState(0);
  const [bringingSwimwear, setBringingSwimwear] = useState(true);
  const [customMessage, setCustomMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAlreadyRegistered, setUserAlreadyRegistered] = useState<RsvpEntry | null>(null);

  // Lista de confirmados
  const [confirmedList, setConfirmedList] = useState<RsvpEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingList, setLoadingList] = useState(false);

  // Carregar registro prévio do usuário e lista de confirmados
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem('duda_user_rsvp');
        if (saved) {
          const parsed = JSON.parse(saved);
          setUserAlreadyRegistered(parsed);
          setGuestName(parsed.name || '');
          setPhone(parsed.phone || '');
        }
      } catch {
        //
      }
      loadConfirmedList();
    }
  }, [isOpen]);

  const loadConfirmedList = async () => {
    setLoadingList(true);
    try {
      const all = await fetchRsvps();
      const onlyConfirmed = all.filter((r) => r.status === 'confirmed');
      setConfirmedList(onlyConfirmed);
    } catch {
      //
    } finally {
      setLoadingList(false);
    }
  };

  if (!isOpen) return null;

  // Formatação de telefone no formato brasileiro (XX) XXXXX-XXXX
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 2) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    }
    if (raw.length > 7) {
      formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    }
    setPhone(formatted);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#fb7185', '#fbbf24', '#f43f5e', '#ffffff'],
    });
  };

  const handleSubmit = async (e: React.FormEvent, sendToWhatsapp: boolean = false) => {
    e.preventDefault();
    if (!guestName.trim()) {
      alert('Por favor, informe seu nome.');
      return;
    }

    const rawDigits = phone.replace(/\D/g, '');
    if (rawDigits.length < 10) {
      alert('Por favor, informe um número de telefone com DDD válido (Ex: (11) 98765-4321).');
      return;
    }

    setIsSubmitting(true);
    const willAttend = status === 'yes';

    try {
      const result = await submitRsvp({
        name: guestName.trim(),
        phone: phone.trim(),
        status: willAttend ? 'confirmed' : 'declined',
        adults: willAttend ? adultsCount : 0,
        kids: willAttend ? kidsCount : 0,
        bringingSwimwear: willAttend ? bringingSwimwear : false,
        message: customMessage.trim(),
      });

      const registeredData: RsvpEntry = {
        id: result.data?.id || `user-${Date.now()}`,
        name: guestName.trim(),
        phone: phone.trim(),
        status: willAttend ? 'confirmed' : 'declined',
        adults: willAttend ? adultsCount : 0,
        kids: willAttend ? kidsCount : 0,
        bringingSwimwear: willAttend ? bringingSwimwear : false,
        message: customMessage.trim(),
        createdAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem('duda_user_rsvp', JSON.stringify(registeredData));
        setUserAlreadyRegistered(registeredData);
      } catch {
        //
      }

      if (willAttend) {
        sound.playCelebration();
        triggerConfetti();
        // Atualizar lista e alternar imediatamente para a aba de lista de presença!
        await loadConfirmedList();
        setActiveTab('list');
      } else {
        sound.playClick();
        onClose();
        alert('Agradecemos por nos avisar! Sua ausência foi comunicada com carinho à anfitriã.');
      }

      if (sendToWhatsapp) {
        let text = `*Confirmação de Presença - XV da Duda*\n\n`;
        text += `👤 *Nome:* ${guestName.trim()}\n`;
        text += `📱 *Telefone:* ${phone.trim()}\n`;
        text += `✨ *Presença:* ${willAttend ? 'SIM! Estarei presente para comemorar com você! 🎉' : 'Infelizmente não poderei comparecer 😢'}\n`;

        if (willAttend) {
          text += `👥 *Total de Pessoas:* ${adultsCount} adulto(s)${kidsCount > 0 ? `, ${kidsCount} criança(s)` : ''}\n`;
          text += `👙 *Roupa de Banho:* ${bringingSwimwear ? 'Vou levar para curtir a piscina!' : 'Não pretendo entrar na piscina'}\n`;
          text += `👗 *Dress code:* Ciente do look anos 2000's e proibido vermelho/oncinha! 😉\n`;
        }

        if (customMessage.trim()) {
          text += `💌 *Recadinho para a Duda:* "${customMessage.trim()}"\n`;
        }

        const encoded = encodeURIComponent(text);
        const whatsappUrl = `https://wa.me/${INVITATION_DATA.contactPhone}?text=${encoded}`;
        setTimeout(() => {
          window.open(whatsappUrl, '_blank');
        }, 500);
      }
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao salvar sua confirmação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtragem da lista de presença
  const filteredGuests = confirmedList.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (g.message && g.message.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPeopleConfirmed = confirmedList.reduce((acc, curr) => acc + (curr.adults || 1) + (curr.kids || 0), 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
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
          className="bg-[#240a0e] border border-rose-600/40 rounded-2xl max-w-md w-full p-4 sm:p-5 text-stone-100 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto"
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

          {/* Abas Superiores: 1. Confirmar Presença | 2. Lista de Confirmados */}
          <div className="flex items-center gap-1.5 p-1 bg-black/50 border border-white/10 rounded-xl mb-4 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('form');
              }}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <MessageCircle size={15} />
              <span>{userAlreadyRegistered ? 'Meu Cadastro' : 'Confirmar Presença'}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setActiveTab('list');
              }}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer relative ${
                activeTab === 'list'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Users size={15} />
              <span>Lista de Presença</span>
              {confirmedList.length > 0 && (
                <span className="px-1.5 py-0.2 bg-white text-rose-950 text-[10px] font-bold rounded-full ml-1">
                  {confirmedList.length}
                </span>
              )}
            </button>
          </div>

          {/* ABA 1: FORMULÁRIO DE CADASTRO / CONFIRMAÇÃO */}
          {activeTab === 'form' && (
            <div className="space-y-4">
              {userAlreadyRegistered && userAlreadyRegistered.status === 'confirmed' && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-start gap-2.5 shadow-sm">
                  <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <span className="font-bold text-white">Você já está confirmado(a)!</span>
                    <p className="text-emerald-200 mt-0.5">
                      Nome: <strong>{userAlreadyRegistered.name}</strong> • Total de {userAlreadyRegistered.adults + userAlreadyRegistered.kids} pessoa(s).
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('list')}
                      className="mt-1.5 text-xs text-amber-300 font-bold underline hover:text-amber-200 cursor-pointer block"
                    >
                      👉 Ver Lista de Presença Oficial ({totalPeopleConfirmed} pessoas)
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-3.5">
                {/* Status de Presença */}
                <div>
                  <label className="block text-sm font-semibold text-stone-200 mb-1.5">
                    Você irá ao aniversário? *
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setStatus('yes');
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        status === 'yes'
                          ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 shadow-md ring-1 ring-emerald-500'
                          : 'bg-black/35 border-white/10 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <CheckCircle2 size={16} className={status === 'yes' ? 'text-emerald-400' : ''} />
                      <span>Confirmado (Vou!)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setStatus('no');
                      }}
                      className={`py-2.5 px-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        status === 'no'
                          ? 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-md ring-1 ring-rose-500'
                          : 'bg-black/35 border-white/10 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <XCircle size={16} className={status === 'no' ? 'text-rose-400' : ''} />
                      <span>Não poderei ir</span>
                    </button>
                  </div>
                </div>

                {/* Nome Completo */}
                <div>
                  <label className="block text-sm font-semibold text-stone-200 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Ex: Beatriz Lima"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-white/20 text-stone-100 placeholder:text-stone-500 text-sm sm:text-base focus:outline-hidden focus:border-rose-500 transition-colors"
                  />
                </div>

                {/* Telefone / WhatsApp com DDD */}
                <div>
                  <label className="block text-sm font-semibold text-stone-200 mb-1 flex items-center gap-1.5">
                    <Phone size={14} className="text-rose-400" />
                    <span>Telefone / WhatsApp com DDD *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-white/20 text-stone-100 placeholder:text-stone-500 text-sm sm:text-base focus:outline-hidden focus:border-rose-500 font-mono tracking-wider transition-colors"
                  />
                </div>

                {/* Se Não for, aviso claro de que o número e nome serão registrados na planilha */}
                {status === 'no' && (
                  <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs sm:text-sm text-rose-200 leading-relaxed font-medium">
                    Seu nome e número de telefone serão adicionados na aba <strong>"Não Confirmados"</strong> da planilha da anfitriã para controle e organização da festa.
                  </div>
                )}

                {/* Apenas se for comparecer */}
                {status === 'yes' && (
                  <>
                    {/* Quantidade de Acompanhantes */}
                    <div className="p-3 rounded-xl bg-black/35 border border-white/15 space-y-2.5">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-stone-200 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Users size={15} className="text-rose-400" />
                          Adultos confirmados:
                        </span>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))}
                            className="w-7 h-7 rounded-lg bg-stone-800 text-stone-200 flex items-center justify-center text-sm font-bold hover:bg-stone-700"
                          >
                            -
                          </button>
                          <span className="font-mono text-base text-rose-300 font-extrabold w-5 text-center">
                            {adultsCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => setAdultsCount(adultsCount + 1)}
                            className="w-7 h-7 rounded-lg bg-stone-800 text-stone-200 flex items-center justify-center text-sm font-bold hover:bg-stone-700"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs sm:text-sm text-stone-200 font-medium">
                        <span>Crianças (com roupa de banho):</span>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setKidsCount(Math.max(0, kidsCount - 1))}
                            className="w-7 h-7 rounded-lg bg-stone-800 text-stone-200 flex items-center justify-center text-sm font-bold hover:bg-stone-700"
                          >
                            -
                          </button>
                          <span className="font-mono text-base text-rose-300 font-extrabold w-5 text-center">
                            {kidsCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => setKidsCount(kidsCount + 1)}
                            className="w-7 h-7 rounded-lg bg-stone-800 text-stone-200 flex items-center justify-center text-sm font-bold hover:bg-stone-700"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Roupa de Banho Checkbox */}
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-stone-200 select-none font-medium">
                      <input
                        type="checkbox"
                        checked={bringingSwimwear}
                        onChange={(e) => setBringingSwimwear(e.target.checked)}
                        className="accent-rose-500 rounded w-4 h-4 cursor-pointer"
                      />
                      <span>Vou levar roupa de banho para curtir a piscina</span>
                    </label>
                  </>
                )}

                {/* Mensagem / Motivo */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-stone-200 mb-1">
                    {status === 'yes' ? 'Recado carinhoso para a Duda (opcional)' : 'Motivo ou recado para a Duda (opcional)'}
                  </label>
                  <textarea
                    rows={2}
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder={status === 'yes' ? 'Deixe uma mensagem fofa para o grande dia...' : 'Deixe um abraço para a aniversariante...'}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/45 border border-white/20 text-stone-100 placeholder:text-stone-500 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500 transition-colors"
                  />
                </div>

                {/* Botões de Ação */}
                <div className="pt-1 flex flex-col gap-2.5">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-4 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                      status === 'yes'
                        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
                        : 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40'
                    }`}
                  >
                    <Send size={16} />
                    <span>
                      {isSubmitting
                        ? 'Salvando e atualizando lista...'
                        : status === 'yes'
                        ? 'Confirmar & Ver Lista de Presença'
                        : 'Registrar Ausência & Notificar'}
                    </span>
                    <Sparkles size={13} className="text-white animate-pulse" />
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={(e) => handleSubmit(e, false)}
                    className="w-full py-2.5 px-3 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-colors border border-white/10"
                  >
                    <Check size={14} className="text-emerald-400" />
                    <span>Salvar apenas no site (sem abrir WhatsApp)</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ABA 2: LISTA DE PRESENÇA OFICIAL DOS CONFIRMADOS */}
          {activeTab === 'list' && (
            <div className="space-y-3.5">
              {/* Card de Boas-Vindas e Totalizador */}
              <div className="bg-gradient-to-r from-rose-950/80 to-stone-900 border border-rose-500/40 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                    <span>Lista Oficial de Presença</span>
                    <Heart size={14} className="fill-rose-500 text-rose-500 inline-block animate-pulse" />
                  </h4>
                  <p className="text-xs text-rose-200/90 mt-0.5">
                    Quem já garantiu presença no XV da Duda
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
                    {totalPeopleConfirmed}
                  </div>
                  <div className="text-[10px] sm:text-xs text-stone-300 font-medium">
                    pessoas confirmadas
                  </div>
                </div>
              </div>

              {/* Barra de Pesquisa */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar amigo ou família na lista..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/15 text-stone-100 placeholder:text-stone-500 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500 transition-colors"
                />
              </div>

              {/* Lista Scrollável de Convidados */}
              <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
                {loadingList ? (
                  <div className="text-center py-8 text-xs text-stone-400">
                    Carregando lista de convidados...
                  </div>
                ) : filteredGuests.length === 0 ? (
                  <div className="text-center py-8 text-xs text-stone-400 bg-black/20 rounded-xl p-4">
                    {searchTerm ? 'Nenhum convidado encontrado com esse nome.' : 'Seja o primeiro a confirmar presença no XV da Duda!'}
                  </div>
                ) : (
                  filteredGuests.map((guest, idx) => (
                    <motion.div
                      key={guest.id || idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-2.5 sm:p-3 rounded-xl bg-black/40 border border-white/10 hover:border-rose-500/30 transition-all flex items-start gap-2.5"
                    >
                      {/* Avatar com inicial */}
                      <div className="w-8 h-8 rounded-full bg-rose-900/60 border border-rose-500/40 text-rose-200 flex items-center justify-center font-bold text-xs shrink-0">
                        {guest.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-white text-xs sm:text-sm truncate">
                            {guest.name}
                          </span>
                          <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium shrink-0">
                            Confirmado
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-300">
                          <span>{guest.adults || 1} adulto(s)</span>
                          {guest.kids > 0 && <span>• {guest.kids} criança(s)</span>}
                          {guest.bringingSwimwear && (
                            <span className="text-cyan-300">• Piscina 🏊</span>
                          )}
                        </div>

                        {guest.message && (
                          <div className="text-[11px] text-rose-200/80 italic mt-1 bg-white/5 p-1.5 rounded-lg border-l-2 border-rose-500">
                            "{guest.message}"
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Botão para Confirmar outra pessoa ou Voltar ao Formulário */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="flex-1 py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold text-center border border-white/10"
                >
                  {userAlreadyRegistered ? 'Alterar Meus Dados' : '+ Confirmar Meu Nome'}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
