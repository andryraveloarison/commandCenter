import { IsOptional, IsString, IsEmail } from 'class-validator';
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
}
