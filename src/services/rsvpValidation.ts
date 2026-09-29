export interface Child { name: string; age: number }
export function normalizePhone(value: string) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.startsWith('55') && digits.length >= 12 ? digits.slice(2) : digits;
}
export function validateRsvp(value: any) {
  const age = value?.age;
  const phone = normalizePhone(value?.phone);
  if (typeof value?.name !== 'string' || value.name.trim().split(/\s+/).length < 2 || value.name.length > 120) throw Error('Digite seu nome completo.');
  if (!Number.isInteger(age) || age < 0 || age > 120) throw Error('Idade inválida.');
  if (!/^\d{10,11}$/.test(phone)) throw Error('Digite um WhatsApp válido com DDD.');
  if (!['confirmed', 'declined'].includes(value.status)) throw Error('Resposta inválida.');
  const attending = value.status === 'confirmed';
  const children: Child[] = attending ? value.children : [];
  if (!Array.isArray(children) || children.length > 10 || children.some(c => !c || typeof c.name !== 'string' || !c.name.trim() || c.name.length > 120 || !Number.isInteger(c.age) || c.age < 0 || c.age > 17)) throw Error('Informe nome e idade de 0 a 17 anos para cada criança.');
  return { name: value.name.trim(), age, phone, status: value.status as 'confirmed' | 'declined',
    adults: attending ? 1 : 0, kids: children.length, children: children.map(c => ({ name: c.name.trim(), age: c.age })), totalPeople: attending ? 1 + children.length : 0,
    bringingSwimwear: attending && (age < 18 || children.length > 0) && value.bringingSwimwear === true,
    message: String(value.message || '').trim().slice(0, 400) };
}
