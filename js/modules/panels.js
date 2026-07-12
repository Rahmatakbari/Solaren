/**
 * Solar Panels v3 — Enhanced with size calculator
 */
import { Utils } from '../utils.js';
import { toast } from '../ui.js';
import { SOLAR_PANELS } from '../data/panels.js';
import { SolarCalc } from '../calc.js';

export const panels = {
    name: 'panels',
    path: '#panels',

    state: { search: '', targetKw: 5, sortBy: 'watt-desc' },

    render() {
        return `
            <h1 class="page-title anim-fade-up">پنل‌های خورشیدی</h1>
            <p class="page-subtitle anim-fade-up">${Utils.toPersian(SOLAR_PANELS.length)} مدل پنل معتبر جهانی</p>

            <!-- Panel calculator -->
            <div class="card card--sun anim-fade-up" style="padding:var(--space-5);margin-bottom:var(--space-4);position:relative;overflow:hidden;">
                <div style="position:absolute;top:-30px;right:-30px;width:140px;height:140px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;">
                    <h2 style="color:var(--color-text-inverse);font-size:var(--font-size-lg);font-weight:800;margin-bottom:var(--space-2);display:flex;align-items:center;gap:var(--space-2);">
                        <span>🧮</span> ماشین‌حساب سریع
                    </h2>
                    <p style="color:rgba(0,0,0,0.7);font-size:var(--font-size-sm);margin-bottom:var(--space-4);">تعداد پنل مورد نیاز برای ظرفیت دلخواه</p>
                    <div class="field" style="margin-bottom:var(--space-3);">
                        <label style="color:rgba(0,0,0,0.7);font-size:var(--font-size-sm);font-weight:600;display:block;margin-bottom:var(--space-2);">ظرفیت مورد نیاز</label>
                        <div class="input-slider">
                            <input type="range" id="pcKw" min="0.5" max="100" step="0.5" value="${this.state.targetKw}">
                            <input type="number" class="input" id="pcKwV" min="0.5" max="100" step="0.5" value="${this.state.targetKw}" style="background:rgba(255,255,255,0.95);color:var(--color-text-inverse);">
                        </div>
                    </div>
                </div>
            </div>

            <div class="list stagger" id="panelCalcList" style="margin-bottom:var(--space-5);">
                ${this._renderCalc()}
            </div>

            <!-- Search & Sort -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="search">
                    <input type="text" class="input" id="searchPanels" placeholder="جستجو بر اساس برند، مدل، نوع..." value="${Utils.escapeHTML(this.state.search)}">
                    <span class="search__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                </div>
                <div class="switch-group" style="margin-top:var(--space-3);">
                    <button class="${this.state.sortBy === 'watt-desc' ? 'is-active' : ''}" data-sort="watt-desc">توان ↑</button>
                    <button class="${this.state.sortBy === 'price-asc' ? 'is-active' : ''}" data-sort="price-asc">قیمت ↑</button>
                    <button class="${this.state.sortBy === 'eff-desc' ? 'is-active' : ''}" data-sort="eff-desc">راندمان ↑</button>
                </div>
            </div>

            <div class="list stagger" id="panelList" style="margin-top:var(--space-3);">
                ${this._renderPanels()}
            </div>
        `;
    },

    attach() {
        const update = () => this._updateCalc();
        const slider = document.getElementById('pcKw');
        const value = document.getElementById('pcKwV');
        slider?.addEventListener('input', () => { value.value = slider.value; this.state.targetKw = parseFloat(slider.value); update(); });
        value?.addEventListener('input', () => { slider.value = value.value; this.state.targetKw = parseFloat(value.value); update(); });

        document.getElementById('searchPanels')?.addEventListener('input', Utils.debounce((e) => {
            this.state.search = e.target.value;
            this._refreshList();
        }, 200));

        document.querySelectorAll('[data-sort]').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.sortBy = btn.dataset.sort;
                document.querySelectorAll('[data-sort]').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                this._refreshList();
            });
        });
    },

    _renderCalc() {
        const sorted = [...SOLAR_PANELS].sort((a, b) => a.watt - b.watt);
        return sorted.slice(0, 5).map((p) => {
            const count = SolarCalc.calcPanelCount(this.state.targetKw, p.watt);
            const totalCost = count * p.price;
            return `
                <div class="result">
                    <div class="result__icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                    </div>
                    <div class="result__body">
                        <div class="result__title">${Utils.escapeHTML(p.brand)} ${p.watt}W</div>
                        <div class="result__meta">${Utils.toPersian(count)} پنل · ${p.type} · ${p.efficiency}%</div>
                    </div>
                    <div class="result__price">
                        <div class="result__price-value">${Utils.formatNumber(Math.round(totalCost))}</div>
                        <div class="result__price-label">$</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    _renderPanels() {
        let list = [...SOLAR_PANELS];
        if (this.state.search) {
            const q = this.state.search.toLowerCase();
            list = list.filter((p) => p.brand.toLowerCase().includes(q) || p.model.toLowerCase().includes(q) || p.type.toLowerCase().includes(q) || (p.subType || '').toLowerCase().includes(q));
        }
        switch (this.state.sortBy) {
            case 'watt-desc': list.sort((a, b) => b.watt - a.watt); break;
            case 'price-asc': list.sort((a, b) => a.price - b.price); break;
            case 'eff-desc': list.sort((a, b) => b.efficiency - a.efficiency); break;
        }
        if (list.length === 0) {
            return `<div class="empty"><div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/></svg></div><h3 class="empty__title">نتیجه‌ای یافت نشد</h3></div>`;
        }
        return list.map((p) => `
            <div class="card card--glass card--hover" data-panel-id="${p.id}">
                <div style="display:flex;align-items:flex-start;gap:var(--space-3);">
                    <div class="card__icon card__icon--sun" style="width:56px;height:56px;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-2);margin-bottom:var(--space-2);">
                            <div style="min-width:0;">
                                <h3 style="font-weight:700;font-size:var(--font-size-md);margin-bottom:2px;">${Utils.escapeHTML(p.brand)}</h3>
                                <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);font-family:var(--font-mono);">${Utils.escapeHTML(p.model)}</p>
                            </div>
                            <span class="chip chip--sun">${p.type}</span>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2);margin:var(--space-3) 0;font-size:var(--font-size-sm);">
                            <div><span style="color:var(--color-text-dim);">توان:</span> <strong>${p.watt}W</strong></div>
                            <div><span style="color:var(--color-text-dim);">Voc:</span> <strong>${p.voc}V</strong></div>
                            <div><span style="color:var(--color-text-dim);">Isc:</span> <strong>${p.isc}A</strong></div>
                            <div><span style="color:var(--color-text-dim);">Vmp:</span> <strong>${p.vmp}V</strong></div>
                            <div><span style="color:var(--color-text-dim);">Imp:</span> <strong>${p.imp}A</strong></div>
                            <div><span style="color:var(--color-text-dim);">η:</span> <strong style="color:var(--color-sun-300);">${p.efficiency}%</strong></div>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:var(--space-1);margin-bottom:var(--space-3);">
                            <span class="chip chip--ghost">${p.subType}</span>
                            <span class="chip chip--ghost">${p.cells} سلول</span>
                            <span class="chip chip--ghost">${p.size}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:var(--space-3);border-top:1px solid var(--color-border);">
                            <div>
                                <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">${p.warranty} سال گارانتی · ساخت ${p.made}</div>
                            </div>
                            <div style="text-align:left;">
                                <div style="font-weight:800;color:var(--color-sun-300);font-size:var(--font-size-lg);">${Utils.formatNumber(p.price)} $</div>
                                <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">${Utils.formatNumber((p.price / p.watt * 1000), 0)} $/kW</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    _refreshList() {
        const list = document.getElementById('panelList');
        if (list) list.innerHTML = this._renderPanels();
    },

    _updateCalc() {
        const list = document.getElementById('panelCalcList');
        if (list) list.innerHTML = this._renderCalc();
    }
};
