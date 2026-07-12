/**
 * Pure utility helpers — no side effects.
 */
export const Utils = Object.freeze({
    toPersian(num) {
        if (num === null || num === undefined) return '۰';
        const map = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
        return String(num).replace(/[0-9]/g, (d) => map[+d]);
    },

    formatNumber(num, decimals = 0) {
        if (typeof num !== 'number' || isNaN(num)) return '۰';
        const parts = num.toFixed(decimals).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return this.toPersian(parts.join('.'));
    },

    formatCurrency(amount, currency = '$') {
        return `${this.formatNumber(Math.round(amount))} ${currency}`;
    },

    parseNumber(str) {
        if (typeof str !== 'string') return parseFloat(str) || 0;
        const map = {'۰':'0','۱':'1','۲':'2','۳':'3','۴':'4','۵':'5','۶':'6','۷':'7','۸':'8','۹':'9','٠':'0','١':'1','٢':'2','٣':'3','٤':'4','٥':'5','٦':'6','٧':'7','٨':'8','٩':'9'};
        return parseFloat(str.replace(/[۰-۹٠-٩]/g, (d) => map[d]).replace(/,/g, '')) || 0;
    },

    debounce(fn, wait = 300) {
        let timer;
        return function (...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), wait); };
    },

    throttle(fn, limit = 100) {
        let inThrottle;
        return function (...args) { if (!inThrottle) { fn.apply(this, args); inThrottle = true; setTimeout(() => inThrottle = false, limit); } };
    },

    uuid() {
        return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
    },

    formatDate(date) {
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return '';
        return this.toPersian(`${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`);
    },

    formatTime(date) {
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) return '';
        return this.toPersian(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    },

    escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    isValidNumber(val, { min = 0, max = Infinity, integer = false } = {}) {
        const n = typeof val === 'number' ? val : this.parseNumber(val);
        if (isNaN(n)) return false;
        if (n < min || n > max) return false;
        if (integer && !Number.isInteger(n)) return false;
        return true;
    },

    clone(obj) {
        if (typeof structuredClone === 'function') return structuredClone(obj);
        return JSON.parse(JSON.stringify(obj));
    },

    delay(ms) { return new Promise((res) => setTimeout(res, ms)); },

    humanFileSize(bytes) {
        if (bytes === 0) return '۰ بایت';
        const k = 1024;
        const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return this.formatNumber(parseFloat((bytes / Math.pow(k, i)).toFixed(2))) + ' ' + sizes[i];
    },

    roundTo(num, step) { return Math.round(num / step) * step; },

    findNextHigher(arr, target) {
        return arr.find((x) => x >= target) || arr[arr.length - 1];
    },

    /**
     * Persian month names
     */
    persianMonth(month) {
        const names = ['حمل','ثور','جوزا','سرطان','اسد','سنبله','میزان','عقرب','قوس','جدی','دلو','حوت'];
        return names[month] || '';
    }
});
