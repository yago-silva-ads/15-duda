export interface RsvpEntry {
  id: string;
  name: string;
  phone: string;
  status: 'confirmed' | 'declined';
  adults: number;
  kids: number;
  bringingSwimwear: boolean;
  message: string;
  createdAt: string;
}

const STORAGE_KEY = 'duda_rsvps_offline_cache';
const WEBHOOK_URL = String(import.meta.env.VITE_RSVP_WEBHOOK_URL || '').trim();

function digits(value: string) {
  return String(value || '').replace(/\D/g, '');
}

function upsertLocal(entry: RsvpEntry) {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    const list: RsvpEntry[] = cached ? JSON.parse(cached) : [];
    const phone = digits(entry.phone);
    const index = list.findIndex((item) => digits(item.phone) === phone);
    if (index >= 0) list[index] = entry;
    else list.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Cache local é apenas apoio visual.
  }
}

async function postToSheets(entry: Omit<RsvpEntry, 'id' | 'createdAt'>) {
  if (!WEBHOOK_URL) throw new Error('RSVP ainda não foi conectado à planilha.');

  // text/plain evita preflight CORS no Apps Script.
  // mode no-cors impede leitura da resposta, então a planilha valida/upserta do lado servidor.
  await fetch(WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ ...entry, event: 'XV da Duda' }),
  });
}

export async function fetchRsvps(): Promise<RsvpEntry[]> {
  // Mantido para compatibilidade com partes antigas do projeto.
  // O fluxo público novo não expõe a lista de convidados.
  if (import.meta.env.DEV) {
    try {
      const res = await fetch('/api/rsvps');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data));
          return data.data;
        }
      }
    } catch {
      // usa cache abaixo
    }
  }

  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

export async function submitRsvp(entry: Omit<RsvpEntry, 'id' | 'createdAt'>): Promise<{ success: boolean; data?: RsvpEntry; error?: string }> {
  const now = new Date().toISOString();
  const localEntry: RsvpEntry = {
    ...entry,
    id: `rsvp-${digits(entry.phone) || Date.now()}`,
    createdAt: now,
  };

  // Produção: nunca finge que salvou. Google Sheets é a fonte oficial.
  if (!import.meta.env.DEV) {
    if (!WEBHOOK_URL) {
      return {
        success: false,
        error: 'A confirmação está em configuração. Tente novamente em alguns minutos.',
      };
    }

    try {
      await postToSheets(entry);
      upsertLocal(localEntry);
      return { success: true, data: localEntry };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Não foi possível enviar sua resposta.' };
    }
  }

  // Desenvolvimento local: tenta webhook, depois servidor Express original e por fim cache.
  if (WEBHOOK_URL) {
    try {
      await postToSheets(entry);
      upsertLocal(localEntry);
      return { success: true, data: localEntry };
    } catch {
      // tenta API local abaixo
    }
  }

  try {
    const res = await fetch('/api/rsvps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        upsertLocal(result.data || localEntry);
        return result;
      }
    }
  } catch {
    // fallback local abaixo
  }

  upsertLocal(localEntry);
  return { success: true, data: localEntry };
}

export async function deleteRsvp(id: string): Promise<boolean> {
  if (!import.meta.env.DEV) return false;
  try {
    const res = await fetch(`/api/rsvps/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getSettings(): Promise<{ googleSheetsWebhookUrl: string }> {
  return { googleSheetsWebhookUrl: WEBHOOK_URL };
}

export async function saveSettings(
  _settings?: { googleSheetsWebhookUrl: string }
): Promise<boolean> {
  // Em produção, o webhook é definido por VITE_RSVP_WEBHOOK_URL.
  // Esta assinatura é mantida para compatibilidade com a tela administrativa legada.
  return Boolean(WEBHOOK_URL);
}
