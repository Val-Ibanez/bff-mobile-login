import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ExternalServicesModule } from '../common/services/external-services.module';

@Module({
  imports: [ExternalServicesModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
