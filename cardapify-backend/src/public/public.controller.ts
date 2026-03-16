import { Controller, Get, Post, Param, Body, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { PublicService } from './public.service';
import { CreatePublicOrderDto, CheckOrderStatusDto } from './dto/public.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get(':restaurantId/menu')
  @ApiOperation({ summary: 'Get restaurant menu (categories with products)' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID', type: String })
  @ApiResponse({ status: 200, description: 'Menu returned successfully' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async getMenu(@Param('restaurantId', ParseUUIDPipe) restaurantId: string) {
    return this.publicService.getMenu(restaurantId);
  }

  @Get(':restaurantId/products')
  @ApiOperation({ summary: 'Get all active products' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID', type: String })
  @ApiResponse({ status: 200, description: 'Products returned successfully' })
  @ApiResponse({ status: 404, description: 'Restaurant not found' })
  async getProducts(@Param('restaurantId', ParseUUIDPipe) restaurantId: string) {
    return this.publicService.getActiveProducts(restaurantId);
  }

  @Post(':restaurantId/orders')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID', type: String })
  @ApiBody({ type: CreatePublicOrderDto })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 404, description: 'Restaurant or product not found' })
  async createOrder(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Body() dto: CreatePublicOrderDto,
  ) {
    return this.publicService.createOrder(restaurantId, dto);
  }

  @Get(':restaurantId/orders/:orderId')
  @ApiOperation({ summary: 'Check order status (requires table number)' })
  @ApiParam({ name: 'restaurantId', description: 'Restaurant UUID', type: String })
  @ApiParam({ name: 'orderId', description: 'Order UUID', type: String })
  @ApiResponse({ status: 200, description: 'Order status returned' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getOrderStatus(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: CheckOrderStatusDto,
  ) {
    return this.publicService.getOrderStatus(restaurantId, orderId, dto.tableNumber);
  }
}
