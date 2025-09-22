import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { 
  CreateAccountRequestDto, 
  AuthenticationRequestDto, 
  AuthenticationResponseDto 
} from '../common/dto/auth.dto';

@ApiTags('auth')
@Controller('v1/private')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('accounts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear cuenta de comercio',
    description: 'Crea una nueva cuenta de comercio validando la suscripción previa'
  })
  @ApiBody({ type: CreateAccountRequestDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Cuenta creada exitosamente',
    type: AuthenticationResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos o key de validación incorrecta'
  })
  async createAccount(@Body() request: CreateAccountRequestDto): Promise<AuthenticationResponseDto> {
    this.logger.log(`Iniciando proceso de creación de cuenta para el email: ${request.email}`);
    
    const response = await this.authService.createAccount(request);
    
    this.logger.log(`Cuenta creada exitosamente para el email: ${request.email}`);
    return response;
  }

  @Post('login')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Autenticación de comercio',
    description: 'Autentica un comercio y retorna tokens de acceso'
  })
  @ApiBody({ type: AuthenticationRequestDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Autenticación exitosa',
    type: AuthenticationResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Credenciales inválidas'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Email o contraseña incorrectos'
  })
  async login(@Body() request: AuthenticationRequestDto): Promise<AuthenticationResponseDto> {
    this.logger.log(`Iniciando proceso de autenticación para el request: ${JSON.stringify({ email: request.email })}`);
    
    const response = await this.authService.login(request);
    
    this.logger.log(`Finaliza exitosamente el proceso de autenticación para el email: ${request.email}`);
    return response;
  }
}
