import { IsNumber, IsNotEmpty, Min, Max, IsArray, ValidateNested, IsString, IsNotEmptyObject, Validate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class PublicOrderItemDto {
  @ApiProperty({ description: 'Product UUID' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2, description: 'Quantity' })
  @IsNumber()
  @Min(1)
  @Max(99)
  @Type(() => Number)
  quantity: number;
}

export class CreatePublicOrderDto {
  @ApiProperty({ example: 5, description: 'Table number (1-999)' })
  @IsNumber()
  @Min(1)
  @Max(999)
  @Type(() => Number)
  tableNumber: number;

  @ApiProperty({ type: [PublicOrderItemDto], description: 'Order items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublicOrderItemDto)
  items: PublicOrderItemDto[];
}

export class CheckOrderStatusDto {
  @ApiProperty({ example: 5, description: 'Table number for verification' })
  @IsNumber()
  @Min(1)
  @Max(999)
  @Type(() => Number)
  tableNumber: number;
}
