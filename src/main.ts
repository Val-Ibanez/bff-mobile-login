import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  if (process.env.NODE_ENV === 'production') {
    app.use((req: any, res: any, next: any) => {
      if (req.header('x-forwarded-proto') !== 'https') {
        res.redirect(`https://${req.header('host')}${req.url}`);
      } else {
        next();
      }
    });
  }
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('BFF Mobile Login API')
      .setDescription('Backend for Frontend API for mobile login services')
      .setVersion('1.0')
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
    
    const logger = new Logger('Bootstrap');
    logger.log(`📚 Swagger documentation available at http://localhost:${process.env.PORT || 3000}/api`);
  }

  app.use(helmet());
  
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      message: {
        error: 'Rate limit exceeded',
        message: 'Demasiadas peticiones desde esta IP. Límite: 20 peticiones cada 15 minutos.',
        retryAfter: '15 minutos'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    })
  );

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'https://your-mobile-app.com',
    'https://app.yourcompany.com',
    'http://localhost:3000',
    'http://localhost:3001'
  ];
  
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  const logger = new Logger('Bootstrap');
  logger.log(`🚀 BFF Mobile Login API running on 0.0.0.0:${port}`);
  logger.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (process.env.NODE_ENV === 'production') {
    logger.warn('⚠️  Running in PRODUCTION mode');
    logger.warn('⚠️  Swagger documentation is DISABLED');
    logger.warn('⚠️  HTTPS enforcement is ENABLED');
  }
}

bootstrap();

