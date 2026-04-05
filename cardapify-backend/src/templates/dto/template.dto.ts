import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, MaxLength, Min, Max, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum MenuDisplayMode {
  TABS = 'tabs',
  SCROLL = 'scroll',
  LIST = 'list',
}

export enum GridLayout {
  ONE_COLUMN = 1,
  TWO_COLUMNS = 2,
  THREE_COLUMNS = 3,
  FOUR_COLUMNS = 4,
}

export enum CardStyle {
  ROUNDED = 'rounded',
  SQUARE = 'square',
  SHADOW = 'shadow',
  BORDERED = 'bordered',
}

export enum CardSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
}

export enum ImageAspectRatio {
  SQUARE = '1:1',
  FOUR_THREE = '4:3',
  SIXTEEN_NINE = '16:9',
  AUTO = 'auto',
}

export enum PricePosition {
  BELOW = 'below',
  OVERLAY = 'overlay',
}

export enum AddButtonStyle {
  ICON = 'icon',
  TEXT = 'text',
  FULL = 'full',
}

export enum BadgePosition {
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  OVERLAY = 'overlay',
}

export enum SectionDisplayMode {
  GRID = 'grid',
  LIST = 'list',
  CAROUSEL = 'carousel',
  FEATURED = 'featured',
  HIDDEN = 'hidden',
}

export enum ScheduleType {
  DAY_OF_WEEK = 'DAY_OF_WEEK',
  TIME_RANGE = 'TIME_RANGE',
  DATE = 'DATE',
  RECURRING = 'RECURRING',
}

export class ColorConfigDto {
  @ApiPropertyOptional({ example: '#DC2626', description: 'Primary brand color' })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#F5F5F5', description: 'Secondary color' })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiPropertyOptional({ example: '#FFFFFF', description: 'Background color' })
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @ApiPropertyOptional({ example: '#FFFFFF', description: 'Card/surface color' })
  @IsOptional()
  @IsString()
  surfaceColor?: string;

  @ApiPropertyOptional({ example: '#0F172A', description: 'Primary text color' })
  @IsOptional()
  @IsString()
  textColor?: string;

  @ApiPropertyOptional({ example: '#64748B', description: 'Secondary text color' })
  @IsOptional()
  @IsString()
  textSecondaryColor?: string;

  @ApiPropertyOptional({ example: '#E5E7EB', description: 'Border color' })
  @IsOptional()
  @IsString()
  borderColor?: string;

  @ApiPropertyOptional({ example: '#22C55E', description: 'Success color' })
  @IsOptional()
  @IsString()
  successColor?: string;

  @ApiPropertyOptional({ example: '#DC2626', description: 'Error color' })
  @IsOptional()
  @IsString()
  errorColor?: string;

  @ApiPropertyOptional({ example: '#F59E0B', description: 'Warning color' })
  @IsOptional()
  @IsString()
  warningColor?: string;

  @ApiPropertyOptional({ example: '#FF6B35', description: 'Accent color' })
  @IsOptional()
  @IsString()
  accentColor?: string;
}

export class TypographyConfigDto {
  @ApiPropertyOptional({ example: 'Poppins', description: 'Main font family' })
  @IsOptional()
  @IsString()
  fontFamily?: string;

  @ApiPropertyOptional({ example: 'Poppins', description: 'Heading font family' })
  @IsOptional()
  @IsString()
  headingFontFamily?: string;

  @ApiPropertyOptional({ example: 18, description: 'Title size in px' })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(48)
  titleSize?: number;

  @ApiPropertyOptional({ example: 14, description: 'Description size in px' })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(24)
  descriptionSize?: number;

  @ApiPropertyOptional({ example: 16, description: 'Price size in px' })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(32)
  priceSize?: number;

  @ApiPropertyOptional({ example: 20, description: 'Section title size in px' })
  @IsOptional()
  @IsNumber()
  @Min(12)
  @Max(36)
  sectionTitleSize?: number;

