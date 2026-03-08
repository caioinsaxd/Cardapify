import { IsNumber, IsNotEmpty, Min, IsOptional, IsArray, ValidateNested, IsString, IsEnum, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class OrderItemDto {
  @ApiProperty({ description: 'Product UUID' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(36)
  productId: string;

  @ApiProperty({ example: 2, description: 'Quantity (min 1)' })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 5, description: 'Table number' })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  tableNumber: number;

  @ApiProperty({ type: [OrderItemDto], description: 'Order items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export enum OrderStatusEnum {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatusEnum, example: 'PAID', description: 'New order status' })
  @IsEnum(OrderStatusEnum)
  @IsNotEmpty()
  status: OrderStatusEnum;
}

export class UpdateOrderItemDto {
  @ApiProperty({ example: 3, description: 'New quantity (min 1)' })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}
