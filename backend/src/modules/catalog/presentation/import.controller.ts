import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedRequest } from '../../auth/presentation/jwt-auth.guard';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { RolesGuard } from '../../auth/presentation/roles.guard';
import { Roles } from '../../auth/presentation/roles.decorator';
import { ImportService } from '../application/import.service';
import { ImportKind } from '../domain/ports/import.port';

/** Uploaded file shape (Express.Multer.File without the @types dependency). */
interface UploadedSpreadsheet {
  originalname: string;
  buffer: Buffer;
  size: number;
  mimetype: string;
}

const KINDS: ImportKind[] = ['ITEMS', 'PRICES', 'BALANCES'];
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * ImportController — POS_IMPXLS Excel/CSV import (items / prices / opening
 * balances). Upload is multipart/form-data; `dryRun=true` previews without
 * writing. Reads/writes require the ITEMS permission (supervisor/admin).
 */
@ApiTags('catalog-import')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('supervisor', 'admin')
@Controller('items/import')
export class ImportController {
  constructor(private readonly svc: ImportService) {}

  @Post(':kind')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_BYTES } }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Import a spreadsheet (kind = items|prices|balances). dryRun=true previews (no write); otherwise commits valid rows and records an audit batch. — supervisor/admin',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        dryRun: { type: 'boolean' },
      },
    },
  })
  @ApiOkResponse({ description: 'Envelope { data, meta } with preview/result' })
  async importFile(
    @Param('kind') kindRaw: string,
    @Query('dryRun') dryRunQuery: string | undefined,
    @Body('dryRun') dryRunBody: string | undefined,
    @UploadedFile() file: UploadedSpreadsheet | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    const kind = kindRaw.toUpperCase() as ImportKind;
    if (!KINDS.includes(kind)) {
      throw new BadRequestException(
        `Unknown import kind '${kindRaw}' (expected items|prices|balances)`,
      );
    }
    if (!file || !file.buffer || file.size === 0) {
      throw new BadRequestException('A file is required (field name: file)');
    }
    const dryRunRaw = dryRunQuery ?? dryRunBody;
    // Default to a safe dry-run unless the caller explicitly commits.
    const commit = dryRunRaw === 'false' || dryRunRaw === '0';
    const createdBy = req.user?.sub ?? null;

    const result = await this.svc.run(
      kind,
      file.buffer,
      file.originalname ?? 'upload',
      commit,
      createdBy,
    );
    return {
      data: result,
      meta: {
        committed: result.committed,
        okRows: result.okRows,
        errorRows: result.errorRows,
        totalRows: result.totalRows,
      },
    };
  }

  @Get('batches')
  @ApiOperation({ summary: 'Recent import batches (audit)' })
  @ApiOkResponse({ description: 'Envelope { data, meta }' })
  async batches(@Query('limit') limit?: string) {
    const n = limit ? Math.min(Math.max(Number(limit) || 20, 1), 100) : 20;
    const data = await this.svc.listBatches(n);
    return { data, meta: { count: data.length } };
  }

  @Get('batches/:id')
  @ApiOperation({ summary: 'One import batch with its full error report' })
  @ApiOkResponse({ description: 'Envelope { data }' })
  async batch(@Param('id') id: string) {
    const data = await this.svc.getBatch(id);
    if (!data) throw new NotFoundException(`Import batch '${id}' not found`);
    return { data };
  }
}
