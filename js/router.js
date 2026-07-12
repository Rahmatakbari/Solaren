/**
 * Hash router with route registration and lazy module loading.
 */
import { Utils } from './utils.js';

class Router {
    constructor() {
        this.routes = new Map();
        this.currentName = null;
    }

    register(name, path, handler) {
        this.routes.set(name, { path, handler });
        return this;
    }

    navigate(nameOrHash) {
        if (nameOrHash.startsWith('#')) location.hash = nameOrHash;
        else if (this.routes.has(nameOrHash)) location.hash = this.routes.get(nameOrHash).path;
    }

    start() {
        window.addEventListener('hashchange', () => this._handle());
        if (!location.hash) location.hash = '#home';
        else this._handle();
    }

    async _handle() {
        const hash = location.hash || '#home';
        let route = null, name = null;
        for (const [n, r] of this.routes) {
            if (r.path === hash) { name = n; route = r; break; }
        }
        if (!route) { location.hash = '#home'; return; }

        this.currentName = name;
        const view = document.getElementById('view');
        if (view) view.style.opacity = '0.4';

        try {
            const result = await route.handler();
            if (view) {
                if (typeof result === 'string') view.innerHTML = result;
                else if (result && typeof result === 'object') {
                    view.innerHTML = result.html || '';
                    if (typeof result.attach === 'function') requestAnimationFrame(() => result.attach());
                }
                view.style.opacity = '1';
            }
            this._setActiveLinks(name);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            console.error('[Router] error', e);
            if (view) {
                view.innerHTML = `<div class="empty"><div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><h2 class="empty__title">خطایی رخ داد</h2><p class="empty__text">${Utils.escapeHTML(e.message || 'خطای ناشناخته')}</p></div>`;
                view.style.opacity = '1';
            }
        }
    }

    _setActiveLinks(name) {
        document.querySelectorAll('[data-route]').forEach((link) => {
            const r = link.getAttribute('data-route');
            link.classList.toggle('is-active', r === name);
        });
        // Update header title
        const titles = {
            home: 'Solaren',
            welcome: 'خوش آمدید',
            'quick-estimate': 'برآورد سریع',
            'detailed-estimate': 'برآورد تفصیلی',
            panels: 'پنل‌های خورشیدی',
            inverters: 'انورترها',
            batteries: 'باتری‌ها',
            vfd: 'درایو VFD',
            accessories: 'لوازم جانبی',
            'solar-calc': 'ماشین‌حساب سولر',
            'wire-calc': 'محاسبه کابل',
            'battery-calc': 'محاسبه باتری',
            'tilt-calc': 'محاسبه شیب',
            shading: 'تحلیل سایه',
            compare: 'مقایسه تجهیزات',
            maintenance: 'برنامه نگهداری',
            bom: 'لیست تجهیزات (BOM)',
            financial: 'تحلیل مالی',
            designer: 'طراح بصری',
            monitoring: 'مانیتورینگ تولید',
            team: 'مدیریت تیم',
            language: 'انتخاب زبان',
            calendar: 'تقویم و وظایف',
            payments: 'مدیریت پرداخت',
            'pro-report': 'گزارش حرفه‌ای',
            notifications: 'مرکز اعلان‌ها',
            crm: 'CRM و وفاداری',
            analytics: 'تحلیل داده',
            map: 'نقشه پروژه‌ها',
            projects: 'پروژه‌ها',
            customers: 'مشتریان',
            invoices: 'انوایس‌ها',
            reports: 'گزارش‌ها',
            settings: 'تنظیمات'
        };
        const titleEl = document.getElementById('headerTitle');
        if (titleEl && titles[name]) titleEl.textContent = titles[name];
        document.title = `${titles[name] || 'Solaren'} — Solaren Pro`;
    }
}

export const router = new Router();
