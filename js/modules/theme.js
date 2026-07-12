/**
 * مدیریت تم - فقط روشن
 * Theme Manager - Light Only
 */

const STORAGE_KEY = 'solar-pwa:theme';

export const theme = {
    name: 'theme',
    current: 'light', // فقط روشن

    init() {
        // همیشه تم روشن
        this.setTheme('light');

        // گوش دادن به تغییرات سیستم - فقط برای system mode
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                if (this.current === 'system') this._applySystem();
            });
        }
    },

    setTheme(themeName) {
        this.current = themeName;
        localStorage.setItem(STORAGE_KEY, themeName);
        this._apply();
    },

    cycle() {
        // فقط دو حالت: light و system
        const order = ['light', 'system'];
        const next = order[(order.indexOf(this.current) + 1) % order.length];
        this.setTheme(next);
        return next;
    },

    _apply() {
        const root = document.documentElement;
        if (this.current === 'system') {
            this._applySystem();
        } else {
            // همیشه light
            root.setAttribute('data-theme', 'light');
        }
    },

    _applySystem() {
        const root = document.documentElement;
        const dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', dark ? 'dark' : 'light');
    },

    isDark() {
        if (this.current === 'system') {
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return this.current === 'dark';
    }
};
