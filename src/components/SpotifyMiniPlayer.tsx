import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
type Controller = { play: () => void; pause: () => void; destroy: () => void; addListener: (event: string, callback: (event: { data: { isPaused: boolean } }) => void) => void };
type API = { createController: (node: HTMLElement, options: { uri: string; width: string; height: number }, callback: (controller: Controller) => void) => void };
declare global { interface Window { onSpotifyIframeApiReady?: (api: API) => void; dudaSpotifyApi?: API } }
export const SpotifyMiniPlayer = forwardRef<{ play: () => void }>(function SpotifyMiniPlayer(_, ref) {
  const host = useRef<HTMLDivElement>(null); const controller = useRef<Controller | null>(null);
  const [playing, setPlaying] = useState(false); const [ready, setReady] = useState(false);
  const play = () => { setReady(true); try { controller.current?.play(); } catch { /* Browser policy fallback remains visible. */ } };
  useImperativeHandle(ref, () => ({ play }));
  useEffect(() => {
    let disposed = false;
    const setup = (api: API) => { window.dudaSpotifyApi = api; if (disposed || !host.current) return;
      const element = document.createElement('div'); host.current.replaceChildren(element);
      api.createController(element, { uri: 'spotify:track:4unZtWTDie1lVCWbPsr1DX', width: '1', height: 1 }, c => { if (disposed) { c.destroy(); return; } controller.current = c; setReady(true); c.addListener('playback_update', e => setPlaying(!e.data.isPaused)); });
    };
    if (window.dudaSpotifyApi) setup(window.dudaSpotifyApi); else { window.onSpotifyIframeApiReady = setup; if (!document.getElementById('spotify-api')) { const script = document.createElement('script'); script.id = 'spotify-api'; script.src = 'https://open.spotify.com/embed/iframe-api/v1'; script.async = true; document.head.append(script); } }
    return () => { disposed = true; controller.current?.destroy(); controller.current = null; };
  }, []);
  return <aside className="mini-player" aria-label="Música oficial"><div ref={host} className="spotify-host" aria-hidden="true" /><span className="music-title">♫ Ayo Technology <small>50 Cent feat. Justin Timberlake</small></span><button type="button" onClick={() => { if (playing) controller.current?.pause(); else play(); }} aria-label={playing ? 'Pausar música' : 'Tocar música'}>{playing ? 'Ⅱ' : '▶'} <span>{playing ? 'Pausar' : ready ? 'Tocar música' : 'Música'}</span></button><a href="https://open.spotify.com/track/4unZtWTDie1lVCWbPsr1DX" target="_blank" rel="noreferrer" aria-label="Abrir Ayo Technology no Spotify">↗</a></aside>;
});
