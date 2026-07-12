/**
 * VFD v3 — Production ready
 */
import { Utils } from '../utils.js';
import { toast } from '../ui.js';
import { VFDS, recommendVFD } from '../data/vfd.js';
import { projects } from '../store.js';

export const vfd = {
    name: 'vfd',
    path: '#vfd',

    state: { motorW: 0, phases: 'auto', search: '' },

    render() {
        return `
            <h1 class="page-title anim-fade-up">درایو VFD</h1>
            <p class="page-subtitle anim-fade-up">انتخاب درایو فرکانس متغیر برای موتور</p>

            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="card__header">
                    <div class="card__icon card__icon--violet">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33"/></svg>
                    </div>
                    <div>
                        <div class="card__title">انتخاب هوشمند VFD</div>
                        <div class="card__subtitle">بر اساس توان موتور</div>
                    </div>
                </div>

                <div class="field">
                    <label class="field__label field__label--required">توان موتور (W)</label>
                    <div class="input-group">
                        <input type="number" class="input input--with-icon" id="vfdMotor" min="100" max="100000" step="100" placeholder="مثلاً ۲۲۰۰">
                        <span class="input-group__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/></svg></span>
                        <span class="input-group__suffix">W</span>
                    </div>
                </div>

                <div class="field">
                    <label class="field__label">فاز ورودی</label>
                    <div class="switch-group" id="vfdPhase">
                        <button class="${this.state.phases === 'auto' ? 'is-active' : ''}" data-val="auto">خودکار</button>
                        <button class="${this.state.phases === '1ph' ? 'is-active' : ''}" data-val="1ph">تک فاز</button>
                        <button class="${this.state.phases === '3ph' ? 'is-active' : ''}" data-val="3ph">سه فاز</button>
                    </div>
                </div>

                <button class="btn btn--primary btn--block" id="findVFD">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    جستجوی VFD مناسب
                </button>
            </div>

            <div id="vfdRecommendation"></div>

            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="search">
                    <input type="text" class="input" id="searchVfd" placeholder="جستجو...">
                    <span class="search__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                </div>
            </div>

            <h2 class="section__title anim-fade-up" style="margin-bottom:var(--space-3);">کاتالوگ VFD</h2>
            <div class="list stagger" id="vfdList">
                ${this._render()}
            </div>
        `;
    },

    attach() {
        document.querySelectorAll('#vfdPhase button').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.phases = btn.dataset.val;
                document.querySelectorAll('#vfdPhase button').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
            });
        });

        document.getElementById('findVFD')?.addEventListener('click', () => {
            const motorW = Utils.parseNumber(document.getElementById('vfdMotor').value);
            if (!Utils.isValidNumber(motorW, { min: 100, max: 100000 })) {
                toast.error('توان موتور نامعتبر (بین ۱۰۰ تا ۱۰۰۰۰۰ وات)');
                return;
            }
            const rec = recommendVFD(motorW, this.state.phases);
            this._renderRecommendation(rec, motorW);
        });

        document.getElementById('searchVfd')?.addEventListener('input', Utils.debounce((e) => {
            this.state.search = e.target.value;
            this._refresh();
        }, 200));
    },

    _render() {
        let list = [...VFDS];
        if (this.state.search) {
            const q = this.state.search.toLowerCase();
            list = list.filter((v) => v.brand.toLowerCase().includes(q) || v.model.toLowerCase().includes(q));
        }
        list.sort((a, b) => a.powerW - b.powerW);
        if (list.length === 0) return '<div class="empty"><h3 class="empty__title">موردی یافت نشد</h3></div>';
        return list.map((v) => `
            <div class="card card--glass card--hover">
                <div style="display:flex;align-items:flex-start;gap:var(--space-3);">
                    <div class="card__icon card__icon--violet" style="width:56px;height:56px;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:var(--space-2);margin-bottom:var(--space-2);">
                            <div style="min-width:0;">
                                <h3 style="font-weight:700;font-size:var(--font-size-md);">${Utils.escapeHTML(v.brand)}</h3>
                                <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);font-family:var(--font-mono);">${Utils.escapeHTML(v.model)}</p>
                            </div>
                            <span class="chip chip--violet">${v.type}</span>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2);font-size:var(--font-size-sm);">
                            <div><span style="color:var(--color-text-dim);">توان:</span> <strong>${v.powerW} W</strong></div>
                            <div><span style="color:var(--color-text-dim);">اسب:</span> <strong>${v.powerHp} HP</strong></div>
                            <div><span style="color:var(--color-text-dim);">ولتاژ:</span> <strong>${v.voltage}V</strong></div>
                            <div><span style="color:var(--color-text-dim);">فاز:</span> <strong>${v.phases}</strong></div>
                            <div><span style="color:var(--color-text-dim);">جریان:</span> <strong>${v.current}A</strong></div>
                            <div><span style="color:var(--color-text-dim);">گارانتی:</span> <strong>${v.warranty} سال</strong></div>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:var(--space-1);margin:var(--space-3) 0;">
                            ${v.features.map((f) => `<span class="chip">${Utils.escapeHTML(f)}</span>`).join('')}
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:var(--space-3);border-top:1px solid var(--color-border);">
                            <button class="btn btn--secondary btn--sm" data-save-vfd="${v.id}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                                ذخیره
                            </button>
                            <div style="font-weight:800;color:var(--color-sun-300);font-size:var(--font-size-lg);">${Utils.formatNumber(v.price)} $</div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    _renderRecommendation(v, motorW) {
        const el = document.getElementById('vfdRecommendation');
        if (!el) return;
        el.innerHTML = `
            <div class="card anim-scale-in" style="background:var(--gradient-violet);padding:var(--space-5);margin-bottom:var(--space-4);position:relative;overflow:hidden;">
                <div style="position:absolute;top:-30px;right:-30px;width:140px;height:140px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;color:white;">
                    <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">
                        <span class="chip" style="background:rgba(255,255,255,0.2);color:white;border-color:transparent;">⚙️ پیشنهاد ویژه</span>
                        <span style="color:rgba(255,255,255,0.8);font-size:var(--font-size-sm);">موتور ${Utils.formatNumber(motorW)}W</span>
                    </div>
                    <h2 style="font-size:var(--font-size-xl);font-weight:800;margin-bottom:4px;">${Utils.escapeHTML(v.brand)} ${Utils.escapeHTML(v.model)}</h2>
                    <div style="display:flex;align-items:baseline;gap:var(--space-3);margin-top:var(--space-2);">
                        <div style="font-size:var(--font-size-3xl);font-weight:900;">${v.powerW} W / ${v.powerHp} HP</div>
                        <div style="font-size:var(--font-size-md);">${Utils.formatNumber(v.price)} $</div>
                    </div>
                    <button class="btn" data-save-vfd="${v.id}" style="background:rgba(0,0,0,0.25);color:white;margin-top:var(--space-4);font-weight:700;backdrop-filter:blur(10px);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                        ذخیره در پروژه جدید
                    </button>
                </div>
            </div>
        `;
        this._bindSave();
    },

    _bindSave() {
        document.querySelectorAll('[data-save-vfd]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.saveVfd;
                const v = VFDS.find((x) => x.id === id);
                if (!v) return;
                projects.save({
                    name: `VFD ${v.brand} ${v.powerHp}HP`,
                    vfd: v.id,
                    totalCost: v.price,
                    totalCapacity: v.powerW / 1000,
                    numPanels: 0,
                    actualPvKw: 0
                });
                toast.success('VFD به پروژه جدید اضافه شد');
                setTimeout(() => location.hash = '#projects', 600);
            });
        });
    },

    _refresh() {
        const list = document.getElementById('vfdList');
        if (list) list.innerHTML = this._render();
        this._bindSave();
    }
};
