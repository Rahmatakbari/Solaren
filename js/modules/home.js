/**
 * Home / Dashboard v6 — Ultra Premium Edition
 * داشبورد مدرن با نمودارهای تعاملی و طراحی حرفه‌ای
 */
import { Utils } from '../utils.js';
import { projects, invoices, customers } from '../store.js';
import { SolarCalc } from '../calc.js';

export const home = {
    name: 'home',
    path: '#home',

    render() {
        const allProjects = projects.list();
        const allInvoices = invoices.list();
        const allCustomers = customers.list();
        const totalCapacity = allProjects.reduce((s, p) => s + (p.actualPvKw || p.requiredPvKw || 0), 0);
        const totalValue = allProjects.reduce((s, p) => s + (p.totalCost || 0), 0);
        const totalInvoiceValue = allInvoices.reduce((s, i) => s + (i.total || 0), 0);
        const totalAnnualKWh = allProjects.reduce((s, p) => s + (p.annualKWh || 0), 0);
        const totalCO2 = totalAnnualKWh * 0.5;
        const recent = allProjects.slice(0, 3);
        const onGridCount = allProjects.filter((p) => p.systemType === 'on-grid').length;
        const offGridCount = allProjects.filter((p) => p.systemType === 'off-grid').length;
        const hybridCount = allProjects.filter((p) => p.systemType === 'hybrid').length;

        // محاسبه KPI های پیشرفته
        const avgSystemSize = allProjects.length > 0 ? totalCapacity / allProjects.length : 0;
        const treesEquivalent = Math.round(totalCO2 / 22);
        const carsOffRoad = Math.round(totalCO2 / 4.6);
        const energySavings25y = totalAnnualKWh * 25 * 0.5; // $0.5 per kWh savings

        return `
            <!-- هیرو بنر -->
            <section class="hero-banner anim-fade-up" style="margin-bottom:var(--space-5);">
                <div style="position:relative;z-index:1;">
                    <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-3);">
                        <span class="badge badge--sun" style="font-size:12px;">
                            <span class="live-dot"></span>
                            <span>سیستم فعال</span>
                        </span>
                        <span class="badge badge--success" style="font-size:12px;">v۵.۰ Pro</span>
                    </div>
                    <h1 class="page-title gradient-text-mix" style="margin-bottom:var(--space-3);font-size:var(--font-size-4xl);font-weight:900;letter-spacing:-0.5px;">به Solaren خوش آمدید</h1>
                    <p style="color:var(--color-text-muted);margin-bottom:var(--space-5);font-size:var(--font-size-md);line-height:1.7;max-width:520px;">
                        پلتفرم حرفه‌ای برآورد و طراحی سیستم‌های خورشیدی برای افغانستان و ایران.
                        محاسبه دقیق، انتخاب تجهیزات، صدور فاکتور و گزارش‌دهی همه در یک جا.
                    </p>
                    <div style="display:flex;gap:var(--space-3);flex-wrap:wrap;">
                        <a class="btn-premium" data-route="quick-estimate" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="18" height="18"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                            شروع برآورد
                        </a>
                        <a class="btn btn--secondary" data-route="reports" style="display:inline-flex;align-items:center;gap:8px;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                            گزارش‌ها
                        </a>
                        <a class="btn btn--ghost" data-route="rates" style="display:inline-flex;align-items:center;gap:8px;border:1px solid var(--color-border-strong);">
                            <span>🇦🇫</span>
                            نرخ افغانستان
                        </a>
                    </div>
                </div>
            </section>

            <!-- KPI Cards -->
            <div class="stats stagger" style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-3);margin-bottom:var(--space-5);">
                <div class="stat-card hover-lift">
                    <div class="stat-card__icon" style="background:var(--gradient-sun-soft);color:var(--color-sun-700);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                    </div>
                    <div class="stat-card__value">${Utils.formatNumber(totalCapacity, 1)} <span style="font-size:14px;color:var(--color-text-muted);font-weight:600;">kW</span></div>
                    <div class="stat-card__label">ظرفیت نصب‌شده</div>
                    <div style="margin-top:8px;font-size:11px;color:var(--color-emerald-500);font-weight:600;display:flex;align-items:center;gap:4px;">
                        <span>▲</span>
                        <span>${Utils.formatNumber(Math.round(totalAnnualKWh / 1000))} MWh سالانه</span>
                    </div>
                </div>
                <div class="stat-card hover-lift">
                    <div class="stat-card__icon" style="background:linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%);color:#1e40af;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
                    </div>
                    <div class="stat-card__value">${Utils.toPersian(allProjects.length)} <span style="font-size:14px;color:var(--color-text-muted);font-weight:600;">پروژه</span></div>
                    <div class="stat-card__label">کل پروژه‌ها</div>
                    <div style="margin-top:8px;font-size:11px;color:var(--color-text-muted);display:flex;gap:8px;flex-wrap:wrap;">
                        <span style="background:#dbeafe;padding:2px 6px;border-radius:6px;color:#1e40af;">${onGridCount} آنگرید</span>
                        <span style="background:#fef3c7;padding:2px 6px;border-radius:6px;color:#92400e;">${offGridCount} آفگرید</span>
                        <span style="background:#dcfce7;padding:2px 6px;border-radius:6px;color:#166534;">${hybridCount} هیبرید</span>
                    </div>
                </div>
                <div class="stat-card hover-lift">
                    <div class="stat-card__icon" style="background:linear-gradient(135deg, #dcfce7 0%, #86efac 100%);color:#166534;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <div class="stat-card__value">${Utils.formatNumber(Math.round(totalValue / 1000))} <span style="font-size:14px;color:var(--color-text-muted);font-weight:600;">هزار$</span></div>
                    <div class="stat-card__label">ارزش تخمینی</div>
                    ${totalInvoiceValue > 0 ? `
                    <div style="margin-top:8px;font-size:11px;color:var(--color-emerald-500);font-weight:600;">
                        ${Utils.formatNumber(Math.round(totalInvoiceValue / 1000))}K صادر شده
                    </div>` : ''}
                </div>
                <div class="stat-card hover-lift">
                    <div class="stat-card__icon" style="background:linear-gradient(135deg, #d1fae5 0%, #6ee7b7 100%);color:#065f46;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M2 22c1-2 3-3 6-3s5 1 6 3M12 22V11M12 11c0-3 2-5 5-5M9 7c0-2 1-4 3-4"/></svg>
                    </div>
                    <div class="stat-card__value">${Utils.formatNumber(Math.round(totalCO2 / 1000), 1)} <span style="font-size:14px;color:var(--color-text-muted);font-weight:600;">تن/سال</span></div>
                    <div class="stat-card__label">کاهش CO₂</div>
                    <div style="margin-top:8px;font-size:11px;color:var(--color-emerald-600);font-weight:600;display:flex;align-items:center;gap:4px;">
                        <span>🌳</span>
                        <span>${Utils.toPersian(treesEquivalent)} درخت معادل</span>
                    </div>
                </div>
            </div>

            <!-- نمودار توزیع نوع سیستم + خلاصه ماهانه -->
            ${allProjects.length > 0 ? `
            <div class="card glass hover-lift anim-fade-up" style="padding:var(--space-5);margin-bottom:var(--space-5);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4);">
                    <h2 style="font-size:var(--font-size-lg);font-weight:700;display:flex;align-items:center;gap:8px;">
                        <span style="width:32px;height:32px;border-radius:8px;background:var(--gradient-sun);display:flex;align-items:center;justify-content:center;color:white;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                        </span>
                        تحلیل عملکرد
                    </h2>
                    <a class="btn btn--ghost btn--sm" data-route="analytics">بیشتر ←</a>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
                    <!-- نمودار دایره‌ای -->
                    <div>
                        <h3 style="font-size:12px;color:var(--color-text-muted);margin-bottom:var(--space-3);text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">توزیع نوع سیستم</h3>
                        ${this._donutChart([
                            { label: 'آنگرید', value: onGridCount, color: '#0ea5e9' },
                            { label: 'آفگرید', value: offGridCount, color: '#f59e0b' },
                            { label: 'هیبرید', value: hybridCount, color: '#10b981' }
                        ])}
                    </div>
                    <!-- خلاصه عددی -->
                    <div>
                        <h3 style="font-size:12px;color:var(--color-text-muted);margin-bottom:var(--space-3);text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">شاخص‌های کلیدی</h3>
                        <div style="display:flex;flex-direction:column;gap:var(--space-2);">
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2) var(--space-3);background:var(--color-bg-soft);border-radius:var(--radius-md);">
                                <span style="font-size:13px;color:var(--color-text-muted);">میانگین ظرفیت</span>
                                <strong style="font-size:15px;">${Utils.formatNumber(avgSystemSize, 1)} kW</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2) var(--space-3);background:var(--color-bg-soft);border-radius:var(--radius-md);">
                                <span style="font-size:13px;color:var(--color-text-muted);">مشتریان فعال</span>
                                <strong style="font-size:15px;">${Utils.toPersian(allCustomers.length)}</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2) var(--space-3);background:var(--color-bg-soft);border-radius:var(--radius-md);">
                                <span style="font-size:13px;color:var(--color-text-muted);">صرفه‌جویی ۲۵ سال</span>
                                <strong style="font-size:15px;color:var(--color-emerald-500);">${Utils.formatNumber(Math.round(energySavings25y / 1000))}K $</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2) var(--space-3);background:var(--color-bg-soft);border-radius:var(--radius-md);">
                                <span style="font-size:13px;color:var(--color-text-muted);">خودرو کمتر از جاده</span>
                                <strong style="font-size:15px;color:var(--color-sky-500);">${Utils.toPersian(carsOffRoad)} 🚗</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>` : ''}

            <!-- شروع سریع -->
            <div style="margin-bottom:var(--space-5);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3);">
                    <h2 style="font-size:var(--font-size-lg);font-weight:700;display:flex;align-items:center;gap:8px;">
                        <span style="width:4px;height:20px;background:var(--gradient-sun);border-radius:2px;"></span>
                        شروع سریع
                    </h2>
                </div>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-3);">
                    <a class="hover-lift" data-route="quick-estimate" style="text-decoration:none;background:linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);border-radius:var(--radius-lg);padding:var(--space-4);display:block;border:1px solid rgba(245,158,11,0.2);">
                        <div style="width:42px;height:42px;border-radius:12px;background:var(--gradient-sun);display:flex;align-items:center;justify-content:center;color:white;margin-bottom:12px;box-shadow:var(--shadow-sun);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                        </div>
                        <h3 style="color:#92400e;font-size:15px;font-weight:700;margin-bottom:4px;">برآورد سریع</h3>
                        <p style="color:#a16207;font-size:12px;">محاسبه با مصرف ماهانه</p>
                    </a>
                    <a class="hover-lift" data-route="detailed-estimate" style="text-decoration:none;background:linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);border-radius:var(--radius-lg);padding:var(--space-4);display:block;border:1px solid rgba(14,165,233,0.2);">
                        <div style="width:42px;height:42px;border-radius:12px;background:var(--gradient-sky);display:flex;align-items:center;justify-content:center;color:white;margin-bottom:12px;box-shadow:var(--shadow-sky);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="4" y="2" width="16" height="20" rx="2"/></svg>
                        </div>
                        <h3 style="color:#1e40af;font-size:15px;font-weight:700;margin-bottom:4px;">برآورد تفصیلی</h3>
                        <p style="color:#1d4ed8;font-size:12px;">با جزئیات هر وسیله</p>
                    </a>
                    <a class="hover-lift" data-route="solar-calc" style="text-decoration:none;background:linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);border-radius:var(--radius-lg);padding:var(--space-4);display:block;border:1px solid rgba(16,185,129,0.2);">
                        <div style="width:42px;height:42px;border-radius:12px;background:var(--gradient-emerald);display:flex;align-items:center;justify-content:center;color:white;margin-bottom:12px;box-shadow:var(--shadow-emerald);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <h3 style="color:#166534;font-size:15px;font-weight:700;margin-bottom:4px;">ماشین‌حساب</h3>
                        <p style="color:#15803d;font-size:12px;">ابزارهای تخصصی</p>
                    </a>
                    <a class="hover-lift" data-route="tilt-calc" style="text-decoration:none;background:linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);border-radius:var(--radius-lg);padding:var(--space-4);display:block;border:1px solid rgba(139,92,246,0.2);">
                        <div style="width:42px;height:42px;border-radius:12px;background:var(--gradient-violet);display:flex;align-items:center;justify-content:center;color:white;margin-bottom:12px;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        </div>
                        <h3 style="color:#6b21a8;font-size:15px;font-weight:700;margin-bottom:4px;">محاسبه شیب</h3>
                        <p style="color:#7c3aed;font-size:12px;">زاویه بهینه نصب</p>
                    </a>
                </div>
            </div>

            <!-- تجهیزات -->
            <div style="margin-bottom:var(--space-5);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3);">
                    <h2 style="font-size:var(--font-size-lg);font-weight:700;display:flex;align-items:center;gap:8px;">
                        <span style="width:4px;height:20px;background:var(--gradient-sky);border-radius:2px;"></span>
                        تجهیزات
                    </h2>
                </div>
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-2);">
                    <a class="hover-lift" data-route="panels" style="text-decoration:none;background:white;border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-3);text-align:center;">
                        <div style="width:36px;height:36px;border-radius:10px;background:var(--gradient-sun-soft);display:flex;align-items:center;justify-content:center;color:var(--color-sun-700);margin:0 auto 8px;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                        </div>
                        <div style="font-size:13px;font-weight:700;">پنل‌ها</div>
                    </a>
                    <a class="hover-lift" data-route="inverters" style="text-decoration:none;background:white;border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-3);text-align:center;">
                        <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#dbeafe,#bfdbfe);display:flex;align-items:center;justify-content:center;color:#1e40af;margin:0 auto 8px;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                        </div>
                        <div style="font-size:13px;font-weight:700;">انورترها</div>
                    </a>
                    <a class="hover-lift" data-route="batteries" style="text-decoration:none;background:white;border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-3);text-align:center;">
                        <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#dcfce7,#bbf7d0);display:flex;align-items:center;justify-content:center;color:#166534;margin:0 auto 8px;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><rect x="2" y="7" width="18" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>
                        </div>
                        <div style="font-size:13px;font-weight:700;">باتری‌ها</div>
                    </a>
                    <a class="hover-lift" data-route="vfd" style="text-decoration:none;background:white;border:1px solid var(--color-border);border-radius:var(--radius-lg);padding:var(--space-3);text-align:center;">
                        <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#fce7f3,#fbcfe8);display:flex;align-items:center;justify-content:center;color:#9f1239;margin:0 auto 8px;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/></svg>
                        </div>
                        <div style="font-size:13px;font-weight:700;">VFD</div>
                    </a>
                </div>
            </div>

            <!-- ابزارهای حرفه‌ای -->
            <div style="margin-bottom:var(--space-5);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3);">
                    <h2 style="font-size:var(--font-size-lg);font-weight:700;display:flex;align-items:center;gap:8px;">
                        <span style="width:4px;height:20px;background:var(--gradient-violet);border-radius:2px;"></span>
                        ابزارهای حرفه‌ای
                    </h2>
                    <a class="btn btn--ghost btn--sm" data-route="ai-assistant">🤖 دستیار AI</a>
                </div>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-2);">
                    ${this._toolItem('شماتیک تعاملی', 'طراحی سیستم با drag & drop', 'designer', 'var(--gradient-violet)', 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7')}
                    ${this._toolItem('تحلیل سایه', 'محاسبه تأثیر موانع', 'shading', 'var(--gradient-pink)', 'M3 12h4l3-9 4 18 3-9h4')}
                    ${this._toolItem('تحلیل مالی', 'NPV، IRR، بازگشت', 'financial', 'var(--gradient-emerald)', 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6')}
                    ${this._toolItem('طراح بصری', 'چیدمان روی سقف', 'designer', 'var(--gradient-sky)', 'M3 3h18v18H3z M3 9h18 M9 21V9')}
                    ${this._toolItem('لیست تجهیزات', 'BOM کامل پروژه', 'bom', 'var(--gradient-sun)', 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11')}
                    ${this._toolItem('مقایسه تجهیزات', 'انتخاب بهترین گزینه', 'compare', 'var(--gradient-pink)', 'M16 3h5v5M8 21H3v-5M21 3l-7 7M3 21l7-7')}
                    ${this._toolItem('محاسبه کابل', 'افت ولتاژ استاندارد', 'wire-calc', 'var(--gradient-emerald)', 'M22 12h-4l-3 9L9 3l-3 9H2')}
                    ${this._toolItem('مانیتورینگ', 'پیگیری تولید', 'monitoring', 'var(--gradient-violet)', 'M22 12h-4l-3 9L9 3l-3 9H2')}
                    ${this._toolItem('تقویم پروژه', 'برنامه‌ریزی نصب', 'calendar', 'var(--gradient-sky)', 'M3 4h18v18H3z M16 2v4 M8 2v4 M3 10h18')}
                    ${this._toolItem('مدیریت تیم', 'نصاب‌ها و تکنسین‌ها', 'team', 'var(--gradient-violet)', 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z')}
                </div>
            </div>

            <!-- پروژه‌های اخیر -->
            ${recent.length > 0 ? `
            <div style="margin-bottom:var(--space-5);">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-3);">
                    <h2 style="font-size:var(--font-size-lg);font-weight:700;display:flex;align-items:center;gap:8px;">
                        <span style="width:4px;height:20px;background:var(--gradient-emerald);border-radius:2px;"></span>
                        پروژه‌های اخیر
                    </h2>
                    <a class="btn btn--ghost btn--sm" data-route="projects">مشاهده همه ←</a>
                </div>
                <div style="display:flex;flex-direction:column;gap:var(--space-3);">
                    ${recent.map((p) => this._projectItem(p)).join('')}
                </div>
            </div>` : this._emptyState()}

            <!-- نوار وضعیت سیستم -->
            <div class="card glass anim-fade-up" style="padding:var(--space-4);margin-bottom:var(--space-5);display:flex;align-items:center;gap:var(--space-3);">
                <span class="live-dot" style="flex-shrink:0;"></span>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:600;">سیستم آماده کار است</div>
                    <div style="font-size:11px;color:var(--color-text-muted);">همه داده‌ها به صورت محلی ذخیره می‌شوند · امن و سریع</div>
                </div>
                <span class="badge badge--success">آفلاین ✓</span>
            </div>
        `;
    },

    _toolItem(title, subtitle, route, gradient, pathD) {
        return `
            <a class="hover-lift list-item-compact" data-route="${route}" style="background:white;border:1px solid var(--color-border);text-decoration:none;">
                <div style="width:36px;height:36px;border-radius:10px;background:${gradient};display:flex;align-items:center;justify-content:center;color:white;flex-shrink:0;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="${pathD}"/></svg>
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:700;color:var(--color-text);">${title}</div>
                    <div style="font-size:11px;color:var(--color-text-muted);">${subtitle}</div>
                </div>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="color:var(--color-text-dim);flex-shrink:0;"><polyline points="15 18 9 12 15 6"/></svg>
            </a>
        `;
    },

    _donutChart(data) {
        const total = data.reduce((s, d) => s + d.value, 0);
        if (total === 0) {
            return `
                <div style="text-align:center;padding:var(--space-5);color:var(--color-text-dim);">
                    <div style="font-size:48px;opacity:0.3;">📊</div>
                    <div style="font-size:12px;margin-top:8px;">هنوز داده‌ای نیست</div>
                </div>
            `;
        }

        let cumulative = 0;
        const size = 140;
        const radius = 56;
        const innerRadius = 36;
        const center = size / 2;
        const segments = data.filter(d => d.value > 0).map(d => {
            const percent = d.value / total;
            const angle = percent * 360;
            const startAngle = cumulative * 360 - 90;
            const endAngle = (cumulative + percent) * 360 - 90;
            cumulative += percent;

            const start = this._polarToCartesian(center, center, radius, endAngle);
            const end = this._polarToCartesian(center, center, radius, startAngle);
            const startInner = this._polarToCartesian(center, center, innerRadius, endAngle);
            const endInner = this._polarToCartesian(center, center, innerRadius, startAngle);
            const largeArc = angle > 180 ? 1 : 0;

            return {
                d: `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y} L ${endInner.x} ${endInner.y} A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${startInner.x} ${startInner.y} Z`,
                color: d.color,
                label: d.label,
                value: d.value,
                percent: Math.round(percent * 100)
            };
        });

        return `
            <div style="display:flex;align-items:center;gap:var(--space-3);">
                <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="flex-shrink:0;">
                    ${segments.map(s => `<path d="${s.d}" fill="${s.color}" style="transition:opacity 0.2s;"/>`).join('')}
                    <text x="${center}" y="${center - 4}" text-anchor="middle" font-size="20" font-weight="800" fill="#0f172a">${Utils.toPersian(total)}</text>
                    <text x="${center}" y="${center + 14}" text-anchor="middle" font-size="10" fill="#64748b">پروژه</text>
                </svg>
                <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
                    ${data.map(d => `
                        <div style="display:flex;align-items:center;gap:6px;font-size:12px;">
                            <span style="width:10px;height:10px;border-radius:50%;background:${d.color};flex-shrink:0;"></span>
                            <span style="flex:1;">${d.label}</span>
                            <strong>${Utils.toPersian(d.value)}</strong>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    _polarToCartesian(cx, cy, r, angleDeg) {
        const angleRad = (angleDeg - 90) * Math.PI / 180;
        return {
            x: cx + r * Math.cos(angleRad),
            y: cy + r * Math.sin(angleRad)
        };
    },

    _emptyState() {
        return `
            <div class="card glass anim-fade-up" style="text-align:center;padding:var(--space-8);">
                <div style="width:96px;height:96px;margin:0 auto var(--space-4);border-radius:var(--radius-2xl);background:var(--gradient-sun-soft);display:flex;align-items:center;justify-content:center;color:var(--color-sun-600);box-shadow:var(--shadow-sun);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                </div>
                <h3 style="font-size:var(--font-size-xl);font-weight:700;margin-bottom:var(--space-2);">هنوز پروژه‌ای ندارید</h3>
                <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);margin-bottom:var(--space-5);line-height:1.7;max-width:280px;margin-left:auto;margin-right:auto;">اولین پروژه سولر خود را در چند دقیقه ایجاد کنید</p>
                <a class="btn-premium" data-route="quick-estimate" style="display:inline-flex;align-items:center;gap:8px;text-decoration:none;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="18" height="18"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    شروع اولین برآورد
                </a>
            </div>
        `;
    },

    _projectItem(p) {
        const systemTypeLabel = p.systemType === 'on-grid' ? 'آنگرید' : p.systemType === 'off-grid' ? 'آفگرید' : 'هیبرید';
        const chipClass = p.systemType === 'off-grid' ? 'danger' : p.systemType === 'hybrid' ? 'emerald' : 'sun';
        return `
            <a class="card glass hover-lift" data-route="invoices" data-project="${p.id}" style="cursor:pointer;text-decoration:none;color:inherit;display:block;">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-3);margin-bottom:var(--space-3);">
                    <div style="min-width:0;flex:1;">
                        <h3 style="font-size:var(--font-size-md);font-weight:700;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${Utils.escapeHTML(p.name)}</h3>
                        <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);display:flex;align-items:center;gap:var(--space-2);">
                            <span>${Utils.formatDate(p.updatedAt)}</span>
                            <span style="opacity:0.5;">·</span>
                            <span>${p.type === 'quick' ? 'سریع' : 'تفصیلی'}</span>
                        </p>
                    </div>
                    <span class="badge badge--${chipClass === 'danger' ? 'danger' : chipClass === 'emerald' ? 'success' : 'sun'}">${systemTypeLabel}</span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2);">
                    <div style="text-align:center;padding:var(--space-2);background:linear-gradient(135deg, #fef3c7, #fde68a);border-radius:var(--radius-md);">
                        <div style="font-size:10px;color:#92400e;text-transform:uppercase;letter-spacing:0.5px;">ظرفیت</div>
                        <div style="font-weight:800;color:#b45309;font-size:var(--font-size-md);">${Utils.formatNumber(p.actualPvKw || p.requiredPvKw || 0, 1)}</div>
                        <div style="font-size:10px;color:#92400e;">kW</div>
                    </div>
                    <div style="text-align:center;padding:var(--space-2);background:linear-gradient(135deg, #dbeafe, #bfdbfe);border-radius:var(--radius-md);">
                        <div style="font-size:10px;color:#1e40af;text-transform:uppercase;letter-spacing:0.5px;">پنل</div>
                        <div style="font-weight:800;color:#1e40af;font-size:var(--font-size-md);">${Utils.toPersian(p.numPanels || 0)}</div>
                        <div style="font-size:10px;color:#1e40af;">عدد</div>
                    </div>
                    <div style="text-align:center;padding:var(--space-2);background:linear-gradient(135deg, #dcfce7, #bbf7d0);border-radius:var(--radius-md);">
                        <div style="font-size:10px;color:#166534;text-transform:uppercase;letter-spacing:0.5px;">هزینه</div>
                        <div style="font-weight:800;color:#166534;font-size:var(--font-size-md);">${Utils.formatNumber(Math.round(p.totalCost || 0))}</div>
                        <div style="font-size:10px;color:#166534;">$</div>
                    </div>
                </div>
            </a>
        `;
    },

    attach() {
        document.querySelectorAll('[data-route]').forEach((el) => {
            el.addEventListener('click', (e) => {
                const route = el.getAttribute('data-route');
                if (!route) return;
                e.preventDefault();
                if (el.dataset.project) {
                    sessionStorage.setItem('selectedProject', el.dataset.project);
                }
                location.hash = '#' + route;
            });
        });
    }
};
