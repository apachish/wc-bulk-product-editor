<?php
declare(strict_types=1);

namespace WCBulkEditor\Admin;

use WCBulkEditor\Engine\ChangeSetEngine;
use WCBulkEditor\Processor\BatchProcessor;
use WCBulkEditor\Rollback\RollbackManager;
use WCBulkEditor\Integrations\AdapterRegistry;
use WCBulkEditor\Database\Activator;
use WC_Product;

if (!defined('ABSPATH')) {
    exit;
}

class AdminAjax {
    public static function register(): void {
        add_action('wp_ajax_wc_bpe_get_products', [self::class, 'handleGetProducts']);
        add_action('wp_ajax_wc_bpe_get_all_product_ids', [self::class, 'handleGetAllProductIds']);
        add_action('wp_ajax_wc_bpe_get_products_by_ids', [self::class, 'handleGetProductsByIds']);
        add_action('wp_ajax_wc_bpe_preview_changes', [self::class, 'handlePreview']);
        add_action('wp_ajax_wc_bpe_process_batch', [self::class, 'handleBatch']);
        add_action('wp_ajax_wc_bpe_rollback_operation', [self::class, 'handleRollback']);
        add_action('wp_ajax_wc_bpe_save_inline_product', [self::class, 'handleInlineSave']);
        add_action('wp_ajax_wc_bpe_save_settings', [self::class, 'handleSaveSettings']);
        add_action('wp_ajax_wc_bpe_get_history', [self::class, 'handleGetHistory']);
    }

