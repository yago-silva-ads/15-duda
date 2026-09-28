import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronLeft, Minus, Plus, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitRsvp, RsvpEntry } from '../services/rsvpService';
import { sound } from '../utils/audio';

interface RsvpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSpreadsheet?: () => void;
  initialTab?: 'form' | 'list';
}

type Attendance = 'yes' | 'no' | '';

export const RsvpModal: React.FC<RsvpModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<Attendance>('');
  const [adultsCount, setAdultsCount] = useState(1);
  const [kidsCount, setKidsCount] = useState(0);
  const [bringingSwimwear, setBringingSwimwear] = useState(true);
  const [customMessage, setCustomMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [userAlreadyRegistered, setUserAlreadyRegistered] = useState<RsvpEntry | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setStep(1);
    try {
      const saved = localStorage.getItem('duda_user_rsvp');
      if (saved) {
        const parsed: RsvpEntry = JSON.parse(saved);
        setUserAlreadyRegistered(parsed);
        setGuestName(parsed.name || '');
        setPhone(parsed.phone || '');
        setStatus(parsed.status === 'confirmed' ? 'yes' : 'no');
        setAdultsCount(Math.max(1, parsed.adults || 1));
        setKidsCount(Math.max(0, parsed.kids || 0));
        setBringingSwimwear(Boolean(parsed.bringingSwimwear));
        setCustomMessage(parsed.message || '');
      } else {
        setUserAlreadyRegistered(null);
      }
    } catch {
      setUserAlreadyRegistered(null);
    }
  }, [isOpen]);

  const rawPhone = useMemo(() => phone.replace(/\D/g, ''), [phone]);

  if (!isOpen) return null;

  const handlePhoneChange = (value: string) => {
    const raw = value.replace(/\D/g, '').slice(0, 11);
    let formatted = raw;
    if (raw.length > 2) formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
    if (raw.length > 7) formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
    setPhone(formatted);
    setError('');
  };

  const validateIdentity = () => {
    if (guestName.trim().length < 3) {
      setError('Digite seu nome completo.');
      return false;
    }
    if (rawPhone.length < 10) {
      setError('Digite um WhatsApp válido com DDD.');
      return false;
    }
    setError('');
    return true;
  };

  const goNext = () => {
    sound.playClick();
    if (!validateIdentity()) return;
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!validateIdentity()) {
      setStep(1);
      return;
    }
    if (!status) {
      setError('Escolha se você vai ou não à festa.');
      return;
    }

    setIsSubmitting(true);
    setError('');
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

      if (!result.success) throw new Error(result.error || 'Não foi possível salvar sua resposta.');

      const saved: RsvpEntry = result.data || {
        id: `user-${Date.now()}`,
        name: guestName.trim(),
        phone: phone.trim(),
        status: willAttend ? 'confirmed' : 'declined',
        adults: willAttend ? adultsCount : 0,
        kids: willAttend ? kidsCount : 0,
        bringingSwimwear: willAttend ? bringingSwimwear : false,
        message: customMessage.trim(),
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem('duda_user_rsvp', JSON.stringify(saved));
      setUserAlreadyRegistered(saved);

      if (willAttend) {
        sound.playCelebration();
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.68 },
          colors: ['#7b071c', '#d42738', '#f1ded5', '#ffffff'],
        });
      } else {
        sound.playClick();
      }

      setStep(3);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Não foi possível enviar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const close = () => {
    sound.playClick();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/35 backdrop-blur-md flex items-end sm:items-center justify-center"
        onClick={close}
      >
        <motion.section
          initial={{ y: 34, opacity: 0, scale: .99 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 28, opacity: 0, scale: .99 }}
          transition={{ type: 'spring', damping: 28, stiffness: 360 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full sm:max-w-[430px] max-h-[94dvh] overflow-y-auto bg-[#f9f9fb]/98 text-[#1d1d1f] rounded-t-[30px] sm:rounded-[30px] border border-black/10 shadow-[0_30px_90px_rgba(0,0,0,.28)] px-4 sm:px-5 pt-2.5 pb-[max(20px,calc(env(safe-area-inset-bottom)+14px))]"
        >
          <div className="w-9 h-1 rounded-full bg-[#d1d1d6] mx-auto mb-3 sm:hidden" />

          <div className="flex items-center justify-between min-h-10 mb-1">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => { setError(''); setStep(1); }}
                className="w-9 h-9 rounded-full bg-[#ececef] flex items-center justify-center text-[#3a3a3c] active:scale-95 transition-transform"
                aria-label="Voltar"
              >
                <ChevronLeft size={19} />
              </button>
            ) : <span className="w-9" />}

            {step < 3 && (
              <div className="flex items-center gap-1.5" aria-label={`Etapa ${step} de 2`}>
                <span className={`h-1 rounded-full transition-all ${step >= 1 ? 'w-8 bg-[#7b071c]' : 'w-5 bg-[#d1d1d6]'}`} />
                <span className={`h-1 rounded-full transition-all ${step >= 2 ? 'w-8 bg-[#7b071c]' : 'w-5 bg-[#d1d1d6]'}`} />
              </div>
            )}

            <button
              type="button"
              onClick={close}
              className="w-9 h-9 rounded-full bg-[#ececef] flex items-center justify-center text-[#3a3a3c] active:scale-95 transition-transform"
              aria-label="Fechar"
            >
              <X size={17} />
            </button>
          </div>

          {step === 1 && (
            <div className="pt-2">
              <p className="text-[10px] tracking-[.17em] font-bold text-[#7b071c] text-center">XV DA DUDA · RSVP</p>
              <h2 className="text-[32px] leading-[.98] tracking-[-.045em] font-bold text-center mt-2">Quem é você?</h2>
              <p className="text-[12px] leading-relaxed text-[#6e6e73] text-center mt-2 mb-6">Leva menos de 20 segundos e ajuda a Duda a organizar tudo certinho.</p>

              {userAlreadyRegistered && (
                <div className="mb-4 rounded-[16px] bg-[#f0f0f4] border border-black/5 p-3 text-[11px] leading-relaxed text-[#6e6e73]">
                  Já existe uma resposta neste aparelho. Você pode atualizar usando o mesmo WhatsApp.
                </div>
              )}

              <label className="block mb-4">
                <span className="block text-[12px] font-semibold text-[#3a3a3c] mb-1.5">Nome completo</span>
                <input
                  autoFocus
                  type="text"
                  autoComplete="name"
                  value={guestName}
                  onChange={(event) => { setGuestName(event.target.value); setError(''); }}
                  placeholder="Seu nome"
                  className="w-full h-[52px] rounded-[15px] bg-white border border-black/10 px-4 text-[16px] outline-none focus:border-[#7b071c]/40 focus:ring-4 focus:ring-[#7b071c]/8 transition-shadow"
                />
              </label>

              <label className="block mb-3">
                <span className="block text-[12px] font-semibold text-[#3a3a3c] mb-1.5">WhatsApp</span>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(event) => handlePhoneChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      goNext();
                    }
                  }}
                  placeholder="(11) 99999-9999"
                  className="w-full h-[52px] rounded-[15px] bg-white border border-black/10 px-4 text-[16px] outline-none focus:border-[#7b071c]/40 focus:ring-4 focus:ring-[#7b071c]/8 transition-shadow"
                />
                <small className="block text-[10px] leading-relaxed text-[#8e8e93] mt-1.5 px-1">O número serve para identificar sua resposta e evitar duplicidade.</small>
              </label>

              {error && <div className="mb-3 rounded-[14px] bg-[#fff0f1] text-[#8a1026] p-3 text-[11px] font-semibold">{error}</div>}

              <button
                type="button"
                onClick={goNext}
                className="w-full h-[52px] rounded-[16px] bg-[#1d1d1f] text-white text-[14px] font-semibold shadow-md active:scale-[.99] transition-transform"
              >
                Continuar
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="pt-2">
              <p className="text-[10px] tracking-[.17em] font-bold text-[#7b071c] text-center">12 DE DEZEMBRO · 13H ÀS 21H</p>
              <h2 className="text-[32px] leading-[.98] tracking-[-.045em] font-bold text-center mt-2">Você vai estar lá?</h2>
              <p className="text-[12px] leading-relaxed text-[#6e6e73] text-center mt-2 mb-5">Escolha uma opção. As duas respostas são importantes para a organização.</p>

              <div className="grid gap-2.5 mb-4">
                <button
                  type="button"
                  onClick={() => { sound.playClick(); setStatus('yes'); setError(''); }}
                  className={`min-h-[70px] rounded-[18px] border p-3 flex items-center gap-3 text-left transition-all ${status === 'yes' ? 'bg-[#f5fff7] border-emerald-500/35 ring-4 ring-emerald-500/6' : 'bg-white border-black/10'}`}
                >
                  <span className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 ${status === 'yes' ? 'bg-emerald-500 text-white' : 'bg-[#f2f2f7] text-[#8e8e93]'}`}>
                    <Check size={21} />
                  </span>
                  <span>
                    <strong className="block text-[14px]">Sim, eu vou</strong>
                    <small className="block text-[10.5px] text-[#6e6e73] mt-1">Confirmar minha presença</small>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => { sound.playClick(); setStatus('no'); setError(''); }}
                  className={`min-h-[70px] rounded-[18px] border p-3 flex items-center gap-3 text-left transition-all ${status === 'no' ? 'bg-[#fff8f9] border-[#7b071c]/30 ring-4 ring-[#7b071c]/5' : 'bg-white border-black/10'}`}
                >
                  <span className={`w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0 text-[22px] font-medium ${status === 'no' ? 'bg-[#7b071c] text-white' : 'bg-[#f2f2f7] text-[#8e8e93]'}`}>×</span>
                  <span>
                    <strong className="block text-[14px]">Não poderei ir</strong>
                    <small className="block text-[10.5px] text-[#6e6e73] mt-1">Avisar a Duda</small>
                  </span>
                </button>
              </div>

              {status === 'yes' && (
                <div className="animate-[fadeIn_.18s_ease-out]">
                  <div className="rounded-[18px] bg-white border border-black/10 p-3.5 mb-3">
                    <div className="flex items-center justify-between min-h-10">
                      <span className="text-[12px] font-semibold">Adultos</span>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setAdultsCount(Math.max(1, adultsCount - 1))} className="w-9 h-9 rounded-full bg-[#f2f2f7] flex items-center justify-center"><Minus size={15} /></button>
                        <strong className="w-5 text-center text-[15px]">{adultsCount}</strong>
                        <button type="button" onClick={() => setAdultsCount(Math.min(10, adultsCount + 1))} className="w-9 h-9 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center"><Plus size={15} /></button>
                      </div>
                    </div>
                    <div className="h-px bg-black/6 my-2" />
                    <div className="flex items-center justify-between min-h-10">
                      <span className="text-[12px] font-semibold">Crianças</span>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setKidsCount(Math.max(0, kidsCount - 1))} className="w-9 h-9 rounded-full bg-[#f2f2f7] flex items-center justify-center"><Minus size={15} /></button>
                        <strong className="w-5 text-center text-[15px]">{kidsCount}</strong>
                        <button type="button" onClick={() => setKidsCount(Math.min(10, kidsCount + 1))} className="w-9 h-9 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center"><Plus size={15} /></button>
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center gap-2.5 rounded-[16px] bg-white border border-black/10 px-3.5 min-h-[50px] mb-3 text-[11px] text-[#3a3a3c]">
                    <input type="checkbox" checked={bringingSwimwear} onChange={(event) => setBringingSwimwear(event.target.checked)} className="accent-[#7b071c] w-4 h-4" />
                    Levar roupa de banho para a piscina
                  </label>
                </div>
              )}

              {status && (
                <label className="block mb-3">
                  <span className="block text-[12px] font-semibold text-[#3a3a3c] mb-1.5">Recado <em className="font-normal text-[#8e8e93] not-italic">(opcional)</em></span>
                  <textarea
                    rows={2}
                    maxLength={400}
                    value={customMessage}
                    onChange={(event) => setCustomMessage(event.target.value)}
                    placeholder={status === 'yes' ? 'Alguma observação para a Duda?' : 'Se quiser, deixe um recadinho ❤️'}
                    className="w-full min-h-[78px] resize-none rounded-[15px] bg-white border border-black/10 px-4 py-3 text-[15px] outline-none focus:border-[#7b071c]/40 focus:ring-4 focus:ring-[#7b071c]/8"
                  />
                </label>
              )}

              {error && <div className="mb-3 rounded-[14px] bg-[#fff0f1] text-[#8a1026] p-3 text-[11px] font-semibold">{error}</div>}

              <button
                type="button"
                disabled={!status || isSubmitting}
                onClick={handleSubmit}
                className="w-full h-[52px] rounded-[16px] bg-[#1d1d1f] text-white text-[14px] font-semibold shadow-md disabled:opacity-35 active:scale-[.99] transition-all"
              >
                {isSubmitting ? 'Enviando…' : status === 'yes' ? 'Confirmar presença' : status === 'no' ? 'Enviar resposta' : 'Escolha uma opção'}
              </button>

              <p className="text-[9.5px] leading-relaxed text-[#8e8e93] text-center mt-2.5 px-3">Nome e telefone são usados somente para organizar a lista de convidados.</p>
            </div>
          )}

          {step === 3 && (
            <div className="min-h-[430px] flex flex-col items-center justify-center text-center px-3 py-8">
              <div className={`w-[72px] h-[72px] rounded-[23px] flex items-center justify-center mb-5 ${status === 'yes' ? 'bg-emerald-500 text-white' : 'bg-[#f2f2f7] text-[#7b071c]'}`}>
                {status === 'yes' ? <Check size={36} strokeWidth={2.5} /> : <span className="text-[38px] leading-none">♡</span>}
              </div>
              <p className="text-[10px] tracking-[.16em] font-bold text-[#7b071c]">RESPOSTA REGISTRADA</p>
              <h2 className="text-[31px] leading-[1] tracking-[-.045em] font-bold mt-2">{status === 'yes' ? 'Presença confirmada' : 'Obrigada por avisar'}</h2>
              <p className="max-w-[310px] text-[12px] leading-relaxed text-[#6e6e73] mt-3 mb-6">
                {status === 'yes'
                  ? 'Te esperamos no XV da Duda. Se algo mudar, abra o convite novamente e atualize sua resposta.'
                  : 'Sua ausência foi registrada. Se seus planos mudarem, você pode responder novamente usando o mesmo WhatsApp.'}
              </p>
              <button type="button" onClick={close} className="w-full max-w-[310px] h-[52px] rounded-[16px] bg-[#1d1d1f] text-white text-[14px] font-semibold">Voltar ao convite</button>
            </div>
          )}
        </motion.section>
      </motion.div>
    </AnimatePresence>
  );
};
