import React from 'react';
import { OperationSettings } from '../../types';
import { Sliders, DollarSign, Package, ShoppingCart, CreditCard, Layers, ArrowLeft, ArrowRight, ShieldCheck, Tag } from 'lucide-react';

interface Props {
  settings: OperationSettings;
  setSettings: React.Dispatch<React.SetStateAction<OperationSettings>>;
  onNext: () => void;
  onPrev: () => void;
  selectedCount: number;
  availableBrands?: string[];
  availableAttributes?: string[];
}

export const WizardStep2Operations: React.FC<Props> = ({
  settings,
  setSettings,
  onNext,
  onPrev,
  selectedCount,
  availableBrands = [],
  availableAttributes = []
}) => {
  // Merged brand list guaranteeing it is never empty
  const defaultBrands = [
    'Casio', 'Seiko', 'G-Shock', 'TISSOT', 'Swatch', 'Calvin Klein',
    'Caterpillar', 'CERRUTI', 'Daniel Gorman', 'Edifice', 'Esprit',
    'GUCCI', 'Guess', 'Orient', 'POLICE', 'Pro Trek', 'Timberland',
    'سامسونگ', 'اپل', 'شیائومی', 'باسئوس', 'ایسوس', 'مباشی'
  ];

  const allBrandOptions = Array.from(new Set([...defaultBrands, ...availableBrands])).filter(Boolean);

  const defaultAttributeNames = [
    'رنگ', 'سایز', 'گارانتی', 'جنس', 'مدل', 'کشور سازنده', 'وزن', 'ظرفیت'
  ];

  const allAttributeNameOptions = Array.from(new Set([...defaultAttributeNames, ...availableAttributes])).filter(Boolean);

  const [isCustomBrandInput, setIsCustomBrandInput] = React.useState(false);
  const [isCustomAttrNameInput, setIsCustomAttrNameInput] = React.useState(false);
  return (
    <div className="space-y-6">
      {/* Notice box on No-Change Principle */}
      <div className="bg-blue-50 border-r-4 border-[#2271b1] p-4 text-xs text-[#1d2327] rounded-sm flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#2271b1] shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sm text-[#2271b1] mb-1">اصل اساسی «بدون تغییر» (No Change Principle)</h4>
          <p className="leading-relaxed text-[#50575e]">
            تمام فیلدهایی که روی حالت «بدون تغییر» باقی می‌مانند، در دیتابیس دقیقاً دست‌نخورده حفظ خواهند شد. تنها فیلدهایی که دارای تغییر صریح باشند در Change Set لحاظ شده و اسنپ‌شات آن‌ها ثبت خواهد شد.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Regular Price Operations */}
        <div className="bg-white p-5 border border-[#c3c4c7] rounded-sm shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f0f1] pb-3 text-sm font-bold text-[#1d2327]">
            <DollarSign className="w-4 h-4 text-[#2271b1]" />
            <span>تنظیمات قیمت اصلی (Regular Price)</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2c3338] mb-1.5">نوع عملیات روی قیمت عادی:</label>
            <select
              value={settings.regularPriceType}
              onChange={e => setSettings(prev => ({ ...prev, regularPriceType: e.target.value as any }))}
              className="w-full text-xs bg-[#f6f7f7] border border-[#8c8f94] rounded-sm px-3 py-2 focus:border-[#2271b1] focus:bg-white focus:outline-none"
            >
              <option value="none">بدون تغییر (دست‌نخورده)</option>
              <option value="fixed">تعیین قیمت ثابت یکسان</option>
              <option value="increase_percent">افزایش درصدی (مثلاً +۱۰٪)</option>
              <option value="decrease_percent">کاهش درصدی (مثلاً -۱۵٪)</option>
              <option value="increase_amount">افزایش مبلغ ثابت (تومان)</option>
              <option value="decrease_amount">کاهش مبلغ ثابت (تومان)</option>
            </select>
          </div>

          {settings.regularPriceType !== 'none' && (
            <div>
              <label className="block text-xs font-medium text-[#2c3338] mb-1.5">
                {settings.regularPriceType.includes('percent') ? 'میزان درصد (٪):' : 'مبلغ به تومان:'}
              </label>
              <input
                type="number"
                min="0"
                step={settings.regularPriceType.includes('percent') ? '1' : '1000'}
                value={settings.regularPriceValue}
                onChange={e => setSettings(prev => ({ ...prev, regularPriceValue: Number(e.target.value) }))}
                className="w-full text-xs bg-[#f6f7f7] border border-[#8c8f94] rounded-sm px-3 py-2 focus:border-[#2271b1] focus:bg-white focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#2c3338] mb-1.5">قانون گرد کردن قیمت نهایی:</label>
            <select
              value={settings.roundPriceTo}
              onChange={e => setSettings(prev => ({ ...prev, roundPriceTo: Number(e.target.value) }))}
              className="w-full text-xs bg-[#f6f7f7] border border-[#8c8f94] rounded-sm px-3 py-2 focus:border-[#2271b1] focus:bg-white focus:outline-none"
            >
              <option value="0">بدون گرد کردن دقیق</option>
              <option value="1000">گرد کردن به نزدیک‌ترین ۱,۰۰۰ تومان</option>
              <option value="5000">گرد کردن به نزدیک‌ترین ۵,۰۰۰ تومان</option>
              <option value="10000">گرد کردن به نزدیک‌ترین ۱۰,۰۰۰ تومان</option>
            </select>
          </div>
        </div>

        {/* 2. Sale Price Operations */}
        <div className="bg-white p-5 border border-[#c3c4c7] rounded-sm shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f0f1] pb-3 text-sm font-bold text-[#1d2327]">
            <DollarSign className="w-4 h-4 text-[#d63638]" />
            <span>تنظیمات قیمت فروش ویژه / تخفیف (Sale Price)</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2c3338] mb-1.5">نوع عملیات روی قیمت حراج:</label>
            <select
              value={settings.salePriceType}
              onChange={e => setSettings(prev => ({ ...prev, salePriceType: e.target.value as any }))}
              className="w-full text-xs bg-[#f6f7f7] border border-[#8c8f94] rounded-sm px-3 py-2 focus:border-[#2271b1] focus:bg-white focus:outline-none"
            >
              <option value="none">بدون تغییر (دست‌نخورده)</option>
              <option value="fixed">تعیین قیمت حراج ثابت</option>
              <option value="decrease_percent">اعمال تخفیف درصدی بر اساس قیمت عادی</option>
              <option value="decrease_amount">کسر مبلغ تخفیف مشخص (تومان)</option>
            </select>
          </div>

          {settings.salePriceType !== 'none' && (
            <div>
              <label className="block text-xs font-medium text-[#2c3338] mb-1.5">
                {settings.salePriceType.includes('percent') ? 'درصد تخفیف (٪):' : 'مبلغ تخفیف یا قیمت حراج به تومان:'}
              </label>
              <input
                type="number"
                min="0"
                value={settings.salePriceValue}
                onChange={e => setSettings(prev => ({ ...prev, salePriceValue: Number(e.target.value) }))}
                className="w-full text-xs bg-[#f6f7f7] border border-[#8c8f94] rounded-sm px-3 py-2 focus:border-[#2271b1] focus:bg-white focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* 3. Stock Operations */}
        <div className="bg-white p-5 border border-[#c3c4c7] rounded-sm shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f0f1] pb-3 text-sm font-bold text-[#1d2327]">
            <Package className="w-4 h-4 text-[#2271b1]" />
            <span>تنظیمات موجودی انبار (Stock Quantity)</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2c3338] mb-1.5">عملیات انبارداری:</label>
            <select
              value={settings.stockType}
              onChange={e => setSettings(prev => ({ ...prev, stockType: e.target.value as any }))}
              className="w-full text-xs bg-[#f6f7f7] border border-[#8c8f94] rounded-sm px-3 py-2 focus:border-[#2271b1] focus:bg-white focus:outline-none"
            >
              <option value="none">بدون تغییر (دست‌نخورده)</option>
              <option value="fixed">تنظیم موجودی ثابت برای همه</option>
              <option value="increase">افزایش موجودی فعلی (+) به تعداد مشخص</option>
              <option value="decrease">کاهش موجودی فعلی (-) به تعداد مشخص</option>
            </select>
          </div>

          {settings.stockType !== 'none' && (
            <div>
              <label className="block text-xs font-medium text-[#2c3338] mb-1.5">تعداد کالا:</label>
              <input
                type="number"
                min="0"
                value={settings.stockValue}
                onChange={e => setSettings(prev => ({ ...prev, stockValue: Number(e.target.value) }))}
                className="w-full text-xs bg-[#f6f7f7] border border-[#8c8f94] rounded-sm px-3 py-2 focus:border-[#2271b1] focus:bg-white focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* 4. Sales / Purchasable Status */}
        <div className="bg-white p-5 border border-[#c3c4c7] rounded-sm shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f0f1] pb-3 text-sm font-bold text-[#1d2327]">
            <ShoppingCart className="w-4 h-4 text-[#2271b1]" />
            <span>وضعیت فروش و قابلیت خرید (Purchasable)</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2c3338] mb-1.5">امکان ثبت سفارش محصول:</label>
            <select
              value={settings.purchasableAction}
              onChange={e => setSettings(prev => ({ ...prev, purchasableAction: e.target.value as any }))}
              className="w-full text-xs bg-[#f6f7f7] border border-[#8c8f94] rounded-sm px-3 py-2 focus:border-[#2271b1] focus:bg-white focus:outline-none"
            >
              <option value="none">بدون تغییر (دست‌نخورده)</option>
              <option value="enable">فعال کردن فروش (امکان افزودن به سبد خرید)</option>
              <option value="disable">غیرفعال کردن فروش (توقف فروش بدون تغییر انتشار)</option>
            </select>
            <p className="text-[11px] text-[#646970] mt-1.5">
              * این گزینه وضعیت امکان خرید را تنظیم می‌کند بدون اینکه وضعیت انتشار (Publish/Draft) یا موجودی محصول تغییری کند.
            </p>
          </div>
        </div>

        {/* 5. Post Status Operations */}
        <div className="bg-white p-5 border border-[#c3c4c7] rounded-sm shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f0f1] pb-3 text-sm font-bold text-[#1d2327]">
            <Sliders className="w-4 h-4 text-[#2271b1]" />
            <span>وضعیت انتشار محصولات (Post Status)</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2c3338] mb-1.5">تغییر وضعیت انتشار به:</label>
            <select
              value={settings.postStatusAction || 'none'}
              onChange={e => setSettings(prev => ({ ...prev, postStatusAction: e.target.value as any }))}
              className="w-full text-xs bg-[#f6f7f7] border border-[#8c8f94] rounded-sm px-3 py-2 focus:border-[#2271b1] focus:bg-white focus:outline-none"
            >
              <option value="none">بدون تغییر (دست‌نخورده)</option>
              <option value="publish">منتشر شده (Publish)</option>
              <option value="draft">پیش‌نویس (Draft)</option>
              <option value="pending">در انتظار بازبینی (Pending)</option>
              <option value="private">خصوصی (Private)</option>
            </select>
            <p className="text-[11px] text-[#646970] mt-1.5">
              محصولات انتخاب‌شده به این وضعیت در ووکامرس تغییر وضعیت خواهند داد.
            </p>
          </div>
        </div>

        {/* 6. Stock Status Operations */}
        <div className="bg-white p-5 border border-[#c3c4c7] rounded-sm shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f0f1] pb-3 text-sm font-bold text-[#1d2327]">
            <Package className="w-4 h-4 text-[#00a32a]" />
            <span>وضعیت موجودی انبار (Stock Status)</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2c3338] mb-1.5">تغییر وضعیت انبار به:</label>
            <select
              value={settings.stockStatusAction || 'none'}
              onChange={e => setSettings(prev => ({ ...prev, stockStatusAction: e.target.value as any }))}
              className="w-full text-xs bg-[#f6f7f7] border border-[#8c8f94] rounded-sm px-3 py-2 focus:border-[#2271b1] focus:bg-white focus:outline-none"
            >
              <option value="none">بدون تغییر (دست‌نخورده)</option>
              <option value="instock">موجود در انبار (In Stock)</option>
              <option value="outofstock">ناموجود (Out of Stock)</option>
            </select>
          </div>
        </div>

        {/* 5. Snappay & Torob Pay Gateways */}
        <div className="bg-white p-5 border border-[#c3c4c7] rounded-sm shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f0f1] pb-3 text-sm font-bold text-[#1d2327]">
            <CreditCard className="w-4 h-4 text-[#2271b1]" />
            <span>درگاه‌های اقساطی و پرداخت اعتباری</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2c3338] mb-1.5">درگاه اسنپ‌پی (پرداخت اقساطی ۴ قسط):</label>
            <select
              value={settings.snappayAction}
              onChange={e => setSettings(prev => ({ ...prev, snappayAction: e.target.value as any }))}
              className="w-full text-xs bg-[#f6f7f7] border border-[#8c8f94] rounded-sm px-3 py-2 focus:border-[#2271b1] focus:bg-white focus:outline-none"
            >
              <option value="none">بدون تغییر (دست‌نخورده)</option>
              <option value="enable">فعال‌سازی اسنپ‌پی برای محصولات انتخاب‌شده</option>
              <option value="disable">غیرفعال‌سازی اسنپ‌پی</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2c3338] mb-1.5">درگاه پرداخت سریع ترب (Torob Pay):</label>
            <select
              value={settings.torobPayAction}
              onChange={e => setSettings(prev => ({ ...prev, torobPayAction: e.target.value as any }))}
              className="w-full text-xs bg-[#f6f7f7] border border-[#8c8f94] rounded-sm px-3 py-2 focus:border-[#2271b1] focus:bg-white focus:outline-none"
            >
              <option value="none">بدون تغییر (دست‌نخورده)</option>
              <option value="enable">فعال‌سازی پرداخت سریع ترب</option>
              <option value="disable">غیرفعال‌سازی پرداخت سریع ترب</option>
            </select>
          </div>
        </div>

        {/* 6. Product Attributes: Price Range & Brands */}
        <div className="bg-white p-5 border border-[#c3c4c7] rounded-sm shadow-sm space-y-4 md:col-span-2">
          <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#1d2327]">
              <Tag className="w-4 h-4 text-[#7f54b3]" />
              <span>تغییر و تنظیم گروهی ویژگی‌های محصول (WooCommerce Attributes)</span>
            </div>
            <span className="text-[11px] bg-purple-50 text-[#7f54b3] font-semibold px-2 py-0.5 rounded border border-purple-200">
              ویژگی‌های تاکسونومی pa_*
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price Range Attribute (محدوده قیمت) */}
            <div className="bg-[#fcfbfe] p-3.5 rounded border border-[#e9d5ff] space-y-3">
              <label className="block text-xs font-bold text-[#581c87]">
                🏷️ ویژگی «محدوده قیمت» (price-range):
              </label>

              <div>
                <select
                  value={settings.priceRangeAction || 'none'}
                  onChange={e => setSettings(prev => ({ ...prev, priceRangeAction: e.target.value as any }))}
                  className="w-full text-xs bg-white border border-[#8c8f94] rounded-sm px-3 py-2 focus:border-[#7f54b3] focus:outline-none font-medium"
                >
                  <option value="none">بدون تغییر (دست‌نخورده)</option>
                  <option value="auto_by_price">⚡ محاسبه و تنظیم خودکار بر اساس قیمت جدید (Auto)</option>
                  <option value="set_term">تعیین دستی مقدار مشخص برای همه</option>
                  <option value="remove">حذف این ویژگی از محصولات انتخابی</option>
                </select>
                <p className="text-[11px] text-[#6b7280] mt-1 leading-relaxed">
                  {settings.priceRangeAction === 'auto_by_price' && (
                    <span className="text-emerald-700 font-medium">
                      ✓ سیستم به ازای هر محصول بر اساس قیمت نهایی (مثلاً ۷۸ میلیون ➔ «۷۰ میلیون به بالا»، ۱۴ میلیون ➔ «۱۰ تا ۱۵ میلیون»)، ویژگی محدوده قیمت را خودکار آپدیت می‌کند.
                    </span>
                  )}
                  {settings.priceRangeAction === 'none' && 'اگر نمی‌خواهید ویژگی محدوده قیمت دست بخورد، این گزینه را روی بدون تغییر بگذارید.'}
                </p>
              </div>

              {settings.priceRangeAction === 'set_term' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#2c3338] mb-1">
                    انتخاب مقدار ویژگی محدوده قیمت:
                  </label>
                  <select
                    value={settings.priceRangeValue || '۲ تا ۵ میلیون'}
                    onChange={e => setSettings(prev => ({ ...prev, priceRangeValue: e.target.value }))}
                    className="w-full text-xs bg-white border border-[#7f54b3] rounded-sm px-3 py-2 focus:outline-none"
                  >
                    <option value="۲ تا ۵ میلیون">۲ تا ۵ میلیون</option>
                    <option value="۵ تا ۱۰ میلیون">۵ تا ۱۰ میلیون</option>
                    <option value="۱۰ تا ۱۵ میلیون">۱۰ تا ۱۵ میلیون</option>
                    <option value="۱۵ تا ۲۰ میلیون">۱۵ تا ۲۰ میلیون</option>
                    <option value="۲۰ تا ۳۰ میلیون">۲۰ تا ۳۰ میلیون</option>
                    <option value="۳۰ تا ۴۰ میلیون">۳۰ تا ۴۰ میلیون</option>
                    <option value="۴۰ تا ۶۰ میلیون">۴۰ تا ۶۰ میلیون</option>
                    <option value="۶۰ تا ۷۰ میلیون">۶۰ تا ۷۰ میلیون</option>
                    <option value="۷۰ میلیون به بالا">۷۰ میلیون به بالا</option>
                  </select>
                </div>
              )}
            </div>

            {/* Brand Attribute (برندها) */}
            <div className="bg-[#f8fafc] p-3.5 rounded border border-[#cbd5e1] space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#1e293b]">
                  🏢 ویژگی «برند کالا» (brands / pa_brands):
                </label>
                {settings.brandAction === 'set_term' && (
                  <button
                    type="button"
                    onClick={() => setIsCustomBrandInput(!isCustomBrandInput)}
                    className="text-[11px] text-[#2271b1] hover:underline cursor-pointer font-medium"
                  >
                    {isCustomBrandInput ? 'انتخاب از لیست برندها' : 'تایپ نام برند جدید'}
                  </button>
                )}
              </div>

              <div>
                <select
                  value={settings.brandAction || 'none'}
                  onChange={e => setSettings(prev => ({ ...prev, brandAction: e.target.value as any }))}
                  className="w-full text-xs bg-white border border-[#8c8f94] rounded-sm px-3 py-2 focus:border-[#2271b1] focus:outline-none font-medium"
                >
                  <option value="none">بدون تغییر (دست‌نخورده)</option>
                  <option value="set_term">تعیین یا تعویض برند به یک برند مشخص</option>
                  <option value="remove">حذف برند از محصولات انتخابی</option>
                </select>
              </div>

              {settings.brandAction === 'set_term' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#2c3338] mb-1">
                    {isCustomBrandInput ? 'نام برند مورد نظر را تایپ کنید:' : 'انتخاب برند از لیست برندهای فروشگاه:'}
                  </label>
                  {isCustomBrandInput ? (
                    <input
                      type="text"
                      placeholder="مثال: کاسیو، اپل، نایکی..."
                      value={settings.brandValue || ''}
                      onChange={e => setSettings(prev => ({ ...prev, brandValue: e.target.value }))}
                      className="w-full text-xs bg-white border border-[#2271b1] rounded-sm px-3 py-2 focus:outline-none"
                    />
                  ) : (
                    <select
                      value={settings.brandValue || allBrandOptions[0] || 'Casio'}
                      onChange={e => setSettings(prev => ({ ...prev, brandValue: e.target.value }))}
                      className="w-full text-xs bg-white border border-[#2271b1] rounded-sm px-3 py-2 focus:outline-none"
                    >
                      {allBrandOptions.map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  )}
                  <p className="text-[10px] text-[#646970] mt-1">
                    برند انتخابی روی تمام محصولات انتخاب‌شده در تاکسونومی یا متای برند ست خواهد شد.
                  </p>
                </div>
              )}
            </div>

            {/* Custom Attribute (رنگ، سایز، گارانتی، جنس و سایر ویژگی‌های دلخواه) */}
            <div className="bg-[#f0fdf4] p-3.5 rounded border border-[#86efac] space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🎨</span>
                  <label className="block text-xs font-bold text-[#14532d]">
                    مدیریت گروهی سایر ویژگی‌ها (رنگ، سایز، گارانتی، جنس و ویژگی‌های دلخواه):
                  </label>
                </div>
                {settings.customAttributeAction && settings.customAttributeAction !== 'none' && (
                  <button
                    type="button"
                    onClick={() => setIsCustomAttrNameInput(!isCustomAttrNameInput)}
                    className="text-[11px] text-[#15803d] hover:underline cursor-pointer font-medium"
                  >
                    {isCustomAttrNameInput ? 'انتخاب نام ویژگی از لیست' : 'تایپ نام ویژگی سفارشی'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#2c3338] mb-1">
                    نوع عملیات روی ویژگی:
                  </label>
                  <select
                    value={settings.customAttributeAction || 'none'}
                    onChange={e => setSettings(prev => ({ ...prev, customAttributeAction: e.target.value as any }))}
                    className="w-full text-xs bg-white border border-[#8c8f94] rounded-sm px-3 py-2 focus:border-[#15803d] focus:outline-none font-medium"
                  >
                    <option value="none">بدون تغییر (دست‌نخورده)</option>
                    <option value="set_term">تعیین / افزودن مقدار مشخص برای همه</option>
                    <option value="replace_term">یافتن و جایگزینی در مقدار ویژگی (Find & Replace)</option>
                    <option value="remove">حذف این ویژگی از محصولات انتخابی</option>
                  </select>
                </div>

                {settings.customAttributeAction && settings.customAttributeAction !== 'none' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-[#2c3338] mb-1">
                      {isCustomAttrNameInput ? 'نام ویژگی سفارشی (مثلاً رنگ، گارانتی):' : 'انتخاب نام ویژگی:'}
                    </label>
                    {isCustomAttrNameInput ? (
                      <input
                        type="text"
                        placeholder="نام ویژگی مثلاً: رنگ، جنس، گارانتی..."
                        value={settings.customAttributeName || ''}
                        onChange={e => setSettings(prev => ({ ...prev, customAttributeName: e.target.value }))}
                        className="w-full text-xs bg-white border border-[#15803d] rounded-sm px-3 py-2 focus:outline-none"
                      />
                    ) : (
                      <select
                        value={settings.customAttributeName || 'رنگ'}
                        onChange={e => setSettings(prev => ({ ...prev, customAttributeName: e.target.value }))}
                        className="w-full text-xs bg-white border border-[#15803d] rounded-sm px-3 py-2 focus:outline-none"
                      >
                        {allAttributeNameOptions.map(attr => (
                          <option key={attr} value={attr}>{attr}</option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>

              {settings.customAttributeAction === 'replace_term' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#d63638] mb-1">
                      مقدار قدیمی که باید پیدا شود (Find):
                    </label>
                    <input
                      type="text"
                      placeholder="مثلاً: سفید یا Casio..."
                      value={settings.customAttributeSearchValue || ''}
                      onChange={e => setSettings(prev => ({ ...prev, customAttributeSearchValue: e.target.value }))}
                      className="w-full text-xs bg-white border border-red-300 rounded-sm px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#15803d] mb-1">
                      مقدار جدید جایگزین (Replace with):
                    </label>
                    <input
                      type="text"
                      placeholder="مثلاً: نقره‌ای متالیک..."
                      value={settings.customAttributeValue || ''}
                      onChange={e => setSettings(prev => ({ ...prev, customAttributeValue: e.target.value }))}
                      className="w-full text-xs bg-white border border-[#15803d] rounded-sm px-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {settings.customAttributeAction === 'set_term' && (
                <div>
                  <label className="block text-[11px] font-semibold text-[#2c3338] mb-1">
                    مقدار ویژگی برای اعمال روی محصولات انتخاب‌شده:
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: ۱۸ ماه گارانتی شرکتی، مشکی مات، ابریشم طبیعی..."
                    value={settings.customAttributeValue || ''}
                    onChange={e => setSettings(prev => ({ ...prev, customAttributeValue: e.target.value }))}
                    className="w-full text-xs bg-white border border-[#15803d] rounded-sm px-3 py-2 focus:outline-none"
                  />
                  {/* Quick suggestion chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-[#646970]">پیشنهادهای سریع:</span>
                    {['مشکی', 'سفید', 'آبی', 'گارانتی ۱۸ ماهه شرکتی', 'گارانتی ۲۴ ماهه', 'XL', 'L', 'M'].map(sug => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, customAttributeValue: sug }))}
                        className="text-[10px] bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded cursor-pointer transition"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 6. Product vs Variation Scope */}
        <div className="bg-white p-5 border border-[#c3c4c7] rounded-sm shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f0f1] pb-3 text-sm font-bold text-[#1d2327]">
            <Layers className="w-4 h-4 text-[#2271b1]" />
            <span>سطح اعمال در محصولات متغیر (Scope)</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#2c3338] mb-1.5">اعمال تغییرات روی:</label>
            <select
              value={settings.applyToScope}
              onChange={e => setSettings(prev => ({ ...prev, applyToScope: e.target.value as any }))}
              className="w-full text-xs bg-[#f6f7f7] border border-[#8c8f94] rounded-sm px-3 py-2 focus:border-[#2271b1] focus:bg-white focus:outline-none"
            >
              <option value="products_and_variations">هم محصول اصلی و هم تمام متغیرها (پیشنهادی)</option>
              <option value="variations_only">صرفاً متغیرهای فرعی محصولات (Variations Only)</option>
              <option value="products_only">صرفاً محصول اصلی و محصولات ساده (Parent Only)</option>
            </select>
            <p className="text-[11px] text-[#646970] mt-1.5">
              در صورت انتخاب محصولات متغیر، قیمت و موجودی تک‌تک متغیرها مطابق این قاعده به‌روزرسانی خواهند شد.
            </p>
          </div>
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
          <span>بازگشت به انتخاب محصولات</span>
        </button>

        <div className="text-xs text-[#50575e]">
          اعمال روی: <strong className="text-[#1d2327] font-bold">{selectedCount} محصول</strong>
        </div>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 bg-[#2271b1] hover:bg-[#135e96] text-white px-5 py-2 rounded font-medium text-xs transition cursor-pointer shadow-sm"
        >
          <span>مرحله بعد: پیش‌نمایش تغییرات</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
