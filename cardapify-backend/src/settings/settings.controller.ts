import { Controller, Get, Patch, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { SettingsService } from './settings.service';
import {
  UpdateSettingsDto,
  UpdateWebSettingsDto,
  UpdateTotemSettingsDto,
  ApplyTemplateDto,
} from './dto/settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  async getSettings(@Request() req: any) {
    return this.settingsService.getSettings(req.user.restaurantId);
  }

  @Patch()
  async updateSettings(@Request() req: any, @Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(req.user.restaurantId, dto);
  }

  @Patch('web')
  async updateWebSettings(@Request() req: any, @Body() dto: UpdateWebSettingsDto) {
    return this.settingsService.updateWebSettings(req.user.restaurantId, dto);
  }

  @Patch('totem')
  async updateTotemSettings(@Request() req: any, @Body() dto: UpdateTotemSettingsDto) {
    return this.settingsService.updateTotemSettings(req.user.restaurantId, dto);
  }

  @Get('templates')
  async getTemplates() {
    return this.settingsService.getTemplates();
  }

  @Get('templates/:id')
  async getTemplate(@Param('id') id: string) {
    return this.settingsService.getTemplate(id);
  }

  @Post('templates/apply')
  async applyTemplate(@Request() req: any, @Body() dto: ApplyTemplateDto) {
    return this.settingsService.applyTemplate(req.user.restaurantId, dto.templateId);
  }
}
