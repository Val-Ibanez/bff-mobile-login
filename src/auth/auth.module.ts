import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TokenService } from './services/token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ExternalServicesModule } from '../common/services/external-services.module';
import { TokenBlacklistService } from '../common/services/token-blacklist.service';

@Module({
  imports: [
    ExternalServicesModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'your-secret-key'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '1h'),
          issuer: configService.get<string>('JWT_ISSUER', 'bff-mobile'),
          audience: configService.get<string>('JWT_AUDIENCE', 'mobile-app'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtStrategy, TokenBlacklistService],
  exports: [TokenService, TokenBlacklistService],
})
export class AuthModule {}

