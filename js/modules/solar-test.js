/**
 * تست سیستم سولر - عیب‌یابی تعاملی
 * Solar System Diagnostic Test
 */
import { Utils } from '../utils.js';
import { toast } from '../ui.js';
import { projects } from '../store.js';

const TESTS = [
    {
        id: 'inverter_power',
        category: 'hardware',
        title: 'اینورتر روشن می‌شود؟',
        question: 'آیا اینورتر روشن می‌شود؟',
        icon: '⚡',
        options: [
            { label: 'بله، نمایشگر دارد', score: 10, next: 'inverter_display' },
            { label: 'بله ولی نمایشگر خاموش', score: 5, next: 'inverter_no_display' },
            { label: 'خیر، هیچ علامتی ندارد', score: 0, next: 'inverter_no_power' }
        ]
    },
    {
        id: 'inverter_display',
        category: 'hardware',
        title: 'نمایشگر اینورتر',
        question: 'نمایشگر چه چیزی نشان می‌دهد؟',
        icon: '📊',
        options: [
            { label: 'ولتاژ و توان عادی', score: 10, next: 'pv_voltage' },
            { label: 'پیغام خطا', score: 3, next: 'error_code' },
            { label: 'صفحه خالی/تاریک', score: 1, next: 'inverter_no_display' }
        ]
    },
    {
        id: 'inverter_no_display',
        category: 'hardware',
        title: 'نمایشگر خاموش',
        question: 'اگر نمایشگر خاموش است:',
        icon: '🔌',
        options: [
            { label: 'اتصال DC برقرار است', score: 5, next: 'dc_check' },
            { label: 'فیوز DC سوخته', score: -5, next: 'dc_fuse_blown' },
            { label: 'ولتاژ باتری کمتر از ۱۰V', score: -3, next: 'battery_low' }
        ]
    },
    {
        id: 'inverter_no_power',
        category: 'hardware',
        title: 'اینورتر روشن نمی‌شود',
        question: 'اینورتر هیچ علامتی ندارد. کدام را امتحان کردید؟',
        icon: '🔋',
        options: [
            { label: 'بررسی اتصالات DC', score: 5, next: 'dc_check' },
            { label: 'بررسی فیوز', score: 0, next: 'dc_fuse_blown' },
            { label: 'هیچ کدام - نیاز به متخصص', score: 0, next: 'final' }
        ]
    },
    {
        id: 'pv_voltage',
        category: 'performance',
        title: 'ولتاژ PV',
        question: 'ولتاژ PV (ورودی) چقدر است؟',
        icon: '☀️',
        options: [
            { label: 'بالاتر از ولتاژ راه‌اندازی', score: 10, next: 'pv_current' },
            { label: 'نزدیک به صفر', score: -5, next: 'pv_no_power' },
            { label: 'کمتر از حد انتظار', score: 3, next: 'pv_low' }
        ]
    },
    {
        id: 'pv_current',
        category: 'performance',
        title: 'جریان PV',
        question: 'آیا جریان از پنل‌ها می‌آید؟',
        icon: '⚡',
        options: [
            { label: 'بله، طبق انتظار', score: 10, next: 'grid_status' },
            { label: 'خیلی کم', score: 2, next: 'shading_check' },
            { label: 'صفر', score: -5, next: 'pv_no_power' }
        ]
    },
    {
        id: 'pv_no_power',
        category: 'performance',
        title: 'PV برق تولید نمی‌کند',
        question: 'چرا PV برق تولید نمی‌کند؟',
        icon: '🌑',
        options: [
            { label: 'سایه شدید', score: 2, next: 'final' },
            { label: 'اتصال DC قطع', score: 1, next: 'final' },
            { label: 'پنل آسیب دیده', score: -3, next: 'final' }
        ]
    },
    {
        id: 'pv_low',
        category: 'performance',
        title: 'PV کم تولید می‌کند',
        question: 'تولید PV کم است. بررسی کنید:',
        icon: '📉',
        options: [
            { label: 'تمیز کردن پنل‌ها کمک کرد', score: 5, next: 'final' },
            { label: 'سایه جزئی', score: 3, next: 'final' },
            { label: 'مشکل اینورتر MPPT', score: 1, next: 'final' }
        ]
    },
    {
        id: 'shading_check',
        category: 'performance',
        title: 'بررسی سایه',
        question: 'سیستم در سایه قرار دارد؟',
        icon: '🌳',
        options: [
            { label: 'بدون سایه', score: 5, next: 'final' },
            { label: 'سایه جزئی', score: 3, next: 'final' },
            { label: 'سایه شدید', score: 0, next: 'final' }
        ]
    },
    {
        id: 'dc_fuse_blown',
        category: 'hardware',
        title: 'فیوز DC سوخته',
        question: 'فیوز DC تعویض شد؟',
        icon: '🔌',
        options: [
            { label: 'بله، حل شد', score: 10, next: 'final' },
            { label: 'بله ولی دوباره سوخت', score: -5, next: 'short_circuit' }
        ]
    },
    {
        id: 'short_circuit',
        category: 'hardware',
        title: 'اتصال کوتاه',
        question: '⚠️ اتصال کوتاه در سیستم وجود دارد. نیاز به متخصص!',
        icon: '⚠️',
        options: [
            { label: 'متخصص خبر کردم', score: 5, next: 'final' }
        ]
    },
    {
        id: 'dc_check',
        category: 'hardware',
        title: 'بررسی DC',
        question: 'ولتاژ DC چقدر است؟',
        icon: '🔋',
        options: [
            { label: 'مطابق با باتری (12/24/48V)', score: 10, next: 'final' },
            { label: 'کمتر از حد', score: 0, next: 'battery_low' },
            { label: 'صفر', score: -5, next: 'final' }
        ]
    },
    {
        id: 'battery_low',
        category: 'battery',
        title: 'باتری ضعیف',
        question: 'ولتاژ باتری پایین است:',
        icon: '🔋',
        options: [
            { label: 'سیستم دارد شارژ می‌کند', score: 5, next: 'final' },
            { label: 'شارژ نمی‌شود', score: -3, next: 'final' }
        ]
    },
    {
        id: 'error_code',
        category: 'software',
        title: 'کد خطا',
        question: 'کدام خطا را نمایش می‌دهد؟',
        icon: '❌',
        options: [
            { label: 'خطای شبکه (Grid)', score: 3, next: 'final' },
            { label: 'خطای ولتاژ بالا/پایین', score: 3, next: 'final' },
            { label: 'خطای دما/Overload', score: 2, next: 'final' }
        ]
    },
    {
        id: 'grid_status',
        category: 'grid',
        title: 'وضعیت شبکه',
        question: 'شبکه برق شهری چطور است؟',
        icon: '🏙️',
        options: [
            { label: 'پایدار', score: 10, next: 'final' },
            { label: 'نوسان دارد', score: 3, next: 'final' },
            { label: 'قطع است', score: 0, next: 'final' }
        ]
    },
    {
        id: 'final',
        category: 'final',
        title: 'پایان تست',
        question: '',
        icon: '✅',
        options: []
    }
];

