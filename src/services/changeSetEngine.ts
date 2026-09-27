import { Product, ProductVariation, OperationSettings, ProductChangePreview, DiffItem } from '../types';

/**
 * Calculates the WooCommerce 'pa_price-range' attribute term based on product price
 */
export function calculatePriceRangeTerm(price: number): string {
  if (price < 2000000) return 'زیر ۲ میلیون';
  if (price <= 5000000) return '۲ تا ۵ میلیون';
  if (price <= 10000000) return '۵ تا ۱۰ میلیون';
  if (price <= 15000000) return '۱۰ تا ۱۵ میلیون';
  if (price <= 20000000) return '۱۵ تا ۲۰ میلیون';
  if (price <= 30000000) return '۲۰ تا ۳۰ میلیون';
  if (price <= 40000000) return '۳۰ تا ۴۰ میلیون';
  if (price <= 60000000) return '۴۰ تا ۶۰ میلیون';
  if (price <= 70000000) return '۶۰ تا ۷۰ میلیون';
  return '۷۰ میلیون به بالا';
}

export const ALL_PRICE_RANGE_TERMS = [
  '۲ تا ۵ میلیون',
  '۵ تا ۱۰ میلیون',
  '۱۰ تا ۱۵ میلیون',
  '۱۵ تا ۲۰ میلیون',
  '۲۰ تا ۳۰ میلیون',
  '۳۰ تا ۴۰ میلیون',
  '۴۰ تا ۶۰ میلیون',
  '۶۰ تا ۷۰ میلیون',
  '۷۰ میلیون به بالا'
];

/**
 * Shared ChangeSetEngine matching PHP ChangeSetEngine logic:
 * Guarantee that Preview and Apply use the exact same calculation formulas and snapshot structure.
 */
export class ChangeSetEngine {
  /**
   * Calculate new price based on operation rule
   */
  public static calculatePrice(
    currentPrice: number | null,
    opType: string,
    opValue: number,
    roundTo: number
  ): number | null {
    if (opType === 'none') {
      return currentPrice;
    }

    const base = currentPrice !== null && currentPrice !== undefined ? Number(currentPrice) : 0;
    let calculated = base;

    switch (opType) {
      case 'fixed':
        calculated = Math.max(0, opValue);
        break;
      case 'increase_percent':
        calculated = base + (base * opValue) / 100;
        break;
      case 'decrease_percent':
        calculated = Math.max(0, base - (base * opValue) / 100);
        break;
      case 'increase_amount':
        calculated = base + opValue;
        break;
      case 'decrease_amount':
        calculated = Math.max(0, base - opValue);
        break;
      default:
        return currentPrice;
    }

    // Apply rounding if configured (e.g. to nearest 1,000 Tomans)
    if (roundTo > 1) {
      calculated = Math.round(calculated / roundTo) * roundTo;
    }

    return Math.round(calculated);
  }

  /**
   * Calculate new stock quantity
   */
  public static calculateStock(
    currentStock: number,
    opType: string,
    opValue: number
  ): { stock: number; status: 'instock' | 'outofstock' | 'onbackorder' } {
    if (opType === 'none') {
      return {
        stock: currentStock,
        status: currentStock > 0 ? 'instock' : 'outofstock'
      };
    }

    let calculated = currentStock;
    switch (opType) {
      case 'fixed':
        calculated = Math.max(0, Math.floor(opValue));
        break;
      case 'increase':
        calculated = Math.max(0, currentStock + Math.floor(opValue));
        break;
      case 'decrease':
        calculated = Math.max(0, currentStock - Math.floor(opValue));
        break;
    }

    return {
      stock: calculated,
      status: calculated > 0 ? 'instock' : 'outofstock'
    };
  }

