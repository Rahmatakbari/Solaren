/**
 * Financial Analysis v1 — Comprehensive financial modeling
 * Features: ROI, NPV, IRR, payback, cash flow projections, loan calculator
 */
import { Utils } from '../utils.js';
import { toast } from '../ui.js';
import { projects, settings } from '../store.js';

export const financial = {
    name: 'financial',
    path: '#financial',

    state: {
        systemCost: 8000,
        systemKw: 5,
        yearlyProduction: 8000,
        electricityPrice: 0.10,
        electricityInflation: 3,
        panelDegradation: 0.5,
        lifetime: 25,
        discountRate: 8,
        loanAmount: 0,
        loanRate: 12,
        loanYears: 5,
        currency: settings.get('currency', '$'),
        result: null
    },

    render() {
        return `
            <h1 class="page-title anim-fade-up">تحلیل مالی</h1>
            <p class="page-subtitle anim-fade-up">محاسبه ROI، NPV، IRR و جریان نقدی ۲۵ ساله</p>

            <form id="finForm" class="anim-fade-up" novalidate>
                <div class="card card--glass section">
                    <div class="card__header">
                        <div class="card__icon card__icon--sun">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        </div>
                        <div>
                            <div class="card__title">انتخاب پروژه (اختیاری)</div>
                            <div class="card__subtitle">از پروژه‌های ذخیره شده بارگذاری کنید</div>
                        </div>
                    </div>
                    ${projects.list().length > 0 ? `
                    <div class="field">
                        <select class="select" id="finProject">
                            <option value="">— محاسبه دستی —</option>
                            ${projects.list().map((p) => `<option value="${p.id}">${Utils.escapeHTML(p.name)} (${Utils.formatNumber(p.actualPvKw || p.requiredPvKw || 0, 1)} kW)</option>`).join('')}
                        </select>
                    </div>` : ''}
                </div>

                <div class="card card--glass section">
                    <div class="card__header">
                        <div class="card__icon card__icon--emerald">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        </div>
                        <div>
                            <div class="card__title">هزینه و سیستم</div>
                            <div class="card__subtitle">سرمایه‌گذاری اولیه</div>
                        </div>
                    </div>
                    <div class="field">
                        <label class="field__label">ظرفیت سیستم (kW)</label>
                        <div class="input-slider">
                            <input type="range" id="finKw" min="1" max="100" step="0.5" value="${this.state.systemKw}">
                            <input type="number" class="input" id="finKwV" min="0.5" max="500" step="0.5" value="${this.state.systemKw}">
                        </div>
                    </div>
                    <div class="field">
                        <label class="field__label">هزینه کل سیستم</label>
                        <div class="input-group">
                            <input type="number" class="input input--with-icon" id="finCost" min="500" value="${this.state.systemCost}">
                            <span class="input-group__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span>
                            <span class="input-group__suffix">${this.state.currency}</span>
                        </div>
                    </div>
                    <div class="field">
                        <label class="field__label">تولید سالانه (kWh)</label>
                        <input type="number" class="input" id="finProduction" min="100" value="${this.state.yearlyProduction}">
                        <p class="field__hint">معمولاً: ۱۵۰۰-۱۸۰۰ kWh به ازای هر kW نصب شده</p>
                    </div>
                </div>

                <div class="card card--glass section">
                    <div class="card__header">
                        <div class="card__icon card__icon--sky">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                        </div>
                        <div>
                            <div class="card__title">پارامترهای اقتصادی</div>
                            <div class="card__subtitle">قیمت برق و تورم</div>
                        </div>
                    </div>
                    <div class="field">
                        <label class="field__label">قیمت فعلی برق (${this.state.currency}/kWh)</label>
                        <input type="number" class="input" id="finPrice" min="0.01" step="0.01" value="${this.state.electricityPrice}">
                    </div>
                    <div class="field">
                        <label class="field__label">نرخ تورم سالانه برق (%)</label>
                        <div class="input-slider">
                            <input type="range" id="finInflation" min="0" max="20" step="0.5" value="${this.state.electricityInflation}">
                            <input type="number" class="input" id="finInflationV" min="0" max="20" step="0.5" value="${this.state.electricityInflation}">
                        </div>
                    </div>
                    <div class="field">
                        <label class="field__label">افت سالانه پنل (%)</label>
                        <div class="input-slider">
                            <input type="range" id="finDegradation" min="0" max="2" step="0.1" value="${this.state.panelDegradation}">
                            <input type="number" class="input" id="finDegradationV" min="0" max="5" step="0.1" value="${this.state.panelDegradation}">
                        </div>
                    </div>
                    <div class="field">
                        <label class="field__label">عمر مفید (سال)</label>
                        <div class="input-slider">
                            <input type="range" id="finLifetime" min="10" max="30" step="1" value="${this.state.lifetime}">
                            <input type="number" class="input" id="finLifetimeV" min="5" max="40" value="${this.state.lifetime}">
                        </div>
                    </div>
                    <div class="field">
                        <label class="field__label">نرخ تنزیل (Discount Rate %)</label>
                        <div class="input-slider">
                            <input type="range" id="finDiscount" min="0" max="20" step="0.5" value="${this.state.discountRate}">
                            <input type="number" class="input" id="finDiscountV" min="0" max="30" step="0.5" value="${this.state.discountRate}">
                        </div>
                        <p class="field__hint">برای محاسبه ارزش فعلی خالص (NPV)</p>
                    </div>
                </div>

                <div class="card card--glass section">
                    <div class="card__header">
                        <div class="card__icon" style="background:linear-gradient(135deg, #f59e0b, #d97706);color:white;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><line x1="6" y1="12" x2="6" y2="12"/></svg>
                        </div>
                        <div>
                            <div class="card__title">تسهیلات بانکی (اختیاری)</div>
                            <div class="card__subtitle">محاسبه اقساط و سود</div>
                        </div>
                    </div>
                    <div class="field">
                        <label class="field__label">مبلغ وام</label>
                        <div class="input-group">
                            <input type="number" class="input input--with-icon" id="finLoanAmt" min="0" value="${this.state.loanAmount}">
                            <span class="input-group__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/></svg></span>
                            <span class="input-group__suffix">${this.state.currency}</span>
                        </div>
                        <p class="field__hint">۰ = بدون وام (پرداخت نقدی)</p>
                    </div>
                    <div class="field">
                        <label class="field__label">نرخ سود سالانه (%)</label>
                        <div class="input-slider">
                            <input type="range" id="finLoanRate" min="0" max="30" step="0.5" value="${this.state.loanRate}">
                            <input type="number" class="input" id="finLoanRateV" min="0" max="30" step="0.5" value="${this.state.loanRate}">
                        </div>
                    </div>
                    <div class="field">
                        <label class="field__label">مدت بازپرداخت (سال)</label>
                        <div class="input-slider">
                            <input type="range" id="finLoanYears" min="1" max="20" step="1" value="${this.state.loanYears}">
                            <input type="number" class="input" id="finLoanYearsV" min="1" max="30" value="${this.state.loanYears}">
                        </div>
                    </div>
                </div>

                <button type="submit" class="btn btn--primary btn--block btn--lg">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="20 6 9 17 4 12"/></svg>
                    محاسبه تحلیل مالی
                </button>
            </form>

            <div id="finResult" style="margin-top:var(--space-5);"></div>
        `;
    },

    attach() {
        this._sync(this._bind);
    },

    _sync(bindFn) {
        const form = document.getElementById('finForm');
        if (!form) return;

        // Sliders
        const pairs = [
            ['finKw', 'finKwV', 'systemKw', 'float'],
            ['finInflation', 'finInflationV', 'electricityInflation', 'float'],
            ['finDegradation', 'finDegradationV', 'panelDegradation', 'float'],
            ['finLifetime', 'finLifetimeV', 'lifetime', 'int'],
            ['finDiscount', 'finDiscountV', 'discountRate', 'float'],
            ['finLoanRate', 'finLoanRateV', 'loanRate', 'float'],
            ['finLoanYears', 'finLoanYearsV', 'loanYears', 'int']
        ];
        pairs.forEach(([sliderId, valueId, stateKey, type]) => {
            const slider = document.getElementById(sliderId);
            const value = document.getElementById(valueId);
            if (slider) slider.addEventListener('input', () => { value.value = slider.value; this.state[stateKey] = type === 'int' ? +slider.value : parseFloat(slider.value); });
            if (value) value.addEventListener('input', () => { slider.value = value.value; this.state[stateKey] = type === 'int' ? +value.value : parseFloat(value.value); });
        });

        // Direct inputs
        ['finCost', 'finProduction', 'finPrice', 'finLoanAmt'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', (e) => {
                const map = { finCost: 'systemCost', finProduction: 'yearlyProduction', finPrice: 'electricityPrice', finLoanAmt: 'loanAmount' };
                this.state[map[id]] = parseFloat(e.target.value) || 0;
            });
        });

        // Project picker
        document.getElementById('finProject')?.addEventListener('change', (e) => {
            const p = projects.get(e.target.value);
            if (p) {
                this.state.systemCost = p.totalCost || 8000;
                this.state.systemKw = p.actualPvKw || p.requiredPvKw || 5;
                this.state.yearlyProduction = p.annualKWh || 8000;
                this._refresh();
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this._calculate();
        });

        if (bindFn) bindFn.call(this);
    },

    _refresh() {
        const view = document.getElementById('view');
        if (view) { view.innerHTML = this.render(); this.attach(); }
    },

    _calculate() {
        const r = this._runAnalysis();
        this.state.result = r;
        this._render(r);
    },

    _runAnalysis() {
        const {
            systemCost, systemKw, yearlyProduction, electricityPrice,
            electricityInflation, panelDegradation, lifetime, discountRate,
            loanAmount, loanRate, loanYears
        } = this.state;

        // Cash flow per year
        const years = [];
        let totalSavings = 0;
        let totalDiscountedSavings = 0;
        let cumulativeSavings = -systemCost; // start negative (investment)
        let cumulativeCashFlow = 0;
        let paybackYear = null;
        let discountedPayback = null;

        for (let y = 1; y <= lifetime; y++) {
            const production = yearlyProduction * Math.pow(1 - panelDegradation / 100, y - 1);
            const price = electricityPrice * Math.pow(1 + electricityInflation / 100, y - 1);
            const grossSaving = production * price;
            const discountFactor = 1 / Math.pow(1 + discountRate / 100, y);
            const discountedSaving = grossSaving * discountFactor;
            // Loan payment (if any)
            let loanPayment = 0;
            if (loanAmount > 0 && y <= loanYears) {
                const r = loanRate / 100 / 12;
                const n = loanYears * 12;
                if (r > 0) loanPayment = (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) * 12;
                else loanPayment = loanAmount / loanYears;
            }
            const netSaving = grossSaving - loanPayment;
            const netDiscounted = netSaving * discountFactor;
            cumulativeCashFlow += netSaving;
            cumulativeSavings = cumulativeCashFlow - systemCost;
            totalSavings += netSaving;
            totalDiscountedSavings += netDiscounted;

            if (paybackYear === null && cumulativeCashFlow >= systemCost) paybackYear = y;
            if (discountedPayback === null && totalDiscountedSavings >= 0) discountedPayback = y;

            years.push({
                year: y,
                production,
                price,
                grossSaving,
                loanPayment,
                netSaving,
                discountedSaving: netDiscounted,
                cumulative: cumulativeCashFlow - systemCost,
                discountedCumulative: totalDiscountedSavings - systemCost,
                discountFactor
            });
        }

        // NPV
        const npv = -systemCost + totalDiscountedSavings;
        // IRR (approximate)
        const irr = this._calcIRR(years, systemCost);
        // LCOE
        const lcoe = systemCost / (yearlyProduction * lifetime);
        // ROI
        const roi = (totalSavings - systemCost) / systemCost * 100;
        // Profitability Index
        const pi = totalDiscountedSavings / systemCost;

        return {
            years, npv, irr, lcoe, roi, pi,
            totalSavings, totalDiscountedSavings,
            paybackYear, discountedPayback,
            monthlyPayment: loanAmount > 0 ? this._calcMonthlyPayment(loanAmount, loanRate, loanYears) : 0,
            lifetimeRevenue: years.reduce((s, y) => s + y.grossSaving, 0),
            lifetimeProfit: totalSavings - systemCost,
            breakEvenProduction: systemCost / electricityPrice / lifetime
        };
    },

    _calcMonthlyPayment(principal, annualRate, years) {
        const r = annualRate / 100 / 12;
        const n = years * 12;
        if (r === 0) return principal / n;
        return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    },

    _calcIRR(years, initialCost) {
        // Bisection method
        const cashFlows = [-initialCost, ...years.map((y) => y.netSaving)];
        const npv = (rate) => cashFlows.reduce((sum, cf, i) => sum + cf / Math.pow(1 + rate, i), 0);
        let low = -0.5, high = 1.0;
        for (let i = 0; i < 50; i++) {
            const mid = (low + high) / 2;
            const v = npv(mid);
            if (Math.abs(v) < 0.01) return mid * 100;
            if (v > 0) low = mid;
            else high = mid;
        }
        return ((low + high) / 2) * 100;
    },

    _render(r) {
        const el = document.getElementById('finResult');
        if (!el) return;
        const cur = this.state.currency;

        el.innerHTML = `
            <div class="card card--emerald anim-scale-in" style="padding:var(--space-6);margin-bottom:var(--space-5);color:white;position:relative;overflow:hidden;">
                <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;">
                    <h2 style="color:white;font-size:var(--font-size-2xl);font-weight:800;margin-bottom:var(--space-4);">💰 خلاصه تحلیل مالی</h2>
                    <div class="stats" style="grid-template-columns:repeat(2,1fr);">
                        <div style="padding:var(--space-3);background:rgba(0,0,0,0.2);border-radius:var(--radius-md);text-align:center;">
                            <div style="opacity:0.85;font-size:var(--font-size-xs);text-transform:uppercase;">سود خالص (${this.state.lifetime} سال)</div>
                            <div style="font-weight:800;font-size:var(--font-size-3xl);">${Utils.formatNumber(Math.round(r.lifetimeProfit))} ${cur}</div>
                        </div>
                        <div style="padding:var(--space-3);background:rgba(0,0,0,0.2);border-radius:var(--radius-md);text-align:center;">
                            <div style="opacity:0.85;font-size:var(--font-size-xs);text-transform:uppercase;">دوره بازگشت</div>
                            <div style="font-weight:800;font-size:var(--font-size-3xl);">${r.paybackYear ? Utils.formatNumber(r.paybackYear, 1) + ' سال' : '∞'}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="stats stagger">
                <div class="stat stat--sun">
                    <div class="stat__label"><span class="badge-dot badge-dot--sun"></span> ROI کل</div>
                    <div class="stat__value">${Utils.formatNumber(r.roi, 0)}%</div>
                    <div class="stat__change ${r.roi > 0 ? 'stat__change--up' : 'stat__change--down'}">
                        ${r.roi > 0 ? '▲' : '▼'} سودآور
                    </div>
                </div>
                <div class="stat stat--sky">
                    <div class="stat__label"><span class="badge-dot badge-dot--sky"></span> NPV</div>
                    <div class="stat__value">${Utils.formatNumber(Math.round(r.npv))} ${cur}</div>
                    <div class="stat__change ${r.npv > 0 ? 'stat__change--up' : 'stat__change--down'}">
                        ${r.npv > 0 ? '▲' : '▼'} ارزش فعلی
                    </div>
                </div>
                <div class="stat stat--emerald">
                    <div class="stat__label"><span class="badge-dot badge-dot--emerald"></span> IRR</div>
                    <div class="stat__value">${Utils.formatNumber(r.irr, 1)}%</div>
                    <div class="stat__change">نرخ بازده داخلی</div>
                </div>
                <div class="stat stat--violet">
                    <div class="stat__label"><span class="badge-dot badge-dot--violet"></span> LCOE</div>
                    <div class="stat__value">${Utils.formatNumber(r.lcoe, 3)}</div>
                    <div class="stat__change">${cur}/kWh</div>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">📊 نمودار جریان نقدی</h2>
                </div>
                ${this._renderCashFlowChart(r.years)}
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">📅 جدول سالانه</h2>
                </div>
                <div style="overflow-x:auto;margin:0 -5px;">
                    <table style="width:100%;border-collapse:collapse;font-size:var(--font-size-xs);min-width:600px;">
                        <thead>
                            <tr style="background:var(--color-bg-soft);">
                                <th style="padding:var(--space-2);text-align:right;border:1px solid var(--color-border);">سال</th>
                                <th style="padding:var(--space-2);text-align:left;border:1px solid var(--color-border);">تولید</th>
                                <th style="padding:var(--space-2);text-align:left;border:1px solid var(--color-border);">قیمت برق</th>
                                <th style="padding:var(--space-2);text-align:left;border:1px solid var(--color-border);">صرفه‌جویی</th>
                                <th style="padding:var(--space-2);text-align:left;border:1px solid var(--color-border);">اقساط</th>
                                <th style="padding:var(--space-2);text-align:left;border:1px solid var(--color-border);">خالص</th>
                                <th style="padding:var(--space-2);text-align:left;border:1px solid var(--color-border);">تجمعی</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${r.years.slice(0, 15).map((y) => `
                                <tr>
                                    <td style="padding:var(--space-2);border:1px solid var(--color-border);">${Utils.toPersian(y.year)}</td>
                                    <td style="padding:var(--space-2);border:1px solid var(--color-border);text-align:left;">${Utils.formatNumber(Math.round(y.production))}</td>
                                    <td style="padding:var(--space-2);border:1px solid var(--color-border);text-align:left;">${Utils.formatNumber(y.price, 3)}</td>
                                    <td style="padding:var(--space-2);border:1px solid var(--color-border);text-align:left;color:var(--color-emerald-400);">${Utils.formatNumber(Math.round(y.grossSaving))} ${cur}</td>
                                    <td style="padding:var(--space-2);border:1px solid var(--color-border);text-align:left;color:var(--color-red-400);">${y.loanPayment > 0 ? Utils.formatNumber(Math.round(y.loanPayment)) + ' ' + cur : '-'}</td>
                                    <td style="padding:var(--space-2);border:1px solid var(--color-border);text-align:left;font-weight:700;color:${y.netSaving > 0 ? 'var(--color-emerald-400)' : 'var(--color-red-4 00)'};">${Utils.formatNumber(Math.round(y.netSaving))} ${cur}</td>
                                    <td style="padding:var(--space-2);border:1px solid var(--color-border);text-align:left;font-weight:700;color:${y.cumulative > 0 ? 'var(--color-emerald-400)' : 'var(--color-red-400)'};">${Utils.formatNumber(Math.round(y.cumulative))} ${cur}</td>
                                </tr>
                            `).join('')}
                            ${r.years.length > 15 ? `<tr><td colspan="7" style="text-align:center;padding:var(--space-2);color:var(--color-text-muted);">... و ${Utils.toPersian(r.years.length - 15)} سال دیگر (تا سال ${Utils.toPersian(r.years[r.years.length - 1].year)})</td></tr>` : ''}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">💼 تحلیل سرمایه‌گذاری</h2>
                </div>
                <div class="list" style="gap:var(--space-2);">
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__body">
                            <div class="list-item__title">سرمایه اولیه</div>
                            <div class="list-item__subtitle">هزینه کل سیستم</div>
                        </div>
                        <div style="font-weight:800;color:var(--color-red-400);">${Utils.formatNumber(this.state.systemCost)} ${cur}</div>
                    </div>
                    ${this.state.loanAmount > 0 ? `
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__body">
                            <div class="list-item__title">اقساط ماهانه</div>
                            <div class="list-item__subtitle">${Utils.toPersian(this.state.loanYears)} سال × ${this.state.loanRate}٪</div>
                        </div>
                        <div style="font-weight:800;color:var(--color-sun-300);">${Utils.formatNumber(Math.round(r.monthlyPayment))} ${cur}</div>
                    </div>
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__body">
                            <div class="list-item__title">کل بازپرداخت وام</div>
                            <div class="list-item__subtitle">${Utils.toPersian(this.state.loanYears)} سال</div>
                        </div>
                        <div style="font-weight:800;">${Utils.formatNumber(Math.round(r.monthlyPayment * this.state.loanYears * 12))} ${cur}</div>
                    </div>
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__body">
                            <div class="list-item__title">سود وام</div>
                            <div class="list-item__subtitle">مازاد بر اصل</div>
                        </div>
                        <div style="font-weight:800;color:var(--color-red-400);">${Utils.formatNumber(Math.round(r.monthlyPayment * this.state.loanYears * 12 - this.state.loanAmount))} ${cur}</div>
                    </div>` : ''}
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__body">
                            <div class="list-item__title">کل درآمد (${Utils.toPersian(this.state.lifetime)} سال)</div>
                            <div class="list-item__subtitle">صرفه‌جویی تجمعی</div>
                        </div>
                        <div style="font-weight:800;color:var(--color-emerald-400);">${Utils.formatNumber(Math.round(r.totalSavings))} ${cur}</div>
                    </div>
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__body">
                            <div class="list-item__title">سود خالص</div>
                            <div class="list-item__subtitle">پس از کسر هزینه اولیه</div>
                        </div>
                        <div style="font-weight:800;color:${r.lifetimeProfit > 0 ? 'var(--color-emerald-400)' : 'var(--color-red-400)'};">${Utils.formatNumber(Math.round(r.lifetimeProfit))} ${cur}</div>
                    </div>
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__body">
                            <div class="list-item__title">NPV (ارزش فعلی خالص)</div>
                            <div class="list-item__subtitle">با تنزیل ${this.state.discountRate}٪</div>
                        </div>
                        <div style="font-weight:800;color:${r.npv > 0 ? 'var(--color-emerald-400)' : 'var(--color-red-400)'};">${Utils.formatNumber(Math.round(r.npv))} ${cur}</div>
                    </div>
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__body">
                            <div class="list-item__title">IRR (نرخ بازده داخلی)</div>
                            <div class="list-item__subtitle">${r.irr > this.state.discountRate ? 'بالاتر از تنزیل ✓' : 'پایین‌تر از تنزیل'}</div>
                        </div>
                        <div style="font-weight:800;color:${r.irr > this.state.discountRate ? 'var(--color-emerald-400)' : 'var(--color-red-400)'};">${Utils.formatNumber(r.irr, 1)}%</div>
                    </div>
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__body">
                            <div class="list-item__title">LCOE (هزینه تراز شده انرژی)</div>
                            <div class="list-item__subtitle">هر کیلووات ساعت</div>
                        </div>
                        <div style="font-weight:800;color:${r.lcoe < this.state.electricityPrice ? 'var(--color-emerald-400)' : 'var(--color-red-400)'};">${Utils.formatNumber(r.lcoe, 3)} ${cur}</div>
                    </div>
                </div>
            </div>

            <div class="card card--violet section anim-fade-up" style="color:white;">
                <h3 style="color:white;margin-bottom:var(--space-3);">📋 توصیه سرمایه‌گذاری</h3>
                <div style="opacity:0.95;line-height:1.8;font-size:var(--font-size-sm);">
                    ${this._getRecommendation(r)}
                </div>
            </div>
        `;

        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    },

    _getRecommendation(r) {
        const recs = [];
        if (r.roi > 200) recs.push('✅ <strong>سرمایه‌گذاری عالی</strong> — بازدهی بیش از ۲۰۰٪ در طول عمر سیستم');
        else if (r.roi > 100) recs.push('✅ <strong>سرمایه‌گذاری خوب</strong> — بازدهی مناسب در بلندمدت');
        else if (r.roi > 0) recs.push('⚠️ <strong>سرمایه‌گذاری متوسط</strong> — بازدهی مثبت اما محدود');
        else recs.push('❌ <strong>سرمایه‌گذاری نامناسب</strong> — هزینه‌ها بیشتر از درآمد');

        if (r.paybackYear && r.paybackYear < 7) recs.push(`💰 <strong>بازگشت سریع سرمایه</strong> — در کمتر از ${Utils.formatNumber(r.paybackYear, 1)} سال`);
        else if (r.paybackYear && r.paybackYear > 12) recs.push(`⏰ <strong>بازگشت طولانی</strong> — ${Utils.formatNumber(r.paybackYear, 1)} سال طول می‌کشد`);

        if (r.irr > this.state.discountRate + 5) recs.push('📈 <strong>IRR بالا</strong> — ارزش سرمایه‌گذاری بالا');
        if (r.npv > 0) recs.push('💎 <strong>NPV مثبت</strong> — ایجاد ارزش برای سرمایه‌گذار');

        if (this.state.loanAmount > 0 && r.monthlyPayment > 0) {
            const monthlySavings = (this.state.yearlyProduction * this.state.electricityPrice) / 12;
            if (r.monthlyPayment > monthlySavings * 1.5) {
                recs.push('⚠️ <strong>اقساط بالا</strong> — اقساط ماهانه بیشتر از صرفه‌جویی است، بازپرداخت طولانی‌تر خواهد شد');
            } else {
                recs.push('✅ <strong>اقساط مناسب</strong> — کمتر از صرفه‌جویی ماهانه');
            }
        }

        if (r.lcoe < this.state.electricityPrice * 0.5) recs.push('💰 <strong>LCOE بسیار پایین</strong> — هزینه برق تولیدی کمتر از نصف قیمت برق شبکه');
        else if (r.lcoe < this.state.electricityPrice) recs.push('✅ <strong>LCOE پایین</strong> — برق خورشیدی ارزان‌تر از شبکه');
        else recs.push('⚠️ <strong>LCOE بالا</strong> — برق تولیدی گران‌تر از شبکه (نیاز به بررسی)');

        return '<ul style="padding-right:var(--space-5);">' + recs.map((r) => `<li style="margin-bottom:var(--space-2);">${r}</li>`).join('') + '</ul>';
    },

    _renderCashFlowChart(years) {
        if (years.length === 0) return '';
        const width = 360;
        const height = 200;
        const padding = 30;
        const maxVal = Math.max(...years.map((y) => Math.max(y.cumulative, 0)));
        const minVal = Math.min(...years.map((y) => Math.min(y.cumulative, 0)));
        const range = maxVal - minVal || 1;
        const stepX = (width - padding * 2) / Math.max(years.length - 1, 1);
        const zeroY = height - padding - ((0 - minVal) / range) * (height - padding * 2);

        const points = years.map((y, i) => {
            const x = padding + i * stepX;
            const yy = height - padding - ((y.cumulative - minVal) / range) * (height - padding * 2);
            return { x, y: yy, year: y.year, value: y.cumulative };
        });

        const pathData = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
        const fillData = pathData + ` L ${padding + (years.length - 1) * stepX} ${zeroY} L ${padding} ${zeroY} Z`;
        const paybackIdx = years.findIndex((y) => y.cumulative >= 0);

        return `
            <div style="background:var(--color-bg-soft);border-radius:var(--radius-md);padding:var(--space-3);">
                <div style="display:flex;justify-content:space-between;font-size:var(--font-size-xs);color:var(--color-text-dim);margin-bottom:var(--space-2);">
                    <span>جریان نقدی تجمعی</span>
                    <span>${this.state.lifetime} سال</span>
                </div>
                <svg viewBox="0 0 ${width} ${height}" style="width:100%;height:auto;display:block;">
                    <defs>
                        <linearGradient id="cfArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#10b981" stop-opacity="0.4"/>
                            <stop offset="100%" stop-color="#10b981" stop-opacity="0.05"/>
                        </linearGradient>
                    </defs>
                    <line x1="${padding}" y1="${zeroY}" x2="${width - padding}" y2="${zeroY}" stroke="var(--color-text-dim)" stroke-width="1" stroke-dasharray="3,3"/>
                    <path d="${fillData}" fill="url(#cfArea)"/>
                    <path d="${pathData}" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"/>
                    ${paybackIdx > 0 ? `<circle cx="${padding + paybackIdx * stepX}" cy="${zeroY}" r="5" fill="#fbbf24" stroke="#0a0e1a" stroke-width="2"/><text x="${padding + paybackIdx * stepX}" y="${zeroY - 12}" fill="#fbbf24" font-size="10" text-anchor="middle" font-weight="bold">بازگشت سال ${Utils.toPersian(paybackIdx)}</text>` : ''}
                    ${points.filter((_, i) => i % 5 === 0 || i === points.length - 1).map((p) => `<text x="${p.x}" y="${height - 5}" fill="var(--color-text-muted)" font-size="9" text-anchor="middle">${p.year}</text>`).join('')}
                </svg>
            </div>
        `;
    }
};
