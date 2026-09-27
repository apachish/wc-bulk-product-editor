import React, { useState } from 'react';
import { OperationLog } from '../../types';
import { History, RotateCcw, Eye, CheckCircle2, AlertTriangle, Clock, User, Check, X, FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  historyLogs: OperationLog[];
  onRollback: (operationId: string) => void;
}

export const HistoryView: React.FC<Props> = ({ historyLogs, onRollback }) => {
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [isRollingBack, setIsRollingBack] = useState<string | null>(null);

  const selectedLog = historyLogs.find(l => l.id === selectedLogId);

  const handleRollbackClick = (id: string) => {
    if (window.confirm('آیا از بازگردانی (Rollback) این عملیات اطمینان دارید؟ تمام مقادیر محصولات به اسنپ‌شات قبل از این عملیات برگردانده خواهند شد.')) {
      setIsRollingBack(id);
      setTimeout(() => {
        onRollback(id);
        setIsRollingBack(null);
      }, 700);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 border border-[#c3c4c7] rounded-sm shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#1d2327] flex items-center gap-2">
            <History className="w-5 h-5 text-[#2271b1]" />
            <span>تاریخچه عملیات ویرایش گروهی و بازگردانی (Audit Log & Rollback)</span>
          </h2>
          <p className="text-xs text-[#646970] mt-1">
            داده‌های این جدول مستقیماً در جدول اختصاصی <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">wp_wc_bpe_operations</code> نگهداری می‌شوند.
          </p>
        </div>

        <div className="text-xs text-[#50575e] bg-[#f6f7f7] px-3 py-2 rounded border border-[#e5e5e5]">
          تعداد رکوردهای ثبت‌شده: <strong className="text-[#1d2327]">{historyLogs.length} عملیات</strong>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[550px] relative">
          <table className="w-full text-right text-xs border-separate border-spacing-0">
            <thead className="select-none sticky top-0 z-20">
              <tr className="bg-[#f0f0f1] text-[#2c3338] font-semibold">
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3 w-32 font-mono">شناسه UUID</th>
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3 w-40">زمان و تاریخ</th>
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3 w-32">کاربر مدیر</th>
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3">شرح تغییرات و فیلترها</th>
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3 w-28 text-center">موفق / خطا</th>
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3 w-28 text-center">وضعیت</th>
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3 w-36 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {historyLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#646970] border-b border-[#f0f0f1]">
                    هنوز هیچ لاگ ویرایش گروهی ثبت نشده است. پس از اجرای اولین ویرایش گروهی، تاریخچه در اینجا ثبت خواهد شد.
                  </td>
                </tr>
              ) : (
                historyLogs.map(log => {
                  const isExpanded = selectedLogId === log.id;
                  const isRolledBack = log.status === 'rolled_back';

                  return (
                    <React.Fragment key={log.id}>
                      <tr className={`hover:bg-[#f6f7f7] ${isExpanded ? 'bg-blue-50/40' : ''}`}>
                        <td className="py-3 px-3 font-mono text-[11px] text-[#646970] border-b border-[#f0f0f1]">
                          <span title={log.id}>{log.id.substring(0, 8)}...</span>
                        </td>
                        <td className="py-3 px-3 text-[#2c3338] border-b border-[#f0f0f1]">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#8c8f94]" />
                            <span>{log.timestamp}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-[#50575e] border-b border-[#f0f0f1]">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#8c8f94]" />
                            <span>{log.userName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 border-b border-[#f0f0f1]">
                          <div className="font-semibold text-[#1d2327]">{log.description}</div>
                          <div className="text-[11px] text-[#646970] mt-0.5">
                            {log.changesSummary}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center border-b border-[#f0f0f1]">
                          <span className="font-mono text-emerald-700 font-bold">{log.successCount}</span>
                          <span className="text-[#8c8f94] mx-1">/</span>
                          <span className="font-mono text-red-600">{log.failCount}</span>
                        </td>
                        <td className="py-3 px-3 text-center border-b border-[#f0f0f1]">
                          {isRolledBack ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">
                              <RotateCcw className="w-3 h-3" />
                              بازگردانی‌شده
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">
                              <Check className="w-3 h-3" />
                              اعمال‌شده
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center border-b border-[#f0f0f1]">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedLogId(isExpanded ? null : log.id)}
                              className="p-1 border border-[#8c8f94] hover:bg-[#f0f0f1] rounded text-[#2c3338] cursor-pointer"
                              title="مشاهده جزئیات اسنپ‌شات‌ها"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              disabled={isRolledBack || isRollingBack === log.id}
                              onClick={() => handleRollbackClick(log.id)}
                              className={`p-1 border rounded cursor-pointer ${
                                isRolledBack
                                  ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                  : 'border-[#d63638] text-[#d63638] hover:bg-red-50'
                              }`}
                              title={isRolledBack ? 'این عملیات قبلاً بازگردانی شده است' : 'بازگردانی مقادیر به قبل از این عملیات'}
                            >
                              <RotateCcw className={`w-3.5 h-3.5 ${isRollingBack === log.id ? 'animate-spin' : ''}`} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Snapshot Drawer */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="p-4 bg-[#f8f9fa] border-t border-b border-[#c3c4c7]">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-xs border-b border-[#e5e5e5] pb-2">
                                <span className="font-bold text-[#1d2327]">
                                  اسنپ‌شات جزءبه‌جزء اقلام این عملیات ({log.items.length} قلم کالا):
                                </span>
                                <span className="font-mono text-[#646970]">
                                  UUID: {log.id}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                                {log.items.map((item, idx) => (
                                  <div key={idx} className="bg-white p-3 rounded border border-[#dcdcde] text-xs">
                                    <div className="flex items-center justify-between font-semibold text-[#1d2327] mb-1">
                                      <span>#{item.productId} - {item.name}</span>
                                      <span className="font-mono text-[11px] text-[#646970]">{item.sku}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#f0f0f1]">
                                      <div className="bg-red-50 p-2 rounded border border-red-100">
                                        <div className="text-[10px] font-bold text-red-800 mb-0.5">اسنپ‌شات قبل (Before):</div>
                                        <pre className="text-[10px] font-mono text-red-900 whitespace-pre-wrap">
                                          {JSON.stringify(item.beforeData, null, 2)}
                                        </pre>
                                      </div>
                                      <div className="bg-emerald-50 p-2 rounded border border-emerald-100">
                                        <div className="text-[10px] font-bold text-emerald-800 mb-0.5">اسنپ‌شات بعد (After):</div>
                                        <pre className="text-[10px] font-mono text-emerald-900 whitespace-pre-wrap">
                                          {JSON.stringify(item.afterData, null, 2)}
                                        </pre>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
