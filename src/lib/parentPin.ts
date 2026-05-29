const PIN_KEY = 'kumon_parent_pin_v1'

export function getParentPin(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(PIN_KEY)
}

export function setParentPin(pin: string): void {
  if (!/^\d{4}$/.test(pin)) throw new Error('PIN must be exactly 4 digits')
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PIN_KEY, pin)
  } catch {
    // storage full or private browsing — silently ignore
  }
}

export function clearParentPin(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(PIN_KEY)
}

export function verifyPin(input: string): boolean {
  const stored = getParentPin()
  if (stored === null) return false
  return stored === input
}
