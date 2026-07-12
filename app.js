/**
 * Solaren v5.0 — App Entry
 */
import { router } from './router.js';
import { toast } from './ui.js';

import { home } from './modules/home.js';
import { welcome } from './modules/welcome.js';
import { quickEstimate } from './modules/quick-estimate.js';
import { detailedEstimate } from './modules/detailed-estimate.js';
import { panels } from './modules/panels.js';
import { inverters } from './modules/inverters.js';
import { batteries } from './modules/batteries.js';
import { vfd } from './modules/vfd.js';
import { accessories } from './modules/accessories.js';
import { solarCalc } from './modules/solar-calc.js';
import { wireCalc } from './modules/wire-calc.js';
import { batteryCalc } from './modules/battery-calc.js';
import { tiltCalc } from './modules/tilt-calc.js';
import { projectsView } from './modules/projects.js';
import { customersView } from './modules/customers.js';
import { invoicesView } from './modules/invoices.js';
import { reports } from './modules/reports.js';
import { settingsView } from './modules/settings.js';
import { shading } from './modules/shading.js';
import { compare } from './modules/compare.js';
import { maintenance } from './modules/maintenance.js';
import { bom } from './modules/bom.js';
import { financial } from './modules/financial.js';
import { designer } from './modules/designer.js';
import { monitoring } from './modules/monitoring.js';
import { teamView } from './modules/team.js';
import { language } from './modules/language.js';
import { calendar } from './modules/calendar.js';
import { paymentsView } from './modules/payments.js';
import { proReport } from './modules/pro-report.js';
import { notifCenter, NotifSystem } from './modules/notifications.js';
import { crm } from './modules/crm.js';
import { analytics } from './modules/analytics.js';
import { projectMap } from './modules/map.js';
import { aiAssistant } from './modules/ai-assistant.js';
import { recommender } from './modules/recommender.js';
import { commandPalette } from './modules/command-palette.js';
import { theme } from './modules/theme.js';
import { analyticsDashboard } from './modules/analytics-dashboard.js';
import { currency } from './modules/currency.js';
import { notes } from './modules/notes.js';
import { solarTest } from './modules/solar-test.js';
import { demo } from './modules/demo.js';
import { rates } from './modules/rates.js';
import { solarLive } from './modules/solar-live.js';
import { projects, settings } from './store.js';

// Export globally for use in modules
window.NotifSystem = NotifSystem;

class App {
    constructor() {
        this.deferredPrompt = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;

        // حذف loading state فقط بعد از render اول
        setTimeout(() => {
            const loadingState = document.getElementById('loadingState');
            if (loadingState) loadingState.remove();
        }, 100);

        this._hideSplash();
        this._registerSW();
        this._registerRoutes();
        this._bindShell();
        this._bindInstallPrompt();
        this._monitorConnectivity();
        this._updateSidebarCounts();
        router.start();

        // تم و میانبرها
        theme.init();
        commandPalette.init();

        // Run system checks (notifications) after 3s
        setTimeout(() => {
            try { NotifSystem.runChecks(); } catch (e) { console.warn('NotifSystem failed', e); }
        }, 3000);

        // Periodic checks every 5 min
        setInterval(() => {
            try { NotifSystem.runChecks(); } catch (e) { /* silent */ }
        }, 5 * 60 * 1000);
    }

    _hideSplash() {
        setTimeout(() => {
            const splash = document.getElementById('splash');
            if (splash) splash.classList.add('is-hidden');
        }, 1500);
    }

