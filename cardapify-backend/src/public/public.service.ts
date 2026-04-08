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
  allowObservations: boolean;
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
  allowObservations: true,
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

interface Section {
  id: string;
  type: string;
  order: number;
  styling?: {
    backgroundColor?: string;
    paddingTop?: number;
    paddingBottom?: number;
  };
  config?: {
    categoryId?: string;
    productIds?: string[];
    columns?: number;
    cardConfig?: {
      image?: { show: boolean };
      name?: { show: boolean };
      description?: { show: boolean };
      price?: { show: boolean };
      addButton?: { show: boolean };
    };
    title?: string;
    content?: string;
    alignment?: string;
    imageUrl?: string;
    overlayOpacity?: number;
    height?: number;
  };
}

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

    const settings = (restaurant.settings as JsonObject) || {};
    const orderSettings = (settings.orderSettings as OrderSettings) || DEFAULT_ORDER_SETTINGS;
    const businessHours = (settings.businessHours as BusinessHours[]) || DEFAULT_BUSINESS_HOURS;

    const activePage = await this.prisma.menuPage.findFirst({
      where: {
        restaurantId,
        isActive: true,
      },
    });

    if (activePage && activePage.sections && (activePage.sections as Section[]).length > 0) {
      const sections = (activePage.sections as Section[]) || [];
      const categoryIds = new Set<string>();
      const productIds = new Set<string>();

      sections.forEach(section => {
        if (section.type === 'PRODUCT_GRID' && section.config) {
          if (section.config.categoryId) categoryIds.add(section.config.categoryId);
          if (section.config.productIds) {
            section.config.productIds.forEach(id => productIds.add(id));
          }
        }
      });

      const [categoriesData, productsData] = await Promise.all([
        categoryIds.size > 0
          ? this.prisma.category.findMany({
              where: { id: { in: Array.from(categoryIds) } },
              orderBy: { order: 'asc' },
            })
          : [],
        productIds.size > 0 || categoryIds.size > 0
          ? this.prisma.product.findMany({
              where: {
                isActive: true,
                ...(productIds.size > 0 ? { id: { in: Array.from(productIds) } } : {}),
                ...(categoryIds.size > 0 ? { categoryId: { in: Array.from(categoryIds) } } : {}),
              },
              include: { category: true },
              orderBy: { name: 'asc' },
            })
          : [],
      ]);

      const enrichedSections = sections.map(section => {
        if (section.type !== 'PRODUCT_GRID' || !section.config) {
          return section;
        }

        let sectionProducts = [...productsData];

        if (section.config.categoryId) {
          sectionProducts = productsData.filter(p => p.categoryId === section.config.categoryId);
        }

        if (section.config.productIds && section.config.productIds.length > 0) {
          const productIdSet = new Set(section.config.productIds);
          sectionProducts = productsData.filter(p => productIdSet.has(p.id));
        }

        const category = categoriesData.find(c => c.id === section.config.categoryId);

        return {
          ...section,
          products: sectionProducts.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price.toString(),
            imageUrl: p.imageUrl,
          })),
          category: category ? { id: category.id, name: category.name } : null,
        };
      });

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
        page: {
          id: activePage.id,
          name: activePage.name,
          useTabs: activePage.useTabs,
          tabs: activePage.tabs || [],
          styling: activePage.styling,
        },
        sections: enrichedSections,
        isPageBuilder: true,
      };
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
      isPageBuilder: false,
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
      throw new BadRequestException('Por favor coloque um número de mesa válido');
    }

    const today = new Date();
    const currentDay = DAY_MAP[today.getDay()];
    const dayHours = businessHours.find(h => h.day === currentDay);

    if (!dayHours || !dayHours.isOpen) {
      throw new BadRequestException('Restaurante fechado no momento');
    }

    const currentTime = today.toTimeString().slice(0, 5);
    if (currentTime < dayHours.openTime || currentTime > dayHours.closeTime) {
      throw new BadRequestException('Restaurante fechado no momento');
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
      throw new BadRequestException('Um ou mais produtos não estão disponíveis');
    }

    for (const item of dto.items) {
      const product = products.find(p => p.id === item.productId);
      
      if (!product) {
        throw new NotFoundException(`Produto não encontrado`);
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
        `Pedido mínimo: R$ ${orderSettings.minimumOrderAmount.toFixed(2)}`,
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
          observations: dto.observations?.trim() || null,
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
