import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

const FORBIDDEN_URL_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:'];

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

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

  async create(restaurantId: string, dto: CreateProductDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const category = await this.prisma.category.findFirst({
      where: {
        id: dto.categoryId,
        restaurantId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.imageUrl) {
      this.validateUrl(dto.imageUrl);
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        description: dto.description || null,
        price: dto.price,
        imageUrl: dto.imageUrl || null,
        categoryId: dto.categoryId,
      },
      include: {
        category: true,
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

    return this.prisma.product.findMany({
      where: {
        category: {
          restaurantId,
        },
      },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByCategory(restaurantId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        restaurantId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.product.findMany({
      where: { categoryId },
      orderBy: { createdAt: 'asc' },
      include: {
        category: true,
      },
    });
  }

  async findOne(restaurantId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        category: {
          restaurantId,
        },
      },
      include: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(restaurantId: string, productId: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        category: {
          restaurantId,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.imageUrl) {
      this.validateUrl(dto.imageUrl);
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        name: dto.name || product.name,
        description: dto.description !== undefined ? dto.description : product.description,
        price: dto.price !== undefined ? dto.price : product.price,
        imageUrl: dto.imageUrl !== undefined ? dto.imageUrl : product.imageUrl,
      },
      include: {
        category: true,
      },
    });
  }

  async remove(restaurantId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        category: {
          restaurantId,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.delete({
      where: { id: productId },
    });
  }

  async toggleActive(restaurantId: string, productId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        id: productId,
        category: {
          restaurantId,
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: { isActive: !product.isActive },
      include: {
        category: true,
      },
    });
  }
}
