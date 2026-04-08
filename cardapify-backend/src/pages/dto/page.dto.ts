import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsEnum, Min, Max, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export enum SectionType {
  PRODUCT_GRID = 'PRODUCT_GRID',
  TEXT_BLOCK = 'TEXT_BLOCK',
  BANNER = 'BANNER',
  SPACER = 'SPACER',
}

export enum CardStyle {
  ROUNDED = 'rounded',
  SQUARE = 'square',
  SHADOW = 'shadow',
  BORDERED = 'bordered',
}

export enum ImageAspectRatio {
  SQUARE = '1:1',
  FOUR_THREE = '4:3',
  SIXTEEN_NINE = '16:9',
}

export enum BackgroundType {
  SOLID = 'solid',
  GRADIENT = 'gradient',
  IMAGE = 'image',
}

export enum GradientDirection {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  DIAGONAL = 'diagonal',
}

export enum TextAlignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}

export enum BadgeType {
  POPULAR = 'popular',
  NEW = 'new',
  PROMO = 'promo',
  CUSTOM = 'custom',
}

export enum BadgePosition {
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
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

export enum HeaderStyle {
  MINIMAL = 'minimal',
  FULL = 'full',
  NONE = 'none',
}

export enum TabStyle {
  BOTTOM = 'bottom',
  TOP = 'top',
  DOTS = 'dots',
}

export enum FontWeight {
  NORMAL = 'normal',
  MEDIUM = 'medium',
  BOLD = 'bold',
}

export enum FontSize {
  SM = 'sm',
  BASE = 'base',
  LG = 'lg',
  XL = 'xl',
}

export class ImageConfig {
  @ApiProperty()
  @IsBoolean()
  show: boolean;

  @ApiProperty({ enum: ImageAspectRatio })
  @IsEnum(ImageAspectRatio)
  aspectRatio: ImageAspectRatio;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(24)
  borderRadius: number;
}

export class TextStyleConfig {
  @ApiProperty()
  @IsBoolean()
  show: boolean;

  @ApiPropertyOptional({ enum: FontSize })
  @IsOptional()
  @IsEnum(FontSize)
  fontSize?: FontSize;

  @ApiPropertyOptional({ enum: FontWeight })
  @IsOptional()
  @IsEnum(FontWeight)
  fontWeight?: FontWeight;
}

export class DescriptionConfig {
  @ApiProperty()
  @IsBoolean()
  show: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  maxLines?: number;
}

export class PriceConfig {
  @ApiProperty()
  @IsBoolean()
  show: boolean;

  @ApiPropertyOptional({ enum: PricePosition })
  @IsOptional()
  @IsEnum(PricePosition)
  position?: PricePosition;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  style?: 'normal' | 'highlighted';
}

export class BadgeConfig {
  @ApiProperty()
  @IsBoolean()
  show: boolean;

  @ApiPropertyOptional({ enum: BadgePosition })
  @IsOptional()
  @IsEnum(BadgePosition)
  position?: BadgePosition;

  @ApiPropertyOptional({ enum: BadgeType })
  @IsOptional()
  @IsEnum(BadgeType)
  type?: BadgeType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customText?: string;
}

export class AddButtonConfig {
  @ApiProperty()
  @IsBoolean()
  show: boolean;

  @ApiPropertyOptional({ enum: AddButtonStyle })
  @IsOptional()
  @IsEnum(AddButtonStyle)
  style?: AddButtonStyle;

  @ApiProperty()
  @IsString()
  text: string;
}

export class ProductCardConfig {
  @ApiProperty({ type: ImageConfig })
  @ValidateNested()
  @Type(() => ImageConfig)
  image: ImageConfig;

  @ApiProperty({ type: TextStyleConfig })
  @ValidateNested()
  @Type(() => TextStyleConfig)
  name: TextStyleConfig;

  @ApiProperty({ type: DescriptionConfig })
  @ValidateNested()
  @Type(() => DescriptionConfig)
  description: DescriptionConfig;

  @ApiProperty({ type: PriceConfig })
  @ValidateNested()
  @Type(() => PriceConfig)
  price: PriceConfig;

  @ApiProperty({ type: BadgeConfig })
  @ValidateNested()
  @Type(() => BadgeConfig)
  badge: BadgeConfig;

  @ApiProperty({ type: AddButtonConfig })
  @ValidateNested()
  @Type(() => AddButtonConfig)
  addButton: AddButtonConfig;
}

export class ProductGridConfig {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];

  @ApiProperty()
  @IsNumber()
  @Min(2)
  @Max(5)
  columns: number;

  @ApiProperty({ type: ProductCardConfig })
  @ValidateNested()
  @Type(() => ProductCardConfig)
  cardConfig: ProductCardConfig;
}

export class TextBlockConfig {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional({ enum: TextAlignment })
  @IsOptional()
  @IsEnum(TextAlignment)
  alignment?: TextAlignment;
}

export class BannerConfig {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  overlayColor?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  overlayOpacity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ctaText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ctaLink?: string;
}

export class SpacerConfig {
  @ApiProperty()
  @IsNumber()
  @Min(8)
  @Max(200)
  height: number;
}

export class SectionStyling {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  paddingTop?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  paddingBottom?: number;
}

export class Section {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty({ enum: SectionType })
  @IsEnum(SectionType)
  type: SectionType;

  @ApiProperty()
  @IsNumber()
  order: number;

  @ApiPropertyOptional({ type: SectionStyling })
  @IsOptional()
  @ValidateNested()
  @Type(() => SectionStyling)
  styling?: SectionStyling;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: ProductGridConfig | TextBlockConfig | BannerConfig | SpacerConfig;
}

