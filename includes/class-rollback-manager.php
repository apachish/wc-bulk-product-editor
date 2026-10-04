<?php
declare(strict_types=1);

namespace WCBulkEditor\Rollback;

use WCBulkEditor\Integrations\AdapterRegistry;
use WCBulkEditor\Database\Activator;

if (!defined('ABSPATH')) {
    exit;
}

class RollbackManager {
    /**
     * Rollback an operation by its UUID safely
     */
    public static function rollbackOperation(string $operationId): array {
        global $wpdb;
        Activator::ensureTablesExist();

        $itemsTable = $wpdb->prefix . 'wc_bpe_operation_items';
        $opsTable   = $wpdb->prefix . 'wc_bpe_operations';

        $allItems = $wpdb->get_results(
            $wpdb->prepare("SELECT * FROM {$itemsTable} WHERE operation_id = %s", $operationId)
        );

        if (empty($allItems)) {
            return ['success' => false, 'message' => "هیچ آیتمی برای شناسه عملیات {$operationId} در پایگاه داده یافت نشد."];
        }

        $items = array_filter($allItems, function($it) {
            return empty($it->is_rolled_back);
        });

        if (empty($items)) {
            return ['success' => false, 'message' => 'این عملیات قبلاً به صورت کامل بازگردانی (Rollback) شده است.'];
        }

        $restored = 0;
        $errors   = [];

        foreach ($items as $item) {
            $productId = (int) $item->product_id;
            $product   = wc_get_product($productId);
            if (!$product) {
                $errors[] = "محصول {$productId} یافت نشد.";
                continue;
            }

            $before = json_decode($item->before_snapshot, true);
            if (!is_array($before)) {
                continue;
            }

            if (isset($before['name'])) {
                $product->set_name((string) $before['name']);
            }
            if (isset($before['sku'])) {
                $product->set_sku((string) $before['sku']);
            }
            if (isset($before['regular_price'])) {
                $product->set_regular_price((string) $before['regular_price']);
            }
            if (array_key_exists('sale_price', $before)) {
                $product->set_sale_price($before['sale_price'] !== '' && $before['sale_price'] !== null ? (string) $before['sale_price'] : '');
            }
            if (isset($before['status'])) {
                $product->set_status((string) $before['status']);
            }
            if (isset($before['manage_stock'])) {
                $product->set_manage_stock((bool) $before['manage_stock']);
            }
            if (isset($before['stock_quantity'])) {
                $qty = (int) $before['stock_quantity'];
                update_post_meta($productId, '_stock', $qty);
                $product->set_stock_quantity($qty);
                if (empty($before['stock_status'])) {
                    $product->set_stock_status($qty > 0 ? 'instock' : 'outofstock');
                }
            }
            if (isset($before['stock_status'])) {
                $product->set_stock_status((string) $before['stock_status']);
            }

            // Restore _stop_selling
            if (array_key_exists('stop_selling', $before)) {
                if ($before['stop_selling'] !== '' && $before['stop_selling'] !== null && $before['stop_selling'] !== false) {
                    update_post_meta($productId, '_stop_selling', $before['stop_selling']);
                } else {
                    delete_post_meta($productId, '_stop_selling');
                }
            }

            // Restore Brand
            if (isset($before['brand'])) {
                $b = ($before['brand'] === 'تنظیم نشده' || $before['brand'] === 'حذف برند') ? '' : (string) $before['brand'];
                BatchProcessor::saveProductBrand($product, $b);
            }

            // Restore Coupon Code
            if (isset($before['coupon_code'])) {
                $c = ($before['coupon_code'] === 'بدون کد تخفیف' || $before['coupon_code'] === 'حذف کد تخفیف') ? '' : (string) $before['coupon_code'];
                $product->update_meta_data('_coupon_code', $c);
                $product->update_meta_data('coupon_code', $c);
            }

            // Restore Descriptions
            if (isset($before['description'])) {
                $product->set_description((string) $before['description']);
            }
            if (isset($before['short_description'])) {
                $product->set_short_description((string) $before['short_description']);
            }

            // Restore adapter meta values
            $adapters = AdapterRegistry::getAdapters();
            foreach ($adapters as $key => $adapter) {
                if (isset($before[$key])) {
                    $adapter->setValue($product, (bool) $before[$key]);
                }
            }

            $product->save();

            // Mark item as rolled back
            $wpdb->update(
                $itemsTable,
                ['is_rolled_back' => 1],
                ['id' => $item->id]
            );
            $restored++;
        }

        // Update main operation status
        $wpdb->update(
            $opsTable,
            ['status' => 'rolled_back', 'rolled_back_at' => current_time('mysql')],
            ['id' => $operationId]
        );

        return [
            'success'  => true,
            'restored' => $restored,
            'errors'   => $errors
        ];
    }
}
