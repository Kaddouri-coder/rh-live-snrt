import { describe, it, expect } from 'vitest';
import { getTodayStr, getDateStrPlusDays, getNowDateTimeStr } from './dateHelpers';

describe('getTodayStr', () => {
  it('formate une date donnée en YYYY-MM-DD', () => {
    const d = new Date(2026, 7, 19);
    expect(getTodayStr(d)).toBe('2026-08-19');
  });

  it('ajoute un zéro devant les mois/jours à un seul chiffre', () => {
    const d = new Date(2026, 0, 5);
    expect(getTodayStr(d)).toBe('2026-01-05');
  });
});

describe('getDateStrPlusDays', () => {
  it('ajoute correctement des jours à une date de référence', () => {
    const d = new Date(2026, 7, 19);
    expect(getDateStrPlusDays(13, d)).toBe('2026-09-01');
  });

  it("gère le passage au mois suivant", () => {
    const d = new Date(2026, 0, 30);
    expect(getDateStrPlusDays(3, d)).toBe('2026-02-02');
  });
});

describe('getNowDateTimeStr', () => {
  it('utilise les heures/minutes forcées quand elles sont fournies', () => {
    const d = new Date(2026, 7, 19, 15, 45);
    expect(getNowDateTimeStr(9, 0, d)).toBe('2026-08-19T09:00');
  });

  it("utilise l'heure actuelle de la date de référence si rien n'est forcé", () => {
    const d = new Date(2026, 7, 19, 15, 45);
    expect(getNowDateTimeStr(undefined, undefined, d)).toBe('2026-08-19T15:45');
  });
});