import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

@Injectable()
export class AuthRateLimitMiddleware implements NestMiddleware {
  private readonly authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
      error: 'Authentication rate limit exceeded',
      message: 'Demasiados intentos de autenticación. Límite: 5 intentos cada 15 minutos.',
      retryAfter: '15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    keyGenerator: (req: Request) => {
      return `${req.ip}-${req.get('User-Agent')}`;
    }
  });

  use(req: Request, res: Response, next: NextFunction) {
    this.authRateLimit(req, res, next);
  }
}
