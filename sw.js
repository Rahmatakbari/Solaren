/**
 * Service Worker — Solar Estimator Pro
 * ES5 Compatible
 */
var SW_VERSION = 'v8.0.3';
var STATIC_CACHE = 'solar-static-' + SW_VERSION;
var RUNTIME_CACHE = 'solar-runtime-' + SW_VERSION;

// لیست فایل‌های ES5 برای cache
var APP_SHELL = [
    './',
    './index.html',
    './solaren.html',
    './manifest.json',
    './clear-cache.html',
    // CSS
    './css/v6-design.css',
    './css/variables.css',
    './css/reset.css',
    './css/base.css',
    './css/v6-components.css',
    './css/v6-layout.css',
    './css/components.css',
    './css/layout.css',
    './css/forms.css',
    './css/animations.css',
    './css/responsive.css',
    './css/command-palette.css',
    './css/calendar.css',
    './css/solar-live.css',
    './css/enhancements.css',
    // JS ES5 (نسخه ترجمه‌شده)
    './js-es5/app.js',
    './js-es5/router.js',
    './js-es5/store.js',
    './js-es5/ui.js',
    './js-es5/utils.js',
    './js-es5/calc.js',
    // Data
    './js-es5/data/panels.js',
    './js-es5/data/inverters.js',
    './js-es5/data/batteries.js',
    './js-es5/data/vfd.js',
    './js-es5/data/accessories.js',
    './js-es5/data/locations.js',
    './js-es5/data/appliances.js',
    './js-es5/data/shading.js',
    './js-es5/data/bom-rules.js',
    './js-es5/data/translations.js',
    './js-es5/data/inverter-programs.js',
    './js-es5/data/knowledge-base.js',
    './js-es5/data/recommender.js',
    './js-es5/data/persian-calendar.js',
    './js-es5/data/currencies.js',
    './js-es5/data/demo-data.js',
    './js-es5/data/solar-simulator.js',
    './js-es5/data/afghanistan-rates.js',
    // Modules
    './js-es5/modules/home.js',
    './js-es5/modules/quick-estimate.js',
    './js-es5/modules/detailed-estimate.js',
    './js-es5/modules/panels.js',
    './js-es5/modules/inverters.js',
    './js-es5/modules/batteries.js',
    './js-es5/modules/vfd.js',
    './js-es5/modules/accessories.js',
    './js-es5/modules/solar-calc.js',
    './js-es5/modules/wire-calc.js',
    './js-es5/modules/battery-calc.js',
    './js-es5/modules/tilt-calc.js',
    './js-es5/modules/welcome.js',
    './js-es5/modules/customers.js',
    './js-es5/modules/shading.js',
    './js-es5/modules/compare.js',
    './js-es5/modules/maintenance.js',
    './js-es5/modules/bom.js',
    './js-es5/modules/financial.js',
    './js-es5/modules/designer.js',
    './js-es5/modules/monitoring.js',
    './js-es5/modules/team.js',
    './js-es5/modules/language.js',
    './js-es5/modules/calendar.js',
    './js-es5/modules/payments.js',
    './js-es5/modules/pro-report.js',
    './js-es5/modules/notifications.js',
    './js-es5/modules/crm.js',
    './js-es5/modules/analytics.js',
    './js-es5/modules/map.js',
    './js-es5/modules/projects.js',
    './js-es5/modules/invoices.js',
    './js-es5/modules/reports.js',
    './js-es5/modules/settings.js',
    './js-es5/modules/ai-assistant.js',
    './js-es5/modules/recommender.js',
    './js-es5/modules/theme.js',
    './js-es5/modules/command-palette.js',
    './js-es5/modules/charts.js',
    './js-es5/modules/data-io.js',
    './js-es5/modules/analytics-dashboard.js',
    './js-es5/modules/currency.js',
    './js-es5/modules/notes.js',
    './js-es5/modules/solar-test.js',
    './js-es5/modules/demo.js',
    './js-es5/modules/solar-live.js',
    './js-es5/modules/rates.js',
    // Utils
    './js-es5/utils/print.js',
    // Icons
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png'
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(STATIC_CACHE)
            .then(function(c) { return c.addAll(APP_SHELL).catch(function() { return null; }); })
            .then(function() { return self.skipWaiting(); })
    );
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys()
            .then(function(keys) {
                return Promise.all(keys.filter(function(k) { return k.indexOf(SW_VERSION) === -1; }).map(function(k) { return caches.delete(k); }));
            })
            .then(function() { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function(e) {
    var request = e.request;
    if (request.method !== 'GET') return;
    var url = new URL(request.url);
    if (url.origin !== location.origin) return;
    if (request.mode === 'navigate') {
        e.respondWith(networkFirst(request));
    } else {
        e.respondWith(cacheFirst(request));
    }
});

function cacheFirst(request) {
    return caches.match(request).then(function(cached) {
        if (cached) {
            // پس‌زمینه به‌روزرسانی
            fetch(request).then(function(r) {
                if (r && r.ok) {
                    caches.open(STATIC_CACHE).then(function(c) { return c.put(request, r.clone()); });
                }
            }).catch(function() {});
            return cached;
        }
        return fetch(request).then(function(r) {
            if (r && r.ok) {
                var clone = r.clone();
                caches.open(STATIC_CACHE).then(function(c) { return c.put(request, clone); });
            }
            return r;
        }).catch(function() {
            return new Response('Offline', { status: 503 });
        });
    });
}

function networkFirst(request) {
    return fetch(request).then(function(r) {
        if (r && r.ok) {
            var clone = r.clone();
            caches.open(RUNTIME_CACHE).then(function(c) { return c.put(request, clone); });
        }
        return r;
    }).catch(function() {
        return caches.match(request).then(function(cached) {
            if (cached) return cached;
            return caches.match('./index.html').then(function(fb) {
                return fb || new Response('Offline', { status: 503 });
            });
        });
    });
}

self.addEventListener('message', function(e) {
    var d = e.data || {};
    if (d.type === 'SKIP_WAITING') self.skipWaiting();
    if (d.type === 'CLEAR_CACHE') {
        caches.keys().then(function(keys) {
            return Promise.all(keys.map(function(k) { return caches.delete(k); }));
        });
    }
});
