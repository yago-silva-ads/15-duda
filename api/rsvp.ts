import { validateRsvp } from '../src/services/rsvpValidation.js';

// Same-origin endpoint lets the browser verify Google's response instead of assuming an opaque POST succeeded.
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Método não permitido.' });
  let entry: ReturnType<typeof validateRsvp>;
  try { entry = validateRsvp(typeof req.body === 'string' ? JSON.parse(req.body) : req.body); }
  catch (error) { return res.status(400).json({ success: false, error: (error as Error).message }); }
  const webhook = process.env.VITE_RSVP_WEBHOOK_URL?.trim();
  if (!webhook) return res.status(503).json({ success: false, error: 'A confirmação está em configuração. Tente novamente em alguns minutos.' });
  try {
    // Keep full details in the legacy observation column too, until the expanded Apps Script is deployed.
    const details = `Idade: ${entry.age}. Crianças: ${entry.kids}. ${entry.children.map(c => `${c.name} (${c.age} anos)`).join('; ')}. Recado: ${entry.message}`;
    if (details.length > 500) return res.status(400).json({ success: false, error: 'Os nomes e o recado juntos ficaram muito longos. Abrevie os nomes das crianças ou reduza o recado para enviar todos os dados.' });
    const response = await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...entry, message: details, observation: entry.message, event: 'XV da Duda' }), signal: AbortSignal.timeout(20000) });
    const result = await response.json();
    if (!response.ok || result.ok !== true) throw Error('Google Sheets did not acknowledge the response');
    return res.status(200).json({ success: true, data: { ...entry, id: `rsvp-${entry.phone}`, createdAt: new Date().toISOString() } });
  } catch {
    return res.status(502).json({ success: false, error: 'Não foi possível confirmar o registro na planilha. Tente novamente com o mesmo WhatsApp.' });
  }
}
