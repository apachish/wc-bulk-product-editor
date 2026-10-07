<?php
declare(strict_types=1);

namespace WCBulkEditor\Processor;

use WCBulkEditor\Engine\ChangeSetEngine;
use WCBulkEditor\Integrations\AdapterRegistry;
use WC_Product;

if (!defined('ABSPATH')) {
    exit;
}

class BatchProcessor {
    /**
     * Apply changes to a single product using WooCommerce CRUD API
     */
    public static function applyToProduct(int $productId, array $operations, string $operationId): array {


        global $wpdb;
        $product = wc_get_product($productId);
        if (!$product) {
            return ['success' => false, 'error' => "محصول با شناسه {$productId} یافت نشد."];
        }

        // Generate diff using identical engine
        $diff = ChangeSetEngine::generateDiff($product, $operations);
        if (!$diff['has_changes']) {
            return ['success' => true, 'skipped' => true, 'product_id' => $productId];
        }

        try {
            // Apply Regular Price
            if (isset($diff['after']['regular_price'])) {
                $product->set_regular_price((string) $diff['after']['regular_price']);
            }
            // Apply Sale Price
            if (isset($diff['after']['sale_price'])) {
                $product->set_sale_price($diff['after']['sale_price'] !== '' ? (string) $diff['after']['sale_price'] : '');
            }
            // Apply Post Status
            if (isset($diff['after']['status'])) {
                $product->set_status((string) $diff['after']['status']);
            }
            // Apply Manage Stock & Stock Quantity
            $isManagingStock = $product->managing_stock();
            if (isset($diff['after']['manage_stock'])) {
                $isManagingStock = (bool) $diff['after']['manage_stock'];
                $product->set_manage_stock($isManagingStock);
                if (!$isManagingStock) {
                    // هنگام غیرفعال‌سازی مدیریت موجودی، کالا ناموجود شود ولی موجودی حفظ گردد
                    $product->set_stock_status('outofstock');
                    update_post_meta($productId, '_stop_selling', $product['stock_quantity'] );

                }else{
                    delete_post_meta($productId, '_stop_selling');

                }
            }
            if (isset($diff['after']['stock_quantity'])) {
                $qty = (int) $diff['after']['stock_quantity'];
                update_post_meta($productId, '_stock', $qty);
                $product->set_stock_quantity($qty);
                if ($isManagingStock) {
                    $product->set_stock_status(($qty > 0) ? 'instock' : 'outofstock');
                }
            }
            // Apply Stock Status Override
            if (isset($diff['after']['stock_status'])) {
//                $product->set_stock_status((string) $diff['after']['stock_status']);
//                if($diff['after']['stock_status'] == 'outofstock')
//                    update_post_meta($productId, '_stop_selling', $product['stock_quantity'] );
//                else
//                    delete_post_meta($productId, '_stop_selling');
                if (in_array($diff['after']['stock_status'], ['instock', 'outofstock', 'onbackorder'], true)) {
                    if ($diff['after']['stock_status'] === 'outofstock') {
                        $product->set_stock_status('outofstock');
                        $product->set_manage_stock(false);

                        update_post_meta($productId, '_stop_selling', $product->get_stock_quantity());

                    } else {
                        $product->set_manage_stock(true);

                        $product->set_stock_status('instock');
                        delete_post_meta($productId, '_stop_selling');
                    }
                }

            }

            // Apply Adapter Values (Snappay, Torob, etc.)
            $adapters = AdapterRegistry::getAdapters();
            foreach ($adapters as $key => $adapter) {
                if (isset($diff['after'][$key])) {
                    $adapter->setValue($product, (bool) $diff['after'][$key]);
                }
            }

            // Apply Brand (برند محصول به همراه پشتیبانی کامل از ویژگی‌های محصول و تاکسونومی)
            if (isset($diff['after']['brand'])) {
                $bVal = ($diff['after']['brand'] === 'حذف برند') ? '' : $diff['after']['brand'];
                self::saveProductBrand($product, $bVal);
            }

            // Apply Coupon Code (کد تخفیف اختصاصی یا کوپن ووکامرس)
            if (isset($diff['after']['coupon_code'])) {
                $cVal = ($diff['after']['coupon_code'] === 'حذف کد تخفیف') ? '' : $diff['after']['coupon_code'];
                $product->update_meta_data('_coupon_code', $cVal);
                $product->update_meta_data('coupon_code', $cVal);
                if (!empty($cVal)) {
                    $couponObj = new WC_Coupon($cVal);
                    if ($couponObj->get_id()) {
                        $pIds = $couponObj->get_product_ids();
                        if (!in_array($productId, $pIds, true)) {
                            $pIds[] = $productId;
                            $couponObj->set_product_ids($pIds);
                            $couponObj->save();
                        }
                    }
                }
            }

            // Apply Price Range
            if (isset($diff['after']['price_range'])) {
                $prVal = ($diff['after']['price_range'] === 'حذف ویژگی') ? '' : $diff['after']['price_range'];
                if (taxonomy_exists('pa_price-range')) {
                    wp_set_object_terms($productId, $prVal ? [$prVal] : [], 'pa_price-range');
                }
            }

            // Save via WooCommerce CRUD
            $product->save();

            // Record snapshot in items audit table
            $wpdb->insert(
                $wpdb->prefix . 'wc_bpe_operation_items',
                [
                    'operation_id'    => $operationId,
                    'product_id'      => $productId,
                    'parent_id'       => $product->get_parent_id() ?: null,
                    'sku'             => $product->get_sku() ?: '',
                    'before_snapshot' => wp_json_encode($diff['before'], JSON_UNESCAPED_UNICODE),
                    'after_snapshot'  => wp_json_encode($diff['after'], JSON_UNESCAPED_UNICODE),
                    'created_at'      => current_time('mysql')
                ]
            );

            return ['success' => true, 'product_id' => $productId];
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => $e->getMessage(), 'product_id' => $productId];
        }
    }

    /**
     * ذخیره دقیق برند چه به صورت ویژگی ووکامرس (Attributes) و چه به صورت تاکسونومی اختصاصی
     */
    public static function saveProductBrand(WC_Product $product, string $brandName): void {

        $productId = $product->get_id();
        $brandName = trim($brandName);
        $brandSource = get_option('wc_bpe_brand_source', 'taxonomy');
        $brandTaxonomy = get_option('wc_bpe_brand_taxonomy', 'product_brand');
        $brandAttr = get_option('wc_bpe_brand_attribute', 'pa_brands');

        // همیشه متای استاندارد ذخیره شود
        $product->update_meta_data('_product_brand', $brandName);
        $product->update_meta_data('brand', $brandName);

        if (empty($brandName)) {
            $taxonomiesToClear = array_unique([$brandTaxonomy, 'product_brand', 'pwb-brand', 'yith_product_brand', $brandAttr, 'pa_brands', 'pa_brand']);
            foreach ($taxonomiesToClear as $tax) {
                if (taxonomy_exists($tax)) {
                    wp_set_object_terms($productId, [], $tax);
                }
            }
            $attrs = (array) $product->get_attributes();
            foreach ([$brandAttr, 'pa_brands', 'pa_brand', 'brand', 'برند'] as $k) {
                unset($attrs[$k]);
            }
            $product->set_attributes($attrs);
            return;
        }

        if ($brandSource === 'taxonomy') {
            $taxToUse = taxonomy_exists($brandTaxonomy) ? $brandTaxonomy : (taxonomy_exists('product_brand') ? 'product_brand' : (taxonomy_exists('pwb-brand') ? 'pwb-brand' : null));
            if ($taxToUse) {
                $term = get_term_by('name', $brandName, $taxToUse) ?: get_term_by('slug', sanitize_title($brandName), $taxToUse);
                if (!$term) {
                    $newTerm = wp_insert_term($brandName, $taxToUse);
                    $termId = (!is_wp_error($newTerm) && isset($newTerm['term_id'])) ? (int) $newTerm['term_id'] : null;
                } else {
                    $termId = (int) $term->term_id;
                }
                if ($termId) {
                    wp_set_object_terms($productId, [$termId], $taxToUse, false);
                }
            }
        } else {
            // منبع برند: ویژگی محصول (Product Attributes مانند pa_brands / pa_brand یا ویژگی دلخواه)
            $attrTaxToUse = taxonomy_exists($brandAttr) ? $brandAttr : (taxonomy_exists('pa_brands') ? 'pa_brands' : (taxonomy_exists('pa_brand') ? 'pa_brand' : null));

            if ($attrTaxToUse) {
                $term = get_term_by('name', $brandName, $attrTaxToUse) ?: get_term_by('slug', sanitize_title($brandName), $attrTaxToUse);
                if (!$term) {
                    $newTerm = wp_insert_term($brandName, $attrTaxToUse);
                    $termId = (!is_wp_error($newTerm) && isset($newTerm['term_id'])) ? (int) $newTerm['term_id'] : null;
                } else {
                    $termId = (int) $term->term_id;
                }
                if ($termId) {
                    wp_set_object_terms($productId, [$termId], $attrTaxToUse, false);
                }

                // ثبت مستقیم در _product_attributes ووکامرس جهت نمایش کامل در تب ویژگی‌ها و فیلترهای فروشگاه
                $attrs = (array) $product->get_attributes();
                $attrObj = new WC_Product_Attribute();
                $attrId = function_exists('wc_attribute_taxonomy_id_by_name') ? wc_attribute_taxonomy_id_by_name($attrTaxToUse) : 0;
                $attrObj->set_id($attrId);
                $attrObj->set_name($attrTaxToUse);
                $attrObj->set_options($termId ? [$termId] : []);
                $attrObj->set_position(0);
                $attrObj->set_visible(true);
                $attrObj->set_variation(false);
                $attrs[$attrTaxToUse] = $attrObj;
                $product->set_attributes($attrs);
            } else {
                // ویژگی سفارشی محصول (Custom non-taxonomy attribute)
                $attrs = (array) $product->get_attributes();
                $attrName = !empty($brandAttr) ? str_replace('pa_', '', $brandAttr) : 'برند';
                $attrObj = new WC_Product_Attribute();
                $attrObj->set_name($attrName);
                $attrObj->set_options([$brandName]);
                $attrObj->set_position(0);
                $attrObj->set_visible(true);
                $attrObj->set_variation(false);
                $attrs[$attrName] = $attrObj;
                $product->set_attributes($attrs);
            }
        }
    }
}
