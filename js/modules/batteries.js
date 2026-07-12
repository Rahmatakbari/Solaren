/**
 * Batteries v3 — Production ready
 */
import { Utils } from '../utils.js';
import { BATTERIES } from '../data/batteries.js';

export const batteries = {
    name: 'batteries',
    path: '#batteries',

    state: { search: '', type: 'all' },

    render() {
        const types = [
            { id: 'all', label: 'همه' },
            { id: 'LiFePO4', label: 'لیتیوم' },
            { id: 'Lead-Acid', label: 'سرب اسید' },
            { id: 'Gel', label: 'ژل' }
        ];
        return `
            <h1 class="page-title anim-fade-up">باتری‌ها</h1>
            <p class="page-subtitle anim-fade-up">${Utils.toPersian(BATTERIES.length)} مدل باتری لیتیوم و سرب اسید</p>

            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="search">
                    <input type="text" class="input" id="searchBat" placeholder="جستجو...">
                    <span class="search__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                </div>
                <div class="switch-group" style="margin-top:var(--space-3);" id="batTypeFilter">
                    ${types.map((t) => `<button class="${this.state.type === t.id ? 'is-active' : ''}" data-val="${t.id}">${t.label}</button>`).join('')}
                </div>
            </div>

            <div class="list stagger" id="batList">
                ${this._render()}
            </div>
        `;
    },

    attach() {
        const search = document.getElementById('searchBat');
        if (search) {
            search.addEventListener('input', Utils.debounce((e) => {
                this.state.search = e.target.value;
                this._refresh();
            }, 200));
        }
        document.querySelectorAll('#batTypeFilter button').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.type = btn.dataset.val;
                document.querySelectorAll('#batTypeFilter button').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                this._refresh();
            });
        });
    },

    _render() {
        let list = [...BATTERIES];
        if (this.state.type !== 'all') list = list.filter((b) => b.type === this.state.type);
        if (this.state.search) {
            const q = this.state.search.toLowerCase();
            list = list.filter((b) => b.brand.toLowerCase().includes(q) || b.model.toLowerCase().includes(q));
        }
        if (list.length === 0) return '<div class="empty"><h3 class="empty__title">موردی یافت نشد</h3><p class="empty__text">فیلتر یا جستجوی دیگری امتحان کنید</p></div>';
        return list.map((b) => `
            <div class="card card--glass card--hover">
                <div style="display:flex;align-items:flex-start;gap:var(--space-3);">
                    <div class="card__icon card__icon--emerald" style="width:56px;height:56px;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="28" height="28"><rect x="2" y="7" width="18" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/><line x1="6" y1="11" x2="6" y2="13"/><line x1="10" y1="11" x2="10" y2="13"/><line x1="14" y1="11" x2="14" y2="13"/></svg>
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:var(--space-2);margin-bottom:var(--space-2);">
                            <div style="min-width:0;">
                                <h3 style="font-weight:700;font-size:var(--font-size-md);">${Utils.escapeHTML(b.brand)}</h3>
                                <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);font-family:var(--font-mono);">${Utils.escapeHTML(b.model)}</p>
                            </div>
                            <span class="chip chip--emerald">${b.type}</span>
                        </div>
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2);font-size:var(--font-size-sm);">
                            <div><span style="color:var(--color-text-dim);">ظرفیت:</span> <strong>${b.capacityKWh} kWh</strong></div>
                            <div><span style="color:var(--color-text-dim);">ولتاژ:</span> <strong>${b.voltage}V</strong></div>
                            <div><span style="color:var(--color-text-dim);">آمپر:</span> <strong>${b.capacityAh} Ah</strong></div>
                            <div><span style="color:var(--color-text-dim);">DoD:</span> <strong>${b.dod}%</strong></div>
                            <div><span style="color:var(--color-text-dim);">عمر:</span> <strong>${Utils.toPersian(b.cycles)} چرخه</strong></div>
                            <div><span style="color:var(--color-text-dim);">گارانتی:</span> <strong>${b.warranty} سال</strong></div>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:var(--space-1);margin:var(--space-3) 0;">
                            ${b.features.map((f) => `<span class="chip">${Utils.escapeHTML(f)}</span>`).join('')}
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:var(--space-3);border-top:1px solid var(--color-border);">
                            <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">${Utils.formatNumber(Math.round(b.price / b.capacityKWh))} $/kWh</div>
                            <div style="font-weight:800;color:var(--color-sun-300);font-size:var(--font-size-lg);">${Utils.formatNumber(b.price)} $</div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    _refresh() {
        const list = document.getElementById('batList');
        if (list) list.innerHTML = this._render();
    }
};
