/**
 * Invoice / Quote module v3 — Production Ready
 * Features: project linking, item editing, live total, PDF/print export, customer linking
 */
import { Utils } from '../utils.js';
import { toast, modal } from '../ui.js';
import { projects, invoices, customers, settings } from '../store.js';
import { buildBOM } from '../calc.js';
import { findInverter } from '../data/inverters.js';
import { findBattery } from '../data/batteries.js';
import { findPanel } from '../data/panels.js';

export const invoicesView = {
    name: 'invoices',
    path: '#invoices',

    state: { selectedProjectId: null, items: [], notes: '', editing: false },

    render() {
        // Auto-select project from sessionStorage if set
        const autoId = sessionStorage.getItem('autoSelectProject');
        if (autoId && !this.state.selectedProjectId) {
            this.state.selectedProjectId = autoId;
            sessionStorage.removeItem('autoSelectProject');
        }
        const list = projects.list();
        const invoicesList = invoices.list();
        const currentProject = this.state.selectedProjectId ? projects.get(this.state.selectedProjectId) : null;
        const company = settings.get('company', 'Solaren Pro');
        const taxRate = settings.get('taxRate', 0);

        return `
            <h1 class="page-title anim-fade-up">انوایس و پیش‌فاکتور</h1>
            <p class="page-subtitle anim-fade-up">صدور پیش‌فاکتور حرفه‌ای با قابلیت چاپ و خروجی PDF</p>

            <!-- Tabs: New / All -->
            <div class="tabs anim-fade-up" id="invTabs">
                <button class="tab ${!this.state.selectedProjectId ? 'is-active' : ''}" data-tab="new">
                    <span>📝</span> <span>صدور جدید</span>
                </button>
                <button class="tab ${this.state.selectedProjectId ? 'is-active' : ''}" data-tab="projects">
                    <span>📁</span> <span>انتخاب از پروژه</span>
                </button>
            </div>

            <div id="invTabContent">
                ${this._renderTab(currentProject, list, invoicesList, company, taxRate)}
            </div>
        `;
    },

    _renderTab(currentProject, list, invoicesList, company, taxRate) {
        if (currentProject) {
            return this._renderForm(currentProject, company, taxRate);
        }
        return `
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="card__header">
                    <div class="card__icon card__icon--violet">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    </div>
                    <div>
                        <div class="card__title">انتخاب پروژه</div>
                        <div class="card__subtitle">از پروژه‌های ذخیره شده برای صدور انوایس</div>
                    </div>
                </div>
                ${list.length === 0 ? `
                    <div class="empty" style="padding:var(--space-6);">
                        <div class="empty__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
                        <h3 class="empty__title">پروژه‌ای وجود ندارد</h3>
                        <p class="empty__text">ابتدا یک پروژه از بخش برآورد ایجاد کنید</p>
                        <a class="btn btn--primary" data-route="quick-estimate" style="cursor:pointer;display:inline-flex;margin-top:var(--space-3);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                            ساخت پروژه
                        </a>
                    </div>
                ` : `
                    <div class="list">
                        ${list.slice(0, 10).map((p) => `
                            <div class="list-item" data-pick-project="${p.id}">
                                <div class="list-item__icon" style="background:rgba(245,158,11,0.15);color:var(--color-sun-300);">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                                </div>
                                <div class="list-item__body">
                                    <div class="list-item__title">${Utils.escapeHTML(p.name)}</div>
                                    <div class="list-item__subtitle">${Utils.formatNumber(p.actualPvKw || p.requiredPvKw || 0, 1)} kW · ${Utils.formatDate(p.updatedAt)}</div>
                                </div>
                                <div class="list-item__action">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="9 18 15 12 9 6"/></svg>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>

            ${invoicesList.length > 0 ? `
                <div class="section" style="margin-top:var(--space-6);">
                    <div class="section__header">
                        <h2 class="section__title">📋 انوایس‌های صادر شده</h2>
                        <span class="chip">${Utils.toPersian(invoicesList.length)} مورد</span>
                    </div>
                    <div class="list stagger">
                        ${invoicesList.slice(0, 10).map((inv) => `
                            <div class="list-item" data-inv-id="${inv.id}">
                                <div class="list-item__icon" style="background:rgba(139,92,246,0.15);color:var(--color-violet-400);">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                </div>
                                <div class="list-item__body">
                                    <div class="list-item__title">${Utils.escapeHTML(inv.number)}</div>
                                    <div class="list-item__subtitle">${Utils.escapeHTML(inv.customerName || 'بدون نام')} · ${Utils.formatDate(inv.createdAt)}</div>
                                </div>
                                <div style="text-align:left;">
                                    <div style="font-weight:800;color:var(--color-emerald-400);">${Utils.formatNumber(Math.round(inv.total))} $</div>
                                    <div style="display:flex;gap:4px;margin-top:4px;">
                                        <button class="btn btn--ghost btn--sm" data-action="view-inv" data-id="${inv.id}" title="مشاهده">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                        </button>
                                        <button class="btn btn--ghost btn--sm" data-action="print-inv" data-id="${inv.id}" title="چاپ">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                                        </button>
                                        <button class="btn btn--ghost btn--sm" data-action="del-inv" data-id="${inv.id}" title="حذف" style="color:var(--color-red-400);">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    },

    _renderForm(project, company, taxRate) {
        if (this.state.items.length === 0) {
            this.state.items = this._buildItems(project);
        }
        const subtotal = this._total();
        const tax = subtotal * (taxRate / 100);
        const grandTotal = subtotal + tax;

        return `
            <form id="invoiceForm" class="anim-fade-up" novalidate>
                <!-- Selected project info -->
                <div class="card card--sun" style="padding:var(--space-4);margin-bottom:var(--space-4);border-radius:var(--radius-xl);">
                    <div style="display:flex;align-items:center;gap:var(--space-3);">
                        <div class="card__icon card__icon--sun" style="width:48px;height:48px;flex-shrink:0;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                        </div>
                        <div style="flex:1;min-width:0;color:var(--color-text-inverse);">
                            <p style="opacity:0.7;font-size:var(--font-size-xs);font-weight:600;">پروژه انتخاب شده</p>
                            <h3 style="font-weight:800;font-size:var(--font-size-md);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${Utils.escapeHTML(project.name)}</h3>
                        </div>
                        <button type="button" class="btn btn--icon" data-action="change-project" style="background:rgba(0,0,0,0.2);color:var(--color-text-inverse);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                        </button>
                    </div>
                </div>

                <!-- Customer info -->
                <div class="card card--glass section">
                    <div class="card__header">
                        <div class="card__icon card__icon--sky">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        </div>
                        <div>
                            <div class="card__title">اطلاعات مشتری</div>
                            <div class="card__subtitle">برای صدور انوایس</div>
                        </div>
                    </div>
                    <div class="field">
                        <label class="field__label field__label--required">نام مشتری</label>
                        <input type="text" class="input" name="customerName" required placeholder="نام و نام خانوادگی">
                    </div>
                    <div class="field">
                        <label class="field__label">شماره تماس</label>
                        <input type="tel" class="input" name="customerPhone" placeholder="۰۷xxxxxxxxx">
                    </div>
                    <div class="field">
                        <label class="field__label">آدرس</label>
                        <textarea class="textarea" name="customerAddress" placeholder="آدرس کامل پروژه" rows="2"></textarea>
                    </div>
                </div>

                <!-- Items -->
                <div class="card card--glass section">
                    <div class="card__header">
                        <div class="card__icon card__icon--emerald">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/></svg>
                        </div>
                        <div>
                            <div class="card__title">اقلام پیش‌فاکتور</div>
                            <div class="card__subtitle">${Utils.toPersian(this.state.items.length)} قلم</div>
                        </div>
                        <button type="button" class="btn btn--primary btn--sm" data-action="add-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            افزودن
                        </button>
                    </div>
                    <div class="list" id="invoiceItems">${this._renderItems()}</div>
                </div>

                <!-- Notes -->
                <div class="card card--glass section">
                    <div class="field">
                        <label class="field__label">یادداشت و شرایط</label>
                        <textarea class="textarea" name="notes" rows="3" placeholder="شرایط پرداخت، گارانتی، زمان تحویل، توضیحات...">${Utils.escapeHTML(this.state.notes)}</textarea>
                    </div>
                </div>

                <!-- Totals -->
                <div class="card card--sun" style="padding:var(--space-5);border-radius:var(--radius-2xl);">
                    <div style="display:flex;flex-direction:column;gap:var(--space-2);color:var(--color-text-inverse);">
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <span style="opacity:0.85;">جمع جزء</span>
                            <span style="font-weight:700;font-size:var(--font-size-lg);">${Utils.formatNumber(Math.round(subtotal))} $</span>
                        </div>
                        ${taxRate > 0 ? `
                        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:var(--space-2);border-top:1px solid rgba(0,0,0,0.15);">
                            <span style="opacity:0.85;">مالیات (${Utils.toPersian(taxRate)}%)</span>
                            <span style="font-weight:700;">${Utils.formatNumber(Math.round(tax))} $</span>
                        </div>` : ''}
                        <div style="display:flex;justify-content:space-between;align-items:center;padding-top:var(--space-3);border-top:2px solid rgba(0,0,0,0.2);">
                            <span style="font-size:var(--font-size-md);font-weight:600;">مجموع کل</span>
                            <span style="font-weight:900;font-size:var(--font-size-4xl);line-height:1;">${Utils.formatNumber(Math.round(grandTotal))} $</span>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);margin-top:var(--space-4);">
                    <button type="button" class="btn btn--secondary btn--block" data-action="preview">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        پیش‌نمایش
                    </button>
                    <button type="submit" class="btn btn--primary btn--block">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                        صدور انوایس
                    </button>
                </div>
            </form>
        `;
    },

    _renderItems() {
        return this.state.items.map((it, idx) => `
            <div class="result anim-fade-up" data-idx="${idx}" style="cursor:default;">
                <div class="result__icon ${idx % 3 === 0 ? '' : idx % 3 === 1 ? 'result__icon--sky' : 'result__icon--emerald'}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                </div>
                <div class="result__body">
                    <input type="text" class="input item-name" data-idx="${idx}" value="${Utils.escapeHTML(it.name)}" placeholder="نام قلم" style="background:transparent;border:none;padding:0;font-weight:700;font-size:var(--font-size-md);color:var(--color-text);min-height:auto;margin-bottom:4px;">
                    <div class="result__meta" style="display:flex;align-items:center;gap:var(--space-2);flex-wrap:wrap;">
                        <input type="number" class="input item-qty" data-idx="${idx}" value="${it.qty}" min="1" style="width:60px;min-height:32px;padding:0 8px;font-size:var(--font-size-sm);text-align:center;" title="تعداد">
                        <span style="color:var(--color-text-muted);">×</span>
                        <input type="number" class="input item-price" data-idx="${idx}" value="${it.price}" min="0" step="0.01" style="width:90px;min-height:32px;padding:0 8px;font-size:var(--font-size-sm);text-align:center;" title="قیمت واحد">
                        <span style="color:var(--color-text-muted);">$</span>
                    </div>
                </div>
                <div class="result__price">
                    <div class="result__price-value" data-line-total="${idx}">${Utils.formatNumber(Math.round(it.qty * it.price))}</div>
                    <div class="result__price-label">$</div>
                </div>
                <button type="button" class="btn btn--icon item-rm" data-idx="${idx}" style="background:rgba(239,68,68,0.1);color:var(--color-red-400);flex-shrink:0;">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
            </div>
        `).join('');
    },

    _buildItems(project) {
        const items = [];
        const sizing = {
            numPanels: project.numPanels,
            panelWatt: project.panelWatt || 550,
            inverter: project.inverter,
            numBatteries: project.numBatteries,
            battery: project.battery,
            actualPvKw: project.actualPvKw || project.requiredPvKw || 1
        };
        const bom = buildBOM(sizing);
        return bom.map((b) => ({ name: b.name, qty: b.qty, price: b.unitPrice }));
    },

    _total() {
        return this.state.items.reduce((s, it) => s + ((+it.qty || 0) * (+it.price || 0)), 0);
    },

    attach() {
        // Tabs
        document.querySelectorAll('#invTabs .tab').forEach((tab) => {
            tab.addEventListener('click', () => {
                const which = tab.dataset.tab;
                if (which === 'new') {
                    this.state.selectedProjectId = null;
                    this.state.items = [];
                    this._refresh();
                }
            });
        });

        // Project picker
        document.querySelectorAll('[data-pick-project]').forEach((el) => {
            el.addEventListener('click', () => {
                this.state.selectedProjectId = el.dataset.pickProject;
                this.state.items = [];
                const proj = projects.get(this.state.selectedProjectId);
                if (proj?.invoice) {
                    this.state.notes = proj.invoice.notes || '';
                }
                this._refresh();
            });
        });

        // Change project
        document.querySelector('[data-action="change-project"]')?.addEventListener('click', () => {
            this.state.selectedProjectId = null;
            this.state.items = [];
            this._refresh();
        });

        // Item actions
        this._bindItemEvents();

        // Form
        const form = document.getElementById('invoiceForm');
        if (form) {
            // Customer fields
            form.querySelector('[name="customerName"]')?.addEventListener('input', (e) => { this._draft.customerName = e.target.value; });
            form.querySelector('[name="customerPhone"]')?.addEventListener('input', (e) => { this._draft.customerPhone = e.target.value; });
            form.querySelector('[name="customerAddress"]')?.addEventListener('input', (e) => { this._draft.customerAddress = e.target.value; });
            form.querySelector('[name="notes"]')?.addEventListener('input', (e) => { this.state.notes = e.target.value; });

            // Add item
            form.querySelector('[data-action="add-item"]')?.addEventListener('click', () => this._addItem());

            // Preview
            form.querySelector('[data-action="preview"]')?.addEventListener('click', () => this._preview());

            // Submit
            form.addEventListener('submit', (e) => { e.preventDefault(); this._submit(); });
        }

        // Existing invoice actions
        document.querySelectorAll('[data-action="view-inv"]').forEach((btn) => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); this._view(btn.dataset.id); });
        });
        document.querySelectorAll('[data-action="print-inv"]').forEach((btn) => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); this._print(btn.dataset.id); });
        });
        document.querySelectorAll('[data-action="del-inv"]').forEach((btn) => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const ok = await modal.confirm({ title: 'حذف انوایس', message: 'این انوایس برای همیشه حذف می‌شود. مطمئن هستید؟', danger: true, confirmText: 'حذف' });
                if (ok) { invoices.remove(btn.dataset.id); toast.success('انوایس حذف شد'); this._refresh(); }
            });
        });
    },

    _bindItemEvents() {
        const itemsEl = document.getElementById('invoiceItems');
        if (!itemsEl) return;

        // Remove item
        itemsEl.querySelectorAll('.item-rm').forEach((btn) => {
            btn.addEventListener('click', () => {
                const idx = +btn.dataset.idx;
                this.state.items.splice(idx, 1);
                this._refreshItems();
            });
        });

        // Live edit
        itemsEl.querySelectorAll('.item-qty').forEach((input) => {
            input.addEventListener('input', (e) => {
                const idx = +input.dataset.idx;
                this.state.items[idx].qty = +e.target.value || 0;
                this._updateLineTotal(idx);
            });
        });
        itemsEl.querySelectorAll('.item-price').forEach((input) => {
            input.addEventListener('input', (e) => {
                const idx = +input.dataset.idx;
                this.state.items[idx].price = +e.target.value || 0;
                this._updateLineTotal(idx);
            });
        });
        itemsEl.querySelectorAll('.item-name').forEach((input) => {
            input.addEventListener('input', (e) => {
                const idx = +input.dataset.idx;
                this.state.items[idx].name = e.target.value;
            });
        });
    },

    _updateLineTotal(idx) {
        const it = this.state.items[idx];
        if (!it) return;
        const el = document.querySelector(`[data-line-total="${idx}"]`);
        if (el) el.textContent = Utils.formatNumber(Math.round(it.qty * it.price));
        this._updateGrandTotal();
    },

    _updateGrandTotal() {
        const taxRate = settings.get('taxRate', 0);
        const subtotal = this._total();
        const tax = subtotal * (taxRate / 100);
        const total = subtotal + tax;
        // Update total display — find the "مجموع کل" line
        const allRows = document.querySelectorAll('.card--sun > div > div');
        if (allRows.length >= 2) {
            // Last row is grand total
            const lastRow = allRows[allRows.length - 1];
            const spans = lastRow.querySelectorAll('span');
            if (spans.length >= 2) {
                spans[spans.length - 1].textContent = Utils.formatNumber(Math.round(total)) + ' $';
            }
        }
    },

    _draft: { customerName: '', customerPhone: '', customerAddress: '' },

    async _addItem() {
        const name = await modal.prompt({ title: 'افزودن قلم', label: 'نام قلم', placeholder: 'مثلاً کابل اضافی' });
        if (!name) return;
        const priceStr = await modal.prompt({ title: 'قیمت واحد', label: 'قیمت واحد ($)', type: 'number', defaultValue: '100' });
        const price = parseFloat(priceStr);
        const qtyStr = await modal.prompt({ title: 'تعداد', label: 'تعداد', type: 'number', defaultValue: '1' });
        const qty = parseInt(qtyStr, 10) || 1;
        this.state.items.push({ name, qty, price: isNaN(price) ? 0 : price });
        this._refreshItems();
    },

    _refreshItems() {
        const el = document.getElementById('invoiceItems');
        if (el) el.innerHTML = this._renderItems();
        this._bindItemEvents();
        this._updateGrandTotal();
    },

    _refresh() {
        const view = document.getElementById('view');
        if (view) { view.innerHTML = this.render(); this.attach(); }
    },

    _buildInvoiceHTML(data) {
        const { number, company, project, customer, items, notes, taxRate, subtotal, tax, total, date } = data;
        return `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<title>پیش‌فاکتور ${number}</title>
<style>
@page { size: A4; margin: 1.5cm; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Tahoma', 'Vazirmatn', sans-serif; color: #1a1a1a; line-height: 1.6; padding: 20px; }
.header { display: flex; justify-content: space-between; align-items: start; border-bottom: 3px solid #f59e0b; padding-bottom: 20px; margin-bottom: 30px; }
.brand { display: flex; align-items: center; gap: 12px; }
.logo { width: 56px; height: 56px; border-radius: 12px; background: linear-gradient(135deg, #fbbf24, #f97316); color: white; display: flex; align-items: center; justify-content: center; font-size: 28px; }
.brand h1 { color: #f59e0b; font-size: 22px; }
.brand small { color: #666; font-size: 12px; }
.title-block { text-align: left; }
.title-block h2 { color: #1a1a1a; font-size: 24px; }
.title-block p { color: #666; font-size: 12px; }
.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
.info-card { background: #fef3c7; border-radius: 8px; padding: 15px; }
.info-card h3 { color: #d97706; font-size: 13px; margin-bottom: 8px; }
.info-card p { font-size: 13px; margin: 3px 0; }
table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
th { background: #fef3c7; color: #92400e; padding: 10px 8px; text-align: right; font-weight: 700; border: 1px solid #fbbf24; }
td { padding: 10px 8px; border: 1px solid #e5e7eb; }
tr:nth-child(even) td { background: #fffbeb; }
.text-center { text-align: center; }
.text-left { text-align: left; }
.totals { width: 50%; margin-right: auto; }
.totals tr td { border: none; padding: 6px 8px; }
.totals tr.grand td { background: linear-gradient(135deg, #fbbf24, #f97316); color: white; font-weight: 800; font-size: 16px; padding: 12px; border-radius: 8px; }
.notes { background: #f9fafb; border-right: 4px solid #f59e0b; padding: 12px; margin-top: 20px; border-radius: 4px; font-size: 13px; }
.footer { margin-top: 40px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #e5e7eb; padding-top: 15px; }
.signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 50px; }
.signature { border-top: 1px solid #1a1a1a; padding-top: 8px; text-align: center; font-size: 12px; }
</style>
</head>
<body>
<div class="header">
    <div class="brand">
        <div class="logo">☀️</div>
        <div>
            <h1>${Utils.escapeHTML(company)}</h1>
            <small>Solaren Pro</small>
        </div>
    </div>
    <div class="title-block">
        <h2>پیش‌فاکتور</h2>
        <p>شماره: <strong>${number}</strong></p>
        <p>تاریخ: <strong>${date}</strong></p>
    </div>
</div>

<div class="info-grid">
    <div class="info-card">
        <h3>👤 مشتری</h3>
        <p><strong>${Utils.escapeHTML(customer.name || '—')}</strong></p>
        <p>${Utils.escapeHTML(customer.phone || '—')}</p>
        <p>${Utils.escapeHTML(customer.address || '—')}</p>
    </div>
    <div class="info-card">
        <h3>📁 پروژه</h3>
        <p><strong>${Utils.escapeHTML(project.name)}</strong></p>
        <p>ظرفیت: ${Utils.formatNumber(project.actualPvKw || project.requiredPvKw || 0, 2)} kW</p>
        <p>نوع: ${project.systemType === 'on-grid' ? 'آنگرید' : project.systemType === 'off-grid' ? 'آفگرید' : 'هیبرید'}</p>
    </div>
</div>

<table>
    <thead>
        <tr>
            <th style="width:40px;">#</th>
            <th>شرح</th>
            <th style="width:60px;" class="text-center">تعداد</th>
            <th style="width:100px;" class="text-center">قیمت واحد</th>
            <th style="width:100px;" class="text-center">جمع</th>
        </tr>
    </thead>
    <tbody>
        ${items.map((it, i) => `
        <tr>
            <td class="text-center">${Utils.toPersian(i + 1)}</td>
            <td>${Utils.escapeHTML(it.name)}</td>
            <td class="text-center">${Utils.toPersian(it.qty)}</td>
            <td class="text-center">${Utils.formatNumber(Math.round(it.price))} $</td>
            <td class="text-center"><strong>${Utils.formatNumber(Math.round(it.qty * it.price))} $</strong></td>
        </tr>
        `).join('')}
    </tbody>
</table>

<table class="totals">
    <tr><td>جمع جزء</td><td class="text-left"><strong>${Utils.formatNumber(Math.round(subtotal))} $</strong></td></tr>
    ${taxRate > 0 ? `<tr><td>مالیات (${Utils.toPersian(taxRate)}%)</td><td class="text-left"><strong>${Utils.formatNumber(Math.round(tax))} $</strong></td></tr>` : ''}
    <tr class="grand"><td>مجموع کل</td><td class="text-left">${Utils.formatNumber(Math.round(total))} $</td></tr>
</table>

${notes ? `<div class="notes"><strong>یادداشت:</strong><br>${Utils.escapeHTML(notes)}</div>` : ''}

<div class="signatures">
    <div class="signature">امضای مشتری</div>
    <div class="signature">مهر و امضای فروشنده</div>
</div>

<div class="footer">
    ${Utils.escapeHTML(company)} — نرم‌افزار Solaren Pro — ۱۴۰۵
</div>
</body>
</html>`;
    },

    _preview() {
        const form = document.getElementById('invoiceForm');
        const customer = {
            name: form.querySelector('[name="customerName"]')?.value || '',
            phone: form.querySelector('[name="customerPhone"]')?.value || '',
            address: form.querySelector('[name="customerAddress"]')?.value || ''
        };
        const project = projects.get(this.state.selectedProjectId);
        if (!project) return;
        const company = settings.get('company', 'Solaren Pro');
        const taxRate = settings.get('taxRate', 0);
        const subtotal = this._total();
        const tax = subtotal * (taxRate / 100);
        const total = subtotal + tax;
        const number = 'INV-' + Date.now().toString(36).toUpperCase().slice(-6);
        const date = Utils.formatDate(new Date());
        const items = this.state.items;
        const notes = this.state.notes;

        const html = this._buildInvoiceHTML({ number, company, project, customer, items, notes, taxRate, subtotal, tax, total, date });
        const w = window.open('', '_blank');
        if (w) {
            w.document.write(html);
            w.document.close();
            w.focus();
        } else {
            toast.warning('پنجره پاپ‌آپ مسدود است. لطفاً اجازه دهید.');
            // Fallback: show in modal
            const iframe = document.createElement('iframe');
            iframe.style.cssText = 'width:100%;height:70vh;border:none;border-radius:var(--radius-md);background:white;';
            iframe.srcdoc = html;
            modal.open({ title: 'پیش‌نمایش انوایس ' + number, body: iframe, footer: '<button class="btn btn--primary btn--block" data-close-modal>بستن</button>' });
        }
    },

    _print(id) {
        const inv = invoices.get(id);
        if (!inv) return;
        const project = projects.get(inv.projectId) || { name: 'پروژه' };
        const company = settings.get('company', 'Solaren Pro');
        const taxRate = settings.get('taxRate', 0);
        const subtotal = inv.total;
        const tax = subtotal * (taxRate / 100);
        const total = subtotal + tax;
        const html = this._buildInvoiceHTML({
            number: inv.number, company, project,
            customer: { name: inv.customerName, phone: inv.customerPhone, address: inv.customerAddress },
            items: inv.items, notes: inv.notes, taxRate, subtotal, tax, total, date: Utils.formatDate(new Date(inv.createdAt))
        });
        const w = window.open('', '_blank');
        if (w) {
            w.document.write(html);
            w.document.close();
            w.focus();
            setTimeout(() => w.print(), 300);
        }
    },

    _view(id) {
        this._print(id);
    },

    _submit() {
        const form = document.getElementById('invoiceForm');
        const customer = {
            name: form.querySelector('[name="customerName"]')?.value || '',
            phone: form.querySelector('[name="customerPhone"]')?.value || '',
            address: form.querySelector('[name="customerAddress"]')?.value || ''
        };
        if (!customer.name.trim()) {
            toast.error('نام مشتری الزامی است');
            return;
        }
        const project = projects.get(this.state.selectedProjectId);
        if (!project) {
            toast.error('پروژه انتخاب نشده');
            return;
        }
        if (this.state.items.length === 0) {
            toast.error('حداقل یک قلم لازم است');
            return;
        }
        const taxRate = settings.get('taxRate', 0);
        const subtotal = this._total();
        const tax = subtotal * (taxRate / 100);
        const total = subtotal + tax;
        const number = 'INV-' + Date.now().toString(36).toUpperCase().slice(-6);
        const invoice = {
            id: 'inv-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
            number, projectId: project.id, projectName: project.name,
            customerName: customer.name, customerPhone: customer.phone, customerAddress: customer.address,
            notes: this.state.notes, items: Utils.clone(this.state.items),
            subtotal, tax, total, taxRate, createdAt: Date.now()
        };
        invoices.save(invoice);
        project.invoice = invoice;
        projects.save(project);
        // Add/update customer
        if (customer.name) {
            const existing = customers.list().find((c) => (c.phone && customer.phone && c.phone === customer.phone) || c.name === customer.name);
            if (existing) {
                existing.lastUsed = Date.now();
                customers.save(existing);
            } else {
                customers.save({ name: customer.name, phone: customer.phone, address: customer.address, lastUsed: Date.now() });
            }
        }
        toast.success(`انوایس ${number} صادر شد`);
        // Auto-open preview
        setTimeout(() => this._print(invoice.id), 400);
        // Reset
        this.state.selectedProjectId = null;
        this.state.items = [];
        this.state.notes = '';
        this._refresh();
    }
};
