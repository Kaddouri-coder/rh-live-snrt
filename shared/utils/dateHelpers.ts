// Petits helpers de date/heure (heure locale, jamais UTC — voir les bugs de
// fuseau horaire corrigés dans ce projet) utilisés par le calendrier et les
// filtres de recherche par défaut.

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

// "YYYY-MM-DD" pour la date du jour (heure locale).
export function getTodayStr(baseDate: Date = new Date()): string {
  return `${baseDate.getFullYear()}-${pad(baseDate.getMonth() + 1)}-${pad(baseDate.getDate())}`;
}

// "YYYY-MM-DD" pour "aujourd'hui + N jours" (heure locale).
export function getDateStrPlusDays(days: number, baseDate: Date = new Date()): string {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + days);
  return getTodayStr(d);
}

// "YYYY-MM-DDTHH:mm" pour un <input type="datetime-local">, avec heure/minute
// éventuellement forcées (ex: 9h00 par défaut pour un filtre de recherche).
export function getNowDateTimeStr(
  hourOverride?: number,
  minuteOverride?: number,
  baseDate: Date = new Date()
): string {
  const hour = pad(hourOverride ?? baseDate.getHours());
  const minute = pad(minuteOverride ?? baseDate.getMinutes());
  return `${getTodayStr(baseDate)}T${hour}:${minute}`;
}