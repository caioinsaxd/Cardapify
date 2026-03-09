import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../src/order/order.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOrderDto, UpdateOrderStatusDto, OrderStatusEnum } from '../src/order/dto/order.dto';
import { Decimal } from '@prisma/client/runtime/library';

describe('OrderService', () => {
  let service: OrderService;

  const restaurantId = 'restaurant-uuid-123';
  const orderId = 'order-uuid-123';
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

  const mockProduct = {
    id: productId,
    name: 'Cheeseburger',
    price: new Decimal('15.99'),
    isActive: true,
    categoryId: 'category-uuid-123',
  };

  const mockOrder = {
    id: orderId,
    tableNumber: 5,
    total: new Decimal('31.98'),
    status: 'PENDING' as const,
    restaurantId,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 'order-item-uuid-1',
        quantity: 2,
        price: new Decimal('15.99'),
        orderId,
        productId,
        product: mockProduct,
      },
    ],
  };

  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      restaurant: {
        findUnique: jest.fn(),
      },
      product: {
        findFirst: jest.fn(),
      },
      order: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      orderItem: {
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn((callback: any) => callback(mockPrisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  describe('create', () => {
    const createDto: CreateOrderDto = {
      tableNumber: 5,
      items: [{ productId, quantity: 2 }],
    };

    it('should successfully create an order', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);
      mockPrisma.order.create.mockResolvedValue(mockOrder);

      const result = await service.create(restaurantId, createDto);

      expect(result).toHaveProperty('id');
      expect(mockPrisma.order.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if restaurant does not exist', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(null);

      await expect(service.create('invalid-restaurant', createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if order has no items', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);

      await expect(
        service.create(restaurantId, { tableNumber: 1, items: [] }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.create(restaurantId, { tableNumber: 1, items: [] }),
      ).rejects.toThrow('Order must have at least one item');
    });

    it('should throw NotFoundException if product not found', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.product.findFirst.mockResolvedValue(null);

      await expect(service.create(restaurantId, createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if product is inactive', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.product.findFirst.mockResolvedValue({
        ...mockProduct,
        isActive: false,
      });

      await expect(service.create(restaurantId, createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(restaurantId, createDto)).rejects.toThrow(
        'is not available',
      );
    });

    it('should calculate total correctly using Decimal', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.product.findFirst.mockResolvedValue(mockProduct);
      mockPrisma.order.create.mockResolvedValue(mockOrder);

      await service.create(restaurantId, createDto);

      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            total: expect.any(Decimal),
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all orders for a restaurant', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.order.findMany.mockResolvedValue([mockOrder]);

      const result = await service.findAll(restaurantId);

      expect(result).toHaveLength(1);
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith({
        where: { restaurantId },
        include: { items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should throw NotFoundException if restaurant does not exist', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(null);

      await expect(service.findAll('invalid-restaurant')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return empty array if no orders exist', async () => {
      mockPrisma.restaurant.findUnique.mockResolvedValue(mockRestaurant);
      mockPrisma.order.findMany.mockResolvedValue([]);

      const result = await service.findAll(restaurantId);

      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a specific order', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(mockOrder);

      const result = await service.findOne(restaurantId, orderId);

      expect(result).toHaveProperty('id', orderId);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await expect(service.findOne(restaurantId, 'invalid-order')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should enforce multi-tenancy - return 404 for order from different restaurant', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne('different-restaurant', orderId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    const updateDto: UpdateOrderStatusDto = { status: OrderStatusEnum.PAID };

    it('should successfully update status from PENDING to PAID', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatusEnum.PAID,
      });

      const result = await service.updateStatus(restaurantId, orderId, updateDto);

      expect(result.status).toBe(OrderStatusEnum.PAID);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await expect(
        service.updateStatus(restaurantId, 'invalid-order', updateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const completedOrder = { ...mockOrder, status: OrderStatusEnum.COMPLETED };
      mockPrisma.order.findFirst.mockResolvedValue(completedOrder);

      await expect(
        service.updateStatus(restaurantId, orderId, { status: OrderStatusEnum.PREPARING }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateStatus(restaurantId, orderId, { status: OrderStatusEnum.PREPARING }),
      ).rejects.toThrow('Cannot transition from COMPLETED');
    });

    it('should allow valid transitions from PENDING', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue({ ...mockOrder, status: OrderStatusEnum.PAID });

      await expect(
        service.updateStatus(restaurantId, orderId, { status: OrderStatusEnum.PAID }),
      ).resolves.toBeDefined();
    });

    it('should allow transition from PENDING to CANCELLED', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatusEnum.CANCELLED,
      });

      const result = await service.updateStatus(restaurantId, orderId, {
        status: OrderStatusEnum.CANCELLED,
      });

      expect(result.status).toBe(OrderStatusEnum.CANCELLED);
    });
  });

  describe('updateItemQuantity', () => {
    it('should successfully update item quantity', async () => {
      const orderItem = {
        id: 'order-item-uuid-1',
        quantity: 2,
        price: new Decimal('15.99'),
        product: mockProduct,
      };

      mockPrisma.order.findFirst.mockResolvedValue(mockOrder);
      mockPrisma.orderItem.findFirst.mockResolvedValue(orderItem);
      mockPrisma.orderItem.update.mockResolvedValue({
        ...orderItem,
        quantity: 5,
      });
      mockPrisma.order.update.mockResolvedValue(mockOrder);

      const result = await service.updateItemQuantity(
        restaurantId,
        orderId,
        'order-item-uuid-1',
        { quantity: 5 },
      );

      expect(result.quantity).toBe(5);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await expect(
        service.updateItemQuantity(
          restaurantId,
          'invalid-order',
          'order-item-uuid-1',
          { quantity: 5 },
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if order item not found', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(mockOrder);
      mockPrisma.orderItem.findFirst.mockResolvedValue(null);

      await expect(
        service.updateItemQuantity(
          restaurantId,
          orderId,
          'invalid-item',
          { quantity: 5 },
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeItem', () => {
    it('should successfully remove an item from order', async () => {
      const orderItem = {
        id: 'order-item-uuid-1',
        quantity: 2,
        price: new Decimal('15.99'),
      };

      mockPrisma.order.findFirst.mockResolvedValue(mockOrder);
      mockPrisma.orderItem.findFirst.mockResolvedValue(orderItem);
      mockPrisma.orderItem.delete.mockResolvedValue(orderItem);
      mockPrisma.order.update.mockResolvedValue(mockOrder);

      const result = await service.removeItem(
        restaurantId,
        orderId,
        'order-item-uuid-1',
      );

      expect(result).toHaveProperty('message');
    });
  });

  describe('cancel', () => {
    it('should successfully cancel a PENDING order', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue({
        ...mockOrder,
        status: OrderStatusEnum.CANCELLED,
      });

      const result = await service.cancel(restaurantId, orderId);

      expect(result.status).toBe(OrderStatusEnum.CANCELLED);
    });

    it('should throw BadRequestException if order is already COMPLETED', async () => {
      const completedOrder = { ...mockOrder, status: OrderStatusEnum.COMPLETED };
      mockPrisma.order.findFirst.mockResolvedValue(completedOrder);

      await expect(service.cancel(restaurantId, orderId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.cancel(restaurantId, orderId)).rejects.toThrow(
        'Cannot cancel order with status COMPLETED',
      );
    });

    it('should throw BadRequestException if order is already CANCELLED', async () => {
      const cancelledOrder = { ...mockOrder, status: OrderStatusEnum.CANCELLED };
      mockPrisma.order.findFirst.mockResolvedValue(cancelledOrder);

      await expect(service.cancel(restaurantId, orderId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);

      await expect(service.cancel(restaurantId, 'invalid-order')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
