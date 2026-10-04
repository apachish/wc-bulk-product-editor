<?php
declare(strict_types=1);

namespace WCBulkEditor\Core;

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
        if (get_option('wc_bpe_schema_version') !== \WCBulkEditor\Database\Activator::SCHEMA_VERSION) {
            \WCBulkEditor\Database\Activator::activate();
        }

        if (class_exists('\WCBulkEditor\Admin\AdminMenu')) {
            \WCBulkEditor\Admin\AdminMenu::init();
        }
        if (class_exists('\WCBulkEditor\Admin\AdminAjax')) {
            \WCBulkEditor\Admin\AdminAjax::register();
        }
    }
}
