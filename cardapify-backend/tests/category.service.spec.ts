import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../src/category/category.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from '../src/category/dto/category.dto';

describe('CategoryService', () => {
  let service: CategoryService;

  const restaurantId = 'restaurant-uuid-123';
  const categoryId = 'category-uuid-123';

  const mockRestaurant = {
    id: restaurantId,
    name: 'Test Restaurant',
    settings: {},
    webSettings: {},
    totemSettings: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategory = {
    id: categoryId,
    name: 'Burgers',
    restaurantId,
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: { products: 5 },
  };

  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      restaurant: {
        findUnique: jest.fn(),
      },
      category: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  describe('create', () => {
    const createDto: CreateCategoryDto = { name: 'Burgers' };

    it('should successfully create a category', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.category.findFirst.mockResolvedValue(null);
      mockPrisma.category.create.mockResolvedValue(mockCategory);

      const result = await service.create(restaurantId, createDto);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(createDto.name);
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: {
          name: createDto.name,
          restaurantId,
        },
      });
    });

    it('should throw NotFoundException if restaurant does not exist', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(null);

      await expect(service.create('invalid-restaurant', createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create('invalid-restaurant', createDto)).rejects.toThrow(
        'Restaurant not found',
      );
    });

    it('should throw ConflictException if category name already exists (case-insensitive)', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.category.findFirst.mockResolvedValue(mockCategory);

      await expect(service.create(restaurantId, { name: 'burgers' })).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(restaurantId, { name: 'burgers' })).rejects.toThrow(
        'Category with this name already exists for this restaurant',
      );
    });
  });

  describe('findAll', () => {
    it('should return all categories for a restaurant', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.category.findMany.mockResolvedValue([mockCategory]);

      const result = await service.findAll(restaurantId);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('name');
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        where: { restaurantId },
        orderBy: { createdAt: 'asc' },
        include: { _count: { select: { products: true } } },
      });
    });

    it('should throw NotFoundException if restaurant does not exist', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(null);

      await expect(service.findAll('invalid-restaurant')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return empty array if no categories exist', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.category.findMany.mockResolvedValue([]);

      const result = await service.findAll(restaurantId);

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a specific category', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(mockCategory);

      const result = await service.findOne(restaurantId, categoryId);

      expect(result).toHaveProperty('id', categoryId);
      expect(result).toHaveProperty('_count');
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null);

      await expect(service.findOne(restaurantId, 'invalid-category')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(restaurantId, 'invalid-category')).rejects.toThrow(
        'Category not found',
      );
    });

    it('should enforce multi-tenancy - return 404 for category from different restaurant', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('different-restaurant', categoryId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateCategoryDto = { name: 'Updated Burgers' };

    it('should successfully update a category', async () => {
      mockPrisma.category.findFirst.mockResolvedValueOnce(mockCategory);
      mockPrisma.category.findFirst.mockResolvedValueOnce(null);
      mockPrisma.category.update.mockResolvedValue({
        ...mockCategory,
        name: 'Updated Burgers',
      });

      const result = await service.update(restaurantId, categoryId, updateDto);

      expect(result.name).toBe('Updated Burgers');
      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: categoryId },
        data: { name: updateDto.name },
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null);

      await expect(
        service.update(restaurantId, 'invalid-category', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if new name already exists', async () => {
      mockPrisma.category.findFirst.mockResolvedValueOnce(mockCategory);
      mockPrisma.category.findFirst.mockResolvedValueOnce({
        ...mockCategory,
        id: 'different-category',
      });

      await expect(
        service.update(restaurantId, categoryId, { name: 'Existing' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should successfully delete a category', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(mockCategory);
      mockPrisma.category.delete.mockResolvedValue(mockCategory);

      const result = await service.remove(restaurantId, categoryId);

      expect(mockPrisma.category.delete).toHaveBeenCalledWith({ where: { id: categoryId } });
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null);

      await expect(service.remove(restaurantId, 'invalid-category')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should enforce multi-tenancy - return 404 for category from different restaurant', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null);

      await expect(
        service.remove('different-restaurant', categoryId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
