/**
 * Maintenance Schedule Generator v1
 * Creates a yearly maintenance plan for solar systems
 */
import { Utils } from '../utils.js';
import { projects } from '../store.js';

const MAINTENANCE_TASKS = {
    monthly: [
        { task: 'بازرسی چشمی پنل‌ها', priority: 'medium', duration: 15, desc: 'بررسی آلودگی، شکستگی و اتصالات' },
        { task: 'بررسی اینورتر', priority: 'high', duration: 10, desc: 'کنترل نمایشگر و خطاها' },
        { task: 'پایش عملکرد تولید', priority: 'medium', duration: 5, desc: 'مقایسه تولید با مقدار مورد انتظار' }
    ],
    quarterly: [
        { task: 'تمیز کردن پنل‌ها', priority: 'high', duration: 60, desc: 'شستشو با آب و پارچه نرم' },
        { task: 'بازرسی سازه نگهدارنده', priority: 'medium', duration: 20, desc: 'بررسی زنگ‌زدگی و استحکام' },
        { task: 'بررسی اتصالات و کابل‌ها', priority: 'high', duration: 30, desc: 'کنترل MC4 و اتصالات DC' }
    ],
    'semi-annual': [
        { task: 'تست سیستم ارت', priority: 'high', duration: 45, desc: 'اندازه‌گیری مقاومت زمین' },
        { task: 'بررسی باتری‌ها', priority: 'high', duration: 30, desc: 'کنترل ولتاژ و دمای باتری' },
        { task: 'بازدید دوربینی با پهپاد', priority: 'low', duration: 60, desc: 'بررسی حرارتی پنل‌ها' }
    ],
    yearly: [
        { task: 'سرویس کامل اینورتر', priority: 'high', duration: 120, desc: 'تمیزکاری فن و بررسی خازن‌ها' },
        { task: 'تست عایق کابل‌ها', priority: 'high', duration: 60, desc: 'مگر با مگا اهم‌متر' },
        { task: 'بازدید جامع سیستم', priority: 'high', duration: 180, desc: 'گزارش کامل عملکرد سالانه' },
        { task: 'بروزرسانی firmware', priority: 'medium', duration: 20, desc: 'بروزرسانی اینورتر و کنترلر' },
        { task: 'تست عملکرد باتری‌ها', priority: 'high', duration: 90, desc: 'ظرفیت‌سنجی و تست چرخه' }
    ]
};

