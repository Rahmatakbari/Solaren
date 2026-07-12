/**
 * Equipment Comparison Tool v1
 * Side-by-side comparison of panels, inverters, batteries
 */
import { Utils } from '../utils.js';
import { toast } from '../ui.js';
import { SOLAR_PANELS } from '../data/panels.js';
import { INVERTERS } from '../data/inverters.js';
import { BATTERIES } from '../data/batteries.js';

export const compare = {
    name: 'compare',
    path: '#compare',

    state: {
        type: 'panels',
        left: null,
        right: null
    },

    render() {
        return `
            <h1 class="page-title anim-fade-up">مقایسه تجهیزات</h1>
            <p class="page-subtitle anim-fade-up">مقایسه دقیق پنل، انورتر و باتری</p>

            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="card__header">
                    <h2 class="section__title">نوع تجهیز</h2>
                </div>
                <div class="switch-group" id="cmpType">
                    <button class="${this.state.type === 'panels' ? 'is-active' : ''}" data-val="panels">پنل‌ها</button>
                    <button class="${this.state.type === 'inverters' ? 'is-active' : ''}" data-val="inverters">انورترها</button>
                    <button class="${this.state.type === 'batteries' ? 'is-active' : ''}" data-val="batteries">باتری‌ها</button>
                </div>
            </div>

            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="card__header">
                    <div class="card__icon card__icon--sun">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19"/></svg>
                    </div>
                    <div>
                        <div class="card__title">انتخاب تجهیزات</div>
                        <div class="card__subtitle">دو مورد را برای مقایسه انتخاب کنید</div>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);">
                    <div>
                        <label class="field__label" style="display:block;margin-bottom:var(--space-2);">گزینه اول</label>
                        <select class="select" id="cmpLeft">
                            <option value="">— انتخاب کنید —</option>
                            ${this._getItems().map((item) => `<option value="${item.id}">${Utils.escapeHTML(item.brand + ' ' + (item.model || item.watt + 'W'))}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="field__label" style="display:block;margin-bottom:var(--space-2);">گزینه دوم</label>
                        <select class="select" id="cmpRight">
                            <option value="">— انتخاب کنید —</option>
                            ${this._getItems().map((item) => `<option value="${item.id}">${Utils.escapeHTML(item.brand + ' ' + (item.model || item.watt + 'W'))}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>

            <div id="cmpResult"></div>
        `;
    },

    _getItems() {
        if (this.state.type === 'panels') return SOLAR_PANELS;
        if (this.state.type === 'inverters') return INVERTERS;
        if (this.state.type === 'batteries') return BATTERIES;
        return [];
    },

    _getSpecFields() {
        if (this.state.type === 'panels') {
            return [
                { key: 'watt', label: 'توان', unit: 'W', better: 'high' },
                { key: 'efficiency', label: 'راندمان', unit: '%', better: 'high' },
                { key: 'vmp', label: 'ولتاژ کار (Vmp)', unit: 'V', better: 'high' },
                { key: 'imp', label: 'جریان کار (Imp)', unit: 'A', better: 'high' },
                { key: 'voc', label: 'ولتاژ مدار باز (Voc)', unit: 'V', better: 'high' },
                { key: 'isc', label: 'جریان اتصال کوتاه (Isc)', unit: 'A', better: 'high' },
                { key: 'cells', label: 'تعداد سلول', unit: '', better: 'high' },
                { key: 'warranty', label: 'گارانتی', unit: 'سال', better: 'high' },
                { key: 'price', label: 'قیمت', unit: '$', better: 'low' },
                { key: 'pricePerWatt', label: 'قیمت هر وات', unit: '$/W', better: 'low', computed: (p) => p.price / p.watt }
            ];
        }
        if (this.state.type === 'inverters') {
            return [
                { key: 'powerKw', label: 'توان', unit: 'kW', better: 'high' },
                { key: 'mppt', label: 'تعداد MPPT', unit: '', better: 'high' },
                { key: 'maxPvV', label: 'حداکثر ولتاژ PV', unit: 'V', better: 'high' },
                { key: 'maxPvW', label: 'حداکثر توان PV', unit: 'W', better: 'high' },
                { key: 'batV', label: 'ولتاژ باتری', unit: 'V', better: 'high' },
                { key: 'eff', label: 'راندمان', unit: '%', better: 'high' },
                { key: 'phase', label: 'فاز', unit: '', better: 'high' },
                { key: 'warranty', label: 'گارانتی', unit: 'سال', better: 'high' },
                { key: 'price', label: 'قیمت', unit: '$', better: 'low' },
                { key: 'pricePerKw', label: 'قیمت هر kW', unit: '$/kW', better: 'low', computed: (i) => i.price / i.powerKw }
            ];
        }
        if (this.state.type === 'batteries') {
            return [
                { key: 'capacityKWh', label: 'ظرفیت', unit: 'kWh', better: 'high' },
                { key: 'voltage', label: 'ولتاژ', unit: 'V', better: 'high' },
                { key: 'capacityAh', label: 'آمپر ساعت', unit: 'Ah', better: 'high' },
                { key: 'dod', label: 'عمق تخلیه (DoD)', unit: '%', better: 'high' },
                { key: 'cycles', label: 'عمر چرخه', unit: '', better: 'high' },
                { key: 'warranty', label: 'گارانتی', unit: 'سال', better: 'high' },
                { key: 'price', label: 'قیمت', unit: '$', better: 'low' },
                { key: 'pricePerKwh', label: 'قیمت هر kWh', unit: '$/kWh', better: 'low', computed: (b) => b.price / b.capacityKWh }
            ];
        }
        return [];
    },

    attach() {
        document.querySelectorAll('#cmpType button').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.type = btn.dataset.val;
                this.state.left = null;
                this.state.right = null;
                document.querySelectorAll('#cmpType button').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                const view = document.getElementById('view');
                if (view) { view.innerHTML = this.render(); this.attach(); }
            });
        });

        document.getElementById('cmpLeft')?.addEventListener('change', (e) => {
            this.state.left = e.target.value || null;
            this._renderResult();
        });
        document.getElementById('cmpRight')?.addEventListener('change', (e) => {
            this.state.right = e.target.value || null;
            this._renderResult();
        });
    },

    _renderResult() {
        const el = document.getElementById('cmpResult');
        if (!el) return;
        if (!this.state.left || !this.state.right) {
            el.innerHTML = '<div class="empty"><div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v18H3z"/></svg></div><h3 class="empty__title">دو گزینه انتخاب کنید</h3><p class="empty__text">برای مقایسه، دو تجهیز را از لیست‌های بالا انتخاب کنید</p></div>';
            return;
        }
        const items = this._getItems();
        const a = items.find((i) => i.id === this.state.left);
        const b = items.find((i) => i.id === this.state.right);
        if (!a || !b) return;
        const fields = this._getSpecFields();

        el.innerHTML = `
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">⚖️ مقایسه</h2>
                </div>
                <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:var(--space-3);margin-bottom:var(--space-4);padding-bottom:var(--space-4);border-bottom:1px solid var(--color-border);">
                    <div style="text-align:center;">
                        <div class="card__icon card__icon--sun" style="margin:0 auto var(--space-2);width:48px;height:48px;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                        </div>
                        <h3 style="font-weight:700;font-size:var(--font-size-md);">${Utils.escapeHTML(a.brand)}</h3>
                        <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);">${Utils.escapeHTML(a.model || '')}</p>
                    </div>
                    <div style="display:flex;align-items:center;color:var(--color-text-dim);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M16 3h5v5M8 21H3v-5M21 3l-7 7M3 21l7-7"/></svg>
                    </div>
                    <div style="text-align:center;">
                        <div class="card__icon card__icon--sky" style="margin:0 auto var(--space-2);width:48px;height:48px;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        </div>
                        <h3 style="font-weight:700;font-size:var(--font-size-md);">${Utils.escapeHTML(b.brand)}</h3>
                        <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);">${Utils.escapeHTML(b.model || '')}</p>
                    </div>
                </div>
                <div class="list" style="gap:var(--space-2);">
                    ${fields.map((f) => {
                        const valA = f.computed ? f.computed(a) : a[f.key];
                        const valB = f.computed ? f.computed(b) : b[f.key];
                        const winner = this._compare(valA, valB, f.better);
                        return `
                            <div class="list-item" style="cursor:default;">
                                <div class="list-item__body">
                                    <div class="list-item__title" style="font-size:var(--font-size-sm);">${f.label}</div>
                                </div>
                                <div style="display:flex;align-items:center;gap:var(--space-3);min-width:200px;">
                                    <div style="flex:1;text-align:center;padding:var(--space-2);background:${winner === 'a' ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-bg-soft)'};border-radius:var(--radius-sm);${winner === 'a' ? 'border:1px solid rgba(16, 185, 129, 0.3);' : ''}">
                                        <div style="font-weight:700;font-size:var(--font-size-md);${winner === 'a' ? 'color:var(--color-emerald-400);' : ''}">${Utils.formatNumber(valA, typeof valA === 'number' && valA < 100 ? 1 : 0)}${f.unit ? ' ' + f.unit : ''}</div>
                                        ${winner === 'a' ? '<div style="font-size:var(--font-size-xs);color:var(--color-emerald-400);">✓ برتر</div>' : ''}
                                    </div>
                                    <div style="flex:1;text-align:center;padding:var(--space-2);background:${winner === 'b' ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-bg-soft)'};border-radius:var(--radius-sm);${winner === 'b' ? 'border:1px solid rgba(16, 185, 129, 0.3);' : ''}">
                                        <div style="font-weight:700;font-size:var(--font-size-md);${winner === 'b' ? 'color:var(--color-emerald-400);' : ''}">${Utils.formatNumber(valB, typeof valB === 'number' && valB < 100 ? 1 : 0)}${f.unit ? ' ' + f.unit : ''}</div>
                                        ${winner === 'b' ? '<div style="font-size:var(--font-size-xs);color:var(--color-emerald-400);">✓ برتر</div>' : ''}
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <div class="card card--emerald section anim-fade-up" style="color:white;text-align:center;">
                <h3 style="margin-bottom:var(--space-2);color:white;">🏆 نتیجه مقایسه</h3>
                <p style="opacity:0.9;">${this._summary(a, b)}</p>
            </div>
        `;
    },

    _compare(a, b, better) {
        if (a === b || a == null || b == null) return 'none';
        if (better === 'high') return a > b ? 'a' : (b > a ? 'b' : 'tie');
        return a < b ? 'a' : (b < a ? 'b' : 'tie');
    },

    _summary(a, b) {
        const fields = this._getSpecFields();
        let aWins = 0, bWins = 0;
        fields.forEach((f) => {
            const valA = f.computed ? f.computed(a) : a[f.key];
            const valB = f.computed ? f.computed(b) : b[f.key];
            const w = this._compare(valA, valB, f.better);
            if (w === 'a') aWins++;
            else if (w === 'b') bWins++;
        });
        if (aWins > bWins) return `${Utils.escapeHTML(a.brand)} در ${Utils.toPersian(aWins)} معیار و ${Utils.escapeHTML(b.brand)} در ${Utils.toPersian(bWins)} معیار برتری دارد.`;
        if (bWins > aWins) return `${Utils.escapeHTML(b.brand)} در ${Utils.toPersian(bWins)} معیار و ${Utils.escapeHTML(a.brand)} در ${Utils.toPersian(aWins)} معیار برتری دارد.`;
        return `هر دو گزینه عملکرد مشابهی دارند (${Utils.toPersian(aWins)} برد).`;
    }
};
