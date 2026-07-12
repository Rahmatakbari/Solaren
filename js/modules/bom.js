/**
 * Complete Bill of Materials (BOM) Generator v1
 * Shows customers exactly what to buy for their system
 */
import { Utils } from '../utils.js';
import { toast } from '../ui.js';
import { BOM_RULES, CONNECTION_GUIDE } from '../data/bom-rules.js';
import { findPanel } from '../data/panels.js';

export const bom = {
    name: 'bom',
    path: '#bom',

    state: {
        systemKw: 5,
        systemType: 'hybrid',
        panelWatt: 550,
        batteryKWh: 10,
        backupHours: 4,
        result: null
    },

    render() {
        return `
            <h1 class="page-title anim-fade-up">لیست کامل تجهیزات (BOM)</h1>
            <p class="page-subtitle anim-fade-up">دقیقاً بفهمید برای سیستم خود چه چیزی نیاز دارید</p>

            <form id="bomForm" class="anim-fade-up" novalidate>
                <div class="card card--glass section">
                    <div class="card__header">
                        <div class="card__icon card__icon--sun">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        </div>
                        <div>
                            <div class="card__title">مشخصات سیستم</div>
                            <div class="card__subtitle">ظرفیت و نوع سیستم را مشخص کنید</div>
                        </div>
                    </div>

                    <div class="field">
                        <label class="field__label field__label--required">ظرفیت سیستم (kW)</label>
                        <div class="input-slider">
                            <input type="range" id="bomKw" min="1" max="100" step="0.5" value="${this.state.systemKw}">
                            <input type="number" class="input" id="bomKwV" min="0.5" max="500" step="0.5" value="${this.state.systemKw}">
                        </div>
                        <p class="field__hint">مثال: ۵kW، ۱۰kW، ۲۰kW</p>
                    </div>

                    <div class="field">
                        <label class="field__label">نوع سیستم</label>
                        <div class="switch-group" id="bomType">
                            <button class="${this.state.systemType === 'on-grid' ? 'is-active' : ''}" data-val="on-grid">آنگرید</button>
                            <button class="${this.state.systemType === 'off-grid' ? 'is-active' : ''}" data-val="off-grid">آفگرید</button>
                            <button class="${this.state.systemType === 'hybrid' ? 'is-active' : ''}" data-val="hybrid">هیبرید</button>
                        </div>
                    </div>

                    <div class="field">
                        <label class="field__label">توان پنل</label>
                        <div class="switch-group" id="bomPanel">
                            <button class="${this.state.panelWatt === 450 ? 'is-active' : ''}" data-val="450">۴۵۰W</button>
                            <button class="${this.state.panelWatt === 550 ? 'is-active' : ''}" data-val="550">۵۵۰W</button>
                            <button class="${this.state.panelWatt === 410 ? 'is-active' : ''}" data-val="410">۴۱۰W</button>
                        </div>
                    </div>

                    ${this.state.systemType !== 'on-grid' ? `
                    <div class="field">
                        <label class="field__label">ظرفیت باتری (kWh)</label>
                        <div class="input-slider">
                            <input type="range" id="bomBat" min="2" max="100" step="1" value="${this.state.batteryKWh}">
                            <input type="number" class="input" id="bomBatV" min="1" max="500" value="${this.state.batteryKWh}">
                        </div>
                    </div>
                    <div class="field">
                        <label class="field__label">ساعات پشتیبان‌گیری</label>
                        <div class="input-slider">
                            <input type="range" id="bomBackup" min="1" max="24" value="${this.state.backupHours}">
                            <input type="number" class="input" id="bomBackupV" min="1" max="48" value="${this.state.backupHours}">
                        </div>
                    </div>
                    ` : ''}

                    <button type="submit" class="btn btn--primary btn--block btn--lg">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                        محاسبه لیست تجهیزات
                    </button>
                </div>
            </form>

            <div id="bomResult" style="margin-top:var(--space-5);"></div>
        `;
    },

    attach() {
        const updateKw = (v) => { this.state.systemKw = parseFloat(v) || 5; };
        const updateBat = (v) => { this.state.batteryKWh = parseFloat(v) || 10; };
        const updateBackup = (v) => { this.state.backupHours = parseInt(v) || 4; };

        const slider = document.getElementById('bomKw');
        const value = document.getElementById('bomKwV');
        slider?.addEventListener('input', () => { value.value = slider.value; updateKw(slider.value); });
        value?.addEventListener('input', () => { slider.value = value.value; updateKw(value.value); });

        const batSlider = document.getElementById('bomBat');
        const batValue = document.getElementById('bomBatV');
        batSlider?.addEventListener('input', () => { batValue.value = batSlider.value; updateBat(batSlider.value); });
        batValue?.addEventListener('input', () => { batSlider.value = batValue.value; updateBat(batValue.value); });

        const backupSlider = document.getElementById('bomBackup');
        const backupValue = document.getElementById('bomBackupV');
        backupSlider?.addEventListener('input', () => { backupValue.value = backupSlider.value; updateBackup(backupSlider.value); });
        backupValue?.addEventListener('input', () => { backupSlider.value = backupValue.value; updateBackup(backupValue.value); });

        document.querySelectorAll('#bomType button').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.systemType = btn.dataset.val;
                document.querySelectorAll('#bomType button').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                this._refresh();
            });
        });

        document.querySelectorAll('#bomPanel button').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.panelWatt = +btn.dataset.val;
                document.querySelectorAll('#bomPanel button').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
            });
        });

        document.getElementById('bomForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this._calculate();
        });
    },

    _refresh() {
        const view = document.getElementById('view');
        if (view) { view.innerHTML = this.render(); this.attach(); }
    },

    _calculate() {
        const result = BOM_RULES.generate({
            systemKw: this.state.systemKw,
            systemType: this.state.systemType,
            panelWatt: this.state.panelWatt,
            batteryKWh: this.state.batteryKWh,
            backupHours: this.state.backupHours
        });
        this.state.result = result;
        this._renderResult(result);
    },

    _renderResult(r) {
        const el = document.getElementById('bomResult');
        if (!el) return;

        const items = this._flatItems(r);
        const totalQty = items.reduce((s, i) => s + i.qty, 0);
        const totalCostEstimate = this._estimateTotalCost(items);

        el.innerHTML = `
            <div class="card card--sun anim-scale-in" style="padding:var(--space-6);margin-bottom:var(--space-5);position:relative;overflow:hidden;">
                <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;color:var(--color-text-inverse);">
                    <h2 style="font-size:var(--font-size-2xl);font-weight:800;margin-bottom:var(--space-3);">📋 لیست کامل تجهیزات</h2>
                    <div class="stats" style="grid-template-columns:repeat(3,1fr);">
                        <div style="padding:var(--space-3);background:rgba(0,0,0,0.15);border-radius:var(--radius-md);text-align:center;">
                            <div style="opacity:0.7;font-size:var(--font-size-xs);text-transform:uppercase;">سیستم</div>
                            <div style="font-weight:800;font-size:var(--font-size-2xl);">${Utils.formatNumber(this.state.systemKw, 1)} kW</div>
                            <div style="opacity:0.7;font-size:var(--font-size-xs);">${this._typeLabel(this.state.systemType)}</div>
                        </div>
                        <div style="padding:var(--space-3);background:rgba(0,0,0,0.15);border-radius:var(--radius-md);text-align:center;">
                            <div style="opacity:0.7;font-size:var(--font-size-xs);text-transform:uppercase;">تعداد اقلام</div>
                            <div style="font-weight:800;font-size:var(--font-size-2xl);">${Utils.toPersian(totalQty)}</div>
                        </div>
                        <div style="padding:var(--space-3);background:rgba(0,0,0,0.15);border-radius:var(--radius-md);text-align:center;">
                            <div style="opacity:0.7;font-size:var(--font-size-xs);text-transform:uppercase;">دسته‌بندی</div>
                            <div style="font-weight:800;font-size:var(--font-size-2xl);">${Utils.toPersian(this._categories(r).length)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 1. Panels -->
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--sun">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
                    </div>
                    <div style="flex:1;">
                        <div class="card__title">☀️ ۱. پنل‌های خورشیدی</div>
                        <div class="card__subtitle">${Utils.toPersian(r.panels.count)} پنل ${r.panels.watt}W · ${r.panels.totalKw} kWp</div>
                    </div>
                </div>
                <div style="background:var(--color-bg-soft);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-3);">
                    <div style="font-size:var(--font-size-sm);color:var(--color-text-muted);margin-bottom:var(--space-2);">⚙️ <strong style="color:var(--color-text);">آرایش:</strong> ${r.panels.configuration}</div>
                    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-2);font-size:var(--font-size-xs);color:var(--color-text-muted);">
                        <div>• ${Utils.toPersian(r.panels.seriesCount)} پنل در هر رشته (سری)</div>
                        <div>• ${Utils.toPersian(r.panels.parallelCount)} رشته موازی</div>
                        <div>• ولتاژ هر رشته: ${Utils.formatNumber(r.panels.seriesCount * r.panels.panelVmp, 1)}V</div>
                        <div>• جریان کل: ${Utils.formatNumber(r.panels.parallelCount * r.panels.panelImp, 1)}A</div>
                    </div>
                </div>
                <div class="result">
                    <div class="result__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>
                    <div class="result__body">
                        <div class="result__title">پنل خورشیدی Mono ${r.panels.watt}W</div>
                        <div class="result__meta">Voc: ${r.panels.panelVoc}V · Imp: ${r.panels.panelImp}A · η: ۲۰٪+</div>
                    </div>
                    <div class="result__price">
                        <div class="result__price-value">${Utils.toPersian(r.panels.count)}</div>
                        <div class="result__price-label">عدد</div>
                    </div>
                </div>
            </div>

            <!-- 2. Inverter -->
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--sky">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    </div>
                    <div style="flex:1;">
                        <div class="card__title">🔌 ۲. اینورتر</div>
                        <div class="card__subtitle">${Utils.formatNumber(r.inverter.powerKw, 1)} kW · ${r.inverter.type}</div>
                    </div>
                </div>
                <div class="result">
                    <div class="result__icon result__icon--sky">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    </div>
                    <div class="result__body">
                        <div class="result__title">اینورتر ${r.inverter.threePhase ? 'سه فاز' : 'تک فاز'} ${Utils.formatNumber(r.inverter.powerKw, 1)} kW</div>
                        <div class="result__meta">${r.inverter.specs.mpptCount} MPPT · PV max: ${r.inverter.specs.maxPvV}V</div>
                    </div>
                    <div class="result__price">
                        <div class="result__price-value">۱</div>
                        <div class="result__price-label">دستگاه</div>
                    </div>
                </div>
            </div>

            ${r.batteries ? `
            <!-- 3. Batteries -->
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--emerald">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="2" y="7" width="18" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>
                    </div>
                    <div style="flex:1;">
                        <div class="card__title">🔋 ۳. باتری‌ها</div>
                        <div class="card__subtitle">${Utils.formatNumber(r.batteries.requiredKWh, 1)} kWh در ${r.batteries.voltage}V</div>
                    </div>
                </div>
                <div class="result">
                    <div class="result__icon result__icon--emerald">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="18" height="10" rx="2"/></svg>
                    </div>
                    <div class="result__body">
                        <div class="result__title">باتری لیتیوم LiFePO4 ۵kWh (${r.batteries.voltage}V)</div>
                        <div class="result__meta">یا ${Utils.toPersian(r.batteries.leadAcid200Ah)} باتری سرب اسید ۲۰۰Ah</div>
                    </div>
                    <div class="result__price">
                        <div class="result__price-value">${Utils.toPersian(r.batteries.module5kWh)}</div>
                        <div class="result__price-label">ماژول ۵kWh</div>
                    </div>
                </div>
                <div style="background:rgba(245,158,11,0.08);border-radius:var(--radius-md);padding:var(--space-3);margin-top:var(--space-3);font-size:var(--font-size-sm);color:var(--color-text-muted);">
                    💡 <strong style="color:var(--color-text);">نکته:</strong> ${r.batteries.module5kWh === 1 ? 'یک' : 'هر'} ماژول ۵kWh معمولاً شامل BMS داخلی است و به صورت ماژولار قابل اتصال است.
                </div>
            </div>
            ` : ''}

            <!-- 4. Cables -->
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon" style="background:linear-gradient(135deg, #06b6d4, #0891b2);color:white;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    </div>
                    <div style="flex:1;">
                        <div class="card__title">🔗 ۴. کابل‌ها</div>
                        <div class="card__subtitle">DC، AC، باتری و ارت</div>
                    </div>
                </div>
                <div class="list" style="gap:var(--space-2);">
                    <div class="result">
                        <div class="result__icon" style="background:linear-gradient(135deg, #06b6d4, #0891b2);color:white;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">کابل DC سولار ${r.cables.dc.size}mm²</div>
                            <div class="result__meta">از پنل تا اینورتر · مقاوم UV</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.cables.dc.length)}</div>
                            <div class="result__price-label">متر</div>
                        </div>
                    </div>
                    <div class="result">
                        <div class="result__icon result__icon--sky"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">کابل AC ${r.cables.ac.size}mm² ${r.cables.ac.type}</div>
                            <div class="result__meta">از اینورتر تا تابلو برق</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.cables.ac.length)}</div>
                            <div class="result__price-label">متر</div>
                        </div>
                    </div>
                    ${r.batteries ? `
                    <div class="result">
                        <div class="result__icon result__icon--emerald"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="18" height="10" rx="2"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">کابل باتری ${r.cables.battery.size}mm²</div>
                            <div class="result__meta">اتصال باتری به اینورتر · مسی قلع‌اندود</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.cables.battery.length)}</div>
                            <div class="result__price-label">متر</div>
                        </div>
                    </div>` : ''}
                    <div class="result">
                        <div class="result__icon" style="background:linear-gradient(135deg, #84cc16, #65a30d);color:white;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M12 2v20"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">سیم ارت ${r.cables.ground.size}mm² مسی</div>
                            <div class="result__meta">سیستم زمین · زردرنگ/سبز</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.cables.ground.length)}</div>
                            <div class="result__price-label">متر</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 5. Protection -->
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon" style="background:linear-gradient(135deg, #ef4444, #dc2626);color:white;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    <div style="flex:1;">
                        <div class="card__title">🛡️ ۵. تجهیزات حفاظت</div>
                        <div class="card__subtitle">بریکر، فیوز و محافظ برق</div>
                    </div>
                </div>
                <div class="list" style="gap:var(--space-2);">
                    <div class="result">
                        <div class="result__icon" style="background:rgba(239,68,68,0.15);color:var(--color-red-400);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">بریکر DC ${r.protection.dcBreakerPerString.amp}A ۱۰۰۰V</div>
                            <div class="result__meta">یکی برای هر رشته پنل · محافظت در برابر اضافه جریان</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.protection.dcBreakerPerString.count)}</div>
                            <div class="result__price-label">عدد</div>
                        </div>
                    </div>
                    <div class="result">
                        <div class="result__icon" style="background:rgba(239,68,68,0.15);color:var(--color-red-400);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">بریکر DC اصلی ${r.protection.dcBreakerMain.amp}A</div>
                            <div class="result__meta">قطع کلید اصلی DC</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.protection.dcBreakerMain.count)}</div>
                            <div class="result__price-label">عدد</div>
                        </div>
                    </div>
                    <div class="result">
                        <div class="result__icon" style="background:rgba(239,68,68,0.15);color:var(--color-red-400);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">فیوز DC ${r.protection.dcFuses.amp}A ۱۰۰۰V</div>
                            <div class="result__meta">حفاظت رشته‌ها · با نگهدارنده فیوز</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.protection.dcFuses.count)}</div>
                            <div class="result__price-label">عدد</div>
                        </div>
                    </div>
                    <div class="result">
                        <div class="result__icon" style="background:rgba(245,158,11,0.15);color:var(--color-sun-300);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">بریکر AC ${r.protection.acBreakerMain.amp}A</div>
                            <div class="result__meta">محافظت تابلو AC · ${r.inverter.threePhase ? 'سه فاز ۴۰۰V' : 'تک فاز ۲۳۰V'}</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.protection.acBreakerMain.count)}</div>
                            <div class="result__price-label">عدد</div>
                        </div>
                    </div>
                    <div class="result">
                        <div class="result__icon" style="background:rgba(139,92,246,0.15);color:var(--color-violet-400);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">محافظ برق (SPD) DC + AC</div>
                            <div class="result__meta">Type 2 · محافظت در برابر صاعقه</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.protection.dcSPD + r.protection.acSPD)}</div>
                            <div class="result__price-label">عدد</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 6. Connectors -->
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon" style="background:linear-gradient(135deg, #f59e0b, #d97706);color:white;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/></svg>
                    </div>
                    <div style="flex:1;">
                        <div class="card__title">🔌 ۶. اتصالات و لوله</div>
                        <div class="card__subtitle">MC4 و لوله برق</div>
                    </div>
                </div>
                <div class="list" style="gap:var(--space-2);">
                    <div class="result">
                        <div class="result__icon" style="background:rgba(245,158,11,0.15);color:var(--color-sun-300);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">کانکتور MC4 (جفت نر و ماده)</div>
                            <div class="result__meta">هر پنل ۲ عدد (ورودی + خروجی) + رشته‌ها</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.connectors.mc4.count)}</div>
                            <div class="result__price-label">جفت</div>
                        </div>
                    </div>
                    <div class="result">
                        <div class="result__icon" style="background:rgba(245,158,11,0.15);color:var(--color-sun-300);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">لوله برق PVC ${r.connectors.conduit.size}mm</div>
                            <div class="result__meta">محافظت کابل‌ها در برابر UV و آسیب مکانیکی</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.connectors.conduit.length)}</div>
                            <div class="result__price-label">متر</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 7. Mounting -->
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon" style="background:linear-gradient(135deg, #8b5cf6, #7c3aed);color:white;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                    </div>
                    <div style="flex:1;">
                        <div class="card__title">🔧 ۷. سازه نگهدارنده</div>
                        <div class="card__subtitle">ریل، گیره و اتصالات</div>
                    </div>
                </div>
                <div class="list" style="gap:var(--space-2);">
                    <div class="result">
                        <div class="result__icon" style="background:rgba(139,92,246,0.15);color:var(--color-violet-400);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">ریل آلومینیومی آنودایز</div>
                            <div class="result__meta">مقاوم در برابر خوردگی · طول ۲.۲ متر</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.mounting.rails.length)}</div>
                            <div class="result__price-label">متر</div>
                        </div>
                    </div>
                    <div class="result">
                        <div class="result__icon" style="background:rgba(139,92,246,0.15);color:var(--color-violet-400);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">گیره میانی پنل</div>
                            <div class="result__meta">بین دو پنل مجاور · استیل ضد زنگ</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.mounting.midClamps.count)}</div>
                            <div class="result__price-label">عدد</div>
                        </div>
                    </div>
                    <div class="result">
                        <div class="result__icon" style="background:rgba(139,92,246,0.15);color:var(--color-violet-400);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="9" width="18" height="6"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">گیره انتهایی پنل</div>
                            <div class="result__meta">ابتدا و انتهای هر ردیف</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.mounting.endClamps.count)}</div>
                            <div class="result__price-label">عدد</div>
                        </div>
                    </div>
                    <div class="result">
                        <div class="result__icon" style="background:rgba(139,92,246,0.15);color:var(--color-violet-400);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">پایه L (L-Foot)</div>
                            <div class="result__meta">اتصال ریل به سقف · با پیچ و واشر EPDM</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.mounting.lFeet.count)}</div>
                            <div class="result__price-label">عدد</div>
                        </div>
                    </div>
                    ${r.mounting.railSplices.count > 0 ? `
                    <div class="result">
                        <div class="result__icon" style="background:rgba(139,92,246,0.15);color:var(--color-violet-400);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">اتصال ریل (Splice)</div>
                            <div class="result__meta">برای اتصال دو ریل به هم</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.mounting.railSplices.count)}</div>
                            <div class="result__label">عدد</div>
                        </div>
                    </div>` : ''}
                </div>
            </div>

            <!-- 8. Grounding -->
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon" style="background:linear-gradient(135deg, #84cc16, #4d7c0f);color:white;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M2 12h20M12 2v20"/></svg>
                    </div>
                    <div style="flex:1;">
                        <div class="card__title">⚡ ۸. سیستم ارت</div>
                        <div class="card__subtitle">حفاظت و ایمنی</div>
                    </div>
                </div>
                <div class="list" style="gap:var(--space-2);">
                    <div class="result">
                        <div class="result__icon" style="background:rgba(132,204,22,0.15);color:#84cc16;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="22"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">میله ارت مسی ${r.grounding.rods.length}m</div>
                            <div class="result__meta">روکش مس · با کلمپ اتصال</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.grounding.rods.count)}</div>
                            <div class="result__price-label">عدد</div>
                        </div>
                    </div>
                    <div class="result">
                        <div class="result__icon" style="background:rgba(132,204,22,0.15);color:#84cc16;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h20M12 2v20"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">کلمپ ارت (Lug)</div>
                            <div class="result__meta">برای اتصال سازه و پنل به ارت</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.grounding.lugs.count)}</div>
                            <div class="result__price-label">عدد</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 9. Monitoring -->
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon" style="background:linear-gradient(135deg, #0ea5e9, #0284c7);color:white;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg>
                    </div>
                    <div style="flex:1;">
                        <div class="card__title">📡 ۹. مانیتورینگ</div>
                        <div class="card__subtitle">پایش از راه دور</div>
                    </div>
                </div>
                <div class="list" style="gap:var(--space-2);">
                    <div class="result">
                        <div class="result__icon result__icon--sky"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">ماژول WiFi اینورتر</div>
                            <div class="result__meta">اتصال به اپلیکیشن موبایل</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.monitoring.wifiMonitor.count)}</div>
                            <div class="result__price-label">عدد</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 10. Enclosures -->
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon" style="background:linear-gradient(135deg, #6366f1, #4f46e5);color:white;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
                    </div>
                    <div style="flex:1;">
                        <div class="card__title">🗄️ ۱۰. تابلو برق و محفظه</div>
                        <div class="card__subtitle">تابلو DC/AC و محفظه باتری</div>
                    </div>
                </div>
                <div class="list" style="gap:var(--space-2);">
                    <div class="result">
                        <div class="result__icon" style="background:rgba(99,102,241,0.15);color:#6366f1;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">تابلو برق DC/AC</div>
                            <div class="result__meta">محفظه فلزی IP65 · تمام تجهیزات حفاظتی</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.enclosures.acPanel.count)}</div>
                            <div class="result__price-label">عدد</div>
                        </div>
                    </div>
                    ${r.batteries && r.enclosures.batteryEnclosure.count > 0 ? `
                    <div class="result">
                        <div class="result__icon" style="background:rgba(99,102,241,0.15);color:#6366f1;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></div>
                        <div class="result__body">
                            <div class="result__title">کابینت باتری</div>
                            <div class="result__meta">تهویه مناسب · IP54</div>
                        </div>
                        <div class="result__price">
                            <div class="result__price-value">${Utils.toPersian(r.enclosures.batteryEnclosure.count)}</div>
                            <div class="result__price-label">عدد</div>
                        </div>
                    </div>` : ''}
                </div>
            </div>

            <!-- Connection Guide -->
            <div class="card card--violet section anim-fade-up" style="color:white;">
                <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-4);">
                    <div class="card__icon" style="background:rgba(255,255,255,0.2);color:white;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </div>
                    <div>
                        <h3 style="font-size:var(--font-size-lg);font-weight:800;color:white;">📖 راهنمای اتصال</h3>
                        <p style="opacity:0.85;font-size:var(--font-size-sm);">چگونه تجهیزات را به هم وصل کنید</p>
                    </div>
                </div>
                <div class="list" style="gap:var(--space-3);">
                    <div class="list-item" style="cursor:default;background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);">
                        <div class="list-item__body">
                            <div class="list-item__title" style="color:white;">🔗 آرایش سری/موازی پنل‌ها</div>
                            <div class="list-item__subtitle" style="color:rgba(255,255,255,0.85);">${CONNECTION_GUIDE.seriesParallel}</div>
                        </div>
                    </div>
                    <div class="list-item" style="cursor:default;background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);">
                        <div class="list-item__body">
                            <div class="list-item__title" style="color:white;">⚡ اتصال MPPT</div>
                            <div class="list-item__subtitle" style="color:rgba(255,255,255,0.85);">${CONNECTION_GUIDE.mppt}</div>
                        </div>
                    </div>
                    ${r.batteries ? `
                    <div class="list-item" style="cursor:default;background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);">
                        <div class="list-item__body">
                            <div class="list-item__title" style="color:white;">🔋 اتصال باتری</div>
                            <div class="list-item__subtitle" style="color:rgba(255,255,255,0.85);">${CONNECTION_GUIDE.battery}</div>
                        </div>
                    </div>` : ''}
                    <div class="list-item" style="cursor:default;background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.2);">
                        <div class="list-item__body">
                            <div class="list-item__title" style="color:white;">⏚️ سیستم ارت</div>
                            <div class="list-item__subtitle" style="color:rgba(255,255,255,0.85);">${CONNECTION_GUIDE.grounding}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Cost Estimate -->
            <div class="card card--emerald section anim-fade-up" style="color:white;">
                <h3 style="color:white;margin-bottom:var(--space-3);">💰 تخمین هزینه تجهیزات</h3>
                <div style="opacity:0.9;font-size:var(--font-size-sm);line-height:2;">
                    <div style="display:flex;justify-content:space-between;"><span>پنل‌ها (${Utils.toPersian(r.panels.count)} × ${Utils.formatNumber(195)})</span><span>${Utils.formatNumber(Math.round(r.panels.count * 195))} $</span></div>
                    <div style="display:flex;justify-content:space-between;"><span>اینورتر</span><span>${Utils.formatNumber(Math.round(this.state.systemKw * 200))} $</span></div>
                    ${r.batteries ? `<div style="display:flex;justify-content:space-between;"><span>باتری (${Utils.toPersian(r.batteries.module5kWh)} × ۱۲۵۰)</span><span>${Utils.formatNumber(Math.round(r.batteries.module5kWh * 1250))} $</span></div>` : ''}
                    <div style="display:flex;justify-content:space-between;"><span>کابل و اتصالات</span><span>${Utils.formatNumber(Math.round(totalCostEstimate * 0.10))} $</span></div>
                    <div style="display:flex;justify-content:space-between;"><span>تجهیزات حفاظت</div><span>${Utils.formatNumber(Math.round(totalCostEstimate * 0.08))} $</span></div>
                    <div style="display:flex;justify-content:space-between;"><span>سازه نگهدارنده</span><span>${Utils.formatNumber(Math.round(totalCostEstimate * 0.07))} $</span></div>
                    <div style="display:flex;justify-content:space-between;border-top:2px solid rgba(255,255,255,0.3);padding-top:var(--space-2);margin-top:var(--space-2);">
                        <strong>تخمین کل (بدون نصب)</strong>
                        <strong>${Utils.formatNumber(Math.round(totalCostEstimate))} $</strong>
                    </div>
                </div>
                <p style="opacity:0.7;font-size:var(--font-size-xs);margin-top:var(--space-3);margin-bottom:0;">⚠️ قیمت‌ها تقریبی هستند. برای قیمت دقیق با تأمین‌کنندگان تماس بگیرید.</p>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);margin-top:var(--space-4);">
                <button class="btn btn--secondary" id="printBOM">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    چاپ لیست
                </button>
                <button class="btn btn--primary" id="newBOM">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                    محاسبه جدید
                </button>
            </div>
        `;

        document.getElementById('printBOM')?.addEventListener('click', () => this._print(r));
        document.getElementById('newBOM')?.addEventListener('click', () => { el.innerHTML = ''; });

        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    },

    _typeLabel(type) {
        if (type === 'on-grid') return 'آنگرید';
        if (type === 'off-grid') return 'آفگرید';
        return 'هیبرید';
    },

    _flatItems(r) {
        const items = [];
        items.push({ name: 'پنل', qty: r.panels.count });
        items.push({ name: 'اینورتر', qty: 1 });
        if (r.batteries) items.push({ name: 'باتری', qty: r.batteries.module5kWh });
        items.push({ name: 'کابل DC', qty: r.cables.dc.length });
        items.push({ name: 'بریکر', qty: r.protection.dcBreakerPerString.count + r.protection.dcBreakerMain.count + r.protection.acBreakerMain.count });
        items.push({ name: 'فیوز', qty: r.protection.dcFuses.count });
        items.push({ name: 'MC4', qty: r.connectors.mc4.count });
        items.push({ name: 'گیره', qty: r.mounting.midClamps.count + r.mounting.endClamps.count });
        items.push({ name: 'لوله', qty: r.connectors.conduit.length });
        return items;
    },

    _categories(r) {
        return ['panels', 'inverter', 'cables', 'protection', 'connectors', 'mounting', 'grounding', 'monitoring', 'enclosures'];
    },

    _estimateTotalCost(items) {
        // Rough cost per category
        const costs = {
            'پنل': 195, 'اینورتر': 250, 'باتری': 1250,
            'کابل DC': 2.5, 'بریکر': 28, 'فیوز': 8, 'MC4': 3.5,
            'گیره': 1.5, 'لوله': 2
        };
        return items.reduce((s, i) => s + (costs[i.name] || 0) * i.qty, 0) + 600; // base
    },

    _print(r) {
        const html = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<title>BOM - ${this.state.systemKw}kW ${this._typeLabel(this.state.systemType)}</title>
<style>
@page { size: A4; margin: 1.5cm; }
body { font-family: 'Tahoma', sans-serif; color: #1a1a1a; line-height: 1.6; padding: 20px; }
h1 { color: #d97706; border-bottom: 3px solid #f59e0b; padding-bottom: 10px; }
h2 { color: #d97706; margin-top: 20px; border-right: 4px solid #f59e0b; padding-right: 10px; }
table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 13px; }
th { background: #fef3c7; padding: 8px; text-align: right; border: 1px solid #fbbf24; }
td { padding: 8px; border: 1px solid #e5e7eb; }
.spec { background: #f9fafb; padding: 10px; border-radius: 4px; margin: 10px 0; font-size: 12px; }
</style>
</head>
<body>
<h1>لیست کامل تجهیزات (BOM)</h1>
<p><strong>سیستم:</strong> ${this.state.systemKw} kW ${this._typeLabel(this.state.systemType)} · ${r.panels.count} پنل ${r.panels.watt}W</p>

<h2>۱. پنل‌ها</h2>
<p>آرایش: ${r.panels.configuration} · ولتاژ هر رشته: ${(r.panels.seriesCount * r.panels.panelVmp).toFixed(1)}V · جریان کل: ${(r.panels.parallelCount * r.panels.panelImp).toFixed(1)}A</p>
<table>
<tr><th>شرح</th><th>تعداد</th><th>مشخصات</th></tr>
<tr><td>پنل خورشیدی Mono ${r.panels.watt}W</td><td>${r.panels.count} عدد</td><td>Voc: ${r.panels.panelVoc}V, Imp: ${r.panels.panelImp}A</td></tr>
</table>

<h2>۲. اینورتر</h2>
<table>
<tr><th>شرح</th><th>تعداد</th></tr>
<tr><td>اینورتر ${r.inverter.threePhase ? 'سه فاز' : 'تک فاز'} ${r.inverter.powerKw} kW</td><td>۱</td></tr>
</table>

${r.batteries ? `
<h2>۳. باتری</h2>
<table>
<tr><th>شرح</th><th>تعداد</th></tr>
<tr><td>باتری لیتیوم LiFePO4 5kWh</td><td>${r.batteries.module5kWh}</td></tr>
</table>
` : ''}

<h2>۴. کابل‌ها</h2>
<table>
<tr><th>شرح</th><th>متراژ</th><th>سایز</th></tr>
<tr><td>کابل DC سولار</td><td>${r.cables.dc.length} متر</td><td>${r.cables.dc.size}mm²</td></tr>
<tr><td>کابل AC</td><td>${r.cables.ac.length} متر</td><td>${r.cables.ac.size}mm²</td></tr>
${r.batteries ? `<tr><td>کابل باتری</td><td>${r.cables.battery.length} متر</td><td>${r.cables.battery.size}mm²</td></tr>` : ''}
<tr><td>سیم ارت</td><td>${r.cables.ground.length} متر</td><td>${r.cables.ground.size}mm²</td></tr>
</table>

<h2>۵. تجهیزات حفاظت</h2>
<table>
<tr><th>شرح</th><th>تعداد</th><th>مشخصات</th></tr>
<tr><td>بریکر DC هر رشته</td><td>${r.protection.dcBreakerPerString.count}</td><td>${r.protection.dcBreakerPerString.amp}A 1000V</td></tr>
<tr><td>بریکر DC اصلی</td><td>${r.protection.dcBreakerMain.count}</td><td>${r.protection.dcBreakerMain.amp}A</td></tr>
<tr><td>فیوز DC</td><td>${r.protection.dcFuses.count}</td><td>${r.protection.dcFuses.amp}A</td></tr>
<tr><td>بریکر AC</td><td>${r.protection.acBreakerMain.count}</td><td>${r.protection.acBreakerMain.amp}A</td></tr>
<tr><td>SPD (محافظ برق)</td><td>${r.protection.dcSPD + r.protection.acSPD}</td><td>Type 2</td></tr>
</table>

<h2>۶. اتصالات و سازه</h2>
<table>
<tr><th>شرح</th><th>تعداد</th></tr>
<tr><td>کانکتور MC4 (جفت)</td><td>${r.connectors.mc4.count}</td></tr>
<tr><td>لوله برق PVC ${r.connectors.conduit.size}mm</td><td>${r.connectors.conduit.length} متر</td></tr>
<tr><td>ریل آلومینیومی</td><td>${r.mounting.rails.length} متر</td></tr>
<tr><td>گیره میانی</td><td>${r.mounting.midClamps.count}</td></tr>
<tr><td>گیره انتهایی</td><td>${r.mounting.endClamps.count}</td></tr>
<tr><td>پایه L</td><td>${r.mounting.lFeet.count}</td></tr>
<tr><td>میله ارت</td><td>${r.grounding.rods.count}</td></tr>
<tr><td>کلمپ ارت</td><td>${r.grounding.lugs.count}</td></tr>
</table>

<h2>۷. راهنمای اتصال</h2>
<div class="spec">
<p><strong>سری/موازی:</strong> ${CONNECTION_GUIDE.seriesParallel}</p>
<p><strong>MPPT:</strong> ${CONNECTION_GUIDE.mppt}</p>
${r.batteries ? `<p><strong>باتری:</strong> ${CONNECTION_GUIDE.battery}</p>` : ''}
<p><strong>ارت:</strong> ${CONNECTION_GUIDE.grounding}</p>
</div>

<p style="margin-top:30px;text-align:center;color:#999;font-size:11px;">Solaren Pro — ۱۴۰۵</p>
</body>
</html>`;
        const w = window.open('', '_blank');
        if (w) {
            w.document.write(html);
            w.document.close();
            w.focus();
            setTimeout(() => w.print(), 300);
        } else {
            toast.warning('پنجره پاپ‌آپ مسدود است');
        }
    }
};
