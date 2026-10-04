<?php
declare(strict_types=1);

namespace WCBulkEditor\Engine;

use WC_Product;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Shared Change Set Engine for both Preview and Apply phases.
 * Guarantees zero calculation divergence and deterministic outcomes.
 */
class ChangeSetEngine {
    /**
     * Compute new price strictly according to rules
     */
    public static function calculatePrice(float $current, string $type, float $value, int $roundUnit = 0): float {
        $result = $current;
        switch ($type) {
            case 'fixed':
                $result = max(0.0, $value);
                break;
            case 'increase_percent':
                $result = $current + ($current * ($value / 100));
                break;
            case 'decrease_percent':
                $result = max(0.0, $current - ($current * ($value / 100)));
                break;
            case 'increase_amount':
                $result = $current + $value;
                break;
            case 'decrease_amount':
                $result = max(0.0, $current - $value);
                break;
        }

        if ($roundUnit > 1) {
            $result = round($result / $roundUnit) * $roundUnit;
        }

        return round($result, 2);
    }

    /**
     * Generate diff and snapshots for a product
     */
    public static function generateDiff(WC_Product $product, array $operations): array {
        $diffs  = [];
        $before = [];
        $after  = [];

        // Normalize keys (support both snake_case and camelCase)
        $regType   = $operations['regular_price_type'] ?? $operations['regularPriceType'] ?? 'none';
        $regValue  = (float) ($operations['regular_price_value'] ?? $operations['regularPriceValue'] ?? 0);
        $roundUnit = (int) ($operations['round_unit'] ?? $operations['roundPriceTo'] ?? 0);

        $saleType  = $operations['sale_price_type'] ?? $operations['salePriceType'] ?? 'none';
        $saleValue = (float) ($operations['sale_price_value'] ?? $operations['salePriceValue'] ?? 0);

        $statusAction = $operations['status_action'] ?? $operations['statusAction'] ?? $operations['post_status_action'] ?? 'none';

        $stockType   = $operations['stock_type'] ?? $operations['stockType'] ?? 'none';
        $stockValue  = (int) ($operations['stock_value'] ?? $operations['stockValue'] ?? 0);
        $manageStockAction = $operations['manage_stock_action'] ?? $operations['manageStockAction'] ?? 'none';
        $stockStatus = $operations['stock_status_action'] ?? $operations['stockStatusAction'] ?? 'none';

        $snappayAction  = $operations['snappay_action'] ?? $operations['snappayAction'] ?? 'none';
        $torobPayAction = $operations['torob_pay_action'] ?? $operations['torobPayAction'] ?? 'none';

        // 1. Regular Price
        if (!empty($regType) && $regType !== 'none') {
            $oldPrice = (float) $product->get_regular_price();
            $newPrice = self::calculatePrice($oldPrice, $regType, $regValue, $roundUnit);
            if ($newPrice !== $oldPrice) {
                $before['regular_price'] = $oldPrice;
                $after['regular_price']  = $newPrice;
                $diffs[] = [
                    'field' => 'قیمت عادی',
                    'old'   => number_format($oldPrice) . ' تومان',
                    'new'   => number_format($newPrice) . ' تومان'
                ];
            }
        }

        // 2. Sale Price
        if (!empty($saleType) && $saleType !== 'none') {
            $oldSale  = (float) $product->get_sale_price();
            $regPrice = (float) $product->get_regular_price();
            $newSale  = null;

            if ($saleType === 'remove') {
                $newSale = '';
            } elseif ($saleType === 'fixed') {
                $newSale = max(0.0, $saleValue);
            } elseif ($saleType === 'decrease_percent') {
                $base = $regPrice > 0 ? $regPrice : $oldSale;
                $newSale = max(0.0, $base - ($base * ($saleValue / 100)));
            } elseif ($saleType === 'decrease_amount') {
                $base = $regPrice > 0 ? $regPrice : $oldSale;
                $newSale = max(0.0, $base - $saleValue);
            }

            if ($newSale !== null && $roundUnit > 1 && is_numeric($newSale)) {
                $newSale = round((float)$newSale / $roundUnit) * $roundUnit;
            }

            if ($newSale !== null) {
                $before['sale_price'] = $oldSale;
                $after['sale_price']  = $newSale;
                $diffs[] = [
                    'field' => 'قیمت حراج',
                    'old'   => $oldSale > 0 ? number_format($oldSale) . ' تومان' : 'ندارد',
                    'new'   => ($newSale !== '' && (float)$newSale > 0) ? number_format((float)$newSale) . ' تومان' : 'حذف تخفیف'
                ];
            }
        }

        // 3. Post Status (Publish, Draft, Pending, Private)
        if (!empty($statusAction) && $statusAction !== 'none') {
            $oldStatus = $product->get_status();
            if ($oldStatus !== $statusAction) {
                $statusLabels = [
                    'publish' => 'منتشر شده (Publish)',
                    'draft'   => 'پیش‌نویس (Draft)',
                    'pending' => 'در انتظار بررسی (Pending)',
                    'private' => 'خصوصی (Private)'
                ];
                $before['status'] = $oldStatus;
                $after['status']  = $statusAction;
                $diffs[] = [
                    'field' => 'وضعیت انتشار',
                    'old'   => $statusLabels[$oldStatus] ?? $oldStatus,
                    'new'   => $statusLabels[$statusAction] ?? $statusAction
                ];
            }
        }

        // 4. Stock Quantity
        if (!empty($stockType) && $stockType !== 'none') {
            $oldStock = (int) $product->get_stock_quantity();
            $newStock = $oldStock;
            if ($stockType === 'fixed') {
                $newStock = max(0, $stockValue);
            } elseif ($stockType === 'increase') {
                $newStock = max(0, $oldStock + $stockValue);
            } elseif ($stockType === 'decrease') {
                $newStock = max(0, $oldStock - $stockValue);
            }

            if ($newStock !== $oldStock || !$product->managing_stock()) {
                $before['stock_quantity'] = $oldStock;
                $before['manage_stock']   = $product->managing_stock();
                $after['stock_quantity']  = $newStock;
                $after['manage_stock']    = true;
                $diffs[] = [
                    'field' => 'موجودی انبار',
                    'old'   => $oldStock . ' عدد',
                    'new'   => $newStock . ' عدد'
                ];
            }
        }

        // 4.5 Manage Stock Action (Enable / Disable with outofstock rule)
        if (!empty($manageStockAction) && $manageStockAction !== 'none') {
            $oldManage = $product->managing_stock();
            if ($manageStockAction === 'disable') {
                if ($oldManage) {
                    $before['manage_stock'] = true;
                    $after['manage_stock']  = false;
                    $diffs[] = [
                        'field' => 'مدیریت موجودی انبار',
                        'old'   => 'فعال',
                        'new'   => 'غیرفعال (موجودی حفظ می‌شود)'
                    ];
                }
                // هنگامی که مدیریت انبار غیرفعال می‌شود: محصول ناموجود شود و موجودی تغییر نکند
                $oldStockStatus = $product->get_stock_status();
                if ($oldStockStatus !== 'outofstock') {
                    $before['stock_status'] = $oldStockStatus;
                    $after['stock_status']  = 'outofstock';
                    $diffs[] = [
                        'field' => 'وضعیت انبارداری',
                        'old'   => $oldStockStatus === 'instock' ? 'موجود در انبار' : 'ناموجود',
                        'new'   => 'ناموجود (Out of stock)'
                    ];
                }
            } elseif ($manageStockAction === 'enable') {
                if (!$oldManage) {
                    $before['manage_stock'] = false;
                    $after['manage_stock']  = true;
                    $diffs[] = [
                        'field' => 'مدیریت موجودی انبار',
                        'old'   => 'غیرفعال',
                        'new'   => 'فعال'
                    ];
                }
            }
        }

        // 5. Stock Status (In stock / Out of stock)
        if (!empty($stockStatus) && $stockStatus !== 'none' && $manageStockAction !== 'disable') {
            $oldStockStatus = $product->get_stock_status();
            if ($oldStockStatus !== $stockStatus) {
                $before['stock_status'] = $oldStockStatus;
                $after['stock_status']  = $stockStatus;
                $diffs[] = [
                    'field' => 'وضعیت انبارداری',
                    'old'   => $oldStockStatus === 'instock' ? 'موجود در انبار' : 'ناموجود',
                    'new'   => $stockStatus === 'instock' ? 'موجود در انبار' : 'ناموجود'
                ];
            }
        }

        // 6. Gateways Adapter Integration (Snappay & Torob)
        $adapters = \WCBulkEditor\Integrations\AdapterRegistry::getAdapters();
        if (!empty($snappayAction) && $snappayAction !== 'none' && isset($adapters['snappay'])) {
            $oldVal = $adapters['snappay']->getValue($product);
            $newVal = ($snappayAction === 'enable');
            if ($oldVal !== $newVal) {
                $before['snappay'] = $oldVal;
                $after['snappay']  = $newVal;
                $diffs[] = ['field' => $adapters['snappay']->getLabel(), 'old' => $oldVal ? 'فعال' : 'غیرفعال', 'new' => $newVal ? 'فعال' : 'غیرفعال'];
            }
        }
        if (!empty($torobPayAction) && $torobPayAction !== 'none' && isset($adapters['torob_pay'])) {
            $oldVal = $adapters['torob_pay']->getValue($product);
            $newVal = ($torobPayAction === 'enable');
            if ($oldVal !== $newVal) {
                $before['torob_pay'] = $oldVal;
                $after['torob_pay']  = $newVal;
                $diffs[] = ['field' => $adapters['torob_pay']->getLabel(), 'old' => $oldVal ? 'فعال' : 'غیرفعال', 'new' => $newVal ? 'فعال' : 'غیرفعال'];
            }
        }

        // Coupon / Discount Code (کد تخفیف اختصاصی یا کوپن ووکامرس)
        $couponAction = $operations['coupon_action'] ?? $operations['couponAction'] ?? 'none';
        $couponCode   = trim($operations['coupon_code'] ?? $operations['couponCode'] ?? '');
        if (!empty($couponAction) && $couponAction !== 'none') {
            $curCoupon = (string) ($product->get_meta('_coupon_code', true) ?: $product->get_meta('coupon_code', true) ?: '');
            $targetCoupon = ($couponAction === 'set_code') ? $couponCode : '';
            if ($curCoupon !== $targetCoupon) {
                $before['coupon_code'] = $curCoupon ?: 'بدون کد تخفیف';
                $after['coupon_code']  = $targetCoupon ?: 'حذف کد تخفیف';
                $diffs[] = ['field' => 'کد تخفیف (Coupon Code)', 'old' => $before['coupon_code'], 'new' => $after['coupon_code']];
            }
        }

        // 7. Brand (برند محصول بر اساس تاکسونومی یا ویژگی)
        $brandAction = $operations['brand_action'] ?? $operations['brandAction'] ?? 'none';
        $brandValue  = $operations['brand_value'] ?? $operations['brandValue'] ?? '';
        if (!empty($brandAction) && $brandAction !== 'none') {
            $brandSource   = get_option('wc_bpe_brand_source', 'taxonomy');
            $brandTaxonomy = get_option('wc_bpe_brand_taxonomy', 'product_brand');
            $brandAttribute= get_option('wc_bpe_brand_attribute', 'pa_brands');

            $curBrand = '';
            if ($brandSource === 'taxonomy') {
                $terms = wp_get_post_terms($product->get_id(), [$brandTaxonomy, 'product_brand']);
                if (!is_wp_error($terms) && !empty($terms)) {
                    $curBrand = $terms[0]->name;
                }
                if (empty($curBrand)) {
                    $curBrand = (string) $product->get_meta('_product_brand', true);
                }
            } else {
                $curBrand = (string) $product->get_attribute($brandAttribute);
                if (empty($curBrand)) {
                    $curBrand = (string) $product->get_attribute('pa_brand');
                }
            }
            if (empty($curBrand)) {
                $curBrand = (string) $product->get_meta('_product_brand', true);
            }

            $targetBrand = ($brandAction === 'set_term') ? $brandValue : '';
            if ($curBrand !== $targetBrand) {
                $before['brand'] = $curBrand ?: 'تنظیم نشده';
                $after['brand']  = $targetBrand ?: 'حذف برند';
                $diffs[] = ['field' => 'برند محصول', 'old' => $before['brand'], 'new' => $after['brand']];
            }
        }

        // 8. Price Range (pa_price-range)
        $priceRangeAction = $operations['price_range_action'] ?? $operations['priceRangeAction'] ?? 'none';
        $priceRangeValue  = $operations['price_range_value'] ?? $operations['priceRangeValue'] ?? '';
        if (!empty($priceRangeAction) && $priceRangeAction !== 'none') {
            $curPR = (string) $product->get_attribute('pa_price-range');
            $newPR = ($priceRangeAction === 'remove') ? '' : $priceRangeValue;
            if ($curPR !== $newPR) {
                $before['price_range'] = $curPR ?: 'تنظیم نشده';
                $after['price_range']  = $newPR ?: 'حذف ویژگی';
                $diffs[] = ['field' => 'ویژگی محدوده قیمت', 'old' => $before['price_range'], 'new' => $after['price_range']];
            }
        }

        // 9. Custom Attributes (Color, Size, Warranty, etc.)
        $customAttrAction = $operations['custom_attribute_action'] ?? $operations['customAttributeAction'] ?? 'none';
        $customAttrName   = trim($operations['custom_attribute_name'] ?? $operations['customAttributeName'] ?? '');
        $customAttrValue  = trim($operations['custom_attribute_value'] ?? $operations['customAttributeValue'] ?? '');
        $customAttrSearch = trim($operations['custom_attribute_search_value'] ?? $operations['customAttributeSearchValue'] ?? '');
        if (!empty($customAttrAction) && $customAttrAction !== 'none' && !empty($customAttrName)) {
            $curVal = (string) $product->get_attribute($customAttrName);
            $newVal = '';
            if ($customAttrAction === 'remove') {
                $newVal = '';
            } elseif ($customAttrAction === 'set_term') {
                $newVal = $customAttrValue;
            } elseif ($customAttrAction === 'replace_term') {
                $newVal = str_replace($customAttrSearch, $customAttrValue, $curVal);
            }
            if ($curVal !== $newVal) {
                $before['attr_' . $customAttrName] = $curVal ?: 'تنظیم نشده';
                $after['attr_' . $customAttrName]  = $newVal ?: 'حذف ویژگی';
                $diffs[] = ['field' => 'ویژگی: ' . $customAttrName, 'old' => $before['attr_' . $customAttrName], 'new' => $after['attr_' . $customAttrName]];
            }
        }

        return [
            'has_changes' => !empty($diffs),
            'diffs'       => $diffs,
            'before'      => $before,
            'after'       => $after
        ];
    }
}
