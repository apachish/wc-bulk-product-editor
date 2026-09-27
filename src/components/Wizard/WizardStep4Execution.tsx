import React, { useState, useEffect } from 'react';
import { Product, OperationSettings, ProductChangePreview, BatchExecutionStats } from '../../types';
import { ChangeSetEngine } from '../../services/changeSetEngine';
import { Play, CheckCircle2, AlertOctagon, RotateCw, ShieldCheck, ArrowRight, Activity } from 'lucide-react';

interface Props {
  products: Product[];
  selectedProductIds: number[];
  settings: OperationSettings;
  batchSize: number;
  onExecutionComplete: (stats: BatchExecutionStats, modifiedProducts: Product[], operationId: string) => void;
  onPrev: () => void;
}

export const WizardStep4Execution: React.FC<Props> = ({
  products,
  selectedProductIds,
  settings,
  batchSize,
  onExecutionComplete,
  onPrev
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [confirmedSafe, setConfirmedSafe] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));
  const previews = ChangeSetEngine.generatePreviews(selectedProducts, settings);

  const [stats, setStats] = useState<BatchExecutionStats>({
    total: previews.length,
    processed: 0,
    successful: 0,
    failed: 0,
    currentBatch: 0,
    totalBatches: Math.ceil(previews.length / batchSize) || 1,
    errors: []
  });

  const handleStartBatchProcessing = async () => {
    setIsProcessing(true);
    setHasStarted(true);

    const operationId = 'bpe-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now();
    const updatedProducts: Product[] = JSON.parse(JSON.stringify(products));

    let processedCount = 0;
    let successCount = 0;
    let failCount = 0;
    const errors: { productId: number; sku: string; error: string }[] = [];

    // Split into batches
    const totalBatches = Math.ceil(previews.length / batchSize) || 1;

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, previews.length);
      const currentBatchItems = previews.slice(start, end);

      setStats(prev => ({
        ...prev,
        currentBatch: batchIndex + 1,
        totalBatches
      }));

      // Simulate network / server processing latency for safe batch
      await new Promise(r => setTimeout(r, 600));

      for (const item of currentBatchItems) {
        try {
          // Find target item in updatedProducts
          if (item.type === 'variation' && item.parentId) {
            const parent = updatedProducts.find(p => p.id === item.parentId);
            if (parent && parent.variations) {
              const variation = parent.variations.find(v => v.id === item.productId);
              if (variation) {
                // Apply fields
                if (item.afterSnapshot.regularPrice !== undefined) variation.regularPrice = item.afterSnapshot.regularPrice as number;
                if (item.afterSnapshot.salePrice !== undefined) variation.salePrice = item.afterSnapshot.salePrice as number;
                if (item.afterSnapshot.stockQuantity !== undefined) {
                  const stockNum = parseInt(String(item.afterSnapshot.stockQuantity), 10);
                  variation.stockQuantity = isNaN(stockNum) ? 0 : stockNum;
                  variation.stockStatus = variation.stockQuantity > 0 ? 'instock' : 'outofstock';
                }
                if (item.afterSnapshot.isPurchasable !== undefined) {
                  variation.isPurchasable = String(item.afterSnapshot.isPurchasable) === 'فعال' || Boolean(item.afterSnapshot.isPurchasable);
                }
                if (item.afterSnapshot.snappayEnabled !== undefined) {
                  variation.snappayEnabled = String(item.afterSnapshot.snappayEnabled) === 'فعال' || Boolean(item.afterSnapshot.snappayEnabled);
                }
                if (item.afterSnapshot.torobPayEnabled !== undefined) {
                  variation.torobPayEnabled = String(item.afterSnapshot.torobPayEnabled) === 'فعال' || Boolean(item.afterSnapshot.torobPayEnabled);
                }
              }
            }
          } else {
            const prod = updatedProducts.find(p => p.id === item.productId);
            if (prod) {
              if (item.afterSnapshot.regularPrice !== undefined) prod.regularPrice = item.afterSnapshot.regularPrice as number;
              if (item.afterSnapshot.salePrice !== undefined) prod.salePrice = item.afterSnapshot.salePrice as number;
              if (item.afterSnapshot.status !== undefined) {
                const rawStatus = String(item.afterSnapshot.status);
                if (rawStatus.includes('Publish') || rawStatus.includes('منتشر') || rawStatus === 'publish') prod.status = 'publish';
                else if (rawStatus.includes('Draft') || rawStatus.includes('پیش‌نویس') || rawStatus === 'draft') prod.status = 'draft';
                else if (rawStatus.includes('Pending') || rawStatus.includes('انتظار') || rawStatus === 'pending') prod.status = 'pending';
                else if (rawStatus.includes('Private') || rawStatus.includes('خصوصی') || rawStatus === 'private') prod.status = 'private';
              }
              if (item.afterSnapshot.stockStatus !== undefined) {
                const rawStockStatus = String(item.afterSnapshot.stockStatus);
                prod.stockStatus = (rawStockStatus.includes('موجود') && !rawStockStatus.includes('ناموجود')) || rawStockStatus === 'instock' ? 'instock' : 'outofstock';
              }
              if (item.afterSnapshot.stockQuantity !== undefined) {
                const stockNum = parseInt(String(item.afterSnapshot.stockQuantity), 10);
                prod.stockQuantity = isNaN(stockNum) ? 0 : stockNum;
                prod.stockStatus = prod.stockQuantity > 0 ? 'instock' : 'outofstock';
              }
              if (item.afterSnapshot.isPurchasable !== undefined) {
                prod.isPurchasable = String(item.afterSnapshot.isPurchasable) === 'فعال' || Boolean(item.afterSnapshot.isPurchasable);
              }
              if (item.afterSnapshot.snappayEnabled !== undefined) {
                prod.snappayEnabled = String(item.afterSnapshot.snappayEnabled) === 'فعال' || Boolean(item.afterSnapshot.snappayEnabled);
              }
              if (item.afterSnapshot.torobPayEnabled !== undefined) {
                prod.torobPayEnabled = String(item.afterSnapshot.torobPayEnabled) === 'فعال' || Boolean(item.afterSnapshot.torobPayEnabled);
              }
              if (item.afterSnapshot.priceRange !== undefined) {
                const prVal = String(item.afterSnapshot.priceRange);
                prod.priceRange = prVal === 'حذف ویژگی' ? undefined : prVal;
                if (!prod.attributes) prod.attributes = {};
                if (prVal === 'حذف ویژگی') delete prod.attributes['pa_price-range'];
                else prod.attributes['pa_price-range'] = prVal;
              }
              if (item.afterSnapshot.brand !== undefined) {
                const brVal = String(item.afterSnapshot.brand);
                prod.brand = brVal === 'حذف برند' ? '' : brVal;
                if (!prod.attributes) prod.attributes = {};
                if (brVal === 'حذف برند') {
                  delete prod.attributes['pa_brands'];
                  delete prod.attributes['pa_brand'];
                  delete prod.attributes['brand'];
                  delete prod.attributes['برند'];
                } else {
                  prod.attributes['pa_brands'] = brVal;
                  prod.attributes['pa_brand'] = brVal;
                }
              }
              // Custom attributes
              Object.keys(item.afterSnapshot).forEach(snapKey => {
                if (snapKey.startsWith('attr_')) {
                  const rawAttrName = snapKey.substring(5);
                  const attrVal = String((item.afterSnapshot as Record<string, any>)[snapKey]);
                  if (!prod.attributes) prod.attributes = {};
                  if (attrVal === 'حذف ویژگی') {
                    delete prod.attributes[rawAttrName];
                  } else {
                    prod.attributes[rawAttrName] = attrVal;
                  }
                }
              });
            }
          }

          successCount++;
        } catch (err: any) {
          failCount++;
          errors.push({
            productId: item.productId,
            sku: item.sku,
            error: err?.message || 'خطای ذخیره‌سازی داده'
          });
        }
        processedCount++;
      }

      const percent = Math.round((processedCount / previews.length) * 100);
      setProgressPercent(percent);

      setStats(prev => ({
        ...prev,
        processed: processedCount,
        successful: successCount,
        failed: failCount,
        errors
      }));
    }

    setIsProcessing(false);

    // Call completion callback
    setTimeout(() => {
      onExecutionComplete(
        {
          total: previews.length,
          processed: processedCount,
          successful: successCount,
          failed: failCount,
          currentBatch: totalBatches,
          totalBatches,
          errors
        },
        updatedProducts,
        operationId
      );
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Confirmation Box if not started */}
      {!hasStarted && (
        <div className="bg-white p-6 border border-[#c3c4c7] rounded-sm shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-[#f0f0f1] pb-3 text-sm font-bold text-[#1d2327]">
            <ShieldCheck className="w-5 h-5 text-[#2271b1]" />
            <span>تأییدیه امنیتی و دستور اجرای پردازش دسته‌ای</span>
          </div>

          <div className="bg-[#fcf9e8] border border-[#dcdcde] p-4 text-xs text-[#2c3338] rounded space-y-2">
            <p className="font-semibold text-amber-900">
              شما در حال اعمال تغییرات روی <strong>{previews.length} قلم کالا</strong> هستید.
            </p>
            <ul className="list-disc list-inside space-y-1 text-[#50575e]">
              <li>عملیات در بسته‌های <strong>{batchSize}تایی</strong> انجام می‌گردد تا از اتمام محدودیت رم و زمان سرور جلوگیری شود.</li>
              <li>قبل و بعد تمامی مقادیر در جدول تاریخچه (Audit Log) ذخیره می‌شود و امکان <strong>Rollback کامل</strong> وجود دارد.</li>
              <li>بررسی همزمانی (Concurrency Check) صورت می‌پذیرد تا تداخل داده رخ ندهد.</li>
            </ul>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-[#1d2327] cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedSafe}
                onChange={e => setConfirmedSafe(e.target.checked)}
                className="w-4 h-4 rounded text-[#2271b1] focus:ring-0 cursor-pointer"
              />
              <span>من تغییرات پیش‌نمایش را بررسی کرده و مسئولیت اعمال گروهی این داده‌ها را تأیید می‌نمایم.</span>
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#f0f0f1]">
            <button
              type="button"
              onClick={onPrev}
              className="flex items-center gap-2 border border-[#8c8f94] hover:bg-[#f0f0f1] text-[#2c3338] px-4 py-2 rounded font-medium text-xs transition cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به پیش‌نمایش</span>
            </button>

            <button
              type="button"
              disabled={!confirmedSafe}
              onClick={handleStartBatchProcessing}
              className="flex items-center gap-2 bg-[#00a32a] hover:bg-[#008a20] text-white px-6 py-2.5 rounded font-bold text-xs transition cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              <span>شروع فوری اعمال تغییرات در پایگاه داده</span>
            </button>
          </div>
        </div>
      )}

      {/* Execution Progress State */}
      {hasStarted && (
        <div className="bg-white p-6 border border-[#c3c4c7] rounded-sm shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1d2327]">
              <Activity className="w-5 h-5 text-[#2271b1] animate-pulse" />
              <span>
                {isProcessing ? 'در حال اجرای پردازش دسته‌ای در ووکامرس...' : 'عملیات دسته‌ای با موفقیت پایان یافت.'}
              </span>
            </div>
            <span className="text-xs font-mono text-[#646970]">
              دسته {stats.currentBatch} از {stats.totalBatches}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[#50575e]">
              <span>پیشرفت کلی:</span>
              <span className="font-bold text-[#2271b1] font-mono">{progressPercent}٪</span>
            </div>
            <div className="w-full bg-[#f0f0f1] rounded-full h-3 overflow-hidden border border-[#dcdcde]">
              <div
                className="bg-[#2271b1] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Live Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-[#f6f7f7] p-3 rounded border border-[#e5e5e5]">
              <span className="text-[#646970]">کل اقلام:</span>
              <div className="text-base font-bold text-[#1d2327] mt-1">{stats.total}</div>
            </div>
            <div className="bg-[#f6f7f7] p-3 rounded border border-[#e5e5e5]">
              <span className="text-[#646970]">پردازش شده:</span>
              <div className="text-base font-bold text-[#2271b1] mt-1">{stats.processed}</div>
            </div>
            <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
              <span className="text-emerald-800">موفق:</span>
              <div className="text-base font-bold text-emerald-700 mt-1">{stats.successful}</div>
            </div>
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <span className="text-red-800">خطا:</span>
              <div className="text-base font-bold text-red-700 mt-1">{stats.failed}</div>
            </div>
          </div>

          {/* Spinner during execution */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-2 text-xs text-[#2271b1] py-3 bg-blue-50/50 rounded">
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>ارسال بسته‌ها به سرور بدون قفل شدن جدول و ذخیره اسنپ‌شات‌ها...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
