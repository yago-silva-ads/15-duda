import { useState } from 'react';
import { INVITATION_DATA } from '../data/invitationData';
import { Dialog } from './Dialog';
export function LocationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notice, setNotice] = useState('');
  const location = INVITATION_DATA.location;
  if (!isOpen) return null;
  return <Dialog title="Como chegar" onClose={onClose}>
    <h3>{location.name}</h3><p>{location.address}</p><p>{location.city}</p>
    <button onClick={async () => { try { await navigator.clipboard.writeText(`${location.name}, ${location.address}, ${location.city}`); setNotice('Endereço copiado!'); } catch { setNotice('Selecione o endereço acima para copiar.'); } }}>Copiar endereço</button>
    <div className="actions"><a href={location.mapsUrl} target="_blank" rel="noreferrer">Google Maps</a><a href={location.wazeUrl} target="_blank" rel="noreferrer">Waze</a></div>
    <p role="status">{notice}</p>
  </Dialog>;
}