export class Tab {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  sectionIds: string[];

  @ApiProperty()
  @IsBoolean()
  isDefault: boolean;
}

export class BackgroundConfig {
  @ApiProperty({ enum: BackgroundType })
  @IsEnum(BackgroundType)
  type: BackgroundType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  solidColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gradientStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gradientEnd?: string;

  @ApiPropertyOptional({ enum: GradientDirection })
  @IsOptional()
  @IsEnum(GradientDirection)
  gradientDirection?: GradientDirection;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageOverlay?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  imageOverlayOpacity?: number;
}

export class ColorsConfig {
  @ApiProperty()
  @IsString()
  primary: string;

  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty()
  @IsString()
  textSecondary: string;

  @ApiProperty()
  @IsString()
  surface: string;

  @ApiProperty()
  @IsString()
  border: string;
}

export class TypographyConfig {
  @ApiProperty()
  @IsString()
  fontFamily: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  headingFontFamily?: string;

  @ApiProperty()
  @IsNumber()
  @Min(12)
  @Max(24)
  baseSize: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @Max(2)
  lineHeight: number;
}

export class LayoutConfig {
  @ApiProperty()
  @IsNumber()
  @Min(320)
  @Max(1440)
  maxWidth: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(48)
  padding: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(32)
  cardBorderRadius: number;
}

export class HeaderConfig {
  @ApiProperty()
  @IsBoolean()
  show: boolean;

  @ApiPropertyOptional({ enum: HeaderStyle })
  @IsOptional()
  @IsEnum(HeaderStyle)
  style?: HeaderStyle;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showLogo?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showRestaurantName?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showBusinessHours?: boolean;
}

export class FooterConfig {
  @ApiProperty()
  @IsBoolean()
  show: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showPoweredBy?: boolean;
}

export class PageStyling {
  @ApiProperty({ type: BackgroundConfig })
  @ValidateNested()
  @Type(() => BackgroundConfig)
  background: BackgroundConfig;

  @ApiProperty({ type: ColorsConfig })
  @ValidateNested()
  @Type(() => ColorsConfig)
  colors: ColorsConfig;

  @ApiProperty({ type: TypographyConfig })
  @ValidateNested()
  @Type(() => TypographyConfig)
  typography: TypographyConfig;

  @ApiProperty({ type: LayoutConfig })
  @ValidateNested()
  @Type(() => LayoutConfig)
  layout: LayoutConfig;

  @ApiPropertyOptional({ type: HeaderConfig })
  @IsOptional()
  @ValidateNested()
  @Type(() => HeaderConfig)
  header?: HeaderConfig;

  @ApiPropertyOptional({ type: FooterConfig })
  @IsOptional()
  @ValidateNested()
  @Type(() => FooterConfig)
  footer?: FooterConfig;
}

export class CreatePageDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  useTabs?: boolean;

  @ApiPropertyOptional({ type: Tab, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Tab)
  tabs?: Tab[];

  @ApiPropertyOptional({ type: Section, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Section)
  sections?: Section[];

  @ApiPropertyOptional({ type: PageStyling })
  @IsOptional()
  @ValidateNested()
  @Type(() => PageStyling)
  styling?: PageStyling;
}

export class UpdatePageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  useTabs?: boolean;

  @ApiPropertyOptional({ type: Tab, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Tab)
  tabs?: Tab[];

  @ApiPropertyOptional({ type: Section, isArray: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Section)
  sections?: Section[];

  @ApiPropertyOptional({ type: PageStyling })
  @IsOptional()
  @ValidateNested()
  @Type(() => PageStyling)
  styling?: PageStyling;
}

export class AddSectionDto {
  @ApiProperty({ enum: SectionType })
  @IsEnum(SectionType)
  type: SectionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiPropertyOptional({ type: SectionStyling })
  @IsOptional()
  @ValidateNested()
  @Type(() => SectionStyling)
  styling?: SectionStyling;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: ProductGridConfig | TextBlockConfig | BannerConfig | SpacerConfig;
}

export class UpdateSectionDto {
  @ApiPropertyOptional({ type: SectionStyling })
  @IsOptional()
  @ValidateNested()
  @Type(() => SectionStyling)
  styling?: SectionStyling;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: ProductGridConfig | TextBlockConfig | BannerConfig | SpacerConfig;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  order?: number;
}

export class ReorderSectionsDto {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  sectionIds: string[];
}

export class AddTabDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sectionIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateTabDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sectionIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateStylingDto {
  @ApiPropertyOptional({ type: BackgroundConfig })
  @IsOptional()
  @ValidateNested()
  @Type(() => BackgroundConfig)
  background?: BackgroundConfig;

  @ApiPropertyOptional({ type: ColorsConfig })
  @IsOptional()
  @ValidateNested()
  @Type(() => ColorsConfig)
  colors?: ColorsConfig;

  @ApiPropertyOptional({ type: TypographyConfig })
  @IsOptional()
  @ValidateNested()
  @Type(() => TypographyConfig)
  typography?: TypographyConfig;

  @ApiPropertyOptional({ type: LayoutConfig })
  @IsOptional()
  @ValidateNested()
  @Type(() => LayoutConfig)
  layout?: LayoutConfig;

  @ApiPropertyOptional({ type: HeaderConfig })
  @IsOptional()
  @ValidateNested()
  @Type(() => HeaderConfig)
  header?: HeaderConfig;

  @ApiPropertyOptional({ type: FooterConfig })
  @IsOptional()
  @ValidateNested()
  @Type(() => FooterConfig)
  footer?: FooterConfig;
}
