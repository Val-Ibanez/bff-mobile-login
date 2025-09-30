import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'your-secret-key'),
      algorithms: ['HS256'], // Especificar algoritmos permitidos
      issuer: configService.get<string>('JWT_ISSUER', 'bff-mobile'),
      audience: configService.get<string>('JWT_AUDIENCE', 'mobile-app'),
    });
  }

  async validate(payload: any) {
    // Validar claims específicos
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Token inválido: claims faltantes');
    }

    // Validar que el token no haya expirado
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new UnauthorizedException('Token expirado');
    }

    // Validar que el token no sea muy antiguo (máximo 24 horas)
    const maxAge = 24 * 60 * 60; // 24 horas en segundos
    if (payload.iat && payload.iat < now - maxAge) {
      throw new UnauthorizedException('Token demasiado antiguo');
    }

    return {
      userId: payload.sub,
      email: payload.email,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}