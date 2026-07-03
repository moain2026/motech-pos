import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { isUuid } from '../../../shared/domain/uuid';
import { IdempotencyKeyRequiredError } from '../../../shared/errors/domain-error';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { CreditCollectionsService } from '../application/credit-collections.service';
import { CustomersService } from '../application/customers.service';
import { CollectDto } from './collect.dto';
import { CreditBillsQuery, CustomerSearchQuery, PointsQuery } from './customers.query';
import { CreateCustomerDto, UpdateCustomerDto } from './upsert-customer.dto';

/**
 * CustomersController — READ-side lookups over the IAS202623 ERP master
 * customer tables (Arabic names + loyalty points). All routes are
 * JWT-protected; errors surface as RFC 9457 ProblemDetails via the global
 * exception filter. Envelope shape { data, meta } mirrors reports/bills.
 */
@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly customers: CustomersService,
    private readonly collections: CreditCollectionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Search customers by Arabic/English name, code or mobile' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async search(@Query() q: CustomerSearchQuery) {
    const data = await this.customers.search({
      search: q.search,
      limit: q.limit ?? 50,
    });
    return { data, meta: { count: data.length } };
  }

  @Post()
  @HttpCode(201)
  @UseGuards(RolesGuard)
  @Roles('supervisor', 'admin')
  @ApiOperation({
    summary: 'Create a LOCAL customer (MOTECH_POS overlay; POSI010)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async create(@Body() body: CreateCustomerDto) {
    const data = await this.customers.create(body);
    return { data, meta: { origin: data.origin } };
  }

  @Put(':code')
  @UseGuards(RolesGuard)
  @Roles('supervisor', 'admin')
  @ApiOperation({
    summary: 'Edit a customer (local overlay of ERP fields; POSI010)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async update(@Param('code') code: string, @Body() body: UpdateCustomerDto) {
    const data = await this.customers.update(code, body);
    return { data, meta: { origin: data.origin } };
  }

  @Get(':code')
  @ApiOperation({ summary: 'Single customer by C_CODE (ERP + overlay merged)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async byCode(@Param('code') code: string) {
    const data = await this.customers.findByCode(code);
    return { data, meta: { origin: data.origin } };
  }

  @Get(':code/points')
  @ApiOperation({ summary: 'Loyalty-points balance + movements (IAS_POINT_CALC_TRNS)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async points(@Param('code') code: string, @Query() q: PointsQuery) {
    const { balance, txns, earned } = await this.customers.points(
      code,
      q.limit ?? 100,
    );
    return { data: { balance, txns, earned }, meta: { count: txns.length } };
  }

  @Get(':code/credit-bills')
  @ApiOperation({
    summary:
      "Customer's credit (آجل) bills + outstanding debtor balance (POST010/011)",
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async creditBills(
    @Param('code') code: string,
    @Query() q: CreditBillsQuery,
  ) {
    const data = await this.collections.creditBills(
      code,
      q.status !== 'all',
    );
    return { data, meta: { count: data.bills.length } };
  }

  @Post(':code/collect')
  @HttpCode(201)
  @UseGuards(RolesGuard)
  @Roles('cashier', 'supervisor', 'admin')
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'uuid — mandatory; replays return the same receipt (no dup)',
    required: true,
  })
  @ApiOperation({
    summary: 'Record a collection receipt against a credit bill (POST010/011)',
  })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async collect(
    @Param('code') code: string,
    @Body() body: CollectDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    if (!idempotencyKey || !isUuid(idempotencyKey)) {
      throw new IdempotencyKeyRequiredError(
        'A valid uuid Idempotency-Key header is required to collect',
        {},
      );
    }
    const result = await this.collections.collect({
      customerCode: code,
      billId: body.billId,
      method: body.method,
      amount: body.amount,
      currency: body.currency,
      rate: body.rate,
      cashierNo: body.cashierNo,
      note: body.note,
      idempotencyKey,
    });
    return {
      data: { collection: result.collection, bill: result.bill },
      meta: { replayed: result.replayed },
    };
  }
}
