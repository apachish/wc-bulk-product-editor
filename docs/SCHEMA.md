# مستندات دیتابیس و پایگاه داده (Database Schema)

افزونه از ۲ جدول اختصاصی برای تضمین سلامت داده‌ها، بدون هیچ‌گونه سربار روی جداول پیش‌فرض `wp_posts` یا `wp_postmeta`، استفاده می‌کند:

## جدول ۱: `wp_wc_bpe_operations`
ثبت متادیتای کلی هر سناریوی ویرایش گروهی:
- `id` (VARCHAR 36): شناسه یکتای UUID عملیات (مانند `c89f2a41-...`)
- `user_id` (BIGINT UNSIGNED): شناسه کاربری مدیر اجراکننده
- `status` (VARCHAR 20): وضعیت (`completed`، `rolled_back`، `failed`)
- `total_items` (INT): تعداد کل اقلام هدف
- `success_count` (INT): تعداد موارد با اعمال موفق
- `fail_count` (INT): تعداد خطاها در اجرا
- `filters_payload` (LONGTEXT JSON): معیارهای فیلتر مورد استفاده
- `changes_payload` (LONGTEXT JSON): قواعد تغییرات اعمال‌شده
- `created_at` (DATETIME): زمان دقیق اجرا
- `rolled_back_at` (DATETIME NULL): زمان بازگردانی در صورت Rollback

---

## جدول ۲: `wp_wc_bpe_operation_items`
ثبت اسنپ‌شات جزءبه‌جزء هر محصول پیش از تغییر و پس از تغییر:
- `id` (BIGINT UNSIGNED AUTO_INCREMENT): کلید اصلی
- `operation_id` (VARCHAR 36): کلید خارجی متصل به عملیات
- `product_id` (BIGINT UNSIGNED): شناسه محصول یا متغیر
- `parent_id` (BIGINT UNSIGNED NULL): شناسه محصول والد (در صورت تنوع محصول)
- `sku` (VARCHAR 100): کد محصول
- `before_snapshot` (LONGTEXT JSON): وضعیت دقیق فیلدها قبل از تغییر
- `after_snapshot` (LONGTEXT JSON): وضعیت دقیق فیلدها پس از تغییر
- `is_rolled_back` (TINYINT 1): پرچم نشان‌دهنده بازگردانی مجزای این رکورد
- `error_message` (TEXT NULL): متن خطای رخ‌داده در صورت شکست
