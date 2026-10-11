import { useEffect, useState } from 'react';
import { INVITATION_DATA } from '../data/invitationData';
import { Dialog } from './Dialog';
export function LocationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notice, setNotice] = useState('');
  const [poolPhotoAvailable, setPoolPhotoAvailable] = useState(true);
  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState(false);
  const location = INVITATION_DATA.location;
  const closeModal = () => { setIsPhotoLightboxOpen(false); onClose(); };
  useEffect(() => {
    if (!isPhotoLightboxOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setIsPhotoLightboxOpen(false); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPhotoLightboxOpen]);
  if (!isOpen) return null;
  return <Dialog title="Como chegar" onClose={closeModal}>
    <button type="button" className="location-photo-trigger" aria-label="Ampliar fotos do PlanoB Eventos" onClick={() => setIsPhotoLightboxOpen(true)}>
      <span className="location-name">{location.name}</span>
      {poolPhotoAvailable && <img className="location-pool-photo" src="/local/plano-b-espaco.jpg" alt="Área externa do PlanoB Eventos" onError={() => setPoolPhotoAvailable(false)} />}
    </button>
    <p>{location.address}</p><p>{location.city}</p>
    <button onClick={async () => { try { await navigator.clipboard.writeText(`${location.name}, ${location.address}, ${location.city}`); setNotice('Endereço copiado!'); } catch { setNotice('Selecione o endereço acima para copiar.'); } }}>Copiar endereço</button>
    <div className="actions"><a href={location.mapsUrl} target="_blank" rel="noreferrer">Google Maps</a><a href={location.wazeUrl} target="_blank" rel="noreferrer">Waze</a></div>
    <a className="location-photo-link" href={location.mapsUrl} target="_blank" rel="noreferrer">Ver fotos do local</a>
    <p role="status">{notice}</p>
    {isPhotoLightboxOpen && <div className="location-lightbox" role="dialog" aria-modal="true" aria-label="Fotos do PlanoB Eventos" onClick={() => setIsPhotoLightboxOpen(false)}>
      <div className="location-lightbox-content" onClick={event => event.stopPropagation()}>
        <button type="button" className="location-lightbox-close" aria-label="Fechar fotos" onClick={() => setIsPhotoLightboxOpen(false)}>×</button>
        <img src="/local/plano-b-espaco.jpg" alt="Área externa do PlanoB Eventos ampliada" />
        <a href={location.mapsUrl} target="_blank" rel="noreferrer">Ver fotos do local</a>
      </div>
    </div>}
  </Dialog>;
}
