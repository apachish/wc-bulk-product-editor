import React, { useState } from 'react';
import { pluginFiles, PluginFileEntry } from '../../pluginFiles/phpFiles';
import { Code2, FileCode, FileText, Download, Copy, Check, Folder, ShieldCheck } from 'lucide-react';

interface Props {
  onDownloadZip: () => void;
  isDownloading: boolean;
}

export const SourceCodeViewer: React.FC<Props> = ({ onDownloadZip, isDownloading }) => {
  const [selectedFilePath, setSelectedFilePath] = useState<string>(pluginFiles[0].path);
  const [copied, setCopied] = useState(false);

  const selectedFile = pluginFiles.find(f => f.path === selectedFilePath) || pluginFiles[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Download */}
      <div className="bg-white p-5 border border-[#c3c4c7] rounded-sm shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#1d2327] flex items-center gap-2">
            <Code2 className="w-5 h-5 text-[#2271b1]" />
            <span>سورس کد و پکیج نصبی افزونه وردپرس (PHP 8.1+ & WooCommerce 8+)</span>
          </h2>
          <p className="text-xs text-[#646970] mt-1">
            کدها مطابق با استاندارد رسمی وردپرس، کاملاً OOP، شی‌گرا، دارای Namespace، امن‌سازی شده با Nonce و قابلیت دسترسی manage_woocommerce نوشته شده‌اند.
          </p>
        </div>

        <button
          onClick={onDownloadZip}
          disabled={isDownloading}
          className="flex items-center gap-2 bg-[#2271b1] hover:bg-[#135e96] text-white px-5 py-2.5 rounded font-bold text-xs transition cursor-pointer shadow-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? 'در حال ایجاد پکیج ZIP...' : 'دانلود مستقیم فایل ZIP افزونه'}</span>
        </button>
      </div>

      {/* Explorer Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white border border-[#c3c4c7] rounded-sm shadow-sm overflow-hidden min-h-[600px]">
        {/* Sidebar File Tree */}
        <div className="md:col-span-4 border-l border-[#dcdcde] bg-[#f9f9f9] p-4 text-xs">
          <div className="font-bold text-[#1d2327] mb-3 flex items-center gap-1.5 pb-2 border-b border-[#e5e5e5]">
            <Folder className="w-4 h-4 text-[#2271b1]" />
            <span>ساختار فایل‌های افزونه (/wc-bulk-product-editor-pro/)</span>
          </div>

          <div className="space-y-1">
            {pluginFiles.map(file => {
              const isSelected = selectedFilePath === file.path;
              const isPhp = file.language === 'php';

              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => setSelectedFilePath(file.path)}
                  className={`w-full text-right px-3 py-2 rounded flex items-center justify-between text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#2271b1] text-white font-medium shadow-sm'
                      : 'hover:bg-[#ebebeb] text-[#2c3338]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {isPhp ? (
                      <FileCode className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-[#2271b1]'}`} />
                    ) : (
                      <FileText className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-amber-600'}`} />
                    )}
                    <span className="font-mono text-[11px] truncate">{file.path}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {file.language}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-[#e5e5e5] text-[11px] text-[#646970] space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>استانداردهای تضمین‌شده:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[#50575e]">
              <li>PHP 8.1+ Strict Types</li>
              <li>WooCommerce CRUD API</li>
              <li>CSRF & Nonce Protection</li>
              <li>Input Sanitization & Escaping</li>
            </ul>
          </div>
        </div>

        {/* Code Content Area */}
        <div className="md:col-span-8 flex flex-col bg-[#1e1e1e] text-[#d4d4d4]">
          {/* Top Bar */}
          <div className="bg-[#2d2d2d] px-4 py-2.5 border-b border-[#3c3c3c] flex items-center justify-between text-xs">
            <div>
              <span className="font-mono font-bold text-white text-[12px]">{selectedFile.path}</span>
              <p className="text-[11px] text-[#9da5b4] mt-0.5">{selectedFile.description}</p>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 bg-[#3c3c3c] hover:bg-[#4a4a4a] text-white px-3 py-1.5 rounded text-xs transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'کپی شد!' : 'کپی سورس کد'}</span>
            </button>
          </div>

          {/* Preformatted Code Content */}
          <div className="p-4 overflow-auto flex-1 font-mono text-xs leading-relaxed max-h-[650px] select-text">
            <pre className="text-left font-mono whitespace-pre text-[#e6e6e6]" dir="ltr">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
