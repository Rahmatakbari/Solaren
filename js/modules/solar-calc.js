/**
 * Solar Calculator v3 — Multiple tools
 */
import { Utils } from '../utils.js';
import { SolarCalc, LOSS_FACTORS } from '../calc.js';
import { LOCATIONS } from '../data/locations.js';

export const solarCalc = {
    name: 'solar-calc',
    path: '#solar-calc',

    state: { tool: 'pv' },

    tools: [
        { id: 'pv', label: 'ظرفیت PV', icon: '☀️' },
        { id: 'production', label: 'تولید', icon: '⚡' },
        { id: 'roi', label: 'بازگشت سرمایه', icon: '💰' },
        { id: 'string', label: 'آرایش رشته', icon: '🔗' },
        { id: 'derate', label: 'ضرایب تلفات', icon: '📉' }
    ],

    render() {
        return `
            <h1 class="page-title anim-fade-up">ماشین‌حساب سولر</h1>
            <p class="page-subtitle anim-fade-up">ابزارهای تخصصی محاسبات سیستم‌های خورشیدی</p>

            <div class="tabs anim-fade-up">
                ${this.tools.map((t) => `
                    <button class="tab ${this.state.tool === t.id ? 'is-active' : ''}" data-tool="${t.id}">
                        <span class="tab__icon">${t.icon}</span>
                        <span>${t.label}</span>
                    </button>
                `).join('')}
            </div>

            <div id="calcContent">
                ${this._renderTool()}
            </div>
        `;
    },

    attach() {
        document.querySelectorAll('[data-tool]').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.tool = btn.dataset.tool;
                document.querySelectorAll('[data-tool]').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                const el = document.getElementById('calcContent');
                if (el) {
                    el.innerHTML = this._renderTool();
                    this._bindTool();
                }
            });
        });
        this._bindTool();
    },

    _renderTool() {
        switch (this.state.tool) {
            case 'pv': return this._pvTool();
            case 'production': return this._productionTool();
            case 'roi': return this._roiTool();
            case 'string': return this._stringTool();
            case 'derate': return this._derateTool();
        }
    },

    _pvTool() {
        return `
            <div class="card card--glass anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--sun">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                    </div>
                    <div>
                        <div class="card__title">محاسبه ظرفیت PV</div>
                        <div class="card__subtitle">بر اساس مصرف روزانه و PSH</div>
                    </div>
                </div>
                <div class="field">
                    <label class="field__label">مصرف روزانه (kWh)</label>
                    <input type="number" class="input" id="pvDaily" min="0.1" step="0.1" value="20">
                </div>
                <div class="field">
                    <label class="field__label">موقعیت</label>
                    <select class="select" id="pvLoc">
                        ${LOCATIONS.map((l) => `<option value="${l.psh}">${Utils.escapeHTML(l.name)} (${Utils.formatNumber(l.psh, 1)} ساعت)</option>`).join('')}
                    </select>
                </div>
                <div class="field">
                    <label class="field__label">ساعات اوج آفتاب (سفارشی)</label>
                    <input type="number" class="input" id="pvPSH" min="1" max="8" step="0.1" value="5.5">
                </div>
                <div id="pvResult" class="card card--sun" style="padding:var(--space-4);margin-top:var(--space-4);display:none;">
                    <div style="color:rgba(0,0,0,0.7);font-size:var(--font-size-sm);">ظرفیت مورد نیاز</div>
                    <div id="pvResultValue" style="color:var(--color-text-inverse);font-size:var(--font-size-5xl);font-weight:900;line-height:1;"></div>
                    <div style="color:rgba(0,0,0,0.7);font-size:var(--font-size-sm);margin-top:var(--space-2);">با ضریب تلفات ${(SolarCalc.SYSTEM_DERATE * 100).toFixed(1)}%</div>
                </div>
            </div>
        `;
    },

    _productionTool() {
        return `
            <div class="card card--glass anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--sky">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    </div>
                    <div>
                        <div class="card__title">محاسبه تولید</div>
                        <div class="card__subtitle">تولید روزانه، ماهانه و سالانه</div>
                    </div>
                </div>
                <div class="field">
                    <label class="field__label">ظرفیت نصب‌شده (kW)</label>
                    <input type="number" class="input" id="prodKw" min="0.1" step="0.1" value="5">
                </div>
                <div class="field">
                    <label class="field__label">ساعات اوج آفتاب</label>
                    <input type="number" class="input" id="prodPSH" min="1" max="8" step="0.1" value="5.5">
                </div>
                <div id="prodResult" class="card card--sky" style="padding:var(--space-4);margin-top:var(--space-4);color:white;display:none;">
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-3);text-align:center;">
                        <div>
                            <div style="opacity:0.85;font-size:var(--font-size-xs);">روزانه</div>
                            <div id="prodDaily" style="font-weight:800;font-size:var(--font-size-2xl);"></div>
                            <div style="opacity:0.7;font-size:var(--font-size-xs);">kWh</div>
                        </div>
                        <div>
                            <div style="opacity:0.85;font-size:var(--font-size-xs);">ماهانه</div>
                            <div id="prodMonthly" style="font-weight:800;font-size:var(--font-size-2xl);"></div>
                            <div style="opacity:0.7;font-size:var(--font-size-xs);">kWh</div>
                        </div>
                        <div>
                            <div style="opacity:0.85;font-size:var(--font-size-xs);">سالانه</div>
                            <div id="prodYearly" style="font-weight:800;font-size:var(--font-size-2xl);"></div>
                            <div style="opacity:0.7;font-size:var(--font-size-xs);">kWh</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    _roiTool() {
        return `
            <div class="card card--glass anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--emerald">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <div>
                        <div class="card__title">بازگشت سرمایه (ROI)</div>
                        <div class="card__subtitle">محاسبه با تورم و افت سالانه</div>
                    </div>
                </div>
                <div class="field">
                    <label class="field__label">هزینه کل سیستم ($)</label>
                    <input type="number" class="input" id="roiCost" min="100" value="8000">
                </div>
                <div class="field">
                    <label class="field__label">تولید سالانه (kWh)</label>
                    <input type="number" class="input" id="roiYearly" min="100" value="8000">
                </div>
                <div class="field">
                    <label class="field__label">قیمت برق ($/kWh)</label>
                    <input type="number" class="input" id="roiPrice" min="0.01" step="0.01" value="0.10">
                </div>
                <div class="field">
                    <label class="field__label">نرخ تورم برق (% سالانه)</label>
                    <input type="number" class="input" id="roiInflation" min="0" max="20" step="0.5" value="3">
                </div>
                <div id="roiResult" class="card card--emerald" style="padding:var(--space-4);margin-top:var(--space-4);color:white;display:none;">
                    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-3);text-align:center;">
                        <div>
                            <div style="opacity:0.85;font-size:var(--font-size-xs);">صرفه‌جویی سال اول</div>
                            <div id="roiSavings" style="font-weight:800;font-size:var(--font-size-xl);"></div>
                        </div>
                        <div>
                            <div style="opacity:0.85;font-size:var(--font-size-xs);">دوره بازگشت</div>
                            <div id="roiPayback" style="font-weight:800;font-size:var(--font-size-xl);"></div>
                        </div>
                        <div>
                            <div style="opacity:0.85;font-size:var(--font-size-xs);">سود ۲۵ ساله</div>
                            <div id="roiProfit" style="font-weight:800;font-size:var(--font-size-xl);"></div>
                        </div>
                        <div>
                            <div style="opacity:0.85;font-size:var(--font-size-xs);">LCOE</div>
                            <div id="roiLcoe" style="font-weight:800;font-size:var(--font-size-xl);"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    _stringTool() {
        return `
            <div class="card card--glass anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--violet">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                    </div>
                    <div>
                        <div class="card__title">آرایش رشته پنل</div>
                        <div class="card__subtitle">محاسبه سری و موازی</div>
                    </div>
                </div>
                <div class="field">
                    <label class="field__label">تعداد کل پنل</label>
                    <input type="number" class="input" id="strCount" min="1" value="20">
                </div>
                <div class="field">
                    <label class="field__label">Voc هر پنل (V)</label>
                    <input type="number" class="input" id="strVoc" min="20" max="100" step="0.1" value="49.9">
                </div>
                <div class="field">
                    <label class="field__label">Vmp هر پنل (V)</label>
                    <input type="number" class="input" id="strVmp" min="10" max="60" step="0.1" value="41.8">
                </div>
                <div class="field">
                    <label class="field__label">Isc هر پنل (A)</label>
                    <input type="number" class="input" id="strIsc" min="1" max="30" step="0.1" value="13.99">
                </div>
                <div class="field">
                    <label class="field__label">حداکثر ولتاژ اینورتر (V)</label>
                    <input type="number" class="input" id="strMaxV" min="100" max="1500" value="1000">
                </div>
                <div class="field">
                    <label class="field__label">حداکثر جریان اینورتر (A)</label>
                    <input type="number" class="input" id="strMaxA" min="10" max="200" value="40">
                </div>
                <div id="strResult" class="card card--violet" style="padding:var(--space-4);margin-top:var(--space-4);color:white;display:none;">
                    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-3);text-align:center;">
                        <div>
                            <div style="opacity:0.85;font-size:var(--font-size-xs);">سری</div>
                            <div id="strSeries" style="font-weight:800;font-size:var(--font-size-2xl);"></div>
                            <div style="opacity:0.7;font-size:var(--font-size-xs);">پنل در رشته</div>
                        </div>
                        <div>
                            <div style="opacity:0.85;font-size:var(--font-size-xs);">موازی</div>
                            <div id="strParallel" style="font-weight:800;font-size:var(--font-size-2xl);"></div>
                            <div style="opacity:0.7;font-size:var(--font-size-xs);">رشته</div>
                        </div>
                        <div>
                            <div style="opacity:0.85;font-size:var(--font-size-xs);">ولتاژ کل</div>
                            <div id="strVoltage" style="font-weight:800;font-size:var(--font-size-xl);"></div>
                        </div>
                        <div>
                            <div style="opacity:0.85;font-size:var(--font-size-xs);">جریان کل</div>
                            <div id="strCurrent" style="font-weight:800;font-size:var(--font-size-xl);"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    _derateTool() {
        const factors = Object.entries(LOSS_FACTORS);
        return `
            <div class="card card--glass anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--violet">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    </div>
                    <div>
                        <div class="card__title">ضرایب تلفات سیستم</div>
                        <div class="card__subtitle">استاندارد NREL PVWatts</div>
                    </div>
                </div>
                <div class="list">
                    ${factors.map(([key, f]) => `
                        <div class="list-item" style="cursor:default;">
                            <div class="list-item__icon" style="background:rgba(245,158,11,0.12);color:var(--color-sun-300);">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="6" x2="12" y2="12"/></svg>
                            </div>
                            <div class="list-item__body">
                                <div class="list-item__title">${f.label}</div>
                                <div class="list-item__subtitle">${f.impact}</div>
                            </div>
                            <div style="text-align:left;flex-shrink:0;">
                                <div style="font-weight:800;color:var(--color-sun-300);">${(f.value * 100).toFixed(1)}%</div>
                                <div style="width:80px;margin-top:4px;"><div class="progress" style="height:4px;"><div class="progress__bar" style="width:${f.value * 100}%"></div></div></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="card card--violet" style="padding:var(--space-5);margin-top:var(--space-4);color:white;text-align:center;">
                    <div style="opacity:0.85;font-size:var(--font-size-sm);">ضریب کلی سیستم</div>
                    <div style="font-size:var(--font-size-5xl);font-weight:900;line-height:1;">${(SolarCalc.SYSTEM_DERATE * 100).toFixed(1)}%</div>
                    <div style="opacity:0.85;font-size:var(--font-size-sm);margin-top:var(--space-1);">یعنی ${((1 - SolarCalc.SYSTEM_DERATE) * 100).toFixed(1)}% تلفات کلی</div>
                </div>
            </div>
        `;
    },

    _bindTool() {
        // PV
        const updatePV = () => {
            const daily = parseFloat(document.getElementById('pvDaily')?.value) || 0;
            const psh = parseFloat(document.getElementById('pvPSH')?.value) || 5;
            const result = SolarCalc.calcPVSize(daily, psh);
            const res = document.getElementById('pvResult');
            const val = document.getElementById('pvResultValue');
            if (res) res.style.display = 'block';
            if (val) val.innerHTML = Utils.formatNumber(result, 2) + ' <span style="font-size:var(--font-size-md);">kWp</span>';
        };
        document.getElementById('pvDaily')?.addEventListener('input', updatePV);
        document.getElementById('pvPSH')?.addEventListener('input', updatePV);
        document.getElementById('pvLoc')?.addEventListener('change', (e) => {
            document.getElementById('pvPSH').value = e.target.value;
            updatePV();
        });
        updatePV();

        // Production
        const updateProd = () => {
            const kw = parseFloat(document.getElementById('prodKw')?.value) || 0;
            const psh = parseFloat(document.getElementById('prodPSH')?.value) || 5;
            const daily = SolarCalc.calcDailyProduction(kw, psh);
            const monthly = daily * 30;
            const yearly = SolarCalc.calcAnnualProduction(kw, psh);
            const res = document.getElementById('prodResult');
            if (res) res.style.display = 'block';
            const dEl = document.getElementById('prodDaily');
            const mEl = document.getElementById('prodMonthly');
            const yEl = document.getElementById('prodYearly');
            if (dEl) dEl.textContent = Utils.formatNumber(daily, 1);
            if (mEl) mEl.textContent = Utils.formatNumber(monthly, 0);
            if (yEl) yEl.textContent = Utils.formatNumber(yearly, 0);
        };
        document.getElementById('prodKw')?.addEventListener('input', updateProd);
        document.getElementById('prodPSH')?.addEventListener('input', updateProd);
        updateProd();

        // ROI
        const updateROI = () => {
            const cost = parseFloat(document.getElementById('roiCost')?.value) || 0;
            const yearly = parseFloat(document.getElementById('roiYearly')?.value) || 0;
            const price = parseFloat(document.getElementById('roiPrice')?.value) || 0.1;
            const inflation = (parseFloat(document.getElementById('roiInflation')?.value) || 0) / 100;
            const roi = SolarCalc.calcROI({ cost, yearlyProduction: yearly, electricityPrice: price, inflation });
            const res = document.getElementById('roiResult');
            if (res) res.style.display = 'block';
            const sEl = document.getElementById('roiSavings');
            const pEl = document.getElementById('roiPayback');
            const prEl = document.getElementById('roiProfit');
            const lEl = document.getElementById('roiLcoe');
            if (sEl) sEl.textContent = Utils.formatNumber(yearly * price) + ' $';
            if (pEl) pEl.textContent = isFinite(roi.payback) ? Utils.formatNumber(roi.payback, 1) + ' سال' : '∞';
            if (prEl) prEl.textContent = Utils.formatNumber(Math.round(roi.netProfit)) + ' $';
            if (lEl) lEl.textContent = Utils.formatNumber(roi.lcoe, 3) + ' $/kWh';
        };
        ['roiCost', 'roiYearly', 'roiPrice', 'roiInflation'].forEach((id) => {
            document.getElementById(id)?.addEventListener('input', updateROI);
        });
        updateROI();

        // String
        const updateStr = () => {
            const count = parseInt(document.getElementById('strCount')?.value) || 20;
            const voc = parseFloat(document.getElementById('strVoc')?.value) || 49.9;
            const vmp = parseFloat(document.getElementById('strVmp')?.value) || 41.8;
            const isc = parseFloat(document.getElementById('strIsc')?.value) || 13.99;
            const maxV = parseFloat(document.getElementById('strMaxV')?.value) || 1000;
            const maxA = parseFloat(document.getElementById('strMaxA')?.value) || 40;
            // Account for cold weather: Voc increases ~0.3%/°C
            const vocCold = voc * 1.10; // 10% safety
            const maxSeries = Math.floor(maxV / vocCold);
            const maxParallel = Math.floor(maxA / isc);
            const series = Math.max(1, Math.min(maxSeries, count));
            const parallel = Math.max(1, Math.min(maxParallel, Math.ceil(count / series)));
            const totalV = series * vmp;
            const totalA = parallel * isc;
            const res = document.getElementById('strResult');
            if (res) res.style.display = 'block';
            const sEl = document.getElementById('strSeries');
            const pEl = document.getElementById('strParallel');
            const vEl = document.getElementById('strVoltage');
            const cEl = document.getElementById('strCurrent');
            if (sEl) sEl.textContent = Utils.toPersian(series);
            if (pEl) pEl.textContent = Utils.toPersian(parallel);
            if (vEl) vEl.textContent = Utils.formatNumber(totalV, 0) + 'V';
            if (cEl) cEl.textContent = Utils.formatNumber(totalA, 1) + 'A';
        };
        ['strCount', 'strVoc', 'strVmp', 'strIsc', 'strMaxV', 'strMaxA'].forEach((id) => {
            document.getElementById(id)?.addEventListener('input', updateStr);
        });
        updateStr();
    }
};
