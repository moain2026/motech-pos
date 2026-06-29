import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig, validateConfig } from './config.schema';

/**
 * Typed config provider. Wraps @nestjs/config with Zod validation.
 * Inject `TypedConfigService` for compile-time-safe access to config.
 */
export class TypedConfigService {
  constructor(private readonly inner: ConfigService) {}

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    // validateConfig guarantees presence, so non-null assertion is safe.
    return this.inner.get(key as string) as AppConfig[K];
  }
}

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateConfig,
    }),
  ],
  providers: [
    {
      provide: TypedConfigService,
      useFactory: (inner: ConfigService) => new TypedConfigService(inner),
      inject: [ConfigService],
    },
  ],
  exports: [TypedConfigService],
})
export class ConfigModule {}
