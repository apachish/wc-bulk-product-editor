export const adminJsContent = `(function($) {
  'use strict';

  var state = {
    products: [],
    selectedIds: [],
    modifiedIds: new Set(),
    activeTab: 'table',
    wizardStep: 1,
    filters: { search: '', category: '', brand: '', status: '', stockStatus: '', type: '', preset: 'all' },
    categories: ['گوشی موبایل', 'لوازم جانبی', 'ساعت و مچ‌بند', 'لپ‌تاپ', 'لوازم خانگی'],
    brands: [
      'Casio', 'Seiko', 'G-Shock', 'TISSOT', 'Swatch', 'Calvin Klein',
      'Caterpillar', 'CERRUTI', 'Daniel Gorman', 'Edifice', 'Esprit',
      'GUCCI', 'Guess', 'Orient', 'POLICE', 'Pro Trek', 'Timberland',
      'سامسونگ', 'اپل', 'شیائومی', 'باسئوس', 'ایسوس', 'مباشی'
    ],
    opSettings: {
      regularPriceType: 'increase_percent',
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
    isLoading: true
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
      snappayEnabled: true,
      torobPayEnabled: true,
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
      snappayEnabled: true,
      torobPayEnabled: true,
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
      torobPayEnabled: true,
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
      snappayEnabled: true,
      torobPayEnabled: true,
      isPurchasable: true
    }
  ];

  function fetchProducts() {
    state.isLoading = true;
    render();

    $.ajax({
      url: wcBpeData.ajaxUrl,
      type: 'POST',
      data: {
        action: 'wc_bpe_get_products',
        nonce: wcBpeData.nonce,
        page: 1,
        limit: 100
      },
      success: function(res) {
        state.isLoading = false;
        if (res.success && res.data && res.data.products && res.data.products.length > 0) {
          state.products = res.data.products;
          state.categories = res.data.categories || [];
          state.isRealStoreData = true;
        } else if (res.success && res.data && Array.isArray(res.data.products) && res.data.products.length === 0) {
          state.products = sampleProducts; // Provide sample so user sees working UI even with 0 products
          state.categories = res.data.categories && res.data.categories.length > 0 ? res.data.categories : ['گوشی موبایل', 'لوازم جانبی', 'ساعت و مچ‌بند'];
          state.isRealStoreData = false;
          state.storeIsEmpty = true;
        } else {
          state.products = sampleProducts;
          state.categories = ['گوشی موبایل', 'لوازم جانبی', 'ساعت و مچ‌بند', 'لپ‌تاپ'];
          state.isRealStoreData = false;
        }
        var fetchedBrands = (res.data && Array.isArray(res.data.brands)) ? res.data.brands : [];
        var productBrands = state.products.map(function(p) { return p.brand; }).filter(Boolean);
        var defaultBrands = [
          'Casio', 'Seiko', 'G-Shock', 'TISSOT', 'Swatch', 'Calvin Klein',
          'Caterpillar', 'CERRUTI', 'Daniel Gorman', 'Edifice', 'Esprit',
          'GUCCI', 'Guess', 'Orient', 'POLICE', 'Pro Trek', 'Timberland',
          'سامسونگ', 'اپل', 'شیائومی', 'باسئوس', 'ایسوس', 'مباشی'
        ];
        state.brands = Array.from(new Set(fetchedBrands.concat(productBrands).concat(defaultBrands)));
        render();
      },
      error: function() {
        state.isLoading = false;
        state.products = sampleProducts;
        state.isRealStoreData = false;
        render();
      }
    });
  }

  function render() {
    var $container = $('#wc-bpe-app');
    if (!$container.length) return;

    var html = '';

    // Header Banner
    html += '<div class="wc-bpe-header-banner">' +
      '<div class="title">' +
        '<span class="badge-wp">WC</span>' +
        '<span>ویرایش گروهی پیشرفته محصولات ووکامرس (Bulk Product Editor Pro)</span>' +
      '</div>' +
      '<div>' +
        '<span>ووکامرس فعال | PHP 8.1+ | سازگار با اسنپ‌پی و ترب</span>' +
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
  }

  function renderTableView() {
    var filtered = getFilteredProducts();

    var html = '<div class="wc-bpe-card" style="padding: 14px 18px; margin-top: 15px; border-radius: 4px;">' +
      // Quick preset pills
      '<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 12px; font-size: 12px;">' +
        '<span style="color: #646970; font-weight: 600;">فیلترهای سریع:</span>' +
        '<button type="button" class="wc-bpe-preset-btn ' + (state.filters.preset === 'all' ? 'active' : '') + '" data-preset="all">همه (' + state.products.length + ')</button>' +
        '<button type="button" class="wc-bpe-preset-btn ' + (state.filters.preset === 'instock' ? 'active' : '') + '" data-preset="instock">✓ موجود در انبار</button>' +
        '<button type="button" class="wc-bpe-preset-btn ' + (state.filters.preset === 'outofstock' ? 'active' : '') + '" data-preset="outofstock">✕ ناموجود</button>' +
        '<button type="button" class="wc-bpe-preset-btn ' + (state.filters.preset === 'on_sale' ? 'active' : '') + '" data-preset="on_sale">🏷️ تخفیف‌دار</button>' +
        '<button type="button" class="wc-bpe-preset-btn ' + (state.filters.preset === 'variable' ? 'active' : '') + '" data-preset="variable">محصولات متغیر</button>' +
        '<button type="button" class="wc-bpe-preset-btn ' + (state.filters.preset === 'simple' ? 'active' : '') + '" data-preset="simple">محصولات ساده</button>' +
      '</div>' +

      // Toolbar filters
      '<div class="wc-bpe-toolbar" style="margin: 0; padding: 0; border: none; background: none;">' +
        '<div class="wc-bpe-toolbar-left" style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">' +
          '<input type="text" id="wc-bpe-search" class="wc-bpe-input" placeholder="جستجوی نام، کد SKU یا ID..." value="' + escapeHtml(state.filters.search) + '" style="width: 200px;">' +
          '<select id="wc-bpe-cat-filter" class="wc-bpe-select">' +
            '<option value="">همه دسته‌ها</option>';
    state.categories.forEach(function(c) {
      html += '<option value="' + escapeHtml(c) + '" ' + (state.filters.category === c ? 'selected' : '') + '>' + escapeHtml(c) + '</option>';
    });
    html += '</select>' +
          '<select id="wc-bpe-brand-filter" class="wc-bpe-select">' +
            '<option value="">همه برندها</option>';
    state.brands.forEach(function(b) {
      html += '<option value="' + escapeHtml(b) + '" ' + (state.filters.brand === b ? 'selected' : '') + '>' + escapeHtml(b) + '</option>';
    });
    html += '</select>' +
          '<select id="wc-bpe-stock-filter" class="wc-bpe-select">' +
            '<option value="">همه وضعیت‌های انبار</option>' +
            '<option value="instock" ' + (state.filters.stockStatus === 'instock' ? 'selected' : '') + '>موجود در انبار</option>' +
            '<option value="outofstock" ' + (state.filters.stockStatus === 'outofstock' ? 'selected' : '') + '>ناموجود</option>' +
          '</select>' +
          '<select id="wc-bpe-status-filter" class="wc-bpe-select">' +
            '<option value="">همه وضعیت‌ها</option>' +
            '<option value="publish" ' + (state.filters.status === 'publish' ? 'selected' : '') + '>منتشر شده (Publish)</option>' +
            '<option value="draft" ' + (state.filters.status === 'draft' ? 'selected' : '') + '>پیش‌نویس (Draft)</option>' +
          '</select>' +
          '<select id="wc-bpe-type-filter" class="wc-bpe-select">' +
            '<option value="">همه انواع کالا</option>' +
            '<option value="simple" ' + (state.filters.type === 'simple' ? 'selected' : '') + '>ساده</option>' +
            '<option value="variable" ' + (state.filters.type === 'variable' ? 'selected' : '') + '>متغیر</option>' +
          '</select>' +
          '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="wc-bpe-btn-reset-filters" style="padding: 4px 10px;">پاک‌سازی فیلترها</button>' +
        '</div>' +
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
    html += '<div class="wc-bpe-top-scrollbar" id="wc-bpe-top-scroll" title="نوار اسکرول افقی بالای جدول">' +
      '<div style="width: 1750px; height: 1px;"></div>' +
    '</div>' +
    '<div class="wc-bpe-table-wrapper" id="wc-bpe-table-wrap">' +
      '<div style="padding: 10px 14px; background: #fbfbfb; border-bottom: 1px solid #e5e5e5; display: flex; justify-content: space-between; font-size: 12px;">' +
        '<span>تعداد کل نتایج: <strong>' + filtered.length + ' محصول</strong></span>' +
        '<span>Previous <strong>[ 1 ]</strong> Next</span>' +
      '</div>' +
      '<table class="wc-bpe-table">' +
        '<thead>' +
          '<tr>' +
            '<th style="width: 30px; text-align: center;"><input type="checkbox" id="wc-bpe-select-all" ' + (state.selectedIds.length === filtered.length && filtered.length > 0 ? 'checked' : '') + '></th>' +
            '<th style="width: 50px;">ID</th>' +
            '<th style="width: 60px; text-align: center;">Thumbnail</th>' +
            '<th style="min-width: 220px;">Title (نام محصول)</th>' +
            '<th style="width: 100px; text-align: center;">Description</th>' +
            '<th style="width: 100px; text-align: center;">Short Desc.</th>' +
            '<th style="min-width: 120px;">Category</th>' +
            '<th style="min-width: 120px;">Brand</th>' +
            '<th style="min-width: 150px;">Attributes (ویژگی‌ها)</th>' +
            '<th style="width: 90px;">Type</th>' +
            '<th style="width: 90px;">Status</th>' +
            '<th style="width: 110px;">Regular price</th>' +
            '<th style="width: 110px;">Sale price</th>' +
            '<th style="width: 100px;">SKU</th>' +
            '<th style="width: 100px; text-align: center;">Manage stock</th>' +
            '<th style="width: 80px;">Stock quantity</th>' +
            '<th style="width: 90px;">Stock status</th>' +
            '<th style="width: 80px; text-align: center;">Actions</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>';

    if (filtered.length === 0) {
      html += '<tr><td colspan="18" style="text-align: center; padding: 30px;">محصولی یافت نشد.</td></tr>';
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
          '<td style="text-align: center;">' +
            '<button type="button" class="wc-bpe-btn-content ' + (p.description ? 'has-content' : '') + '" data-id="' + p.id + '" data-field="description">' + (p.description ? 'Content' : 'Content[empty]') + '</button>' +
          '</td>' +
          '<td style="text-align: center;">' +
            '<button type="button" class="wc-bpe-btn-content ' + (p.shortDescription ? 'has-content' : '') + '" data-id="' + p.id + '" data-field="shortDescription">' + (p.shortDescription ? 'Content' : 'Content[empty]') + '</button>' +
          '</td>' +
          '<td><input type="text" class="wc-bpe-cell-input wc-bpe-edit-field" data-id="' + p.id + '" data-field="category" value="' + escapeHtml(p.category || '') + '"></td>' +
          '<td><input type="text" class="wc-bpe-cell-input wc-bpe-edit-field" data-id="' + p.id + '" data-field="brand" value="' + escapeHtml(p.brand || '') + '"></td>' +
          '<td>' +
            (p.priceRange ? '<span class="badge" style="background:#f3e8ff; color:#7e22ce; font-size:10px; margin-left:3px;">' + escapeHtml(p.priceRange) + '</span>' : '') +
            (p.attributes ? Object.keys(p.attributes).filter(function(k){ return k !== 'pa_brands' && k !== 'pa_price-range'; }).map(function(k){ return '<span class="badge" style="background:#ecfdf5; color:#047857; font-size:10px; margin-left:3px;">' + escapeHtml(k) + ': ' + escapeHtml(p.attributes[k]) + '</span>'; }).join('') : '') +
            '<button type="button" class="wc-bpe-btn-single-attr" data-id="' + p.id + '" style="font-size:10px; background:none; border:none; color:#2271b1; cursor:pointer; font-weight:bold;">+ ویژگی</button>' +
          '</td>' +
          '<td>' +
            '<select class="wc-bpe-cell-input wc-bpe-edit-field" data-id="' + p.id + '" data-field="type">' +
              '<option value="simple" ' + (p.type === 'simple' ? 'selected' : '') + '>Simple</option>' +
              '<option value="variable" ' + (p.type === 'variable' ? 'selected' : '') + '>Variable</option>' +
            '</select>' +
          '</td>' +
          '<td>' +
            '<select class="wc-bpe-cell-input wc-bpe-edit-field" data-id="' + p.id + '" data-field="status">' +
              '<option value="publish" ' + (p.status === 'publish' ? 'selected' : '') + '>Published</option>' +
              '<option value="draft" ' + (p.status === 'draft' ? 'selected' : '') + '>Draft</option>' +
            '</select>' +
          '</td>' +
          '<td><input type="number" class="wc-bpe-cell-input wc-bpe-edit-field" data-id="' + p.id + '" data-field="regularPrice" value="' + p.regularPrice + '" dir="ltr"></td>' +
          '<td><input type="number" class="wc-bpe-cell-input wc-bpe-edit-field" data-id="' + p.id + '" data-field="salePrice" value="' + (p.salePrice !== null ? p.salePrice : '') + '" placeholder="—" dir="ltr"></td>' +
          '<td><input type="text" class="wc-bpe-cell-input wc-bpe-edit-field" data-id="' + p.id + '" data-field="sku" value="' + escapeHtml(p.sku || '') + '" dir="ltr"></td>' +
          '<td style="text-align: center;">' +
            '<div class="wc-bpe-switch ' + (p.manageStock ? 'active' : '') + '" data-id="' + p.id + '">' +
              '<div class="wc-bpe-switch-track"><div class="wc-bpe-switch-thumb"></div></div>' +
              '<span class="wc-bpe-switch-label">' + (p.manageStock ? 'Yes' : 'No') + '</span>' +
            '</div>' +
          '</td>' +
          '<td><input type="number" class="wc-bpe-cell-input wc-bpe-edit-field" data-id="' + p.id + '" data-field="stockQuantity" value="' + p.stockQuantity + '" ' + (!p.manageStock ? 'disabled' : '') + ' dir="ltr"></td>' +
          '<td>' +
            '<span style="font-weight: 600; color: ' + (p.stockStatus === 'instock' ? '#00a32a' : '#d63638') + ';">' +
              (p.stockStatus === 'instock' ? 'In stock' : 'Out of stock') +
            '</span>' +
          '</td>' +
          '<td style="text-align: center;">' +
            '<button type="button" class="button button-small wc-bpe-btn-preview" data-id="' + p.id + '" title="پیش‌نمایش">👁️</button> ' +
            '<button type="button" class="button button-small wc-bpe-btn-save-row" data-id="' + p.id + '" title="ذخیره این ردیف">💾</button>' +
          '</td>' +
        '</tr>';
      });
    }

    html += '</tbody></table>' +
      '<div style="padding: 10px 14px; background: #fbfbfb; border-top: 1px solid #e5e5e5; display: flex; justify-content: space-between; font-size: 12px;">' +
        '<span>Showing 1 to ' + filtered.length + ' of ' + filtered.length + ' entries</span>' +
        '<span>Previous <strong>[ 1 ]</strong> Next</span>' +
      '</div>' +
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

      // Filter Box
      '<div style="background: #fbfbfb; border: 1px solid #c3c4c7; border-radius: 4px; padding: 12px 15px; margin-bottom: 15px;">' +
        // Preset pills
        '<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-bottom: 12px; font-size: 12px;">' +
          '<span style="color: #646970; font-weight: 600;">فیلترهای سریع:</span>' +
          '<button type="button" class="wc-bpe-preset-btn ' + (state.filters.preset === 'all' ? 'active' : '') + '" data-preset="all">همه (' + state.products.length + ')</button>' +
          '<button type="button" class="wc-bpe-preset-btn ' + (state.filters.preset === 'instock' ? 'active' : '') + '" data-preset="instock">✓ موجود در انبار</button>' +
          '<button type="button" class="wc-bpe-preset-btn ' + (state.filters.preset === 'outofstock' ? 'active' : '') + '" data-preset="outofstock">✕ ناموجود</button>' +
          '<button type="button" class="wc-bpe-preset-btn ' + (state.filters.preset === 'on_sale' ? 'active' : '') + '" data-preset="on_sale">🏷️ تخفیف‌دار</button>' +
          '<button type="button" class="wc-bpe-preset-btn ' + (state.filters.preset === 'variable' ? 'active' : '') + '" data-preset="variable">محصولات متغیر</button>' +
          '<button type="button" class="wc-bpe-preset-btn ' + (state.filters.preset === 'simple' ? 'active' : '') + '" data-preset="simple">محصولات ساده</button>' +
        '</div>' +

        // Inputs row
        '<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">' +
          '<input type="text" id="wc-bpe-wiz-search" class="wc-bpe-input" placeholder="جستجوی نام، کد SKU یا ID..." value="' + escapeHtml(state.filters.search) + '" style="width: 200px;">' +
          '<select id="wc-bpe-wiz-cat" class="wc-bpe-select">' +
            '<option value="">همه دسته‌ها</option>';
    state.categories.forEach(function(c) {
      html += '<option value="' + escapeHtml(c) + '" ' + (state.filters.category === c ? 'selected' : '') + '>' + escapeHtml(c) + '</option>';
    });
    html += '</select>' +
          '<select id="wc-bpe-wiz-brand" class="wc-bpe-select">' +
            '<option value="">همه برندها</option>';
    state.brands.forEach(function(b) {
      html += '<option value="' + escapeHtml(b) + '" ' + (state.filters.brand === b ? 'selected' : '') + '>' + escapeHtml(b) + '</option>';
    });
    html += '</select>' +
          '<select id="wc-bpe-wiz-stock" class="wc-bpe-select">' +
            '<option value="">همه وضعیت‌های انبار</option>' +
            '<option value="instock" ' + (state.filters.stockStatus === 'instock' ? 'selected' : '') + '>موجود در انبار</option>' +
            '<option value="outofstock" ' + (state.filters.stockStatus === 'outofstock' ? 'selected' : '') + '>ناموجود</option>' +
          '</select>' +
          '<select id="wc-bpe-wiz-status" class="wc-bpe-select">' +
            '<option value="">همه وضعیت‌ها</option>' +
            '<option value="publish" ' + (state.filters.status === 'publish' ? 'selected' : '') + '>منتشر شده</option>' +
            '<option value="draft" ' + (state.filters.status === 'draft' ? 'selected' : '') + '>پیش‌نویس</option>' +
          '</select>' +
          '<select id="wc-bpe-wiz-type" class="wc-bpe-select">' +
            '<option value="">همه انواع کالا</option>' +
            '<option value="simple" ' + (state.filters.type === 'simple' ? 'selected' : '') + '>ساده</option>' +
            '<option value="variable" ' + (state.filters.type === 'variable' ? 'selected' : '') + '>متغیر</option>' +
          '</select>' +
          '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="wc-bpe-wiz-reset-filters" style="padding: 4px 10px;">پاک‌سازی فیلترها</button>' +
        '</div>' +
      '</div>' +

      // Action toolbar for selection
      '<div style="background: #fff; border: 1px solid #c3c4c7; border-radius: 4px; padding: 10px 15px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 12px; font-size: 12px;">' +
        '<div style="display: flex; align-items: center; gap: 8px;">' +
          '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="wc-bpe-select-all-filtered">' +
            (allFilteredSelected ? 'لغو انتخاب موارد این فیلتر' : 'انتخاب همه ' + filtered.length + ' محصول فیلترشده') +
          '</button>' +
          '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="wc-bpe-invert-filtered">انتخاب معکوس</button>' +
          (state.selectedIds.length > 0 ? '<button type="button" class="wc-bpe-btn wc-bpe-btn-secondary" id="wc-bpe-deselect-all" style="color: #d63638;">لغو تمام انتخاب‌ها (' + state.selectedIds.length + ')</button>' : '') +
        '</div>' +
        '<div>' +
          'تعداد انتخاب‌شده برای ویرایش: <strong style="color: #2271b1; font-size: 14px;">' + state.selectedIds.length + '</strong> از ' + filtered.length + ' محصول فیلترشده' +
        '</div>' +
      '</div>' +

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
            '<span style="font-size: 11px; color: ' + (p.status === 'publish' ? '#2e7d32;' : '#ed6c02;') + '">' +
              (p.status === 'publish' ? 'منتشر شده' : 'پیش‌نویس') +
            '</span>' +
          '</td>' +
        '</tr>';
      });
    }

    html += '</tbody></table>' +
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

        // 5. Stock Status (In stock / Out of stock)
        '<div style="background: #f9f9f9; padding: 15px; border-radius: 4px; border: 1px solid #e5e5e5;">' +
          '<strong>🔘 وضعیت انبارداری (Stock Status)</strong>' +
          '<div style="margin-top: 8px;">' +
            '<select id="wc-bpe-op-stock-status" class="wc-bpe-select" style="width: 100%;">' +
              '<option value="none" ' + (ops.stockStatusAction === 'none' ? 'selected' : '') + '>بدون تغییر (دست‌نخورده)</option>' +
              '<option value="instock" ' + (ops.stockStatusAction === 'instock' ? 'selected' : '') + '>موجود در انبار (In Stock)</option>' +
              '<option value="outofstock" ' + (ops.stockStatusAction === 'outofstock' ? 'selected' : '') + '>ناموجود (Out of Stock)</option>' +
            '</select>' +
          '</div>' +
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

        // 7. Attributes: Brand & Price Range & Custom Attributes
        '<div style="grid-column: span 2; background: #fdfaf6; padding: 15px; border-radius: 4px; border: 1px solid #fed7aa;">' +
          '<strong style="color: #9a3412;">🏷️ مدیریت گروهی ویژگی‌های محصول (Attributes)</strong>' +
          '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px;">' +

            // Brand
            '<div style="background: #fff; padding: 12px; border-radius: 3px; border: 1px solid #e5e5e5;">' +
              '<strong>🏢 برند محصول (Brand)</strong>' +
              '<div style="margin-top: 6px;">' +
                '<select id="wc-bpe-op-brand-action" class="wc-bpe-select" style="width: 100%;">' +
                  '<option value="none" ' + (ops.brandAction === 'none' ? 'selected' : '') + '>بدون تغییر (دست‌نخورده)</option>' +
                  '<option value="set_term" ' + (ops.brandAction === 'set_term' ? 'selected' : '') + '>تنظیم یا تعویض برند به یک برند مشخص</option>' +
                  '<option value="remove" ' + (ops.brandAction === 'remove' ? 'selected' : '') + '>حذف برند از محصولات</option>' +
                '</select>' +
              '</div>' +
              '<div id="wc-bpe-op-brand-box" style="margin-top: 8px; ' + (ops.brandAction === 'set_term' ? '' : 'display: none;') + '">' +
                '<label style="display:block; font-size:11px; margin-bottom:3px;">انتخاب برند:</label>' +
                '<select id="wc-bpe-op-brand-val" class="wc-bpe-select" style="width: 100%;">' +
                  state.brands.map(function(b){ return '<option value="' + escapeHtml(b) + '" ' + (ops.brandValue === b ? 'selected' : '') + '>' + escapeHtml(b) + '</option>'; }).join('') +
                '</select>' +
              '</div>' +
            '</div>' +

            // Price Range
            '<div style="background: #fff; padding: 12px; border-radius: 3px; border: 1px solid #e5e5e5;">' +
              '<strong>🏷️ ویژگی محدوده قیمت (pa_price-range)</strong>' +
              '<div style="margin-top: 6px;">' +
                '<select id="wc-bpe-op-pricerange-action" class="wc-bpe-select" style="width: 100%;">' +
                  '<option value="none" ' + (ops.priceRangeAction === 'none' ? 'selected' : '') + '>بدون تغییر</option>' +
                  '<option value="auto_by_price" ' + (ops.priceRangeAction === 'auto_by_price' ? 'selected' : '') + '>محاسبه خودکار بر اساس قیمت نهایی</option>' +
                  '<option value="set_term" ' + (ops.priceRangeAction === 'set_term' ? 'selected' : '') + '>تعیین دستی مقدار مشخص</option>' +
                  '<option value="remove" ' + (ops.priceRangeAction === 'remove' ? 'selected' : '') + '>حذف ویژگی محدوده قیمت</option>' +
                '</select>' +
              '</div>' +
              '<div id="wc-bpe-op-pricerange-box" style="margin-top: 8px; ' + (ops.priceRangeAction === 'set_term' ? '' : 'display: none;') + '">' +
                '<label style="display:block; font-size:11px; margin-bottom:3px;">انتخاب محدوده قیمت:</label>' +
                '<select id="wc-bpe-op-pricerange-val" class="wc-bpe-select" style="width: 100%;">' +
                  ['۲ تا ۵ میلیون', '۵ تا ۱۰ میلیون', '۱۰ تا ۱۵ میلیون', '۱۵ تا ۲۰ میلیون', '۲۰ تا ۳۰ میلیون', '۳۰ تا ۴۰ میلیون', '۴۰ تا ۶۰ میلیون', '۶۰ تا ۷۰ میلیون', '۷۰ میلیون به بالا'].map(function(r){ return '<option value="' + r + '" ' + (ops.priceRangeValue === r ? 'selected' : '') + '>' + r + '</option>'; }).join('') +
                '</select>' +
              '</div>' +
            '</div>' +

            // Custom Attributes
            '<div style="grid-column: span 2; background: #fff; padding: 12px; border-radius: 3px; border: 1px solid #e5e5e5;">' +
              '<strong>🎨 سایر ویژگی‌ها (رنگ، سایز، گارانتی، جنس، کشور سازنده و...)</strong>' +
              '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px;">' +
                '<div>' +
                  '<label style="display:block; font-size:11px; margin-bottom:3px;">نوع عملیات:</label>' +
                  '<select id="wc-bpe-op-customattr-action" class="wc-bpe-select" style="width: 100%;">' +
                    '<option value="none" ' + (ops.customAttributeAction === 'none' ? 'selected' : '') + '>بدون تغییر</option>' +
                    '<option value="set_term" ' + (ops.customAttributeAction === 'set_term' ? 'selected' : '') + '>تعیین یا افزودن مقدار مشخص</option>' +
                    '<option value="replace_term" ' + (ops.customAttributeAction === 'replace_term' ? 'selected' : '') + '>یافتن و جایگزینی در مقدار ویژگی</option>' +
                    '<option value="remove" ' + (ops.customAttributeAction === 'remove' ? 'selected' : '') + '>حذف ویژگی</option>' +
                  '</select>' +
                '</div>' +
                '<div>' +
                  '<label style="display:block; font-size:11px; margin-bottom:3px;">نام ویژگی (مثلاً رنگ، سایز، گارانتی):</label>' +
                  '<input type="text" id="wc-bpe-op-customattr-name" class="wc-bpe-input" value="' + escapeHtml(ops.customAttributeName || 'رنگ') + '" style="width: 100%;">' +
                '</div>' +
              '</div>' +
              '<div id="wc-bpe-op-customattr-box" style="margin-top: 8px; ' + (ops.customAttributeAction !== 'none' ? '' : 'display: none;') + '">' +
                '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">' +
                  (ops.customAttributeAction === 'replace_term' ? '<div><label style="display:block; font-size:11px; margin-bottom:3px; color:#d63638;">متن قدیمی جهت جستجو:</label><input type="text" id="wc-bpe-op-customattr-search" class="wc-bpe-input" value="' + escapeHtml(ops.customAttributeSearchValue || '') + '" style="width: 100%;"></div>' : '') +
                  '<div>' +
                    '<label style="display:block; font-size:11px; margin-bottom:3px; color:#107c41;">مقدار جدید ویژگی:</label>' +
                    '<input type="text" id="wc-bpe-op-customattr-val" class="wc-bpe-input" value="' + escapeHtml(ops.customAttributeValue || '') + '" placeholder="مثلاً: ۱۸ ماه گارانتی شرکتی، مشکی مات..." style="width: 100%;">' +
                  '</div>' +
                '</div>' +
              '</div>' +
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
    var html = '<div class="wc-bpe-card">' +
      '<h3>تاریخچه عملیات ویرایش گروهی و بازگردانی (Rollback)</h3>' +
      '<table class="wc-bpe-table" style="margin-top: 15px;">' +
        '<thead>' +
          '<tr>' +
            '<th>شناسه UUID</th>' +
            '<th>تاریخ</th>' +
            '<th>کاربر</th>' +
            '<th>شرح</th>' +
            '<th>وضعیت</th>' +
            '<th>عملیات</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
          '<tr>' +
            '<td><code>f47ac10b...</code></td>' +
            '<td>امروز</td>' +
            '<td>مدیر کل (admin)</td>' +
            '<td>افزایش ۱۰ درصدی قیمت و فعال‌سازی اسنپ‌پی</td>' +
            '<td><span class="badge badge-success">اعمال‌شده</span></td>' +
            '<td><button type="button" class="button button-small wc-bpe-btn-rollback" data-id="f47ac10b">بازگردانی (Rollback)</button></td>' +
          '</tr>' +
        '</tbody>' +
      '</table>' +
    '</div>';
    return html;
  }

  function renderSettingsView() {
    var html = '<div class="wc-bpe-card">' +
      '<h3>تنظیمات و آداپتورهای درگاه‌ها</h3>' +
      '<table class="form-table">' +
        '<tr>' +
          '<th>تعداد در هر دسته (Batch Size):</th>' +
          '<td><input type="number" class="wc-bpe-input" value="20" style="width: 80px;"></td>' +
        '</tr>' +
        '<tr>' +
          '<th>کلید متای اسنپ‌پی:</th>' +
          '<td><input type="text" class="wc-bpe-input" value="_snappay_eligible_product" style="width: 250px;"></td>' +
        '</tr>' +
        '<tr>' +
          '<th>کلید متای ترب:</th>' +
          '<td><input type="text" class="wc-bpe-input" value="_torob_pay_available" style="width: 250px;"></td>' +
        '</tr>' +
      '</table>' +
      '<button type="button" class="wc-bpe-btn wc-bpe-btn-primary" style="margin-top: 15px;">ذخیره تنظیمات</button>' +
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
      if (state.filters.category && p.category !== state.filters.category) return false;
      if (state.filters.brand && p.brand !== state.filters.brand) return false;
      if (state.filters.status && p.status !== state.filters.status) return false;
      if (state.filters.stockStatus && p.stockStatus !== state.filters.stockStatus) return false;
      if (state.filters.type && p.type !== state.filters.type) return false;

      // Preset filters
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

  function bindEvents() {
    // Tab switching
    $('.wc-bpe-tab-btn').on('click', function() {
      state.activeTab = $(this).data('tab');
      render();
    });

    // Preset filter pills
    $('.wc-bpe-preset-btn').on('click', function() {
      state.filters.preset = $(this).data('preset');
      render();
    });

    // Search and filters (Shared for both Table and Wizard Step 1)
    $('#wc-bpe-search, #wc-bpe-wiz-search').on('input', function() {
      state.filters.search = $(this).val();
      render();
    });
    $('#wc-bpe-cat-filter, #wc-bpe-wiz-cat').on('change', function() {
      state.filters.category = $(this).val();
      render();
    });
    $('#wc-bpe-brand-filter, #wc-bpe-wiz-brand').on('change', function() {
      state.filters.brand = $(this).val();
      render();
    });
    $('#wc-bpe-stock-filter, #wc-bpe-wiz-stock').on('change', function() {
      state.filters.stockStatus = $(this).val();
      render();
    });
    $('#wc-bpe-status-filter, #wc-bpe-wiz-status').on('change', function() {
      state.filters.status = $(this).val();
      render();
    });
    $('#wc-bpe-type-filter, #wc-bpe-wiz-type').on('change', function() {
      state.filters.type = $(this).val();
      render();
    });
    $('#wc-bpe-btn-reset-filters, #wc-bpe-wiz-reset-filters').on('click', function() {
      state.filters = { search: '', category: '', brand: '', status: '', stockStatus: '', type: '', preset: 'all' };
      render();
    });

    // Checkbox selection in Table
    $('#wc-bpe-select-all').on('change', function() {
      var filtered = getFilteredProducts();
      if (this.checked) {
        state.selectedIds = filtered.map(function(p) { return p.id; });
      } else {
        state.selectedIds = [];
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

    $('#wc-bpe-deselect-all').on('click', function() {
      state.selectedIds = [];
      render();
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
        if (field === 'regularPrice' || field === 'stockQuantity') {
          prod[field] = parseFloat(val) || 0;
          if (field === 'stockQuantity') prod.stockStatus = prod[field] > 0 ? 'instock' : 'outofstock';
        } else if (field === 'salePrice') {
          prod[field] = val ? parseFloat(val) : null;
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
          description: prod.description || '',
          short_description: prod.shortDescription || '',
          category: prod.category || '',
          brand: prod.brand || '',
          snappay_enabled: prod.snappayEnabled ? '1' : '0',
          torob_pay_enabled: prod.torobPayEnabled ? '1' : '0'
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
            description: prod.description || '',
            short_description: prod.shortDescription || '',
            category: prod.category || '',
            brand: prod.brand || '',
            snappay_enabled: prod.snappayEnabled ? '1' : '0',
            torob_pay_enabled: prod.torobPayEnabled ? '1' : '0'
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
        stockStatusAction: $('#wc-bpe-op-stock-status').val() || 'none',
        snappayAction: $('#wc-bpe-op-snappay').val() || 'none',
        torobPayAction: $('#wc-bpe-op-torob').val() || 'none',
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
        state.opSettings.stockStatusAction !== 'none' ||
        state.opSettings.snappayAction !== 'none' ||
        state.opSettings.torobPayAction !== 'none' ||
        state.opSettings.brandAction !== 'none' ||
        state.opSettings.priceRangeAction !== 'none' ||
        state.opSettings.customAttributeAction !== 'none'
      );

      if (!hasAnyOp) {
        alert('لطفاً حداقل یک تغییر (مثلاً قیمت، برند، ویژگی یا وضعیت) را از حالت «بدون تغییر» خارج کنید.');
        return;
      }

      state.previews = [];
      state.selectedIds.forEach(function(id) {
        var prod = state.products.find(function(p) { return p.id === id; });
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

        // Stock Status
        if (state.opSettings.stockStatusAction !== 'none') {
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
      render();
    });

    // Rollback button
    $('.wc-bpe-btn-rollback').on('click', function() {
      var opId = $(this).data('id');
      if (!confirm('آیا از بازگردانی (Rollback) این عملیات اطمینان دارید؟')) return;
      var $b = $(this).text('در حال بازگردانی...');
      $.ajax({
        url: wcBpeData.ajaxUrl,
        type: 'POST',
        data: {
          action: 'wc_bpe_rollback_operation',
          nonce: wcBpeData.nonce,
          operation_id: opId
        },
        success: function(res) {
          alert('عملیات با موفقیت بازگردانی شد.');
          fetchProducts();
        },
        error: function() {
          alert('خطا در بازگردانی.');
          $b.text('بازگردانی (Rollback)');
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

      stock_status_action: state.opSettings.stockStatusAction,
      stockStatusAction: state.opSettings.stockStatusAction,

      snappay_action: state.opSettings.snappayAction,
      snappayAction: state.opSettings.snappayAction,

      torob_pay_action: state.opSettings.torobPayAction,
      torobPayAction: state.opSettings.torobPayAction,

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
    fetchProducts();
  });
})(jQuery);
`;
