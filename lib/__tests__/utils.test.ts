import { describe, it, expect } from 'vitest'
import { cn } from '../utils'

describe('cn (classnames)', () => {
  it('handles single class string', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('merges multiple class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles multiple arguments', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz')
  })

  it('handles conditional classes (truthy)', () => {
    const condition = true
    expect(cn('foo', condition && 'bar')).toBe('foo bar')
  })

  it('handles conditional classes (falsy)', () => {
    const condition = false
    expect(cn('foo', condition && 'bar')).toBe('foo')
  })

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('handles empty strings', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar')
  })

  it('handles arrays', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('handles objects with truthy values', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz')
  })

  it('resolves Tailwind conflicts (last wins)', () => {
    // px-2 and px-4 are conflicting - should use px-4
    // Note: tailwind-merge keeps order from first argument, so it becomes 'py-1 px-4'
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })

  it('handles complex conditional Tailwind classes', () => {
    const isActive = true
    const isLarge = false
    expect(cn(
      'base-class',
      isActive && 'bg-blue-500',
      isLarge && 'text-xl',
      'text-sm'
    )).toBe('base-class bg-blue-500 text-sm')
  })

  it('handles clsx style input', () => {
    expect(cn('btn', { 'btn-primary': true, 'btn-disabled': false })).toBe('btn btn-primary')
  })
})
