import { IsString, IsOptional, IsNumber, IsArray } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  projectId: string;

  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  responsibleIds?: string[];
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

  @IsOptional()
  @IsArray()
  responsibleIds?: string[];
}
