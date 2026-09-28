import React, { useState } from 'react';
import { Music2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

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
];

export function SpotifyMiniPlayer() {
  const [open, setOpen] = useState(false);
  const [trackId, setTrackId] = useState(TRACKS[0].id);
  const selected = TRACKS.find((track) => track.id === trackId) || TRACKS[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir música no Spotify"
        className="w-10 h-10 rounded-full bg-[#1d1d1f]/92 backdrop-blur-xl border border-white/10 shadow-lg flex items-center justify-center text-white active:scale-95 transition-transform"
      >
        <Music2 size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/35 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={() => setOpen(false)}
          >
            <motion.section
              initial={{ y: 28, opacity: 0, scale: .99 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: .99 }}
              transition={{ type: 'spring', damping: 28, stiffness: 360 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full sm:max-w-[390px] rounded-t-[30px] sm:rounded-[30px] bg-[#111]/98 text-white border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,.5)] p-4 pb-[max(18px,calc(env(safe-area-inset-bottom)+12px))]"
            >
              <div className="w-9 h-1 rounded-full bg-white/20 mx-auto mb-4 sm:hidden" />

              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-[9px] tracking-[.18em] font-bold text-[#1ed760]">TRILHA Y2K</p>
                  <h3 className="text-[22px] leading-none font-semibold tracking-[-.035em] mt-1">Escolha a música</h3>
                  <p className="text-[11px] text-white/50 mt-1.5">Player oficial do Spotify.</p>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white/80">
                  <X size={17} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {TRACKS.map((track) => (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => setTrackId(track.id)}
                    className={`rounded-[15px] p-3 text-left border transition-colors ${track.id === trackId ? 'bg-[#1ed760]/12 border-[#1ed760]/55' : 'bg-white/5 border-white/8'}`}
                  >
                    <strong className="block text-[11px] truncate">{track.title}</strong>
                    <span className="block text-[9px] text-white/45 mt-1 truncate">{track.artist}</span>
                  </button>
                ))}
              </div>

              <iframe
                key={selected.embed}
                src={selected.embed}
                title={`${selected.title} no Spotify`}
                width="100%"
                height="152"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="block w-full rounded-[16px] bg-[#121212]"
              />

              <p className="text-[9px] leading-relaxed text-white/35 text-center mt-2.5">
                O navegador exige que a pessoa toque em Play para iniciar áudio comercial.
              </p>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
