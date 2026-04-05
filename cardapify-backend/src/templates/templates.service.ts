import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTemplateDto,
  UpdateTemplateDto,
  CreateScheduleDto,
  UpdateScheduleDto,
  TemplateConfigDto,
  ScheduleType,
} from './dto/template.dto';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(restaurantId: string) {
    const templates = await this.prisma.menuTemplate.findMany({
      where: { restaurantId },
      include: {
        schedules: {
          orderBy: { priority: 'desc' },
        },
      },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return templates;
  }

  async findSystemTemplates() {
    const templates = await this.prisma.menuTemplate.findMany({
      where: { isSystem: true },
      orderBy: { name: 'asc' },
    });

    return templates;
  }

  async findAllForRestaurant(restaurantId: string) {
    const [userTemplates, systemTemplates] = await Promise.all([
      this.findAll(restaurantId),
      this.findSystemTemplates(),
    ]);

    return {
      userTemplates,
      systemTemplates,
    };
  }

  async findOne(id: string, restaurantId?: string) {
    const template = await this.prisma.menuTemplate.findUnique({
      where: { id },
      include: {
        schedules: {
          orderBy: { priority: 'desc' },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (restaurantId && template.restaurantId !== restaurantId && !template.isSystem) {
      throw new ForbiddenException('Access denied');
    }

    return template;
  }

  async create(restaurantId: string, dto: CreateTemplateDto) {
    let config: TemplateConfigDto = dto.config || {};

    if (dto.cloneFrom) {
      const sourceTemplate = await this.findOne(dto.cloneFrom);
      
      if (!sourceTemplate.isSystem && sourceTemplate.restaurantId !== restaurantId) {
        throw new ForbiddenException('Cannot clone this template');
      }

      config = JSON.parse(JSON.stringify(sourceTemplate.config)) as TemplateConfigDto;
    }

    const template = await this.prisma.menuTemplate.create({
      data: {
        restaurantId,
        name: dto.name,
        description: dto.description,
        isSystem: false,
        isActive: false,
        config: config as unknown as Prisma.InputJsonValue,
        schedules: dto.schedules?.length
          ? {
              create: dto.schedules.map((s) => ({
                type: s.type || ScheduleType.DAY_OF_WEEK,
                days: s.days || [],
                startTime: s.startTime,
                endTime: s.endTime,
                date: s.date ? new Date(s.date) : null,
                pattern: s.pattern,
                priority: s.priority || 0,
                isActive: s.isActive ?? true,
              })),
            }
          : undefined,
      },
      include: {
        schedules: true,
      },
    });

    return template;
  }

  async update(id: string, restaurantId: string, dto: UpdateTemplateDto) {
    const template = await this.findOne(id, restaurantId);

    if (template.isSystem) {
      throw new ForbiddenException('Cannot modify system templates');
    }

    const updateData: any = {};
    
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.config !== undefined) updateData.config = dto.config as unknown as Prisma.InputJsonValue;

    if (dto.isActive !== undefined && dto.isActive === true) {
      await this.prisma.menuTemplate.updateMany({
        where: {
          restaurantId,
          isActive: true,
          id: { not: id },
        },
        data: { isActive: false },
      });
      updateData.isActive = true;
    } else if (dto.isActive !== undefined) {
      updateData.isActive = false;
    }

    const updated = await this.prisma.menuTemplate.update({
      where: { id },
      data: updateData,
      include: {
        schedules: true,
      },
    });

    return updated;
  }

  async delete(id: string, restaurantId: string) {
    const template = await this.findOne(id, restaurantId);

    if (template.isSystem) {
      throw new ForbiddenException('Cannot delete system templates');
    }

    await this.prisma.menuTemplate.delete({
      where: { id },
    });

    return { message: 'Template deleted successfully' };
  }

  async activate(id: string, restaurantId: string) {
    const template = await this.findOne(id, restaurantId);

    if (template.isSystem) {
      await this.prisma.menuTemplate.updateMany({
        where: { restaurantId },
        data: { isActive: false },
      });

      const activated = await this.prisma.menuTemplate.update({
        where: { id },
        data: { isActive: true },
        include: { schedules: true },
      });

      return activated;
    }

    await this.prisma.menuTemplate.updateMany({
      where: {
        restaurantId,
        isActive: true,
        isSystem: false,
      },
      data: { isActive: false },
    });

    const activated = await this.prisma.menuTemplate.update({
      where: { id },
      data: { isActive: true },
      include: { schedules: true },
    });

    return activated;
  }

  async deactivate(restaurantId: string) {
    await this.prisma.menuTemplate.updateMany({
      where: {
        restaurantId,
        isActive: true,
        isSystem: false,
      },
      data: { isActive: false },
    });

    return { message: 'Template deactivated successfully' };
  }

  async createSchedule(
    templateId: string,
    restaurantId: string,
    dto: CreateScheduleDto,
  ) {
    const template = await this.findOne(templateId, restaurantId);

    if (template.isSystem) {
      throw new ForbiddenException('Cannot modify system templates');
    }

    const schedule = await this.prisma.templateSchedule.create({
      data: {
        templateId,
        type: dto.type ?? ScheduleType.DAY_OF_WEEK,
        days: dto.days || [],
        startTime: dto.startTime,
        endTime: dto.endTime,
        date: dto.date ? new Date(dto.date) : null,
        pattern: dto.pattern,
        priority: dto.priority || 0,
        isActive: dto.isActive ?? true,
      },
    });

    return schedule;
  }

  async updateSchedule(
    scheduleId: string,
    restaurantId: string,
    dto: UpdateScheduleDto,
  ) {
    const schedule = await this.prisma.templateSchedule.findUnique({
      where: { id: scheduleId },
      include: { template: true },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (schedule.template.isSystem) {
      throw new ForbiddenException('Cannot modify system templates');
    }

    if (schedule.template.restaurantId !== restaurantId) {
      throw new ForbiddenException('Access denied');
    }

    const updateData: any = {};
    
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.days !== undefined) updateData.days = dto.days;
    if (dto.startTime !== undefined) updateData.startTime = dto.startTime;
    if (dto.endTime !== undefined) updateData.endTime = dto.endTime;
    if (dto.date !== undefined) updateData.date = dto.date ? new Date(dto.date) : null;
    if (dto.pattern !== undefined) updateData.pattern = dto.pattern;
    if (dto.priority !== undefined) updateData.priority = dto.priority;
    if (dto.isActive !== undefined) updateData.isActive = dto.isActive;

    const updated = await this.prisma.templateSchedule.update({
      where: { id: scheduleId },
      data: updateData,
    });

    return updated;
  }

  async deleteSchedule(scheduleId: string, restaurantId: string) {
    const schedule = await this.prisma.templateSchedule.findUnique({
      where: { id: scheduleId },
      include: { template: true },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (schedule.template.isSystem) {
      throw new ForbiddenException('Cannot modify system templates');
    }

    if (schedule.template.restaurantId !== restaurantId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.templateSchedule.delete({
      where: { id: scheduleId },
    });

    return { message: 'Schedule deleted successfully' };
  }

  async getActiveTemplate(restaurantId: string) {
    const activeTemplate = await this.prisma.menuTemplate.findFirst({
      where: {
        restaurantId,
        isActive: true,
      },
      include: {
        schedules: {
          orderBy: { priority: 'desc' },
        },
      },
    });

    if (activeTemplate) {
      return activeTemplate;
    }

    const systemTemplate = await this.prisma.menuTemplate.findFirst({
      where: {
        isSystem: true,
        restaurantId: null,
      },
      orderBy: { name: 'asc' },
    });

    if (systemTemplate) {
      return systemTemplate;
    }

    return null;
  }
}
