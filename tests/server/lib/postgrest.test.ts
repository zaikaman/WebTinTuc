import { describe, it, expect } from 'vitest'
import { ilikeContains, orIlikeContains } from '@/server/lib/postgrest'

describe('ilikeContains', () => {
  it('wraps plain text in a double-quoted contains pattern', () => {
    expect(ilikeContains('hello')).toBe('"%hello%"')
  })

  it('escapes LIKE wildcards % and _', () => {
    expect(ilikeContains('100%_off')).toBe('"%100\\%\\_off%"')
  })

  it('escapes backslashes before wildcards', () => {
    expect(ilikeContains('a\\b%')).toBe('"%a\\\\b\\%%"')
  })

  it('escapes double quotes for PostgREST quoting', () => {
    expect(ilikeContains('say "hi"')).toBe('"%say ""hi""%"')
  })

  it('keeps commas and dots inside quoted value (no filter injection)', () => {
    const pattern = ilikeContains('foo,bar.baz')
    expect(pattern).toBe('"%foo,bar.baz%"')
    // Entire value is one quoted token — commas cannot split .or() clauses
    expect(pattern.startsWith('"')).toBe(true)
    expect(pattern.endsWith('"')).toBe(true)
  })
})

describe('orIlikeContains', () => {
  it('builds comma-separated column.ilike clauses with escaped patterns', () => {
    // Trailing % is the contains wildcard; user % is escaped as \%
    expect(orIlikeContains(['title', 'slug'], 'a,b%')).toBe(
      'title.ilike."%a,b\\%%",slug.ilike."%a,b\\%%"'
    )
  })
})
