import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePublicOrderDto } from './dto/public.dto';
import { Decimal } from '@prisma/client/runtime/library';

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

    return {
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
      },
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

    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
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

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          tableNumber: dto.tableNumber,
          total,
          restaurantId,
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

      this.logger.log(`Public order created: ${order.id} for table ${dto.tableNumber}`);

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
