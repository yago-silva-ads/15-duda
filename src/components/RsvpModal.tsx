import { useEffect, useState } from 'react';
import { submitRsvp } from '../services/rsvpService';
import { Dialog } from './Dialog';
interface Props { isOpen: boolean; onClose: () => void; onConfirmed?: () => void; onOpenSpreadsheet?: () => void; initialTab?: 'form' | 'list' }
export function RsvpModal(props: Props) { return props.isOpen ? <RsvpForm {...props} /> : null; }
function RsvpForm({ onClose, onConfirmed }: Props) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'' | 'confirmed' | 'declined'>('');
  const [children, setChildren] = useState<{ name: string; age: string }[]>([]);
  const [swimwear, setSwimwear] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const hasMinor = Number(age) < 18 || children.length > 0;
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('duda_user_rsvp') || 'null');
      if (saved) { setName(saved.name || ''); setAge(saved.age == null ? '' : String(saved.age)); setPhone(saved.phone || ''); }
    } catch { /* Optional convenience only. */ }
  }, []);
  useEffect(() => {
    if (step !== 3) return;
    const timer = window.setTimeout(() => { onClose(); if (status === 'confirmed') onConfirmed?.(); }, 1400);
    return () => clearTimeout(timer);
  }, [step, status, onClose, onConfirmed]);
  const close = () => { if (!busy) { onClose(); if (step === 3 && status === 'confirmed') onConfirmed?.(); } };
  return <Dialog title={step === 1 ? 'Quem é você?' : step === 2 ? 'Você vai estar lá?' : 'Resposta registrada'} onClose={close}>
    {step === 3 ? <p role="status">{status === 'confirmed' ? 'Presença confirmada! Te esperamos no XV da Duda.' : 'Obrigada por avisar. Sua resposta foi registrada.'}</p> :
    <form onSubmit={async e => {
      e.preventDefault(); setError('');
      if (step === 1) {
        if (name.trim().split(/\s+/).length < 2) { setError('Digite seu nome completo.'); return; }
        if (!/^(?:55)?\d{10,11}$/.test(phone.replace(/\D/g, ''))) { setError('Digite um WhatsApp válido com DDD.'); return; }
        setStep(2); return;
      }
      if (!status || busy) return;
      setBusy(true);
      const attending = status === 'confirmed';
      const result = await submitRsvp({ name: name.trim(), age: Number(age), phone, status, adults: attending ? 1 : 0,
        kids: attending ? children.length : 0, children: attending ? children.map(c => ({ name: c.name.trim(), age: Number(c.age) })) : [],
        totalPeople: attending ? 1 + children.length : 0, bringingSwimwear: attending && hasMinor && swimwear, message: message.trim() });
      setBusy(false);
      if (!result.success) { setError(result.error || 'Não foi possível enviar. Tente novamente.'); return; }
      try { localStorage.setItem('duda_user_rsvp', JSON.stringify(result.data)); } catch { /* Saving already succeeded. */ }
      setStep(3);
    }}>
      {step === 1 ? <>
        <label>Nome completo<input autoFocus required autoComplete="name" maxLength={120} value={name} onChange={e => setName(e.target.value)} /></label>
        <label>Idade<input required type="number" inputMode="numeric" min="0" max="120" step="1" value={age} onChange={e => setAge(e.target.value)} /></label>
        <label>WhatsApp<input required type="tel" autoComplete="tel-national" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} /></label>
        <p className="hint">Use o mesmo WhatsApp para atualizar sua resposta.</p>
        <button className="primary">Continuar</button>
      </> : <>
        <fieldset disabled={busy}>
          <legend>12/12/2026 · 13h às 21h</legend>
          <label className="choice"><input type="radio" name="attendance" required checked={status === 'confirmed'} onChange={() => setStatus('confirmed')} />Sim, eu vou</label>
          <label className="choice"><input type="radio" name="attendance" required checked={status === 'declined'} onChange={() => setStatus('declined')} />Não poderei ir</label>
          {status === 'confirmed' && <>
            <p className="hint">Convidado não convida. Informe apenas as crianças que irão com você.</p>
            <div className="counter"><strong>Crianças</strong><button type="button" aria-label="Remover criança" disabled={!children.length} onClick={() => setChildren(c => c.slice(0, -1))}>−</button><output aria-live="polite">{children.length}</output><button type="button" aria-label="Adicionar criança" disabled={children.length >= 10} onClick={() => setChildren(c => [...c, { name: '', age: '' }])}>+</button></div>
            {children.map((child, i) => <fieldset key={i} className="child"><legend>Criança {i + 1}</legend>
              <label>Nome da criança<input required maxLength={120} value={child.name} onChange={e => setChildren(c => c.map((v, j) => i === j ? { ...v, name: e.target.value } : v))} /></label>
              <label>Idade da criança<input required type="number" inputMode="numeric" min="0" max="17" step="1" value={child.age} onChange={e => setChildren(c => c.map((v, j) => i === j ? { ...v, age: e.target.value } : v))} /></label>
            </fieldset>)}
            {hasMinor && <label className="choice"><input type="checkbox" checked={swimwear} onChange={e => setSwimwear(e.target.checked)} />Levar roupa de banho para os menores</label>}
          </>}
          <label>Recado (opcional)<textarea rows={3} maxLength={400} value={message} onChange={e => setMessage(e.target.value)} /></label>
          <button className="primary" disabled={!status || busy}>{busy ? 'Enviando…' : status === 'confirmed' ? 'Confirmar presença' : 'Enviar resposta'}</button>
          <button type="button" onClick={() => setStep(1)}>Voltar</button>
        </fieldset>
      </>}
      {error && <p role="alert" className="error">{error}</p>}
    </form>}
  </Dialog>;
}
