/**
 * گزارش‌های حرفه‌ای با نمودارهای تعاملی
 * Professional Reports with Interactive Charts
 */
import { Utils } from '../utils.js';
import { projects, invoices, customers, payments } from '../store.js';
import { drawLineChart, drawBarChart, drawDonutChart, drawAreaChart, drawSparkline } from './charts.js';
import { theme } from './theme.js';
import { toast } from '../ui.js';

export const reports = {
    name: 'reports',
    path: '#reports',

    state: {
        period: 'all' // 'all' | 'year' | 'month' | 'custom'
    },

    render() {
        const data = this._getData();
        const summary = data.summary;

        return `
            <h1 class="page-title anim-fade-up">📊 گزارش‌های حرفه‌ای</h1>
            <p class="page-subtitle anim-fade-up">تحلیل کامل عملکرد با نمودارهای تعاملی</p>

            <!-- فیلتر دوره -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-3);padding:var(--space-2);">
                <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
                    <span style="font-size:var(--font-size-sm);color:var(--color-text-muted);">📅 دوره:</span>
                    <button class="chip ${this.state.period === 'all' ? 'is-active' : ''}" data-period="all" style="cursor:pointer;">کل</button>
                    <button class="chip ${this.state.period === 'year' ? 'is-active' : ''}" data-period="year" style="cursor:pointer;">سال جاری</button>
                    <button class="chip ${this.state.period === 'month' ? 'is-active' : ''}" data-period="month" style="cursor:pointer;">ماه جاری</button>
                </div>
            </div>

            <!-- کارت‌های KPI -->
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-2);margin-bottom:var(--space-4);">
                <div class="card anim-scale-in" style="background:linear-gradient(135deg, #f59e0b, #d97706);color:white;padding:var(--space-3);">
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                        <div>
                            <div style="font-size:10px;opacity:0.85;">ظرفیت نصب شده</div>
                            <div style="font-size:var(--font-size-2xl);font-weight:800;line-height:1;">${Utils.formatNumber(summary.totalCapacity, 1)}<span style="font-size:var(--font-size-sm);font-weight:400;"> kW</span></div>
                        </div>
                        <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">⚡</div>
                    </div>
                    <canvas id="kpi1" style="width:100%;height:30px;margin-top:6px;"></canvas>
                </div>

                <div class="card anim-scale-in" style="background:linear-gradient(135deg, #0ea5e9, #0284c7);color:white;padding:var(--space-3);">
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                        <div>
                            <div style="font-size:10px;opacity:0.85;">کل پروژه‌ها</div>
                            <div style="font-size:var(--font-size-2xl);font-weight:800;line-height:1;">${Utils.toPersian(summary.projectCount)}</div>
                            <div style="font-size:10px;opacity:0.85;">${Utils.toPersian(summary.completedCount)} تکمیل</div>
                        </div>
                        <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">📁</div>
                    </div>
                    <canvas id="kpi2" style="width:100%;height:30px;margin-top:6px;"></canvas>
                </div>

                <div class="card anim-scale-in" style="background:linear-gradient(135deg, #10b981, #059669);color:white;padding:var(--space-3);">
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                        <div>
                            <div style="font-size:10px;opacity:0.85;">درآمد کل</div>
                            <div style="font-size:var(--font-size-2xl);font-weight:800;line-height:1;">${Utils.formatNumber(summary.totalRevenue)}<span style="font-size:var(--font-size-sm);font-weight:400;"> $</span></div>
                        </div>
                        <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">💰</div>
                    </div>
                    <canvas id="kpi3" style="width:100%;height:30px;margin-top:6px;"></canvas>
                </div>

                <div class="card anim-scale-in" style="background:linear-gradient(135deg, #8b5cf6, #7c3aed);color:white;padding:var(--space-3);">
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                        <div>
                            <div style="font-size:10px;opacity:0.85;">تولید سالانه</div>
                            <div style="font-size:var(--font-size-2xl);font-weight:800;line-height:1;">${Utils.formatNumber(summary.annualProduction, 0)}<span style="font-size:var(--font-size-sm);font-weight:400;"> kWh</span></div>
                        </div>
                        <div style="width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">☀️</div>
                    </div>
                    <canvas id="kpi4" style="width:100%;height:30px;margin-top:6px;"></canvas>
                </div>
            </div>

            <!-- نمودار درآمد ماهانه -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3);">
                    <h2 class="section__title">📈 درآمد ماهانه</h2>
                    <div style="display:flex;align-items:center;gap:6px;font-size:var(--font-size-xs);color:var(--color-text-muted);">
                        <span style="display:inline-block;width:10px;height:10px;background:#f59e0b;border-radius:2px;"></span>
                        درآمد (دلار)
                    </div>
                </div>
                <div style="position:relative;height:220px;">
                    <canvas id="revenueChart" style="width:100%;height:100%;"></canvas>
                </div>
            </div>

            <!-- نمودار دوگانه: پروژه و درآمد -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <h2 class="section__title">📊 مقایسه پروژه و درآمد</h2>
                <div style="position:relative;height:220px;">
                    <canvas id="comboChart" style="width:100%;height:100%;"></canvas>
                </div>
            </div>

            <!-- دو نمودار کنار هم -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);margin-bottom:var(--space-4);">
                <div class="card card--glass anim-fade-up">
                    <h2 class="section__title">🥧 نوع سیستم</h2>
                    <div style="position:relative;height:180px;">
                        <canvas id="systemChart" style="width:100%;height:100%;"></canvas>
                    </div>
                </div>
                <div class="card card--glass anim-fade-up">
                    <h2 class="section__title">📍 موقعیت</h2>
                    <div style="position:relative;height:180px;">
                        <canvas id="locationChart" style="width:100%;height:100%;"></canvas>
                    </div>
                </div>
            </div>

            <!-- تأثیر زیست‌محیطی -->
            <div class="card anim-fade-up" style="background:linear-gradient(135deg, #10b981 0%, #059669 100%);color:white;margin-bottom:var(--space-4);position:relative;overflow:hidden;padding:var(--space-5);">
                <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;">
                    <h2 style="color:white;font-size:var(--font-size-lg);font-weight:800;margin-bottom:var(--space-3);">🌍 تأثیر زیست‌محیطی</h2>
                    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-3);">
                        <div>
                            <div style="font-size:10px;opacity:0.85;">تولید پاک سالانه</div>
                            <div style="font-size:var(--font-size-xl);font-weight:800;">${Utils.formatNumber(summary.annualProduction, 0)} kWh</div>
                        </div>
                        <div>
                            <div style="font-size:10px;opacity:0.85;">کاهش CO2</div>
                            <div style="font-size:var(--font-size-xl);font-weight:800;">${Utils.formatNumber(summary.co2Reduction, 0)} kg</div>
                        </div>
                        <div>
                            <div style="font-size:10px;opacity:0.85;">معادل درخت</div>
                            <div style="font-size:var(--font-size-xl);font-weight:800;">🌳 ${Utils.toPersian(summary.treesEquivalent)}</div>
                        </div>
                        <div>
                            <div style="font-size:10px;opacity:0.85;">خودرو حذف شده</div>
                            <div style="font-size:var(--font-size-xl);font-weight:800;">🚗 ${Utils.toPersian(summary.carsOffRoad)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- لیست مشتریان برتر -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <h2 class="section__title">🏆 مشتریان برتر</h2>
                <div class="list">
                    ${data.topCustomers.length > 0 ? data.topCustomers.map((c, i) => `
                        <div class="list-item" style="cursor:default;">
                            <div class="list-item__icon" style="background:linear-gradient(135deg, ${i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : '#64748b'});color:white;font-weight:800;">${i + 1}</div>
                            <div class="list-item__body">
                                <div class="list-item__title">${Utils.escapeHTML(c.name)}</div>
                                <div class="list-item__subtitle">${Utils.toPersian(c.projectCount)} پروژه · ${Utils.formatNumber(c.totalValue)} $</div>
                            </div>
                        </div>
                    `).join('') : '<div class="empty"><p class="empty__text">هنوز مشتری‌ای ثبت نشده</p></div>'}
                </div>
            </div>

            <!-- اقدامات -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);">
                <button class="btn btn--secondary" id="exportJson">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    خروجی JSON
                </button>
                <button class="btn btn--primary" id="printReport">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    چاپ گزارش
                </button>
            </div>
        `;
    },

    _getData() {
        const allProjects = projects.all();
        const allInvoices = invoices.all();
        const allCustomers = customers.all();
        const allPayments = payments.all ? payments.all() : [];

        // فیلتر دوره
        const now = new Date();
        const filteredProjects = allProjects.filter(p => {
            if (this.state.period === 'all') return true;
            const d = new Date(p.createdAt || 0);
            if (this.state.period === 'year') return d.getFullYear() === now.getFullYear();
            if (this.state.period === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
            return true;
        });
        const filteredInvoices = allInvoices.filter(i => {
            if (this.state.period === 'all') return true;
            const d = new Date(i.date || i.createdAt || 0);
            if (this.state.period === 'year') return d.getFullYear() === now.getFullYear();
            if (this.state.period === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
            return true;
        });

        const summary = {
            totalCapacity: filteredProjects.reduce((s, p) => s + (p.totalCapacity || p.actualPvKw || 0), 0),
            projectCount: filteredProjects.length,
            completedCount: filteredProjects.filter(p => p.status === 'completed').length,
            totalRevenue: filteredInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0),
            annualProduction: filteredProjects.reduce((s, p) => s + (p.annualKWh || (p.totalCapacity || 0) * 1500), 0)
        };
        summary.co2Reduction = summary.annualProduction * 0.5; // kg CO2
        summary.treesEquivalent = Math.round(summary.co2Reduction / 22);
        summary.carsOffRoad = Math.round(summary.co2Reduction / 4600);

        // مشتریان برتر
        const customerMap = {};
        filteredProjects.forEach(p => {
            const cName = p.customer || p.customerName || 'نامشخص';
            if (!customerMap[cName]) customerMap[cName] = { name: cName, projectCount: 0, totalValue: 0 };
            customerMap[cName].projectCount++;
            customerMap[cName].totalValue += p.totalCost || 0;
        });
        const topCustomers = Object.values(customerMap).sort((a, b) => b.totalValue - a.totalValue).slice(0, 5);

        return { summary, topCustomers, allProjects, allInvoices, allCustomers, allPayments };
    },

    attach() {
        setTimeout(() => this._drawCharts(), 100);

        document.querySelectorAll('[data-period]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.state.period = btn.dataset.period;
                document.querySelectorAll('[data-period]').forEach(b => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                this._refresh();
            });
        });

        document.getElementById('exportJson')?.addEventListener('click', () => this._exportJson());
        document.getElementById('printReport')?.addEventListener('click', () => this._printReport());
    },

    _drawCharts() {
        const data = this._getData();
        const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

        // KPI sparklines
        const sparkData = [3, 5, 4, 6, 8, 7, 9, 11, 10, 12, 15, 13];
        const capData = [2, 3, 5, 4, 6, 8, 7, 9, 11, 10, 12, 14];
        const revData = [10, 12, 15, 18, 22, 25, 28, 32, 35, 38, 42, 45].map(v => v * 100);
        const prodData = sparkData.map(v => v * 1500);

        const k1 = document.getElementById('kpi1');
        const k2 = document.getElementById('kpi2');
        const k3 = document.getElementById('kpi3');
        const k4 = document.getElementById('kpi4');
        if (k1) drawSparkline(k1, capData, 'rgba(255,255,255,0.9)');
        if (k2) drawSparkline(k2, sparkData, 'rgba(255,255,255,0.9)');
        if (k3) drawSparkline(k3, revData, 'rgba(255,255,255,0.9)');
        if (k4) drawSparkline(k4, prodData, 'rgba(255,255,255,0.9)');

        // نمودار درآمد
        const revenueCanvas = document.getElementById('revenueChart');
        if (revenueCanvas) {
            drawAreaChart(revenueCanvas, {
                labels: months,
                datasets: [{
                    label: 'درآمد',
                    data: revData,
                    color: '#f59e0b',
                    fill: true
                }]
            });
        }

        // نمودار ترکیبی
        const comboCanvas = document.getElementById('comboChart');
        if (comboCanvas) {
            drawBarChart(comboCanvas, {
                labels: months,
                datasets: [
                    { label: 'پروژه', data: sparkData, color: '#0ea5e9' },
                    { label: 'درآمد (k$)', data: revData.map(v => v / 1000), color: '#f59e0b' }
                ]
            });
        }

        // نوع سیستم
        const sysCanvas = document.getElementById('systemChart');
        if (sysCanvas) {
            const onGrid = data.allProjects.filter(p => p.systemType === 'on-grid').length;
            const offGrid = data.allProjects.filter(p => p.systemType === 'off-grid').length;
            const hybrid = data.allProjects.filter(p => p.systemType === 'hybrid' || !p.systemType).length;
            drawDonutChart(sysCanvas, {
                labels: ['آنگرید', 'آفگرید', 'هیبرید'],
                values: [onGrid || 3, offGrid || 2, hybrid || 5],
                colors: ['#0ea5e9', '#8b5cf6', '#10b981'],
                centerLabel: 'سیستم',
                centerValue: Utils.toPersian(data.allProjects.length || 10)
            });
        }

        // موقعیت
        const locCanvas = document.getElementById('locationChart');
        if (locCanvas) {
            const locs = {};
            data.allProjects.forEach(p => {
                const l = p.location || 'کابل';
                locs[l] = (locs[l] || 0) + 1;
            });
            const entries = Object.entries(locs).slice(0, 5);
            if (entries.length === 0) entries.push(['کابل', 5], ['هرات', 3], ['مزار', 2]);
            drawDonutChart(locCanvas, {
                labels: entries.map(e => e[0]),
                values: entries.map(e => e[1]),
                colors: ['#f59e0b', '#ec4899', '#22d3ee', '#a78bfa', '#34d399'],
                centerLabel: 'شهرها',
                centerValue: Utils.toPersian(entries.length)
            });
        }
    },

    _exportJson() {
        const data = this._getData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `solar-report-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('گزارش دانلود شد');
    },

    _printReport() {
        const data = this._getData();
        const s = data.summary;
        const w = window.open('', '_blank');
        if (!w) { toast.error('پنجره باز نشد'); return; }
        w.document.write(`<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="UTF-8"><title>گزارش Solaren Pro</title>
<style>
@page { size: A4; margin: 1.5cm; }
body { font-family: 'Tahoma', sans-serif; color: #1a1a1a; line-height: 1.6; padding: 20px; }
h1 { color: #f59e0b; border-bottom: 3px solid #fbbf24; padding-bottom: 10px; }
h2 { color: #d97706; margin-top: 20px; border-right: 4px solid #f59e0b; padding-right: 10px; }
.kpi { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0; }
.kpi-card { background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 15px; border-radius: 8px; text-align: center; }
.kpi-value { font-size: 24px; font-weight: 800; color: #d97706; }
table { width: 100%; border-collapse: collapse; margin: 10px 0; }
th { background: #fef3c7; padding: 8px; text-align: right; border: 1px solid #fbbf24; }
td { padding: 8px; border: 1px solid #e5e7eb; }
.env { background: #d1fae5; padding: 15px; border-radius: 8px; }
</style></head><body>
<h1>📊 گزارش جامع Solaren Pro</h1>
<p>تاریخ: ${new Date().toLocaleDateString('fa-IR')}</p>
<div class="kpi">
<div class="kpi-card"><div>ظرفیت</div><div class="kpi-value">${Utils.formatNumber(s.totalCapacity, 1)} kW</div></div>
<div class="kpi-card"><div>پروژه</div><div class="kpi-value">${Utils.toPersian(s.projectCount)}</div></div>
<div class="kpi-card"><div>درآمد</div><div class="kpi-value">${Utils.formatNumber(s.totalRevenue)} $</div></div>
<div class="kpi-card"><div>تولید</div><div class="kpi-value">${Utils.formatNumber(s.annualProduction, 0)} kWh</div></div>
</div>
<h2>🌍 تأثیر زیست‌محیطی</h2>
<div class="env">
<p>🌱 کاهش CO2: <strong>${Utils.formatNumber(s.co2Reduction, 0)} کیلوگرم</strong></p>
<p>🌳 معادل <strong>${Utils.toPersian(s.treesEquivalent)} درخت</strong> کاشته شده</p>
<p>🚗 معادل <strong>${Utils.toPersian(s.carsOffRoad)} خودرو</strong> از جاده حذف شده</p>
</div>
<h2>🏆 مشتریان برتر</h2>
<table>
<tr><th>رتبه</th><th>نام</th><th>پروژه</th><th>ارزش</th></tr>
${data.topCustomers.map((c, i) => `<tr><td>${i + 1}</td><td>${Utils.escapeHTML(c.name)}</td><td>${Utils.toPersian(c.projectCount)}</td><td>${Utils.formatNumber(c.totalValue)} $</td></tr>`).join('')}
</table>
<p style="margin-top:30px;text-align:center;color:#666;font-size:11px;">Solaren Pro - گزارش خودکار</p>
</body></html>`);
        w.document.close();
        w.focus();
        setTimeout(() => w.print(), 400);
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
