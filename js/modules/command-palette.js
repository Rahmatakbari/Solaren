/**
 * جستجوی سراسری و میانبرهای صفحه‌کلید
 * Global Search + Keyboard Shortcuts + Command Palette
 */

import { router } from '../router.js';
import { theme } from './theme.js';
import { toast } from '../ui.js';

/**
 * لیست تمام مسیرهای قابل جستجو
 */
const ROUTES = [
    { path: '#home', name: 'خانه', keywords: ['home', 'خانه', 'داشبورد', 'dashboard'], icon: '🏠' },
    { path: '#welcome', name: 'خوش‌آمدگویی', keywords: ['welcome', 'خوش', 'آموزش'], icon: '👋' },
    { path: '#quick-estimate', name: 'برآورد سریع', keywords: ['سریع', 'quick', 'تخمین'], icon: '⚡' },
    { path: '#detailed-estimate', name: 'برآورد تفصیلی', keywords: ['تفصیلی', 'دقیق', 'detailed'], icon: '📋' },
    { path: '#solar-calc', name: 'ماشین‌حساب', keywords: ['ماشین', 'حساب', 'calculator', 'calc'], icon: '🧮' },
    { path: '#recommender', name: 'توصیه‌گر هوشمند', keywords: ['توصیه', 'recommender', 'پیشنهاد'], icon: '🎯' },
    { path: '#panels', name: 'پنل‌ها', keywords: ['پنل', 'panel', 'خورشیدی'], icon: '☀️' },
    { path: '#inverters', name: 'اینورترها', keywords: ['اینورتر', 'انورتر', 'inverter'], icon: '⚡' },
    { path: '#batteries', name: 'باتری‌ها', keywords: ['باتری', 'باطری', 'battery'], icon: '🔋' },
    { path: '#vfd', name: 'درایو VFD', keywords: ['vfd', 'درایو', 'پمپ'], icon: '⚙️' },
    { path: '#accessories', name: 'لوازم جانبی', keywords: ['لوازم', 'جانبی', 'accessory', 'کابل'], icon: '🔌' },
    { path: '#wire-calc', name: 'محاسبه سیم', keywords: ['سیم', 'wire', 'کابل'], icon: '🔌' },
    { path: '#battery-calc', name: 'محاسبه باتری', keywords: ['باتری', 'محاسبه'], icon: '🔋' },
    { path: '#tilt-calc', name: 'محاسبه زاویه', keywords: ['زاویه', 'tilt', 'شیب'], icon: '📐' },
    { path: '#shading', name: 'تحلیل سایه', keywords: ['سایه', 'shading'], icon: '🌑' },
    { path: '#compare', name: 'مقایسه تجهیزات', keywords: ['مقایسه', 'compare'], icon: '⚖️' },
    { path: '#bom', name: 'لیست خرید BOM', keywords: ['bom', 'خرید', 'لیست'], icon: '📦' },
    { path: '#financial', name: 'تحلیل مالی', keywords: ['مالی', 'financial', 'roi', 'سود'], icon: '💰' },
    { path: '#designer', name: 'طراح بصری', keywords: ['طراح', 'designer', 'بصری'], icon: '🎨' },
    { path: '#maintenance', name: 'نگهداری و تعمیرات', keywords: ['نگهداری', 'maintenance', 'تعمیر'], icon: '🔧' },
    { path: '#monitoring', name: 'مانیتورینگ', keywords: ['مانیتورینگ', 'monitoring', 'پایش'], icon: '📊' },
    { path: '#projects', name: 'پروژه‌ها', keywords: ['پروژه', 'project'], icon: '📁' },
    { path: '#customers', name: 'مشتریان', keywords: ['مشتری', 'customer', 'crm'], icon: '👥' },
    { path: '#invoices', name: 'فاکتورها', keywords: ['فاکتور', 'invoice', 'صورتحساب'], icon: '📄' },
    { path: '#crm', name: 'CRM و وفاداری', keywords: ['crm', 'وفاداری', 'loyalty'], icon: '⭐' },
    { path: '#reports', name: 'گزارش‌ها', keywords: ['گزارش', 'report'], icon: '📊' },
    { path: '#payments', name: 'پرداخت‌ها', keywords: ['پرداخت', 'payment'], icon: '💳' },
    { path: '#team', name: 'تیم', keywords: ['تیم', 'team', 'کارمند'], icon: '👨‍👩‍👧‍👦' },
    { path: '#calendar', name: 'تقویم', keywords: ['تقویم', 'calendar', 'وظیفه'], icon: '📅' },
    { path: '#notifications', name: 'اعلان‌ها', keywords: ['اعلان', 'notification'], icon: '🔔' },
    { path: '#analytics', name: 'تحلیل داده', keywords: ['تحلیل', 'analytics', 'آمار'], icon: '📈' },
    { path: '#map', name: 'نقشه پروژه‌ها', keywords: ['نقشه', 'map'], icon: '🗺️' },
    { path: '#pro-report', name: 'گزارش حرفه‌ای', keywords: ['حرفه‌ای', 'pro'], icon: '🏆' },
    { path: '#ai-assistant', name: 'دستیار هوشمند', keywords: ['دستیار', 'ai', 'هوشمند', 'چت'], icon: '🤖' },
    { path: '#settings', name: 'تنظیمات', keywords: ['تنظیمات', 'settings'], icon: '⚙️' },
    { path: '#language', name: 'زبان', keywords: ['زبان', 'language', 'فارسی', 'پښتو', 'english'], icon: '🌐' }
];

