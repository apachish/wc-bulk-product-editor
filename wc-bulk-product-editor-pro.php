<?php
/**
 * Plugin Name: WooCommerce Bulk Product Editor Pro
 * Plugin URI:  https://github.com/woocommerce/bulk-product-editor-pro
 * Description: افزونه حرفه‌ای و ایمن برای ویرایش گروهی و درون‌ردیفی محصولات، قیمت‌گذاری پیشرفته، موجودی انبار، هدرهای ثابت جداول، کوپن و کد تخفیف، و درگاه‌های اقساطی (اسنپ‌پی و ترب) با پشتیبانی کامل از ووکامرس 9.8.5 و HPOS.
 * Version:     1.3.0
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

define('WC_BPE_VERSION', '1.3.0');
define('WC_BPE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WC_BPE_PLUGIN_URL', plugin_dir_url(__FILE__));
define('WC_BPE_PLUGIN_BASENAME', plugin_basename(__FILE__));

// اعلام سازگاری کامل با HPOS و بلوک‌های ووکامرس 9.8.5
add_action('before_woocommerce_init', function () {
    if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('custom_order_tables', __FILE__, true);
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('cart_checkout_blocks', __FILE__, true);
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
        'includes/integrations/class-installment-gateways.php',
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
    if (class_exists('WCBulkEditor\Core\Plugin')) {
        Core\Plugin::getInstance()->init();
    }
});

// هوک فعال‌سازی
register_activation_hook(__FILE__, function () {
    $actPath = WC_BPE_PLUGIN_DIR . 'includes/class-activator.php';
    if (file_exists($actPath)) {
        require_once $actPath;
        if (class_exists('WCBulkEditor\Database\Activator')) {
            Database\Activator::activate();
        }
    }
});
