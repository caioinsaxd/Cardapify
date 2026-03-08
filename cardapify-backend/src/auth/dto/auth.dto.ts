import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsSafeString } from '../../common/decorators/is-safe-string.decorator';

export class RegisterDto {
  @ApiProperty({ example: 'manager@restaurant.com', description: 'Restaurant manager email' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password (min 8, max 128 characters)' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: 'My Restaurant', description: 'Restaurant name' })
  @IsString()
  @IsNotEmpty()
  @IsSafeString()
  @MinLength(1)
  @MaxLength(200)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  restaurantName: string;
}

export class LoginDto {
  @ApiProperty({ example: 'manager@restaurant.com', description: 'Restaurant manager email' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @ApiProperty({ example: 'SecurePass123!', description: 'Password' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token from previous login' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
