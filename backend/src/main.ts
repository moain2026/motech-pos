import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { TypedConfigService } from './config/config.module';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(PinoLogger));
  const config = app.get(TypedConfigService);

  // Behind Caddy on loopback — trust it so req.ip reflects the real client
  // (used by the login brute-force throttle, §A07).
  app.set('trust proxy', 'loopback');

  const origins = config
    .get('CORS_ORIGINS')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  app.use(helmet());
  // httpOnly auth cookies (mp_at/mp_rt) — parsed for JwtAuthGuard + /auth/refresh.
  app.use(cookieParser());
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

  // SECURITY: Swagger is an API map for attackers — disabled in production
  // unless explicitly re-enabled (SWAGGER_ENABLED=true).
  const swaggerOn =
    config.get('NODE_ENV') !== 'production' ||
    process.env.SWAGGER_ENABLED === 'true';
  if (swaggerOn) {
    const swaggerCfg = new DocumentBuilder()
      .setTitle('Motech POS API')
      .setDescription(
        'NestJS backend (Oracle-first, Clean/Hexagonal) — read-only phase',
      )
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    const doc = SwaggerModule.createDocument(app, swaggerCfg);
    SwaggerModule.setup(`${prefix}/docs`, app, doc);
  }

  const port = config.get('PORT');
  // SECURITY: bind loopback by default — public access goes through Caddy
  // (TLS + domain) only; the raw port must not be internet-reachable.
  await app.listen(port, config.get('HOST'));
}

void bootstrap();
