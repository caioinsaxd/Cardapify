import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from '../src/settings/settings.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateSettingsDto, UpdateWebSettingsDto, UpdateTotemSettingsDto } from '../src/settings/dto/settings.dto';
import { DEFAULT_TEMPLATES } from '../src/settings/constants/default-templates';

describe('SettingsService', () => {
  let service: SettingsService;

  const restaurantId = 'restaurant-uuid-123';

  const mockRestaurant = {
    id: restaurantId,
    name: 'Test Restaurant',
    settings: {
      theme: { primaryColor: '#FF6B35' },
      currency: 'BRL',
    },
    webSettings: {
      logoUrl: 'https://example.com/logo.png',
    },
    totemSettings: {
      idle: { idleTimeout: 60 },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      restaurant: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  describe('getSettings', () => {
    it('should return settings for a restaurant', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);

      const result = await service.getSettings(restaurantId);

      expect(result).toHaveProperty('settings');
      expect(result).toHaveProperty('webSettings');
      expect(result).toHaveProperty('totemSettings');
    });

    it('should throw NotFoundException if restaurant does not exist', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(null);

      await expect(service.getSettings('invalid-restaurant')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return default settings if restaurant has no settings', async () => {
      const restaurantWithoutSettings = {
        ...mockRestaurant,
        settings: null,
        webSettings: null,
        totemSettings: null,
      };
      mockPrisma.restaurant.findUnique.mockResolvedValue(restaurantWithoutSettings);

      const result = await service.getSettings(restaurantId);

      expect(result.settings).toBeDefined();
      expect(result.webSettings).toBeDefined();
      expect(result.totemSettings).toBeDefined();
    });
  });

  describe('updateSettings', () => {
    it('should successfully update settings', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.restaurant.update.mockResolvedValue({
        ...mockRestaurant,
        settings: { theme: { primaryColor: '#000000' } },
      });

      const updateDto: UpdateSettingsDto = {
        theme: { primaryColor: '#000000' },
      };

      const result = await service.updateSettings(restaurantId, updateDto);

      expect(mockPrisma.restaurant.update).toHaveBeenCalledWith({
        where: { id: restaurantId },
        data: { settings: expect.any(Object) },
      });
    });

    it('should throw NotFoundException if restaurant does not exist', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(null);

      await expect(
        service.updateSettings('invalid-restaurant', { theme: {} }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateWebSettings', () => {
    it('should successfully update web settings', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.restaurant.update.mockResolvedValue({
        ...mockRestaurant,
        webSettings: { logoUrl: 'https://new-logo.com/logo.png' },
      });

      const updateDto: UpdateWebSettingsDto = {
        logoUrl: 'https://new-logo.com/logo.png',
      };

      const result = await service.updateWebSettings(restaurantId, updateDto);

      expect(result).toHaveProperty('logoUrl');
    });

    it('should throw BadRequestException for forbidden URL protocols', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);

      const badDto: UpdateWebSettingsDto = {
        logoUrl: 'javascript:alert(1)',
      };

      await expect(
        service.updateWebSettings(restaurantId, badDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid URL format', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);

      const badDto: UpdateWebSettingsDto = {
        logoUrl: 'not-a-valid-url',
      };

      await expect(
        service.updateWebSettings(restaurantId, badDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should allow valid HTTPS URL', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.restaurant.update.mockResolvedValue({
        ...mockRestaurant,
        webSettings: { logoUrl: 'https://secure.com/logo.png' },
      });

      const result = await service.updateWebSettings(restaurantId, {
        logoUrl: 'https://secure.com/logo.png',
      });

      expect(result).toBeDefined();
    });
  });

  describe('updateTotemSettings', () => {
    it('should successfully update totem settings', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.restaurant.update.mockResolvedValue({
        ...mockRestaurant,
        totemSettings: { idle: { idleTimeout: 120 } },
      });

      const updateDto: UpdateTotemSettingsDto = {
        idle: { idleTimeout: 120 },
      };

      const result = await service.updateTotemSettings(restaurantId, updateDto);

      expect(result).toHaveProperty('idle');
    });

    it('should throw NotFoundException if restaurant does not exist', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(null);

      await expect(
        service.updateTotemSettings('invalid-restaurant', { idle: {} }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTemplates', () => {
    it('should return all available templates', async () => {
      const result = await service.getTemplates();

      expect(result).toHaveLength(6);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('settings');
    });

    it('should include all template properties', async () => {
      const templates = await service.getTemplates();

      templates.forEach((template) => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('settings');
        expect(template).toHaveProperty('webSettings');
        expect(template).toHaveProperty('totemSettings');
      });
    });
  });

  describe('getTemplate', () => {
    it('should return a specific template by ID', async () => {
      const result = await service.getTemplate('dark');

      expect(result).toBeDefined();
      expect(result.id).toBe('dark');
      expect(result.name).toBeDefined();
    });

    it('should throw NotFoundException for invalid template ID', async () => {
      await expect(service.getTemplate('invalid-template')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('applyTemplate', () => {
    it('should successfully apply a template', async () => {
      const template = DEFAULT_TEMPLATES[0];
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.restaurant.update.mockResolvedValue({
        ...mockRestaurant,
        settings: template.settings,
        webSettings: template.webSettings,
        totemSettings: template.totemSettings,
      });

      const result = await service.applyTemplate(restaurantId, template.id);

      expect(result).toHaveProperty('settings');
      expect(result).toHaveProperty('webSettings');
      expect(result).toHaveProperty('totemSettings');
    });

    it('should throw NotFoundException if restaurant does not exist', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(null);

      await expect(
        service.applyTemplate('invalid-restaurant', 'dark'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if template does not exist', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);

      await expect(
        service.applyTemplate(restaurantId, 'non-existent-template'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
