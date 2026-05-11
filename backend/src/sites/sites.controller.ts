import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { SitesService } from './sites.service';

class CreateSiteDto {
  @IsString() @IsNotEmpty() nom: string;
  @IsOptional() @IsString() adresse?: string;
  @IsOptional() @IsString() telephone?: string;
}

@Controller('sites')
@UseGuards(AuthGuard('jwt'))
export class SitesController {
  constructor(private sitesService: SitesService) {}

  @Get()    findAll() { return this.sitesService.findAll(); }
  @Post()   create(@Body() dto: CreateSiteDto) { return this.sitesService.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: Partial<CreateSiteDto>) { return this.sitesService.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.sitesService.remove(id); }
}
