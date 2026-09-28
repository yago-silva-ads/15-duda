/**
 * Utilitários para Adicionar o Compromisso na Agenda
 * Compatível com Google Calendar, Apple Calendar (iPhone/Mac) e Outlook
 */

import { INVITATION_DATA } from '../data/invitationData';

export function getGoogleCalendarUrl(): string {
  const title = encodeURIComponent("XV da Duda - Festa de 15 Anos");
  const details = encodeURIComponent(
    "Festa de 15 Anos da Duda! 🎉\n\n" +
    "Dress Code: Anos 2000's (Y2K)\n" +
    "Atenção: Proibido roupas vermelhas e estampa de oncinha (cores da aniversariante).\n" +
    "Adolescentes e crianças, tragam roupa de banho para a piscina!\n\n" +
    "Local: " + INVITATION_DATA.location.name + " - " + INVITATION_DATA.location.address
  );
  const location = encodeURIComponent(
    `${INVITATION_DATA.location.name}, ${INVITATION_DATA.location.address}, ${INVITATION_DATA.location.city}`
  );

  // 12 de Dezembro de 2026, das 13:00 às 21:00 (Horário de Brasília: UTC-3 -> 16:00Z às 00:00Z do dia seguinte)
  const startDate = "20261212T160000Z";
  const endDate = "20261213T000000Z";

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
}

export function downloadIcsCalendarFile(): void {
  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//XV da Duda//Convite Interativo//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:xv-duda-20261212@studio",
    "DTSTAMP:20260928T120000Z",
    "DTSTART:20261212T160000Z",
    "DTEND:20261213T000000Z",
    "SUMMARY:XV da Duda - Festa de 15 Anos",
    "DESCRIPTION:Festa de 15 Anos da Duda!\\nDress Code: Anos 2000's (Y2K).\\nProibido vermelho e oncinha.\\nTragam roupas de banho!",
    `LOCATION:${INVITATION_DATA.location.name}\\, ${INVITATION_DATA.location.address}\\, ${INVITATION_DATA.location.city}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Lembrete: XV da Duda é amanhã!",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "XV_da_Duda.ics");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getOutlookCalendarUrl(): string {
  const title = encodeURIComponent("XV da Duda - Festa de 15 Anos");
  const details = encodeURIComponent(
    "Festa de 15 Anos da Duda! Dress Code: Anos 2000's. Local: " + INVITATION_DATA.location.name
  );
  const location = encodeURIComponent(INVITATION_DATA.location.address);
  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${details}&location=${location}&startdt=2026-12-12T13:00:00-03:00&enddt=2026-12-12T21:00:00-03:00`;
}
