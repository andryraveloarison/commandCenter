import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'soldat@command.mil' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'soldat_ryan' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'Soldat Ryan' })
  @IsString()
  nom: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'https://avatar.url', required: false })
  @IsOptional()
  @IsString()
  photo?: string;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'Soldat James Ryan', required: false })
  @IsOptional()
  @IsString()
  nom?: string;

  @ApiProperty({ example: 'soldat_ryan', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'https://avatar.url', required: false })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({ example: 'ACTIF', required: false })
  @IsOptional()
  @IsString()
  statut?: string;

  @ApiProperty({ example: 'nouveau@email.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'nouveau_password', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ example: 'TECH_IT', required: false })
  @IsOptional()
  @IsEnum(['DSI', 'RESPONSABLE', 'DEVELOPPEUR', 'TECH_IT'])
  role?: string;

  @ApiProperty({ example: 'Ingénieur full-stack spécialisé...', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
