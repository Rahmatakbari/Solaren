/**
 * گزارش حرفه‌ای - Professional Report
 * گزارش PDF حرفه‌ای با نمودار و جداول
 */
import { Utils } from '../utils.js';
import { toast } from '../ui.js';
import { projects, invoices, customers, team, settings, payments } from '../store.js';

export const proReport = {
    name: 'pro-report',
    path: '#pro-report',

    state: {
        reportType: 'company',
        period: 'all' // all, month, year
    },

    REPORT_TYPES: [
        { id: 'company', name: 'گزارش شرکت', icon: '🏢', desc: 'آمار کلی کسب‌وکار' },
        { id: 'project', name: 'گزارش پروژه', icon: '📁', desc: 'جزئیات یک پروژه خاص' },
        { id: 'financial', name: 'گزارش مالی', icon: '💰', desc: 'درآمد، هزینه و سود' },
        { id: 'team', name: 'گزارش عملکرد تیم', icon: '👥', desc: 'عملکرد اعضا' },
        { id: 'customer', name: 'گزارش مشتریان', icon: '👤', desc: 'تحلیل مشتریان' }
    ],

    render() {
        return `
            <h1 class="page-title anim-fade-up">گزارش‌های حرفه‌ای</h1>
            <p class="page-subtitle anim-fade-up">تولید گزارش PDF با نمودار و جداول</p>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">نوع گزارش</h2>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));gap:var(--space-2);">
                    ${this.REPORT_TYPES.map((t) => `
                    <div class="radio-card ${this.state.reportType === t.id ? 'is-selected' : ''}" data-rtype="${t.id}" style="cursor:pointer;">
                        <input type="radio" name="rtype" value="${t.id}" ${this.state.reportType === t.id ? 'checked' : ''} hidden>
                        <div class="radio-card__icon" style="font-size:24px;">${t.icon}</div>
                        <div class="radio-card__title">${t.name}</div>
                        <div class="radio-card__subtitle">${t.desc}</div>
                    </div>
                    `).join('')}
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">پیش‌نمایش گزارش</h2>
                    <button class="btn btn--primary btn--sm" id="generateReportBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        دانلود PDF
                    </button>
                </div>
                <div id="reportPreview" style="background:white;color:#1a1a1a;border-radius:var(--radius-md);padding:var(--space-5);min-height:400px;">
                    ${this._renderReport()}
                </div>
            </div>
        `;
    },

    _renderReport() {
        switch (this.state.reportType) {
            case 'company': return this._companyReport();
            case 'project': return this._projectReport();
            case 'financial': return this._financialReport();
            case 'team': return this._teamReport();
            case 'customer': return this._customerReport();
        }
    },

    _companyReport() {
        const projs = projects.list();
        const invs = invoices.list();
        const custs = customers.list();
        const teamM = team.list();
        const totalCapacity = projs.reduce((s, p) => s + (p.actualPvKw || 0), 0);
        const totalRevenue = invs.reduce((s, i) => s + (i.total || 0), 0);
        const onGrid = projs.filter((p) => p.systemType === 'on-grid').length;
        const offGrid = projs.filter((p) => p.systemType === 'off-grid').length;
        const hybrid = projs.filter((p) => p.systemType === 'hybrid').length;

        // System type chart
        const maxSys = Math.max(onGrid, offGrid, hybrid, 1);
        const sysChart = `
            <div style="display:flex;align-items:flex-end;gap:20px;height:160px;border-bottom:2px solid #e5e7eb;padding:0 10px;margin:20px 0;">
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;">
                    <div style="background:#3b82f6;width:100%;height:${(onGrid/maxSys)*100}%;border-radius:4px 4px 0 0;display:flex;align-items:flex-end;justify-content:center;color:white;font-weight:bold;padding-bottom:8px;">${onGrid}</div>
                    <div style="margin-top:8px;font-size:12px;color:#666;">آنگرید</div>
                </div>
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;">
                    <div style="background:#f59e0b;width:100%;height:${(offGrid/maxSys)*100}%;border-radius:4px 4px 0 0;display:flex;align-items:flex-end;justify-content:center;color:white;font-weight:bold;padding-bottom:8px;">${offGrid}</div>
                    <div style="margin-top:8px;font-size:12px;color:#666;">آفگرید</div>
                </div>
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;">
                    <div style="background:#10b981;width:100%;height:${(hybrid/maxSys)*100}%;border-radius:4px 4px 0 0;display:flex;align-items:flex-end;justify-content:center;color:white;font-weight:bold;padding-bottom:8px;">${hybrid}</div>
                    <div style="margin-top:8px;font-size:12px;color:#666;">هیبرید</div>
                </div>
            </div>
        `;

        return `
            <div style="border-bottom:3px solid #f59e0b;padding-bottom:16px;margin-bottom:24px;">
                <h1 style="color:#d97706;margin:0;font-size:24px;">گزارش عملکرد شرکت</h1>
                <p style="color:#666;margin:4px 0;">Solaren Pro · تاریخ: ${Utils.formatDate(new Date())}</p>
            </div>
            <h2 style="color:#d97706;border-right:4px solid #f59e0b;padding-right:10px;">آمار کلی</h2>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0;">
                <div style="padding:12px;background:#fef3c7;border-radius:8px;text-align:center;">
                    <div style="font-size:11px;color:#92400e;">پروژه</div>
                    <div style="font-size:24px;font-weight:800;color:#d97706;">${Utils.toPersian(projs.length)}</div>
                </div>
                <div style="padding:12px;background:#dbeafe;border-radius:8px;text-align:center;">
                    <div style="font-size:11px;color:#1e40af;">ظرفیت (kW)</div>
                    <div style="font-size:24px;font-weight:800;color:#2563eb;">${Utils.formatNumber(totalCapacity, 1)}</div>
                </div>
                <div style="padding:12px;background:#d1fae5;border-radius:8px;text-align:center;">
                    <div style="font-size:11px;color:#065f46;">مشتری</div>
                    <div style="font-size:24px;font-weight:800;color:#059669;">${Utils.toPersian(custs.length)}</div>
                </div>
                <div style="padding:12px;background:#e9d5ff;border-radius:8px;text-align:center;">
                    <div style="font-size:11px;color:#6b21a8;">درآمد</div>
                    <div style="font-size:24px;font-weight:800;color:#7c3aed;">${Utils.formatNumber(Math.round(totalRevenue/1000))}K</div>
                </div>
            </div>

            <h2 style="color:#d97706;border-right:4px solid #f59e0b;padding-right:10px;">توزیع نوع سیستم</h2>
            ${sysChart}

            <h2 style="color:#d97706;border-right:4px solid #f59e0b;padding-right:10px;margin-top:24px;">آمار تیم</h2>
            <table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:12px;">
                <thead><tr style="background:#fef3c7;"><th style="padding:8px;text-align:right;">عضو</th><th style="padding:8px;text-align:right;">نقش</th><th style="padding:8px;text-align:right;">پروژه</th><th style="padding:8px;text-align:right;">انوایس</th></tr></thead>
                <tbody>
                    ${teamM.slice(0, 5).map((m) => {
                        const myP = projs.filter((p) => p.assignedTo === m.id).length;
                        const myI = invs.filter((i) => i.assignedTo === m.id).length;
                        return `<tr><td style="padding:6px;border-bottom:1px solid #e5e7eb;">${Utils.escapeHTML(m.name)}</td><td style="padding:6px;border-bottom:1px solid #e5e7eb;">${Utils.escapeHTML(m.role || '—')}</td><td style="padding:6px;border-bottom:1px solid #e5e7eb;">${Utils.toPersian(myP)}</td><td style="padding:6px;border-bottom:1px solid #e5e7eb;">${Utils.toPersian(myI)}</td></tr>`;
                    }).join('')}
                </tbody>
            </table>
        `;
    },

    _projectReport() {
        const projs = projects.list();
        if (projs.length === 0) return '<p style="text-align:center;color:#666;padding:40px;">پروژه‌ای برای نمایش وجود ندارد</p>';

        return `
            <div style="border-bottom:3px solid #f59e0b;padding-bottom:16px;margin-bottom:24px;">
                <h1 style="color:#d97706;margin:0;font-size:24px;">گزارش پروژه‌ها</h1>
                <p style="color:#666;margin:4px 0;">${Utils.toPersian(projs.length)} پروژه ثبت شده</p>
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <thead><tr style="background:#fef3c7;"><th style="padding:10px;text-align:right;">نام پروژه</th><th style="padding:10px;text-align:right;">ظرفیت</th><th style="padding:10px;text-align:right;">نوع</th><th style="padding:10px;text-align:right;">هزینه</th><th style="padding:10px;text-align:right;">تاریخ</th></tr></thead>
                <tbody>
                    ${projs.slice(0, 10).map((p) => `
                        <tr>
                            <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${Utils.escapeHTML(p.name)}</td>
                            <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${Utils.formatNumber(p.actualPvKw || 0, 1)} kW</td>
                            <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${p.systemType === 'on-grid' ? 'آنگرید' : p.systemType === 'off-grid' ? 'آفگرید' : 'هیبرید'}</td>
                            <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${Utils.formatNumber(Math.round(p.totalCost || 0))} $</td>
                            <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${Utils.formatDate(p.updatedAt)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    _financialReport() {
        const invs = invoices.list();
        const pays = payments.list();
        const totalInv = invs.reduce((s, i) => s + (i.total || 0), 0);
        const totalPaid = pays.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
        const totalPending = totalInv - totalPaid;
        const paidPercent = totalInv > 0 ? (totalPaid / totalInv * 100) : 0;

        // Pie chart for payment status
        const radius = 80;
        const cx = 120, cy = 120;
        const paidAngle = (paidPercent / 100) * Math.PI * 2;
        const paidX = cx + radius * Math.sin(paidAngle);
        const paidY = cy - radius * Math.cos(paidAngle);
        const largeArc = paidPercent > 50 ? 1 : 0;

        return `
            <div style="border-bottom:3px solid #f59e0b;padding-bottom:16px;margin-bottom:24px;">
                <h1 style="color:#d97706;margin:0;font-size:24px;">گزارش مالی</h1>
                <p style="color:#666;margin:4px 0;">دوره: ${Utils.formatDate(new Date())}</p>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                <div>
                    <h3 style="color:#d97706;">درآمد کل</h3>
                    <div style="font-size:32px;font-weight:800;color:#059669;margin:8px 0;">${Utils.formatNumber(Math.round(totalInv))} $</div>
                    <h3 style="color:#d97706;margin-top:16px;">دریافت شده</h3>
                    <div style="font-size:28px;font-weight:800;color:#2563eb;margin:8px 0;">${Utils.formatNumber(Math.round(totalPaid))} $</div>
                    <h3 style="color:#d97706;margin-top:16px;">در انتظار</h3>
                    <div style="font-size:28px;font-weight:800;color:#f59e0b;margin:8px 0;">${Utils.formatNumber(Math.round(totalPending))} $</div>
                </div>
                <div>
                    <svg viewBox="0 0 240 240" style="width:100%;max-width:240px;">
                        <circle cx="120" cy="120" r="80" fill="#fef3c7"/>
                        ${totalInv > 0 ? `<path d="M 120 40 A 80 80 0 ${largeArc} 1 ${paidX} ${paidY} L 120 120 Z" fill="#10b981"/>` : ''}
                        <text x="120" y="115" text-anchor="middle" font-size="20" font-weight="bold" fill="#1a1a1a">${Utils.formatNumber(paidPercent, 0)}%</text>
                        <text x="120" y="135" text-anchor="middle" font-size="11" fill="#666">دریافت شده</text>
                    </svg>
                </div>
            </div>
        `;
    },

    _teamReport() {
        const teamM = team.list();
        const invs = invoices.list();
        const projs = projects.list();
        return `
            <div style="border-bottom:3px solid #f59e0b;padding-bottom:16px;margin-bottom:24px;">
                <h1 style="color:#d97706;margin:0;font-size:24px;">گزارش عملکرد تیم</h1>
                <p style="color:#666;margin:4px 0;">${Utils.toPersian(teamM.length)} عضو</p>
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <thead><tr style="background:#fef3c7;"><th style="padding:10px;">نام</th><th style="padding:10px;">نقش</th><th style="padding:10px;">پروژه</th><th style="padding:10px;">فروش</th><th style="padding:10px;">ظرفیت</th></tr></thead>
                <tbody>
                    ${teamM.map((m) => {
                        const myP = projs.filter((p) => p.assignedTo === m.id);
                        const myI = invs.filter((i) => i.assignedTo === m.id);
                        const sales = myI.reduce((s, i) => s + (i.total || 0), 0);
                        const cap = myP.reduce((s, p) => s + (p.actualPvKw || 0), 0);
                        return `<tr>
                            <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:600;">${Utils.escapeHTML(m.name)}</td>
                            <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${Utils.escapeHTML(m.role || '—')}</td>
                            <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${Utils.toPersian(myP.length)}</td>
                            <td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#059669;font-weight:600;">${Utils.formatNumber(Math.round(sales))} $</td>
                            <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${Utils.formatNumber(cap, 1)} kW</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        `;
    },

    _customerReport() {
        const custs = customers.list();
        const invs = invoices.list();
        return `
            <div style="border-bottom:3px solid #f59e0b;padding-bottom:16px;margin-bottom:24px;">
                <h1 style="color:#d97706;margin:0;font-size:24px;">گزارش مشتریان</h1>
                <p style="color:#666;margin:4px 0;">${Utils.toPersian(custs.length)} مشتری</p>
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:12px;">
                <thead><tr style="background:#fef3c7;"><th style="padding:10px;">نام</th><th style="padding:10px;">تلفن</th><th style="padding:10px;">انوایس</th><th style="padding:10px;">ارزش کل</th></tr></thead>
                <tbody>
                    ${custs.slice(0, 15).map((c) => {
                        const myI = invs.filter((i) => i.customerName === c.name);
                        const val = myI.reduce((s, i) => s + (i.total || 0), 0);
                        return `<tr>
                            <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:600;">${Utils.escapeHTML(c.name)}</td>
                            <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${Utils.escapeHTML(c.phone || '—')}</td>
                            <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${Utils.toPersian(myI.length)}</td>
                            <td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#059669;font-weight:600;">${Utils.formatNumber(Math.round(val))} $</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        `;
    },

    attach() {
        document.querySelectorAll('[data-rtype]').forEach((el) => {
            el.addEventListener('click', () => {
                this.state.reportType = el.dataset.rtype;
                document.querySelectorAll('[data-rtype]').forEach((e) => e.classList.remove('is-selected'));
                el.classList.add('is-selected');
                this._refreshPreview();
            });
        });
        document.getElementById('generateReportBtn')?.addEventListener('click', () => this._generate());
    },

    _refreshPreview() {
        const preview = document.getElementById('reportPreview');
        if (preview) preview.innerHTML = this._renderReport();
    },

    _generate() {
        const reportTypes = {
            company: 'گزارش-شرکت',
            project: 'گزارش-پروژه‌ها',
            financial: 'گزارش-مالی',
            team: 'گزارش-تیم',
            customer: 'گزارش-مشتریان'
        };
        const name = reportTypes[this.state.reportType] || 'گزارش';
        const html = `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="UTF-8"><title>${name}</title>
<style>
@page { size: A4; margin: 1.5cm; }
body { font-family: 'Tahoma', sans-serif; color: #1a1a1a; line-height: 1.6; padding: 20px; }
@media print { body { padding: 0; } }
</style></head><body>${document.getElementById('reportPreview').innerHTML}
<p style="text-align:center;color:#999;font-size:11px;margin-top:40px;">Solaren Pro — ۱۴۰۵</p>
</body></html>`;
        const w = window.open('', '_blank');
        if (w) {
            w.document.write(html);
            w.document.close();
            w.focus();
            setTimeout(() => { w.print(); }, 400);
        } else {
            toast.warning('پنجره پاپ‌آپ مسدود است');
        }
    },

    _refresh() {
        const view = document.getElementById('view');
        if (view) { view.innerHTML = this.render(); this.attach(); }
    }
};
