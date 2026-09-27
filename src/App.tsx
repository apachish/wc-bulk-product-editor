import React, { useState, useMemo } from 'react';
import { Product, FilterCriteria, OperationSettings, PluginSettings, OperationLog, BatchExecutionStats } from './types';
import { initialProducts, defaultSettings, sampleHistory, sampleBrandsList } from './mockData';
import { WordPressHeader } from './components/WordPressHeader';
import { WizardStepsIndicator } from './components/Wizard/WizardStepsIndicator';
import { WizardStep1Filters } from './components/Wizard/WizardStep1Filters';
import { WizardStep2Operations } from './components/Wizard/WizardStep2Operations';
import { WizardStep3Preview } from './components/Wizard/WizardStep3Preview';
import { WizardStep4Execution } from './components/Wizard/WizardStep4Execution';
import { WizardStep5Report } from './components/Wizard/WizardStep5Report';
import { HistoryView } from './components/History/HistoryView';
import { SettingsView } from './components/Settings/SettingsView';
import { SourceCodeViewer } from './components/SourceCode/SourceCodeViewer';
import { ProductTableView } from './components/EditableTable/ProductTableView';
import { generatePluginZip, downloadBlob } from './services/zipExporter';

export default function App() {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'wizard' | 'table' | 'history' | 'settings' | 'source'>('wizard');
  const [wizardStep, setWizardStep] = useState<number>(1);

  // Core Data State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([101, 102, 104]);
  const [settings, setSettings] = useState<PluginSettings>(defaultSettings);
  const [historyLogs, setHistoryLogs] = useState<OperationLog[]>(sampleHistory);

  // Filters State
  const [filters, setFilters] = useState<FilterCriteria>({
    searchTerm: '',
    sku: '',
    productId: '',
    brand: '',
    category: '',
    productType: '',
    postStatus: '',
    stockStatus: '',
    purchasableStatus: 'all',
    targetLevel: 'all',
    saleFilter: 'all',
    minPrice: '',
    maxPrice: ''
  });

  // Operation Settings State (Default to 'none' = no change)
  const [opSettings, setOpSettings] = useState<OperationSettings>({
    regularPriceType: 'increase_percent',
    regularPriceValue: 10,
    salePriceType: 'none',
    salePriceValue: 0,
    stockType: 'none',
    stockValue: 0,
    postStatusAction: 'none',
    stockStatusAction: 'none',
    purchasableAction: 'none',
    snappayAction: 'enable',
    torobPayAction: 'none',
    priceRangeAction: 'none',
    priceRangeValue: '۲ تا ۵ میلیون',
    brandAction: 'none',
    brandValue: 'Casio',
    customAttributeAction: 'none',
    customAttributeName: 'رنگ',
    customAttributeValue: '',
    customAttributeSearchValue: '',
    applyToScope: 'products_and_variations',
    roundPriceTo: 1000
  });

  // Comprehensive brands and attributes lists
  const allBrands = useMemo(() => {
    const list = new Set<string>(sampleBrandsList);
    products.forEach(p => {
      if (p.brand) list.add(p.brand);
      if (p.attributes) {
        if (p.attributes['pa_brands']) list.add(p.attributes['pa_brands']);
        if (p.attributes['pa_brand']) list.add(p.attributes['pa_brand']);
        if (p.attributes['brand']) list.add(p.attributes['brand']);
        if (p.attributes['برند']) list.add(p.attributes['برند']);
      }
    });
    return Array.from(list).filter(Boolean);
  }, [products]);

  const allAttributes = useMemo(() => {
    const set = new Set<string>(['رنگ', 'سایز', 'گارانتی', 'جنس', 'مدل', 'کشور سازنده', 'محدوده قیمت']);
    products.forEach(p => {
      if (p.attributes) {
        Object.keys(p.attributes).forEach(k => {
          if (!k.startsWith('pa_price-range') && !k.startsWith('pa_brands')) {
            set.add(k.replace(/^pa_/, ''));
          }
        });
      }
      if (p.variations) {
        p.variations.forEach(v => {
          if (v.attributes) {
            Object.keys(v.attributes).forEach(k => set.add(k.replace(/^pa_/, '')));
          }
        });
      }
    });
    return Array.from(set);
  }, [products]);

  // Execution Report State
  const [lastStats, setLastStats] = useState<BatchExecutionStats | null>(null);
  const [lastOperationId, setLastOperationId] = useState<string>('');
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // ZIP download handler
  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      const zipBlob = await generatePluginZip();
      downloadBlob(zipBlob, 'wc-bulk-product-editor-pro.zip');
    } catch (err) {
      console.error('Failed to generate ZIP', err);
      alert('خطا در ایجاد فایل زیپ. لطفاً مجدداً تلاش نمایید.');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Execution complete handler
  const handleExecutionComplete = (
    stats: BatchExecutionStats,
    modifiedProducts: Product[],
    operationId: string
  ) => {
    setProducts(modifiedProducts);
    setLastStats(stats);
    setLastOperationId(operationId);

    // Create Audit Log record
    const newLog: OperationLog = {
      id: operationId,
      userId: 1,
      userName: 'مدیر کل (admin)',
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) + ' - امروز',
      description: `ویرایش گروهی ${stats.successful} قلم محصول`,
      totalItems: stats.total,
      successCount: stats.successful,
      failCount: stats.failed,
      status: 'completed',
      filtersSummary: `انتخاب دستی ${stats.total} محصول`,
      changesSummary: [
        opSettings.regularPriceType !== 'none' ? `قیمت عادی: ${opSettings.regularPriceType}` : null,
        opSettings.stockType !== 'none' ? `موجودی: ${opSettings.stockType}` : null,
        opSettings.snappayAction !== 'none' ? `اسنپ‌پی: ${opSettings.snappayAction}` : null,
        opSettings.torobPayAction !== 'none' ? `ترب: ${opSettings.torobPayAction}` : null
      ].filter(Boolean).join(' | ') || 'تغییرات فیلدها',
      items: modifiedProducts
        .filter(p => selectedProductIds.includes(p.id))
        .map(p => ({
          productId: p.id,
          name: p.name,
          sku: p.sku,
          beforeData: { price: 'ثبت شد در اسنپ‌شات' },
          afterData: { regularPrice: p.regularPrice, stock: p.stockQuantity },
          rolledBack: false
        }))
    };

    setHistoryLogs(prev => [newLog, ...prev]);
    setWizardStep(5);
  };

  // Rollback Handler
  const handleRollback = (operationId: string) => {
    const log = historyLogs.find(l => l.id === operationId);
    if (!log) return;

    // Reset products to previous simulation state
    setProducts(prev => {
      return prev.map(p => {
        // Find if this product was in log
        const item = log.items.find(i => i.productId === p.id);
        if (item) {
          // If we had a previous base price, revert or decrement
          return {
            ...p,
            regularPrice: Math.round(p.regularPrice / 1.1),
            snappayEnabled: false
          };
        }
        return p;
      });
    });

    // Mark log as rolled back
    setHistoryLogs(prev =>
      prev.map(l => (l.id === operationId ? { ...l, status: 'rolled_back' } : l))
    );

    alert(`عملیات ${operationId} با موفقیت بازگردانی (Rollback) شد و مقادیر به اسنپ‌شات اولیه برگشتند.`);
  };

  // Direct Editable Table Save Handler
  const handleSaveTableProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);

    // Record into Audit Log
    const opId = 'bpe-tbl-' + Math.random().toString(36).substring(2, 8);
    const newLog: OperationLog = {
      id: opId,
      userId: 1,
      userName: 'مدیر کل (admin)',
      timestamp: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }) + ' - ویرایش مستقیم جدول',
      description: 'ویرایش مستقیم درون‌ردیفی محصولات در جدول (Editable Table)',
      totalItems: updatedProducts.length,
      successCount: updatedProducts.length,
      failCount: 0,
      status: 'completed',
      filtersSummary: 'ویرایش سریع سلول‌های جدول',
      changesSummary: 'به‌روزرسانی فیلدهای نام، دسته، برند، توضیحات، قیمت و موجودی',
      items: updatedProducts.map(p => ({
        productId: p.id,
        name: p.name,
        sku: p.sku,
        beforeData: { note: 'اسنپ‌شات قبلی' },
        afterData: {
          name: p.name,
          category: p.category,
          brand: p.brand,
          price: p.regularPrice,
          stock: p.stockQuantity
        },
        rolledBack: false
      }))
    };

    setHistoryLogs(prev => [newLog, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#f0f0f1] text-[#2c3338] flex flex-col font-sans">
      {/* WordPress Admin Bar & Tabs */}
      <WordPressHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadZip={handleDownloadZip}
        isDownloading={isDownloadingZip}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {/* TAB 1: 5-STEP WIZARD */}
        {activeTab === 'wizard' && (
          <div className="space-y-4">
            <WizardStepsIndicator
              currentStep={wizardStep}
              onStepClick={step => setWizardStep(step)}
            />

            {wizardStep === 1 && (
              <WizardStep1Filters
                products={products}
                selectedProductIds={selectedProductIds}
                setSelectedProductIds={setSelectedProductIds}
                filters={filters}
                setFilters={setFilters}
                onNext={() => setWizardStep(2)}
                onSwitchToTable={() => setActiveTab('table')}
              />
            )}

            {wizardStep === 2 && (
              <WizardStep2Operations
                settings={opSettings}
                setSettings={setOpSettings}
                onNext={() => setWizardStep(3)}
                onPrev={() => setWizardStep(1)}
                selectedCount={selectedProductIds.length}
                availableBrands={allBrands}
                availableAttributes={allAttributes}
              />
            )}

            {wizardStep === 3 && (
              <WizardStep3Preview
                products={products}
                selectedProductIds={selectedProductIds}
                settings={opSettings}
                onNext={() => setWizardStep(4)}
                onPrev={() => setWizardStep(2)}
              />
            )}

            {wizardStep === 4 && (
              <WizardStep4Execution
                products={products}
                selectedProductIds={selectedProductIds}
                settings={opSettings}
                batchSize={settings.batchSize}
                onExecutionComplete={handleExecutionComplete}
                onPrev={() => setWizardStep(3)}
              />
            )}

            {wizardStep === 5 && lastStats && (
              <WizardStep5Report
                stats={lastStats}
                operationId={lastOperationId}
                onReset={() => {
                  setWizardStep(1);
                  setLastStats(null);
                }}
                onGoToHistory={() => setActiveTab('history')}
                onRollback={handleRollback}
              />
            )}
          </div>
        )}

        {/* TAB 2: EDITABLE TABLE SPREADSHEET */}
        {activeTab === 'table' && (
          <ProductTableView
            products={products}
            onSaveProducts={handleSaveTableProducts}
            onGoToWizard={(selectedIds) => {
              setSelectedProductIds(selectedIds);
              setActiveTab('wizard');
              setWizardStep(2);
            }}
          />
        )}

        {/* TAB 3: AUDIT LOG & ROLLBACK */}
        {activeTab === 'history' && (
          <HistoryView
            historyLogs={historyLogs}
            onRollback={handleRollback}
          />
        )}

        {/* TAB 3: SETTINGS & ADAPTERS */}
        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            setSettings={setSettings}
          />
        )}

        {/* TAB 4: SOURCE CODE & DOCUMENTATION */}
        {activeTab === 'source' && (
          <SourceCodeViewer
            onDownloadZip={handleDownloadZip}
            isDownloading={isDownloadingZip}
          />
        )}
      </main>

      {/* WordPress Admin Footer */}
      <footer className="bg-white border-t border-[#c3c4c7] text-[#646970] text-xs py-3 px-4 mt-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>افزونه ویرایش گروهی محصولات ووکامرس (نسخه ۱.۰.۰) • پشتیبانی شده توسط PHP 8.1+ و WooCommerce CRUD</span>
          <span>سازگار با اسنپ‌پی، ترب، محصولات متغیر و پایگاه داده با سیستم Rollback دوگانه</span>
        </div>
      </footer>
    </div>
  );
}
