'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePages } from '@/hooks/usePages';
import { useCategories } from '@/hooks/use-categories';
import { useProducts } from '@/hooks/use-products';
import { 
  MenuPage, 
  Section, 
  SectionType, 
  Tab,
  PageStyling,
  ProductGridConfig,
  TextBlockConfig,
  BannerConfig,
  SpacerConfig,
  BackgroundType,
  Product,
  Category,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  GripVertical,
  Palette,
  Save,
  Loader2,
  Layout as LayoutIcon,
  AlignLeft,
  Minus,
  Check,
  Eye,
  Layers,
  Sparkles,
} from 'lucide-react';

type EditorTab = 'sections' | 'styling' | 'tabs';

const DEFAULT_STYLING: PageStyling = {
  background: { type: BackgroundType.SOLID, solidColor: '#FFFFFF' },
  colors: {
    primary: '#DC2626',
    text: '#0F172A',
    textSecondary: '#64748B',
    surface: '#FFFFFF',
    border: '#E5E7EB',
  },
  typography: { fontFamily: 'Inter', baseSize: 16, lineHeight: 1.5 },
  layout: { maxWidth: 1280, padding: 16, cardBorderRadius: 12 },
  header: { show: true, style: 'minimal', showRestaurantName: true, showBusinessHours: true },
  footer: { show: true, showPoweredBy: true },
};

const SECTION_TYPES = [
  { type: SectionType.PRODUCT_GRID, label: 'Grade de Produtos', icon: LayoutIcon, description: 'Mostrar produtos em grade' },
  { type: SectionType.TEXT_BLOCK, label: 'Texto', icon: AlignLeft, description: 'Texto personalizado' },
  { type: SectionType.BANNER, label: 'Banner', icon: Layers, description: 'Imagem com texto' },
  { type: SectionType.SPACER, label: 'Espaçador', icon: Minus, description: 'Espaço em branco' },
];

