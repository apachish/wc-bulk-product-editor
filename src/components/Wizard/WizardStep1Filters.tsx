import React, { useState, useMemo } from 'react';
import { Product, FilterCriteria } from '../../types';
import { sampleBrandsList } from '../../mockData';
import {
  Search,
  Filter,
  CheckSquare,
  Square,
  ArrowLeft,
  RotateCcw,
  Tag,
  Layers,
  ChevronLeft,
  ChevronRight,
  Table,
  Check,
  X,
  SlidersHorizontal,
  DollarSign,
  Package,
  Sparkles,
  ShoppingBag,
  HelpCircle
} from 'lucide-react';

interface Props {
  products: Product[];
  selectedProductIds: number[];
  setSelectedProductIds: React.Dispatch<React.SetStateAction<number[]>>;
  filters: FilterCriteria;
  setFilters: React.Dispatch<React.SetStateAction<FilterCriteria>>;
  onNext: () => void;
  onSwitchToTable?: () => void;
}

export const WizardStep1Filters: React.FC<Props> = ({
  products,
  selectedProductIds,
  setSelectedProductIds,
  filters,
  setFilters,
  onNext,
  onSwitchToTable
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(6);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);

  // Extract unique categories and brands
  const categories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category))).filter(Boolean);
  }, [products]);

  const brands = useMemo(() => {
    const list = new Set<string>(sampleBrandsList);
    products.forEach(p => {
      if (p.brand) list.add(p.brand);
      if (p.attributes) {
        if (p.attributes['pa_brands']) list.add(p.attributes['pa_brands']);
        if (p.attributes['pa_brand']) list.add(p.attributes['pa_brand']);
        if (p.attributes['brand']) list.add(p.attributes['brand']);
        if (p.attributes['برند']) list.add(p.attributes['برند']);
      }
    });
    return Array.from(list).filter(Boolean);
  }, [products]);

  // Quick preset active check
  const activePreset = useMemo(() => {
    if (
      !filters.searchTerm &&
      !filters.sku &&
      !filters.productId &&
      !filters.brand &&
      !filters.category &&
      !filters.productType &&
      !filters.postStatus &&
      !filters.stockStatus &&
      filters.saleFilter === 'all' &&
      !filters.minPrice &&
      !filters.maxPrice
    ) {
      return 'all';
    }
    if (filters.stockStatus === 'instock' && !filters.searchTerm && !filters.category && !filters.brand) {
      return 'instock';
    }
    if (filters.stockStatus === 'outofstock' && !filters.searchTerm && !filters.category && !filters.brand) {
      return 'outofstock';
    }
    if (filters.saleFilter === 'on_sale') {
      return 'on_sale';
    }
    if (filters.productType === 'variable') {
      return 'variable';
    }
    if (filters.productType === 'simple') {
      return 'simple';
    }
    return 'custom';
  }, [filters]);

  // Apply quick preset
  const handleApplyPreset = (preset: string) => {
    setCurrentPage(1);
    switch (preset) {
      case 'all':
        setFilters(prev => ({
          ...prev,
          searchTerm: '',
          sku: '',
          productId: '',
          brand: '',
          category: '',
          productType: '',
          postStatus: '',
          stockStatus: '',
          saleFilter: 'all',
          minPrice: '',
          maxPrice: ''
        }));
        break;
      case 'instock':
        setFilters(prev => ({
          ...prev,
          stockStatus: 'instock',
          saleFilter: 'all'
        }));
        break;
      case 'outofstock':
        setFilters(prev => ({
          ...prev,
          stockStatus: 'outofstock',
          saleFilter: 'all'
        }));
        break;
      case 'on_sale':
        setFilters(prev => ({
          ...prev,
          saleFilter: 'on_sale'
        }));
        break;
      case 'variable':
        setFilters(prev => ({
          ...prev,
          productType: 'variable'
        }));
        break;
      case 'simple':
        setFilters(prev => ({
          ...prev,
          productType: 'simple'
        }));
        break;
      default:
        break;
    }
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Search Term (Name)
      if (filters.searchTerm) {
        const term = filters.searchTerm.trim().toLowerCase();
        if (!p.name.toLowerCase().includes(term)) {
          return false;
        }
      }

      // SKU
      if (filters.sku) {
        const skuTerm = filters.sku.trim().toLowerCase();
        if (!p.sku.toLowerCase().includes(skuTerm)) {
          return false;
        }
      }

      // Product ID
      if (filters.productId) {
        const idTerm = filters.productId.trim();
        if (p.id.toString() !== idTerm) {
          return false;
        }
      }

      // Brand
      if (filters.brand && p.brand !== filters.brand) {
        return false;
      }

      // Category
      if (filters.category && p.category !== filters.category) {
        return false;
      }

      // Product Type
      if (filters.productType && p.type !== filters.productType) {
        return false;
      }

      // Post Status
      if (filters.postStatus && p.status !== filters.postStatus) {
        return false;
      }

      // Stock Status
      if (filters.stockStatus && p.stockStatus !== filters.stockStatus) {
        return false;
      }

      // Purchasable Status
      if (filters.purchasableStatus === 'purchasable' && !p.isPurchasable) {
        return false;
      }
      if (filters.purchasableStatus === 'not-purchasable' && p.isPurchasable) {
        return false;
      }

      // Sale Filter
      if (filters.saleFilter === 'on_sale') {
        if (!p.salePrice || p.salePrice <= 0 || p.salePrice >= p.regularPrice) return false;
      } else if (filters.saleFilter === 'no_sale') {
        if (p.salePrice && p.salePrice > 0 && p.salePrice < p.regularPrice) return false;
      }

      // Min Price
      if (typeof filters.minPrice === 'number' && filters.minPrice > 0) {
        const effectivePrice = p.salePrice ?? p.regularPrice;
        if (effectivePrice < filters.minPrice) return false;
      }

      // Max Price
      if (typeof filters.maxPrice === 'number' && filters.maxPrice > 0) {
        const effectivePrice = p.salePrice ?? p.regularPrice;
        if (effectivePrice > filters.maxPrice) return false;
      }

      return true;
    });
  }, [products, filters]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    if (pageSize === -1) return filteredProducts;
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const totalPages = pageSize === -1 ? 1 : Math.ceil(filteredProducts.length / pageSize) || 1;

  // Selected in current filtered list
  const filteredSelectedCount = useMemo(() => {
    return filteredProducts.filter(p => selectedProductIds.includes(p.id)).length;
  }, [filteredProducts, selectedProductIds]);

  const isAllFilteredSelected = filteredProducts.length > 0 && filteredSelectedCount === filteredProducts.length;
  const isPartiallySelected = filteredSelectedCount > 0 && !isAllFilteredSelected;

  // Selection handlers
  const handleToggleSelectFiltered = () => {
    if (isAllFilteredSelected) {
      // Deselect all filtered products, keeping other selections intact
      const filteredIdSet = new Set(filteredProducts.map(p => p.id));
      setSelectedProductIds(prev => prev.filter(id => !filteredIdSet.has(id)));
    } else {
      // Add all filtered products to selection
      const filteredIds = filteredProducts.map(p => p.id);
      setSelectedProductIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleSelectOnlyFiltered = () => {
    setSelectedProductIds(filteredProducts.map(p => p.id));
  };

  const handleDeselectFiltered = () => {
    const filteredIdSet = new Set(filteredProducts.map(p => p.id));
    setSelectedProductIds(prev => prev.filter(id => !filteredIdSet.has(id)));
  };

  const handleInvertFiltered = () => {
    const filteredIdSet = new Set(filteredProducts.map(p => p.id));
    setSelectedProductIds(prev => {
      const nonFiltered = prev.filter(id => !filteredIdSet.has(id));
      const newlySelected = filteredProducts.filter(p => !prev.includes(p.id)).map(p => p.id);
      return [...nonFiltered, ...newlySelected];
    });
  };

  const handleClearAllSelections = () => {
    setSelectedProductIds([]);
  };

  const handleToggleProduct = (id: number) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setFilters({
      searchTerm: '',
      sku: '',
      productId: '',
      brand: '',
      category: '',
      productType: '',
      postStatus: '',
      stockStatus: '',
      purchasableStatus: 'all',
      targetLevel: 'all',
      minPrice: '',
      maxPrice: '',
      saleFilter: 'all'
    });
    setCurrentPage(1);
  };

  // Count active filter count for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.sku) count++;
    if (filters.productId) count++;
    if (filters.brand) count++;
    if (filters.category) count++;
    if (filters.productType) count++;
    if (filters.postStatus) count++;
    if (filters.stockStatus) count++;
    if (filters.saleFilter && filters.saleFilter !== 'all') count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    return count;
  }, [filters]);

  return (
    <div className="space-y-4">
      {/* Top Banner & Quick Presets Bar */}
      <div className="bg-white border border-[#c3c4c7] rounded-md shadow-xs p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#f0f0f1]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2271b1] flex items-center justify-center font-bold">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#1d2327]">مرحله ۱: فیلتر هوشمند و انتخاب محصولات</h2>
                {activeFiltersCount > 0 && (
                  <span className="bg-[#2271b1] text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
                    {activeFiltersCount} فیلتر فعال
                  </span>
                )}
              </div>
              <p className="text-xs text-[#646970] mt-0.5">
                محصولات مورد نظر را با فیلترهای زیر بیابید، آن‌ها را انتخاب نموده و برای تعریف تغییرات به مرحله بعد بروید.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-1.5 text-xs text-[#2271b1] hover:text-[#135e96] bg-blue-50 hover:bg-blue-100/80 px-2.5 py-1.5 rounded transition cursor-pointer font-medium"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showAdvancedFilters ? 'بستن پنل فیلترها' : 'نمایش پنل فیلترها'}</span>
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
          </div>
        </div>

        {/* Quick Presets Pills */}
        <div className="pt-3 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[#646970] font-medium ml-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>فیلترهای سریع:</span>
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
            همه محصولات ({products.length})
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
            ✓ موجود در انبار ({products.filter(p => p.stockStatus === 'instock').length})
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
            ✕ ناموجود در انبار ({products.filter(p => p.stockStatus === 'outofstock').length})
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
            🏷️ دارای حراج / تخفیف ویژه
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
            📦 محصولات دارای تنوع (Variable)
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
        {showAdvancedFilters && (
          <div className="mt-4 pt-3 border-t border-[#f0f0f1] space-y-3">
            {/* Row 1: Search, SKU, ID, Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Search Title */}
              <div>
                <label className="block font-semibold text-[#2c3338] mb-1">
                  جستجوی عنوان محصول:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="مثال: سامسونگ، ایرپاد..."
                    value={filters.searchTerm}
                    onChange={e => {
                      setFilters(prev => ({ ...prev, searchTerm: e.target.value }));
                      setCurrentPage(1);
                    }}
                    className="w-full bg-[#f6f7f7] border border-[#8c8f94] rounded px-2.5 py-1.5 pr-8 focus:border-[#2271b1] focus:bg-white focus:outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-[#8c8f94] absolute right-2.5 top-2.5 pointer-events-none" />
                  {filters.searchTerm && (
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
                      className="absolute left-2.5 top-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* SKU */}
              <div>
                <label className="block font-semibold text-[#2c3338] mb-1">
                  کد محصول (SKU):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="مثال: SAM-S24U..."
                    value={filters.sku}
                    onChange={e => {
                      setFilters(prev => ({ ...prev, sku: e.target.value }));
                      setCurrentPage(1);
                    }}
                    className="w-full bg-[#f6f7f7] border border-[#8c8f94] rounded px-2.5 py-1.5 focus:border-[#2271b1] focus:bg-white focus:outline-none font-mono"
                    dir="ltr"
                  />
                  {filters.sku && (
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, sku: '' }))}
                      className="absolute left-2.5 top-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Product ID */}
              <div>
                <label className="block font-semibold text-[#2c3338] mb-1">
                  شناسه یکتای محصول (ID):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="مثال: 101"
                    value={filters.productId}
                    onChange={e => {
                      setFilters(prev => ({ ...prev, productId: e.target.value }));
                      setCurrentPage(1);
                    }}
                    className="w-full bg-[#f6f7f7] border border-[#8c8f94] rounded px-2.5 py-1.5 focus:border-[#2271b1] focus:bg-white focus:outline-none font-mono"
                    dir="ltr"
                  />
                  {filters.productId && (
                    <button
                      type="button"
                      onClick={() => setFilters(prev => ({ ...prev, productId: '' }))}
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
                  دسته‌بندی ووکامرس:
                </label>
                <select
                  value={filters.category}
                  onChange={e => {
                    setFilters(prev => ({ ...prev, category: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#f6f7f7] border border-[#8c8f94] rounded px-2.5 py-1.5 focus:border-[#2271b1] focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="">همه دسته‌بندی‌ها</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Brand, Type, Stock Status, Post Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Brand */}
              <div>
                <label className="block font-semibold text-[#2c3338] mb-1">
                  برند سازنده:
                </label>
                <select
                  value={filters.brand}
                  onChange={e => {
                    setFilters(prev => ({ ...prev, brand: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#f6f7f7] border border-[#8c8f94] rounded px-2.5 py-1.5 focus:border-[#2271b1] focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="">همه برندها</option>
                  {brands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Product Type */}
              <div>
                <label className="block font-semibold text-[#2c3338] mb-1">
                  نوع محصول:
                </label>
                <select
                  value={filters.productType}
                  onChange={e => {
                    setFilters(prev => ({ ...prev, productType: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#f6f7f7] border border-[#8c8f94] rounded px-2.5 py-1.5 focus:border-[#2271b1] focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="">همه انواع (ساده و متغیر)</option>
                  <option value="simple">محصول ساده (Simple)</option>
                  <option value="variable">محصول متغیر (Variable)</option>
                </select>
              </div>

              {/* Stock Status */}
              <div>
                <label className="block font-semibold text-[#2c3338] mb-1">
                  وضعیت موجودی انبار:
                </label>
                <select
                  value={filters.stockStatus}
                  onChange={e => {
                    setFilters(prev => ({ ...prev, stockStatus: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#f6f7f7] border border-[#8c8f94] rounded px-2.5 py-1.5 focus:border-[#2271b1] focus:bg-white focus:outline-none cursor-pointer font-medium"
                >
                  <option value="">همه وضعیت‌های انبار</option>
                  <option value="instock">✓ موجود در انبار (In Stock)</option>
                  <option value="outofstock">✕ ناموجود در انبار (Out of Stock)</option>
                </select>
              </div>

              {/* Post Status */}
              <div>
                <label className="block font-semibold text-[#2c3338] mb-1">
                  وضعیت انتشار:
                </label>
                <select
                  value={filters.postStatus}
                  onChange={e => {
                    setFilters(prev => ({ ...prev, postStatus: e.target.value }));
                    setCurrentPage(1);
                  }}
                  className="w-full bg-[#f6f7f7] border border-[#8c8f94] rounded px-2.5 py-1.5 focus:border-[#2271b1] focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="">همه وضعیت‌های انتشار</option>
                  <option value="publish">منتشر شده (Publish)</option>
                  <option value="draft">پیش‌نویس (Draft)</option>
                </select>
              </div>
            </div>

            {/* Row 3: Price Range & Sale Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#fbfbfb] p-2.5 rounded border border-[#e5e5e5]">
              {/* Min Price */}
              <div>
                <label className="block font-medium text-[#2c3338] mb-1">
                  حداقل قیمت (تومان):
                </label>
                <input
                  type="number"
                  placeholder="مثال: ۱,۰۰۰,۰۰۰"
                  value={filters.minPrice ?? ''}
                  onChange={e => {
                    const val = e.target.value ? Number(e.target.value) : '';
                    setFilters(prev => ({ ...prev, minPrice: val }));
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-[#8c8f94] rounded px-2.5 py-1.5 focus:border-[#2271b1] focus:outline-none text-left font-mono"
                  dir="ltr"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block font-medium text-[#2c3338] mb-1">
                  حداکثر قیمت (تومان):
                </label>
                <input
                  type="number"
                  placeholder="مثال: ۵۰,۰۰۰,۰۰۰"
                  value={filters.maxPrice ?? ''}
                  onChange={e => {
                    const val = e.target.value ? Number(e.target.value) : '';
                    setFilters(prev => ({ ...prev, maxPrice: val }));
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-[#8c8f94] rounded px-2.5 py-1.5 focus:border-[#2271b1] focus:outline-none text-left font-mono"
                  dir="ltr"
                />
              </div>

              {/* Sale status */}
              <div>
                <label className="block font-medium text-[#2c3338] mb-1">
                  وضعیت تخفیف / حراج:
                </label>
                <select
                  value={filters.saleFilter || 'all'}
                  onChange={e => {
                    setFilters(prev => ({ ...prev, saleFilter: e.target.value as any }));
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-[#8c8f94] rounded px-2.5 py-1.5 focus:border-[#2271b1] focus:outline-none cursor-pointer"
                >
                  <option value="all">همه محصولات (با و بدون تخفیف)</option>
                  <option value="on_sale">فقط محصولات دارای قیمت حراج</option>
                  <option value="no_sale">فقط محصولات بدون تخفیف</option>
                </select>
              </div>
            </div>

            {/* Active Filter Badges */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 text-[11px]">
                <span className="text-[#646970] font-medium">فیلترهای اعمال‌شده:</span>
                {filters.searchTerm && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-[#2271b1] border border-blue-200 px-2 py-0.5 rounded-full">
                    <span>عنوان: {filters.searchTerm}</span>
                    <button
                      type="button"
                      onClick={() => setFilters(p => ({ ...p, searchTerm: '' }))}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {filters.sku && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-[#2271b1] border border-blue-200 px-2 py-0.5 rounded-full">
                    <span>SKU: {filters.sku}</span>
                    <button
                      type="button"
                      onClick={() => setFilters(p => ({ ...p, sku: '' }))}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {filters.productId && (
                  <span className="inline-flex items-center gap-1 bg-blue-50 text-[#2271b1] border border-blue-200 px-2 py-0.5 rounded-full">
                    <span>شناسه: #{filters.productId}</span>
                    <button
                      type="button"
                      onClick={() => setFilters(p => ({ ...p, productId: '' }))}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {filters.category && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                    <span>دسته: {filters.category}</span>
                    <button
                      type="button"
                      onClick={() => setFilters(p => ({ ...p, category: '' }))}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {filters.brand && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                    <span>برند: {filters.brand}</span>
                    <button
                      type="button"
                      onClick={() => setFilters(p => ({ ...p, brand: '' }))}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {filters.stockStatus && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <span>موجودی: {filters.stockStatus === 'instock' ? 'موجود' : 'ناموجود'}</span>
                    <button
                      type="button"
                      onClick={() => setFilters(p => ({ ...p, stockStatus: '' }))}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {filters.productType && (
                  <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full">
                    <span>نوع: {filters.productType === 'variable' ? 'متغیر' : 'ساده'}</span>
                    <button
                      type="button"
                      onClick={() => setFilters(p => ({ ...p, productType: '' }))}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {filters.saleFilter && filters.saleFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-pink-50 text-pink-800 border border-pink-200 px-2 py-0.5 rounded-full">
                    <span>تخفیف: {filters.saleFilter === 'on_sale' ? 'دارای تخفیف' : 'بدون تخفیف'}</span>
                    <button
                      type="button"
                      onClick={() => setFilters(p => ({ ...p, saleFilter: 'all' }))}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {filters.minPrice ? (
                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 border border-gray-300 px-2 py-0.5 rounded-full">
                    <span>از {(filters.minPrice as number).toLocaleString('fa-IR')} تومان</span>
                    <button
                      type="button"
                      onClick={() => setFilters(p => ({ ...p, minPrice: '' }))}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ) : null}
                {filters.maxPrice ? (
                  <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 border border-gray-300 px-2 py-0.5 rounded-full">
                    <span>تا {(filters.maxPrice as number).toLocaleString('fa-IR')} تومان</span>
                    <button
                      type="button"
                      onClick={() => setFilters(p => ({ ...p, maxPrice: '' }))}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Products Selection Table Card */}
      <div className="bg-white border border-[#c3c4c7] rounded-md shadow-xs overflow-hidden">
        {/* Table Action Bar with Clean Selection Buttons */}
        <div className="bg-[#f6f7f7] px-4 py-3 border-b border-[#c3c4c7] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Left Selection Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Toggle Select All Filtered */}
            <button
              type="button"
              onClick={handleToggleSelectFiltered}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold transition cursor-pointer ${
                isAllFilteredSelected
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                  : 'bg-white border border-[#8c8f94] text-[#2c3338] hover:bg-gray-100'
              }`}
            >
              {isAllFilteredSelected ? (
                <CheckSquare className="w-4 h-4 text-white" />
              ) : isPartiallySelected ? (
                <CheckSquare className="w-4 h-4 text-[#2271b1]" />
              ) : (
                <Square className="w-4 h-4 text-[#8c8f94]" />
              )}
              <span>
                {isAllFilteredSelected
                  ? `لغو انتخاب همه (${filteredProducts.length})`
                  : `انتخاب همه ${filteredProducts.length} محصول فیلترشده`}
              </span>
            </button>

            {/* Invert Selection */}
            {filteredProducts.length > 0 && (
              <button
                type="button"
                onClick={handleInvertFiltered}
                className="px-2.5 py-1.5 border border-[#c3c4c7] bg-white hover:bg-gray-50 text-[#50575e] rounded transition cursor-pointer"
                title="معکوس کردن انتخاب‌های موارد فیلترشده"
              >
                انتخاب معکوس
              </button>
            )}

            {/* Clear All */}
            {selectedProductIds.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllSelections}
                className="px-2.5 py-1.5 border border-red-200 bg-red-50 hover:bg-red-100/70 text-[#d63638] rounded transition cursor-pointer font-medium"
                title="پاک‌کردن تمام انتخاب‌ها"
              >
                لغو همه انتخاب‌ها ({selectedProductIds.length})
              </button>
            )}

            <span className="text-[#8c8f94] mx-1">|</span>

            {/* Status counter badge */}
            <div className="flex items-center gap-1 bg-white border border-[#c3c4c7] px-3 py-1 rounded text-[#2c3338]">
              <span>تعداد انتخاب‌شده: </span>
              <strong className="text-sm font-bold text-[#2271b1]">
                {selectedProductIds.length}
              </strong>
              <span className="text-[#646970]">
                از {filteredProducts.length} محصول فیلترشده
              </span>
            </div>

            {onSwitchToTable && (
              <button
                type="button"
                onClick={onSwitchToTable}
                className="flex items-center gap-1.5 text-[#2271b1] hover:text-[#135e96] bg-blue-50 hover:bg-blue-100/70 border border-blue-200 px-3 py-1.5 rounded transition cursor-pointer font-medium mr-1"
              >
                <Table className="w-3.5 h-3.5" />
                <span>ویرایش مستقیم در جدول</span>
              </button>
            )}
          </div>

          {/* Right Controls: Page Size & Pagination */}
          <div className="flex items-center gap-3">
            {/* Page Size */}
            <div className="flex items-center gap-1 text-[#646970]">
              <span>نمایش:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#8c8f94] rounded px-1.5 py-0.5 text-xs font-mono focus:outline-none cursor-pointer"
              >
                <option value={6}>۶ قلم</option>
                <option value={12}>۱۲ قلم</option>
                <option value={24}>۲۴ قلم</option>
                <option value={-1}>همه موارد</option>
              </select>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 font-mono">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1 border border-[#c3c4c7] rounded bg-white text-[#2c3338] disabled:opacity-40 hover:bg-[#f0f0f1] cursor-pointer"
                  title="صفحه قبل"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="px-2 py-0.5 text-[#646970] font-sans text-xs">
                  {currentPage} از {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-1 border border-[#c3c4c7] rounded bg-white text-[#2c3338] disabled:opacity-40 hover:bg-[#f0f0f1] cursor-pointer"
                  title="صفحه بعد"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto overflow-y-auto max-h-[520px] relative border border-[#c3c4c7] rounded-sm">
          <table className="w-full text-right text-xs whitespace-nowrap border-separate border-spacing-0">
            <thead className="select-none sticky top-0 z-20">
              <tr className="bg-[#f0f0f1] text-[#2c3338] font-semibold">
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    ref={el => {
                      if (el) el.indeterminate = isPartiallySelected;
                    }}
                    onChange={handleToggleSelectFiltered}
                    className="w-4 h-4 rounded text-[#2271b1] focus:ring-0 cursor-pointer"
                    title={isAllFilteredSelected ? 'لغو انتخاب همه' : 'انتخاب همه فیلترشده‌ها'}
                  />
                </th>
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-2 w-14 font-mono">شناسه</th>
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-2 w-14 text-center">تصویر</th>
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3 min-w-[220px]">نام و مشخصات محصول</th>
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3 w-32 font-mono">کد کالا (SKU)</th>
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3 w-24">نوع کالا</th>
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3 w-32">قیمت فروش</th>
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3 w-28">موجودی انبار</th>
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3 w-28">اسنپ‌پی / ترب</th>
                <th className="sticky top-0 z-20 bg-[#f0f0f1] border-b-2 border-[#c3c4c7] shadow-[0_1px_2px_rgba(0,0,0,0.06)] py-2.5 px-3 w-24">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#646970]">
                    <div className="max-w-md mx-auto space-y-2">
                      <Filter className="w-8 h-8 text-[#8c8f94] mx-auto opacity-50" />
                      <div className="font-semibold text-sm text-[#1d2327]">محصولی با فیلترهای مشخص‌شده یافت نشد</div>
                      <p className="text-xs text-[#646970]">
                        لطفاً عبارت جستجو، دسته‌بندی یا محدوده قیمت را تغییر دهید یا دکمه پاک‌سازی فیلترها را بزنید.
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
                  const isSelected = selectedProductIds.includes(p.id);
                  const hasSale = p.salePrice !== null && p.salePrice > 0 && p.salePrice < p.regularPrice;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleToggleProduct(p.id)}
                      className={`hover:bg-[#f6f7f7] cursor-pointer transition select-none ${
                        isSelected ? 'bg-blue-50/70 border-r-4 border-r-[#2271b1]' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-2.5 px-3 text-center border-b border-[#f0f0f1]" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleProduct(p.id)}
                          className="w-4 h-4 rounded text-[#2271b1] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* ID */}
                      <td className="py-2.5 px-2 font-mono text-[#646970] border-b border-[#f0f0f1]">
                        #{p.id}
                      </td>

                      {/* Thumbnail */}
                      <td className="py-2 px-2 text-center border-b border-[#f0f0f1]" onClick={e => e.stopPropagation()}>
                        <div className="w-9 h-9 rounded border border-[#dcdcde] bg-gray-100 overflow-hidden mx-auto flex items-center justify-center">
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

                      {/* Title & Taxonomy */}
                      <td className="py-2.5 px-3 border-b border-[#f0f0f1]">
                        <div className="font-semibold text-[#1d2327] hover:text-[#2271b1]">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-[#646970] mt-0.5 flex flex-wrap items-center gap-2">
                          <span>دسته: <strong>{p.category || '—'}</strong></span>
                          <span>•</span>
                          <span>برند: <strong>{p.brand || '—'}</strong></span>
                          {p.variations && (
                            <>
                              <span>•</span>
                              <span className="text-[#2271b1] font-semibold">
                                {p.variations.length} تنوع کالا
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-2.5 px-3 font-mono text-[#50575e] border-b border-[#f0f0f1]">
                        {p.sku || '—'}
                      </td>

                      {/* Type */}
                      <td className="py-2.5 px-3 border-b border-[#f0f0f1]">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                          p.type === 'variable'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {p.type === 'variable' ? 'متغیر' : 'ساده'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-2.5 px-3 font-medium border-b border-[#f0f0f1]">
                        {hasSale ? (
                          <div>
                            <div className="text-[#d63638] font-bold">
                              {p.salePrice!.toLocaleString('fa-IR')}{' '}
                              <span className="text-[10px]">تومان</span>
                            </div>
                            <div className="text-[10px] text-[#646970] line-through">
                              {p.regularPrice.toLocaleString('fa-IR')}
                            </div>
                          </div>
                        ) : (
                          <div className="text-[#1d2327]">
                            {p.regularPrice.toLocaleString('fa-IR')}{' '}
                            <span className="text-[10px] text-[#646970]">تومان</span>
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="py-2.5 px-3 border-b border-[#f0f0f1]">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          p.stockStatus === 'instock'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          {p.stockStatus === 'instock' ? `${p.stockQuantity} عدد موجود` : 'ناموجود'}
                        </span>
                      </td>

                      {/* Payment Adapters */}
                      <td className="py-2.5 px-3 border-b border-[#f0f0f1]">
                        <div className="flex items-center gap-1 text-[11px]">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            p.snappayEnabled
                              ? 'bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300'
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            اسنپ‌پی
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            p.torobPayEnabled
                              ? 'bg-blue-100 text-blue-800 font-semibold border border-blue-300'
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            ترب
                          </span>
                        </div>
                      </td>

                      {/* Post Status */}
                      <td className="py-2.5 px-3 border-b border-[#f0f0f1]">
                        <span className={`text-[11px] font-medium ${
                          p.status === 'publish' ? 'text-emerald-700' : 'text-amber-700'
                        }`}>
                          {p.status === 'publish' ? 'منتشر شده' : 'پیش‌نویس'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Result Counter Bar */}
        <div className="px-4 py-2.5 bg-[#fbfbfb] border-t border-[#e5e5e5] flex flex-wrap items-center justify-between text-xs text-[#646970]">
          <div>
            <span>نمایش </span>
            <strong className="text-[#1d2327]">
              {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} تا{' '}
              {pageSize === -1 ? filteredProducts.length : Math.min(currentPage * pageSize, filteredProducts.length)}
            </strong>
            <span> از مجموع </span>
            <strong className="text-[#1d2327]">{filteredProducts.length} محصول فیلترشده</strong>
            {filteredProducts.length !== products.length && (
              <span> (کل محصولات فروشگاه: {products.length})</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#1d2327]">
              {selectedProductIds.length} محصول برای ویرایش انتخاب شده است.
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 border border-[#c3c4c7] rounded-md shadow-xs">
        <div className="space-y-0.5">
          <div className="text-xs text-[#2c3338] flex items-center gap-1.5 font-medium">
            <span>محصولات آماده پردازش:</span>
            <strong className="text-sm text-[#2271b1] font-bold">
              {selectedProductIds.length} محصول
            </strong>
          </div>
          <p className="text-[11px] text-[#646970]">
            {selectedProductIds.length === 0
              ? 'لطفاً حداقل یک محصول را با زدن تیک انتخاب کنید تا دکمه مرحله بعد فعال شود.'
              : 'در مرحله بعد، تغییرات فرمولی دلخواه (قیمت، تخفیف، وضعیت و ...) را روی این محصولات تعریف خواهید کرد.'}
          </p>
        </div>

        <button
          type="button"
          disabled={selectedProductIds.length === 0}
          onClick={onNext}
          className="flex items-center gap-2 bg-[#2271b1] hover:bg-[#135e96] text-white px-6 py-2.5 rounded font-bold text-xs transition cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>مرحله بعد: تعریف تغییرات ({selectedProductIds.length} محصول)</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
