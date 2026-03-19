import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface PixPaymentResult {
  orderId: string;
  status: string;
  pixCode: string | null;
  pixQrCode: string | null;
  pixExpiration: Date | null;
  paymentId: string | null;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly paymentGateway: string;
  private readonly mercadoPagoAccessToken: string | undefined;
  private readonly mercadopagoBaseUrl = 'https://api.mercadopago.com';

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.paymentGateway = this.configService.get<string>('PAYMENT_GATEWAY', 'mock');
    this.mercadoPagoAccessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');
  }

  async createPixPayment(orderId: string, dto: { restaurantId: string }): Promise<PixPaymentResult> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        restaurantId: dto.restaurantId,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not in PENDING status');
    }

    this.logger.log(`Creating Pix payment for order ${orderId}, amount: ${order.total}`);

    switch (this.paymentGateway) {
      case 'mercadopago':
        return this.createMercadoPagoPayment(order);
      case 'mock':
      default:
        return this.createMockPayment(order);
    }
  }

  async getPaymentStatus(orderId: string): Promise<{ orderId: string; status: string; paymentId: string | null }> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      orderId: order.id,
      status: order.status,
      paymentId: null,
    };
  }

  private async createMockPayment(order: any): Promise<PixPaymentResult> {
    const mockPaymentId = `mock_${Date.now()}_${order.id}`;
    
    return {
      orderId: order.id,
      status: 'PENDING',
      pixCode: `00020126530014br.gov.bcb.pix0136${mockPaymentId}5204000053039865404100005802BR5925CARDAPIFY LTDA6009SAO PAULO62140510${Date.now()}6304`,
      pixQrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=mock_payment_${order.id}`,
      pixExpiration: new Date(Date.now() + 30 * 60 * 1000),
      paymentId: mockPaymentId,
    };
  }

  private async createMercadoPagoPayment(order: any): Promise<PixPaymentResult> {
    if (!this.mercadoPagoAccessToken) {
      this.logger.warn('MercadoPago access token not configured, using mock payment');
      return this.createMockPayment(order);
    }

    try {
      const axios = (await import('axios')).default;
      
      const response = await axios.post(
        `${this.mercadopagoBaseUrl}/v1/payments`,
        {
          transaction_amount: Number(order.total),
          description: `Pedido Cardapify ${order.id}`,
          payment_method_id: 'pix',
          payer: {
            email: 'customer@email.com',
          },
          external_reference: order.id,
        },
        {
          headers: {
            Authorization: `Bearer ${this.mercadoPagoAccessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const paymentData = response.data;
      
      return {
        orderId: order.id,
        status: paymentData.status,
        pixCode: paymentData.point_of_interaction?.transaction_data?.qr_code,
        pixQrCode: paymentData.point_of_interaction?.transaction_data?.qr_code_base64,
        pixExpiration: paymentData.date_of_expiration ? new Date(paymentData.date_of_expiration) : null,
        paymentId: paymentData.id?.toString() || null,
      };
    } catch (error) {
      this.logger.error(`MercadoPago payment failed: ${error.message}`);
      return this.createMockPayment(order);
    }
  }
}