export const maintenance = {
    name: 'maintenance',
    path: '#maintenance',

    render() {
        const list = projects.list();
        return `
            <h1 class="page-title anim-fade-up">برنامه نگهداری</h1>
            <p class="page-subtitle anim-fade-up">برنامه سالانه نگهداری و سرویس سیستم سولر</p>

            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="card__header">
                    <div class="card__icon card__icon--sky">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                    <div>
                        <div class="card__title">انتخاب پروژه</div>
                        <div class="card__subtitle">${Utils.toPersian(list.length)} پروژه موجود</div>
                    </div>
                </div>
                ${list.length === 0 ? `
                    <div class="empty">
                        <p class="empty__text">ابتدا یک پروژه ایجاد کنید</p>
                        <a class="btn btn--primary" data-route="quick-estimate" style="cursor:pointer;display:inline-flex;margin-top:var(--space-3);">ساخت پروژه</a>
                    </div>
                ` : `
                    <div class="list">
                        ${list.slice(0, 8).map((p) => `
                            <div class="list-item" data-pick-project="${p.id}">
                                <div class="list-item__icon" style="background:rgba(14,165,233,0.15);color:var(--color-sky-300);">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                </div>
                                <div class="list-item__body">
                                    <div class="list-item__title">${Utils.escapeHTML(p.name)}</div>
                                    <div class="list-item__subtitle">${Utils.formatNumber(p.actualPvKw || p.requiredPvKw || 0, 1)} kW · ${p.systemType === 'on-grid' ? 'آنگرید' : p.systemType === 'off-grid' ? 'آفگرید' : 'هیبرید'}</div>
                                </div>
                                <div class="list-item__action">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="9 18 15 12 9 6"/></svg>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>

            <div id="maintenanceSchedule"></div>
        `;
    },

    attach() {
        document.querySelectorAll('[data-pick-project]').forEach((el) => {
            el.addEventListener('click', () => this._render(el.dataset.pickProject));
        });
    },

    _render(projectId) {
        const p = projects.get(projectId);
        if (!p) return;
        const el = document.getElementById('maintenanceSchedule');
        if (!el) return;

        // Generate 12-month schedule
        const months = ['حمل','ثور','جوزا','سرطان','اسد','سنبله','میزان','عقرب','قوس','جدی','دلو','حوت'];
        const monthNames = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
        const now = new Date();
        const yearStart = new Date(now.getFullYear(), 0, 1);

        const monthlyTasks = [];
        for (let m = 0; m < 12; m++) {
            const tasks = [];
            // Monthly tasks (every month)
            MAINTENANCE_TASKS.monthly.forEach((t) => tasks.push({ ...t, type: 'monthly' }));
            // Quarterly (every 3 months: 0, 3, 6, 9)
            if (m % 3 === 0) {
                MAINTENANCE_TASKS.quarterly.forEach((t) => tasks.push({ ...t, type: 'quarterly' }));
            }
            // Semi-annual (every 6 months: 0, 6)
            if (m % 6 === 0) {
                MAINTENANCE_TASKS['semi-annual'].forEach((t) => tasks.push({ ...t, type: 'semi-annual' }));
            }
            // Yearly (only first month)
            if (m === 0) {
                MAINTENANCE_TASKS.yearly.forEach((t) => tasks.push({ ...t, type: 'yearly' }));
            }
            monthlyTasks.push({
                month: months[m],
                monthName: monthNames[m],
                tasks,
                totalDuration: tasks.reduce((s, t) => s + t.duration, 0)
            });
        }

        const totalDuration = monthlyTasks.reduce((s, m) => s + m.totalDuration, 0);
        const totalYearlyTasks = monthlyTasks.reduce((s, m) => s + m.tasks.length, 0);
        const criticalCount = monthlyTasks.reduce((s, m) => s + m.tasks.filter((t) => t.priority === 'high').length, 0);

        el.innerHTML = `
            <div class="card card--sun anim-fade-up" style="padding:var(--space-5);margin-bottom:var(--space-4);">
                <div style="position:relative;z-index:1;color:var(--color-text-inverse);">
                    <h2 style="color:white;font-size:var(--font-size-xl);font-weight:800;margin-bottom:var(--space-3);">📅 برنامه سالانه ${Utils.escapeHTML(p.name)}</h2>
                    <div class="stats" style="grid-template-columns:repeat(3,1fr);">
                        <div style="padding:var(--space-3);background:rgba(0,0,0,0.15);border-radius:var(--radius-md);text-align:center;">
                            <div style="opacity:0.7;font-size:var(--font-size-xs);text-transform:uppercase;">کل وظایف</div>
                            <div style="font-weight:800;font-size:var(--font-size-2xl);">${Utils.toPersian(totalYearlyTasks)}</div>
                        </div>
                        <div style="padding:var(--space-3);background:rgba(0,0,0,0.15);border-radius:var(--radius-md);text-align:center;">
                            <div style="opacity:0.7;font-size:var(--font-size-xs);text-transform:uppercase;">زمان کل (دقیقه)</div>
                            <div style="font-weight:800;font-size:var(--font-size-2xl);">${Utils.toPersian(totalDuration)}</div>
                        </div>
                        <div style="padding:var(--space-3);background:rgba(0,0,0,0.15);border-radius:var(--radius-md);text-align:center;">
                            <div style="opacity:0.7;font-size:var(--font-size-xs);text-transform:uppercase;">اولویت بالا</div>
                            <div style="font-weight:800;font-size:var(--font-size-2xl);">${Utils.toPersian(criticalCount)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section__title anim-fade-up" style="margin-bottom:var(--space-3);">برنامه ماهانه</h2>
                <div class="list stagger">
                    ${monthlyTasks.map((m, idx) => `
                        <div class="card card--glass" style="padding:var(--space-4);">
                            <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);margin-bottom:var(--space-3);padding-bottom:var(--space-3);border-bottom:1px solid var(--color-border);">
                                <div style="display:flex;align-items:center;gap:var(--space-3);">
                                    <div style="width:44px;height:44px;border-radius:var(--radius-md);background:var(--gradient-sun);color:var(--color-text-inverse);display:flex;align-items:center;justify-content:center;font-weight:800;">${Utils.toPersian(idx + 1)}</div>
                                    <div>
                                        <h3 style="font-weight:700;font-size:var(--font-size-md);">${m.monthName}</h3>
                                        <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);">${Utils.toPersian(m.tasks.length)} وظیفه · ${Utils.toPersian(m.totalDuration)} دقیقه</p>
                                    </div>
                                </div>
                            </div>
                            <div class="list" style="gap:var(--space-2);">
                                ${m.tasks.map((t) => `
                                    <div class="list-item" style="cursor:default;padding:var(--space-3);">
                                        <div class="list-item__icon" style="background:${this._priorityColor(t.priority)};width:36px;height:36px;">
                                            ${this._typeIcon(t.type)}
                                        </div>
                                        <div class="list-item__body">
                                            <div class="list-item__title" style="font-size:var(--font-size-sm);">${Utils.escapeHTML(t.task)}</div>
                                            <div class="list-item__subtitle" style="font-size:var(--font-size-xs);">${Utils.escapeHTML(t.desc)}</div>
                                        </div>
                                        <div style="text-align:left;flex-shrink:0;">
                                            <span class="chip" style="background:${this._priorityColor(t.priority)};font-size:10px;">${t.priority === 'high' ? 'بالا' : t.priority === 'medium' ? 'متوسط' : 'پایین'}</span>
                                            <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);margin-top:2px;">${t.duration} دقیقه</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">💡 نکات مهم نگهداری</h2>
                </div>
                <ul style="padding-right:var(--space-5);line-height:2;color:var(--color-text-muted);font-size:var(--font-size-sm);">
                    <li>🧹 <strong style="color:var(--color-text);">تمیز کردن منظم</strong> — گرد و غبار می‌تواند تا ۳۰٪ تولید را کاهش دهد</li>
                    <li>🌡️ <strong style="color:var(--color-text);">بررسی حرارتی</strong> — نقاط داغ نشان‌دهنده اتصالات ضعیف هستند</li>
                    <li>📊 <strong style="color:var(--color-text);">مانیتورینگ</strong> — هرگونه کاهش ناگهانی تولید را بررسی کنید</li>
                    <li>🔌 <strong style="color:var(--color-text);">بررسی اینورتر</strong> — کدهای خطا و صداهای غیرعادی را جدی بگیرید</li>
                    <li>🔋 <strong style="color:var(--color-text);">نگهداری باتری</strong> — دما و ولتاژ را مرتب چک کنید</li>
                    <li>📝 <strong style="color:var(--color-text);">مستندسازی</strong> — همه عملیات نگهداری را ثبت کنید</li>
                </ul>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);margin-top:var(--space-4);">
                <button class="btn btn--secondary" id="printSchedule">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    چاپ برنامه
                </button>
                <button class="btn btn--primary" id="newSchedule">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                    انتخاب پروژه دیگر
                </button>
            </div>
        `;

        document.getElementById('printSchedule')?.addEventListener('click', () => window.print());
        document.getElementById('newSchedule')?.addEventListener('click', () => { el.innerHTML = ''; });
    },

    _priorityColor(p) {
        if (p === 'high') return 'rgba(239, 68, 68, 0.15)';
        if (p === 'medium') return 'rgba(245, 158, 11, 0.15)';
        return 'rgba(16, 185, 129, 0.15)';
    },

    _typeIcon(type) {
        if (type === 'monthly') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
        if (type === 'quarterly') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>';
        if (type === 'semi-annual') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
        if (type === 'yearly') return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
        return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="3"/></svg>';
    }
};
