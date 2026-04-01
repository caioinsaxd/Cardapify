import { IsOptional, IsString, MaxLength, IsNumber, Min, Max, IsBoolean, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsSafeString } from '../../common/decorators/is-safe-string.decorator';

const MAX_STRING_LENGTH = 100;
const MAX_URL_LENGTH = 2048;

export class ThemeDto {
  @ApiPropertyOptional({ example: '#FF6B35', description: 'Primary theme color (hex)' })
  @IsOptional()
  @IsSafeString()
  @MaxLength(MAX_STRING_LENGTH)
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#2D2D2D', description: 'Secondary theme color (hex)' })
  @IsOptional()
  @IsSafeString()
  @MaxLength(MAX_STRING_LENGTH)
  secondaryColor?: string;

  @ApiPropertyOptional({ example: '#1A1A1A', description: 'Background color (hex)' })
  @IsOptional()
  @IsSafeString()
  @MaxLength(MAX_STRING_LENGTH)
  backgroundColor?: string;

  @ApiPropertyOptional({ example: 'Roboto', description: 'Font family' })
  @IsOptional()
  @IsSafeString()
  @MaxLength(MAX_STRING_LENGTH)
  fontFamily?: string;

  @ApiPropertyOptional({ example: '#FFFFFF', description: 'Font color (hex)' })
  @IsOptional()
  @IsSafeString()
  @MaxLength(MAX_STRING_LENGTH)
  fontColor?: string;
}

export class LayoutDto {
  @ApiPropertyOptional({ example: '3x3', description: 'Grid type for product display' })
  @IsOptional()
  @IsSafeString()
  @MaxLength(20)
  gridType?: string;

  @ApiPropertyOptional({ example: 'ROUNDED', description: 'Card style' })
  @IsOptional()
  @IsSafeString()
  @MaxLength(20)
  cardStyle?: string;

  @ApiPropertyOptional({ example: true, description: 'Show product images' })
  @IsOptional()
  @IsBoolean()
  showImages?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Show product descriptions' })
  @IsOptional()
  @IsBoolean()
  showDescriptions?: boolean;
}

export class ButtonsDto {
  @ApiPropertyOptional({ example: 'PILLOW', description: 'Button shape' })
  @IsOptional()
  @IsSafeString()
  @MaxLength(20)
  shape?: string;

  @ApiPropertyOptional({ example: 'LARGE', description: 'Button size' })
  @IsOptional()
  @IsSafeString()
  @MaxLength(20)
  size?: string;

  @ApiPropertyOptional({ example: 'HOVER_ZOOM', description: 'Button animation' })
  @IsOptional()
  @IsSafeString()
  @MaxLength(20)
  animation?: string;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({ description: 'Theme configuration' })
  @IsOptional()
  theme?: ThemeDto;

  @ApiPropertyOptional({ description: 'Layout configuration' })
  @IsOptional()
  layout?: LayoutDto;

  @ApiPropertyOptional({ description: 'Button configuration' })
  @IsOptional()
  buttons?: ButtonsDto;

  @ApiPropertyOptional({ example: 'BRL', description: 'Currency code' })
  @IsOptional()
  @IsSafeString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({ example: 'America/Sao_Paulo', description: 'Timezone' })
  @IsOptional()
  @IsSafeString()
  @MaxLength(50)
  timezone?: string;
}

export class FooterDto {
  @ApiPropertyOptional({ example: true, description: 'Show footer' })
  @IsOptional()
  @IsBoolean()
  showFooter?: boolean;
}

export class UpdateWebSettingsDto {
  @ApiPropertyOptional({ example: 'https://example.com/logo.png', description: 'Logo URL' })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_URL_LENGTH)
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/banner.jpg', description: 'Cover image URL' })
  @IsOptional()
  @IsString()
  @MaxLength(MAX_URL_LENGTH)
  coverImage?: string;

  @ApiPropertyOptional({ description: 'Footer configuration' })
  @IsOptional()
  footer?: FooterDto;
}

export class IdleDto {
  @ApiPropertyOptional({ example: 60, description: 'Idle timeout in seconds (10-3600)' })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(3600)
  idleTimeout?: number;

  @ApiPropertyOptional({ example: true, description: 'Show videos on idle screen' })
  @IsOptional()
  @IsBoolean()
  showVideos?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Auto rotate categories' })
  @IsOptional()
  @IsBoolean()
  autoRotateCategories?: boolean;
}

export class PaymentDto {
  @ApiPropertyOptional({ example: true, description: 'Require payment before order' })
  @IsOptional()
  @IsBoolean()
  requirePaymentBeforeOrder?: boolean;
}

export class SoundDto {
  @ApiPropertyOptional({ example: true, description: 'Enable sound effects' })
  @IsOptional()
  @IsBoolean()
  soundEffects?: boolean;
}

export class UpdateTotemSettingsDto {
  @ApiPropertyOptional({ description: 'Idle configuration' })
  @IsOptional()
  idle?: IdleDto;

  @ApiPropertyOptional({ description: 'Payment configuration' })
  @IsOptional()
  payment?: PaymentDto;

  @ApiPropertyOptional({ description: 'Sound configuration' })
  @IsOptional()
  sound?: SoundDto;
}

export class ApplyTemplateDto {
  @ApiProperty({ example: 'dark', description: 'Template ID to apply' })
  @IsString()
  @MaxLength(50)
  templateId: string;
}

export class OrderSettingsDto {
  @ApiPropertyOptional({ example: true, description: 'Require table number for orders' })
  @IsOptional()
  @IsBoolean()
  requireTableNumber?: boolean;

  @ApiPropertyOptional({ example: 0, description: 'Minimum order amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number;

  @ApiPropertyOptional({ example: false, description: 'Auto-confirm orders without manual approval' })
  @IsOptional()
  @IsBoolean()
  autoConfirmOrders?: boolean;

  @ApiPropertyOptional({ example: 30, description: 'Estimated preparation time in minutes' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(180)
  preparationTimeMinutes?: number;

  @ApiPropertyOptional({ example: true, description: 'Allow customers to add observations/notes to orders' })
  @IsOptional()
  @IsBoolean()
  allowObservations?: boolean;
}

export class BusinessHoursDto {
  @ApiPropertyOptional({ example: 'monday', description: 'Day of week' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  day?: string;

  @ApiPropertyOptional({ example: '09:00', description: 'Opening time' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  openTime?: string;

  @ApiPropertyOptional({ example: '22:00', description: 'Closing time' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  closeTime?: string;

  @ApiPropertyOptional({ example: true, description: 'Is open on this day' })
  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;
}

export class UpdateRestaurantProfileDto {
  @ApiPropertyOptional({ example: 'My Restaurant', description: 'Restaurant name' })
  @IsOptional()
  @IsSafeString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: '123 Main St', description: 'Restaurant address' })
  @IsOptional()
  @IsSafeString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ example: '+55 11 99999-9999', description: 'Phone number (only numbers, spaces, dashes, parentheses and +)' })
  @IsOptional()
  @IsString()
  @Matches(/^[\d\s\-\(\)\+]+$/, { message: 'Phone must contain only numbers, spaces, dashes, parentheses, and +' })
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: 'Best food in town!', description: 'Restaurant description' })
  @IsOptional()
  @IsSafeString()
  @MaxLength(1000)
  description?: string;
}

export class UpdateOrderSettingsDto {
  @ApiPropertyOptional({ description: 'Order settings configuration' })
  @IsOptional()
  orderSettings?: OrderSettingsDto;

  @ApiPropertyOptional({ description: 'Business hours configuration' })
  @IsOptional()
  businessHours?: BusinessHoursDto[];
}
