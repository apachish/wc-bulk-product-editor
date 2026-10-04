<?php
declare(strict_types=1);

namespace WCBulkEditor\Database;

if (!defined('ABSPATH')) {
    exit;
}

class Activator {
    public const SCHEMA_VERSION = '1.3.0';

    public static function ensureTablesExist(): void {
        global $wpdb;
        $operations_table = $wpdb->prefix . 'wc_bpe_operations';
        $items_table      = $wpdb->prefix . 'wc_bpe_operation_items';

        $ops_exist   = $wpdb->get_var("SHOW TABLES LIKE '{$operations_table}'") === $operations_table;
        $items_exist = $wpdb->get_var("SHOW TABLES LIKE '{$items_table}'") === $items_table;

        if (!$ops_exist || !$items_exist) {
            self::activate();
            return;
        }

        // بررسی و ارتقای خودکار طول کلید ID به varchar(64) تا از خطای Data too long جلوگیری شود
        $col = $wpdb->get_row("SHOW COLUMNS FROM {$operations_table} LIKE 'id'");
        if ($col && isset($col->Type) && strpos(strtolower($col->Type), 'varchar(36)') !== false) {
            $wpdb->query("ALTER TABLE {$operations_table} MODIFY COLUMN id varchar(64) NOT NULL");
            $wpdb->query("ALTER TABLE {$items_table} MODIFY COLUMN operation_id varchar(64) NOT NULL");
        }
    }

    public static function activate(): void {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();

        $operations_table = $wpdb->prefix . 'wc_bpe_operations';
        $items_table      = $wpdb->prefix . 'wc_bpe_operation_items';

        $sql = "
        CREATE TABLE {$operations_table} (
            id varchar(64) NOT NULL,
            user_id bigint(20) unsigned NOT NULL DEFAULT 1,
            status varchar(20) NOT NULL DEFAULT 'completed',
            total_items int(11) NOT NULL DEFAULT 0,
            success_count int(11) NOT NULL DEFAULT 0,
            fail_count int(11) NOT NULL DEFAULT 0,
            filters_payload longtext,
            changes_payload longtext,
            created_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
            rolled_back_at datetime DEFAULT NULL,
            PRIMARY KEY  (id),
            KEY user_id (user_id),
            KEY created_at (created_at)
        ) {$charset_collate};

        CREATE TABLE {$items_table} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            operation_id varchar(64) NOT NULL,
            product_id bigint(20) unsigned NOT NULL,
            parent_id bigint(20) unsigned DEFAULT NULL,
            sku varchar(100) DEFAULT '',
            before_snapshot longtext,
            after_snapshot longtext,
            is_rolled_back tinyint(1) NOT NULL DEFAULT 0,
            error_message text DEFAULT NULL,
            created_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
            PRIMARY KEY  (id),
            KEY op_prod (operation_id, product_id),
            KEY product_id (product_id)
        ) {$charset_collate};
        ";

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta($sql);

        // اجرای مستقیم جهت اطمینان ۱۰۰٪ از ساخت جداول در صورت بروز تداخل در dbDelta
        $wpdb->query("
        CREATE TABLE IF NOT EXISTS {$operations_table} (
            id varchar(64) NOT NULL,
            user_id bigint(20) unsigned NOT NULL DEFAULT 1,
            status varchar(20) NOT NULL DEFAULT 'completed',
            total_items int(11) NOT NULL DEFAULT 0,
            success_count int(11) NOT NULL DEFAULT 0,
            fail_count int(11) NOT NULL DEFAULT 0,
            filters_payload longtext,
            changes_payload longtext,
            created_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
            rolled_back_at datetime DEFAULT NULL,
            PRIMARY KEY (id)
        ) {$charset_collate};
        ");

        $wpdb->query("
        CREATE TABLE IF NOT EXISTS {$items_table} (
            id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            operation_id varchar(64) NOT NULL,
            product_id bigint(20) unsigned NOT NULL,
            parent_id bigint(20) unsigned DEFAULT NULL,
            sku varchar(100) DEFAULT '',
            before_snapshot longtext,
            after_snapshot longtext,
            is_rolled_back tinyint(1) NOT NULL DEFAULT 0,
            error_message text DEFAULT NULL,
            created_at datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
            PRIMARY KEY (id),
            KEY op_prod (operation_id, product_id)
        ) {$charset_collate};
        ");

        update_option('wc_bpe_schema_version', self::SCHEMA_VERSION);
        add_option('wc_bpe_batch_size', 20);
        add_option('wc_bpe_history_retention_days', 60);
        add_option('wc_bpe_enable_rollback', 1);
        add_option('wc_bpe_audit_log_enabled', 1);
    }
}
