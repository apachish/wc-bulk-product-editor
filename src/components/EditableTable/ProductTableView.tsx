import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, ProductType, PostStatus, StockStatus } from '../../types';
import { DescriptionModal } from './DescriptionModal';
import { sampleBrandsList } from '../../mockData';
import {
  Search,
  Save,
  RotateCcw,
  Check,
  Eye,
  FileEdit,
  Image as ImageIcon,
  CheckSquare,
  Square,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  Filter,
  Plus,
  ExternalLink,
  Sparkles,
  SlidersHorizontal,
  X,
  Package,
  Zap,
  ArrowLeft,
  Tag,
  Palette
} from 'lucide-react';

interface Props {
  products: Product[];
  onSaveProducts: (updatedProducts: Product[]) => void;
  onGoToWizard?: (selectedIds: number[]) => void;
}

export const ProductTableView: React.FC<Props> = ({
  products,
  onSaveProducts,
  onGoToWizard
}) => {
  // Local editable copy of products
  const [tableData, setTableData] = useState<Product[]>(() => JSON.parse(JSON.stringify(products)));
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [saleFilter, setSaleFilter] = useState<'all' | 'on_sale' | 'no_sale'>('all');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [showFilterPanel, setShowFilterPanel] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(8);

  // Track changed rows
  const [modifiedProductIds, setModifiedProductIds] = useState<Set<number>>(new Set());
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Description / Short Description Modal State
  const [activeModal, setActiveModal] = useState<{
    productId: number;
    title: string;
    field: 'description' | 'shortDescription';
    fieldLabel: string;
    initialValue: string;
  } | null>(null);

  // Preview modal for a single product
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // Categories & Brands for auto-suggestions
  const categoriesList = useMemo(() => {
    return Array.from(new Set(tableData.map(p => p.category))).filter(Boolean);
  }, [tableData]);

  const brandsList = useMemo(() => {
    const list = new Set<string>(sampleBrandsList);
    tableData.forEach(p => {
      if (p.brand) list.add(p.brand);
      if (p.attributes) {
        if (p.attributes['pa_brands']) list.add(p.attributes['pa_brands']);
        if (p.attributes['pa_brand']) list.add(p.attributes['pa_brand']);
        if (p.attributes['brand']) list.add(p.attributes['brand']);
        if (p.attributes['برند']) list.add(p.attributes['برند']);
      }
    });
    return Array.from(list).filter(Boolean);
  }, [tableData]);

  // Dual-scroll synchronization refs for effortless horizontal scrolling
  const topScrollRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [tableScrollWidth, setTableScrollWidth] = useState(1800);

  // Sync scroll positions
  const isSyncingScroll = useRef(false);
  const handleTopScroll = () => {
    if (isSyncingScroll.current) return;
    isSyncingScroll.current = true;
    if (topScrollRef.current && tableContainerRef.current) {
      tableContainerRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  };

  const handleTableScroll = () => {
    if (isSyncingScroll.current) return;
    isSyncingScroll.current = true;
    if (topScrollRef.current && tableContainerRef.current) {
      topScrollRef.current.scrollLeft = tableContainerRef.current.scrollLeft;
    }
    requestAnimationFrame(() => {
      isSyncingScroll.current = false;
    });
  };

  // Quick horizontal scroll buttons (smooth scroll by 320px)
  const scrollHorizontally = (offset: number) => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Bulk Attributes Edit Modal State
  const [showBulkAttrModal, setShowBulkAttrModal] = useState(false);
  const [bulkAttrName, setBulkAttrName] = useState('برند');
  const [bulkAttrAction, setBulkAttrAction] = useState<'set_term' | 'replace_term' | 'remove'>('set_term');
  const [bulkAttrValue, setBulkAttrValue] = useState('');
  const [bulkAttrSearchValue, setBulkAttrSearchValue] = useState('');
  const [customAttrNameInput, setCustomAttrNameInput] = useState(false);

  // Active Preset check
  const activePreset = useMemo(() => {
    if (
      !searchTerm &&
      !categoryFilter &&
      !brandFilter &&
      !typeFilter &&
      !statusFilter &&
      !stockFilter &&
      saleFilter === 'all' &&
      !minPrice &&
      !maxPrice
    ) {
      return 'all';
    }
    if (stockFilter === 'instock' && !searchTerm && !categoryFilter && !brandFilter) return 'instock';
    if (stockFilter === 'outofstock' && !searchTerm && !categoryFilter && !brandFilter) return 'outofstock';
    if (saleFilter === 'on_sale' && !searchTerm) return 'on_sale';
    if (typeFilter === 'variable' && !searchTerm) return 'variable';
    if (typeFilter === 'simple' && !searchTerm) return 'simple';
    return 'custom';
  }, [searchTerm, categoryFilter, brandFilter, typeFilter, statusFilter, stockFilter, saleFilter, minPrice, maxPrice]);

  // Apply Quick Preset
  const handleApplyPreset = (preset: string) => {
    setCurrentPage(1);
    switch (preset) {
      case 'all':
        setSearchTerm('');
        setCategoryFilter('');
        setBrandFilter('');
        setTypeFilter('');
        setStatusFilter('');
        setStockFilter('');
        setSaleFilter('all');
        setMinPrice('');
        setMaxPrice('');
        break;
      case 'instock':
        setStockFilter('instock');
        setSaleFilter('all');
        break;
      case 'outofstock':
        setStockFilter('outofstock');
        setSaleFilter('all');
        break;
      case 'on_sale':
        setSaleFilter('on_sale');
        break;
      case 'variable':
        setTypeFilter('variable');
        break;
      case 'simple':
        setTypeFilter('simple');
        break;
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setBrandFilter('');
    setTypeFilter('');
    setStatusFilter('');
    setStockFilter('');
    setSaleFilter('all');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
  };

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (categoryFilter) count++;
    if (brandFilter) count++;
    if (typeFilter) count++;
    if (statusFilter) count++;
    if (stockFilter) count++;
    if (saleFilter !== 'all') count++;
    if (minPrice) count++;
    if (maxPrice) count++;
    return count;
  }, [searchTerm, categoryFilter, brandFilter, typeFilter, statusFilter, stockFilter, saleFilter, minPrice, maxPrice]);

  // Handle bulk attribute apply to selected rows
  const handleApplyBulkAttribute = () => {
    if (selectedIds.length === 0 || !bulkAttrName.trim()) return;

    const targetAttrName = bulkAttrName.trim();
    const updated = tableData.map(p => {
      if (selectedIds.includes(p.id)) {
        const copy = { ...p };
        if (!copy.attributes) copy.attributes = {};

        // If brand
        if (targetAttrName === 'برند' || targetAttrName === 'pa_brands' || targetAttrName === 'brand') {
          if (bulkAttrAction === 'remove') {
            copy.brand = '';
            delete copy.attributes['pa_brands'];
            delete copy.attributes['pa_brand'];
          } else if (bulkAttrAction === 'set_term') {
            copy.brand = bulkAttrValue;
            copy.attributes['pa_brands'] = bulkAttrValue;
          } else if (bulkAttrAction === 'replace_term' && bulkAttrSearchValue) {
            const oldB = copy.brand || '';
            const newB = oldB.split(bulkAttrSearchValue).join(bulkAttrValue);
            copy.brand = newB;
            copy.attributes['pa_brands'] = newB;
          }
        } else if (targetAttrName === 'محدوده قیمت' || targetAttrName === 'pa_price-range') {
          if (bulkAttrAction === 'remove') {
            copy.priceRange = undefined;
            delete copy.attributes['pa_price-range'];
          } else {
            copy.priceRange = bulkAttrValue;
            copy.attributes['pa_price-range'] = bulkAttrValue;
          }
        } else {
          // Any custom attribute (رنگ, سایز, گارانتی, جنس, ...)
          if (bulkAttrAction === 'remove') {
            delete copy.attributes[targetAttrName];
            delete copy.attributes[`pa_${targetAttrName}`];
          } else if (bulkAttrAction === 'set_term') {
            copy.attributes[targetAttrName] = bulkAttrValue;
          } else if (bulkAttrAction === 'replace_term' && bulkAttrSearchValue) {
            const currentVal = copy.attributes[targetAttrName] || '';
            copy.attributes[targetAttrName] = String(currentVal).split(bulkAttrSearchValue).join(bulkAttrValue);
          }
        }
        return copy;
      }
      return p;
    });

    setTableData(updated);
    setModifiedProductIds(prev => {
      const next = new Set(prev);
      selectedIds.forEach(id => next.add(id));
      return next;
    });
    setShowBulkAttrModal(false);
  };

  // Sync scroll width dynamically
  useEffect(() => {
    const updateScrollWidth = () => {
      if (tableContainerRef.current) {
        const w = tableContainerRef.current.scrollWidth;
        if (w > 0) setTableScrollWidth(w);
      }
    };
    updateScrollWidth();
    const timer = setTimeout(updateScrollWidth, 100);
    return () => clearTimeout(timer);
  }, [tableData, searchTerm, categoryFilter, brandFilter]);

  // Handle cell edit
  const handleCellChange = (id: number, field: keyof Product, value: any) => {
    setTableData(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updated = { ...p, [field]: value };
          // If stockQuantity updated, sync stockStatus
          if (field === 'stockQuantity') {
            const num = Number(value);
            updated.stockStatus = num > 0 ? 'instock' : 'outofstock';
          }
          return updated;
        }
        return p;
      })
    );
    setModifiedProductIds(prev => new Set(prev).add(id));
  };

  // Filtered rows
  const filteredProducts = useMemo(() => {
    return tableData.filter(p => {
      // Search Title, SKU, or ID
      if (searchTerm) {
        const term = searchTerm.trim().toLowerCase();
        const matchesName = p.name.toLowerCase().includes(term);
        const matchesSku = p.sku.toLowerCase().includes(term);
        const matchesId = p.id.toString().includes(term);
        if (!matchesName && !matchesSku && !matchesId) return false;
      }

      // Category
      if (categoryFilter && p.category !== categoryFilter) return false;

      // Brand
      if (brandFilter && p.brand !== brandFilter) return false;

      // Type
      if (typeFilter && p.type !== typeFilter) return false;

      // Status
      if (statusFilter && p.status !== statusFilter) return false;

      // Stock
      if (stockFilter && p.stockStatus !== stockFilter) return false;

      // Sale Filter
      if (saleFilter === 'on_sale') {
        if (!p.salePrice || p.salePrice <= 0 || p.salePrice >= p.regularPrice) return false;
      } else if (saleFilter === 'no_sale') {
        if (p.salePrice && p.salePrice > 0 && p.salePrice < p.regularPrice) return false;
      }

      // Min Price
      if (typeof minPrice === 'number' && minPrice > 0) {
        const effectivePrice = p.salePrice ?? p.regularPrice;
        if (effectivePrice < minPrice) return false;
      }

      // Max Price
      if (typeof maxPrice === 'number' && maxPrice > 0) {
        const effectivePrice = p.salePrice ?? p.regularPrice;
        if (effectivePrice > maxPrice) return false;
      }

      return true;
    });
  }, [tableData, searchTerm, categoryFilter, brandFilter, typeFilter, statusFilter, stockFilter, saleFilter, minPrice, maxPrice]);

  // Paginated rows
  const paginatedProducts = useMemo(() => {
    if (pageSize === -1) return filteredProducts;
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const totalPages = pageSize === -1 ? 1 : Math.ceil(filteredProducts.length / pageSize) || 1;

  // Selection states
  const filteredSelectedCount = useMemo(() => {
    return filteredProducts.filter(p => selectedIds.includes(p.id)).length;
  }, [filteredProducts, selectedIds]);

  const isAllFilteredSelected = filteredProducts.length > 0 && filteredSelectedCount === filteredProducts.length;
  const isPartiallySelected = filteredSelectedCount > 0 && !isAllFilteredSelected;

  const handleToggleSelectAll = () => {
    if (isAllFilteredSelected) {
      const filteredIdSet = new Set(filteredProducts.map(p => p.id));
      setSelectedIds(prev => prev.filter(id => !filteredIdSet.has(id)));
    } else {
      const filteredIds = filteredProducts.map(p => p.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleToggleRow = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleInvertSelection = () => {
    const filteredIdSet = new Set(filteredProducts.map(p => p.id));
    setSelectedIds(prev => {
      const nonFiltered = prev.filter(id => !filteredIdSet.has(id));
      const newlySelected = filteredProducts.filter(p => !prev.includes(p.id)).map(p => p.id);
      return [...nonFiltered, ...newlySelected];
    });
  };

  // Save changes to root state
  const handleSaveAllChanges = () => {
    onSaveProducts(tableData);
    setModifiedProductIds(new Set());
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  // Discard changes
  const handleDiscardChanges = () => {
    if (window.confirm('آیا از لغو تمام تغییرات ذخیره‌نشده جدول مطمئن هستید؟')) {
      setTableData(JSON.parse(JSON.stringify(products)));
      setModifiedProductIds(new Set());
    }
  };

  // Add new empty product row
  const handleAddNewProduct = () => {
    const newId = Math.max(...tableData.map(p => p.id), 100) + 1;
    const newProd: Product = {
      id: newId,
      name: `محصول جدید #${newId}`,
      sku: `PROD-${newId}`,
      type: 'simple',
      status: 'draft',
      category: categoriesList[0] || 'دسته‌بندی نشده',
      brand: brandsList[0] || 'عمومی',
      thumbnail: '',
      description: '',
      shortDescription: '',
      regularPrice: 0,
      salePrice: null,
      manageStock: true,
      stockQuantity: 1,
      stockStatus: 'instock',
      snappayEnabled: true,
      torobPayEnabled: true,
      isPurchasable: true
    };
    setTableData(prev => [newProd, ...prev]);
    setModifiedProductIds(prev => new Set(prev).add(newId));
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Toolbar Card */}
      <div className="bg-white p-4 border border-[#c3c4c7] rounded-md shadow-xs space-y-3">
        {/* Top Header: Title, Preset chips & Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f0f0f1] text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-blue-50 text-[#2271b1] flex items-center justify-center font-bold">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#1d2327]">فیلتر تر و تمیز محصولات جدول (Inline Editor)</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-[#2271b1] text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    {activeFiltersCount} فیلتر فعال
                  </span>
                )}
              </div>
              <span className="text-[11px] text-[#646970]">
                امکان جستجوی هم‌زمان نام، SKU، شناسه، دسته‌بندی، برند، موجودی و رنج قیمت
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="flex items-center gap-1.5 text-xs text-[#2271b1] hover:text-[#135e96] bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1.5 rounded transition cursor-pointer font-medium"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showFilterPanel ? 'بستن فیلترهای تفصیلی' : 'نمایش فیلترهای تفصیلی'}</span>
            </button>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs text-[#d63638] hover:bg-red-50 px-2.5 py-1.5 rounded transition cursor-pointer font-medium"
                title="پاک‌سازی تمام فیلترها"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>پاک‌سازی فیلترها</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleAddNewProduct}
              className="flex items-center gap-1 bg-[#f6f7f7] hover:bg-[#ebebeb] text-[#2271b1] border border-[#2271b1] px-3 py-1.5 rounded font-medium transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن ردیف جدید</span>
            </button>

            {modifiedProductIds.size > 0 && (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded font-medium text-[11px] animate-pulse">
                {modifiedProductIds.size} ردیف تغییریافته
              </span>
            )}

            <button
              type="button"
              disabled={modifiedProductIds.size === 0}
              onClick={handleDiscardChanges}
              className="flex items-center gap-1 border border-[#8c8f94] text-[#646970] hover:text-[#d63638] hover:bg-gray-100 px-2.5 py-1.5 rounded transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>لغو تغییرات</span>
            </button>

            <button
              type="button"
              disabled={modifiedProductIds.size === 0}
              onClick={handleSaveAllChanges}
              className="flex items-center gap-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white px-3.5 py-1.5 rounded font-bold transition cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              <span>ذخیره تغییرات جدول</span>
            </button>
          </div>
        </div>

        {/* Quick Presets Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[#646970] font-medium ml-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>فیلتر سریع:</span>
          </span>

          <button
            type="button"
            onClick={() => handleApplyPreset('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              activePreset === 'all'
                ? 'bg-[#2271b1] text-white shadow-xs'
                : 'bg-[#f0f0f1] text-[#2c3338] hover:bg-gray-200'
            }`}
          >
            همه محصولات ({tableData.length})
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('instock')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              activePreset === 'instock'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            ✓ موجود در انبار ({tableData.filter(p => p.stockStatus === 'instock').length})
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('outofstock')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              activePreset === 'outofstock'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            ✕ ناموجود ({tableData.filter(p => p.stockStatus === 'outofstock').length})
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('on_sale')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              activePreset === 'on_sale'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            🏷️ دارای تخفیف ویژه
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('variable')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              activePreset === 'variable'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            محصولات متغیر (Variable)
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset('simple')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
              activePreset === 'simple'
                ? 'bg-gray-700 text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            محصولات ساده (Simple)
          </button>
        </div>

        {/* Detailed Filter Grid */}
        {showFilterPanel && (
          <div className="pt-3 border-t border-[#f0f0f1] space-y-3">
            {/* Row 1: Search, Category, Brand, Stock Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Search */}
              <div>
                <label className="block font-semibold text-[#2c3338] mb-1">
                  جستجو (نام، SKU یا شناسه):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="جستجوی نام کالا، کد SKU یا ID..."
                    value={searchTerm}
                    onChange={e => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-[#f6f7f7] border border-[#8c8f94] rounded px-2.5 py-1.5 pr-8 focus:border-[#2271b1] focus:bg-white focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-[#8c8f94] absolute right-2.5 top-2.5 pointer-events-none" />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute left-2.5 top-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-[#2c3338] mb-1">
                  دسته‌بندی محصول:
                </label>
                <select
                  value={categoryFilter}
                  onChange={e => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#f6f7f7] border border-[#8c8f94] rounded px-2.5 py-1.5 focus:border-[#2271b1] focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="">همه دسته‌ها</option>
                  {categoriesList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="block font-semibold text-[#2c3338] mb-1">
                  برند سازنده:
                </label>
                <select
                  value={brandFilter}
                  onChange={e => {
                    setBrandFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#f6f7f7] border border-[#8c8f94] rounded px-2.5 py-1.5 focus:border-[#2271b1] focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="">همه برندها</option>
                  {brandsList.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Stock Status */}
              <div>
                <label className="block font-semibold text-[#2c3338] mb-1">
                  وضعیت موجودی انبار:
                </label>
                <select
                  value={stockFilter}
                  onChange={e => {
                    setStockFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#f6f7f7] border border-[#8c8f94] rounded px-2.5 py-1.5 focus:border-[#2271b1] focus:bg-white focus:outline-none cursor-pointer font-medium"
                >
                  <option value="">همه وضعیت‌های انبار</option>
                  <option value="instock">✓ موجود در انبار (In Stock)</option>
                  <option value="outofstock">✕ ناموجود در انبار (Out of Stock)</option>
                </select>
              </div>
            </div>

            {/* Row 2: Type, Post Status, Price Range & Sale Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-[#fbfbfb] p-2.5 rounded border border-[#e5e5e5]">
              {/* Type */}
              <div>
                <label className="block font-medium text-[#2c3338] mb-1">نوع کالا:</label>
                <select
                  value={typeFilter}
                  onChange={e => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-[#8c8f94] rounded px-2 py-1 focus:border-[#2271b1] focus:outline-none cursor-pointer"
                >
                  <option value="">همه انواع (ساده و متغیر)</option>
                  <option value="simple">محصول ساده (Simple)</option>
                  <option value="variable">محصول متغیر (Variable)</option>
                </select>
              </div>

              {/* Post Status */}
              <div>
                <label className="block font-medium text-[#2c3338] mb-1">وضعیت انتشار:</label>
                <select
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-[#8c8f94] rounded px-2 py-1 focus:border-[#2271b1] focus:outline-none cursor-pointer"
                >
                  <option value="">همه وضعیت‌ها</option>
                  <option value="publish">منتشر شده (Published)</option>
                  <option value="draft">پیش‌نویس (Draft)</option>
                  <option value="pending">در انتظار بررسی (Pending)</option>
                </select>
              </div>

              {/* Price From / To */}
              <div>
                <label className="block font-medium text-[#2c3338] mb-1">محدوده قیمت (تومان):</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    placeholder="از..."
                    value={minPrice ?? ''}
                    onChange={e => {
                      setMinPrice(e.target.value ? Number(e.target.value) : '');
                      setCurrentPage(1);
                    }}
                    className="w-1/2 bg-white border border-[#8c8f94] rounded px-2 py-1 focus:border-[#2271b1] focus:outline-none text-left font-mono"
                    dir="ltr"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="تا..."
                    value={maxPrice ?? ''}
                    onChange={e => {
                      setMaxPrice(e.target.value ? Number(e.target.value) : '');
                      setCurrentPage(1);
                    }}
                    className="w-1/2 bg-white border border-[#8c8f94] rounded px-2 py-1 focus:border-[#2271b1] focus:outline-none text-left font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Sale status */}
              <div>
                <label className="block font-medium text-[#2c3338] mb-1">وضعیت تخفیف / حراج:</label>
                <select
                  value={saleFilter}
                  onChange={e => {
                    setSaleFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-[#8c8f94] rounded px-2 py-1 focus:border-[#2271b1] focus:outline-none cursor-pointer"
                >
                  <option value="all">همه محصولات</option>
                  <option value="on_sale">فقط کالاهای تخفیف‌دار</option>
                  <option value="no_sale">فقط کالاهای بدون تخفیف</option>
                </select>
              </div>
            </div>

            {/* Active Filters Badges */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                <span className="text-[#646970] font-medium">فیلترهای فعال در جدول:</span>
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-[#2271b1] border border-blue-200 px-2 py-0.5 rounded-full">
                    <span>عبارت: {searchTerm}</span>
                    <button type="button" onClick={() => setSearchTerm('')} className="hover:text-red-600 cursor-pointer">✕</button>
                  </span>
                )}
                {categoryFilter && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                    <span>دسته: {categoryFilter}</span>
                    <button type="button" onClick={() => setCategoryFilter('')} className="hover:text-red-600 cursor-pointer">✕</button>
                  </span>
                )}
                {brandFilter && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                    <span>برند: {brandFilter}</span>
                    <button type="button" onClick={() => setBrandFilter('')} className="hover:text-red-600 cursor-pointer">✕</button>
                  </span>
                )}
                {stockFilter && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <span>انبار: {stockFilter === 'instock' ? 'موجود' : 'ناموجود'}</span>
                    <button type="button" onClick={() => setStockFilter('')} className="hover:text-red-600 cursor-pointer">✕</button>
                  </span>
                )}
                {typeFilter && (
                  <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full">
                    <span>نوع: {typeFilter === 'variable' ? 'متغیر' : 'ساده'}</span>
                    <button type="button" onClick={() => setTypeFilter('')} className="hover:text-red-600 cursor-pointer">✕</button>
                  </span>
                )}
                {statusFilter && (
                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 border border-gray-300 px-2 py-0.5 rounded-full">
                    <span>وضعیت: {statusFilter}</span>
                    <button type="button" onClick={() => setStatusFilter('')} className="hover:text-red-600 cursor-pointer">✕</button>
                  </span>
                )}
                {saleFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-pink-50 text-pink-800 border border-pink-200 px-2 py-0.5 rounded-full">
                    <span>تخفیف: {saleFilter === 'on_sale' ? 'فقط تخفیف‌دار' : 'بدون تخفیف'}</span>
                    <button type="button" onClick={() => setSaleFilter('all')} className="hover:text-red-600 cursor-pointer">✕</button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {saveSuccessNotice && (
        <div className="bg-emerald-50 border-r-4 border-emerald-600 p-3 text-xs text-emerald-900 rounded-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>تغییرات جدول با موفقیت در پایگاه داده ووکامرس ذخیره شدند.</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono">WooCommerce CRUD Synced</span>
        </div>
      )}

      {/* Main Editable Table Card */}
      <div className="bg-white border border-[#c3c4c7] rounded-md shadow-xs overflow-hidden">
        {/* Table Top Pagination bar with Batch Selection Options */}
        <div className="px-4 py-2.5 bg-[#fbfbfb] border-b border-[#e5e5e5] flex flex-wrap items-center justify-between text-xs text-[#50575e] gap-2">
          {/* Left Selection Tools */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                isAllFilteredSelected
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-white border border-[#c3c4c7] text-[#2c3338] hover:bg-gray-100'
              }`}
            >
              {isAllFilteredSelected ? (
                <CheckSquare className="w-3.5 h-3.5 text-white" />
              ) : (
                <Square className="w-3.5 h-3.5 text-[#8c8f94]" />
              )}
              <span>
                {isAllFilteredSelected
                  ? `لغو انتخاب همه (${filteredProducts.length})`
                  : `انتخاب همه ${filteredProducts.length} ردیف فیلترشده`}
              </span>
            </button>

            {filteredProducts.length > 0 && (
              <button
                type="button"
                onClick={handleInvertSelection}
                className="px-2 py-1 border border-[#c3c4c7] bg-white hover:bg-gray-50 text-[#50575e] rounded transition cursor-pointer"
                title="معکوس کردن انتخاب‌ها"
              >
                انتخاب معکوس
              </button>
            )}

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="px-2 py-1 border border-red-200 bg-red-50 hover:bg-red-100/70 text-[#d63638] rounded transition cursor-pointer"
              >
                لغو همه ({selectedIds.length})
              </button>
            )}

            <span className="text-[#8c8f94]">|</span>

            <span>
              تعداد نتایج: <strong className="text-[#1d2327]">{filteredProducts.length} محصول</strong>
              {filteredProducts.length !== tableData.length && (
                <span className="text-[#646970]"> (از {tableData.length})</span>
              )}
            </span>

            {selectedIds.length > 0 && (
              <span className="text-[#2271b1] font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {selectedIds.length} ردیف انتخاب شده
              </span>
            )}

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setShowBulkAttrModal(true)}
                className="flex items-center gap-1 bg-[#107c41] hover:bg-[#0b5c30] text-white px-2.5 py-1 rounded font-medium transition cursor-pointer shadow-xs ml-1"
                title="تغییر گروهی برند، قیمت، رنگ، سایز و ویژگی‌های ردیف‌های انتخابی"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>ویرایش گروهی ویژگی‌ها ({selectedIds.length})</span>
              </button>
            )}

            {onGoToWizard && selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => onGoToWizard(selectedIds)}
                className="flex items-center gap-1 bg-[#7f54b3] hover:bg-[#683e9b] text-white px-2.5 py-1 rounded font-medium transition cursor-pointer shadow-xs ml-2"
                title="انتقال ردیف‌های انتخابی به ویزارد فرمولی ویرایش گروهی"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>ارسال ردیف‌های انتخابی به ویزارد ({selectedIds.length})</span>
              </button>
            )}

            {/* Quick Horizontal Scroll Buttons */}
            <div className="flex items-center gap-1 bg-white border border-[#c3c4c7] rounded px-1.5 py-0.5 text-xs text-[#50575e] shadow-2xs">
              <span className="text-[11px] text-[#646970] ml-0.5 font-medium">اسکرول افقی:</span>
              <button
                type="button"
                onClick={() => scrollHorizontally(-260)}
                className="p-1 hover:bg-gray-100 rounded text-[#2271b1] hover:text-[#135e96] cursor-pointer transition"
                title="اسکرول جدول به سمت راست"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollHorizontally(260)}
                className="p-1 hover:bg-gray-100 rounded text-[#2271b1] hover:text-[#135e96] cursor-pointer transition"
                title="اسکرول جدول به سمت چپ"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Controls: Page size & Page Nav */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span>تعداد:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#c3c4c7] rounded px-1.5 py-0.5 text-xs font-mono cursor-pointer"
              >
                <option value={8}>۸</option>
                <option value={15}>۱۵</option>
                <option value={30}>۳۰</option>
                <option value={-1}>همه</option>
              </select>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1 font-mono text-xs">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-2 py-0.5 border border-[#c3c4c7] rounded bg-white text-[#2c3338] disabled:opacity-40 hover:bg-[#f0f0f1] cursor-pointer"
                >
                  Previous
                </button>
                <span className="px-2 py-0.5 border border-[#2271b1] bg-blue-50 text-[#2271b1] font-bold rounded">
                  {currentPage}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-2 py-0.5 border border-[#c3c4c7] rounded bg-white text-[#2c3338] disabled:opacity-40 hover:bg-[#f0f0f1] cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Top Synced Horizontal Scrollbar for instantaneous horizontal scrolling */}
        <div
          ref={topScrollRef}
          onScroll={handleTopScroll}
          className="overflow-x-auto bg-[#f8fafc] border-b border-[#cbd5e1] h-3.5 sticky top-0 z-20"
          title="نوار اسکرول افقی بالای جدول (جهت اسکرول سریع بدون رفتن به انتهای صفحه)"
        >
          <div style={{ width: `${Math.max(1700, tableScrollWidth)}px`, height: '1px' }} />
        </div>

        {/* Scrollable Table Container with fixed viewport height and sticky header */}
        <div
          ref={tableContainerRef}
          onScroll={handleTableScroll}
          className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-270px)] min-h-[440px] relative focus:outline-none"
          tabIndex={0}
        >
          <table className="w-full text-right text-xs whitespace-nowrap border-collapse">
            <thead className="bg-[#f0f0f1] text-[#2c3338] border-b border-[#c3c4c7] font-semibold select-none sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="py-2.5 px-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    ref={el => {
                      if (el) el.indeterminate = isPartiallySelected;
                    }}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded text-[#2271b1] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-2 w-14">
                  <div className="flex items-center gap-1 text-[#2271b1] font-bold">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-2.5 px-2 w-16 text-center">Thumbnail</th>
                <th className="py-2.5 px-3 min-w-[220px]">Title (نام محصول)</th>
                <th className="py-2.5 px-2 w-28 text-center">Description</th>
                <th className="py-2.5 px-2 w-28 text-center">Short Desc.</th>
                <th className="py-2.5 px-2 min-w-[130px]">Category (دسته)</th>
                <th className="py-2.5 px-2 min-w-[120px]">Brand (برند)</th>
                <th className="py-2.5 px-2 min-w-[170px]">Attributes (ویژگی‌ها)</th>
                <th className="py-2.5 px-2 w-24">Type</th>
                <th className="py-2.5 px-2 w-24">Status</th>
                <th className="py-2.5 px-2 w-28">Regular price</th>
                <th className="py-2.5 px-2 w-28">Sale price</th>
                <th className="py-2.5 px-2 w-28">SKU</th>
                <th className="py-2.5 px-2 w-24 text-center">Manage stock</th>
                <th className="py-2.5 px-2 w-24">Stock quantity</th>
                <th className="py-2.5 px-2 w-24">Stock status</th>
                <th className="py-2.5 px-2 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f1]">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-[#646970]">
                    <div className="max-w-sm mx-auto space-y-2">
                      <Filter className="w-8 h-8 text-gray-400 mx-auto opacity-40" />
                      <div className="font-semibold text-sm text-[#1d2327]">محصولی با فیلترهای انتخابی یافت نشد</div>
                      <p className="text-xs text-[#646970]">
                        لطفاً معیارهای فیلتر را تغییر دهید یا روی دکمه پاک‌سازی فیلترها کلیک کنید.
                      </p>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2271b1] text-white rounded text-xs cursor-pointer font-medium hover:bg-[#135e96]"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>پاک‌سازی تمام فیلترها</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map(p => {
                  const isModified = modifiedProductIds.has(p.id);
                  const isSelected = selectedIds.includes(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-[#f6f7f7] transition-colors ${
                        isSelected ? 'bg-blue-50/60' : isModified ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(p.id)}
                          className="w-4 h-4 rounded text-[#2271b1] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* ID */}
                      <td className="py-2 px-2 font-mono text-[#2271b1] font-semibold">
                        {p.id}
                      </td>

                      {/* Thumbnail */}
                      <td className="py-2 px-2 text-center">
                        <div className="w-10 h-10 rounded border border-[#dcdcde] bg-gray-100 overflow-hidden mx-auto flex items-center justify-center">
                          {p.thumbnail ? (
                            <img
                              src={p.thumbnail}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </td>

                      {/* Title (Editable Text Input) */}
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={p.name}
                          onChange={e => handleCellChange(p.id, 'name', e.target.value)}
                          className={`w-full text-xs font-semibold px-2 py-1.5 rounded-sm border focus:outline-none transition ${
                            isModified
                              ? 'border-amber-400 bg-amber-50/30 focus:border-[#2271b1] focus:bg-white'
                              : 'border-transparent hover:border-[#c3c4c7] focus:border-[#2271b1] focus:bg-white bg-transparent'
                          }`}
                        />
                      </td>

                      {/* Description Button */}
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveModal({
                              productId: p.id,
                              title: p.name,
                              field: 'description',
                              fieldLabel: 'توضیحات کامل محصول',
                              initialValue: p.description || ''
                            })
                          }
                          className={`px-3 py-1 rounded border text-xs font-mono transition cursor-pointer ${
                            p.description && p.description.trim().length > 0
                              ? 'bg-[#f6f7f7] border-[#8c8f94] text-[#2c3338] hover:bg-gray-200 font-medium'
                              : 'bg-white border-[#dcdcde] text-[#8c8f94] hover:bg-gray-50'
                          }`}
                        >
                          {p.description && p.description.trim().length > 0 ? 'Content' : 'Content[empty]'}
                        </button>
                      </td>

                      {/* Short Desc. Button */}
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveModal({
                              productId: p.id,
                              title: p.name,
                              field: 'shortDescription',
                              fieldLabel: 'توضیحات کوتاه محصول',
                              initialValue: p.shortDescription || ''
                            })
                          }
                          className={`px-3 py-1 rounded border text-xs font-mono transition cursor-pointer ${
                            p.shortDescription && p.shortDescription.trim().length > 0
                              ? 'bg-[#f6f7f7] border-[#8c8f94] text-[#2c3338] hover:bg-gray-200 font-medium'
                              : 'bg-white border-[#dcdcde] text-[#8c8f94] hover:bg-gray-50'
                          }`}
                        >
                          {p.shortDescription && p.shortDescription.trim().length > 0 ? 'Content' : 'Content[empty]'}
                        </button>
                      </td>

                      {/* Category */}
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={p.category}
                          onChange={e => handleCellChange(p.id, 'category', e.target.value)}
                          className="w-full text-xs px-2 py-1 rounded-sm border border-transparent hover:border-[#c3c4c7] focus:border-[#2271b1] focus:bg-white bg-transparent focus:outline-none"
                        />
                      </td>

                      {/* Brand */}
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={p.brand}
                          onChange={e => handleCellChange(p.id, 'brand', e.target.value)}
                          className="w-full text-xs px-2 py-1 rounded-sm border border-transparent hover:border-[#c3c4c7] focus:border-[#2271b1] focus:bg-white bg-transparent focus:outline-none"
                        />
                      </td>

                      {/* Attributes */}
                      <td className="py-2 px-2 max-w-[200px]">
                        <div className="flex flex-wrap items-center gap-1 overflow-hidden">
                          {p.priceRange && (
                            <span className="text-[10px] bg-purple-50 text-purple-800 border border-purple-200 px-1.5 py-0.5 rounded font-medium truncate max-w-[95px]" title={`محدوده قیمت: ${p.priceRange}`}>
                              {p.priceRange}
                            </span>
                          )}
                          {p.attributes && Object.entries(p.attributes).map(([k, v]) => {
                            if (k === 'pa_brands' || k === 'pa_price-range') return null;
                            return (
                              <span key={k} className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-medium truncate max-w-[90px]" title={`${k}: ${v}`}>
                                {k}: {v}
                              </span>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedIds([p.id]);
                              setShowBulkAttrModal(true);
                            }}
                            className="text-[10px] text-[#2271b1] hover:underline cursor-pointer font-bold px-1"
                            title="تغییر یا افزودن ویژگی برای این ردیف"
                          >
                            + ویژگی
                          </button>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="py-2 px-2">
                        <select
                          value={p.type}
                          onChange={e => handleCellChange(p.id, 'type', e.target.value as ProductType)}
                          className="text-xs bg-transparent border border-transparent hover:border-[#c3c4c7] focus:border-[#2271b1] focus:bg-white rounded-sm px-1.5 py-1 focus:outline-none cursor-pointer"
                        >
                          <option value="simple">Simple</option>
                          <option value="variable">Variable</option>
                        </select>
                      </td>

                      {/* Status */}
                      <td className="py-2 px-2">
                        <select
                          value={p.status}
                          onChange={e => handleCellChange(p.id, 'status', e.target.value as PostStatus)}
                          className="text-xs bg-transparent border border-transparent hover:border-[#c3c4c7] focus:border-[#2271b1] focus:bg-white rounded-sm px-1.5 py-1 focus:outline-none cursor-pointer"
                        >
                          <option value="publish">Published</option>
                          <option value="draft">Draft</option>
                          <option value="pending">Pending</option>
                        </select>
                      </td>

                      {/* Regular Price */}
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          value={p.regularPrice}
                          onChange={e => handleCellChange(p.id, 'regularPrice', Number(e.target.value))}
                          className="w-24 font-mono text-xs px-2 py-1 rounded-sm border border-transparent hover:border-[#c3c4c7] focus:border-[#2271b1] focus:bg-white bg-transparent focus:outline-none text-left"
                          dir="ltr"
                        />
                      </td>

                      {/* Sale Price */}
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          placeholder="—"
                          value={p.salePrice ?? ''}
                          onChange={e => handleCellChange(p.id, 'salePrice', e.target.value ? Number(e.target.value) : null)}
                          className="w-24 font-mono text-xs px-2 py-1 rounded-sm border border-transparent hover:border-[#c3c4c7] focus:border-[#2271b1] focus:bg-white bg-transparent focus:outline-none text-left"
                          dir="ltr"
                        />
                      </td>

                      {/* SKU */}
                      <td className="py-2 px-2">
                        <input
                          type="text"
                          value={p.sku}
                          onChange={e => handleCellChange(p.id, 'sku', e.target.value)}
                          className="w-24 font-mono text-xs px-2 py-1 rounded-sm border border-transparent hover:border-[#c3c4c7] focus:border-[#2271b1] focus:bg-white bg-transparent focus:outline-none text-left"
                          dir="ltr"
                        />
                      </td>

                      {/* Manage Stock */}
                      <td className="py-2 px-2 text-center">
                        <div
                          onClick={() => handleCellChange(p.id, 'manageStock', !p.manageStock)}
                          className="inline-flex items-center gap-1.5 cursor-pointer select-none"
                        >
                          <div
                            className={`w-9 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                              p.manageStock ? 'bg-emerald-500' : 'bg-gray-300'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                                p.manageStock ? 'translate-x-0' : '-translate-x-4'
                              }`}
                            />
                          </div>
                          <span className={`text-[11px] font-medium ${p.manageStock ? 'text-emerald-700' : 'text-gray-500'}`}>
                            {p.manageStock ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-2 px-2">
                        <input
                          type="number"
                          disabled={!p.manageStock}
                          value={p.manageStock ? p.stockQuantity : ''}
                          onChange={e => handleCellChange(p.id, 'stockQuantity', Number(e.target.value))}
                          placeholder={!p.manageStock ? '—' : '0'}
                          className="w-16 font-mono text-xs px-2 py-1 rounded-sm border border-transparent hover:border-[#c3c4c7] focus:border-[#2271b1] focus:bg-white bg-transparent focus:outline-none disabled:opacity-40 text-left"
                          dir="ltr"
                        />
                      </td>

                      {/* Stock Status */}
                      <td className="py-2 px-2">
                        <select
                          value={p.stockStatus}
                          onChange={e => handleCellChange(p.id, 'stockStatus', e.target.value as StockStatus)}
                          className={`text-xs font-medium bg-transparent border border-transparent hover:border-[#c3c4c7] focus:border-[#2271b1] focus:bg-white rounded-sm px-1.5 py-1 focus:outline-none cursor-pointer ${
                            p.stockStatus === 'instock' ? 'text-emerald-700 font-semibold' : 'text-red-700 font-semibold'
                          }`}
                        >
                          <option value="instock" className="text-emerald-700">In stock</option>
                          <option value="outofstock" className="text-red-700">Out of stock</option>
                          <option value="onbackorder" className="text-amber-700">On backorder</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Preview Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewProduct(p)}
                            title="مشاهده پیش‌نمایش"
                            className="p-1 border border-[#2271b1] text-[#2271b1] hover:bg-blue-50 rounded transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Save Row Button */}
                          <button
                            type="button"
                            onClick={() => {
                              onSaveProducts(tableData);
                              setModifiedProductIds(prev => {
                                const next = new Set(prev);
                                next.delete(p.id);
                                return next;
                              });
                            }}
                            title="ذخیره این ردیف"
                            className={`p-1 border rounded transition cursor-pointer ${
                              isModified
                                ? 'border-[#00a32a] text-[#00a32a] hover:bg-emerald-50 bg-emerald-50/50'
                                : 'border-[#8c8f94] text-[#8c8f94] hover:bg-gray-100'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Entry Counter */}
        <div className="px-4 py-3 bg-[#fbfbfb] border-t border-[#e5e5e5] flex flex-wrap items-center justify-between text-xs text-[#50575e]">
          <div>
            Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {pageSize === -1 ? filteredProducts.length : Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length} entries
            {filteredProducts.length !== tableData.length && (
              <span className="text-[#646970]"> (فیلتر شده از میان {tableData.length} رکورد)</span>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-2 py-0.5 border border-[#c3c4c7] rounded bg-white text-[#2c3338] disabled:opacity-40 hover:bg-[#f0f0f1] cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2.5 py-0.5 border border-[#2271b1] bg-blue-50 text-[#2271b1] font-bold rounded">
                {currentPage}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-2 py-0.5 border border-[#c3c4c7] rounded bg-white text-[#2c3338] disabled:opacity-40 hover:bg-[#f0f0f1] cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description / Short Description Modal */}
      {activeModal && (
        <DescriptionModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title={activeModal.title}
          fieldLabel={activeModal.fieldLabel}
          initialValue={activeModal.initialValue}
          onSave={newVal => {
            handleCellChange(activeModal.productId, activeModal.field, newVal);
          }}
        />
      )}

      {/* Single Product Preview Drawer / Modal */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-2xl max-w-lg w-full border border-[#c3c4c7] overflow-hidden text-xs">
            <div className="bg-[#f0f0f1] px-4 py-3 border-b border-[#c3c4c7] flex items-center justify-between">
              <span className="font-bold text-[#1d2327]">پیش‌نمایش کارت کالا #{previewProduct.id}</span>
              <button
                onClick={() => setPreviewProduct(null)}
                className="p-1 hover:bg-gray-200 rounded text-[#646970] cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-3">
                {previewProduct.thumbnail ? (
                  <img
                    src={previewProduct.thumbnail}
                    alt={previewProduct.name}
                    className="w-20 h-20 object-cover rounded border"
                  />
                ) : (
                  <div className="w-20 h-20 rounded border bg-gray-100 flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-[#1d2327]">{previewProduct.name}</h3>
                  <div className="text-[#646970]">کد کالا (SKU): <span className="font-mono">{previewProduct.sku}</span></div>
                  <div className="text-[#646970]">دسته‌بندی: {previewProduct.category} | برند: {previewProduct.brand}</div>
                </div>
              </div>

              <div className="p-2.5 bg-gray-50 rounded border border-gray-200 space-y-1">
                <div className="flex justify-between">
                  <span>قیمت فروش عادی:</span>
                  <strong className="font-mono text-sm">{previewProduct.regularPrice.toLocaleString('fa-IR')} تومان</strong>
                </div>
                {previewProduct.salePrice && (
                  <div className="flex justify-between text-red-600">
                    <span>قیمت حراج ویژه:</span>
                    <strong className="font-mono text-sm">{previewProduct.salePrice.toLocaleString('fa-IR')} تومان</strong>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>موجودی انبار:</span>
                  <span className={`font-semibold ${previewProduct.stockStatus === 'instock' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {previewProduct.stockQuantity} عدد ({previewProduct.stockStatus === 'instock' ? 'موجود' : 'ناموجود'})
                  </span>
                </div>
              </div>

              {previewProduct.shortDescription && (
                <div>
                  <div className="font-bold text-[#2c3338] mb-1">توضیحات کوتاه:</div>
                  <p className="bg-[#f9f9f9] p-2 rounded border text-[#50575e] leading-relaxed">
                    {previewProduct.shortDescription}
                  </p>
                </div>
              )}

              {previewProduct.description && (
                <div>
                  <div className="font-bold text-[#2c3338] mb-1">توضیحات کامل:</div>
                  <p className="bg-[#f9f9f9] p-2 rounded border text-[#50575e] leading-relaxed max-h-32 overflow-y-auto">
                    {previewProduct.description}
                  </p>
                </div>
              )}
            </div>
            <div className="bg-[#f0f0f1] px-4 py-2.5 border-t border-[#c3c4c7] text-left">
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="px-4 py-1.5 bg-[#2271b1] text-white rounded text-xs font-medium cursor-pointer"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Bulk Attributes Modal */}
      {showBulkAttrModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-xl border border-[#c3c4c7] max-w-lg w-full overflow-hidden text-xs text-[#2c3338] animate-in fade-in zoom-in-95">
            <div className="bg-[#107c41] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Palette className="w-4 h-4" />
                <span>ویرایش گروهی ویژگی‌ها ({selectedIds.length} محصول انتخاب شده)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkAttrModal(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-emerald-50 border-r-4 border-[#107c41] p-3 text-[11px] text-emerald-900 rounded-sm">
                مقدار ویژگی انتخاب‌شده به صورت همزمان روی تمام <strong>{selectedIds.length} محصول انتخاب‌شده</strong> اعمال خواهد شد.
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-[#2c3338]">ویژگی مورد نظر جهت تغییر:</label>
                  <button
                    type="button"
                    onClick={() => setCustomAttrNameInput(!customAttrNameInput)}
                    className="text-[11px] text-[#2271b1] hover:underline cursor-pointer"
                  >
                    {customAttrNameInput ? 'انتخاب از لیست ویژگی‌های آماده' : 'تایپ نام ویژگی دلخواه'}
                  </button>
                </div>
                {customAttrNameInput ? (
                  <input
                    type="text"
                    placeholder="مثلاً: رنگ، سایز، گارانتی، جنس، کشور سازنده..."
                    value={bulkAttrName}
                    onChange={e => setBulkAttrName(e.target.value)}
                    className="w-full bg-[#f6f7f7] border border-[#8c8f94] rounded px-3 py-2 focus:border-[#107c41] focus:bg-white focus:outline-none"
                  />
                ) : (
                  <select
                    value={bulkAttrName}
                    onChange={e => setBulkAttrName(e.target.value)}
                    className="w-full bg-[#f6f7f7] border border-[#8c8f94] rounded px-3 py-2 focus:border-[#107c41] focus:bg-white focus:outline-none cursor-pointer font-medium"
                  >
                    <option value="برند">🏢 برند کالا (Brand)</option>
                    <option value="محدوده قیمت">🏷️ محدوده قیمت (pa_price-range)</option>
                    <option value="رنگ">🎨 رنگ (Color)</option>
                    <option value="سایز">📏 سایز (Size)</option>
                    <option value="گارانتی">🛡️ گارانتی (Warranty)</option>
                    <option value="جنس">🧵 جنس (Material)</option>
                    <option value="مدل">📱 مدل (Model)</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block font-bold text-[#2c3338] mb-1.5">نوع عملیات:</label>
                <select
                  value={bulkAttrAction}
                  onChange={e => setBulkAttrAction(e.target.value as any)}
                  className="w-full bg-[#f6f7f7] border border-[#8c8f94] rounded px-3 py-2 focus:border-[#107c41] focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="set_term">تعیین / جایگزینی با مقدار مشخص (Set Value)</option>
                  <option value="replace_term">یافتن و جایگزینی بخشی از متن ویژگی (Find & Replace)</option>
                  <option value="remove">حذف کامل این ویژگی از ردیف‌های انتخابی (Remove)</option>
                </select>
              </div>

              {bulkAttrAction === 'replace_term' && (
                <div>
                  <label className="block font-bold text-[#d63638] mb-1.5">متن قبلی جهت جستجو (Find):</label>
                  <input
                    type="text"
                    placeholder="متن قدیمی در ویژگی..."
                    value={bulkAttrSearchValue}
                    onChange={e => setBulkAttrSearchValue(e.target.value)}
                    className="w-full bg-[#f6f7f7] border border-red-300 rounded px-3 py-2 focus:outline-none"
                  />
                </div>
              )}

              {bulkAttrAction !== 'remove' && (
                <div>
                  <label className="block font-bold text-[#107c41] mb-1.5">
                    {bulkAttrAction === 'replace_term' ? 'متن جدید جایگزین (Replace with):' : 'مقدار جدید برای انتصاب به همه:'}
                  </label>
                  {bulkAttrName === 'برند' ? (
                    <div className="space-y-2">
                      <select
                        value={bulkAttrValue}
                        onChange={e => setBulkAttrValue(e.target.value)}
                        className="w-full bg-[#f6f7f7] border border-[#8c8f94] rounded px-3 py-2 focus:border-[#107c41] focus:bg-white focus:outline-none cursor-pointer"
                      >
                        <option value="">-- انتخاب از برندها --</option>
                        {brandsList.map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="یا تایپ نام برند دلخواه..."
                        value={bulkAttrValue}
                        onChange={e => setBulkAttrValue(e.target.value)}
                        className="w-full bg-white border border-[#8c8f94] rounded px-3 py-1.5 focus:border-[#107c41] focus:outline-none"
                      />
                    </div>
                  ) : bulkAttrName === 'محدوده قیمت' ? (
                    <select
                      value={bulkAttrValue}
                      onChange={e => setBulkAttrValue(e.target.value)}
                      className="w-full bg-[#f6f7f7] border border-[#8c8f94] rounded px-3 py-2 focus:border-[#107c41] focus:bg-white focus:outline-none cursor-pointer"
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
                  ) : (
                    <div>
                      <input
                        type="text"
                        placeholder="مقدار مورد نظر را تایپ کنید..."
                        value={bulkAttrValue}
                        onChange={e => setBulkAttrValue(e.target.value)}
                        className="w-full bg-[#f6f7f7] border border-[#8c8f94] rounded px-3 py-2 focus:border-[#107c41] focus:bg-white focus:outline-none"
                      />
                      {/* Suggestion tags */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[10px] text-[#646970]">پیشنهاد:</span>
                        {['مشکی', 'سفید', 'آبی', 'گارانتی ۱۸ ماهه', 'گارانتی ۲۴ ماهه', 'XL', 'L'].map(sug => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => setBulkAttrValue(sug)}
                            className="text-[10px] bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 border border-gray-200 px-2 py-0.5 rounded cursor-pointer"
                          >
                            + {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-[#f0f0f1] px-5 py-3 border-t border-[#dcdcde] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowBulkAttrModal(false)}
                className="px-3 py-1.5 border border-[#8c8f94] bg-white text-[#2c3338] hover:bg-gray-100 rounded cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleApplyBulkAttribute}
                className="px-4 py-1.5 bg-[#107c41] hover:bg-[#0b5c30] text-white font-bold rounded shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>اعمال روی {selectedIds.length} محصول انتخابی</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
