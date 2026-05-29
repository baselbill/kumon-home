import { describe, it, expect, beforeEach } from 'vitest'
import { getParentPin, setParentPin, clearParentPin, verifyPin } from '../parentPin'

beforeEach(() => localStorage.clear())

describe('getParentPin()', () => {
  it('returns null when nothing is set', () => {
    expect(getParentPin()).toBeNull()
  })

  it('returns stored PIN after setParentPin', () => {
    setParentPin('1234')
    expect(getParentPin()).toBe('1234')
  })
})

describe('setParentPin()', () => {
  it('stores a valid 4-digit PIN', () => {
    setParentPin('5678')
    expect(getParentPin()).toBe('5678')
  })

  it('throws for PIN shorter than 4 digits', () => {
    expect(() => setParentPin('123')).toThrow()
  })

  it('throws for PIN longer than 4 digits', () => {
    expect(() => setParentPin('12345')).toThrow()
  })

  it('throws for non-digit characters', () => {
    expect(() => setParentPin('12ab')).toThrow()
  })
})

describe('clearParentPin()', () => {
  it('removes stored PIN', () => {
    setParentPin('9999')
    clearParentPin()
    expect(getParentPin()).toBeNull()
  })
})

describe('verifyPin()', () => {
  it('returns true for matching PIN', () => {
    setParentPin('4321')
    expect(verifyPin('4321')).toBe(true)
  })

  it('returns false for wrong PIN', () => {
    setParentPin('4321')
    expect(verifyPin('1234')).toBe(false)
  })

  it('returns false when no PIN is set', () => {
    expect(verifyPin('0000')).toBe(false)
  })
})
