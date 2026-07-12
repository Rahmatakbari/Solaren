/**
 * Customers v3 — Production ready with proper error handling
 */
import { Utils } from '../utils.js';
import { toast, modal } from '../ui.js';
import { customers, projects, invoices } from '../store.js';

export const customersView = {
    name: 'customers',
    path: '#customers',

    state: { search: '' },

    render() {
        const list = customers.list();
        return `
            <h1 class="page-title anim-fade-up">مشتریان</h1>
            <p class="page-subtitle anim-fade-up">${Utils.toPersian(list.length)} مشتری ثبت شده</p>

            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="search">
                    <input type="text" class="input" id="searchCustomer" placeholder="جستجو بر اساس نام یا تلفن..." value="${Utils.escapeHTML(this.state.search)}">
                    <span class="search__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                </div>
            </div>

            <div class="list stagger" id="customerList">
                ${list.length === 0 ? this._empty() : this._renderList(list)}
            </div>

            <button class="fab" id="addCustomerFab" aria-label="افزودن مشتری">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
        `;
    },

    _empty() {
        return `
            <div class="card card--glass anim-fade-up" style="text-align:center;padding:var(--space-8);">
                <div style="width:80px;height:80px;margin:0 auto var(--space-4);border-radius:var(--radius-2xl);background:var(--gradient-card);display:flex;align-items:center;justify-content:center;color:var(--color-text-dim);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="40" height="40"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <h3 style="font-size:var(--font-size-lg);font-weight:700;margin-bottom:var(--space-2);">هنوز مشتری ندارید</h3>
                <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);margin-bottom:var(--space-5);">با صدور اولین انوایس، مشتری به صورت خودکار ثبت می‌شود</p>
                <button class="btn btn--primary" id="emptyAddBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    افزودن اولین مشتری
                </button>
            </div>
        `;
    },

    _renderList(list) {
        const q = this.state.search.toLowerCase().trim();
        const filtered = q ? list.filter((c) =>
            (c.name || '').toLowerCase().includes(q) ||
            (c.phone || '').includes(q) ||
            (c.address || '').toLowerCase().includes(q)
        ) : list;
        if (filtered.length === 0) return '<div class="empty"><div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div><h3 class="empty__title">نتیجه‌ای یافت نشد</h3></div>';

        return filtered.map((c) => {
            const customerInvoices = invoices.list().filter((i) => i.customerName === c.name);
            const totalValue = customerInvoices.reduce((s, i) => s + (i.total || 0), 0);
            const initial = (c.name || '?').charAt(0).toUpperCase();
            return `
                <div class="list-item card--hover" data-customer-id="${c.id}">
                    <div class="list-item__icon" style="background:var(--gradient-sun);color:var(--color-text-inverse);font-weight:800;font-size:var(--font-size-lg);">${Utils.escapeHTML(initial)}</div>
                    <div class="list-item__body">
                        <div class="list-item__title">${Utils.escapeHTML(c.name)}</div>
                        <div class="list-item__subtitle">${Utils.escapeHTML(c.phone || 'بدون شماره')} · ${Utils.toPersian(customerInvoices.length)} انوایس</div>
                    </div>
                    <div style="text-align:left;flex-shrink:0;">
                        <div style="font-weight:700;color:var(--color-emerald-400);">${Utils.formatNumber(Math.round(totalValue))} $</div>
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);margin-top:2px;">${c.lastUsed ? Utils.formatDate(c.lastUsed) : ''}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    attach() {
        const search = document.getElementById('searchCustomer');
        if (search) {
            search.addEventListener('input', Utils.debounce((e) => {
                this.state.search = e.target.value;
                const list = document.getElementById('customerList');
                if (list) list.innerHTML = this._renderList(customers.list());
                this._bindItems();
            }, 200));
        }

        document.getElementById('addCustomerFab')?.addEventListener('click', () => this._add());
        document.getElementById('emptyAddBtn')?.addEventListener('click', () => this._add());
        this._bindItems();
    },

    _bindItems() {
        document.querySelectorAll('[data-customer-id]').forEach((el) => {
            el.addEventListener('click', () => this._view(el.dataset.customerId));
        });
    },

    async _add() {
        try {
            const name = await modal.prompt({ title: 'مشتری جدید', label: 'نام و نام خانوادگی *', placeholder: 'نام مشتری' });
            if (!name || !name.trim()) return;
            const phone = await modal.prompt({ title: 'شماره تماس', label: 'تلفن (اختیاری)', type: 'tel', defaultValue: '' });
            const address = await modal.prompt({ title: 'آدرس', label: 'آدرس (اختیاری)', placeholder: 'آدرس کامل', defaultValue: '' });
            customers.save({ name: name.trim(), phone: (phone || '').trim(), address: (address || '').trim(), lastUsed: Date.now() });
            toast.success('مشتری اضافه شد');
            this._refresh();
        } catch (e) { /* cancelled */ }
    },

    _view(id) {
        const c = customers.get(id);
        if (!c) return;
        const customerInvoices = invoices.list().filter((i) => i.customerName === c.name);
        const totalValue = customerInvoices.reduce((s, i) => s + (i.total || 0), 0);
        const body = `
            <div style="text-align:center;padding-bottom:var(--space-4);border-bottom:1px solid var(--color-border);margin-bottom:var(--space-4);">
                <div style="width:80px;height:80px;margin:0 auto var(--space-3);border-radius:var(--radius-full);background:var(--gradient-sun);color:var(--color-text-inverse);display:flex;align-items:center;justify-content:center;font-size:var(--font-size-2xl);font-weight:800;">${Utils.escapeHTML((c.name || '?').charAt(0))}</div>
                <h2 style="font-size:var(--font-size-xl);font-weight:700;">${Utils.escapeHTML(c.name)}</h2>
                <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);">${Utils.escapeHTML(c.phone || '—')}</p>
            </div>
            <div class="list">
                <div class="list-item" style="cursor:default;">
                    <div class="list-item__body"><div class="list-item__title">آدرس</div><div class="list-item__subtitle">${Utils.escapeHTML(c.address || '—')}</div></div>
                </div>
                <div class="list-item" style="cursor:default;">
                    <div class="list-item__body"><div class="list-item__title">تعداد انوایس‌ها</div></div>
                    <span style="font-weight:700;">${Utils.toPersian(customerInvoices.length)}</span>
                </div>
                <div class="list-item" style="cursor:default;">
                    <div class="list-item__body"><div class="list-item__title">ارزش کل</div></div>
                    <span style="font-weight:700;color:var(--color-emerald-400);">${Utils.formatNumber(Math.round(totalValue))} $</span>
                </div>
            </div>
            ${customerInvoices.length > 0 ? `
                <h3 style="margin:var(--space-5) 0 var(--space-3);font-weight:700;">انوایس‌های این مشتری</h3>
                <div class="list">
                    ${customerInvoices.slice(0, 5).map((i) => `
                        <div class="list-item" style="cursor:default;">
                            <div class="list-item__body">
                                <div class="list-item__title">${Utils.escapeHTML(i.number)}</div>
                                <div class="list-item__subtitle">${Utils.formatDate(i.createdAt)}</div>
                            </div>
                            <span style="font-weight:700;color:var(--color-emerald-400);">${Utils.formatNumber(Math.round(i.total))} $</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
        const footer = document.createElement('div');
        footer.style.cssText = 'display:flex;gap:12px;width:100%;';
        footer.innerHTML = `<button class="btn btn--danger btn--block" data-del="${id}">حذف</button><button class="btn btn--primary btn--block" data-close-modal>بستن</button>`;
        modal.open({ title: 'جزئیات مشتری', body, footer });
        footer.querySelector('[data-del]')?.addEventListener('click', async () => {
            const ok = await modal.confirm({ title: 'حذف', message: 'حذف شود؟', danger: true, confirmText: 'حذف' });
            if (ok) {
                customers.remove(id);
                modal.close();
                toast.success('حذف شد');
                this._refresh();
            }
        });
    },

    _refresh() {
        const view = document.getElementById('view');
        if (view) { view.innerHTML = this.render(); this.attach(); }
    }
};
