import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from '../product/product.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from '../product/dto/product.dto';
import { Decimal } from '@prisma/client/runtime/library';

describe('ProductService', () => {
  let service: ProductService;

  const restaurantId = 'restaurant-uuid-123';
  const categoryId = 'category-uuid-123';
  const productId = 'product-uuid-123';

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
  };

  const mockProduct = {
    id: productId,
    name: 'Cheeseburger',
    description: 'Delicious beef patty with cheese',
    price: new Decimal('15.99'),
    imageUrl: 'https://example.com/burger.jpg',
    isActive: true,
    categoryId,
    category: mockCategory,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      restaurant: {
        findUnique: jest.fn(),
      },
      category: {
        findFirst: jest.fn(),
      },
      product: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  describe('create', () => {
    const createDto: CreateProductDto = {
      name: 'Cheeseburger',
      description: 'Delicious beef patty with cheese',
      price: 15.99,
      imageUrl: 'https://example.com/burger.jpg',
      categoryId,
    };

    it('should successfully create a product', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.category.findFirst.mockResolvedValue(mockCategory);
      mockPrisma.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(restaurantId, createDto);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(createDto.name);
    });

    it('should throw NotFoundException if restaurant does not exist', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(null);

      await expect(service.create('invalid-restaurant', createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if category does not exist', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.category.findFirst.mockResolvedValue(null);

      await expect(service.create(restaurantId, createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(restaurantId, createDto)).rejects.toThrow(
        'Category not found',
      );
    });

    it('should throw BadRequestException for forbidden URL protocols', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.category.findFirst.mockResolvedValue(mockCategory);

      const dtoWithBadUrl: CreateProductDto = {
        ...createDto,
        imageUrl: 'javascript:alert(1)',
      };

      await expect(service.create(restaurantId, dtoWithBadUrl)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(restaurantId, dtoWithBadUrl)).rejects.toThrow(
        'URL contains forbidden protocol',
      );
    });

    it('should throw BadRequestException for invalid URL format', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.category.findFirst.mockResolvedValue(mockCategory);

      const dtoWithBadUrl: CreateProductDto = {
        ...createDto,
        imageUrl: 'not-a-valid-url',
      };

      await expect(service.create(restaurantId, dtoWithBadUrl)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow valid HTTP URL', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.category.findFirst.mockResolvedValue(mockCategory);
      mockPrisma.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(restaurantId, createDto);

      expect(result).toBeDefined();
    });

    it('should allow valid HTTPS URL', async () => {
      const httpsDto = { ...createDto, imageUrl: 'https://example.com/image.jpg' };
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.category.findFirst.mockResolvedValue(mockCategory);
      mockPrisma.product.create.mockResolvedValue(mockProduct);

      const result = await service.create(restaurantId, httpsDto);

      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return all products for a restaurant', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.findAll(restaurantId);

      expect(result).toHaveLength(1);
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: { category: { restaurantId } },
        include: { category: true },
        orderBy: { createdAt: 'asc' },
      });
    });

    it('should throw NotFoundException if restaurant does not exist', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(null);

      await expect(service.findAll('invalid-restaurant')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return empty array if no products exist', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.product.findMany.mockResolvedValue([]);

      const result = await service.findAll(restaurantId);

      expect(result).toHaveLength(0);
    });
  });

  describe('findByCategory', () => {
    it('should return products in a specific category', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(mockCategory);
      mockPrisma.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.findByCategory(restaurantId, categoryId);

      expect(result).toHaveLength(1);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockPrisma.category.findFirst.mockResolvedValue(null);

      await expect(
        service.findByCategory(restaurantId, 'invalid-category'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a specific product', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);

      const result = await service.findOne(restaurantId, productId);

      expect(result).toHaveProperty('id', productId);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);

      await expect(service.findOne(restaurantId, 'invalid-product')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should enforce multi-tenancy - return 404 for product from different restaurant', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('different-restaurant', productId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateProductDto = {
      name: 'Updated Cheeseburger',
      price: 18.99,
    };

    it('should successfully update a product', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);
      mockPrisma.product.update.mockResolvedValue({
        ...mockProduct,
        name: 'Updated Cheeseburger',
        price: new Decimal('18.99'),
      });

      const result = await service.update(restaurantId, productId, updateDto);

      expect(result.name).toBe('Updated Cheeseburger');
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);

      await expect(
        service.update(restaurantId, 'invalid-product', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should validate URL when updating with new imageUrl', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);
      const badDto: UpdateProductDto = { imageUrl: 'javascript:evil()' };

      await expect(
        service.update(restaurantId, productId, badDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should successfully delete a product', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);
      mockPrisma.product.delete.mockResolvedValue(mockProduct);

      const result = await service.remove(restaurantId, productId);

      expect(mockPrisma.product.delete).toHaveBeenCalledWith({ where: { id: productId } });
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);

      await expect(service.remove(restaurantId, 'invalid-product')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('toggleActive', () => {
    it('should toggle product from active to inactive', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);
      mockPrisma.product.update.mockResolvedValue({
        ...mockProduct,
        isActive: false,
      });

      const result = await service.toggleActive(restaurantId, productId);

      expect(result.isActive).toBe(false);
    });

    it('should toggle product from inactive to active', async () => {
      mockPrisma.product.findFirst.mockResolvedValue({ ...mockProduct, isActive: false });
      mockPrisma.product.update.mockResolvedValue({
        ...mockProduct,
        isActive: true,
      });

      const result = await service.toggleActive(restaurantId, productId);

      expect(result.isActive).toBe(true);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrisma.product.findFirst.mockResolvedValue(null);

      await expect(
        service.toggleActive(restaurantId, 'invalid-product'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
