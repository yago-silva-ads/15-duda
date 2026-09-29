export interface RsvpEntry {
  id: string;
  name: string;
  phone: string;
  age: number;
  children: { name: string; age: number }[];
  totalPeople: number;
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
  try {
    const response = await fetch('/api/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry), signal: AbortSignal.timeout(25000) });
    const result = await response.json();
    if (!response.ok || result.success !== true) return { success: false, error: result.error || 'Não foi possível registrar sua resposta.' };
    upsertLocal(result.data);
    return result;
  } catch { return { success: false, error: 'Não foi possível confirmar o registro. Tente novamente com o mesmo WhatsApp.' }; }
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
