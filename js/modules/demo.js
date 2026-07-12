/**
 * حالت دمو - Demo Mode
 */
import { Utils } from '../utils.js';
import { toast, modal } from '../ui.js';
import { loadDemoData } from '../data/demo-data.js';

const STORAGE_KEY = 'solar-pwa:demo-mode';

export function isDemoMode() {
    return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function setDemoMode(enabled) {
    if (enabled) {
        localStorage.setItem(STORAGE_KEY, 'true');
    } else {
        localStorage.removeItem(STORAGE_KEY);
    }
}

export const demo = {
    name: 'demo',
    path: '#demo',

    render() {
        const enabled = isDemoMode();
        return `
            <h1 class="page-title anim-fade-up">🎮 حالت دمو</h1>
            <p class="page-subtitle anim-fade-up">تست اپ با داده‌های نمونه</p>

            <div class="card anim-fade-up" style="background:linear-gradient(135deg, #8b5cf6 0%, #4f46e5 100%);color:white;padding:var(--space-5);margin-bottom:var(--space-4);position:relative;overflow:hidden;">
                <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;text-align:center;">
                    <div style="font-size:64px;margin-bottom:var(--space-3);">${enabled ? '✅' : '🎮'}</div>
                    <h2 style="color:white;font-size:var(--font-size-lg);font-weight:800;margin:0;">${enabled ? 'فعال' : 'غیرفعال'}</h2>
                    <p style="opacity:0.9;font-size:var(--font-size-sm);margin-top:var(--space-2);">${enabled ? 'شما در حال مشاهده داده‌های نمونه هستید' : 'با داده‌های نمونه اپ را امتحان کنید'}</p>
                </div>
            </div>

            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <h3 style="font-size:var(--font-size-md);margin-bottom:var(--space-3);">📦 داده‌های نمونه شامل:</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);">
                    <div style="padding:var(--space-2);background:var(--color-bg-soft);border-radius:var(--radius-sm);">
                        <div style="font-size:10px;color:var(--color-text-muted);">پروژه‌ها</div>
                        <div style="font-weight:800;font-size:var(--font-size-lg);color:var(--color-sun-300);">۳</div>
                    </div>
                    <div style="padding:var(--space-2);background:var(--color-bg-soft);border-radius:var(--radius-sm);">
                        <div style="font-size:10px;color:var(--color-text-muted);">مشتریان</div>
                        <div style="font-weight:800;font-size:var(--font-size-lg);color:var(--color-emerald-400);">۳</div>
                    </div>
                    <div style="padding:var(--space-2);background:var(--color-bg-soft);border-radius:var(--radius-sm);">
                        <div style="font-size:10px;color:var(--color-text-muted);">فاکتورها</div>
                        <div style="font-weight:800;font-size:var(--font-size-lg);color:var(--color-sky-300);">۲</div>
                    </div>
                    <div style="padding:var(--space-2);background:var(--color-bg-soft);border-radius:var(--radius-sm);">
                        <div style="font-size:10px;color:var(--color-text-muted);">وظایف</div>
                        <div style="font-weight:800;font-size:var(--font-size-lg);color:var(--color-violet-400);">۲</div>
                    </div>
                </div>
            </div>

            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <h3 style="font-size:var(--font-size-md);margin-bottom:var(--space-3);">💡 سناریوهای نمونه:</h3>
                <ul style="line-height:2;padding-right:20px;font-size:var(--font-size-sm);">
                    <li><strong>🏠 خانه آقای احمدی</strong> - ۵kW هیبرید تک‌فاز، کابل</li>
                    <li><strong>🏪 مغازه طلا فروشی</strong> - ۱۰kW آنگرید سه‌فاز، هرات</li>
                    <li><strong>🏘️ ویلا</strong> - ۱۵kW هیبرید سه‌فاز، مزار شریف</li>
                </ul>
            </div>

            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <h3 style="font-size:var(--font-size-md);margin-bottom:var(--space-3);">⚙️ اقدامات</h3>
                <div style="display:flex;flex-direction:column;gap:var(--space-2);">
                    ${!enabled ? `
                        <button class="btn btn--primary btn--block" id="enableDemo">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                            فعال‌سازی دمو
                        </button>
                    ` : `
                        <button class="btn btn--secondary btn--block" id="reloadDemo">
                            🔄 بارگذاری مجدد داده‌های دمو
                        </button>
                        <button class="btn btn--secondary btn--block" id="disableDemo">
                            ❌ خروج از حالت دمو
                        </button>
                    `}
                </div>
            </div>
        `;
    },

    attach() {
        document.getElementById('enableDemo')?.addEventListener('click', () => {
            if (confirm('داده‌های فعلی با نمونه جایگزین می‌شود. ادامه؟')) {
                loadDemoData();
                setDemoMode(true);
                toast.success('حالت دمو فعال شد');
                setTimeout(() => location.reload(), 800);
            }
        });
        document.getElementById('reloadDemo')?.addEventListener('click', () => {
            if (confirm('داده‌های دمو مجدد بارگذاری شود؟')) {
                loadDemoData();
                toast.success('داده‌ها بارگذاری شد');
                setTimeout(() => location.reload(), 800);
            }
        });
        document.getElementById('disableDemo')?.addEventListener('click', () => {
            if (confirm('حالت دمو غیرفعال و تمام داده‌ها پاک شود؟')) {
                // پاک کردن همه چیز
                Object.keys(localStorage).forEach(k => {
                    if (k.startsWith('solar-pwa:')) localStorage.removeItem(k);
                });
                setDemoMode(false);
                toast.success('خارج شدید');
                setTimeout(() => location.reload(), 800);
            }
        });
    }
};
