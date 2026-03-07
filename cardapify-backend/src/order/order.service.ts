import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderStatusEnum, UpdateOrderItemDto } from './dto/order.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async create(restaurantId: string, dto: CreateOrderDto) {
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

    for (const item of dto.items) {
      const product = await this.prisma.product.findFirst({
        where: {
          id: item.productId,
          category: {
            restaurantId,
          },
        },
      });

      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      if (!product.isActive) {
        throw new BadRequestException(`Product ${product.name} is not available`);
      }

      const itemTotal = product.price.mul(item.quantity);
      total = total.add(itemTotal);

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    return this.prisma.order.create({
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
            product: true,
          },
        },
      },
    });
  }

  async findAll(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    return this.prisma.order.findMany({
      where: { restaurantId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(restaurantId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateStatus(restaurantId: string, orderId: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: dto.status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async updateItemQuantity(
    restaurantId: string,
    orderId: string,
    orderItemId: string,
    dto: UpdateOrderItemDto,
  ) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        orderId,
      },
      include: {
        product: true,
      },
    });

    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }

    const oldTotal = orderItem.price.mul(orderItem.quantity);
    const newTotal = orderItem.price.mul(dto.quantity);
    const totalDifference = newTotal.sub(oldTotal);
    const updatedOrderTotal = order.total.add(totalDifference);

    const updatedOrderItem = await this.prisma.orderItem.update({
      where: { id: orderItemId },
      data: { quantity: dto.quantity },
      include: { product: true },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { total: updatedOrderTotal },
    });

    return updatedOrderItem;
  }

  async removeItem(restaurantId: string, orderId: string, orderItemId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        orderId,
      },
    });

    if (!orderItem) {
      throw new NotFoundException('Order item not found');
    }

    const itemTotal = orderItem.price.mul(orderItem.quantity);
    const updatedOrderTotal = order.total.sub(itemTotal);

    await this.prisma.orderItem.delete({
      where: { id: orderItemId },
    });

    await this.prisma.order.update({
      where: { id: orderId },
      data: { total: updatedOrderTotal },
    });

    return { message: 'Order item removed successfully' };
  }

  async cancel(restaurantId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === 'COMPLETED' || order.status === 'CANCELLED') {
      throw new BadRequestException(`Cannot cancel order with status ${order.status}`);
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }
}
