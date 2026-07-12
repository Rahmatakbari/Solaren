/**
 * سیستم CRM و امتیاز وفاداری مشتری
 * Customer Relationship Management with Loyalty Points
 */
import { Utils } from '../utils.js';
import { toast, modal } from '../ui.js';
import { customers, invoices, projects, loyalty, settings } from '../store.js';

export const crm = {
    name: 'crm',
    path: '#crm',

    state: {
        view: 'list', // list, detail
        selectedCustomerId: null,
        search: '',
        filter: 'all' // all, vip, gold, silver, bronze
    },

    TIERS: {
        bronze: { name: 'برنز', min: 0, color: '#cd7f32', discount: 2, icon: '🥉' },
        silver: { name: 'نقره', min: 1000, color: '#c0c0c0', discount: 5, icon: '🥈' },
        gold: { name: 'طلا', min: 5000, color: '#ffd700', discount: 8, icon: '🥇' },
        vip: { name: 'VIP', min: 15000, color: '#a855f7', discount: 12, icon: '👑' }
    },

    render() {
        const all = this._all();
        const stats = this._calcStats(all);
        const filtered = this._filter(all);
        const selected = this.state.selectedCustomerId ? customers.get(this.state.selectedCustomerId) : null;

        return `
            <h1 class="page-title anim-fade-up">CRM و وفاداری مشتری</h1>
            <p class="page-subtitle anim-fade-up">مدیریت ارتباط با مشتری و سیستم امتیازدهی</p>

            ${!selected ? `
            <div class="stats stagger">
                <div class="stat stat--violet">
                    <div class="stat__label">کل مشتریان</div>
                    <div class="stat__value">${Utils.toPersian(all.length)}</div>
                </div>
                <div class="stat stat--sun">
                    <div class="stat__label">VIP</div>
                    <div class="stat__value">${Utils.toPersian(stats.vip)}</div>
                </div>
                <div class="stat stat--emerald">
                    <div class="stat__label">طلا</div>
                    <div class="stat__value">${Utils.toPersian(stats.gold)}</div>
                </div>
                <div class="stat stat--sky">
                    <div class="stat__label">ارزش کل</div>
                    <div class="stat__value">${Utils.formatNumber(Math.round(stats.totalValue / 1000))}<span class="stat__unit">K</span></div>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">سطح‌بندی مشتریان</h2>
                </div>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-2);">
                    ${Object.entries(this.TIERS).map(([key, tier]) => `
                    <div style="text-align:center;padding:var(--space-3);background:linear-gradient(135deg, ${tier.color}22, ${tier.color}11);border:1px solid ${tier.color}44;border-radius:var(--radius-md);">
                        <div style="font-size:32px;">${tier.icon}</div>
                        <div style="font-weight:800;color:${tier.color};">${tier.name}</div>
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">${Utils.formatNumber(tier.min)}+ امتیاز</div>
                        <div style="font-size:var(--font-size-xs);color:var(--color-emerald-400);">تخفیف ${tier.discount}%</div>
                    </div>
                    `).join('')}
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="search" style="margin-bottom:var(--space-3);">
                    <input type="text" class="input" id="crmSearch" placeholder="جستجو..." value="${Utils.escapeHTML(this.state.search)}">
                    <span class="search__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                </div>
                <div class="switch-group" id="crmFilter" style="margin-bottom:var(--space-3);">
                    <button class="${this.state.filter === 'all' ? 'is-active' : ''}" data-val="all">همه</button>
                    <button class="${this.state.filter === 'vip' ? 'is-active' : ''}" data-val="vip">VIP</button>
                    <button class="${this.state.filter === 'gold' ? 'is-active' : ''}" data-val="gold">طلا</button>
                    <button class="${this.state.filter === 'silver' ? 'is-active' : ''}" data-val="silver">نقره</button>
                    <button class="${this.state.filter === 'bronze' ? 'is-active' : ''}" data-val="bronze">برنز</button>
                </div>
            </div>

            <div class="list stagger">
                ${filtered.length === 0 ? `
                <div class="empty">
                    <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
                    <h3 class="empty__title">مشتری‌ای یافت نشد</h3>
                </div>` : filtered.map((c) => this._renderCustomerCard(c, stats.totals[c.id] || { spent: 0, points: 0 })).join('')}
            </div>
            ` : this._renderDetail(selected)}
        `;
    },

    _renderCustomerCard(customer, totals) {
        const tier = this._getTier(totals.points);
        const lastUsed = customer.lastUsed ? Utils.formatDate(customer.lastUsed) : '—';
        return `
            <div class="card card--glass card--hover anim-fade-up" data-customer="${customer.id}" style="cursor:pointer;border-right:4px solid ${tier.color};">
                <div style="display:flex;align-items:center;gap:var(--space-3);">
                    <div class="card__icon" style="background:linear-gradient(135deg, ${tier.color}, ${tier.color}88);color:white;width:56px;height:56px;font-weight:800;font-size:var(--font-size-xl);">
                        ${Utils.escapeHTML((customer.name || '?').charAt(0))}
                    </div>
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:2px;">
                            <h3 style="font-weight:700;font-size:var(--font-size-md);">${Utils.escapeHTML(customer.name)}</h3>
                            <span class="chip" style="background:${tier.color}22;color:${tier.color};border:1px solid ${tier.color}44;">${tier.icon} ${tier.name}</span>
                        </div>
                        <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);">${Utils.escapeHTML(customer.phone || 'بدون شماره')}</p>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2);margin-top:var(--space-3);">
                    <div style="text-align:center;padding:var(--space-2);background:var(--color-bg-soft);border-radius:var(--radius-sm);">
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">خرید کل</div>
                        <div style="font-weight:800;color:var(--color-sun-300);font-size:var(--font-size-sm);">${Utils.formatNumber(Math.round(totals.spent / 1000))}K</div>
                    </div>
                    <div style="text-align:center;padding:var(--space-2);background:var(--color-bg-soft);border-radius:var(--radius-sm);">
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">امتیاز</div>
                        <div style="font-weight:800;color:${tier.color};">${Utils.toPersian(totals.points)}</div>
                    </div>
                    <div style="text-align:center;padding:var(--space-2);background:var(--color-bg-soft);border-radius:var(--radius-sm);">
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">تخفیف</div>
                        <div style="font-weight:800;color:var(--color-emerald-400);">${tier.discount}%</div>
                    </div>
                </div>
                <div style="margin-top:var(--space-2);font-size:var(--font-size-xs);color:var(--color-text-dim);text-align:center;">آخرین خرید: ${lastUsed}</div>
            </div>
        `;
    },

    _renderDetail(customer) {
        const totals = this._calcCustomerTotals(customer);
        const tier = this._getTier(totals.points);
        const customerInvoices = invoices.list().filter((i) => i.customerName === customer.name);
        const customerProjects = projects.list().filter((p) => p.invoice?.customerName === customer.name);
        const loyaltyHistory = loyalty.list().filter((l) => l.customerId === customer.id);

        return `
            <div class="card card--violet anim-fade-up" style="padding:var(--space-5);color:white;position:relative;overflow:hidden;">
                <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;">
                    <button class="btn btn--icon" id="backToCustomers" style="background:rgba(255,255,255,0.2);color:white;margin-bottom:var(--space-3);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div style="display:flex;align-items:center;gap:var(--space-3);">
                        <div style="width:64px;height:64px;border-radius:var(--radius-full);background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:var(--font-size-2xl);">${Utils.escapeHTML((customer.name || '?').charAt(0))}</div>
                        <div style="flex:1;">
                            <h2 style="font-size:var(--font-size-xl);font-weight:800;color:white;">${Utils.escapeHTML(customer.name)}</h2>
                            <p style="opacity:0.9;font-size:var(--font-size-sm);">${Utils.escapeHTML(customer.phone || '')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card card--sun anim-fade-up" style="padding:var(--space-5);margin-top:var(--space-4);position:relative;overflow:hidden;">
                <div style="position:absolute;top:-30px;right:-30px;width:140px;height:140px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;color:var(--color-text-inverse);text-align:center;">
                    <div style="font-size:48px;">${tier.icon}</div>
                    <div style="font-size:var(--font-size-2xl);font-weight:800;">${tier.name}</div>
                    <div style="opacity:0.85;font-size:var(--font-size-md);">${Utils.toPersian(totals.points)} امتیاز</div>
                    <div style="margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px solid rgba(0,0,0,0.15);">
                        <div style="font-size:var(--font-size-xs);opacity:0.85;">سطح بعدی: ${this._nextTier(totals.points)}</div>
                    </div>
                </div>
            </div>

            <div class="stats stagger" style="margin-top:var(--space-4);">
                <div class="stat stat--sun">
                    <div class="stat__label">کل خرید</div>
                    <div class="stat__value">${Utils.formatNumber(Math.round(totals.spent / 1000))}<span class="stat__unit">هزار</span></div>
                </div>
                <div class="stat stat--violet">
                    <div class="stat__label">تعداد پروژه</div>
                    <div class="stat__value">${Utils.toPersian(customerProjects.length)}</div>
                </div>
                <div class="stat stat--emerald">
                    <div class="stat__label">تعداد انوایس</div>
                    <div class="stat__value">${Utils.toPersian(customerInvoices.length)}</div>
                </div>
                <div class="stat stat--sky">
                    <div class="stat__label">سابقه</div>
                    <div class="stat__value">${customer.lastUsed ? this._daysSince(customer.lastUsed) : '—'}</div>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">📋 تاریخچه خرید</h2>
                </div>
                ${customerInvoices.length === 0 ? '<div class="empty"><p class="empty__text">خریدی ثبت نشده</p></div>' : `
                <div class="list">
                    ${customerInvoices.slice(0, 10).map((i) => `
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__icon" style="background:rgba(139,92,246,0.15);color:var(--color-violet-400);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                        </div>
                        <div class="list-item__body">
                            <div class="list-item__title">${Utils.escapeHTML(i.number)}</div>
                            <div class="list-item__subtitle">${Utils.formatDate(i.createdAt)}</div>
                        </div>
                        <div style="text-align:left;">
                            <div style="font-weight:800;color:var(--color-emerald-400);">${Utils.formatNumber(Math.round(i.total))} $</div>
                            <div style="font-size:var(--font-size-xs);color:${tier.color};">+${Utils.toPersian(Math.round(i.total / 10))} امتیاز</div>
                        </div>
                    </div>
                    `).join('')}
                </div>`}
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">🎁 عملیات CRM</h2>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);">
                    <button class="btn btn--primary" data-action="add-points">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        افزودن امتیاز
                    </button>
                    <button class="btn btn--secondary" data-action="redeem">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                        استفاده از امتیاز
                    </button>
                </div>
            </div>
        `;
    },

    _all() {
        return customers.list();
    },

    _filter(all) {
        let filtered = all;
        if (this.state.search) {
            const q = this.state.search.toLowerCase();
            filtered = filtered.filter((c) => (c.name || '').toLowerCase().includes(q) || (c.phone || '').includes(q));
        }
        if (this.state.filter !== 'all') {
            filtered = filtered.filter((c) => {
                const t = this._calcCustomerTotals(c);
                return this._getTier(t.points).name.toLowerCase() === this.state.filter ||
                       (this.state.filter === 'vip' && t.points >= 15000);
            });
        }
        return filtered;
    },

    _calcCustomerTotals(customer) {
        const customerInvoices = invoices.list().filter((i) => i.customerName === customer.name);
        const spent = customerInvoices.reduce((s, i) => s + (i.total || 0), 0);
        const loyaltyHistory = loyalty.list().filter((l) => l.customerId === customer.id);
        const loyaltyPoints = loyaltyHistory.reduce((s, l) => s + (l.points || 0), 0);
        const earnedPoints = Math.floor(spent / 10); // 1 point per $10
        const points = earnedPoints + loyaltyPoints;
        return { spent, points, invoices: customerInvoices.length };
    },

    _calcStats(all) {
        const totals = {};
        let vip = 0, gold = 0, silver = 0, bronze = 0;
        let totalValue = 0;

        all.forEach((c) => {
            const t = this._calcCustomerTotals(c);
            totals[c.id] = t;
            totalValue += t.spent;
            const tier = this._getTier(t.points);
            if (tier.name === 'VIP') vip++;
            else if (tier.name === 'طلا') gold++;
            else if (tier.name === 'نقره') silver++;
            else bronze++;
        });

        return { vip, gold, silver, bronze, totalValue, totals };
    },

    _getTier(points) {
        if (points >= 15000) return this.TIERS.vip;
        if (points >= 5000) return this.TIERS.gold;
        if (points >= 1000) return this.TIERS.silver;
        return this.TIERS.bronze;
    },

    _nextTier(points) {
        if (points < 1000) return `🥈 نقره (${Utils.toPersian(1000 - points)} امتیاز مانده)`;
        if (points < 5000) return `🥇 طلا (${Utils.toPersian(5000 - points)} امتیاز مانده)`;
        if (points < 15000) return `👑 VIP (${Utils.toPersian(15000 - points)} امتیاز مانده)`;
        return 'سطح نهایی رسیده';
    },

    _daysSince(ts) {
        const days = Math.floor((Date.now() - ts) / 86400000);
        if (days === 0) return 'امروز';
        if (days === 1) return 'دیروز';
        if (days < 30) return `${Utils.toPersian(days)} روز`;
        if (days < 365) return `${Utils.toPersian(Math.floor(days/30))} ماه`;
        return `${Utils.toPersian(Math.floor(days/365))} سال`;
    },

    attach() {
        document.getElementById('crmSearch')?.addEventListener('input', Utils.debounce((e) => {
            this.state.search = e.target.value;
            this._refresh();
        }, 200));

        document.querySelectorAll('#crmFilter button').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.filter = btn.dataset.val;
                document.querySelectorAll('#crmFilter button').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                this._refresh();
            });
        });

        document.querySelectorAll('[data-customer]').forEach((el) => {
            el.addEventListener('click', () => {
                this.state.selectedCustomerId = el.dataset.customer;
                this._refresh();
            });
        });

        document.getElementById('backToCustomers')?.addEventListener('click', () => {
            this.state.selectedCustomerId = null;
            this._refresh();
        });

        document.querySelectorAll('[data-action="add-points"]').forEach((btn) => {
            btn.addEventListener('click', () => this._addPoints());
        });
        document.querySelectorAll('[data-action="redeem"]').forEach((btn) => {
            btn.addEventListener('click', () => this._redeem());
        });
    },

    async _addPoints() {
        const pointsStr = await modal.prompt({ title: 'افزودن امتیاز', label: 'تعداد امتیاز', type: 'number', defaultValue: '100' });
        if (!pointsStr) return;
        const points = parseInt(pointsStr);
        if (!Utils.isValidNumber(points, { min: 1, max: 100000, integer: true })) {
            toast.error('امتیاز نامعتبر');
            return;
        }
        const reason = await modal.prompt({ title: 'دلیل', label: 'دلیل (مثال: خرید، معرفی)', defaultValue: 'پاداش' });
        loyalty.save({
            customerId: this.state.selectedCustomerId,
            points,
            reason: reason || 'پاداش',
            type: 'earn',
            timestamp: Date.now()
        });
        toast.success(`${Utils.toPersian(points)} امتیاز اضافه شد`);
        this._refresh();
    },

    async _redeem() {
        const pointsStr = await modal.prompt({ title: 'استفاده از امتیاز', label: 'تعداد امتیاز', type: 'number', defaultValue: '100' });
        if (!pointsStr) return;
        const points = parseInt(pointsStr);
        if (!Utils.isValidNumber(points, { min: 1, max: 100000, integer: true })) {
            toast.error('امتیاز نامعتبر');
            return;
        }
        const totals = this._calcCustomerTotals(customers.get(this.state.selectedCustomerId));
        if (totals.points < points) {
            toast.error('امتیاز کافی نیست');
            return;
        }
        loyalty.save({
            customerId: this.state.selectedCustomerId,
            points: -points,
            reason: 'استفاده',
            type: 'redeem',
            timestamp: Date.now()
        });
        toast.success(`${Utils.toPersian(points)} امتیاز کسر شد`);
        this._refresh();
    },

    _refresh() {
        const view = document.getElementById('view');
        if (view) { view.innerHTML = this.render(); this.attach(); }
    }
};
