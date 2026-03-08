import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiParam } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateProductDto) {
    return this.productService.create(user.restaurantId, dto);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get all products in a specific category' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  @ApiParam({ name: 'categoryId', description: 'Category UUID' })
  async findByCategory(@CurrentUser() user: AuthUser, @Param('categoryId') categoryId: string) {
    return this.productService.findByCategory(user.restaurantId, categoryId);
  }

  @Get(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle product active status' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Product status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  async toggleActive(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.productService.toggleActive(user.restaurantId, id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products for the restaurant' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async findAll(@CurrentUser() user: AuthUser) {
    return this.productService.findAll(user.restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific product by ID' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  async findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.productService.findOne(user.restaurantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  async update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(user.restaurantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.productService.remove(user.restaurantId, id);
  }
}
