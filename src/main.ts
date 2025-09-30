import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('BFF Mobile Login API')
    .setDescription('Backend for Frontend API for mobile login services')
    .setVersion('1.0')
    // Añadir soporte para autenticación Bearer (JWT) en Swagger UI
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    }, 'JWT-auth')
    .addTag('auth', 'Authentication endpoints')
    .addTag('subscription', 'Subscription management endpoints')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Enable CORS for mobile apps
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 BFF Mobile Login API running on 0.0.0.0:${port}`);
  console.log(`📚 Swagger documentation available at http://localhost:${port}/api`);
}

bootstrap();
