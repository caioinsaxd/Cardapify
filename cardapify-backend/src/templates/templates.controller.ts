import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  CreateScheduleDto,
  UpdateScheduleDto,
} from './dto/template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@ApiTags('Templates')
@ApiBearerAuth('JWT-auth')
@Controller('templates')
@UseGuards(JwtAuthGuard)
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all templates for restaurant' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async findAll(@CurrentUser() user: AuthUser) {
    return this.templatesService.findAllForRestaurant(user.restaurantId);
  }

  @Get('system')
  @ApiOperation({ summary: 'Get all system templates' })
  @ApiResponse({ status: 200, description: 'System templates retrieved successfully' })
  async findSystem() {
    return this.templatesService.findSystemTemplates();
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active template for restaurant' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Active template retrieved successfully' })
  async getActive(@CurrentUser() user: AuthUser) {
    return this.templatesService.getActiveTemplate(user.restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific template' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.templatesService.findOne(id, user.restaurantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new template' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateTemplateDto) {
    return this.templatesService.create(user.restaurantId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a template' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(id, user.restaurantId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a template' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.templatesService.delete(id, user.restaurantId);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate a template' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Template activated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async activate(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.templatesService.activate(id, user.restaurantId);
  }

  @Post('deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate current active template' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Template deactivated successfully' })
  async deactivate(@CurrentUser() user: AuthUser) {
    return this.templatesService.deactivate(user.restaurantId);
  }

  @Post(':id/schedules')
  @ApiOperation({ summary: 'Add a schedule to a template' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 201, description: 'Schedule created successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async createSchedule(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateScheduleDto,
  ) {
    return this.templatesService.createSchedule(id, user.restaurantId, dto);
  }

  @Patch(':id/schedules/:scheduleId')
  @ApiOperation({ summary: 'Update a schedule' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Schedule updated successfully' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async updateSchedule(
    @Param('scheduleId') scheduleId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.templatesService.updateSchedule(scheduleId, user.restaurantId, dto);
  }

  @Delete(':id/schedules/:scheduleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a schedule' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Schedule deleted successfully' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  async deleteSchedule(
    @Param('scheduleId') scheduleId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.templatesService.deleteSchedule(scheduleId, user.restaurantId);
  }
}
