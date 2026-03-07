import { IsString, IsNotEmpty, MaxLength, IsOptional, IsNumber, Min, MinLength } from 'class-validator';
import { IsSafeString } from '../../common/decorators/is-safe-string.decorator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @IsSafeString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @IsSafeString()
  @MaxLength(500)
  description?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(36)
  categoryId: string;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsSafeString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @IsSafeString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  imageUrl?: string;
}
