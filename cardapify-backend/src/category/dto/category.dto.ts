import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { IsSafeString } from '../../common/decorators/is-safe-string.decorator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @IsSafeString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}

export class UpdateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @IsSafeString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}