    async _registerSW() {
        if (!('serviceWorker' in navigator)) return;
        try {
            const reg = await navigator.serviceWorker.register('./sw.js');
            reg.addEventListener('updatefound', () => {
                const nw = reg.installing;
                if (!nw) return;
                nw.addEventListener('statechange', () => {
                    if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                        toast.info('نسخه جدید — در حال به‌روزرسانی...');
                        nw.postMessage({ type: 'SKIP_WAITING' });
                    }
                });
            });
        } catch (e) { console.warn('[App] SW failed', e); }
    }

    _registerRoutes() {
        // استفاده از WeakSet برای ردیابی ماژول‌های attach شده
        const attachedModules = new WeakSet();

        // Helper برای re-render امن
        const rerender = (mod) => {
            const view = document.getElementById('view');
            if (view) {
                view.innerHTML = mod.render();
                // فقط اگر قبلاً attach نشده، attach کن
                if (mod.attach && !attachedModules.has(mod)) {
                    attachedModules.add(mod);
                    setTimeout(() => mod.attach(), 0);
                }
            }
        };

        // Global برای استفاده در ماژول‌ها
        window.rerender = rerender;

        const wrap = (mod) => () => {
            const html = mod.render();
            setTimeout(() => {
                if (mod.attach && !attachedModules.has(mod)) {
                    attachedModules.add(mod);
                    mod.attach();
                }
            }, 0);
            return html;
        };

        router
            .register(home.name, home.path, wrap(home))
            .register(welcome.name, welcome.path, wrap(welcome))
            .register(quickEstimate.name, quickEstimate.path, wrap(quickEstimate))
            .register(detailedEstimate.name, detailedEstimate.path, wrap(detailedEstimate))
            .register(panels.name, panels.path, wrap(panels))
            .register(inverters.name, inverters.path, wrap(inverters))
            .register(batteries.name, batteries.path, wrap(batteries))
            .register(vfd.name, vfd.path, wrap(vfd))
            .register(accessories.name, accessories.path, wrap(accessories))
            .register(solarCalc.name, solarCalc.path, wrap(solarCalc))
            .register(wireCalc.name, wireCalc.path, wrap(wireCalc))
            .register(batteryCalc.name, batteryCalc.path, wrap(batteryCalc))
            .register(tiltCalc.name, tiltCalc.path, wrap(tiltCalc))
            .register(projectsView.name, projectsView.path, wrap(projectsView))
            .register(customersView.name, customersView.path, wrap(customersView))
            .register(invoicesView.name, invoicesView.path, wrap(invoicesView))
            .register(reports.name, reports.path, wrap(reports))
            .register(settingsView.name, settingsView.path, wrap(settingsView))
            .register(shading.name, shading.path, wrap(shading))
            .register(compare.name, compare.path, wrap(compare))
            .register(maintenance.name, maintenance.path, wrap(maintenance))
            .register(bom.name, bom.path, wrap(bom))
            .register(financial.name, financial.path, wrap(financial))
            .register(designer.name, designer.path, wrap(designer))
            .register(monitoring.name, monitoring.path, wrap(monitoring))
            .register(teamView.name, teamView.path, wrap(teamView))
            .register(language.name, language.path, wrap(language))
            .register(calendar.name, calendar.path, wrap(calendar))
            .register(paymentsView.name, paymentsView.path, wrap(paymentsView))
            .register(proReport.name, proReport.path, wrap(proReport))
            .register(notifCenter.name, notifCenter.path, wrap(notifCenter))
            .register(crm.name, crm.path, wrap(crm))
            .register(analytics.name, analytics.path, wrap(analytics))
            .register(projectMap.name, projectMap.path, wrap(projectMap))
            .register(aiAssistant.name, aiAssistant.path, wrap(aiAssistant))
            .register(recommender.name, recommender.path, wrap(recommender))
            .register(analyticsDashboard.name, analyticsDashboard.path, wrap(analyticsDashboard))
            .register(currency.name, currency.path, wrap(currency))
            .register(notes.name, notes.path, wrap(notes))
            .register(solarTest.name, solarTest.path, wrap(solarTest))
            .register(demo.name, demo.path, wrap(demo))
            .register(rates.name, rates.path, wrap(rates))
            .register(solarLive.name, solarLive.path, wrap(solarLive));
    }

    _bindShell() {
        const menu = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        const close = () => {
            sidebar?.classList.remove('is-open');
            menu?.setAttribute('aria-expanded', 'false');
            sidebar?.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };
        const open = () => {
            sidebar?.classList.add('is-open');
            menu?.setAttribute('aria-expanded', 'true');
            sidebar?.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        };

        menu?.addEventListener('click', () => sidebar?.classList.contains('is-open') ? close() : open());
        sidebar?.querySelectorAll('[data-close-sidebar]').forEach((el) => el.addEventListener('click', close));
        sidebar?.querySelectorAll('.sidebar__link').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                if (route) location.hash = '#' + route;
                close();
            });
        });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sidebar?.classList.contains('is-open')) close(); });

        // دکمه جستجو
        document.getElementById('searchBtn')?.addEventListener('click', () => commandPalette.open());
        // دکمه تغییر تم
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            const next = theme.cycle();
            this._updateThemeIcon(next);
            const labels = { dark: '🌙 تاریک', light: '☀️ روشن', system: '💻 سیستم' };
            toast.success(`تم: ${labels[next]}`);
        });
        // تنظیم آیکون اولیه
        this._updateThemeIcon(theme.current);
    }

    _updateThemeIcon(current) {
        const icon = document.getElementById('themeIcon');
        if (icon) {
            const icons = { dark: '🌙', light: '☀️', system: '💻' };
            icon.textContent = icons[current] || '🌙';
        }
    }

    _bindInstallPrompt() {
        const btn = document.getElementById('installBtn');
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            if (btn) btn.hidden = false;
        });
        btn?.addEventListener('click', async () => {
            if (!this.deferredPrompt) return;
            btn.hidden = true;
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            if (outcome === 'accepted') toast.success('اپلیکیشن نصب شد');
            this.deferredPrompt = null;
        });
        window.addEventListener('appinstalled', () => toast.success('Solaren نصب شد'));
    }

    _monitorConnectivity() {
        const banner = document.getElementById('offlineBanner');
        const update = () => banner.hidden = navigator.onLine;
        window.addEventListener('online', () => { update(); toast.success('اتصال برقرار شد'); });
        window.addEventListener('offline', () => { update(); toast.warning('اتصال قطع شد'); });
        update();
    }

    _updateSidebarCounts() {
        const el = document.getElementById('projCountSidebar');
        if (el) el.textContent = Utils.toPersian(projects.list().length);
        // Show welcome on first run (only if no projects exist and welcome not seen)
        const hash = location.hash;
        if (!settings.get('welcomeShown') && projects.list().length === 0 && (hash === '#home' || hash === '' || hash === '#')) {
            setTimeout(() => {
                if (location.hash === hash) location.hash = '#welcome';
            }, 2500);
        }
    }
}

