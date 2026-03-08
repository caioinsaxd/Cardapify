import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsSafeString } from '../../common/decorators/is-safe-string.decorator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Burgers', description: 'Category name (1-100 chars)' })
  @IsString()
  @IsNotEmpty()
  @IsSafeString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Premium Burgers', description: 'Category name (1-100 chars)' })
  @IsString()
  @IsNotEmpty()
  @IsSafeString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}
