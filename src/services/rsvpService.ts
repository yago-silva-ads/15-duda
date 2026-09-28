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

export async function fetchRsvps(): Promise<RsvpEntry[]> {
  try {
    const res = await fetch('/api/rsvps');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.data));
        return data.data;
      }
    }
  } catch (err) {
    console.warn('API error, falling back to local cache', err);
  }

  // Fallback to local storage
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    //
  }

  return [];
}

export async function submitRsvp(entry: Omit<RsvpEntry, 'id' | 'createdAt'>): Promise<{ success: boolean; data?: RsvpEntry; error?: string }> {
  try {
    const res = await fetch('/api/rsvps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        return result;
      }
    }
  } catch (err) {
    console.warn('Server offline, saving locally', err);
  }

  // Fallback local save
  const newEntry: RsvpEntry = {
    ...entry,
    id: 'local-' + Date.now(),
    createdAt: new Date().toISOString(),
  };

  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    const list: RsvpEntry[] = cached ? JSON.parse(cached) : [];
    list.unshift(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return { success: true, data: newEntry };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteRsvp(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/rsvps/${id}`, { method: 'DELETE' });
    if (res.ok) {
      return true;
    }
  } catch (e) {
    console.warn('Error deleting on server', e);
  }

  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const list: RsvpEntry[] = JSON.parse(cached);
      const updated = list.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return true;
    }
  } catch {
    //
  }
  return false;
}

export async function getSettings(): Promise<{ googleSheetsWebhookUrl: string }> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch {
    //
  }
  return { googleSheetsWebhookUrl: '' };
}

export async function saveSettings(settings: { googleSheetsWebhookUrl: string }): Promise<boolean> {
  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.ok;
  } catch {
    return false;
  }
}
