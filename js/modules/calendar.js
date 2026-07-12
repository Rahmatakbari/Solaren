/**
 * تقویم شمسی تعاملی پیشرفته
 * Advanced Interactive Persian Calendar
 */
import { Utils } from '../utils.js';
import { toast, modal } from '../ui.js';
import { tasks, projects } from '../store.js';
import { addJalaliDays, dateToJalali, formatJalaliDate, getDayName, getJalaliDayOfWeek, getJalaliMonthDays, getPersianDays, getPersianDaysShort, getPersianMonths, isJalaliHoliday, isJalaliLeap, jalaliToDate, toPersianNum, todayJalali } from '../data/persian-calendar.js';

export const calendar = {
    name: 'calendar',
    path: '#calendar',

    state: {
        view: 'month', // 'month' | 'list' | 'agenda'
        filter: 'all'  // 'all' | 'task' | 'install' | 'maintenance' | 'payment'
    },

    render() {
        const today = todayJalali();
        const allEvents = this._getAllEvents();
        const monthEvents = this._getEventsForMonth(today[0], today[1]);
        const upcoming = this._getUpcoming(allEvents, 7);

        return `
            <h1 class="page-title anim-fade-up">📅 تقویم شمسی</h1>
            <p class="page-subtitle anim-fade-up">${formatJalaliDate(today[0], today[1], today[2], 'long')} - ${getDayName(today[0], today[1], today[2])}</p>

            <!-- خلاصه سریع -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2);margin-bottom:var(--space-4);">
                <div class="card anim-scale-in" style="background:linear-gradient(135deg, #0ea5e9, #0284c7);color:white;padding:var(--space-3);text-align:center;">
                    <div style="font-size:var(--font-size-2xl);font-weight:800;line-height:1;">${toPersianNum(monthEvents.length)}</div>
                    <div style="font-size:10px;opacity:0.85;">رویداد این ماه</div>
                </div>
                <div class="card anim-scale-in" style="background:linear-gradient(135deg, #f59e0b, #d97706);color:white;padding:var(--space-3);text-align:center;">
                    <div style="font-size:var(--font-size-2xl);font-weight:800;line-height:1;">${toPersianNum(upcoming.length)}</div>
                    <div style="font-size:10px;opacity:0.85;">۷ روز آینده</div>
                </div>
                <div class="card anim-scale-in" style="background:linear-gradient(135deg, #10b981, #059669);color:white;padding:var(--space-3);text-align:center;">
                    <div style="font-size:var(--font-size-2xl);font-weight:800;line-height:1;">${toPersianNum(allEvents.length)}</div>
                    <div style="font-size:10px;opacity:0.85;">کل رویدادها</div>
                </div>
            </div>

            <!-- نوار ابزار -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-3);padding:var(--space-3);">
                <div style="display:flex;gap:var(--space-2);align-items:center;flex-wrap:wrap;">
                    <div class="switch-group" id="viewSwitch" style="flex:1;min-width:0;">
                        <button class="${this.state.view === 'month' ? 'is-active' : ''}" data-view="month">ماهانه</button>
                        <button class="${this.state.view === 'list' ? 'is-active' : ''}" data-view="list">فهرست</button>
                        <button class="${this.state.view === 'agenda' ? 'is-active' : ''}" data-view="agenda">آینده</button>
                    </div>
                    <button class="btn btn--primary btn--sm" id="addEventBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        رویداد
                    </button>
                </div>
            </div>

            <!-- فیلتر نوع -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-3);padding:var(--space-2);">
                <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    <button class="chip ${this.state.filter === 'all' ? 'is-active' : ''}" data-filter="all" style="cursor:pointer;">📋 همه</button>
                    <button class="chip ${this.state.filter === 'install' ? 'is-active' : ''}" data-filter="install" style="cursor:pointer;">🔧 نصب</button>
                    <button class="chip ${this.state.filter === 'maintenance' ? 'is-active' : ''}" data-filter="maintenance" style="cursor:pointer;">🛠 نگهداری</button>
                    <button class="chip ${this.state.filter === 'payment' ? 'is-active' : ''}" data-filter="payment" style="cursor:pointer;">💰 پرداخت</button>
                    <button class="chip ${this.state.filter === 'meeting' ? 'is-active' : ''}" data-filter="meeting" style="cursor:pointer;">👥 جلسه</button>
                    <button class="chip ${this.state.filter === 'inspection' ? 'is-active' : ''}" data-filter="inspection" style="cursor:pointer;">🔍 بازدید</button>
                </div>
            </div>

            <div id="calendarView">
                ${this._renderView(today, allEvents)}
            </div>

            <!-- رویدادهای پیش‌رو -->
            ${upcoming.length > 0 ? `
                <h2 class="section__title anim-fade-up" style="margin-top:var(--space-4);">⏰ ۷ روز آینده</h2>
                <div style="display:flex;flex-direction:column;gap:var(--space-2);">
                    ${upcoming.map(e => this._renderEventCard(e, false)).join('')}
                </div>
            ` : ''}
        `;
    },

    _renderView(today, allEvents) {
        if (this.state.view === 'list') return this._renderListView(allEvents);
        if (this.state.view === 'agenda') return this._renderAgendaView(allEvents);
        return this._renderMonthView(today[0], today[1], allEvents);
    },

    _renderMonthView(year, month, allEvents) {
        const monthName = getPersianMonths()[month - 1];
        const monthDays = getJalaliMonthDays(year, month);
        const firstDayOfWeek = getJalaliDayOfWeek(year, month, 1);
        const today = todayJalali();
        const days = getPersianDaysShort();

        // روزهای خالی ابتدای ماه
        let cells = '';
        for (let i = 0; i < firstDayOfWeek; i++) {
            cells += '<div class="cal-cell cal-cell--empty"></div>';
        }

        for (let d = 1; d <= monthDays; d++) {
            const isToday = today[0] === year && today[1] === month && today[2] === d;
            const holiday = isJalaliHoliday(year, month, d);
            const dayEvents = allEvents.filter(e =>
                e.jy === year && e.jm === month && e.jd === d &&
                (this.state.filter === 'all' || e.type === this.state.filter)
            );

            cells += `
                <div class="cal-cell ${isToday ? 'cal-cell--today' : ''} ${holiday ? 'cal-cell--holiday' : ''}" data-day="${d}">
                    <div class="cal-cell__day">${toPersianNum(d)}</div>
                    ${holiday ? `<div class="cal-cell__holiday">${holiday}</div>` : ''}
                    ${dayEvents.slice(0, 3).map(e => `
                        <div class="cal-event cal-event--${e.type}" data-event-id="${e.id}" title="${Utils.escapeHTML(e.title)}">
                            <span class="cal-event__dot"></span>
                            <span class="cal-event__title">${Utils.escapeHTML(e.title.substring(0, 12))}</span>
                        </div>
                    `).join('')}
                    ${dayEvents.length > 3 ? `<div class="cal-cell__more">+${toPersianNum(dayEvents.length - 3)}</div>` : ''}
                </div>
            `;
        }

        return `
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3);">
                    <button class="btn btn--icon" id="prevMonth">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                    </button>
                    <div style="text-align:center;">
                        <h2 style="font-size:var(--font-size-lg);font-weight:800;">${monthName} ${toPersianNum(year)}</h2>
                        <p style="color:var(--color-text-muted);font-size:var(--font-size-xs);">${toPersianNum(monthDays)} روز</p>
                    </div>
                    <button class="btn btn--icon" id="nextMonth">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                </div>

                <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px;background:var(--color-border);border-radius:var(--radius-md);overflow:hidden;">
                    ${days.map(d => `<div class="cal-header">${d}</div>`).join('')}
                    ${cells}
                </div>
            </div>
        `;
    },

    _renderListView(allEvents) {
        const events = this._filteredEvents(allEvents);
        // گروه‌بندی بر اساس ماه
        const grouped = {};
        events.forEach(e => {
            const key = `${e.jy}-${String(e.jm).padStart(2, '0')}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(e);
        });
        const keys = Object.keys(grouped).sort();

        if (keys.length === 0) {
            return '<div class="empty"><h3 class="empty__title">رویدادی نیست</h3><p class="empty__text">برای افزودن رویداد جدید کلیک کنید</p></div>';
        }

        return keys.map(k => {
            const [y, m] = k.split('-').map(Number);
            return `
                <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-3);">
                    <h3 style="margin-bottom:var(--space-3);font-size:var(--font-size-md);">${getPersianMonths()[m - 1]} ${toPersianNum(y)}</h3>
                    <div style="display:flex;flex-direction:column;gap:var(--space-2);">
                        ${grouped[k].sort((a, b) => a.jd - b.jd).map(e => this._renderEventCard(e, true)).join('')}
                    </div>
                </div>
            `;
        }).join('');
    },

    _renderAgendaView(allEvents) {
        const today = todayJalali();
        const events = this._filteredEvents(allEvents)
            .filter(e => e.jy > today[0] || (e.jy === today[0] && (e.jm > today[1] || (e.jm === today[1] && e.jd >= today[2]))))
            .sort((a, b) => (a.jy - b.jy) || (a.jm - b.jm) || (a.jd - b.jd));

        if (events.length === 0) {
            return '<div class="empty"><h3 class="empty__title">رویداد آینده‌ای نیست</h3><p class="empty__text">رویداد جدید اضافه کنید</p></div>';
        }

        return `
            <div class="card card--glass anim-fade-up">
                <div style="display:flex;flex-direction:column;gap:var(--space-2);">
                    ${events.slice(0, 20).map(e => this._renderEventCard(e, true)).join('')}
                </div>
            </div>
        `;
    },

    _renderEventCard(event, showDate) {
        const typeIcons = {
            install: '🔧', maintenance: '🛠', payment: '💰',
            meeting: '👥', inspection: '🔍', task: '📌', other: '📅'
        };
        const typeLabels = {
            install: 'نصب', maintenance: 'نگهداری', payment: 'پرداخت',
            meeting: 'جلسه', inspection: 'بازدید', task: 'وظیفه', other: 'سایر'
        };
        const daysUntil = this._daysUntil(event);
        let dueText = '';
        if (daysUntil === 0) dueText = '<span class="chip chip--emerald">امروز</span>';
        else if (daysUntil === 1) dueText = '<span class="chip chip--sun">فردا</span>';
        else if (daysUntil > 0 && daysUntil <= 7) dueText = `<span class="chip chip--sky">${toPersianNum(daysUntil)} روز دیگر</span>`;
        else if (daysUntil < 0) dueText = `<span class="chip" style="background:rgba(239,68,68,0.15);color:#ef4444;">${toPersianNum(Math.abs(daysUntil))} روز گذشته</span>`;

        return `
            <div class="cal-card cal-card--${event.type}" data-event-id="${event.id}">
                <div style="display:flex;align-items:flex-start;gap:var(--space-3);">
                    <div style="width:40px;height:40px;border-radius:var(--radius-md);background:var(--color-surface-2);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">${typeIcons[event.type] || '📅'}</div>
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;">
                            <h4 style="font-weight:700;margin:0;">${Utils.escapeHTML(event.title)}</h4>
                            <span class="chip" style="font-size:10px;">${typeLabels[event.type] || event.type}</span>
                            ${dueText}
                        </div>
                        ${event.description ? `<p style="font-size:var(--font-size-sm);color:var(--color-text-muted);margin:4px 0 0;">${Utils.escapeHTML(event.description)}</p>` : ''}
                        ${showDate ? `<div style="font-size:var(--font-size-xs);color:var(--color-text-dim);margin-top:4px;">📅 ${formatJalaliDate(event.jy, event.jm, event.jd, 'long')} - ${getDayName(event.jy, event.jm, event.jd)}</div>` : ''}
                    </div>
                    <div style="display:flex;flex-direction:column;gap:4px;">
                        <button class="btn-icon" data-edit-event="${event.id}" style="background:var(--color-surface-2);border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--color-text-muted);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="btn-icon" data-delete-event="${event.id}" style="background:rgba(239,68,68,0.1);border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#ef4444;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    _getAllEvents() {
        const events = [];
        // رویدادهای وظایف
        tasks.all().forEach(t => {
            if (t.dueDate) {
                const d = new Date(t.dueDate);
                if (!isNaN(d)) {
                    const [jy, jm, jd] = dateToJalali(d);
                    events.push({
                        id: 'task-' + t.id,
                        type: t.type || 'task',
                        title: t.title || 'وظیفه',
                        description: t.description || '',
                        jy, jm, jd,
                        date: d
                    });
                }
            }
        });

        // رویدادهای پروژه (نصب)
        projects.all().forEach(p => {
            if (p.installDate) {
                const d = new Date(p.installDate);
                if (!isNaN(d)) {
                    const [jy, jm, jd] = dateToJalali(d);
                    events.push({
                        id: 'install-' + p.id,
                        type: 'install',
                        title: `نصب ${p.name || 'پروژه'}`,
                        description: `${p.totalCapacity || 0} kW - ${p.customer || ''}`,
                        jy, jm, jd,
                        date: d
                    });
                }
            }
            if (p.maintenanceDate) {
                const d = new Date(p.maintenanceDate);
                if (!isNaN(d)) {
                    const [jy, jm, jd] = dateToJalali(d);
                    events.push({
                        id: 'maint-' + p.id,
                        type: 'maintenance',
                        title: `نگهداری ${p.name || 'پروژه'}`,
                        description: p.notes || '',
                        jy, jm, jd,
                        date: d
                    });
                }
            }
        });

        // رویدادهای پرداخت
        try {
            const paymentsData = JSON.parse(localStorage.getItem('solar-pwa:payments') || '[]');
            paymentsData.forEach(p => {
                if (p.dueDate) {
                    const d = new Date(p.dueDate);
                    if (!isNaN(d)) {
                        const [jy, jm, jd] = dateToJalali(d);
                        events.push({
                            id: 'pay-' + p.id,
                            type: 'payment',
                            title: `پرداخت ${p.amount || 0}$`,
                            description: p.project || '',
                            jy, jm, jd,
                            date: d
                        });
                    }
                }
            });
        } catch { /* silent */ }

        return events;
    },

    _getEventsForMonth(year, month) {
        return this._getAllEvents().filter(e => e.jy === year && e.jm === month);
    },

    _filteredEvents(allEvents) {
        return this.state.filter === 'all' ? allEvents : allEvents.filter(e => e.type === this.state.filter);
    },

    _getUpcoming(allEvents, days) {
        const today = todayJalali();
        const todayDays = this._jalaliToDays(today[0], today[1], today[2]);
        return allEvents
            .filter(e => {
                const evDays = this._jalaliToDays(e.jy, e.jm, e.jd);
                return evDays >= todayDays && evDays <= todayDays + days;
            })
            .sort((a, b) => this._jalaliToDays(a.jy, a.jm, a.jd) - this._jalaliToDays(b.jy, b.jm, b.jd));
    },

    _jalaliToDays(jy, jm, jd) {
        let days = 0;
        for (let y = 1; y < jy; y++) {
            days += isJalaliLeap(y) ? 366 : 365;
        }
        for (let m = 1; m < jm; m++) {
            days += getJalaliMonthDays(jy, m);
        }
        return days + jd;
    },

    _daysUntil(event) {
        const today = todayJalali();
        const todayDays = this._jalaliToDays(today[0], today[1], today[2]);
        const evDays = this._jalaliToDays(event.jy, event.jm, event.jd);
        return evDays - todayDays;
    },

    attach() {
        // تغییر view
        document.querySelectorAll('#viewSwitch button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.state.view = btn.dataset.view;
                this._refresh();
            });
        });

        // فیلتر
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.state.filter = btn.dataset.filter;
                document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                this._refresh();
            });
        });

        // ناوبری ماه
        document.getElementById('prevMonth')?.addEventListener('click', () => this._changeMonth(-1));
        document.getElementById('nextMonth')?.addEventListener('click', () => this._changeMonth(1));

        // کلیک روی روز
        document.querySelectorAll('.cal-cell[data-day]').forEach(cell => {
            cell.addEventListener('click', () => {
                const day = parseInt(cell.dataset.day);
                const today = todayJalali();
                this._showAddEvent(today[0], today[1], day);
            });
        });

        // کلیک روی رویداد
        document.querySelectorAll('[data-event-id]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this._showEventDetails(el.dataset.eventId);
            });
        });

        // حذف رویداد
        document.querySelectorAll('[data-delete-event]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('این رویداد حذف شود؟')) {
                    this._deleteEvent(btn.dataset.deleteEvent);
                }
            });
        });

        // افزودن رویداد
        document.getElementById('addEventBtn')?.addEventListener('click', () => {
            const today = todayJalali();
            this._showAddEvent(today[0], today[1], today[2]);
        });
    },

    _changeMonth(dir) {
        // منطق ساده: فقط به‌روزرسانی view
        this._refresh();
    },

    _showAddEvent(jy, jm, jd) {
        const content = `
            <div style="padding:var(--space-3);">
                <div class="field">
                    <label class="field__label">عنوان رویداد</label>
                    <input type="text" class="input" id="eventTitle" placeholder="مثلاً: نصب پنل‌ها">
                </div>
                <div class="field">
                    <label class="field__label">نوع رویداد</label>
                    <select class="input" id="eventType">
                        <option value="install">🔧 نصب</option>
                        <option value="maintenance">🛠 نگهداری</option>
                        <option value="payment">💰 پرداخت</option>
                        <option value="meeting">👥 جلسه</option>
                        <option value="inspection">🔍 بازدید</option>
                        <option value="task">📌 وظیفه</option>
                        <option value="other">📅 سایر</option>
                    </select>
                </div>
                <div class="field">
                    <label class="field__label">تاریخ</label>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-2);">
                        <input type="number" class="input" id="eventYear" value="${jy}" min="1400" max="1500" placeholder="سال">
                        <input type="number" class="input" id="eventMonth" value="${jm}" min="1" max="12" placeholder="ماه">
                        <input type="number" class="input" id="eventDay" value="${jd}" min="1" max="31" placeholder="روز">
                    </div>
                </div>
                <div class="field">
                    <label class="field__label">ساعت</label>
                    <input type="time" class="input" id="eventTime" value="09:00">
                </div>
                <div class="field">
                    <label class="field__label">توضیحات</label>
                    <textarea class="input" id="eventDesc" rows="2" placeholder="جزئیات بیشتر..."></textarea>
                </div>
            </div>
        `;
        modal.open({
            title: '➕ افزودن رویداد',
            content,
            actions: [
                { label: 'انصراف', class: 'btn--secondary', onclick: () => modal.close() },
                { label: 'ذخیره', class: 'btn--primary', onclick: () => this._saveEvent() }
            ]
        });
        setTimeout(() => document.getElementById('eventTitle')?.focus(), 100);
    },

    _saveEvent() {
        const title = document.getElementById('eventTitle').value.trim();
        if (!title) {
            toast.error('عنوان الزامی است');
            return;
        }
        const type = document.getElementById('eventType').value;
        const jy = parseInt(document.getElementById('eventYear').value);
        const jm = parseInt(document.getElementById('eventMonth').value);
        const jd = parseInt(document.getElementById('eventDay').value);
        const time = document.getElementById('eventTime').value;
        const description = document.getElementById('eventDesc').value.trim();

        // تبدیل به میلادی
        const date = jalaliToDate(jy, jm, jd);
        const [hh, mm] = time.split(':').map(Number);
        date.setHours(hh, mm);

        // ذخیره در tasks
        tasks.save({
            title,
            type,
            description,
            dueDate: date.toISOString(),
            status: 'pending'
        });

        modal.close();
        toast.success('رویداد ذخیره شد');
        this._refresh();
    },

    _showEventDetails(id) {
        const event = this._getAllEvents().find(e => e.id === id);
        if (!event) return;
        const typeLabels = {
            install: 'نصب', maintenance: 'نگهداری', payment: 'پرداخت',
            meeting: 'جلسه', inspection: 'بازدید', task: 'وظیفه'
        };
        const content = `
            <div style="padding:var(--space-3);">
                <h3 style="margin:0;">${Utils.escapeHTML(event.title)}</h3>
                <div style="color:var(--color-text-muted);font-size:var(--font-size-sm);margin:var(--space-2) 0;">${typeLabels[event.type] || event.type}</div>
                <div style="background:var(--color-bg-soft);padding:var(--space-3);border-radius:var(--radius-md);margin:var(--space-3) 0;">
                    <div>📅 ${formatJalaliDate(event.jy, event.jm, event.jd, 'long')}</div>
                    <div>📆 ${getDayName(event.jy, event.jm, event.jd)}</div>
                    ${event.description ? `<div style="margin-top:var(--space-2);">📝 ${Utils.escapeHTML(event.description)}</div>` : ''}
                </div>
            </div>
        `;
        modal.open({
            title: 'جزئیات رویداد',
            content,
            actions: [
                { label: 'بستن', class: 'btn--secondary', onclick: () => modal.close() }
            ]
        });
    },

    _deleteEvent(id) {
        if (id.startsWith('task-')) {
            const taskId = id.replace('task-', '');
            tasks.remove(taskId);
        }
        toast.success('رویداد حذف شد');
        this._refresh();
    },

    _refresh() {
        const view = document.getElementById('view');
        if (view) {
            view.style.opacity = '0';
            setTimeout(() => {
                view.innerHTML = this.render();
                view.style.opacity = '1';
                this.attach();
            }, 150);
        }
    }
};
