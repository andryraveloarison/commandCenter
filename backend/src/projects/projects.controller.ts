import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, AddTeamMemberDto } from './dto/project.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new project' })
  async create(@Body() dto: CreateProjectDto, @Request() req) {
    return this.projectsService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects' })
  async findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get project history' })
  async getHistory(@Param('id') id: string) {
    return this.projectsService.getProjectHistory(id);
  }

  @Get(':id/statistics')
  @ApiOperation({ summary: 'Get project statistics' })
  async getStatistics(@Param('id') id: string) {
    return this.projectsService.getStatistics(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  async update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update project progression' })
  async updateProgress(
    @Param('id') id: string,
    @Body() dto: { progression: number; note?: string },
    @Request() req,
  ) {
    return this.projectsService.addProgressionHistory(id, req.user.id, dto.progression, dto.note);
  }

  @Post(':id/team')
  @ApiOperation({ summary: 'Add team member to project' })
  async addTeamMember(@Param('id') projectId: string, @Body() dto: AddTeamMemberDto, @Request() req) {
    return this.projectsService.addTeamMember(projectId, dto, req.user.id, req.user.role);
  }

  @Delete(':id/team/:userId')
  @ApiOperation({ summary: 'Remove team member from project' })
  async removeTeamMember(@Param('id') projectId: string, @Param('userId') userId: string) {
    return this.projectsService.removeTeamMember(projectId, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  async remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
