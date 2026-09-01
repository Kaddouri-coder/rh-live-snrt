// Détecte si deux plages horaires se chevauchent.
// Utilisé pour la détection de conflits d'affectation (une ressource ne peut
// pas être sur deux tournages en même temps).
export function hasTimeOverlap(
  start1: Date | string,
  end1: Date | string,
  start2: Date | string,
  end2: Date | string
): boolean {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);
  return s1 < e2 && e1 > s2;
}