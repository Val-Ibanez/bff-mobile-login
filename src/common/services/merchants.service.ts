import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { Merchant, ExternalServiceConfig } from '../interfaces/external-services.interface';

@Injectable()
export class MerchantsService {
  private readonly logger = new Logger(MerchantsService.name);
  private readonly httpClient: AxiosInstance;
  private readonly config: ExternalServiceConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      host: this.configService.get<string>('MERCHANTS_SERVICE_HOST', 'http://localhost:1080/api/merchants'),
      timeout: this.configService.get<number>('MERCHANTS_SERVICE_TIMEOUT', 10000),
    };

    this.httpClient = axios.create({
      baseURL: this.config.host,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async findByCuit(cuit: string): Promise<Merchant | null> {
    try {
      this.logger.log(`Buscando comercio para CUIT: ${cuit}`);
      
      const response = await this.httpClient.get(`/${cuit}`);
      
      if (response.status === 200 && response.data) {
        this.logger.log(`Comercio encontrado para CUIT: ${cuit}`);
        return response.data;
      }
      
      return null;
    } catch (error) {
      if (error.response?.status === 404) {
        this.logger.log(`Comercio no encontrado para CUIT: ${cuit}`);
        return null;
      }
      
      this.logger.error(`Error al buscar comercio para CUIT ${cuit}:`, error.message);
      throw new Error(`Error al consultar servicio de comercios: ${error.message}`);
    }
  }
}