  @ApiPropertyOptional({ example: 1.4, description: 'Line height multiplier' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  lineHeight?: number;
}

export class LayoutConfigDto {
  @ApiPropertyOptional({ enum: CardStyle, description: 'Card style' })
  @IsOptional()
  @IsEnum(CardStyle)
  cardStyle?: CardStyle;

  @ApiPropertyOptional({ example: 12, description: 'Border radius in px' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(32)
  borderRadius?: number;

  @ApiPropertyOptional({ enum: CardSize, description: 'Card size' })
  @IsOptional()
  @IsEnum(CardSize)
  cardSize?: CardSize;

  @ApiPropertyOptional({ example: 12, description: 'Spacing between cards in px' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(48)
  cardSpacing?: number;

  @ApiPropertyOptional({ enum: ImageAspectRatio, description: 'Image aspect ratio' })
  @IsOptional()
  @IsEnum(ImageAspectRatio)
  imageAspectRatio?: ImageAspectRatio;

  @ApiPropertyOptional({ example: 200, description: 'Max image height in px' })
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(500)
  maxImageHeight?: number;
}

export class ProductDisplayConfigDto {
  @ApiPropertyOptional({ example: true, description: 'Show product images' })
  @IsOptional()
  @IsBoolean()
  showImage?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Show product names' })
  @IsOptional()
  @IsBoolean()
  showName?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Show product descriptions' })
  @IsOptional()
  @IsBoolean()
  showDescription?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Show product prices' })
  @IsOptional()
  @IsBoolean()
  showPrice?: boolean;

  @ApiPropertyOptional({ enum: PricePosition, description: 'Price position' })
  @IsOptional()
  @IsEnum(PricePosition)
  pricePosition?: PricePosition;

  @ApiPropertyOptional({ example: true, description: 'Show add button' })
  @IsOptional()
  @IsBoolean()
  showAddButton?: boolean;

  @ApiPropertyOptional({ enum: AddButtonStyle, description: 'Add button style' })
  @IsOptional()
  @IsEnum(AddButtonStyle)
  addButtonStyle?: AddButtonStyle;

  @ApiPropertyOptional({ example: '+', description: 'Add button text' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  addButtonText?: string;

  @ApiPropertyOptional({ example: true, description: 'Show product badges' })
  @IsOptional()
  @IsBoolean()
  showBadges?: boolean;

  @ApiPropertyOptional({ enum: BadgePosition, description: 'Badge position' })
  @IsOptional()
  @IsEnum(BadgePosition)
  badgePosition?: BadgePosition;

  @ApiPropertyOptional({ example: 2, description: 'Max description lines' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxDescriptionLines?: number;
}

export class SectionConfigDto {
  @ApiPropertyOptional({ description: 'Section ID' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ description: 'Category ID to link' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ example: 'Burgers', description: 'Section name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ enum: SectionDisplayMode, description: 'Section display mode' })
  @IsOptional()
  @IsEnum(SectionDisplayMode)
  displayMode?: SectionDisplayMode;

  @ApiPropertyOptional({ example: 3, description: 'Grid columns' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(6)
  gridColumns?: number;

  @ApiPropertyOptional({ example: 0, description: 'Section order' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

export class MenuStructureConfigDto {
  @ApiPropertyOptional({ enum: MenuDisplayMode, description: 'Menu display mode' })
  @IsOptional()
  @IsEnum(MenuDisplayMode)
  displayMode?: MenuDisplayMode;

  @ApiPropertyOptional({ type: [SectionConfigDto], description: 'Menu sections' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionConfigDto)
  sections?: SectionConfigDto[];
}

export class HeaderConfigDto {
  @ApiPropertyOptional({ example: false, description: 'Show logo' })
  @IsOptional()
  @IsBoolean()
  showLogo?: boolean;

  @ApiPropertyOptional({ description: 'Logo URL' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: true, description: 'Show restaurant name' })
  @IsOptional()
  @IsBoolean()
  showRestaurantName?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Show address' })
  @IsOptional()
  @IsBoolean()
  showAddress?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Show phone' })
  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Show description' })
  @IsOptional()
  @IsBoolean()
  showDescription?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Show business hours' })
  @IsOptional()
  @IsBoolean()
  showBusinessHours?: boolean;

  @ApiPropertyOptional({ example: 'full', description: 'Header style: full, minimal, hidden' })
  @IsOptional()
  @IsString()
  headerStyle?: string;
}

export class FooterConfigDto {
  @ApiPropertyOptional({ example: true, description: 'Show footer' })
  @IsOptional()
  @IsBoolean()
  showFooter?: boolean;

  @ApiPropertyOptional({ example: 'Powered by Cardapify', description: 'Custom footer text' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  customText?: string;

  @ApiPropertyOptional({ example: true, description: 'Show powered by' })
  @IsOptional()
  @IsBoolean()
  showPoweredBy?: boolean;
}

export class TemplateConfigDto {
  @ApiPropertyOptional({ type: ColorConfigDto, description: 'Color configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ColorConfigDto)
  colors?: ColorConfigDto;

  @ApiPropertyOptional({ type: TypographyConfigDto, description: 'Typography configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TypographyConfigDto)
  typography?: TypographyConfigDto;

  @ApiPropertyOptional({ type: LayoutConfigDto, description: 'Layout configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => LayoutConfigDto)
  layout?: LayoutConfigDto;

  @ApiPropertyOptional({ type: MenuStructureConfigDto, description: 'Menu structure configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => MenuStructureConfigDto)
  menuStructure?: MenuStructureConfigDto;

  @ApiPropertyOptional({ type: ProductDisplayConfigDto, description: 'Product display configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProductDisplayConfigDto)
  productDisplay?: ProductDisplayConfigDto;

  @ApiPropertyOptional({ type: HeaderConfigDto, description: 'Header configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => HeaderConfigDto)
  header?: HeaderConfigDto;

  @ApiPropertyOptional({ type: FooterConfigDto, description: 'Footer configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => FooterConfigDto)
  footer?: FooterConfigDto;
}

export class ScheduleDto {
  @ApiPropertyOptional({ description: 'Schedule ID' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ enum: ScheduleType, description: 'Schedule type' })
  @IsOptional()
  @IsEnum(ScheduleType)
  type?: ScheduleType;

  @ApiPropertyOptional({ example: ['monday', 'wednesday', 'friday'], description: 'Days of week' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  days?: string[];

  @ApiPropertyOptional({ example: '06:00', description: 'Start time' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ example: '11:00', description: 'End time' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ example: '2026-12-25', description: 'Specific date' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ example: 'weekdays', description: 'Recurring pattern' })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiPropertyOptional({ example: 1, description: 'Priority (higher = takes precedence)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priority?: number;

  @ApiPropertyOptional({ example: true, description: 'Is schedule active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateTemplateDto {
  @ApiProperty({ example: 'My Template', description: 'Template name' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'A custom menu template', description: 'Template description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ type: TemplateConfigDto, description: 'Template configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TemplateConfigDto)
  config?: TemplateConfigDto;

  @ApiPropertyOptional({ type: [ScheduleDto], description: 'Template schedules' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduleDto)
  schedules?: ScheduleDto[];

  @ApiPropertyOptional({ example: 'default-classic', description: 'Clone from template ID' })
  @IsOptional()
  @IsString()
  cloneFrom?: string;
}

export class UpdateTemplateDto {
  @ApiPropertyOptional({ example: 'My Template', description: 'Template name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'A custom menu template', description: 'Template description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ type: TemplateConfigDto, description: 'Template configuration' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TemplateConfigDto)
  config?: TemplateConfigDto;

  @ApiPropertyOptional({ example: false, description: 'Set as active template' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateScheduleDto {
  @ApiProperty({ enum: ScheduleType, description: 'Schedule type' })
  @IsEnum(ScheduleType)
  type!: ScheduleType;

  @ApiPropertyOptional({ example: ['monday', 'wednesday', 'friday'], description: 'Days of week' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  days?: string[];

  @ApiPropertyOptional({ example: '06:00', description: 'Start time' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ example: '11:00', description: 'End time' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ example: '2026-12-25', description: 'Specific date' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ example: 'weekdays', description: 'Recurring pattern' })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiPropertyOptional({ example: 1, description: 'Priority' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priority?: number;

  @ApiPropertyOptional({ example: true, description: 'Is schedule active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateScheduleDto {
  @ApiPropertyOptional({ enum: ScheduleType, description: 'Schedule type' })
  @IsOptional()
  @IsEnum(ScheduleType)
  type?: ScheduleType;

  @ApiPropertyOptional({ example: ['monday', 'wednesday', 'friday'], description: 'Days of week' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  days?: string[];

  @ApiPropertyOptional({ example: '06:00', description: 'Start time' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ example: '11:00', description: 'End time' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ example: '2026-12-25', description: 'Specific date' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ example: 'weekdays', description: 'Recurring pattern' })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiPropertyOptional({ example: 1, description: 'Priority' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priority?: number;

  @ApiPropertyOptional({ example: true, description: 'Is schedule active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
