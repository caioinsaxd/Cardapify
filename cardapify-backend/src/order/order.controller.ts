import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiParam } from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateOrderItemDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid items or inactive product' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrderDto) {
    return this.orderService.create(user.restaurantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders for the restaurant' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async findAll(@CurrentUser() user: AuthUser) {
    return this.orderService.findAll(user.restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific order by ID' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  async findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.orderService.findOne(user.restaurantId, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (state machine: PENDING → PAID → PREPARING → READY → COMPLETED)' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  async updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(user.restaurantId, id, dto);
  }

  @Patch(':id/items/:itemId')
  @ApiOperation({ summary: 'Update order item quantity' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Item quantity updated successfully' })
  @ApiResponse({ status: 404, description: 'Order or item not found' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiParam({ name: 'itemId', description: 'Order Item UUID' })
  async updateItemQuantity(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateOrderItemDto,
  ) {
    return this.orderService.updateItemQuantity(user.restaurantId, id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @ApiOperation({ summary: 'Remove an item from the order' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Item removed successfully' })
  @ApiResponse({ status: 404, description: 'Order or item not found' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiParam({ name: 'itemId', description: 'Order Item UUID' })
  async removeItem(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.orderService.removeItem(user.restaurantId, id, itemId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order (only if PENDING)' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Cannot cancel order with current status' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  async cancel(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.orderService.cancel(user.restaurantId, id);
  }
}
