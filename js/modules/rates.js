/**
 * ماژول تنظیم نرخ‌های افغانستان
 * Afghanistan Rates Configuration
 */
import { Utils } from '../utils.js';
import { toast, modal } from '../ui.js';
import { getAfghanistanRates, setAfghanistanRates, resetAfghanistanRates, getRatesLastUpdate, DEFAULT_RATES } from '../data/afghanistan-rates.js';

export const rates = {
    name: 'rates',
    path: '#rates',

    render() {
        const rates = getAfghanistanRates();
        const lastUpdate = getRatesLastUpdate();
        const updateDate = lastUpdate ? new Date(lastUpdate).toLocaleDateString('fa-IR') : 'پیش‌فرض';

        return `
            <h1 class="page-title anim-fade-up">💰 نرخ‌های افغانستان</h1>
            <p class="page-subtitle anim-fade-up">تنظیم دستی نرخ تجهیزات سولر در بازار افغانستان</p>

            <!-- اطلاعات کلی -->
            <div class="card anim-fade-up" style="background:linear-gradient(135deg, #f59e0b 0%, #f97316 100%);color:white;padding:var(--space-4);margin-bottom:var(--space-4);position:relative;overflow:hidden;">
                <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);text-align:center;">
                    <div>
                        <div style="font-size:10px;opacity:0.85;">دلار به افغانی</div>
                        <div style="font-size:var(--font-size-xl);font-weight:800;">${Utils.formatNumber(rates.electricity.afn_per_usd)}</div>
                        <div style="font-size:10px;opacity:0.85;">افغانی</div>
                    </div>
                    <div>
                        <div style="font-size:10px;opacity:0.85;">دلار به تومان</div>
                        <div style="font-size:var(--font-size-xl);font-weight:800;">${Utils.toPersian(rates.electricity.irr_per_usd)}</div>
                        <div style="font-size:10px;opacity:0.85;">تومان</div>
                    </div>
                </div>
                <div style="text-align:center;margin-top:var(--space-2);font-size:11px;opacity:0.85;">آخرین به‌روزرسانی: ${updateDate}</div>
            </div>

            <!-- مالیات و عوارض -->
            <div class="card anim-fade-up" style="margin-bottom:var(--space-3);">
                <h2 class="section__title">💸 مالیات و عوارض</h2>
                <div class="field">
                    <label class="field__label">مالیات بر ارزش افزوده (٪)</label>
                    <input type="number" class="input" data-rate="tax.vat_pct" value="${rates.tax.vat_pct}" min="0" max="50" step="0.5">
                </div>
                <div class="field">
                    <label class="field__label">گمرک (٪)</label>
                    <input type="number" class="input" data-rate="tax.customs_pct" value="${rates.tax.customs_pct}" min="0" max="50" step="0.5">
                </div>
                <div class="field">
                    <label class="field__label">حاشیه سود فروشنده (٪)</label>
                    <input type="number" class="input" data-rate="tax.profit_margin_pct" value="${rates.tax.profit_margin_pct}" min="0" max="100" step="1">
                </div>
            </div>

            <!-- پنل‌ها -->
            <div class="card anim-fade-up" style="margin-bottom:var(--space-3);">
                <h2 class="section__title">☀️ نرخ پنل‌ها (دلار)</h2>
                ${Object.entries(rates.panel).map(([k, v]) => `
                    <div class="field">
                        <label class="field__label">${this._labelPanel(k)}</label>
                        <input type="number" class="input" data-rate="panel.${k}" value="${v}" min="50" max="500" step="5">
                    </div>
                `).join('')}
            </div>

            <!-- اینورترها -->
            <div class="card anim-fade-up" style="margin-bottom:var(--space-3);">
                <h2 class="section__title">⚡ نرخ اینورترها (دلار)</h2>
                ${Object.entries(rates.inverter).map(([k, v]) => `
                    <div class="field">
                        <label class="field__label">${this._labelInverter(k)}</label>
                        <input type="number" class="input" data-rate="inverter.${k}" value="${v}" min="100" max="5000" step="10">
                    </div>
                `).join('')}
            </div>

            <!-- باتری‌ها -->
            <div class="card anim-fade-up" style="margin-bottom:var(--space-3);">
                <h2 class="section__title">🔋 نرخ باتری‌ها (دلار)</h2>
                ${Object.entries(rates.battery).map(([k, v]) => `
                    <div class="field">
                        <label class="field__label">${this._labelBattery(k)}</label>
                        <input type="number" class="input" data-rate="battery.${k}" value="${v}" min="100" max="10000" step="50">
                    </div>
                `).join('')}
            </div>

            <!-- نصب -->
            <div class="card anim-fade-up" style="margin-bottom:var(--space-3);">
                <h2 class="section__title">🔧 نرخ نصب</h2>
                <div class="field">
                    <label class="field__label">دستمزد به ازای هر kW (دلار)</label>
                    <input type="number" class="input" data-rate="installation.labor_per_kw" value="${rates.installation.labor_per_kw}" min="10" max="200" step="5">
                </div>
                <div class="field">
                    <label class="field__label">هزینه مجوز ثابت (دلار)</label>
                    <input type="number" class="input" data-rate="installation.permit_fixed" value="${rates.installation.permit_fixed}" min="0" max="200" step="5">
                </div>
                <div class="field">
                    <label class="field__label">هزینه مجوز به ازای هر kW (دلار)</label>
                    <input type="number" class="input" data-rate="installation.permit_per_kw" value="${rates.installation.permit_per_kw}" min="0" max="50" step="1">
                </div>
            </div>

            <!-- نرخ ارز -->
            <div class="card anim-fade-up" style="margin-bottom:var(--space-3);">
                <h2 class="section__title">💱 نرخ ارز</h2>
                <div class="field">
                    <label class="field__label">هر دلار = چند افغانی؟</label>
                    <input type="number" class="input" data-rate="electricity.afn_per_usd" value="${rates.electricity.afn_per_usd}" min="50" max="200" step="0.5">
                </div>
                <div class="field">
                    <label class="field__label">هر دلار = چند تومان؟</label>
                    <input type="number" class="input" data-rate="electricity.irr_per_usd" value="${rates.electricity.irr_per_usd}" min="30000" max="100000" step="1000">
                </div>
                <div class="field">
                    <label class="field__label">نرخ برق افغانستان (افغانی/kWh)</label>
                    <input type="number" class="input" data-rate="electricity.afn_per_kwh" value="${rates.electricity.afn_per_kwh}" min="1" max="20" step="0.5">
                </div>
            </div>

            <!-- دکمه‌ها -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);">
                <button class="btn btn--secondary" id="resetRates">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    بازنشانی
                </button>
                <button class="btn btn--primary" id="saveRates">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    ذخیره نرخ‌ها
                </button>
            </div>
        `;
    },

    _labelPanel(k) {
        const map = {
            'p-jinko-550': 'Jinko Tiger Neo 550W',
            'p-trina-550': 'Trina Vertex S+ 550W',
            'p-longi-555': 'Longi Hi-MO 5m 555W',
            'p-ja-solar-550': 'JA Solar 550W',
            'p-canadian-550': 'Canadian Solar 550W',
            'p-risen-550': 'Risen 550W',
            'p-tier-1-avg': 'میانگین Tier 1',
            'p-tier-2-avg': 'میانگین Tier 2',
            'p-tier-3-avg': 'میانگین Tier 3'
        };
        return map[k] || k;
    },

    _labelInverter(k) {
        const map = {
            'inv-growatt-3000': 'Growatt MIN 3000TL-XH',
            'inv-growatt-5000': 'Growatt MIN 5000TL-XH',
            'inv-growatt-10000': 'Growatt MOD 10000TL3-XH',
            'inv-deye-5000': 'Deye SUN-5K-SG04LP1',
            'inv-deye-10000': 'Deye SUN-10K-SG04LP3',
            'inv-srne-3000': 'SRNE HESP 3K-LV',
            'inv-sungrow-10000': 'Sungrow SH10.0RT',
            'inv-huawei-10000': 'Huawei SUN2000-10KTL',
            'inv-sma-5000': 'SMA Sunny Tripower 5000',
            'inv-fronius-5000': 'Fronius Symo 5000',
            'inv-abb-5000': 'ABB PVS-50-TL'
        };
        return map[k] || k;
    },

    _labelBattery(k) {
        const map = {
            'b-pylontech-3.5': 'Pylontech US3000C 3.5kWh',
            'b-pylontech-4.8': 'Pylontech US5000 4.8kWh',
            'b-deye-5.1': 'Deye GB-L 5.1kWh',
            'b-deye-10.2': 'Deye GB-L 10.2kWh',
            'b-lifepo4-100': 'EPEVER LFP-48100 100Ah',
            'b-tubular-150': 'Sukam TT 150Ah (سرب-اسید)',
            'b-gel-200': 'باتری ژل 200Ah'
        };
        return map[k] || k;
    },

    attach() {
        document.getElementById('saveRates')?.addEventListener('click', () => this._save());
        document.getElementById('resetRates')?.addEventListener('click', () => {
            if (confirm('نرخ‌ها به مقدار پیش‌فرض بازگردد؟')) {
                resetAfghanistanRates();
                this._refresh();
                toast.success('نرخ‌ها بازنشانی شد');
            }
        });
    },

    _save() {
        const rates = getAfghanistanRates();
        const inputs = document.querySelectorAll('[data-rate]');
        inputs.forEach(input => {
            const path = input.dataset.rate.split('.');
            const value = parseFloat(input.value);
            if (!isNaN(value)) {
                if (path.length === 2) {
                    rates[path[0]][path[1]] = value;
                } else if (path.length === 3) {
                    rates[path[0]][path[1]][path[2]] = value;
                }
            }
        });
        if (setAfghanistanRates(rates)) {
            toast.success('نرخ‌ها ذخیره شدند');
        } else {
            toast.error('خطا در ذخیره');
        }
    },

    _refresh() {
        const view = document.getElementById('view');
        if (view) {
            view.style.opacity = '0';
            setTimeout(() => {
                view.innerHTML = this.render();
                view.style.opacity = '1';
                this.attach();
            }, 150);
        }
    }
};
