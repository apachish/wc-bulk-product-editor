<?php
/**
 * مدیریت اقساط اسنپ‌پی و ترب‌پی برای محصولات ووکامرس
 * سازگار با کد سفارشی functions.php و ماژول ادغام ووکامرس
 * 
 * شورت‌کد:
 * [installment_badges]
 * نمونه تعداد اقساط متفاوت:
 * [installment_badges snapp_count="4" torob_count="4"]
 * نمونه با آیکن اختصاصی:
 * [installment_badges snapp_count="4" torob_count="4" snapp_icon="https://site.com/snapp-pay.png" torob_icon="https://site.com/torob-pay.png"]
 */

declare(strict_types=1);

namespace WCBulkEditor\Integrations;

if (!defined('ABSPATH')) {
    exit;
}

class InstallmentGatewayManager {
    public static function init(): void {
        // ۱) افزودن چک‌باکس در ویرایش محصول ووکامرس (هم برای ساده در همگانی و هم متغیر در تب پیشرفته)
        add_action('woocommerce_product_options_general_product_data', [self::class, 'addProductFields']);
        add_action('woocommerce_product_options_advanced', [self::class, 'addProductFields']);

        // ۲) ذخیره ایمن وضعیت چک‌باکس‌های محصول در صفحه ویرایش محصول (بدون پاک شدن مقدار قبلی)
        add_action('woocommerce_process_product_meta', [self::class, 'saveProductFields']);

        // ۳) افزودن فیلدهای اقساط به ویرایش سریع (Quick Edit) لیست محصولات
        add_action('woocommerce_product_quick_edit_end', [self::class, 'addQuickEditFields']);

        // ۴) ذخیره مقادیر در ویرایش سریع با جلوگیری قطعی از باگ پاک شدن مقدار ذخیره شده
        add_action('woocommerce_product_quick_edit_save', [self::class, 'saveQuickEditFields']);

        // ۵) بارگذاری مقادیر ذخیره‌شده در چک‌باکس‌های ویرایش سریع هنگام باز شدن در پیشخوان
        add_action('manage_product_posts_custom_column', [self::class, 'renderQuickEditRowData'], 10, 2);
        add_action('admin_footer-edit.php', [self::class, 'renderQuickEditJs']);

        // ۶) حذف درگاه پرداخت از تسویه‌حساب (Checkout) در صورت غیرفعال بودن برای حداقل یک کالا
        add_filter('woocommerce_available_payment_gateways', [self::class, 'disableGatewaysInCheckout'], 999);

        // ۷) شورت‌کد نشان‌های اقساطی [installment_badges]
        add_shortcode('installment_badges', [self::class, 'renderInstallmentBadges']);
    }

    public static function addProductFields(): void {
        // در صورت تعریف در functions.php تکراری چاپ نشود
        static $rendered = false;
        if ($rendered) {
            return;
        }
        $rendered = true;

        echo '<div class="options_group wc-bpe-installment-fields">';
        echo '<input type="hidden" name="wc_bpe_installment_fields_present" value="1" />';

        woocommerce_wp_checkbox([
            'id'          => '_disable_snappay',
            'label'       => 'غیرفعال‌سازی اسنپ‌پی برای این محصول',
            'description' => 'با تیک زدن، اسنپ‌پی برای این محصول غیرفعال و از تسویه‌حساب حذف می‌شود.',
            'desc_tip'    => true,
        ]);

        woocommerce_wp_checkbox([
            'id'          => '_disable_torobpay',
            'label'       => 'غیرفعال‌سازی ترب‌پی برای این محصول',
            'description' => 'با تیک زدن، ترب‌پی برای این محصول غیرفعال و از تسویه‌حساب حذف می‌شود.',
            'desc_tip'    => true,
        ]);

        echo '</div>';
    }

