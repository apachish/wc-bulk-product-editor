import React from 'react';
import { BatchExecutionStats } from '../../types';
import { CheckCircle2, AlertTriangle, RotateCcw, History, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react';

interface Props {
  stats: BatchExecutionStats;
  operationId: string;
  onReset: () => void;
  onGoToHistory: () => void;
  onRollback: (operationId: string) => void;
}

export const WizardStep5Report: React.FC<Props> = ({
  stats,
  operationId,
  onReset,
  onGoToHistory,
  onRollback
}) => {
  const isAllSuccess = stats.failed === 0;

  return (
    <div className="space-y-6">
      {/* Success / Status Card */}
      <div className={`p-6 border rounded-sm shadow-sm ${
        isAllSuccess ? 'bg-white border-emerald-500' : 'bg-white border-amber-500'
      }`}>
        <div className="flex items-center gap-3 border-b border-[#f0f0f1] pb-4 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
            isAllSuccess ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {isAllSuccess ? <CheckCircle2 className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1d2327]">
              {isAllSuccess
                ? 'عملیات ویرایش گروهی محصولات با موفقیت کامل انجام گردید'
                : 'عملیات پایان یافت اما برخی اقلام دارای خطا بودند'}
            </h3>
            <p className="text-xs text-[#646970] mt-0.5">
              شناسه یکتای عملیات (UUID): <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">{operationId}</code>
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-4">
          <div className="bg-[#f6f7f7] p-3 rounded border border-[#e5e5e5]">
            <span className="text-[#646970]">تعداد کل اقلام پردازش‌شده:</span>
            <div className="text-lg font-bold text-[#1d2327] mt-1">{stats.total}</div>
          </div>
          <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
            <span className="text-emerald-800">تعداد اعمال موفق:</span>
            <div className="text-lg font-bold text-emerald-700 mt-1">{stats.successful}</div>
          </div>
          <div className="bg-red-50 p-3 rounded border border-red-200">
            <span className="text-red-800">تعداد خطاها:</span>
            <div className="text-lg font-bold text-red-700 mt-1">{stats.failed}</div>
          </div>
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <span className="text-blue-800">وضعیت اسنپ‌شات:</span>
            <div className="text-xs font-semibold text-blue-700 mt-2">ثبت کامل در دیتابیس</div>
          </div>
        </div>

        {/* Error Details if any */}
        {stats.errors.length > 0 && (
          <div className="mt-4 border border-red-200 rounded bg-red-50/50 p-4">
            <h4 className="text-xs font-bold text-red-800 mb-2">لیست خطاهای رخداده در پردازش اقلام:</h4>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {stats.errors.map((err, i) => (
                <div key={i} className="text-xs text-red-700 flex items-center justify-between bg-white p-2 rounded border border-red-100">
                  <span>محصول #{err.productId} ({err.sku})</span>
                  <span>{err.error}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Safety & Rollback info */}
      <div className="bg-white p-5 border border-[#c3c4c7] rounded-sm shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-[#2271b1] shrink-0" />
          <div className="text-xs">
            <h4 className="font-bold text-[#1d2327]">قابلیت بازگردانی تغییرات (Rollback) فعال است</h4>
            <p className="text-[#646970]">
              اگر متوجه هرگونه اشتباه در قیمت‌ها، موجودی یا درگاه‌ها شدید، می‌توانید همین الان یا هر زمان دیگر از صفحه تاریخچه تمام مقادیر قبلی را بازیابی کنید.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onRollback(operationId)}
          className="flex items-center gap-1.5 border border-[#d63638] text-[#d63638] hover:bg-red-50 px-4 py-2 rounded text-xs font-bold transition cursor-pointer shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>بازگردانی فوری (Rollback) این عملیات</span>
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between bg-white p-4 border border-[#c3c4c7] rounded-sm shadow-sm">
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 bg-[#2271b1] hover:bg-[#135e96] text-white px-5 py-2 rounded font-medium text-xs transition cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>شروع یک ویرایش گروهی جدید</span>
        </button>

        <button
          type="button"
          onClick={onGoToHistory}
          className="flex items-center gap-2 border border-[#8c8f94] hover:bg-[#f0f0f1] text-[#2c3338] px-4 py-2 rounded font-medium text-xs transition cursor-pointer"
        >
          <History className="w-4 h-4" />
          <span>مشاهده در تاریخچه و لاگ‌ها</span>
        </button>
      </div>
    </div>
  );
};
