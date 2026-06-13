export type Period = 'week' | 'month' | 'year' | 'all';

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function rollingDays(start: Date, count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return toISODate(d);
  });
}

export function formatPolishDate(iso: string): string {
  const fmt = new Intl.DateTimeFormat('pl-PL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const s = fmt.format(parseISO(iso));
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Polish quantity plural: returns 'one' | 'few' | 'many'
function plForm(n: number): 'one' | 'few' | 'many' {
  if (n === 1) return 'one';
  const last = n % 10;
  const lastTwo = n % 100;
  if (last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)) return 'few';
  return 'many';
}

export function spotsLabel(free: number): string {
  if (free === 0) return 'Full';
  const word = { one: 'miejsce', few: 'miejsca', many: 'miejsc' }[plForm(free)];
  return `${free} ${word}`;
}

export function reservationsLabel(n: number): string {
  const word = { one: 'rezerwacja', few: 'rezerwacje', many: 'rezerwacji' }[plForm(n)];
  return `${n} ${word}`;
}

// Monday-based ISO week key, e.g. "2026-W25"
function isoWeekKey(d: Date): string {
  const date = new Date(d);
  date.setHours(0, 0, 0, 0);
  // Thursday of the current week decides the year.
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  const week =
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7,
    );
  return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function isInPeriod(iso: string, period: Period, today: Date): boolean {
  if (period === 'all') return true;
  const d = parseISO(iso);
  if (period === 'year') return d.getFullYear() === today.getFullYear();
  if (period === 'month') {
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth()
    );
  }
  // week
  return isoWeekKey(d) === isoWeekKey(today);
}
