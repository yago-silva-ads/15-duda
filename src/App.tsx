import { useCallback, useEffect, useRef, useState } from 'react';
import { LocationModal } from './components/LocationModal';
import { RsvpModal } from './components/RsvpModal';
import { SpotifyMiniPlayer } from './components/SpotifyMiniPlayer';
import { INVITATION_DATA as data } from './data/invitationData';
import { getGoogleCalendarUrl } from './utils/calendar';

const titles = ['Capa do convite XV da Duda', 'Convite', 'Sugestões de Presentes', 'Observações'];
export default function App() {
  const [reading, setReading] = useState(false);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [toast, setToast] = useState('');
  const music = useRef<{ play: () => void }>(null);
  const go = useCallback((n: number) => document.getElementById(`page-${n}`)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }), []);
  const closeRsvp = useCallback(() => setRsvpOpen(false), []);
  const showGifts = useCallback(() => { requestAnimationFrame(() => go(3)); }, [go]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 2400); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('arrived'); observer.unobserve(e.target); } }), { threshold: .08 });
    document.querySelectorAll('.page-section').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const copyPix = async () => { try { await navigator.clipboard.writeText(data.pix.key); setToast('PIX copiado'); } catch { setToast(`PIX: ${data.pix.key}`); } };
  return <main className={`site-shell ${reading ? 'reading' : ''}`}>
    <header className="toolbar"><span>XV da Duda</span><button aria-label="Modo leitura acessível" aria-pressed={reading} onClick={() => setReading(v => !v)}>Aa</button></header>
    {[1, 2, 3, 4].map(page => <section id={`page-${page}`} key={page} className="page-section" aria-label={titles[page - 1]}>
      <div className={`canva-stage canva-stage--page-${page}`} aria-hidden={reading || undefined}>
        <img className="canva-page" src={`/canva/page-${page}.webp`} alt={titles[page - 1]} width="1080" height="1919" loading={page < 3 ? 'eager' : 'lazy'} draggable={false} />
        <div className="sparkles" aria-hidden="true"><span>✦</span><span>🍒</span><span>✧</span></div>
        {page === 1 && <button className="cover-hit" aria-label="Toque para abrir" onClick={() => { music.current?.play(); go(2); }}><span>Toque para abrir</span></button>}
        {page === 2 && <>
          <button className="hotspot hotspot--rules" onClick={() => go(4)} aria-label="Abrir observações" />
          <button className="hotspot hotspot--location" onClick={() => setLocationOpen(true)} aria-label="Como chegar" />
          <button className="hotspot hotspot--rsvp" onClick={() => setRsvpOpen(true)} aria-label="Confirmar presença" />
          <button className="hotspot hotspot--gifts" onClick={showGifts} aria-label="Sugestões de presentes" />
        </>}
        {page === 3 && <button className="hotspot hotspot--pix" onClick={copyPix} aria-label="Copiar chave PIX" />}
        {page === 4 && <div className="canva-line-correction">· Maiores de 18 anos, tragam sua bebida alcoólica.</div>}
      </div>
      <article className={reading ? 'readable' : 'sr-only'}>
        <h1 hidden={page !== 1}>XV da Duda</h1>{page !== 1 && <h2>{titles[page - 1]}</h2>}
        {page === 1 && <p>Você está convidado a participar desse momento especial comigo!</p>}
        {page === 2 && <><p>12 de dezembro de 2026 · 13h às 21h</p><p>{data.location.name}<br />{data.location.address}<br />{data.location.city}</p></>}
        {page === 3 && <><ul>{data.giftSuggestions.map(g => <li key={g.id}>{g.title} {'detail' in g && g.detail}</li>)}</ul><p>PIX: {data.pix.key}</p><p>Sua presença é o maior presente!</p></>}
        {page === 4 && <><ul>{data.rules.map(r => <li key={r.id}>{r.title} {'subtitle' in r && r.subtitle}</li>)}</ul><p>Aproveite esse momento comigo! Te espero lá!</p></>}
      </article>
      {page === 1 && <SpotifyMiniPlayer ref={music} />}
      {page === 2 && <nav className="actions" aria-label="Ações do convite"><button onClick={() => setRsvpOpen(true)}>Confirmar presença</button><button onClick={() => setLocationOpen(true)}>Como chegar</button><a href={getGoogleCalendarUrl()} target="_blank" rel="noreferrer">Google Agenda</a><a href="/xv-da-duda.ics" download>Baixar .ics</a><button onClick={showGifts}>Sugestões de presentes</button><button onClick={() => go(4)}>Observações</button></nav>}
      {page === 3 && reading && <button onClick={copyPix}>Copiar PIX</button>}
      {page === 4 && <button className="return" onClick={() => go(2)}>Voltar ao convite</button>}
    </section>)}
    {toast && <div className="toast" role="status">{toast}</div>}
    <LocationModal isOpen={locationOpen} onClose={() => setLocationOpen(false)} />
    <RsvpModal isOpen={rsvpOpen} onClose={closeRsvp} onConfirmed={showGifts} />
  </main>;
}
