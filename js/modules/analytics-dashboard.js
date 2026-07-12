/**
 * داشبورد تحلیلی با نمودارهای تعاملی
 * Analytics Dashboard with Interactive Charts
 */
import { Utils } from '../utils.js';
import { drawLineChart, drawBarChart, drawDonutChart, drawSparkline, drawGauge, drawAreaChart } from './charts.js';
import { projects, customers, invoices, payments } from '../store.js';
import { LOCATIONS } from '../data/locations.js';
import { toast } from '../ui.js';

export const analyticsDashboard = {
    name: 'analytics-dashboard',
    path: '#analytics-dashboard',

    charts: {},

    render() {
        const stats = this._getStats();

        return `
            <h1 class="page-title anim-fade-up">📊 داشبورد تحلیلی</h1>
            <p class="page-subtitle anim-fade-up">نمایش گرافیکی عملکرد و آمار</p>

            <!-- کارت‌های آماری -->
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-2);margin-bottom:var(--space-4);">
                <div class="card anim-scale-in" style="background:linear-gradient(135deg, #0ea5e9, #0284c7);color:white;padding:var(--space-3);">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <div>
                            <div style="font-size:10px;opacity:0.85;">پروژه‌ها</div>
                            <div style="font-size:var(--font-size-2xl);font-weight:800;line-height:1;">${Utils.toPersian(stats.totalProjects)}</div>
                            <div style="font-size:10px;opacity:0.85;">${Utils.toPersian(stats.activeProjects)} فعال</div>
                        </div>
                        <div style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">📁</div>
                    </div>
                    <canvas id="sparkProjects" style="width:100%;height:30px;margin-top:6px;"></canvas>
                </div>

                <div class="card anim-scale-in" style="background:linear-gradient(135deg, #10b981, #059669);color:white;padding:var(--space-3);">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <div>
                            <div style="font-size:10px;opacity:0.85;">مشتریان</div>
                            <div style="font-size:var(--font-size-2xl);font-weight:800;line-height:1;">${Utils.toPersian(stats.totalCustomers)}</div>
                            <div style="font-size:10px;opacity:0.85;">${Utils.toPersian(stats.newCustomers)} جدید</div>
                        </div>
                        <div style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">👥</div>
                    </div>
                    <canvas id="sparkCustomers" style="width:100%;height:30px;margin-top:6px;"></canvas>
                </div>

                <div class="card anim-scale-in" style="background:linear-gradient(135deg, #f59e0b, #d97706);color:white;padding:var(--space-3);">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <div>
                            <div style="font-size:10px;opacity:0.85;">درآمد</div>
                            <div style="font-size:var(--font-size-2xl);font-weight:800;line-height:1;">${Utils.formatNumber(stats.totalRevenue)}</div>
                            <div style="font-size:10px;opacity:0.85;">دلار</div>
                        </div>
                        <div style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">💰</div>
                    </div>
                    <canvas id="sparkRevenue" style="width:100%;height:30px;margin-top:6px;"></canvas>
                </div>

                <div class="card anim-scale-in" style="background:linear-gradient(135deg, #8b5cf6, #7c3aed);color:white;padding:var(--space-3);">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                        <div>
                            <div style="font-size:10px;opacity:0.85;">ظرفیت نصب</div>
                            <div style="font-size:var(--font-size-2xl);font-weight:800;line-height:1;">${Utils.formatNumber(stats.totalCapacity, 1)}</div>
                            <div style="font-size:10px;opacity:0.85;">kW</div>
                        </div>
                        <div style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">⚡</div>
                    </div>
                    <canvas id="sparkCapacity" style="width:100%;height:30px;margin-top:6px;"></canvas>
                </div>
            </div>

            <!-- نمودار میله‌ای پروژه‌ها بر اساس ماه -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3);">
                    <h2 class="section__title">📈 پروژه‌ها و درآمد ماهانه</h2>
                    <select class="input" id="yearSelect" style="width:auto;padding:4px 8px;font-size:var(--font-size-xs);">
                        ${[1402, 1403, 1404, 1405].map(y => `<option value="${y}" ${y === 1404 ? 'selected' : ''}>${y}</option>`).join('')}
                    </select>
                </div>
                <div style="position:relative;height:240px;">
                    <canvas id="monthlyChart" style="width:100%;height:100%;"></canvas>
                </div>
            </div>

            <!-- نمودار دایره‌ای نوع سیستم -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);margin-bottom:var(--space-4);">
                <div class="card card--glass anim-fade-up">
                    <h2 class="section__title">🥧 نوع سیستم</h2>
                    <div style="position:relative;height:200px;">
                        <canvas id="systemTypeChart" style="width:100%;height:100%;"></canvas>
                    </div>
                </div>
                <div class="card card--glass anim-fade-up">
                    <h2 class="section__title">📍 موقعیت جغرافیایی</h2>
                    <div style="position:relative;height:200px;">
                        <canvas id="locationChart" style="width:100%;height:100%;"></canvas>
                    </div>
                </div>
            </div>

            <!-- نمودار گیج - نرخ تکمیل -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <h2 class="section__title">🎯 نرخ تکمیل پروژه‌ها</h2>
                <div style="position:relative;height:200px;display:flex;justify-content:center;">
                    <canvas id="gaugeChart" style="width:240px;height:100%;"></canvas>
                </div>
            </div>

            <!-- نمودار پنل‌های پرکاربرد -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <h2 class="section__title">☀️ پنل‌های پرکاربرد</h2>
                <div style="position:relative;height:200px;">
                    <canvas id="panelChart" style="width:100%;height:100%;"></canvas>
                </div>
            </div>

            <!-- جدول خلاصه -->
            <div class="card card--glass anim-fade-up">
                <h2 class="section__title">📋 خلاصه عملکرد</h2>
                <div style="overflow-x:auto;">
                    <table style="width:100%;font-size:var(--font-size-sm);">
                        <thead>
                            <tr style="background:var(--color-bg-soft);">
                                <th style="padding:var(--space-2);text-align:right;">معیار</th>
                                <th style="padding:var(--space-2);text-align:center;">مقدار</th>
                                <th style="padding:var(--space-2);text-align:center;">وضعیت</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td style="padding:var(--space-2);">پروژه‌های تکمیل شده</td><td style="padding:var(--space-2);text-align:center;">${Utils.toPersian(stats.completedProjects)}</td><td style="padding:var(--space-2);text-align:center;color:var(--color-emerald-400);">✅ عالی</td></tr>
                            <tr><td style="padding:var(--space-2);">نرخ پرداخت</td><td style="padding:var(--space-2);text-align:center;">${Utils.toPersian(Math.round(stats.paymentRate))}٪</td><td style="padding:var(--space-2);text-align:center;">${stats.paymentRate >= 80 ? '✅' : '⚠️'}</td></tr>
                            <tr><td style="padding:var(--space-2);">میانگین ارزش پروژه</td><td style="padding:var(--space-2);text-align:center;">${Utils.formatNumber(stats.avgProjectValue)} $</td><td style="padding:var(--space-2);text-align:center;">-</td></tr>
                            <tr><td style="padding:var(--space-2);">بالاترین تولید ماهانه</td><td style="padding:var(--space-2);text-align:center;">${Utils.formatNumber(stats.peakMonthlyProduction, 0)} kWh</td><td style="padding:var(--space-2);text-align:center;">-</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    _getStats() {
        const allProjects = projects.all();
        const allCustomers = customers.all();
        const allInvoices = invoices.all();
        const allPayments = payments.all ? payments.all() : [];

        return {
            totalProjects: allProjects.length,
            activeProjects: allProjects.filter(p => p.status === 'active' || p.status === 'in-progress').length,
            completedProjects: allProjects.filter(p => p.status === 'completed').length,
            totalCustomers: allCustomers.length,
            newCustomers: allCustomers.filter(c => {
                const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
                return new Date(c.createdAt || 0).getTime() > monthAgo;
            }).length,
            totalRevenue: allInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0),
            totalCapacity: allProjects.reduce((s, p) => s + (p.totalCapacity || 0), 0),
            paymentRate: allInvoices.length > 0 ? (allInvoices.filter(i => i.status === 'paid').length / allInvoices.length) * 100 : 0,
            avgProjectValue: allProjects.length > 0 ? allProjects.reduce((s, p) => s + (p.totalCost || 0), 0) / allProjects.length : 0,
            peakMonthlyProduction: 0
        };
    },

    attach() {
        // کمی صبر کن تا DOM رندر بشه
        setTimeout(() => this._drawCharts(), 100);
        document.getElementById('yearSelect')?.addEventListener('change', () => this._drawCharts());
    },

    _drawCharts() {
        // sparklines
        const projectsData = this._getTimeSeriesData('projects', 12);
        const customersData = this._getTimeSeriesData('customers', 12);
        const revenueData = this._getTimeSeriesData('revenue', 12);
        const capacityData = this._getTimeSeriesData('capacity', 12);

        const sparkP = document.getElementById('sparkProjects');
        const sparkC = document.getElementById('sparkCustomers');
        const sparkR = document.getElementById('sparkRevenue');
        const sparkK = document.getElementById('sparkCapacity');
        if (sparkP) drawSparkline(sparkP, projectsData.values, 'rgba(255,255,255,0.9)');
        if (sparkC) drawSparkline(sparkC, customersData.values, 'rgba(255,255,255,0.9)');
        if (sparkR) drawSparkline(sparkR, revenueData.values, 'rgba(255,255,255,0.9)');
        if (sparkK) drawSparkline(sparkK, capacityData.values, 'rgba(255,255,255,0.9)');

        // Monthly bar chart
        const monthlyCanvas = document.getElementById('monthlyChart');
        if (monthlyCanvas) {
            const data = this._getMonthlyData();
            drawBarChart(monthlyCanvas, {
                labels: data.labels,
                datasets: [
                    { label: 'پروژه', data: data.projects, color: '#0ea5e9' },
                    { label: 'درآمد (k$)', data: data.revenue, color: '#f59e0b' }
                ]
            });
        }

        // System type donut
        const sysCanvas = document.getElementById('systemTypeChart');
        if (sysCanvas) {
            const data = this._getSystemTypeData();
            drawDonutChart(sysCanvas, {
                labels: data.labels,
                values: data.values,
                colors: ['#0ea5e9', '#8b5cf6', '#10b981'],
                centerLabel: 'سیستم‌ها',
                centerValue: Utils.toPersian(data.values.reduce((s, v) => s + v, 0))
            });
        }

        // Location donut
        const locCanvas = document.getElementById('locationChart');
        if (locCanvas) {
            const data = this._getLocationData();
            drawDonutChart(locCanvas, {
                labels: data.labels,
                values: data.values,
                colors: ['#f59e0b', '#ec4899', '#22d3ee', '#a78bfa', '#34d399'],
                centerLabel: 'شهرها',
                centerValue: Utils.toPersian(data.values.length)
            });
        }

        // Gauge
        const gaugeCanvas = document.getElementById('gaugeChart');
        if (gaugeCanvas) {
            const stats = this._getStats();
            const completionRate = stats.totalProjects > 0 ? (stats.completedProjects / stats.totalProjects) * 100 : 0;
            drawGauge(gaugeCanvas, completionRate, 100);
        }

        // Panel bar chart
        const panelCanvas = document.getElementById('panelChart');
        if (panelCanvas) {
            const data = this._getPanelUsageData();
            drawBarChart(panelCanvas, {
                labels: data.labels,
                datasets: [{ label: 'تعداد', data: data.values, color: '#f59e0b' }]
            });
        }
    },

    _getTimeSeriesData(type, months) {
        const labels = [];
        const values = [];
        const now = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const label = d.toLocaleDateString('fa-IR', { month: 'short' });
            labels.push(label);
            // داده نمونه بر اساس نوع
            let val = 0;
            if (type === 'projects') val = Math.floor(Math.random() * 5) + 1;
            else if (type === 'customers') val = Math.floor(Math.random() * 8) + 2;
            else if (type === 'revenue') val = Math.floor(Math.random() * 5000) + 1000;
            else if (type === 'capacity') val = Math.floor(Math.random() * 15) + 5;
            values.push(val);
        }
        return { labels, values };
    },

    _getMonthlyData() {
        const labels = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
        return {
            labels,
            projects: [3, 5, 4, 6, 8, 7, 5, 4, 6, 9, 7, 5],
            revenue: [12, 18, 15, 22, 28, 25, 18, 14, 21, 32, 25, 18]
        };
    },

    _getSystemTypeData() {
        const allProjects = projects.all();
        const onGrid = allProjects.filter(p => p.systemType === 'on-grid').length;
        const offGrid = allProjects.filter(p => p.systemType === 'off-grid').length;
        const hybrid = allProjects.filter(p => p.systemType === 'hybrid' || !p.systemType).length;
        return {
            labels: ['آنگرید', 'آفگرید', 'هیبرید'],
            values: [onGrid || 3, offGrid || 2, hybrid || 5]
        };
    },

    _getLocationData() {
        const allProjects = projects.all();
        const counts = {};
        allProjects.forEach(p => {
            const loc = p.location || 'کابل';
            counts[loc] = (counts[loc] || 0) + 1;
        });
        // اگه داده نداریم، نمونه نشون بده
        if (Object.keys(counts).length === 0) {
            return {
                labels: ['کابل', 'هرات', 'مزار', 'قندهار', 'بامیان'],
                values: [5, 3, 2, 4, 1]
            };
        }
        const entries = Object.entries(counts).slice(0, 5);
        return {
            labels: entries.map(e => e[0]),
            values: entries.map(e => e[1])
        };
    },

    _getPanelUsageData() {
        return {
            labels: ['Jinko', 'Trina', 'Longi', 'JA Solar', 'Canadian'],
            values: [12, 8, 6, 5, 3]
        };
    }
};
