/**
 * UI helpers — toast, modal, DOM
 * v4 — ES5 Compatible (بدون optional chaining و shorthand method)
 */
import { Utils } from './utils.js';

// Polyfill برای optional chaining در صورت عدم پشتیبانی
if (typeof Object.assign !== 'function') {
    Object.assign = function(target) {
        if (target == null) throw new TypeError('Cannot convert null/undefined to object');
        target = Object(target);
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            if (source != null) {
                for (var key in source) {
                    if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    };
}

class Toast {
    constructor() {
        this.container = document.getElementById('toastContainer');
    }

    _safeQuery(parent, selector) {
        try { return parent.querySelector(selector); } catch (e) { return null; }
    }

    show(message, type, duration) {
        if (type === undefined) type = 'info';
        if (duration === undefined) duration = 3500;
        if (!this.container) return null;

        var el = document.createElement('div');
        el.className = 'toast toast--' + type;
        el.setAttribute('role', type === 'error' ? 'alert' : 'status');
        el.innerHTML = '<span class="toast__icon">' + this._icon(type) + '</span><span class="toast__msg">' + Utils.escapeHTML(message) + '</span>';
        this.container.appendChild(el);

        // انیمیشن ورود
        if (window.requestAnimationFrame) {
            requestAnimationFrame(function() { el.classList.add('toast--in'); });
        } else {
            el.classList.add('toast--in');
        }

        var self = this;
        var t = setTimeout(function() { self.dismiss(el); }, duration);
        el.addEventListener('click', function() {
            clearTimeout(t);
            self.dismiss(el);
        });
        return el;
    }

    // Toast با دکمه action
    action(message, actionLabel, onAction, type, duration) {
        if (type === undefined) type = 'info';
        if (duration === undefined) duration = 5000;
        if (!this.container) return null;

        var el = document.createElement('div');
        el.className = 'toast toast--' + type + ' toast--actionable';
        el.setAttribute('role', 'status');
        el.innerHTML =
            '<span class="toast__icon">' + this._icon(type) + '</span>' +
            '<span class="toast__msg">' + Utils.escapeHTML(message) + '</span>' +
            '<button class="toast__action">' + Utils.escapeHTML(actionLabel) + '</button>';
        this.container.appendChild(el);

        if (window.requestAnimationFrame) {
            requestAnimationFrame(function() { el.classList.add('toast--in'); });
        } else {
            el.classList.add('toast--in');
        }

        var self = this;
        var dismiss = function() { self.dismiss(el); };

        var actionBtn = this._safeQuery(el, '.toast__action');
        if (actionBtn) {
            actionBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                try {
                    if (typeof onAction === 'function') onAction();
                } catch (err) {
                    console.error(err);
                }
                dismiss();
            });
        }

        var t = setTimeout(dismiss, duration);
        el.addEventListener('click', function() {
            clearTimeout(t);
            dismiss();
        });
        return el;
    }

    // Toast با undo
    undo(message, onUndo, type, duration) {
        if (type === undefined) type = 'warning';
        if (duration === undefined) duration = 6000;
        return this.action(message, '↶ بازگشت', onUndo, type, duration);
    }

    // Toast پیشرفت (بدون auto-dismiss)
    progress(message) {
        if (!this.container) return null;

        var el = document.createElement('div');
        el.className = 'toast toast--progress toast--info';
        el.setAttribute('role', 'status');
        el.innerHTML =
            '<div class="toast__progress">' +
                '<div class="toast__progress-icon">' + this._icon('info') + '</div>' +
                '<div class="toast__progress-body">' +
                    '<div class="toast__msg">' + Utils.escapeHTML(message) + '</div>' +
                    '<div class="toast__progress-bar"><div class="toast__progress-bar-fill"></div></div>' +
                '</div>' +
            '</div>';
        this.container.appendChild(el);

        if (window.requestAnimationFrame) {
            requestAnimationFrame(function() { el.classList.add('toast--in'); });
        } else {
            el.classList.add('toast--in');
        }

        var self = this;
        var obj = {
            el: el,
            update: function(newMessage) {
                var msg = self._safeQuery(el, '.toast__msg');
                if (msg) msg.textContent = newMessage;
            },
            done: function() {
                el.classList.remove('toast--info');
                el.classList.add('toast--success');
                var icon = self._safeQuery(el, '.toast__progress-icon');
                if (icon) icon.innerHTML = self._iconStatic('success');
                var bar = self._safeQuery(el, '.toast__progress-bar');
                if (bar) bar.style.display = 'none';
                setTimeout(function() { self.dismiss(el); }, 1500);
            },
            dismiss: function() { self.dismiss(el); }
        };
        return obj;
    }

    _iconStatic(type) {
        var icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };
        return icons[type] || icons.info;
    }

    _icon(type) {
        return this._iconStatic(type);
    }

    dismiss(el) {
        if (!el || !el.parentNode) return;
        el.classList.add('toast--out');
        el.classList.remove('toast--in');
        el.addEventListener('animationend', function() {
            if (el.parentNode) el.parentNode.removeChild(el);
        }, { once: true });
    }

    success(m, d) { return this.show(m, 'success', d); }
    error(m, d) { return this.show(m, 'error', d); }
    info(m, d) { return this.show(m, 'info', d); }
    warning(m, d) { return this.show(m, 'warning', d); }
}

