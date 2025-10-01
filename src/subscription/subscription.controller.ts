import { Controller, Post, Put, Patch, Body, Param, HttpCode, HttpStatus, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { 
  CreateSubscriptionRequestDto, 
  CreateSubscriptionResponseDto,
  ValidateSubscriptionRequestDto,
  ValidateSubscriptionResponseDto 
} from '../common/dto/subscription.dto';

@ApiTags('subscription')
@Controller('v1/private/subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SubscriptionController {
  private readonly logger = new Logger(SubscriptionController.name);

  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Crear suscripción',
    description: 'Crea una nueva suscripción para un comercio y envía OTP por email'
  })
  @ApiBody({ type: CreateSubscriptionRequestDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Suscripción creada exitosamente',
    type: CreateSubscriptionResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'El comercio ya tiene una cuenta creada'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Datos de entrada inválidos'
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Demasiadas operaciones de suscripción. Rate limit excedido.'
  })
  async createSubscription(@Body() request: CreateSubscriptionRequestDto): Promise<CreateSubscriptionResponseDto> {
    this.logger.log(`Generando suscripción para el cliente: ${JSON.stringify(request)}`);

    const response = await this.subscriptionService.createSubscription(request);

    this.logger.log(`Respuesta de suscripción: ${JSON.stringify(response)}`);
    return response;
  }

  @Put(':cuit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Validar suscripción',
    description: 'Valida el OTP recibido por email para completar la suscripción'
  })
  @ApiParam({ 
    name: 'cuit', 
    description: 'CUIT/CUIL del comercio',
    example: '20123456789'
  })
  @ApiBody({ type: ValidateSubscriptionRequestDto })
  @ApiResponse({ 
    status: 200, 
    description: 'OTP validado exitosamente',
    type: ValidateSubscriptionResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'OTP inválido o expirado'
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Demasiadas operaciones de suscripción. Rate limit excedido.'
  })
  async validateSubscription(
    @Param('cuit') cuit: string,
    @Body() request: ValidateSubscriptionRequestDto
  ): Promise<ValidateSubscriptionResponseDto> {
    this.logger.log(`Validando OTP para el cliente con CUIT/CUIL: ${cuit}`);

    const response = await this.subscriptionService.validateSubscription(cuit, request);

    this.logger.log(`OTP validado exitosamente para el cliente con CUIT/CUIL: ${cuit}`);
    return response;
  }

  @Patch(':cuit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reenviar challenge OTP',
    description: 'Reenvía el código OTP por email para la suscripción'
  })
  @ApiParam({ 
    name: 'cuit', 
    description: 'CUIT/CUIL del comercio',
    example: '20123456789'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Challenge reenviado exitosamente'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Suscripción no encontrada'
  })
  @ApiResponse({ 
    status: 429, 
    description: 'Demasiadas operaciones de suscripción. Rate limit excedido.'
  })
  async resendSubscriptionChallenge(@Param('cuit') cuit: string): Promise<void> {
    this.logger.log(`Reenviando challenge para la suscripción con CUIT/CUIL: ${cuit}`);
    
    await this.subscriptionService.resendSubscriptionChallenge(cuit);
    
    this.logger.log(`Finaliza reenvío de challenge para la suscripción con CUIT/CUIL: ${cuit}`);
  }
}

