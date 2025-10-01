import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { ExternalServicesModule } from '../common/services/external-services.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ExternalServicesModule, AuthModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}

