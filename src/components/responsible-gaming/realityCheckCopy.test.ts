import { describe, expect, it } from 'vitest'
import { formatSessionDuration } from './realityCheckCopy'

describe('formatSessionDuration', () => {
    it('formats sub-hour sessions in minutes', () => {
        expect(formatSessionDuration(0)).toBe('less than a minute')
        expect(formatSessionDuration(59_000)).toBe('less than a minute')
        expect(formatSessionDuration(60_000)).toBe('1 minute')
        expect(formatSessionDuration(25 * 60_000)).toBe('25 minutes')
    })

    it('formats hour+ sessions as hours and minutes', () => {
        expect(formatSessionDuration(60 * 60_000)).toBe('1 hour')
        expect(formatSessionDuration(72 * 60_000)).toBe('1 hour 12 minutes')
        expect(formatSessionDuration(2 * 60 * 60_000 + 60_000)).toBe('2 hours 1 minute')
    })
})
