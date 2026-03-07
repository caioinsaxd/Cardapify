import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post()
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateProductDto) {
    return this.productService.create(user.restaurantId, dto);
  }

  @Get('category/:categoryId')
  async findByCategory(@CurrentUser() user: AuthUser, @Param('categoryId') categoryId: string) {
    return this.productService.findByCategory(user.restaurantId, categoryId);
  }

  @Get(':id/toggle-active')
  async toggleActive(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.productService.toggleActive(user.restaurantId, id);
  }

  @Get()
  async findAll(@CurrentUser() user: AuthUser) {
    return this.productService.findAll(user.restaurantId);
  }

  @Get(':id')
  async findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.productService.findOne(user.restaurantId, id);
  }

  @Patch(':id')
  async update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(user.restaurantId, id, dto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.productService.remove(user.restaurantId, id);
  }
}
