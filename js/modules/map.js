/**
 * نقشه پروژه‌ها
 * Project Map - Geographic visualization
 */
import { Utils } from '../utils.js';
import { projects, customers } from '../store.js';
import { LOCATIONS } from '../data/locations.js';

export const projectMap = {
    name: 'map',
    path: '#map',

    // Approximate lat/lng for major Afghan cities
    CITY_COORDS: {
        'kabul': { lat: 34.5, lng: 69.2, x: 295, y: 145 },
        'herat': { lat: 34.3, lng: 62.2, x: 110, y: 130 },
        'mazar': { lat: 36.7, lng: 67.1, x: 235, y: 70 },
        'balkh': { lat: 36.7, lng: 66.9, x: 230, y: 65 },
        'kandahar': { lat: 31.6, lng: 65.7, x: 195, y: 280 },
        'jalalabad': { lat: 34.4, lng: 70.4, x: 320, y: 155 },
        'ghazni': { lat: 33.5, lng: 68.4, x: 270, y: 190 },
        'bamyan': { lat: 34.8, lng: 67.5, x: 250, y: 130 },
        'kunduz': { lat: 36.7, lng: 68.9, x: 285, y: 75 },
        'nangarhar': { lat: 34.4, lng: 70.4, x: 320, y: 155 },
        'parwan': { lat: 35.0, lng: 69.0, x: 290, y: 125 },
        'takhar': { lat: 36.7, lng: 69.5, x: 295, y: 75 },
        'badakhshan': { lat: 36.7, lng: 71.0, x: 340, y: 60 },
        'faryab': { lat: 35.7, lng: 64.7, x: 175, y: 90 },
        'jawzjan': { lat: 36.7, lng: 66.0, x: 210, y: 70 },
        'helmand': { lat: 31.6, lng: 64.4, x: 160, y: 290 },
        'zabul': { lat: 32.1, lng: 67.1, x: 240, y: 260 },
        'paktia': { lat: 33.5, lng: 69.5, x: 295, y: 195 },
        'khost': { lat: 33.3, lng: 69.9, x: 305, y: 200 },
        'logar': { lat: 34.0, lng: 69.0, x: 290, y: 170 },
        'kunar': { lat: 35.0, lng: 71.0, x: 335, y: 130 },
        'laghman': { lat: 34.6, lng: 70.1, x: 315, y: 145 },
        'paktika': { lat: 32.5, lng: 68.5, x: 275, y: 240 },
        'kunar': { lat: 35.0, lng: 71.0, x: 335, y: 130 },
        'wardak': { lat: 34.4, lng: 68.6, x: 280, y: 160 },
        'kapisa': { lat: 34.8, lng: 69.6, x: 305, y: 135 },
        'panjshir': { lat: 35.0, lng: 69.8, x: 310, y: 130 },
        'daikundi': { lat: 33.5, lng: 66.0, x: 210, y: 200 },
        'urozgan': { lat: 32.5, lng: 66.0, x: 210, y: 240 },
        'ghor': { lat: 34.0, lng: 64.5, x: 165, y: 170 },
        'baghlan': { lat: 36.0, lng: 68.7, x: 280, y: 90 },
        'samangan': { lat: 36.0, lng: 67.5, x: 245, y: 90 },
        'sar-e-pol': { lat: 36.2, lng: 66.0, x: 210, y: 85 },
        'nimroz': { lat: 31.0, lng: 62.0, x: 105, y: 310 },
        'farah': { lat: 32.4, lng: 62.1, x: 105, y: 250 },
        'badghis': { lat: 35.0, lng: 63.0, x: 130, y: 110 }
    },

    render() {
        const projs = projects.list();
        const projectByLocation = this._groupByLocation(projs);

        return `
            <h1 class="page-title anim-fade-up">نقشه پروژه‌ها</h1>
            <p class="page-subtitle anim-fade-up">نمایش جغرافیایی پروژه‌های نصب شده</p>

            <div class="stats stagger">
                <div class="stat stat--sun">
                    <div class="stat__label">کل پروژه</div>
                    <div class="stat__value">${Utils.toPersian(projs.length)}</div>
                </div>
                <div class="stat stat--sky">
                    <div class="stat__label">شهر فعال</div>
                    <div class="stat__value">${Utils.toPersian(Object.keys(projectByLocation).length)}</div>
                </div>
                <div class="stat stat--emerald">
                    <div class="stat__label">ظرفیت کل</div>
                    <div class="stat__value">${Utils.formatNumber(projs.reduce((s, p) => s + (p.actualPvKw || 0), 0), 1)}<span class="stat__unit">kW</span></div>
                </div>
                <div class="stat stat--violet">
                    <div class="stat__label">بیشترین شهر</div>
                    <div class="stat__value" style="font-size:var(--font-size-lg);">${this._topCity(projectByLocation)}</div>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">🗺️ نقشه افغانستان</h2>
                    <div class="chip chip--sun">${Utils.toPersian(projs.length)} پروژه</div>
                </div>
                <div style="background:var(--color-bg-soft);border-radius:var(--radius-md);padding:var(--space-3);">
                    <svg viewBox="0 0 400 400" style="width:100%;height:auto;display:block;">
                        <defs>
                            <radialGradient id="cityGlow" cx="50%" cy="50%">
                                <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.4"/>
                                <stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/>
                            </radialGradient>
                            <linearGradient id="mapBg" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stop-color="#1a2238"/>
                                <stop offset="100%" stop-color="#0a0f1f"/>
                            </linearGradient>
                        </defs>
                        <rect width="400" height="400" fill="url(#mapBg)" rx="8"/>

                        <!-- Grid -->
                        ${Array.from({length: 8}).map((_, i) => `<line x1="${i*50}" y1="0" x2="${i*50}" y2="400" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>`).join('')}
                        ${Array.from({length: 8}).map((_, i) => `<line x1="0" y1="${i*50}" x2="400" y2="${i*50}" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>`).join('')}

                        <!-- Country border (simplified) -->
                        <path d="M 80 80 L 120 70 L 180 75 L 230 60 L 280 55 L 340 70 L 360 130 L 350 180 L 320 230 L 280 280 L 230 320 L 180 340 L 120 320 L 80 280 L 60 220 L 70 150 Z" fill="none" stroke="var(--color-sun-500)" stroke-width="2" stroke-dasharray="6,4" opacity="0.6"/>

                        <!-- Province dots and projects -->
                        ${Object.entries(this.CITY_COORDS).map(([key, coord]) => {
                            const projsAtLocation = projectByLocation[key] || [];
                            const count = projsAtLocation.length;
                            const cityName = LOCATIONS.find((l) => l.id === key)?.name || key;
                            const hasProjects = count > 0;
                            const size = hasProjects ? 8 + Math.min(count * 2, 16) : 4;
                            return `
                                <circle cx="${coord.x}" cy="${coord.y}" r="${size * 1.5}" fill="url(#cityGlow)" opacity="${hasProjects ? 0.8 : 0}"/>
                                <circle cx="${coord.x}" cy="${coord.y}" r="${size}" fill="${hasProjects ? '#fbbf24' : '#475569'}" stroke="${hasProjects ? '#0a0e1a' : 'none'}" stroke-width="2" data-city="${key}" style="cursor:pointer"/>
                                <text x="${coord.x}" y="${coord.y + size + 12}" fill="${hasProjects ? '#fbbf24' : '#94a3b8'}" font-size="9" text-anchor="middle" font-weight="${hasProjects ? '700' : '500'}">${Utils.escapeHTML(cityName)}</text>
                                ${hasProjects ? `<text x="${coord.x}" y="${coord.y - size - 4}" fill="#fbbf24" font-size="10" text-anchor="middle" font-weight="bold">${Utils.toPersian(count)}</text>` : ''}
                            `;
                        }).join('')}
                    </svg>
                </div>
                <div style="display:flex;gap:var(--space-3);margin-top:var(--space-3);font-size:var(--font-size-xs);color:var(--color-text-muted);justify-content:center;">
                    <div style="display:flex;align-items:center;gap:4px;">
                        <div style="width:12px;height:12px;border-radius:50%;background:#fbbf24;"></div>
                        <span>شهر با پروژه</span>
                    </div>
                    <div style="display:flex;align-items:center;gap:4px;">
                        <div style="width:8px;height:8px;border-radius:50%;background:#475569;"></div>
                        <span>بدون پروژه</span>
                    </div>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">📍 لیست شهرها</h2>
                </div>
                <div class="list">
                    ${Object.entries(projectByLocation).sort((a, b) => b[1].length - a[1].length).map(([cityId, projs]) => {
                        const city = LOCATIONS.find((l) => l.id === cityId);
                        const totalKw = projs.reduce((s, p) => s + (p.actualPvKw || 0), 0);
                        return `
                        <div class="list-item" data-view-city="${cityId}" style="cursor:pointer;">
                            <div class="list-item__icon" style="background:linear-gradient(135deg, #fbbf24, #f59e0b);color:var(--color-text-inverse);">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            </div>
                            <div class="list-item__body">
                                <div class="list-item__title">${Utils.escapeHTML(city?.name || cityId)}</div>
                                <div class="list-item__subtitle">${Utils.toPersian(projs.length)} پروژه · ${Utils.formatNumber(totalKw, 1)} kW</div>
                            </div>
                            <div class="list-item__action">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="9 18 15 12 9 6"/></svg>
                            </div>
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    _groupByLocation(projects) {
        const map = {};
        projects.forEach((p) => {
            const loc = p.location || 'kabul';
            if (!map[loc]) map[loc] = [];
            map[loc].push(p);
        });
        return map;
    },

    _topCity(mapByLocation) {
        let top = null, max = 0;
        Object.entries(mapByLocation).forEach(([id, list]) => {
            if (list.length > max) {
                max = list.length;
                top = LOCATIONS.find((l) => l.id === id);
            }
        });
        return top ? Utils.escapeHTML(top.name) : '—';
    },

    attach() {
        document.querySelectorAll('[data-city]').forEach((el) => {
            el.addEventListener('click', () => this._viewCity(el.dataset.city));
        });
        document.querySelectorAll('[data-view-city]').forEach((el) => {
            el.addEventListener('click', () => this._viewCity(el.dataset.viewCity));
        });
    },

    async _viewCity(cityId) {
        const city = LOCATIONS.find((l) => l.id === cityId);
        if (!city) return;
        const all = projects.list();
        const cityProjects = all.filter((p) => (p.location || 'kabul') === cityId);
        if (cityProjects.length === 0) {
            await modal.prompt({
                title: city.name,
                label: 'این شهر هیچ پروژه‌ای ندارد'
            });
            return;
        }

        const html = `
            <div style="text-align:center;margin-bottom:var(--space-3);">
                <h3 style="font-size:var(--font-size-lg);font-weight:800;">${Utils.escapeHTML(city.name)}</h3>
                <p style="color:var(--color-text-muted);font-size:var(--font-size-sm);">${Utils.toPersian(cityProjects.length)} پروژه</p>
            </div>
            <div class="list">
                ${cityProjects.map((p) => `
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__icon" style="background:rgba(245,158,11,0.15);color:var(--color-sun-300);">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                        </div>
                        <div class="list-item__body">
                            <div class="list-item__title">${Utils.escapeHTML(p.name)}</div>
                            <div class="list-item__subtitle">${Utils.formatNumber(p.actualPvKw || 0, 1)} kW · ${Utils.formatDate(p.updatedAt)}</div>
                        </div>
                        <span class="chip chip--sun">${Utils.formatNumber(Math.round(p.totalCost / 1000))}K</span>
                    </div>
                `).join('')}
            </div>
        `;
        modal.open({ title: `پروژه‌های ${city.name}`, body: html, footer: '<button class="btn btn--primary btn--block" data-close-modal>بستن</button>' });
    },

    _refresh() {
        const view = document.getElementById('view');
        if (view) { view.innerHTML = this.render(); this.attach(); }
    }
};
