import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import databaseConfig from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CarsModule } from './cars/cars.module';
import { BookingsModule } from './bookings/bookings.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    // Global environment config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),

    // Database connection (MariaDB via TypeORM)
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get<TypeOrmModuleOptions>('database')!,
    }),

    // Rate limiting — protects against brute force / abuse
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute window
        limit: 30, // max 30 requests per window per IP
      },
    ]),

    // Feature modules
    UsersModule,
    AuthModule,
    CarsModule,
    BookingsModule,
    SettingsModule,

    // Still to come: AiModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}