const SCORE_LABELS = {
    excellent: { label: 'عالی', color: '#10b981', icon: '🎉' },
    good: { label: 'خوب', color: '#0ea5e9', icon: '👍' },
    fair: { label: 'متوسط', color: '#f59e0b', icon: '⚠️' },
    poor: { label: 'ضعیف', color: '#ef4444', icon: '🔴' }
};

export const solarTest = {
    name: 'solar-test',
    path: '#solar-test',

    state: {
        current: 'inverter_power',
        score: 0,
        answers: [],
        result: null
    },

    render() {
        if (this.state.result) {
            return this._renderResult();
        }
        return this._renderQuestion();
    },

    _renderQuestion() {
        const test = TESTS.find(t => t.id === this.state.current);
        if (!test) {
            this._finish();
            return this._renderResult();
        }
        const progress = (this.state.answers.length / 8) * 100;
        const stepNum = this.state.answers.length + 1;

        return `
            <h1 class="page-title anim-fade-up">🔧 تست سیستم سولر</h1>
            <p class="page-subtitle anim-fade-up">عیب‌یابی هوشمند - گام ${Utils.toPersian(stepNum)}</p>

            <!-- پیشرفت -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-3);padding:var(--space-3);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2);font-size:var(--font-size-sm);">
                    <span style="font-weight:600;">پیشرفت تست</span>
                    <span style="color:var(--color-text-muted);">${Utils.toPersian(Math.round(progress))}٪</span>
                </div>
                <div style="height:6px;background:var(--color-bg-soft);border-radius:var(--radius-full);overflow:hidden;">
                    <div style="height:100%;background:linear-gradient(90deg, #0ea5e9, #8b5cf6);border-radius:var(--radius-full);width:${progress}%;transition:width 0.4s;"></div>
                </div>
            </div>

            <div class="card anim-scale-in" style="padding:var(--space-5);background:linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);color:white;margin-bottom:var(--space-4);position:relative;overflow:hidden;">
                <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;text-align:center;">
                    <div style="font-size:64px;margin-bottom:var(--space-2);">${test.icon}</div>
                    <h2 style="color:white;font-size:var(--font-size-lg);font-weight:800;margin:0 0 var(--space-2);">${Utils.escapeHTML(test.title)}</h2>
                    <p style="opacity:0.9;font-size:var(--font-size-md);">${Utils.escapeHTML(test.question)}</p>
                </div>
            </div>

            <div class="stagger" style="display:flex;flex-direction:column;gap:var(--space-2);margin-bottom:var(--space-4);">
                ${test.options.map((opt, i) => `
                    <button class="card card--glass card--hover anim-fade-up" data-answer="${i}" style="padding:var(--space-3);text-align:right;cursor:pointer;border:2px solid transparent;">
                        <div style="display:flex;align-items:center;gap:var(--space-3);">
                            <div style="width:36px;height:36px;border-radius:50%;background:var(--gradient-sky);color:white;display:flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0;">${Utils.toPersian(i + 1)}</div>
                            <span style="flex:1;">${Utils.escapeHTML(opt.label)}</span>
                        </div>
                    </button>
                `).join('')}
            </div>

            <div style="display:flex;gap:var(--space-2);">
                ${this.state.answers.length > 0 ? `
                    <button class="btn btn--secondary" id="prevStep" style="flex:1;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="15 18 9 12 15 6"/></svg>
                        قبلی
                    </button>
                ` : ''}
                <button class="btn btn--secondary" id="cancelTest" style="flex:1;">انصراف</button>
            </div>
        `;
    },

    _renderResult() {
        const r = this.state.result;
        const level = r.score >= 40 ? 'excellent' : r.score >= 20 ? 'good' : r.score >= 0 ? 'fair' : 'poor';
        const levelInfo = SCORE_LABELS[level];

        return `
            <h1 class="page-title anim-fade-up">📋 نتیجه تست</h1>
            <p class="page-subtitle anim-fade-up">${this.state.answers.length} سوال پاسخ داده شد</p>

            <div class="card anim-scale-in" style="padding:var(--space-5);background:linear-gradient(135deg, ${levelInfo.color} 0%, ${levelInfo.color}dd 100%);color:white;margin-bottom:var(--space-4);position:relative;overflow:hidden;">
                <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;text-align:center;">
                    <div style="font-size:80px;margin-bottom:var(--space-2);">${levelInfo.icon}</div>
                    <h2 style="color:white;font-size:var(--font-size-2xl);font-weight:800;margin:0;">${levelInfo.label}</h2>
                    <div style="font-size:var(--font-size-4xl);font-weight:900;margin:var(--space-2) 0;">${r.score} امتیاز</div>
                    <p style="opacity:0.9;font-size:var(--font-size-sm);">${r.message}</p>
                </div>
            </div>

            <h2 class="section__title anim-fade-up">📋 مسیر تشخیص</h2>
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                ${this.state.answers.map((a, i) => `
                    <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2);${i < this.state.answers.length - 1 ? 'border-bottom:1px solid var(--color-border);' : ''}">
                        <div style="width:28px;height:28px;border-radius:50%;background:${a.score >= 5 ? 'var(--color-emerald-500)' : a.score >= 0 ? 'var(--color-amber-500)' : 'var(--color-red-500)'};color:white;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;">${Utils.toPersian(i + 1)}</div>
                        <div style="flex:1;">
                            <div style="font-size:var(--font-size-sm);">${Utils.escapeHTML(a.label)}</div>
                            <div style="font-size:10px;color:var(--color-text-dim);">${Utils.toPersian(a.score)} امتیاز</div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <h2 class="section__title anim-fade-up">💡 توصیه‌ها</h2>
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <ul style="line-height:2;padding-right:20px;">
                    ${r.recommendations.map(rec => `<li>${Utils.escapeHTML(rec)}</li>`).join('')}
                </ul>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);">
                <button class="btn btn--secondary" id="restartTest">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    تست مجدد
                </button>
                <button class="btn btn--primary" id="saveTest">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    ذخیره گزارش
                </button>
            </div>
        `;
    },

    attach() {
        if (this.state.result) {
            this._bindResult();
            return;
        }
        this._bindQuestion();
    },

    _bindQuestion() {
        document.querySelectorAll('[data-answer]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.answer);
                const test = TESTS.find(t => t.id === this.state.current);
                const opt = test.options[idx];
                this.state.answers.push({
                    ...opt,
                    testId: test.id
                });
                this.state.score += opt.score;
                if (opt.next === 'final' || !opt.next) {
                    this._finish();
                } else {
                    this.state.current = opt.next;
                }
                this._refresh();
            });
        });
        document.getElementById('prevStep')?.addEventListener('click', () => {
            if (this.state.answers.length > 0) {
                const last = this.state.answers.pop();
                this.state.score -= last.score;
                this.state.current = last.testId;
                this._refresh();
            }
        });
        document.getElementById('cancelTest')?.addEventListener('click', () => {
            if (confirm('تست لغو شود؟')) {
                this._reset();
                location.hash = '#home';
            }
        });
    },

    _bindResult() {
        document.getElementById('restartTest')?.addEventListener('click', () => {
            this._reset();
            this._refresh();
        });
        document.getElementById('saveTest')?.addEventListener('click', () => {
            // ذخیره در notes
            const noteText = `🔧 گزارش تست سیستم سولر\n\nامتیاز: ${this.state.result.score}\nوضعیت: ${this.state.result.message}\n\n${this.state.answers.map((a, i) => `${i+1}. ${a.label} (${a.score > 0 ? '+' : ''}${a.score})`).join('\n')}\n\n💡 توصیه‌ها:\n${this.state.result.recommendations.map(r => '• ' + r).join('\n')}`;
            // ساده‌سازی: ذخیره در localStorage
            try {
                const existing = JSON.parse(localStorage.getItem('solar-pwa:test-reports') || '[]');
                existing.unshift({ ...this.state.result, date: new Date().toISOString(), noteText });
                localStorage.setItem('solar-pwa:test-reports', JSON.stringify(existing.slice(0, 20)));
                toast.success('گزارش ذخیره شد');
            } catch (e) {
                toast.error('خطا در ذخیره');
            }
        });
    },

    _finish() {
        const score = this.state.score;
        let message, recommendations;
        if (score >= 40) {
            message = 'سیستم شما در وضعیت عالی قرار دارد!';
            recommendations = [
                '✅ سیستم سولر شما سالم است و عملکرد مناسبی دارد',
                '💡 نگهداری دوره‌ای منظم انجام دهید',
                '🧹 هر ۶ ماه یکبار پنل‌ها را تمیز کنید',
                '📊 عملکرد سیستم را به صورت ماهانه بررسی کنید'
            ];
        } else if (score >= 20) {
            message = 'سیستم نسبتاً سالم است ولی نیاز به بررسی دارد';
            recommendations = [
                '⚠️ چند مورد نیاز به بررسی و بهبود دارد',
                '🔍 اتصالات DC را محکم کنید',
                '☀️ سایه‌های احتمالی را بررسی کنید',
                '🔋 ولتاژ باتری را ماهانه چک کنید'
            ];
        } else if (score >= 0) {
            message = 'سیستم نیاز به تعمیر و نگهداری دارد';
            recommendations = [
                '⚠️ مشکلات متعددی شناسایی شد',
                '🔧 با یک تکنسین متخصص مشورت کنید',
                '⚡ اتصالات DC و AC را بررسی کنید',
                '📞 با پشتیبانی تماس بگیرید'
            ];
        } else {
            message = '⚠️ سیستم دچار مشکل جدی است';
            recommendations = [
                '🚨 فوراً سیستم را خاموش کنید',
                '🔧 نیاز به تکنسین متخصص',
                '⚠️ اتصال کوتاه یا خرابی سخت‌افزاری محتمل است',
                '📞 با خدمات پس از فروش تماس بگیرید'
            ];
        }
        this.state.result = { score, message, recommendations };
    },

    _reset() {
        this.state = {
            current: 'inverter_power',
            score: 0,
            answers: [],
            result: null
        };
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