/**
 * لیست میانبرها
 */
const SHORTCUTS = [
    { keys: ['Ctrl', 'K'], mac: ['⌘', 'K'], description: 'جستجوی سراسری', action: 'search' },
    { keys: ['Ctrl', '/'], mac: ['⌘', '/'], description: 'جستجوی سراسری', action: 'search' },
    { keys: ['g', 'h'], description: 'خانه', action: 'go:home' },
    { keys: ['g', 'q'], description: 'برآورد سریع', action: 'go:quick-estimate' },
    { keys: ['g', 'd'], description: 'برآورد تفصیلی', action: 'go:detailed-estimate' },
    { keys: ['g', 'p'], description: 'پنل‌ها', action: 'go:panels' },
    { keys: ['g', 'i'], description: 'اینورترها', action: 'go:inverters' },
    { keys: ['g', 'b'], description: 'باتری‌ها', action: 'go:batteries' },
    { keys: ['g', 'r'], description: 'پروژه‌ها', action: 'go:projects' },
    { keys: ['g', 'c'], description: 'مشتریان', action: 'go:customers' },
    { keys: ['g', 'a'], description: 'دستیار AI', action: 'go:ai-assistant' },
    { keys: ['g', 't'], description: 'توصیه‌گر', action: 'go:recommender' },
    { keys: ['t'], description: 'تغییر تم', action: 'theme' },
    { keys: ['?'], description: 'نمایش میانبرها', action: 'shortcuts' },
    { keys: ['Esc'], description: 'بستن', action: 'close' }
];

