import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateAccountRequestDto {
  @ApiProperty({ 
    description: 'CUIT/CUIL del comercio',
    example: '20123456789',
    minLength: 11,
    maxLength: 11
  })
  @IsString()
  @IsNotEmpty()
  cuit: string;

  @ApiProperty({ 
    description: 'Email del comercio',
    example: 'comercio@example.com'
  })
  @IsEmail({}, { message: 'El email debe tener una estructura válida' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    description: 'Contraseña (mínimo 12 caracteres, debe incluir mayúsculas, minúsculas, números y caracteres especiales)',
    example: 'MiPassword123!',
    writeOnly: true,
    minLength: 12,
    maxLength: 128
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(12, { message: 'La contraseña debe tener al menos 12 caracteres' })
  @MaxLength(128, { message: 'La contraseña no puede exceder 128 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial (@$!%*?&)'
  })
  password: string;

  @ApiProperty({ 
    description: 'Nombre del comercio',
    example: 'Juan',
    required: false
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ 
    description: 'Apellido del comercio',
    example: 'Pérez',
    required: false
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ 
    description: 'Key de validación',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsNotEmpty()
  key: string;
}

export class AuthenticationRequestDto {
  @ApiProperty({ 
    description: 'Email del comercio',
    example: 'comercio@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ 
    description: 'Contraseña (mínimo 12 caracteres, debe incluir mayúsculas, minúsculas, números y caracteres especiales)',
    example: 'MiPassword123!',
    writeOnly: true,
    minLength: 12,
    maxLength: 128
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(12, { message: 'La contraseña debe tener al menos 12 caracteres' })
  @MaxLength(128, { message: 'La contraseña no puede exceder 128 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial (@$!%*?&)'
  })
  password: string;

  @ApiProperty({ 
    description: 'Refresh token para renovar sesión',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
    writeOnly: true
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class AuthenticationResponseDto {
  @ApiProperty({ 
    description: 'Access token JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;

  @ApiProperty({ 
    description: 'Refresh token para renovar sesión',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  refreshToken: string;

  @ApiProperty({ 
    description: 'Tipo de token',
    example: 'Bearer'
  })
  tokenType: string;

  @ApiProperty({ 
    description: 'Tiempo de expiración del access token en segundos',
    example: 3600
  })
  expiresIn: number;

  @ApiProperty({ 
    description: 'Tiempo de expiración del refresh token en segundos',
    example: 604800
  })
  refreshExpiresIn: number;
}

