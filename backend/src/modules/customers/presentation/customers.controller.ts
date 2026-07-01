import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { CustomersService } from '../application/customers.service';
import { CustomerSearchQuery, PointsQuery } from './customers.query';
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
  constructor(private readonly customers: CustomersService) {}

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
}
