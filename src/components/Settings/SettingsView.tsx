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

        {/* 1. Brand Source Settings (منبع خواندن و ذخیره برند) */}
        <div className="bg-white p-5 border border-[#c3c4c7] rounded-sm shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f0f1] pb-3 text-sm font-bold text-[#1d2327]">
            <Database className="w-4 h-4 text-[#2271b1]" />
            <span>منبع برند محصول (Product Brand Source)</span>
          </div>

          <p className="text-xs text-[#646970] leading-relaxed">
            مشخص کنید مقدار برند محصولات در جدول ویرایش سریع و عملیات گروهی از کدام بخش ووکامرس خوانده و ذخیره شود:
          </p>

          <div className="space-y-3">
            {/* Option A: Native WooCommerce Brands */}
            <label
              className={`block p-3.5 rounded border transition cursor-pointer ${
                localSettings.brandSource === 'taxonomy'
                  ? 'border-[#2271b1] bg-blue-50/40 ring-1 ring-[#2271b1]'
                  : 'border-[#c3c4c7] bg-[#f9f9f9] hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <input
                  type="radio"
                  name="brandSource"
                  checked={localSettings.brandSource === 'taxonomy'}
                  onChange={() => setLocalSettings(prev => ({ ...prev, brandSource: 'taxonomy' }))}
                  className="w-4 h-4 mt-0.5 text-[#2271b1] focus:ring-0"
                />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#1d2327]">
                    بخش برند اختصاصی ووکامرس (WooCommerce Brands / تاکسونومی رسمی)
                  </div>
                  <p className="text-[11px] text-[#50575e]">
                    برند کالاها مستقیماً از بخش برندهای خود ووکامرس (تاکسونومی <code className="font-mono bg-white px-1 py-0.5 border rounded">product_brand</code>) خوانده می‌شود. مناسب افزونه رسمی WooCommerce Brands یا قالب‌هایی با فیلد اختصاصی برند.
                  </p>
                </div>
              </div>

              {localSettings.brandSource === 'taxonomy' && (
                <div className="mt-3 pt-3 border-t border-blue-200/60 pr-6">
                  <label className="block text-[11px] font-medium text-[#2c3338] mb-1">
                    نام تاکسونومی برند در ووکامرس (Taxonomy Slug):
                  </label>
                  <input
                    type="text"
                    value={localSettings.brandTaxonomyName}
                    onChange={e => setLocalSettings(prev => ({ ...prev, brandTaxonomyName: e.target.value }))}
                    className="w-full max-w-xs text-xs font-mono bg-white border border-[#8c8f94] rounded-sm px-2.5 py-1.5 focus:border-[#2271b1] focus:outline-none"
                    placeholder="product_brand"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-[#646970]">
                    <span>پیش‌فرض‌های رایج:</span>
                    {['product_brand', 'yith_product_brand', 'brand'].map(slug => (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => setLocalSettings(prev => ({ ...prev, brandTaxonomyName: slug }))}
                        className="px-1.5 py-0.5 bg-white border border-gray-300 rounded hover:border-[#2271b1] font-mono cursor-pointer"
                      >
                        {slug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </label>

            {/* Option B: Product Attributes */}
            <label
              className={`block p-3.5 rounded border transition cursor-pointer ${
                localSettings.brandSource === 'attribute'
                  ? 'border-[#2271b1] bg-blue-50/40 ring-1 ring-[#2271b1]'
                  : 'border-[#c3c4c7] bg-[#f9f9f9] hover:bg-gray-100'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <input
                  type="radio"
                  name="brandSource"
                  checked={localSettings.brandSource === 'attribute'}
                  onChange={() => setLocalSettings(prev => ({ ...prev, brandSource: 'attribute' }))}
                  className="w-4 h-4 mt-0.5 text-[#2271b1] focus:ring-0"
                />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-[#1d2327]">
                    ویژگی‌های محصول (Product Attributes / مثلاً pa_brands)
                  </div>
                  <p className="text-[11px] text-[#50575e]">
                    برند کالاها از ویژگی‌های محصول (مانند ویژگی <code className="font-mono bg-white px-1 py-0.5 border rounded">pa_brands</code> یا هر ویژگی سفارشی دیگر) استخراج و ذخیره خواهد شد.
                  </p>
                </div>
              </div>

              {localSettings.brandSource === 'attribute' && (
                <div className="mt-3 pt-3 border-t border-blue-200/60 pr-6">
                  <label className="block text-[11px] font-medium text-[#2c3338] mb-1">
                    نام اسلاگ ویژگی برند (Attribute Slug):
                  </label>
                  <input
                    type="text"
                    value={localSettings.brandAttributeName}
                    onChange={e => setLocalSettings(prev => ({ ...prev, brandAttributeName: e.target.value }))}
                    className="w-full max-w-xs text-xs font-mono bg-white border border-[#8c8f94] rounded-sm px-2.5 py-1.5 focus:border-[#2271b1] focus:outline-none"
                    placeholder="pa_brands"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-[#646970]">
                    <span>پیش‌فرض‌های رایج:</span>
                    {['pa_brands', 'pa_brand', 'brand', 'برند'].map(slug => (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => setLocalSettings(prev => ({ ...prev, brandAttributeName: slug }))}
                        className="px-1.5 py-0.5 bg-white border border-gray-300 rounded hover:border-[#2271b1] font-mono cursor-pointer"
                      >
                        {slug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* 2. Gateways Adapters (Snappay & Torob) */}
        <div className="bg-white p-5 border border-[#c3c4c7] rounded-sm shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f0f1] pb-3 text-sm font-bold text-[#1d2327]">
            <CreditCard className="w-4 h-4 text-[#2271b1]" />
            <span>تنظیمات لایه آداپتور درگاه‌ها (Gateway Adapters)</span>
          </div>

          {/* Quick preset matching user's custom WooCommerce snippet */}
          <div className="bg-emerald-50 border border-emerald-300 p-3 rounded text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>پیکربندی منطبق با کد functions.php سایت شما</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setLocalSettings(prev => ({
                    ...prev,
                    snappayMetaKey: '_disable_snappay',
                    snappayMode: 'disable_flag',
                    torobMetaKey: '_disable_torobpay',
                    torobMode: 'disable_flag'
                  }));
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] px-2.5 py-1 rounded font-medium cursor-pointer transition"
              >
                اعمال تنظیمات کد شما
              </button>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              کد قالب شما از متادیتاهای <code className="font-mono bg-white px-1 py-0.5 border rounded">_disable_snappay</code> و <code className="font-mono bg-white px-1 py-0.5 border rounded">_disable_torobpay</code> با منطق چک‌باکس غیرفعال‌سازی استفاده می‌کند. هنگام فعال کردن اقساط در جدول، مقدار متای کالا <code className="font-mono bg-white px-1 py-0.5 border rounded">no</code> و هنگام غیرفعال کردن مقدار <code className="font-mono bg-white px-1 py-0.5 border rounded">yes</code> ذخیره خواهد شد تا درگاه در Checkout بر اساس فیلتر شما مدیریت گردد.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-[#f9f9f9] p-3 rounded border border-[#e5e5e5] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1d2327]">
                <span>آداپتور اسنپ‌پی (Snappay Adapter)</span>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">
                  {localSettings.snappayMetaKey}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#50575e] mb-1">نام کلید متای کالا (Meta Key):</label>
                  <input
                    type="text"
                    value={localSettings.snappayMetaKey}
                    onChange={e => setLocalSettings(prev => ({ ...prev, snappayMetaKey: e.target.value }))}
                    className="w-full text-xs font-mono bg-white border border-[#8c8f94] rounded-sm px-2.5 py-1.5 focus:border-[#2271b1] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#50575e] mb-1">منطق فیلد در دیتابیس:</label>
                  <select
                    value={localSettings.snappayMode}
                    onChange={e => setLocalSettings(prev => ({ ...prev, snappayMode: e.target.value as any }))}
                    className="w-full text-xs bg-white border border-[#8c8f94] rounded-sm px-2.5 py-1.5 focus:border-[#2271b1] focus:outline-none cursor-pointer"
                  >
                    <option value="disable_flag">چک‌باکس غیرفعال‌سازی (yes = غیرفعال، no = فعال)</option>
                    <option value="enable_flag">چک‌باکس فعال‌سازی (yes = فعال، no = غیرفعال)</option>
                  </select>
                </div>
              </div>
              <p className="text-[10px] text-[#646970]">
                همچنین قابل فیلتر از طریق هوک وردپرس: <code className="font-mono">wc_bpe_snappay_meta_key</code>
              </p>
            </div>

            <div className="bg-[#f9f9f9] p-3 rounded border border-[#e5e5e5] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1d2327]">
                <span>آداپتور پرداخت سریع ترب (Torob Pay Adapter)</span>
                <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">
                  {localSettings.torobMetaKey}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-[#50575e] mb-1">نام کلید متای کالا (Meta Key):</label>
                  <input
                    type="text"
                    value={localSettings.torobMetaKey}
                    onChange={e => setLocalSettings(prev => ({ ...prev, torobMetaKey: e.target.value }))}
                    className="w-full text-xs font-mono bg-white border border-[#8c8f94] rounded-sm px-2.5 py-1.5 focus:border-[#2271b1] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#50575e] mb-1">منطق فیلد در دیتابیس:</label>
                  <select
                    value={localSettings.torobMode}
                    onChange={e => setLocalSettings(prev => ({ ...prev, torobMode: e.target.value as any }))}
                    className="w-full text-xs bg-white border border-[#8c8f94] rounded-sm px-2.5 py-1.5 focus:border-[#2271b1] focus:outline-none cursor-pointer"
                  >
                    <option value="disable_flag">چک‌باکس غیرفعال‌سازی (yes = غیرفعال، no = فعال)</option>
                    <option value="enable_flag">چک‌باکس فعال‌سازی (yes = فعال، no = غیرفعال)</option>
                  </select>
                </div>
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
