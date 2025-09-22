import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { Account, AccountLogin, ExternalServiceConfig } from '../interfaces/external-services.interface';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);
  private readonly httpClient: AxiosInstance;
  private readonly config: ExternalServiceConfig;

  constructor(private configService: ConfigService) {
    this.config = {
      host: this.configService.get<string>('SECURITY_SERVICE_HOST', 'http://localhost:8087/v1'),
      timeout: this.configService.get<number>('SECURITY_SERVICE_TIMEOUT', 10000),
    };

    this.httpClient = axios.create({
      baseURL: this.config.host,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async createAccount(account: Account): Promise<Account> {
    try {
      this.logger.log(`Creando cuenta para email: ${account.email}`);
      
      const response = await this.httpClient.post('/accounts', account);
      
      if (response.status === 201 && response.data) {
        this.logger.log(`Cuenta creada exitosamente para email: ${account.email}`);
        return response.data;
      }
      
      throw new Error('Error al crear cuenta: respuesta inválida');
    } catch (error) {
      this.logger.error(`Error al crear cuenta para email ${account.email}:`, error.message);
      throw new Error(`Error al crear cuenta: ${error.message}`);
    }
  }

  async login(email: string, password: string, refreshToken?: string): Promise<AccountLogin> {
    try {
      this.logger.log(`Iniciando login para email: ${email}`);
      
      const requestBody: any = { email, password };
      if (refreshToken) {
        requestBody.refreshToken = refreshToken;
      }
      
      const response = await this.httpClient.post('/login', requestBody);
      
      if (response.status === 201 && response.data) {
        this.logger.log(`Login exitoso para email: ${email}`);
        return response.data;
      }
      
      throw new Error('Error al realizar login: respuesta inválida');
    } catch (error) {
      this.logger.error(`Error al realizar login para email ${email}:`, error.message);
      throw new Error(`Error al realizar login: ${error.message}`);
    }
  }
}
