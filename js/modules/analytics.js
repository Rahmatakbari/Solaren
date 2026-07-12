/**
 * داشبورد تحلیلی پیشرفته
 * Advanced Analytics Dashboard with Interactive Charts
 */
import { Utils } from '../utils.js';
import { projects, invoices, customers, tasks, payments, team } from '../store.js';

export const analytics = {
    name: 'analytics',
    path: '#analytics',

    state: {
        period: '30' // days
    },

    PERIODS: [
        { id: '7', label: '۷ روز' },
        { id: '30', label: '۳۰ روز' },
        { id: '90', label: '۹۰ روز' },
        { id: '365', label: '۱ سال' },
        { id: 'all', label: 'همه' }
    ],

    render() {
        const stats = this._calculateStats();

        return `
            <h1 class="page-title anim-fade-up">داشبورد تحلیلی</h1>
            <p class="page-subtitle anim-fade-up">نمودارها و آمار پیشرفته کسب‌وکار</p>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">بازه زمانی</h2>
                </div>
                <div class="switch-group" id="periodFilter">
                    ${this.PERIODS.map((p) => `<button class="${this.state.period === p.id ? 'is-active' : ''}" data-val="${p.id}">${p.label}</button>`).join('')}
                </div>
            </div>

            <div class="stats stagger">
                <div class="stat stat--sun">
                    <div class="stat__label">درآمد دوره</div>
                    <div class="stat__value">${Utils.formatNumber(Math.round(stats.revenue / 1000))}<span class="stat__unit">هزار $</span></div>
                    <div class="stat__change ${stats.revenueChange > 0 ? 'stat__change--up' : 'stat__change--down'}">
                        ${stats.revenueChange > 0 ? '▲' : '▼'} ${Math.abs(stats.revenueChange).toFixed(0)}%
                    </div>
                </div>
                <div class="stat stat--sky">
                    <div class="stat__label">پروژه‌های جدید</div>
                    <div class="stat__value">${Utils.toPersian(stats.newProjects)}</div>
                </div>
                <div class="stat stat--emerald">
                    <div class="stat__label">مشتریان جدید</div>
                    <div class="stat__value">${Utils.toPersian(stats.newCustomers)}</div>
                </div>
                <div class="stat stat--violet">
                    <div class="stat__label">نرخ تبدیل</div>
                    <div class="stat__value">${Utils.formatNumber(stats.conversionRate, 0)}<span class="stat__unit">%</span></div>
                </div>
            </div>

            <!-- Revenue Chart -->
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">📈 نمودار درآمد</h2>
                </div>
                ${this._renderLineChart(stats.revenueByMonth, 'درآمد ماهانه ($)')}
            </div>

            <!-- Project Distribution -->
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">📊 توزیع نوع سیستم</h2>
                </div>
                ${this._renderDonutChart(stats.systemDistribution)}
            </div>

            <!-- Customer Growth -->
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">👥 رشد مشتریان</h2>
                </div>
                ${this._renderBarChart(stats.customerGrowth, 'مشتریان جدید')}
            </div>

            <!-- Top Performers -->
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">🏆 برترین‌ها</h2>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);">
                    ${this._renderTopList('مشتریان برتر', stats.topCustomers)}
                    ${this._renderTopList('تیم برتر', stats.topTeam)}
                </div>
            </div>

            <!-- Performance Metrics -->
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">📊 شاخص‌های کلیدی</h2>
                </div>
                <div class="list">
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__body">
                            <div class="list-item__title">میانگین ارزش پروژه</div>
                            <div class="list-item__subtitle">میانگین هزینه هر پروژه</div>
                        </div>
                        <div style="font-weight:800;color:var(--color-sun-300);">${Utils.formatNumber(Math.round(stats.avgProjectValue))} $</div>
                    </div>
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__body">
                            <div class="list-item__title">ظرفیت متوسط</div>
                            <div class="list-item__subtitle">میانگین kW هر پروژه</div>
                        </div>
                        <div style="font-weight:800;color:var(--color-sky-300);">${Utils.formatNumber(stats.avgCapacity, 1)} kW</div>
                    </div>
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__body">
                            <div class="list-item__title">نرخ تکمیل وظایف</div>
                            <div class="list-item__subtitle">درصد وظایف تکمیل شده</div>
                        </div>
                        <div style="font-weight:800;color:var(--color-emerald-400);">${Utils.formatNumber(stats.taskCompletion, 0)}%</div>
                    </div>
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__body">
                            <div class="list-item__title">نرخ وصول پرداخت</div>
                            <div class="list-item__subtitle">درصد پرداخت‌های دریافتی</div>
                        </div>
                        <div style="font-weight:800;color:var(--color-violet-400);">${Utils.formatNumber(stats.collectionRate, 0)}%</div>
                    </div>
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__body">
                            <div class="list-item__title">پروژه فعال</div>
                            <div class="list-item__subtitle">در حال اجرا</div>
                        </div>
                        <div style="font-weight:800;">${Utils.toPersian(stats.activeProjects)}</div>
                    </div>
                </div>
            </div>
        `;
    },

    _calculateStats() {
        const days = this.state.period === 'all' ? Infinity : parseInt(this.state.period);
        const cutoff = days === Infinity ? 0 : Date.now() - days * 86400000;
        const allInvoices = invoices.list();
        const allProjects = projects.list();
        const allCustomers = customers.list();
        const allTasks = tasks.list();
        const allPayments = payments.list();

        // Filtered by period
        const periodInvoices = allInvoices.filter((i) => i.createdAt >= cutoff);
        const periodProjects = allProjects.filter((p) => p.createdAt >= cutoff);
        const periodCustomers = allCustomers.filter((c) => (c.lastUsed || c.createdAt || 0) >= cutoff);

        // Revenue
        const revenue = periodInvoices.reduce((s, i) => s + (i.total || 0), 0);

        // Compare with previous period
        const prevCutoff = days === Infinity ? 0 : cutoff - days * 86400000;
        const prevInvoices = allInvoices.filter((i) => i.createdAt >= prevCutoff && i.createdAt < cutoff);
        const prevRevenue = prevInvoices.reduce((s, i) => s + (i.total || 0), 0);
        const revenueChange = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue * 100) : 0;

        // Revenue by month
        const revenueByMonth = this._groupByMonth(periodInvoices, 'createdAt', 'total');

        // System distribution
        const systemDistribution = {
            onGrid: allProjects.filter((p) => p.systemType === 'on-grid').length,
            offGrid: allProjects.filter((p) => p.systemType === 'off-grid').length,
            hybrid: allProjects.filter((p) => p.systemType === 'hybrid').length
        };

        // Customer growth by month
        const customerGrowth = this._groupByMonth(allCustomers, 'createdAt', null, true);

        // Top customers
        const customerTotals = {};
        allCustomers.forEach((c) => {
            const total = allInvoices.filter((i) => i.customerName === c.name).reduce((s, i) => s + (i.total || 0), 0);
            customerTotals[c.id] = { name: c.name, value: total };
        });
        const topCustomers = Object.values(customerTotals).sort((a, b) => b.value - a.value).slice(0, 5);

        // Top team
        const teamTotals = {};
        team.list().forEach((m) => {
            const sales = allInvoices.filter((i) => i.assignedTo === m.id).reduce((s, i) => s + (i.total || 0), 0);
            teamTotals[m.id] = { name: m.name, role: m.role, value: sales };
        });
        const topTeam = Object.values(teamTotals).sort((a, b) => b.value - a.value).slice(0, 5);

        // KPIs
        const avgProjectValue = allProjects.length > 0
            ? allProjects.reduce((s, p) => s + (p.totalCost || 0), 0) / allProjects.length : 0;
        const avgCapacity = allProjects.length > 0
            ? allProjects.reduce((s, p) => s + (p.actualPvKw || 0), 0) / allProjects.length : 0;
        const completedTasks = allTasks.filter((t) => t.status === 'completed').length;
        const taskCompletion = allTasks.length > 0 ? (completedTasks / allTasks.length * 100) : 0;
        const paidPayments = allPayments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
        const totalPayments = allPayments.reduce((s, p) => s + p.amount, 0);
        const collectionRate = totalPayments > 0 ? (paidPayments / totalPayments * 100) : 0;
        const activeProjects = allProjects.filter((p) => p.status !== 'completed').length;

        return {
            revenue,
            revenueChange,
            newProjects: periodProjects.length,
            newCustomers: periodCustomers.length,
            conversionRate: allProjects.length > 0 ? (allInvoices.length / allProjects.length * 100) : 0,
            revenueByMonth,
            systemDistribution,
            customerGrowth,
            topCustomers,
            topTeam,
            avgProjectValue,
            avgCapacity,
            taskCompletion,
            collectionRate,
            activeProjects
        };
    },

    _groupByMonth(items, dateField, valueField, countOnly = false) {
        const months = [];
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthItems = items.filter((item) => {
                const date = new Date(item[dateField] || 0);
                return date.getFullYear() === d.getFullYear() && date.getMonth() === d.getMonth();
            });
            const value = countOnly ? monthItems.length : monthItems.reduce((s, i) => s + (i[valueField] || 0), 0);
            months.push({
                label: ['حمل','ثور','جوزا','سرطان','اسد','سنبله'][d.getMonth()] || ['میزان','عقرب','قوس','جدی','دلو','حوت'][d.getMonth() - 6],
                value
            });
        }
        return months;
    },

    _renderLineChart(data, title) {
        const width = 360;
        const height = 200;
        const padding = 35;
        const max = Math.max(...data.map((d) => d.value), 1);
        const stepX = (width - padding * 2) / Math.max(data.length - 1, 1);
        const points = data.map((d, i) => {
            const x = padding + i * stepX;
            const y = height - padding - (d.value / max) * (height - padding * 2);
            return { x, y, label: d.label, value: d.value };
        });
        const pathData = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
        const fillData = pathData + ` L ${padding + (data.length - 1) * stepX} ${height - padding} L ${padding} ${height - padding} Z`;

        return `
            <svg viewBox="0 0 ${width} ${height}" style="width:100%;height:auto;display:block;">
                <defs>
                    <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.4"/>
                        <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.05"/>
                    </linearGradient>
                </defs>
                <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--color-text-dim)" stroke-width="1"/>
                <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="var(--color-text-dim)" stroke-width="1"/>
                <text x="${padding - 4}" y="${padding + 4}" fill="var(--color-text-dim)" font-size="9" text-anchor="end">${Utils.toPersian(Math.round(max / 1000))}K</text>
                <text x="${padding - 4}" y="${height - padding + 4}" fill="var(--color-text-dim)" font-size="9" text-anchor="end">۰</text>
                <path d="${fillData}" fill="url(#lineFill)"/>
                <path d="${pathData}" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                ${points.map((p) => `
                    <circle cx="${p.x}" cy="${p.y}" r="4" fill="#fbbf24" stroke="#0a0e1a" stroke-width="2"/>
                `).join('')}
                ${points.map((p, i) => `<text x="${p.x}" y="${height - 12}" fill="var(--color-text-muted)" font-size="9" text-anchor="middle">${p.label}</text>`).join('')}
            </svg>
        `;
    },

    _renderDonutChart(data) {
        const total = data.onGrid + data.offGrid + data.hybrid;
        if (total === 0) return '<div class="empty"><p>داده‌ای نیست</p></div>';

        const cx = 120, cy = 120, r = 80, ir = 50;
        const segments = [
            { value: data.onGrid, color: '#3b82f6', label: 'آنگرید' },
            { value: data.offGrid, color: '#f59e0b', label: 'آفگرید' },
            { value: data.hybrid, color: '#10b981', label: 'هیبرید' }
        ];

        let currentAngle = -Math.PI / 2;
        const paths = segments.map((seg) => {
            if (seg.value === 0) return '';
            const angle = (seg.value / total) * Math.PI * 2;
            const x1 = cx + r * Math.cos(currentAngle);
            const y1 = cy + r * Math.sin(currentAngle);
            const x2 = cx + r * Math.cos(currentAngle + angle);
            const y2 = cy + r * Math.sin(currentAngle + angle);
            const ix1 = cx + ir * Math.cos(currentAngle + angle);
            const iy1 = cy + ir * Math.sin(currentAngle + angle);
            const ix2 = cx + ir * Math.cos(currentAngle);
            const iy2 = cy + ir * Math.sin(currentAngle);
            const large = angle > Math.PI ? 1 : 0;
            const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${ir} ${ir} 0 ${large} 0 ${ix2} ${iy2} Z`;
            currentAngle += angle;
            return `<path d="${d}" fill="${seg.color}" opacity="0.9"/>`;
        }).join('');

        return `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);align-items:center;">
                <svg viewBox="0 0 240 240" style="width:100%;max-width:200px;">
                    ${paths}
                    <text x="120" y="115" text-anchor="middle" font-size="20" font-weight="bold" fill="var(--color-text)">${Utils.toPersian(total)}</text>
                    <text x="120" y="132" text-anchor="middle" font-size="10" fill="var(--color-text-muted)">پروژه</text>
                </svg>
                <div>
                    ${segments.map((s) => {
                        const pct = total > 0 ? (s.value / total * 100) : 0;
                        return `<div style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2);margin-bottom:var(--space-2);background:var(--color-bg-soft);border-radius:var(--radius-sm);">
                            <div style="width:12px;height:12px;background:${s.color};border-radius:3px;"></div>
                            <div style="flex:1;">
                                <div style="font-weight:600;font-size:var(--font-size-sm);">${s.label}</div>
                                <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">${Utils.toPersian(s.value)} پروژه (${Utils.formatNumber(pct, 0)}%)</div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        `;
    },

    _renderBarChart(data, title) {
        const width = 360;
        const height = 160;
        const padding = 30;
        const max = Math.max(...data.map((d) => d.value), 1);
        const barW = (width - padding * 2) / data.length - 8;

        return `
            <svg viewBox="0 0 ${width} ${height}" style="width:100%;height:auto;display:block;">
                <defs>
                    <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#38bdf8"/>
                        <stop offset="100%" stop-color="#0284c7" stop-opacity="0.6"/>
                    </linearGradient>
                </defs>
                <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--color-text-dim)" stroke-width="1"/>
                ${data.map((d, i) => {
                    const x = padding + i * ((width - padding * 2) / data.length) + 4;
                    const h = (d.value / max) * (height - padding * 2);
                    const y = height - padding - h;
                    return `
                        <rect x="${x}" y="${y}" width="${barW}" height="${h}" fill="url(#barG)" rx="3"/>
                        <text x="${x + barW / 2}" y="${y - 4}" fill="var(--color-text)" font-size="10" text-anchor="middle" font-weight="bold">${d.value}</text>
                        <text x="${x + barW / 2}" y="${height - 12}" fill="var(--color-text-muted)" font-size="9" text-anchor="middle">${d.label}</text>
                    `;
                }).join('')}
            </svg>
        `;
    },

    _renderTopList(title, items) {
        if (items.length === 0 || (items[0] && items[0].value === 0)) {
            return `<div><h4 style="font-size:var(--font-size-md);font-weight:700;margin-bottom:var(--space-2);">${title}</h4><div class="empty"><p>داده‌ای نیست</p></div></div>`;
        }
        return `<div>
            <h4 style="font-size:var(--font-size-md);font-weight:700;margin-bottom:var(--space-2);">${title}</h4>
            <div class="list" style="gap:var(--space-2);">
                ${items.filter((i) => i.value > 0).slice(0, 5).map((item, i) => `
                <div class="list-item" style="cursor:default;padding:var(--space-2) var(--space-3);">
                    <div class="list-item__icon" style="background:${i === 0 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'var(--color-surface-2)'};color:${i === 0 ? 'white' : 'var(--color-text-muted)'};width:32px;height:32px;font-weight:800;font-size:var(--font-size-sm);">
                        ${i + 1}
                    </div>
                    <div class="list-item__body" style="min-width:0;">
                        <div class="list-item__title" style="font-size:var(--font-size-sm);">${Utils.escapeHTML(item.name || item.label || '—')}</div>
                        ${item.role ? `<div class="list-item__subtitle" style="font-size:10px;">${Utils.escapeHTML(item.role)}</div>` : ''}
                    </div>
                    <div style="font-weight:700;color:var(--color-sun-300);font-size:var(--font-size-sm);">${Utils.formatNumber(Math.round(item.value / 1000))}K</div>
                </div>
                `).join('')}
            </div>
        </div>`;
    },

    attach() {
        document.querySelectorAll('#periodFilter button').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.period = btn.dataset.val;
                document.querySelectorAll('#periodFilter button').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                this._refresh();
            });
        });
    },

    _refresh() {
        const view = document.getElementById('view');
        if (view) { view.innerHTML = this.render(); this.attach(); }
    }
};
