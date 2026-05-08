import { IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  nom: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  dateDebut: string;

  @IsOptional()
  @IsDateString()
  dateFin?: string;

  @IsOptional()
  @IsString()
  priorite?: string;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  statut?: string;

  @IsOptional()
  @IsString()
  priorite?: string;

  @IsOptional()
  @IsDateString()
  dateFin?: string;
}

export class AddTeamMemberDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  role?: string;
}
