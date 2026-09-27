import React, { useMemo } from 'react';
import { Product, OperationSettings } from '../../types';
import { ChangeSetEngine } from '../../services/changeSetEngine';
import { Eye, AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface Props {
  products: Product[];
  selectedProductIds: number[];
  settings: OperationSettings;
  onNext: () => void;
  onPrev: () => void;
}

export const WizardStep3Preview: React.FC<Props> = ({
  products,
  selectedProductIds,
  settings,
  onNext,
  onPrev
}) => {
  const selectedProducts = useMemo(() => {
    return products.filter(p => selectedProductIds.includes(p.id));
  }, [products, selectedProductIds]);

  // Generate change previews using shared ChangeSetEngine
  const previews = useMemo(() => {
    return ChangeSetEngine.generatePreviews(selectedProducts, settings);
  }, [selectedProducts, settings]);

  const totalModifications = previews.reduce((acc, p) => acc + p.diffs.length, 0);

  return (
    <div className="space-y-6">
      {/* Information Header */}
      <div className="bg-amber-50 border-r-4 border-amber-500 p-4 text-xs text-[#1d2327] rounded-sm flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm text-amber-800 mb-1">پیش‌نمایش ایمن قبل از ذخیره‌سازی در دیتابیس (Dry Run)</h4>
          <p className="leading-relaxed text-[#50575e]">
            هیچ تغییری هنوز در پایگاه داده اعمال نشده است. این پیش‌نمایش توسط همان موتور Change Set محاسبه شده که در مرحله بعد اجرا خواهد شد. لطفاً تغییرات قبل و بعد را به دقت بازبینی فرمایید.
          </p>
        </div>
      </div>

      {/* Summary Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 border border-[#c3c4c7] rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-[#646970]">محصولات بررسی‌شده:</span>
            <div className="text-lg font-bold text-[#1d2327] mt-0.5">{selectedProducts.length} محصول</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 text-[#2271b1] flex items-center justify-center font-bold text-sm">
            {selectedProducts.length}
          </div>
        </div>

        <div className="bg-white p-4 border border-[#c3c4c7] rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-[#646970]">اقلام دارای تغییر (محصول/تنوع):</span>
            <div className="text-lg font-bold text-[#2271b1] mt-0.5">{previews.length} قلم کالا</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 text-[#2271b1] flex items-center justify-center font-bold text-sm">
            {previews.length}
          </div>
        </div>

        <div className="bg-white p-4 border border-[#c3c4c7] rounded-sm shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-[#646970]">کل فیلدهای به‌روزرسانی‌شده:</span>
            <div className="text-lg font-bold text-emerald-700 mt-0.5">{totalModifications} فیلد</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
            {totalModifications}
          </div>
        </div>
      </div>

      {/* Preview Diff Table */}
      <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm overflow-hidden">
        <div className="bg-[#f6f7f7] px-4 py-3 border-b border-[#c3c4c7] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-[#1d2327]">
            <Eye className="w-4 h-4 text-[#2271b1]" />
            <span>جدول مغایرت‌های قبل و بعد (Diff Table)</span>
          </div>
          <span className="text-[#646970]">
            نمایش {previews.length} ردیف با تغییر معتبر
          </span>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[500px] relative">
          <table className="w-full text-right text-xs border-separate border-spacing-0">
            <thead className="select-none sticky top-0 z-20">
              <tr className="bg-[#f0f0f1] text-[#2c3338] font-semibold">
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3 w-20">شناسه</th>
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3">نام و مشخصات قلم کالا</th>
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3 w-32">کد محصول (SKU)</th>
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3 w-24">سطح</th>
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3">تغییرات تفصیلی (قبل ← بعد)</th>
              </tr>
            </thead>
            <tbody>
              {previews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#646970] border-b border-[#f0f0f1]">
                    هیچ تغییری با توجه به مقادیر فعلی و قواعد تعیین‌شده به وجود نیامد یا همه فیلدها روی «بدون تغییر» هستند.
                  </td>
                </tr>
              ) : (
                previews.map((item, idx) => (
                  <tr key={`${item.productId}-${idx}`} className="hover:bg-[#f6f7f7]">
                    <td className="py-3 px-3 font-mono text-[#646970] border-b border-[#f0f0f1]">#{item.productId}</td>
                    <td className="py-3 px-3 border-b border-[#f0f0f1]">
                      <div className="font-semibold text-[#1d2327]">{item.name}</div>
                      {item.parentId && (
                        <div className="text-[11px] text-[#2271b1]">وابسته به محصول اصلی #{item.parentId}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-[#50575e] border-b border-[#f0f0f1]">{item.sku}</td>
                    <td className="py-3 px-3 border-b border-[#f0f0f1]">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                        item.type === 'variation' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.type === 'variation' ? 'متغیر فرعی' : 'محصول اصلی'}
                      </span>
                    </td>
                    <td className="py-3 px-3 border-b border-[#f0f0f1]">
                      <div className="space-y-1.5">
                        {item.diffs.map((d, dIdx) => (
                          <div key={dIdx} className="flex flex-wrap items-center gap-2 bg-[#f9f9f9] p-1.5 rounded border border-[#e5e5e5]">
                            <span className="font-semibold text-[#2c3338]">{d.fieldLabel}:</span>
                            <span className="line-through text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                              {typeof d.oldValue === 'number' ? `${d.oldValue.toLocaleString('fa-IR')} تومان` : String(d.oldValue ?? 'خالی')}
                            </span>
                            <span className="text-[#8c8f94]">←</span>
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {typeof d.newValue === 'number' ? `${d.newValue.toLocaleString('fa-IR')} تومان` : String(d.newValue ?? 'خالی')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between bg-white p-4 border border-[#c3c4c7] rounded-sm shadow-sm">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-2 border border-[#8c8f94] hover:bg-[#f0f0f1] text-[#2c3338] px-4 py-2 rounded font-medium text-xs transition cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>ویرایش قواعد و فیلدها</span>
        </button>

        <button
          type="button"
          disabled={previews.length === 0}
          onClick={onNext}
          className="flex items-center gap-2 bg-[#2271b1] hover:bg-[#135e96] text-white px-6 py-2 rounded font-medium text-xs transition cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>تأیید نهایی و شروع پردازش دسته‌ای</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
