import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
type Controller = { play: () => void; pause: () => void; destroy: () => void; addListener: (event: string, callback: (event: { data: { isPaused: boolean } }) => void) => void };
type API = { createController: (node: HTMLElement, options: { uri: string; width: string; height: number }, callback: (controller: Controller) => void) => void };
declare global { interface Window { onSpotifyIframeApiReady?: (api: API) => void; dudaSpotifyApi?: API } }
export const SpotifyMiniPlayer = forwardRef<{ play: () => void }>(function SpotifyMiniPlayer(_, ref) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<Controller | null>(null);
  const [playing, setPlaying] = useState(false);
  const [open, setOpen] = useState(false);
  const play = () => { setOpen(true); try { controller.current?.play(); } catch { /* Native player remains available. */ } };
  useImperativeHandle(ref, () => ({ play }));
  useEffect(() => {
    let disposed = false;
    const setup = (api: API) => {
      window.dudaSpotifyApi = api;
      if (disposed || !host.current) return;
      const element = document.createElement('div');
      host.current.replaceChildren(element);
      api.createController(element, { uri: 'spotify:track:4unZtWTDie1lVCWbPsr1DX', width: '100%', height: 152 }, c => {
        if (disposed) { c.destroy(); return; }
        controller.current = c;
        c.addListener('playback_update', e => setPlaying(!e.data.isPaused));
      });
    };
    if (window.dudaSpotifyApi) setup(window.dudaSpotifyApi);
    else {
      window.onSpotifyIframeApiReady = setup;
      if (!document.getElementById('spotify-api')) {
        const script = document.createElement('script'); script.id = 'spotify-api'; script.src = 'https://open.spotify.com/embed/iframe-api/v1'; script.async = true; document.head.append(script);
      }
    }
    return () => { disposed = true; controller.current?.destroy(); controller.current = null; };
  }, []);
  return <aside className="mini-player" aria-label="Música">
    <div className="music-controls"><span>♫ Ayo Technology <small>50 Cent feat. Justin Timberlake</small></span>
      <button onClick={() => { if (playing) controller.current?.pause(); else play(); }}>{playing ? 'Pausar música' : 'Tocar música'}</button>
      <button aria-label={open ? 'Recolher Spotify' : 'Mostrar Spotify'} aria-expanded={open} onClick={() => setOpen(v => !v)}>{open ? '−' : '+'}</button>
    </div>
    <div hidden={!open}><div ref={host} /><p className="hint">Se necessário, toque no play do Spotify. Volume pelo dispositivo ou Spotify. <a href="https://open.spotify.com/track/4unZtWTDie1lVCWbPsr1DX" target="_blank" rel="noreferrer">Abrir no Spotify</a></p></div>
  </aside>;
});
