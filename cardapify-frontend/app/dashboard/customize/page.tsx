'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTemplates } from '@/hooks/useTemplates';
import { MenuTemplate, TemplateConfig } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Check, 
  Trash2, 
  Copy, 
  Eye,
  Save,
  RotateCcw,
  ChevronRight,
  Loader2,
  Layout as LayoutIcon,
  Type,
  Palette as PaletteIcon,
  Image as ImageIcon
} from 'lucide-react';

type TabType = 'colors' | 'typography' | 'layout' | 'display';

const DEFAULT_CONFIG: TemplateConfig = {
  colors: {
    primaryColor: '#DC2626',
    secondaryColor: '#F5F5F5',
    backgroundColor: '#F5F5F5',
    surfaceColor: '#FFFFFF',
    textColor: '#0F172A',
    textSecondaryColor: '#64748B',
    borderColor: '#E5E7EB',
    successColor: '#22C55E',
    errorColor: '#DC2626',
    warningColor: '#F59E0B',
    accentColor: '#DC2626',
  },
  typography: {
    fontFamily: 'Poppins',
    headingFontFamily: 'Poppins',
    titleSize: 16,
    descriptionSize: 14,
    priceSize: 16,
    sectionTitleSize: 20,
    lineHeight: 1.4,
  },
  layout: {
    cardStyle: 'rounded',
    borderRadius: 12,
    cardSize: 'medium',
    cardSpacing: 12,
    imageAspectRatio: '1:1',
    maxImageHeight: 150,
  },
  menuStructure: {
    displayMode: 'tabs',
    sections: [],
  },
  productDisplay: {
    showImage: true,
    showName: true,
    showDescription: true,
    showPrice: true,
    pricePosition: 'below',
    showAddButton: true,
    addButtonStyle: 'icon',
    addButtonText: '+',
    showBadges: true,
    badgePosition: 'top-left',
    maxDescriptionLines: 2,
  },
  header: {
    showLogo: false,
    showRestaurantName: true,
    showAddress: true,
    showPhone: true,
    showDescription: true,
    showBusinessHours: true,
    headerStyle: 'full',
  },
  footer: {
    showFooter: true,
    customText: null,
    showPoweredBy: true,
  },
};

