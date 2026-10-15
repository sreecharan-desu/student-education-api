import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from '@fastify/helmet';
import { AppModule } from '../src/app.module';

let cachedApp: NestFastifyApplication | null = null;

async function bootstrapServerless(): Promise<NestFastifyApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  const fastifyAdapter = new FastifyAdapter({
    logger: false,
    bodyLimit: 1048576,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    { logger: ['error', 'warn', 'log'] },
  );

  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Student Education Mobile App - Dashboard API')
    .setDescription(
      'Production-oriented REST API for Andhra Pradesh State Board (SCERT AP) Classes 6–10 Student Dashboard, Academic Year 2026–2027.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT access token with Bearer prefix: Bearer <token>',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Health', 'System health and database connectivity')
    .addTag('Authentication', 'Student authentication and token management')
    .addTag('Student Dashboard', 'Aggregated dashboard and individual card endpoints')
    .addTag('Announcements', 'Student announcements and read management')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js',
    ],
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
    },
  });

  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  cachedApp = app;
  return app;
}

export default async function handler(req: any, res: any) {
  const app = await bootstrapServerless();
  const fastifyInstance = app.getHttpAdapter().getInstance();
  fastifyInstance.server.emit('request', req, res);
}
