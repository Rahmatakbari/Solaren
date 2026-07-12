/**
 * سیستم اعلان‌ها و فعالیت‌ها
 * Notifications & Activity Feed System
 */
import { Utils } from '../utils.js';
import { toast } from '../ui.js';
import { notifications, activities, projects, invoices, customers, tasks, payments } from '../store.js';

export const notifCenter = {
    name: 'notifications',
    path: '#notifications',

    state: {
        filter: 'all', // all, unread, alerts
        lastNotifId: 0
    },

    render() {
        const all = this._all();
        const filtered = this._filter(all);
        const unreadCount = all.filter((n) => !n.read).length;
        const alerts = all.filter((n) => n.type === 'alert' || n.type === 'warning').length;

        return `
            <h1 class="page-title anim-fade-up">مرکز اعلان‌ها</h1>
            <p class="page-subtitle anim-fade-up">اعلان‌ها و فعالیت‌های اخیر</p>

            <div class="stats stagger">
                <div class="stat stat--emerald">
                    <div class="stat__label">کل اعلان‌ها</div>
                    <div class="stat__value">${Utils.toPersian(all.length)}</div>
                </div>
                <div class="stat stat--sun">
                    <div class="stat__label">خوانده نشده</div>
                    <div class="stat__value">${Utils.toPersian(unreadCount)}</div>
                </div>
                <div class="stat" style="border-color:var(--color-red-500);">
                    <div class="stat__label">هشدارها</div>
                    <div class="stat__value" style="color:var(--color-red-400);">${Utils.toPersian(alerts)}</div>
                </div>
                <div class="stat stat--sky">
                    <div class="stat__label">امروز</div>
                    <div class="stat__value">${Utils.toPersian(all.filter((n) => this._isToday(n.timestamp)).length)}</div>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">فیلتر</h2>
                </div>
                <div class="switch-group" id="notifFilter" style="margin-bottom:var(--space-3);">
                    <button class="${this.state.filter === 'all' ? 'is-active' : ''}" data-val="all">همه</button>
                    <button class="${this.state.filter === 'unread' ? 'is-active' : ''}" data-val="unread">خوانده نشده</button>
                    <button class="${this.state.filter === 'alerts' ? 'is-active' : ''}" data-val="alerts">هشدارها</button>
                    <button class="${this.state.filter === 'system' ? 'is-active' : ''}" data-val="system">سیستمی</button>
                </div>
                <div style="display:flex;gap:var(--space-2);">
                    <button class="btn btn--secondary btn--sm" id="markAllRead" style="flex:1;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                        علامت‌گذاری همه به عنوان خوانده شده
                    </button>
                    <button class="btn btn--ghost btn--sm" id="clearAll" style="flex:1;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
                        پاک کردن همه
                    </button>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">📬 اعلان‌ها</h2>
                </div>
                <div class="list" id="notifList">
                    ${filtered.length === 0 ? `
                    <div class="empty">
                        <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
                        <h3 class="empty__title">اعلانی وجود ندارد</h3>
                        <p class="empty__text">همه چیز به‌روز است</p>
                    </div>` : filtered.map((n) => this._renderNotif(n)).join('')}
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">📊 فعالیت‌های اخیر</h2>
                </div>
                <div class="list" id="activityList">
                    ${this._renderActivities()}
                </div>
            </div>
        `;
    },

    _renderNotif(n) {
        const isUnread = !n.read;
        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
            system: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33"/></svg>'
        };
        const colors = {
            success: 'var(--color-emerald-400)',
            warning: 'var(--color-sun-300)',
            alert: 'var(--color-red-400)',
            info: 'var(--color-sky-300)',
            system: 'var(--color-violet-400)'
        };
        return `
            <div class="list-item anim-fade-up" data-notif-id="${n.id}" style="cursor:pointer;${isUnread ? 'background:rgba(245,158,11,0.05);border-right:3px solid var(--color-sun-500);' : ''}">
                <div class="list-item__icon" style="background:${colors[n.type]}22;color:${colors[n.type]};">
                    ${icons[n.type] || icons.info}
                </div>
                <div class="list-item__body">
                    <div class="list-item__title">${Utils.escapeHTML(n.title)}</div>
                    <div class="list-item__subtitle">${Utils.escapeHTML(n.message)}</div>
                    <div class="list-item__subtitle" style="font-size:10px;margin-top:2px;">${this._timeAgo(n.timestamp)}</div>
                </div>
                <div style="display:flex;flex-direction:column;gap:4px;">
                    ${isUnread ? '<div style="width:8px;height:8px;background:var(--color-sun-500);border-radius:50%;box-shadow:0 0 8px var(--color-sun-500);"></div>' : ''}
                    <button class="btn btn--icon btn--sm" data-rm-notif="${n.id}" style="width:28px;height:28px;background:rgba(239,68,68,0.1);color:var(--color-red-400);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
            </div>
        `;
    },

    _renderActivities() {
        const acts = activities.list().sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);
        if (acts.length === 0) {
            return '<div class="empty"><p class="empty__text">هنوز فعالیتی ثبت نشده</p></div>';
        }
        return acts.map((a) => {
            const icons = {
                create: '➕', update: '✏️', delete: '🗑️', view: '👁️', complete: '✅',
                payment: '💰', invoice: '📄', project: '📁', customer: '👤', task: '📋'
            };
            return `
                <div class="list-item" style="cursor:default;">
                    <div class="list-item__icon" style="background:var(--color-bg-soft);font-size:18px;">
                        ${icons[a.action] || '•'}
                    </div>
                    <div class="list-item__body">
                        <div class="list-item__title" style="font-size:var(--font-size-sm);">${Utils.escapeHTML(a.title)}</div>
                        <div class="list-item__subtitle" style="font-size:11px;">${this._timeAgo(a.timestamp)}</div>
                    </div>
                </div>
            `;
        }).join('');
    },

    _all() {
        return notifications.list().sort((a, b) => b.timestamp - a.timestamp);
    },

    _filter(all) {
        if (this.state.filter === 'all') return all;
        if (this.state.filter === 'unread') return all.filter((n) => !n.read);
        if (this.state.filter === 'alerts') return all.filter((n) => n.type === 'alert' || n.type === 'warning');
        if (this.state.filter === 'system') return all.filter((n) => n.type === 'system' || n.type === 'info');
        return all;
    },

    _isToday(ts) {
        const d = new Date(ts);
        const today = new Date();
        return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    },

    _timeAgo(ts) {
        const diff = Date.now() - ts;
        const min = Math.floor(diff / 60000);
        const hr = Math.floor(diff / 3600000);
        const day = Math.floor(diff / 86400000);
        if (min < 1) return 'هم اکنون';
        if (min < 60) return `${Utils.toPersian(min)} دقیقه پیش`;
        if (hr < 24) return `${Utils.toPersian(hr)} ساعت پیش`;
        if (day < 30) return `${Utils.toPersian(day)} روز پیش`;
        return Utils.formatDate(new Date(ts));
    },

    attach() {
        document.querySelectorAll('#notifFilter button').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.filter = btn.dataset.val;
                document.querySelectorAll('#notifFilter button').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                this._refresh();
            });
        });

        document.getElementById('markAllRead')?.addEventListener('click', () => {
            notifications.list().forEach((n) => { n.read = true; notifications.save(n); });
            toast.success('همه به عنوان خوانده شده علامت خورد');
            this._refresh();
        });

        document.getElementById('clearAll')?.addEventListener('click', () => {
            if (confirm('همه اعلان‌ها حذف شوند؟')) {
                notifications.clear();
                toast.success('پاک شد');
                this._refresh();
            }
        });

        document.querySelectorAll('[data-notif-id]').forEach((el) => {
            el.addEventListener('click', (e) => {
                if (e.target.closest('[data-rm-notif]')) return;
                const n = notifications.get(el.dataset.notifId);
                if (n && !n.read) {
                    n.read = true;
                    notifications.save(n);
                    if (n.link) location.hash = n.link;
                    this._refresh();
                }
            });
        });

        document.querySelectorAll('[data-rm-notif]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                notifications.remove(btn.dataset.rmNotif);
                this._refresh();
            });
        });
    },

    _refresh() {
        const view = document.getElementById('view');
        if (view) { view.innerHTML = this.render(); this.attach(); }
    }
};

