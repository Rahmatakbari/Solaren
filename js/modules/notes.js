/**
 * دفترچه یادداشت پروژه
 * Project Notes
 */
import { Utils } from '../utils.js';
import { toast, modal } from '../ui.js';
import { notes as notesStore } from '../store.js';

export const notes = {
    name: 'notes',
    path: '#notes',

    state: {
        search: '',
        filterColor: 'all',
        editing: null
    },

    render() {
        const all = notesStore.all();
        const filtered = this._filter(all);
        const colors = this._colorStats(all);

        return `
            <h1 class="page-title anim-fade-up">📝 دفترچه یادداشت</h1>
            <p class="page-subtitle anim-fade-up">${Utils.toPersian(all.length)} یادداشت - ذخیره خودکار</p>

            <!-- آمار رنگ‌ها -->
            ${all.length > 0 ? `
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:var(--space-1);margin-bottom:var(--space-3);">
                    <button class="chip ${this.state.filterColor === 'all' ? 'is-active' : ''}" data-color="all" style="cursor:pointer;background:var(--color-surface-2);">📋 همه (${Utils.toPersian(all.length)})</button>
                    <button class="chip ${this.state.filterColor === 'sun' ? 'is-active' : ''}" data-color="sun" style="cursor:pointer;background:rgba(245,158,11,0.15);">🟡 ${Utils.toPersian(colors.sun || 0)}</button>
                    <button class="chip ${this.state.filterColor === 'sky' ? 'is-active' : ''}" data-color="sky" style="cursor:pointer;background:rgba(14,165,233,0.15);">🔵 ${Utils.toPersian(colors.sky || 0)}</button>
                    <button class="chip ${this.state.filterColor === 'emerald' ? 'is-active' : ''}" data-color="emerald" style="cursor:pointer;background:rgba(16,185,129,0.15);">🟢 ${Utils.toPersian(colors.emerald || 0)}</button>
                    <button class="chip ${this.state.filterColor === 'red' ? 'is-active' : ''}" data-color="red" style="cursor:pointer;background:rgba(239,68,68,0.15);">🔴 ${Utils.toPersian(colors.red || 0)}</button>
                </div>
            ` : ''}

            <!-- جستجو -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-3);padding:var(--space-3);">
                <div class="search">
                    <input type="text" class="input" id="noteSearch" placeholder="جستجو در یادداشت‌ها..." value="${Utils.escapeHTML(this.state.search)}">
                    <span class="search__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
                </div>
            </div>

            <!-- یادداشت سریع -->
            <div class="card anim-fade-up" style="background:linear-gradient(135deg, #f59e0b 0%, #f97316 100%);color:white;padding:var(--space-4);margin-bottom:var(--space-4);position:relative;overflow:hidden;">
                <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;">
                    <h3 style="color:white;margin-bottom:var(--space-2);font-size:var(--font-size-md);">✍️ یادداشت سریع</h3>
                    <textarea id="quickNote" placeholder="یادداشت خود را بنویسید..." style="width:100%;min-height:80px;background:rgba(255,255,255,0.95);color:#1e293b;border:none;border-radius:var(--radius-md);padding:var(--space-2);font-family:inherit;font-size:var(--font-size-sm);resize:vertical;outline:none;"></textarea>
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:var(--space-2);flex-wrap:wrap;gap:var(--space-2);">
                        <div style="display:flex;gap:6px;" id="colorPicker">
                            <button data-color="sun" style="width:24px;height:24px;border-radius:50%;background:#f59e0b;border:2px solid transparent;cursor:pointer;"></button>
                            <button data-color="sky" style="width:24px;height:24px;border-radius:50%;background:#0ea5e9;border:2px solid transparent;cursor:pointer;"></button>
                            <button data-color="emerald" style="width:24px;height:24px;border-radius:50%;background:#10b981;border:2px solid transparent;cursor:pointer;"></button>
                            <button data-color="red" style="width:24px;height:24px;border-radius:50%;background:#ef4444;border:2px solid transparent;cursor:pointer;"></button>
                            <button data-color="violet" style="width:24px;height:24px;border-radius:50%;background:#8b5cf6;border:2px solid transparent;cursor:pointer;"></button>
                        </div>
                        <button class="btn btn--sm" id="saveQuickNote" style="background:rgba(0,0,0,0.3);color:white;border:1px solid rgba(255,255,255,0.3);">💾 ذخیره</button>
                    </div>
                </div>
            </div>

            <!-- لیست یادداشت‌ها -->
            <div class="list stagger">
                ${filtered.length > 0 ? filtered.map(n => this._renderNote(n)).join('') : `
                    <div class="empty">
                        <h3 class="empty__title">یادداشتی نیست</h3>
                        <p class="empty__text">اولین یادداشت خود را بنویسید</p>
                    </div>
                `}
            </div>
        `;
    },

    _filter(all) {
        let result = all;
        if (this.state.search) {
            const q = this.state.search.toLowerCase();
            result = result.filter(n => (n.text || '').toLowerCase().includes(q) || (n.title || '').toLowerCase().includes(q));
        }
        if (this.state.filterColor !== 'all') {
            result = result.filter(n => n.color === this.state.filterColor);
        }
        return result;
    },

    _colorStats(all) {
        const stats = {};
        all.forEach(n => {
            stats[n.color] = (stats[n.color] || 0) + 1;
        });
        return stats;
    },

    _renderNote(n) {
        const colorMap = {
            sun: '#f59e0b', sky: '#0ea5e9', emerald: '#10b981',
            red: '#ef4444', violet: '#8b5cf6'
        };
        const color = colorMap[n.color] || '#94a3b8';
        const date = n.createdAt ? new Date(n.createdAt).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' }) : '';

        return `
            <div class="card card--glass card--hover anim-fade-up" style="padding:var(--space-3);border-right:4px solid ${color};">
                ${n.title ? `<h4 style="margin:0 0 6px;font-size:var(--font-size-md);">${Utils.escapeHTML(n.title)}</h4>` : ''}
                <p style="margin:0;font-size:var(--font-size-sm);line-height:1.7;white-space:pre-wrap;word-break:break-word;">${Utils.escapeHTML(n.text)}</p>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:var(--space-2);padding-top:var(--space-2);border-top:1px solid var(--color-border);">
                    <span style="font-size:var(--font-size-xs);color:var(--color-text-dim);">📅 ${date}</span>
                    <div style="display:flex;gap:4px;">
                        <button class="btn-icon" data-edit-note="${n.id}" style="background:var(--color-surface-2);border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="btn-icon" data-copy-note="${n.id}" style="background:rgba(14,165,233,0.15);border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--color-sky-300);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        </button>
                        <button class="btn-icon" data-delete-note="${n.id}" style="background:rgba(239,68,68,0.15);border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#ef4444;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    attach() {
        // جستجو
        document.getElementById('noteSearch')?.addEventListener('input', Utils.debounce((e) => {
            this.state.search = e.target.value;
            this._refresh();
        }, 200));

        // فیلتر رنگ
        document.querySelectorAll('[data-color]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (e.target.closest('#colorPicker')) {
                    // انتخاب رنگ برای یادداشت جدید
                    document.querySelectorAll('#colorPicker button').forEach(b => b.style.borderColor = 'transparent');
                    btn.style.borderColor = 'white';
                    btn.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.3)';
                    this.state.editingColor = btn.dataset.color;
                    return;
                }
                this.state.filterColor = btn.dataset.color;
                this._refresh();
            });
        });

        // ذخیره سریع
        document.getElementById('saveQuickNote')?.addEventListener('click', () => {
            const text = document.getElementById('quickNote').value.trim();
            if (!text) {
                toast.error('یادداشت خالی است');
                return;
            }
            notesStore.save({
                text,
                color: this.state.editingColor || 'sun',
                createdAt: Date.now()
            });
            document.getElementById('quickNote').value = '';
            toast.success('یادداشت ذخیره شد');
            this._refresh();
        });

        // عملیات یادداشت
        document.querySelectorAll('[data-edit-note]').forEach(btn => {
            btn.addEventListener('click', () => this._editNote(btn.dataset.editNote));
        });
        document.querySelectorAll('[data-copy-note]').forEach(btn => {
            btn.addEventListener('click', () => this._copyNote(btn.dataset.copyNote));
        });
        document.querySelectorAll('[data-delete-note]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('یادداشت حذف شود؟')) {
                    notesStore.remove(btn.dataset.deleteNote);
                    this._refresh();
                    toast.success('یادداشت حذف شد');
                }
            });
        });
    },

    _editNote(id) {
        const n = notesStore.findById(id);
        if (!n) return;
        const content = `
            <div style="padding:var(--space-3);">
                <div class="field">
                    <label class="field__label">عنوان (اختیاری)</label>
                    <input type="text" class="input" id="editTitle" value="${Utils.escapeHTML(n.title || '')}">
                </div>
                <div class="field">
                    <label class="field__label">متن یادداشت</label>
                    <textarea class="input" id="editText" rows="6" style="resize:vertical;">${Utils.escapeHTML(n.text)}</textarea>
                </div>
            </div>
        `;
        modal.open({
            title: '✏️ ویرایش یادداشت',
            content,
            actions: [
                { label: 'انصراف', class: 'btn--secondary', onclick: () => modal.close() },
                { label: 'ذخیره', class: 'btn--primary', onclick: () => {
                    notesStore.update(id, {
                        title: document.getElementById('editTitle').value,
                        text: document.getElementById('editText').value
                    });
                    modal.close();
                    this._refresh();
                    toast.success('یادداشت به‌روز شد');
                } }
            ]
        });
    },

    _copyNote(id) {
        const n = notesStore.findById(id);
        if (!n) return;
        const text = (n.title ? n.title + '\n\n' : '') + n.text;
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => toast.success('کپی شد'));
        }
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
