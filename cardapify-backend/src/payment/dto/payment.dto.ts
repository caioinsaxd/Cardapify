import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Restaurant UUID for validation' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  restaurantId: string;
}

export class PaymentStatusDto {
  @ApiProperty()
  orderId: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ required: false, nullable: true })
  paymentId: string | null;

  @ApiProperty({ required: false, nullable: true })
  pixCode: string | null;

  @ApiProperty({ required: false, nullable: true })
  pixQrCode: string | null;

  @ApiProperty({ required: false, nullable: true })
  pixExpiration: Date | null;
}