export default function CustomizePage() {
  const { restaurantId } = useAuth();
  const { 
    pages, 
    activePage, 
    isLoading, 
    fetchPages, 
    createPage, 
    updatePage,
    activatePage,
    addSection, 
    updateSection, 
    deleteSection,
    addTab,
    updateTab,
    deleteTab,
  } = usePages();
  const { categories, fetchCategories } = useCategories();
  const { products, fetchProducts } = useProducts();

  const [selectedPage, setSelectedPage] = useState<MenuPage | null>(null);
  const [editedPage, setEditedPage] = useState<MenuPage | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('sections');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showNewPageModal, setShowNewPageModal] = useState(false);
  const [newPageName, setNewPageName] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      fetchPages();
      fetchCategories();
      fetchProducts();
    }
  }, [restaurantId, fetchPages, fetchCategories, fetchProducts]);

  useEffect(() => {
    if (pages.length > 0 && !selectedPage) {
      const active = pages.find(p => p.isActive);
      setSelectedPage(active || pages[0]);
    }
  }, [pages, selectedPage]);

  useEffect(() => {
    if (selectedPage) {
      setEditedPage(JSON.parse(JSON.stringify(selectedPage)));
    }
  }, [selectedPage]);

  const handleCreatePage = async () => {
    if (!newPageName.trim()) return;
    setIsCreating(true);
    try {
      const page = await createPage(newPageName.trim(), false);
      setSelectedPage(page);
      setShowNewPageModal(false);
      setNewPageName('');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSave = async () => {
    if (!editedPage) return;
    setIsSaving(true);
    try {
      await updatePage(editedPage.id, {
        name: editedPage.name,
        useTabs: editedPage.useTabs,
        tabs: editedPage.tabs,
        sections: editedPage.sections,
        styling: editedPage.styling,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSection = async (type: SectionType) => {
    if (!editedPage) return;
    const newSection = await addSection(editedPage.id, type);
    setEditedPage(prev => prev ? {
      ...prev,
      sections: [...(prev.sections || []), newSection],
    } : null);
  };

  const handleUpdateSection = async (sectionId: string, updates: Partial<Section>) => {
    if (!editedPage) return;
    await updateSection(editedPage.id, sectionId, updates);
    setEditedPage(prev => prev ? {
      ...prev,
      sections: prev.sections?.map(s => s.id === sectionId ? { ...s, ...updates } : s),
    } : null);
    setSelectedSection(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!editedPage) return;
    await deleteSection(editedPage.id, sectionId);
    setEditedPage(prev => prev ? {
      ...prev,
      sections: prev.sections?.filter(s => s.id !== sectionId),
    } : null);
    setSelectedSection(null);
  };

  const handleToggleTabs = () => {
    if (!editedPage) return;
    setEditedPage(prev => prev ? { ...prev, useTabs: !prev.useTabs } : null);
  };

  const handleAddTab = async () => {
    if (!editedPage) return;
    const tabName = `Aba ${(editedPage.tabs?.length || 0) + 1}`;
    const newTab = await addTab(editedPage.id, tabName);
    setEditedPage(prev => prev ? {
      ...prev,
      tabs: [...(prev.tabs || []), newTab],
    } : null);
  };

  const handleActivate = async () => {
    if (!editedPage) return;
    await activatePage(editedPage.id);
  };

  const getSectionIcon = (type: SectionType) => {
    const sectionType = SECTION_TYPES.find(t => t.type === type);
    const Icon = sectionType?.icon || LayoutIcon;
    return <Icon className="h-4 w-4" />;
  };

  const getSectionTitle = (section: Section, categories: Category[]) => {
    switch (section.type) {
      case SectionType.PRODUCT_GRID:
        const gridConfig = section.config as ProductGridConfig;
        if (gridConfig?.categoryId) {
          const cat = categories.find(c => c.id === gridConfig.categoryId);
          return cat ? `Grade: ${cat.name}` : 'Grade de Produtos';
        }
        return 'Grade de Produtos';
      case SectionType.TEXT_BLOCK:
        const textConfig = section.config as TextBlockConfig;
        return textConfig?.title || textConfig?.content?.substring(0, 30) || 'Bloco de Texto';
      case SectionType.BANNER:
        return 'Banner';
      case SectionType.SPACER:
        const spacerConfig = section.config as SpacerConfig;
        return `Espaçador (${spacerConfig?.height || 32}px)`;
      default:
        return 'Seção';
    }
  };

  if (!restaurantId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Personalizar Cardápio</h1>
          <p className="text-slate-500">Configure a aparência do seu cardápio digital</p>
        </div>
        <p className="text-slate-500">Você precisa ter um restaurante configurado para personalizar o cardápio.</p>
      </div>
    );
  }

  if (isLoading && pages.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Personalizar Cardápio</h1>
          <p className="text-slate-500">Monte a página do seu cardápio digital</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Ocultar' : 'Preview'}
          </Button>
          {editedPage && !editedPage.isActive && (
            <Button variant="outline" onClick={handleActivate}>
              <Check className="h-4 w-4 mr-2" />
              Ativar
            </Button>
          )}
          {editedPage?.isActive && (
            <Badge className="bg-green-600">Ativo</Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Page List Sidebar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Páginas</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setShowNewPageModal(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {pages.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">Nenhuma página ainda</p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => setShowNewPageModal(true)}
                    className="mt-2"
                  >
                    Criar primeira página
                  </Button>
                </div>
              ) : (
                pages.map(page => (
                  <button
                    key={page.id}
                    onClick={() => setSelectedPage(page)}
                    className={`w-full flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                      selectedPage?.id === page.id
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="h-4 w-4 text-slate-400" />
                      <span className="font-medium text-sm">{page.name}</span>
                    </div>
                    {page.isActive && (
                      <Badge variant="default" className="text-xs bg-green-600">Ativo</Badge>
                    )}
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Editor */}
        <div className="lg:col-span-9">
          {editedPage ? (
            <div className="space-y-6">
              {/* Page Header */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Input
                      value={editedPage.name}
                      onChange={(e) => setEditedPage(prev => prev ? { ...prev, name: e.target.value } : null)}
                      className="max-w-md font-semibold text-lg"
                    />
                    <div className="flex items-center gap-2">
                      <ToggleSwitch
                        label="Usar abas"
                        checked={editedPage.useTabs}
                        onChange={handleToggleTabs}
                      />
                    </div>
                    <div className="flex-1" />
                    <Button onClick={handleSave} disabled={isSaving} size="sm">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      <span className="ml-2">Salvar</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs Navigation */}
              <div className="flex gap-1 border-b">
                <TabButton
                  active={activeTab === 'sections'}
                  onClick={() => setActiveTab('sections')}
                  icon={<Layers className="h-4 w-4" />}
                  label="Seções"
                />
                <TabButton
                  active={activeTab === 'styling'}
                  onClick={() => setActiveTab('styling')}
                  icon={<Palette className="h-4 w-4" />}
                  label="Estilo"
                />
                {editedPage.useTabs && (
                  <TabButton
                    active={activeTab === 'tabs'}
                    onClick={() => setActiveTab('tabs')}
                    icon={<LayoutIcon className="h-4 w-4" />}
                    label="Abas"
                  />
                )}
              </div>

              {/* Sections Tab */}
              {activeTab === 'sections' && (
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Section List */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                      <CardTitle className="text-base">Seções da Página</CardTitle>
                      <div className="relative group">
                        <Button size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar
                        </Button>
                        <div className="absolute right-0 top-full mt-1 w-64 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          {SECTION_TYPES.map(st => (
                            <button
                              key={st.type}
                              onClick={() => handleAddSection(st.type)}
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg"
                            >
                              <st.icon className="h-5 w-5 text-slate-400" />
                              <div>
                                <p className="font-medium text-sm">{st.label}</p>
                                <p className="text-xs text-slate-500">{st.description}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {(!editedPage.sections || editedPage.sections.length === 0) ? (
                        <div className="text-center py-8 text-slate-500">
                          <Layers className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-sm">Nenhuma seção adicionada</p>
                          <p className="text-xs mt-1">Clique em "Adicionar" para criar uma seção</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {editedPage.sections.map((section, index) => (
                            <div
                              key={section.id}
                              onClick={() => setSelectedSection(section)}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                selectedSection?.id === section.id
                                  ? 'border-slate-900 bg-slate-50'
                                  : 'border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <GripVertical className="h-4 w-4 text-slate-400 cursor-grab" />
                              <span className="text-xs text-slate-400 w-6">{index + 1}</span>
                              {getSectionIcon(section.type)}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{getSectionTitle(section, categories)}</p>
                                <p className="text-xs text-slate-500">{section.type}</p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSection(section.id);
                                }}
                                className="p-1 text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Section Editor */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        {selectedSection ? 'Editar Seção' : 'Selecione uma seção'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedSection ? (
                        <SectionEditor
                          section={selectedSection}
                          categories={categories}
                          onUpdate={(updates) => handleUpdateSection(selectedSection.id, updates)}
                        />
                      ) : (
                        <div className="text-center py-8 text-slate-500">
                          <p className="text-sm">Clique em uma seção para editar</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Styling Tab */}
              {activeTab === 'styling' && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Estilos da Página</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StylingEditor
                      styling={editedPage.styling || DEFAULT_STYLING}
                      onUpdate={(updates) => setEditedPage(prev => prev ? {
                        ...prev,
                        styling: { ...(prev.styling || DEFAULT_STYLING), ...updates }
                      } : null)}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Tabs Tab */}
              {activeTab === 'tabs' && editedPage.useTabs && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <CardTitle className="text-base">Gerenciar Abas</CardTitle>
                    <Button size="sm" variant="outline" onClick={handleAddTab}>
                      <Plus className="h-4 w-4 mr-1" />
                      Nova Aba
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <TabsEditor
                      tabs={editedPage.tabs || []}
                      onUpdate={(tabId, updates) => updateTab(editedPage.id, tabId, updates)}
                      onDelete={(tabId) => deleteTab(editedPage.id, tabId)}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Preview */}
              {showPreview && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PagePreview
                      page={editedPage}
                      styling={editedPage.styling || DEFAULT_STYLING}
                      products={products}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Bem-vindo ao Page Builder</h3>
                <p className="text-sm text-slate-500 text-center max-w-md mb-4">
                  Crie a página do seu cardápio digital adicionando seções e personalizando o estilo.
                </p>
                <Button onClick={() => setShowNewPageModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeira Página
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* New Page Modal */}
      {showNewPageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Criar Nova Página</h3>
            <Input
              placeholder="Nome da página"
              value={newPageName}
              onChange={(e) => setNewPageName(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setShowNewPageModal(false);
                setNewPageName('');
              }}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePage} disabled={!newPageName.trim() || isCreating}>
                {isCreating && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Criar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
        active
          ? 'border-slate-900 text-slate-900'
          : 'border-transparent text-slate-500 hover:text-slate-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ToggleSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-600">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-slate-900' : 'bg-slate-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function SectionEditor({ 
  section, 
  categories,
  onUpdate 
}: { 
  section: Section; 
  categories: Category[];
  onUpdate: (updates: Partial<Section>) => void;
}) {
  const config = section.config;

  if (section.type === SectionType.PRODUCT_GRID) {
    const gridConfig = config as ProductGridConfig;
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
          <select
            value={gridConfig?.categoryId || ''}
            onChange={(e) => onUpdate({ 
              config: { 
                ...gridConfig, 
                categoryId: e.target.value || undefined,
                columns: gridConfig?.columns || 3,
                cardConfig: gridConfig?.cardConfig || {
                  image: { show: true, aspectRatio: '1:1', borderRadius: 8 },
                  name: { show: true, fontSize: 'base', fontWeight: 'medium' },
                  description: { show: false, maxLines: 2 },
                  price: { show: true, position: 'below' },
                  badge: { show: true, position: 'top-right', type: 'popular' },
                  addButton: { show: true, style: 'icon', text: '+' },
                },
              } 
            })}
            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Colunas ({gridConfig?.columns || 3})
          </label>
          <input
            type="range"
            min="2"
            max="5"
            value={gridConfig?.columns || 3}
            onChange={(e) => onUpdate({ 
              config: { ...gridConfig, columns: parseInt(e.target.value) } 
            })}
            className="w-full"
          />
        </div>
      </div>
    );
  }

  if (section.type === SectionType.TEXT_BLOCK) {
    const textConfig = config as TextBlockConfig;
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
          <Input
            value={textConfig?.title || ''}
            onChange={(e) => onUpdate({ config: { ...textConfig, title: e.target.value } })}
            placeholder="Título da seção"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Conteúdo</label>
          <textarea
            value={textConfig?.content || ''}
            onChange={(e) => onUpdate({ config: { ...textConfig, content: e.target.value } })}
            placeholder="Texto da seção"
            rows={4}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Alinhamento</label>
          <select
            value={textConfig?.alignment || 'left'}
            onChange={(e) => onUpdate({ config: { ...textConfig, alignment: e.target.value as 'left' | 'center' | 'right' } })}
            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
          >
            <option value="left">Esquerda</option>
            <option value="center">Centro</option>
            <option value="right">Direita</option>
          </select>
        </div>
      </div>
    );
  }

  if (section.type === SectionType.BANNER) {
    const bannerConfig = config as BannerConfig;
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">URL da Imagem</label>
          <Input
            value={bannerConfig?.imageUrl || ''}
            onChange={(e) => onUpdate({ config: { ...bannerConfig, imageUrl: e.target.value } })}
            placeholder="https://exemplo.com/imagem.jpg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
          <Input
            value={bannerConfig?.title || ''}
            onChange={(e) => onUpdate({ config: { ...bannerConfig, title: e.target.value } })}
            placeholder="Título do banner"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Opacidade do Overlay ({bannerConfig?.overlayOpacity || 30}%)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={bannerConfig?.overlayOpacity || 30}
            onChange={(e) => onUpdate({ config: { ...bannerConfig, overlayOpacity: parseInt(e.target.value) } })}
            className="w-full"
          />
        </div>
      </div>
    );
  }

  if (section.type === SectionType.SPACER) {
    const spacerConfig = config as SpacerConfig;
    return (
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Altura ({spacerConfig?.height || 32}px)
        </label>
        <input
          type="range"
          min="8"
          max="200"
          value={spacerConfig?.height || 32}
          onChange={(e) => onUpdate({ config: { height: parseInt(e.target.value) } })}
          className="w-full"
        />
      </div>
    );
  }

  return <p className="text-sm text-slate-500">Configuração não disponível para este tipo de seção.</p>;
}

function StylingEditor({ 
  styling, 
  onUpdate 
}: { 
  styling: PageStyling; 
  onUpdate: (updates: Partial<PageStyling>) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Background */}
      <div>
        <h4 className="text-sm font-medium text-slate-900 mb-3">Plano de Fundo</h4>
        <div className="space-y-3">
          <div className="flex gap-2">
            {[
              { value: BackgroundType.SOLID, label: 'Cor Sólida' },
              { value: BackgroundType.GRADIENT, label: 'Gradiente' },
            ].map(type => (
              <button
                key={type.value}
                onClick={() => onUpdate({ 
                  background: { ...styling.background, type: type.value as BackgroundType }
                })}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  styling.background?.type === type.value
                    ? 'border-slate-900 bg-slate-100'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          
          {styling.background?.type === BackgroundType.SOLID && (
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={styling.background?.solidColor || '#FFFFFF'}
                onChange={(e) => onUpdate({ 
                  background: { ...styling.background, solidColor: e.target.value }
                })}
                className="h-10 w-10 rounded border cursor-pointer"
              />
              <Input
                value={styling.background?.solidColor || '#FFFFFF'}
                onChange={(e) => onUpdate({ 
                  background: { ...styling.background, solidColor: e.target.value }
                })}
                className="flex-1 font-mono text-sm"
              />
            </div>
          )}

          {styling.background?.type === BackgroundType.GRADIENT && (
            <div className="flex gap-4 items-center">
              <div className="flex-1 flex gap-2">
                <input
                  type="color"
                  value={styling.background?.gradientStart || '#DC2626'}
                  onChange={(e) => onUpdate({ 
                    background: { ...styling.background, gradientStart: e.target.value }
                  })}
                  className="h-10 w-10 rounded border cursor-pointer"
                />
                <Input
                  value={styling.background?.gradientStart || '#DC2626'}
                  onChange={(e) => onUpdate({ 
                    background: { ...styling.background, gradientStart: e.target.value }
                  })}
                  className="flex-1 font-mono text-sm"
                />
              </div>
              <span className="text-slate-400">→</span>
              <div className="flex-1 flex gap-2">
                <input
                  type="color"
                  value={styling.background?.gradientEnd || '#FFFFFF'}
                  onChange={(e) => onUpdate({ 
                    background: { ...styling.background, gradientEnd: e.target.value }
                  })}
                  className="h-10 w-10 rounded border cursor-pointer"
                />
                <Input
                  value={styling.background?.gradientEnd || '#FFFFFF'}
                  onChange={(e) => onUpdate({ 
                    background: { ...styling.background, gradientEnd: e.target.value }
                  })}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h4 className="text-sm font-medium text-slate-900 mb-3">Cores</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorInput
            label="Cor Primária"
            value={styling.colors?.primary || '#DC2626'}
            onChange={(v) => onUpdate({ colors: { ...styling.colors!, primary: v } })}
          />
          <ColorInput
            label="Cor do Texto"
            value={styling.colors?.text || '#0F172A'}
            onChange={(v) => onUpdate({ colors: { ...styling.colors!, text: v } })}
          />
          <ColorInput
            label="Texto Secundário"
            value={styling.colors?.textSecondary || '#64748B'}
            onChange={(v) => onUpdate({ colors: { ...styling.colors!, textSecondary: v } })}
          />
          <ColorInput
            label="Cor da Superfície"
            value={styling.colors?.surface || '#FFFFFF'}
            onChange={(v) => onUpdate({ colors: { ...styling.colors!, surface: v } })}
          />
        </div>
      </div>

      {/* Typography */}
      <div>
        <h4 className="text-sm font-medium text-slate-900 mb-3">Tipografia</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Fonte</label>
            <select
              value={styling.typography?.fontFamily || 'Inter'}
              onChange={(e) => onUpdate({ typography: { ...styling.typography!, fontFamily: e.target.value } })}
              className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
            >
              <option value="Inter">Inter</option>
              <option value="Poppins">Poppins</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Nunito">Nunito</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tamanho Base ({styling.typography?.baseSize || 16}px)
            </label>
            <input
              type="range"
              min="12"
              max="24"
              value={styling.typography?.baseSize || 16}
              onChange={(e) => onUpdate({ typography: { ...styling.typography!, baseSize: parseInt(e.target.value) } })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Layout */}
      <div>
        <h4 className="text-sm font-medium text-slate-900 mb-3">Layout</h4>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Largura Máx ({styling.layout?.maxWidth || 1280}px)
            </label>
            <input
              type="range"
              min="320"
              max="1440"
              value={styling.layout?.maxWidth || 1280}
              onChange={(e) => onUpdate({ layout: { ...styling.layout!, maxWidth: parseInt(e.target.value) } })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Padding ({styling.layout?.padding || 16}px)
            </label>
            <input
              type="range"
              min="0"
              max="48"
              value={styling.layout?.padding || 16}
              onChange={(e) => onUpdate({ layout: { ...styling.layout!, padding: parseInt(e.target.value) } })}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Bordas ({styling.layout?.cardBorderRadius || 12}px)
            </label>
            <input
              type="range"
              min="0"
              max="32"
              value={styling.layout?.cardBorderRadius || 12}
              onChange={(e) => onUpdate({ layout: { ...styling.layout!, cardBorderRadius: parseInt(e.target.value) } })}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function TabsEditor({
  tabs,
  onUpdate,
  onDelete,
}: {
  tabs: Tab[];
  onUpdate: (tabId: string, updates: Partial<Tab>) => void;
  onDelete: (tabId: string) => void;
}) {
  if (tabs.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p className="text-sm">Nenhuma aba criada</p>
        <p className="text-xs mt-1">Clique em "Nova Aba" para criar</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tabs.map(tab => (
        <div key={tab.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
          <Input
            value={tab.name}
            onChange={(e) => onUpdate(tab.id, { name: e.target.value })}
            className="flex-1 max-w-xs"
          />
          {tab.isDefault && (
            <Badge variant="default" className="text-xs bg-green-600">Padrão</Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => !tab.isDefault && onUpdate(tab.id, { isDefault: true })}
            disabled={tab.isDefault}
          >
            Definir Padrão
          </Button>
          <button
            onClick={() => onDelete(tab.id)}
            className="p-1 text-slate-400 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function PagePreview({
  page,
  styling,
  products,
}: {
  page: MenuPage;
  styling: PageStyling;
  products: Product[];
}) {
  const backgroundStyle: React.CSSProperties = {
    backgroundColor: styling.background?.type === BackgroundType.SOLID 
      ? styling.background?.solidColor 
      : undefined,
    background: styling.background?.type === BackgroundType.GRADIENT
      ? `linear-gradient(135deg, ${styling.background?.gradientStart}, ${styling.background?.gradientEnd})`
      : undefined,
    fontFamily: styling.typography?.fontFamily,
    color: styling.colors?.text,
  };

  return (
    <div 
      className="rounded-lg overflow-hidden border border-slate-200"
      style={{
        ...backgroundStyle,
        maxWidth: styling.layout?.maxWidth,
        margin: '0 auto',
      }}
    >
      <div 
        className="p-4"
        style={{ padding: styling.layout?.padding }}
      >
        {page.useTabs && page.tabs && page.tabs.length > 0 && (
          <div className="flex gap-2 mb-6 border-b pb-4 overflow-x-auto">
            {page.tabs.map(tab => (
              <button
                key={tab.id}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  tab.isDefault
                    ? 'text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
                style={tab.isDefault ? { backgroundColor: styling.colors?.primary } : undefined}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-6">
          {page.sections?.map(section => (
            <div 
              key={section.id}
              style={{
                paddingTop: section.styling?.paddingTop,
                paddingBottom: section.styling?.paddingBottom,
              }}
            >
              {section.type === SectionType.PRODUCT_GRID && (
                <div 
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: `repeat(${(section.config as { columns?: number })?.columns || 3}, 1fr)`,
                  }}
                >
                  {products.slice(0, 6).map(product => (
                    <div
                      key={product.id}
                      className="rounded-lg border overflow-hidden"
                      style={{
                        backgroundColor: styling.colors?.surface,
                        borderColor: styling.colors?.border,
                        borderRadius: styling.layout?.cardBorderRadius,
                      }}
                    >
                      {product.imageUrl && (
                        <div 
                          className="bg-gray-200"
                          style={{ aspectRatio: '1/1' }}
                        />
                      )}
                      <div className="p-3">
                        <p 
                          className="font-medium"
                          style={{ color: styling.colors?.text }}
                        >
                          {product.name}
                        </p>
                        <p 
                          className="text-sm font-semibold"
                          style={{ color: styling.colors?.primary }}
                        >
                          R$ {parseFloat(product.price).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {section.type === SectionType.TEXT_BLOCK && (
                <div 
                  className="text-center"
                  style={{ 
                    textAlign: ((section.config as { alignment?: string })?.alignment || 'left') as React.CSSProperties['textAlign']
                  }}
                >
                  {(section.config as { title?: string })?.title && (
                    <h3 className="text-xl font-bold mb-2">
                      {(section.config as { title?: string })?.title}
                    </h3>
                  )}
                  <p className="text-slate-600">
                    {(section.config as { content?: string })?.content || 'Texto da seção'}
                  </p>
                </div>
              )}

              {section.type === SectionType.SPACER && (
                <div 
                  style={{ 
                    height: (section.config as { height?: number })?.height || 32 
                  }} 
                />
              )}

              {section.type === SectionType.BANNER && (
                <div 
                  className="rounded-lg overflow-hidden relative h-40"
                  style={{ backgroundColor: styling.colors?.primary }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white text-xl font-bold">
                      {(section.config as { title?: string })?.title || 'Banner'}
                    </h3>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-10 rounded border border-slate-200 cursor-pointer"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-sm"
        />
      </div>
    </div>
  );
}
