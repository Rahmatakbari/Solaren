/**
 * مدیریت پرداخت - Payment Management
 * پیگیری اقساط و پرداخت‌ها
 */
import { Utils } from '../utils.js';
import { toast, modal } from '../ui.js';
import { payments, invoices, customers, projects, settings } from '../store.js';

export const paymentsView = {
    name: 'payments',
    path: '#payments',

    state: {
        filter: 'all', // all, paid, pending, overdue
        search: ''
    },

    render() {
        const currency = settings.get('currency', '$');
        const all = this._allPayments();
        const filtered = this._filterPayments(all);
        const stats = this._calcStats(all);

        return `
            <h1 class="page-title anim-fade-up">مدیریت پرداخت</h1>
            <p class="page-subtitle anim-fade-up">پیگیری اقساط و پرداخت‌های مشتریان</p>

            <div class="stats stagger">
                <div class="stat stat--emerald">
                    <div class="stat__label">دریافت شده</div>
                    <div class="stat__value">${Utils.formatNumber(stats.paid)}<span class="stat__unit">${currency}</span></div>
                </div>
                <div class="stat stat--sun">
                    <div class="stat__label">در انتظار</div>
                    <div class="stat__value">${Utils.formatNumber(stats.pending)}<span class="stat__unit">${currency}</span></div>
                </div>
                <div class="stat" style="border-color:var(--color-red-500);">
                    <div class="stat__label">عقب افتاده</div>
                    <div class="stat__value" style="color:var(--color-red-400);">${Utils.formatNumber(stats.overdue)}<span class="stat__unit">${currency}</span></div>
                </div>
                <div class="stat stat--violet">
                    <div class="stat__label">تعداد اقساط</div>
                    <div class="stat__value">${Utils.toPersian(all.length)}</div>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--emerald">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg>
                    </div>
                    <div>
                        <div class="card__title">ثبت پرداخت جدید</div>
                        <div class="card__subtitle">اقساط و پرداخت‌ها</div>
                    </div>
                </div>

                ${invoices.list().length > 0 ? `
                <div class="field">
                    <label class="field__label">انتخاب انوایس</label>
                    <select class="select" id="payInvoice">
                        <option value="">— انتخاب کنید —</option>
                        ${invoices.list().slice(0, 20).map((i) => `
                            <option value="${i.id}">${Utils.escapeHTML(i.number)} - ${Utils.escapeHTML(i.customerName || '—')} (${Utils.formatNumber(Math.round(i.total))} ${currency})</option>
                        `).join('')}
                    </select>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);">
                    <div class="field" style="margin-bottom:0;">
                        <label class="field__label">مبلغ</label>
                        <input type="number" class="input" id="payAmount" placeholder="مبلغ">
                    </div>
                    <div class="field" style="margin-bottom:0;">
                        <label class="field__label">تاریخ</label>
                        <input type="date" class="input" id="payDate" value="${new Date().toISOString().slice(0, 10)}">
                    </div>
                </div>
                <div class="field" style="margin-top:var(--space-3);">
                    <label class="field__label">روش پرداخت</label>
                    <select class="select" id="payMethod">
                        <option value="cash">نقدی</option>
                        <option value="bank">حواله بانکی</option>
                        <option value="check">چک</option>
                        <option value="card">کارت به کارت</option>
                        <option value="online">آنلاین</option>
                    </select>
                </div>
                <button class="btn btn--primary btn--block" id="addPaymentBtn" style="margin-top:var(--space-3);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                    ثبت پرداخت
                </button>
                ` : `
                <div class="empty">
                    <p class="empty__text">ابتدا یک انوایس صادر کنید</p>
                    <a class="btn btn--primary" data-route="invoices" style="display:inline-flex;margin-top:var(--space-3);cursor:pointer;">صدور انوایس</a>
                </div>`}
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">📊 اقساط و پرداخت‌ها</h2>
                </div>
                <div class="switch-group" id="payFilter" style="margin-bottom:var(--space-3);">
                    <button class="${this.state.filter === 'all' ? 'is-active' : ''}" data-val="all">همه (${Utils.toPersian(all.length)})</button>
                    <button class="${this.state.filter === 'paid' ? 'is-active' : ''}" data-val="paid">پرداخت شده</button>
                    <button class="${this.state.filter === 'pending' ? 'is-active' : ''}" data-val="pending">در انتظار</button>
                    <button class="${this.state.filter === 'overdue' ? 'is-active' : ''}" data-val="overdue">عقب افتاده</button>
                </div>

                <div class="list" id="paymentsList">
                    ${filtered.length === 0 ? `
                    <div class="empty">
                        <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="12" rx="2"/></svg></div>
                        <h3 class="empty__title">پرداختی ثبت نشده</h3>
                        <p class="empty__text">اولین پرداخت را ثبت کنید</p>
                    </div>` : filtered.map((p) => this._renderPayment(p, currency)).join('')}
                </div>
            </div>
        `;
    },

    _renderPayment(p, currency) {
        const invoice = invoices.get(p.invoiceId);
        const isOverdue = p.status === 'pending' && new Date(p.dueDate) < new Date();
        const statusChip = p.status === 'paid'
            ? '<span class="chip chip--emerald">پرداخت شده</span>'
            : isOverdue
                ? '<span class="chip chip--danger">عقب افتاده</span>'
                : '<span class="chip chip--sun">در انتظار</span>';

        return `
            <div class="list-item anim-fade-up" data-payment-id="${p.id}" style="cursor:default;${isOverdue ? 'border-right:3px solid var(--color-red-500);' : ''}">
                <div class="list-item__icon" style="background:${p.status === 'paid' ? 'rgba(16,185,129,0.15)' : isOverdue ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'};color:${p.status === 'paid' ? 'var(--color-emerald-400)' : isOverdue ? 'var(--color-red-400)' : 'var(--color-sun-300)'};">
                    ${p.status === 'paid' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'}
                </div>
                <div class="list-item__body">
                    <div class="list-item__title">${Utils.formatNumber(Math.round(p.amount))} ${currency}</div>
                    <div class="list-item__subtitle">
                        ${invoice ? Utils.escapeHTML(invoice.number) : '—'} · ${invoice ? Utils.escapeHTML(invoice.customerName) : ''}
                    </div>
                    <div class="list-item__subtitle" style="margin-top:2px;">
                        📅 ${Utils.formatDate(p.dueDate)} · ${this._methodLabel(p.method)}
                    </div>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:var(--space-2);">
                    ${statusChip}
                    <button class="btn btn--icon btn--sm" data-toggle="${p.id}" style="width:32px;height:32px;">
                        ${p.status === 'paid' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>'}
                    </button>
                </div>
            </div>
        `;
    },

    _methodLabel(method) {
        const labels = { cash: 'نقدی', bank: 'حواله بانکی', check: 'چک', card: 'کارت به کارت', online: 'آنلاین' };
        return labels[method] || method;
    },

    _allPayments() {
        return payments.list().sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    },

    _filterPayments(all) {
        let filtered = all;
        if (this.state.filter !== 'all') {
            if (this.state.filter === 'overdue') {
                filtered = all.filter((p) => p.status === 'pending' && new Date(p.dueDate) < new Date());
            } else {
                filtered = all.filter((p) => p.status === this.state.filter);
            }
        }
        return filtered;
    },

    _calcStats(all) {
        const today = new Date();
        return all.reduce((s, p) => {
            if (p.status === 'paid') s.paid += p.amount;
            else if (new Date(p.dueDate) < today) s.overdue += p.amount;
            else s.pending += p.amount;
            return s;
        }, { paid: 0, pending: 0, overdue: 0 });
    },

    attach() {
        document.querySelectorAll('#payFilter button').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.filter = btn.dataset.val;
                document.querySelectorAll('#payFilter button').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                this._refreshList();
            });
        });

        document.getElementById('addPaymentBtn')?.addEventListener('click', () => this._add());

        document.querySelectorAll('[data-toggle]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this._toggle(btn.dataset.toggle);
            });
        });
    },

    _add() {
        const invoiceId = document.getElementById('payInvoice')?.value;
        const amount = parseFloat(document.getElementById('payAmount')?.value);
        const date = document.getElementById('payDate')?.value;
        const method = document.getElementById('payMethod')?.value;
        if (!invoiceId) { toast.error('انوایس انتخاب نشده'); return; }
        if (!Utils.isValidNumber(amount, { min: 1 })) { toast.error('مبلغ نامعتبر'); return; }
        if (!date) { toast.error('تاریخ نامعتبر'); return; }
        payments.save({
            invoiceId,
            amount,
            dueDate: date,
            method,
            status: 'paid',
            paidAt: Date.now(),
            createdAt: Date.now()
        });
        toast.success('پرداخت ثبت شد');
        this._refresh();
    },

    _toggle(id) {
        const p = payments.get(id);
        if (!p) return;
        if (p.status === 'paid') {
            p.status = 'pending';
            p.paidAt = null;
        } else {
            p.status = 'paid';
            p.paidAt = Date.now();
        }
        payments.save(p);
        toast.success('وضعیت تغییر کرد');
        this._refresh();
    },

    _refresh() {
        const view = document.getElementById('view');
        if (view) { view.innerHTML = this.render(); this.attach(); }
    },

    _refreshList() {
        const all = this._allPayments();
        const filtered = this._filterPayments(all);
        const list = document.getElementById('paymentsList');
        if (list) {
            const currency = settings.get('currency', '$');
            list.innerHTML = filtered.length === 0
                ? '<div class="empty"><h3 class="empty__title">موردی یافت نشد</h3></div>'
                : filtered.map((p) => this._renderPayment(p, currency)).join('');
            this.attach();
        }
    }
};
