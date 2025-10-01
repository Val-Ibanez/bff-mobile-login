import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { TokenBlacklistService } from '../../common/services/token-blacklist.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private configService: ConfigService,
    private tokenBlacklistService: TokenBlacklistService
  ) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    if (this.tokenBlacklistService.isBlacklisted(token)) {
      throw new UnauthorizedException('Token revoked');
    }

    try {
      const decoded = jwt.verify(token, this.configService.get<string>('JWT_SECRET'), {
        algorithms: ['HS256'],
        issuer: this.configService.get<string>('JWT_ISSUER', 'bff-mobile'),
        audience: this.configService.get<string>('JWT_AUDIENCE', 'mobile-app'),
      });

      if (!decoded.sub || !(decoded as any).email) {
        throw new UnauthorizedException('Invalid token claims');
      }

      request.user = decoded;
      return true;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      } else if (error.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token not active');
      }
      throw new UnauthorizedException('Token validation failed');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}