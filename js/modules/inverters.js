/**
 * اینورترها v5 — سیستم برنامه‌ریزی خودکار پیشرفته
 * Auto Programming System v2
 */
import { Utils } from '../utils.js';
import { toast, modal } from '../ui.js';
import { INVERTERS, recommendInverter } from '../data/inverters.js';
import { INVERTER_PROGRAMS, recommendInverterProgram, getProgramKeys } from '../data/inverter-programs.js';
import { projects } from '../store.js';

const STORAGE_KEY = 'solar-pwa:programs';

function getSavedPrograms() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveProgramToStorage(program) {
    try {
        const list = getSavedPrograms();
        list.unshift(program);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 30)));
        return true;
    } catch (e) {
        console.warn('save failed', e);
        return false;
    }
}

export const inverters = {
    name: 'inverters',
    path: '#inverters',

    state: {
        search: '',
        type: 'all',
        loadW: 0,
        programPower: 5,
        programType: 'hybrid',
        systemLoad: 3000,
        withGen: false
    },

    render() {
        const savedCount = getSavedPrograms().length;
        return `
            <h1 class="page-title anim-fade-up">اینورترها</h1>
            <p class="page-subtitle anim-fade-up">${Utils.toPersian(INVERTERS.length)} مدل + سیستم برنامه‌ریزی خودکار</p>

            <!-- انتخاب هوشمند اینورتر -->
            <div class="card card--glass section anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="card__header">
                    <div class="card__icon card__icon--sky">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    </div>
                    <div>
                        <div class="card__title">انتخاب هوشمند اینورتر</div>
                        <div class="card__subtitle">بر اساس بار مصرفی</div>
                    </div>
                </div>
                <div class="field">
                    <label class="field__label">بار مصرفی (W)</label>
                    <div class="input-group">
                        <input type="number" class="input input--with-icon" id="invLoad" min="100" max="100000" step="100" placeholder="مثلاً ۳۰۰۰">
                        <span class="input-group__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></span>
                        <span class="input-group__suffix">W</span>
                    </div>
                </div>
                <button class="btn btn--primary btn--block" id="findInverter">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    جستجوی اینورتر مناسب
                </button>
            </div>

            <div id="invRecommendation"></div>

            <!-- سیستم برنامه‌ریزی خودکار -->
            <div class="card anim-fade-up" style="margin-bottom:var(--space-4);position:relative;overflow:hidden;background:linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);color:white;">
                <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:absolute;bottom:-30px;left:-30px;width:120px;height:120px;background:rgba(255,255,255,0.08);border-radius:50%;filter:blur(20px);"></div>
                <div style="position:relative;">
                    <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-4);">
                        <div style="width:48px;height:48px;border-radius:var(--radius-md);background:rgba(255,255,255,0.2);color:white;display:flex;align-items:center;justify-content:center;font-size:24px;">⚙️</div>
                        <div>
                            <h2 style="color:white;font-size:var(--font-size-lg);font-weight:800;margin:0;">برنامه‌ریزی خودکار اینورتر</h2>
                            <p style="opacity:0.85;font-size:var(--font-size-sm);margin:2px 0 0;">پارامترهای مناسب برای سیستم شما</p>
                        </div>
                    </div>

                    <div class="field" style="margin-bottom:var(--space-3);">
                        <label style="color:rgba(255,255,255,0.95);font-size:var(--font-size-sm);font-weight:600;display:block;margin-bottom:var(--space-2);">ظرفیت اینورتر (kW)</label>
                        <div class="input-slider">
                            <input type="range" id="progPower" min="0.5" max="50" step="0.5" value="${this.state.programPower}">
                            <input type="number" class="input" id="progPowerV" min="0.5" max="100" step="0.5" value="${this.state.programPower}">
                        </div>
                        <div style="display:flex;justify-content:space-between;font-size:10px;opacity:0.6;margin-top:4px;">
                            <span>۰.۵ kW</span>
                            <span>۲۵ kW</span>
                            <span>۵۰ kW</span>
                        </div>
                    </div>

                    <div class="field" style="margin-bottom:var(--space-3);">
                        <label style="color:rgba(255,255,255,0.95);font-size:var(--font-size-sm);font-weight:600;display:block;margin-bottom:var(--space-2);">نوع سیستم</label>
                        <div class="switch-group">
                            <button type="button" class="${this.state.programType === 'on-grid' ? 'is-active' : ''}" data-prog-type="on-grid">آنگرید</button>
                            <button type="button" class="${this.state.programType === 'off-grid' ? 'is-active' : ''}" data-prog-type="off-grid">آفگرید</button>
                            <button type="button" class="${this.state.programType === 'hybrid' ? 'is-active' : ''}" data-prog-type="hybrid">هیبرید</button>
                        </div>
                    </div>

                    <div class="field" style="margin-bottom:var(--space-3);">
                        <label style="color:rgba(255,255,255,0.95);font-size:var(--font-size-sm);font-weight:600;display:block;margin-bottom:var(--space-2);">بار مصرفی (W)</label>
                        <input type="number" class="input" id="progLoad" min="100" value="${this.state.systemLoad}" style="background:rgba(255,255,255,0.95);color:var(--color-text);">
                    </div>

                    <div class="field" style="margin-bottom:var(--space-3);">
                        <label style="display:flex;align-items:center;gap:var(--space-2);color:rgba(255,255,255,0.95);font-size:var(--font-size-sm);font-weight:600;cursor:pointer;">
                            <input type="checkbox" id="withGen" ${this.state.withGen ? 'checked' : ''} style="width:18px;height:18px;cursor:pointer;">
                            وجود ژنراتور پشتیبان
                        </label>
                    </div>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);">
                        <button class="btn" id="generateProgram" style="background:rgba(255,255,255,0.95);color:#7c3aed;font-weight:700;backdrop-filter:blur(10px);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                            تولید برنامه
                        </button>
                        <button class="btn" id="showSaved" style="background:rgba(0,0,0,0.25);color:white;font-weight:700;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                            ذخیره‌شده‌ها (${Utils.toPersian(savedCount)})
                        </button>
                    </div>
                </div>
            </div>

            <div id="programResult"></div>

            <!-- جستجو و فیلتر -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="search">
                    <input type="text" class="input" id="searchInv" placeholder="جستجو...">
                    <span class="search__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                </div>
                <div class="switch-group" style="margin-top:var(--space-3);" id="typeFilter">
                    <button class="${this.state.type === 'all' ? 'is-active' : ''}" data-val="all">همه</button>
                    <button class="${this.state.type === 'Hybrid' ? 'is-active' : ''}" data-val="Hybrid">هیبرید</button>
                    <button class="${this.state.type === 'String' ? 'is-active' : ''}" data-val="String">رشته‌ای</button>
                    <button class="${this.state.type === 'Micro' ? 'is-active' : ''}" data-val="Micro">میکرو</button>
                </div>
            </div>

            <div class="list stagger" id="invList">
                ${this._render()}
            </div>
        `;
    },

    attach() {
        const search = document.getElementById('searchInv');
        if (search) {
            search.addEventListener('input', Utils.debounce((e) => {
                this.state.search = e.target.value;
                this._refresh();
            }, 200));
        }

        document.querySelectorAll('#typeFilter button').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.type = btn.dataset.val;
                document.querySelectorAll('#typeFilter button').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                this._refresh();
            });
        });

        document.getElementById('findInverter')?.addEventListener('click', () => {
            const loadW = Utils.parseNumber(document.getElementById('invLoad').value);
            if (!Utils.isValidNumber(loadW, { min: 100, max: 100000 })) {
                toast.error('بار مصرفی نامعتبر (بین ۱۰۰ تا ۱۰۰۰۰۰ وات)');
                return;
            }
            const rec = recommendInverter(loadW, 'auto');
            this._renderRecommendation(rec, loadW);
        });

        this._bindProgramEvents();
        this._bindSave();
    },

    _bindProgramEvents() {
        const powerSlider = document.getElementById('progPower');
        const powerInput = document.getElementById('progPowerV');
        const loadInput = document.getElementById('progLoad');
        const withGen = document.getElementById('withGen');

        if (powerSlider && powerInput) {
            powerSlider.addEventListener('input', () => {
                powerInput.value = powerSlider.value;
                this.state.programPower = parseFloat(powerSlider.value);
            });
            powerInput.addEventListener('input', () => {
                const v = parseFloat(powerInput.value) || 0.5;
                powerSlider.value = Math.min(v, 50);
                this.state.programPower = v;
            });
        }

        if (loadInput) {
            loadInput.addEventListener('input', () => {
                this.state.systemLoad = parseFloat(loadInput.value) || 3000;
            });
        }

        if (withGen) {
            withGen.addEventListener('change', () => {
                this.state.withGen = withGen.checked;
            });
        }

        document.querySelectorAll('[data-prog-type]').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.programType = btn.dataset.progType;
                document.querySelectorAll('[data-prog-type]').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
            });
        });

        document.getElementById('generateProgram')?.addEventListener('click', () => this._generateProgram());
        document.getElementById('showSaved')?.addEventListener('click', () => this._showSavedPrograms());
    },

    _generateProgram() {
        const power = this.state.programPower;
        const type = this.state.programType;
        const load = this.state.systemLoad;
        const withGen = this.state.withGen;

        const program = recommendInverterProgram(power, type, load, withGen);
        const is3Phase = power >= 8;

        // پیشنهاد اینورتر خاص
        const recommendedInverter = recommendInverter(load, type === 'hybrid' ? 'Hybrid' : (type === 'on-grid' ? 'String' : 'auto'));

        this._renderProgram(program, recommendedInverter, power, type, load, withGen, is3Phase);

        // اعلان موفقیت
        const totalParams = Object.values(program.programs).reduce((sum, p) => sum + (p.settings?.length || 0), 0);
        toast.success(`برنامه ${Utils.formatNumber(power, 1)}kW با ${Utils.toPersian(totalParams)} پارامتر تولید شد`);

        // نوتیفیکیشن سیستمی
        if (window.NotifSystem && window.NotifSystem.add) {
            try {
                window.NotifSystem.add(
                    'success',
                    'برنامه اینورتر تولید شد',
                    `${program.brand} ${program.model} - ${Utils.formatNumber(power, 1)}kW ${type === 'on-grid' ? 'آنگرید' : type === 'off-grid' ? 'آفگرید' : 'هیبرید'}`,
                    '#inverters'
                );
            } catch (e) { /* silent */ }
        }
    },

    _renderProgram(program, inverter, power, type, load, withGen, is3Phase) {
        const el = document.getElementById('programResult');
        if (!el) return;

        // ذخیره در state
        this.state.generatedProgram = program;

        const typeLabel = type === 'on-grid' ? 'آنگرید' : type === 'off-grid' ? 'آفگرید' : 'هیبرید';
        const typeIcon = type === 'on-grid' ? '🔌' : type === 'off-grid' ? '🏔️' : '🔄';
        const totalParams = Object.values(program.programs).reduce((sum, p) => sum + (p.settings?.length || 0), 0);
        const criticalParams = Object.values(program.programs).reduce((sum, p) => sum + (p.settings?.filter(s => s.critical).length || 0), 0);

        el.innerHTML = `
            <!-- خلاصه برنامه -->
            <div class="card anim-scale-in" style="padding:var(--space-5);margin-bottom:var(--space-4);background:linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);color:white;position:relative;overflow:hidden;">
                <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;">
                    <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3);">
                        <div style="width:48px;height:48px;border-radius:var(--radius-md);background:rgba(255,255,255,0.2);color:white;display:flex;align-items:center;justify-content:center;font-size:24px;">📋</div>
                        <div>
                            <h2 style="color:white;font-size:var(--font-size-lg);font-weight:800;margin:0;">برنامه پیشنهادی</h2>
                            <p style="opacity:0.85;font-size:var(--font-size-sm);margin:2px 0 0;">${Utils.escapeHTML(program.brand)} ${Utils.escapeHTML(program.model)}</p>
                        </div>
                    </div>
                    <div style="background:rgba(0,0,0,0.15);border-radius:var(--radius-md);padding:var(--space-3);">
                        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-2);text-align:center;">
                            <div>
                                <div style="opacity:0.85;font-size:var(--font-size-xs);">توان</div>
                                <div style="font-weight:800;font-size:var(--font-size-lg);">${Utils.formatNumber(power, 1)} kW</div>
                            </div>
                            <div>
                                <div style="opacity:0.85;font-size:var(--font-size-xs);">نوع</div>
                                <div style="font-weight:800;font-size:var(--font-size-md);">${typeIcon} ${typeLabel}</div>
                            </div>
                            <div>
                                <div style="opacity:0.85;font-size:var(--font-size-xs);">فاز</div>
                                <div style="font-weight:800;font-size:var(--font-size-md);">${is3Phase ? '۳ فاز' : '۱ فاز'}</div>
                            </div>
                            <div>
                                <div style="opacity:0.85;font-size:var(--font-size-xs);">ولتاژ</div>
                                <div style="font-weight:800;font-size:var(--font-size-md);">${is3Phase ? '۴۰۰V' : '۲۳۰V'}</div>
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2);text-align:center;margin-top:var(--space-2);padding-top:var(--space-2);border-top:1px solid rgba(255,255,255,0.2);">
                            <div>
                                <div style="opacity:0.85;font-size:var(--font-size-xs);">برنامه‌ها</div>
                                <div style="font-weight:700;">${Utils.toPersian(Object.keys(program.programs).length)}</div>
                            </div>
                            <div>
                                <div style="opacity:0.85;font-size:var(--font-size-xs);">پارامترها</div>
                                <div style="font-weight:700;">${Utils.toPersian(totalParams)}</div>
                            </div>
                            <div>
                                <div style="opacity:0.85;font-size:var(--font-size-xs);">حیاتی</div>
                                <div style="font-weight:700;">${Utils.toPersian(criticalParams)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- اینورتر پیشنهادی -->
            <div class="card card--glass section anim-fade-up" style="margin-bottom:var(--space-4);">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);margin-bottom:var(--space-3);">
                    <h2 class="section__title">💡 اینورتر پیشنهادی</h2>
                    <button class="btn btn--primary btn--sm" id="saveProgInv">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                        ذخیره
                    </button>
                </div>
                <div class="result" style="cursor:default;">
                    <div class="result__icon result__icon--sky">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    </div>
                    <div class="result__body">
                        <div class="result__title">${Utils.escapeHTML(inverter.brand)} ${Utils.escapeHTML(inverter.model)}</div>
                        <div class="result__meta">${Utils.formatNumber(inverter.powerKw, 1)} kW · ${Utils.escapeHTML(inverter.type)} · ${Utils.formatNumber(inverter.eff, 1)}% راندمان</div>
                        <div style="display:flex;flex-wrap:wrap;gap:var(--space-1);margin-top:var(--space-2);">
                            ${(inverter.features || []).slice(0, 4).map((f) => `<span class="chip">${Utils.escapeHTML(f)}</span>`).join('')}
                        </div>
                    </div>
                    <div class="result__price">
                        <div class="result__price-value">${Utils.formatNumber(inverter.price)}</div>
                        <div class="result__price-label">$</div>
                    </div>
                </div>
            </div>

            <!-- جدول برنامه‌ها -->
            ${Object.entries(program.programs).map(([progKey, prog]) => `
                <div class="card card--glass section anim-fade-up" style="margin-bottom:var(--space-4);">
                    <div class="card__header">
                        <div style="width:48px;height:48px;border-radius:var(--radius-md);background:linear-gradient(135deg, #0ea5e9, #38bdf8);color:white;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">${prog.icon || '⚙️'}</div>
                        <div style="flex:1;min-width:0;">
                            <div class="card__title" style="font-size:var(--font-size-md);">${Utils.escapeHTML(progKey.replace('P', 'P').replace('_', ' '))} - ${Utils.escapeHTML(prog.name)}</div>
                            <div class="card__subtitle">${Utils.escapeHTML(prog.description)}</div>
                        </div>
                        <span class="chip chip--sky">${Utils.toPersian(prog.settings?.length || 0)} پارامتر</span>
                    </div>
                    <div style="background:var(--color-bg-soft);border-radius:var(--radius-md);overflow:hidden;">
                        <div style="display:grid;grid-template-columns:50px 1fr 1fr 90px;padding:var(--space-2) var(--space-3);background:rgba(14,165,233,0.15);font-size:var(--font-size-xs);font-weight:700;color:var(--color-sky-300);text-transform:uppercase;">
                            <div>کد</div>
                            <div>پارامتر</div>
                            <div>مقدار پیشنهادی</div>
                            <div style="text-align:center;">محدوده</div>
                        </div>
                        ${(prog.settings || []).map((setting) => `
                            <div style="display:grid;grid-template-columns:50px 1fr 1fr 90px;padding:var(--space-3);border-top:1px solid var(--color-border);font-size:var(--font-size-sm);align-items:center;${setting.critical ? 'background:rgba(245,158,11,0.08);' : ''}transition:background 0.2s;">
                                <div style="font-family:var(--font-mono);color:var(--color-text-dim);font-size:var(--font-size-xs);">${Utils.escapeHTML(setting.code)}</div>
                                <div style="color:var(--color-text);">
                                    ${Utils.escapeHTML(setting.name)}
                                    ${setting.critical ? '<span title="پارامتر حیاتی" style="color:var(--color-sun-300);font-size:10px;margin-right:4px;">⚠️</span>' : ''}
                                    ${setting.tip ? `<div style="font-size:10px;color:var(--color-text-dim);margin-top:2px;">💡 ${Utils.escapeHTML(setting.tip)}</div>` : ''}
                                </div>
                                <div style="color:var(--color-sun-300);font-weight:700;">
                                    ${typeof setting.value === 'number' ? Utils.toPersian(setting.value) : Utils.escapeHTML(String(setting.value))} <span style="font-weight:400;font-size:var(--font-size-xs);color:var(--color-text-muted);">${setting.unit || ''}</span>
                                </div>
                                <div style="text-align:center;color:var(--color-text-muted);font-size:var(--font-size-xs);">${Utils.escapeHTML(setting.range)}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('')}

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-2);margin-top:var(--space-4);">
                <button class="btn btn--secondary" id="printProgram">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    چاپ
                </button>
                <button class="btn btn--secondary" id="copyProgram">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    کپی
                </button>
                <button class="btn btn--primary" id="applyProgram">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    ذخیره
                </button>
            </div>
        `;

        document.getElementById('printProgram')?.addEventListener('click', () => this._printProgram(program, power, type, load));
        document.getElementById('copyProgram')?.addEventListener('click', () => this._copyProgram(program, power, type, load));
        document.getElementById('applyProgram')?.addEventListener('click', () => this._applyProgram(program, inverter, power, type, load));
        document.getElementById('saveProgInv')?.addEventListener('click', () => {
            projects.save({
                name: `اینورتر ${inverter.brand} ${Utils.formatNumber(inverter.powerKw, 1)}kW - برنامه‌ریزی شده`,
                inverter: inverter.id,
                totalCost: inverter.price,
                totalCapacity: inverter.powerKw,
                numPanels: 0,
                actualPvKw: 0
            });
            toast.success('اینورتر به پروژه جدید اضافه شد');
            setTimeout(() => location.hash = '#projects', 600);
        });

        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    },

    _printProgram(program, power, type, load) {
        const typeLabel = type === 'on-grid' ? 'آنگرید' : type === 'off-grid' ? 'آفگرید' : 'هیبرید';
        const html = `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="UTF-8"><title>برنامه اینورتر ${Utils.formatNumber(power, 1)}kW</title>
<style>
@page { size: A4; margin: 1.5cm; }
body { font-family: 'Tahoma', sans-serif; color: #1a1a1a; line-height: 1.6; padding: 20px; }
h1 { color: #7c3aed; border-bottom: 3px solid #a78bfa; padding-bottom: 10px; }
h2 { color: #7c3aed; margin-top: 20px; border-right: 4px solid #a78bfa; padding-right: 10px; }
table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 12px; }
th { background: #ede9fe; padding: 8px; text-align: right; border: 1px solid #c4b5fd; font-weight: 700; }
td { padding: 8px; border: 1px solid #e5e7eb; }
.warning { background: #fef3c7; }
.info-box { background: #f0f9ff; border-right: 4px solid #0ea5e9; padding: 10px; margin: 10px 0; border-radius: 4px; }
</style></head><body>
<h1>🔧 برنامه تنظیمات اینورتر ${Utils.formatNumber(power, 1)} kW</h1>
<div class="info-box">
<p><strong>برند:</strong> ${program.brand} | <strong>مدل:</strong> ${program.model}</p>
<p><strong>نوع سیستم:</strong> ${typeLabel} | <strong>بار مصرفی:</strong> ${Utils.formatNumber(load)} W | <strong>فاز:</strong> ${power >= 8 ? '۳ فاز' : '۱ فاز'}</p>
</div>
${Object.entries(program.programs).map(([key, prog]) => `
<h2>${prog.icon || '⚙️'} ${key} - ${prog.name}</h2>
<p>${prog.description}</p>
<table>
<tr><th>کد</th><th>پارامتر</th><th>مقدار</th><th>واحد</th><th>محدوده</th></tr>
${(prog.settings || []).map((s) => `
<tr ${s.critical ? 'class="warning"' : ''}>
<td>${s.code}</td>
<td>${s.name}${s.critical ? ' ⚠️' : ''}</td>
<td><strong>${typeof s.value === 'number' ? s.value : s.value}</strong></td>
<td>${s.unit || '-'}</td>
<td>${s.range}</td>
</tr>
${s.tip ? `<tr><td colspan="5" style="background:#fefce8;font-size:11px;color:#854d0e;">💡 ${s.tip}</td></tr>` : ''}
`).join('')}
</table>
`).join('')}
<p style="margin-top:30px;text-align:center;color:#999;font-size:11px;">Solaren Pro — برنامه تولید شده خودکار — ${new Date().toLocaleDateString('fa-IR')}</p>
</body></html>`;
        const w = window.open('', '_blank');
        if (w) {
            w.document.write(html);
            w.document.close();
            w.focus();
            setTimeout(() => w.print(), 400);
        } else {
            toast.error('پنجره جدید باز نشد. لطفاً popup blocker را غیرفعال کنید.');
        }
    },

    _copyProgram(program, power, type, load) {
        const typeLabel = type === 'on-grid' ? 'آنگرید' : type === 'off-grid' ? 'آفگرید' : 'هیبرید';
        let text = `⚙️ برنامه تنظیمات اینورتر ${Utils.formatNumber(power, 1)} kW\n`;
        text += `${program.brand} ${program.model}\n`;
        text += `نوع: ${typeLabel} | بار: ${Utils.formatNumber(load)} W\n`;
        text += `تاریخ: ${new Date().toLocaleDateString('fa-IR')}\n`;
        text += '='.repeat(40) + '\n\n';

        Object.entries(program.programs).forEach(([key, prog]) => {
            text += `▸ ${key} - ${prog.name}\n`;
            text += `  ${prog.description}\n\n`;
            (prog.settings || []).forEach(s => {
                const val = typeof s.value === 'number' ? s.value : s.value;
                const critical = s.critical ? ' ⚠️' : '';
                text += `  [${s.code}] ${s.name}${critical}\n`;
                text += `     مقدار: ${val} ${s.unit || ''} | محدوده: ${s.range}\n`;
                if (s.tip) text += `     💡 ${s.tip}\n`;
            });
            text += '\n';
        });

        text += '\n---\nSolaren Pro - برنامه تولید شده خودکار';

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                toast.success('برنامه در کلیپ‌بورد کپی شد');
            }).catch(() => {
                this._fallbackCopy(text);
            });
        } else {
            this._fallbackCopy(text);
        }
    },

    _fallbackCopy(text) {
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            const ok = document.execCommand('copy');
            document.body.removeChild(ta);
            if (ok) toast.success('برنامه در کلیپ‌بورد کپی شد');
            else toast.error('کپی ناموفق بود');
        } catch (e) {
            toast.error('مرورگر شما از کپی پشتیبانی نمی‌کند');
        }
    },

    _applyProgram(program, inverter, power, type, load) {
        const programData = {
            id: 'prog_' + Date.now(),
            inverterId: inverter.id,
            brand: inverter.brand,
            model: inverter.model,
            power: power,
            type: type,
            load: load,
            programs: program,
            timestamp: Date.now(),
            dateLabel: new Date().toLocaleDateString('fa-IR')
        };
        if (saveProgramToStorage(programData)) {
            toast.success(`برنامه ${Utils.formatNumber(power, 1)}kW ذخیره شد`);
        } else {
            toast.error('خطا در ذخیره برنامه');
        }
    },

    _showSavedPrograms() {
        const saved = getSavedPrograms();
        if (saved.length === 0) {
            toast.info('هنوز برنامه‌ای ذخیره نشده است');
            return;
        }

        const content = `
            <div style="max-height:60vh;overflow-y:auto;padding:var(--space-2);">
                ${saved.map((p, i) => `
                    <div class="card card--glass" style="margin-bottom:var(--space-3);">
                        <div style="display:flex;align-items:center;gap:var(--space-3);">
                            <div class="card__icon card__icon--violet" style="width:44px;height:44px;">⚙️</div>
                            <div style="flex:1;min-width:0;">
                                <div style="font-weight:700;">${Utils.escapeHTML(p.brand)} ${Utils.escapeHTML(p.model)}</div>
                                <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">${Utils.formatNumber(p.power, 1)} kW · ${p.type === 'on-grid' ? 'آنگرید' : p.type === 'off-grid' ? 'آفگرید' : 'هیبرید'} · ${p.dateLabel || ''}</div>
                            </div>
                            <button class="btn btn--sm btn--primary" data-view-prog="${i}">مشاهده</button>
                            <button class="btn btn--sm btn--secondary" data-del-prog="${p.id}">🗑</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        modal.open({
            title: `📂 برنامه‌های ذخیره شده (${Utils.toPersian(saved.length)})`,
            content,
            actions: [
                { label: 'بستن', class: 'btn--secondary', onclick: () => modal.close() }
            ]
        });

        // رویدادها
        document.querySelectorAll('[data-view-prog]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.viewProg);
                modal.close();
                setTimeout(() => this._loadSavedProgram(saved[idx]), 200);
            });
        });
        document.querySelectorAll('[data-del-prog]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.delProg;
                const list = getSavedPrograms().filter(p => p.id !== id);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
                toast.success('برنامه حذف شد');
                modal.close();
                setTimeout(() => this._showSavedPrograms(), 100);
            });
        });
    },

    _loadSavedProgram(p) {
        const is3Phase = p.power >= 8;
        const inverter = { brand: p.brand, model: p.model, powerKw: p.power, type: p.type === 'hybrid' ? 'Hybrid' : 'String', eff: 97, price: 0, features: [], id: p.inverterId };
        this._renderProgram(p.programs, inverter, p.power, p.type, p.load, false, is3Phase);
    },

    _renderRecommendation(inv, loadW) {
        const el = document.getElementById('invRecommendation');
        if (!el) return;
        el.innerHTML = `
            <div class="card anim-scale-in" style="padding:var(--space-5);margin-bottom:var(--space-4);background:linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);color:white;position:relative;overflow:hidden;">
                <div style="position:absolute;top:-30px;right:-30px;width:140px;height:140px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;">
                    <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">
                        <span class="chip" style="background:rgba(255,255,255,0.25);color:white;border-color:transparent;">⭐ پیشنهاد ویژه</span>
                        <span style="color:rgba(255,255,255,0.85);font-size:var(--font-size-sm);">برای ${Utils.formatNumber(loadW)}W</span>
                    </div>
                    <h2 style="font-size:var(--font-size-xl);font-weight:800;margin-bottom:4px;">${Utils.escapeHTML(inv.brand)} ${Utils.escapeHTML(inv.model)}</h2>
                    <div style="display:flex;align-items:baseline;gap:var(--space-3);margin-top:var(--space-2);">
                        <div style="font-size:var(--font-size-3xl);font-weight:900;">${Utils.formatNumber(inv.powerKw, 1)} kW</div>
                        <div style="font-size:var(--font-size-md);">${Utils.formatNumber(inv.price)} $</div>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:var(--space-1);margin-top:var(--space-3);">
                        ${(inv.features || []).map((f) => `<span class="chip" style="background:rgba(255,255,255,0.2);color:white;border-color:transparent;">${Utils.escapeHTML(f)}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    _render() {
        let list = [...INVERTERS];
        if (this.state.type !== 'all') list = list.filter((i) => i.type === this.state.type);
        if (this.state.search) {
            const q = this.state.search.toLowerCase();
            list = list.filter((i) => (i.brand || '').toLowerCase().includes(q) || (i.model || '').toLowerCase().includes(q) || String(i.powerW || '').includes(q));
        }
        list.sort((a, b) => (a.powerW || 0) - (b.powerW || 0));
        if (list.length === 0) return '<div class="empty"><h3 class="empty__title">موردی یافت نشد</h3><p class="empty__text">فیلتر یا جستجوی دیگری امتحان کنید</p></div>';

        return list.map((inv) => {
            const hasProgram = Object.keys(INVERTER_PROGRAMS).includes(inv.id);
            return `
            <div class="card card--glass card--hover">
                <div style="display:flex;align-items:flex-start;gap:var(--space-3);">
                    <div class="card__icon card__icon--sky" style="width:56px;height:56px;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-2);margin-bottom:var(--space-2);">
                            <div style="min-width:0;">
                                <h3 style="font-weight:700;font-size:var(--font-size-md);">${Utils.escapeHTML(inv.brand)}</h3>
                                <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);font-family:var(--font-mono);">${Utils.escapeHTML(inv.model)}</p>
                            </div>
                            <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end;">
                                <span class="chip chip--sky">${inv.type}</span>
                                ${hasProgram ? '<span class="chip chip--emerald" style="font-size:10px;">⚙️ برنامه‌پذیر</span>' : ''}
                            </div>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2);font-size:var(--font-size-sm);">
                            <div><span style="color:var(--color-text-dim);">توان:</span> <strong>${Utils.formatNumber(inv.powerKw, 1)} kW</strong></div>
                            <div><span style="color:var(--color-text-dim);">فاز:</span> <strong>${inv.phase || '-'}</strong></div>
                            <div><span style="color:var(--color-text-dim);">MPPT:</span> <strong>${inv.mppt || '-'}</strong></div>
                            <div><span style="color:var(--color-text-dim);">PV max:</span> <strong>${inv.maxPvV || '-'}V</strong></div>
                            <div><span style="color:var(--color-text-dim);">راندمان:</span> <strong>${inv.eff || '-'}%</strong></div>
                            <div><span style="color:var(--color-text-dim);">گارانتی:</span> <strong>${inv.warranty || '-'} سال</strong></div>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:var(--space-1);margin:var(--space-3) 0;">
                            ${(inv.features || []).slice(0, 5).map((f) => `<span class="chip">${Utils.escapeHTML(f)}</span>`).join('')}
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:var(--space-3);border-top:1px solid var(--color-border);">
                            <button class="btn btn--secondary btn--sm" data-save-inv="${inv.id}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
                                ذخیره
                            </button>
                            <div style="text-align:left;">
                                <div style="font-weight:800;color:var(--color-sun-300);font-size:var(--font-size-lg);">${Utils.formatNumber(inv.price)} $</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        }).join('');
    },

    _bindSave() {
        document.querySelectorAll('[data-save-inv]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.saveInv;
                const inv = INVERTERS.find((i) => i.id === id);
                if (!inv) return;
                projects.save({
                    name: `اینورتر ${inv.brand} ${Utils.formatNumber(inv.powerKw, 1)}kW`,
                    inverter: inv.id,
                    totalCost: inv.price,
                    totalCapacity: inv.powerKw,
                    numPanels: 0,
                    actualPvKw: 0
                });
                toast.success('اینورتر به پروژه جدید اضافه شد');
                setTimeout(() => location.hash = '#projects', 600);
            });
        });
    },

    _refresh() {
        const list = document.getElementById('invList');
        if (list) list.innerHTML = this._render();
        this._bindSave();
    }
};