    public static function saveProductFields(int $postId): void {
        // امنیت داده‌ها: اگر فیلدهای اقساط در فرم حضور نداشتند (مثلاً ذخیره از تب‌های دیگر، ایجکس، یا ذخیره بدون حضور فیلد)،
        // مقدار ذخیره‌شده قبلی را به هیچ وجه تغییر نده و از پاک شدن آن جلوگیری کن!
        if (!isset($_POST['wc_bpe_installment_fields_present'])) {
            return;
        }

        $disableSnappay  = isset($_POST['_disable_snappay']) ? 'yes' : 'no';
        $disableTorobpay = isset($_POST['_disable_torobpay']) ? 'yes' : 'no';

        update_post_meta($postId, '_disable_snappay', $disableSnappay);
        update_post_meta($postId, '_disable_torobpay', $disableTorobpay);
    }

    public static function addQuickEditFields(): void {
        static $rendered = false;
        if ($rendered) {
            return;
        }
        $rendered = true;
        ?>
        <div class="inline-edit-group wc-bpe-quick-edit-installment" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #ddd;">
            <input type="hidden" name="wc_bpe_quick_edit_present" value="1" />
            <label class="alignleft" style="margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                <input type="checkbox" name="_disable_snappay" value="yes" class="wc-bpe-qe-snappay" />
                <span class="checkbox-title" style="font-weight: 600;">غیرفعال‌سازی اسنپ‌پی (_disable_snappay)</span>
            </label>
            <div class="clear"></div>
            <label class="alignleft" style="margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
                <input type="checkbox" name="_disable_torobpay" value="yes" class="wc-bpe-qe-torobpay" />
                <span class="checkbox-title" style="font-weight: 600;">غیرفعال‌سازی ترب‌پی (_disable_torobpay)</span>
            </label>
            <div class="clear"></div>
        </div>
        <?php
    }

    public static function renderQuickEditRowData(string $column, int $postId): void {
        if ($column === 'name' || $column === 'thumb') {
            $snappay = (string) get_post_meta($postId, '_disable_snappay', true);
            $torobpay = (string) get_post_meta($postId, '_disable_torobpay', true);
            echo '<div class="hidden wc-bpe-qe-values" style="display:none;" data-snappay="' . esc_attr($snappay) . '" data-torobpay="' . esc_attr($torobpay) . '"></div>';
        }
    }

    public static function renderQuickEditJs(): void {
        global $current_screen;
        if (!$current_screen || $current_screen->post_type !== 'product') {
            return;
        }
        ?>
        <script type="text/javascript">
        jQuery(function($) {
            if (typeof inlineEditPost === 'undefined') return;
            var wp_inline_edit = inlineEditPost.edit;
            inlineEditPost.edit = function(id) {
                wp_inline_edit.apply(this, arguments);
                var postId = 0;
                if (typeof(id) === 'object') {
                    postId = parseInt(this.getId(id), 10);
                }
                if (postId > 0) {
                    var $row = $('#post-' + postId);
                    var $editRow = $('#edit-' + postId);
                    var $data = $row.find('.wc-bpe-qe-values');
                    if ($data.length) {
                        var snappay = $data.data('snappay');
                        var torobpay = $data.data('torobpay');
                        $editRow.find('input[name="_disable_snappay"]').prop('checked', snappay === 'yes');
                        $editRow.find('input[name="_disable_torobpay"]').prop('checked', torobpay === 'yes');
                    }
                }
            };
        });
        </script>
        <?php
    }

    public static function saveQuickEditFields($product): void {
        if (!is_object($product)) {
            $product = wc_get_product($product);
        }
        if (!$product) {
            return;
        }
        $productId = $product->get_id();

        // جلوگیری قطعی از پاک شدن داده‌ها: فقط در صورتی که فیلدهای ما در فرم حضور داشته باشند ذخیره کن
        if (!isset($_REQUEST['wc_bpe_quick_edit_present'])) {
            return;
        }

        // اگر تیک زده باشد: مقدار yes (غیرفعال)
        // اگر تیک را برداشته باشد: مقدار no (فعال)
        $disableSnappay  = isset($_REQUEST['_disable_snappay']) ? 'yes' : 'no';
        $disableTorobpay = isset($_REQUEST['_disable_torobpay']) ? 'yes' : 'no';

        update_post_meta($productId, '_disable_snappay', $disableSnappay);
        update_post_meta($productId, '_disable_torobpay', $disableTorobpay);
    }

