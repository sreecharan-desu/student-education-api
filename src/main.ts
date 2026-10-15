import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from '@fastify/helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Configure Fastify HTTP Adapter with 1MB body limit
  const fastifyAdapter = new FastifyAdapter({
    logger: false,
    bodyLimit: 1048576, // 1MB
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
  );

  // Security Headers via Helmet (CSP relaxed for Swagger UI support)
  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  });

  // CORS: Allow mobile apps (Expo/React Native) and local dev environments
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Global Prefix: /api/v1
  app.setGlobalPrefix('api/v1');

  // Global Validation Pipe
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

  // Swagger OpenAPI Documentation
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

  const port = parseInt(process.env.PORT || '3000', 10);
  const host = process.env.HOST || '0.0.0.0';

  // Listen on 0.0.0.0 to enable access from physical mobile devices on the same Wi-Fi
  await app.listen(port, host);

  logger.log(`=============================================================`);
  logger.log(`🚀 Student Education API running at: http://localhost:${port}/api/v1`);
  logger.log(`📖 Swagger API Documentation at:     http://localhost:${port}/api/docs`);
  logger.log(`📱 LAN Mobile Network Access at:     http://192.168.0.126:${port}/api/v1`);
  logger.log(`=============================================================`);
}

void bootstrap();
