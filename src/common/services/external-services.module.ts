import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MerchantsService } from './merchants.service';
import { ClientsService } from './clients.service';
import { SecurityService } from './security.service';

@Module({
  imports: [ConfigModule],
  providers: [MerchantsService, ClientsService, SecurityService],
  exports: [MerchantsService, ClientsService, SecurityService],
})
export class ExternalServicesModule {}
