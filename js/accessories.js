/**
 * Accessories catalog v3
 */
import { Utils } from '../utils.js';
import { ACCESSORIES } from '../data/accessories.js';

export const accessories = {
    name: 'accessories',
    path: '#accessories',

    state: { category: 'all', search: '' },

    render() {
        const categories = [
            { id: 'all', label: 'همه', icon: '📦' },
            { id: 'cable', label: 'کابل', icon: '🔌' },
            { id: 'connector', label: 'کانکتور', icon: '🔗' },
            { id: 'breaker', label: 'بریکر و فیوز', icon: '⚡' },
            { id: 'protection', label: 'محافظ و ارت', icon: '🛡️' },
            { id: 'mounting', label: 'سازه نصب', icon: '🔧' },
            { id: 'monitoring', label: 'مانیتورینگ', icon: '📊' },
            { id: 'enclosure', label: 'تابلو و کابینت', icon: '🗄️' }
        ];
        return `
            <h1 class="page-title anim-fade-up">لوازم جانبی</h1>
            <p class="page-subtitle anim-fade-up">${Utils.toPersian(ACCESSORIES.length)} قلم تجهیزات جانبی</p>

            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="search" style="margin-bottom:var(--space-3);">
                    <input type="text" class="input" id="searchAcc" placeholder="جستجو...">
                    <span class="search__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                </div>
                <div class="switch-group" id="accCatFilter" style="flex-wrap:wrap;gap:var(--space-1);">
                    ${categories.map((c) => `<button class="${this.state.category === c.id ? 'is-active' : ''}" data-val="${c.id}">${c.icon} ${c.label}</button>`).join('')}
                </div>
            </div>

            <div class="list stagger" id="accList">
                ${this._render()}
            </div>
        `;
    },

    attach() {
        document.getElementById('searchAcc')?.addEventListener('input', Utils.debounce((e) => {
            this.state.search = e.target.value;
            this._refresh();
        }, 200));
        document.querySelectorAll('#accCatFilter button').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.category = btn.dataset.val;
                document.querySelectorAll('#accCatFilter button').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                this._refresh();
            });
        });
    },

    _render() {
        let list = [...ACCESSORIES];
        if (this.state.category !== 'all') list = list.filter((a) => a.category === this.state.category);
        if (this.state.search) {
            const q = this.state.search.toLowerCase();
            list = list.filter((a) => a.name.toLowerCase().includes(q));
        }
        if (list.length === 0) return '<div class="empty"><h3 class="empty__title">موردی یافت نشد</h3><p class="empty__text">فیلتر یا جستجوی دیگری امتحان کنید</p></div>';
        return list.map((a) => `
            <div class="list-item" style="cursor:default;">
                <div class="list-item__icon" style="background:rgba(245,158,11,0.12);color:var(--color-sun-300);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                </div>
                <div class="list-item__body">
                    <h3 style="font-weight:600;font-size:var(--font-size-md);">${Utils.escapeHTML(a.name)}</h3>
                    <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);">واحد: ${Utils.escapeHTML(a.unit)} · دسته: ${Utils.escapeHTML(a.category)}</p>
                </div>
                <div style="text-align:left;flex-shrink:0;">
                    <div style="font-weight:700;color:var(--color-sun-300);">${Utils.formatNumber(a.price)} $</div>
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">/${a.unit}</div>
                </div>
            </div>
        `).join('');
    },

    _refresh() {
        const list = document.getElementById('accList');
        if (list) list.innerHTML = this._render();
    }
};
