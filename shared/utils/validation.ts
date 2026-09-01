// Règles de validation partagées entre le frontend (retour immédiat à
// l'utilisateur) et le backend (rejet garanti même si le frontend est
// contourné).

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial.
export function isStrongPassword(value: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);
}