import { Utils } from './utils.js';

// مدیریت خطای سراسری
window.addEventListener('error', (e) => {
    console.error('Solaren Error:', e.error);
    const loading = document.getElementById('loadingState');
    if (loading) {
        loading.innerHTML = `
            <div style="padding:40px 20px;text-align:center;">
                <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
                <h2 style="color:#ef4444;font-size:18px;margin-bottom:8px;">خطا در بارگذاری</h2>
                <p style="color:var(--color-text-muted);font-size:14px;margin-bottom:12px;">${e.message || 'خطای ناشناخته'}</p>
                <button onclick="location.reload()" style="background:#f59e0b;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;">تلاش مجدد</button>
            </div>
        `;
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Solaren Promise Rejection:', e.reason);
});

try {
    const app = new App();
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => app.init());
    } else {
        app.init();
    }
    window.app = app;
} catch (e) {
    console.error('App init failed:', e);
    const loading = document.getElementById('loadingState');
    if (loading) {
        loading.innerHTML = `
            <div style="padding:40px 20px;text-align:center;">
                <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
                <h2 style="color:#ef4444;font-size:18px;margin-bottom:8px;">خطا در راه‌اندازی</h2>
                <p style="color:var(--color-text-muted);font-size:14px;">${e.message}</p>
            </div>
        `;
    }
}
