/**
 * Visual System Designer v1
 * Interactive panel layout designer with roof area calculation
 */
import { Utils } from '../utils.js';
import { toast } from '../ui.js';
import { projects } from '../store.js';

export const designer = {
    name: 'designer',
    path: '#designer',

    state: {
        roofWidth: 10,
        roofHeight: 6,
        panelWatt: 550,
        panelWidth: 1.134,
        panelHeight: 2.278,
        orientation: 'portrait', // portrait or landscape
        setback: 0.5, // distance from edge
        rowsCount: 0,
        colsCount: 0,
        placedPanels: [],
        obstacles: [],
        mode: 'panel', // 'panel' or 'obstacle'
        obstacleType: 'skylight',
        drawing: false,
        dragStart: null
    },

    // Standard panel dimensions (in meters)
    PANEL_DIMS: {
        450: { w: 1.052, h: 2.115 },
        550: { w: 1.134, h: 2.278 },
        410: { w: 1.134, h: 1.722 },
        200: { w: 0.680, h: 1.500 }
    },

    render() {
        return `
            <h1 class="page-title anim-fade-up">طراح بصری سیستم</h1>
            <p class="page-subtitle anim-fade-up">چیدمان پنل‌ها روی سقف یا زمین</p>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--violet">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                    </div>
                    <div>
                        <div class="card__title">مشخصات سقف</div>
                        <div class="card__subtitle">ابعاد و نوع پنل</div>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);">
                    <div class="field" style="margin-bottom:0;">
                        <label class="field__label">عرض (متر)</label>
                        <input type="number" class="input" id="dgWidth" min="2" max="50" step="0.5" value="${this.state.roofWidth}">
                    </div>
                    <div class="field" style="margin-bottom:0;">
                        <label class="field__label">طول (متر)</label>
                        <input type="number" class="input" id="dgHeight" min="2" max="100" step="0.5" value="${this.state.roofHeight}">
                    </div>
                </div>
                <div class="field">
                    <label class="field__label">توان پنل</label>
                    <div class="switch-group" id="dgPanelWatt">
                        <button class="${this.state.panelWatt === 450 ? 'is-active' : ''}" data-val="450">۴۵۰W</button>
                        <button class="${this.state.panelWatt === 550 ? 'is-active' : ''}" data-val="550">۵۵۰W</button>
                    </div>
                </div>
                <div class="field">
                    <label class="field__label">جهت پنل</label>
                    <div class="switch-group" id="dgOrientation">
                        <button class="${this.state.orientation === 'portrait' ? 'is-active' : ''}" data-val="portrait">عمودی</button>
                        <button class="${this.state.orientation === 'landscape' ? 'is-active' : ''}" data-val="landscape">افقی</button>
                    </div>
                </div>
                <div class="field">
                    <label class="field__label">فاصله از لبه (متر)</label>
                    <input type="number" class="input" id="dgSetback" min="0" max="3" step="0.1" value="${this.state.setback}">
                    <p class="field__hint">برای ایمنی و نگهداری</p>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--sky">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                    </div>
                    <div>
                        <div class="card__title">عملیات</div>
                        <div class="card__subtitle">چیدمان خودکار یا دستی</div>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);">
                    <button class="btn btn--primary" id="autoLayout">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                        چیدمان خودکار
                    </button>
                    <button class="btn btn--danger" id="clearLayout">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
                        پاک کردن
                    </button>
                </div>
                <button class="btn btn--secondary btn--block" id="addObstacleBtn" style="margin-top:var(--space-2);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/></svg>
                    افزودن مانع (پنجره، دودکش)
                </button>
            </div>

            <div class="card card--glass section anim-fade-up" style="padding:var(--space-3);">
                <div style="position:relative;background:var(--color-bg-soft);border-radius:var(--radius-md);overflow:hidden;">
                    <svg id="roofCanvas" viewBox="0 0 600 ${Math.max(360, this.state.roofHeight / this.state.roofWidth * 600)}" style="width:100%;height:auto;display:block;cursor:crosshair;touch-action:none;">
                        <defs>
                            <pattern id="roofGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--color-border)" stroke-width="0.5"/>
                            </pattern>
                            <linearGradient id="panelGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.8"/>
                                <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0.9"/>
                            </linearGradient>
                        </defs>
                        <rect id="roofArea" x="0" y="0" width="600" height="${Math.max(360, this.state.roofHeight / this.state.roofWidth * 600)}" fill="url(#roofGrid)"/>
                        <rect x="0" y="0" width="600" height="${Math.max(360, this.state.roofHeight / this.state.roofWidth * 600)}" fill="none" stroke="var(--color-text-muted)" stroke-width="2"/>
                        <g id="obstaclesGroup"></g>
                        <g id="panelsGroup"></g>
                    </svg>
                </div>
                <div style="display:flex;justify-content:space-between;margin-top:var(--space-3);font-size:var(--font-size-xs);color:var(--color-text-muted);">
                    <span>${this.state.roofWidth}m × ${this.state.roofHeight}m</span>
                    <span id="dgCount">${Utils.toPersian(this.state.placedPanels.length)} پنل</span>
                </div>
            </div>

            <div id="dgResult" class="card card--sun anim-fade-up" style="padding:var(--space-5);margin-top:var(--space-4);color:white;display:none;">
                <h3 style="color:white;margin-bottom:var(--space-3);">📊 نتیجه چیدمان</h3>
                <div class="stats" style="grid-template-columns:repeat(2,1fr);">
                    <div style="text-align:center;padding:var(--space-3);background:rgba(0,0,0,0.15);border-radius:var(--radius-md);">
                        <div style="opacity:0.85;font-size:var(--font-size-xs);">تعداد پنل</div>
                        <div id="dgCount2" style="font-weight:800;font-size:var(--font-size-2xl);">۰</div>
                    </div>
                    <div style="text-align:center;padding:var(--space-3);background:rgba(0,0,0,0.15);border-radius:var(--radius-md);">
                        <div style="opacity:0.85;font-size:var(--font-size-xs);">ظرفیت کل</div>
                        <div id="dgCapacity" style="font-weight:800;font-size:var(--font-size-2xl);">۰ kW</div>
                    </div>
                    <div style="text-align:center;padding:var(--space-3);background:rgba(0,0,0,0.15);border-radius:var(--radius-md);">
                        <div style="opacity:0.85;font-size:var(--font-size-xs);">مساحت اشغال</div>
                        <div id="dgArea" style="font-weight:800;font-size:var(--font-size-2xl);">۰ m²</div>
                    </div>
                    <div style="text-align:center;padding:var(--space-3);background:rgba(0,0,0,0.15);border-radius:var(--radius-md);">
                        <div style="opacity:0.85;font-size:var(--font-size-xs);">پوشش سقف</div>
                        <div id="dgCoverage" style="font-weight:800;font-size:var(--font-size-2xl);">۰٪</div>
                    </div>
                </div>
            </div>
        `;
    },

    attach() {
        this._refresh();
        this._bindEvents();
    },

    _refresh() {
        const view = document.getElementById('view');
        if (view) { view.innerHTML = this.render(); this.attach = this._refreshAndBind; this._bindEvents(); }
    },

    _refreshAndBind() {
        this._bindEvents();
    },

    _bindEvents() {
        document.getElementById('dgWidth')?.addEventListener('input', (e) => { this.state.roofWidth = parseFloat(e.target.value) || 10; this._redraw(); });
        document.getElementById('dgHeight')?.addEventListener('input', (e) => { this.state.roofHeight = parseFloat(e.target.value) || 6; this._redraw(); });
        document.getElementById('dgSetback')?.addEventListener('input', (e) => { this.state.setback = parseFloat(e.target.value) || 0.5; this._redraw(); });

        document.querySelectorAll('#dgPanelWatt button').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.panelWatt = +btn.dataset.val;
                const dims = this.PANEL_DIMS[this.state.panelWatt];
                this.state.panelWidth = this.state.orientation === 'portrait' ? dims.w : dims.h;
                this.state.panelHeight = this.state.orientation === 'portrait' ? dims.h : dims.w;
                document.querySelectorAll('#dgPanelWatt button').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                this._redraw();
            });
        });

        document.querySelectorAll('#dgOrientation button').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.orientation = btn.dataset.val;
                const dims = this.PANEL_DIMS[this.state.panelWatt];
                this.state.panelWidth = this.state.orientation === 'portrait' ? dims.w : dims.h;
                this.state.panelHeight = this.state.orientation === 'portrait' ? dims.h : dims.w;
                document.querySelectorAll('#dgOrientation button').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                this._redraw();
            });
        });

        document.getElementById('autoLayout')?.addEventListener('click', () => this._autoLayout());
        document.getElementById('clearLayout')?.addEventListener('click', () => { this.state.placedPanels = []; this._redraw(); });
        document.getElementById('addObstacleBtn')?.addEventListener('click', () => this._addObstaclePrompt());

        this._setupDimensions();
        this._redraw();
    },

    _setupDimensions() {
        const dims = this.PANEL_DIMS[this.state.panelWatt];
        this.state.panelWidth = this.state.orientation === 'portrait' ? dims.w : dims.h;
        this.state.panelHeight = this.state.orientation === 'portrait' ? dims.h : dims.w;
    },

    _addObstaclePrompt() {
        const wStr = prompt('عرض مانع (متر):', '1');
        if (!wStr) return;
        const hStr = prompt('طول مانع (متر):', '1');
        if (!hStr) return;
        const w = parseFloat(wStr) || 1;
        const h = parseFloat(hStr) || 1;
        // Default position
        this.state.obstacles.push({ x: 1, y: 1, w, h });
        this._redraw();
        toast.success('مانع اضافه شد - با کلیک روی آن جابجا کنید');
    },

    _autoLayout() {
        this._setupDimensions();
        const scaleX = 600 / this.state.roofWidth;
        const scaleY = (Math.max(360, this.state.roofHeight / this.state.roofWidth * 600)) / this.state.roofHeight;
        const setbackPx = this.state.setback * Math.min(scaleX, scaleY);
        const panelWPx = this.state.panelWidth * scaleX;
        const panelHPx = this.state.panelHeight * scaleY;
        const gapPx = 0.02 * 600; // 2cm gap

        const panels = [];
        const obstacles = this.state.obstacles.map((o) => ({ x: o.x * scaleX, y: o.y * scaleY, w: o.w * scaleX, h: o.h * scaleY }));

        const isColliding = (x, y, w, h) => {
            for (const o of obstacles) {
                if (x < o.x + o.w && x + w > o.x && y < o.y + o.h && y + h > o.y) return true;
            }
            for (const p of panels) {
                if (x < p.x + p.w && x + p.w > p.x && y < p.y + p.h && y + p.h > p.y) return true;
            }
            return false;
        };

        let y = setbackPx;
        while (y + panelHPx <= 600 - setbackPx) {
            let x = setbackPx;
            while (x + panelWPx <= 600 - setbackPx) {
                if (!isColliding(x, y, panelWPx, panelHPx)) {
                    panels.push({ x, y, w: panelWPx, h: panelHPx });
                }
                x += panelWPx + gapPx;
            }
            y += panelHPx + gapPx;
        }

        this.state.placedPanels = panels;
        this._redraw();
        toast.success(`${Utils.toPersian(panels.length)} پنل چیدمان شد`);
    },

    _redraw() {
        const canvas = document.getElementById('roofCanvas');
        if (!canvas) return;
        const height = Math.max(360, this.state.roofHeight / this.state.roofWidth * 600);
        canvas.setAttribute('viewBox', `0 0 600 ${height}`);
        canvas.setAttribute('height', height);

        // Update size label
        const sizeLabel = document.querySelector('.card svg + div span:first-child');
        if (sizeLabel) sizeLabel.textContent = `${this.state.roofWidth}m × ${this.state.roofHeight}m`;

        // Obstacles
        const obstaclesGroup = document.getElementById('obstaclesGroup');
        if (obstaclesGroup) {
            const scaleX = 600 / this.state.roofWidth;
            const scaleY = height / this.state.roofHeight;
            obstaclesGroup.innerHTML = this.state.obstacles.map((o, idx) => `
                <rect x="${o.x * scaleX}" y="${o.y * scaleY}" width="${o.w * scaleX}" height="${o.h * scaleY}" fill="rgba(239,68,68,0.3)" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,2" data-obs-idx="${idx}" style="cursor:move"/>
                <text x="${(o.x + o.w / 2) * scaleX}" y="${(o.y + o.h / 2) * scaleY}" fill="#ef4444" font-size="11" text-anchor="middle" font-weight="bold">مانع ${idx + 1}</text>
            `).join('');

            // Drag obstacles
            let dragTarget = null, dragStart = null;
            obstaclesGroup.querySelectorAll('[data-obs-idx]').forEach((el) => {
                el.addEventListener('pointerdown', (e) => {
                    e.preventDefault();
                    dragTarget = +el.dataset.obsIdx;
                    const pt = canvas.createSVGPoint();
                    pt.x = e.clientX; pt.y = e.clientY;
                    const cursorpt = pt.matrixTransform(canvas.getScreenCTM().inverse());
                    dragStart = { x: cursorpt.x, y: cursorpt.y, ox: this.state.obstacles[dragTarget].x, oy: this.state.obstacles[dragTarget].y };
                });
            });
            const move = (e) => {
                if (dragTarget === null) return;
                const pt = canvas.createSVGPoint();
                pt.x = e.clientX; pt.y = e.clientY;
                const cursorpt = pt.matrixTransform(canvas.getScreenCTM().inverse());
                const dx = (cursorpt.x - dragStart.x) / scaleX;
                const dy = (cursorpt.y - dragStart.y) / scaleY;
                this.state.obstacles[dragTarget].x = Math.max(0, Math.min(this.state.roofWidth - this.state.obstacles[dragTarget].w, dragStart.ox + dx));
                this.state.obstacles[dragTarget].y = Math.max(0, Math.min(this.state.roofHeight - this.state.obstacles[dragTarget].h, dragStart.oy + dy));
                this._redraw();
            };
            const up = () => { dragTarget = null; };
            canvas.addEventListener('pointermove', move);
            canvas.addEventListener('pointerup', up);
        }

        // Panels
        const panelsGroup = document.getElementById('panelsGroup');
        if (panelsGroup) {
            panelsGroup.innerHTML = this.state.placedPanels.map((p, idx) => `
                <g data-panel-idx="${idx}">
                    <rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="url(#panelGrad)" stroke="#1e40af" stroke-width="0.5" rx="1"/>
                    <line x1="${p.x + p.w/2}" y1="${p.y}" x2="${p.x + p.w/2}" y2="${p.y + p.h}" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/>
                    <line x1="${p.x}" y1="${p.y + p.h/2}" x2="${p.x + p.w}" y2="${p.y + p.h/2}" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/>
                </g>
            `).join('');
        }

        // Update count
        const countEl = document.getElementById('dgCount');
        if (countEl) countEl.textContent = `${Utils.toPersian(this.state.placedPanels.length)} پنل`;

        // Show stats
        this._updateStats();
    },

    _updateStats() {
        const result = document.getElementById('dgResult');
        if (!result) return;
        if (this.state.placedPanels.length === 0) {
            result.style.display = 'none';
            return;
        }
        result.style.display = 'block';
        const scaleX = 600 / this.state.roofWidth;
        const scaleY = (Math.max(360, this.state.roofHeight / this.state.roofWidth * 600)) / this.state.roofHeight;
        const areaUsed = this.state.placedPanels.reduce((s, p) => s + (p.w / scaleX) * (p.h / scaleY), 0);
        const totalArea = this.state.roofWidth * this.state.roofHeight;
        const capacity = (this.state.placedPanels.length * this.state.panelWatt / 1000);

        const countEl = document.getElementById('dgCount2');
        const capEl = document.getElementById('dgCapacity');
        const areaEl = document.getElementById('dgArea');
        const covEl = document.getElementById('dgCoverage');
        if (countEl) countEl.textContent = Utils.toPersian(this.state.placedPanels.length);
        if (capEl) capEl.textContent = `${Utils.formatNumber(capacity, 2)} kW`;
        if (areaEl) areaEl.textContent = `${Utils.formatNumber(areaUsed, 1)} m²`;
        if (covEl) covEl.textContent = `${Utils.formatNumber(areaUsed / totalArea * 100, 1)}%`;
    }
};
