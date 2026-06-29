import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { TypedConfigService } from './config/config.module';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(PinoLogger));
  const config = app.get(TypedConfigService);

  const origins = config
    .get('CORS_ORIGINS')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.use(helmet());
  app.enableCors({ origin: origins, credentials: true });

  const prefix = config.get('API_PREFIX');
  app.setGlobalPrefix(prefix, { exclude: ['health', 'ready'] });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  const swaggerCfg = new DocumentBuilder()
    .setTitle('Motech POS API')
    .setDescription('NestJS backend (Oracle-first, Clean/Hexagonal) — read-only phase')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, swaggerCfg);
  SwaggerModule.setup(`${prefix}/docs`, app, doc);

  const port = config.get('PORT');
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
