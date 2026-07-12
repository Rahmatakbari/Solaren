/**
 * ماشین‌حساب چند ارزی
 * Multi-Currency Calculator
 */
import { Utils } from '../utils.js';
import { toast, modal } from '../ui.js';
import { CURRENCIES, convert, formatCurrency, getCurrency, getCurrencyList, getLastUpdate, getRates, resetRates, setRates } from '../data/currencies.js';
import { settings } from '../store.js';

export const currency = {
    name: 'currency',
    path: '#currency',

    state: {
        amount: 1000,
        from: 'USD',
        to: 'AFN',
        editing: false
    },

    render() {
        const rates = getRates();
        const lastUpdate = getLastUpdate();
        const updateDate = lastUpdate ? new Date(lastUpdate).toLocaleDateString('fa-IR') : 'پیش‌فرض';

        return `
            <h1 class="page-title anim-fade-up">💱 ماشین‌حساب ارزی</h1>
            <p class="page-subtitle anim-fade-up">تبدیل بین ۱۳ ارز رایج + محاسبه قیمت با حاشیه سود</p>

            <!-- نمایش نرخ‌های فعلی -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-2);">
                    <div>
                        <div style="font-size:var(--font-size-sm);color:var(--color-text-muted);">📊 نرخ‌های فعلی (نسبت به دلار)</div>
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">آخرین به‌روزرسانی: ${updateDate}</div>
                    </div>
                    <button class="btn btn--secondary btn--sm" id="editRates">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        ویرایش نرخ‌ها
                    </button>
                </div>
            </div>

            <!-- ماشین‌حساب اصلی -->
            <div class="card anim-scale-in" style="background:linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);color:white;padding:var(--space-5);margin-bottom:var(--space-4);position:relative;overflow:hidden;">
                <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;">
                    <div style="font-size:var(--font-size-sm);opacity:0.85;margin-bottom:var(--space-2);">💰 مبلغ</div>
                    <div style="display:flex;align-items:center;gap:var(--space-2);">
                        <input type="number" class="input" id="curAmount" value="${this.state.amount}" min="0" step="any" style="background:rgba(255,255,255,0.95);color:#0c4a6e;font-size:var(--font-size-2xl);font-weight:800;text-align:center;border:none;flex:1;height:60px;">
                    </div>

                    <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:var(--space-2);margin-top:var(--space-3);align-items:center;">
                        <select class="input" id="curFrom" style="background:rgba(255,255,255,0.95);color:#0c4a6e;font-weight:700;">
                            ${Object.values(CURRENCIES).map(c => `<option value="${c.code}" ${this.state.from === c.code ? 'selected' : ''}>${c.flag} ${c.code} - ${c.name}</option>`).join('')}
                        </select>
                        <button class="btn-icon" id="swapCurrencies" style="background:rgba(255,255,255,0.2);color:white;width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
                        </button>
                        <select class="input" id="curTo" style="background:rgba(255,255,255,0.95);color:#0c4a6e;font-weight:700;">
                            ${Object.values(CURRENCIES).map(c => `<option value="${c.code}" ${this.state.to === c.code ? 'selected' : ''}>${c.flag} ${c.code} - ${c.name}</option>`).join('')}
                        </select>
                    </div>

                    <div style="background:rgba(0,0,0,0.2);border-radius:var(--radius-md);padding:var(--space-3);margin-top:var(--space-3);text-align:center;">
                        <div style="font-size:10px;opacity:0.85;">مبلغ تبدیل شده</div>
                        <div id="curResult" style="font-size:var(--font-size-3xl);font-weight:900;line-height:1.1;margin-top:4px;">-</div>
                        <div id="curRate" style="font-size:var(--font-size-xs);opacity:0.85;margin-top:6px;">-</div>
                    </div>
                </div>
            </div>

            <!-- نرخ‌های سریع -->
            <h2 class="section__title anim-fade-up">💹 نرخ‌های سریع (۱ دلار)</h2>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-2);margin-bottom:var(--space-4);">
                ${Object.entries(CURRENCIES).filter(([k]) => k !== 'USD').slice(0, 8).map(([code, c]) => `
                    <div class="card card--glass anim-fade-up" style="padding:var(--space-3);display:flex;align-items:center;gap:var(--space-2);">
                        <div style="font-size:24px;">${c.flag}</div>
                        <div style="flex:1;min-width:0;">
                            <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">${c.name}</div>
                            <div style="font-weight:800;font-size:var(--font-size-md);">${formatCurrency(rates[code] || 0, code)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- ماشین‌حساب قیمت با حاشیه سود -->
            <h2 class="section__title anim-fade-up">💼 محاسبه قیمت فروش</h2>
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="field">
                    <label class="field__label">قیمت خرید (دلار)</label>
                    <input type="number" class="input" id="marginCost" value="1000" min="0" step="any">
                </div>
                <div class="field">
                    <label class="field__label">حاشیه سود (%)</label>
                    <div class="input-slider">
                        <input type="range" id="marginPct" min="0" max="100" step="1" value="20">
                        <input type="number" class="input" id="marginPctV" min="0" max="500" step="1" value="20">
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);margin-top:var(--space-3);">
                    <div class="card" style="padding:var(--space-3);text-align:center;background:rgba(239,68,68,0.1);">
                        <div style="font-size:10px;color:var(--color-text-muted);">سود شما</div>
                        <div id="marginProfit" style="font-size:var(--font-size-xl);font-weight:800;color:var(--color-red-400);">-</div>
                    </div>
                    <div class="card" style="padding:var(--space-3);text-align:center;background:rgba(16,185,129,0.1);">
                        <div style="font-size:10px;color:var(--color-text-muted);">قیمت فروش</div>
                        <div id="marginPrice" style="font-size:var(--font-size-xl);font-weight:800;color:var(--color-emerald-400);">-</div>
                    </div>
                </div>
            </div>

            <!-- تبدیل همه ارزها -->
            <h2 class="section__title anim-fade-up">🌍 تبدیل در همه ارزها</h2>
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="field">
                    <label class="field__label">مبلغ به دلار</label>
                    <input type="number" class="input" id="allCurrenciesAmount" value="1000" min="0" step="any">
                </div>
                <div id="allCurrenciesResult" style="display:flex;flex-direction:column;gap:var(--space-2);margin-top:var(--space-3);">
                    ${this._renderAllCurrencies(1000)}
                </div>
            </div>

            <button class="btn btn--secondary btn--block" id="resetRates">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                بازنشانی نرخ‌ها
            </button>
        `;
    },

    _renderAllCurrencies(amount) {
        return Object.values(CURRENCIES).map(c => {
            const value = amount * getRates()[c.code];
            return `
                <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2);background:var(--color-bg-soft);border-radius:var(--radius-sm);">
                    <span style="font-size:20px;">${c.flag}</span>
                    <span style="font-weight:600;min-width:50px;">${c.code}</span>
                    <span style="flex:1;color:var(--color-text-muted);font-size:var(--font-size-sm);">${c.name}</span>
                    <span style="font-weight:800;color:var(--color-sun-300);">${formatCurrency(value, c.code)}</span>
                </div>
            `;
        }).join('');
    },

    attach() {
        // تبدیل ارز
        const updateConversion = () => {
            const amount = parseFloat(document.getElementById('curAmount').value) || 0;
            const from = document.getElementById('curFrom').value;
            const to = document.getElementById('curTo').value;
            this.state.amount = amount;
            this.state.from = from;
            this.state.to = to;
            const result = convert(amount, from, to);
            const rate = getRates()[to] / getRates()[from];
            document.getElementById('curResult').textContent = formatCurrency(result, to);
            document.getElementById('curRate').textContent = `۱ ${from} = ${formatCurrency(rate, to)}`;
        };
        document.getElementById('curAmount')?.addEventListener('input', updateConversion);
        document.getElementById('curFrom')?.addEventListener('change', updateConversion);
        document.getElementById('curTo')?.addEventListener('change', updateConversion);

        // معاوضه
        document.getElementById('swapCurrencies')?.addEventListener('click', () => {
            const f = document.getElementById('curFrom').value;
            const t = document.getElementById('curTo').value;
            document.getElementById('curFrom').value = t;
            document.getElementById('curTo').value = f;
            updateConversion();
        });

        // ویرایش نرخ‌ها
        document.getElementById('editRates')?.addEventListener('click', () => this._editRates());

        // حاشیه سود
        const marginCost = document.getElementById('marginCost');
        const marginPct = document.getElementById('marginPct');
        const marginPctV = document.getElementById('marginPctV');
        const updateMargin = () => {
            const cost = parseFloat(marginCost.value) || 0;
            const pct = parseFloat(marginPctV.value) || 0;
            const profit = cost * pct / 100;
            const price = cost + profit;
            document.getElementById('marginProfit').textContent = formatCurrency(profit, 'USD');
            document.getElementById('marginPrice').textContent = formatCurrency(price, 'USD');
        };
        marginCost?.addEventListener('input', updateMargin);
        marginPct?.addEventListener('input', () => {
            marginPctV.value = marginPct.value;
            updateMargin();
        });
        marginPctV?.addEventListener('input', () => {
            marginPct.value = Math.min(marginPctV.value, 100);
            updateMargin();
        });

        // همه ارزها
        document.getElementById('allCurrenciesAmount')?.addEventListener('input', (e) => {
            const amount = parseFloat(e.target.value) || 0;
            const result = document.getElementById('allCurrenciesResult');
            if (result) result.innerHTML = this._renderAllCurrencies(amount);
        });

        // بازنشانی
        document.getElementById('resetRates')?.addEventListener('click', () => {
            if (confirm('نرخ‌ها به مقدار پیش‌فرض بازگردد؟')) {
                resetRates();
                this._refresh();
                toast.success('نرخ‌ها بازنشانی شد');
            }
        });

        updateConversion();
        updateMargin();
    },

    _editRates() {
        const rates = getRates();
        const content = `
            <div style="padding:var(--space-3);max-height:60vh;overflow-y:auto;">
                <p style="font-size:var(--font-size-sm);color:var(--color-text-muted);margin-bottom:var(--space-3);">نرخ هر ارز را به ازای ۱ دلار وارد کنید:</p>
                ${Object.values(CURRENCIES).map(c => `
                    <div style="display:grid;grid-template-columns:40px 80px 1fr 100px;gap:var(--space-2);align-items:center;margin-bottom:var(--space-2);">
                        <span style="font-size:20px;">${c.flag}</span>
                        <strong>${c.code}</strong>
                        <span style="color:var(--color-text-muted);font-size:var(--font-size-sm);">${c.name}</span>
                        <input type="number" class="input" data-currency="${c.code}" value="${rates[c.code] || 0}" step="any" style="text-align:center;">
                    </div>
                `).join('')}
            </div>
        `;
        modal.open({
            title: '⚙️ ویرایش نرخ ارزها',
            content,
            actions: [
                { label: 'انصراف', class: 'btn--secondary', onclick: () => modal.close() },
                {
                    label: 'ذخیره',
                    class: 'btn--primary',
                    onclick: () => {
                        const inputs = document.querySelectorAll('[data-currency]');
                        const newRates = {};
                        inputs.forEach(inp => {
                            newRates[inp.dataset.currency] = parseFloat(inp.value) || 0;
                        });
                        setRates(newRates);
                        modal.close();
                        this._refresh();
                        toast.success('نرخ‌ها ذخیره شد');
                    }
                }
            ]
        });
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
