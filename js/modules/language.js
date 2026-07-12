/**
 * Language Switcher
 * سوئیچر زبان
 */
import { settings } from '../store.js';
import { SUPPORTED_LANGUAGES, t } from '../data/translations.js';

export const language = {
    name: 'language',
    path: '#language',

    render() {
        const current = settings.get('language', 'fa');
        return `
            <h1 class="page-title anim-fade-up">انتخاب زبان / ژبې انتخاب / Language</h1>
            <p class="page-subtitle anim-fade-up">زبان رابط کاربری را تغییر دهید</p>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--violet">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    </div>
                    <div>
                        <div class="card__title">زبان فعلی: ${SUPPORTED_LANGUAGES.find((l) => l.id === current)?.name || 'فارسی'}</div>
                        <div class="card__subtitle">انتخاب زبان برنامه</div>
                    </div>
                </div>

                <div class="list stagger">
                    ${SUPPORTED_LANGUAGES.map((lang) => `
                    <div class="list-item ${current === lang.id ? 'result--selected' : ''}" data-lang="${lang.id}" style="cursor:pointer;">
                        <div class="list-item__icon" style="background:linear-gradient(135deg, var(--color-sun-500), var(--color-sun-300));font-size:24px;width:48px;height:48px;">${lang.flag}</div>
                        <div class="list-item__body">
                            <div class="list-item__title">${lang.name}</div>
                            <div class="list-item__subtitle">${lang.id === 'fa' ? 'زبان رسمی - راست به چپ' : lang.id === 'ps' ? 'زبان پشتو - راست به چپ' : 'English - Left to Right'}</div>
                        </div>
                        <div class="list-item__action">
                            ${current === lang.id ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" width="24" height="24" style="color:var(--color-emerald-400);"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">نمونه ترجمه</h2>
                </div>
                <div style="display:grid;gap:var(--space-3);">
                    ${['nav.home', 'nav.estimate', 'nav.financial', 'app.title', 'app.subtitle'].map((key) => `
                    <div class="list-item" style="cursor:default;display:grid;grid-template-columns:120px 1fr;align-items:center;">
                        <code style="background:var(--color-bg-soft);padding:var(--space-1) var(--space-2);border-radius:var(--radius-sm);font-size:var(--font-size-xs);">${key}</code>
                        <div style="display:flex;gap:var(--space-3);font-size:var(--font-size-sm);flex-wrap:wrap;">
                            <span style="color:var(--color-sun-300);">${t(key, 'fa')}</span>
                            <span style="color:var(--color-text-dim);">|</span>
                            <span style="color:var(--color-sky-300);">${t(key, 'ps')}</span>
                            <span style="color:var(--color-text-dim);">|</span>
                            <span style="color:var(--color-emerald-400);">${t(key, 'en')}</span>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>

            <div class="card card--sky anim-fade-up" style="padding:var(--space-4);color:white;">
                <h3 style="color:white;margin-bottom:var(--space-2);">ℹ️ اطلاعات</h3>
                <p style="opacity:0.9;line-height:1.7;font-size:var(--font-size-sm);">
                    ترجمه‌ها توسط جامعه کاربری بهبود می‌یابند. اگر مایل به کمک در ترجمه هستید، با ما تماس بگیرید.
                </p>
            </div>
        `;
    },

    attach() {
        document.querySelectorAll('[data-lang]').forEach((el) => {
            el.addEventListener('click', () => {
                const lang = el.dataset.lang;
                settings.set('language', lang);
                document.documentElement.lang = lang;
                document.documentElement.dir = (lang === 'en') ? 'ltr' : 'rtl';
                window.location.reload();
            });
        });
    }
};
