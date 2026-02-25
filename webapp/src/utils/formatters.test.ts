import { describe, it, expect } from 'vitest';
import { formatCurrency, formatRelativeTime } from './formatters';

describe('formatCurrency', () => {
  it('formatea números positivos con signo +', () => {
    expect(formatCurrency(1000)).toBe('+$1,000.00');
    expect(formatCurrency(50.5)).toBe('+$50.50');
  });

  it('formatea números negativos con signo -', () => {
    expect(formatCurrency(-1000)).toBe('-$1,000.00');
    expect(formatCurrency(-50.5)).toBe('-$50.50');
  });

  it('formatea cero correctamente', () => {
    expect(formatCurrency(0)).toBe('+$0.00');
  });

  it('formatea decimales correctamente', () => {
    expect(formatCurrency(123.456)).toBe('+$123.46'); // Redondeo
    expect(formatCurrency(99.99)).toBe('+$99.99');
  });
});

describe('formatRelativeTime', () => {
  const now = new Date();

  it('muestra "Now" para menos de 1 minuto', () => {
    const recent = new Date(now.getTime() - 30 * 1000); // 30 segundos atrás
    expect(formatRelativeTime(recent)).toBe('Now');
  });

  it('muestra minutos para menos de 1 hora', () => {
    const minutes15 = new Date(now.getTime() - 15 * 60 * 1000);
    expect(formatRelativeTime(minutes15)).toBe('15m ago');
  });

  it('muestra horas para menos de 24 horas', () => {
    const hours5 = new Date(now.getTime() - 5 * 60 * 60 * 1000);
    expect(formatRelativeTime(hours5)).toBe('5h ago');
  });

  it('muestra "Yesterday" para 1 día atrás', () => {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(yesterday)).toBe('Yesterday');
  });

  it('muestra días para menos de 1 semana', () => {
    const days3 = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeTime(days3)).toBe('3d ago');
  });

  it('muestra fecha formateada para más de 1 semana', () => {
    const weekAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
    const formatted = formatRelativeTime(weekAgo);
    // Verificar que contiene formato "Month Day"
    expect(formatted).toMatch(/\w+ \d+/);
  });
});
