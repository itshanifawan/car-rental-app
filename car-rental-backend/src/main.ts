import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation — auto-validates DTOs using class-validator decorators
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties not defined in DTO
      forbidNonWhitelisted: true, // throws error on extra properties
      transform: true, // auto-transforms payloads to DTO instances
    }),
  );

  // CORS — allow frontend to call this API
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // Swagger API documentation — available at /api/docs
  const config = new DocumentBuilder()
    .setTitle('Car Rental API')
    .setDescription('Backend API for the car rental demo project')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();