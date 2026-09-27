import React, { useState } from 'react';
import { PluginSettings } from '../../types';
import { Settings, Save, ShieldAlert, Cpu, CheckCircle2, CreditCard, Database, Trash2 } from 'lucide-react';

interface Props {
  settings: PluginSettings;
  setSettings: React.Dispatch<React.SetStateAction<PluginSettings>>;
}

export const SettingsView: React.FC<Props> = ({ settings, setSettings }) => {
  const [localSettings, setLocalSettings] = useState<PluginSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deleteOnUninstall, setDeleteOnUninstall] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Settings Header */}
      <div className="bg-white p-5 border border-[#c3c4c7] rounded-sm shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#1d2327] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#2271b1]" />
            <span>تنظیمات پیکربندی و درگاه‌های پرداخت (Settings & Adapters)</span>
          </h2>
          <p className="text-xs text-[#646970] mt-1">
            تنظیم پارامترهای موتور پردازش دسته‌ای، زمان نگهداری تاریخچه و آداپتورهای پرداخت اقساطی
          </p>
        </div>

        <button
          type="submit"
          className="flex items-center gap-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white px-5 py-2 rounded font-medium text-xs transition cursor-pointer shadow-sm"
        >
          <Save className="w-4 h-4" />
          <span>ذخیره تنظیمات</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border-r-4 border-emerald-600 p-3 text-xs text-emerald-900 rounded-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>تنظیمات افزونه با موفقیت ذخیره گردید و بلافاصله اعمال شد.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Batch & Performance Settings */}
        <div className="bg-white p-5 border border-[#c3c4c7] rounded-sm shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f0f1] pb-3 text-sm font-bold text-[#1d2327]">
            <Cpu className="w-4 h-4 text-[#2271b1]" />
            <span>کارایی و پردازش دسته‌ای (Batch Processing)</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2c3338] mb-1">
              تعداد محصولات در هر دسته (Batch Size):
            </label>
            <input
              type="number"
              min="5"
              max="200"
              value={localSettings.batchSize}
              onChange={e => setLocalSettings(prev => ({ ...prev, batchSize: Number(e.target.value) }))}
              className="w-full text-xs bg-[#f6f7f7] border border-[#8c8f94] rounded-sm px-3 py-2 focus:border-[#2271b1] focus:bg-white focus:outline-none"
            />
            <p className="text-[11px] text-[#646970] mt-1">
              برای هاست‌های اشتراکی مقدار ۲۰ تا ۳۰ و برای سرورهای اختصاصی مقدار ۵۰ تا ۱۰۰ توصیه می‌شود.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2c3338] mb-1">
              مدت‌زمان نگهداری تاریخچه (روز):
            </label>
            <input
              type="number"
              min="7"
              max="365"
              value={localSettings.historyRetentionDays}
              onChange={e => setLocalSettings(prev => ({ ...prev, historyRetentionDays: Number(e.target.value) }))}
              className="w-full text-xs bg-[#f6f7f7] border border-[#8c8f94] rounded-sm px-3 py-2 focus:border-[#2271b1] focus:bg-white focus:outline-none"
            />
            <p className="text-[11px] text-[#646970] mt-1">
              لاگ‌های قدیمی‌تر از این تعداد روز توسط کرون‌جاب پاکسازی خودکار خواهند شد.
            </p>
          </div>

          <div className="pt-2 border-t border-[#f0f0f1] space-y-2">
            <label className="flex items-center gap-2 text-xs text-[#1d2327] cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.rollbackEnabled}
                onChange={e => setLocalSettings(prev => ({ ...prev, rollbackEnabled: e.target.checked }))}
                className="w-4 h-4 rounded text-[#2271b1] focus:ring-0"
              />
              <span className="font-semibold">فعال بودن قابلیت بازگردانی (Rollback)</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[#1d2327] cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.auditLogEnabled}
                onChange={e => setLocalSettings(prev => ({ ...prev, auditLogEnabled: e.target.checked }))}
                className="w-4 h-4 rounded text-[#2271b1] focus:ring-0"
              />
              <span className="font-semibold">ثبت اسنپ‌شات کامل اقلام در پایگاه داده (Audit Log)</span>
            </label>
          </div>
        </div>

        {/* 2. Gateways Adapters (Snappay & Torob) */}
        <div className="bg-white p-5 border border-[#c3c4c7] rounded-sm shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f0f1] pb-3 text-sm font-bold text-[#1d2327]">
            <CreditCard className="w-4 h-4 text-[#2271b1]" />
            <span>تنظیمات لایه آداپتور درگاه‌ها (Gateway Adapters)</span>
          </div>

          <div className="space-y-3">
            <div className="bg-[#f9f9f9] p-3 rounded border border-[#e5e5e5] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1d2327]">
                <span>آداپتور اسنپ‌پی (Snappay Adapter)</span>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">اتصال پویا</span>
              </div>
              <div>
                <label className="block text-[11px] text-[#50575e] mb-1">نام کلید متای کالا (Meta Key):</label>
                <input
                  type="text"
                  value={localSettings.snappayMetaKey}
                  onChange={e => setLocalSettings(prev => ({ ...prev, snappayMetaKey: e.target.value }))}
                  className="w-full text-xs font-mono bg-white border border-[#8c8f94] rounded-sm px-2.5 py-1.5 focus:border-[#2271b1] focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-[#646970]">
                همچنین قابل فیلتر از طریق هوک وردپرس: <code className="font-mono">wc_bpe_snappay_meta_key</code>
              </p>
            </div>

            <div className="bg-[#f9f9f9] p-3 rounded border border-[#e5e5e5] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1d2327]">
                <span>آداپتور پرداخت سریع ترب (Torob Pay Adapter)</span>
                <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded">اتصال پویا</span>
              </div>
              <div>
                <label className="block text-[11px] text-[#50575e] mb-1">نام کلید متای کالا (Meta Key):</label>
                <input
                  type="text"
                  value={localSettings.torobMetaKey}
                  onChange={e => setLocalSettings(prev => ({ ...prev, torobMetaKey: e.target.value }))}
                  className="w-full text-xs font-mono bg-white border border-[#8c8f94] rounded-sm px-2.5 py-1.5 focus:border-[#2271b1] focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-[#646970]">
                همچنین قابل فیلتر از طریق هوک وردپرس: <code className="font-mono">wc_bpe_torob_meta_key</code>
              </p>
            </div>
          </div>
        </div>

        {/* 3. Price Rules & Rounding */}
        <div className="bg-white p-5 border border-[#c3c4c7] rounded-sm shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f0f1] pb-3 text-sm font-bold text-[#1d2327]">
            <Database className="w-4 h-4 text-[#2271b1]" />
            <span>قوانین قیمت‌گذاری و رندسازی</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2c3338] mb-1">
              واحد پیش‌فرض گرد کردن قیمت‌ها (تومان):
            </label>
            <select
              value={localSettings.priceRoundUnit}
              onChange={e => setLocalSettings(prev => ({ ...prev, priceRoundUnit: Number(e.target.value) }))}
              className="w-full text-xs bg-[#f6f7f7] border border-[#8c8f94] rounded-sm px-3 py-2 focus:border-[#2271b1] focus:bg-white focus:outline-none"
            >
              <option value="1">بدون رند کردن (دقیق)</option>
              <option value="1000">نزدیک‌ترین ۱,۰۰۰ تومان (پیشنهادی فروشگاه‌های ایران)</option>
              <option value="5000">نزدیک‌ترین ۵,۰۰۰ تومان</option>
              <option value="10000">نزدیک‌ترین ۱۰,۰۰۰ تومان</option>
            </select>
          </div>
        </div>

        {/* 4. Uninstall Clean-up Policy */}
        <div className="bg-white p-5 border border-[#c3c4c7] rounded-sm shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f0f1] pb-3 text-sm font-bold text-[#d63638]">
            <Trash2 className="w-4 h-4 text-[#d63638]" />
            <span>سیاست پاکسازی هنگام حذف افزونه (Uninstall Policy)</span>
          </div>

          <div className="bg-red-50/60 border border-red-200 p-3 rounded text-xs space-y-2">
            <p className="text-red-900 font-medium">
              طبق استاندارد حرفه‌ای، پایگاه داده و لاگ‌های شما هنگام غیرفعال‌سازی پاک نمی‌شوند مگر اینکه گزینه زیر را صریحاً تیک بزنید.
            </p>

            <label className="flex items-center gap-2 text-xs text-[#1d2327] cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={deleteOnUninstall}
                onChange={e => setDeleteOnUninstall(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-0"
              />
              <span className="font-bold text-red-700">حذف کامل تمام جداول و تاریخچه‌ها هنگام حذف قطعی (Uninstall) افزونه</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};
