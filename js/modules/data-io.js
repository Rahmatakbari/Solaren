/**
 * سیستم اکسپورت/ایمپورت داده‌ها
 * Data Export/Import System
 */

import { projects, customers, invoices } from '../store.js';
import { toast, modal } from '../ui.js';

const STORAGE_KEYS = [
    'solar-pwa:projects',
    'solar-pwa:customers',
    'solar-pwa:invoices',
    'solar-pwa:team',
    'solar-pwa:tasks',
    'solar-pwa:payments',
    'solar-pwa:notifications',
    'solar-pwa:activities',
    'solar-pwa:loyalty',
    'solar-pwa:ai-history',
    'solar-pwa:programs',
    'solar-pwa:settings'
];

const EXPORT_VERSION = '1.0';
const APP_NAME = 'Solaren Pro';

export function exportAllData() {
    try {
        const data = {
            meta: {
                app: APP_NAME,
                version: EXPORT_VERSION,
                exportedAt: new Date().toISOString(),
                exportedAtPersian: new Date().toLocaleDateString('fa-IR')
            },
            data: {}
        };

        STORAGE_KEYS.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    data.data[key] = JSON.parse(value);
                } catch {
                    data.data[key] = value;
                }
            }
        });

        // آمار
        data.meta.stats = {
            projects: projects.all().length,
            customers: customers.all().length,
            invoices: invoices.all().length
        };

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().slice(0, 10);
        a.download = `solar-backup-${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success('پشتیبان‌گیری با موفقیت دانلود شد');
        return true;
    } catch (e) {
        console.error('Export failed:', e);
        toast.error('خطا در خروجی گرفتن');
        return false;
    }
}

export function exportSingleTable(tableKey) {
    try {
        const value = localStorage.getItem(tableKey);
        if (!value) {
            toast.warning('داده‌ای برای خروجی وجود ندارد');
            return false;
        }
        const data = JSON.parse(value);
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${tableKey.replace('solar-pwa:', '')}-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('خروجی گرفته شد');
        return true;
    } catch (e) {
        toast.error('خطا در خروجی');
        return false;
    }
}

export function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const imported = JSON.parse(ev.target.result);
                if (!imported.meta || imported.meta.app !== APP_NAME) {
                    if (!confirm('فایل پشتیبان از اپ دیگری است. ادامه دهیم؟')) {
                        return;
                    }
                }
                showImportPreview(imported);
            } catch (err) {
                toast.error('فایل نامعتبر است');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function showImportPreview(imported) {
    const stats = imported.meta?.stats || {};
    const dataKeys = Object.keys(imported.data || {});

    const content = `
        <div style="padding:var(--space-3);">
            <div style="background:linear-gradient(135deg, rgba(14,165,233,0.15), rgba(124,58,237,0.15));border:1px solid rgba(14,165,233,0.3);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-3);">
                <h3 style="margin:0 0 var(--space-2);">📥 پیش‌نمایش ورود داده</h3>
                <div style="font-size:var(--font-size-sm);color:var(--color-text-muted);">
                    <div>📅 تاریخ پشتیبان: ${imported.meta?.exportedAtPersian || imported.meta?.exportedAt || 'نامشخص'}</div>
                    <div>📦 نسخه: ${imported.meta?.version || 'نامشخص'}</div>
                </div>
            </div>
            <h4 style="margin:var(--space-3) 0 var(--space-2);">📊 داده‌های موجود در فایل:</h4>
            <div style="max-height:300px;overflow-y:auto;">
                ${dataKeys.map(key => {
                    const value = imported.data[key];
                    const count = Array.isArray(value) ? value.length : (typeof value === 'object' ? Object.keys(value).length : 1);
                    const label = key.replace('solar-pwa:', '');
                    return `
                        <label style="display:flex;align-items:center;gap:var(--space-2);padding:var(--space-2);border-radius:var(--radius-sm);cursor:pointer;">
                            <input type="checkbox" checked data-import-key="${key}" style="width:18px;height:18px;">
                            <span style="flex:1;">${label}</span>
                            <span class="chip">${count} مورد</span>
                        </label>
                    `;
                }).join('')}
            </div>
            <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius-md);padding:var(--space-3);margin-top:var(--space-3);font-size:var(--font-size-sm);">
                ⚠️ <strong>توجه:</strong> ورود داده، داده‌های فعلی را جایگزین می‌کند. ابتدا یک پشتیبان بگیرید.
            </div>
        </div>
    `;

    modal.open({
        title: '📥 ورود داده‌ها',
        content,
        actions: [
            { label: 'انصراف', class: 'btn--secondary', onclick: () => modal.close() },
            {
                label: '✅ ورود',
                class: 'btn--primary',
                onclick: () => {
                    const selected = Array.from(document.querySelectorAll('[data-import-key]:checked')).map(cb => cb.dataset.importKey);
                    performImport(imported, selected);
                }
            }
        ]
    });
}

function performImport(imported, selectedKeys) {
    try {
        let count = 0;
        selectedKeys.forEach(key => {
            if (imported.data[key] !== undefined) {
                localStorage.setItem(key, JSON.stringify(imported.data[key]));
                count++;
            }
        });
        modal.close();
        toast.success(`${Utils ? Utils.toPersian(selectedKeys.length) : selectedKeys.length} دسته داده وارد شد`);
        setTimeout(() => location.reload(), 1500);
    } catch (e) {
        toast.error('خطا در ورود داده');
    }
}

export function clearAllData() {
    if (!confirm('⚠️ تمام داده‌های محلی پاک خواهند شد. مطمئنید؟')) return;
    if (!confirm('آخرین تأیید - این عملیات برگشت‌ناپذیر است!')) return;

    STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    toast.success('داده‌ها پاک شدند');
    setTimeout(() => location.reload(), 1000);
}

export function getStorageUsage() {
    let totalSize = 0;
    let itemCount = 0;
    STORAGE_KEYS.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            totalSize += new Blob([value]).size;
            itemCount++;
        }
    });
    return {
        bytes: totalSize,
        kb: (totalSize / 1024).toFixed(2),
        mb: (totalSize / 1024 / 1024).toFixed(3),
        itemCount,
        totalKeys: STORAGE_KEYS.length
    };
}

// placeholder for Utils when not imported
const Utils = {
    toPersian: (n) => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)])
};
