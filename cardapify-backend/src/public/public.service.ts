import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublicOrderDto } from './dto/public.dto';
import { Decimal } from '@prisma/client/runtime/library';

export interface JsonObject {
  [key: string]: unknown;
}

export interface OrderSettings {
  requireTableNumber: boolean;
  minimumOrderAmount: number;
  autoConfirmOrders: boolean;
  preparationTimeMinutes: number;
}

export interface BusinessHours {
  day: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

const DEFAULT_ORDER_SETTINGS: OrderSettings = {
  requireTableNumber: true,
  minimumOrderAmount: 0,
  autoConfirmOrders: false,
  preparationTimeMinutes: 30,
};

const DEFAULT_BUSINESS_HOURS: BusinessHours[] = [
  { day: 'monday', openTime: '09:00', closeTime: '22:00', isOpen: true },
  { day: 'tuesday', openTime: '09:00', closeTime: '22:00', isOpen: true },
  { day: 'wednesday', openTime: '09:00', closeTime: '22:00', isOpen: true },
  { day: 'thursday', openTime: '09:00', closeTime: '22:00', isOpen: true },
  { day: 'friday', openTime: '09:00', closeTime: '23:00', isOpen: true },
  { day: 'saturday', openTime: '10:00', closeTime: '23:00', isOpen: true },
  { day: 'sunday', openTime: '10:00', closeTime: '21:00', isOpen: true },
];

const DAY_MAP: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

@Injectable()
export class PublicService {
  private readonly logger = new Logger(PublicService.name);

  constructor(private prisma: PrismaService) {}

  async getMenu(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const categories = await this.prisma.category.findMany({
      where: {
        restaurantId,
      },
      orderBy: { createdAt: 'asc' },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            imageUrl: true,
          },
        },
      },
    });

    const settings = (restaurant.settings as JsonObject) || {};
    const orderSettings = (settings.orderSettings as OrderSettings) || DEFAULT_ORDER_SETTINGS;
    const businessHours = (settings.businessHours as BusinessHours[]) || DEFAULT_BUSINESS_HOURS;

    return {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        phone: (restaurant as any).phone || null,
        description: (restaurant as any).description || null,
      },
      orderSettings,
      businessHours,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        products: cat.products,
      })),
    };
  }

  async getActiveProducts(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const products = await this.prisma.product.findMany({
      where: {
        isActive: true,
        category: {
          restaurantId,
        },
      },
      orderBy: { name: 'asc' },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return products;
  }

  async createOrder(restaurantId: string, dto: CreatePublicOrderDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const settings = (restaurant.settings as JsonObject) || {};
    const orderSettings = (settings.orderSettings as OrderSettings) || DEFAULT_ORDER_SETTINGS;
    const businessHours = (settings.businessHours as BusinessHours[]) || DEFAULT_BUSINESS_HOURS;

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    if (orderSettings.requireTableNumber && (!dto.tableNumber || dto.tableNumber <= 0)) {
      throw new BadRequestException('Table number is required');
    }

    const today = new Date();
    const currentDay = DAY_MAP[today.getDay()];
    const dayHours = businessHours.find(h => h.day === currentDay);

    if (!dayHours || !dayHours.isOpen) {
      throw new BadRequestException('Restaurant is currently closed');
    }

    const currentTime = today.toTimeString().slice(0, 5);
    if (currentTime < dayHours.openTime || currentTime > dayHours.closeTime) {
      throw new BadRequestException('Restaurant is currently closed');
    }

    let total = new Decimal(0);
    const orderItems: Array<{
      productId: string;
      quantity: number;
      price: Decimal;
    }> = [];

    const productIds = dto.items.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
        category: {
          restaurantId,
        },
      },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products are not available');
    }

    for (const item of dto.items) {
      const product = products.find(p => p.id === item.productId);
      
      if (!product) {
        throw new NotFoundException(`Product not found`);
      }

      const itemTotal = product.price.mul(item.quantity);
      total = total.add(itemTotal);

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    if (orderSettings.minimumOrderAmount > 0 && total.lessThan(orderSettings.minimumOrderAmount)) {
      throw new BadRequestException(
        `Minimum order amount is R$ ${orderSettings.minimumOrderAmount.toFixed(2)}`,
      );
    }

    const initialStatus = orderSettings.autoConfirmOrders ? 'PAID' : 'PENDING';

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          tableNumber: dto.tableNumber || 0,
          total,
          restaurantId,
          status: initialStatus,
          items: {
            createMany: {
              data: orderItems,
            },
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      this.logger.log(`Public order created: ${order.id} for table ${dto.tableNumber}, status: ${order.status}`);

      return {
        orderId: order.id,
        tableNumber: order.tableNumber,
        status: order.status,
        total: order.total.toString(),
        items: order.items.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.price.toString(),
        })),
        createdAt: order.createdAt,
        estimatedTime: orderSettings.preparationTimeMinutes,
      };
    });
  }

  async getOrderStatus(restaurantId: string, orderId: string, tableNumber: number) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId,
        tableNumber,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      orderId: order.id,
      tableNumber: order.tableNumber,
      status: order.status,
      total: order.total.toString(),
      items: order.items.map(item => ({
        productName: item.product.name,
        quantity: item.quantity,
      })),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
