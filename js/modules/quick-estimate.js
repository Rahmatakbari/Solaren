/**
 * Quick Estimate v3 — Enhanced UX
 */
import { Utils } from '../utils.js';
import { toast } from '../ui.js';
import { LOCATIONS } from '../data/locations.js';
import { fullSystemSizing, formatSizingResult } from '../calc.js';
import { projects } from '../store.js';

export const quickEstimate = {
    name: 'quick-estimate',
    path: '#quick-estimate',

    state: {
        monthlyKWh: 400,
        location: 'kabul',
        systemType: 'on-grid',
        backupHours: 4,
        panelWatt: 550,
        tiltDeg: 30
    },

    render() {
        const loc = LOCATIONS.find((l) => l.id === this.state.location) || LOCATIONS[0];
        return `
            <h1 class="page-title anim-fade-up">برآورد سریع</h1>
            <p class="page-subtitle anim-fade-up">در چند ثانیه سیستم سولر خود را محاسبه کنید</p>

            <form id="quickForm" class="anim-fade-up" novalidate>
                <!-- Step indicator -->
                <div class="card card--glass" style="padding:var(--space-4);margin-bottom:var(--space-4);">
                    <div style="display:flex;align-items:center;gap:var(--space-3);font-size:var(--font-size-sm);">
                        <div style="display:flex;align-items:center;gap:6px;color:var(--color-sun-300);">
                            <span style="width:24px;height:24px;border-radius:50%;background:var(--gradient-sun);color:var(--color-text-inverse);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:var(--font-size-xs);">۱</span>
                            <span style="font-weight:600;">مصرف</span>
                        </div>
                        <div style="flex:1;height:2px;background:var(--color-border);position:relative;">
                            <div style="position:absolute;inset:0;background:var(--gradient-sun);width:50%;"></div>
                        </div>
                        <div style="display:flex;align-items:center;gap:6px;color:var(--color-text-muted);">
                            <span style="width:24px;height:24px;border-radius:50%;background:var(--color-surface-2);color:var(--color-text-muted);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:var(--font-size-xs);">۲</span>
                            <span style="font-weight:600;">محل</span>
                        </div>
                        <div style="flex:1;height:2px;background:var(--color-border);"></div>
                        <div style="display:flex;align-items:center;gap:6px;color:var(--color-text-muted);">
                            <span style="width:24px;height:24px;border-radius:50%;background:var(--color-surface-2);color:var(--color-text-muted);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:var(--font-size-xs);">۳</span>
                            <span style="font-weight:600;">سیستم</span>
                        </div>
                    </div>
                </div>

                <div class="card card--glass section">
                    <div class="card__header">
                        <div class="card__icon card__icon--sun">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        </div>
                        <div>
                            <div class="card__title">مصرف برق</div>
                            <div class="card__subtitle">قبض برق خود را بررسی کنید</div>
                        </div>
                    </div>

                    <div class="field">
                        <label class="field__label field__label--required">مصرف ماهانه</label>
                        <div class="input-group">
                            <input type="number" class="input input--with-icon" name="monthlyKWh" min="10" max="100000" step="10" value="${this.state.monthlyKWh}" required>
                            <span class="input-group__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>
                            <span class="input-group__suffix">kWh</span>
                        </div>
                        <p class="field__hint">میانگین خانوار: ۲۰۰-۴۰۰ kWh در ماه</p>
                    </div>

                    <div class="field">
                        <label class="field__label">مصرف روزانه (تخمینی)</label>
                        <div class="input-group">
                            <input type="number" class="input input--with-icon" name="dailyKWh" min="1" max="3000" step="0.5" value="${Utils.formatNumber((this.state.monthlyKWh / 30), 2)}">
                            <span class="input-group__suffix">kWh</span>
                        </div>
                        <p class="field__hint">${Utils.toPersian(this.state.monthlyKWh)} ÷ ۳۰ روز</p>
                    </div>
                </div>

                <div class="card card--glass section">
                    <div class="card__header">
                        <div class="card__icon card__icon--sky">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        </div>
                        <div>
                            <div class="card__title">موقعیت جغرافیایی</div>
                            <div class="card__subtitle">برای محاسبه دقیق ساعات آفتابی</div>
                        </div>
                    </div>

                    <div class="field">
                        <label class="field__label">ولایت / شهر</label>
                        <select class="select" name="location">
                            ${LOCATIONS.map((l) => `<option value="${l.id}" ${l.id === this.state.location ? 'selected' : ''}>${Utils.escapeHTML(l.name)} — ${Utils.formatNumber(l.psh, 1)} ساعت</option>`).join('')}
                        </select>
                    </div>

                    <div class="field">
                        <label class="field__label">ساعات اوج آفتاب (PSH)</label>
                        <div class="input-slider">
                            <input type="range" name="psh" min="3" max="7" step="0.1" value="${loc.psh}">
                            <input type="number" class="input" name="pshValue" min="3" max="7" step="0.1" value="${loc.psh}">
                        </div>
                        <p class="field__hint">ایران/افغانستان معمولاً بین ۴-۶ ساعت</p>
                    </div>
                </div>

                <div class="card card--glass section">
                    <div class="card__header">
                        <div class="card__icon card__icon--emerald">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        </div>
                        <div>
                            <div class="card__title">نوع سیستم</div>
                            <div class="card__subtitle">سیستم مناسب نیاز خود را انتخاب کنید</div>
                        </div>
                    </div>

                    <div class="radio-cards" id="systemTypeCards">
                        <label class="radio-card ${this.state.systemType === 'on-grid' ? 'is-selected' : ''}">
                            <input type="radio" name="systemType" value="on-grid" ${this.state.systemType === 'on-grid' ? 'checked' : ''}>
                            <div class="radio-card__icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                            </div>
                            <div class="radio-card__title">آنگرید</div>
                            <div class="radio-card__subtitle">متصل به شبکه</div>
                        </label>
                        <label class="radio-card ${this.state.systemType === 'off-grid' ? 'is-selected' : ''}">
                            <input type="radio" name="systemType" value="off-grid" ${this.state.systemType === 'off-grid' ? 'checked' : ''}>
                            <div class="radio-card__icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="18" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>
                            </div>
                            <div class="radio-card__title">آفگرید</div>
                            <div class="radio-card__subtitle">مستقل + باتری</div>
                        </label>
                        <label class="radio-card ${this.state.systemType === 'hybrid' ? 'is-selected' : ''}">
                            <input type="radio" name="systemType" value="hybrid" ${this.state.systemType === 'hybrid' ? 'checked' : ''}>
                            <div class="radio-card__icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/><circle cx="12" cy="12" r="3"/></svg>
                            </div>
                            <div class="radio-card__title">هیبرید</div>
                            <div class="radio-card__subtitle">شبکه + باتری</div>
                        </label>
                    </div>
                </div>

                ${this.state.systemType !== 'on-grid' ? `
                <div class="card card--glass section anim-fade-up">
                    <div class="card__header">
                        <div class="card__icon card__icon--violet">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <div>
                            <div class="card__title">پشتیبان‌گیری</div>
                            <div class="card__subtitle">چند ساعت برق در قطع شبکه</div>
                        </div>
                    </div>
                    <div class="field">
                        <label class="field__label">ساعات پشتیبان‌گیری</label>
                        <div class="input-slider">
                            <input type="range" name="backupHours" min="1" max="24" step="1" value="${this.state.backupHours}">
                            <input type="number" class="input" name="backupHoursValue" min="1" max="24" value="${this.state.backupHours}">
                        </div>
                    </div>
                </div>` : ''}

                <button type="submit" class="btn btn--primary btn--block btn--lg anim-fade-up">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    محاسبه سیستم
                </button>
            </form>

            <div id="quickResult" style="margin-top:var(--space-5);"></div>
        `;
    },

    attach() {
        const form = document.getElementById('quickForm');
        if (!form) return;

        // جلوگیری از ثبت event listener تکراری
        if (form.dataset.initialized === 'true') {
            return;
        }
        form.dataset.initialized = 'true';

        const monthlyInput = form.querySelector('[name="monthlyKWh"]');
        const dailyInput = form.querySelector('[name="dailyKWh"]');
        monthlyInput?.addEventListener('input', () => {
            const m = Utils.parseNumber(monthlyInput.value);
            if (m > 0) dailyInput.value = (m / 30).toFixed(2);
        });

        const locSelect = form.querySelector('[name="location"]');
        const pshRange = form.querySelector('[name="psh"]');
        const pshValue = form.querySelector('[name="pshValue"]');
        locSelect?.addEventListener('change', () => {
            const loc = LOCATIONS.find((l) => l.id === locSelect.value);
            if (loc) { pshRange.value = loc.psh; pshValue.value = loc.psh; }
            this.state.location = locSelect.value;
        });
        pshRange?.addEventListener('input', () => { pshValue.value = pshRange.value; });
        pshValue?.addEventListener('input', () => { pshRange.value = pshValue.value; });

        const backupRange = form.querySelector('[name="backupHours"]');
        const backupValue = form.querySelector('[name="backupHoursValue"]');
        backupRange?.addEventListener('input', () => { if (backupValue) backupValue.value = backupRange.value; });
        backupValue?.addEventListener('input', () => { if (backupRange) backupRange.value = backupValue.value; });

        const cards = form.querySelectorAll('.radio-card');
        cards.forEach((card) => {
            const radio = card.querySelector('input[type="radio"]');
            card.addEventListener('click', (e) => {
                if (e.target.closest('input')) return;
                cards.forEach((c) => c.classList.remove('is-selected'));
                card.classList.add('is-selected');
                if (radio) radio.checked = true;
                this.state.systemType = radio?.value;
            });
        });

        form.addEventListener('submit', (e) => { e.preventDefault(); this._calculate(); });
    },

    _calculate() {
        // جلوگیری از اجرای همزمان
        if (this._calculating) return;
        this._calculating = true;

        const form = document.getElementById('quickForm');
        const monthlyKWh = Utils.parseNumber(form.monthlyKWh.value);
        const psh = Utils.parseNumber(form.pshValue.value);
        const systemType = form.querySelector('[name="systemType"]:checked')?.value || 'on-grid';
        const backupHours = Utils.parseNumber(form.backupHoursValue?.value || 4);

        if (!Utils.isValidNumber(monthlyKWh, { min: 10, max: 100000 })) {
            toast.error('مصرف ماهانه نامعتبر است');
            this._calculating = false;
            return;
        }

        const dailyKWh = monthlyKWh / 30;
        const peakLoadW = (monthlyKWh / 30) * 1000 / 6;

        const sizing = fullSystemSizing({
            appliances: [{ name: 'مصرف کل', watt: peakLoadW, hours: 6, qty: 1 }],
            peakSunHours: psh,
            systemType,
            backupHours,
            panelWatt: this.state.panelWatt
        });
        sizing.dailyKWh = dailyKWh;
        sizing.monthlyKWh = monthlyKWh;
        sizing.peakLoadW = peakLoadW;

        const project = projects.save({
            name: `برآورد سریع ${LOCATIONS.find((l) => l.id === this.state.location)?.name || ''}`,
            type: 'quick',
            systemType,
            location: this.state.location,
            peakSunHours: psh,
            monthlyKWh,
            dailyKWh,
            ...sizing
        });

        this._renderResult(sizing, project.id);
        // آزاد کردن flag بعد از render
        setTimeout(() => { this._calculating = false; }, 500);
    },

    _renderResult(sizing, projectId) {
        const r = formatSizingResult(sizing);
        const el = document.getElementById('quickResult');
        if (!el) return;

        el.innerHTML = `
            <div class="card card--sun anim-scale-in" style="padding:var(--space-6);margin-bottom:var(--space-5);position:relative;overflow:hidden;border-radius:var(--radius-2xl);">
                <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4);">
                        <h2 style="color:var(--color-text-inverse);font-size:var(--font-size-2xl);font-weight:800;">📊 نتیجه برآورد</h2>
                        <span class="chip" style="background:rgba(0,0,0,0.2);color:white;border:1px solid rgba(0,0,0,0.1);">ذخیره شد</span>
                    </div>
                    <div class="stats" style="grid-template-columns:repeat(2,1fr);">
                        <div style="padding:var(--space-3);background:rgba(0,0,0,0.15);border-radius:var(--radius-md);border:1px solid rgba(0,0,0,0.1);">
                            <div style="color:rgba(0,0,0,0.7);font-size:var(--font-size-xs);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:var(--space-1);">مصرف روزانه</div>
                            <div style="color:var(--color-text-inverse);font-size:var(--font-size-2xl);font-weight:800;">${r.formatted.dailyKWh}<span style="font-size:var(--font-size-sm);font-weight:500;margin-right:4px;color:rgba(0,0,0,0.7);">kWh</span></div>
                        </div>
                        <div style="padding:var(--space-3);background:rgba(0,0,0,0.15);border-radius:var(--radius-md);border:1px solid rgba(0,0,0,0.1);">
                            <div style="color:rgba(0,0,0,0.7);font-size:var(--font-size-xs);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:var(--space-1);">ظرفیت مورد نیاز</div>
                            <div style="color:var(--color-text-inverse);font-size:var(--font-size-2xl);font-weight:800;">${r.formatted.requiredPvKw}<span style="font-size:var(--font-size-sm);font-weight:500;margin-right:4px;color:rgba(0,0,0,0.7);">kWp</span></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ROI summary -->
            <div class="card card--emerald anim-fade-up" style="padding:var(--space-5);margin-bottom:var(--space-4);color:white;">
                <h3 style="color:white;margin-bottom:var(--space-3);font-size:var(--font-size-md);">💰 بازگشت سرمایه (۲۵ سال)</h3>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-3);text-align:center;">
                    <div>
                        <div style="opacity:0.85;font-size:var(--font-size-xs);">دوره بازگشت</div>
                        <div style="font-weight:800;font-size:var(--font-size-xl);">${r.formatted.payback}</div>
                        <div style="opacity:0.85;font-size:var(--font-size-xs);">سال</div>
                    </div>
                    <div>
                        <div style="opacity:0.85;font-size:var(--font-size-xs);">سود خالص</div>
                        <div style="font-weight:800;font-size:var(--font-size-xl);">${r.formatted.netProfit}</div>
                        <div style="opacity:0.85;font-size:var(--font-size-xs);">$</div>
                    </div>
                    <div>
                        <div style="opacity:0.85;font-size:var(--font-size-xs);">ROI</div>
                        <div style="font-weight:800;font-size:var(--font-size-xl);">${r.formatted.roi}%</div>
                    </div>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--sun">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                    </div>
                    <div style="flex:1;">
                        <div class="card__title">آرایش پنل‌ها</div>
                        <div class="card__subtitle">${r.formatted.numPanels} پنل ${r.panelWatt}W</div>
                    </div>
                    <div class="result__price">
                        <div class="result__price-value">${r.formatted.panelCost}</div>
                        <div class="result__price-label">$</div>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-3);font-size:var(--font-size-sm);color:var(--color-text-muted);">
                    <div>✓ سری: <strong style="color:var(--color-text);">${Utils.toPersian(r.panelConfig.seriesCount)} پنل</strong> · ${Utils.formatNumber(r.panelConfig.stringV, 0)}V</div>
                    <div>✓ موازی: <strong style="color:var(--color-text);">${Utils.toPersian(r.panelConfig.parallelCount)} رشته</strong></div>
                    <div>✓ مساحت: <strong style="color:var(--color-text);">${Utils.formatNumber(Math.round(r.numPanels * 2.6))} m²</strong></div>
                    <div>✓ تولید سالانه: <strong style="color:var(--color-text);">${r.formatted.annualKWh} kWh</strong></div>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--sky">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    </div>
                    <div style="flex:1;">
                        <div class="card__title">انورتر پیشنهادی</div>
                        <div class="card__subtitle">${Utils.escapeHTML(r.inverter.brand)} ${Utils.escapeHTML(r.inverter.model)}</div>
                    </div>
                    <div class="result__price">
                        <div class="result__price-value">${r.formatted.inverterCost}</div>
                        <div class="result__price-label">$</div>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-2);font-size:var(--font-size-sm);color:var(--color-text-muted);">
                    <div>توان: <strong style="color:var(--color-text);">${r.inverter.powerKw} kW</strong></div>
                    <div>نوع: <strong style="color:var(--color-text);">${Utils.escapeHTML(r.inverter.type)}</strong></div>
                    <div>راندمان: <strong style="color:var(--color-text);">${r.inverter.eff}%</strong></div>
                    <div>گارانتی: <strong style="color:var(--color-text);">${r.inverter.warranty} سال</strong></div>
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:var(--space-1);margin-top:var(--space-3);">
                    ${r.inverter.features.map((f) => `<span class="chip chip--sun">${Utils.escapeHTML(f)}</span>`).join('')}
                </div>
            </div>

            ${r.numBatteries > 0 ? `
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--emerald">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="2" y="7" width="18" height="10" rx="2"/></svg>
                    </div>
                    <div style="flex:1;">
                        <div class="card__title">سیستم باتری</div>
                        <div class="card__subtitle">${r.formatted.numBatteries} دستگاه ${Utils.escapeHTML(r.battery.brand)} ${Utils.escapeHTML(r.battery.model)}</div>
                    </div>
                    <div class="result__price">
                        <div class="result__price-value">${r.formatted.batteryCost}</div>
                        <div class="result__price-label">$</div>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-2);font-size:var(--font-size-sm);color:var(--color-text-muted);">
                    <div>ظرفیت کل: <strong style="color:var(--color-text);">${r.formatted.batteryKWh} kWh</strong></div>
                    <div>DoD: <strong style="color:var(--color-text);">${r.battery.dod}%</strong></div>
                    <div>عمر چرخه: <strong style="color:var(--color-text);">${Utils.toPersian(r.battery.cycles)}</strong></div>
                    <div>گارانتی: <strong style="color:var(--color-text);">${r.battery.warranty} سال</strong></div>
                </div>
            </div>
            ` : ''}

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h3 style="font-size:var(--font-size-md);font-weight:700;">📋 صورت هزینه</h3>
                </div>
                <div class="list" style="gap:var(--space-2);">
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__icon" style="background:rgba(245,158,11,0.15);color:var(--color-sun-300);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>
                        <div class="list-item__body">
                            <div class="list-item__title">پنل‌ها</div>
                            <div class="list-item__subtitle">${r.formatted.numPanels} عدد</div>
                        </div>
                        <div style="font-weight:700;color:var(--color-sun-300);">${r.formatted.panelCost} $</div>
                    </div>
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__icon" style="background:rgba(14,165,233,0.15);color:var(--color-sky-300);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                        <div class="list-item__body">
                            <div class="list-item__title">انورتر</div>
                            <div class="list-item__subtitle">${Utils.escapeHTML(r.inverter.model)}</div>
                        </div>
                        <div style="font-weight:700;color:var(--color-sky-300);">${r.formatted.inverterCost} $</div>
                    </div>
                    ${r.numBatteries > 0 ? `
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__icon" style="background:rgba(16,185,129,0.15);color:var(--color-emerald-400);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="18" height="10" rx="2"/></svg></div>
                        <div class="list-item__body">
                            <div class="list-item__title">باتری‌ها</div>
                            <div class="list-item__subtitle">${r.formatted.numBatteries} دستگاه</div>
                        </div>
                        <div style="font-weight:700;color:var(--color-emerald-400);">${r.formatted.batteryCost} $</div>
                    </div>` : ''}
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__icon" style="background:rgba(139,92,246,0.15);color:var(--color-violet-400);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>
                        <div class="list-item__body">
                            <div class="list-item__title">تجهیزات جانبی</div>
                            <div class="list-item__subtitle">کابل، بریکر، تابلو</div>
                        </div>
                        <div style="font-weight:700;color:var(--color-violet-400);">${r.formatted.bosCost} $</div>
                    </div>
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__icon" style="background:rgba(245,158,11,0.15);color:var(--color-sun-300);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg></div>
                        <div class="list-item__body">
                            <div class="list-item__title">نصب و راه‌اندازی</div>
                            <div class="list-item__subtitle">دستمزد + مجوز</div>
                        </div>
                        <div style="font-weight:700;color:var(--color-sun-300);">${Utils.formatNumber(r.formatted.installationCost + r.formatted.permitCost)} $</div>
                    </div>
                </div>
            </div>

            <div class="card card--sun anim-scale-in" style="padding:var(--space-5);">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-3);">
                    <div>
                        <div style="color:rgba(0,0,0,0.7);font-size:var(--font-size-sm);font-weight:600;">💰 هزینه کل پروژه</div>
                        <div style="color:var(--color-text-inverse);font-size:var(--font-size-5xl);font-weight:900;line-height:1;">${r.formatted.totalCost}<span style="font-size:var(--font-size-lg);font-weight:600;"> $</span></div>
                        <div style="color:rgba(0,0,0,0.7);font-size:var(--font-size-sm);margin-top:var(--space-1);">قیمت هر وات: ${Utils.formatNumber(Math.round(sizing.totalCost / (sizing.actualPvKw * 1000)), 2)} $</div>
                    </div>
                    <a class="btn" data-route="invoices" style="background:rgba(0,0,0,0.25);color:var(--color-text-inverse);font-weight:700;cursor:pointer;">
                        صدور انوایس
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </a>
                </div>
            </div>

            <!-- شماتیک سیستم -->
            <div class="card card--glass anim-fade-up" style="margin-top:var(--space-4);">
                <h3 style="font-size:var(--font-size-md);font-weight:700;margin-bottom:var(--space-3);display:flex;align-items:center;gap:8px;">🔌 شماتیک سیستم</h3>
                <div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-3);">
                    <!-- پنل -->
                    <div style="background:linear-gradient(135deg, #f59e0b, #f97316);color:white;width:100%;max-width:280px;padding:var(--space-3);border-radius:var(--radius-md);text-align:center;box-shadow:var(--shadow-md);">
                        <div style="font-size:32px;">☀️</div>
                        <div style="font-weight:800;font-size:var(--font-size-md);">پنل خورشیدی</div>
                        <div style="font-size:var(--font-size-sm);opacity:0.9;">${Utils.formatNumber(r.numPanels)} پنل × ${sizing.panelWatt || 555}W</div>
                        <div style="font-size:var(--font-size-xs);opacity:0.85;margin-top:2px;">${Utils.formatNumber(sizing.actualPvKw, 1)} kWp</div>
                    </div>
                    <!-- فلش DC -->
                    <div style="text-align:center;color:var(--color-sky-300);">
                        <div style="background:rgba(14,165,233,0.1);border:1px solid var(--color-sky-300);border-radius:var(--radius-sm);padding:2px 8px;font-size:10px;font-weight:700;display:inline-block;">⚡ DC</div>
                        <div style="font-size:18px;line-height:1;">↓</div>
                    </div>
                    <!-- اینورتر -->
                    <div style="background:linear-gradient(135deg, #10b981, #059669);color:white;width:100%;max-width:280px;padding:var(--space-3);border-radius:var(--radius-md);text-align:center;box-shadow:var(--shadow-md);">
                        <div style="font-size:32px;">🔄</div>
                        <div style="font-weight:800;font-size:var(--font-size-md);">اینورتر ${Utils.escapeHTML(r.inverter.type)}</div>
                        <div style="font-size:var(--font-size-sm);opacity:0.9;">${r.inverter.powerKw} kW · ${r.inverter.eff}% راندمان</div>
                        <div style="font-size:var(--font-size-xs);opacity:0.85;margin-top:2px;">${Utils.escapeHTML(r.inverter.brand)} ${Utils.escapeHTML(r.inverter.model)}</div>
                    </div>
                    ${r.numBatteries > 0 ? `
                    <!-- فلش باتری -->
                    <div style="display:flex;width:100%;justify-content:space-around;align-items:center;position:relative;">
                        <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);font-size:18px;color:var(--color-text-muted);">↓</div>
                    </div>
                    <!-- باتری -->
                    <div style="background:linear-gradient(135deg, #8b5cf6, #7c3aed);color:white;width:100%;max-width:280px;padding:var(--space-3);border-radius:var(--radius-md);text-align:center;box-shadow:var(--shadow-md);">
                        <div style="font-size:32px;">🔋</div>
                        <div style="font-weight:800;font-size:var(--font-size-md);">باتری لیتیوم</div>
                        <div style="font-size:var(--font-size-sm);opacity:0.9;">${r.formatted.numBatteries} × ${Utils.escapeHTML(r.battery.model)}</div>
                        <div style="font-size:var(--font-size-xs);opacity:0.85;margin-top:2px;">${r.formatted.batteryKWh} kWh · ${r.battery.dod}% DoD</div>
                    </div>
                    ` : ''}
                    <!-- فلش خروجی -->
                    <div style="text-align:center;color:var(--color-amber-500);">
                        <div style="background:rgba(245,158,11,0.1);border:1px solid var(--color-amber-500);border-radius:var(--radius-sm);padding:2px 8px;font-size:10px;font-weight:700;display:inline-block;">⚡ AC 220V</div>
                        <div style="font-size:18px;line-height:1;">↓</div>
                    </div>
                    <!-- مصرف‌کننده -->
                    <div style="background:linear-gradient(135deg, #f43f5e, #e11d48);color:white;width:100%;max-width:280px;padding:var(--space-3);border-radius:var(--radius-md);text-align:center;box-shadow:var(--shadow-md);">
                        <div style="font-size:32px;">🏠</div>
                        <div style="font-weight:800;font-size:var(--font-size-md);">مصرف‌کننده</div>
                        <div style="font-size:var(--font-size-sm);opacity:0.9;">${Utils.formatNumber(sizing.peakLoadW)} W پیک</div>
                        <div style="font-size:var(--font-size-xs);opacity:0.85;margin-top:2px;">${sizing.formatted?.dailyKWh || Math.round(sizing.dailyKWh)} kWh/روز</div>
                    </div>
                </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);margin-top:var(--space-4);">
                <a class="btn btn--secondary" data-route="wire-calc" style="cursor:pointer;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    محاسبه کابل
                </a>
                <a class="btn btn--secondary" data-route="detailed-estimate" style="cursor:pointer;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/></svg>
                    تفصیلی
                </a>
            </div>
        `;

        toast.success('برآورد با موفقیت انجام شد');
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        el.querySelectorAll('[data-route]').forEach((link) => {
            link.addEventListener('click', () => location.hash = '#' + link.getAttribute('data-route'));
        });
    }
};
