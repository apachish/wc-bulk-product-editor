<?php
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
