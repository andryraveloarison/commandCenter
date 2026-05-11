import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { DemandeursService } from './demandeurs.service';

class CreateDemandeurDto {
  @IsString() @IsNotEmpty() nom: string;
  @IsOptional() @IsString() prenom?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() telephone?: string;
  @IsOptional() @IsString() siteId?: string;
}

@Controller('demandeurs')
@UseGuards(AuthGuard('jwt'))
export class DemandeursController {
  constructor(private demandeursService: DemandeursService) {}

  @Get()    findAll() { return this.demandeursService.findAll(); }
  @Post()   create(@Body() dto: CreateDemandeurDto) { return this.demandeursService.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: Partial<CreateDemandeurDto>) { return this.demandeursService.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.demandeursService.remove(id); }
}
