import { describe, it, expect } from 'vitest';
import { isValidEmail, isStrongPassword } from './validation';

describe('isValidEmail', () => {
  it('accepte un email valide', () => {
    expect(isValidEmail('sara.consultant@snrt.ma')).toBe(true);
  });

  it("refuse un email sans '@'", () => {
    expect(isValidEmail('sara.consultant.snrt.ma')).toBe(false);
  });

  it('refuse un email sans nom de domaine (pas de point)', () => {
    expect(isValidEmail('sara@snrt')).toBe(false);
  });

  it('refuse une chaîne vide', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('refuse un email avec des espaces', () => {
    expect(isValidEmail('sara consultant@snrt.ma')).toBe(false);
  });
});

describe('isStrongPassword', () => {
  it('accepte un mot de passe fort (8+, majuscule, minuscule, chiffre, spécial)', () => {
    expect(isStrongPassword('Admin@2026')).toBe(true);
  });

  it('refuse un mot de passe trop court', () => {
    expect(isStrongPassword('Ab1@')).toBe(false);
  });

  it('refuse un mot de passe sans majuscule', () => {
    expect(isStrongPassword('admin@2026')).toBe(false);
  });

  it('refuse un mot de passe sans caractère spécial', () => {
    expect(isStrongPassword('Admin2026')).toBe(false);
  });

  it('refuse un mot de passe sans chiffre', () => {
    expect(isStrongPassword('Admin@Live')).toBe(false);
  });
});