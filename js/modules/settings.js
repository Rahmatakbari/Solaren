/**
 * Settings v3 — Production ready
 */
import { Utils } from '../utils.js';
import { toast, modal } from '../ui.js';
import { settings, projects, invoices, customers, store } from '../store.js';

export const settingsView = {
    name: 'settings',
    path: '#settings',

    state: {
        company: settings.get('company', 'Solaren Pro'),
        phone: settings.get('phone', ''),
        address: settings.get('address', ''),
        currency: settings.get('currency', '$'),
        taxRate: settings.get('taxRate', 0),
        language: settings.get('language', 'fa'),
        notifications: settings.get('notifications', true),
        electricityPrice: settings.get('electricityPrice', 0.10),
        inflation: settings.get('inflation', 3)
    },

    render() {
        return `
            <h1 class="page-title anim-fade-up">تنظیمات</h1>
            <p class="page-subtitle anim-fade-up">شخصی‌سازی برنامه و اطلاعات شرکت</p>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--sun">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33"/></svg>
                    </div>
                    <div>
                        <div class="card__title">اطلاعات شرکت</div>
                        <div class="card__subtitle">برای صدور انوایس حرفه‌ای</div>
                    </div>
                </div>
                <div class="field">
                    <label class="field__label">نام شرکت</label>
                    <input type="text" class="input" name="company" value="${Utils.escapeHTML(this.state.company)}" placeholder="نام شرکت یا فروشگاه">
                </div>
                <div class="field">
                    <label class="field__label">تلفن</label>
                    <input type="tel" class="input" name="phone" value="${Utils.escapeHTML(this.state.phone)}" placeholder="۰۷xxxxxxxxx">
                </div>
                <div class="field">
                    <label class="field__label">آدرس</label>
                    <textarea class="textarea" name="address" placeholder="آدرس دفتر مرکزی">${Utils.escapeHTML(this.state.address)}</textarea>
                </div>
                <button class="btn btn--primary btn--block" data-action="save-company">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    ذخیره اطلاعات
                </button>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">💰 مالی و اقتصاد</h2>
                </div>
                <div class="field">
                    <label class="field__label">واحد پول</label>
                    <select class="select" name="currency">
                        <option value="$" ${this.state.currency === '$' ? 'selected' : ''}>دلار ($)</option>
                        <option value="AFN" ${this.state.currency === 'AFN' ? 'selected' : ''}>افغانی (AFN)</option>
                        <option value="€" ${this.state.currency === '€' ? 'selected' : ''}>یورو (€)</option>
                        <option value="IRR" ${this.state.currency === 'IRR' ? 'selected' : ''}>ریال (IRR)</option>
                    </select>
                </div>
                <div class="field">
                    <label class="field__label">نرخ مالیات بر ارزش افزوده (%)</label>
                    <div class="input-slider">
                        <input type="range" name="taxRate" min="0" max="20" step="0.5" value="${this.state.taxRate}">
                        <input type="number" class="input" name="taxRateV" min="0" max="20" step="0.5" value="${this.state.taxRate}">
                    </div>
                    <p class="field__hint">${this.state.taxRate > 0 ? `مالیات ${Utils.toPersian(this.state.taxRate)}% به انوایس‌ها اضافه می‌شود` : 'بدون مالیات'}</p>
                </div>
                <div class="field">
                    <label class="field__label">قیمت برق ($/kWh)</label>
                    <input type="number" class="input" name="electricityPrice" min="0.01" step="0.01" value="${this.state.electricityPrice}">
                    <p class="field__hint">برای محاسبه ROI و بازگشت سرمایه</p>
                </div>
                <div class="field">
                    <label class="field__label">نرخ تورم سالانه برق (%)</label>
                    <input type="number" class="input" name="inflation" min="0" max="20" step="0.5" value="${this.state.inflation}">
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">🔔 اعلان‌ها</h2>
                </div>
                <div class="list">
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                        </div>
                        <div class="list-item__body">
                            <div class="list-item__title">اعلان‌های سیستم</div>
                            <div class="list-item__subtitle">پیام‌های موفقیت و خطا</div>
                        </div>
                        <label class="toggle">
                            <input type="checkbox" name="notifications" ${this.state.notifications ? 'checked' : ''}>
                            <span class="toggle__track"><span class="toggle__thumb"></span></span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">💾 پشتیبان‌گیری</h2>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);">
                    <button class="btn btn--secondary" data-action="export">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        خروجی
                    </button>
                    <button class="btn btn--secondary" data-action="import">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        ورود
                    </button>
                </div>
                <div style="margin-top:var(--space-3);display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);">
                    <button class="btn btn--secondary" data-action="clear-cache">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                        پاک کردن کش
                    </button>
                    <button class="btn btn--secondary" data-action="reset" style="color:var(--color-red-400);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
                        حذف همه
                    </button>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">📊 آمار ذخیره‌سازی</h2>
                </div>
                <div class="list">
                    <div class="list-item" style="cursor:default;"><div class="list-item__body"><div class="list-item__title">پروژه‌ها</div></div><span style="font-weight:700;color:var(--color-sun-300);">${Utils.toPersian(projects.list().length)}</span></div>
                    <div class="list-item" style="cursor:default;"><div class="list-item__body"><div class="list-item__title">انوایس‌ها</div></div><span style="font-weight:700;color:var(--color-violet-400);">${Utils.toPersian(invoices.list().length)}</span></div>
                    <div class="list-item" style="cursor:default;"><div class="list-item__body"><div class="list-item__title">مشتریان</div></div><span style="font-weight:700;color:var(--color-emerald-400);">${Utils.toPersian(customers.list().length)}</span></div>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">درباره برنامه</h2>
                </div>
                <div style="font-size:var(--font-size-sm);color:var(--color-text-muted);line-height:1.8;">
                    <p style="color:var(--color-text);font-weight:700;font-size:var(--font-size-md);display:flex;align-items:center;gap:var(--space-2);">
                        <span style="width:32px;height:32px;border-radius:var(--radius-sm);background:var(--gradient-sun);display:inline-flex;align-items:center;justify-content:center;">☀️</span>
                        Solaren Pro
                    </p>
                    <p>نسخه ۳.۰ — Solaren Pro</p>
                    <p style="margin-top:var(--space-2);font-size:var(--font-size-xs);">نرم‌افزار حرفه‌ای محاسبات سولر با الگوریتم‌های استاندارد NREL</p>
                    <p style="margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--color-border);">© ۱۴۰۵ — تمامی حقوق محفوظ است</p>
                </div>
            </div>
        `;
    },

    attach() {
        const view = document.getElementById('view');
        if (!view) return;

        const updateField = (name, value) => {
            this.state[name] = value;
            settings.set(name, value);
        };

        view.querySelector('[name="company"]')?.addEventListener('change', (e) => updateField('company', e.target.value));
        view.querySelector('[name="phone"]')?.addEventListener('change', (e) => updateField('phone', e.target.value));
        view.querySelector('[name="address"]')?.addEventListener('change', (e) => updateField('address', e.target.value));
        view.querySelector('[name="currency"]')?.addEventListener('change', (e) => { updateField('currency', e.target.value); toast.success('ذخیره شد'); });
        view.querySelector('[name="notifications"]')?.addEventListener('change', (e) => { updateField('notifications', e.target.checked); toast.success('ذخیره شد'); });
        view.querySelector('[name="electricityPrice"]')?.addEventListener('change', (e) => { updateField('electricityPrice', parseFloat(e.target.value) || 0.1); });
        view.querySelector('[name="inflation"]')?.addEventListener('change', (e) => { updateField('inflation', parseFloat(e.target.value) || 0); });

        const taxRange = view.querySelector('[name="taxRate"]');
        const taxValue = view.querySelector('[name="taxRateV"]');
        if (taxRange && taxValue) {
            taxRange.addEventListener('input', () => { taxValue.value = taxRange.value; updateField('taxRate', parseFloat(taxRange.value)); });
            taxValue.addEventListener('input', () => { taxRange.value = taxValue.value; updateField('taxRate', parseFloat(taxValue.value)); });
            taxRange.addEventListener('change', () => toast.success('ذخیره شد'));
            taxValue.addEventListener('change', () => toast.success('ذخیره شد'));
        }

        view.querySelector('[data-action="save-company"]')?.addEventListener('click', () => toast.success('اطلاعات شرکت ذخیره شد'));

        view.querySelector('[data-action="export"]')?.addEventListener('click', () => this._export());
        view.querySelector('[data-action="import"]')?.addEventListener('click', () => this._import());
        view.querySelector('[data-action="clear-cache"]')?.addEventListener('click', async () => {
            if ('serviceWorker' in navigator) {
                const reg = await navigator.serviceWorker.getRegistration();
                reg?.active?.postMessage({ type: 'CLEAR_CACHE' });
            }
            toast.success('کش پاک شد');
            setTimeout(() => location.reload(), 800);
        });
        view.querySelector('[data-action="reset"]')?.addEventListener('click', async () => {
            const ok = await modal.confirm({
                title: 'حذف همه داده‌ها',
                message: 'این عملیات تمام پروژه‌ها، انوایس‌ها و مشتریان را حذف می‌کند. مطمئن هستید؟',
                danger: true,
                confirmText: 'حذف همه'
            });
            if (ok) {
                projects.clear(); invoices.clear(); customers.clear();
                toast.success('همه داده‌ها حذف شدند');
                this._refresh();
            }
        });
    },

    _export() {
        try {
            const data = {
                version: '3.0',
                exportedAt: new Date().toISOString(),
                settings: settings.all(),
                projects: projects.list(),
                invoices: invoices.list(),
                customers: customers.list()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `solar-backup-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('فایل پشتیبان دانلود شد');
        } catch (e) {
            toast.error('خطا در خروجی: ' + e.message);
        }
    },

    _import() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                if (data.projects && Array.isArray(data.projects)) {
                    data.projects.forEach((p) => projects.save(p));
                }
                if (data.invoices && Array.isArray(data.invoices)) {
                    data.invoices.forEach((i) => invoices.save(i));
                }
                if (data.customers && Array.isArray(data.customers)) {
                    data.customers.forEach((c) => customers.save(c));
                }
                if (data.settings && typeof data.settings === 'object') {
                    Object.entries(data.settings).forEach(([k, v]) => settings.set(k, v));
                }
                toast.success('داده‌ها با موفقیت وارد شدند');
                setTimeout(() => location.reload(), 1000);
            } catch (err) {
                toast.error('فایل نامعتبر است: ' + err.message);
            }
        };
        input.click();
    },

    _refresh() {
        const view = document.getElementById('view');
        if (view) { view.innerHTML = this.render(); this.attach(); }
    }
};