/**
 * سیستم ثبت اعلان و فعالیت
 */
export const NotifSystem = {
    /**
     * افزودن اعلان جدید
     */
    add(type, title, message, link = null) {
        const notif = {
            id: 'notif-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
            type, // success, warning, alert, info, system
            title,
            message,
            link,
            read: false,
            timestamp: Date.now()
        };
        notifications.save(notif);
        // Show toast for important ones
        if (type === 'alert' || type === 'warning') {
            toast[type === 'alert' ? 'error' : 'warning'](title);
        } else if (type === 'success') {
            toast.success(title);
        }
        return notif;
    },

    /**
     * ثبت فعالیت
     */
    log(action, title, details = {}) {
        activities.save({
            id: 'act-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
            action,
            title,
            details,
            timestamp: Date.now()
        });
    },

    /**
     * بررسی خودکار سیستم - اجرا در بازه‌های زمانی
     */
    runChecks() {
        const now = Date.now();
        const oneDayAgo = now - 86400000;
        const sevenDaysAgo = now - 7 * 86400000;

        // بررسی وظایف عقب افتاده
        const overdueTasks = tasks.list().filter((t) => t.status !== 'completed' && new Date(t.dueDate) < new Date());
        overdueTasks.forEach((t) => {
            const existing = notifications.list().find((n) => n.details?.taskId === t.id);
            if (!existing) {
                this.add('warning', 'وظیفه عقب افتاده', `"${t.title}" از تاریخ ${t.dueDate} عقب افتاده`, '#calendar');
            }
        });

        // بررسی پرداخت‌های عقب افتاده
        const overduePayments = payments.list().filter((p) => p.status === 'pending' && new Date(p.dueDate) < new Date());
        overduePayments.forEach((p) => {
            const existing = notifications.list().find((n) => n.details?.paymentId === p.id);
            if (!existing) {
                this.add('alert', 'پرداخت عقب افتاده', `پرداخت ${p.amount} $ از ${p.dueDate} عقب افتاده`, '#payments');
            }
        });

        // بررسی پروژه‌های بدون انوایس
        const projectsWithoutInvoices = projects.list().filter((p) => !p.invoice);
        if (projectsWithoutInvoices.length > 0) {
            this.add('info', `${projectsWithoutInvoices.length} پروژه بدون انوایس`, 'برای این پروژه‌ها انوایس صادر کنید', '#projects');
        }

        // پاکسازی اعلان‌های قدیمی (بیش از ۳۰ روز)
        const thirtyDaysAgo = now - 30 * 86400000;
        notifications.list().filter((n) => n.timestamp < thirtyDaysAgo && n.read).forEach((n) => {
            notifications.remove(n.id);
        });
    }
};
