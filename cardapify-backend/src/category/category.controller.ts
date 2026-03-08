import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiParam } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@ApiTags('Categories')
@ApiBearerAuth('JWT-auth')
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 409, description: 'Category with this name already exists' })
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateCategoryDto) {
    return this.categoryService.create(user.restaurantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories for the restaurant' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async findAll(@CurrentUser() user: AuthUser) {
    return this.categoryService.findAll(user.restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific category by ID' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  async findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.categoryService.findOne(user.restaurantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiResponse({ status: 409, description: 'Category with this name already exists' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  async update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoryService.update(user.restaurantId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category (cascades to products)' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  async remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.categoryService.remove(user.restaurantId, id);
  }
}
