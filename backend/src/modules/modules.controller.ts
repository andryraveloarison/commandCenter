import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ModulesService } from './modules.service';
import { CreateModuleDto, UpdateModuleDto } from './dto/module.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Modules')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @ApiOperation({ summary: 'Create new module' })
  create(@Body() dto: CreateModuleDto) {
    return this.modulesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all modules for a project' })
  findAll(@Query('projectId') projectId: string) {
    return this.modulesService.findAll(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get module by ID' })
  findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update module' })
  update(@Param('id') id: string, @Body() dto: UpdateModuleDto) {
    return this.modulesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete module' })
  remove(@Param('id') id: string) {
    return this.modulesService.remove(id);
  }
}
