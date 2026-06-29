import { describe, expect, it } from 'vitest';
import { Money } from '../../src/shared/domain/money';

describe('Money', () => {
  it('adds without float error (0.1 + 0.2 === 0.3)', () => {
    const sum = Money.of(0.1).add(Money.of(0.2));
    expect(sum.toNumber()).toBe(0.3);
  });

  it('multiplies by quantity', () => {
    expect(Money.of(50).multiply(3).toNumber()).toBe(150);
  });

  it('computes percentage (15% of 200 = 30)', () => {
    expect(Money.of(200).percentage(15).toNumber()).toBe(30);
  });

  it('subtracts correctly', () => {
    expect(Money.of(100).subtract(Money.of(35.5)).toNumber()).toBe(64.5);
  });

  it('rounds half away from zero on construction', () => {
    expect(Money.of(1.00005).toNumber()).toBe(1.0001);
  });

  it('reports zero / diff in minor units', () => {
    expect(Money.zero().isZero()).toBe(true);
    expect(Money.of(10).diffMinor(Money.of(10.0001))).toBe(1n);
  });
});
