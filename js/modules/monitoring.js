/**
 * سیستم مانیتورینگ تولید
 * Production Monitoring System
 * ثبت تولید واقعی و مقایسه با انتظار
 */
import { Utils } from '../utils.js';
import { toast, modal } from '../ui.js';
import { projects, settings } from '../store.js';

export const monitoring = {
    name: 'monitoring',
    path: '#monitoring',

    state: {
        selectedProjectId: null,
        records: [],
        period: 'month' // month, week
    },

    _loadRecords() {
        try {
            return JSON.parse(localStorage.getItem('solar-pwa:production-records') || '[]');
        } catch {
            return [];
        }
    },

    _saveRecords() {
        localStorage.setItem('solar-pwa:production-records', JSON.stringify(this.state.records));
    },

    render() {
        // بارگذاری records از localStorage
        this.state.records = this._loadRecords();
        const projects_list = projects.list();
        const currentProject = this.state.selectedProjectId ? projects.get(this.state.selectedProjectId) : null;
        const currency = settings.get('currency', '$');
        const electricityPrice = parseFloat(settings.get('electricityPrice', 0.10));

        return `
            <h1 class="page-title anim-fade-up">مانیتورینگ تولید</h1>
            <p class="page-subtitle anim-fade-up">ثبت و پیگیری تولید واقعی سیستم‌های نصب شده</p>

            ${!currentProject ? `
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--sky">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <div>
                        <div class="card__title">انتخاب پروژه</div>
                        <div class="card__subtitle">${Utils.toPersian(projects_list.length)} پروژه موجود</div>
                    </div>
                </div>
                ${projects_list.length === 0 ? `
                <div class="empty">
                    <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
                    <h3 class="empty__title">پروژه‌ای وجود ندارد</h3>
                    <p class="empty__text">ابتدا یک پروژه ایجاد کنید</p>
                    <a class="btn btn--primary" data-route="quick-estimate" style="display:inline-flex;cursor:pointer;margin-top:var(--space-3);">ساخت پروژه</a>
                </div>` : `
                <div class="list">
                    ${projects_list.map((p) => `
                        <div class="list-item" data-pick-project="${p.id}">
                            <div class="list-item__icon" style="background:rgba(245,158,11,0.15);color:var(--color-sun-300);">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                            </div>
                            <div class="list-item__body">
                                <div class="list-item__title">${Utils.escapeHTML(p.name)}</div>
                                <div class="list-item__subtitle">${Utils.formatNumber(p.actualPvKw || p.requiredPvKw || 0, 1)} kW · تولید مورد انتظار: ${Utils.formatNumber(p.annualKWh || 0, 0)} kWh/سال</div>
                            </div>
                            <div class="list-item__action">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="9 18 15 12 9 6"/></svg>
                            </div>
                        </div>
                    `).join('')}
                </div>`}
            </div>` : this._renderDashboard(currentProject, currency, electricityPrice)}
        `;
    },

    _renderDashboard(project, currency, electricityPrice) {
        const projectRecords = this.state.records.filter((r) => r.projectId === project.id);
        const totalActual = projectRecords.reduce((s, r) => s + r.kWh, 0);
        const totalExpected = this._calcExpected(project);
        const performance = totalExpected > 0 ? (totalActual / totalExpected * 100) : 0;
        const totalSavings = totalActual * electricityPrice;

        // Monthly data
        const monthlyData = this._getMonthlyData(projectRecords);
        const chartPath = this._renderChart(monthlyData);

        return `
            <div class="card card--sun anim-fade-up" style="padding:var(--space-5);margin-bottom:var(--space-4);position:relative;overflow:hidden;">
                <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;color:var(--color-text-inverse);position:relative;">
                    <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3);">
                        <button class="btn btn--icon" id="monChangeProject" style="background:rgba(0,0,0,0.2);color:white;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                        </button>
                        <div style="flex:1;min-width:0;">
                            <p style="opacity:0.7;font-size:var(--font-size-xs);font-weight:600;">سیستم فعال</p>
                            <h2 style="color:white;font-size:var(--font-size-lg);font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${Utils.escapeHTML(project.name)}</h2>
                        </div>
                    </div>
                    <div class="stats" style="grid-template-columns:repeat(2,1fr);">
                        <div style="text-align:center;padding:var(--space-3);background:rgba(0,0,0,0.15);border-radius:var(--radius-md);">
                            <div style="opacity:0.7;font-size:var(--font-size-xs);">تولید واقعی</div>
                            <div style="font-weight:800;font-size:var(--font-size-2xl);">${Utils.formatNumber(totalActual, 0)}</div>
                            <div style="opacity:0.7;font-size:var(--font-size-xs);">kWh</div>
                        </div>
                        <div style="text-align:center;padding:var(--space-3);background:rgba(0,0,0,0.15);border-radius:var(--radius-md);">
                            <div style="opacity:0.7;font-size:var(--font-size-xs);">عملکرد</div>
                            <div style="font-weight:800;font-size:var(--font-size-2xl);color:${performance >= 90 ? '#86efac' : performance >= 70 ? '#fde047' : '#fca5a5'};">${Utils.formatNumber(performance, 0)}%</div>
                            <div style="opacity:0.7;font-size:var(--font-size-xs);">از انتظار</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">📊 نمودار تولید ماهانه</h2>
                </div>
                ${chartPath}
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">📝 ثبت تولید روزانه</h2>
                    <button class="btn btn--primary btn--sm" id="addRecordBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        ثبت جدید
                    </button>
                </div>
                <div class="list" id="recordsList">
                    ${projectRecords.length === 0 ? `
                    <div class="empty">
                        <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                        <h3 class="empty__title">هنوز رکوردی ثبت نشده</h3>
                        <p class="empty__text">اولین تولید روزانه را ثبت کنید</p>
                    </div>` : projectRecords.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20).map((r) => `
                    <div class="list-item" data-record-id="${r.id}" style="cursor:default;">
                        <div class="list-item__icon" style="background:${r.kWh > 0 ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'};color:${r.kWh > 0 ? 'var(--color-emerald-400)' : 'var(--color-sun-300)'};">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <div class="list-item__body">
                            <div class="list-item__title">${Utils.formatNumber(r.kWh, 1)} kWh</div>
                            <div class="list-item__subtitle">${Utils.formatDate(r.date)}${r.note ? ' · ' + Utils.escapeHTML(r.note) : ''}</div>
                        </div>
                        <div style="display:flex;align-items:center;gap:var(--space-2);">
                            <div style="text-align:left;flex-shrink:0;">
                                <div style="font-weight:700;color:var(--color-emerald-400);font-size:var(--font-size-sm);">${Utils.formatNumber(Math.round(r.kWh * electricityPrice), 0)} ${currency}</div>
                            </div>
                            <button class="btn btn--icon btn--sm" data-rm-record="${r.id}" style="background:rgba(239,68,68,0.1);color:var(--color-red-400);">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/></svg>
                            </button>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">📈 آمار کلی</h2>
                </div>
                <div class="list">
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__body">
                            <div class="list-item__title">کل تولید ثبت شده</div>
                            <div class="list-item__subtitle">${Utils.toPersian(projectRecords.length)} رکورد</div>
                        </div>
                        <div style="font-weight:800;color:var(--color-emerald-400);">${Utils.formatNumber(totalActual, 0)} kWh</div>
                    </div>
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__body">
                            <div class="list-item__title">تولید مورد انتظار</div>
                            <div class="list-item__subtitle">بر اساس ظرفیت و ساعات آفتاب</div>
                        </div>
                        <div style="font-weight:800;">${Utils.formatNumber(totalExpected, 0)} kWh</div>
                    </div>
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__body">
                            <div class="list-item__title">صرفه‌جویی تخمینی</div>
                            <div class="list-item__subtitle">${Utils.formatNumber(electricityPrice, 3)} ${currency}/kWh</div>
                        </div>
                        <div style="font-weight:800;color:var(--color-sun-300);">${Utils.formatNumber(Math.round(totalSavings))} ${currency}</div>
                    </div>
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__body">
                            <div class="list-item__title">میانگین روزانه</div>
                            <div class="list-item__subtitle">${Utils.toPersian(projectRecords.length)} روز</div>
                        </div>
                        <div style="font-weight:800;">${projectRecords.length > 0 ? Utils.formatNumber(totalActual / projectRecords.length, 1) : '۰'} kWh</div>
                    </div>
                </div>
            </div>

            <div class="card card--sky anim-fade-up" style="padding:var(--space-4);color:white;">
                <h3 style="color:white;margin-bottom:var(--space-2);">💡 نکته</h3>
                <p style="opacity:0.9;line-height:1.7;font-size:var(--font-size-sm);">
                    ${this._getTip(performance)}
                </p>
            </div>
        `;
    },

    _getMonthlyData(records) {
        const months = ['حمل','ثور','جوزا','سرطان','اسد','سنبله','میزان','عقرب','قوس','جدی','دلو','حوت'];
        const now = new Date();
        const data = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthRecords = records.filter((r) => {
                const rd = new Date(r.date);
                return rd.getFullYear() === d.getFullYear() && rd.getMonth() === d.getMonth();
            });
            const actual = monthRecords.reduce((s, r) => s + r.kWh, 0);
            data.push({
                month: months[d.getMonth()],
                actual,
                isCurrent: i === 0
            });
        }
        return data;
    },

    _renderChart(data) {
        const width = 360;
        const height = 180;
        const padding = 30;
        const max = Math.max(...data.map((d) => d.actual), 100);
        const barW = (width - padding * 2) / data.length - 4;
        const bars = data.map((d, i) => {
            const x = padding + i * ((width - padding * 2) / data.length);
            const h = (d.actual / max) * (height - padding * 2);
            const y = height - padding - h;
            const color = d.isCurrent ? 'url(#chartBarActive)' : 'url(#chartBar)';
            return `
                <rect x="${x}" y="${y}" width="${barW}" height="${h}" fill="${color}" rx="2" opacity="${d.actual > 0 ? 1 : 0.3}"/>
                <text x="${x + barW / 2}" y="${height - 12}" fill="var(--color-text-muted)" font-size="9" text-anchor="middle">${d.month.substring(0, 3)}</text>
                ${d.actual > 0 ? `<text x="${x + barW / 2}" y="${y - 4}" fill="var(--color-text)" font-size="9" text-anchor="middle" font-weight="bold">${Utils.toPersian(Math.round(d.actual))}</text>` : ''}
            `;
        }).join('');

        return `
            <svg viewBox="0 0 ${width} ${height}" style="width:100%;height:auto;display:block;">
                <defs>
                    <linearGradient id="chartBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#fbbf24"/>
                        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.5"/>
                    </linearGradient>
                    <linearGradient id="chartBarActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#38bdf8"/>
                        <stop offset="100%" stop-color="#0284c7" stop-opacity="0.5"/>
                    </linearGradient>
                </defs>
                <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--color-text-dim)" stroke-width="1"/>
                ${bars}
            </svg>
        `;
    },

    _getTip(performance) {
        if (performance >= 95) return 'عالی! سیستم شما در حداکثر عملکرد کار می‌کند. به نگهداری منظم ادامه دهید.';
        if (performance >= 80) return 'عملکرد خوب است. بررسی دوره‌ای پنل‌ها و تمیزکاری توصیه می‌شود.';
        if (performance >= 60) return '⚠️ عملکرد پایین‌تر از حد انتظار. سایه، آلودگی یا خرابی تجهیزات را بررسی کنید.';
        if (performance > 0) return '🚨 عملکرد بسیار پایین! فوراً سیستم را بررسی و با نصاب تماس بگیرید.';
        return 'هنوز داده‌ای ثبت نشده. اولین رکورد تولید را اضافه کنید.';
    },

    _calcExpected(project) {
        if (!project) return 0;
        // Days since project start
        const created = project.createdAt || project.updatedAt || Date.now();
        const days = Math.max(1, Math.floor((Date.now() - created) / 86400000));
        const dailyExpected = (project.annualKWh || 0) / 365;
        return dailyExpected * days;
    },

    attach() {
        document.querySelectorAll('[data-pick-project]').forEach((el) => {
            el.addEventListener('click', () => {
                this.state.selectedProjectId = el.dataset.pickProject;
                this._refresh();
            });
        });
        document.getElementById('monChangeProject')?.addEventListener('click', () => {
            this.state.selectedProjectId = null;
            this._refresh();
        });
        document.getElementById('addRecordBtn')?.addEventListener('click', () => this._addRecord());
        document.querySelectorAll('[data-rm-record]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this._removeRecord(btn.dataset.rmRecord);
            });
        });
    },

    async _addRecord() {
        const dateStr = await modal.prompt({
            title: 'تاریخ ثبت',
            label: 'تاریخ (مثال: ۱۴۰۵/۰۵/۱۵)',
            placeholder: 'تاریخ امروز',
            defaultValue: new Date().toISOString().slice(0, 10)
        });
        if (!dateStr) return;
        const kwhStr = await modal.prompt({
            title: 'تولید روزانه',
            label: 'تولید (کیلووات ساعت)',
            type: 'number',
            placeholder: 'مثال: ۲۵.۵'
        });
        if (!kwhStr) return;
        const kWh = parseFloat(kwhStr);
        if (!Utils.isValidNumber(kWh, { min: 0, max: 10000 })) {
            toast.error('مقدار نامعتبر');
            return;
        }
        const note = await modal.prompt({
            title: 'یادداشت (اختیاری)',
            label: 'یادداشت',
            placeholder: 'مثلاً: هوا آفتابی، پنل تمیز شد...',
            defaultValue: ''
        });
        this.state.records.push({
            id: 'rec-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
            projectId: this.state.selectedProjectId,
            date: dateStr,
            kWh,
            note: note || ''
        });
        this._saveRecords();
        toast.success('تولید ثبت شد');
        this._refresh();
    },

    _removeRecord(id) {
        this.state.records = this.state.records.filter((r) => r.id !== id);
        this._saveRecords();
        toast.success('حذف شد');
        this._refresh();
    },

    _refresh() {
        const view = document.getElementById('view');
        if (view) { view.innerHTML = this.render(); this.attach(); }
    }
};
