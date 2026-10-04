<?php
declare(strict_types=1);

namespace WCBulkEditor\Integrations;

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
        return class_exists('WC_Snappay') || defined('SNAPPAY_PLUGIN_FILE') || true;
    }

    public function getValue(WC_Product $product): bool {
        $metaKey = apply_filters('wc_bpe_snappay_meta_key', get_option('wc_bpe_snappay_meta_key', '_disable_snappay'));
        $mode = get_option('wc_bpe_snappay_mode', 'disable_flag');
        $val = (string) $product->get_meta($metaKey, true);

        // ۱. در صورتی که مدیر در تنظیمات حالت «فعال‌سازی مستقیم» را انتخاب کرده باشد:
        if ($mode === 'enable_flag') {
            return ($val === 'yes' || $val === '1' || $val === 1);
        }

        // ۲. در حالت پیش‌فرض (منطق غیرفعال‌سازی با کلید متای _disable_snappay):
        // اگر مقدار yes باشد یعنی غیرفعال‌سازی فعال است => درگاه برای کالا غیرفعال است (false)
        if ($val === 'yes' || $val === '1') {
            return false;
        }
        // اگر مقدار no باشد یعنی غیرفعال‌سازی نشده => درگاه برای کالا فعال است (true)
        if ($val === 'no' || $val === '0') {
            return true;
        }
        // در صورتی که مقداری ثبت نشده باشد: پیش‌فرض غیرفعال (false)
        return false;
    }

    public function setValue(WC_Product $product, bool $enabled): void {
        $metaKey = apply_filters('wc_bpe_snappay_meta_key', get_option('wc_bpe_snappay_meta_key', '_disable_snappay'));
        $mode = get_option('wc_bpe_snappay_mode', 'disable_flag');

        if ($mode === 'enable_flag') {
            $product->update_meta_data($metaKey, $enabled ? 'yes' : 'no');
        } else {
            // در حالت disable_flag:
            // اگر کاربر فعال کند ($enabled = true) => مقدار _disable_snappay برابر no می‌شود
            // اگر کاربر غیرفعال کند ($enabled = false) => مقدار _disable_snappay برابر yes می‌شود
            $product->update_meta_data($metaKey, $enabled ? 'no' : 'yes');
        }
    }
}

class TorobPayAdapter implements GatewayAdapterInterface {
    public function getKey(): string { return 'torob_pay'; }
    public function getLabel(): string { return 'پرداخت سریع ترب (Torob Pay)'; }

    public function isPluginActive(): bool {
        return class_exists('Torob_Pay') || defined('TOROB_PAY_VERSION') || true;
    }

    public function getValue(WC_Product $product): bool {
        $metaKey = apply_filters('wc_bpe_torob_meta_key', get_option('wc_bpe_torob_meta_key', '_disable_torobpay'));
        $mode = get_option('wc_bpe_torob_mode', 'disable_flag');
        $val = (string) $product->get_meta($metaKey, true);

        // ۱. در صورتی که مدیر در تنظیمات حالت «فعال‌سازی مستقیم» را انتخاب کرده باشد:
        if ($mode === 'enable_flag') {
            return ($val === 'yes' || $val === '1' || $val === 1);
        }

        // ۲. در حالت پیش‌فرض (منطق غیرفعال‌سازی با کلید متای _disable_torobpay):
        // اگر مقدار yes باشد => غیرفعال است (false)
        if ($val === 'yes' || $val === '1') {
            return false;
        }
        // اگر مقدار no باشد => فعال است (true)
        if ($val === 'no' || $val === '0') {
            return true;
        }
        // در صورتی که مقداری ثبت نشده باشد: پیش‌فرض غیرفعال (false)
        return false;
    }

    public function setValue(WC_Product $product, bool $enabled): void {
        $metaKey = apply_filters('wc_bpe_torob_meta_key', get_option('wc_bpe_torob_meta_key', '_disable_torobpay'));
        $mode = get_option('wc_bpe_torob_mode', 'disable_flag');

        if ($mode === 'enable_flag') {
            $product->update_meta_data($metaKey, $enabled ? 'yes' : 'no');
        } else {
            $product->update_meta_data($metaKey, $enabled ? 'no' : 'yes');
        }
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
