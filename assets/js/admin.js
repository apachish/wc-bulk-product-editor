(function($) {
  'use strict';

  var state = {
    products: [],
    selectedIds: [],
    modifiedIds: new Set(),
    activeTab: 'table',
    wizardStep: 1,
    filters: { search: '', categories: [], catMode: 'or', brands: [], status: '', stockStatus: '', type: '', preset: 'all' },
    categories: ['گوشی موبایل', 'لوازم جانبی', 'ساعت و مچ‌بند', 'لپ‌تاپ', 'لوازم خانگی'],
    masterCategories: [],
    masterBrands: [],
    brandsDetail: [],
    extraProducts: {},
    brandSource: 'taxonomy',
    brandTax: '',
    brands: [
      'Casio', 'Seiko', 'G-Shock', 'TISSOT', 'Swatch', 'Calvin Klein',
      'Caterpillar', 'CERRUTI', 'Daniel Gorman', 'Edifice', 'Esprit',
      'GUCCI', 'Guess', 'Orient', 'POLICE', 'Pro Trek', 'Timberland',
      'سامسونگ', 'اپل', 'شیائومی', 'باسئوس', 'ایسوس', 'مباشی'
    ],
    coupons: ['YALDA', 'NOROOZ', 'VIP20', 'OFF50', 'SUMMER', 'NEWYEAR'],
    pageLimit: 50,
    page: 1,
    totalPages: 1,
    reqSeq: 0,
    hasLoaded: false,
    totalStoreProducts: 0,
    isAllStoreSelected: false,
    opSettings: {
      regularPriceType: 'none',
      regularPriceValue: 10,
      roundPriceTo: 1000,
      salePriceType: 'none',
      salePriceValue: 0,
      statusAction: 'none',
      stockType: 'none',
      stockValue: 0,
      stockStatusAction: 'none',
      snappayAction: 'none',
      torobPayAction: 'none',
      brandAction: 'none',
      brandValue: 'Casio',
      couponAction: 'none',
      couponCode: '',
      priceRangeAction: 'none',
      priceRangeValue: '۲ تا ۵ میلیون',
      customAttributeAction: 'none',
      customAttributeName: 'رنگ',
      customAttributeValue: '',
      customAttributeSearchValue: ''
    },
    previews: [],
    executionStats: null,
    activeModal: null,
    bulkAttributeModal: false,
    bulkAttrTarget: 'brand',
    bulkAttrAction: 'set_term',
    bulkAttrValue: '',
    bulkAttrCustomName: 'رنگ',
    previewProduct: null,
    isLoading: true,
    history: [],
    isHistoryLoading: false,
    settings: (typeof window !== 'undefined' && window.wcBpeData && window.wcBpeData.settings) ? window.wcBpeData.settings : {
      batchSize: 20,
      historyRetentionDays: 60,
      rollbackEnabled: true,
      auditLogEnabled: true,
      brandSource: 'taxonomy',
      brandTaxonomyName: 'product_brand',
      brandAttributeName: 'pa_brands',
      snappayMetaKey: '_disable_snappay',
      snappayMode: 'disable_flag',
      torobMetaKey: '_disable_torobpay',
      torobMode: 'disable_flag',
      enableCheckoutFilter: true,
      priceRoundUnit: 1000,
      deleteOnUninstall: false
    }
  };

  // Sample fallback products if WooCommerce has 0 products
  var sampleProducts = [
    {
      id: 101,
      name: 'گوشی موبایل سامسونگ Galaxy S24 Ultra',
      sku: 'SAM-S24U-512',
      type: 'variable',
      status: 'publish',
      category: 'گوشی موبایل',
      brand: 'سامسونگ',
      thumbnail: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=120&auto=format&fit=crop&q=60',
      description: 'گوشی پرچمدار سامسونگ با قلم S Pen، پردازنده Snapdragon 8 Gen 3 و دوربین ۲۰۰ مگاپیکسلی با هوش مصنوعی Galaxy AI.',
      shortDescription: 'پرچمدار ۲۰۲۴ سامسونگ با فریم تیتانیومی و دوربین ۲۰۰ مگاپیکسل',
      regularPrice: 78500000,
      salePrice: 76900000,
      manageStock: true,
      stockQuantity: 14,
      stockStatus: 'instock',
      snappayEnabled: false,
      torobPayEnabled: false,
      isPurchasable: true
    },
    {
      id: 102,
      name: 'هدفون بی‌سیم اپل AirPods Pro 2 Type-C',
      sku: 'APL-APP2-USBC',
      type: 'simple',
      status: 'publish',
      category: 'لوازم جانبی',
      brand: 'اپل',
      thumbnail: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=120&auto=format&fit=crop&q=60',
      description: 'هدفون بی‌سیم اپل با تراشه H2، قابلیت حذف نویز فعال (ANC) ۲ برابر قوی‌تر و درگاه USB-C ضد گرد و غبار.',
      shortDescription: 'ایرپاد پرو ۲ با پورت تایپ سی و نویز کنسلینگ فعال',
      regularPrice: 14200000,
      salePrice: 13500000,
      manageStock: true,
      stockQuantity: 25,
      stockStatus: 'instock',
      snappayEnabled: false,
      torobPayEnabled: false,
      isPurchasable: true
    },
    {
      id: 103,
      name: 'ساعت هوشمند شیائومی Watch S3',
      sku: 'XIA-WS3-SIL',
      type: 'simple',
      status: 'publish',
      category: 'ساعت و مچ‌بند',
      brand: 'شیائومی',
      thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=60',
      description: 'ساعت هوشمند شیائومی با فریم قابل تعویض، سیستم عامل HyperOS و باتری قدرتمند با شارژدهی ۱۵ روزه.',
      shortDescription: '',
      regularPrice: 6800000,
      salePrice: null,
      manageStock: true,
      stockQuantity: 0,
      stockStatus: 'outofstock',
      snappayEnabled: false,
      torobPayEnabled: false,
      isPurchasable: true
    },
    {
      id: 104,
      name: 'پاوربانک ۲۰۰۰۰ میلی‌آمپر باسئوس Blade 100W',
      sku: 'BSU-BLD-100W',
      type: 'simple',
      status: 'publish',
      category: 'لوازم جانبی',
      brand: 'باسئوس',
      thumbnail: 'https://images.unsplash.com/photo-1609592426507-42518e9d5598?w=120&auto=format&fit=crop&q=60',
      description: 'پاوربانک باریک فست شارژ با توان خروجی ۱۰۰ وات مناسب شارژ همزمان لپ‌تاپ و گوشی‌های هوشمند.',
      shortDescription: 'پاوربانک ۱۰۰ واتی با ضخامت ۱۸ میلی‌متر و نمایشگر دیجیتال',
      regularPrice: 3850000,
      salePrice: 3490000,
      manageStock: true,
      stockQuantity: 18,
      stockStatus: 'instock',
      snappayEnabled: false,
      torobPayEnabled: false,
      isPurchasable: true
    }
  ];

  var searchTimer = null;

  function lockApp() {
    $('#wc-bpe-app').css({ opacity: 0.55, 'pointer-events': 'none' });
  }
  function unlockApp() {
    $('#wc-bpe-app').css({ opacity: '', 'pointer-events': '' });
  }

  function buildFilterPayload() {
    return {
      search: state.filters.search || '',
      categories: (state.filters.categories || []).slice(),
      cat_mode: state.filters.catMode === 'and' ? 'and' : 'or',
      brands: (state.filters.brands || []).slice(),
      status: state.filters.status || '',
      stockStatus: state.filters.stockStatus || '',
      type: state.filters.type || '',
      preset: state.filters.preset || 'all'
    };
  }

  function confirmDiscardIfDirty() {
    if (state.modifiedIds.size > 0) {
      if (!window.confirm('تغییرات ذخیره‌نشده‌ای در این صفحه وجود دارد و با ادامه از بین می‌رود. ادامه می‌دهید؟')) {
        return false;
      }
      state.modifiedIds.clear();
    }
    return true;
  }

  // Apply a filter change: reset to page 1 and reload from server
  function applyFilter(mutator) {
    if (!confirmDiscardIfDirty()) { render(); return; }
    mutator();
    state.page = 1;
    fetchProducts(true);
  }

  function fetchProducts(preserveMasterLists) {
    var reqId = ++state.reqSeq;
    if (!state.hasLoaded) {
      state.isLoading = true;
      render();
    } else {
      lockApp();
    }

    var postData = $.extend({
      action: 'wc_bpe_get_products',
      nonce: wcBpeData.nonce,
      page: state.page,
      limit: state.pageLimit
    }, buildFilterPayload());

    $.ajax({
      url: wcBpeData.ajaxUrl,
      type: 'POST',
      data: postData,
      success: function(res) {
        if (reqId !== state.reqSeq) return;
        state.isLoading = false;
        state.hasLoaded = true;
        unlockApp();
        if (res.success && res.data) {
          if (res.data.max_num_pages !== undefined) {
            state.totalPages = Math.max(1, parseInt(res.data.max_num_pages, 10) || 1);
          }
          if (res.data.page !== undefined) {
            state.page = parseInt(res.data.page, 10) || 1;
          }
          if (state.page > state.totalPages && res.data.total > 0) {
            state.page = state.totalPages;
            fetchProducts(true);
            return;
          }
          if (Array.isArray(res.data.coupons) && res.data.coupons.length > 0) {
            state.coupons = Array.from(new Set(res.data.coupons.concat(state.coupons)));
          }
          if (res.data.total !== undefined) {
            state.totalStoreProducts = res.data.total;
          }

          // Master categories preservation so filter dropdown maintains full store categories & counts
          if (Array.isArray(res.data.categories) && res.data.categories.length > 0) {
            var rawCats = res.data.categories.map(function(c) {
              if (typeof c === 'object' && c) {
                return {
                  id: c.id,
                  name: String(c.name || '').trim(),
                  slug: String(c.slug || '').trim(),
                  count: typeof c.count === 'number' ? c.count : null
                };
              }
              return { name: String(c).trim(), slug: '', count: null };
            });
            if (!state.masterCategories || state.masterCategories.length === 0 || !preserveMasterLists) {
              state.masterCategories = rawCats;
            }
            state.categories = state.masterCategories;
          }

          if (Array.isArray(res.data.brands) && res.data.brands.length > 0) {
            if (!state.masterBrands || state.masterBrands.length === 0 || !preserveMasterLists) {
              state.masterBrands = res.data.brands;
            }
          }
        }

        if (res.success && res.data && res.data.products && res.data.products.length > 0) {
          state.products = res.data.products;
          state.isRealStoreData = true;

          // If masterCategories hasn't been set from API yet, build it from products
          if (!state.masterCategories || state.masterCategories.length === 0) {
            var catMap = {};
            state.products.forEach(function(p) {
              if (p.categories && Array.isArray(p.categories)) {
                p.categories.forEach(function(c) { if (c && c.trim()) catMap[c.trim()] = (catMap[c.trim()] || 0) + 1; });
              }
              if (p.category) {
                p.category.split(/[,،/|>;-]+/).forEach(function(c) {
                  var ct = c.trim();
                  if (ct) catMap[ct] = (catMap[ct] || 0) + 1;
                });
              }
            });
            state.masterCategories = Object.keys(catMap).map(function(k) { return { name: k, count: catMap[k] }; });
            state.categories = state.masterCategories;
          }

          // Add any product coupon codes to state.coupons
          state.products.forEach(function(p) {
            if (p.couponCode && state.coupons.indexOf(p.couponCode) === -1) {
              state.coupons.push(p.couponCode);
            }
          });
        } else if (res.success && res.data && Array.isArray(res.data.products) && res.data.products.length === 0) {
          state.products = []; // Real store query returned 0 products for this filter
          state.isRealStoreData = true;
          state.storeIsEmpty = false;
        } else {
          state.products = sampleProducts;
          state.isRealStoreData = false;
        }

        if (res.success && res.data && Array.isArray(res.data.brands_detail) && (!preserveMasterLists || !state.brandsDetail.length)) {
          state.brandsDetail = res.data.brands_detail;
        }
        if (res.success && res.data) {
          if (res.data.brand_source) state.brandSource = res.data.brand_source;
          if (res.data.brand_tax !== undefined) state.brandTax = res.data.brand_tax;
        }
        var fetchedBrands = state.masterBrands || [];
        var productBrands = state.products.map(function(p) { return p.brand; }).filter(Boolean);
        state.brands = Array.from(new Set(fetchedBrands.concat(productBrands)));
        render();
        if (state.scrollAfter) {
          state.scrollAfter = false;
          var tw = document.querySelector('.wc-bpe-table-wrapper');
          if (tw) {
            var ty = tw.getBoundingClientRect().top;
            if (ty < 90) window.scrollTo({ top: ty + window.pageYOffset - 120, behavior: 'smooth' });
          }
        }
      },
      error: function() {
        if (reqId !== state.reqSeq) return;
        state.isLoading = false;
        state.hasLoaded = true;
        unlockApp();
        state.products = sampleProducts;
        state.isRealStoreData = false;
        render();
      }
    });
  }

  function render() {
    var $container = $('#wc-bpe-app');
    if (!$container.length) return;

    var focusInfo = null;
    var ae = document.activeElement;
    if (ae && (ae.id === 'wc-bpe-search' || ae.id === 'wc-bpe-wiz-search')) {
      focusInfo = { id: ae.id, pos: ae.selectionStart };
    }

    var html = '';

    // Header Banner
    html += '<div class="wc-bpe-header-banner">' +
        '<div class="title">' +
        '<span class="badge-wp">WC</span>' +
        '<span>ویرایش گروهی پیشرفته محصولات ووکامرس (Bulk Product Editor Pro v1.3.0)</span>' +
        '</div>' +
        '<div>' +
        '<span>نگارش ۱.۳.۰ | مدیریت کوپن و کد تخفیف | سازگار با اسنپ‌پی و ترب</span>' +
        '</div>' +
        '</div>';

    // Navigation Tabs
    html += '<div class="wc-bpe-nav-tabs">' +
        '<button type="button" class="wc-bpe-tab-btn ' + (state.activeTab === 'table' ? 'active' : '') + '" data-tab="table">📋 جدول ویرایش درون‌ردیفی (Editable Table)</button>' +
        '<button type="button" class="wc-bpe-tab-btn ' + (state.activeTab === 'wizard' ? 'active' : '') + '" data-tab="wizard">⚡ ویزارد ۵ مرحله‌ای ویرایش گروهی</button>' +
        '<button type="button" class="wc-bpe-tab-btn ' + (state.activeTab === 'history' ? 'active' : '') + '" data-tab="history">🕒 تاریخچه عملیات و Rollback</button>' +
        '<button type="button" class="wc-bpe-tab-btn ' + (state.activeTab === 'settings' ? 'active' : '') + '" data-tab="settings">⚙️ تنظیمات و آداپتورها</button>' +
        '</div>';

    if (state.isLoading) {
      html += '<div class="wc-bpe-card" style="text-align: center; padding: 40px;">' +
          '<span class="spinner is-active" style="float:none; margin: 0 5px 0 0;"></span>' +
          '<strong>در حال واکشی محصولات از پایگاه داده ووکامرس...</strong>' +
          '</div>';
      $container.html(html);
      return;
    }

    if (state.activeTab === 'table') {
      html += renderTableView();
    } else if (state.activeTab === 'wizard') {
      html += renderWizardView();
    } else if (state.activeTab === 'history') {
      html += renderHistoryView();
    } else if (state.activeTab === 'settings') {
      html += renderSettingsView();
    }

    // Modal renders
    if (state.activeModal) {
      html += renderDescriptionModal();
    }
    if (state.previewProduct) {
      html += renderPreviewModal();
    }
    if (state.bulkAttributeModal) {
      html += renderBulkAttributesModal();
    }

    $container.html(html);
    bindEvents();

    if (focusInfo) {
      var fe = document.getElementById(focusInfo.id);
      if (fe) {
        fe.focus();
        try { fe.setSelectionRange(focusInfo.pos, focusInfo.pos); } catch (err) {}
      }
    }
  }

  function normalizeFa(str) {
    return String(str || '').replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\u200c/g, ' ').toLowerCase().trim();
  }

  function catInfo(c) {
    if (c && typeof c === 'object') {
      var nm = String(c.name || '');
      return {
        key: (c.id !== undefined && c.id !== null) ? String(c.id) : nm,
        name: nm,
        parent: c.parent ? String(c.parent) : '',
        count: typeof c.count === 'number' ? c.count : null,
        depth: 0
      };
    }
    return { key: String(c), name: String(c), parent: '', count: null, depth: 0 };
  }

  // Order categories as a tree (parents first, children indented)
  function sortCatTree(list) {
    var byParent = {};
    var keys = {};
    list.forEach(function(c) { keys[c.key] = true; });
    list.forEach(function(c) {
      var par = (c.parent && keys[c.parent]) ? c.parent : '';
      (byParent[par] = byParent[par] || []).push(c);
    });
    var out = [];
    (function walk(par, depth) {
      (byParent[par] || []).forEach(function(c) {
        c.depth = depth;
        out.push(c);
        walk(c.key, depth + 1);
      });
    })('', 0);
    return out.length === list.length ? out : list;
  }

  var FILTER_CSS = [
    '.wc-fb{background:#fff;border:1px solid #dcdcde;border-radius:8px;padding:12px 14px;margin-bottom:12px}',
    '.wc-fb-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}',
    '.wc-fb-row+.wc-fb-row{margin-top:10px}',
    '.wc-fb-search{position:relative;flex:1 1 240px;min-width:200px;max-width:340px}',
    '.wc-fb-search input{width:100%;box-sizing:border-box;height:34px;padding:0 34px 0 10px;border:1px solid #c3c4c7;border-radius:6px}',
    '.wc-fb-search:before{content:"🔍";position:absolute;right:10px;top:50%;transform:translateY(-50%);font-size:13px;opacity:.6;pointer-events:none}',
    '.wc-fb select.wc-bpe-select{height:34px;border-radius:6px;min-width:130px}',
    '.wc-fb select.is-active,.wc-ms.has-sel>.wc-ms-toggle{border-color:#2271b1;background:#f0f6fc;color:#135e96}',
    '.wc-ms{position:relative}',
    '.wc-ms-toggle{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;border:1px solid #c3c4c7;border-radius:6px;background:#fff;cursor:pointer;font-size:13px;color:#2c3338}',
    '.wc-ms-toggle:hover{border-color:#2271b1}',
    '.wc-ms-badge{background:#2271b1;color:#fff;border-radius:10px;font-size:11px;min-width:18px;height:18px;line-height:18px;text-align:center;padding:0 5px}',
    '.wc-ms-caret{font-size:10px;opacity:.6}',
    '.wc-ms-panel{display:none;position:absolute;top:calc(100% + 6px);right:0;z-index:99999;width:320px;max-width:92vw;background:#fff;border:1px solid #c3c4c7;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.18);overflow:hidden}',
    '.wc-ms.open>.wc-ms-panel{display:block}',
    '.wc-ms-head{padding:10px 12px 8px;border-bottom:1px solid #f0f0f1}',
    '.wc-ms-title{font-weight:600;font-size:13px;color:#1d2327}',
    '.wc-ms-sub{font-size:11px;color:#787c82;margin-top:2px}',
    '.wc-ms-search{width:100%;box-sizing:border-box;height:32px;margin-top:8px;border:1px solid #c3c4c7;border-radius:6px;padding:0 10px}',
    '.wc-ms-mode{display:flex;margin-top:8px;border:1px solid #c3c4c7;border-radius:6px;overflow:hidden}',
    '.wc-ms-mode label{flex:1;margin:0;text-align:center;padding:5px 4px;font-size:12px;cursor:pointer;background:#f6f7f7}',
    '.wc-ms-mode input{display:none}',
    '.wc-ms-mode input:checked+span{font-weight:600;color:#fff}',
    '.wc-ms-mode label.on{background:#2271b1;color:#fff}',
    '.wc-ms-modehint{font-size:11px;color:#787c82;margin-top:4px;min-height:14px}',
    '.wc-ms-tools{display:flex;justify-content:space-between;padding:6px 12px;font-size:12px;border-bottom:1px solid #f0f0f1}',
    '.wc-ms-tools a{cursor:pointer;color:#2271b1;text-decoration:none}',
    '.wc-ms-list{max-height:250px;overflow:auto}',
    '.wc-ms-item{display:flex;align-items:center;gap:8px;margin:0;padding:6px 12px;cursor:pointer;font-size:13px}',
    '.wc-ms-item:hover{background:#f6f7f7}',
    '.wc-ms-item .n{margin-right:auto;color:#787c82;font-size:11px;background:#f0f0f1;border-radius:10px;padding:0 7px}',
    '.wc-ms-empty{padding:14px 12px;color:#787c82;font-size:12px}',
    '.wc-ms-foot{display:flex;justify-content:space-between;gap:8px;padding:8px 12px;border-top:1px solid #f0f0f1;background:#fafafa}',
    '.wc-fb-presets{display:inline-flex;flex-wrap:wrap;gap:6px;align-items:center}',
    '.wc-fb-label{font-size:12px;color:#646970;font-weight:600}',
    '.wc-fb-chips{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding-top:10px;border-top:1px dashed #e0e0e0}',
    '.wc-fb-chip{display:inline-flex;align-items:center;gap:5px;border-radius:14px;padding:2px 9px;font-size:12px;background:#eef4fb;color:#1e40af;border:1px solid #bfdbfe}',
    '.wc-fb-chip.b{background:#f3effb;color:#5b3a9c;border-color:#d9cdf0}',
    '.wc-fb-chip.o{background:#f6f7f7;color:#3c434a;border-color:#dcdcde}',
    '.wc-fb-chip a{text-decoration:none;color:#b32d2e;font-weight:bold;cursor:pointer}',
    '.wc-fb-chip a:focus{box-shadow:none}',
    '.wc-pgbar{position:sticky;top:32px;z-index:60;background:#fff;border:1px solid #dcdcde;border-radius:8px;padding:8px 12px;margin:10px 0;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,.08)}',
    '.wc-pgbar-l{display:flex;flex-wrap:wrap;align-items:center;gap:8px}',
    '.wc-pg{display:inline-flex;flex-wrap:wrap;gap:4px;align-items:center}',
    '.wc-pg-goto{width:56px;height:26px;text-align:center;border:1px solid #c3c4c7;border-radius:4px}',
    '.wc-pg-info{color:#646970;margin:0 6px}',
    '.wc-ok{color:#047857;font-weight:600}'
  ].join('');

  function injectFilterStyles() {
    if (document.getElementById('wc-bpe-fb-style')) return;
    var st = document.createElement('style');
    st.id = 'wc-bpe-fb-style';
    st.appendChild(document.createTextNode(FILTER_CSS));
    document.head.appendChild(st);
  }

  function activeFilterCount() {
    var f = state.filters;
    return (f.search ? 1 : 0) + (f.categories || []).length + (f.brands || []).length +
        (f.status ? 1 : 0) + (f.stockStatus ? 1 : 0) + (f.type ? 1 : 0) + ((f.preset && f.preset !== 'all') ? 1 : 0);
  }

  function renderMulti(kind) {
    var isCat = kind === 'cat';
    var selected = isCat ? (state.filters.categories || []) : (state.filters.brands || []);
    var list;
    if (isCat) {
      list = sortCatTree((state.categories || []).map(catInfo));
    } else if (state.brandsDetail && state.brandsDetail.length) {
      list = state.brandsDetail.map(function(b) { return { key: b.name, name: b.name, count: b.count, depth: 0 }; });
    } else {
      list = (state.brands || []).map(function(n) { return { key: n, name: n, count: null, depth: 0 }; });
    }
    var nameByKey = {};
    list.forEach(function(c) { nameByKey[c.key] = c.name; });

    var title = isCat ? 'دسته‌بندی' : 'برند';
    var icon = isCat ? '📂' : '🏷️';
    var sub = '';
    if (!isCat) {
      sub = state.brandSource === 'attribute'
          ? 'منبع: ویژگی محصول' + (state.brandTax ? ' (' + state.brandTax + ')' : '')
          : 'منبع: برندهای ووکامرس' + (state.brandTax ? ' (' + state.brandTax + ')' : '');
    }
    var mode = state.filters.catMode === 'and' ? 'and' : 'or';

    var h = '<div class="wc-ms ' + (selected.length ? 'has-sel' : '') + '" data-kind="' + kind + '">' +
        '<button type="button" class="wc-ms-toggle"><span>' + icon + ' ' + title + '</span>' +
        (selected.length ? '<span class="wc-ms-badge">' + selected.length + '</span>' : '') +
        '<span class="wc-ms-caret">▾</span></button>' +
        '<div class="wc-ms-panel">' +
        '<div class="wc-ms-head">' +
        '<div class="wc-ms-title">' + title + '‌ها <span style="font-weight:400;color:#787c82;">(' + list.length + ')</span></div>' +
        (sub ? '<div class="wc-ms-sub">' + escapeHtml(sub) + '</div>' : '') +
        '<input type="text" class="wc-ms-search" placeholder="جستجوی ' + title + '...">';
    if (isCat) {
      h += '<div class="wc-ms-mode">' +
          '<label class="' + (mode === 'or' ? 'on' : '') + '"><input type="radio" name="wc-ms-mode" class="wc-ms-mode-in" value="or" ' + (mode === 'or' ? 'checked' : '') + '><span>هرکدام</span></label>' +
          '<label class="' + (mode === 'and' ? 'on' : '') + '"><input type="radio" name="wc-ms-mode" class="wc-ms-mode-in" value="and" ' + (mode === 'and' ? 'checked' : '') + '><span>همه همزمان</span></label>' +
          '</div>' +
          '<div class="wc-ms-modehint">' + (mode === 'and' ? 'فقط محصولاتی که تمام دسته‌های انتخابی را دارند.' : 'محصولاتی که حداقل یکی از دسته‌های انتخابی را دارند.') + '</div>';
    }
    h += '</div>' +
        '<div class="wc-ms-tools"><a class="wc-ms-all">انتخاب همه نتایج</a><a class="wc-ms-clear">پاک کردن</a></div>' +
        '<div class="wc-ms-list">';
    if (!list.length) {
      h += '<div class="wc-ms-empty">' + (isCat ? 'دسته‌بندی‌ای یافت نشد.' : 'برندی یافت نشد. منبع برند را در تب «تنظیمات» بررسی کنید.') + '</div>';
    }
    list.forEach(function(c) {
      h += '<label class="wc-ms-item" data-name="' + escapeHtml(normalizeFa(c.name)) + '" style="padding-right:' + (12 + c.depth * 16) + 'px;">' +
          '<input type="checkbox" class="wc-ms-cb" value="' + escapeHtml(c.key) + '" ' + (selected.indexOf(c.key) !== -1 ? 'checked' : '') + '>' +
          '<span>' + escapeHtml(c.name) + '</span>' +
          (c.count !== null && c.count !== undefined ? '<span class="n">' + c.count + '</span>' : '') +
          '</label>';
    });
    h += '</div>' +
        '<div class="wc-ms-foot">' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary wc-ms-cancel">بستن</button>' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-primary wc-ms-apply">اعمال فیلتر (<span class="wc-ms-apply-n">' + selected.length + '</span>)</button>' +
        '</div>' +
        '</div></div>';
    return h;
  }

  function renderFilterBar(mode) {
    var w = mode === 'wiz';
    var ids = w
        ? { search: 'wc-bpe-wiz-search', stock: 'wc-bpe-wiz-stock', status: 'wc-bpe-wiz-status', type: 'wc-bpe-wiz-type', reset: 'wc-bpe-wiz-reset-filters' }
        : { search: 'wc-bpe-search', stock: 'wc-bpe-stock-filter', status: 'wc-bpe-status-filter', type: 'wc-bpe-type-filter', reset: 'wc-bpe-btn-reset-filters' };
    var f = state.filters;
    var active = activeFilterCount();

    function opt(val, label, cur) { return '<option value="' + val + '" ' + (cur === val ? 'selected' : '') + '>' + label + '</option>'; }
    function pill(key, label) {
      return '<button type="button" class="wc-bpe-preset-btn ' + (f.preset === key ? 'active' : '') + '" data-preset="' + key + '">' + label + '</button>';
    }

    var h = '<div class="wc-fb">' +
        '<div class="wc-fb-row">' +
        '<div class="wc-fb-search"><input type="text" id="' + ids.search + '" class="wc-bpe-input" placeholder="جستجوی نام، SKU یا ID..." value="' + escapeHtml(f.search) + '"></div>' +
        renderMulti('cat') +
        renderMulti('brand') +
        '<select id="' + ids.stock + '" class="wc-bpe-select ' + (f.stockStatus ? 'is-active' : '') + '">' +
        opt('', 'وضعیت انبار: همه', f.stockStatus) + opt('instock', 'موجود در انبار', f.stockStatus) + opt('outofstock', 'ناموجود', f.stockStatus) +
        '</select>' +
        '<select id="' + ids.status + '" class="wc-bpe-select ' + (f.status ? 'is-active' : '') + '">' +
        opt('', 'وضعیت انتشار: همه', f.status) + opt('publish', 'منتشر شده', f.status) + opt('draft', 'پیش‌نویس', f.status) +
        opt('pending', 'در انتظار بررسی', f.status) + opt('private', 'خصوصی', f.status) +
        '</select>' +
        '<select id="' + ids.type + '" class="wc-bpe-select ' + (f.type ? 'is-active' : '') + '">' +
        opt('', 'نوع کالا: همه', f.type) + opt('simple', 'ساده', f.type) + opt('variable', 'متغیر', f.type) +
        '</select>' +
        '</div>' +
        '<div class="wc-fb-row">' +
        '<span class="wc-fb-label">فیلتر سریع:</span>' +
        '<span class="wc-fb-presets">' +
        pill('all', 'همه (' + (state.totalStoreProducts || state.products.length) + ')') +
        pill('instock', '✓ موجود') + pill('outofstock', '✕ ناموجود') + pill('on_sale', '🏷️ تخفیف‌دار') +
        pill('variable', 'متغیر') + pill('simple', 'ساده') +
        '</span>' +
        '</div>';

    if (active > 0) {
      var catName = {}; (state.categories || []).map(catInfo).forEach(function(c) { catName[c.key] = c.name; });
      var presetLabel = { instock: 'موجود', outofstock: 'ناموجود', on_sale: 'تخفیف‌دار', variable: 'متغیر', simple: 'ساده' };
      var statusLabel = { publish: 'منتشر شده', draft: 'پیش‌نویس', pending: 'در انتظار بررسی', private: 'خصوصی' };
      var typeLabel = { simple: 'ساده', variable: 'متغیر' };
      var stockLabel = { instock: 'موجود در انبار', outofstock: 'ناموجود' };
      function chip(cls, text, clear, key) {
        return '<span class="wc-fb-chip ' + cls + '">' + escapeHtml(text) +
            '<a class="wc-fb-chip-x" data-clear="' + clear + '" data-key="' + escapeHtml(key || '') + '" title="حذف">×</a></span>';
      }
      h += '<div class="wc-fb-row wc-fb-chips"><span class="wc-fb-label">فیلترهای فعال:</span>';
      if (f.search) h += chip('o', '«' + f.search + '»', 'search');
      (f.categories || []).forEach(function(k) { h += chip('', '📂 ' + (catName[k] || k), 'categories', k); });
      if ((f.categories || []).length > 1) h += '<span class="wc-fb-label">(' + (f.catMode === 'and' ? 'همه همزمان' : 'هرکدام') + ')</span>';
      (f.brands || []).forEach(function(k) { h += chip('b', '🏷️ ' + k, 'brands', k); });
      if (f.stockStatus) h += chip('o', stockLabel[f.stockStatus] || f.stockStatus, 'stockStatus');
      if (f.status) h += chip('o', statusLabel[f.status] || f.status, 'status');
      if (f.type) h += chip('o', typeLabel[f.type] || f.type, 'type');
      if (f.preset && f.preset !== 'all') h += chip('o', 'سریع: ' + (presetLabel[f.preset] || f.preset), 'preset');
      h += '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="' + ids.reset + '" style="padding:2px 10px;">پاک‌سازی همه ✕</button></div>';
    }
    return h + '</div>';
  }

  function renderPagination(compact) {
    if (compact) {
      var cpages = state.totalPages || 1;
      var cpage = state.page || 1;
      if (state.pageLimit === -1 || cpages <= 1) return '';
      var cend = Math.min(cpages, Math.max(1, cpage - 2) + 4);
      var cstart = Math.max(1, cend - 4);
      var cb = function(label, target, disabled, active) {
        return '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary wc-bpe-page-btn" data-page="' + target + '" ' + (disabled ? 'disabled' : '') +
            ' style="padding:2px 9px; min-width:28px;' + (active ? ' background:#2271b1; color:#fff; border-color:#2271b1; font-weight:bold;' : '') + '">' + label + '</button>';
      };
      var ch = '<div class="wc-pg">' + cb('«', 1, cpage <= 1, false) + cb('‹ قبلی', cpage - 1, cpage <= 1, false);
      if (cstart > 1) ch += '<span>…</span>';
      for (var j = cstart; j <= cend; j++) ch += cb(j, j, false, j === cpage);
      if (cend < cpages) ch += '<span>…</span>';
      ch += cb('بعدی ›', cpage + 1, cpage >= cpages, false) + cb('»', cpages, cpage >= cpages, false) +
          '<span class="wc-pg-info">صفحه ' + cpage + ' از ' + cpages + '</span>' +
          '<input type="number" min="1" max="' + cpages + '" class="wc-pg-goto" placeholder="برو به" title="شماره صفحه را بنویسید و Enter بزنید">' +
          '</div>';
      return ch;
    }
    var total = state.totalStoreProducts || 0;
    var pages = state.totalPages || 1;
    var page = state.page || 1;
    var shown = state.products.length;
    var wrap = 'padding: 10px 14px; background: #fbfbfb; border-top: 1px solid #e5e5e5; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; font-size: 12px;';

    if (state.pageLimit === -1 || pages <= 1) {
      return '<div style="' + wrap + '"><span>نمایش ' + shown + ' از ' + (total || shown) + ' محصول</span></div>';
    }

    var from = (page - 1) * state.pageLimit + 1;
    var to = Math.min(from + shown - 1, total);
    var end = Math.min(pages, Math.max(1, page - 2) + 4);
    var start = Math.max(1, end - 4);

    function btn(label, target, disabled, active) {
      return '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary wc-bpe-page-btn" data-page="' + target + '" ' + (disabled ? 'disabled' : '') +
          ' style="padding:2px 9px; min-width:30px;' + (active ? ' background:#2271b1; color:#fff; border-color:#2271b1; font-weight:bold;' : '') + '">' + label + '</button>';
    }

    var h = '<div style="' + wrap + '">' +
        '<span>نمایش ' + from + ' تا ' + to + ' از ' + total + ' محصول — صفحه ' + page + ' از ' + pages + '</span>' +
        '<div style="display:flex; gap:4px; align-items:center;">' +
        btn('« اول', 1, page <= 1, false) +
        btn('‹ قبلی', page - 1, page <= 1, false);
    for (var i = start; i <= end; i++) {
      h += btn(i, i, false, i === page);
    }
    h += btn('بعدی ›', page + 1, page >= pages, false) +
        btn('آخر »', pages, page >= pages, false) +
        '</div></div>';
    return h;
  }

  function findProductById(id) {
    var prod = state.products.find(function(p) { return p.id === id; });
    return prod || (state.extraProducts && state.extraProducts[id]) || null;
  }

  function showToast(msg) {
    var el = document.getElementById('wc-bpe-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'wc-bpe-toast';
      el.style.cssText = 'position:fixed;top:48px;left:50%;transform:translateX(-50%);z-index:100000;background:#1d2327;color:#fff;padding:10px 18px;border-radius:6px;font-size:13px;box-shadow:0 4px 14px rgba(0,0,0,.3);';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.display = 'block';
  }
  function hideToast() {
    var el = document.getElementById('wc-bpe-toast');
    if (el) el.style.display = 'none';
  }

  // Selected products can span several pages: fetch the ones not currently loaded
  function ensureProductsLoaded(ids, done) {
    state.extraProducts = {};
    var missing = ids.filter(function(id) {
      return !state.products.some(function(p) { return p.id === id; });
    });
    if (!missing.length) { done(true); return; }

    var chunks = [];
    for (var i = 0; i < missing.length; i += 200) chunks.push(missing.slice(i, i + 200));
    var idx = 0;
    lockApp();

    function next() {
      if (idx >= chunks.length) {
        hideToast();
        unlockApp();
        done(true);
        return;
      }
      showToast('در حال دریافت اطلاعات محصولات انتخابی از سایر صفحات... (' + Math.min(idx * 200, missing.length) + ' از ' + missing.length + ')');
      $.ajax({
        url: wcBpeData.ajaxUrl,
        type: 'POST',
        data: { action: 'wc_bpe_get_products_by_ids', nonce: wcBpeData.nonce, ids: chunks[idx] },
        success: function(res) {
          if (res && res.success && res.data && Array.isArray(res.data.products)) {
            res.data.products.forEach(function(p) { state.extraProducts[p.id] = p; });
            idx++;
            next();
          } else {
            hideToast(); unlockApp();
            alert('دریافت اطلاعات محصولات انتخابی ناموفق بود. دوباره تلاش کنید.');
            done(false);
          }
        },
        error: function() {
          hideToast(); unlockApp();
          alert('خطای ارتباط با سرور هنگام دریافت محصولات انتخابی.');
          done(false);
        }
      });
    }
    next();
  }

  function renderPageBar() {
    var total = state.totalStoreProducts || state.products.length;
    var sel = state.selectedIds.length;
    var multi = total > state.products.length;
    var allSel = multi && sel >= total;
    var left = '<span>' + (sel ? 'انتخاب‌شده: <strong>' + sel + '</strong> از ' + total : 'نتایج: <strong>' + total + '</strong> محصول') + '</span>';
    if (multi) {
      if (allSel) {
        left += '<span class="wc-ok">✅ همهٔ ' + total + ' نتیجه (در تمام صفحات) انتخاب شده است</span>';
      } else {
        left += '<button type="button" class="wc-bpe-btn wc-bpe-btn-primary wc-bpe-select-all-results" style="padding:3px 12px;">☑ انتخاب همه ' + total + ' نتیجه (تمام صفحات)</button>';
      }
    } else if (total > 0 && sel < total) {
      left += '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary wc-bpe-select-all-results" style="padding:3px 12px;">☑ انتخاب همه ' + total + ' نتیجه</button>';
    }
    if (sel) {
      left += '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary wc-bpe-deselect-bar" style="padding:3px 10px; color:#d63638;">لغو انتخاب</button>';
    }
    return '<div class="wc-pgbar"><div class="wc-pgbar-l">' + left + '</div>' + renderPagination(true) + '</div>';
  }

  function renderTableView() {
    var filtered = getFilteredProducts();
    var storeCoupons = (state.coupons && state.coupons.length > 0) ? state.coupons : ['OFF10', 'OFF20', 'OFF30', 'OFF50', 'NOROOZ', 'VIP', 'YALDA', 'SUMMER', 'BLACKFRIDAY', 'SPECIAL'];

    var html = '<div class="wc-bpe-card" style="padding: 14px 18px; margin-top: 15px; border-radius: 6px;">' +
        renderFilterBar('table') +
        '<div class="wc-bpe-toolbar" style="margin: 0; padding: 0; border: none; background: none;">' +
        '<div class="wc-bpe-toolbar-left"></div>' +
        '<div class="wc-bpe-toolbar-right" style="display: flex; align-items: center; gap: 8px;">';

    if (state.modifiedIds.size > 0) {
      html += '<span class="badge badge-warning">' + state.modifiedIds.size + ' محصول تغییریافته</span>';
    }

    if (state.selectedIds.length > 0) {
      html += '<button type="button" class="wc-bpe-btn" id="wc-bpe-btn-bulk-attrs" style="background: #107c41; color: #fff; border-color: #107c41; cursor: pointer;">🎨 ویرایش گروهی ویژگی‌ها (' + state.selectedIds.length + ')</button>' +
          '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="wc-bpe-btn-send-to-wizard" style="background: #7f54b3; color: #fff; border-color: #7f54b3;">⚡ ارسال به ویزارد (' + state.selectedIds.length + ')</button>';
    }

    // Quick Horizontal Scroll Buttons
    html += '<div style="display: inline-flex; align-items: center; gap: 3px; background: #fff; border: 1px solid #c3c4c7; border-radius: 3px; padding: 2px 6px; font-size: 11px;">' +
        '<span style="color: #646970;">اسکرول:</span>' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="wc-bpe-scroll-right" style="padding: 1px 6px; cursor: pointer;" title="اسکرول به راست">▶</button>' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="wc-bpe-scroll-left" style="padding: 1px 6px; cursor: pointer;" title="اسکرول به چپ">◀</button>' +
        '</div>';

    html += '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="wc-bpe-btn-discard" ' + (state.modifiedIds.size === 0 ? 'disabled' : '') + '>لغو تغییرات</button>' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-primary" id="wc-bpe-btn-save-all" ' + (state.modifiedIds.size === 0 ? 'disabled' : '') + '>💾 ذخیره تغییرات جدول</button>' +
        '</div>' +
        '</div></div>';

    // Top Synced Scrollbar for quick scrolling without going down
    html += renderPageBar() + '<div class="wc-bpe-top-scrollbar" id="wc-bpe-top-scroll" title="نوار اسکرول افقی بالای جدول">' +
        '<div style="width: 1750px; height: 1px;"></div>' +
        '</div>' +
        '<div class="wc-bpe-table-wrapper" id="wc-bpe-table-wrap">' +
        '<div style="padding: 10px 14px; background: #fbfbfb; border-bottom: 1px solid #e5e5e5; display: flex; justify-content: space-between; align-items: center; font-size: 12px;">' +
        '<span>نمایش <strong>' + filtered.length + ' محصول</strong> در این صفحه' + (state.totalStoreProducts > 0 ? ' (مجموع نتایج: ' + state.totalStoreProducts + ' | صفحه ' + state.page + ' از ' + state.totalPages + ')' : '') + '</span>' +
        '<div style="display:flex; align-items:center; gap:6px;">' +
        '<span style="font-size:11px; color:#646970;">تعداد نمایش در صفحه:</span>' +
        '<select id="wc-bpe-table-limit" class="wc-bpe-select" style="font-size:11px; padding:2px 6px;">' +
        '<option value="50" ' + (state.pageLimit === 50 ? 'selected' : '') + '>۵۰ کالا</option>' +
        '<option value="100" ' + (state.pageLimit === 100 ? 'selected' : '') + '>۱۰۰ کالا</option>' +
        '<option value="250" ' + (state.pageLimit === 250 ? 'selected' : '') + '>۲۵۰ کالا</option>' +
        '<option value="500" ' + (state.pageLimit === 500 ? 'selected' : '') + '>۵۰۰ کالا</option>' +
        '<option value="1000" ' + (state.pageLimit === 1000 ? 'selected' : '') + '>۱,۰۰۰ کالا</option>' +
        '<option value="-1" ' + (state.pageLimit === -1 ? 'selected' : '') + '>🌐 همه محصولات فروشگاه</option>' +
        '</select>' +
        '</div>' +
        '</div>' +
        '<datalist id="wc-bpe-coupons-datalist">' +
        state.coupons.map(function(c) {
          return '<option value="' + escapeHtml(c) + '">🏷️ ' + escapeHtml(c) + '</option>';
        }).join('') +
        '</datalist>' +
        '<table class="wc-bpe-table">' +
        '<thead>' +
        '<tr>' +
        '<th style="width: 30px; text-align: center;"><input type="checkbox" id="wc-bpe-select-all" ' + (filtered.length > 0 && filtered.every(function(p) { return state.selectedIds.indexOf(p.id) !== -1; }) ? 'checked' : '') + '></th>' +
        '<th style="width: 50px;">ID</th>' +
        '<th style="width: 60px; text-align: center;">تصویر</th>' +
        '<th style="min-width: 200px;">Title (نام محصول)</th>' +
        '<th style="width: 110px;">کد کالا (SKU)</th>' +
        '<th style="width: 105px;">نوع کالا (Type)</th>' +
        '<th style="min-width: 120px;">Category</th>' +
        '<th style="min-width: 125px;">' +
        '<div style="display:flex; align-items:center; gap:6px;">' +
        '<span>Brand (برند)</span>' +
        '<span class="badge" style="font-size:10px; padding:1px 5px; ' + (state.settings.brandSource === 'taxonomy' ? 'background:#dbeafe; color:#1e40af;' : 'background:#d1fae5; color:#065f46;') + '">' +
        (state.settings.brandSource === 'taxonomy' ? 'وکامرس' : 'ویژگی') +
        '</span>' +
        '</div>' +
        '</th>' +
        '<th style="width: 125px; text-align: center;">' +
        '<div style="display:flex; align-items:center; justify-content:center; gap:4px; color:#7c3aed; font-weight:bold;">' +
        '<span>🎟️ کد تخفیف</span>' +
        '</div>' +
        '</th>' +
        '<th style="width: 130px; text-align: center;">Status (وضعیت انتشار)</th>' +
        '<th style="width: 110px;">Regular price</th>' +
        '<th style="width: 110px;">Sale price</th>' +
        '<th style="width: 95px; text-align: center;">Manage stock</th>' +
        '<th style="width: 80px;">Stock quantity</th>' +
        '<th style="width: 90px;">Stock status</th>' +
        '<th style="width: 95px; text-align: center;">' +
        '<div style="display:flex; flex-direction:column; align-items:center;">' +
        '<span>اسنپ‌پی</span>' +
        '<span style="font-size:9px; color:#646970; font-family:monospace;">' + escapeHtml(state.settings.snappayMetaKey) + '</span>' +
        '</div>' +
        '</th>' +
        '<th style="width: 95px; text-align: center;">' +
        '<div style="display:flex; flex-direction:column; align-items:center;">' +
        '<span>ترب‌پی</span>' +
        '<span style="font-size:9px; color:#646970; font-family:monospace;">' + escapeHtml(state.settings.torobMetaKey) + '</span>' +
        '</div>' +
        '</th>' +
        '<th style="width: 90px; text-align: center;">Description</th>' +
        '<th style="width: 90px; text-align: center;">Short Desc.</th>' +
        '<th style="width: 80px; text-align: center;">Actions</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>';

    if (filtered.length === 0) {
      html += '<tr><td colspan="19" style="text-align: center; padding: 30px;">محصولی یافت نشد.</td></tr>';
    } else {
      filtered.forEach(function(p) {
        var isModified = state.modifiedIds.has(p.id);
        var isSelected = state.selectedIds.indexOf(p.id) !== -1;

        html += '<tr class="' + (isModified ? 'modified ' : '') + (isSelected ? 'selected' : '') + '">' +
            '<td style="text-align: center;"><input type="checkbox" class="wc-bpe-row-check" data-id="' + p.id + '" ' + (isSelected ? 'checked' : '') + '></td>' +
            '<td style="font-family: monospace; color: #2271b1; font-weight: bold;">' + p.id + '</td>' +
            '<td style="text-align: center;">' +
            (p.thumbnail ? '<img src="' + escapeHtml(p.thumbnail) + '" class="wc-bpe-thumb">' : '<div class="wc-bpe-thumb-empty">/</div>') +
            '</td>' +
            '<td><input type="text" class="wc-bpe-cell-input wc-bpe-edit-field" data-id="' + p.id + '" data-field="name" value="' + escapeHtml(p.name) + '"></td>' +
            '<td><input type="text" class="wc-bpe-cell-input wc-bpe-edit-field" data-id="' + p.id + '" data-field="sku" value="' + escapeHtml(p.sku || '') + '" placeholder="کد کالا..." dir="ltr" style="font-family: monospace; font-size: 11px; width: 100px; text-align: left;"></td>' +
            '<td>' +
            '<select class="wc-bpe-cell-input wc-bpe-edit-field" data-id="' + p.id + '" data-field="type" style="font-size: 11px; padding: 2px 4px; font-weight: 500; ' + (p.type === 'variable' ? 'background: #f5f3ff; color: #6d28d9; border-color: #ddd6fe;' : 'background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe;') + '">' +
            '<option value="simple" ' + (p.type === 'simple' ? 'selected' : '') + '>ساده (Simple)</option>' +
            '<option value="variable" ' + (p.type === 'variable' ? 'selected' : '') + '>متغیر (Variable)</option>' +
            '<option value="grouped" ' + (p.type === 'grouped' ? 'selected' : '') + '>گروهی (Grouped)</option>' +
            '<option value="external" ' + (p.type === 'external' ? 'selected' : '') + '>خارجی (External)</option>' +
            '</select>' +
            '</td>' +
            '<td><input type="text" class="wc-bpe-cell-input wc-bpe-edit-field" data-id="' + p.id + '" data-field="category" value="' + escapeHtml(p.category || '') + '"></td>' +
            '<td><input type="text" class="wc-bpe-cell-input wc-bpe-edit-field" data-id="' + p.id + '" data-field="brand" value="' + escapeHtml(p.brand || '') + '"></td>' +
            '<td style="text-align: center; vertical-align: middle;">' +
            '<div style="display:flex; align-items:center; justify-content:center; gap:2px; min-width: 105px;">' +
            '<select class="wc-bpe-cell-input wc-bpe-coupon-cell-select" data-id="' + p.id + '" style="font-family: monospace; font-size: 11px; font-weight: bold; width: 100%; border-radius: 3px; padding: 3px 4px; cursor: pointer; ' +
            (p.couponCode ? 'background: #f3e8ff; color: #6b21a8; border: 1px solid #c084fc;' : 'background: #fff; color: #646970; border: 1px solid #c3c4c7;') + '">' +
            '<option value="">—بدون کد تخفیف—</option>' +
            state.coupons.map(function(c) {
              return '<option value="' + escapeHtml(c) + '" ' + (p.couponCode === c ? 'selected' : '') + '>🏷️ ' + escapeHtml(c) + '</option>';
            }).join('') +
            (p.couponCode && state.coupons.indexOf(p.couponCode) === -1 ? '<option value="' + escapeHtml(p.couponCode) + '" selected>🏷️ ' + escapeHtml(p.couponCode) + ' (سفارشی)</option>' : '') +
            '<option value="__custom__">✏️ تایپ کد دلخواه...</option>' +
            '</select>' +
            (p.couponCode ? '<button type="button" class="wc-bpe-clear-coupon" data-id="' + p.id + '" style="background:none; border:none; color:#ef4444; font-size:12px; font-weight:bold; cursor:pointer; padding:0 2px;" title="حذف کد تخفیف">✕</button>' : '') +
            '</div>' +
            '</td>' +
            '<td style="text-align: center; vertical-align: middle;">' +
            '<select class="wc-bpe-cell-input wc-bpe-edit-field" data-id="' + p.id + '" data-field="status" style="font-size: 11px; font-weight: bold; border-radius: 4px; padding: 2px 5px; cursor: pointer; border: 1px solid; ' +
            (p.status === 'publish' ? 'background: #ecfdf5; color: #065f46; border-color: #a7f3d0;' :
                p.status === 'draft' ? 'background: #f3f4f6; color: #374151; border-color: #d1d5db;' :
                    p.status === 'pending' ? 'background: #fffbeb; color: #92400e; border-color: #fde68a;' :
                        p.status === 'private' ? 'background: #fff1f2; color: #9f1239; border-color: #fecdd3;' :
                            'background: #eff6ff; color: #1e40af; border-color: #bfdbfe;') + '">' +
            '<option value="publish" ' + (p.status === 'publish' ? 'selected' : '') + ' style="color:#065f46; font-weight:bold;">🟢 منتشر شده (Publish)</option>' +
            '<option value="draft" ' + (p.status === 'draft' ? 'selected' : '') + ' style="color:#374151; font-weight:bold;">📝 پیش‌نویس (Draft)</option>' +
            '<option value="pending" ' + (p.status === 'pending' ? 'selected' : '') + ' style="color:#92400e; font-weight:bold;">⏳ در انتظار بررسی (Pending)</option>' +
            '<option value="private" ' + (p.status === 'private' ? 'selected' : '') + ' style="color:#9f1239; font-weight:bold;">🔒 خصوصی (Private)</option>' +
            '<option value="future" ' + (p.status === 'future' ? 'selected' : '') + ' style="color:#1e40af; font-weight:bold;">⏰ زمان‌بندی (Scheduled)</option>' +
            (p.status && ['publish', 'draft', 'pending', 'private', 'future'].indexOf(p.status) === -1 ? '<option value="' + escapeHtml(p.status) + '" selected>' + escapeHtml(p.status) + '</option>' : '') +
            '</select>' +
            '</td>' +
            '<td><input type="number" class="wc-bpe-cell-input wc-bpe-edit-field" data-id="' + p.id + '" data-field="regularPrice" value="' + p.regularPrice + '" dir="ltr"></td>' +
            '<td><input type="number" class="wc-bpe-cell-input wc-bpe-edit-field" data-id="' + p.id + '" data-field="salePrice" value="' + (p.salePrice !== null ? p.salePrice : '') + '" placeholder="—" dir="ltr"></td>' +
            '<td style="text-align: center;">' +
            '<div class="wc-bpe-switch ' + (p.manageStock ? 'active' : '') + '" data-id="' + p.id + '" title="' + (p.manageStock ? 'کلیک جهت غیرفعال‌سازی مدیریت انبار (کالا ناموجود می‌شود اما موجودی تغییر نمی‌کند)' : 'کلیک جهت فعال‌سازی مدیریت انبار') + '" style="cursor: pointer;">' +
            '<div class="wc-bpe-switch-track"><div class="wc-bpe-switch-thumb"></div></div>' +
            '<span class="wc-bpe-switch-label">' + (p.manageStock ? 'Yes' : 'No') + '</span>' +
            '</div>' +
            '</td>' +
            '<td><div style="display:flex; align-items:center; gap:4px;"><input type="number" class="wc-bpe-cell-input wc-bpe-edit-field" data-id="' + p.id + '" data-field="stockQuantity" value="' + (p.stockQuantity !== null && p.stockQuantity !== undefined ? p.stockQuantity : 10) + '" ' + (!p.manageStock ? 'disabled style="opacity: 0.8; background: #f6f7f7; font-weight: bold; width: 55px;"' : 'style="width: 60px;"') + ' title="' + (!p.manageStock ? 'مدیریت موجودی غیرفعال است (موجودی ' + p.stockQuantity + ' عدد حفظ شده و صفر نمی‌شود)' : 'تعداد موجودی انبار') + '" dir="ltr">' +
            (!p.manageStock ? '<span style="font-size: 10px; background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; padding: 1px 4px; border-radius: 3px; font-weight: bold;" title="موجودی این کالا صفر نشده و در سیستم محفوظ است">محفوظ</span>' : '') +
            '</div></td>' +
            '<td>' +
            '<select class="wc-bpe-cell-input wc-bpe-edit-field" data-id="' + p.id + '" data-field="stockStatus" style="font-weight: 600; color: ' + (p.stockStatus === 'instock' ? '#00a32a' : '#d63638') + ';">' +
            '<option value="instock" ' + (p.stockStatus === 'instock' ? 'selected' : '') + ' style="color:#00a32a;">In stock (موجود)</option>' +
            '<option value="outofstock" ' + (p.stockStatus === 'outofstock' ? 'selected' : '') + ' style="color:#d63638;">Out of stock (ناموجود)</option>' +
            '<option value="onbackorder" ' + (p.stockStatus === 'onbackorder' ? 'selected' : '') + ' style="color:#d97706;">On backorder</option>' +
            '</select>' +
            '</td>' +
            '<td style="text-align: center;">' +
            '<button type="button" class="wc-bpe-toggle-gateway ' + (p.snappayEnabled ? 'gateway-active' : 'gateway-inactive') + '" data-id="' + p.id + '" data-gateway="snappay" style="padding: 2px 8px; font-size: 11px; font-weight: bold; border-radius: 4px; border: 1px solid; cursor: pointer; ' + (p.snappayEnabled ? 'background: #eff6ff; color: #1e40af; border-color: #93c5fd;' : 'background: #f8fafc; color: #64748b; border-color: #cbd5e1;') + '" title="' + (p.snappayEnabled ? 'اسنپ‌پی برای این کالا فعال است (مقدار متای _disable_snappay در دیتابیس: no)' : 'اسنپ‌پی برای این کالا غیرفعال است (مقدار متای _disable_snappay در دیتابیس: yes)') + '">' +
            (p.snappayEnabled ? 'فعال' : 'غیرفعال') +
            '</button>' +
            '</td>' +
            '<td style="text-align: center;">' +
            '<button type="button" class="wc-bpe-toggle-gateway ' + (p.torobPayEnabled ? 'gateway-active' : 'gateway-inactive') + '" data-id="' + p.id + '" data-gateway="torob" style="padding: 2px 8px; font-size: 11px; font-weight: bold; border-radius: 4px; border: 1px solid; cursor: pointer; ' + (p.torobPayEnabled ? 'background: #eff6ff; color: #1e40af; border-color: #93c5fd;' : 'background: #f8fafc; color: #64748b; border-color: #cbd5e1;') + '" title="' + (p.torobPayEnabled ? 'ترب‌پی برای این کالا فعال است (مقدار متای _disable_torobpay در دیتابیس: no)' : 'ترب‌پی برای این کالا غیرفعال است (مقدار متای _disable_torobpay در دیتابیس: yes)') + '">' +
            (p.torobPayEnabled ? 'فعال' : 'غیرفعال') +
            '</button>' +
            '</td>' +
            '<td style="text-align: center;">' +
            '<button type="button" class="wc-bpe-btn-content ' + (p.description ? 'has-content' : '') + '" data-id="' + p.id + '" data-field="description">' + (p.description ? 'Content' : 'Content[empty]') + '</button>' +
            '</td>' +
            '<td style="text-align: center;">' +
            '<button type="button" class="wc-bpe-btn-content ' + (p.shortDescription ? 'has-content' : '') + '" data-id="' + p.id + '" data-field="shortDescription">' + (p.shortDescription ? 'Content' : 'Content[empty]') + '</button>' +
            '</td>' +
            '<td style="text-align: center;">' +
            '<button type="button" class="button button-small wc-bpe-btn-preview" data-id="' + p.id + '" title="پیش‌نمایش">👁️</button> ' +
            '<button type="button" class="button button-small wc-bpe-btn-save-row" data-id="' + p.id + '" title="ذخیره این ردیف">💾</button>' +
            '</td>' +
            '</tr>';
      });
    }

    html += '</tbody></table>' +
        renderPagination() +
        '</div>';

    return html;
  }

  function renderWizardView() {
    var html = '<div class="wc-bpe-card">';

    // Stepper
    html += '<div class="wc-bpe-stepper">' +
        '<div class="wc-bpe-stepper-track"></div>' +
        '<div class="wc-bpe-stepper-progress" style="width: ' + ((state.wizardStep - 1) * 25) + '%;"></div>' +
        renderStepNode(1, 'انتخاب محصولات') +
        renderStepNode(2, 'تعریف تغییرات') +
        renderStepNode(3, 'پیش‌نمایش ایمن') +
        renderStepNode(4, 'تأیید و اجرا') +
        renderStepNode(5, 'گزارش و نتیجه') +
        '</div>';

    if (state.wizardStep === 1) {
      html += renderWizardStep1();
    } else if (state.wizardStep === 2) {
      html += renderWizardStep2();
    } else if (state.wizardStep === 3) {
      html += renderWizardStep3();
    } else if (state.wizardStep === 4) {
      html += renderWizardStep4();
    } else if (state.wizardStep === 5) {
      html += renderWizardStep5();
    }

    html += '</div>';
    return html;
  }

  function renderStepNode(num, title) {
    var isActive = state.wizardStep === num;
    var isDone = state.wizardStep > num;
    return '<button type="button" class="wc-bpe-step-node ' + (isActive ? 'active' : '') + ' ' + (isDone ? 'completed' : '') + '" data-step="' + num + '">' +
        '<div class="wc-bpe-step-circle">' + (isDone ? '✓' : num) + '</div>' +
        '<div class="wc-bpe-step-label">' + title + '</div>' +
        '</button>';
  }

  function renderWizardStep1() {
    var filtered = getFilteredProducts();
    var allFilteredSelected = filtered.length > 0 && filtered.every(function(p) {
      return state.selectedIds.indexOf(p.id) !== -1;
    });

    var html = '<div style="margin-bottom: 15px;">' +
        '<div class="wc-bpe-notice wc-bpe-notice-info">' +
        '<strong>مرحله ۱:</strong> محصولات مورد نظر خود را با فیلترهای زیر بیابید، آن‌ها را انتخاب نموده و روی «مرحله بعد: تعریف تغییرات» کلیک نمایید.' +
        '</div>' +

        renderFilterBar('wiz') +

        // Guide banner on editing all products
        '<div style="background:#ecfdf5; border-right:4px solid #059669; padding:10px 14px; border-radius:3px; margin-bottom:12px; font-size:12px; color:#065f46; display:flex; align-items:center; gap:8px;">' +
        '<strong style="color:#047857;">💡 راهنمای ویرایش گروهی کل محصولات فروشگاه (بدون محدودیت ۱۰۰تایی):</strong>' +
        '<span>جهت ویرایش هم‌زمان کلیه محصولات فروشگاه (حتی چند هزار کالا)، روی دکمه سبز رنگ <strong>«🌐 انتخاب تمام محصولات فروشگاه»</strong> کلیک فرمایید یا در کشوی «تعداد در صفحه» گزینه <strong>«همه (بدون محدودیت)»</strong> را انتخاب نمایید.</span>' +
        '</div>' +

        // Action toolbar for selection
        '<div style="background: #fff; border: 1px solid #c3c4c7; border-radius: 4px; padding: 10px 15px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 12px; font-size: 12px;">' +
        '<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px;">' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-primary" id="wc-bpe-select-all-store" style="background:#047857; border-color:#047857; color:#fff; font-weight:bold; font-size:12px; padding:5px 12px; display:flex; align-items:center; gap:5px;" title="انتخاب تمام محصولات کل فروشگاه بدون محدودیت تعداد">' +
        '<span>🌐 انتخاب تمام محصولات فروشگاه</span>' +
        '<span style="background:rgba(255,255,255,0.25); padding:1px 6px; border-radius:10px; font-size:11px;">' + (state.totalStoreProducts > 0 ? state.totalStoreProducts : filtered.length) + ' کالا</span>' +
        '</button>' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="wc-bpe-select-all-filtered">' +
        (allFilteredSelected ? 'لغو انتخاب موارد این صفحه' : 'انتخاب همه ' + filtered.length + ' محصول این صفحه') +
        '</button>' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="wc-bpe-invert-filtered">انتخاب معکوس</button>' +
        (state.selectedIds.length > 0 ? '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="wc-bpe-deselect-all" style="color: #d63638;">لغو تمام انتخاب‌ها (' + state.selectedIds.length + ')</button>' : '') +
        '</div>' +
        '<div style="display:flex; align-items:center; gap:12px;">' +
        '<div style="display:flex; align-items:center; gap:4px; font-size:11px; color:#4b5563;">' +
        '<span>تعداد در صفحه:</span>' +
        '<select id="wc-bpe-wiz-limit" class="wc-bpe-select" style="font-size:11px; padding:2px 5px;">' +
        '<option value="50" ' + (state.pageLimit === 50 ? 'selected' : '') + '>۵۰</option>' +
        '<option value="100" ' + (state.pageLimit === 100 ? 'selected' : '') + '>۱۰۰</option>' +
        '<option value="250" ' + (state.pageLimit === 250 ? 'selected' : '') + '>۲۵۰</option>' +
        '<option value="500" ' + (state.pageLimit === 500 ? 'selected' : '') + '>۵۰۰</option>' +
        '<option value="1000" ' + (state.pageLimit === 1000 ? 'selected' : '') + '>۱۰۰۰</option>' +
        '<option value="-1" ' + (state.pageLimit === -1 ? 'selected' : '') + '>همه (بدون محدودیت)</option>' +
        '</select>' +
        '</div>' +
        '<div>' +
        'تعداد انتخاب‌شده برای ویرایش: <strong style="color: #2271b1; font-size: 14px;">' + state.selectedIds.length + '</strong> کالا' +
        '</div>' +
        '</div>' +
        '</div>' +

        renderPageBar() +

        // Products Table
        '<div class="wc-bpe-table-wrapper">' +
        '<table class="wc-bpe-table">' +
        '<thead>' +
        '<tr>' +
        '<th style="width: 35px; text-align: center;"><input type="checkbox" id="wc-bpe-wiz-header-check" ' + (allFilteredSelected ? 'checked' : '') + '></th>' +
        '<th style="width: 50px;">شناسه</th>' +
        '<th style="width: 50px; text-align: center;">تصویر</th>' +
        '<th>نام و عنوان محصول</th>' +
        '<th style="width: 110px;">کد کالا (SKU)</th>' +
        '<th style="width: 80px;">نوع</th>' +
        '<th style="width: 110px;">قیمت فروش</th>' +
        '<th style="width: 90px;">موجودی</th>' +
        '<th style="width: 90px;">اسنپ‌پی / ترب</th>' +
        '<th style="width: 80px;">وضعیت</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>';

    if (filtered.length === 0) {
      html += '<tr><td colspan="10" style="text-align: center; padding: 30px; color: #646970;">محصولی با فیلترهای مشخص‌شده یافت نشد. لطفاً فیلترها را تغییر داده یا دکمه پاک‌سازی را بزنید.</td></tr>';
    } else {
      filtered.forEach(function(p) {
        var isSelected = state.selectedIds.indexOf(p.id) !== -1;
        var hasSale = p.salePrice !== null && p.salePrice > 0 && p.salePrice < p.regularPrice;

        html += '<tr class="wc-bpe-wiz-row ' + (isSelected ? 'selected' : '') + '" data-id="' + p.id + '" style="cursor: pointer;">' +
            '<td style="text-align: center;" class="wc-bpe-no-propagate">' +
            '<input type="checkbox" class="wc-bpe-wiz-row-check" data-id="' + p.id + '" ' + (isSelected ? 'checked' : '') + '>' +
            '</td>' +
            '<td style="font-family: monospace; color: #2271b1; font-weight: bold;">#' + p.id + '</td>' +
            '<td style="text-align: center;">' +
            (p.thumbnail ? '<img src="' + escapeHtml(p.thumbnail) + '" class="wc-bpe-thumb">' : '<div class="wc-bpe-thumb-empty">/</div>') +
            '</td>' +
            '<td>' +
            '<strong style="color: #1d2327;">' + escapeHtml(p.name) + '</strong>' +
            '<div style="font-size: 11px; color: #646970; margin-top: 3px;">' +
            'دسته: ' + escapeHtml(p.category || '—') + ' | برند: ' + escapeHtml(p.brand || '—') +
            (p.variations ? ' | <span style="color:#2271b1;">' + p.variations.length + ' تنوع کالا</span>' : '') +
            '</div>' +
            '</td>' +
            '<td style="font-family: monospace; color: #50575e;" dir="ltr">' + escapeHtml(p.sku || '—') + '</td>' +
            '<td>' +
            '<span class="badge" style="background: ' + (p.type === 'variable' ? '#ede9fe; color: #6d28d9;' : '#f3f4f6; color: #374151;') + '">' +
            (p.type === 'variable' ? 'متغیر' : 'ساده') +
            '</span>' +
            '</td>' +
            '<td>';
        if (hasSale) {
          html += '<div style="color: #d63638; font-weight: bold;">' + p.salePrice.toLocaleString() + ' <small>تومان</small></div>' +
              '<div style="font-size: 10px; color: #646970; text-decoration: line-through;">' + p.regularPrice.toLocaleString() + '</div>';
        } else {
          html += '<div style="color: #1d2327; font-weight: 500;">' + (p.regularPrice ? p.regularPrice.toLocaleString() : '۰') + ' <small>تومان</small></div>';
        }
        html += '</td>' +
            '<td>' +
            '<span class="badge" style="background: ' + (p.stockStatus === 'instock' ? '#e8f5e9; color: #2e7d32;' : '#ffebee; color: #c62828;') + '">' +
            (p.stockStatus === 'instock' ? p.stockQuantity + ' عدد' : 'ناموجود') +
            '</span>' +
            '</td>' +
            '<td>' +
            '<span style="font-size: 10px; padding: 1px 4px; border-radius: 2px; margin-left: 2px; background: ' + (p.snappayEnabled ? '#e8f5e9; color: #2e7d32;' : '#f5f5f5; color: #999;') + '">اسنپ‌پی</span>' +
            '<span style="font-size: 10px; padding: 1px 4px; border-radius: 2px; background: ' + (p.torobPayEnabled ? '#e3f2fd; color: #1565c0;' : '#f5f5f5; color: #999;') + '">ترب</span>' +
            '</td>' +
            '<td>' +
            '<span class="badge" style="font-size: 11px; font-weight: bold; ' +
            (p.status === 'publish' ? 'background: #ecfdf5; color: #065f46;' :
                p.status === 'draft' ? 'background: #f3f4f6; color: #374151;' :
                    p.status === 'pending' ? 'background: #fffbeb; color: #92400e;' :
                        p.status === 'private' ? 'background: #fff1f2; color: #9f1239;' :
                            'background: #eff6ff; color: #1e40af;') + '">' +
            (p.status === 'publish' ? '🟢 منتشر شده' :
                p.status === 'draft' ? '📝 پیش‌نویس' :
                    p.status === 'pending' ? '⏳ در انتظار' :
                        p.status === 'private' ? '🔒 خصوصی' :
                            p.status === 'future' ? '⏰ زمان‌بندی' : (p.status || 'پیش‌نویس')) +
            '</span>' +
            '</td>' +
            '</tr>';
      });
    }

    html += '</tbody></table>' +
        renderPagination() +
        '</div>' +

        // Bottom step next button
        '<div style="background: #fff; border: 1px solid #c3c4c7; border-radius: 4px; padding: 12px 18px; margin-top: 15px; display: flex; justify-content: space-between; align-items: center;">' +
        '<div>' +
        '<span style="font-size: 13px; font-weight: bold; color: #2c3338;">تعداد ' + state.selectedIds.length + ' محصول برای ویرایش انتخاب شده است.</span>' +
        '<div style="font-size: 11px; color: #646970; margin-top: 2px;">' +
        (state.selectedIds.length === 0 ? 'جهت رفتن به مرحله بعد، حداقل یک محصول را با تیک زدن انتخاب کنید.' : 'در مرحله بعد، تغییرات قیمت، تخفیف، موجودی و وضعیت را تعیین خواهید کرد.') +
        '</div>' +
        '</div>' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-primary" id="wc-bpe-wizard-next" ' + (state.selectedIds.length === 0 ? 'disabled' : '') + ' style="padding: 8px 20px; font-weight: bold;">' +
        'مرحله بعد: تعریف تغییرات (' + state.selectedIds.length + ' محصول) ➔' +
        '</button>' +
        '</div>' +
        '</div>';

    return html;
  }

  function calculateNewPrice(current, type, val, roundTo) {
    var base = current || 0;
    var res = base;
    if (type === 'fixed') res = Math.max(0, val);
    else if (type === 'increase_percent') res = base + (base * (val / 100));
    else if (type === 'decrease_percent') res = Math.max(0, base - (base * (val / 100)));
    else if (type === 'increase_amount') res = base + val;
    else if (type === 'decrease_amount') res = Math.max(0, base - val);

    if (roundTo > 1) {
      res = Math.round(res / roundTo) * roundTo;
    }
    return Math.round(res);
  }

  function calculateSalePrice(regPrice, currentSale, type, val, roundTo) {
    if (type === 'remove') return null;
    if (type === 'fixed') return Math.max(0, Math.round(val));
    if (type === 'decrease_percent') {
      var res = Math.max(0, regPrice - (regPrice * (val / 100)));
      if (roundTo > 1) res = Math.round(res / roundTo) * roundTo;
      return Math.round(res);
    }
    if (type === 'decrease_amount') {
      var res = Math.max(0, regPrice - val);
      if (roundTo > 1) res = Math.round(res / roundTo) * roundTo;
      return Math.round(res);
    }
    return currentSale;
  }

  function calculateNewStock(current, type, val) {
    if (type === 'fixed') return Math.max(0, Math.floor(val));
    if (type === 'increase') return Math.max(0, current + Math.floor(val));
    if (type === 'decrease') return Math.max(0, current - Math.floor(val));
    return current;
  }

  function renderWizardStep2() {
    var ops = state.opSettings;
    var html = '<div>' +
        '<div class="wc-bpe-notice wc-bpe-notice-info">' +
        '<strong>مرحله ۲:</strong> قواعد مورد نظر برای تغییر قیمت، وضعیت انتشار و موجودی را تعیین کنید. فیلدهایی که روی «بدون تغییر» هستند کاملاً دست‌نخورده باقی می‌مانند.' +
        '</div>' +
        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">' +

        // 1. Regular Price
        '<div style="background: #f9f9f9; padding: 15px; border-radius: 4px; border: 1px solid #e5e5e5;">' +
        '<strong>💰 قیمت عادی (Regular Price)</strong>' +
        '<div style="margin-top: 8px;">' +
        '<select id="wc-bpe-op-reg-type" class="wc-bpe-select" style="width: 100%;">' +
        '<option value="none" ' + (ops.regularPriceType === 'none' ? 'selected' : '') + '>بدون تغییر (دست‌نخورده)</option>' +
        '<option value="increase_percent" ' + (ops.regularPriceType === 'increase_percent' ? 'selected' : '') + '>افزایش درصدی (+)</option>' +
        '<option value="decrease_percent" ' + (ops.regularPriceType === 'decrease_percent' ? 'selected' : '') + '>کاهش درصدی (-)</option>' +
        '<option value="increase_amount" ' + (ops.regularPriceType === 'increase_amount' ? 'selected' : '') + '>افزایش مبلغ ثابت (تومان)</option>' +
        '<option value="decrease_amount" ' + (ops.regularPriceType === 'decrease_amount' ? 'selected' : '') + '>کاهش مبلغ ثابت (تومان)</option>' +
        '<option value="fixed" ' + (ops.regularPriceType === 'fixed' ? 'selected' : '') + '>تعیین قیمت ثابت یکسان</option>' +
        '</select>' +
        '</div>' +
        '<div style="margin-top: 8px;">' +
        '<label style="display:block; font-size:11px; margin-bottom:3px;">مقدار (درصد یا تومان):</label>' +
        '<input type="number" id="wc-bpe-op-reg-val" class="wc-bpe-input" value="' + ops.regularPriceValue + '" style="width: 100%;">' +
        '</div>' +
        '<div style="margin-top: 8px;">' +
        '<label style="display:block; font-size:11px; margin-bottom:3px;">گرد کردن قیمت نهایی:</label>' +
        '<select id="wc-bpe-op-round" class="wc-bpe-select" style="width: 100%;">' +
        '<option value="0" ' + (ops.roundPriceTo === 0 ? 'selected' : '') + '>بدون گرد کردن دقیق</option>' +
        '<option value="1000" ' + (ops.roundPriceTo === 1000 ? 'selected' : '') + '>گرد کردن به ۱,۰۰۰ تومان</option>' +
        '<option value="5000" ' + (ops.roundPriceTo === 5000 ? 'selected' : '') + '>گرد کردن به ۵,۰۰۰ تومان</option>' +
        '<option value="10000" ' + (ops.roundPriceTo === 10000 ? 'selected' : '') + '>گرد کردن به ۱۰,۰۰۰ تومان</option>' +
        '</select>' +
        '</div>' +
        '</div>' +

        // 2. Sale Price
        '<div style="background: #f9f9f9; padding: 15px; border-radius: 4px; border: 1px solid #e5e5e5;">' +
        '<strong>🏷️ قیمت فروش ویژه / حراج (Sale Price)</strong>' +
        '<div style="margin-top: 8px;">' +
        '<select id="wc-bpe-op-sale-type" class="wc-bpe-select" style="width: 100%;">' +
        '<option value="none" ' + (ops.salePriceType === 'none' ? 'selected' : '') + '>بدون تغییر (دست‌نخورده)</option>' +
        '<option value="decrease_percent" ' + (ops.salePriceType === 'decrease_percent' ? 'selected' : '') + '>تخفیف درصدی بر اساس قیمت عادی</option>' +
        '<option value="decrease_amount" ' + (ops.salePriceType === 'decrease_amount' ? 'selected' : '') + '>کسر مبلغ تخفیف مشخص (تومان)</option>' +
        '<option value="fixed" ' + (ops.salePriceType === 'fixed' ? 'selected' : '') + '>تعیین قیمت حراج ثابت</option>' +
        '<option value="remove" ' + (ops.salePriceType === 'remove' ? 'selected' : '') + '>حذف تخفیف و بازگشت به قیمت اصلی</option>' +
        '</select>' +
        '</div>' +
        '<div style="margin-top: 8px;">' +
        '<label style="display:block; font-size:11px; margin-bottom:3px;">مقدار درصد یا مبلغ تخفیف:</label>' +
        '<input type="number" id="wc-bpe-op-sale-val" class="wc-bpe-input" value="' + ops.salePriceValue + '" style="width: 100%;">' +
        '</div>' +
        '</div>' +

        // 3. Post Status (Publish / Draft / Pending / Private)
        '<div style="background: #f9f9f9; padding: 15px; border-radius: 4px; border: 1px solid #e5e5e5;">' +
        '<strong>📢 وضعیت انتشار محصول (Post Status)</strong>' +
        '<div style="margin-top: 8px;">' +
        '<select id="wc-bpe-op-status" class="wc-bpe-select" style="width: 100%;">' +
        '<option value="none" ' + (ops.statusAction === 'none' ? 'selected' : '') + '>بدون تغییر (دست‌نخورده)</option>' +
        '<option value="publish" ' + (ops.statusAction === 'publish' ? 'selected' : '') + '>منتشر شده (Publish)</option>' +
        '<option value="draft" ' + (ops.statusAction === 'draft' ? 'selected' : '') + '>پیش‌نویس (Draft)</option>' +
        '<option value="pending" ' + (ops.statusAction === 'pending' ? 'selected' : '') + '>در انتظار بررسی (Pending)</option>' +
        '<option value="private" ' + (ops.statusAction === 'private' ? 'selected' : '') + '>خصوصی (Private)</option>' +
        '</select>' +
        '</div>' +
        '<p style="font-size: 11px; color: #646970; margin-top: 6px;">با این گزینه می‌توانید به صورت دسته‌ای محصولات را منتشر یا پیش‌نویس نمایید.</p>' +
        '</div>' +

        // 4. Stock Quantity
        '<div style="background: #f9f9f9; padding: 15px; border-radius: 4px; border: 1px solid #e5e5e5;">' +
        '<strong>📦 تعداد موجودی انبار (Stock Quantity)</strong>' +
        '<div style="margin-top: 8px;">' +
        '<select id="wc-bpe-op-stock-type" class="wc-bpe-select" style="width: 100%;">' +
        '<option value="none" ' + (ops.stockType === 'none' ? 'selected' : '') + '>بدون تغییر (دست‌نخورده)</option>' +
        '<option value="increase" ' + (ops.stockType === 'increase' ? 'selected' : '') + '>افزایش موجودی فعلی (+)</option>' +
        '<option value="decrease" ' + (ops.stockType === 'decrease' ? 'selected' : '') + '>کاهش موجودی فعلی (-)</option>' +
        '<option value="fixed" ' + (ops.stockType === 'fixed' ? 'selected' : '') + '>تنظیم موجودی ثابت یکسان</option>' +
        '</select>' +
        '</div>' +
        '<div style="margin-top: 8px;">' +
        '<label style="display:block; font-size:11px; margin-bottom:3px;">تعداد کالا:</label>' +
        '<input type="number" id="wc-bpe-op-stock-val" class="wc-bpe-input" value="' + ops.stockValue + '" style="width: 100%;">' +
        '</div>' +
        '</div>' +

        // 5. Stock Status & Manage Stock
        '<div style="background: #f9f9f9; padding: 15px; border-radius: 4px; border: 1px solid #e5e5e5;">' +
        '<strong>🔘 مدیریت انبار و وضعیت (Stock)</strong>' +
        '<div style="margin-top: 8px;">' +
        '<label style="display:block; font-size:11px; margin-bottom:2px;">مدیریت موجودی انبار (Manage stock):</label>' +
        '<select id="wc-bpe-op-manage-stock" class="wc-bpe-select" style="width: 100%;">' +
        '<option value="none" ' + (ops.manageStockAction === 'none' ? 'selected' : '') + '>بدون تغییر (دست‌نخورده)</option>' +
        '<option value="disable" ' + (ops.manageStockAction === 'disable' ? 'selected' : '') + '>غیرفعال‌سازی (ناموجود شدن کالا با حفظ مقدار موجودی)</option>' +
        '<option value="enable" ' + (ops.manageStockAction === 'enable' ? 'selected' : '') + '>فعال‌سازی مدیریت موجودی انبار</option>' +
        '</select>' +
        '</div>' +
        '<div style="margin-top: 8px;">' +
        '<label style="display:block; font-size:11px; margin-bottom:2px;">تغییر وضعیت انبار به (Stock Status):</label>' +
        '<select id="wc-bpe-op-stock-status" class="wc-bpe-select" style="width: 100%;">' +
        '<option value="none" ' + (ops.stockStatusAction === 'none' ? 'selected' : '') + '>بدون تغییر (دست‌نخورده)</option>' +
        '<option value="instock" ' + (ops.stockStatusAction === 'instock' ? 'selected' : '') + '>موجود در انبار (In Stock)</option>' +
        '<option value="outofstock" ' + (ops.stockStatusAction === 'outofstock' ? 'selected' : '') + '>ناموجود (Out of Stock)</option>' +
        '</select>' +
        '</div>' +
        '<p style="font-size: 11px; color: #b45309; margin-top: 6px;">با غیرفعال‌سازی Manage stock، کالاها ناموجود می‌شوند اما در لیست باقی مانده و موجودی عددی آن‌ها در دیتابیس بدون تغییر حفظ می‌گردد.</p>' +
        '</div>' +

        // 6. Gateways Adapters
        '<div style="background: #f9f9f9; padding: 15px; border-radius: 4px; border: 1px solid #e5e5e5;">' +
        '<strong>💳 درگاه‌های پرداخت اقساطی و اعتباری</strong>' +
        '<div style="margin-top: 8px;">' +
        '<label style="display:block; font-size:11px; margin-bottom:2px;">اسنپ‌پی (Snappay):</label>' +
        '<select id="wc-bpe-op-snappay" class="wc-bpe-select" style="width: 100%;">' +
        '<option value="none" ' + (ops.snappayAction === 'none' ? 'selected' : '') + '>بدون تغییر</option>' +
        '<option value="enable" ' + (ops.snappayAction === 'enable' ? 'selected' : '') + '>فعال‌سازی اسنپ‌پی</option>' +
        '<option value="disable" ' + (ops.snappayAction === 'disable' ? 'selected' : '') + '>غیرفعال‌سازی اسنپ‌پی</option>' +
        '</select>' +
        '</div>' +
        '<div style="margin-top: 8px;">' +
        '<label style="display:block; font-size:11px; margin-bottom:2px;">پرداخت سریع ترب (Torob Pay):</label>' +
        '<select id="wc-bpe-op-torob" class="wc-bpe-select" style="width: 100%;">' +
        '<option value="none" ' + (ops.torobPayAction === 'none' ? 'selected' : '') + '>بدون تغییر</option>' +
        '<option value="enable" ' + (ops.torobPayAction === 'enable' ? 'selected' : '') + '>فعال‌سازی پرداخت ترب</option>' +
        '<option value="disable" ' + (ops.torobPayAction === 'disable' ? 'selected' : '') + '>غیرفعال‌سازی پرداخت ترب</option>' +
        '</select>' +
        '</div>' +
        '</div>' +

        // 7. Coupon / Discount Code (کد تخفیف اختصاصی محصولات)
        '<div style="grid-column: span 2; background: #faf5ff; padding: 15px; border-radius: 4px; border: 1px solid #e9d5ff;">' +
        '<div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">' +
        '<strong style="color: #6b21a8; font-size: 13px;">🎟️ مدیریت و اعمال گروهی کد تخفیف (Discount / Coupon Code)</strong>' +
        '<span class="badge" style="background: #f3e8ff; color: #7e22ce; font-size: 11px;">کوپن‌های ووکامرس</span>' +
        '</div>' +
        '<p style="font-size: 11px; color: #6b7280; margin: 0 0 10px 0;">' +
        'می‌توانید به تمام محصولات انتخاب‌شده یک کد تخفیف اختصاصی نسبت دهید یا آن‌ها را به یک کوپن تخفیف موجود در ووکامرس متصل کنید.' +
        '</p>' +
        '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">' +
        '<div>' +
        '<label style="display:block; font-size:11px; font-weight:600; margin-bottom:4px;">نوع عملیات کد تخفیف:</label>' +
        '<select id="wc-bpe-op-coupon-action" class="wc-bpe-select" style="width: 100%;">' +
        '<option value="none" ' + (ops.couponAction === 'none' ? 'selected' : '') + '>بدون تغییر (دست‌نخورده)</option>' +
        '<option value="set_code" ' + (ops.couponAction === 'set_code' ? 'selected' : '') + '>اختصاص / تنظیم کد تخفیف مشخص برای همه</option>' +
        '<option value="remove" ' + (ops.couponAction === 'remove' ? 'selected' : '') + '>حذف کد تخفیف از محصولات انتخابی</option>' +
        '</select>' +
        '</div>' +
        '<div id="wc-bpe-op-coupon-box" style="' + (ops.couponAction === 'set_code' ? '' : 'display: none;') + '">' +
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">' +
        '<label style="font-size:11px; font-weight:700; color: #6b21a8;">انتخاب کد تخفیف از میان کوپن‌های موجود فروشگاه:</label>' +
        '<span style="font-size:10px; color:#7e22ce; background:#f3e8ff; padding:1px 6px; border-radius:3px;">قابل انتخاب از لیست</span>' +
        '</div>' +
        (function() {
          var cList = (state.coupons && state.coupons.length > 0) ? state.coupons : ['OFF10', 'OFF20', 'OFF30', 'OFF50', 'NOROOZ', 'VIP', 'YALDA', 'SUMMER', 'BLACKFRIDAY', 'SPECIAL'];
          var selectHtml = '<select id="wc-bpe-op-coupon-select" class="wc-bpe-select" style="width: 100%; margin-bottom: 8px; font-family: monospace; font-size: 12px; font-weight: bold; color: #581c87; background: #faf5ff; border: 1.5px solid #a855f7; border-radius: 4px; padding: 6px 8px; cursor: pointer;">' +
              '<option value="">-- برای انتخاب، این منو را باز کرده و کد تخفیف را انتخاب کنید --</option>' +
              cList.map(function(c) {
                return '<option value="' + escapeHtml(c) + '" ' + (ops.couponCode === c ? 'selected' : '') + '>🏷️ کوپن تخفیف فعال: ' + escapeHtml(c) + '</option>';
              }).join('') +
              (ops.couponCode && cList.indexOf(ops.couponCode) === -1 ? '<option value="' + escapeHtml(ops.couponCode) + '" selected>🏷️ کد تخفیف سفارشی: ' + escapeHtml(ops.couponCode) + '</option>' : '') +
              '<option value="__custom__">✍️ تایپ کد تخفیف جدید (دستی)...</option>' +
              '</select>';

          var activeBadge = ops.couponCode ? '<div style="background:#f3e8ff; border:1px solid #d8b4fe; border-radius:4px; padding:6px 10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#581c87;">' +
              '<span>✅ کد تخفیف مشخص‌شده برای اعمال: <strong style="font-family:monospace; background:#e9d5ff; padding:2px 8px; border-radius:3px; font-size:13px;">' + escapeHtml(ops.couponCode) + '</strong></span>' +
              '<button type="button" id="wc-bpe-clear-op-coupon" style="background:none; border:none; color:#dc2626; font-size:11px; font-weight:bold; cursor:pointer;">✕ پاک کردن</button>' +
              '</div>' : '';

          var chips = '<div style="margin-bottom:8px;">' +
              '<div style="font-size:10px; color:#6b7280; margin-bottom:4px;">انتخاب سریع با یک کلیک:</div>' +
              '<div style="display:flex; flex-wrap:wrap; gap:4px;">' +
              cList.slice(0, 8).map(function(c) {
                var isCurrent = ops.couponCode === c;
                return '<button type="button" class="wc-bpe-coupon-quick-badge" data-code="' + escapeHtml(c) + '" style="font-size:10px; font-family:monospace; font-weight:bold; ' + (isCurrent ? 'background:#7e22ce; color:#fff; border:1px solid #6b21a8;' : 'background:#fff; color:#7e22ce; border:1px solid #d8b4fe;') + ' border-radius:3px; padding:3px 7px; cursor:pointer;" title="کلیک جهت انتخاب سریع">🏷️ ' + escapeHtml(c) + '</button>';
              }).join('') +
              '</div>' +
              '</div>';

          var manualInput = '<input type="text" id="wc-bpe-op-coupon-val" class="wc-bpe-input" value="' + escapeHtml(ops.couponCode || '') + '" placeholder="یا تایپ کد دلخواه: مثلاً OFF20، NOROOZ، VIP..." dir="ltr" style="width: 100%; font-family: monospace; font-weight: bold; color: #6b21a8; font-size:12px;">';

          return selectHtml + activeBadge + chips + manualInput;
        })() +
        '</div>' +
        '</div>' +
        '</div>' +

        '</div>' +
        '<div style="display: flex; justify-content: space-between;">' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="wc-bpe-wizard-prev">⬅ بازگشت به فیلترها</button>' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-primary" id="wc-bpe-wizard-calculate-preview">مرحله بعد: پیش‌نمایش ایمن تغییرات ➔</button>' +
        '</div>' +
        '</div>';
    return html;
  }

  function renderWizardStep3() {
    var html = '<div>' +
        '<div class="wc-bpe-notice wc-bpe-notice-warning">' +
        '<strong>پیش‌نمایش ایمن (Dry Run):</strong> هیچ تغییری هنوز در پایگاه داده ووکامرس اعمال نشده است. لطفاً پیش‌نمایش تفاوت‌های قبل و بعد را بررسی کنید.' +
        '</div>' +
        '<div style="margin-bottom: 12px; font-size: 13px;">' +
        'تعداد محصولات دارای تغییر: <strong>' + state.previews.length + ' محصول</strong>' +
        '</div>' +
        '<div style="max-height: 400px; overflow-y: auto; border: 1px solid #c3c4c7; border-radius: 3px; margin-bottom: 20px;">' +
        '<table class="wc-bpe-table">' +
        '<thead>' +
        '<tr>' +
        '<th style="width: 60px;">شناسه</th>' +
        '<th style="width: 250px;">نام محصول</th>' +
        '<th>شرح تغییرات (قبل ➔ بعد)</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>';

    if (state.previews.length === 0) {
      html += '<tr><td colspan="3" style="text-align: center; padding: 25px;">هیچ تغییری اعمال نخواهد شد.</td></tr>';
    } else {
      state.previews.forEach(function(item) {
        html += '<tr>' +
            '<td style="font-family: monospace; font-weight: bold; color: #2271b1;">#' + item.id + '</td>' +
            '<td><strong>' + escapeHtml(item.name) + '</strong><br><small style="color: #646970;">' + escapeHtml(item.sku) + '</small></td>' +
            '<td>';
        item.changes.forEach(function(c) {
          html += '<div style="margin: 4px 0; font-size: 12px;">' +
              '<span style="font-weight: 600; color: #2c3338;">' + c.label + ':</span> ' +
              '<span style="text-decoration: line-through; color: #d63638; background: #ffebee; padding: 1px 6px; border-radius: 3px;">' + c.old + '</span>' +
              ' ➔ ' +
              '<strong style="color: #00a32a; background: #e8f5e9; padding: 1px 6px; border-radius: 3px;">' + c.new + '</strong>' +
              '</div>';
        });
        html += '</td></tr>';
      });
    }

    html += '</tbody></table>' +
        '</div>' +
        '<div style="display: flex; justify-content: space-between;">' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="wc-bpe-wizard-prev">⬅ بازگشت و اصلاح قواعد</button>' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-success" id="wc-bpe-wizard-start-execution" style="background: #00a32a; color: #fff; font-size: 13px;" ' + (state.previews.length === 0 ? 'disabled' : '') + '>✓ تأیید نهایی و اجرای پردازش دسته‌ای ➔</button>' +
        '</div>' +
        '</div>';
    return html;
  }

  function renderWizardStep4() {
    return '<div class="wc-bpe-card" style="text-align: center; padding: 40px 20px;">' +
        '<div class="spinner is-active" style="float:none; margin: 0 auto 15px auto; width: 28px; height: 28px;"></div>' +
        '<h3 id="wc-bpe-progress-title" style="margin-bottom: 10px; font-size: 16px;">در حال اجرای تغییرات در دیتابیس ووکامرس...</h3>' +
        '<div class="wc-bpe-progress-track" style="margin: 20px auto; max-width: 500px; height: 14px; background: #e0e0e0; border-radius: 7px; overflow: hidden;">' +
        '<div class="wc-bpe-progress-fill" id="wc-bpe-progress-fill" style="width: 0%; height: 100%; background: #2271b1; transition: width 0.3s ease;"></div>' +
        '</div>' +
        '<p id="wc-bpe-progress-status" style="font-size: 13px; color: #50575e;">در حال ارتباط با سرور و آماده‌سازی دسته‌ها...</p>' +
        '</div>';
  }

  function renderWizardStep5() {
    var stats = state.executionStats || { total: state.selectedIds.length, operationId: 'bpe-' + Date.now() };
    var html = '<div style="text-align: center; padding: 35px 20px;">' +
        '<div style="font-size: 48px; color: #00a32a; line-height: 1;">✓</div>' +
        '<h2 style="color: #00a32a; margin: 15px 0 10px;">عملیات ویرایش گروهی با موفقیت کامل انجام شد!</h2>' +
        '<p style="font-size: 13px; color: #50575e;">تعداد <strong>' + stats.total + ' محصول</strong> در پایگاه داده ووکامرس با موفقیت به‌روزرسانی شدند و اسنپ‌شات آن‌ها ثبت گردید.</p>' +
        '<div style="background: #f6f7f7; border: 1px solid #c3c4c7; padding: 12px; max-width: 420px; margin: 20px auto; border-radius: 4px; font-size: 12px;">' +
        'شناسه عملیات: <code>' + escapeHtml(stats.operationId) + '</code>' +
        '</div>' +
        '<div style="margin-top: 25px; display: flex; justify-content: center; gap: 10px;">' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-primary" id="wc-bpe-view-updated-table">📋 مشاهده جدول به‌روزرسانی‌شده</button>' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="wc-bpe-reset-wizard">🔄 شروع یک عملیات جدید</button>' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="wc-bpe-go-history">🕒 تاریخچه و Rollback</button>' +
        '</div>' +
        '</div>';
    return html;
  }

  function renderHistoryView() {
    var html = '<div class="wc-bpe-card" style="margin-top: 15px; padding: 20px;">' +
        '<div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 16px; border-bottom: 1px solid #f0f0f1; padding-bottom: 12px;">' +
        '<div>' +
        '<h3 style="margin: 0 0 4px 0; font-size: 15px; color: #1d2327;">🕒 تاریخچه عملیات ویرایش و بازگردانی (Rollback)</h3>' +
        '<p style="margin: 0; font-size: 12px; color: #646970;">کلیه تغییرات ذخیره‌شده از طریق جدول و ویزارد ویرایش گروهی، به همراه اسنپ‌شات قبل و بعد ثبت شده و قابل بازگردانی هستند.</p>' +
        '</div>' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="wc-bpe-refresh-history" style="font-size: 12px; padding: 6px 14px; cursor: pointer;">' +
        (state.isHistoryLoading ? 'در حال دریافت...' : '🔄 به‌روزرسانی تاریخچه') +
        '</button>' +
        '</div>';

    if (state.isHistoryLoading) {
      html += '<div style="text-align: center; padding: 40px; color: #646970;">در حال بارگذاری سوابق عملیات از دیتابیس...</div></div>';
      return html;
    }

    if (!state.history || state.history.length === 0) {
      html += '<div style="text-align: center; padding: 50px 20px; background: #f9fafb; border: 1px dashed #c3c4c7; border-radius: 4px; color: #646970;">' +
          '<div style="font-size: 32px; margin-bottom: 10px;">📋</div>' +
          '<strong style="font-size: 14px; color: #1d2327;">هنوز هیچ عملیاتی در تاریخچه دیتابیس ثبت نشده است.</strong>' +
          '<p style="font-size: 12px; margin: 6px 0 0 0;">به محض ذخیره تغییرات در جدول یا اجرای ویزارد ویرایش گروهی، لاگ تغییرات به همراه دکمه بازگردانی (Rollback) در این بخش قرار می‌گیرد.</p>' +
          '</div></div>';
      return html;
    }

    html += '<div class="wc-bpe-table-wrapper">' +
        '<table class="wc-bpe-table">' +
        '<thead>' +
        '<tr>' +
        '<th style="width: 140px;">شناسه عملیات</th>' +
        '<th style="width: 140px;">تاریخ و ساعت</th>' +
        '<th style="width: 110px;">کاربر</th>' +
        '<th style="width: 320px; max-width: 380px;">شرح تغییرات</th>' +
        '<th style="width: 80px; text-align: center;">تعداد</th>' +
        '<th style="width: 100px; text-align: center;">وضعیت</th>' +
        '<th style="width: 150px; text-align: center;">عملیات</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>';

    state.history.forEach(function(item) {
      var isRolledBack = item.status === 'rolled_back';
      var shortId = item.id && item.id.length > 14 ? item.id.substring(0, 14) + '...' : (item.id || '—');
      var summaryText = item.summary || 'ویرایش محصولات';

      html += '<tr>' +
          '<td style="font-family: monospace; font-size: 11px; color: #2271b1;" title="' + escapeHtml(item.id || '') + '"><code>' + escapeHtml(shortId) + '</code></td>' +
          '<td style="font-size: 11.5px; color: #50575e;" dir="ltr">' + escapeHtml(item.created_at || '—') + '</td>' +
          '<td style="font-size: 12px; color: #1d2327;">' + escapeHtml(item.user_name || 'مدیر') + '</td>' +
          '<td style="max-width: 380px; width: 320px;">' +
          '<div style="max-height: 52px; overflow-y: auto; overflow-x: hidden; word-break: break-word; font-size: 11.5px; line-height: 1.5; color: #1e293b; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 4px 8px; scrollbar-width: thin;" title="' + escapeHtml(summaryText) + '">' +
          escapeHtml(summaryText) +
          '</div>' +
          '</td>' +
          '<td style="text-align: center; font-family: monospace; font-weight: bold;">' + (item.success_count || item.total_items || 1) + '</td>' +
          '<td style="text-align: center;">' +
          (isRolledBack ?
                  '<span class="badge" style="background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; padding: 2px 8px; border-radius: 3px;">بازگردانی‌شده</span>' :
                  '<span class="badge" style="background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; padding: 2px 8px; border-radius: 3px;">اعمال‌شده</span>'
          ) +
          '</td>' +
          '<td style="text-align: center;">' +
          (isRolledBack ?
                  '<span style="font-size: 11px; color: #94a3b8; font-weight: 500;">✓ قبلاً بازگردانی شده</span>' :
                  '<button type="button" class="wc-bpe-btn wc-bpe-btn-rollback" data-id="' + escapeHtml(item.id) + '" style="background: #fff; color: #b91c1c; border: 1px solid #fca5a5; padding: 4px 10px; font-size: 11.5px; border-radius: 3px; cursor: pointer; font-weight: 600;">' +
                  '↺ بازگردانی (Rollback)' +
                  '</button>'
          ) +
          '</td>' +
          '</tr>';
    });

    html += '</tbody></table></div></div>';
    return html;
  }

  function renderSettingsView() {
    var s = state.settings || {};
    var batchSize = s.batchSize || 20;
    var retentionDays = s.historyRetentionDays || 60;
    var rollbackEnabled = s.rollbackEnabled !== false;
    var auditLogEnabled = s.auditLogEnabled !== false;
    var brandSource = s.brandSource || 'taxonomy';
    var brandTaxonomy = s.brandTaxonomyName || 'product_brand';
    var brandAttribute = s.brandAttributeName || 'pa_brands';
    var snappayKey = s.snappayMetaKey || '_disable_snappay';
    var snappayMode = s.snappayMode || 'disable_flag';
    var torobKey = s.torobMetaKey || '_disable_torobpay';
    var torobMode = s.torobMode || 'disable_flag';
    var enableFilter = s.enableCheckoutFilter !== false;
    var priceRoundUnit = s.priceRoundUnit || 1000;
    var deleteOnUninstall = !!s.deleteOnUninstall;

    var html = '<div style="space-y: 20px; max-width: 1200px; margin: 15px auto;">' +
        // Header Card
        '<div class="wc-bpe-card" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; border-left: 4px solid #2271b1;">' +
        '<div>' +
        '<h2 style="font-size: 16px; font-weight: bold; color: #1d2327; margin: 0 0 4px 0; display: flex; align-items: center; gap: 8px;">' +
        '<span style="color: #2271b1;">⚙️</span>' +
        '<span>تنظیمات و آداپتورهای افزونه (Plugin Configuration & Adapters)</span>' +
        '</h2>' +
        '<p style="font-size: 12px; color: #646970; margin: 0;">' +
        'مدیریت کارایی دسته‌ای، آداپتور درگاه‌های اقساطی، منبع برند، لاگ حسابرسی و سیاست پاکسازی' +
        '</p>' +
        '</div>' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-primary" id="wc-bpe-save-settings-btn" style="background: #2271b1; color: #fff; padding: 8px 18px; font-weight: bold; font-size: 13px; cursor: pointer; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">' +
        '💾 ذخیره تنظیمات' +
        '</button>' +
        '</div>' +

        // 1. Batch & Performance Card
        '<div class="wc-bpe-card">' +
        '<div style="font-size: 14px; font-weight: bold; color: #1d2327; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f1; display: flex; align-items: center; gap: 6px;">' +
        '<span style="color: #d97706;">⚡</span>' +
        '<span>کارایی و پردازش دسته‌ای (Batch Processing & Performance)</span>' +
        '</div>' +
        '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; font-size: 12px;">' +
        '<div>' +
        '<label style="display: block; font-weight: 600; color: #334155; margin-bottom: 6px;">تعداد اقلام در هر دسته (Batch Size):</label>' +
        '<input type="number" id="wc-bpe-set-batch-size" class="wc-bpe-input" value="' + batchSize + '" min="5" max="200" style="width: 100%;">' +
        '<span style="font-size: 11px; color: #64748b; display: block; margin-top: 4px;">برای پیشگیری از خطای تایم‌اوت PHP و کمبود حافظه (پیشنهادی: ۲۰ تا ۵۰).</span>' +
        '</div>' +
        '<div>' +
        '<label style="display: block; font-weight: 600; color: #334155; margin-bottom: 6px;">مدت زمان نگهداری تاریخچه (روز):</label>' +
        '<input type="number" id="wc-bpe-set-retention" class="wc-bpe-input" value="' + retentionDays + '" min="7" max="365" style="width: 100%;">' +
        '<span style="font-size: 11px; color: #64748b; display: block; margin-top: 4px;">لاگ‌ها و اسنپ‌شات‌های قدیمی‌تر از این روز پاکسازی می‌شوند.</span>' +
        '</div>' +
        '<div>' +
        '<label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #334155; cursor: pointer; margin-top: 24px;">' +
        '<input type="checkbox" id="wc-bpe-set-rollback" ' + (rollbackEnabled ? 'checked' : '') + ' style="width: 16px; height: 16px;">' +
        '<span>فعال بودن قابلیت بازگردانی تغییرات (Rollback)</span>' +
        '</label>' +
        '</div>' +
        '<div>' +
        '<label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #334155; cursor: pointer; margin-top: 24px;">' +
        '<input type="checkbox" id="wc-bpe-set-audit" ' + (auditLogEnabled ? 'checked' : '') + ' style="width: 16px; height: 16px;">' +
        '<span>ثبت لاگ حسابرسی و اسنپ‌شات قبل و بعد در دیتابیس</span>' +
        '</label>' +
        '</div>' +
        '</div>' +
        '</div>' +

        // 2. Brand Source Card
        '<div class="wc-bpe-card">' +
        '<div style="font-size: 14px; font-weight: bold; color: #1d2327; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f1; display: flex; align-items: center; gap: 6px;">' +
        '<span style="color: #2563eb;">🏢</span>' +
        '<span>منبع ذخیره و خواندن برند محصول (Product Brand Source)</span>' +
        '</div>' +
        '<p style="font-size: 12px; color: #64748b; margin-bottom: 14px;">' +
        'مشخص کنید فیلد برند محصولات در جدول و عملیات گروهی از کدام بخش ووکامرس خوانده و ذخیره شود:' +
        '</p>' +
        '<div style="space-y: 12px; font-size: 12px;">' +
        '<div style="background: #f8fafc; border: 1px solid ' + (brandSource === 'taxonomy' ? '#2563eb' : '#e2e8f0') + '; border-radius: 6px; padding: 12px; margin-bottom: 10px;">' +
        '<label style="display: flex; align-items: flex-start; gap: 8px; cursor: pointer; font-weight: bold; color: #1e293b;">' +
        '<input type="radio" name="wc_bpe_set_brand_source" value="taxonomy" ' + (brandSource === 'taxonomy' ? 'checked' : '') + ' style="margin-top: 2px;">' +
        '<div>' +
        '<span>بخش برند اختصاصی ووکامرس (WooCommerce Brands / تاکسونومی رسمی)</span>' +
        '<p style="font-size: 11px; font-weight: normal; color: #64748b; margin: 4px 0 8px 0;">برند کالاها مستقیماً از بخش برندهای اختصاصی خود ووکامرس (تاکسونومی <code>product_brand</code>) خوانده می‌شود.</p>' +
        '<div style="display: flex; align-items: center; gap: 8px;">' +
        '<span style="font-size: 11px; color: #475569;">نام تاکسونومی:</span>' +
        '<input type="text" id="wc-bpe-set-brand-taxonomy" class="wc-bpe-input" value="' + escapeHtml(brandTaxonomy) + '" style="width: 220px; font-family: monospace; font-size: 11px;">' +
        '</div>' +
        '</div>' +
        '</label>' +
        '</div>' +

        '<div style="background: #f8fafc; border: 1px solid ' + (brandSource === 'attribute' ? '#2563eb' : '#e2e8f0') + '; border-radius: 6px; padding: 12px;">' +
        '<label style="display: flex; align-items: flex-start; gap: 8px; cursor: pointer; font-weight: bold; color: #1e293b;">' +
        '<input type="radio" name="wc_bpe_set_brand_source" value="attribute" ' + (brandSource === 'attribute' ? 'checked' : '') + ' style="margin-top: 2px;">' +
        '<div>' +
        '<span>ویژگی‌های اختصاصی محصول (Product Attributes / مثلاً pa_brands)</span>' +
        '<p style="font-size: 11px; font-weight: normal; color: #64748b; margin: 4px 0 8px 0;">برند کالاها از صفات و ویژگی‌های ووکامرس استخراج و در آن ذخیره خواهد شد.</p>' +
        '<div style="display: flex; align-items: center; gap: 8px;">' +
        '<span style="font-size: 11px; color: #475569;">اسلاگ ویژگی برند:</span>' +
        '<input type="text" id="wc-bpe-set-brand-attribute" class="wc-bpe-input" value="' + escapeHtml(brandAttribute) + '" style="width: 220px; font-family: monospace; font-size: 11px;">' +
        '</div>' +
        '</div>' +
        '</label>' +
        '</div>' +
        '</div>' +
        '</div>' +

        // 3. Installment Gateway Adapters Card
        '<div class="wc-bpe-card">' +
        '<div style="font-size: 14px; font-weight: bold; color: #1d2327; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f1; display: flex; align-items: center; gap: 6px;">' +
        '<span style="color: #10b981;">💳</span>' +
        '<span>تنظیمات لایه آداپتور درگاه‌های اقساطی (Gateway Adapters)</span>' +
        '</div>' +

        // Auto-fill Banner
        '<div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 12px 14px; margin-bottom: 16px; font-size: 12px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px;">' +
        '<div>' +
        '<strong style="color: #065f46;">پیکربندی منطبق با کد functions.php قالب سایت شما:</strong>' +
        '<p style="color: #047857; margin: 3px 0 0 0; font-size: 11px;">کد قالب شما از متادیتاهای <code>_disable_snappay</code> و <code>_disable_torobpay</code> با منطق چک‌باکس غیرفعال‌سازی استفاده می‌کند.</p>' +
        '</div>' +
        '<button type="button" class="wc-bpe-btn" id="wc-bpe-apply-theme-preset-btn" style="background: #10b981; color: #fff; border-color: #10b981; font-weight: bold; padding: 6px 12px; font-size: 11px; cursor: pointer; border-radius: 4px;">' +
        '⚡ اعمال خودکار تنظیمات کد قالب شما' +
        '</button>' +
        '</div>' +

        '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; font-size: 12px;">' +
        // Snappay
        '<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">' +
        '<div style="font-weight: bold; color: #1e40af; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">' +
        '<span style="background: #dbeafe; padding: 2px 6px; border-radius: 3px; font-size: 10px;">اسنپ‌پی</span>' +
        '<span>تنظیمات متای اسنپ‌پی (Snappay)</span>' +
        '</div>' +
        '<label style="display: block; font-weight: 600; color: #334155; margin-bottom: 4px;">کلید متای اسنپ‌پی:</label>' +
        '<input type="text" id="wc-bpe-set-snappay-key" class="wc-bpe-input" value="' + escapeHtml(snappayKey) + '" style="width: 100%; font-family: monospace; margin-bottom: 8px;">' +
        '<label style="display: block; font-weight: 600; color: #334155; margin-bottom: 4px;">نحوه تفسیر وضعیت درگاه:</label>' +
        '<select id="wc-bpe-set-snappay-mode" class="wc-bpe-select" style="width: 100%;">' +
        '<option value="disable_flag" ' + (snappayMode === 'disable_flag' ? 'selected' : '') + '>منطق غیرفعال‌سازی (yes = غیرفعال، no = فعال)</option>' +
        '<option value="enable_flag" ' + (snappayMode === 'enable_flag' ? 'selected' : '') + '>منطق فعال‌سازی مستقیم (yes = فعال، no = غیرفعال)</option>' +
        '</select>' +
        '</div>' +

        // Torob
        '<div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px;">' +
        '<div style="font-weight: bold; color: #b91c1c; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">' +
        '<span style="background: #fee2e2; padding: 2px 6px; border-radius: 3px; font-size: 10px;">ترب‌پی</span>' +
        '<span>تنظیمات متای ترب (Torob Pay)</span>' +
        '</div>' +
        '<label style="display: block; font-weight: 600; color: #334155; margin-bottom: 4px;">کلید متای ترب‌پی:</label>' +
        '<input type="text" id="wc-bpe-set-torob-key" class="wc-bpe-input" value="' + escapeHtml(torobKey) + '" style="width: 100%; font-family: monospace; margin-bottom: 8px;">' +
        '<label style="display: block; font-weight: 600; color: #334155; margin-bottom: 4px;">نحوه تفسیر وضعیت درگاه:</label>' +
        '<select id="wc-bpe-set-torob-mode" class="wc-bpe-select" style="width: 100%;">' +
        '<option value="disable_flag" ' + (torobMode === 'disable_flag' ? 'selected' : '') + '>منطق غیرفعال‌سازی (yes = غیرفعال، no = فعال)</option>' +
        '<option value="enable_flag" ' + (torobMode === 'enable_flag' ? 'selected' : '') + '>منطق فعال‌سازی مستقیم (yes = فعال، no = غیرفعال)</option>' +
        '</select>' +
        '</div>' +
        '</div>' +

        '<div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 12px;">' +
        '<label style="display: flex; align-items: center; gap: 8px; font-weight: 600; color: #334155; cursor: pointer;">' +
        '<input type="checkbox" id="wc-bpe-set-checkout-filter" ' + (enableFilter ? 'checked' : '') + ' style="width: 16px; height: 16px;">' +
        '<span>حذف خودکار درگاه‌های اقساطی از تسویه‌حساب (Checkout) در صورتی که حداقل یک کالای نامجاز در سبد خرید باشد.</span>' +
        '</label>' +
        '</div>' +
        '</div>' +

        // 4. Pricing & Rounding Rules Card
        '<div class="wc-bpe-card">' +
        '<div style="font-size: 14px; font-weight: bold; color: #1d2327; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #f0f0f1; display: flex; align-items: center; gap: 6px;">' +
        '<span style="color: #8b5cf6;">📊</span>' +
        '<span>قوانین قیمت‌گذاری و رندسازی (Pricing Rules)</span>' +
        '</div>' +
        '<div style="max-width: 400px; font-size: 12px;">' +
        '<label style="display: block; font-weight: 600; color: #334155; margin-bottom: 6px;">واحد گرد کردن قیمت‌ها پس از تغییر درصدی (تومان):</label>' +
        '<select id="wc-bpe-set-price-round" class="wc-bpe-select" style="width: 100%;">' +
        '<option value="1" ' + (priceRoundUnit === 1 ? 'selected' : '') + '>بدون رند کردن (دقیق)</option>' +
        '<option value="1000" ' + (priceRoundUnit === 1000 ? 'selected' : '') + '>نزدیک‌ترین ۱,۰۰۰ تومان (پیشنهادی فروشگاه‌های ایران)</option>' +
        '<option value="5000" ' + (priceRoundUnit === 5000 ? 'selected' : '') + '>نزدیک‌ترین ۵,۰۰۰ تومان</option>' +
        '<option value="10000" ' + (priceRoundUnit === 10000 ? 'selected' : '') + '>نزدیک‌ترین ۱۰,۰۰۰ تومان</option>' +
        '</select>' +
        '</div>' +
        '</div>' +

        // 5. Uninstall Policy Card
        '<div class="wc-bpe-card" style="border-right: 4px solid #ef4444;">' +
        '<div style="font-size: 14px; font-weight: bold; color: #b91c1c; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #fee2e2; display: flex; align-items: center; gap: 6px;">' +
        '<span>🗑️</span>' +
        '<span>سیاست پاکسازی داده‌ها هنگام حذف افزونه (Uninstall Policy)</span>' +
        '</div>' +
        '<label style="display: flex; align-items: flex-start; gap: 8px; font-size: 12px; cursor: pointer; color: #991b1b;">' +
        '<input type="checkbox" id="wc-bpe-set-delete-uninstall" ' + (deleteOnUninstall ? 'checked' : '') + ' style="margin-top: 2px; width: 16px; height: 16px;">' +
        '<div>' +
        '<strong>حذف کامل داده‌ها و جداول دیتابیس در صورت Uninstall کردن قطعی افزونه از وردپرس</strong>' +
        '<p style="font-size: 11px; color: #b91c1c; margin: 4px 0 0 0;">در صورت فعال‌سازی، با پاک کردن افزونه کلیه لاگ‌ها و جداول اختصاصی از دیتابیس حذف می‌شوند.</p>' +
        '</div>' +
        '</label>' +
        '</div>' +

        // Bottom Save Action
        '<div style="display: flex; justify-content: flex-end; padding: 10px 0;">' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-primary" id="wc-bpe-save-settings-btn-bottom" style="background: #2271b1; color: #fff; padding: 10px 24px; font-weight: bold; font-size: 14px; cursor: pointer; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">' +
        '💾 ذخیره کلیه تنظیمات در ووکامرس' +
        '</button>' +
        '</div>' +
        '</div>';

    return html;
  }

  function renderDescriptionModal() {
    var modal = state.activeModal;
    return '<div class="wc-bpe-modal-overlay">' +
        '<div class="wc-bpe-modal">' +
        '<div class="wc-bpe-modal-header">' +
        '<span>ویرایش ' + modal.fieldLabel + ': ' + escapeHtml(modal.title) + '</span>' +
        '<button type="button" id="wc-bpe-modal-close" style="background:none; border:none; cursor:pointer; font-size:16px;">✕</button>' +
        '</div>' +
        '<div class="wc-bpe-modal-body">' +
        '<textarea id="wc-bpe-modal-textarea" rows="10" style="width:100%; padding:10px; font-family:inherit; font-size:12px;" dir="rtl">' + escapeHtml(modal.value) + '</textarea>' +
        '</div>' +
        '<div class="wc-bpe-modal-footer">' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="wc-bpe-modal-cancel">انصراف</button>' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-primary" id="wc-bpe-modal-save">ذخیره در جدول</button>' +
        '</div>' +
        '</div>' +
        '</div>';
  }

  function renderPreviewModal() {
    var p = state.previewProduct;
    return '<div class="wc-bpe-modal-overlay">' +
        '<div class="wc-bpe-modal">' +
        '<div class="wc-bpe-modal-header">' +
        '<span>پیش‌نمایش کارت کالا #' + p.id + '</span>' +
        '<button type="button" id="wc-bpe-preview-close" style="background:none; border:none; cursor:pointer; font-size:16px;">✕</button>' +
        '</div>' +
        '<div class="wc-bpe-modal-body">' +
        '<h3>' + escapeHtml(p.name) + '</h3>' +
        '<p><strong>کد کالا:</strong> ' + escapeHtml(p.sku) + '</p>' +
        '<p><strong>قیمت:</strong> ' + p.regularPrice.toLocaleString() + ' تومان</p>' +
        '<p><strong>موجودی:</strong> ' + p.stockQuantity + ' عدد</p>' +
        '<p><strong>توضیحات:</strong> ' + escapeHtml(p.description || 'ثبت نشده') + '</p>' +
        '</div>' +
        '<div class="wc-bpe-modal-footer">' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-primary" id="wc-bpe-preview-close-btn">بستن</button>' +
        '</div>' +
        '</div>' +
        '</div>';
  }

  function renderBulkAttributesModal() {
    var count = state.selectedIds.length;
    var target = state.bulkAttrTarget || 'brand';
    var action = state.bulkAttrAction || 'set_term';
    var isBrand = target === 'brand';
    var isPriceRange = target === 'price_range';

    var priceRangeOptions = [
      '۲ تا ۵ میلیون', '۵ تا ۱۰ میلیون', '۱۰ تا ۱۵ میلیون', '۱۵ تا ۲۰ میلیون',
      '۲۰ تا ۳۰ میلیون', '۳۰ تا ۴۰ میلیون', '۴۰ تا ۶۰ میلیون', '۶۰ تا ۷۰ میلیون', '۷۰ میلیون به بالا'
    ];

    var html = '<div class="wc-bpe-modal-overlay">' +
        '<div class="wc-bpe-modal" style="max-width: 540px;">' +
        '<div class="wc-bpe-modal-header" style="background: #f8fafc; border-bottom: 1px solid #cbd5e1;">' +
        '<div style="display:flex; align-items:center; gap:8px;">' +
        '<span style="font-size:16px;">🏷️</span>' +
        '<strong style="font-size:14px; color:#1e293b;">ویرایش گروهی ویژگی‌ها و برند (' + count + ' کالا)</strong>' +
        '</div>' +
        '<button type="button" id="wc-bpe-bulk-attr-close" style="background:none; border:none; cursor:pointer; font-size:18px; color:#64748b;">✕</button>' +
        '</div>' +
        '<div class="wc-bpe-modal-body" style="padding: 18px; space-y: 14px;">' +
        '<div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 10px 12px; font-size: 11.5px; color: #1e40af; margin-bottom: 14px;">' +
        'تغییر زیر بلافاصله بر روی تمام <strong>' + count + ' محصول انتخاب‌شده</strong> در جدول اعمال و ثبت خواهد شد.' +
        '</div>' +

        // 1. Target Attribute Selector
        '<div style="margin-bottom: 14px;">' +
        '<label style="display:block; font-size:12px; font-weight:bold; color:#334155; margin-bottom:5px;">کدام ویژگی را می‌خواهید تغییر دهید؟</label>' +
        '<select id="wc-bpe-bulk-attr-target" class="wc-bpe-select" style="width: 100%; padding: 6px 10px; font-size: 13px;">' +
        '<option value="brand" ' + (target === 'brand' ? 'selected' : '') + '>🏢 برند محصول (Brand / pa_brands)</option>' +
        '<option value="price_range" ' + (target === 'price_range' ? 'selected' : '') + '>🏷️ ویژگی محدوده قیمت (pa_price-range)</option>' +
        '<option value="custom" ' + (target === 'custom' ? 'selected' : '') + '>🎨 سایر ویژگی‌ها (رنگ، سایز، گارانتی، جنس و...)</option>' +
        '</select>' +
        '</div>' +

        // If Custom, specify attribute name
        (target === 'custom' ?
            '<div style="margin-bottom: 14px;">' +
            '<label style="display:block; font-size:11px; font-weight:600; color:#334155; margin-bottom:4px;">نام ویژگی مورد نظر:</label>' +
            '<input type="text" id="wc-bpe-bulk-attr-custom-name" class="wc-bpe-input" value="' + escapeHtml(state.bulkAttrCustomName || 'رنگ') + '" placeholder="مثلاً رنگ، سایز، گارانتی..." style="width: 100%;">' +
            '</div>' : '') +

        // 2. Action Type
        '<div style="margin-bottom: 14px;">' +
        '<label style="display:block; font-size:12px; font-weight:bold; color:#334155; margin-bottom:5px;">نوع عملیات:</label>' +
        '<select id="wc-bpe-bulk-attr-action" class="wc-bpe-select" style="width: 100%; padding: 6px 10px; font-size: 13px;">' +
        '<option value="set_term" ' + (action === 'set_term' ? 'selected' : '') + '>تنظیم یا جایگزینی با مقدار مشخص</option>' +
        (target === 'custom' ? '<option value="replace_term" ' + (action === 'replace_term' ? 'selected' : '') + '>جستجو و جایگزینی عبارت در ویژگی</option>' : '') +
        '<option value="remove" ' + (action === 'remove' ? 'selected' : '') + '>حذف این ویژگی از تمام کالاهای انتخابی</option>' +
        '</select>' +
        '</div>' +

        // 3. Values
        (action !== 'remove' ?
            '<div style="margin-bottom: 14px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:4px; padding:12px;">' +
            (isBrand ?
                '<div>' +
                '<label style="display:block; font-size:11px; font-weight:600; color:#1e293b; margin-bottom:4px;">انتخاب برند از لیست یا تایپ دستی:</label>' +
                '<select id="wc-bpe-bulk-attr-val-brand" class="wc-bpe-select" style="width: 100%; margin-bottom: 8px;">' +
                state.brands.map(function(b){ return '<option value="' + escapeHtml(b) + '">' + escapeHtml(b) + '</option>'; }).join('') +
                '</select>' +
                '<input type="text" id="wc-bpe-bulk-attr-val-brand-custom" class="wc-bpe-input" placeholder="یا تایپ برند جدید در صورتی که در لیست نیست..." style="width: 100%;">' +
                '</div>' :
                (isPriceRange ?
                    '<div>' +
                    '<label style="display:block; font-size:11px; font-weight:600; color:#1e293b; margin-bottom:4px;">انتخاب محدوده قیمت:</label>' +
                    '<select id="wc-bpe-bulk-attr-val-pr" class="wc-bpe-select" style="width: 100%;">' +
                    priceRangeOptions.map(function(opt){ return '<option value="' + opt + '">' + opt + '</option>'; }).join('') +
                    '</select>' +
                    '</div>' :
                    (action === 'replace_term' ?
                            '<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">' +
                            '<div>' +
                            '<label style="display:block; font-size:11px; font-weight:600; color:#b91c1c; margin-bottom:4px;">عبارت قدیمی جهت جستجو:</label>' +
                            '<input type="text" id="wc-bpe-bulk-attr-search-val" class="wc-bpe-input" placeholder="مثلاً: قرمز" style="width: 100%;">' +
                            '</div>' +
                            '<div>' +
                            '<label style="display:block; font-size:11px; font-weight:600; color:#15803d; margin-bottom:4px;">عبارت جایگزین جدید:</label>' +
                            '<input type="text" id="wc-bpe-bulk-attr-val-text" class="wc-bpe-input" placeholder="مثلاً: آبی مات" style="width: 100%;">' +
                            '</div>' +
                            '</div>' :
                            '<div>' +
                            '<label style="display:block; font-size:11px; font-weight:600; color:#1e293b; margin-bottom:4px;">مقدار ویژگی:</label>' +
                            '<input type="text" id="wc-bpe-bulk-attr-val-text" class="wc-bpe-input" placeholder="مثلاً: مشکی، استیل، گارانتی ۲۴ ماهه..." style="width: 100%;">' +
                            '</div>'
                    ))) +
            '</div>' : '') +
        '</div>' +
        '<div class="wc-bpe-modal-footer" style="background:#f8fafc; border-top:1px solid #cbd5e1; display:flex; justify-content:space-between;">' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="wc-bpe-bulk-attr-cancel">انصراف</button>' +
        '<button type="button" class="wc-bpe-btn wc-bpe-btn-primary" id="wc-bpe-bulk-attr-apply" style="background:#107c41; border-color:#107c41; font-weight:bold;">' +
        '✓ اعمال تغییر بر روی ' + count + ' کالا' +
        '</button>' +
        '</div>' +
        '</div>' +
        '</div>';
    return html;
  }

  function getFilteredProducts() {
    return state.products.filter(function(p) {
      if (state.filters.search) {
        var s = state.filters.search.toLowerCase().trim();
        if (p.name.toLowerCase().indexOf(s) === -1 && (p.sku || '').toLowerCase().indexOf(s) === -1 && String(p.id).indexOf(s) === -1) {
          return false;
        }
      }
      var selCats = state.filters.categories || [];
      if (selCats.length && !state.isRealStoreData) {
        // Client-side fallback for sample data only; real data is filtered on the server
        var pNames = ((p.categories && p.categories.length) ? p.categories : String(p.category || '').split(/[,،/|]+/))
            .map(function(c) { return normalizeFa(c); });
        var hits = selCats.map(function(k) { return pNames.indexOf(normalizeFa(k)) !== -1; });
        var okCat = state.filters.catMode === 'and' ? hits.every(Boolean) : hits.some(Boolean);
        if (!okCat) return false;
      }
      if ((state.filters.brands || []).length && !state.isRealStoreData && state.filters.brands.indexOf(p.brand) === -1) return false;
      if (state.filters.status && p.status !== state.filters.status) return false;
      if (state.filters.stockStatus && p.stockStatus !== state.filters.stockStatus) return false;
      if (state.filters.type && p.type !== state.filters.type) return false;

      // Preset filters (real data is already filtered on the server)
      if (state.isRealStoreData) return true;
      if (state.filters.preset === 'instock' && p.stockStatus !== 'instock') return false;
      if (state.filters.preset === 'outofstock' && p.stockStatus !== 'outofstock') return false;
      if (state.filters.preset === 'on_sale') {
        if (!p.salePrice || p.salePrice <= 0 || p.salePrice >= p.regularPrice) return false;
      }
      if (state.filters.preset === 'variable' && p.type !== 'variable') return false;
      if (state.filters.preset === 'simple' && p.type !== 'simple') return false;

      return true;
    });
  }

  function fetchHistory() {
    state.isHistoryLoading = true;
    render();

    $.ajax({
      url: wcBpeData.ajaxUrl,
      type: 'POST',
      data: {
        action: 'wc_bpe_get_history',
        nonce: wcBpeData.nonce
      },
      success: function(res) {
        state.isHistoryLoading = false;
        if (res && res.success && res.data && res.data.history) {
          state.history = res.data.history;
        } else {
          state.history = [];
        }
        render();
      },
      error: function(xhr, status, err) {
        state.isHistoryLoading = false;
        console.error('Error fetching history:', err);
        render();
      }
    });
  }

  function bindEvents() {
    // Tab switching
    $('.wc-bpe-tab-btn').on('click', function() {
      state.activeTab = $(this).data('tab');
      if (state.activeTab === 'history') {
        fetchHistory();
      } else {
        render();
      }
    });

    // Preset filter pills
    $('.wc-bpe-preset-btn').on('click', function() {
      var preset = $(this).data('preset');
      applyFilter(function() { state.filters.preset = preset; });
    });

    // Search (debounced, server-side)
    $('#wc-bpe-search, #wc-bpe-wiz-search').on('input', function() {
      state.filters.search = $(this).val();
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function() {
        if (!confirmDiscardIfDirty()) return;
        state.page = 1;
        fetchProducts(true);
      }, 450);
    });

    // Multi-select dropdowns (categories / brands)
    function msRefreshCount($ms) {
      $ms.find('.wc-ms-apply-n').text($ms.find('.wc-ms-cb:checked').length);
    }
    function msReset($ms) {
      var kind = $ms.attr('data-kind');
      var sel = kind === 'cat' ? (state.filters.categories || []) : (state.filters.brands || []);
      $ms.find('.wc-ms-cb').each(function() { this.checked = sel.indexOf(this.value) !== -1; });
      var m = state.filters.catMode === 'and' ? 'and' : 'or';
      $ms.find('.wc-ms-mode-in').each(function() { this.checked = this.value === m; $(this).parent().toggleClass('on', this.value === m); });
      $ms.find('.wc-ms-search').val('');
      $ms.find('.wc-ms-item').css('display', '');
      msRefreshCount($ms);
    }
    function msCloseAll() {
      $('.wc-ms.open').each(function() { $(this).removeClass('open'); msReset($(this)); });
    }
    $('.wc-ms-toggle').on('click', function() {
      var $ms = $(this).closest('.wc-ms');
      var wasOpen = $ms.hasClass('open');
      msCloseAll();
      if (!wasOpen) {
        $ms.addClass('open');
        $ms.find('.wc-ms-search').trigger('focus');
      }
    });
    $('.wc-ms-search').on('input', function() {
      var q = normalizeFa($(this).val());
      $(this).closest('.wc-ms').find('.wc-ms-item').each(function() {
        $(this).css('display', (!q || String($(this).attr('data-name')).indexOf(q) !== -1) ? '' : 'none');
      });
    });
    $('.wc-ms-cb').on('change', function() { msRefreshCount($(this).closest('.wc-ms')); });
    $('.wc-ms-all').on('click', function() {
      var $ms = $(this).closest('.wc-ms');
      $ms.find('.wc-ms-item:visible .wc-ms-cb').prop('checked', true);
      msRefreshCount($ms);
    });
    $('.wc-ms-clear').on('click', function() {
      var $ms = $(this).closest('.wc-ms');
      $ms.find('.wc-ms-cb').prop('checked', false);
      msRefreshCount($ms);
    });
    $('.wc-ms-mode-in').on('change', function() {
      var $ms = $(this).closest('.wc-ms');
      $ms.find('.wc-ms-mode label').removeClass('on');
      $(this).parent().addClass('on');
      $ms.find('.wc-ms-modehint').text(this.value === 'and' ? 'فقط محصولاتی که تمام دسته‌های انتخابی را دارند.' : 'محصولاتی که حداقل یکی از دسته‌های انتخابی را دارند.');
    });
    $('.wc-ms-cancel').on('click', function() { msCloseAll(); });
    $('.wc-ms-apply').on('click', function() {
      var $ms = $(this).closest('.wc-ms');
      var kind = $ms.attr('data-kind');
      var picked = $ms.find('.wc-ms-cb:checked').map(function() { return this.value; }).get();
      var mode = $ms.find('.wc-ms-mode-in:checked').val() || 'or';
      $ms.removeClass('open');
      applyFilter(function() {
        if (kind === 'cat') {
          state.filters.categories = picked;
          state.filters.catMode = mode;
        } else {
          state.filters.brands = picked;
        }
      });
    });
    $(document).off('mousedown.wcbpeMs keydown.wcbpeMs')
        .on('mousedown.wcbpeMs', function(e) {
          if ($(e.target).closest('.wc-ms').length) return;
          msCloseAll();
        })
        .on('keydown.wcbpeMs', function(e) {
          if (e.key === 'Escape') msCloseAll();
        });

    // Active filter chips
    $('.wc-fb-chip-x').on('click', function(e) {
      e.preventDefault();
      var clear = String($(this).attr('data-clear'));
      var key = String($(this).attr('data-key'));
      applyFilter(function() {
        if (clear === 'categories') {
          state.filters.categories = (state.filters.categories || []).filter(function(k) { return k !== key; });
        } else if (clear === 'brands') {
          state.filters.brands = (state.filters.brands || []).filter(function(k) { return k !== key; });
        } else if (clear === 'preset') {
          state.filters.preset = 'all';
        } else {
          state.filters[clear] = '';
        }
      });
    });
    $('#wc-bpe-stock-filter, #wc-bpe-wiz-stock').on('change', function() {
      var v = $(this).val();
      applyFilter(function() { state.filters.stockStatus = v; });
    });
    $('#wc-bpe-status-filter, #wc-bpe-wiz-status').on('change', function() {
      var v = $(this).val();
      applyFilter(function() { state.filters.status = v; });
    });
    $('#wc-bpe-type-filter, #wc-bpe-wiz-type').on('change', function() {
      var v = $(this).val();
      applyFilter(function() { state.filters.type = v; });
    });
    $('#wc-bpe-btn-reset-filters, #wc-bpe-wiz-reset-filters').on('click', function() {
      applyFilter(function() {
        state.filters = { search: '', categories: [], catMode: 'or', brands: [], status: '', stockStatus: '', type: '', preset: 'all' };
      });
    });

    // Pagination
    $('.wc-bpe-page-btn').on('click', function() {
      var target = parseInt($(this).attr('data-page'), 10);
      if (!target || target === state.page) return;
      if (!confirmDiscardIfDirty()) return;
      state.page = Math.min(Math.max(1, target), state.totalPages);
      state.scrollAfter = true;
      fetchProducts(true);
    });

    // Checkbox selection in Table
    $('#wc-bpe-select-all').on('change', function() {
      var filtered = getFilteredProducts();
      var pageIds = {};
      filtered.forEach(function(p) { pageIds[p.id] = true; });
      if (this.checked) {
        var have = {};
        state.selectedIds.forEach(function(id) { have[id] = true; });
        filtered.forEach(function(p) { have[p.id] = true; });
        state.selectedIds = Object.keys(have).map(Number);
      } else {
        state.selectedIds = state.selectedIds.filter(function(id) { return !pageIds[id]; });
      }
      render();
    });

    $('.wc-bpe-row-check').on('change', function() {
      var id = parseInt($(this).data('id'), 10);
      if (this.checked) {
        if (state.selectedIds.indexOf(id) === -1) state.selectedIds.push(id);
      } else {
        state.selectedIds = state.selectedIds.filter(function(item) { return item !== id; });
      }
      render();
    });

    // Send table selection to Wizard
    $('#wc-bpe-btn-send-to-wizard').on('click', function() {
      state.activeTab = 'wizard';
      state.wizardStep = 2;
      render();
    });

    // Wizard Step 1 Selection Handlers
    $('#wc-bpe-select-all-filtered, #wc-bpe-wiz-header-check').on('click change', function() {
      var filtered = getFilteredProducts();
      var allFilteredSelected = filtered.length > 0 && filtered.every(function(p) {
        return state.selectedIds.indexOf(p.id) !== -1;
      });
      if (allFilteredSelected) {
        var filteredIdMap = {};
        filtered.forEach(function(p) { filteredIdMap[p.id] = true; });
        state.selectedIds = state.selectedIds.filter(function(id) { return !filteredIdMap[id]; });
      } else {
        var idMap = {};
        state.selectedIds.forEach(function(id) { idMap[id] = true; });
        filtered.forEach(function(p) { idMap[p.id] = true; });
        state.selectedIds = Object.keys(idMap).map(Number);
      }
      render();
    });

    $('#wc-bpe-invert-filtered').on('click', function() {
      var filtered = getFilteredProducts();
      var filteredIdMap = {};
      filtered.forEach(function(p) { filteredIdMap[p.id] = true; });
      var nonFiltered = state.selectedIds.filter(function(id) { return !filteredIdMap[id]; });
      var newlySelected = filtered.filter(function(p) { return state.selectedIds.indexOf(p.id) === -1; }).map(function(p) { return p.id; });
      state.selectedIds = nonFiltered.concat(newlySelected);
      render();
    });

    $('#wc-bpe-deselect-all, .wc-bpe-deselect-bar').on('click', function() {
      state.selectedIds = [];
      state.isAllStoreSelected = false;
      render();
    });

    // Select ALL filtered results across every page
    $('#wc-bpe-select-all-store, .wc-bpe-select-all-results').on('click', function() {
      $(this).prop('disabled', true).css('opacity', 0.7).text('در حال انتخاب...');
      var pageIds = state.products.map(function(p) { return p.id; });
      $.ajax({
        url: wcBpeData.ajaxUrl,
        type: 'POST',
        data: $.extend({
          action: 'wc_bpe_get_all_product_ids',
          nonce: wcBpeData.nonce
        }, buildFilterPayload()),
        success: function(res) {
          if (res.success && res.data && Array.isArray(res.data.ids) && res.data.ids.length > 0) {
            var have = {};
            state.selectedIds.forEach(function(id) { have[id] = true; });
            res.data.ids.forEach(function(id) { have[id] = true; });
            state.selectedIds = Object.keys(have).map(Number);
            state.totalStoreProducts = res.data.total;
            state.isAllStoreSelected = true;
          } else {
            state.selectedIds = pageIds;
          }
          render();
        },
        error: function() {
          state.selectedIds = pageIds;
          render();
          alert('دریافت لیست کامل نتایج ناموفق بود؛ فقط محصولات همین صفحه انتخاب شدند.');
        }
      });
    });

    // Go to page
    $('.wc-pg-goto').on('keydown', function(e) {
      if (e.key !== 'Enter') return;
      var target = parseInt($(this).val(), 10);
      if (!target) return;
      target = Math.min(Math.max(1, target), state.totalPages);
      if (target === state.page || !confirmDiscardIfDirty()) return;
      state.page = target;
      state.scrollAfter = true;
      fetchProducts(true);
    });

    // Limit / Page size selector in Table & Wizard
    $('#wc-bpe-table-limit, #wc-bpe-wiz-limit').on('change', function() {
      var lim = parseInt($(this).val(), 10);
      applyFilter(function() { state.pageLimit = lim; });
    });

    // Coupon actions & dropdown in Wizard Step 2
    $('#wc-bpe-op-coupon-action').on('change', function() {
      var act = $(this).val();
      state.opSettings.couponAction = act;
      render();
    });

    $('#wc-bpe-op-coupon-select').on('change', function() {
      var val = $(this).val();
      if (val === '__custom__') {
        var custom = prompt('لطفاً کد تخفیف دلخواه جدید را تایپ کنید (مثلاً SPECIAL50):', state.opSettings.couponCode || '');
        if (custom && custom.trim()) {
          state.opSettings.couponCode = custom.trim().toUpperCase();
        }
      } else {
        state.opSettings.couponCode = val;
      }
      render();
    });

    $('#wc-bpe-clear-op-coupon').on('click', function() {
      state.opSettings.couponCode = '';
      render();
    });

    $('.wc-bpe-coupon-quick-badge').on('click', function(e) {
      e.preventDefault();
      var code = $(this).data('code');
      if (code) {
        state.opSettings.couponCode = code;
        render();
      }
    });

    $('#wc-bpe-op-coupon-val').on('input', function() {
      state.opSettings.couponCode = $(this).val().toUpperCase();
    });

    // Inline Table Quick Coupon selection
    $('.wc-bpe-coupon-cell-select, .wc-bpe-quick-coupon-select').on('change', function() {
      var id = parseInt($(this).data('id'), 10);
      var code = $(this).val();
      if (code === '__custom__') {
        var custom = prompt('لطفاً کد تخفیف دلخواه را وارد کنید:');
        if (custom && custom.trim()) {
          code = custom.trim().toUpperCase();
        } else {
          code = '';
        }
      }
      var prod = state.products.find(function(p) { return p.id === id; });
      if (prod) {
        prod.couponCode = code;
        state.modifiedIds.add(id);
        render();
      }
    });

    $('.wc-bpe-clear-coupon').on('click', function(e) {
      e.stopPropagation();
      var id = parseInt($(this).data('id'), 10);
      var prod = state.products.find(function(p) { return p.id === id; });
      if (prod) {
        prod.couponCode = '';
        state.modifiedIds.add(id);
        render();
      }
    });

    $('.wc-bpe-wiz-row').on('click', function(e) {
      if ($(e.target).is('input[type="checkbox"]') || $(e.target).closest('.wc-bpe-no-propagate').length) return;
      var id = parseInt($(this).data('id'), 10);
      var idx = state.selectedIds.indexOf(id);
      if (idx === -1) {
        state.selectedIds.push(id);
      } else {
        state.selectedIds.splice(idx, 1);
      }
      render();
    });

    $('.wc-bpe-wiz-row-check').on('change', function() {
      var id = parseInt($(this).data('id'), 10);
      var idx = state.selectedIds.indexOf(id);
      if (this.checked) {
        if (idx === -1) state.selectedIds.push(id);
      } else {
        if (idx !== -1) state.selectedIds.splice(idx, 1);
      }
      render();
    });

    // Cell field changes
    $('.wc-bpe-edit-field').on('change', function() {
      var id = parseInt($(this).data('id'), 10);
      var field = $(this).data('field');
      var val = $(this).val();

      var prod = state.products.find(function(p) { return p.id === id; });
      if (prod) {
        if (field === 'regularPrice') {
          prod.regularPrice = parseFloat(val) || 0;
        } else if (field === 'stockQuantity') {
          prod.stockQuantity = parseFloat(val) || 0;
          if (prod.manageStock) {
            prod.stockStatus = prod.stockQuantity > 0 ? 'instock' : 'outofstock';
          }
        } else if (field === 'salePrice') {
          prod.salePrice = val ? parseFloat(val) : null;
        } else if (field === 'stockStatus') {
          prod.stockStatus = val;
        } else {
          prod[field] = val;
        }
        state.modifiedIds.add(id);
        render();
      }
    });

    // Switch toggle for manageStock
    $('.wc-bpe-switch').on('click', function() {
      var id = parseInt($(this).data('id'), 10);
      var prod = state.products.find(function(p) { return p.id === id; });
      if (prod) {
        prod.manageStock = !prod.manageStock;
        if (!prod.manageStock) {
          // هنگام غیرفعال‌سازی مدیریت موجودی انبار:
          // ۱. محصول ناموجود می‌شود (stockStatus: 'outofstock')
          // ۲. مقدار موجودی انبار (stockQuantity) دست‌نخورده باقی می‌ماند و صفر نمی‌شود
          // ۳. محصول در لیست محصولات باقی می‌ماند
          prod.stockStatus = 'outofstock';
          if (!prod.stockQuantity || prod.stockQuantity === 0) {
            prod.stockQuantity = 10;
          }
        } else {
          prod.stockStatus = (prod.stockQuantity || 0) > 0 ? 'instock' : 'outofstock';
        }
        state.modifiedIds.add(id);
        render();
      }
    });

    // Content button opens Description modal
    $('.wc-bpe-btn-content').on('click', function() {
      var id = parseInt($(this).data('id'), 10);
      var field = $(this).data('field');
      var prod = state.products.find(function(p) { return p.id === id; });
      if (prod) {
        state.activeModal = {
          id: id,
          title: prod.name,
          field: field,
          fieldLabel: field === 'description' ? 'توضیحات کامل' : 'توضیحات کوتاه',
          value: prod[field] || ''
        };
        render();
      }
    });

    // Modal buttons
    $('#wc-bpe-modal-close, #wc-bpe-modal-cancel').on('click', function() {
      state.activeModal = null;
      render();
    });

    $('#wc-bpe-modal-save').on('click', function() {
      if (state.activeModal) {
        var prod = state.products.find(function(p) { return p.id === state.activeModal.id; });
        if (prod) {
          prod[state.activeModal.field] = $('#wc-bpe-modal-textarea').val();
          state.modifiedIds.add(prod.id);
        }
        state.activeModal = null;
        render();
      }
    });

    // Single product preview modal
    $('.wc-bpe-btn-preview').on('click', function() {
      var id = parseInt($(this).data('id'), 10);
      state.previewProduct = state.products.find(function(p) { return p.id === id; }) || null;
      render();
    });
    $('#wc-bpe-preview-close, #wc-bpe-preview-close-btn').on('click', function() {
      state.previewProduct = null;
      render();
    });

    // Save single row
    $('.wc-bpe-btn-save-row').on('click', function() {
      var id = parseInt($(this).data('id'), 10);
      var prod = state.products.find(function(p) { return p.id === id; });
      if (!prod) return;

      var $btn = $(this).text('...');
      $.ajax({
        url: wcBpeData.ajaxUrl,
        type: 'POST',
        data: {
          action: 'wc_bpe_save_inline_product',
          nonce: wcBpeData.nonce,
          product_id: prod.id,
          name: prod.name,
          sku: prod.sku,
          type: prod.type || 'simple',
          status: prod.status || 'publish',
          regular_price: prod.regularPrice,
          sale_price: prod.salePrice || '',
          manage_stock: prod.manageStock ? 'yes' : 'no',
          stock_quantity: prod.stockQuantity,
          stock_status: prod.stockStatus || 'outofstock',
          description: prod.description || '',
          short_description: prod.shortDescription || '',
          category: prod.category || '',
          brand: prod.brand || '',
          snappay_enabled: prod.snappayEnabled ? '1' : '0',
          torob_pay_enabled: prod.torobPayEnabled ? '1' : '0',
          coupon_code: prod.couponCode || ''
        },
        success: function(res) {
          state.modifiedIds.delete(id);
          alert('محصول #' + id + ' با موفقیت در ووکامرس ذخیره شد.');
          render();
        },
        error: function() {
          alert('خطا در ذخیره محصول.');
          render();
        }
      });
    });

    // Save all modified
    $('#wc-bpe-btn-save-all').on('click', function() {
      if (state.modifiedIds.size === 0) return;
      var $btn = $(this).prop('disabled', true).text('در حال ذخیره...');
      var ids = Array.from(state.modifiedIds);
      var done = 0;

      ids.forEach(function(id) {
        var prod = state.products.find(function(p) { return p.id === id; });
        if (!prod) return;

        $.ajax({
          url: wcBpeData.ajaxUrl,
          type: 'POST',
          data: {
            action: 'wc_bpe_save_inline_product',
            nonce: wcBpeData.nonce,
            product_id: prod.id,
            name: prod.name,
            sku: prod.sku,
            type: prod.type || 'simple',
            status: prod.status || 'publish',
            regular_price: prod.regularPrice,
            sale_price: prod.salePrice || '',
            manage_stock: prod.manageStock ? 'yes' : 'no',
            stock_quantity: prod.stockQuantity,
            stock_status: prod.stockStatus || 'outofstock',
            description: prod.description || '',
            short_description: prod.shortDescription || '',
            category: prod.category || '',
            brand: prod.brand || '',
            snappay_enabled: prod.snappayEnabled ? '1' : '0',
            torob_pay_enabled: prod.torobPayEnabled ? '1' : '0',
            coupon_code: prod.couponCode || ''
          },
          complete: function() {
            done++;
            if (done === ids.length) {
              state.modifiedIds.clear();
              alert('تمام تغییرات جدول با موفقیت در ووکامرس ذخیره شدند.');
              render();
            }
          }
        });
      });
    });

    // Discard
    $('#wc-bpe-btn-discard').on('click', function() {
      if (confirm('آیا از لغو تغییرات جدول اطمینان دارید؟')) {
        fetchProducts();
      }
    });

    // Quick Horizontal Scroll buttons in table toolbar
    $('#wc-bpe-scroll-left').on('click', function() {
      var wrap = document.getElementById('wc-bpe-table-wrap');
      if (wrap) wrap.scrollBy({ left: 300, behavior: 'smooth' });
    });
    $('#wc-bpe-scroll-right').on('click', function() {
      var wrap = document.getElementById('wc-bpe-table-wrap');
      if (wrap) wrap.scrollBy({ left: -300, behavior: 'smooth' });
    });

    // Synchronized Dual-Scroll (Top scrollbar and Table container)
    var $topScroll = $('#wc-bpe-top-scroll');
    var $tableWrap = $('#wc-bpe-table-wrap');
    var isSyncing = false;

    $topScroll.on('scroll', function() {
      if (isSyncing) return;
      isSyncing = true;
      if ($tableWrap[0]) $tableWrap[0].scrollLeft = this.scrollLeft;
      requestAnimationFrame(function() { isSyncing = false; });
    });

    $tableWrap.on('scroll', function() {
      if (isSyncing) return;
      isSyncing = true;
      if ($topScroll[0]) $topScroll[0].scrollLeft = this.scrollLeft;
      requestAnimationFrame(function() { isSyncing = false; });
    });

    // Gateway Toggle in Table
    $('.wc-bpe-toggle-gateway').on('click', function(e) {
      e.stopPropagation();
      var id = parseInt($(this).data('id'), 10);
      var gateway = $(this).data('gateway');
      var prod = state.products.find(function(p) { return p.id === id; });
      if (prod) {
        if (gateway === 'snappay') {
          prod.snappayEnabled = !prod.snappayEnabled;
        } else if (gateway === 'torob') {
          prod.torobPayEnabled = !prod.torobPayEnabled;
        }
        state.modifiedIds.add(id);
        render();
      }
    });

    // Auto-apply theme preset in settings
    $('#wc-bpe-apply-theme-preset-btn').on('click', function() {
      $('#wc-bpe-set-snappay-key').val('_disable_snappay');
      $('#wc-bpe-set-snappay-mode').val('disable_flag');
      $('#wc-bpe-set-torob-key').val('_disable_torobpay');
      $('#wc-bpe-set-torob-mode').val('disable_flag');
      alert('تنظیمات منطبق با کد قالب سایت شما در فیلدها درج گردید. لطفاً روی دکمه ذخیره تنظیمات کلیک کنید.');
    });

    // Save Settings Handler (AJAX)
    $('#wc-bpe-save-settings-btn, #wc-bpe-save-settings-btn-bottom').on('click', function() {
      var $btn = $(this).prop('disabled', true).text('در حال ذخیره...');
      var payload = {
        action: 'wc_bpe_save_settings',
        nonce: wcBpeData.nonce,
        batch_size: $('#wc-bpe-set-batch-size').val() || 20,
        retention_days: $('#wc-bpe-set-retention').val() || 60,
        enable_rollback: $('#wc-bpe-set-rollback').is(':checked') ? 1 : 0,
        audit_log_enabled: $('#wc-bpe-set-audit').is(':checked') ? 1 : 0,
        brand_source: $('input[name="wc_bpe_set_brand_source"]:checked').val() || 'taxonomy',
        brand_taxonomy: $('#wc-bpe-set-brand-taxonomy').val() || 'product_brand',
        brand_attribute: $('#wc-bpe-set-brand-attribute').val() || 'pa_brands',
        snappay_meta_key: $('#wc-bpe-set-snappay-key').val() || '_disable_snappay',
        snappay_mode: $('#wc-bpe-set-snappay-mode').val() || 'disable_flag',
        torob_meta_key: $('#wc-bpe-set-torob-key').val() || '_disable_torobpay',
        torob_mode: $('#wc-bpe-set-torob-mode').val() || 'disable_flag',
        enable_checkout_filter: $('#wc-bpe-set-checkout-filter').is(':checked') ? 1 : 0,
        price_round_unit: $('#wc-bpe-set-price-round').val() || 1000,
        delete_data_on_uninstall: $('#wc-bpe-set-delete-uninstall').is(':checked') ? 1 : 0
      };

      $.ajax({
        url: wcBpeData.ajaxUrl,
        type: 'POST',
        data: payload,
        success: function(res) {
          state.settings = {
            batchSize: parseInt(payload.batch_size, 10),
            historyRetentionDays: parseInt(payload.retention_days, 10),
            rollbackEnabled: !!payload.enable_rollback,
            auditLogEnabled: !!payload.audit_log_enabled,
            brandSource: payload.brand_source,
            brandTaxonomyName: payload.brand_taxonomy,
            brandAttributeName: payload.brand_attribute,
            snappayMetaKey: payload.snappay_meta_key,
            snappayMode: payload.snappay_mode,
            torobMetaKey: payload.torob_meta_key,
            torobMode: payload.torob_mode,
            enableCheckoutFilter: !!payload.enable_checkout_filter,
            priceRoundUnit: parseInt(payload.price_round_unit, 10),
            deleteOnUninstall: !!payload.delete_data_on_uninstall
          };
          alert('تنظیمات افزونه با موفقیت در پایگاه داده ووکامرس ذخیره گردید.');
          state.brandsDetail = [];
          state.masterBrands = [];
          state.filters.brands = [];
          state.page = 1;
          fetchProducts(false);
        },
        error: function() {
          alert('خطا در ذخیره تنظیمات. لطفاً مجدداً تلاش کنید.');
          $btn.prop('disabled', false).text('💾 ذخیره تنظیمات');
        }
      });
    });

    // Bulk Attributes Modal Opening & Handling
    $('#wc-bpe-btn-bulk-attrs').on('click', function() {
      if (state.selectedIds.length === 0) {
        alert('لطفاً حداقل یک محصول را با تیک زدن انتخاب کنید.');
        return;
      }
      state.bulkAttributeModal = true;
      render();
    });

    $('#wc-bpe-bulk-attr-close, #wc-bpe-bulk-attr-cancel').on('click', function() {
      state.bulkAttributeModal = false;
      render();
    });

    $('#wc-bpe-bulk-attr-target').on('change', function() {
      state.bulkAttrTarget = $(this).val();
      render();
    });

    $('#wc-bpe-bulk-attr-action').on('change', function() {
      state.bulkAttrAction = $(this).val();
      render();
    });

    $('#wc-bpe-bulk-attr-apply').on('click', function() {
      var target = $('#wc-bpe-bulk-attr-target').val() || 'brand';
      var action = $('#wc-bpe-bulk-attr-action').val() || 'set_term';
      var customName = ($('#wc-bpe-bulk-attr-custom-name').val() || 'رنگ').trim();

      var finalValue = '';
      if (target === 'brand') {
        var customB = ($('#wc-bpe-bulk-attr-val-brand-custom').val() || '').trim();
        var selectedB = $('#wc-bpe-bulk-attr-val-brand').val();
        finalValue = customB ? customB : selectedB;
        if (customB && state.brands.indexOf(customB) === -1) {
          state.brands.push(customB);
        }
      } else if (target === 'price_range') {
        finalValue = $('#wc-bpe-bulk-attr-val-pr').val() || '۲ تا ۵ میلیون';
      } else {
        finalValue = ($('#wc-bpe-bulk-attr-val-text').val() || '').trim();
      }

      var searchVal = ($('#wc-bpe-bulk-attr-search-val').val() || '').trim();

      // Apply to all selected products
      state.selectedIds.forEach(function(id) {
        var prod = state.products.find(function(p) { return p.id === id; });
        if (!prod) return;

        if (target === 'brand') {
          if (action === 'remove') {
            prod.brand = '';
            if (prod.attributes) delete prod.attributes['pa_brands'];
          } else {
            prod.brand = finalValue;
            if (!prod.attributes) prod.attributes = {};
            prod.attributes['pa_brands'] = finalValue;
          }
        } else if (target === 'price_range') {
          if (!prod.attributes) prod.attributes = {};
          if (action === 'remove') {
            delete prod.attributes['pa_price-range'];
          } else {
            prod.attributes['pa_price-range'] = finalValue;
          }
        } else {
          // Custom attribute
          if (!prod.attributes) prod.attributes = {};
          if (action === 'remove') {
            delete prod.attributes[customName];
          } else if (action === 'replace_term') {
            var oldV = prod.attributes[customName] || '';
            if (searchVal && oldV.indexOf(searchVal) !== -1) {
              prod.attributes[customName] = oldV.split(searchVal).join(finalValue);
            }
          } else {
            prod.attributes[customName] = finalValue;
          }
        }
        state.modifiedIds.add(prod.id);
      });

      state.bulkAttributeModal = false;
      alert('ویژگی‌های ' + state.selectedIds.length + ' محصول با موفقیت تغییر یافت. برای ثبت دائمی دکمه «ذخیره تغییرات جدول» را بزنید.');
      render();
    });

    // Wizard navigation
    $('#wc-bpe-wizard-next').on('click', function() {
      state.wizardStep = 2;
      render();
    });
    $('#wc-bpe-wizard-prev').on('click', function() {
      state.wizardStep = Math.max(1, state.wizardStep - 1);
      render();
    });
    $('#wc-bpe-wizard-calculate-preview').on('click', function() {
      // Read all operational inputs
      state.opSettings = {
        regularPriceType: $('#wc-bpe-op-reg-type').val() || 'none',
        regularPriceValue: parseFloat($('#wc-bpe-op-reg-val').val()) || 0,
        roundPriceTo: parseInt($('#wc-bpe-op-round').val(), 10) || 0,
        salePriceType: $('#wc-bpe-op-sale-type').val() || 'none',
        salePriceValue: parseFloat($('#wc-bpe-op-sale-val').val()) || 0,
        statusAction: $('#wc-bpe-op-status').val() || 'none',
        stockType: $('#wc-bpe-op-stock-type').val() || 'none',
        stockValue: parseInt($('#wc-bpe-op-stock-val').val(), 10) || 0,
        manageStockAction: $('#wc-bpe-op-manage-stock').val() || 'none',
        stockStatusAction: $('#wc-bpe-op-stock-status').val() || 'none',
        snappayAction: $('#wc-bpe-op-snappay').val() || 'none',
        torobPayAction: $('#wc-bpe-op-torob').val() || 'none',
        couponAction: $('#wc-bpe-op-coupon-action').val() || 'none',
        couponCode: ($('#wc-bpe-op-coupon-val').val() || '').trim(),
        brandAction: $('#wc-bpe-op-brand-action').val() || 'none',
        brandValue: $('#wc-bpe-op-brand-val').val() || '',
        priceRangeAction: $('#wc-bpe-op-pricerange-action').val() || 'none',
        priceRangeValue: $('#wc-bpe-op-pricerange-val').val() || '۲ تا ۵ میلیون',
        customAttributeAction: $('#wc-bpe-op-customattr-action').val() || 'none',
        customAttributeName: ($('#wc-bpe-op-customattr-name').val() || 'رنگ').trim(),
        customAttributeValue: ($('#wc-bpe-op-customattr-val').val() || '').trim(),
        customAttributeSearchValue: ($('#wc-bpe-op-customattr-search').val() || '').trim()
      };

      // Check if any rule is set
      var hasAnyOp = (
          state.opSettings.regularPriceType !== 'none' ||
          state.opSettings.salePriceType !== 'none' ||
          state.opSettings.statusAction !== 'none' ||
          state.opSettings.stockType !== 'none' ||
          state.opSettings.manageStockAction !== 'none' ||
          state.opSettings.stockStatusAction !== 'none' ||
          state.opSettings.snappayAction !== 'none' ||
          state.opSettings.torobPayAction !== 'none' ||
          state.opSettings.couponAction !== 'none' ||
          state.opSettings.brandAction !== 'none' ||
          state.opSettings.priceRangeAction !== 'none' ||
          state.opSettings.customAttributeAction !== 'none'
      );

      if (!hasAnyOp) {
        alert('لطفاً حداقل یک تغییر (مثلاً قیمت، برند، ویژگی یا وضعیت) را از حالت «بدون تغییر» خارج کنید.');
        return;
      }

      state.previews = [];
      ensureProductsLoaded(state.selectedIds.slice(), function(loaded) {
        if (!loaded) return;
        state.selectedIds.forEach(function(id) {
          var prod = findProductById(id);
          if (!prod) return;
          var changes = [];

          // Regular Price
          if (state.opSettings.regularPriceType !== 'none') {
            var oldReg = prod.regularPrice || 0;
            var newReg = calculateNewPrice(oldReg, state.opSettings.regularPriceType, state.opSettings.regularPriceValue, state.opSettings.roundPriceTo);
            if (newReg !== oldReg) {
              changes.push({ label: 'قیمت عادی', old: oldReg.toLocaleString() + ' تومان', new: newReg.toLocaleString() + ' تومان' });
            }
          }

          // Sale Price
          if (state.opSettings.salePriceType !== 'none') {
            var oldSale = prod.salePrice !== null ? prod.salePrice : 0;
            var newSale = calculateSalePrice(prod.regularPrice || 0, oldSale, state.opSettings.salePriceType, state.opSettings.salePriceValue, state.opSettings.roundPriceTo);
            if (newSale !== oldSale) {
              changes.push({
                label: 'قیمت حراج',
                old: oldSale ? oldSale.toLocaleString() + ' تومان' : 'ندارد',
                new: newSale ? newSale.toLocaleString() + ' تومان' : 'حذف تخفیف'
              });
            }
          }

          // Status (Post status: publish, draft, pending, private)
          if (state.opSettings.statusAction !== 'none') {
            var statusLabels = { publish: 'منتشر شده', draft: 'پیش‌نویس', pending: 'در انتظار بررسی', private: 'خصوصی' };
            if (prod.status !== state.opSettings.statusAction) {
              changes.push({
                label: 'وضعیت انتشار',
                old: statusLabels[prod.status] || prod.status,
                new: statusLabels[state.opSettings.statusAction] || state.opSettings.statusAction
              });
            }
          }

          // Stock Quantity
          if (state.opSettings.stockType !== 'none') {
            var oldStk = prod.stockQuantity || 0;
            var newStk = calculateNewStock(oldStk, state.opSettings.stockType, state.opSettings.stockValue);
            if (newStk !== oldStk) {
              changes.push({ label: 'تعداد موجودی', old: oldStk + ' عدد', new: newStk + ' عدد' });
            }
          }

          // Manage Stock Action
          if (state.opSettings.manageStockAction === 'disable') {
            if (prod.manageStock) {
              changes.push({
                label: 'مدیریت موجودی انبار',
                old: 'فعال',
                new: 'غیرفعال (موجودی ' + (prod.stockQuantity || 0) + ' عددی محفوظ می‌ماند)'
              });
            }
            if (prod.stockStatus !== 'outofstock') {
              changes.push({
                label: 'وضعیت انبار',
                old: prod.stockStatus === 'instock' ? 'موجود' : 'ناموجود',
                new: 'ناموجود (Out of Stock)'
              });
            }
          } else if (state.opSettings.manageStockAction === 'enable') {
            if (!prod.manageStock) {
              changes.push({
                label: 'مدیریت موجودی انبار',
                old: 'غیرفعال',
                new: 'فعال'
              });
            }
          }

          // Stock Status
          if (state.opSettings.stockStatusAction !== 'none' && state.opSettings.manageStockAction !== 'disable') {
            var curStkStatus = prod.stockStatus;
            if (curStkStatus !== state.opSettings.stockStatusAction) {
              changes.push({
                label: 'وضعیت انبار',
                old: curStkStatus === 'instock' ? 'موجود' : 'ناموجود',
                new: state.opSettings.stockStatusAction === 'instock' ? 'موجود' : 'ناموجود'
              });
            }
          }

          // Snappay
          if (state.opSettings.snappayAction !== 'none') {
            var curSnap = prod.snappayEnabled;
            var newSnap = state.opSettings.snappayAction === 'enable';
            if (curSnap !== newSnap) {
              changes.push({ label: 'اسنپ‌پی', old: curSnap ? 'فعال' : 'غیرفعال', new: newSnap ? 'فعال' : 'غیرفعال' });
            }
          }

          // Torob Pay
          if (state.opSettings.couponAction !== 'none') {
            var curC = prod.couponCode || 'بدون کد تخفیف';
            var newC = state.opSettings.couponAction === 'remove' ? 'حذف کد تخفیف' : (state.opSettings.couponCode || 'بدون کد');
            if (curC !== newC) {
              changes.push({ label: 'کد تخفیف (Coupon Code)', old: curC, new: newC });
            }
          }
          if (state.opSettings.torobPayAction !== 'none') {
            var curTorob = prod.torobPayEnabled;
            var newTorob = state.opSettings.torobPayAction === 'enable';
            if (curTorob !== newTorob) {
              changes.push({ label: 'پرداخت ترب', old: curTorob ? 'فعال' : 'غیرفعال', new: newTorob ? 'فعال' : 'غیرفعال' });
            }
          }

          // Brand
          if (state.opSettings.brandAction !== 'none') {
            var curBrand = prod.brand || 'ندارد';
            var targetBrand = state.opSettings.brandAction === 'set_term' ? state.opSettings.brandValue : 'حذف برند';
            if (curBrand !== targetBrand) {
              changes.push({ label: 'برند کالا', old: curBrand, new: targetBrand });
            }
          }

          // Price Range
          if (state.opSettings.priceRangeAction !== 'none') {
            var curPriceRange = (prod.attributes && prod.attributes['pa_price-range']) ? prod.attributes['pa_price-range'] : 'تنظیم‌نشده';
            var newPR = state.opSettings.priceRangeAction === 'remove' ? 'حذف ویژگی' : (state.opSettings.priceRangeAction === 'auto_by_price' ? 'محاسبه خودکار' : state.opSettings.priceRangeValue);
            changes.push({ label: 'ویژگی محدوده قیمت', old: curPriceRange, new: newPR });
          }

          // Custom Attributes (Color, Size, Warranty, etc.)
          if (state.opSettings.customAttributeAction !== 'none' && state.opSettings.customAttributeName) {
            var attrKey = state.opSettings.customAttributeName;
            var curAttrVal = (prod.attributes && prod.attributes[attrKey]) ? prod.attributes[attrKey] : 'تنظیم نشده';
            var newAttrVal = state.opSettings.customAttributeAction === 'remove' ? 'حذف این ویژگی' : (state.opSettings.customAttributeAction === 'replace_term' ? ('جایگزینی «' + state.opSettings.customAttributeSearchValue + '» با «' + state.opSettings.customAttributeValue + '»') : state.opSettings.customAttributeValue);
            changes.push({ label: 'ویژگی: ' + attrKey, old: curAttrVal, new: newAttrVal });
          }

          if (changes.length > 0) {
            state.previews.push({ id: prod.id, name: prod.name, sku: prod.sku, changes: changes });
          }
        });

        if (state.previews.length === 0) {
          alert('با قوانین انتخابی، تغییری برای محصولات حاصل نشد (شاید مقادیر فعلی محصولات دقیقاً با قانون شما یکسان است).');
          return;
        }

        state.wizardStep = 3;
        render();
      });
    });

    $('#wc-bpe-wizard-start-execution').on('click', function() {
      state.wizardStep = 4;
      render();
      executeWizardBatchProcessing();
    });

    $('#wc-bpe-view-updated-table').on('click', function() {
      state.activeTab = 'table';
      state.wizardStep = 1;
      state.selectedIds = [];
      state.previews = [];
      render();
    });

    $('#wc-bpe-reset-wizard').on('click', function() {
      state.wizardStep = 1;
      state.selectedIds = [];
      state.previews = [];
      render();
    });

    $('#wc-bpe-go-history').on('click', function() {
      state.activeTab = 'history';
      fetchHistory();
    });

    $('#wc-bpe-refresh-history').on('click', function() {
      fetchHistory();
    });

    // Rollback button
    $('.wc-bpe-btn-rollback').on('click', function() {
      var opId = $(this).data('id');
      if (!opId) return;
      if (!confirm('آیا از بازگردانی (Rollback) این عملیات اطمینان دارید؟ تمام مقادیر محصولات این عملیات به اسنپ‌شات قبل از اعمال تغییرات برگردانده خواهند شد.')) return;
      var $b = $(this).prop('disabled', true).text('در حال بازگردانی...');
      $.ajax({
        url: wcBpeData.ajaxUrl,
        type: 'POST',
        data: {
          action: 'wc_bpe_rollback_operation',
          nonce: wcBpeData.nonce,
          operation_id: opId
        },
        success: function(res) {
          if (res && res.success) {
            alert('عملیات با موفقیت بازگردانی شد و مقادیر به حالت قبل برگشتند.');
            fetchHistory();
            fetchProducts();
          } else {
            var msg = (res && res.data && res.data.message) ? res.data.message : 'خطا در بازگردانی.';
            alert(msg);
            $b.prop('disabled', false).text('↺ بازگردانی (Rollback)');
          }
        },
        error: function(xhr, status, err) {
          alert('خطای ارتباط با سرور در هنگام بازگردانی: ' + err);
          $b.prop('disabled', false).text('↺ بازگردانی (Rollback)');
        }
      });
    });
  }

  function executeWizardBatchProcessing() {
    var productIds = state.selectedIds.slice();
    if (productIds.length === 0) {
      alert('محصولی برای اعمال تغییرات انتخاب نشده است.');
      state.wizardStep = 1;
      render();
      return;
    }

    var batchSize = wcBpeData.batchSize || 10;
    var chunks = [];
    for (var i = 0; i < productIds.length; i += batchSize) {
      chunks.push(productIds.slice(i, i + batchSize));
    }

    var operationId = 'bpe-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    var currentChunkIndex = 0;

    var operationsPayload = {
      regular_price_type: state.opSettings.regularPriceType,
      regularPriceType: state.opSettings.regularPriceType,
      regular_price_value: state.opSettings.regularPriceValue,
      regularPriceValue: state.opSettings.regularPriceValue,
      round_unit: state.opSettings.roundPriceTo,
      roundPriceTo: state.opSettings.roundPriceTo,

      sale_price_type: state.opSettings.salePriceType,
      salePriceType: state.opSettings.salePriceType,
      sale_price_value: state.opSettings.salePriceValue,
      salePriceValue: state.opSettings.salePriceValue,

      status_action: state.opSettings.statusAction,
      statusAction: state.opSettings.statusAction,
      post_status_action: state.opSettings.statusAction,

      stock_type: state.opSettings.stockType,
      stockType: state.opSettings.stockType,
      stock_value: state.opSettings.stockValue,
      stockValue: state.opSettings.stockValue,

      manage_stock_action: state.opSettings.manageStockAction,
      manageStockAction: state.opSettings.manageStockAction,

      stock_status_action: state.opSettings.stockStatusAction,
      stockStatusAction: state.opSettings.stockStatusAction,

      snappay_action: state.opSettings.snappayAction,
      snappayAction: state.opSettings.snappayAction,

      torob_pay_action: state.opSettings.torobPayAction,
      torobPayAction: state.opSettings.torobPayAction,
      coupon_action: state.opSettings.couponAction,
      coupon_code: state.opSettings.couponCode,
      couponAction: state.opSettings.couponAction,
      couponCode: state.opSettings.couponCode,

      brand_action: state.opSettings.brandAction,
      brandAction: state.opSettings.brandAction,
      brand_value: state.opSettings.brandValue,
      brandValue: state.opSettings.brandValue,

      price_range_action: state.opSettings.priceRangeAction,
      priceRangeAction: state.opSettings.priceRangeAction,
      price_range_value: state.opSettings.priceRangeValue,
      priceRangeValue: state.opSettings.priceRangeValue,

      custom_attribute_action: state.opSettings.customAttributeAction,
      customAttributeAction: state.opSettings.customAttributeAction,
      custom_attribute_name: state.opSettings.customAttributeName,
      customAttributeName: state.opSettings.customAttributeName,
      custom_attribute_value: state.opSettings.customAttributeValue,
      customAttributeValue: state.opSettings.customAttributeValue,
      custom_attribute_search_value: state.opSettings.customAttributeSearchValue,
      customAttributeSearchValue: state.opSettings.customAttributeSearchValue
    };

    function processNextChunk() {
      if (currentChunkIndex >= chunks.length) {
        applyChangesLocally(productIds, state.opSettings);
        state.executionStats = {
          total: productIds.length,
          operationId: operationId
        };
        state.wizardStep = 5;
        render();
        return;
      }

      var currentChunk = chunks[currentChunkIndex];
      var progressPercent = Math.round((currentChunkIndex / chunks.length) * 100);
      $('#wc-bpe-progress-fill').css('width', progressPercent + '%');
      $('#wc-bpe-progress-status').text(
          'در حال پردازش و ثبت تغییرات در ووکامرس: دسته ' + (currentChunkIndex + 1) + ' از ' + chunks.length + ' (' + currentChunk.length + ' محصول)...'
      );

      $.ajax({
        url: wcBpeData.ajaxUrl,
        type: 'POST',
        data: {
          action: 'wc_bpe_process_batch',
          nonce: wcBpeData.nonce,
          operation_id: operationId,
          product_ids: currentChunk,
          operations: JSON.stringify(operationsPayload)
        },
        success: function() {
          currentChunkIndex++;
          setTimeout(processNextChunk, 80);
        },
        error: function(xhr, status, err) {
          console.error('Batch execution error:', err);
          currentChunkIndex++;
          setTimeout(processNextChunk, 80);
        }
      });
    }

    processNextChunk();
  }

  function applyChangesLocally(productIds, ops) {
    productIds.forEach(function(id) {
      var prod = state.products.find(function(p) { return p.id === id; });
      if (!prod) return;

      if (ops.regularPriceType !== 'none') {
        prod.regularPrice = calculateNewPrice(prod.regularPrice || 0, ops.regularPriceType, ops.regularPriceValue, ops.roundPriceTo);
      }
      if (ops.salePriceType !== 'none') {
        prod.salePrice = calculateSalePrice(prod.regularPrice || 0, prod.salePrice, ops.salePriceType, ops.salePriceValue, ops.roundPriceTo);
      }
      if (ops.statusAction !== 'none') {
        prod.status = ops.statusAction;
      }
      if (ops.stockType !== 'none') {
        prod.stockQuantity = calculateNewStock(prod.stockQuantity || 0, ops.stockType, ops.stockValue);
        prod.manageStock = true;
        if (ops.stockStatusAction === 'none') {
          prod.stockStatus = prod.stockQuantity > 0 ? 'instock' : 'outofstock';
        }
      }
      if (ops.stockStatusAction !== 'none') {
        prod.stockStatus = ops.stockStatusAction;
      }
      if (ops.snappayAction !== 'none') {
        prod.snappayEnabled = ops.snappayAction === 'enable';
      }
      if (ops.torobPayAction !== 'none') {
        prod.torobPayEnabled = ops.torobPayAction === 'enable';
      }
      if (ops.brandAction && ops.brandAction !== 'none') {
        if (ops.brandAction === 'set_term') prod.brand = ops.brandValue;
        else if (ops.brandAction === 'remove') prod.brand = '';
      }
      if (!prod.attributes) prod.attributes = {};
      if (ops.priceRangeAction && ops.priceRangeAction !== 'none') {
        if (ops.priceRangeAction === 'remove') delete prod.attributes['pa_price-range'];
        else if (ops.priceRangeAction === 'set_term') prod.attributes['pa_price-range'] = ops.priceRangeValue;
      }
      if (ops.customAttributeAction && ops.customAttributeAction !== 'none' && ops.customAttributeName) {
        var aKey = ops.customAttributeName;
        if (ops.customAttributeAction === 'remove') {
          delete prod.attributes[aKey];
        } else if (ops.customAttributeAction === 'set_term') {
          prod.attributes[aKey] = ops.customAttributeValue;
        } else if (ops.customAttributeAction === 'replace_term') {
          var oldV = prod.attributes[aKey] || '';
          if (ops.customAttributeSearchValue && oldV.indexOf(ops.customAttributeSearchValue) !== -1) {
            prod.attributes[aKey] = oldV.split(ops.customAttributeSearchValue).join(ops.customAttributeValue);
          }
        }
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
  }

  $(document).ready(function() {
    var $app = $('#wc-bpe-app');
    if ($app.length) {
      var initialTab = $app.data('tab');
      if (initialTab && (initialTab === 'wizard' || initialTab === 'table' || initialTab === 'history' || initialTab === 'settings')) {
        state.activeTab = initialTab;
      }
    }
    injectFilterStyles();
    fetchProducts();
    fetchHistory();
  });
})(jQuery);