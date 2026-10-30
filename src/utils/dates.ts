const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function toISO(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

export function parseISO(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return toISO(date) === iso ? date : null;
}

export function formatDate(iso: string): string {
  const date = parseISO(iso);
  return date ? `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}` : iso;
}

export function formatRange(start?: string, end?: string): string {
  if (start && end) return `${formatDate(start)} → ${formatDate(end)}`;
  if (start) return `Desde ${formatDate(start)}`;
  if (end) return `Hasta ${formatDate(end)}`;
  return 'Sin fechas';
}

function daysBetween(from: Date, to: Date): number {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / 86400000);
}

export function countdownLabel(start?: string, end?: string): string | null {
  const startDate = start ? parseISO(start) : null;
  if (!startDate) return null;
  const today = new Date();
  const untilStart = daysBetween(today, startDate);
  if (untilStart > 1) return `Faltan ${untilStart} días`;
  if (untilStart === 1) return 'Mañana';
  const endDate = end ? parseISO(end) : null;
  if (untilStart === 0) return '¡Hoy empieza!';
  if (endDate && daysBetween(today, endDate) >= 0) return 'En curso';
  return 'Finalizado';
}
