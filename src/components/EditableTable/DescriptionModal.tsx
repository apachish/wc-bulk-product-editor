import React, { useState } from 'react';
import { X, FileText, Check, Bold, Italic, List, AlignRight, Eye } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fieldLabel: string;
  initialValue: string;
  onSave: (value: string) => void;
}

export const DescriptionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  fieldLabel,
  initialValue,
  onSave
}) => {
  const [value, setValue] = useState(initialValue);
  const [tab, setTab] = useState<'editor' | 'preview'>('editor');

  if (!isOpen) return null;

  const handleApply = () => {
    onSave(value);
    onClose();
  };

  const insertText = (before: string, after: string = '') => {
    setValue(prev => `${prev}\n${before}${after}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-md shadow-2xl max-w-2xl w-full border border-[#c3c4c7] overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#f0f0f1] px-5 py-3.5 border-b border-[#c3c4c7] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-[#1d2327]">
            <FileText className="w-4 h-4 text-[#2271b1]" />
            <span>ویرایش {fieldLabel}: {title}</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#646970] hover:text-[#1d2327] p-1 rounded hover:bg-gray-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar & Tabs */}
        <div className="bg-[#f6f7f7] px-4 py-2 border-b border-[#e5e5e5] flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTab('editor')}
              className={`px-3 py-1 rounded font-medium transition cursor-pointer ${
                tab === 'editor' ? 'bg-white shadow-xs text-[#2271b1] font-bold' : 'text-[#646970] hover:text-[#1d2327]'
              }`}
            >
              ویرایشگر متن
            </button>
            <button
              type="button"
              onClick={() => setTab('preview')}
              className={`px-3 py-1 rounded font-medium flex items-center gap-1 transition cursor-pointer ${
                tab === 'preview' ? 'bg-white shadow-xs text-[#2271b1] font-bold' : 'text-[#646970] hover:text-[#1d2327]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              پیش‌نمایش
            </button>
          </div>

          {tab === 'editor' && (
            <div className="flex items-center gap-1 text-[#646970]">
              <button
                type="button"
                onClick={() => insertText('**متن پررنگ**')}
                className="p-1.5 hover:bg-gray-200 rounded"
                title="بولد"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertText('*متن مورب*')}
                className="p-1.5 hover:bg-gray-200 rounded"
                title="ایتالیک"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertText('- مورد اول\n- مورد دوم')}
                className="p-1.5 hover:bg-gray-200 rounded"
                title="لیست نشانه‌دار"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 flex-1 overflow-y-auto">
          {tab === 'editor' ? (
            <textarea
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={`متن کامل ${fieldLabel} را اینجا وارد یا ویرایش کنید...`}
              rows={10}
              className="w-full h-full min-h-[220px] p-3 text-xs leading-relaxed border border-[#8c8f94] rounded-sm focus:border-[#2271b1] focus:outline-none bg-white font-sans"
              dir="rtl"
            />
          ) : (
            <div className="min-h-[220px] p-3 bg-[#fbfbfb] border border-[#dcdcde] rounded text-xs leading-relaxed text-[#2c3338] whitespace-pre-wrap">
              {value ? value : <span className="text-[#8c8f94]">توضیحاتی ثبت نشده است.</span>}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f0f0f1] px-5 py-3 border-t border-[#c3c4c7] flex items-center justify-between text-xs">
          <span className="text-[#646970]">
            تعداد کاراکترها: <strong className="text-[#1d2327] font-mono">{value.length}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 border border-[#8c8f94] hover:bg-gray-200 rounded text-[#2c3338] transition cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-medium flex items-center gap-1 transition cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              ذخیره متن در جدول
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
