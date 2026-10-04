<?php
declare(strict_types=1);

namespace WCBulkEditor\Admin;

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

        // بارگذاری کتابخانه Tailwind CSS برای تطابق ۱۰۰٪ رابط کاربری و جداول با نسخه پیش‌نمایش
        wp_enqueue_script(
            'wc-bpe-tailwind',
            'https://cdn.tailwindcss.com',
            [],
            '3.4.17',
            false
        );

        wp_enqueue_script(
            'wc-bpe-admin-script',
            WC_BPE_PLUGIN_URL . 'assets/js/admin.js',
            ['jquery'],
            (string) time(),
            true
        );

        wp_localize_script('wc-bpe-admin-script', 'wcBpeData', [
            'ajaxUrl'       => admin_url('admin-ajax.php'),
            'nonce'         => wp_create_nonce('wc_bpe_nonce'),
            'pluginUrl'     => WC_BPE_PLUGIN_URL,
            'pluginVersion' => WC_BPE_VERSION,
            'schemaVersion' => get_option('wc_bpe_schema_version', '1.2.0'),
            'batchSize'     => (int) get_option('wc_bpe_batch_size', 20),
            'settings'      => [
                'batchSize'            => (int) get_option('wc_bpe_batch_size', 20),
                'historyRetentionDays' => (int) get_option('wc_bpe_history_retention_days', 60),
                'rollbackEnabled'      => (bool) get_option('wc_bpe_enable_rollback', 1),
                'auditLogEnabled'      => (bool) get_option('wc_bpe_audit_log_enabled', 1),
                'brandSource'          => get_option('wc_bpe_brand_source', 'taxonomy'),
                'brandTaxonomyName'    => get_option('wc_bpe_brand_taxonomy', 'product_brand'),
                'brandAttributeName'   => get_option('wc_bpe_brand_attribute', 'pa_brands'),
                'snappayMetaKey'       => get_option('wc_bpe_snappay_meta_key', '_disable_snappay'),
                'snappayMode'          => get_option('wc_bpe_snappay_mode', 'disable_flag'),
                'torobMetaKey'         => get_option('wc_bpe_torob_meta_key', '_disable_torobpay'),
                'torobMode'            => get_option('wc_bpe_torob_mode', 'disable_flag'),
                'enableCheckoutFilter' => (bool) get_option('wc_bpe_enable_checkout_filter', 1),
                'priceRoundUnit'       => (int) get_option('wc_bpe_price_round_unit', 1000),
                'deleteOnUninstall'    => (bool) get_option('wc_bpe_delete_data_on_uninstall', 0),
            ],
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
                            <th style="width: 140px;">زمان اجرا</th>
                            <th style="width: 100px;">کاربر</th>
                            <th style="width: 320px; max-width: 380px;">خلاصه عملیات و تغییرات</th>
                            <th style="width: 90px; text-align: center;">موفق / خطا</th>
                            <th style="width: 110px; text-align: center;">وضعیت</th>
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
                                $changes = json_decode($row->changes_payload, true);
                                $summary = 'ویرایش روی ' . (int) $row->total_items . ' محصول';
                                if (is_array($changes)) {
                                    if (isset($changes[0]) && is_string($changes[0])) {
                                        $summary = $changes[0];
                                    } elseif (!empty($changes)) {
                                        $summary = 'ویرایش ' . implode(', ', array_keys($changes));
                                    }
                                }
                            ?>
                                <tr>
                                    <td><code><?php echo esc_html(substr($row->id, 0, 8)); ?>...</code></td>
                                    <td><?php echo esc_html($row->created_at); ?></td>
                                    <td><?php echo esc_html($userName); ?></td>
                                    <td style="max-width: 380px; width: 320px;">
                                        <div style="max-height: 52px; overflow-y: auto; overflow-x: hidden; word-break: break-word; font-size: 11.5px; line-height: 1.5; color: #1e293b; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px; scrollbar-width: thin;" title="<?php echo esc_attr($summary); ?>">
                                            <?php echo esc_html($summary); ?>
                                        </div>
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
            update_option('wc_bpe_enable_rollback', isset($_POST['enable_rollback']) ? 1 : 0);
            update_option('wc_bpe_audit_log_enabled', isset($_POST['audit_log_enabled']) ? 1 : 0);

            // منبع برند
            $brandSource = sanitize_text_field($_POST['brand_source'] ?? 'taxonomy');
            update_option('wc_bpe_brand_source', $brandSource === 'attribute' ? 'attribute' : 'taxonomy');
            update_option('wc_bpe_brand_taxonomy', sanitize_text_field($_POST['brand_taxonomy'] ?? 'product_brand'));
            update_option('wc_bpe_brand_attribute', sanitize_text_field($_POST['brand_attribute'] ?? 'pa_brands'));

            // تنظیمات اسنپ‌پی و ترب
            update_option('wc_bpe_snappay_meta_key', sanitize_text_field($_POST['snappay_meta_key'] ?? '_disable_snappay'));
            update_option('wc_bpe_snappay_mode', sanitize_text_field($_POST['snappay_mode'] ?? 'disable_flag'));
            update_option('wc_bpe_torob_meta_key', sanitize_text_field($_POST['torob_meta_key'] ?? '_disable_torobpay'));
            update_option('wc_bpe_torob_mode', sanitize_text_field($_POST['torob_mode'] ?? 'disable_flag'));
            update_option('wc_bpe_enable_checkout_filter', isset($_POST['enable_checkout_filter']) ? 1 : 0);

            // قیمت‌گذاری و حذف
            update_option('wc_bpe_price_round_unit', max(1, (int) ($_POST['price_round_unit'] ?? 1000)));
            update_option('wc_bpe_delete_data_on_uninstall', isset($_POST['delete_data_on_uninstall']) ? 1 : 0);

            echo '<div class="notice notice-success is-dismissible"><p>تنظیمات افزونه با موفقیت ذخیره شدند و بلافاصله اعمال گردیدند.</p></div>';
        }

        $batchSize     = (int) get_option('wc_bpe_batch_size', 20);
        $retentionDays = (int) get_option('wc_bpe_history_retention_days', 60);
        $enableRollback= (int) get_option('wc_bpe_enable_rollback', 1);
        $auditLog      = (int) get_option('wc_bpe_audit_log_enabled', 1);
        $brandSource   = get_option('wc_bpe_brand_source', 'taxonomy');
        $brandTaxonomy = get_option('wc_bpe_brand_taxonomy', 'product_brand');
        $brandAttribute= get_option('wc_bpe_brand_attribute', 'pa_brands');
        $snappayKey    = get_option('wc_bpe_snappay_meta_key', '_disable_snappay');
        $snappayMode   = get_option('wc_bpe_snappay_mode', 'disable_flag');
        $torobKey      = get_option('wc_bpe_torob_meta_key', '_disable_torobpay');
        $torobMode     = get_option('wc_bpe_torob_mode', 'disable_flag');
        $enableFilter  = (int) get_option('wc_bpe_enable_checkout_filter', 1);
        $priceRoundUnit= (int) get_option('wc_bpe_price_round_unit', 1000);
        $deleteUninstall=(int) get_option('wc_bpe_delete_data_on_uninstall', 0);
        ?>
        <div class="wrap wc-bpe-wrap" dir="rtl">
            <h1 class="wp-heading-inline">تنظیمات پیکربندی و درگاه‌های پرداخت (Settings & Adapters)</h1>
            <hr class="wp-header-end">

            <form method="post" action="">
                <?php wp_nonce_field('wc_bpe_save_settings', 'wc_bpe_save_settings_nonce'); ?>

                <!-- ۱. کارایی و پردازش دسته‌ای -->
                <h2 class="title" style="margin-top: 25px; border-bottom: 1px solid #dcdcde; padding-bottom: 8px;">⚡ کارایی و پردازش دسته‌ای (Batch Processing)</h2>
                <table class="form-table" role="presentation">
                    <tbody>
                        <tr>
                            <th scope="row"><label for="batch_size">تعداد اقلام در هر دسته (Batch Size)</label></th>
                            <td>
                                <input name="batch_size" type="number" id="batch_size" value="<?php echo esc_attr($batchSize); ?>" min="5" max="200" class="small-text">
                                <p class="description">برای پیشگیری از اتمام زمان اجرای PHP و حافظه RAM (توصیه: ۲۰ تا ۵۰).</p>
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
                            <th scope="row">قابلیت بازگردانی (Rollback)</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="enable_rollback" value="1" <?php checked($enableRollback, 1); ?>>
                                    <strong>فعال بودن قابلیت بازگردانی تغییرات (Rollback)</strong>
                                </label>
                                <p class="description">امکان بازگردانی کلیه فیلدهای تغییریافته به مقادیر پیش از ویرایش گروهی.</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">ثبت لاگ حسابرسی (Audit Log)</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="audit_log_enabled" value="1" <?php checked($auditLog, 1); ?>>
                                    <strong>ثبت اسنپ‌شات کامل اقلام قبل و بعد از تغییر در پایگاه داده</strong>
                                </label>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- ۲. منبع برند محصول -->
                <h2 class="title" style="margin-top: 35px; border-bottom: 1px solid #dcdcde; padding-bottom: 8px;">🏢 منبع ذخیره و خواندن برند محصول (Product Brand Source)</h2>
                <p class="description">مشخص کنید مقدار برند محصولات در جدول ویرایش سریع و عملیات گروهی از کدام بخش ووکامرس خوانده و ذخیره شود:</p>
                <table class="form-table" role="presentation">
                    <tbody>
                        <tr>
                            <th scope="row">نحوه مدیریت برند</th>
                            <td>
                                <fieldset>
                                    <label style="display: block; margin-bottom: 8px;">
                                        <input type="radio" name="brand_source" value="taxonomy" <?php checked($brandSource, 'taxonomy'); ?>>
                                        <strong>بخش برند اختصاصی ووکامرس (WooCommerce Brands / تاکسونومی رسمی)</strong>
                                        <span class="description" style="display:block; margin-right: 22px;">برند کالاها مستقیماً از بخش برندهای خود ووکامرس (تاکسونومی <code>product_brand</code>) خوانده می‌شود.</span>
                                    </label>
                                    <label style="display: block;">
                                        <input type="radio" name="brand_source" value="attribute" <?php checked($brandSource, 'attribute'); ?>>
                                        <strong>ویژگی‌های اختصاصی محصول (Product Attributes / مثلاً pa_brands)</strong>
                                        <span class="description" style="display:block; margin-right: 22px;">برند کالاها از ویژگی‌های محصول استخراج و در آن ذخیره خواهد شد.</span>
                                    </label>
                                </fieldset>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="brand_taxonomy">نام تاکسونومی برند (Taxonomy Name)</label></th>
                            <td>
                                <input name="brand_taxonomy" type="text" id="brand_taxonomy" value="<?php echo esc_attr($brandTaxonomy); ?>" class="regular-text code">
                                <p class="description">پیش‌فرض‌های رایج: <code>product_brand</code> ، <code>pwb-brand</code> ، <code>yith_product_brand</code></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="brand_attribute">نام اسلاگ ویژگی برند (Attribute Slug)</label></th>
                            <td>
                                <input name="brand_attribute" type="text" id="brand_attribute" value="<?php echo esc_attr($brandAttribute); ?>" class="regular-text code">
                                <p class="description">پیش‌فرض‌های رایج ویژگی: <code>pa_brands</code> ، <code>pa_brand</code> ، <code>brand</code></p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- ۳. تنظیمات آداپتور درگاه‌های اقساطی -->
                <h2 class="title" style="margin-top: 35px; border-bottom: 1px solid #dcdcde; padding-bottom: 8px;">💳 تنظیمات لایه آداپتور درگاه‌ها (Gateway Adapters)</h2>
                
                <div style="background: #e7f7ed; border: 1px solid #82d89f; padding: 12px 16px; border-radius: 4px; margin-bottom: 15px; font-size: 13px;">
                    <strong>پیکربندی منطبق با کد functions.php سایت شما:</strong>
                    <p style="margin: 4px 0 8px 0; color: #1e4620;">کد قالب شما از متادیتاهای <code>_disable_snappay</code> و <code>_disable_torobpay</code> با منطق چک‌باکس غیرفعال‌سازی استفاده می‌کند.</p>
                    <button type="button" class="button button-secondary" onclick="
                        document.getElementById('snappay_meta_key').value = '_disable_snappay';
                        document.getElementById('snappay_mode').value = 'disable_flag';
                        document.getElementById('torob_meta_key').value = '_disable_torobpay';
                        document.getElementById('torob_mode').value = 'disable_flag';
                        alert('تنظیمات کد سایت شما با موفقیت در فیلدها درج گردید. لطفاً روی دکمه ذخیره کلیک کنید.');
                    ">اعمال خودکار تنظیمات کد قالب شما</button>
                </div>

                <table class="form-table" role="presentation">
                    <tbody>
                        <tr>
                            <th scope="row"><label for="snappay_meta_key">آداپتور اسنپ‌پی (Snappay Adapter)</label></th>
                            <td>
                                <input name="snappay_meta_key" type="text" id="snappay_meta_key" value="<?php echo esc_attr($snappayKey); ?>" class="regular-text code">
                                <select name="snappay_mode" id="snappay_mode" style="margin-right: 10px;">
                                    <option value="disable_flag" <?php selected($snappayMode, 'disable_flag'); ?>>منطق غیرفعال‌سازی (yes = غیرفعال، no = فعال)</option>
                                    <option value="enable_flag" <?php selected($snappayMode, 'enable_flag'); ?>>منطق فعال‌سازی مستقیم (yes = فعال، no = غیرفعال)</option>
                                </select>
                                <p class="description">نام کلید متای کالا در دیتابیس (پیش‌فرض منطبق با قالب شما: <code>_disable_snappay</code>).</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="torob_meta_key">آداپتور پرداخت سریع ترب (Torob Pay Adapter)</label></th>
                            <td>
                                <input name="torob_meta_key" type="text" id="torob_meta_key" value="<?php echo esc_attr($torobKey); ?>" class="regular-text code">
                                <select name="torob_mode" id="torob_mode" style="margin-right: 10px;">
                                    <option value="disable_flag" <?php selected($torobMode, 'disable_flag'); ?>>منطق غیرفعال‌سازی (yes = غیرفعال، no = فعال)</option>
                                    <option value="enable_flag" <?php selected($torobMode, 'enable_flag'); ?>>منطق فعال‌سازی مستقیم (yes = فعال، no = غیرفعال)</option>
                                </select>
                                <p class="description">نام کلید متای کالا در دیتابیس (پیش‌فرض منطبق با قالب شما: <code>_disable_torobpay</code>).</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">فیلتر خودکار تسویه‌حساب (Checkout)</th>
                            <td>
                                <label>
                                    <input type="checkbox" name="enable_checkout_filter" value="1" <?php checked($enableFilter, 1); ?>>
                                    حذف خودکار درگاه‌های اقساطی از تسویه‌حساب در صورتی که حداقل یک کالای نامجاز در سبد باشد.
                                </label>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">شورت‌کد نشان‌های اقساطی</th>
                            <td>
                                <code>[installment_badges]</code>
                                <p class="description">نمونه با تعداد اقساط دلخواه: <code>[installment_badges snapp_count="4" torob_count="4"]</code></p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- ۴. قوانین قیمت‌گذاری و رندسازی -->
                <h2 class="title" style="margin-top: 35px; border-bottom: 1px solid #dcdcde; padding-bottom: 8px;">📊 قوانین قیمت‌گذاری و رندسازی</h2>
                <table class="form-table" role="presentation">
                    <tbody>
                        <tr>
                            <th scope="row"><label for="price_round_unit">واحد پیش‌فرض گرد کردن قیمت‌ها (تومان)</label></th>
                            <td>
                                <select name="price_round_unit" id="price_round_unit">
                                    <option value="1" <?php selected($priceRoundUnit, 1); ?>>بدون رند کردن (دقیق)</option>
                                    <option value="1000" <?php selected($priceRoundUnit, 1000); ?>>نزدیک‌ترین ۱,۰۰۰ تومان (پیشنهادی فروشگاه‌های ایران)</option>
                                    <option value="5000" <?php selected($priceRoundUnit, 5000); ?>>نزدیک‌ترین ۵,۰۰۰ تومان</option>
                                    <option value="10000" <?php selected($priceRoundUnit, 10000); ?>>نزدیک‌ترین ۱۰,۰۰۰ تومان</option>
                                </select>
                                <p class="description">در هنگام اعمال درصد تخفیف یا افزایش قیمت در ویزارد و جدول استفاده می‌شود.</p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- ۵. سیاست پاکسازی هنگام حذف افزونه -->
                <h2 class="title" style="margin-top: 35px; border-bottom: 1px solid #dcdcde; padding-bottom: 8px; color: #d63638;">🗑️ سیاست پاکسازی هنگام حذف افزونه (Uninstall Policy)</h2>
                <table class="form-table" role="presentation">
                    <tbody>
                        <tr>
                            <th scope="row">حذف کامل داده‌ها</th>
                            <td>
                                <label style="color: #b32d2e;">
                                    <input type="checkbox" name="delete_data_on_uninstall" value="1" <?php checked($deleteUninstall, 1); ?>>
                                    <strong>حذف کامل تمام جداول، تاریخچه‌ها و تنظیمات هنگام حذف قطعی (Uninstall) افزونه از وردپرس</strong>
                                </label>
                                <p class="description">به صورت پیش‌فرض غیرفعال است تا داده‌ها در صورت حذف تصادفی از بین نروند.</p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <?php submit_button('ذخیره کلیه تنظیمات'); ?>
            </form>
        </div>
        <?php
    }
}
