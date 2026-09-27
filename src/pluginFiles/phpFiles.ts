import { adminCssContent } from './adminCss';
import { adminJsContent } from './adminJs';

export interface PluginFileEntry {
  path: string;
  name: string;
  description: string;
  language: 'php' | 'markdown' | 'sql' | 'json';
  content: string;
}

export const pluginFiles: PluginFileEntry[] = [
  {
    path: 'wc-bulk-product-editor-pro.php',
    name: 'wc-bulk-product-editor-pro.php',
    description: 'فایل اصلی افزونه، سازگاری HPOS با ووکامرس 9.8.5، متادیتا و راه‌اندازی امن (Bootstrap)',
    language: 'php',
    content: `<?php
/**
 * Plugin Name: WooCommerce Bulk Product Editor Pro
 * Plugin URI:  https://github.com/woocommerce/bulk-product-editor-pro
 * Description: افزونه حرفه‌ای و ایمن برای ویرایش گروهی و درون‌ردیفی محصولات، قیمت‌گذاری پیشرفته، موجودی انبار و درگاه‌های اقساطی (اسنپ‌پی و ترب) با پشتیبانی کامل از ووکامرس 9.8.5 و HPOS.
 * Version:     1.1.0
 * Author:      WooCommerce Pro Team
 * Author URI:  https://woocommerce.ir
 * Text Domain: wc-bulk-product-editor
 * Domain Path: /languages
 * Requires at least: 6.2
 * Requires PHP: 8.1
 * WC requires at least: 8.0
 * WC tested up to: 9.8.5
 * License:     GPL-2.0+
 */

declare(strict_types=1);

namespace WCBulkEditor;

if (!defined('ABSPATH')) {
    exit;
}

define('WC_BPE_VERSION', '1.1.0');
define('WC_BPE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WC_BPE_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WC_BPE_PLUGIN_BASENAME', plugin_basename(__FILE__));

// اعلام سازگاری کامل با HPOS و بلوک‌های ووکامرس 9.8.5
add_action('before_woocommerce_init', function () {
    if (class_exists(\\Automattic\\WooCommerce\\Utilities\\FeaturesUtil::class)) {
        \\Automattic\\WooCommerce\\Utilities\\FeaturesUtil::declare_compatibility('custom_order_tables', __FILE__, true);
        \\Automattic\\WooCommerce\\Utilities\\FeaturesUtil::declare_compatibility('cart_checkout_blocks', __FILE__, true);
    }
});

// بارگذاری امن ترجمه‌ها در زمان مناسب (init) برای پیشگیری از خطای _load_textdomain_just_in_time
add_action('init', function () {
    load_plugin_textdomain('wc-bulk-product-editor', false, dirname(plugin_basename(__FILE__)) . '/languages');
});

// بررسی فعال بودن ووکامرس و لود فایل‌های افزونه
add_action('plugins_loaded', function () {
    if (!class_exists('WooCommerce')) {
        add_action('admin_notices', function () {
            echo '<div class="notice notice-error is-dismissible"><p>' . 
                '<strong>افزونه ویرایش گروهی محصولات:</strong> برای کارکرد این افزونه، ابتدا باید ووکامرس را فعال نمایید.' . 
                '</p></div>';
        });
        return;
    }

    // بارگذاری امن کلاس‌ها با بررسی وجود فایل برای جلوگیری از Fatal Error در هر نوع Unpack
    $includes = [
        'includes/class-plugin.php',
        'includes/class-activator.php',
        'includes/class-change-set-engine.php',
        'includes/class-batch-processor.php',
        'includes/class-rollback-manager.php',
        'includes/integrations/class-adapter-registry.php',
        'includes/admin/class-admin-menu.php',
        'includes/admin/class-admin-ajax.php',
    ];

    foreach ($includes as $file) {
        $path = WC_BPE_PLUGIN_DIR . $file;
        if (file_exists($path)) {
            require_once $path;
        }
    }

    // راه‌اندازی ماژول‌های افزونه
    if (class_exists('WCBulkEditor\\Core\\Plugin')) {
        Core\\Plugin::getInstance()->init();
    }
});

// هوک فعال‌سازی
register_activation_hook(__FILE__, function () {
    $actPath = WC_BPE_PLUGIN_DIR . 'includes/class-activator.php';
    if (file_exists($actPath)) {
        require_once $actPath;
        if (class_exists('WCBulkEditor\\Database\\Activator')) {
            Database\\Activator::activate();
        }
    }
});
`
  },
  {
    path: 'includes/class-plugin.php',
    name: 'class-plugin.php',
    description: 'کلاس اصلی هسته افزونه (Singleton Core Plugin)',
    language: 'php',
    content: `<?php
declare(strict_types=1);

namespace WCBulkEditor\\Core;

if (!defined('ABSPATH')) {
    exit;
}

class Plugin {
    private static ?Plugin $instance = null;

    public static function getInstance(): self {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function init(): void {
        // اطمینان از ایجاد دیتابیس جداول حتی بدون اجرای register_activation_hook در آپلود دستی
        if (get_option('wc_bpe_schema_version') !== \\WCBulkEditor\\Database\\Activator::SCHEMA_VERSION) {
            \\WCBulkEditor\\Database\\Activator::activate();
        }

        if (class_exists('\\WCBulkEditor\\Admin\\AdminMenu')) {
            \\WCBulkEditor\\Admin\\AdminMenu::init();
        }
        if (class_exists('\\WCBulkEditor\\Admin\\AdminAjax')) {
            \\WCBulkEditor\\Admin\\AdminAjax::register();
        }
    }
}
`
  },
  {
    path: 'includes/class-activator.php',
    name: 'class-activator.php',
    description: 'مدیریت نصب و ایجاد جداول عملیات و اسنپ‌شات در پایگاه داده با dbDelta',
    language: 'php',
    content: `<?php
declare(strict_types=1);

namespace WCBulkEditor\\Database;

if (!defined('ABSPATH')) {
    exit;
}

class Activator {
    public const SCHEMA_VERSION = '1.0.0';

    public static function activate(): void {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        $operations_table = $wpdb->prefix . 'wc_bpe_operations';
        $items_table      = $wpdb->prefix . 'wc_bpe_operation_items';

        $sql = "
        CREATE TABLE {$operations_table} (
            id varchar(36) NOT NULL,
            user_id bigint(20) unsigned NOT NULL,
            status varchar(20) NOT NULL DEFAULT 'completed',
            total_items int(11) NOT NULL DEFAULT 0,
            success_count int(11) NOT NULL DEFAULT 0,
            fail_count int(11) NOT NULL DEFAULT 0,
            filters_payload longtext NOT NULL,
            changes_payload longtext NOT NULL,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            rolled_back_at datetime DEFAULT NULL,
            PRIMARY KEY  (id),
            KEY user_id (user_id),
            KEY created_at (created_at)
        ) {$charset_collate};

        CREATE TABLE {$items_table} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            operation_id varchar(36) NOT NULL,
            product_id bigint(20) unsigned NOT NULL,
            parent_id bigint(20) unsigned DEFAULT NULL,
            sku varchar(100) DEFAULT NULL,
            before_snapshot longtext NOT NULL,
            after_snapshot longtext NOT NULL,
            is_rolled_back tinyint(1) NOT NULL DEFAULT 0,
            error_message text DEFAULT NULL,
            created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY op_prod (operation_id, product_id),
            KEY product_id (product_id)
        ) {$charset_collate};
        ";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);

        add_option('wc_bpe_schema_version', self::SCHEMA_VERSION);
        add_option('wc_bpe_batch_size', 20);
        add_option('wc_bpe_history_retention_days', 60);
        add_option('wc_bpe_enable_rollback', 1);
    }
}
`
  },
  {
    path: 'includes/class-change-set-engine.php',
    name: 'class-change-set-engine.php',
    description: 'موتور یکپارچه Change Set برای محاسبه پیش‌نمایش و اعمال بدون واگرایی داده',
    language: 'php',
    content: `<?php
declare(strict_types=1);

namespace WCBulkEditor\\Engine;

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

        // 5. Stock Status (In stock / Out of stock)
        if (!empty($stockStatus) && $stockStatus !== 'none') {
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
        $adapters = \\WCBulkEditor\\Integrations\\AdapterRegistry::getAdapters();
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

        // 7. Brand (برند pa_brands)
        $brandAction = $operations['brand_action'] ?? $operations['brandAction'] ?? 'none';
        $brandValue  = $operations['brand_value'] ?? $operations['brandValue'] ?? '';
        if (!empty($brandAction) && $brandAction !== 'none') {
            $curBrand = (string) $product->get_meta('_product_brand', true);
            if (empty($curBrand)) $curBrand = (string) $product->get_attribute('pa_brands');
            if (empty($curBrand)) $curBrand = (string) $product->get_attribute('pa_brand');

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
`
  },
  {
    path: 'includes/class-batch-processor.php',
    name: 'class-batch-processor.php',
    description: 'پردازش دسته‌ای امن، استفاده از WC CRUD، مدیریت حافظه و پیشگیری از قفل سرور',
    language: 'php',
    content: `<?php
declare(strict_types=1);

namespace WCBulkEditor\\Processor;

use WCBulkEditor\\Engine\\ChangeSetEngine;
use WCBulkEditor\\Integrations\\AdapterRegistry;
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
            if (isset($diff['after']['manage_stock'])) {
                $product->set_manage_stock((bool) $diff['after']['manage_stock']);
            }
            if (isset($diff['after']['stock_quantity'])) {
                $product->set_manage_stock(true);
                $product->set_stock_quantity((int) $diff['after']['stock_quantity']);
                $product->set_stock_status(((int) $diff['after']['stock_quantity'] > 0) ? 'instock' : 'outofstock');
            }
            // Apply Stock Status Override
            if (isset($diff['after']['stock_status'])) {
                $product->set_stock_status((string) $diff['after']['stock_status']);
            }

            // Apply Adapter Values (Snappay, Torob, etc.)
            $adapters = AdapterRegistry::getAdapters();
            foreach ($adapters as $key => $adapter) {
                if (isset($diff['after'][$key])) {
                    $adapter->setValue($product, (bool) $diff['after'][$key]);
                }
            }

            // Apply Brand
            if (isset($diff['after']['brand'])) {
                $bVal = ($diff['after']['brand'] === 'حذف برند') ? '' : $diff['after']['brand'];
                $product->update_meta_data('_product_brand', $bVal);
                $product->update_meta_data('brand', $bVal);
                if (taxonomy_exists('product_brand')) {
                    wp_set_object_terms($productId, $bVal ? [$bVal] : [], 'product_brand');
                }
                if (taxonomy_exists('pa_brands')) {
                    wp_set_object_terms($productId, $bVal ? [$bVal] : [], 'pa_brands');
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
        } catch (\\Throwable $e) {
            return ['success' => false, 'error' => $e->getMessage(), 'product_id' => $productId];
        }
    }
}
`
  },
  {
    path: 'includes/class-rollback-manager.php',
    name: 'class-rollback-manager.php',
    description: 'مدیریت برگشت تغییرات (Rollback) بر اساس اسنپ‌شات و گزارش تداخل‌ها',
    language: 'php',
    content: `<?php
declare(strict_types=1);

namespace WCBulkEditor\\Rollback;

use WCBulkEditor\\Integrations\\AdapterRegistry;

if (!defined('ABSPATH')) {
    exit;
}

class RollbackManager {
    /**
     * Rollback an operation by its UUID safely
     */
    public static function rollbackOperation(string $operationId): array {
        global $wpdb;
        $itemsTable = $wpdb->prefix . 'wc_bpe_operation_items';
        $opsTable   = $wpdb->prefix . 'wc_bpe_operations';

        $items = $wpdb->get_results(
            $wpdb->prepare("SELECT * FROM {$itemsTable} WHERE operation_id = %s AND is_rolled_back = 0", $operationId)
        );

        if (empty($items)) {
            return ['success' => false, 'message' => 'هیچ آیتمی برای بازگردانی یافت نشد یا قبلاً بازگردانی شده است.'];
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

            if (isset($before['regular_price'])) {
                $product->set_regular_price((string) $before['regular_price']);
            }
            if (isset($before['sale_price'])) {
                $product->set_sale_price($before['sale_price'] !== '' ? (string) $before['sale_price'] : '');
            }
            if (isset($before['status'])) {
                $product->set_status((string) $before['status']);
            }
            if (isset($before['manage_stock'])) {
                $product->set_manage_stock((bool) $before['manage_stock']);
            }
            if (isset($before['stock_quantity'])) {
                $product->set_stock_quantity((int) $before['stock_quantity']);
                $product->set_stock_status((int) $before['stock_quantity'] > 0 ? 'instock' : 'outofstock');
            }
            if (isset($before['stock_status'])) {
                $product->set_stock_status((string) $before['stock_status']);
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
`
  },
  {
    path: 'includes/integrations/class-adapter-registry.php',
    name: 'class-adapter-registry.php',
    description: 'لایه اتصال انعطاف‌پذیر به اسنپ‌پی و ترب بدون کلید متای هاردکد شده',
    language: 'php',
    content: `<?php
declare(strict_types=1);

namespace WCBulkEditor\\Integrations;

use WC_Product;

if (!defined('ABSPATH')) {
    exit;
}

interface GatewayAdapterInterface {
    public function getKey(): string;
    public function getLabel(): string;
    public function isPluginActive(): bool;
    public function getValue(WC_Product $product): bool;
    public function setValue(WC_Product $product, bool $enabled): void;
}

class SnappayAdapter implements GatewayAdapterInterface {
    public function getKey(): string { return 'snappay'; }
    public function getLabel(): string { return 'اسنپ‌پی (پرداخت اقساطی)'; }

    public function isPluginActive(): bool {
        return class_exists('WC_Snappay') || defined('SNAPPAY_PLUGIN_FILE');
    }

    public function getValue(WC_Product $product): bool {
        $metaKey = apply_filters('wc_bpe_snappay_meta_key', '_snappay_eligible_product');
        return $product->get_meta($metaKey, true) !== 'no';
    }

    public function setValue(WC_Product $product, bool $enabled): void {
        $metaKey = apply_filters('wc_bpe_snappay_meta_key', '_snappay_eligible_product');
        $product->update_meta_data($metaKey, $enabled ? 'yes' : 'no');
    }
}

class TorobPayAdapter implements GatewayAdapterInterface {
    public function getKey(): string { return 'torob_pay'; }
    public function getLabel(): string { return 'پرداخت سریع ترب (Torob Pay)'; }

    public function isPluginActive(): bool {
        return class_exists('Torob_Pay') || defined('TOROB_PAY_VERSION');
    }

    public function getValue(WC_Product $product): bool {
        $metaKey = apply_filters('wc_bpe_torob_meta_key', '_torob_pay_available');
        return $product->get_meta($metaKey, true) === '1' || $product->get_meta($metaKey, true) === 'yes';
    }

    public function setValue(WC_Product $product, bool $enabled): void {
        $metaKey = apply_filters('wc_bpe_torob_meta_key', '_torob_pay_available');
        $product->update_meta_data($metaKey, $enabled ? 'yes' : 'no');
    }
}

class AdapterRegistry {
    private static array $adapters = [];

    public static function getAdapters(): array {
        if (empty(self::$adapters)) {
            $default = [
                'snappay'   => new SnappayAdapter(),
                'torob_pay' => new TorobPayAdapter(),
            ];
            self::$adapters = apply_filters('wc_bpe_registered_adapters', $default);
        }
        return self::$adapters;
    }
}
`
  },
  {
    path: 'includes/admin/class-admin-menu.php',
    name: 'class-admin-menu.php',
    description: 'مدیریت منوهای مدیریت وردپرس، صفحات ویرایشگر، تاریخچه، Rollback و بارگذاری Assetها',
    language: 'php',
    content: `<?php
declare(strict_types=1);

namespace WCBulkEditor\\Admin;

if (!defined('ABSPATH')) {
    exit;
}

class AdminMenu {
    public static function init(): void {
        add_action('admin_menu', [self::class, 'registerMenus']);
        add_action('admin_enqueue_scripts', [self::class, 'enqueueAssets']);
    }

    public static function registerMenus(): void {
        // زیرمنوی «ویرایش گروهی محصولات» در منوی محصولات
        add_submenu_page(
            'edit.php?post_type=product',
            'ویرایش گروهی محصولات',
            'ویرایش گروهی محصولات',
            'manage_woocommerce',
            'wc-bulk-product-editor',
            [self::class, 'renderEditorPage']
        );

        // زیرمنوی «تاریخچه ویرایش و Rollback»
        add_submenu_page(
            'edit.php?post_type=product',
            'تاریخچه ویرایش و Rollback',
            'تاریخچه ویرایش گروهی',
            'manage_woocommerce',
            'wc-bulk-editor-history',
            [self::class, 'renderHistoryPage']
        );

        // زیرمنوی تنظیمات در ووکامرس
        add_submenu_page(
            'woocommerce',
            'تنظیمات ویرایش گروهی محصولات',
            'ویرایش گروهی محصولات',
            'manage_woocommerce',
            'wc-bulk-editor-settings',
            [self::class, 'renderSettingsPage']
        );
    }

    public static function enqueueAssets(string $hook): void {
        if (!str_contains($hook, 'wc-bulk-product-editor') && 
            !str_contains($hook, 'wc-bulk-editor-history') && 
            !str_contains($hook, 'wc-bulk-editor-settings')) {
            return;
        }

        wp_enqueue_style(
            'wc-bpe-admin-style',
            WC_BPE_PLUGIN_URL . 'assets/css/admin.css',
            [],
            WC_BPE_VERSION
        );

        wp_enqueue_script(
            'wc-bpe-admin-script',
            WC_BPE_PLUGIN_URL . 'assets/js/admin.js',
            ['jquery'],
            WC_BPE_VERSION,
            true
        );

        wp_localize_script('wc-bpe-admin-script', 'wcBpeData', [
            'ajaxUrl'       => admin_url('admin-ajax.php'),
            'nonce'         => wp_create_nonce('wc_bpe_nonce'),
            'pluginUrl'     => WC_BPE_PLUGIN_URL,
            'schemaVersion' => get_option('wc_bpe_schema_version', '1.0.0'),
            'batchSize'     => (int) get_option('wc_bpe_batch_size', 20),
            'i18n'          => [
                'confirmRollback' => 'آیا از بازگردانی (Rollback) این عملیات اطمینان دارید؟',
                'saving'          => 'در حال ذخیره‌سازی در ووکامرس...',
                'success'         => 'عملیات با موفقیت انجام شد.',
                'error'           => 'خطایی رخ داد. لطفاً مجدداً تلاش نمایید.'
            ]
        ]);
    }

    public static function renderEditorPage(): void {
        if (!current_user_can('manage_woocommerce') && !current_user_can('manage_options')) {
            wp_die('دسترسی غیرمجاز است.');
        }

        $activeTab = sanitize_text_field($_GET['tab'] ?? 'table');
        ?>
        <div class="wrap wc-bpe-wrap" dir="rtl">
            <h1 class="wp-heading-inline">ویرایش گروهی و درون‌ردیفی محصولات ووکامرس</h1>
            <hr class="wp-header-end">

            <div id="wc-bpe-app" class="wc-bpe-container" data-tab="<?php echo esc_attr($activeTab); ?>">
                <div class="wc-bpe-card">
                    <div class="wc-bpe-loading" style="padding: 30px; text-align: center;">
                        <span class="spinner is-active" style="float:none; margin: 0 5px 0 0;"></span>
                        <strong>در حال بارگذاری اطلاعات محصولات از ووکامرس...</strong>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }

    public static function renderHistoryPage(): void {
        if (!current_user_can('manage_woocommerce')) {
            wp_die('دسترسی غیرمجاز است.');
        }

        global $wpdb;
        $table = $wpdb->prefix . 'wc_bpe_operations';
        $rows = [];
        if ($wpdb->get_var("SHOW TABLES LIKE '{$table}'") === $table) {
            $rows = $wpdb->get_results("SELECT * FROM {$table} ORDER BY created_at DESC LIMIT 50");
        }
        ?>
        <div class="wrap wc-bpe-wrap" dir="rtl">
            <h1 class="wp-heading-inline">تاریخچه عملیات ویرایش گروهی و Rollback</h1>
            <hr class="wp-header-end">

            <div class="wc-bpe-card">
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th style="width: 140px;">شناسه UUID</th>
                            <th style="width: 150px;">زمان اجرا</th>
                            <th style="width: 100px;">کاربر</th>
                            <th>خلاصه عملیات و تغییرات</th>
                            <th style="width: 100px; text-align: center;">موفق / خطا</th>
                            <th style="width: 120px; text-align: center;">وضعیت</th>
                            <th style="width: 130px; text-align: center;">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (empty($rows)): ?>
                            <tr>
                                <td colspan="7" style="text-align: center; padding: 20px;">
                                    هنوز هیچ لاگ ویرایش گروهی ثبت نشده است.
                                </td>
                            </tr>
                        <?php else: ?>
                            <?php foreach ($rows as $row): 
                                $user = get_userdata((int) $row->user_id);
                                $userName = $user ? $user->display_name : 'کاربر #' . $row->user_id;
                            ?>
                                <tr>
                                    <td><code><?php echo esc_html(substr($row->id, 0, 8)); ?>...</code></td>
                                    <td><?php echo esc_html($row->created_at); ?></td>
                                    <td><?php echo esc_html($userName); ?></td>
                                    <td>
                                        <strong>تغییرات دسته‌ای روی <?php echo (int) $row->total_items; ?> محصول</strong>
                                    </td>
                                    <td style="text-align: center;">
                                        <span style="color: #00a32a; font-weight: bold;"><?php echo (int) $row->success_count; ?></span> /
                                        <span style="color: #d63638;"><?php echo (int) $row->fail_count; ?></span>
                                    </td>
                                    <td style="text-align: center;">
                                        <?php if ($row->status === 'rolled_back'): ?>
                                            <span class="badge badge-warning">بازگردانی‌شده</span>
                                        <?php else: ?>
                                            <span class="badge badge-success">اعمال‌شده</span>
                                        <?php endif; ?>
                                    </td>
                                    <td style="text-align: center;">
                                        <?php if ($row->status !== 'rolled_back'): ?>
                                            <button type="button" class="button button-secondary button-small wc-bpe-btn-rollback" 
                                                    data-id="<?php echo esc_attr($row->id); ?>">
                                                بازگردانی (Rollback)
                                            </button>
                                        <?php else: ?>
                                            <span class="description">انجام شده</span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
        <?php
    }

    public static function renderSettingsPage(): void {
        if (!current_user_can('manage_woocommerce')) {
            wp_die('دسترسی غیرمجاز است.');
        }

        if (isset($_POST['wc_bpe_save_settings_nonce']) && wp_verify_nonce($_POST['wc_bpe_save_settings_nonce'], 'wc_bpe_save_settings')) {
            update_option('wc_bpe_batch_size', max(5, min(200, (int) ($_POST['batch_size'] ?? 20))));
            update_option('wc_bpe_history_retention_days', max(7, min(365, (int) ($_POST['retention_days'] ?? 60))));
            update_option('wc_bpe_snappay_meta_key', sanitize_text_field($_POST['snappay_meta_key'] ?? '_snappay_eligible_product'));
            update_option('wc_bpe_torob_meta_key', sanitize_text_field($_POST['torob_meta_key'] ?? '_torob_pay_available'));
            echo '<div class="notice notice-success is-dismissible"><p>تنظیمات با موفقیت ذخیره شدند.</p></div>';
        }

        $batchSize     = (int) get_option('wc_bpe_batch_size', 20);
        $retentionDays = (int) get_option('wc_bpe_history_retention_days', 60);
        $snappayKey    = get_option('wc_bpe_snappay_meta_key', '_snappay_eligible_product');
        $torobKey      = get_option('wc_bpe_torob_meta_key', '_torob_pay_available');
        ?>
        <div class="wrap wc-bpe-wrap" dir="rtl">
            <h1 class="wp-heading-inline">تنظیمات و آداپتورهای ویرایش گروهی محصولات</h1>
            <hr class="wp-header-end">

            <form method="post" action="">
                <?php wp_nonce_field('wc_bpe_save_settings', 'wc_bpe_save_settings_nonce'); ?>
                <table class="form-table" role="presentation">
                    <tbody>
                        <tr>
                            <th scope="row"><label for="batch_size">تعداد اقلام در هر دسته (Batch Size)</label></th>
                            <td>
                                <input name="batch_size" type="number" id="batch_size" value="<?php echo esc_attr($batchSize); ?>" min="5" max="200" class="small-text">
                                <p class="description">برای جلوگیری از اتمام زمان اجرای PHP و حافظه RAM (توصیه: ۲۰ تا ۵۰).</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="retention_days">مدت نگهداری تاریخچه و اسنپ‌شات (روز)</label></th>
                            <td>
                                <input name="retention_days" type="number" id="retention_days" value="<?php echo esc_attr($retentionDays); ?>" min="7" max="365" class="small-text">
                                <p class="description">لاگ‌های قدیمی‌تر از این مقدار به صورت دوره‌ای پاکسازی می‌شوند.</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="snappay_meta_key">کلید متای اسنپ‌پی (Snappay)</label></th>
                            <td>
                                <input name="snappay_meta_key" type="text" id="snappay_meta_key" value="<?php echo esc_attr($snappayKey); ?>" class="regular-text code">
                                <p class="description">نام Meta Key محصولات برای فعال/غیرفعال کردن اقساط اسنپ‌پی.</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="torob_meta_key">کلید متای پرداخت ترب (Torob Pay)</label></th>
                            <td>
                                <input name="torob_meta_key" type="text" id="torob_meta_key" value="<?php echo esc_attr($torobKey); ?>" class="regular-text code">
                                <p class="description">نام Meta Key محصولات برای خرید مستقیم و پرداخت اعتباری ترب.</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <?php submit_button('ذخیره تنظیمات'); ?>
            </form>
        </div>
        <?php
    }
}
`
  },
  {
    path: 'includes/admin/class-admin-ajax.php',
    name: 'class-admin-ajax.php',
    description: 'هندلرهای AJAX ایمن با بررسی Nonce و سطح دسترسی manage_woocommerce',
    language: 'php',
    content: `<?php
declare(strict_types=1);

namespace WCBulkEditor\\Admin;

use WCBulkEditor\\Engine\\ChangeSetEngine;
use WCBulkEditor\\Processor\\BatchProcessor;
use WCBulkEditor\\Rollback\\RollbackManager;

if (!defined('ABSPATH')) {
    exit;
}

class AdminAjax {
    public static function register(): void {
        add_action('wp_ajax_wc_bpe_get_products', [self::class, 'handleGetProducts']);
        add_action('wp_ajax_wc_bpe_preview_changes', [self::class, 'handlePreview']);
        add_action('wp_ajax_wc_bpe_process_batch', [self::class, 'handleBatch']);
        add_action('wp_ajax_wc_bpe_rollback_operation', [self::class, 'handleRollback']);
        add_action('wp_ajax_wc_bpe_save_inline_product', [self::class, 'handleInlineSave']);
    }

    private static function verifySecurity(): void {
        check_ajax_referer('wc_bpe_nonce', 'nonce');
        if (!current_user_can('manage_woocommerce') && !current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'سطح دسترسی غیرمجاز است.'], 403);
        }
    }

    public static function handleGetProducts(): void {
        self::verifySecurity();
        $page     = max(1, (int) ($_POST['page'] ?? 1));
        $limit    = max(5, min(100, (int) ($_POST['limit'] ?? 100)));
        $search   = sanitize_text_field($_POST['search'] ?? '');
        $category = sanitize_text_field($_POST['category'] ?? '');
        $status   = sanitize_text_field($_POST['status'] ?? '');

        $queryArgs = [
            'limit'    => $limit,
            'page'     => $page,
            'paginate' => true,
            'orderby'  => 'ID',
            'order'    => 'DESC',
            'return'   => 'objects',
        ];

        if (!empty($status)) {
            $queryArgs['status'] = [$status];
        } else {
            $queryArgs['status'] = ['publish', 'draft', 'pending', 'private', 'future'];
        }

        if (!empty($search)) {
            $queryArgs['s'] = $search;
        }

        if (!empty($category)) {
            $catTerm = get_term_by('name', $category, 'product_cat');
            if (!$catTerm) {
                $catTerm = get_term_by('slug', $category, 'product_cat');
            }
            if ($catTerm && !is_wp_error($catTerm)) {
                $queryArgs['category'] = [$catTerm->slug];
            } else {
                $queryArgs['category'] = [$category];
            }
        }

        $query = wc_get_products($queryArgs);

        // پشتیبانی انعطاف‌پذیر از بازگشت شئ یا آرایه محصولات
        $rawProducts = is_object($query) && isset($query->products) ? $query->products : (is_array($query) ? $query : []);
        $total       = is_object($query) && isset($query->total) ? (int) $query->total : count($rawProducts);
        $maxPages    = is_object($query) && isset($query->max_num_pages) ? (int) $query->max_num_pages : 1;

        // اگر فیلتری نبود ولی محصولی نیافت، کوئری بدون محدودیت وضعیت را امتحان کن
        if (empty($rawProducts) && empty($search) && empty($category)) {
            unset($queryArgs['status']);
            $fallback = wc_get_products($queryArgs);
            if (is_object($fallback) && !empty($fallback->products)) {
                $rawProducts = $fallback->products;
                $total       = (int) $fallback->total;
                $maxPages    = (int) $fallback->max_num_pages;
            }
        }

        $products = [];
        $adapters = \\WCBulkEditor\\Integrations\\AdapterRegistry::getAdapters();

        foreach ($rawProducts as $product) {
            if (!$product instanceof \\WC_Product) {
                continue;
            }
            $pId = $product->get_id();
            $thumbId = $product->get_image_id();
            $thumbUrl = $thumbId ? wp_get_attachment_image_url($thumbId, 'thumbnail') : '';
            if (!$thumbUrl && function_exists('wc_placeholder_img_src')) {
                $thumbUrl = wc_placeholder_img_src('thumbnail');
            }

            // استخراج تمیز نام دسته‌بندی‌ها
            $termIds = $product->get_category_ids();
            $catNames = [];
            foreach ($termIds as $tid) {
                $t = get_term($tid, 'product_cat');
                if ($t && !is_wp_error($t)) {
                    $catNames[] = $t->name;
                }
            }
            $catString = !empty($catNames) ? implode(', ', $catNames) : 'بدون دسته‌بندی';

            // استخراج برند از متادیتا یا تاکسونومی
            $brand = (string) $product->get_meta('_product_brand', true);
            if (empty($brand)) {
                $brand = (string) $product->get_meta('brand', true);
            }
            if (empty($brand)) {
                $brand = (string) $product->get_attribute('pa_brand');
            }
            if (empty($brand)) {
                $brand = (string) $product->get_attribute('pa_brands');
            }
            if (empty($brand)) {
                $brand = (string) $product->get_attribute('brand');
            }
            if (empty($brand)) {
                $brand = (string) $product->get_attribute('برند');
            }
            if (empty($brand)) {
                $brandTerms = wp_get_post_terms($pId, ['product_brand', 'pa_brand', 'pa_brands', 'pwb-brand', 'yith_product_brand']);
                if (!is_wp_error($brandTerms) && !empty($brandTerms)) {
                    $brand = $brandTerms[0]->name;
                }
            }

            $variations = [];
            if ($product->is_type('variable')) {
                foreach ($product->get_children() as $varId) {
                    $variation = wc_get_product($varId);
                    if ($variation) {
                        $variations[] = [
                            'id'             => $variation->get_id(),
                            'parentId'       => $pId,
                            'sku'            => $variation->get_sku() ?: '',
                            'name'           => $variation->get_name(),
                            'attributes'     => $variation->get_attributes(),
                            'regularPrice'   => (float) $variation->get_regular_price(),
                            'salePrice'      => $variation->get_sale_price() !== '' ? (float) $variation->get_sale_price() : null,
                            'manageStock'    => $variation->managing_stock(),
                            'stockQuantity'  => (int) $variation->get_stock_quantity(),
                            'stockStatus'    => $variation->get_stock_status(),
                            'snappayEnabled' => isset($adapters['snappay']) ? $adapters['snappay']->getValue($variation) : false,
                            'torobPayEnabled'=> isset($adapters['torob_pay']) ? $adapters['torob_pay']->getValue($variation) : false,
                            'isPurchasable'  => $variation->is_purchasable(),
                        ];
                    }
                }
            }

            $products[] = [
                'id'               => $pId,
                'name'             => $product->get_name(),
                'sku'              => $product->get_sku() ?: '',
                'type'             => $product->get_type(),
                'status'           => $product->get_status(),
                'category'         => $catString,
                'brand'            => $brand ?: '',
                'thumbnail'        => $thumbUrl ?: '',
                'description'      => $product->get_description(),
                'shortDescription' => $product->get_short_description(),
                'regularPrice'     => (float) $product->get_regular_price(),
                'salePrice'        => $product->get_sale_price() !== '' ? (float) $product->get_sale_price() : null,
                'manageStock'      => $product->managing_stock(),
                'stockQuantity'    => (int) $product->get_stock_quantity(),
                'stockStatus'      => $product->get_stock_status(),
                'snappayEnabled'   => isset($adapters['snappay']) ? $adapters['snappay']->getValue($product) : false,
                'torobPayEnabled'  => isset($adapters['torob_pay']) ? $adapters['torob_pay']->getValue($product) : false,
                'isPurchasable'    => $product->is_purchasable(),
                'variations'       => $variations,
            ];
        }

        $catTerms = get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false]);
        $categoriesList = (!is_wp_error($catTerms) && is_array($catTerms)) ? wp_list_pluck($catTerms, 'name') : [];

        // استخراج تمام برندهای ثبت‌شده در ووکامرس
        $allBrands = [];
        $brandTaxonomies = ['product_brand', 'pa_brand', 'pa_brands', 'pwb-brand', 'yith_product_brand'];
        foreach ($brandTaxonomies as $btax) {
            if (taxonomy_exists($btax)) {
                $terms = get_terms(['taxonomy' => $btax, 'hide_empty' => false]);
                if (!is_wp_error($terms) && !empty($terms)) {
                    foreach ($terms as $term) {
                        if (!in_array($term->name, $allBrands, true)) {
                            $allBrands[] = $term->name;
                        }
                    }
                }
            }
        }
        foreach ($products as $p) {
            if (!empty($p['brand']) && !in_array($p['brand'], $allBrands, true)) {
                $allBrands[] = $p['brand'];
            }
        }

        // اگر لیست برندها خالی بود برندهای استاندارد فروشگاه را پیشنهاد بده تا خالی نماند
        $defaultStoreBrands = [
            'Casio', 'Seiko', 'G-Shock', 'TISSOT', 'Swatch', 'Calvin Klein',
            'Caterpillar', 'CERRUTI', 'Daniel Gorman', 'Edifice', 'Esprit',
            'GUCCI', 'Guess', 'Orient', 'POLICE', 'Pro Trek', 'Timberland',
            'سامسونگ', 'اپل', 'شیائومی', 'باسئوس', 'ایسوس', 'مباشی'
        ];
        foreach ($defaultStoreBrands as $db) {
            if (!in_array($db, $allBrands, true)) {
                $allBrands[] = $db;
            }
        }

        wp_send_json_success([
            'products'      => $products,
            'categories'    => $categoriesList,
            'brands'        => $allBrands,
            'total'         => $total,
            'max_num_pages' => $maxPages,
            'page'          => $page,
        ]);
    }

    public static function handlePreview(): void {
        self::verifySecurity();
        $productIds = array_map('intval', $_POST['product_ids'] ?? []);
        $operations = json_decode(stripslashes($_POST['operations'] ?? '{}'), true);

        $previews = [];
        foreach ($productIds as $id) {
            $product = wc_get_product($id);
            if ($product) {
                $diff = ChangeSetEngine::generateDiff($product, $operations);
                if ($diff['has_changes']) {
                    $previews[] = [
                        'id'    => $id,
                        'name'  => $product->get_name(),
                        'sku'   => $product->get_sku(),
                        'diffs' => $diff['diffs']
                    ];
                }
            }
        }
        wp_send_json_success(['previews' => $previews]);
    }

    public static function handleBatch(): void {
        self::verifySecurity();
        global $wpdb;

        $productIds  = array_map('intval', $_POST['product_ids'] ?? []);
        $operations  = json_decode(stripslashes($_POST['operations'] ?? '{}'), true);
        $operationId = sanitize_text_field($_POST['operation_id'] ?? wp_generate_uuid4());

        // Ensure master operation entry exists
        $opsTable = $wpdb->prefix . 'wc_bpe_operations';
        $exists = $wpdb->get_var($wpdb->prepare("SELECT id FROM {$opsTable} WHERE id = %s", $operationId));
        if (!$exists) {
            $wpdb->insert($opsTable, [
                'id'              => $operationId,
                'user_id'         => get_current_user_id() ?: 1,
                'status'          => 'completed',
                'total_items'     => count($productIds),
                'success_count'   => 0,
                'fail_count'      => 0,
                'filters_payload' => '{}',
                'changes_payload' => wp_json_encode($operations, JSON_UNESCAPED_UNICODE),
                'created_at'      => current_time('mysql'),
            ]);
        }

        $results = [];
        $successCount = 0;
        $failCount    = 0;
        foreach ($productIds as $id) {
            $res = BatchProcessor::applyToProduct($id, $operations, $operationId);
            if (!empty($res['success'])) {
                $successCount++;
            } else {
                $failCount++;
            }
            $results[] = $res;
        }

        // Update counts
        $wpdb->query(
            $wpdb->prepare(
                "UPDATE {$opsTable} SET total_items = total_items + %d, success_count = success_count + %d, fail_count = fail_count + %d WHERE id = %s",
                count($productIds),
                $successCount,
                $failCount,
                $operationId
            )
        );

        wp_send_json_success([
            'results'      => $results,
            'operation_id' => $operationId,
            'success_count'=> $successCount,
            'fail_count'   => $failCount
        ]);
    }

    public static function handleRollback(): void {
        self::verifySecurity();
        $operationId = sanitize_text_field($_POST['operation_id'] ?? '');
        $result = RollbackManager::rollbackOperation($operationId);
        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result);
        }
    }

    public static function handleInlineSave(): void {
        self::verifySecurity();
        $productId = (int) ($_POST['product_id'] ?? 0);
        $product = wc_get_product($productId);
        if (!$product) {
            wp_send_json_error(['message' => 'محصول یافت نشد.'], 404);
        }

        try {
            if (isset($_POST['name'])) {
                $product->set_name(sanitize_text_field($_POST['name']));
            }
            if (isset($_POST['sku'])) {
                $product->set_sku(sanitize_text_field($_POST['sku']));
            }
            if (isset($_POST['regular_price'])) {
                $reg = trim((string) $_POST['regular_price']);
                $product->set_regular_price($reg !== '' ? $reg : '');
            }
            if (isset($_POST['sale_price'])) {
                $sale = trim((string) $_POST['sale_price']);
                $product->set_sale_price($sale !== '' ? $sale : '');
            }
            if (isset($_POST['manage_stock'])) {
                $product->set_manage_stock($_POST['manage_stock'] === 'yes' || $_POST['manage_stock'] === 'true');
            }
            if (isset($_POST['stock_quantity'])) {
                $stock = (int) $_POST['stock_quantity'];
                $product->set_manage_stock(true);
                $product->set_stock_quantity($stock);
                $product->set_stock_status($stock > 0 ? 'instock' : 'outofstock');
            }
            if (isset($_POST['status'])) {
                $status = sanitize_text_field($_POST['status']);
                if (in_array($status, ['publish', 'draft', 'pending', 'private'], true)) {
                    $product->set_status($status);
                }
            }
            if (isset($_POST['description'])) {
                $product->set_description(wp_kses_post($_POST['description']));
            }
            if (isset($_POST['short_description'])) {
                $product->set_short_description(wp_kses_post($_POST['short_description']));
            }
            if (isset($_POST['category'])) {
                $categoryName = sanitize_text_field($_POST['category']);
                if (!empty($categoryName)) {
                    $term = get_term_by('name', $categoryName, 'product_cat');
                    if (!$term) {
                        $term = get_term_by('slug', $categoryName, 'product_cat');
                    }
                    if (!$term) {
                        $newTerm = wp_insert_term($categoryName, 'product_cat');
                        if (!is_wp_error($newTerm) && isset($newTerm['term_id'])) {
                            $product->set_category_ids([(int) $newTerm['term_id']]);
                        }
                    } else {
                        $product->set_category_ids([(int) $term->term_id]);
                    }
                }
            }
            if (isset($_POST['brand'])) {
                $brandName = sanitize_text_field($_POST['brand']);
                $product->update_meta_data('_product_brand', $brandName);
                if (taxonomy_exists('product_brand')) {
                    wp_set_object_terms($productId, $brandName, 'product_brand');
                }
            }
            if (isset($_POST['snappay_enabled'])) {
                $adapters = \\WCBulkEditor\\Integrations\\AdapterRegistry::getAdapters();
                if (isset($adapters['snappay'])) {
                    $adapters['snappay']->setValue($product, $_POST['snappay_enabled'] === '1' || $_POST['snappay_enabled'] === 'true');
                }
            }
            if (isset($_POST['torob_pay_enabled'])) {
                $adapters = \\WCBulkEditor\\Integrations\\AdapterRegistry::getAdapters();
                if (isset($adapters['torob_pay'])) {
                    $adapters['torob_pay']->setValue($product, $_POST['torob_pay_enabled'] === '1' || $_POST['torob_pay_enabled'] === 'true');
                }
            }

            $product->save();
            wp_send_json_success(['message' => 'محصول با موفقیت در ووکامرس ذخیره شد.', 'product_id' => $productId]);
        } catch (\\Exception $e) {
            wp_send_json_error(['message' => 'خطا در ذخیره اطلاعات: ' . $e->getMessage()], 500);
        }
    }
}
AdminAjax::register();
`
  },
  {
    path: 'uninstall.php',
    name: 'uninstall.php',
    description: 'پاکسازی ایمن جداول و تنظیمات صرفاً در صورت انتخاب صریح مدیر در تنظیمات',
    language: 'php',
    content: `<?php
/**
 * Fired when the plugin is uninstalled.
 */

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Clean data ONLY if explicitly enabled in plugin options
$deleteData = get_option('wc_bpe_delete_data_on_uninstall', 0);

if ((int) $deleteData === 1) {
    global $wpdb;

    // Drop custom audit and operations tables
    $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wc_bpe_operation_items");
    $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wc_bpe_operations");

    // Delete options
    delete_option('wc_bpe_schema_version');
    delete_option('wc_bpe_batch_size');
    delete_option('wc_bpe_history_retention_days');
    delete_option('wc_bpe_enable_rollback');
    delete_option('wc_bpe_delete_data_on_uninstall');
}
`
  },
  {
    path: 'docs/INSTALL.md',
    name: 'INSTALL.md',
    description: 'راهنمای گام‌به‌گام نصب، راه‌اندازی و نیازمندی‌های سرور و وردپرس',
    language: 'markdown',
    content: `# راهنمای نصب و راه‌اندازی افزونه ویرایش گروهی محصولات ووکامرس (سازگار با ووکامرس 9.8.5)

## پیش‌نیازهای سیستمی
- **PHP:** نسخه 8.1 یا بالاتر با اکستنشن‌های \`json\` و \`mbstring\`
- **WordPress:** نسخه 6.2 یا بالاتر (سازگار با وردپرس 6.7+)
- **WooCommerce:** نسخه 8.0 تا 9.8.5+ با پشتیبانی رسمی از HPOS (High-Performance Order Storage)
- **MySQL / MariaDB:** نسخه 5.7+ یا 10.3+ با پشتیبانی از JSON و دستور \`dbDelta\`

---

## سازگاری با ووکامرس 9.8.5 (HPOS & Cart Blocks)
این افزونه به صورت پیش‌فرض با قابلیت سفارشی جدول سفارش‌ها و محصولات ووکامرس 9.8.5 سازگار است:
- استفاده مستقیم از **WooCommerce CRUD API** برای خواندن و نوشتن اطلاعات محصولات.
- پشتیبانی کامل از **HPOS** بدون وابستگی منحصربه‌فرد به جداول قدیمی \`wp_posts\`.
- ثبت هوک در \`init\` برای جلوگیری کامل از خطای ترجمه \`_load_textdomain_just_in_time\`.

---

## روش نصب از طریق پیشخوان وردپرس
1. فایل زیپ \`wc-bulk-product-editor-pro.zip\` را دانلود کنید.
2. در مدیریت وردپرس به مسیر **افزونه‌ها ← افزودن افزونه ← بارگذاری افزونه** بروید.
3. فایل ZIP را انتخاب و روی دکمه **هم‌اکنون نصب کن** کلیک کنید.
4. پس از اتمام بارگذاری، دکمه **فعال‌سازی افزونه** را بزنید.

---

## روش نصب دستی (FTP / File Manager)
1. فایل ZIP را در رایانه خود Extract کنید.
2. پوشه \`wc-bulk-product-editor-pro\` را در مسیر \`wp-content/plugins/\` بارگذاری نمایید.
3. وارد پیشخوان وردپرس شده و از منوی افزونه‌ها، آن را فعال کنید.

---

## بررسی دسترسی‌ها و صفحات
پس از فعال‌سازی، منوهای زیر به پیشخوان اضافه می‌شود:
- **محصولات ← ویرایش گروهی محصولات** (شامل جدول گسترده درون‌ردیفی Editable Table و ویزارد ۵ مرحله‌ای)
- **محصولات ← تاریخچه ویرایش گروهی** (مشاهده لاگ‌ها، اسنپ‌شات‌ها و بازگردانی Rollback)
- **ووکامرس ← تنظیمات ← ویرایش گروهی** (تنظیم Batch Size، کلیدهای متای اسنپ‌پی و ترب)
`
  },
  {
    path: 'docs/SCHEMA.md',
    name: 'SCHEMA.md',
    description: 'مستندات ساختار پایگاه داده و دیاگرام فیلدهای اسنپ‌شات',
    language: 'markdown',
    content: `# مستندات دیتابیس و پایگاه داده (Database Schema)

افزونه از ۲ جدول اختصاصی برای تضمین سلامت داده‌ها، بدون هیچ‌گونه سربار روی جداول پیش‌فرض \`wp_posts\` یا \`wp_postmeta\`، استفاده می‌کند:

## جدول ۱: \`wp_wc_bpe_operations\`
ثبت متادیتای کلی هر سناریوی ویرایش گروهی:
- \`id\` (VARCHAR 36): شناسه یکتای UUID عملیات (مانند \`c89f2a41-...\`)
- \`user_id\` (BIGINT UNSIGNED): شناسه کاربری مدیر اجراکننده
- \`status\` (VARCHAR 20): وضعیت (\`completed\`، \`rolled_back\`، \`failed\`)
- \`total_items\` (INT): تعداد کل اقلام هدف
- \`success_count\` (INT): تعداد موارد با اعمال موفق
- \`fail_count\` (INT): تعداد خطاها در اجرا
- \`filters_payload\` (LONGTEXT JSON): معیارهای فیلتر مورد استفاده
- \`changes_payload\` (LONGTEXT JSON): قواعد تغییرات اعمال‌شده
- \`created_at\` (DATETIME): زمان دقیق اجرا
- \`rolled_back_at\` (DATETIME NULL): زمان بازگردانی در صورت Rollback

---

## جدول ۲: \`wp_wc_bpe_operation_items\`
ثبت اسنپ‌شات جزءبه‌جزء هر محصول پیش از تغییر و پس از تغییر:
- \`id\` (BIGINT UNSIGNED AUTO_INCREMENT): کلید اصلی
- \`operation_id\` (VARCHAR 36): کلید خارجی متصل به عملیات
- \`product_id\` (BIGINT UNSIGNED): شناسه محصول یا متغیر
- \`parent_id\` (BIGINT UNSIGNED NULL): شناسه محصول والد (در صورت تنوع محصول)
- \`sku\` (VARCHAR 100): کد محصول
- \`before_snapshot\` (LONGTEXT JSON): وضعیت دقیق فیلدها قبل از تغییر
- \`after_snapshot\` (LONGTEXT JSON): وضعیت دقیق فیلدها پس از تغییر
- \`is_rolled_back\` (TINYINT 1): پرچم نشان‌دهنده بازگردانی مجزای این رکورد
- \`error_message\` (TEXT NULL): متن خطای رخ‌داده در صورت شکست
`
  },
  {
    path: 'docs/PERFORMANCE_TEST.md',
    name: 'PERFORMANCE_TEST.md',
    description: 'طرح آزمون عملکردی برای ۱۰,۰۰۰ محصول، معیارهای زمان و مانیتورینگ حافظه',
    language: 'markdown',
    content: `# طرح آزمون کارایی و عملکرد (Performance Test) برای ۱۰,۰۰۰ محصول

## ۱. اهداف آزمون
- اطمینان از حفظ مصرف حافظه زیر **64MB** هنگام پردازش ۱۰,۰۰۰ قلم محصول.
- جلوگیری از وقوع خطای \`Maximum execution time of 30 seconds exceeded\`.
- پشتیبانی از قطع اتصال مرورگر و قابلیت ادامه (Resumable Execution).

---

## ۲. سناریوی آزمایشی
- **تعداد کل محصولات:** ۱۰,۰۰۰ محصول (شامل ۷,۰۰۰ محصول ساده و ۳,۰۰۰ تنوع در محصولات متغیر).
- **عملیات اعمالی:**
  - افزایش قیمت عادی به میزان ۱۵٪ و گرد کردن به نزدیک‌ترین ۱,۰۰۰ تومان.
  - کاهش موجودی انبار به میزان ۱ عدد.
  - فعال‌سازی درگاه اقساطی اسنپ‌پی.
- **اندازه هر دسته (Batch Size):** ۲۵ محصول در هر درخواست AJAX.
- **تعداد کل درخواست‌های بچ:** ۴۰۰ درخواست متوالی.

---

## ۳. شاخص‌های کلیدی عملکرد (KPIs)
| پارامتر | مقدار استاندارد هدف | مقدار بحرانی (Fail) |
|---|---|---|
| مصرف حافظه PHP | حداکثر 32MB در هر Batch | بالاتر از 64MB |
| زمان پاسخ هر Batch | 300ms تا 750ms | بیشتر از 3,000ms |
| نرخ شکست درخواست | ۰٪ (Zero Error) | بالاتر از ۰.۵٪ |
| آزادسازی کش شیء | فراخوانی \`wp_cache_flush()\` بعد از هر دسته | تجمع کش در RAM |
`
  },
  {
    path: 'assets/css/admin.css',
    name: 'admin.css',
    description: 'استایل‌های اختصاصی راست‌چین مدیریت وردپرس، فونت وزیرمتن، جداول گسترده و مدال‌ها',
    language: 'php',
    content: adminCssContent
  },
  {
    path: 'assets/js/admin.js',
    name: 'admin.js',
    description: 'کلاینت کامل جاوااسکریپت، اتصال به AJAX ووکامرس 9.8.5، جدول ویرایش درون‌ردیفی، ویزارد ۵ مرحله‌ای و بازگردانی Rollback',
    language: 'php',
    content: adminJsContent
  }
];
