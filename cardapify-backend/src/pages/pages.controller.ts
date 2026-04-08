import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PagesService } from './pages.service';
import {
  CreatePageDto,
  UpdatePageDto,
  AddSectionDto,
  UpdateSectionDto,
  ReorderSectionsDto,
  AddTabDto,
  UpdateTabDto,
  UpdateStylingDto,
} from './dto/page.dto';

@ApiTags('pages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @ApiOperation({ summary: 'List all pages for restaurant' })
  findAll(@Request() req: { user: { restaurantId: string } }) {
    return this.pagesService.findAll(req.user.restaurantId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active page for restaurant' })
  findActive(@Request() req: { user: { restaurantId: string } }) {
    return this.pagesService.findActive(req.user.restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get page by ID' })
  findOne(@Param('id') id: string, @Request() req: { user: { restaurantId: string } }) {
    return this.pagesService.findOne(id, req.user.restaurantId);
  }

  @Get(':id/with-products')
  @ApiOperation({ summary: 'Get page with resolved products' })
  findOneWithProducts(@Param('id') id: string, @Request() req: { user: { restaurantId: string } }) {
    return this.pagesService.getPageWithProducts(id, req.user.restaurantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new page' })
  create(@Body() dto: CreatePageDto, @Request() req: { user: { restaurantId: string } }) {
    return this.pagesService.create(req.user.restaurantId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update page' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePageDto,
    @Request() req: { user: { restaurantId: string } },
  ) {
    return this.pagesService.update(id, req.user.restaurantId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete page' })
  delete(@Param('id') id: string, @Request() req: { user: { restaurantId: string } }) {
    return this.pagesService.delete(id, req.user.restaurantId);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Set page as active' })
  activate(@Param('id') id: string, @Request() req: { user: { restaurantId: string } }) {
    return this.pagesService.activate(id, req.user.restaurantId);
  }

  @Post(':id/sections')
  @ApiOperation({ summary: 'Add section to page' })
  addSection(
    @Param('id') id: string,
    @Body() dto: AddSectionDto,
    @Request() req: { user: { restaurantId: string } },
  ) {
    return this.pagesService.addSection(id, req.user.restaurantId, dto);
  }

  @Patch(':id/sections/:sectionId')
  @ApiOperation({ summary: 'Update section' })
  updateSection(
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto,
    @Request() req: { user: { restaurantId: string } },
  ) {
    return this.pagesService.updateSection(id, sectionId, req.user.restaurantId, dto);
  }

  @Delete(':id/sections/:sectionId')
  @ApiOperation({ summary: 'Delete section' })
  deleteSection(
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @Request() req: { user: { restaurantId: string } },
  ) {
    return this.pagesService.deleteSection(id, sectionId, req.user.restaurantId);
  }

  @Post(':id/sections/reorder')
  @ApiOperation({ summary: 'Reorder sections' })
  reorderSections(
    @Param('id') id: string,
    @Body() dto: ReorderSectionsDto,
    @Request() req: { user: { restaurantId: string } },
  ) {
    return this.pagesService.reorderSections(id, req.user.restaurantId, dto);
  }

  @Post(':id/tabs')
  @ApiOperation({ summary: 'Add tab to page' })
  addTab(
    @Param('id') id: string,
    @Body() dto: AddTabDto,
    @Request() req: { user: { restaurantId: string } },
  ) {
    return this.pagesService.addTab(id, req.user.restaurantId, dto);
  }

  @Patch(':id/tabs/:tabId')
  @ApiOperation({ summary: 'Update tab' })
  updateTab(
    @Param('id') id: string,
    @Param('tabId') tabId: string,
    @Body() dto: UpdateTabDto,
    @Request() req: { user: { restaurantId: string } },
  ) {
    return this.pagesService.updateTab(id, tabId, req.user.restaurantId, dto);
  }

  @Delete(':id/tabs/:tabId')
  @ApiOperation({ summary: 'Delete tab' })
  deleteTab(
    @Param('id') id: string,
    @Param('tabId') tabId: string,
    @Request() req: { user: { restaurantId: string } },
  ) {
    return this.pagesService.deleteTab(id, tabId, req.user.restaurantId);
  }

  @Patch(':id/styling')
  @ApiOperation({ summary: 'Update page styling' })
  updateStyling(
    @Param('id') id: string,
    @Body() dto: UpdateStylingDto,
    @Request() req: { user: { restaurantId: string } },
  ) {
    return this.pagesService.updateStyling(id, req.user.restaurantId, dto);
  }
}
