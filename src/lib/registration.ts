// Reglas del registro (paso 1: nombre y usuario).

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const FULLNAME_MIN = 2;

/** Lo que se permite escribir en el usuario: minúsculas, números y guion bajo, hasta el máximo. */
export function normalizeUsernameInput(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, USERNAME_MAX);
}

export function validateFullName(fullName: string): string | null {
  const clean = fullName.trim().replace(/\s+/g, " ");
  if (clean.length < FULLNAME_MIN) return `El nombre tiene que tener al menos ${FULLNAME_MIN} caracteres.`;
  if (clean.length > 60) return "El nombre puede tener hasta 60 caracteres.";
  return null;
}

export function validateUsername(username: string): string | null {
  if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    return `El usuario tiene que tener entre ${USERNAME_MIN} y ${USERNAME_MAX} caracteres.`;
  }
  if (!/^[a-z0-9_]+$/.test(username)) return "Solo letras, números y guion bajo.";
  return null;
}
