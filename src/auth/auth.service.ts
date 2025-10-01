import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SecurityService } from '../common/services/security.service';
import { ClientsService } from '../common/services/clients.service';
import { CreateAccountRequestDto, AuthenticationRequestDto, AuthenticationResponseDto } from '../common/dto/auth.dto';
import { Account, AccountLogin } from '../common/interfaces/external-services.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly securityService: SecurityService,
    private readonly clientsService: ClientsService,
  ) {}

  async createAccount(request: CreateAccountRequestDto): Promise<AuthenticationResponseDto> {
    this.logger.log(`Iniciando proceso de creación de cuenta para el email: ${request.email}`);

    const account: Account = {
      cuit: request.cuit,
      email: request.email,
      password: request.password,
      firstName: request.firstName,
      lastName: request.lastName,
      key: request.key,
    };

    const createdAccount = await this.securityService.createAccount(account);
    this.logger.log(`Cuenta creada exitosamente para el email: ${createdAccount.email}`);

    const accountLogin = await this.performLogin(createdAccount);

    return this.mapToAuthenticationResponse(accountLogin);
  }

  async login(request: AuthenticationRequestDto): Promise<AuthenticationResponseDto> {
    this.logger.log(`Iniciando proceso de autenticación para el email: ${request.email}`);
    
    const accountLogin = await this.securityService.login(
      request.email,
      request.password,
      request.refreshToken
    );

    this.logger.log(`Finaliza exitosamente el proceso de autenticación para el email: ${request.email}`);
    return this.mapToAuthenticationResponse(accountLogin);
  }

  private async performLogin(account: Account): Promise<AccountLogin> {
    this.logger.log(`Iniciando autenticación para el email: ${account.email}`);
    
    const accountLogin = await this.securityService.login(account.email, account.password, null);
    
    this.logger.log(`Autenticación finalizada exitosamente para el email: ${account.email}`);
    return accountLogin;
  }

  private mapToAuthenticationResponse(accountLogin: AccountLogin): AuthenticationResponseDto {
    return {
      accessToken: accountLogin.accessToken,
      refreshToken: accountLogin.refreshToken,
      tokenType: accountLogin.tokenType,
      expiresIn: accountLogin.expiresIn,
      refreshExpiresIn: accountLogin.refreshExpiresIn,
    };
  }
}
