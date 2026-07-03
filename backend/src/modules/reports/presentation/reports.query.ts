import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export class DateRangeQuery {
  @IsOptional()
  @Matches(DATE, { message: 'from must be YYYY-MM-DD' })
  from?: string;

  @IsOptional()
  @Matches(DATE, { message: 'to must be YYYY-MM-DD' })
  to?: string;
}

export class ByItemQuery extends DateRangeQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 20;
}

/** MOTECH_POS report filter: date range + optional shift. */
export class PosReportQuery extends DateRangeQuery {
  @IsOptional()
  @IsString()
  shift?: string;
}

/** Top-customers query: date range + result cap. */
export class TopCustomersQuery extends DateRangeQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 20;
}

/** Z-report query: date range + optional cashier machine. */
export class ZReportQuery extends DateRangeQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  machine?: number;
}

/** Slow-moving query: date range + result cap + max-qty threshold. */
export class SlowMovingQuery extends DateRangeQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 50;

  /** Items with SUM(qty) <= maxQty in the period count as slow-moving. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000000)
  maxQty?: number = 5;
}

/** Profit query: date range + result cap. */
export class ProfitQuery extends DateRangeQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 50;
}

/** Comparison query: two REQUIRED period ranges (A vs B). */
export class ComparisonQuery {
  @Matches(DATE, { message: 'fromA must be YYYY-MM-DD' })
  fromA!: string;

  @Matches(DATE, { message: 'toA must be YYYY-MM-DD' })
  toA!: string;

  @Matches(DATE, { message: 'fromB must be YYYY-MM-DD' })
  fromB!: string;

  @Matches(DATE, { message: 'toB must be YYYY-MM-DD' })
  toB!: string;
}

/** Item-movement query: REQUIRED item code + date range + row cap. */
export class ItemMovementQuery extends DateRangeQuery {
  @IsString()
  @IsNotEmpty()
  item!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 200;
}

/** Audit-trail query: date range (on AUD_DATE) + row cap. */
export class AuditQuery extends DateRangeQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 100;
}