export default function CustomizePage() {
  const { restaurantId } = useAuth();
  const { templates, isLoading, fetchTemplates, updateTemplate, activateTemplate, cloneTemplate, deleteTemplate } = useTemplates();
  
  const [selectedTemplate, setSelectedTemplate] = useState<MenuTemplate | null>(null);
  const [editedConfig, setEditedConfig] = useState<TemplateConfig | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('colors');
  const [isSaving, setIsSaving] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneName, setCloneName] = useState('');
  const [isCloning, setIsCloning] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      fetchTemplates();
    }
  }, [restaurantId, fetchTemplates]);

  useEffect(() => {
    if (selectedTemplate) {
      setEditedConfig(JSON.parse(JSON.stringify(selectedTemplate.config)));
    } else {
      setEditedConfig(null);
    }
  }, [selectedTemplate]);

  const handleSelectTemplate = (template: MenuTemplate) => {
    if (selectedTemplate?.id !== template.id) {
      setSelectedTemplate(template);
    }
  };

  const handleConfigChange = useCallback((path: string, value: unknown) => {
    if (!editedConfig) return;
    
    const keys = path.split('.');
    const newConfig = JSON.parse(JSON.stringify(editedConfig));
    let current: Record<string, unknown> = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]] as Record<string, unknown>;
    }
    current[keys[keys.length - 1]] = value;
    
    setEditedConfig(newConfig);
  }, [editedConfig]);

  const handleSave = async () => {
    if (!selectedTemplate || !editedConfig || selectedTemplate.isSystem) return;
    
    setIsSaving(true);
    try {
      await updateTemplate(selectedTemplate.id, { config: editedConfig });
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivate = async () => {
    if (!selectedTemplate) return;
    await activateTemplate(selectedTemplate.id);
    await fetchTemplates();
  };

  const handleClone = async () => {
    if (!selectedTemplate || !cloneName.trim()) return;
    
    setIsCloning(true);
    try {
      const newTemplate = await cloneTemplate(selectedTemplate.id, cloneName.trim());
      setSelectedTemplate(newTemplate);
      setShowCloneModal(false);
      setCloneName('');
      await fetchTemplates();
    } finally {
      setIsCloning(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTemplate || selectedTemplate.isSystem) return;
    if (!confirm('Tem certeza que deseja excluir este template?')) return;
    await deleteTemplate(selectedTemplate.id);
    setSelectedTemplate(null);
  };

  const handleReset = () => {
    if (selectedTemplate) {
      setEditedConfig(JSON.parse(JSON.stringify(selectedTemplate.config)));
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'colors', label: 'Cores', icon: <PaletteIcon className="h-4 w-4" /> },
    { id: 'typography', label: 'Tipografia', icon: <Type className="h-4 w-4" /> },
    { id: 'layout', label: 'Layout', icon: <LayoutIcon className="h-4 w-4" /> },
    { id: 'display', label: 'Exibição', icon: <ImageIcon className="h-4 w-4" /> },
  ];

  if (!restaurantId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customizar</h1>
          <p className="text-slate-500">Personalize a aparência do seu cardápio digital</p>
        </div>
        <p className="text-slate-500">Você precisa ter um restaurante configurado para customizar o cardápio.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Customizar</h1>
        <p className="text-slate-500">Personalize a aparência do seu cardápio digital</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 xl:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Templates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {templates?.userTemplates && templates.userTemplates.length > 0 && (
                <>
                  <p className="px-1 text-xs font-medium text-slate-500">SEUS TEMPLATES</p>
                  {templates.userTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className={`w-full flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-8 w-8 rounded-md border"
                          style={{ backgroundColor: template.config.colors.primaryColor }}
                        />
                        <div>
                          <p className="font-medium text-sm">{template.name}</p>
                          {template.isActive && (
                            <Badge variant="default" className="mt-1 text-xs bg-green-600">
                              Ativo
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>
                  ))}
                </>
              )}

              {templates?.systemTemplates && templates.systemTemplates.length > 0 && (
                <>
                  <p className="px-1 pt-4 text-xs font-medium text-slate-500">SISTEMA</p>
                  {templates.systemTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className={`w-full flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                        selectedTemplate?.id === template.id
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-8 w-8 rounded-md border"
                          style={{ backgroundColor: template.config.colors.primaryColor }}
                        />
                        <div>
                          <p className="font-medium text-sm">{template.name}</p>
                          <p className="text-xs text-slate-500">{template.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 xl:col-span-9">
          {selectedTemplate ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg">{selectedTemplate.name}</CardTitle>
                  <p className="text-sm text-slate-500">{selectedTemplate.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!selectedTemplate.isSystem && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCloneModal(true)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Clonar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {!selectedTemplate.isSystem && !selectedTemplate.isActive && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleActivate}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Ativar
                    </Button>
                  )}
                  {selectedTemplate.isActive && (
                    <Badge className="bg-green-600">Template Ativo</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 border-b mb-6">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                        activeTab === tab.id
                          ? 'border-slate-900 text-slate-900'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {editedConfig && (
                  <div className="space-y-6">
                    {activeTab === 'colors' && (
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <ColorInput
                          label="Cor Primária"
                          value={editedConfig.colors.primaryColor}
                          onChange={v => handleConfigChange('colors.primaryColor', v)}
                        />
                        <ColorInput
                          label="Cor Secundária"
                          value={editedConfig.colors.secondaryColor}
                          onChange={v => handleConfigChange('colors.secondaryColor', v)}
                        />
                        <ColorInput
                          label="Cor de Fundo"
                          value={editedConfig.colors.backgroundColor}
                          onChange={v => handleConfigChange('colors.backgroundColor', v)}
                        />
                        <ColorInput
                          label="Cor da Superfície"
                          value={editedConfig.colors.surfaceColor}
                          onChange={v => handleConfigChange('colors.surfaceColor', v)}
                        />
                        <ColorInput
                          label="Cor do Texto"
                          value={editedConfig.colors.textColor}
                          onChange={v => handleConfigChange('colors.textColor', v)}
                        />
                        <ColorInput
                          label="Cor Secundária do Texto"
                          value={editedConfig.colors.textSecondaryColor}
                          onChange={v => handleConfigChange('colors.textSecondaryColor', v)}
                        />
                        <ColorInput
                          label="Cor da Borda"
                          value={editedConfig.colors.borderColor}
                          onChange={v => handleConfigChange('colors.borderColor', v)}
                        />
                        <ColorInput
                          label="Cor de Sucesso"
                          value={editedConfig.colors.successColor}
                          onChange={v => handleConfigChange('colors.successColor', v)}
                        />
                        <ColorInput
                          label="Cor de Erro"
                          value={editedConfig.colors.errorColor}
                          onChange={v => handleConfigChange('colors.errorColor', v)}
                        />
                      </div>
                    )}

                    {activeTab === 'typography' && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Fonte do Corpo
                          </label>
                          <select
                            value={editedConfig.typography.fontFamily}
                            onChange={e => handleConfigChange('typography.fontFamily', e.target.value)}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
                          >
                            <option value="Poppins">Poppins</option>
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Arial">Arial</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Fonte dos Títulos
                          </label>
                          <select
                            value={editedConfig.typography.headingFontFamily}
                            onChange={e => handleConfigChange('typography.headingFontFamily', e.target.value)}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
                          >
                            <option value="Poppins">Poppins</option>
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Open Sans">Open Sans</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Arial">Arial</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Tamanho do Título ({editedConfig.typography.titleSize}px)
                          </label>
                          <input
                            type="range"
                            min="12"
                            max="24"
                            value={editedConfig.typography.titleSize}
                            onChange={e => handleConfigChange('typography.titleSize', parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Tamanho da Descrição ({editedConfig.typography.descriptionSize}px)
                          </label>
                          <input
                            type="range"
                            min="10"
                            max="20"
                            value={editedConfig.typography.descriptionSize}
                            onChange={e => handleConfigChange('typography.descriptionSize', parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Tamanho do Preço ({editedConfig.typography.priceSize}px)
                          </label>
                          <input
                            type="range"
                            min="12"
                            max="24"
                            value={editedConfig.typography.priceSize}
                            onChange={e => handleConfigChange('typography.priceSize', parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Tamanho do Título da Seção ({editedConfig.typography.sectionTitleSize}px)
                          </label>
                          <input
                            type="range"
                            min="16"
                            max="32"
                            value={editedConfig.typography.sectionTitleSize}
                            onChange={e => handleConfigChange('typography.sectionTitleSize', parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'layout' && (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Estilo do Card
                          </label>
                          <select
                            value={editedConfig.layout.cardStyle}
                            onChange={e => handleConfigChange('layout.cardStyle', e.target.value)}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
                          >
                            <option value="rounded">Arredondado</option>
                            <option value="square">Quadrado</option>
                            <option value="shadow">Com Sombra</option>
                            <option value="bordered">Com Borda</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Tamanho do Card
                          </label>
                          <select
                            value={editedConfig.layout.cardSize}
                            onChange={e => handleConfigChange('layout.cardSize', e.target.value)}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
                          >
                            <option value="small">Pequeno</option>
                            <option value="medium">Médio</option>
                            <option value="large">Grande</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Bordas Arredondadas ({editedConfig.layout.borderRadius}px)
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="32"
                            value={editedConfig.layout.borderRadius}
                            onChange={e => handleConfigChange('layout.borderRadius', parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Espaçamento ({editedConfig.layout.cardSpacing}px)
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="24"
                            value={editedConfig.layout.cardSpacing}
                            onChange={e => handleConfigChange('layout.cardSpacing', parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Modo de Exibição
                          </label>
                          <select
                            value={editedConfig.menuStructure.displayMode}
                            onChange={e => handleConfigChange('menuStructure.displayMode', e.target.value)}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
                          >
                            <option value="tabs">Abas</option>
                            <option value="scroll">Rolagem</option>
                            <option value="list">Lista</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {activeTab === 'display' && (
                      <div className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <ToggleSwitch
                            label="Mostrar Imagem"
                            checked={editedConfig.productDisplay.showImage}
                            onChange={v => handleConfigChange('productDisplay.showImage', v)}
                          />
                          <ToggleSwitch
                            label="Mostrar Nome"
                            checked={editedConfig.productDisplay.showName}
                            onChange={v => handleConfigChange('productDisplay.showName', v)}
                          />
                          <ToggleSwitch
                            label="Mostrar Descrição"
                            checked={editedConfig.productDisplay.showDescription}
                            onChange={v => handleConfigChange('productDisplay.showDescription', v)}
                          />
                          <ToggleSwitch
                            label="Mostrar Preço"
                            checked={editedConfig.productDisplay.showPrice}
                            onChange={v => handleConfigChange('productDisplay.showPrice', v)}
                          />
                          <ToggleSwitch
                            label="Mostrar Botão Adicionar"
                            checked={editedConfig.productDisplay.showAddButton}
                            onChange={v => handleConfigChange('productDisplay.showAddButton', v)}
                          />
                          <ToggleSwitch
                            label="Mostrar Badges"
                            checked={editedConfig.productDisplay.showBadges}
                            onChange={v => handleConfigChange('productDisplay.showBadges', v)}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Estilo do Botão
                          </label>
                          <select
                            value={editedConfig.productDisplay.addButtonStyle}
                            onChange={e => handleConfigChange('productDisplay.addButtonStyle', e.target.value)}
                            className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
                          >
                            <option value="icon">Ícone (+)</option>
                            <option value="text">Texto</option>
                            <option value="full">Botão Completo</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Linhas Máximas da Descrição ({editedConfig.productDisplay.maxDescriptionLines})
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="5"
                            value={editedConfig.productDisplay.maxDescriptionLines}
                            onChange={e => handleConfigChange('productDisplay.maxDescriptionLines', parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        disabled={selectedTemplate.isSystem}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restaurar
                      </Button>
                      {!selectedTemplate.isSystem && (
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-1" />
                          )}
                          Salvar
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Palette className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Selecione um template</h3>
                <p className="text-sm text-slate-500 text-center max-w-md">
                  Escolha um template na lista ao lado para começar a personalizar a aparência do seu cardápio digital.
                </p>
              </CardContent>
            </Card>
          )}

          {selectedTemplate && editedConfig && (
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-slate-500" />
                  <CardTitle className="text-base">Preview</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  className="rounded-lg p-6"
                  style={{ 
                    backgroundColor: editedConfig.colors.backgroundColor,
                    fontFamily: editedConfig.typography.fontFamily,
                  }}
                >
                  <div 
                    className="text-center mb-6"
                    style={{ fontSize: editedConfig.typography.sectionTitleSize }}
                  >
                    Nome do Restaurante
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className="rounded-lg border p-3"
                        style={{
                          backgroundColor: editedConfig.colors.surfaceColor,
                          borderColor: editedConfig.colors.borderColor,
                          borderRadius: editedConfig.layout.borderRadius,
                        }}
                      >
                        {editedConfig.productDisplay.showImage && (
                          <div 
                            className="bg-gray-200 mb-3 rounded-md mx-auto"
                            style={{ 
                              width: '100%', 
                              height: editedConfig.layout.maxImageHeight,
                              aspectRatio: editedConfig.layout.imageAspectRatio.replace(':', '/'),
                            }}
                          />
                        )}
                        <div 
                          className="font-medium text-center"
                          style={{ 
                            fontSize: editedConfig.typography.titleSize,
                            color: editedConfig.colors.textColor,
                          }}
                        >
                          Produto {i}
                        </div>
                        {editedConfig.productDisplay.showDescription && (
                          <div 
                            className="text-center mt-1"
                            style={{ 
                              fontSize: editedConfig.typography.descriptionSize,
                              color: editedConfig.colors.textSecondaryColor,
                            }}
                          >
                            Descrição do produto
                          </div>
                        )}
                        {editedConfig.productDisplay.showPrice && (
                          <div 
                            className="text-center mt-2 font-semibold"
                            style={{ 
                              fontSize: editedConfig.typography.priceSize,
                              color: editedConfig.colors.primaryColor,
                            }}
                          >
                            R$ {(i * 9.90).toFixed(2).replace('.', ',')}
                          </div>
                        )}
                        {editedConfig.productDisplay.showAddButton && (
                          <div className="mt-3 text-center">
                            <button
                              className="px-4 py-1.5 rounded-full text-sm font-medium"
                              style={{
                                backgroundColor: editedConfig.colors.primaryColor,
                                color: '#fff',
                              }}
                            >
                              {editedConfig.productDisplay.addButtonText}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {showCloneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Clonar Template</h3>
            <p className="text-sm text-slate-500 mb-4">
              Criar uma cópia do template "{selectedTemplate?.name}"?
            </p>
            <Input
              placeholder="Nome do novo template"
              value={cloneName}
              onChange={e => setCloneName(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCloneModal(false);
                  setCloneName('');
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleClone}
                disabled={!cloneName.trim() || isCloning}
              >
                {isCloning && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Clonar
              </Button>
            </div>
          </div>
        </div>
      )}
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
          onChange={e => onChange(e.target.value)}
          className="h-10 w-10 rounded border border-slate-200 cursor-pointer"
        />
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 font-mono text-sm"
        />
      </div>
    </div>
  );
}

function ToggleSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
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
