/**
 * Generate docs/api/openapi.json from the live NestJS Swagger document.
 * Run: npx ts-node scripts/gen-openapi.ts  (or via `npm run openapi`).
 * Boots the app WITHOUT listening; just builds the OpenAPI document and writes it.
 */
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { AppModule } from '../src/app.module';

async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api/v1', { exclude: ['health', 'ready'] });
  const cfg = new DocumentBuilder()
    .setTitle('Motech POS API')
    .setDescription('NestJS backend (Oracle-first, Clean/Hexagonal)')
    .setVersion('0.2.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, cfg);
  const out = resolve(__dirname, '../../docs/api/openapi.json');
  mkdirSync(resolve(__dirname, '../../docs/api'), { recursive: true });
  writeFileSync(out, JSON.stringify(doc, null, 4));
  // eslint-disable-next-line no-console
  console.log(`OpenAPI written → ${out}`);
  await app.close();
}

void main();
