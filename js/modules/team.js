/**
 * مدیریت تیم و نصاب‌ها
 * Team & Installer Management
 */
import { Utils } from '../utils.js';
import { toast, modal } from '../ui.js';
import { team, projects, invoices } from '../store.js';

export const teamView = {
    name: 'team',
    path: '#team',

    state: {
        selectedMemberId: null
    },

    render() {
        const members = team.list();
        const selected = this.state.selectedMemberId ? team.get(this.state.selectedMemberId) : null;

        return `
            <h1 class="page-title anim-fade-up">مدیریت تیم</h1>
            <p class="page-subtitle anim-fade-up">نصاب‌ها، تکنسین‌ها و مدیران پروژه</p>

            ${!selected ? `
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--violet">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                    <div>
                        <div class="card__title">${Utils.toPersian(members.length)} عضو تیم</div>
                        <div class="card__subtitle">نصاب‌ها، تکنسین‌ها و مدیران</div>
                    </div>
                    <button class="btn btn--primary btn--sm" id="addMemberBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        افزودن
                    </button>
                </div>
                ${members.length === 0 ? `
                <div class="empty">
                    <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div>
                    <h3 class="empty__title">هنوز عضوی اضافه نشده</h3>
                    <p class="empty__text">اولین عضو تیم را اضافه کنید</p>
                </div>` : `
                <div class="list stagger">
                    ${members.map((m) => {
                        const myProjects = projects.list().filter((p) => p.assignedTo === m.id);
                        const myInvoices = invoices.list().filter((i) => i.assignedTo === m.id);
                        const totalRevenue = myInvoices.reduce((s, i) => s + (i.total || 0), 0);
                        return `
                        <div class="card card--glass card--hover" data-view-member="${m.id}" style="cursor:pointer;">
                            <div style="display:flex;align-items:center;gap:var(--space-3);">
                                <div class="card__icon" style="background:linear-gradient(135deg, #8b5cf6, #ec4899);color:white;width:56px;height:56px;font-weight:800;font-size:var(--font-size-xl);">
                                    ${Utils.escapeHTML((m.name || '?').charAt(0))}
                                </div>
                                <div style="flex:1;min-width:0;">
                                    <h3 style="font-weight:700;font-size:var(--font-size-md);">${Utils.escapeHTML(m.name)}</h3>
                                    <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);">${Utils.escapeHTML(m.role || 'نصاب')} · ${Utils.escapeHTML(m.phone || 'بدون شماره')}</p>
                                </div>
                                <div style="text-align:left;flex-shrink:0;">
                                    <span class="chip ${m.status === 'active' ? 'chip--emerald' : 'chip--ghost'}">${m.status === 'active' ? 'فعال' : 'غیرفعال'}</span>
                                </div>
                            </div>
                            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2);margin-top:var(--space-3);">
                                <div style="text-align:center;padding:var(--space-2);background:var(--color-bg-soft);border-radius:var(--radius-sm);">
                                    <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">پروژه</div>
                                    <div style="font-weight:800;color:var(--color-sun-300);">${Utils.toPersian(myProjects.length)}</div>
                                </div>
                                <div style="text-align:center;padding:var(--space-2);background:var(--color-bg-soft);border-radius:var(--radius-sm);">
                                    <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">انوایس</div>
                                    <div style="font-weight:800;color:var(--color-violet-400);">${Utils.toPersian(myInvoices.length)}</div>
                                </div>
                                <div style="text-align:center;padding:var(--space-2);background:var(--color-bg-soft);border-radius:var(--radius-sm);">
                                    <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">فروش</div>
                                    <div style="font-weight:800;color:var(--color-emerald-400);font-size:var(--font-size-sm);">${Utils.formatNumber(Math.round(totalRevenue / 1000))}K</div>
                                </div>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>`}
            </div>` : this._renderMemberDetail(selected)}
        `;
    },

    _renderMemberDetail(member) {
        const myProjects = projects.list().filter((p) => p.assignedTo === member.id);
        const myInvoices = invoices.list().filter((i) => i.assignedTo === member.id);
        const totalRevenue = myInvoices.reduce((s, i) => s + (i.total || 0), 0);
        const totalCapacity = myProjects.reduce((s, p) => s + (p.actualPvKw || p.requiredPvKw || 0), 0);

        return `
            <div class="card card--violet anim-fade-up" style="padding:var(--space-5);color:white;">
                <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3);">
                    <button class="btn btn--icon" id="backToTeam" style="background:rgba(255,255,255,0.2);color:white;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div style="width:64px;height:64px;border-radius:var(--radius-full);background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:var(--font-size-2xl);">${Utils.escapeHTML((member.name || '?').charAt(0))}</div>
                    <div style="flex:1;">
                        <h2 style="font-size:var(--font-size-xl);font-weight:800;color:white;">${Utils.escapeHTML(member.name)}</h2>
                        <p style="opacity:0.85;font-size:var(--font-size-sm);">${Utils.escapeHTML(member.role || 'نصاب')} · ${Utils.escapeHTML(member.phone || '')}</p>
                    </div>
                </div>
            </div>

            <div class="stats stagger" style="margin-top:var(--space-4);">
                <div class="stat stat--violet">
                    <div class="stat__label">پروژه‌ها</div>
                    <div class="stat__value">${Utils.toPersian(myProjects.length)}</div>
                </div>
                <div class="stat stat--sun">
                    <div class="stat__label">ظرفیت نصب شده</div>
                    <div class="stat__value">${Utils.formatNumber(totalCapacity, 1)}<span class="stat__unit">kW</span></div>
                </div>
                <div class="stat stat--emerald">
                    <div class="stat__label">فروش کل</div>
                    <div class="stat__value">${Utils.formatNumber(Math.round(totalRevenue / 1000))}<span class="stat__unit">هزار $</span></div>
                </div>
                <div class="stat stat--sky">
                    <div class="stat__label">انوایس صادر شده</div>
                    <div class="stat__value">${Utils.toPersian(myInvoices.length)}</div>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">📂 پروژه‌های ${Utils.escapeHTML(member.name.split(' ')[0])}</h2>
                </div>
                ${myProjects.length === 0 ? `
                <div class="empty"><p class="empty__text">هنوز پروژه‌ای تخصیص داده نشده</p></div>
                ` : `
                <div class="list">
                    ${myProjects.slice(0, 10).map((p) => `
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__icon" style="background:rgba(245,158,11,0.15);color:var(--color-sun-300);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                        </div>
                        <div class="list-item__body">
                            <div class="list-item__title">${Utils.escapeHTML(p.name)}</div>
                            <div class="list-item__subtitle">${Utils.formatNumber(p.actualPvKw || p.requiredPvKw || 0, 1)} kW · ${Utils.formatDate(p.updatedAt)}</div>
                        </div>
                        <div style="text-align:left;">
                            <span class="chip chip--${p.systemType === 'off-grid' ? 'danger' : p.systemType === 'hybrid' ? 'emerald' : 'sun'}">${p.systemType === 'on-grid' ? 'آنگرید' : p.systemType === 'off-grid' ? 'آفگرید' : 'هیبرید'}</span>
                        </div>
                    </div>
                    `).join('')}
                </div>`}
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">📋 انوایس‌ها</h2>
                </div>
                ${myInvoices.length === 0 ? `
                <div class="empty"><p class="empty__text">هنوز انوایسی صادر نشده</p></div>
                ` : `
                <div class="list">
                    ${myInvoices.slice(0, 10).map((inv) => `
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__icon" style="background:rgba(139,92,246,0.15);color:var(--color-violet-400);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
                        </div>
                        <div class="list-item__body">
                            <div class="list-item__title">${Utils.escapeHTML(inv.number)}</div>
                            <div class="list-item__subtitle">${Utils.escapeHTML(inv.customerName || '—')}</div>
                        </div>
                        <div style="text-align:left;">
                            <div style="font-weight:800;color:var(--color-emerald-400);">${Utils.formatNumber(Math.round(inv.total))} $</div>
                            <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">${Utils.formatDate(inv.createdAt)}</div>
                        </div>
                    </div>
                    `).join('')}
                </div>`}
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);margin-top:var(--space-4);">
                <button class="btn btn--secondary" id="editMemberBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    ویرایش
                </button>
                <button class="btn btn--danger" id="deleteMemberBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
                    حذف
                </button>
            </div>
        `;
    },

    attach() {
        document.getElementById('addMemberBtn')?.addEventListener('click', () => this._add());
        document.querySelectorAll('[data-view-member]').forEach((el) => {
            el.addEventListener('click', () => {
                this.state.selectedMemberId = el.dataset.viewMember;
                this._refresh();
            });
        });
        document.getElementById('backToTeam')?.addEventListener('click', () => {
            this.state.selectedMemberId = null;
            this._refresh();
        });
        document.getElementById('editMemberBtn')?.addEventListener('click', () => this._edit());
        document.getElementById('deleteMemberBtn')?.addEventListener('click', () => this._delete());
    },

    async _add() {
        const name = await modal.prompt({ title: 'عضو جدید', label: 'نام و نام خانوادگی *', placeholder: 'نام کامل' });
        if (!name) return;
        const role = await modal.prompt({ title: 'نقش', label: 'نقش (نصاب/تکنسین/مدیر)', defaultValue: 'نصاب' });
        if (!role) return;
        const phone = await modal.prompt({ title: 'شماره تماس', label: 'تلفن', type: 'tel' });
        if (!phone) return;
        const email = await modal.prompt({ title: 'ایمیل', label: 'ایمیل (اختیاری)', type: 'email', defaultValue: '' });
        const salary = await modal.prompt({ title: 'حقوق ماهانه', label: 'حقوق ماهانه (اختیاری)', type: 'number', defaultValue: '0' });
        team.save({
            name: name.trim(),
            role: role.trim(),
            phone: phone.trim(),
            email: email || '',
            salary: parseFloat(salary) || 0,
            status: 'active',
            joinedAt: Date.now()
        });
        toast.success('عضو جدید اضافه شد');
        this._refresh();
    },

    async _edit() {
        const m = team.get(this.state.selectedMemberId);
        if (!m) return;
        const name = await modal.prompt({ title: 'ویرایش', label: 'نام', defaultValue: m.name });
        if (name) m.name = name.trim();
        const role = await modal.prompt({ title: 'نقش', label: 'نقش', defaultValue: m.role || '' });
        if (role) m.role = role.trim();
        const phone = await modal.prompt({ title: 'تلفن', label: 'تلفن', defaultValue: m.phone || '' });
        if (phone) m.phone = phone.trim();
        team.save(m);
        toast.success('بروزرسانی شد');
        this._refresh();
    },

    async _delete() {
        const ok = await modal.confirm({
            title: 'حذف عضو',
            message: 'آیا از حذف این عضو مطمئن هستید؟',
            danger: true,
            confirmText: 'حذف'
        });
        if (ok) {
            team.remove(this.state.selectedMemberId);
            this.state.selectedMemberId = null;
            toast.success('حذف شد');
            this._refresh();
        }
    },

    _refresh() {
        const view = document.getElementById('view');
        if (view) { view.innerHTML = this.render(); this.attach(); }
    }
};
