import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

@Injectable()
export class SubscriptionRateLimitMiddleware implements NestMiddleware {
  private readonly subscriptionRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    message: {
      error: 'Subscription rate limit exceeded',
      message: 'Demasiadas operaciones de suscripción. Límite: 10 operaciones cada hora.',
      retryAfter: '1 hora'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req: Request) => {
      return `${req.ip}-${req.get('User-Agent')}`;
    }
  });

  use(req: Request, res: Response, next: NextFunction) {
    this.subscriptionRateLimit(req, res, next);
  }
}