export const toast = new Toast();

class Modal {
    constructor() {
        this.el = document.getElementById('modal');
        this.titleEl = document.getElementById('modalTitle');
        this.bodyEl = document.getElementById('modalBody');
        this.footerEl = document.getElementById('modalFooter');
        this._bind();
    }

    _safeQuery(parent, selector) {
        try { return parent.querySelector(selector); } catch (e) { return null; }
    }

    _bind() {
        if (!this.el) return;
        var self = this;
        var closeButtons = this.el.querySelectorAll('[data-close-modal]');
        for (var i = 0; i < closeButtons.length; i++) {
            closeButtons[i].addEventListener('click', function() { self.close(); });
        }
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && !self.el.hidden) self.close();
        });
    }

    open(opts) {
        opts = opts || {};
        var title = opts.title || '';
        var body = opts.body || '';
        var footer = opts.footer || null;
        var size = opts.size || 'md';

        this.titleEl.textContent = title;

        var panel = this._safeQuery(this.el, '.modal__panel');
        if (panel) {
            panel.classList.remove('modal__panel--sm', 'modal__panel--md', 'modal__panel--lg', 'modal__panel--xl');
            panel.classList.add('modal__panel--' + size);
        }

        if (typeof body === 'string') {
            this.bodyEl.innerHTML = body;
        } else if (body instanceof Node) {
            this.bodyEl.innerHTML = '';
            this.bodyEl.appendChild(body);
        }

        if (footer) {
            this.footerEl.innerHTML = '';
            if (typeof footer === 'string') {
                this.footerEl.innerHTML = footer;
            } else if (footer instanceof Node) {
                this.footerEl.appendChild(footer);
            }
            this.footerEl.style.display = 'flex';
        } else {
            this.footerEl.style.display = 'none';
        }

        this.el.hidden = false;
        this.el.classList.add('modal--in');
    }

    close() {
        this.el.classList.remove('modal--in');
        var self = this;
        setTimeout(function() { self.el.hidden = true; }, 200);
    }

    confirm(opts) {
        opts = opts || {};
        var title = opts.title || 'تأیید';
        var message = opts.message || 'آیا مطمئن هستید؟';
        var confirmText = opts.confirmText || 'بله';
        var cancelText = opts.cancelText || 'انصراف';
        var danger = opts.danger || false;
        var icon = opts.icon || '?';

        var self = this;
        return new Promise(function(resolve) {
            var f = document.createElement('div');
            f.style.cssText = 'display:flex;gap:12px;width:100%;';
            f.innerHTML = '<button class="btn btn--secondary btn--block" data-cancel>' + Utils.escapeHTML(cancelText) + '</button><button class="btn ' + (danger ? 'btn--danger' : 'btn--primary') + ' btn--block" data-confirm>' + Utils.escapeHTML(confirmText) + '</button>';

            var iconHTML = '<div style="width:64px;height:64px;border-radius:50%;background:' + (danger ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)') + ';color:' + (danger ? '#dc2626' : '#f59e0b') + ';display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto var(--space-3);">' + icon + '</div>';

            self.open({ title: title, body: iconHTML + '<p style="line-height:1.8;text-align:center;">' + Utils.escapeHTML(message) + '</p>', footer: f });

            var cleanup = function() { self.close(); };
            var cancelBtn = f.querySelector('[data-cancel]');
            var confirmBtn = f.querySelector('[data-confirm]');

            if (cancelBtn) {
                cancelBtn.addEventListener('click', function() { cleanup(); resolve(false); });
            }
            if (confirmBtn) {
                confirmBtn.addEventListener('click', function() { cleanup(); resolve(true); });
            }
        });
    }

    prompt(opts) {
        opts = opts || {};
        var title = opts.title || '';
        var label = opts.label || '';
        var placeholder = opts.placeholder || '';
        var defaultValue = opts.defaultValue || '';
        var type = opts.type || 'text';

        var self = this;
        return new Promise(function(resolve) {
            var id = 'i-' + Date.now();
            var body = document.createElement('div');
            body.innerHTML = '<div class="field"><label class="field__label">' + Utils.escapeHTML(label) + '</label><input type="' + type + '" id="' + id + '" class="input" placeholder="' + Utils.escapeHTML(placeholder) + '" value="' + Utils.escapeHTML(defaultValue) + '"></div>';

            var f = document.createElement('div');
            f.style.cssText = 'display:flex;gap:12px;width:100%;';
            f.innerHTML = '<button class="btn btn--secondary btn--block" data-cancel>انصراف</button><button class="btn btn--primary btn--block" data-ok>تأیید</button>';

            self.open({ title: title, body: body, footer: f });
            var input = body.querySelector('#' + id);
            if (input) {
                input.focus();
                input.select();
                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter') {
                        var okBtn = f.querySelector('[data-ok]');
                        if (okBtn) okBtn.click();
                    }
                });
            }
            var cancelBtn = f.querySelector('[data-cancel]');
            var okBtn = f.querySelector('[data-ok]');
            if (cancelBtn) cancelBtn.addEventListener('click', function() { self.close(); resolve(null); });
            if (okBtn) okBtn.addEventListener('click', function() { self.close(); resolve(input ? input.value : ''); });
        });
    }
}

