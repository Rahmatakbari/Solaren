# 🚀 Solaren - راهنمای اجرا

## ✅ ۳ روش برای اجرا

### روش ۱: سرور محلی (بهترین)
```bash
cd /home/user/solar-estimator
python3 -m http.server 8000
# باز کردن: http://localhost:8000
```

### روش ۲: بدون Service Worker (تست)
```bash
# باز کردن: http://localhost:8000/solaren.html
# این فایل SW را غیرفعال می‌کند - تست تمیز
```

### روش ۳: در موبایل (PWA نصب شده)
- **قبل از هر تست:** در Chrome گوشی:
  1. منوی **⋮** (سه نقطه)
  2. **Settings**
  3. **Privacy and security**
  4. **Clear browsing data**
  5. تیک **Cached images and files** را بزنید
  6. **Clear data**

## 🐛 رفع مشکل صفحه زرد

اگر صفحه زرد رنگ ماند (splash screen) و محتوا نمایش داده نشد:

1. **پاک کردن Cache مرورگر** (بالا)
2. **بستن و باز کردن Chrome**
3. اگر حل نشد: **Force Stop Chrome** از تنظیمات گوشی
4. **سپس** دوباره باز کنید

## 📱 تست سریع

- **فایل `solaren.html`** بدون Service Worker = تست تمیز
- **فایل `index.html`** با Service Worker = نسخه PWA کامل

## 🆘 مشکل همچنان باقیست؟

1. مرورگر را به آخرین نسخته به‌روز کنید
2. JavaScript را فعال کنید
3. اگر در اپلیکیشن QuickEdit باز می‌شود، **از Chrome/Edge** استفاده کنید
