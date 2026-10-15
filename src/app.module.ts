import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import configuration from './config/configuration';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { StudentsModule } from './students/students.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TasksModule } from './tasks/tasks.module';
import { LearningModule } from './learning/learning.module';
import { ProgressModule } from './progress/progress.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { DashboardModule } from './dashboard/dashboard.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env'],
    }),

    // Rate Limiting (Throttler)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('throttleTtl', 60000),
          limit: configService.get<number>('throttleLimit', 30),
        },
      ],
    }),

    // Database
    PrismaModule,

    // Feature Modules
    HealthModule,
    AuthModule,
    StudentsModule,
    SubjectsModule,
    TasksModule,
    LearningModule,
    ProgressModule,
    AnnouncementsModule,
    BookmarksModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    // Global JWT authentication guard (requires Bearer token unless route is decorated with @Public())
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global Rate limiting guard
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Global Request Logging Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
