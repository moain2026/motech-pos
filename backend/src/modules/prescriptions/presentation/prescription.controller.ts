import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  AuthenticatedRequest,
  JwtAuthGuard,
} from '../../auth/presentation/jwt-auth.guard';
import { PrescriptionService } from '../application/prescription.service';
import {
  CreatePrescriptionDto,
  ListPrescriptionsQuery,
} from './prescription.dto';

/**
 * PrescriptionController — POST023 (الوصفة الطبية, pharmacy). Attaches a
 * medical prescription (doctor, patient, per-item dosage/usage/duration) to
 * an EXISTING sale bill: the bill is validated LIVE against YSPOS23 and every
 * annotated item must be on it; qty + Arabic names are snapshotted
 * server-side. Records land only in MOTECH_POS. JWT-protected; RFC 9457
 * errors via the global filter; envelope { data, meta } as everywhere.
 */
@ApiTags('prescriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly rx: PrescriptionService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary:
      'Create a prescription linked to a sale bill (doctor + patient + item instructions)',
  })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async create(
    @Body() dto: CreatePrescriptionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const data = await this.rx.create({
      billNo: dto.billNo,
      doctorName: dto.doctorName,
      patientName: dto.patientName,
      patientRef: dto.patientRef ?? null,
      rxDate: dto.rxDate ?? null,
      note: dto.note ?? null,
      createdBy: req.user?.username ?? 'unknown',
      lines: dto.lines.map((l) => ({
        itemCode: l.itemCode,
        dosage: l.dosage ?? null,
        usageNotes: l.usageNotes ?? null,
        duration: l.duration ?? null,
      })),
    });
    return { data };
  }

  @Get()
  @ApiOperation({ summary: 'List prescriptions (filter by billNo / patient)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async list(@Query() q: ListPrescriptionsQuery) {
    const data = await this.rx.list({
      billNo: q.billNo,
      patient: q.patient,
      limit: q.limit ?? 50,
    });
    return { data, meta: { count: data.length } };
  }

  @Get('bill/:billNo/items')
  @ApiOperation({
    summary:
      'Items of a live sale bill (pre-fill the annotate screen) — 404 when unknown',
  })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async billItems(@Param('billNo') billNo: string) {
    const data = await this.rx.billItems(billNo);
    return { data };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Prescription detail with annotated lines' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async byId(@Param('id') id: string) {
    const data = await this.rx.byId(id);
    return { data };
  }
}