  /**
   * Process a single product or variation into a Diff preview
   */
  public static generateItemDiff(
    item: Product | ProductVariation,
    settings: OperationSettings,
    isVariation: boolean
  ): ProductChangePreview {
    const diffs: DiffItem[] = [];

    // Regular Price
    if (settings.regularPriceType !== 'none') {
      const oldPrice = item.regularPrice;
      const newPrice = this.calculatePrice(
        oldPrice,
        settings.regularPriceType,
        settings.regularPriceValue,
        settings.roundPriceTo
      );
      if (newPrice !== null && newPrice !== oldPrice) {
        diffs.push({
          field: 'regularPrice',
          fieldLabel: 'قیمت عادی',
          oldValue: oldPrice,
          newValue: newPrice,
          changed: true
        });
      }
    }

    // Sale Price
    if (settings.salePriceType !== 'none') {
      const oldSale = item.salePrice;
      const newSale = this.calculatePrice(
        oldSale,
        settings.salePriceType,
        settings.salePriceValue,
        settings.roundPriceTo
      );
      if (newSale !== oldSale) {
        diffs.push({
          field: 'salePrice',
          fieldLabel: 'قیمت حراج',
          oldValue: oldSale,
          newValue: newSale,
          changed: true
        });
      }
    }

    // Stock Quantity
    if (settings.stockType !== 'none' && item.manageStock) {
      const oldStock = item.stockQuantity;
      const { stock: newStock, status: newStatus } = this.calculateStock(
        oldStock,
        settings.stockType,
        settings.stockValue
      );
      if (newStock !== oldStock) {
        diffs.push({
          field: 'stockQuantity',
          fieldLabel: 'موجودی انبار',
          oldValue: `${oldStock} عدد`,
          newValue: `${newStock} عدد (${newStatus === 'instock' ? 'موجود' : 'ناموجود'})`,
          changed: true
        });
      }
    }

    // Post Status (Publish / Draft / Pending / Private)
    if (settings.postStatusAction && settings.postStatusAction !== 'none' && !isVariation) {
      const prod = item as Product;
      const oldStatus = prod.status;
      const newStatus = settings.postStatusAction;
      if (oldStatus !== newStatus) {
        const labels: Record<string, string> = {
          publish: 'منتشر شده (Publish)',
          draft: 'پیش‌نویس (Draft)',
          pending: 'در انتظار بررسی (Pending)',
          private: 'خصوصی (Private)'
        };
        diffs.push({
          field: 'status',
          fieldLabel: 'وضعیت انتشار کالا',
          oldValue: labels[oldStatus] || oldStatus,
          newValue: labels[newStatus] || newStatus,
          changed: true
        });
      }
    }

    // Stock Status (In Stock / Out of Stock)
    if (settings.stockStatusAction && settings.stockStatusAction !== 'none') {
      const oldStockStatus = item.stockStatus;
      const newStockStatus = settings.stockStatusAction;
      if (oldStockStatus !== newStockStatus) {
        diffs.push({
          field: 'stockStatus',
          fieldLabel: 'وضعیت انبار',
          oldValue: oldStockStatus === 'instock' ? 'موجود در انبار' : 'ناموجود',
          newValue: newStockStatus === 'instock' ? 'موجود در انبار' : 'ناموجود',
          changed: true
        });
      }
    }

    // Purchasable / Sale Status
    if (settings.purchasableAction !== 'none') {
      const oldVal = item.isPurchasable;
      const newVal = settings.purchasableAction === 'enable';
      if (oldVal !== newVal) {
        diffs.push({
          field: 'isPurchasable',
          fieldLabel: 'وضعیت امکان خرید',
          oldValue: oldVal ? 'فعال' : 'غیرفعال',
          newValue: newVal ? 'فعال' : 'غیرفعال',
          changed: true
        });
      }
    }

    // Snappay Adapter
    if (settings.snappayAction !== 'none') {
      const oldVal = item.snappayEnabled;
      const newVal = settings.snappayAction === 'enable';
      if (oldVal !== newVal) {
        diffs.push({
          field: 'snappayEnabled',
          fieldLabel: 'درگاه اسنپ‌پی (اقساط)',
          oldValue: oldVal ? 'فعال' : 'غیرفعال',
          newValue: newVal ? 'فعال' : 'غیرفعال',
          changed: true
        });
      }
    }

    // Torob Pay Adapter
    if (settings.torobPayAction !== 'none') {
      const oldVal = item.torobPayEnabled;
      const newVal = settings.torobPayAction === 'enable';
      if (oldVal !== newVal) {
        diffs.push({
          field: 'torobPayEnabled',
          fieldLabel: 'پرداخت سریع ترب (Torob Pay)',
          oldValue: oldVal ? 'فعال' : 'غیرفعال',
          newValue: newVal ? 'فعال' : 'غیرفعال',
          changed: true
        });
      }
    }

    // Attribute: Price Range (محدوده قیمت pa_price-range)
    if (settings.priceRangeAction && settings.priceRangeAction !== 'none' && !isVariation) {
      const prod = item as Product;
      const oldPriceRange = prod.priceRange || 'تنظیم نشده';
      let newPriceRange = oldPriceRange;

      if (settings.priceRangeAction === 'auto_by_price') {
        const effPrice = settings.salePriceType !== 'none'
          ? (this.calculatePrice(prod.regularPrice, settings.salePriceType, settings.salePriceValue, settings.roundPriceTo) || prod.regularPrice)
          : (settings.regularPriceType !== 'none'
              ? (this.calculatePrice(prod.regularPrice, settings.regularPriceType, settings.regularPriceValue, settings.roundPriceTo) || prod.regularPrice)
              : (prod.salePrice ?? prod.regularPrice));
        newPriceRange = calculatePriceRangeTerm(effPrice);
      } else if (settings.priceRangeAction === 'set_term' && settings.priceRangeValue) {
        newPriceRange = settings.priceRangeValue;
      } else if (settings.priceRangeAction === 'remove') {
        newPriceRange = 'حذف ویژگی';
      }

      if (oldPriceRange !== newPriceRange) {
        diffs.push({
          field: 'priceRange',
          fieldLabel: 'ویژگی محدوده قیمت (pa_price-range)',
          oldValue: oldPriceRange,
          newValue: newPriceRange,
          changed: true
        });
      }
    }

    // Attribute: Brand (برندها pa_brands)
    if (settings.brandAction && settings.brandAction !== 'none' && !isVariation) {
      const prod = item as Product;
      const oldBrand = prod.brand || 'تنظیم نشده';
      const newBrand = settings.brandAction === 'set_term' ? (settings.brandValue || 'Casio') : 'حذف برند';
      if (oldBrand !== newBrand && newBrand) {
        diffs.push({
          field: 'brand',
          fieldLabel: 'ویژگی برند (pa_brands)',
          oldValue: oldBrand,
          newValue: newBrand,
          changed: true
        });
      }
    }

    // Custom Attribute (رنگ، سایز، گارانتی یا هر ویژگی دلخواه دیگر)
    if (
      settings.customAttributeAction &&
      settings.customAttributeAction !== 'none' &&
      settings.customAttributeName?.trim()
    ) {
      const attrName = settings.customAttributeName.trim();
      const existingAttrs = (item as any).attributes || {};
      const oldAttrVal = existingAttrs[attrName] || (item as any)[attrName] || 'تنظیم نشده';
      let newAttrVal = oldAttrVal;

      if (settings.customAttributeAction === 'set_term') {
        newAttrVal = settings.customAttributeValue || '';
      } else if (settings.customAttributeAction === 'replace_term') {
        const searchFor = settings.customAttributeSearchValue || '';
        const replaceWith = settings.customAttributeValue || '';
        if (searchFor && oldAttrVal !== 'تنظیم نشده') {
          newAttrVal = String(oldAttrVal).split(searchFor).join(replaceWith);
        }
      } else if (settings.customAttributeAction === 'remove') {
        newAttrVal = 'حذف ویژگی';
      }

      if (oldAttrVal !== newAttrVal) {
        diffs.push({
          field: `attr_${attrName}`,
          fieldLabel: `ویژگی «${attrName}»`,
          oldValue: oldAttrVal,
          newValue: newAttrVal,
          changed: true
        });
      }
    }

    const beforeSnapshot: Record<string, any> = {};
    const afterSnapshot: Record<string, any> = {};
    diffs.forEach(d => {
      beforeSnapshot[d.field] = d.oldValue;
      afterSnapshot[d.field] = d.newValue;
    });

    return {
      productId: item.id,
      parentId: isVariation ? (item as ProductVariation).parentId : undefined,
      name: item.name,
      sku: item.sku || `ID-${item.id}`,
      type: isVariation ? 'variation' : (item as Product).type,
      diffs,
      hasChanges: diffs.length > 0,
      beforeSnapshot,
      afterSnapshot
    };
  }

  /**
   * Generate previews for products list respecting scope filter
   */
  public static generatePreviews(
    products: Product[],
    settings: OperationSettings
  ): ProductChangePreview[] {
    const results: ProductChangePreview[] = [];

    products.forEach(p => {
      const isVariable = p.type === 'variable';

      // Simple product or parent product
      if (settings.applyToScope !== 'variations_only') {
        const parentDiff = this.generateItemDiff(p, settings, false);
        if (parentDiff.hasChanges) {
          results.push(parentDiff);
        }
      }

      // Variations if variable product
      if (isVariable && p.variations && settings.applyToScope !== 'products_only') {
        p.variations.forEach(v => {
          const varDiff = this.generateItemDiff(v, settings, true);
          if (varDiff.hasChanges) {
            results.push(varDiff);
          }
        });
      }
    });

    return results;
  }
}
