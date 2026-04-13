import { describe, expect, it } from 'vitest'
import { COMMAND_BAR_FIST_HINT, COMMAND_BAR_PHOTO_WARNING } from './commandBarStrings'

describe('commandBarStrings', () => {
  it('includes fist UX guidance', () => {
    expect(COMMAND_BAR_FIST_HINT).toContain('fist')
  })

  it('warns about photo uploads', () => {
    expect(COMMAND_BAR_PHOTO_WARNING.toLowerCase()).toContain('photo')
  })
})
