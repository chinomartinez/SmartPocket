import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (className utility)', () => {
  it('combina clases simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('combina clases condicionales', () => {
    const isActive = true;
    expect(cn('base', isActive && 'active')).toBe('base active');
    expect(cn('base', !isActive && 'active')).toBe('base');
  });

  it('fusiona clases Tailwind conflictivas (tailwind-merge)', () => {
    // tailwind-merge debe resolver conflictos, última clase gana
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('maneja arrays y objetos (clsx)', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
    expect(cn({ foo: true, bar: false })).toBe('foo');
  });

  it('maneja valores falsy', () => {
    expect(cn('foo', null, undefined, false, 'bar')).toBe('foo bar');
  });
});
