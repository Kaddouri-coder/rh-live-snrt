import { describe, it, expect } from 'vitest';
import { hasTimeOverlap } from './dateOverlap';

describe('hasTimeOverlap', () => {
  it('détecte un chevauchement partiel (fin de A pendant B)', () => {
    expect(hasTimeOverlap('2026-08-10T09:00', '2026-08-10T11:00', '2026-08-10T10:00', '2026-08-10T12:00')).toBe(true);
  });

  it('détecte quand une plage est entièrement contenue dans une autre', () => {
    expect(hasTimeOverlap('2026-08-10T08:00', '2026-08-10T18:00', '2026-08-10T10:00', '2026-08-10T11:00')).toBe(true);
  });

  it("ne détecte pas de conflit quand les plages sont consécutives (l'une finit pile quand l'autre commence)", () => {
    expect(hasTimeOverlap('2026-08-10T09:00', '2026-08-10T12:00', '2026-08-10T12:00', '2026-08-10T15:00')).toBe(false);
  });

  it('ne détecte pas de conflit pour des plages complètement séparées', () => {
    expect(hasTimeOverlap('2026-08-10T09:00', '2026-08-10T10:00', '2026-08-10T14:00', '2026-08-10T15:00')).toBe(false);
  });

  it('fonctionne peu importe l\'ordre des deux plages passées en paramètre', () => {
    const a = hasTimeOverlap('2026-08-10T09:00', '2026-08-10T11:00', '2026-08-10T10:00', '2026-08-10T12:00');
    const b = hasTimeOverlap('2026-08-10T10:00', '2026-08-10T12:00', '2026-08-10T09:00', '2026-08-10T11:00');
    expect(a).toBe(b);
  });
});