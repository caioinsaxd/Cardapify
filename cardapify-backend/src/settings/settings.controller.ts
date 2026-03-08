import { Controller, Get, Patch, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import {
  UpdateSettingsDto,
  UpdateWebSettingsDto,
  UpdateTotemSettingsDto,
  ApplyTemplateDto,
} from './dto/settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@ApiTags('Settings')
@ApiBearerAuth('JWT-auth')
@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get restaurant settings' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Settings retrieved successfully' })
  async getSettings(@CurrentUser() user: AuthUser) {
    return this.settingsService.getSettings(user.restaurantId);
  }

  @Patch()
  @ApiOperation({ summary: 'Update restaurant settings' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  async updateSettings(@CurrentUser() user: AuthUser, @Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(user.restaurantId, dto);
  }

  @Patch('web')
  @ApiOperation({ summary: 'Update web-specific settings' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Web settings updated successfully' })
  async updateWebSettings(@CurrentUser() user: AuthUser, @Body() dto: UpdateWebSettingsDto) {
    return this.settingsService.updateWebSettings(user.restaurantId, dto);
  }

  @Patch('totem')
  @ApiOperation({ summary: 'Update totem-specific settings' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Totem settings updated successfully' })
  async updateTotemSettings(@CurrentUser() user: AuthUser, @Body() dto: UpdateTotemSettingsDto) {
    return this.settingsService.updateTotemSettings(user.restaurantId, dto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all available templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getTemplates() {
    return this.settingsService.getTemplates();
  }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Get a specific template by ID' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async getTemplate(@Param('id') id: string) {
    return this.settingsService.getTemplate(id);
  }

  @Post('templates/apply')
  @ApiOperation({ summary: 'Apply a template to the restaurant' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Template applied successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async applyTemplate(@CurrentUser() user: AuthUser, @Body() dto: ApplyTemplateDto) {
    return this.settingsService.applyTemplate(user.restaurantId, dto.templateId);
  }
}
