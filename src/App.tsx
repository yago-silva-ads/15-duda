import React, { useEffect, useState } from 'react';
import { LocationModal } from './components/LocationModal';
import { RsvpModal } from './components/RsvpModal';

type Page = 1 | 2 | 3 | 4;

const TRACKS = [
  {
    id: 'ayo',
    title: 'Ayo Technology',
    artist: '50 Cent · Justin Timberlake',
    embed: 'https://open.spotify.com/embed/track/4unZtWTDie1lVCWbPsr1DX?utm_source=generator&theme=0',
  },
  {
    id: 'feeling',
    title: 'I Gotta Feeling',
    artist: 'The Black Eyed Peas',
    embed: 'https://open.spotify.com/embed/track/4kLLWz7srcuLKA7Et40PQR?utm_source=generator&theme=0',
  },
] as const;

export default function App() {
  const [page, setPage] = useState<Page>(1);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const [trackId, setTrackId] = useState<(typeof TRACKS)[number]['id']>('ayo');
  const [toast, setToast] = useState('');

  const track = TRACKS.find((item) => item.id === trackId) ?? TRACKS[0];

  useEffect(() => {
    const preload = [1, 2, 3, 4].map((n) => {
      const image = new Image();
      image.src = `/canva/page-${n}.webp`;
      return image;
    });
    return () => { preload.length = 0; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const go = (next: Page) => {
    setMusicOpen(false);
    setPage(next);
  };

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText('536.774.568-78');
      setToast('PIX copiado');
    } catch {
      setToast('PIX: 536.774.568-78');
    }
  };

  return (
    <main className="site-shell">
      <section className={`canva-stage canva-stage--page-${page}`} aria-label="Convite XV da Duda">
        <img
          className="canva-page"
          src={`/canva/page-${page}.webp`}
          alt={
            page === 1 ? 'Capa do convite XV da Duda' :
            page === 2 ? 'Convite XV da Duda - 12 de Dezembro, 13hrs às 21hrs' :
            page === 3 ? 'Sugestões de presentes do XV da Duda' :
            'Observações do XV da Duda'
          }
          draggable={false}
        />

        {page === 1 && (
          <button className="cover-hit" type="button" onClick={() => go(2)} aria-label="Abrir convite">
            <span>Toque para abrir</span>
          </button>
        )}

        {page === 2 && (
          <>
            <button className="hotspot hotspot--rules" type="button" onClick={() => go(4)} aria-label="Abrir observações" />
            <button className="hotspot hotspot--location" type="button" onClick={() => setLocationOpen(true)} aria-label="Como chegar" />
            <button className="hotspot hotspot--rsvp" type="button" onClick={() => setRsvpOpen(true)} aria-label="Confirmar presença" />
            <button className="hotspot hotspot--gifts" type="button" onClick={() => go(3)} aria-label="Sugestões de presentes" />
          </>
        )}

        {page === 3 && (
          <button className="hotspot hotspot--pix" type="button" onClick={copyPix} aria-label="Copiar chave PIX" />
        )}

        {page !== 1 && (
          <button type="button" className="back-float" onClick={() => go(2)} aria-label="Voltar ao convite">
            ‹
          </button>
        )}

        {page !== 1 && (
          <div className="music-wrap">
            <button
              type="button"
              className={`music-pill ${musicOpen ? 'music-pill--active' : ''}`}
              onClick={() => setMusicOpen((value) => !value)}
              aria-expanded={musicOpen}
              aria-label="Abrir mini Spotify"
            >
              <span className="music-note">♫</span>
              <span className="music-copy">
                <strong>{track.title}</strong>
                <small>{musicOpen ? 'fechar player' : 'música'}</small>
              </span>
            </button>

            {musicOpen && (
              <aside className="music-popover" aria-label="Mini Spotify">
                <div className="music-head">
                  <div>
                    <span className="spotify-dot" />
                    <strong>Spotify · Y2K</strong>
                  </div>
                  <button type="button" onClick={() => setMusicOpen(false)} aria-label="Fechar">×</button>
                </div>

                <div className="track-tabs">
                  {TRACKS.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setTrackId(item.id)}
                      className={item.id === track.id ? 'selected' : ''}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>

                <iframe
                  key={track.embed}
                  className="spotify-frame"
                  src={track.embed}
                  title={`${track.title} - Spotify`}
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                />
                <p>Toque no Play do Spotify para iniciar o áudio.</p>
              </aside>
            )}
          </div>
        )}
      </section>

      <div className="page-dots" aria-hidden="true">
        {[1, 2, 3, 4].map((dot) => (
          <span key={dot} className={page === dot ? 'active' : ''} />
        ))}
      </div>

      {toast && <div className="toast" role="status">{toast}</div>}

      <LocationModal isOpen={locationOpen} onClose={() => setLocationOpen(false)} />
      <RsvpModal isOpen={rsvpOpen} onClose={() => setRsvpOpen(false)} />
    </main>
  );
}
