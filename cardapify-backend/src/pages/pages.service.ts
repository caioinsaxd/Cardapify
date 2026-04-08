import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePageDto,
  UpdatePageDto,
  AddSectionDto,
  UpdateSectionDto,
  ReorderSectionsDto,
  AddTabDto,
  UpdateTabDto,
  UpdateStylingDto,
  Section,
  Tab,
  PageStyling,
  SectionType,
  ProductGridConfig,
  TextBlockConfig,
  BannerConfig,
  SpacerConfig,
  BackgroundType,
  HeaderStyle,
  ImageAspectRatio,
  TextAlignment,
  BadgeType,
  BadgePosition,
  PricePosition,
  AddButtonStyle,
  FontSize,
  FontWeight,
} from './dto/page.dto';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(restaurantId: string) {
    return this.prisma.menuPage.findMany({
      where: { restaurantId },
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string, restaurantId: string) {
    const page = await this.prisma.menuPage.findUnique({
      where: { id },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (page.restaurantId !== restaurantId) {
      throw new ForbiddenException('Access denied');
    }

    return page;
  }

  async findActive(restaurantId: string) {
    const page = await this.prisma.menuPage.findFirst({
      where: {
        restaurantId,
        isActive: true,
      },
    });

    if (page) {
      return page;
    }

    return this.prisma.menuPage.findFirst({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(restaurantId: string, dto: CreatePageDto) {
    const defaultStyling = this.getDefaultStyling();
    const defaultSection = this.getDefaultSection();

    const page = await this.prisma.menuPage.create({
      data: {
        restaurantId,
        name: dto.name,
        useTabs: dto.useTabs ?? false,
        tabs: (dto.tabs ?? []) as unknown as Prisma.InputJsonValue,
        sections: ([dto.sections ?? defaultSection]) as unknown as Prisma.InputJsonValue,
        styling: (dto.styling ?? defaultStyling) as unknown as Prisma.InputJsonValue,
      },
    });

    return page;
  }

  async update(id: string, restaurantId: string, dto: UpdatePageDto) {
    await this.findOne(id, restaurantId);

    const updateData: Prisma.MenuPageUpdateInput = {};
    
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.useTabs !== undefined) updateData.useTabs = dto.useTabs;
    if (dto.tabs !== undefined) updateData.tabs = dto.tabs as unknown as Prisma.InputJsonValue;
    if (dto.sections !== undefined) updateData.sections = dto.sections as unknown as Prisma.InputJsonValue;
    if (dto.styling !== undefined) updateData.styling = dto.styling as unknown as Prisma.InputJsonValue;

    return this.prisma.menuPage.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string, restaurantId: string) {
    await this.findOne(id, restaurantId);

    await this.prisma.menuPage.delete({
      where: { id },
    });

    return { message: 'Page deleted successfully' };
  }

  async activate(id: string, restaurantId: string) {
    await this.findOne(id, restaurantId);

    await this.prisma.menuPage.updateMany({
      where: {
        restaurantId,
        isActive: true,
        id: { not: id },
      },
      data: { isActive: false },
    });

    return this.prisma.menuPage.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async addSection(pageId: string, restaurantId: string, dto: AddSectionDto) {
    const page = await this.findOne(pageId, restaurantId);

    const sections = (page.sections as unknown as Section[]) || [];
    const maxOrder = sections.length > 0 
      ? Math.max(...sections.map(s => s.order)) 
      : -1;

    const newSection: Section = {
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: dto.type,
      order: dto.order ?? maxOrder + 1,
      styling: dto.styling,
      config: dto.config ?? this.getDefaultConfigForType(dto.type),
    };

    sections.push(newSection);
    sections.sort((a, b) => a.order - b.order);

    await this.prisma.menuPage.update({
      where: { id: pageId },
      data: { sections: sections as unknown as Prisma.InputJsonValue },
    });

    return newSection;
  }

  async updateSection(pageId: string, sectionId: string, restaurantId: string, dto: UpdateSectionDto) {
    const page = await this.findOne(pageId, restaurantId);

    const sections = (page.sections as unknown as Section[]) || [];
    const sectionIndex = sections.findIndex(s => s.id === sectionId);

    if (sectionIndex === -1) {
      throw new NotFoundException('Section not found');
    }

    if (dto.styling !== undefined) {
      sections[sectionIndex].styling = dto.styling;
    }

    if (dto.config !== undefined) {
      sections[sectionIndex].config = dto.config;
    }

    if (dto.order !== undefined) {
      sections[sectionIndex].order = dto.order;
      sections.sort((a, b) => a.order - b.order);
    }

    await this.prisma.menuPage.update({
      where: { id: pageId },
      data: { sections: sections as unknown as Prisma.InputJsonValue },
    });

    return sections[sectionIndex];
  }

  async deleteSection(pageId: string, sectionId: string, restaurantId: string) {
    const page = await this.findOne(pageId, restaurantId);

    const sections = (page.sections as unknown as Section[]) || [];
    const sectionIndex = sections.findIndex(s => s.id === sectionId);

    if (sectionIndex === -1) {
      throw new NotFoundException('Section not found');
    }

    sections.splice(sectionIndex, 1);

    await this.prisma.menuPage.update({
      where: { id: pageId },
      data: { sections: sections as unknown as Prisma.InputJsonValue },
    });

    return { message: 'Section deleted successfully' };
  }

  async reorderSections(pageId: string, restaurantId: string, dto: ReorderSectionsDto) {
    const page = await this.findOne(pageId, restaurantId);

    const sections = (page.sections as unknown as Section[]) || [];
    
    const reorderedSections = dto.sectionIds.map((id, index) => {
      const section = sections.find(s => s.id === id);
      if (!section) {
        throw new BadRequestException(`Section ${id} not found`);
      }
      return { ...section, order: index };
    });

    await this.prisma.menuPage.update({
      where: { id: pageId },
      data: { sections: reorderedSections as unknown as Prisma.InputJsonValue },
    });

    return reorderedSections;
  }

  async addTab(pageId: string, restaurantId: string, dto: AddTabDto) {
    const page = await this.findOne(pageId, restaurantId);

    if (!page.useTabs) {
      throw new BadRequestException('Tabs are not enabled for this page');
    }

    const tabs = (page.tabs as unknown as Tab[]) || [];
    const newTab: Tab = {
      id: `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: dto.name,
      icon: dto.icon,
      sectionIds: dto.sectionIds ?? [],
      isDefault: dto.isDefault ?? (tabs.length === 0),
    };

    if (newTab.isDefault) {
      tabs.forEach(t => t.isDefault = false);
    }

    tabs.push(newTab);

    await this.prisma.menuPage.update({
      where: { id: pageId },
      data: { tabs: tabs as unknown as Prisma.InputJsonValue },
    });

    return newTab;
  }

  async updateTab(pageId: string, tabId: string, restaurantId: string, dto: UpdateTabDto) {
    const page = await this.findOne(pageId, restaurantId);

    const tabs = (page.tabs as unknown as Tab[]) || [];
    const tabIndex = tabs.findIndex(t => t.id === tabId);

    if (tabIndex === -1) {
      throw new NotFoundException('Tab not found');
    }

    if (dto.name !== undefined) tabs[tabIndex].name = dto.name;
    if (dto.icon !== undefined) tabs[tabIndex].icon = dto.icon;
    if (dto.sectionIds !== undefined) tabs[tabIndex].sectionIds = dto.sectionIds;
    if (dto.isDefault !== undefined) {
      if (dto.isDefault) {
        tabs.forEach(t => t.isDefault = false);
      }
      tabs[tabIndex].isDefault = dto.isDefault;
    }

    await this.prisma.menuPage.update({
      where: { id: pageId },
      data: { tabs: tabs as unknown as Prisma.InputJsonValue },
    });

    return tabs[tabIndex];
  }

  async deleteTab(pageId: string, tabId: string, restaurantId: string) {
    const page = await this.findOne(pageId, restaurantId);

    const tabs = (page.tabs as unknown as Tab[]) || [];
    const tabIndex = tabs.findIndex(t => t.id === tabId);

    if (tabIndex === -1) {
      throw new NotFoundException('Tab not found');
    }

    const deletedTab = tabs[tabIndex];
    tabs.splice(tabIndex, 1);

    if (deletedTab.isDefault && tabs.length > 0) {
      tabs[0].isDefault = true;
    }

    await this.prisma.menuPage.update({
      where: { id: pageId },
      data: { tabs: tabs as unknown as Prisma.InputJsonValue },
    });

    return { message: 'Tab deleted successfully' };
  }

  async updateStyling(pageId: string, restaurantId: string, dto: UpdateStylingDto) {
    const page = await this.findOne(pageId, restaurantId);

    const currentStyling = (page.styling as unknown as PageStyling) || this.getDefaultStyling();

    const updatedStyling: PageStyling = {
      ...currentStyling,
      background: dto.background ?? currentStyling.background,
      colors: dto.colors ?? currentStyling.colors,
      typography: dto.typography ?? currentStyling.typography,
      layout: dto.layout ?? currentStyling.layout,
      header: dto.header ?? currentStyling.header,
      footer: dto.footer ?? currentStyling.footer,
    };

    await this.prisma.menuPage.update({
      where: { id: pageId },
      data: { styling: updatedStyling as unknown as Prisma.InputJsonValue },
    });

    return updatedStyling;
  }

  async getPageWithProducts(pageId: string, restaurantId: string) {
    const page = await this.findOne(pageId, restaurantId);
    const sections = (page.sections as unknown as Section[]) || [];

    const categoryIds = new Set<string>();
    const productIds = new Set<string>();

    sections.forEach(section => {
      if (section.type === SectionType.PRODUCT_GRID && section.config) {
        const config = section.config as ProductGridConfig;
        if (config.categoryId) categoryIds.add(config.categoryId);
        if (config.productIds) config.productIds.forEach(id => productIds.add(id));
      }
    });

    const categoryArray = Array.from(categoryIds);
    const productArray = Array.from(productIds);

    const categories = categoryArray.length > 0 
      ? await this.prisma.category.findMany({
          where: { 
            id: { in: categoryArray },
          },
        })
      : [];

    const products = productArray.length > 0
      ? await this.prisma.product.findMany({
          where: { 
            id: { in: productArray },
            isActive: true,
          },
          include: { category: true },
        })
      : [];

    const enrichedSections = await Promise.all(sections.map(async section => {
      if (section.type !== SectionType.PRODUCT_GRID || !section.config) {
        return section;
      }

      const config = section.config as ProductGridConfig;
      let sectionProducts = [...products];

      if (config.categoryId) {
        sectionProducts = products.filter(p => p.categoryId === config.categoryId);
        
        if (!config.productIds || config.productIds.length === 0) {
          const categoryProducts = await this.prisma.product.findMany({
            where: { categoryId: config.categoryId, isActive: true },
            include: { category: true },
          });
          return {
            ...section,
            products: categoryProducts,
            category: categories.find(c => c.id === config.categoryId),
          };
        }
      }

      return {
        ...section,
        products: sectionProducts,
        category: categories.find(c => c.id === config.categoryId),
      };
    }));

    return {
      ...page,
      sections: enrichedSections,
      categories,
    };
  }

  private getDefaultStyling(): PageStyling {
    return {
      background: {
        type: BackgroundType.SOLID,
        solidColor: '#FFFFFF',
      },
      colors: {
        primary: '#DC2626',
        text: '#0F172A',
        textSecondary: '#64748B',
        surface: '#FFFFFF',
        border: '#E5E7EB',
      },
      typography: {
        fontFamily: 'Inter',
        baseSize: 16,
        lineHeight: 1.5,
      },
      layout: {
        maxWidth: 1280,
        padding: 16,
        cardBorderRadius: 12,
      },
      header: {
        show: true,
        style: HeaderStyle.MINIMAL,
        showRestaurantName: true,
        showBusinessHours: true,
      },
      footer: {
        show: true,
        showPoweredBy: true,
      },
    };
  }

  private getDefaultSection(): Section {
    return {
      id: `section-${Date.now()}`,
      type: SectionType.PRODUCT_GRID,
      order: 0,
      styling: {
        paddingTop: 16,
        paddingBottom: 16,
      },
      config: this.getDefaultConfigForType(SectionType.PRODUCT_GRID),
    };
  }

  private getDefaultConfigForType(type: SectionType): ProductGridConfig | TextBlockConfig | BannerConfig | SpacerConfig {
    switch (type) {
      case SectionType.PRODUCT_GRID:
        return {
          columns: 3,
          cardConfig: {
            image: { show: true, aspectRatio: ImageAspectRatio.SQUARE, borderRadius: 8 },
            name: { show: true, fontSize: FontSize.BASE, fontWeight: FontWeight.MEDIUM },
            description: { show: false, maxLines: 2 },
            price: { show: true, position: PricePosition.BELOW, style: 'normal' },
            badge: { show: true, position: BadgePosition.TOP_RIGHT, type: BadgeType.POPULAR },
            addButton: { show: true, style: AddButtonStyle.ICON, text: '+' },
          },
        };

      case SectionType.TEXT_BLOCK:
        return {
          content: '',
          alignment: TextAlignment.LEFT,
        };

      case SectionType.BANNER:
        return {
          overlayOpacity: 30,
        };

      case SectionType.SPACER:
        return {
          height: 32,
        };

      default:
        return {
          columns: 3,
          cardConfig: {
            image: { show: true, aspectRatio: ImageAspectRatio.SQUARE, borderRadius: 8 },
            name: { show: true, fontSize: FontSize.BASE, fontWeight: FontWeight.MEDIUM },
            description: { show: false, maxLines: 2 },
            price: { show: true, position: PricePosition.BELOW, style: 'normal' },
            badge: { show: true, position: BadgePosition.TOP_RIGHT, type: BadgeType.POPULAR },
            addButton: { show: true, style: AddButtonStyle.ICON, text: '+' },
          },
        } as ProductGridConfig;
    }
  }
}
