import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateSubscriptionRequestDto {
  @ApiProperty({ 
    description: 'CUIT/CUIL del comercio',
    example: '20123456789',
    minLength: 11,
    maxLength: 11
  })
  @IsString()
  @IsNotEmpty()
  @Length(11, 11, { message: 'CUIT must contain exactly 11 characters' })
  cuit: string;
}

export class CreateSubscriptionResponseDto {
  @ApiProperty({ 
    description: 'Email donde se envió el OTP',
    example: 'comercio@example.com'
  })
  email: string;
}

export class ValidateSubscriptionRequestDto {
  @ApiProperty({ 
    description: 'Código OTP recibido por email',
    example: '123456',
    writeOnly: true
  })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class ValidateSubscriptionResponseDto {
  @ApiProperty({ 
    description: 'Email de la suscripción validada',
    example: 'comercio@example.com'
  })
  email: string;

  @ApiProperty({ 
    description: 'Key de validación para crear cuenta',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  key: string;
}
