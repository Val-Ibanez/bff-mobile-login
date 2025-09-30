import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { MerchantsService } from '../common/services/merchants.service';
import { ClientsService } from '../common/services/clients.service';
import { 
  CreateSubscriptionRequestDto, 
  CreateSubscriptionResponseDto,
  ValidateSubscriptionRequestDto,
  ValidateSubscriptionResponseDto 
} from '../common/dto/subscription.dto';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    private readonly merchantsService: MerchantsService,
    private readonly clientsService: ClientsService,
  ) {}

  async createSubscription(request: CreateSubscriptionRequestDto): Promise<CreateSubscriptionResponseDto> {
    this.logger.log(`Generando suscripción para el cliente: ${JSON.stringify(request)}`);

    // Verificar si ya existe un comercio para este CUIT
    const existingMerchant = await this.merchantsService.findByCuit(request.cuit);
    if (existingMerchant) {
      this.logger.warn(`El CUIT/CUIL ${request.cuit} ya tiene una cuenta creada`);
      throw new ConflictException('El comercio ya tiene una cuenta creada');
    }

    this.logger.log(`CUIT/CUIL: ${request.cuit} no tiene un comercio creado, se envía a crear una suscripción en ms-clients`);
    
    // Crear suscripción
    const subscription = await this.clientsService.createSubscription(request.cuit);
    
    this.logger.log(`Suscripción creada exitosamente para el CUIT/CUIL: ${request.cuit}`);
    
    return {
      email: subscription.email,
    };
  }

  async validateSubscription(cuit: string, request: ValidateSubscriptionRequestDto): Promise<ValidateSubscriptionResponseDto> {
    this.logger.log(`Validando OTP para el cliente con CUIT/CUIL: ${cuit}`);

    const subscription = await this.clientsService.validateSubscription(cuit, request.otp);
    
    this.logger.log(`OTP validado exitosamente para el cliente con CUIT/CUIL: ${cuit}`);
    
    return {
      email: subscription.email,
      key: subscription.key,
    };
  }

  async resendSubscriptionChallenge(cuit: string): Promise<void> {
    this.logger.log(`Reenviando challenge para la suscripción con CUIT/CUIL: ${cuit}`);
    
    await this.clientsService.resendSubscriptionChallenge(cuit);
    
    this.logger.log(`Finaliza reenvío de challenge para la suscripción con CUIT/CUIL: ${cuit}`);
  }
}

