import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  private readonly blacklistedTokens: Set<string> = new Set();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(user: { id: string; email: string }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<number>('JWT_EXPIRATION', 3600),
      refreshExpiresIn: this.configService.get<number>('REFRESH_TOKEN_EXPIRATION', 604800),
    };
  }

  private async generateAccessToken(user: { id: string; email: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      type: 'access',
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('JWT_EXPIRATION', '1h'),
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  private async generateRefreshToken(user: { id: string; email: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRATION', '7d'),
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  async validateToken(token: string): Promise<any> {
    if (this.isTokenBlacklisted(token)) {
      return null;
    }

    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch {
      return null;
    }
  }

  blacklistToken(token: string): void {
    this.blacklistedTokens.add(token);
    // En producción, deberías usar Redis o una base de datos para almacenar tokens revocados
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  async refreshAccessToken(refreshToken: string): Promise<any> {
    const payload = await this.validateToken(refreshToken);
    
    if (!payload || payload.type !== 'refresh') {
      return null;
    }

    const user = {
      id: payload.sub,
      email: payload.email,
    };

    // Generar nuevo access token
    const accessToken = await this.generateAccessToken(user);

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get<number>('JWT_EXPIRATION', 3600),
    };
  }
}