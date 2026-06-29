/**
 * Money — financial value object.
 *
 * STANDARDS/04 §2: never use float/double for money. We store amounts as integer
 * minor units scaled by 10^scale to avoid IEEE-754 rounding errors, and round
 * half-up (banker-free, matches Oracle ROUND default) on construction.
 *
 * The YSPOS23 data uses NUMBER with up to ~12 fractional digits in tax math, but
 * stored bill totals are plain currency. We keep a configurable scale (default 4)
 * which is enough headroom for intermediate VAT/discount math while staying exact.
 */
export class Money {
  /** integer amount in minor units (value * 10^scale) */
  private readonly minor: bigint;

  private constructor(
    minor: bigint,
    readonly scale: number,
  ) {
    this.minor = minor;
  }

  static readonly DEFAULT_SCALE = 4;

  /** Build from a decimal number (rounds half-up to scale). */
  static of(value: number, scale: number = Money.DEFAULT_SCALE): Money {
    if (!Number.isFinite(value)) {
      throw new Error(`Money.of: non-finite value ${value}`);
    }
    const factor = 10 ** scale;
    // round half away from zero to mirror Oracle ROUND()
    const scaled = Math.sign(value) * Math.round(Math.abs(value) * factor);
    return new Money(BigInt(scaled), scale);
  }

  /** Build from raw minor units. */
  static fromMinor(minor: bigint, scale: number = Money.DEFAULT_SCALE): Money {
    return new Money(minor, scale);
  }

  static zero(scale: number = Money.DEFAULT_SCALE): Money {
    return new Money(0n, scale);
  }

  private assertSameScale(other: Money): void {
    if (other.scale !== this.scale) {
      throw new Error(`Money scale mismatch: ${this.scale} vs ${other.scale}`);
    }
  }

  add(other: Money): Money {
    this.assertSameScale(other);
    return new Money(this.minor + other.minor, this.scale);
  }

  subtract(other: Money): Money {
    this.assertSameScale(other);
    return new Money(this.minor - other.minor, this.scale);
  }

  /** Multiply by a plain (possibly fractional) quantity, rounding half-up. */
  multiply(qty: number): Money {
    if (!Number.isFinite(qty)) {
      throw new Error(`Money.multiply: non-finite qty ${qty}`);
    }
    const factor = 10 ** this.scale;
    const product = Number(this.minor) * qty;
    const rounded = Math.sign(product) * Math.round(Math.abs(product));
    // product is already in minor units (minor * qty); just round to integer minor
    void factor;
    return new Money(BigInt(rounded), this.scale);
  }

  /** Multiply by a percentage (e.g. 15 => 15%), rounding half-up. */
  percentage(percent: number): Money {
    const product = (Number(this.minor) * percent) / 100;
    const rounded = Math.sign(product) * Math.round(Math.abs(product));
    return new Money(BigInt(rounded), this.scale);
  }

  isZero(): boolean {
    return this.minor === 0n;
  }

  isNegative(): boolean {
    return this.minor < 0n;
  }

  equals(other: Money): boolean {
    return this.scale === other.scale && this.minor === other.minor;
  }

  /** Difference in minor units (this - other); useful for tolerance checks. */
  diffMinor(other: Money): bigint {
    this.assertSameScale(other);
    const d = this.minor - other.minor;
    return d < 0n ? -d : d;
  }

  /** Numeric decimal value (for serialization / comparison). */
  toNumber(): number {
    return Number(this.minor) / 10 ** this.scale;
  }

  toString(): string {
    return this.toNumber().toFixed(this.scale);
  }

  toJSON(): number {
    return this.toNumber();
  }
}
