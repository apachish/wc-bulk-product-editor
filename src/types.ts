export type ProductType = 'simple' | 'variable' | 'variation';
export type StockStatus = 'instock' | 'outofstock' | 'onbackorder';
export type PostStatus = 'publish' | 'draft' | 'pending' | 'private';

export interface ProductVariation {
  id: number;
  parentId: number;
  sku: string;
  name: string;
  attributes: Record<string, string>;
  regularPrice: number;
  salePrice: number | null;
  manageStock: boolean;
  stockQuantity: number;
  stockStatus: StockStatus;
  snappayEnabled: boolean;
  torobPayEnabled: boolean;
  isPurchasable: boolean;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  type: ProductType;
  status: PostStatus;
  category: string;
  brand: string;
  priceRange?: string; // ویژگی محدوده قیمت (pa_price-range)
  attributes?: Record<string, string>; // ویژگی‌های محصول (pa_*)
  thumbnail?: string;
  description?: string;
  shortDescription?: string;
  regularPrice: number;
  salePrice: number | null;
  manageStock: boolean;
  stockQuantity: number;
  stockStatus: StockStatus;
  snappayEnabled: boolean;
  torobPayEnabled: boolean;
  isPurchasable: boolean; // sales status
  variations?: ProductVariation[];
}

export interface FilterCriteria {
  searchTerm: string;
  sku: string;
  productId: string;
  brand: string;
  category: string;
  productType: string;
  postStatus: string;
  stockStatus: string;
  purchasableStatus: string; // 'all' | 'purchasable' | 'not-purchasable'
  targetLevel: 'all' | 'product_only' | 'variation_only';
  minPrice?: number | '';
  maxPrice?: number | '';
  saleFilter?: 'all' | 'on_sale' | 'no_sale';
}

export type PriceOperationType = 'none' | 'fixed' | 'increase_percent' | 'decrease_percent' | 'increase_amount' | 'decrease_amount';
export type StockOperationType = 'none' | 'fixed' | 'increase' | 'decrease';
export type ToggleOperationType = 'none' | 'enable' | 'disable';
export type PostStatusOperationType = 'none' | 'publish' | 'draft' | 'pending' | 'private';
export type StockStatusOperationType = 'none' | 'instock' | 'outofstock';

export interface OperationSettings {
  // Regular Price
  regularPriceType: PriceOperationType;
  regularPriceValue: number;
  // Sale Price
  salePriceType: PriceOperationType;
  salePriceValue: number;
  // Stock
  stockType: StockOperationType;
  stockValue: number;
  // Post Status (Publish, Draft, Pending, Private)
  postStatusAction: PostStatusOperationType;
  // Stock Status (In stock, Out of stock)
  stockStatusAction: StockStatusOperationType;
  // Sale / Purchasable Status
  purchasableAction: ToggleOperationType;
  // Gateway Adapters (Flexible meta layer)
  snappayAction: ToggleOperationType;
  torobPayAction: ToggleOperationType;
  // Product Attributes (ویژگی‌های محصول مانند محدوده قیمت و برندها)
  priceRangeAction?: 'none' | 'auto_by_price' | 'set_term' | 'remove';
  priceRangeValue?: string; // e.g. '۷۰ میلیون به بالا', '۱۰ تا ۱۵ میلیون', etc.
  brandAction?: 'none' | 'set_term' | 'remove';
  brandValue?: string; // e.g. 'Casio', 'Seiko', etc.
  customAttributeAction?: 'none' | 'set_term' | 'replace_term' | 'remove';
  customAttributeName?: string; // e.g. 'رنگ', 'سایز', 'گارانتی'
  customAttributeValue?: string; // مقدار جدید
  customAttributeSearchValue?: string; // مقدار قبلی جهت جایگزینی (در حالت replace_term)
  // Target Scope
  applyToScope: 'products_and_variations' | 'products_only' | 'variations_only';
  // Price Tier / Rounding
  roundPriceTo: number; // e.g. 1000 for Tomans
}

export interface DiffItem {
  field: string;
  fieldLabel: string;
  oldValue: any;
  newValue: any;
  changed: boolean;
}

export interface ProductChangePreview {
  productId: number;
  parentId?: number;
  name: string;
  sku: string;
  type: ProductType;
  diffs: DiffItem[];
  hasChanges: boolean;
  error?: string;
  beforeSnapshot: Partial<Product>;
  afterSnapshot: Partial<Product>;
}

export interface BatchExecutionStats {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
  errors: { productId: number; sku: string; error: string }[];
}

export interface OperationLog {
  id: string; // UUID
  userId: number;
  userName: string;
  timestamp: string;
  description: string;
  totalItems: number;
  successCount: number;
  failCount: number;
  status: 'completed' | 'rolled_back' | 'partial_rollback' | 'in_progress';
  filtersSummary: string;
  changesSummary: string;
  items: {
    productId: number;
    name: string;
    sku: string;
    beforeData: Record<string, any>;
    afterData: Record<string, any>;
    rolledBack: boolean;
  }[];
}

export interface PluginSettings {
  batchSize: number;
  historyRetentionDays: number;
  auditLogEnabled: boolean;
  rollbackEnabled: boolean;
  // Snappay adapter configuration
  snappayMetaKey: string;
  snappayPluginActive: boolean;
  // Torob Pay adapter configuration
  torobMetaKey: string;
  torobPluginActive: boolean;
  priceRoundUnit: number;
}
