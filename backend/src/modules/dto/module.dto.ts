import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  projectId: string;

  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateModuleDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  progression?: number;
}
