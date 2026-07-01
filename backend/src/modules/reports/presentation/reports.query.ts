import { Type } from 'class-transformer';
import { IsInt, IsOptional, Matches, Max, Min } from 'class-validator';

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
