import { IsNumber, IsNotEmpty, Min, IsOptional, IsArray, ValidateNested, IsString, IsEnum, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(36)
  productId: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}

export class CreateOrderDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  tableNumber: number;

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
  @IsEnum(OrderStatusEnum)
  @IsNotEmpty()
  status: OrderStatusEnum;
}

export class UpdateOrderItemDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;
}
