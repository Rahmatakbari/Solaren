/**
 * Detailed Estimate v3 — Production ready with live calculation
 */
import { Utils } from '../utils.js';
import { toast, modal } from '../ui.js';
import { LOCATIONS } from '../data/locations.js';
import { APPLIANCES } from '../data/appliances.js';
import { fullSystemSizing, formatSizingResult } from '../calc.js';
import { projects } from '../store.js';

export const detailedEstimate = {
    name: 'detailed-estimate',
    path: '#detailed-estimate',

    state: {
        appliances: [],
        location: 'kabul',
        systemType: 'hybrid',
        backupHours: 4,
        panelWatt: 550
    },

    render() {
        return `
            <h1 class="page-title anim-fade-up">برآورد تفصیلی</h1>
            <p class="page-subtitle anim-fade-up">وسایل برقی خود را اضافه کنید تا سیستم دقیق محاسبه شود</p>

            <form id="detailForm" novalidate>
                <div class="card card--glass section">
                    <div class="card__header">
                        <div class="card__icon card__icon--sun">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        </div>
                        <div>
                            <div class="card__title">وسایل برقی</div>
                            <div class="card__subtitle">${Utils.toPersian(this.state.appliances.length)} مورد ثبت شده</div>
                        </div>
                        <button type="button" class="btn btn--primary btn--sm" id="addApplianceBtn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            افزودن
                        </button>
                    </div>

                    <button type="button" class="btn btn--secondary btn--block" id="addFromCatalog" style="margin-bottom:var(--space-3);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                        انتخاب از کاتالوگ (${Utils.toPersian(APPLIANCES.length)} وسیله)
                    </button>

                    <div class="list" id="applianceList"></div>
                    <div id="applianceEmpty" class="empty" ${this.state.appliances.length > 0 ? 'hidden' : ''}>
                        <div class="empty__icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="18" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>
                        </div>
                        <h3 class="empty__title">هنوز وسیله‌ای اضافه نشده</h3>
                        <p class="empty__text">با کلیک روی «انتخاب از کاتالوگ» یا «افزودن» شروع کنید</p>
                    </div>
                </div>

                <div class="card card--glass section">
                    <div class="card__header">
                        <div class="card__icon card__icon--sky">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        </div>
                        <div>
                            <div class="card__title">تنظیمات سیستم</div>
                            <div class="card__subtitle">محل نصب و نوع سیستم</div>
                        </div>
                    </div>

                    <div class="field">
                        <label class="field__label">ولایت / شهر</label>
                        <select class="select" name="location">
                            ${LOCATIONS.map((l) => `<option value="${l.id}" ${l.id === this.state.location ? 'selected' : ''}>${Utils.escapeHTML(l.name)} — ${Utils.formatNumber(l.psh, 1)} ساعت</option>`).join('')}
                        </select>
                    </div>

                    <div class="field">
                        <label class="field__label">نوع سیستم</label>
                        <div class="switch-group" id="systemTypeSwitch">
                            <button type="button" class="${this.state.systemType === 'on-grid' ? 'is-active' : ''}" data-val="on-grid">آنگرید</button>
                            <button type="button" class="${this.state.systemType === 'off-grid' ? 'is-active' : ''}" data-val="off-grid">آفگرید</button>
                            <button type="button" class="${this.state.systemType === 'hybrid' ? 'is-active' : ''}" data-val="hybrid">هیبرید</button>
                        </div>
                    </div>

                    ${this.state.systemType !== 'on-grid' ? `
                    <div class="field">
                        <label class="field__label">ساعات پشتیبان‌گیری</label>
                        <div class="input-slider">
                            <input type="range" name="backupHours" min="1" max="24" value="${this.state.backupHours}">
                            <input type="number" class="input" name="backupHoursValue" min="1" max="24" value="${this.state.backupHours}">
                        </div>
                    </div>` : ''}
                </div>

                <div id="liveSummary" class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                    <div class="stats" style="grid-template-columns:repeat(3,1fr);margin-bottom:0;">
                        <div style="text-align:center;padding:var(--space-3);background:var(--color-bg-soft);border-radius:var(--radius-md);">
                            <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">مصرف روزانه</div>
                            <div id="liveDaily" style="font-weight:800;color:var(--color-sun-300);font-size:var(--font-size-lg);">۰</div>
                            <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">kWh</div>
                        </div>
                        <div style="text-align:center;padding:var(--space-3);background:var(--color-bg-soft);border-radius:var(--radius-md);">
                            <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">اوج مصرف</div>
                            <div id="livePeak" style="font-weight:800;color:var(--color-sky-300);font-size:var(--font-size-lg);">۰</div>
                            <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">W</div>
                        </div>
                        <div style="text-align:center;padding:var(--space-3);background:var(--color-bg-soft);border-radius:var(--radius-md);">
                            <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">تعداد وسایل</div>
                            <div id="liveCount" style="font-weight:800;color:var(--color-emerald-400);font-size:var(--font-size-lg);">${Utils.toPersian(this.state.appliances.length)}</div>
                            <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">دستگاه</div>
                        </div>
                    </div>
                </div>

                <button type="submit" class="btn btn--primary btn--block btn--lg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    محاسبه سیستم
                </button>
            </form>

            <div id="detailResult" style="margin-top:var(--space-5);"></div>
        `;
    },

    attach() {
        this._renderAppliances();
        this._updateLive();
        this._bindEvents();
    },

    _bindEvents() {
        const form = document.getElementById('detailForm');
        if (!form) return;

        document.getElementById('addApplianceBtn')?.addEventListener('click', () => this._addCustom());
        document.getElementById('addFromCatalog')?.addEventListener('click', () => this._openCatalog());

        document.querySelectorAll('#systemTypeSwitch button').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.systemType = btn.dataset.val;
                document.querySelectorAll('#systemTypeSwitch button').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                this._refresh();
            });
        });

        const backupRange = form.querySelector('[name="backupHours"]');
        const backupValue = form.querySelector('[name="backupHoursValue"]');
        backupRange?.addEventListener('input', () => { this.state.backupHours = +backupRange.value; if (backupValue) backupValue.value = backupRange.value; });
        backupValue?.addEventListener('input', () => { this.state.backupHours = +backupValue.value; if (backupRange) backupRange.value = backupValue.value; });

        form.querySelector('[name="location"]')?.addEventListener('change', (e) => { this.state.location = e.target.value; });

        form.addEventListener('submit', (e) => { e.preventDefault(); this._calculate(); });
    },

    _refresh() {
        const view = document.getElementById('view');
        if (view) { view.innerHTML = this.render(); this.attach(); }
    },

    _renderAppliances() {
        const list = document.getElementById('applianceList');
        const empty = document.getElementById('applianceEmpty');
        if (!list) return;
        if (this.state.appliances.length === 0) {
            list.innerHTML = '';
            if (empty) empty.hidden = false;
            return;
        }
        if (empty) empty.hidden = true;
        list.innerHTML = this.state.appliances.map((a, idx) => `
            <div class="list-item anim-fade-up" data-appliance-idx="${idx}" style="cursor:default;">
                <div class="list-item__icon" style="background:${this._iconColor(idx)};">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <div class="list-item__body">
                    <div class="list-item__title">${Utils.escapeHTML(a.name)}</div>
                    <div class="list-item__subtitle">${Utils.formatNumber(a.watt)}W × ${Utils.toPersian(a.qty || 1)} × ${Utils.formatNumber(a.hours)} ساعت/روز</div>
                </div>
                <div style="text-align:left;flex-shrink:0;">
                    <div style="font-weight:700;color:var(--color-sun-300);">${Utils.formatNumber((a.watt * (a.qty || 1) * a.hours / 1000), 1)}</div>
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">kWh/روز</div>
                </div>
                <button type="button" class="btn btn--icon" data-remove="${idx}" style="background:rgba(239,68,68,0.1);color:var(--color-red-400);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
                </button>
            </div>
        `).join('');

        list.querySelectorAll('[data-remove]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.remove, 10);
                this.state.appliances.splice(idx, 1);
                this._renderAppliances();
                this._updateLive();
            });
        });
    },

    _iconColor(idx) {
        const colors = ['rgba(245, 158, 11, 0.15)', 'rgba(14, 165, 233, 0.15)', 'rgba(16, 185, 129, 0.15)', 'rgba(139, 92, 246, 0.15)'];
        return colors[idx % colors.length];
    },

    _updateLive() {
        const dailyKWh = this.state.appliances.reduce((s, a) => s + (a.watt * (a.qty || 1) * a.hours), 0) / 1000;
        const peakW = this.state.appliances.reduce((s, a) => s + (a.watt * (a.qty || 1)), 0);
        const dailyEl = document.getElementById('liveDaily');
        const peakEl = document.getElementById('livePeak');
        const countEl = document.getElementById('liveCount');
        if (dailyEl) dailyEl.textContent = Utils.formatNumber(dailyKWh, 2);
        if (peakEl) peakEl.textContent = Utils.formatNumber(peakW, 0);
        if (countEl) countEl.textContent = Utils.toPersian(this.state.appliances.length);
    },

    async _addCustom() {
        try {
            const name = await modal.prompt({ title: 'افزودن وسیله', label: 'نام وسیله', placeholder: 'مثلاً یخچال' });
            if (!name) return;
            const wattStr = await modal.prompt({ title: 'توان', label: 'توان مصرفی (وات)', placeholder: 'مثلاً ۱۵۰', type: 'number' });
            if (!wattStr) return;
            const watt = Utils.parseNumber(wattStr);
            if (!Utils.isValidNumber(watt, { min: 1, max: 50000 })) {
                toast.error('توان نامعتبر است');
                return;
            }
            const qtyStr = await modal.prompt({ title: 'تعداد', label: 'تعداد دستگاه', placeholder: '۱', type: 'number', defaultValue: '1' });
            const qty = Math.max(1, Math.round(Utils.parseNumber(qtyStr) || 1));
            const hrsStr = await modal.prompt({ title: 'ساعات', label: 'ساعات استفاده روزانه', placeholder: '۸', type: 'number', defaultValue: '8' });
            const hours = Math.max(0, Math.min(24, Utils.parseNumber(hrsStr) || 0));
            this.state.appliances.push({ name: name.trim(), watt, qty, hours });
            this._renderAppliances();
            this._updateLive();
            toast.success('وسیله اضافه شد');
        } catch (e) { /* cancelled */ }
    },

    _openCatalog() {
        const html = `
            <div class="search" style="margin-bottom:var(--space-3);">
                <input type="text" class="input" id="searchAppliance" placeholder="جستجو در کاتالوگ...">
                <span class="search__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            </div>
            <div class="list" id="catalogList" style="max-height:50vh;overflow-y:auto;">
                ${APPLIANCES.map((a, i) => `
                    <div class="list-item" data-appliance-idx="${i}" style="cursor:pointer;">
                        <div class="list-item__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="18" height="10" rx="2"/></svg></div>
                        <div class="list-item__body">
                            <div class="list-item__title">${Utils.escapeHTML(a.name)}</div>
                            <div class="list-item__subtitle">${a.watt}W · ${a.hours} ساعت/روز</div>
                        </div>
                        <div class="list-item__action">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        modal.open({ title: 'انتخاب از کاتالوگ', body: html, footer: null });

        const search = document.getElementById('searchAppliance');
        const list = document.getElementById('catalogList');
        if (search && list) {
            search.addEventListener('input', () => {
                const q = search.value.trim();
                list.querySelectorAll('.list-item').forEach((item) => {
                    const name = item.querySelector('.list-item__title')?.textContent || '';
                    item.style.display = name.includes(q) ? '' : 'none';
                });
            });
            list.querySelectorAll('[data-appliance-idx]').forEach((item) => {
                item.addEventListener('click', () => {
                    const idx = parseInt(item.dataset.applianceIdx, 10);
                    const a = APPLIANCES[idx];
                    this.state.appliances.push({ ...a });
                    this._renderAppliances();
                    this._updateLive();
                    modal.close();
                    toast.success('اضافه شد');
                });
            });
        }
    },

    _calculate() {
        if (this.state.appliances.length === 0) {
            toast.error('حداقل یک وسیله اضافه کنید');
            return;
        }
        const loc = LOCATIONS.find((l) => l.id === this.state.location) || LOCATIONS[0];
        const sizing = fullSystemSizing({
            appliances: this.state.appliances,
            peakSunHours: loc.psh,
            systemType: this.state.systemType,
            backupHours: this.state.backupHours,
            panelWatt: this.state.panelWatt
        });
        const project = projects.save({
            name: `پروژه تفصیلی ${loc.name} - ${Utils.formatDate(new Date())}`,
            type: 'detailed',
            systemType: this.state.systemType,
            location: this.state.location,
            appliances: Utils.clone(this.state.appliances),
            peakSunHours: loc.psh,
            ...sizing
        });
        this._renderResult(sizing, project.id, loc);
    },

    _renderResult(sizing, projectId, loc) {
        const r = formatSizingResult(sizing);
        const el = document.getElementById('detailResult');
        if (!el) return;
        el.innerHTML = `
            <div class="card card--sun anim-scale-in" style="padding:var(--space-6);margin-bottom:var(--space-5);position:relative;overflow:hidden;border-radius:var(--radius-2xl);">
                <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;">
                    <h2 style="color:var(--color-text-inverse);font-size:var(--font-size-2xl);font-weight:800;margin-bottom:var(--space-3);">📊 نتیجه برآورد تفصیلی</h2>
                    <div class="stats" style="grid-template-columns:repeat(2,1fr);">
                        <div style="padding:var(--space-3);background:rgba(0,0,0,0.15);border-radius:var(--radius-md);">
                            <div style="color:rgba(0,0,0,0.7);font-size:var(--font-size-xs);text-transform:uppercase;margin-bottom:var(--space-1);">مصرف روزانه</div>
                            <div style="color:var(--color-text-inverse);font-size:var(--font-size-2xl);font-weight:800;">${r.formatted.dailyKWh}<span style="font-size:var(--font-size-sm);font-weight:500;margin-right:4px;">kWh</span></div>
                        </div>
                        <div style="padding:var(--space-3);background:rgba(0,0,0,0.15);border-radius:var(--radius-md);">
                            <div style="color:rgba(0,0,0,0.7);font-size:var(--font-size-xs);text-transform:uppercase;margin-bottom:var(--space-1);">ظرفیت مورد نیاز</div>
                            <div style="color:var(--color-text-inverse);font-size:var(--font-size-2xl);font-weight:800;">${r.formatted.requiredPvKw}<span style="font-size:var(--font-size-sm);font-weight:500;margin-right:4px;">kWp</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--sun"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>
                    <div style="flex:1;">
                        <div class="card__title">آرایش پنل‌ها</div>
                        <div class="card__subtitle">${r.formatted.numPanels} پنل ${r.panelWatt}W</div>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-3);">
                    <div class="result">
                        <div class="result__icon result__icon--sky" style="width:40px;height:40px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/></svg></div>
                        <div class="result__body"><div class="result__title">${Utils.toPersian(r.panelConfig.seriesCount)} در سری</div><div class="result__meta"><span>${Utils.formatNumber(r.panelConfig.stringV, 1)}V</span></div></div>
                    </div>
                    <div class="result">
                        <div class="result__icon result__icon--emerald" style="width:40px;height:40px;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></div>
                        <div class="result__body"><div class="result__title">${Utils.toPersian(r.panelConfig.parallelCount)} رشته موازی</div><div class="result__meta"><span>${Utils.formatNumber(r.panelConfig.arrayCurrent, 1)}A</span></div></div>
                    </div>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header"><h3 style="font-size:var(--font-size-md);font-weight:700;">خلاصه پروژه</h3></div>
                <div class="list" style="gap:var(--space-2);">
                    <div class="list-item" style="cursor:default;"><div class="list-item__body"><div class="list-item__title">محل نصب</div><div class="list-item__subtitle">${Utils.escapeHTML(loc.name)} · ${Utils.formatNumber(loc.psh, 1)} ساعت آفتاب</div></div></div>
                    <div class="list-item" style="cursor:default;"><div class="list-item__body"><div class="list-item__title">نوع سیستم</div><div class="list-item__subtitle">${this.state.systemType === 'on-grid' ? 'آنگرید' : this.state.systemType === 'off-grid' ? 'آفگرید' : 'هیبرید'}</div></div></div>
                    <div class="list-item" style="cursor:default;"><div class="list-item__body"><div class="list-item__title">تعداد وسایل</div><div class="list-item__subtitle">${Utils.toPersian(this.state.appliances.length)} دستگاه</div></div></div>
                    <div class="list-item" style="cursor:default;"><div class="list-item__body"><div class="list-item__title">اوج مصرف</div><div class="list-item__subtitle">${r.formatted.peakLoadW} W</div></div></div>
                </div>
            </div>

            <div class="card card--sun anim-scale-in" style="padding:var(--space-5);">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-3);">
                    <div>
                        <div style="color:rgba(0,0,0,0.7);font-size:var(--font-size-sm);font-weight:600;">💰 هزینه کل</div>
                        <div style="color:var(--color-text-inverse);font-size:var(--font-size-5xl);font-weight:900;line-height:1;">${r.formatted.totalCost}<span style="font-size:var(--font-size-lg);"> $</span></div>
                    </div>
                    <a class="btn" data-route="invoices" style="background:rgba(0,0,0,0.2);color:var(--color-text-inverse);font-weight:700;cursor:pointer;">صدور انوایس</a>
                </div>
            </div>
        `;
        toast.success('برآورد تفصیلی انجام شد');
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        el.querySelectorAll('[data-route]').forEach((link) => {
            link.addEventListener('click', () => location.hash = '#' + link.getAttribute('data-route'));
        });
    }
};