    public static function isSnappayGateway(string $gatewayId, $gateway = null): bool {
        $gatewayId    = strtolower($gatewayId);
        $gatewayClass = is_object($gateway) ? strtolower(get_class($gateway)) : '';

        $snappIds = ['snapppay', 'snapp_pay', 'snapp-pay', 'snapp'];
        foreach ($snappIds as $id) {
            if ($gatewayId === $id) {
                return true;
            }
        }

        if (strpos($gatewayClass, 'snapp') !== false) {
            return true;
        }

        return false;
    }

    public static function isTorobpayGateway(string $gatewayId, $gateway = null): bool {
        $gatewayId    = strtolower($gatewayId);
        $gatewayClass = is_object($gateway) ? strtolower(get_class($gateway)) : '';

        $torobIds = ['torobpay', 'torob_pay', 'torob-pay', 'torob'];
        foreach ($torobIds as $id) {
            if ($gatewayId === $id) {
                return true;
            }
        }

        if (strpos($gatewayClass, 'torob') !== false) {
            return true;
        }

        return false;
    }

    public static function disableGatewaysInCheckout(array $gateways): array {
        // در بخش مدیریت وردپرس اجرا نشود
        if (is_admin() && !defined('DOING_AJAX')) {
            return $gateways;
        }

        // اطمینان از فعال‌بودن ووکامرس و وجود سبد خرید
        if (!function_exists('WC') || !WC() || !WC()->cart) {
            return $gateways;
        }

        if (WC()->cart->is_empty()) {
            return $gateways;
        }

        $hasDisabledSnappayProduct  = false;
        $hasDisabledTorobpayProduct = false;

        $snappayKey = get_option('wc_bpe_snappay_meta_key', '_disable_snappay');
        $torobKey   = get_option('wc_bpe_torob_meta_key', '_disable_torobpay');

        foreach (WC()->cart->get_cart() as $cartItem) {
            $productId = 0;
            if (isset($cartItem['product_id'])) {
                $productId = absint($cartItem['product_id']);
            }

            if (!$productId) {
                continue;
            }

            // بررسی متای محصول (هم _disable_snappay پیش‌فرض و هم کلید سفارشی تنظیمی)
            if (get_post_meta($productId, '_disable_snappay', true) === 'yes' || get_post_meta($productId, $snappayKey, true) === 'yes') {
                $hasDisabledSnappayProduct = true;
            }

            if (get_post_meta($productId, '_disable_torobpay', true) === 'yes' || get_post_meta($productId, $torobKey, true) === 'yes') {
                $hasDisabledTorobpayProduct = true;
            }

            // اگر هر دو درگاه باید حذف شوند، ادامه بررسی لازم نیست
            if ($hasDisabledSnappayProduct && $hasDisabledTorobpayProduct) {
                break;
            }
        }

        // حذف درگاه‌های غیرمجاز
        foreach ($gateways as $gatewayId => $gateway) {
            if ($hasDisabledSnappayProduct && self::isSnappayGateway((string) $gatewayId, $gateway)) {
                unset($gateways[$gatewayId]);
            }

            if ($hasDisabledTorobpayProduct && self::isTorobpayGateway((string) $gatewayId, $gateway)) {
                unset($gateways[$gatewayId]);
            }
        }

        return $gateways;
    }