export const modal = new Modal();

// Bottom Sheet
class Sheet {
    constructor() {
        this.el = document.getElementById('sheet');
        this._bind();
    }

    _safeQuery(parent, selector) {
        try { return parent.querySelector(selector); } catch (e) { return null; }
    }

    _bind() {
        if (!this.el) return;
        var self = this;
        var closeButtons = this.el.querySelectorAll('[data-close-sheet]');
        for (var i = 0; i < closeButtons.length; i++) {
            closeButtons[i].addEventListener('click', function() { self.close(); });
        }
    }

    open(opts) {
        opts = opts || {};
        var title = opts.title || '';
        var subtitle = opts.subtitle || '';
        var body = opts.body || '';

        var titleEl = document.getElementById('sheetTitle');
        var subtitleEl = document.getElementById('sheetSubtitle');
        if (titleEl) titleEl.textContent = title;
        if (subtitleEl) subtitleEl.textContent = subtitle;

        var bodyEl = document.getElementById('sheetBody');
        if (bodyEl) {
            if (typeof body === 'string') {
                bodyEl.innerHTML = body;
            } else if (body instanceof Node) {
                bodyEl.innerHTML = '';
                bodyEl.appendChild(body);
            }
        }

        this.el.hidden = false;
        this.el.classList.add('sheet--in');
    }

    close() {
        this.el.classList.remove('sheet--in');
        var self = this;
        setTimeout(function() { self.el.hidden = true; }, 250);
    }
}

export const sheet = new Sheet();

export function $(sel, ctx) {
    if (ctx === undefined) ctx = document;
    return ctx.querySelector(sel);
}

export function $$(sel, ctx) {
    if (ctx === undefined) ctx = document;
    return Array.prototype.slice.call(ctx.querySelectorAll(sel));
}

// Number counter animation
export function animateNumber(el, from, to, duration, format) {
    if (duration === undefined) duration = 800;
    if (format === undefined) format = function(n) { return Math.round(n).toLocaleString(); };
    if (typeof el === 'string') el = document.querySelector(el);
    if (!el) return;
    var start = (window.performance && performance.now) ? performance.now() : Date.now();
    var isFloat = String(to).indexOf('.') !== -1 || String(from).indexOf('.') !== -1;
    function tick(now) {
        var elapsed = now - start;
        var progress = Math.min(elapsed / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        var current = from + (to - from) * eased;
        el.textContent = isFloat ? current.toFixed(1) : format(current);
        if (progress < 1) {
            if (window.requestAnimationFrame) requestAnimationFrame(tick);
            else setTimeout(function() { tick(Date.now()); }, 16);
        }
    }
    if (window.requestAnimationFrame) requestAnimationFrame(tick);
    else setTimeout(function() { tick(Date.now()); }, 0);
}

// Haptic feedback (در موبایل)
export function haptic(type) {
    if (type === undefined) type = 'light';
    if (!navigator.vibrate) return;
    var patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 50, 10],
        warning: [20, 100, 20],
        error: [30, 100, 30, 100, 30]
    };
    try { navigator.vibrate(patterns[type] || patterns.light); } catch (e) {}
}

// Clipboard helper
export function copyToClipboard(text) {
    return new Promise(function(resolve) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                toast.success('در کلیپ‌بورد کپی شد');
                resolve(true);
            }).catch(function() {
                fallbackCopy(text, resolve);
            });
        } else {
            fallbackCopy(text, resolve);
        }
    });
}

function fallbackCopy(text, resolve) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var success = false;
    try {
        success = document.execCommand('copy');
        if (success) toast.success('کپی شد');
        else toast.error('کپی نشد');
    } catch (e) {
        toast.error('کپی نشد');
    }
    document.body.removeChild(ta);
    resolve(success);
}

// Share API
export function share(opts) {
    opts = opts || {};
    return new Promise(function(resolve) {
        if (navigator.share) {
            navigator.share({
                title: opts.title,
                text: opts.text,
                url: opts.url
            }).then(function() { resolve(true); }).catch(function(e) {
                if (e.name !== 'AbortError') console.error(e);
                resolve(false);
            });
        } else {
            resolve(false);
        }
    });
}

// Formatters
export const formatCurrency = function(n, currency) {
    if (currency === undefined) currency = 'USD';
    try {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency, maximumFractionDigits: 0 }).format(n);
    } catch (e) {
        return '$' + Utils.formatNumber(n);
    }
};

export const formatNumber = Utils.formatNumber;
export const toPersian = Utils.toPersian;
export const escapeHTML = Utils.escapeHTML;
