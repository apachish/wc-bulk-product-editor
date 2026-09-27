import React from 'react';
import { Download, PackageCheck, Sparkles, SlidersHorizontal, Table, History, Code2, Settings, ExternalLink } from 'lucide-react';

interface Props {
  activeTab: 'wizard' | 'table' | 'history' | 'settings' | 'source';
  setActiveTab: (tab: 'wizard' | 'table' | 'history' | 'settings' | 'source') => void;
  onDownloadZip: () => void;
  isDownloading: boolean;
}

export const WordPressHeader: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onDownloadZip,
  isDownloading
}) => {
  return (
    <header className="bg-[#1d2327] text-[#c3c4c7] select-none sticky top-0 z-50 shadow-md">
      {/* Top Admin Bar */}
      <div className="max-w-7xl mx-auto px-4 h-11 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-white font-semibold">
            <span className="bg-[#2271b1] text-white p-1 rounded-sm text-[11px] font-bold">WP</span>
            <span>مدیریت فروشگاه آنلاین</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[#c3c4c7] border-r border-[#3c434a] pr-3 mr-1">
            <span className="inline-flex items-center gap-1 hover:text-white cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              ووکامرس ۸.۹ فعال است
            </span>
            <span className="text-[#8c8f94]">|</span>
            <span className="text-[#8c8f94]">PHP 8.2 (امنیت و کارایی بالا)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onDownloadZip}
            disabled={isDownloading}
            className="flex items-center gap-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white px-3 py-1.5 rounded font-medium transition cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'در حال ایجاد زیپ...' : 'دانلود فایل ZIP افزونه'}</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation / Menu Tabs */}
      <div className="bg-white border-b border-[#c3c4c7] text-[#2c3338]">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between">
          <div className="flex items-center gap-2 py-3">
            <div className="w-8 h-8 rounded bg-[#7f54b3] text-white flex items-center justify-center font-bold text-sm shadow-inner">
              WC
            </div>
            <div>
              <h1 className="text-base font-bold text-[#1d2327] leading-tight">
                ویرایش گروهی پیشرفته محصولات
              </h1>
              <p className="text-[11px] text-[#646970]">
                Bulk Product Editor Pro • نگارش ۱.۰.۰ با پشتیبانی از اسنپ‌پی، ترب و Rollback
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto text-xs font-medium">
            <button
              onClick={() => setActiveTab('wizard')}
              className={`flex items-center gap-1.5 px-3 py-3 border-b-2 transition cursor-pointer ${
                activeTab === 'wizard'
                  ? 'border-[#2271b1] text-[#2271b1] font-bold bg-[#f6f7f7]'
                  : 'border-transparent text-[#50575e] hover:text-[#2271b1]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>ویزارد ۵ مرحله‌ای ویرایش</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 px-3 py-3 border-b-2 transition cursor-pointer ${
                activeTab === 'table'
                  ? 'border-[#2271b1] text-[#2271b1] font-bold bg-[#f6f7f7]'
                  : 'border-transparent text-[#50575e] hover:text-[#2271b1]'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>جدول ویرایش درون‌ردیفی (Editable Table)</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3 py-3 border-b-2 transition ${
                activeTab === 'history'
                  ? 'border-[#2271b1] text-[#2271b1] font-bold bg-[#f6f7f7]'
                  : 'border-transparent text-[#50575e] hover:text-[#2271b1]'
              }`}
            >
              <History className="w-4 h-4" />
              <span>تاریخچه عملیات و Rollback</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-3 border-b-2 transition ${
                activeTab === 'settings'
                  ? 'border-[#2271b1] text-[#2271b1] font-bold bg-[#f6f7f7]'
                  : 'border-transparent text-[#50575e] hover:text-[#2271b1]'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>تنظیمات و درگاه‌ها</span>
            </button>

            <button
              onClick={() => setActiveTab('source')}
              className={`flex items-center gap-1.5 px-3 py-3 border-b-2 transition ${
                activeTab === 'source'
                  ? 'border-[#2271b1] text-[#2271b1] font-bold bg-[#f6f7f7]'
                  : 'border-transparent text-[#50575e] hover:text-[#2271b1]'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>سورس کد و مستندات PHP</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
