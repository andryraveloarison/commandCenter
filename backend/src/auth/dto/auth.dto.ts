import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'soldat@command.mil' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'soldat_ryan' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'Soldat Ryan' })
  @IsString()
  nom: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}

export class LoginDto {
  @ApiProperty({ example: 'general@command.mil' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}