    private static function verifySecurity(): void {
        check_ajax_referer('wc_bpe_nonce', 'nonce');
        if (!current_user_can('manage_woocommerce') && !current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'سطح دسترسی غیرمجاز است.'], 403);
        }
    }

    private static function resolveCategoryTerm(string $raw) {
        $clean = trim(html_entity_decode($raw, ENT_QUOTES, 'UTF-8'));
        if ($clean === '') {
            return null;
        }

        if (ctype_digit($clean)) {
            $byId = get_term((int) $clean, 'product_cat');
            if ($byId && !is_wp_error($byId)) {
                return $byId;
            }
        }

        $term = get_term_by('name', $clean, 'product_cat') ?: get_term_by('slug', $clean, 'product_cat');
        if ($term && !is_wp_error($term)) {
            return $term;
        }

        $normalize = function (string $v): string {
            return trim(str_replace(['ي', 'ك', "\u{200C}"], ['ی', 'ک', ' '], mb_strtolower($v, 'UTF-8')));
        };
        $allCats = get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false]);
        if (!is_wp_error($allCats) && is_array($allCats)) {
            $target = $normalize($clean);
            foreach ($allCats as $t) {
                if ($normalize((string) $t->name) === $target || strcasecmp($t->slug, $clean) === 0) {
                    return $t;
                }
            }
        }
        return null;
    }

    /**
     * منبع برند طبق تنظیمات افزونه:
     *  - taxonomy  => برندهای ووکامرس (مثلاً product_brand)
     *  - attribute => ویژگی محصول (مثلاً pa_brands)
     */
    private static function brandSourceInfo(): array {
        static $cache = null;
        if ($cache !== null) {
            return $cache;
        }
        $source = get_option('wc_bpe_brand_source', 'taxonomy') === 'attribute' ? 'attribute' : 'taxonomy';
        $tax    = '';

        if ($source === 'attribute') {
            $candidates = [(string) get_option('wc_bpe_brand_attribute', 'pa_brands'), 'pa_brands', 'pa_brand'];
        } else {
            $candidates = [(string) get_option('wc_bpe_brand_taxonomy', 'product_brand'), 'product_brand', 'pwb-brand', 'yith_product_brand'];
        }

        foreach ($candidates as $cand) {
            $cand = trim($cand);
            if ($cand === '') {
                continue;
            }
            $try = [$cand];
            if ($source === 'attribute' && strpos($cand, 'pa_') !== 0) {
                array_unshift($try, 'pa_' . $cand);
            }
            foreach ($try as $t) {
                if (taxonomy_exists($t)) {
                    $tax = $t;
                    break 2;
                }
            }
        }

        $cache = ['source' => $source, 'taxonomy' => $tax];
        return $cache;
    }

    private static function getBrandDetails(): array {
        $info = self::brandSourceInfo();
        if ($info['taxonomy'] === '') {
            return [];
        }
        $terms = get_terms(['taxonomy' => $info['taxonomy'], 'hide_empty' => false]);
        if (is_wp_error($terms) || empty($terms)) {
            return [];
        }
        $list = [];
        foreach ($terms as $t) {
            $list[] = [
                'name'  => html_entity_decode((string) $t->name, ENT_QUOTES, 'UTF-8'),
                'slug'  => (string) $t->slug,
                'count' => (int) $t->count,
            ];
        }
        usort($list, function ($a, $b) {
            return strcasecmp($a['name'], $b['name']);
        });
        return $list;
    }

    private static function parseFilters(): array {
        $text = function (string $key): string {
            return sanitize_text_field(wp_unslash((string) ($_POST[$key] ?? '')));
        };

        $rawCats = $_POST['categories'] ?? [];
        if (!is_array($rawCats)) {
            $rawCats = [$rawCats];
        }
        if (empty($rawCats) && !empty($_POST['category']) && !is_array($_POST['category'])) {
            $rawCats = [$_POST['category']]; // سازگاری با نسخه قدیمی (تک‌دسته)
        }
        $cats = [];
        foreach ($rawCats as $c) {
            if (is_array($c)) {
                continue;
            }
            $c = trim(sanitize_text_field(wp_unslash((string) $c)));
            if ($c !== '') {
                $cats[] = $c;
            }
        }

        $rawBrands = $_POST['brands'] ?? [];
        if (!is_array($rawBrands)) {
            $rawBrands = [$rawBrands];
        }
        if (empty($rawBrands) && !empty($_POST['brand']) && !is_array($_POST['brand'])) {
            $rawBrands = [$_POST['brand']];
        }
        $brands = [];
        foreach ($rawBrands as $b) {
            if (is_array($b)) {
                continue;
            }
            $b = trim(sanitize_text_field(wp_unslash((string) $b)));
            if ($b !== '') {
                $brands[] = $b;
            }
        }

        return [
            'search'      => $text('search'),
            'brands'      => array_values(array_unique($brands)),
            'status'      => $text('status'),
            'stockStatus' => $text('stockStatus'),
            'type'        => $text('type'),
            'categories'  => array_values(array_unique($cats)),
            'catMode'     => (($_POST['cat_mode'] ?? 'or') === 'and') ? 'and' : 'or',
            'preset'      => sanitize_key((string) ($_POST['preset'] ?? 'all')),
        ];
    }

    private static function buildQueryArgs(array $f): array {
        $stockStatus = $f['stockStatus'];
        $type        = $f['type'];

        $queryArgs = [
            'status' => !empty($f['status']) ? [$f['status']] : ['publish', 'draft', 'pending', 'private', 'future'],
        ];

        // فیلترهای سریع (Preset) سمت سرور تا با صفحه‌بندی هماهنگ باشند
        switch ($f['preset']) {
            case 'instock':
            case 'outofstock':
                if (empty($stockStatus)) {
                    $stockStatus = $f['preset'];
                }
                break;
            case 'variable':
            case 'simple':
                if (empty($type)) {
                    $type = $f['preset'];
                }
                break;
            case 'on_sale':
                $saleIds = function_exists('wc_get_product_ids_on_sale') ? array_map('intval', (array) wc_get_product_ids_on_sale()) : [];
                $queryArgs['include'] = !empty($saleIds) ? $saleIds : [0];
                break;
        }

        if (!empty($f['search'])) {
            $queryArgs['s'] = $f['search'];
        }
        if (!empty($stockStatus)) {
            $queryArgs['stock_status'] = $stockStatus;
        }
        if (!empty($type)) {
            $queryArgs['type'] = $type;
        }

        $taxQueries = [];

        // دسته‌بندی‌های چندگانه: OR = هرکدام، AND = همه همزمان
        if (!empty($f['categories'])) {
            $catIds     = [];
            $unresolved = false;
            foreach ($f['categories'] as $rawCat) {
                $term = self::resolveCategoryTerm((string) $rawCat);
                if ($term) {
                    $catIds[] = (int) $term->term_id;
                } else {
                    $unresolved = true;
                }
            }
            $catIds = array_values(array_unique($catIds));

            if (empty($catIds) || ($f['catMode'] === 'and' && $unresolved)) {
                $queryArgs['include'] = [0]; // هیچ نتیجه‌ای
            } elseif ($f['catMode'] === 'and') {
                // هر دسته یک شرط جداگانه تا include_children برای هرکدام مستقل کار کند
                foreach ($catIds as $cid) {
                    $taxQueries[] = [
                        'taxonomy'         => 'product_cat',
                        'field'            => 'term_id',
                        'terms'            => [$cid],
                        'include_children' => true,
                        'operator'         => 'IN',
                    ];
                }
            } else {
                $taxQueries[] = [
                    'taxonomy'         => 'product_cat',
                    'field'            => 'term_id',
                    'terms'            => $catIds,
                    'include_children' => true,
                    'operator'         => 'IN',
                ];
            }
        }

        // برندهای چندگانه (هرکدام) فقط از منبعی که در تنظیمات انتخاب شده است
        if (!empty($f['brands'])) {
            $info     = self::brandSourceInfo();
            $brandIds = [];
            if ($info['taxonomy'] !== '') {
                foreach ($f['brands'] as $bn) {
                    $bTerm = get_term_by('name', $bn, $info['taxonomy']) ?: get_term_by('slug', $bn, $info['taxonomy']);
                    if ($bTerm && !is_wp_error($bTerm)) {
                        $brandIds[] = (int) $bTerm->term_id;
                    }
                }
            }
            if (empty($brandIds)) {
                $queryArgs['include'] = [0];
            } else {
                $taxQueries[] = [
                    'taxonomy' => $info['taxonomy'],
                    'field'    => 'term_id',
                    'terms'    => array_values(array_unique($brandIds)),
                    'operator' => 'IN',
                ];
            }
        }

        if (!empty($taxQueries)) {
            $queryArgs['tax_query'] = count($taxQueries) > 1 ? array_merge(['relation' => 'AND'], $taxQueries) : $taxQueries;
        }

        return $queryArgs;
    }

    public static function handleGetAllProductIds(): void {
        self::verifySecurity();

        $queryArgs           = self::buildQueryArgs(self::parseFilters());
        $queryArgs['limit']  = 99999;
        $queryArgs['return'] = 'ids';

        $ids = wc_get_products($queryArgs);
        if (!is_array($ids)) {
            $ids = [];
        }
        wp_send_json_success(['ids' => array_map('intval', $ids), 'total' => count($ids)]);
    }

    private static function serializeProduct(WC_Product $product, array $adapters, bool $withVariations = true): array {
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
                $catNames[] = html_entity_decode((string) $t->name, ENT_QUOTES, 'UTF-8');
            }
        }
        $catString = !empty($catNames) ? implode(', ', $catNames) : 'بدون دسته‌بندی';

        // استخراج هوشمند و چندلایه برند (پوشش کامل تاکسونومی‌ها، ویژگی‌ها و متادیتا)
        $brandSource   = get_option('wc_bpe_brand_source', 'taxonomy');
        $brandTaxonomy = get_option('wc_bpe_brand_taxonomy', 'product_brand');
        $brandAttr     = get_option('wc_bpe_brand_attribute', 'pa_brands');

        $brand = '';

        // منبع اصلی طبق تنظیمات (برند ووکامرس یا ویژگی محصول)
        $brandInfo = self::brandSourceInfo();
        if ($brandInfo['taxonomy'] !== '') {
            $primaryTerms = get_the_terms($pId, $brandInfo['taxonomy']);
            if (!is_wp_error($primaryTerms) && !empty($primaryTerms)) {
                $brand = implode('، ', wp_list_pluck($primaryTerms, 'name'));
            }
        }

        // ۱. بررسی تاکسونومی‌های برند (اختصاصی، ووکامرس و افزونه‌های معتبر برند)
        $candidateTaxonomies = array_unique([$brandTaxonomy, 'product_brand', 'pa_brand', 'pa_brands', 'pwb-brand', 'yith_product_brand', 'brand']);
        foreach ($brand === '' ? $candidateTaxonomies : [] as $cTax) {
            if (taxonomy_exists($cTax)) {
                $bTerms = get_the_terms($pId, $cTax);
                if (!is_wp_error($bTerms) && !empty($bTerms)) {
                    $brand = implode('، ', wp_list_pluck($bTerms, 'name'));
                    if (!empty($brand)) break;
                }
            }
        }

        // ۲. اگر یافت نشد، بررسی ویژگی‌های محصول (Attributes چه سراسری چه سفارشی مانند برند یا pa_brands)
        if (empty($brand)) {
            $candidateAttrs = array_unique([$brandAttr, 'pa_brand', 'pa_brands', 'brand', 'برند', 'برندها']);
            foreach ($candidateAttrs as $cAttr) {
                $attrVal = (string) $product->get_attribute($cAttr);
                if (!empty($attrVal)) {
                    $brand = $attrVal;
                    break;
                }
            }
        }

        // ۳. بررسی ویژگی‌های ذخیره شده در _product_attributes مستقیم
        if (empty($brand)) {
            $rawAttrs = (array) $product->get_attributes();
            foreach ($rawAttrs as $k => $attrObj) {
                if (in_array(strtolower((string) $k), ['brand', 'برند', 'pa_brand', 'pa_brands'], true)) {
                    if (is_object($attrObj) && method_exists($attrObj, 'get_options')) {
                        $opts = $attrObj->get_options();
                        if (!empty($opts)) {
                            $brand = is_array($opts) ? implode('، ', $opts) : (string) $opts;
                            break;
                        }
                    }
                }
            }
        }

        // ۴. در نهایت بررسی فیلدهای متای محصول
        if (empty($brand)) {
            $brand = (string) $product->get_meta('_product_brand', true);
        }
        if (empty($brand)) {
            $brand = (string) $product->get_meta('brand', true);
        }

        $variations = [];
        if ($withVariations && $product->is_type('variable')) {
            foreach ($product->get_children() as $varId) {
                $variation = wc_get_product($varId);
                if ($variation) {
                    $rawVarStock = get_post_meta($varId, '_stock', true);
                    $varQty = $variation->get_stock_quantity();
                    if ($varQty === null || $varQty === '') {
                        $varQty = ($rawVarStock !== '' && $rawVarStock !== null && is_numeric($rawVarStock)) ? (int) $rawVarStock : 0;
                    } else {
                        $varQty = (int) $varQty;
                    }

                    $variations[] = [
                        'id'             => $variation->get_id(),
                        'parentId'       => $pId,
                        'sku'            => $variation->get_sku() ?: '',
                        'name'           => $variation->get_name(),
                        'attributes'     => $variation->get_attributes(),
                        'regularPrice'   => (float) $variation->get_regular_price(),
                        'salePrice'      => $variation->get_sale_price() !== '' ? (float) $variation->get_sale_price() : null,
                        'manageStock'    => $variation->managing_stock(),
                        'stockQuantity'  => $varQty,
                        'stockStatus'    => $variation->get_stock_status(),
                        'snappayEnabled' => isset($adapters['snappay']) ? $adapters['snappay']->getValue($variation) : false,
                        'torobPayEnabled'=> isset($adapters['torob_pay']) ? $adapters['torob_pay']->getValue($variation) : false,
                        'isPurchasable'  => $variation->is_purchasable(),
                    ];
                }
            }
        }

        $rawStock = get_post_meta($pId, '_stock', true);
        $stockQty = $product->get_stock_quantity();
        if ($stockQty === null || $stockQty === '') {
            $stockQty = ($rawStock !== '' && $rawStock !== null && is_numeric($rawStock)) ? (int) $rawStock : 0;
        } else {
            $stockQty = (int) $stockQty;
        }
        if($product->get_stock_status() == "outofstock" && get_post_meta( $pId, '_stop_selling', true ) && $stockQty <= 0)
            $stockQty = get_post_meta( $pId, '_stop_selling', true );
        return [
            'id'               => $pId,
            'name'             => $product->get_name(),
            'sku'              => $product->get_sku() ?: '',
            'type'             => $product->get_type(),
            'status'           => $product->get_status(),
            'category'         => $catString,
            'categories'       => $catNames,
            'brand'            => $brand ?: '',
            'thumbnail'        => $thumbUrl ?: '',
            'description'      => $product->get_description(),
            'shortDescription' => $product->get_short_description(),
            'regularPrice'     => (float) $product->get_regular_price(),
            'salePrice'        => $product->get_sale_price() !== '' ? (float) $product->get_sale_price() : null,
            'manageStock'      => $product->managing_stock(),
            'stockQuantity'    => $stockQty,
            'stockStatus'      => $product->get_stock_status(),
            'snappayEnabled'   => isset($adapters['snappay']) ? $adapters['snappay']->getValue($product) : false,
            'torobPayEnabled'  => isset($adapters['torob_pay']) ? $adapters['torob_pay']->getValue($product) : false,
            'isPurchasable'    => $product->is_purchasable(),
            'couponCode'       => (string) ($product->get_meta('_coupon_code', true) ?: $product->get_meta('coupon_code', true) ?: ''),
            'variations'       => $variations,
            'stop_selling'     => get_post_meta( $pId, '_stop_selling', true ),
        ];
    }

    public static function handleGetProductsByIds(): void {
        self::verifySecurity();

        $rawIds = $_POST['ids'] ?? [];
        if (!is_array($rawIds)) {
            $rawIds = explode(',', (string) $rawIds);
        }
        $ids = array_values(array_unique(array_filter(array_map('intval', $rawIds))));
        $ids = array_slice($ids, 0, 500); // سقف هر درخواست

        if (empty($ids)) {
            wp_send_json_success(['products' => []]);
        }

        $objects = wc_get_products([
            'include' => $ids,
            'limit'   => count($ids),
            'status'  => ['publish', 'draft', 'pending', 'private', 'future'],
            'orderby' => 'ID',
            'order'   => 'DESC',
            'return'  => 'objects',
        ]);

        $adapters = AdapterRegistry::getAdapters();
        $products = [];
        if (is_array($objects)) {
            foreach ($objects as $product) {
                if ($product instanceof WC_Product) {
                    $products[] = self::serializeProduct($product, $adapters, false);
                }
            }
        }
        wp_send_json_success(['products' => $products]);
    }

    public static function handleGetProducts(): void {
        self::verifySecurity();
        $f        = self::parseFilters();
        $page     = max(1, (int) ($_POST['page'] ?? 1));
        $rawLimit = (int) ($_POST['limit'] ?? -1);
        if ($rawLimit === -1 || $rawLimit === 0 || $rawLimit > 5000) {
            $limit = 99999;
            $page  = 1;
        } else {
            $limit = max(5, $rawLimit);
        }

        $queryArgs             = self::buildQueryArgs($f);
        $queryArgs['limit']    = $limit;
        $queryArgs['page']     = $page;
        $queryArgs['paginate'] = true;
        $queryArgs['orderby']  = 'ID';
        $queryArgs['order']    = 'DESC';
        $queryArgs['return']   = 'objects';

        $query = wc_get_products($queryArgs);

        // پشتیبانی انعطاف‌پذیر از بازگشت شئ یا آرایه محصولات
        $rawProducts = is_object($query) && isset($query->products) ? $query->products : (is_array($query) ? $query : []);
        $total       = is_object($query) && isset($query->total) ? (int) $query->total : count($rawProducts);
        $maxPages    = is_object($query) && isset($query->max_num_pages) ? (int) $query->max_num_pages : 1;

        // اگر فیلتری نبود ولی محصولی نیافت، کوئری بدون محدودیت وضعیت را امتحان کن
        if (empty($rawProducts) && $page === 1 && empty($f['search']) && empty($f['categories']) && !isset($queryArgs['include'])) {
            unset($queryArgs['status']);
            $fallback = wc_get_products($queryArgs);
            if (is_object($fallback) && !empty($fallback->products)) {
                $rawProducts = $fallback->products;
                $total       = (int) $fallback->total;
                $maxPages    = (int) $fallback->max_num_pages;
            }
        }

        $products = [];
        $adapters = AdapterRegistry::getAdapters();

        foreach ($rawProducts as $product) {
            if (!$product instanceof WC_Product) {
                continue;
            }
            $products[] = self::serializeProduct($product, $adapters, true);
        }

        $catTerms = get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false]);
        $categoriesList = [];
        if (!is_wp_error($catTerms) && is_array($catTerms)) {
            foreach ($catTerms as $ct) {
                $categoriesList[] = [
                    'id'    => (int) $ct->term_id,
                    'name'  => (string) html_entity_decode((string) $ct->name, ENT_QUOTES, 'UTF-8'),
                    'slug'  => (string) $ct->slug,
                    'count' => (int) $ct->count,
                    'parent'=> (int) $ct->parent,
                ];
            }
        }

        // برندهای واقعی فروشگاه همراه با تعداد محصول (بدون برندهای فرضی)
        $brandDetails = self::getBrandDetails();
        $allBrands    = array_column($brandDetails, 'name');
        foreach ($products as $p) {
            if (!empty($p['brand']) && !in_array($p['brand'], $allBrands, true)) {
                $allBrands[] = $p['brand'];
            }
        }

        $couponsList = [];
        $couponPosts = get_posts([
            'post_type'      => 'shop_coupon',
            'posts_per_page' => -1,
            'post_status'    => 'any',
        ]);
        if (!is_wp_error($couponPosts) && is_array($couponPosts)) {
            foreach ($couponPosts as $cp) {
                $cTitle = trim((string) $cp->post_title);
                if (!empty($cTitle) && !in_array($cTitle, $couponsList, true)) {
                    $couponsList[] = $cTitle;
                }
            }
        }
        foreach ($products as $p) {
            if (!empty($p['couponCode']) && !in_array($p['couponCode'], $couponsList, true)) {
                $couponsList[] = $p['couponCode'];
            }
        }
        if (empty($couponsList)) {
            $couponsList = ['YALDA', 'NOROOZ', 'VIP20', 'OFF50', 'SUMMER', 'NEWYEAR'];
        }

        wp_send_json_success([
            'products'      => $products,
            'categories'    => $categoriesList,
            'brands'        => $allBrands,
            'brands_detail' => $brandDetails,
            'brand_source'  => self::brandSourceInfo()['source'],
            'brand_tax'     => self::brandSourceInfo()['taxonomy'],
            'coupons'       => $couponsList,
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
        Activator::ensureTablesExist();

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
        global $wpdb;
        Activator::ensureTablesExist();

        $productId = (int) ($_POST['product_id'] ?? 0);
        $product = wc_get_product($productId);
        if (!$product) {
            wp_send_json_error(['message' => 'محصول یافت نشد.'], 404);
        }

        // ۱. عکسبرداری از وضعیت قبل (Before Snapshot) برای لاگ و قابلیت Rollback
        $adapters = AdapterRegistry::getAdapters();
        $rawStock = get_post_meta($productId, '_stock', true);
        $stockQty = $product->get_stock_quantity();
        if ($stockQty === null || $stockQty === '') {
            $stockQty = ($rawStock !== '' && $rawStock !== null && is_numeric($rawStock)) ? (int) $rawStock : 0;
        } else {
            $stockQty = (int) $stockQty;
        }

        $before = [
            'name'             => $product->get_name(),
            'sku'              => $product->get_sku(),
            'regular_price'    => $product->get_regular_price(),
            'sale_price'       => $product->get_sale_price(),
            'status'           => $product->get_status(),
            'manage_stock'     => $product->managing_stock(),
            'stock_quantity'   => $stockQty,
            'stock_status'     => $product->get_stock_status(),
            'stop_selling'     => get_post_meta($productId, '_stop_selling', true),
            'brand'            => (string) $product->get_meta('_product_brand', true),
            'description'      => $product->get_description(),
            'short_description'=> $product->get_short_description(),
            'category_ids'     => $product->get_category_ids(),
        ];
        foreach ($adapters as $key => $adapter) {
            $before[$key] = $adapter->getValue($product);
        }

        try {
            $changedFields = [];

            if (isset($_POST['name'])) {
                $product->set_name(sanitize_text_field($_POST['name']));
                $changedFields[] = 'نام';
            }
            if (isset($_POST['sku'])) {
                $product->set_sku(sanitize_text_field($_POST['sku']));
                $changedFields[] = 'SKU';
            }
            if (isset($_POST['regular_price'])) {
                $reg = trim((string) $_POST['regular_price']);
                $product->set_regular_price($reg !== '' ? $reg : '');
                $changedFields[] = 'قیمت عادی';
            }
            if (isset($_POST['sale_price'])) {
                $sale = trim((string) $_POST['sale_price']);
                $product->set_sale_price($sale !== '' ? $sale : '');
                $changedFields[] = 'قیمت فروش ویژه';
            }
            $isManageStock = null;
            if (isset($_POST['manage_stock'])) {
                $isManageStock = ($_POST['manage_stock'] === 'yes' || $_POST['manage_stock'] === 'true' || $_POST['manage_stock'] === '1');
                $product->set_manage_stock($isManageStock);
                $changedFields[] = 'مدیریت انبار';
                if (!$isManageStock) {
                    // هنگام غیرفعال‌سازی مدیریت موجودی: محصول ناموجود شود و مقدار موجودی در _stop_selling حفظ گردد
                    $product->set_stock_status('outofstock');
                    update_post_meta($productId, '_stop_selling', $_POST['stock_quantity'] ?? $stockQty);
                } else {
                    delete_post_meta($productId, '_stop_selling');
                }
            }
            if (isset($_POST['stock_quantity'])) {
                $stock = (int) $_POST['stock_quantity'];
                update_post_meta($productId, '_stock', $stock);
                $product->set_stock_quantity($stock);
                $changedFields[] = 'موجودی انبار';
                // فقط اگر مدیریت موجودی فعال باشد وضعیت بر اساس تعداد تنظیم می‌شود
                if ($isManageStock !== false && $product->managing_stock()) {
                    $product->set_stock_status($stock > 0 ? 'instock' : 'outofstock');
                }
            }
            if (isset($_POST['stock_status'])) {
                $stStatus = sanitize_text_field($_POST['stock_status']);
                if (in_array($stStatus, ['instock', 'outofstock', 'onbackorder'], true)) {
                    $product->set_stock_status($stStatus);
                    $changedFields[] = 'وضعیت انبار';
                    if ($stStatus === 'outofstock') {
                        update_post_meta($productId, '_stop_selling', $_POST['stock_quantity'] ?? $stockQty);
                    } else {
                        delete_post_meta($productId, '_stop_selling');
                    }
                }
            }
            if (isset($_POST['status'])) {
                $status = sanitize_text_field($_POST['status']);
                if (in_array($status, ['publish', 'draft', 'pending', 'private'], true)) {
                    $product->set_status($status);
                    $changedFields[] = 'وضعیت انتشار';
                }
            }
            if (isset($_POST['description'])) {
                $product->set_description(wp_kses_post($_POST['description']));
                $changedFields[] = 'توضیحات';
            }
            if (isset($_POST['short_description'])) {
                $product->set_short_description(wp_kses_post($_POST['short_description']));
                $changedFields[] = 'توضیحات کوتاه';
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
                    $changedFields[] = 'دسته‌بندی';
                }
            }
            if (isset($_POST['type'])) {
                $newType = sanitize_text_field($_POST['type']);
                if (in_array($newType, ['simple', 'variable', 'grouped', 'external'], true)) {
                    wp_set_object_terms($productId, $newType, 'product_type');
                    $changedFields[] = 'نوع محصول';
                }
            }
            if (isset($_POST['coupon_code'])) {
                $cCode = sanitize_text_field($_POST['coupon_code']);
                $product->update_meta_data('_coupon_code', $cCode);
                $product->update_meta_data('coupon_code', $cCode);
                $changedFields[] = 'کد تخفیف';
                if (!empty($cCode)) {
                    $couponObj = new WC_Coupon($cCode);
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
            if (isset($_POST['brand'])) {
                $brandName = sanitize_text_field($_POST['brand']);
                BatchProcessor::saveProductBrand($product, $brandName);
                $changedFields[] = 'برند';
            }
            if (isset($_POST['snappay_enabled'])) {
                if (isset($adapters['snappay'])) {
                    $adapters['snappay']->setValue($product, $_POST['snappay_enabled'] === '1' || $_POST['snappay_enabled'] === 'true');
                    $changedFields[] = 'اسنپ‌پی';
                }
            }
            if (isset($_POST['torob_pay_enabled'])) {
                if (isset($adapters['torob_pay'])) {
                    $adapters['torob_pay']->setValue($product, $_POST['torob_pay_enabled'] === '1' || $_POST['torob_pay_enabled'] === 'true');
                    $changedFields[] = 'ترب‌پی';
                }
            }

            $product->save();

            // ۲. عکسبرداری از وضعیت بعد (After Snapshot)
            $after = [
                'name'             => $product->get_name(),
                'sku'              => $product->get_sku(),
                'regular_price'    => $product->get_regular_price(),
                'sale_price'       => $product->get_sale_price(),
                'status'           => $product->get_status(),
                'manage_stock'     => $product->managing_stock(),
                'stock_quantity'   => $product->get_stock_quantity(),
                'stock_status'     => $product->get_stock_status(),
                'stop_selling'     => get_post_meta($productId, '_stop_selling', true),
                'type'             => $product->get_type(),
                'brand'            => isset($brandName) ? $brandName : (string) $product->get_meta('_product_brand', true),
                'coupon_code'      => (string) ($product->get_meta('_coupon_code', true) ?: $product->get_meta('coupon_code', true) ?: ''),
                'description'      => $product->get_description(),
                'short_description'=> $product->get_short_description(),
                'category_ids'     => $product->get_category_ids(),
            ];
            foreach ($adapters as $key => $adapter) {
                $after[$key] = $adapter->getValue($product);
            }

            // ۳. ثبت قطعی در تاریخچه عملیات (Operations) و اقلام تغییریافته (Items) جهت امکان بازگردانی (Rollback)
            $operationId = 'inline-' . wp_generate_uuid4();
            $opsTable    = $wpdb->prefix . 'wc_bpe_operations';
            $itemsTable  = $wpdb->prefix . 'wc_bpe_operation_items';

            $summary = 'ویرایش جدول: ' . $product->get_name() . ' (' . implode('، ', $changedFields) . ')';

            $wpdb->insert($opsTable, [
                'id'              => $operationId,
                'user_id'         => get_current_user_id() ?: 1,
                'status'          => 'completed',
                'total_items'     => 1,
                'success_count'   => 1,
                'fail_count'      => 0,
                'filters_payload' => '{}',
                'changes_payload' => wp_json_encode([$summary], JSON_UNESCAPED_UNICODE),
                'created_at'      => current_time('mysql'),
            ]);

            $wpdb->insert($itemsTable, [
                'operation_id'    => $operationId,
                'product_id'      => $productId,
                'parent_id'       => $product->get_parent_id() ?: null,
                'sku'             => $product->get_sku() ?: '',
                'before_snapshot' => wp_json_encode($before, JSON_UNESCAPED_UNICODE),
                'after_snapshot'  => wp_json_encode($after, JSON_UNESCAPED_UNICODE),
                'created_at'      => current_time('mysql'),
            ]);

            wp_send_json_success([
                'message'      => 'محصول با موفقیت ذخیره و لاگ آن جهت Rollback ثبت گردید.',
                'product_id'   => $productId,
                'operation_id' => $operationId
            ]);
        } catch (\Exception $e) {
            wp_send_json_error(['message' => 'خطا در ذخیره اطلاعات: ' . $e->getMessage()], 500);
        }
    }

    public static function handleGetHistory(): void {
        self::verifySecurity();
        global $wpdb;
        Activator::ensureTablesExist();

        $table = $wpdb->prefix . 'wc_bpe_operations';
        $rows = $wpdb->get_results("SELECT * FROM {$table} ORDER BY created_at DESC LIMIT 50");

        $history = [];
        if (!empty($rows)) {
            foreach ($rows as $row) {
                $user = get_userdata((int) $row->user_id);
                $userName = $user ? $user->display_name : 'مدیر #' . $row->user_id;

                $changes = json_decode($row->changes_payload, true);
                $summary = 'ویرایش روی ' . (int) $row->total_items . ' محصول';
                if (is_array($changes)) {
                    if (isset($changes[0]) && is_string($changes[0])) {
                        $summary = $changes[0];
                    } elseif (!empty($changes)) {
                        $summary = 'ویرایش پارامترهای ' . implode(', ', array_keys($changes));
                    }
                }

                $history[] = [
                    'id'            => $row->id,
                    'created_at'    => $row->created_at,
                    'user_name'     => $userName,
                    'summary'       => $summary,
                    'total_items'   => (int) $row->total_items,
                    'success_count' => (int) $row->success_count,
                    'fail_count'    => (int) $row->fail_count,
                    'status'        => $row->status,
                ];
            }
        }

        wp_send_json_success(['history' => $history]);
    }

    public static function handleSaveSettings(): void {
        self::verifySecurity();

        if (isset($_POST['batch_size'])) {
            update_option('wc_bpe_batch_size', max(5, min(200, (int) $_POST['batch_size'])));
        }
        if (isset($_POST['retention_days'])) {
            update_option('wc_bpe_history_retention_days', max(7, min(365, (int) $_POST['retention_days'])));
        }
        if (isset($_POST['enable_rollback'])) {
            update_option('wc_bpe_enable_rollback', ($_POST['enable_rollback'] === '1' || $_POST['enable_rollback'] === 'true') ? 1 : 0);
        }
        if (isset($_POST['audit_log_enabled'])) {
            update_option('wc_bpe_audit_log_enabled', ($_POST['audit_log_enabled'] === '1' || $_POST['audit_log_enabled'] === 'true') ? 1 : 0);
        }
        if (isset($_POST['brand_source'])) {
            update_option('wc_bpe_brand_source', $_POST['brand_source'] === 'attribute' ? 'attribute' : 'taxonomy');
        }
        if (isset($_POST['brand_taxonomy'])) {
            update_option('wc_bpe_brand_taxonomy', sanitize_text_field($_POST['brand_taxonomy']));
        }
        if (isset($_POST['brand_attribute'])) {
            update_option('wc_bpe_brand_attribute', sanitize_text_field($_POST['brand_attribute']));
        }
        if (isset($_POST['snappay_meta_key'])) {
            update_option('wc_bpe_snappay_meta_key', sanitize_text_field($_POST['snappay_meta_key']));
        }
        if (isset($_POST['snappay_mode'])) {
            update_option('wc_bpe_snappay_mode', sanitize_text_field($_POST['snappay_mode']));
        }
        if (isset($_POST['torob_meta_key'])) {
            update_option('wc_bpe_torob_meta_key', sanitize_text_field($_POST['torob_meta_key']));
        }
        if (isset($_POST['torob_mode'])) {
            update_option('wc_bpe_torob_mode', sanitize_text_field($_POST['torob_mode']));
        }
        if (isset($_POST['enable_checkout_filter'])) {
            update_option('wc_bpe_enable_checkout_filter', ($_POST['enable_checkout_filter'] === '1' || $_POST['enable_checkout_filter'] === 'true') ? 1 : 0);
        }
        if (isset($_POST['price_round_unit'])) {
            update_option('wc_bpe_price_round_unit', max(1, (int) $_POST['price_round_unit']));
        }
        if (isset($_POST['delete_data_on_uninstall'])) {
            update_option('wc_bpe_delete_data_on_uninstall', ($_POST['delete_data_on_uninstall'] === '1' || $_POST['delete_data_on_uninstall'] === 'true') ? 1 : 0);
        }

        wp_send_json_success(['message' => 'تنظیمات با موفقیت در ووکامرس ذخیره شدند.']);
    }
}
AdminAjax::register();