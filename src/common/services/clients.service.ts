import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { Subscription, ExternalServiceConfig } from '../interfaces/external-services.interface';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);
  private readonly httpClient: AxiosInstance;
  private readonly config: ExternalServiceConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      host: this.configService.get<string>('CLIENTS_SERVICE_HOST', 'http://localhost:8082/v1'),
      timeout: this.configService.get<number>('CLIENTS_SERVICE_TIMEOUT', 10000),
    };

    this.httpClient = axios.create({
      baseURL: this.config.host,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async createSubscription(cuit: string): Promise<Subscription> {
    try {
      this.logger.log(`Creando suscripción para CUIT: ${cuit}`);
      
      const response = await this.httpClient.post('/subscriptions', { cuit });
      
      if (response.status === 201 && response.data) {
        this.logger.log(`Suscripción creada exitosamente para CUIT: ${cuit}`);
        return response.data;
      }
      
      throw new Error('Error al crear suscripción: respuesta inválida');
    } catch (error) {
      this.logger.error(`Error al crear suscripción para CUIT ${cuit}:`, error.message);
      throw new Error(`Error al crear suscripción: ${error.message}`);
    }
  }

  async validateSubscription(cuit: string, otp: string): Promise<Subscription> {
    try {
      this.logger.log(`Validando OTP para CUIT: ${cuit}`);
      
      const response = await this.httpClient.put(`/subscriptions/${cuit}`, { otp });
      
      if (response.status === 200 && response.data) {
        this.logger.log(`OTP validado exitosamente para CUIT: ${cuit}`);
        return response.data;
      }
      
      throw new Error('Error al validar suscripción: respuesta inválida');
    } catch (error) {
      this.logger.error(`Error al validar suscripción para CUIT ${cuit}:`, error.message);
      throw new Error(`Error al validar suscripción: ${error.message}`);
    }
  }

  async resendSubscriptionChallenge(cuit: string): Promise<void> {
    try {
      this.logger.log(`Reenviando challenge para CUIT: ${cuit}`);
      
      const response = await this.httpClient.patch(`/subscriptions/${cuit}`);
      
      if (response.status === 200) {
        this.logger.log(`Challenge reenviado exitosamente para CUIT: ${cuit}`);
        return;
      }
      
      throw new Error('Error al reenviar challenge: respuesta inválida');
    } catch (error) {
      this.logger.error(`Error al reenviar challenge para CUIT ${cuit}:`, error.message);
      throw new Error(`Error al reenviar challenge: ${error.message}`);
    }
  }
}
