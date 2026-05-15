import { Controller, Get, Post, Delete, Body, Param, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VersionsService } from './versions.service';
import { CreateVersionDto } from './dto/version.dto';

@Controller('versions')
@UseGuards(AuthGuard('jwt'))
export class VersionsController {
  constructor(private versionsService: VersionsService) {}

  @Post()
  create(@Body() dto: CreateVersionDto, @Request() req: any) {
    return this.versionsService.create(dto, req.user.id);
  }

  @Get()
  findAll(@Query('projectId') projectId: string) {
    return this.versionsService.findAll(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.versionsService.findOneWithTasks(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.versionsService.remove(id);
  }
}
