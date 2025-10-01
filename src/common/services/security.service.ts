import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
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
      host: this.configService.get<string>('securityService.host', 'http://localhost:8087/v1/private'),
      timeout: this.configService.get<number>('securityService.timeout', 10000),
    };

    this.logger.log(`[DEBUG] Inicializando SecurityService con host: ${this.config.host}`);
    this.httpClient = axios.create({
      baseURL: this.config.host,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    this.httpClient.interceptors.request.use((config) => {
      this.logger.log(`[DEBUG] Enviando petición a: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
      return config;
    });

    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.log(`[DEBUG] Respuesta recibida con status: ${response.status}`);
        return response;
      },
      (error) => {
        if (error.response) {
          this.logger.error(`[DEBUG] Error de respuesta: status=${error.response.status}, data=${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
          this.logger.error(`[DEBUG] Error de red: ${error.message}`);
        } else {
          this.logger.error(`[DEBUG] Error: ${error.message}`);
        }
        throw error;
      }
    );
  }

  async createAccount(account: Account): Promise<Account> {
    try {
      this.logger.log(`Creando cuenta para email: ${account.email}`);
      
      const response = await this.httpClient.post('/accounts', account);
      
      if (response.status === 201 && response.data) {
        this.logger.log(`Cuenta creada exitosamente para email: ${account.email}`);
        return response.data;
      }
      
      throw new HttpException('Error al crear cuenta: respuesta inválida', HttpStatus.BAD_GATEWAY);
    } catch (error) {
      if (error.response) {
        this.logger.error(
          `Error al crear cuenta para email ${account.email}: status=${error.response.status}, data=${JSON.stringify(error.response.data)}`,
        );
        throw new HttpException(error.response.data || 'Error en servicio de seguridad', error.response.status || HttpStatus.BAD_GATEWAY);
      }

      this.logger.error(`Error al crear cuenta para email ${account.email}: ${error.message}`);
      throw new HttpException(`Error al crear cuenta: ${error.message}`, HttpStatus.BAD_GATEWAY);
    }
  }

  async login(email: string, password: string, refreshToken?: string): Promise<AccountLogin> {
    try {
      this.logger.log(`[DEBUG] SecurityService config: ${JSON.stringify(this.config)}`);
      this.logger.log(`[DEBUG] Intentando login en: ${this.config.host}/login`);
      this.logger.log(`Iniciando login para email: ${email}`);
      
      const requestBody: any = { email, password };
      if (refreshToken) {
        requestBody.refreshToken = refreshToken;
      }
      
      const response = await this.httpClient.post('/login', requestBody);
      
      if ((response.status === 200 || response.status === 201) && response.data) {
        this.logger.log(`Login exitoso para email: ${email}`);

        const data = response.data;
        const accountLogin: AccountLogin = {
          accessToken: data.accessToken || data.access_token,
          refreshToken: data.refreshToken || data.refresh_token,
          tokenType: data.tokenType || data.token_type,
          expiresIn: data.expiresIn || data.expires_in,
          refreshExpiresIn: data.refreshExpiresIn || data.refresh_expires_in,
        };

        return accountLogin;
      }

      throw new Error('Error al realizar login: respuesta inválida');
    } catch (error: any) {
      if (error.response) {
        this.logger.error(
          `Login falló para email ${email}: status=${error.response.status}, data=${JSON.stringify(error.response.data)}`,
        );
        throw new HttpException(
          error.response.data || `Error en servicio de seguridad`,
          error.response.status || HttpStatus.BAD_GATEWAY,
        );
      }

      this.logger.error(`Error al realizar login para email ${email}: ${error.message}`);
      throw new HttpException(`Error al realizar login: ${error.message}`, HttpStatus.BAD_GATEWAY);
    }
  }
}

