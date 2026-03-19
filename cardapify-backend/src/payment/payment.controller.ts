import { Controller, Post, Get, Param, Body, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/payment.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post(':orderId/pix')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate Pix payment for an order' })
  @ApiParam({ name: 'orderId', description: 'Order UUID', type: String })
  @ApiBody({ type: CreatePaymentDto })
  @ApiResponse({ status: 200, description: 'Pix payment generated' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 400, description: 'Order already paid or invalid state' })
  async createPixPayment(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentService.createPixPayment(orderId, dto);
  }

  @Get(':orderId/status')
  @ApiOperation({ summary: 'Check payment status for an order' })
  @ApiParam({ name: 'orderId', description: 'Order UUID', type: String })
  @ApiResponse({ status: 200, description: 'Payment status returned' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getPaymentStatus(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.paymentService.getPaymentStatus(orderId);
  }
}
