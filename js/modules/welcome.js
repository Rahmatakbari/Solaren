/**
 * Welcome / Onboarding module — shown on first run
 */
import { Utils } from '../utils.js';
import { settings } from '../store.js';

export const welcome = {
    name: 'welcome',
    path: '#welcome',

    render() {
        return `
            <div style="text-align:center;padding:var(--space-7) var(--space-4);">
                <div class="anim-fade-up" style="width:120px;height:120px;margin:0 auto var(--space-5);border-radius:var(--radius-3xl);background:var(--gradient-sun);display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-sun-lg);">
                    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" style="width:64px;height:64px;">
                        <g stroke="white" stroke-width="3" stroke-linecap="round" fill="none">
                            <line x1="40" y1="10" x2="40" y2="20"/>
                            <line x1="40" y1="60" x2="40" y2="70"/>
                            <line x1="10" y1="40" x2="20" y2="40"/>
                            <line x1="60" y1="40" x2="70" y2="40"/>
                            <line x1="18" y1="18" x2="25" y2="25"/>
                            <line x1="55" y1="55" x2="62" y2="62"/>
                            <line x1="18" y1="62" x2="25" y2="55"/>
                            <line x1="55" y1="25" x2="62" y2="18"/>
                        </g>
                        <circle cx="40" cy="40" r="20" fill="white" fill-opacity="0.95"/>
                    </svg>
                </div>
                <h1 class="page-title anim-fade-up" style="font-size:var(--font-size-4xl);">به Solaren Pro خوش آمدید</h1>
                <p class="page-subtitle anim-fade-up" style="font-size:var(--font-size-lg);">نرم‌افزار حرفه‌ای محاسبات سولر با الگوریتم‌های استاندارد صنعتی</p>

                <div class="card card--glass anim-fade-up" style="text-align:right;margin-top:var(--space-6);max-width:480px;margin-left:auto;margin-right:auto;">
                    <h3 style="font-size:var(--font-size-md);font-weight:700;margin-bottom:var(--space-3);display:flex;align-items:center;gap:var(--space-2);">
                        <span style="width:28px;height:28px;border-radius:var(--radius-sm);background:var(--gradient-sun);display:inline-flex;align-items:center;justify-content:center;">🚀</span>
                        شروع سریع
                    </h3>
                    <ol style="padding-right:var(--space-5);line-height:2.2;color:var(--color-text-muted);font-size:var(--font-size-sm);">
                        <li><strong style="color:var(--color-text);">برآورد سریع</strong> — در ۳۰ ثانیه با مصرف ماهانه برق</li>
                        <li><strong style="color:var(--color-text);">برآورد تفصیلی</strong> — با جزئیات هر وسیله</li>
                        <li><strong style="color:var(--color-text);">انتخاب تجهیزات</strong> — پنل، انورتر، باتری، VFD</li>
                        <li><strong style="color:var(--color-text);">صدور انوایس</strong> — حرفه‌ای و قابل چاپ</li>
                    </ol>
                </div>

                <div class="anim-fade-up" style="display:flex;flex-direction:column;gap:var(--space-3);margin-top:var(--space-6);max-width:480px;margin-left:auto;margin-right:auto;">
                    <a class="btn btn--primary btn--lg btn--block" data-route="quick-estimate">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                        شروع اولین برآورد
                    </a>
                    <a class="btn btn--secondary btn--block" data-route="home">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                        رفتن به داشبورد
                    </a>
                    <button class="btn btn--ghost btn--block" data-action="skip" style="font-size:var(--font-size-sm);">
                        دیگر نمایش داده نشود
                    </button>
                </div>
            </div>
        `;
    },

    attach() {
        document.querySelectorAll('[data-route]').forEach((el) => {
            el.addEventListener('click', () => location.hash = '#' + el.dataset.route);
        });
        document.querySelector('[data-action="skip"]')?.addEventListener('click', () => {
            settings.set('welcomeShown', true);
            location.hash = '#home';
        });
    }
};