    public static function renderInstallmentBadges(array $atts = []): string {
        $atts = shortcode_atts([
            'snapp_count' => '4',
            'torob_count' => '4',
            'snapp_icon'  => '',
            'torob_icon'  => '',
        ], $atts, 'installment_badges');

        global $product;
        if (!$product instanceof \WC_Product) {
            return '';
        }

        $pId = $product->get_id();
        $isSnappDisabled = get_post_meta($pId, '_disable_snappay', true) === 'yes';
        $isTorobDisabled = get_post_meta($pId, '_disable_torobpay', true) === 'yes';

        if ($isSnappDisabled && $isTorobDisabled) {
            return '';
        }

        ob_start();
        ?>
        <div class="wc-bpe-installment-badges" style="margin: 15px 0; display: flex; flex-wrap: wrap; gap: 10px; direction: rtl;">
            <?php if (!$isSnappDisabled): ?>
                <div class="installment-badge snapp-badge" style="display: inline-flex; align-items: center; gap: 8px; border: 1px solid #bfdbfe; background: #eff6ff; border-radius: 6px; padding: 6px 12px; font-size: 12px; color: #1e40af;">
                    <?php if (!empty($atts['snapp_icon'])): ?>
                        <img src="<?php echo esc_url($atts['snapp_icon']); ?>" alt="اسنپ‌پی" style="height: 22px; width: auto; vertical-align: middle;">
                    <?php else: ?>
                        <span style="background: #2563eb; color: #fff; padding: 2px 7px; border-radius: 4px; font-weight: bold; font-size: 11px;">اسنپ‌پی</span>
                    <?php endif; ?>
                    <span>پرداخت در <strong><?php echo esc_html($atts['snapp_count']); ?> قسط</strong> بدون کارمزد</span>
                </div>
            <?php endif; ?>

            <?php if (!$isTorobDisabled): ?>
                <div class="installment-badge torob-badge" style="display: inline-flex; align-items: center; gap: 8px; border: 1px solid #fecaca; background: #fef2f2; border-radius: 6px; padding: 6px 12px; font-size: 12px; color: #991b1b;">
                    <?php if (!empty($atts['torob_icon'])): ?>
                        <img src="<?php echo esc_url($atts['torob_icon']); ?>" alt="ترب‌پی" style="height: 22px; width: auto; vertical-align: middle;">
                    <?php else: ?>
                        <span style="background: #dc2626; color: #fff; padding: 2px 7px; border-radius: 4px; font-weight: bold; font-size: 11px;">ترب‌پی</span>
                    <?php endif; ?>
                    <span>خرید اعتباری و اقساط <strong><?php echo esc_html($atts['torob_count']); ?> ماهه</strong></span>
                </div>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean() ?: '';
    }
}

// ثبت هوک‌های اصلی ماژول
InstallmentGatewayManager::init();

// تعریف توابع با پیش‌وند استاندارد my_ برای سازگاری ۱۰۰٪ با کدهای قبلی کاربر
if (!function_exists('my_installment_product_fields')) {
    function my_installment_product_fields() {
        InstallmentGatewayManager::addProductFields();
    }
}
if (!function_exists('my_installment_save_product_fields')) {
    function my_installment_save_product_fields($post_id) {
        InstallmentGatewayManager::saveProductFields((int) $post_id);
    }
}
if (!function_exists('my_is_snappay_gateway')) {
    function my_is_snappay_gateway($gateway_id, $gateway = null) {
        return InstallmentGatewayManager::isSnappayGateway((string) $gateway_id, $gateway);
    }
}
if (!function_exists('my_is_torobpay_gateway')) {
    function my_is_torobpay_gateway($gateway_id, $gateway = null) {
        return InstallmentGatewayManager::isTorobpayGateway((string) $gateway_id, $gateway);
    }
}
if (!function_exists('my_disable_installment_gateways_in_checkout')) {
    function my_disable_installment_gateways_in_checkout($gateways) {
        return InstallmentGatewayManager::disableGatewaysInCheckout((array) $gateways);
    }
}
