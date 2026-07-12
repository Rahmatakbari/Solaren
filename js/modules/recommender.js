/**
 * ماژول توصیه‌گر هوشمند تجهیزات
 * Smart Equipment Recommender UI
 */
import { Utils } from '../utils.js';
import { toast } from '../ui.js';
import { LOCATIONS } from '../data/locations.js';
import { DEFAULT_APPLIANCES, APPLIANCE_PRESETS, generateRecommendations } from '../data/recommender.js';
import { projects } from '../store.js';

const STORAGE_INPUT = 'solar-pwa:recommender-input';

function loadInput() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_INPUT) || 'null');
        return saved || getDefaultInput();
    } catch { return getDefaultInput(); }
}

function saveInput(input) {
    try {
        localStorage.setItem(STORAGE_INPUT, JSON.stringify(input));
    } catch { /* silent */ }
}

function getDefaultInput() {
    return {
        step: 1,
        appliances: JSON.parse(JSON.stringify(DEFAULT_APPLIANCES)),
        location: 'kabul',
        systemType: 'hybrid',
        priority: 'balanced',
        phase: '1ph',
        budget: 5000,
        backupDays: 1,
        preferredBrand: ''
    };
}

export const recommender = {
    name: 'recommender',
    path: '#recommender',

    state: {
        input: null,
        result: null
    },

    render() {
        if (!this.state.input) {
            this.state.input = loadInput();
        }
        const input = this.state.input;
        const result = this.state.result;

        return `
            <h1 class="page-title anim-fade-up">🎯 توصیه‌گر هوشمند تجهیزات</h1>
            <p class="page-subtitle anim-fade-up">بهترین ترکیب پنل، اینورتر و باتری برای نیاز شما</p>

            <!-- پیشرفت -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);padding:var(--space-3);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);">
                    <span style="font-size:var(--font-size-sm);font-weight:600;">مرحله ${Utils.toPersian(input.step)} از ۴</span>
                    <span style="font-size:var(--font-size-xs);color:var(--color-text-muted);">${this._getStepTitle(input.step)}</span>
                </div>
                <div style="height:6px;background:var(--color-bg-soft);border-radius:var(--radius-full);overflow:hidden;">
                    <div style="height:100%;background:linear-gradient(90deg, #7c3aed, #0ea5e9);border-radius:var(--radius-full);width:${(input.step / 4) * 100}%;transition:width 0.4s ease;"></div>
                </div>
            </div>

            <div id="wizardContent">
                ${this._renderStep(input, result)}
            </div>
        `;
    },

    _getStepTitle(step) {
        return ['', 'وسایل برقی', 'موقعیت و نوع سیستم', 'بودجه و اولویت', 'نتایج'][step] || '';
    },

    _renderStep(input, result) {
        if (result) {
            return this._renderResult(result, input);
        }

        if (input.step === 1) return this._renderStep1(input);
        if (input.step === 2) return this._renderStep2(input);
        if (input.step === 3) return this._renderStep3(input);
        if (input.step === 4) return this._renderLoading();
        return '';
    },

    _renderStep1(input) {
        return `
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="card__header">
                    <div class="card__icon card__icon--violet" style="width:48px;height:48px;font-size:24px;">🔌</div>
                    <div>
                        <div class="card__title">وسایل برقی خود را مشخص کنید</div>
                        <div class="card__subtitle">تعداد، توان و ساعات استفاده روزانه</div>
                    </div>
                </div>

                <!-- پیش‌تنظیم‌های سریع -->
                <div style="margin:var(--space-3) 0;">
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-bottom:var(--space-2);">⚡ پیش‌تنظیم سریع:</div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">
                        <button class="quick-suggestion" data-preset="house-small" style="background:var(--color-surface-2);border:1px solid var(--color-border);border-radius:var(--radius-full);padding:6px 12px;font-size:var(--font-size-xs);cursor:pointer;">🏠 خانه کوچک</button>
                        <button class="quick-suggestion" data-preset="house-medium" style="background:var(--color-surface-2);border:1px solid var(--color-border);border-radius:var(--radius-full);padding:6px 12px;font-size:var(--font-size-xs);cursor:pointer;">🏡 خانه متوسط</button>
                        <button class="quick-suggestion" data-preset="villa" style="background:var(--color-surface-2);border:1px solid var(--color-border);border-radius:var(--radius-full);padding:6px 12px;font-size:var(--font-size-xs);cursor:pointer;">🏘️ ویلا</button>
                        <button class="quick-suggestion" data-preset="shop" style="background:var(--color-surface-2);border:1px solid var(--color-border);border-radius:var(--radius-full);padding:6px 12px;font-size:var(--font-size-xs);cursor:pointer;">🏪 مغازه</button>
                        <button class="quick-suggestion" data-preset="office" style="background:var(--color-surface-2);border:1px solid var(--color-border);border-radius:var(--radius-full);padding:6px 12px;font-size:var(--font-size-xs);cursor:pointer;">💼 دفتر</button>
                    </div>
                </div>

                <div id="applianceList" style="display:flex;flex-direction:column;gap:var(--space-2);margin:var(--space-3) 0;">
                    ${input.appliances.map((a, i) => `
                        <div class="card card--glass" style="padding:var(--space-3);">
                            <div style="display:grid;grid-template-columns:1fr 60px 80px 80px 30px;gap:var(--space-2);align-items:center;">
                                <input type="text" class="input" data-app-field="name" data-idx="${i}" value="${Utils.escapeHTML(a.name)}" placeholder="نام وسیله" style="padding:6px 10px;font-size:var(--font-size-sm);">
                                <input type="number" class="input" data-app-field="qty" data-idx="${i}" value="${a.qty}" min="1" style="padding:6px 10px;text-align:center;font-size:var(--font-size-sm);" title="تعداد">
                                <input type="number" class="input" data-app-field="watt" data-idx="${i}" value="${a.watt}" min="1" step="10" style="padding:6px 10px;text-align:center;font-size:var(--font-size-sm);" title="توان (W)">
                                <input type="number" class="input" data-app-field="hoursPerDay" data-idx="${i}" value="${a.hoursPerDay}" min="0" max="24" step="0.5" style="padding:6px 10px;text-align:center;font-size:var(--font-size-sm);" title="ساعت/روز">
                                <button class="btn-icon" data-remove-app="${i}" style="background:rgba(239,68,68,0.15);color:#ef4444;border:none;width:30px;height:30px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                            </div>
                            <div style="display:grid;grid-template-columns:1fr 60px 80px 80px 30px;gap:var(--space-2);font-size:10px;color:var(--color-text-muted);margin-top:4px;text-align:center;">
                                <div style="text-align:right;">نام</div>
                                <div>تعداد</div>
                                <div>W</div>
                                <div>ساعت</div>
                                <div></div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <button class="btn btn--secondary btn--block" id="addAppliance" style="margin-top:var(--space-2);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    افزودن وسیله جدید
                </button>

                <div style="background:linear-gradient(135deg, rgba(124,58,237,0.15), rgba(14,165,233,0.15));border:1px solid rgba(124,58,237,0.3);border-radius:var(--radius-md);padding:var(--space-3);margin-top:var(--space-3);" id="applianceSummary">
                    ${this._renderApplianceSummary(input.appliances)}
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);margin-top:var(--space-4);">
                    <button class="btn btn--secondary" id="resetAppliances">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        پیش‌فرض
                    </button>
                    <button class="btn btn--primary" id="nextStep1">
                        مرحله بعد
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>
            </div>
        `;
    },

    _renderApplianceSummary(appliances) {
        let totalW = 0, totalWh = 0;
        appliances.forEach(a => {
            const w = (a.watt || 0) * (a.qty || 1);
            totalW += w;
            totalWh += w * (a.hoursPerDay || 0);
        });
        return `
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2);text-align:center;">
                <div>
                    <div style="font-size:var(--font-size-xs);opacity:0.7;">توان لحظه‌ای</div>
                    <div style="font-weight:800;color:var(--color-sky-300);">${Utils.formatNumber(totalW, 0)} W</div>
                </div>
                <div>
                    <div style="font-size:var(--font-size-xs);opacity:0.7;">مصرف روزانه</div>
                    <div style="font-weight:800;color:var(--color-emerald-400);">${Utils.formatNumber(totalWh/1000, 1)} kWh</div>
                </div>
                <div>
                    <div style="font-size:var(--font-size-xs);opacity:0.7;">مصرف ماهانه</div>
                    <div style="font-weight:800;color:var(--color-sun-300);">${Utils.formatNumber(totalWh*30/1000, 0)} kWh</div>
                </div>
            </div>
        `;
    },

    _renderStep2(input) {
        return `
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="card__header">
                    <div class="card__icon card__icon--sky" style="width:48px;height:48px;font-size:24px;">📍</div>
                    <div>
                        <div class="card__title">موقعیت و نوع سیستم</div>
                        <div class="card__subtitle">محل نصب و نوع اتصال</div>
                    </div>
                </div>

                <div class="field" style="margin-top:var(--space-3);">
                    <label class="field__label">شهر / موقعیت</label>
                    <select class="input" id="locationSelect">
                        ${LOCATIONS.map(l => `
                            <option value="${l.id}" ${input.location === l.id ? 'selected' : ''}>
                                ${Utils.escapeHTML(l.name)} - ${Utils.formatNumber(l.psh, 1)} kWh/m²/روز
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div class="field">
                    <label class="field__label">نوع سیستم</label>
                    <div class="switch-group" id="systemTypeGroup">
                        <button type="button" class="${input.systemType === 'on-grid' ? 'is-active' : ''}" data-stype="on-grid">آنگرید</button>
                        <button type="button" class="${input.systemType === 'off-grid' ? 'is-active' : ''}" data-stype="off-grid">آفگرید</button>
                        <button type="button" class="${input.systemType === 'hybrid' ? 'is-active' : ''}" data-stype="hybrid">هیبرید</button>
                    </div>
                    <p style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-top:6px;">
                        ${this._getSystemTypeHint(input.systemType)}
                    </p>
                </div>

                <div class="field">
                    <label class="field__label">فاز برق</label>
                    <div class="switch-group" id="phaseGroup">
                        <button type="button" class="${input.phase === '1ph' ? 'is-active' : ''}" data-phase="1ph">تک فاز (۲۳۰V)</button>
                        <button type="button" class="${input.phase === '3ph' ? 'is-active' : ''}" data-phase="3ph">سه فاز (۴۰۰V)</button>
                    </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);margin-top:var(--space-4);">
                    <button class="btn btn--secondary" id="prevStep2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="15 18 9 12 15 6"/></svg>
                        قبلی
                    </button>
                    <button class="btn btn--primary" id="nextStep2">
                        مرحله بعد
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>
            </div>
        `;
    },

    _getSystemTypeHint(type) {
        if (type === 'on-grid') return '💡 متصل به شبکه - نیاز به باتری ندارد (ارزان‌تر)';
        if (type === 'off-grid') return '💡 مستقل از شبکه - حتماً باتری لازم دارد';
        return '💡 هم به شبکه وصل می‌شود هم باتری دارد (بهترین انتخاب برای افغانستان/ایران)';
    },

    _renderStep3(input) {
        return `
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="card__header">
                    <div class="card__icon card__icon--emerald" style="width:48px;height:48px;font-size:24px;">💰</div>
                    <div>
                        <div class="card__title">بودجه و اولویت</div>
                        <div class="card__subtitle">ترجیحات شما برای انتخاب</div>
                    </div>
                </div>

                <div class="field" style="margin-top:var(--space-3);">
                    <label class="field__label">اولویت اصلی</label>
                    <div style="display:flex;flex-direction:column;gap:var(--space-2);">
                        <label class="card card--glass" style="padding:var(--space-3);cursor:pointer;${input.priority === 'budget' ? 'border-color:var(--color-emerald-500);background:rgba(16,185,129,0.1);' : ''}">
                            <div style="display:flex;align-items:center;gap:var(--space-2);">
                                <input type="radio" name="priority" value="budget" ${input.priority === 'budget' ? 'checked' : ''} style="width:18px;height:18px;">
                                <div>
                                    <div style="font-weight:700;">💰 اقتصادی</div>
                                    <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">کمترین قیمت ممکن با کیفیت قابل قبول</div>
                                </div>
                            </div>
                        </label>
                        <label class="card card--glass" style="padding:var(--space-3);cursor:pointer;${input.priority === 'balanced' ? 'border-color:var(--color-sky-500);background:rgba(14,165,233,0.1);' : ''}">
                            <div style="display:flex;align-items:center;gap:var(--space-2);">
                                <input type="radio" name="priority" value="balanced" ${input.priority === 'balanced' ? 'checked' : ''} style="width:18px;height:18px;">
                                <div>
                                    <div style="font-weight:700;">⚖️ متعادل</div>
                                    <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">بهترین تعادل بین قیمت و کیفیت</div>
                                </div>
                            </div>
                        </label>
                        <label class="card card--glass" style="padding:var(--space-3);cursor:pointer;${input.priority === 'quality' ? 'border-color:var(--color-sun-500);background:rgba(245,158,11,0.1);' : ''}">
                            <div style="display:flex;align-items:center;gap:var(--space-2);">
                                <input type="radio" name="priority" value="quality" ${input.priority === 'quality' ? 'checked' : ''} style="width:18px;height:18px;">
                                <div>
                                    <div style="font-weight:700;">💎 کیفیت</div>
                                    <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">بهترین تجهیزات با بیشترین گارانتی</div>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                <div class="field">
                    <label class="field__label">بودجه تقریبی (دلار)</label>
                    <div class="input-slider">
                        <input type="range" id="budgetSlider" min="500" max="50000" step="500" value="${input.budget}">
                        <input type="number" class="input" id="budgetInput" min="100" step="100" value="${input.budget}">
                    </div>
                </div>

                ${input.systemType !== 'on-grid' ? `
                <div class="field">
                    <label class="field__label">روزهای بکاپ باتری</label>
                    <div class="switch-group" id="backupGroup">
                        <button type="button" class="${input.backupDays === 0.5 ? 'is-active' : ''}" data-bd="0.5">نیم روز</button>
                        <button type="button" class="${input.backupDays === 1 ? 'is-active' : ''}" data-bd="1">۱ روز</button>
                        <button type="button" class="${input.backupDays === 2 ? 'is-active' : ''}" data-bd="2">۲ روز</button>
                    </div>
                </div>
                ` : ''}

                <div class="field">
                    <label class="field__label">برند ترجیحی (اختیاری)</label>
                    <input type="text" class="input" id="preferredBrand" value="${Utils.escapeHTML(input.preferredBrand || '')}" placeholder="مثلاً: Growatt, Jinko, Pylontech">
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);margin-top:var(--space-4);">
                    <button class="btn btn--secondary" id="prevStep3">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="15 18 9 12 15 6"/></svg>
                        قبلی
                    </button>
                    <button class="btn btn--primary" id="generateRec">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                        دریافت پیشنهاد
                    </button>
                </div>
            </div>
        `;
    },

    _renderLoading() {
        return `
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);text-align:center;padding:var(--space-6);">
                <div style="font-size:48px;margin-bottom:var(--space-3);">🎯</div>
                <h3 style="margin-bottom:var(--space-2);">در حال تحلیل...</h3>
                <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);">در حال بررسی ${Utils.toPersian(0)} محصول و یافتن بهترین ترکیب</p>
            </div>
        `;
    },

    _renderResult(result, input) {
        const scenarioCards = result.scenarios.map((s, i) => `
            <div class="card anim-scale-in" style="padding:var(--space-4);margin-bottom:var(--space-3);background:linear-gradient(135deg, ${i === 0 ? '#0ea5e9' : i === 1 ? '#7c3aed' : '#f59e0b'} 0%, ${i === 0 ? '#0284c7' : i === 1 ? '#4f46e5' : '#d97706'} 100%);color:white;position:relative;overflow:hidden;">
                <div style="position:absolute;top:-30px;right:-30px;width:140px;height:140px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3);">
                        <div style="display:flex;align-items:center;gap:var(--space-2);">
                            <span style="font-size:32px;">${s.icon}</span>
                            <div>
                                <h3 style="color:white;margin:0;font-size:var(--font-size-lg);font-weight:800;">${s.name}</h3>
                                <p style="opacity:0.85;font-size:var(--font-size-xs);margin:2px 0 0;">${s.description}</p>
                            </div>
                        </div>
                        <span class="chip" style="background:rgba(255,255,255,0.25);color:white;border-color:transparent;">${Utils.toPersian(s.panelScore + s.inverterScore + s.batteryScore)} امتیاز</span>
                    </div>

                    <div style="background:rgba(0,0,0,0.2);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-3);">
                        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-2);text-align:center;">
                            <div>
                                <div style="font-size:10px;opacity:0.85;">پنل</div>
                                <div style="font-weight:800;">${Utils.toPersian(s.panelCount)} عدد</div>
                                <div style="font-size:10px;opacity:0.75;">${Utils.formatNumber(s.pvTotalKW, 1)} kWp</div>
                            </div>
                            <div>
                                <div style="font-size:10px;opacity:0.85;">اینورتر</div>
                                <div style="font-weight:800;">${Utils.formatNumber(s.inverter.powerKw, 1)} kW</div>
                                <div style="font-size:10px;opacity:0.75;">${s.inverter.brand}</div>
                            </div>
                            <div>
                                <div style="font-size:10px;opacity:0.85;">باتری</div>
                                <div style="font-weight:800;">${s.battery ? Utils.toPersian(s.batteryCount) + ' عدد' : 'ندارد'}</div>
                                <div style="font-size:10px;opacity:0.75;">${s.totalBatteryKWh ? Utils.formatNumber(s.totalBatteryKWh, 1) + ' kWh' : '-'}</div>
                            </div>
                            <div>
                                <div style="font-size:10px;opacity:0.85;">تولید روزانه</div>
                                <div style="font-weight:800;">${Utils.formatNumber(s.performance.expectedDailyKWh, 1)}</div>
                                <div style="font-size:10px;opacity:0.75;">kWh</div>
                            </div>
                        </div>
                    </div>

                    <div style="background:rgba(255,255,255,0.15);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-3);">
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);font-size:var(--font-size-sm);">
                            <div>
                                <div style="opacity:0.85;font-size:10px;">هزینه کل</div>
                                <div style="font-weight:800;font-size:var(--font-size-lg);">${Utils.formatNumber(s.costs.total)} $</div>
                            </div>
                            <div>
                                <div style="opacity:0.85;font-size:10px;">بازگشت سرمایه</div>
                                <div style="font-weight:800;font-size:var(--font-size-lg);">${Utils.formatNumber(s.performance.paybackYears, 1)} سال</div>
                            </div>
                            <div>
                                <div style="opacity:0.85;font-size:10px;">سالانه صرفه‌جویی</div>
                                <div style="font-weight:700;">${Utils.formatNumber(s.performance.yearlySaving)} $</div>
                            </div>
                            <div>
                                <div style="opacity:0.85;font-size:10px;">صرفه‌جویی ۲۵ ساله</div>
                                <div style="font-weight:700;">${Utils.formatNumber(s.performance.lifetimeSavings)} $</div>
                            </div>
                        </div>
                    </div>

                    <details style="background:rgba(0,0,0,0.15);border-radius:var(--radius-md);padding:var(--space-3);cursor:pointer;">
                        <summary style="font-weight:700;font-size:var(--font-size-sm);">📋 جزئیات و دلایل انتخاب</summary>
                        <div style="margin-top:var(--space-2);font-size:var(--font-size-sm);">
                            <div style="margin-bottom:var(--space-2);">
                                <strong>☀️ پنل:</strong> ${Utils.escapeHTML(s.panel.brand)} ${Utils.escapeHTML(s.panel.model)} (${s.panel.watt}W)
                                <ul style="margin:6px 0;padding-right:20px;font-size:var(--font-size-xs);opacity:0.9;">
                                    ${s.panelReasons.map(r => `<li>${Utils.escapeHTML(r)}</li>`).join('')}
                                </ul>
                            </div>
                            <div style="margin-bottom:var(--space-2);">
                                <strong>⚡ اینورتر:</strong> ${Utils.escapeHTML(s.inverter.brand)} ${Utils.escapeHTML(s.inverter.model)} (${s.inverter.powerKw}kW)
                                <ul style="margin:6px 0;padding-right:20px;font-size:var(--font-size-xs);opacity:0.9;">
                                    ${s.inverterReasons.map(r => `<li>${Utils.escapeHTML(r)}</li>`).join('')}
                                </ul>
                            </div>
                            ${s.battery ? `
                            <div>
                                <strong>🔋 باتری:</strong> ${Utils.escapeHTML(s.battery.brand)} ${Utils.escapeHTML(s.battery.model)}
                                <ul style="margin:6px 0;padding-right:20px;font-size:var(--font-size-xs);opacity:0.9;">
                                    ${s.batteryReasons.map(r => `<li>${Utils.escapeHTML(r)}</li>`).join('')}
                                </ul>
                            </div>
                            ` : ''}
                        </div>
                    </details>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);margin-top:var(--space-3);">
                        <button class="btn btn--sm" data-view-bom="${i}" style="background:rgba(255,255,255,0.95);color:#1a1a1a;font-weight:700;">
                            📋 لیست خرید
                        </button>
                        <button class="btn btn--sm" data-save-scenario="${i}" style="background:rgba(0,0,0,0.3);color:white;border:1px solid rgba(255,255,255,0.3);">
                            💾 ذخیره پروژه
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        return `
            <!-- خلاصه نیاز -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="card__header">
                    <div class="card__icon card__icon--emerald" style="width:48px;height:48px;font-size:24px;">📊</div>
                    <div>
                        <div class="card__title">خلاصه نیاز شما</div>
                        <div class="card__subtitle">${Utils.escapeHTML(result.location.name)} - ${Utils.formatNumber(result.location.psh, 1)} kWh/m²/روز</div>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2);margin-top:var(--space-3);text-align:center;">
                    <div>
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">توان لحظه‌ای</div>
                        <div style="font-weight:800;font-size:var(--font-size-lg);color:var(--color-sky-300);">${Utils.formatNumber(result.required.totalW)} W</div>
                    </div>
                    <div>
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">مصرف روزانه</div>
                        <div style="font-weight:800;font-size:var(--font-size-lg);color:var(--color-emerald-400);">${Utils.formatNumber(result.required.dailyKWh, 1)} kWh</div>
                    </div>
                    <div>
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">تعداد پنل</div>
                        <div style="font-weight:800;font-size:var(--font-size-lg);color:var(--color-sun-300);">${Utils.toPersian(result.panelCount)} عدد</div>
                    </div>
                </div>
            </div>

            <!-- سه سناریو -->
            <h2 class="section__title anim-fade-up">🎯 سه پیشنهاد هوشمند</h2>
            <div style="margin-bottom:var(--space-4);">
                ${scenarioCards}
            </div>

            <!-- مقایسه -->
            <h2 class="section__title anim-fade-up">📊 مقایسه سناریوها</h2>
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);overflow-x:auto;">
                <table style="width:100%;font-size:var(--font-size-sm);border-collapse:collapse;">
                    <thead>
                        <tr style="background:var(--color-bg-soft);">
                            <th style="padding:var(--space-2);text-align:right;border-bottom:1px solid var(--color-border);">معیار</th>
                            ${result.scenarios.map(s => `<th style="padding:var(--space-2);text-align:center;border-bottom:1px solid var(--color-border);color:var(--color-sun-300);">${s.icon} ${s.name}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding:var(--space-2);border-bottom:1px solid var(--color-border);">تعداد پنل</td>
                            ${result.scenarios.map(s => `<td style="padding:var(--space-2);text-align:center;border-bottom:1px solid var(--color-border);">${Utils.toPersian(s.panelCount)}</td>`).join('')}
                        </tr>
                        <tr>
                            <td style="padding:var(--space-2);border-bottom:1px solid var(--color-border);">ظرفیت PV</td>
                            ${result.scenarios.map(s => `<td style="padding:var(--space-2);text-align:center;border-bottom:1px solid var(--color-border);">${Utils.formatNumber(s.pvTotalKW, 1)} kWp</td>`).join('')}
                        </tr>
                        <tr>
                            <td style="padding:var(--space-2);border-bottom:1px solid var(--color-border);">اینورتر</td>
                            ${result.scenarios.map(s => `<td style="padding:var(--space-2);text-align:center;border-bottom:1px solid var(--color-border);">${Utils.formatNumber(s.inverter.powerKw, 1)} kW</td>`).join('')}
                        </tr>
                        <tr>
                            <td style="padding:var(--space-2);border-bottom:1px solid var(--color-border);">باتری</td>
                            ${result.scenarios.map(s => `<td style="padding:var(--space-2);text-align:center;border-bottom:1px solid var(--color-border);">${s.battery ? Utils.formatNumber(s.totalBatteryKWh, 1) + ' kWh' : '—'}</td>`).join('')}
                        </tr>
                        <tr>
                            <td style="padding:var(--space-2);border-bottom:1px solid var(--color-border);font-weight:700;">هزینه کل</td>
                            ${result.scenarios.map(s => `<td style="padding:var(--space-2);text-align:center;border-bottom:1px solid var(--color-border);font-weight:700;color:var(--color-sun-300);">${Utils.formatNumber(s.costs.total)} $</td>`).join('')}
                        </tr>
                        <tr>
                            <td style="padding:var(--space-2);border-bottom:1px solid var(--color-border);">بازگشت سرمایه</td>
                            ${result.scenarios.map(s => `<td style="padding:var(--space-2);text-align:center;border-bottom:1px solid var(--color-border);">${Utils.formatNumber(s.performance.paybackYears, 1)} سال</td>`).join('')}
                        </tr>
                        <tr>
                            <td style="padding:var(--space-2);">تولید سالانه</td>
                            ${result.scenarios.map(s => `<td style="padding:var(--space-2);text-align:center;">${Utils.formatNumber(s.performance.expectedYearlyKWh)} kWh</td>`).join('')}
                        </tr>
                    </tbody>
                </table>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);">
                <button class="btn btn--secondary" id="restartRec">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    شروع مجدد
                </button>
                <button class="btn btn--primary" id="exportRec">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    خروجی گزارش
                </button>
            </div>
        `;
    },

    attach() {
        this._bindCurrentStep();
    },

    _bindCurrentStep() {
        const input = this.state.input;
        const result = this.state.result;

        if (result) {
            this._bindResult(result);
            return;
        }

        if (input.step === 1) this._bindStep1();
        else if (input.step === 2) this._bindStep2();
        else if (input.step === 3) this._bindStep3();
    },

    _bindStep1() {
        const input = this.state.input;

        // ویرایش وسایل
        document.querySelectorAll('[data-app-field]').forEach(el => {
            el.addEventListener('input', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                const field = e.target.dataset.appField;
                const val = field === 'name' ? e.target.value : parseFloat(e.target.value) || 0;
                input.appliances[idx][field] = val;
                this._updateSummary();
            });
        });

        // حذف وسیله
        document.querySelectorAll('[data-remove-app]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.removeApp);
                if (input.appliances.length > 1) {
                    input.appliances.splice(idx, 1);
                    this._refreshWizard();
                }
            });
        });

        document.getElementById('addAppliance')?.addEventListener('click', () => {
            input.appliances.push({ name: 'وسیله جدید', qty: 1, watt: 100, hoursPerDay: 4 });
            this._refreshWizard();
        });

        document.getElementById('resetAppliances')?.addEventListener('click', () => {
            input.appliances = JSON.parse(JSON.stringify(DEFAULT_APPLIANCES));
            this._refreshWizard();
        });

        // Preset ها
        document.querySelectorAll('[data-preset]').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = APPLIANCE_PRESETS[btn.dataset.preset];
                if (preset) {
                    input.appliances = JSON.parse(JSON.stringify(preset));
                    this._refreshWizard();
                    toast.success('پیش‌تنظیم اعمال شد');
                }
            });
        });

        document.getElementById('nextStep1')?.addEventListener('click', () => {
            if (input.appliances.length === 0) {
                toast.error('حداقل یک وسیله اضافه کنید');
                return;
            }
            input.step = 2;
            saveInput(input);
            this._refreshWizard();
        });
    },

    _updateSummary() {
        const summary = document.getElementById('applianceSummary');
        if (summary) summary.innerHTML = this._renderApplianceSummary(this.state.input.appliances);
    },

    _bindStep2() {
        const input = this.state.input;

        document.getElementById('locationSelect')?.addEventListener('change', (e) => {
            input.location = e.target.value;
        });

        document.querySelectorAll('[data-stype]').forEach(btn => {
            btn.addEventListener('click', () => {
                input.systemType = btn.dataset.stype;
                document.querySelectorAll('[data-stype]').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                // آپدیت hint
                const hint = btn.parentElement.nextElementSibling;
                if (hint && hint.tagName === 'P') hint.textContent = this._getSystemTypeHint(input.systemType);
            });
        });

        document.querySelectorAll('[data-phase]').forEach(btn => {
            btn.addEventListener('click', () => {
                input.phase = btn.dataset.phase;
                document.querySelectorAll('[data-phase]').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
            });
        });

        document.getElementById('prevStep2')?.addEventListener('click', () => {
            input.step = 1;
            this._refreshWizard();
        });

        document.getElementById('nextStep2')?.addEventListener('click', () => {
            input.step = 3;
            saveInput(input);
            this._refreshWizard();
        });
    },

    _bindStep3() {
        const input = this.state.input;

        document.querySelectorAll('input[name="priority"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                input.priority = e.target.value;
            });
        });

        const budgetSlider = document.getElementById('budgetSlider');
        const budgetInput = document.getElementById('budgetInput');
        if (budgetSlider && budgetInput) {
            budgetSlider.addEventListener('input', () => {
                budgetInput.value = budgetSlider.value;
                input.budget = parseInt(budgetSlider.value);
            });
            budgetInput.addEventListener('input', () => {
                const v = parseInt(budgetInput.value) || 500;
                budgetSlider.value = Math.min(v, 50000);
                input.budget = v;
            });
        }

        document.querySelectorAll('[data-bd]').forEach(btn => {
            btn.addEventListener('click', () => {
                input.backupDays = parseFloat(btn.dataset.bd);
                document.querySelectorAll('[data-bd]').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
            });
        });

        document.getElementById('preferredBrand')?.addEventListener('input', (e) => {
            input.preferredBrand = e.target.value;
        });

        document.getElementById('prevStep3')?.addEventListener('click', () => {
            input.step = 2;
            this._refreshWizard();
        });

        document.getElementById('generateRec')?.addEventListener('click', () => {
            saveInput(input);
            this._generate();
        });
    },

    _generate() {
        try {
            this.state.result = generateRecommendations(this.state.input);
            toast.success(`${Utils.toPersian(this.state.result.scenarios.length)} پیشنهاد آماده شد`);
            this._refreshWizard();
        } catch (e) {
            console.error(e);
            toast.error('خطا در تولید پیشنهاد');
        }
    },

    _bindResult(result) {
        const input = this.state.input;

        document.querySelectorAll('[data-save-scenario]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.saveScenario);
                const s = result.scenarios[idx];
                projects.save({
                    name: `سیستم ${s.panelCount} پنل ${s.inverter.powerKw}kW - ${s.name}`,
                    totalCost: s.costs.total,
                    totalCapacity: s.pvTotalKW,
                    numPanels: s.panelCount,
                    actualPvKw: s.pvTotalKW,
                    panel: s.panel.id,
                    inverter: s.inverter.id,
                    battery: s.battery ? s.battery.id : null,
                    location: input.location,
                    systemType: input.systemType
                });
                toast.success('پروژه ذخیره شد');
                setTimeout(() => location.hash = '#projects', 600);
            });
        });

        document.querySelectorAll('[data-view-bom]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.viewBom);
                const s = result.scenarios[idx];
                location.hash = '#bom';
                setTimeout(() => {
                    // ارسال رویداد برای BOM
                    window.dispatchEvent(new CustomEvent('recommender-bom', { detail: s }));
                }, 300);
            });
        });

        document.getElementById('restartRec')?.addEventListener('click', () => {
            this.state.input = getDefaultInput();
            this.state.result = null;
            saveInput(this.state.input);
            this._refreshWizard();
        });

        document.getElementById('exportRec')?.addEventListener('click', () => {
            this._exportReport(result, input);
        });
    },

    _exportReport(result, input) {
        const w = window.open('', '_blank');
        if (!w) {
            toast.error('پنجره باز نشد');
            return;
        }
        const html = `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="UTF-8"><title>گزارش توصیه سیستم سولر</title>
<style>
@page { size: A4; margin: 1.5cm; }
body { font-family: 'Tahoma', sans-serif; color: #1a1a1a; line-height: 1.6; padding: 20px; }
h1 { color: #7c3aed; border-bottom: 3px solid #a78bfa; padding-bottom: 10px; }
h2 { color: #7c3aed; margin-top: 20px; border-right: 4px solid #a78bfa; padding-right: 10px; }
.scenario { background: #f5f3ff; border-radius: 8px; padding: 15px; margin: 15px 0; }
table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
th { background: #ede9fe; padding: 8px; text-align: right; border: 1px solid #c4b5fd; }
td { padding: 8px; border: 1px solid #e5e7eb; }
.info-box { background: #eff6ff; border-right: 4px solid #0ea5e9; padding: 10px; margin: 10px 0; border-radius: 4px; }
</style></head><body>
<h1>🎯 گزارش توصیه سیستم سولر</h1>
<div class="info-box">
<p><strong>موقعیت:</strong> ${result.location.name} - ${result.location.psh} kWh/m²/روز</p>
<p><strong>نوع سیستم:</strong> ${input.systemType === 'on-grid' ? 'آنگرید' : input.systemType === 'off-grid' ? 'آفگرید' : 'هیبرید'}</p>
<p><strong>بار مصرفی:</strong> ${Utils.formatNumber(result.required.totalW)} W (${Utils.formatNumber(result.required.dailyKWh, 1)} kWh/روز)</p>
</div>
${result.scenarios.map(s => `
<h2>${s.icon} سناریوی ${s.name} - ${Utils.formatNumber(s.costs.total)} $</h2>
<div class="scenario">
<table>
<tr><th>تجهیز</th><th>مشخصات</th></tr>
<tr><td>☀️ پنل</td><td>${s.panel.brand} ${s.panel.model} - ${s.panel.watt}W × ${s.panelCount} عدد = ${Utils.formatNumber(s.pvTotalKW, 1)} kWp</td></tr>
<tr><td>⚡ اینورتر</td><td>${s.inverter.brand} ${s.inverter.model} - ${s.inverter.powerKw} kW (${s.inverter.type})</td></tr>
${s.battery ? `<tr><td>🔋 باتری</td><td>${s.battery.brand} ${s.battery.model} - ${s.batteryCount} عدد (${Utils.formatNumber(s.totalBatteryKWh, 1)} kWh)</td></tr>` : ''}
<tr><td>💰 هزینه کل</td><td><strong>${Utils.formatNumber(s.costs.total)} $</strong></td></tr>
<tr><td>📊 تولید روزانه</td><td>${Utils.formatNumber(s.performance.expectedDailyKWh, 1)} kWh</td></tr>
<tr><td>📅 بازگشت سرمایه</td><td>${Utils.formatNumber(s.performance.paybackYears, 1)} سال</td></tr>
</table>
<h3>دلایل انتخاب پنل:</h3>
<ul>${s.panelReasons.map(r => `<li>${r}</li>`).join('')}</ul>
<h3>دلایل انتخاب اینورتر:</h3>
<ul>${s.inverterReasons.map(r => `<li>${r}</li>`).join('')}</ul>
${s.battery ? `<h3>دلایل انتخاب باتری:</h3><ul>${s.batteryReasons.map(r => `<li>${r}</li>`).join('')}</ul>` : ''}
</div>
`).join('')}
<p style="margin-top:30px;text-align:center;color:#999;font-size:11px;">Solaren Pro - گزارش تولید شده خودکار - ${new Date().toLocaleDateString('fa-IR')}</p>
</body></html>`;
        w.document.write(html);
        w.document.close();
        w.focus();
        setTimeout(() => w.print(), 400);
    },

    _refreshWizard() {
        const content = document.getElementById('wizardContent');
        if (content) {
            content.style.opacity = '0';
            setTimeout(() => {
                content.innerHTML = this._renderStep(this.state.input, this.state.result);
                content.style.opacity = '1';
                this._bindCurrentStep();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 150);
        }
        // بروزرسانی نوار پیشرفت
        const main = document.getElementById('view');
        if (main) {
            const progress = main.querySelector('.card.card--glass');
            // ساده‌تر: فقط محتوا رو عوض می‌کنیم
        }
    }
};
