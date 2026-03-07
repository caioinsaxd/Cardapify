import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdateSettingsDto,
  UpdateWebSettingsDto,
  UpdateTotemSettingsDto,
} from './dto/settings.dto';
import {
  DEFAULT_TEMPLATES,
  DEFAULT_SETTINGS,
  DEFAULT_WEB_SETTINGS,
  DEFAULT_TOTEM_SETTINGS,
} from './constants/default-templates';
import { containsDangerousKeys, getDangerousKeys } from '../common/utils/dangerous-keys.util';

export interface JsonObject {
  [key: string]: string | number | boolean | null | JsonObject | JsonObject[];
}

export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];

const FORBIDDEN_URL_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:'];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private readonly dangerousKeys = getDangerousKeys();

  constructor(private prisma: PrismaService) {}

  async getSettings(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return {
      settings: (restaurant.settings as JsonObject) || DEFAULT_SETTINGS,
      webSettings: (restaurant.webSettings as JsonObject) || DEFAULT_WEB_SETTINGS,
      totemSettings: (restaurant.totemSettings as JsonObject) || DEFAULT_TOTEM_SETTINGS,
    };
  }

  async updateSettings(restaurantId: string, dto: UpdateSettingsDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const plainDto = JSON.parse(JSON.stringify(dto)) as JsonObject;
    
    await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: { settings: plainDto },
    });

    return plainDto;
  }

  async updateWebSettings(restaurantId: string, dto: UpdateWebSettingsDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const currentWebSettings = (restaurant.webSettings as JsonObject) || DEFAULT_WEB_SETTINGS;
    this.validateUrls(dto);
    const mergedWebSettings = this.mergeDeep(currentWebSettings, dto as JsonObject);

    await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: { webSettings: mergedWebSettings },
    });

    return mergedWebSettings;
  }

  async updateTotemSettings(restaurantId: string, dto: UpdateTotemSettingsDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const currentTotemSettings = (restaurant.totemSettings as JsonObject) || DEFAULT_TOTEM_SETTINGS;
    const mergedTotemSettings = this.mergeDeep(currentTotemSettings, dto as JsonObject);

    await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: { totemSettings: mergedTotemSettings },
    });

    return mergedTotemSettings;
  }

  async getTemplates() {
    return DEFAULT_TEMPLATES.map(({ id, name, description }) => ({
      id,
      name,
      description,
    }));
  }

  async getTemplate(templateId: string) {
    const template = DEFAULT_TEMPLATES.find((t) => t.id === templateId);

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async applyTemplate(restaurantId: string, templateId: string) {
    const template = DEFAULT_TEMPLATES.find((t) => t.id === templateId);

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const updated = await this.prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        settings: template.settings as JsonObject,
        webSettings: template.webSettings as JsonObject,
        totemSettings: template.totemSettings as JsonObject,
      },
    });

    return {
      settings: (updated.settings as JsonObject) || DEFAULT_SETTINGS,
      webSettings: (updated.webSettings as JsonObject) || DEFAULT_WEB_SETTINGS,
      totemSettings: (updated.totemSettings as JsonObject) || DEFAULT_TOTEM_SETTINGS,
    };
  }

  private mergeDeep(target: JsonObject, source: JsonObject): JsonObject {
    const output: JsonObject = Object.create(null);

    const targetKeys = Object.keys(target);
    for (const key of targetKeys) {
      if (!this.dangerousKeys.includes(key)) {
        output[key] = target[key];
      }
    }

    const sourceKeys = Object.keys(source);
    for (const key of sourceKeys) {
      if (this.dangerousKeys.includes(key)) {
        continue;
      }

      const sourceValue = source[key];
      const targetValue = output[key];

      if (
        isPlainObject(sourceValue) &&
        isPlainObject(targetValue)
      ) {
        output[key] = this.mergeDeep(
          targetValue as JsonObject,
          sourceValue as JsonObject,
        );
      } else if (sourceValue !== undefined) {
        output[key] = sourceValue;
      }
    }

    return output;
  }

  private validateUrls(obj: unknown): void {
    if (!isPlainObject(obj)) {
      return;
    }

    const keys = Object.keys(obj);

    for (const key of keys) {
      const value = (obj as Record<string, unknown>)[key];

      if (key === 'logoUrl' || key === 'coverImage') {
        if (typeof value === 'string' && value) {
          this.validateUrl(value);
        }
      } else if (isPlainObject(value)) {
        this.validateUrls(value);
      }
    }
  }

  private validateUrl(url: string): void {
    if (!url) {
      return;
    }

    const lowerUrl = url.toLowerCase().trim();

    for (const protocol of FORBIDDEN_URL_PROTOCOLS) {
      if (lowerUrl.startsWith(protocol)) {
        throw new BadRequestException(`URL contains forbidden protocol: ${protocol}`);
      }
    }

    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new BadRequestException('URL must use HTTP or HTTPS protocol');
      }
    } catch {
      throw new BadRequestException('Invalid URL format');
    }
  }
}