export const commandPalette = {
    isOpen: false,
    selectedIndex: 0,
    currentResults: [],
    mode: 'search', // 'search' | 'shortcuts'

    init() {
        this._injectUI();
        this._bindShortcuts();
        this._bindGPrefix();
    },

    _injectUI() {
        // HTML پالت فرمان
        const html = `
            <div id="commandPalette" class="cmd-palette" style="display:none;">
                <div class="cmd-palette__backdrop"></div>
                <div class="cmd-palette__container">
                    <div class="cmd-palette__search">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <input type="text" id="cmdInput" placeholder="جستجو، فرمان، یا مقصد..." autocomplete="off">
                        <span class="cmd-palette__kbd">Esc</span>
                    </div>
                    <div class="cmd-palette__results" id="cmdResults"></div>
                    <div class="cmd-palette__footer">
                        <span><kbd>↑</kbd><kbd>↓</kbd> ناوبری</span>
                        <span><kbd>↵</kbd> انتخاب</span>
                        <span><kbd>Ctrl</kbd>+<kbd>K</kbd> باز کردن</span>
                    </div>
                </div>
            </div>

            <div id="shortcutsModal" class="cmd-palette" style="display:none;">
                <div class="cmd-palette__backdrop"></div>
                <div class="cmd-palette__container" style="max-width:600px;">
                    <div class="cmd-palette__search" style="background:linear-gradient(135deg, #7c3aed, #4f46e5);color:white;">
                        <span style="font-size:20px;">⌨️</span>
                        <span style="font-weight:700;font-size:var(--font-size-md);">میانبرهای صفحه‌کلید</span>
                        <span class="cmd-palette__kbd" style="background:rgba(255,255,255,0.2);color:white;">Esc</span>
                    </div>
                    <div style="max-height:60vh;overflow-y:auto;padding:var(--space-3);">
                        <div style="margin-bottom:var(--space-3);">
                            <h3 style="font-size:var(--font-size-sm);color:var(--color-text-muted);margin-bottom:var(--space-2);">🔍 جستجو و فرمان</h3>
                            ${SHORTCUTS.filter(s => ['search'].includes(s.action) || s.keys.includes('?')).map(s => `
                                <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2);border-radius:var(--radius-sm);">
                                    <span>${s.description}</span>
                                    <div>${s.keys.map(k => `<kbd style="background:var(--color-surface-2);border:1px solid var(--color-border);padding:2px 8px;border-radius:4px;font-family:var(--font-mono);font-size:11px;margin:0 2px;">${k}</kbd>`).join(' + ')}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div style="margin-bottom:var(--space-3);">
                            <h3 style="font-size:var(--font-size-sm);color:var(--color-text-muted);margin-bottom:var(--space-2);">🧭 ناوبری سریع (g + ...)</h3>
                            ${SHORTCUTS.filter(s => s.action.startsWith('go:')).map(s => `
                                <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2);border-radius:var(--radius-sm);">
                                    <span>${s.description}</span>
                                    <div>${s.keys.map(k => `<kbd style="background:var(--color-surface-2);border:1px solid var(--color-border);padding:2px 8px;border-radius:4px;font-family:var(--font-mono);font-size:11px;margin:0 2px;">${k}</kbd>`).join(' + ')}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div>
                            <h3 style="font-size:var(--font-size-sm);color:var(--color-text-muted);margin-bottom:var(--space-2);">⚙️ سایر</h3>
                            ${SHORTCUTS.filter(s => ['theme'].includes(s.action)).map(s => `
                                <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-2);border-radius:var(--radius-sm);">
                                    <span>${s.description}</span>
                                    <div>${s.keys.map(k => `<kbd style="background:var(--color-surface-2);border:1px solid var(--color-border);padding:2px 8px;border-radius:4px;font-family:var(--font-mono);font-size:11px;margin:0 2px;">${k}</kbd>`).join(' + ')}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <div id="toast-container" class="toast-container"></div>
        `;
        const div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div);
    },

    _bindShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+K یا Cmd+K
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.open();
                return;
            }

            // Ctrl+/ هم جستجو باز کنه
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.open();
                return;
            }

            // Esc برای بستن
            if (e.key === 'Escape') {
                if (this.isOpen) this.close();
                document.getElementById('shortcutsModal').style.display = 'none';
                return;
            }

            // وقتی پالت باز است، کلیدهای دیگر غیرفعال
            if (this.isOpen) return;

            // ?
            if (e.key === '?' && !this._isTyping(e)) {
                e.preventDefault();
                document.getElementById('shortcutsModal').style.display = 'flex';
                return;
            }

            // t برای تغییر تم
            if (e.key === 't' && !this._isTyping(e)) {
                e.preventDefault();
                const next = theme.cycle();
                const labels = { dark: '🌙 تاریک', light: '☀️ روشن', system: '💻 سیستم' };
                toast.success(`تم: ${labels[next]}`);
            }
        });

        // کلیک روی backdrop
        document.addEventListener('click', (e) => {
            if (e.target.classList && e.target.classList.contains('cmd-palette__backdrop')) {
                this.close();
                document.getElementById('shortcutsModal').style.display = 'none';
            }
        });

        // input handling
        document.getElementById('cmdInput')?.addEventListener('input', (e) => {
            this._search(e.target.value);
        });
        document.getElementById('cmdInput')?.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this._moveSelection(1);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this._moveSelection(-1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                this._selectCurrent();
            }
        });
    },

    _isTyping(e) {
        const tag = e.target.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable;
    },

    _bindGPrefix() {
        // پیاده‌سازی g + key
        let lastG = 0;
        document.addEventListener('keydown', (e) => {
            if (this._isTyping(e) || this.isOpen) return;
            const now = Date.now();
            if (e.key === 'g' && now - lastG < 800) {
                // منتظر کلید بعدی
            } else if (e.key === 'g') {
                lastG = now;
            } else if (lastG && now - lastG < 800) {
                const shortcut = SHORTCUTS.find(s =>
                    s.action === `go:${this._resolveG(e.key)}` && s.keys[0] === 'g'
                );
                if (shortcut) {
                    e.preventDefault();
                    const path = shortcut.action.replace('go:', '#');
                    location.hash = path;
                    toast.info('ناوبری سریع', shortcut.description);
                }
                lastG = 0;
            } else {
                lastG = 0;
            }
        });
    },

    _resolveG(key) {
        const map = {
            'h': 'home', 'q': 'quick-estimate', 'd': 'detailed-estimate',
            'p': 'panels', 'i': 'inverters', 'b': 'batteries',
            'r': 'projects', 'c': 'customers', 'a': 'ai-assistant',
            't': 'recommender'
        };
        return map[key] || key;
    },

    open() {
        this.isOpen = true;
        const el = document.getElementById('commandPalette');
        el.style.display = 'flex';
        const input = document.getElementById('cmdInput');
        input.value = '';
        input.focus();
        this._search('');
    },

    close() {
        this.isOpen = false;
        document.getElementById('commandPalette').style.display = 'none';
    },

    _search(query) {
        const q = query.toLowerCase().trim();
        let results = [];

        if (!q) {
            // پیشنهادهای پرکاربرد
            results = [
                { type: 'route', path: '#home', name: 'خانه', icon: '🏠', hint: 'g h' },
                { type: 'route', path: '#quick-estimate', name: 'برآورد سریع', icon: '⚡', hint: 'g q' },
                { type: 'route', path: '#recommender', name: 'توصیه‌گر هوشمند', icon: '🎯', hint: 'g t' },
                { type: 'route', path: '#ai-assistant', name: 'دستیار AI', icon: '🤖', hint: 'g a' },
                { type: 'action', action: 'theme', name: 'تغییر تم', icon: '🎨', hint: 't' },
                { type: 'action', action: 'shortcuts', name: 'نمایش میانبرها', icon: '⌨️', hint: '?' }
            ];
        } else {
            // جستجو در مسیرها
            ROUTES.forEach(r => {
                const allText = (r.name + ' ' + r.keywords.join(' ')).toLowerCase();
                if (allText.includes(q)) {
                    results.push({ type: 'route', path: r.path, name: r.name, icon: r.icon });
                }
            });

            // جستجو در اقدامات
            const actions = [
                { action: 'theme', name: 'تغییر تم', icon: '🎨', keywords: ['تم', 'theme', 'تاریک', 'روشن'] },
                { action: 'export', name: 'خروجی همه داده‌ها', icon: '📥', keywords: ['خروجی', 'export', 'پشتیبان'] },
                { action: 'import', name: 'ورود داده‌ها', icon: '📤', keywords: ['ورود', 'import', 'بارگذاری'] },
                { action: 'shortcuts', name: 'میانبرها', icon: '⌨️', keywords: ['میانبر', 'shortcut', 'کلید'] }
            ];
            actions.forEach(a => {
                if (a.name.toLowerCase().includes(q) || a.keywords.some(k => k.includes(q))) {
                    results.push({ type: 'action', ...a });
                }
            });
        }

        this.currentResults = results.slice(0, 10);
        this.selectedIndex = 0;
        this._renderResults();
    },

    _renderResults() {
        const container = document.getElementById('cmdResults');
        if (!container) return;
        if (this.currentResults.length === 0) {
            container.innerHTML = '<div style="padding:var(--space-4);text-align:center;color:var(--color-text-muted);">موردی یافت نشد</div>';
            return;
        }
        container.innerHTML = this.currentResults.map((r, i) => `
            <div class="cmd-palette__item ${i === this.selectedIndex ? 'is-selected' : ''}" data-index="${i}">
                <div style="display:flex;align-items:center;gap:var(--space-3);flex:1;">
                    <span style="font-size:20px;">${r.icon}</span>
                    <div>
                        <div style="font-weight:600;">${r.name}</div>
                        ${r.path ? `<div style="font-size:11px;color:var(--color-text-muted);">${r.path}</div>` : ''}
                    </div>
                </div>
                ${r.hint ? `<span class="cmd-palette__kbd">${r.hint}</span>` : ''}
            </div>
        `).join('');

        container.querySelectorAll('.cmd-palette__item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectedIndex = parseInt(item.dataset.index);
                this._selectCurrent();
            });
            item.addEventListener('mouseenter', () => {
                this.selectedIndex = parseInt(item.dataset.index);
                this._updateSelection();
            });
        });
    },

    _moveSelection(dir) {
        this.selectedIndex = Math.max(0, Math.min(this.currentResults.length - 1, this.selectedIndex + dir));
        this._updateSelection();
    },

    _updateSelection() {
        document.querySelectorAll('.cmd-palette__item').forEach((item, i) => {
            item.classList.toggle('is-selected', i === this.selectedIndex);
            if (i === this.selectedIndex) item.scrollIntoView({ block: 'nearest' });
        });
    },

    _selectCurrent() {
        const r = this.currentResults[this.selectedIndex];
        if (!r) return;
        this.close();
        if (r.type === 'route') {
            location.hash = r.path;
        } else if (r.type === 'action') {
            this._executeAction(r.action);
        }
    },

    _executeAction(action) {
        if (action === 'theme') {
            const next = theme.cycle();
            const labels = { dark: '🌙 تاریک', light: '☀️ روشن', system: '💻 سیستم' };
            toast.success(`تم: ${labels[next]}`);
        } else if (action === 'shortcuts') {
            document.getElementById('shortcutsModal').style.display = 'flex';
        } else if (action === 'export') {
            import('./data-io.js').then(m => m.exportAllData());
        } else if (action === 'import') {
            import('./data-io.js').then(m => m.importData());
        }
    }
};
