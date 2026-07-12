/**
 * Shading Analyzer v1 — Interactive solar shading analysis
 * Tool to analyze how obstacles affect solar panel production
 */
import { Utils } from '../utils.js';
import { toast } from '../ui.js';
import { LOCATIONS } from '../data/locations.js';
import { OBSTACLE_TYPES, SEASONS, calcSunPosition, calcShadowLength, calcShadingImpact, generateSolarPath } from '../data/shading.js';

export const shading = {
    name: 'shading',
    path: '#shading',

    state: {
        latitude: 34.5,
        location: 'kabul',
        date: 'summer',
        panelTilt: 30,
        obstacles: []
    },

    render() {
        return `
            <h1 class="page-title anim-fade-up">تحلیل سایه</h1>
            <p class="page-subtitle anim-fade-up">بررسی تأثیر موانع بر تولید پنل‌های خورشیدی</p>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--violet">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M12 2v8m0 0l-4-4m4 4l4-4M5 12h14"/></svg>
                    </div>
                    <div>
                        <div class="card__title">تنظیمات محل نصب</div>
                        <div class="card__subtitle">موقعیت و زاویه پنل</div>
                    </div>
                </div>
                <div class="field">
                    <label class="field__label">شهر / ولایت</label>
                    <select class="select" id="shLocation">
                        ${LOCATIONS.map((l) => `<option value="${l.id}" data-lat="${34 + (Math.random() * 4 - 2)}" ${l.id === this.state.location ? 'selected' : ''}>${Utils.escapeHTML(l.name)}</option>`).join('')}
                    </select>
                </div>
                <div class="field">
                    <label class="field__label field__label--required">عرض جغرافیایی</label>
                    <input type="number" class="input" id="shLat" value="${this.state.latitude}" step="0.1" min="-90" max="90">
                </div>
                <div class="field">
                    <label class="field__label">فصل</label>
                    <div class="switch-group" id="shSeason">
                        <button class="${this.state.date === 'summer' ? 'is-active' : ''}" data-val="summer">تابستان</button>
                        <button class="${this.state.date === 'spring' ? 'is-active' : ''}" data-val="spring">بهار/پاییز</button>
                        <button class="${this.state.date === 'winter' ? 'is-active' : ''}" data-val="winter">زمستان</button>
                    </div>
                </div>
                <div class="field">
                    <label class="field__label">شیب پنل (درجه)</label>
                    <div class="input-slider">
                        <input type="range" id="shTilt" min="0" max="60" value="${this.state.panelTilt}">
                        <input type="number" class="input" id="shTiltV" min="0" max="90" value="${this.state.panelTilt}">
                    </div>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--sun">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    <div>
                        <div class="card__title">موانع</div>
                        <div class="card__subtitle">${Utils.toPersian(this.state.obstacles.length)} مانع ثبت شده</div>
                    </div>
                    <button type="button" class="btn btn--primary btn--sm" id="addObstacleBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        افزودن
                    </button>
                </div>
                <div class="list" id="obstacleList"></div>
                <div id="obstacleEmpty" class="empty" ${this.state.obstacles.length > 0 ? 'hidden' : ''}>
                    <div class="empty__icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
                    </div>
                    <h3 class="empty__title">هنوز مانعی اضافه نشده</h3>
                    <p class="empty__text">برای شروع، درختان، ساختمان‌ها یا موانع اطراف پنل را اضافه کنید</p>
                </div>
            </div>

            <div id="shadingResult"></div>
        `;
    },

    attach() {
        this._renderObstacles();
        this._bindEvents();
    },

    _bindEvents() {
        const loc = document.getElementById('shLocation');
        const lat = document.getElementById('shLat');
        if (loc) {
            loc.addEventListener('change', () => {
                const opt = loc.options[loc.selectedIndex];
                const l = parseFloat(opt.dataset.lat);
                if (!isNaN(l)) {
                    this.state.latitude = l;
                    this.state.location = loc.value;
                    if (lat) lat.value = l;
                }
            });
        }
        if (lat) lat.addEventListener('input', () => { this.state.latitude = parseFloat(lat.value) || 34.5; });

        document.querySelectorAll('#shSeason button').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.date = btn.dataset.val;
                document.querySelectorAll('#shSeason button').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
            });
        });

        const tilt = document.getElementById('shTilt');
        const tiltV = document.getElementById('shTiltV');
        if (tilt) tilt.addEventListener('input', () => { this.state.panelTilt = +tilt.value; if (tiltV) tiltV.value = tilt.value; });
        if (tiltV) tiltV.addEventListener('input', () => { this.state.panelTilt = +tiltV.value || 30; if (tilt) tilt.value = this.state.panelTilt; });

        document.getElementById('addObstacleBtn')?.addEventListener('click', () => this._addObstacle());
    },

    _renderObstacles() {
        const list = document.getElementById('obstacleList');
        const empty = document.getElementById('obstacleEmpty');
        if (!list) return;
        if (this.state.obstacles.length === 0) {
            list.innerHTML = '';
            if (empty) empty.hidden = false;
            return;
        }
        if (empty) empty.hidden = true;

        const analysis = this._analyze();
        list.innerHTML = this.state.obstacles.map((o, idx) => {
            const result = analysis.results[idx];
            return `
                <div class="list-item anim-fade-up" style="cursor:default;">
                    <div class="list-item__icon" style="background:${this._obstacleColor(o.type)};">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">${this._obstacleIcon(o.type)}</svg>
                    </div>
                    <div class="list-item__body">
                        <div class="list-item__title">${Utils.escapeHTML(o.name)}</div>
                        <div class="list-item__subtitle">${Utils.formatNumber(o.height)}m ارتفاع · ${Utils.formatNumber(o.distance)}m فاصله · ${Utils.toPersian(o.azimuth)}°</div>
                    </div>
                    <div style="text-align:left;flex-shrink:0;min-width:80px;">
                        <div style="font-weight:800;color:${result.percent > 20 ? 'var(--color-red-400)' : result.percent > 5 ? 'var(--color-sun-300)' : 'var(--color-emerald-400)'};">${Utils.formatNumber(result.percent, 1)}%</div>
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">سایه</div>
                    </div>
                    <button type="button" class="btn btn--icon" data-rm="${idx}" style="background:rgba(239,68,68,0.1);color:var(--color-red-400);">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>
            `;
        }).join('');

        list.querySelectorAll('[data-rm]').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.obstacles.splice(+btn.dataset.rm, 1);
                this._renderObstacles();
            });
        });
    },

    _obstacleColor(type) {
        const colors = {
            'tree-small': 'rgba(16, 185, 129, 0.15)',
            'tree-medium': 'rgba(16, 185, 129, 0.2)',
            'tree-large': 'rgba(16, 185, 129, 0.25)',
            'building': 'rgba(139, 92, 246, 0.15)',
            'wall': 'rgba(245, 158, 11, 0.15)',
            'chimney': 'rgba(239, 68, 68, 0.15)',
            'mountain': 'rgba(99, 102, 241, 0.15)',
            'power-line': 'rgba(14, 165, 233, 0.15)'
        };
        return colors[type] || 'rgba(255,255,255,0.1)';
    },

    _obstacleIcon(type) {
        const icons = {
            'tree-small': '<path d="M12 2L8 8h3v6h2V8h3l-4-6zM10 14h4v8h-4z"/>',
            'tree-medium': '<path d="M12 2L6 10h3v4H8v8h8v-8h-1v-4h3L12 2z"/>',
            'tree-large': '<path d="M12 2L4 12h4v3H7v9h10v-9h-1v-3h4L12 2z"/>',
            'building': '<rect x="4" y="6" width="16" height="16" rx="1"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="8" y2="18"/><line x1="16" y1="18" x2="16" y2="18"/>',
            'wall': '<rect x="3" y="6" width="18" height="14"/><line x1="3" y1="13" x2="21" y2="13"/>',
            'chimney': '<rect x="9" y="2" width="6" height="20"/><rect x="7" y="0" width="10" height="3"/>',
            'mountain': '<path d="M2 22L8 8l4 8 3-4 7 10H2z"/>',
            'power-line': '<line x1="12" y1="2" x2="12" y2="22"/><line x1="6" y1="8" x2="18" y2="8"/><line x1="6" y1="14" x2="18" y2="14"/>'
        };
        return icons[type] || '<circle cx="12" cy="12" r="3"/>';
    },

    async _addObstacle() {
        try {
            // First prompt: select type
            const typesHtml = OBSTACLE_TYPES.map((t, i) => `
                <div class="list-item" data-otype="${t.id}" style="cursor:pointer;">
                    <div class="list-item__icon" style="background:${this._obstacleColor(t.id)};">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">${this._obstacleIcon(t.id)}</svg>
                    </div>
                    <div class="list-item__body">
                        <div class="list-item__title">${Utils.escapeHTML(t.name)}</div>
                        <div class="list-item__subtitle">${Utils.escapeHTML(t.description)} · ارتفاع ${t.heightRange[0]}-${t.heightRange[1]}m</div>
                    </div>
                </div>
            `).join('');
            modal.open({ title: 'انتخاب نوع مانع', body: `<div class="list" style="max-height:50vh;overflow-y:auto;">${typesHtml}</div>`, footer: null });
            const picked = await new Promise((resolve) => {
                document.querySelectorAll('[data-otype]').forEach((el) => {
                    el.addEventListener('click', () => { resolve(el.dataset.otype); modal.close(); }, { once: true });
                });
                document.addEventListener('keydown', function esc(e) {
                    if (e.key === 'Escape') { document.removeEventListener('keydown', esc); modal.close(); resolve(null); }
                });
            });
            if (!picked) return;
            const type = OBSTACLE_TYPES.find((t) => t.id === picked);
            if (!type) return;

            // Then height & distance
            const name = await modal.prompt({ title: 'نام مانع', label: 'نام', placeholder: type.name, defaultValue: type.name });
            if (!name) return;
            const heightStr = await modal.prompt({ title: 'ارتفاع', label: 'ارتفاع (متر)', type: 'number', defaultValue: String(type.heightRange[0]) });
            if (!heightStr) return;
            const distanceStr = await modal.prompt({ title: 'فاصله', label: 'فاصله افقی از پنل (متر)', type: 'number', defaultValue: '10' });
            if (!distanceStr) return;
            const azStr = await modal.prompt({ title: 'جهت', label: 'زاویه نسبت به جنوب (درجه، -۹۰ غرب، ۹۰ شرق)', type: 'number', defaultValue: '0' });
            const az = parseFloat(azStr) || 0;

            this.state.obstacles.push({
                id: 'obs-' + Date.now(),
                type: picked,
                name: name.trim(),
                height: Math.max(0.5, parseFloat(heightStr) || type.heightRange[0]),
                distance: Math.max(0.5, parseFloat(distanceStr) || 10),
                azimuth: az,
                seasonal: type.seasonal
            });
            this._renderObstacles();
            this._renderAnalysis();
            toast.success('مانع اضافه شد');
        } catch (e) { /* cancelled */ }
    },

    _analyze() {
        // Calculate sun position for the given date and key hours
        const dayOfYear = this.state.date === 'summer' ? 172 : this.state.date === 'winter' ? 355 : 80;
        // Check at multiple times
        const hours = [8, 10, 12, 14, 16];
        const results = this.state.obstacles.map((o) => {
            let maxImpact = 0;
            let worstTime = 12;
            const impacts = [];
            hours.forEach((h) => {
                const sun = calcSunPosition(this.state.latitude, dayOfYear, h);
                const impact = calcShadingImpact({
                    obstacleHeight: o.height,
                    obstacleDistance: o.distance,
                    panelTilt: this.state.panelTilt,
                    solarAltitude: sun.altitude,
                    solarAzimuth: 180 + sun.azimuth,
                    panelAzimuth: 180 + o.azimuth
                });
                impacts.push({ hour: h, ...impact });
                if (impact.percent > maxImpact) { maxImpact = impact.percent; worstTime = h; }
            });
            return {
                obstacle: o,
                percent: maxImpact,
                worstTime,
                impacts
            };
        });

        const totalLoss = results.reduce((s, r) => s + r.percent, 0) / Math.max(results.length, 1);
        return { results, totalLoss, hours, dayOfYear };
    },

    _renderAnalysis() {
        const el = document.getElementById('shadingResult');
        if (!el) return;
        if (this.state.obstacles.length === 0) {
            el.innerHTML = '';
            return;
        }

        const analysis = this._analyze();
        const lossColor = analysis.totalLoss > 20 ? 'var(--color-red-400)' : analysis.totalLoss > 5 ? 'var(--color-sun-300)' : 'var(--color-emerald-400)';
        const dayOfYear = analysis.dayOfYear;
        const solarPath = generateSolarPath(this.state.latitude, dayOfYear);
        const peakAlt = Math.max(...solarPath.map((p) => p.altitude));

        el.innerHTML = `
            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">📊 نتیجه تحلیل</h2>
                </div>
                <div class="stats" style="grid-template-columns:repeat(2,1fr);margin-bottom:var(--space-4);">
                    <div class="stat stat--sun">
                        <div class="stat__label">ارتفاع خورشید (اوج)</div>
                        <div class="stat__value">${Utils.formatNumber(peakAlt, 1)}<span class="stat__unit">°</span></div>
                    </div>
                    <div class="stat" style="border-color:${lossColor};">
                        <div class="stat__label">کاهش تولید (تخمینی)</div>
                        <div class="stat__value" style="color:${lossColor};">${Utils.formatNumber(analysis.totalLoss, 1)}<span class="stat__unit">%</span></div>
                    </div>
                </div>
                ${this._renderSolarPathChart(solarPath)}
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">⏰ سایه در ساعات مختلف</h2>
                </div>
                <div style="display:grid;grid-template-columns:repeat(${analysis.hours.length},1fr);gap:var(--space-1);margin-bottom:var(--space-3);">
                    ${analysis.hours.map((h) => {
                        const sun = calcSunPosition(this.state.latitude, dayOfYear, h);
                        return `
                            <div style="text-align:center;padding:var(--space-2);background:var(--color-bg-soft);border-radius:var(--radius-sm);">
                                <div style="font-size:var(--font-size-xs);color:var(--color-text-dim);">${Utils.toPersian(h)}:00</div>
                                <div style="font-weight:700;color:var(--color-sun-300);font-size:var(--font-size-sm);">${Utils.formatNumber(sun.altitude, 0)}°</div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="list" style="gap:var(--space-2);">
                    ${analysis.results.map((r) => `
                        <div class="list-item" style="cursor:default;">
                            <div class="list-item__body">
                                <div class="list-item__title">${Utils.escapeHTML(r.obstacle.name)}</div>
                                <div class="list-item__subtitle">بدترین ساعت: ${Utils.toPersian(r.worstTime)}:00</div>
                            </div>
                            <div class="progress" style="width:120px;">
                                <div class="progress__bar" style="width:${Math.min(100, r.percent)}%;background:${r.percent > 20 ? 'var(--color-red-500)' : r.percent > 5 ? 'var(--color-sun-500)' : 'var(--color-emerald-500)'};"></div>
                            </div>
                            <div style="font-weight:800;color:${r.percent > 20 ? 'var(--color-red-400)' : r.percent > 5 ? 'var(--color-sun-300)' : 'var(--color-emerald-400)'};min-width:60px;text-align:left;">${Utils.formatNumber(r.percent, 1)}%</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">💡 توصیه‌ها</h2>
                </div>
                <ul style="padding-right:var(--space-5);line-height:2;color:var(--color-text-muted);font-size:var(--font-size-sm);">
                    ${this._getRecommendations(analysis).map((r) => `<li style="margin-bottom:var(--space-2);">${r}</li>`).join('')}
                </ul>
            </div>
        `;
    },

    _getRecommendations(analysis) {
        const recs = [];
        if (analysis.totalLoss === 0) {
            recs.push('✅ سایه‌ای تشخیص داده نشد — محل نصب عالی است!');
        }
        if (analysis.totalLoss > 5 && analysis.totalLoss <= 20) {
            recs.push('⚠️ سایه جزئی وجود دارد — بررسی محل نصب برای کاهش سایه توصیه می‌شود.');
        }
        if (analysis.totalLoss > 20) {
            recs.push('🚨 سایه قابل توجه — جابجایی پنل یا حذف مانع توصیه می‌شود.');
        }
        const tallTrees = analysis.results.filter((r) => r.obstacle.type && r.obstacle.type.startsWith('tree-') && r.obstacle.height > 5);
        if (tallTrees.length > 0) {
            recs.push('🌳 درختان بلند شناسایی شدند — هرس یا جابجایی پنل به فاصله بیشتر پیشنهاد می‌شود.');
        }
        recs.push('📐 بهترین زمان برای ارزیابی سایه، ۲۱ دسامبر (انقلاب زمستانی) است.');
        recs.push('🕐 سایه در ساعات اولیه صبح و اواخر عصر طبیعی است و تأثیر کمی دارد.');
        return recs;
    },

    _renderSolarPathChart(path) {
        if (path.length === 0) return '';
        const width = 320;
        const height = 160;
        const padding = 30;
        const maxAlt = 90;
        const points = path.map((p, i) => {
            const x = padding + (i / (path.length - 1)) * (width - padding * 2);
            const y = height - padding - (p.altitude / maxAlt) * (height - padding * 2);
            return `${x},${y}`;
        }).join(' ');

        return `
            <div style="background:var(--color-bg-soft);border-radius:var(--radius-md);padding:var(--space-3);margin-top:var(--space-3);">
                <div style="display:flex;justify-content:space-between;font-size:var(--font-size-xs);color:var(--color-text-dim);margin-bottom:var(--space-2);">
                    <span>مسیر خورشید</span>
                    <span>${this.state.date === 'summer' ? '۲۱ ژوئن' : this.state.date === 'winter' ? '۲۱ دسامبر' : '۲۱ مارس'}</span>
                </div>
                <svg viewBox="0 0 ${width} ${height}" style="width:100%;height:auto;display:block;">
                    <defs>
                        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3"/>
                            <stop offset="100%" stop-color="#fbbf24" stop-opacity="0.2"/>
                        </linearGradient>
                    </defs>
                    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#skyGrad)" rx="8"/>
                    <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="var(--color-text-dim)" stroke-width="1"/>
                    <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="var(--color-text-dim)" stroke-width="1"/>
                    <text x="${padding - 5}" y="${padding + 5}" fill="var(--color-text-dim)" font-size="10" text-anchor="end">90°</text>
                    <text x="${padding - 5}" y="${height - padding + 5}" fill="var(--color-text-dim)" font-size="10" text-anchor="end">0°</text>
                    <polyline points="${points}" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"/>
                    ${path.map((p, i) => {
                        const x = padding + (i / (path.length - 1)) * (width - padding * 2);
                        const y = height - padding - (p.altitude / maxAlt) * (height - padding * 2);
                        if (i % 4 === 0) {
                            return `<circle cx="${x}" cy="${y}" r="3" fill="#fbbf24"/><text x="${x}" y="${height - 5}" fill="var(--color-text-muted)" font-size="9" text-anchor="middle">${p.hour}:00</text>`;
                        }
                        return `<circle cx="${x}" cy="${y}" r="1.5" fill="#fcd34d" opacity="0.6"/>`;
                    }).join('')}
                </svg>
            </div>
        `;
    }
};
