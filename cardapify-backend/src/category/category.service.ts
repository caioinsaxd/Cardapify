import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async create(restaurantId: string, dto: CreateCategoryDto) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const existingCategory = await this.prisma.category.findFirst({
      where: {
        restaurantId,
        name: dto.name,
      },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists for this restaurant');
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        restaurantId,
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

    return this.prisma.category.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async findOne(restaurantId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        restaurantId,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(restaurantId: string, categoryId: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        restaurantId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const existingCategory = await this.prisma.category.findFirst({
      where: {
        restaurantId,
        name: dto.name,
        NOT: { id: categoryId },
      },
    });

    if (existingCategory) {
      throw new ConflictException('Category with this name already exists for this restaurant');
    }

    return this.prisma.category.update({
      where: { id: categoryId },
      data: { name: dto.name },
    });
  }

  async remove(restaurantId: string, categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        restaurantId,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.category.delete({
      where: { id: categoryId },
    });
  }
}
