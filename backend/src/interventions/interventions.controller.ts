import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InterventionsService } from './interventions.service';

@Controller('interventions')
@UseGuards(AuthGuard('jwt'))
export class InterventionsController {
  constructor(private interventionsService: InterventionsService) {}

  @Get()         findAll() { return this.interventionsService.findAll(); }
  @Get('stats')  getStats() { return this.interventionsService.stats(); }
  @Get(':id')    findOne(@Param('id') id: string) { return this.interventionsService.findOne(id); }
  @Post()        create(@Body() dto: any) { return this.interventionsService.create(dto); }
  @Patch(':id')  update(@Param('id') id: string, @Body() dto: any) { return this.interventionsService.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.interventionsService.remove(id); }
}
