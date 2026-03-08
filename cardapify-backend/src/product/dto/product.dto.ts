import { IsString, IsNotEmpty, MaxLength, IsOptional, IsNumber, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsSafeString } from '../../common/decorators/is-safe-string.decorator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'Cheeseburger', description: 'Product name (1-100 chars)' })
  @IsString()
  @IsNotEmpty()
  @IsSafeString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Beef patty with cheese', description: 'Product description' })
  @IsOptional()
  @IsString()
  @IsSafeString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 15.99, description: 'Product price (min 0)' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ example: 'https://example.com/burger.jpg', description: 'Product image URL' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;

  @ApiProperty({ description: 'Category UUID' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(36)
  categoryId: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Classic Cheeseburger', description: 'Product name' })
  @IsOptional()
  @IsString()
  @IsSafeString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Delicious beef patty with cheddar', description: 'Product description' })
  @IsOptional()
  @IsString()
  @IsSafeString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 16.99, description: 'Product price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional({ example: 'https://example.com/burger-new.jpg', description: 'Product image URL' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;
}
