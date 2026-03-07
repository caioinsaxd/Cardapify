import { IsOptional, IsString, MaxLength, IsNumber, Min, Max, IsBoolean } from 'class-validator';
import { IsSafeString } from '../../common/decorators/is-safe-string.decorator';

const MAX_STRING_LENGTH = 100;
const MAX_URL_LENGTH = 2048;

export class ThemeDto {
  @IsOptional()
  @IsSafeString()
  @MaxLength(MAX_STRING_LENGTH)
  primaryColor?: string;

  @IsOptional()
  @IsSafeString()
  @MaxLength(MAX_STRING_LENGTH)
  secondaryColor?: string;

  @IsOptional()
  @IsSafeString()
  @MaxLength(MAX_STRING_LENGTH)
  backgroundColor?: string;

  @IsOptional()
  @IsSafeString()
  @MaxLength(MAX_STRING_LENGTH)
  fontFamily?: string;

  @IsOptional()
  @IsSafeString()
  @MaxLength(MAX_STRING_LENGTH)
  fontColor?: string;
}

export class LayoutDto {
  @IsOptional()
  @IsSafeString()
  @MaxLength(20)
  gridType?: string;

  @IsOptional()
  @IsSafeString()
  @MaxLength(20)
  cardStyle?: string;

  @IsOptional()
  @IsBoolean()
  showImages?: boolean;

  @IsOptional()
  @IsBoolean()
  showDescriptions?: boolean;
}

export class ButtonsDto {
  @IsOptional()
  @IsSafeString()
  @MaxLength(20)
  shape?: string;

  @IsOptional()
  @IsSafeString()
  @MaxLength(20)
  size?: string;

  @IsOptional()
  @IsSafeString()
  @MaxLength(20)
  animation?: string;
}

export class UpdateSettingsDto {
  @IsOptional()
  theme?: ThemeDto;

  @IsOptional()
  layout?: LayoutDto;

  @IsOptional()
  buttons?: ButtonsDto;

  @IsOptional()
  @IsSafeString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsSafeString()
  @MaxLength(50)
  timezone?: string;
}

export class FooterDto {
  @IsOptional()
  @IsBoolean()
  showFooter?: boolean;
}

export class UpdateWebSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(MAX_URL_LENGTH)
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(MAX_URL_LENGTH)
  coverImage?: string;

  @IsOptional()
  footer?: FooterDto;
}

export class IdleDto {
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(3600)
  idleTimeout?: number;

  @IsOptional()
  @IsBoolean()
  showVideos?: boolean;

  @IsOptional()
  @IsBoolean()
  autoRotateCategories?: boolean;
}

export class PaymentDto {
  @IsOptional()
  @IsBoolean()
  requirePaymentBeforeOrder?: boolean;
}

export class SoundDto {
  @IsOptional()
  @IsBoolean()
  soundEffects?: boolean;
}

export class UpdateTotemSettingsDto {
  @IsOptional()
  idle?: IdleDto;

  @IsOptional()
  payment?: PaymentDto;

  @IsOptional()
  sound?: SoundDto;
}

export class ApplyTemplateDto {
  @IsString()
  @MaxLength(50)
  templateId: string;
}
