/**
 * Projects module v3 — Production ready
 */
import { Utils } from '../utils.js';
import { toast, modal } from '../ui.js';
import { projects, invoices } from '../store.js';

export const projectsView = {
    name: 'projects',
    path: '#projects',

    state: { filter: 'all', search: '' },

    render() {
        const all = projects.list();
        let list = all;
        if (this.state.filter !== 'all') list = list.filter((p) => p.systemType === this.state.filter);
        if (this.state.search) {
            const q = this.state.search.toLowerCase();
            list = list.filter((p) => (p.name || '').toLowerCase().includes(q));
        }

        return `
            <h1 class="page-title anim-fade-up">پروژه‌های من</h1>
            <p class="page-subtitle anim-fade-up">${Utils.toPersian(all.length)} پروژه ذخیره شده</p>

            ${all.length > 0 ? `
            <div class="switch-group anim-fade-up" style="margin-bottom:var(--space-3);" id="projFilter">
                <button class="${this.state.filter === 'all' ? 'is-active' : ''}" data-val="all">همه (${Utils.toPersian(all.length)})</button>
                <button class="${this.state.filter === 'on-grid' ? 'is-active' : ''}" data-val="on-grid">آنگرید</button>
                <button class="${this.state.filter === 'off-grid' ? 'is-active' : ''}" data-val="off-grid">آفگرید</button>
                <button class="${this.state.filter === 'hybrid' ? 'is-active' : ''}" data-val="hybrid">هیبرید</button>
            </div>
            <div class="search anim-fade-up" style="margin-bottom:var(--space-4);">
                <input type="text" class="input" id="searchProj" placeholder="جستجوی پروژه..." value="${Utils.escapeHTML(this.state.search)}">
                <span class="search__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            </div>` : ''}

            <div class="list stagger" id="projList">
                ${list.length === 0 ? this._empty(all.length === 0) : list.map((p) => this._card(p)).join('')}
            </div>
        `;
    },

    _empty(noProjectsAtAll) {
        if (noProjectsAtAll) {
            return `
                <div class="card card--glass anim-fade-up" style="text-align:center;padding:var(--space-8);">
                    <div style="width:80px;height:80px;margin:0 auto var(--space-4);border-radius:var(--radius-2xl);background:var(--gradient-card);display:flex;align-items:center;justify-content:center;color:var(--color-text-dim);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="40" height="40"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <h3 style="font-size:var(--font-size-lg);font-weight:700;margin-bottom:var(--space-2);">پروژه‌ای ندارید</h3>
                    <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);margin-bottom:var(--space-5);">از بخش برآورد سریع یا تفصیلی شروع کنید</p>
                    <a class="btn btn--primary" data-route="quick-estimate" style="display:inline-flex;cursor:pointer;">شروع برآورد</a>
                </div>
            `;
        }
        return `<div class="empty"><h3 class="empty__title">موردی یافت نشد</h3><p class="empty__text">فیلتر یا جستجوی دیگری امتحان کنید</p></div>`;
    },

    _card(p) {
        const systemTypeLabel = p.systemType === 'on-grid' ? 'آنگرید' : p.systemType === 'off-grid' ? 'آفگرید' : 'هیبرید';
        const chipClass = p.systemType === 'off-grid' ? 'danger' : p.systemType === 'hybrid' ? 'emerald' : 'sun';
        return `
            <div class="card card--glass card--hover" data-view-project="${p.id}" style="cursor:pointer;">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-3);margin-bottom:var(--space-3);">
                    <div style="flex:1;min-width:0;">
                        <h3 style="font-weight:700;font-size:var(--font-size-md);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${Utils.escapeHTML(p.name)}</h3>
                        <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);">${Utils.formatDate(p.updatedAt)} · ${p.type === 'quick' ? 'سریع' : 'تفصیلی'}</p>
                    </div>
                    <span class="chip chip--${chipClass}">${systemTypeLabel}</span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2);margin-bottom:var(--space-3);">
                    <div style="text-align:center;padding:var(--space-2);background:var(--color-bg-soft);border-radius:var(--radius-sm);">
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">ظرفیت</div>
                        <div style="font-weight:700;color:var(--color-sun-300);">${Utils.formatNumber(p.actualPvKw || p.requiredPvKw || 0, 1)}</div>
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">kW</div>
                    </div>
                    <div style="text-align:center;padding:var(--space-2);background:var(--color-bg-soft);border-radius:var(--radius-sm);">
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">پنل</div>
                        <div style="font-weight:700;">${Utils.toPersian(p.numPanels || 0)}</div>
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">عدد</div>
                    </div>
                    <div style="text-align:center;padding:var(--space-2);background:var(--color-bg-soft);border-radius:var(--radius-sm);">
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">هزینه</div>
                        <div style="font-weight:700;color:var(--color-emerald-400);">${Utils.formatNumber(Math.round(p.totalCost || 0))}</div>
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">$</div>
                    </div>
                </div>
                <div style="display:flex;gap:var(--space-2);">
                    <a class="btn btn--primary btn--sm" data-route="invoices" data-project="${p.id}" style="flex:1;cursor:pointer;text-decoration:none;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                        صدور انوایس
                    </a>
                    <button class="btn btn--ghost btn--sm" data-action="delete" data-id="${p.id}" title="حذف">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
                    </button>
                </div>
            </div>
        `;
    },

    attach() {
        document.querySelectorAll('#projFilter button').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.filter = btn.dataset.val;
                document.querySelectorAll('#projFilter button').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                this._refresh();
            });
        });

        document.getElementById('searchProj')?.addEventListener('input', Utils.debounce((e) => {
            this.state.search = e.target.value;
            this._refresh();
        }, 200));

        // Delete buttons
        document.querySelectorAll('[data-action="delete"]').forEach((btn) => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const ok = await modal.confirm({ title: 'حذف پروژه', message: 'این عملیات قابل بازگشت نیست. مطمئن هستید؟', danger: true, confirmText: 'حذف' });
                if (ok) {
                    projects.remove(btn.dataset.id);
                    toast.success('پروژه حذف شد');
                    this._refresh();
                }
            });
        });

        // View project detail
        document.querySelectorAll('[data-view-project]').forEach((card) => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('button, a')) return;
                this._showDetail(card.dataset.viewProject);
            });
        });

        // Project links
        document.querySelectorAll('[data-route]').forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                const pid = link.getAttribute('data-project');
                if (pid) sessionStorage.setItem('autoSelectProject', pid);
                if (route) location.hash = '#' + route;
            });
        });
    },

    _showDetail(id) {
        const p = projects.get(id);
        if (!p) return;
        const systemTypeLabel = p.systemType === 'on-grid' ? 'آنگرید' : p.systemType === 'off-grid' ? 'آفگرید' : 'هیبرید';
        const body = `
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-3);margin-bottom:var(--space-4);">
                <div style="text-align:center;padding:var(--space-3);background:var(--gradient-card);border-radius:var(--radius-md);">
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">ظرفیت</div>
                    <div style="font-weight:800;color:var(--color-sun-300);font-size:var(--font-size-xl);">${Utils.formatNumber(p.actualPvKw || p.requiredPvKw || 0, 2)}</div>
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">kW</div>
                </div>
                <div style="text-align:center;padding:var(--space-3);background:var(--gradient-card);border-radius:var(--radius-md);">
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">هزینه کل</div>
                    <div style="font-weight:800;color:var(--color-emerald-400);font-size:var(--font-size-xl);">${Utils.formatNumber(Math.round(p.totalCost || 0))}</div>
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">$</div>
                </div>
                <div style="text-align:center;padding:var(--space-3);background:var(--gradient-card);border-radius:var(--radius-md);">
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">پنل</div>
                    <div style="font-weight:800;font-size:var(--font-size-xl);">${Utils.toPersian(p.numPanels || 0)}</div>
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">عدد</div>
                </div>
                <div style="text-align:center;padding:var(--space-3);background:var(--gradient-card);border-radius:var(--radius-md);">
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">تولید سالانه</div>
                    <div style="font-weight:800;color:var(--color-sky-300);font-size:var(--font-size-xl);">${Utils.formatNumber(Math.round(p.annualKWh || 0), 0)}</div>
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">kWh</div>
                </div>
            </div>
            <div class="list">
                <div class="list-item" style="cursor:default;"><div class="list-item__body"><div class="list-item__title">نوع سیستم</div></div><span class="chip chip--sun">${systemTypeLabel}</span></div>
                <div class="list-item" style="cursor:default;"><div class="list-item__body"><div class="list-item__title">محل</div><div class="list-item__subtitle">${Utils.escapeHTML(p.location || '—')}</div></div></div>
                <div class="list-item" style="cursor:default;"><div class="list-item__body"><div class="list-item__title">PSH</div><div class="list-item__subtitle">ساعات اوج آفتاب</div></div><span style="font-weight:700;">${Utils.formatNumber(p.peakSunHours || 0, 1)} ساعت</span></div>
                <div class="list-item" style="cursor:default;"><div class="list-item__body"><div class="list-item__title">اوج مصرف</div></div><span style="font-weight:700;">${Utils.formatNumber(p.peakLoadW || 0, 0)} W</span></div>
                ${p.actualPvKw ? `<div class="list-item" style="cursor:default;"><div class="list-item__body"><div class="list-item__title">ظرفیت واقعی</div></div><span style="font-weight:700;color:var(--color-sun-300);">${Utils.formatNumber(p.actualPvKw, 2)} kW</span></div>` : ''}
                ${p.numBatteries ? `<div class="list-item" style="cursor:default;"><div class="list-item__body"><div class="list-item__title">باتری</div></div><span style="font-weight:700;">${Utils.toPersian(p.numBatteries)} × ${Utils.formatNumber(p.batteryKWh || 0, 1)} kWh</span></div>` : ''}
            </div>
        `;
        const footer = document.createElement('div');
        footer.style.cssText = 'display:flex;gap:12px;width:100%;';
        footer.innerHTML = `
            <button class="btn btn--secondary btn--block" data-action="invoice">صدور انوایس</button>
            <button class="btn btn--primary btn--block" data-close-modal>بستن</button>
        `;
        modal.open({ title: p.name, body, footer });
        footer.querySelector('[data-action="invoice"]')?.addEventListener('click', () => {
            modal.close();
            sessionStorage.setItem('autoSelectProject', p.id);
            location.hash = '#invoices';
        });
    },

    _refresh() {
        const view = document.getElementById('view');
        if (view) { view.innerHTML = this.render(); this.attach(); }
    }
};
