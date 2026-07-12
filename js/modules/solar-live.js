/**
 * سولر زنده - نمایش لحظه‌ای تولید با نمودار و شماتیک
 * Solar Live - Real-time Production Display
 */
import { Utils } from '../utils.js';
import { toast } from '../ui.js';
import { LOCATIONS } from '../data/locations.js';
import { drawLineChart, drawAreaChart } from './charts.js';
import {
    calculateHourlyPower, getHourlyProductionArray,
    getSmartHint, getCurrentSeason, getWeather,
    getYearlyStats, PERSIA_MONTHS,
    WEATHER_LABELS, SEASON_LABELS
} from '../data/solar-simulator.js';

export const solarLive = {
    name: 'solar-live',
    path: '#solar-live',

    state: {
        systemKw: 5,
        location: 'kabul',
        weather: 'sunny',
        season: 'summer',
        currentHour: new Date().getHours(),
        activeTab: 'live' // 'live' | 'diagram' | 'monthly'
    },

    render() {
        const loc = LOCATIONS.find(l => l.id === this.state.location) || LOCATIONS[0];
        const hint = getSmartHint(this.state.currentHour);
        const stats = getYearlyStats({
            systemKw: this.state.systemKw,
            psh: loc.psh,
            weather: this.state.weather,
            season: this.state.season
        });

        return `
            <h1 class="page-title anim-fade-up">⚡ سولر زنده</h1>
            <p class="page-subtitle anim-fade-up">نمایش لحظه‌ای تولید + شماتیک هوشمند سیستم</p>

            <!-- تب‌ها -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-3);padding:var(--space-2);">
                <div class="switch-group" id="tabSwitch">
                    <button class="${this.state.activeTab === 'live' ? 'is-active' : ''}" data-tab="live">📊 لحظه‌ای</button>
                    <button class="${this.state.activeTab === 'diagram' ? 'is-active' : ''}" data-tab="diagram">🔌 شماتیک</button>
                    <button class="${this.state.activeTab === 'monthly' ? 'is-active' : ''}" data-tab="monthly">📅 ماهانه</button>
                </div>
            </div>

            <!-- تنظیمات سریع -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-3);padding:var(--space-3);">
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-2);">
                    <div>
                        <label style="font-size:10px;color:var(--color-text-muted);display:block;margin-bottom:4px;">ظرفیت (kW)</label>
                        <input type="number" class="input" id="sysKw" value="${this.state.systemKw}" min="0.5" max="100" step="0.5" style="padding:6px;text-align:center;">
                    </div>
                    <div>
                        <label style="font-size:10px;color:var(--color-text-muted);display:block;margin-bottom:4px;">شهر</label>
                        <select class="input" id="locSelect" style="padding:6px;">
                            ${LOCATIONS.slice(0, 15).map(l => `<option value="${l.id}" ${this.state.location === l.id ? 'selected' : ''}>${l.name}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label style="font-size:10px;color:var(--color-text-muted);display:block;margin-bottom:4px;">آب و هوا</label>
                        <select class="input" id="weatherSelect" style="padding:6px;">
                            ${Object.entries(WEATHER_LABELS).map(([k, v]) => `<option value="${k}" ${this.state.weather === k ? 'selected' : ''}>${v}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>

            <!-- محتوای تب -->
            <div id="tabContent">
                ${this._renderTab(stats, loc)}
            </div>
        `;
    },

    _renderTab(stats, loc) {
        if (this.state.activeTab === 'live') return this._renderLive(stats, loc);
        if (this.state.activeTab === 'diagram') return this._renderDiagram(stats, loc);
        return this._renderMonthly(stats);
    },

    _renderLive(stats, loc) {
        const hourlyData = getHourlyProductionArray({
            systemKw: this.state.systemKw,
            psh: loc.psh,
            weather: this.state.weather,
            season: this.state.season
        });
        const currentPower = hourlyData[this.state.currentHour].power;
        const isProducing = currentPower > 0.1;
        const hint = getSmartHint(this.state.currentHour);
        const peakPower = Math.max(...hourlyData.map(d => d.power));

        // نمایش ساعت فعلی
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        return `
            <!-- نمایش توان لحظه‌ای -->
            <div class="card anim-scale-in" style="background:linear-gradient(135deg, #f59e0b 0%, #f97316 100%);color:white;padding:var(--space-5);margin-bottom:var(--space-4);position:relative;overflow:hidden;">
                <div style="position:absolute;top:-30px;right:-30px;width:180px;height:180px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:absolute;bottom:-30px;left:-30px;width:140px;height:140px;background:rgba(255,255,255,0.08);border-radius:50%;filter:blur(20px);"></div>
                <div style="position:relative;text-align:center;">
                    <div style="display:flex;align-items:center;justify-content:center;gap:var(--space-2);font-size:var(--font-size-sm);opacity:0.9;margin-bottom:6px;">
                        <span style="width:8px;height:8px;border-radius:50%;background:${isProducing ? '#10b981' : '#94a3b8'};box-shadow:0 0 8px ${isProducing ? '#10b981' : '#94a3b8'};display:inline-block;animation:${isProducing ? 'pulse 1.5s infinite' : 'none'};"></span>
                        ${isProducing ? 'در حال تولید' : 'خاموش'}
                    </div>
                    <div style="font-size:5rem;font-weight:900;line-height:1;letter-spacing:-2px;">${Utils.formatNumber(currentPower, 1)}<span style="font-size:1.5rem;font-weight:600;margin-right:6px;">kW</span></div>
                    <div style="font-size:var(--font-size-sm);opacity:0.9;margin-top:var(--space-2);">⏰ ${timeStr} · ${Utils.escapeHTML(loc.name)} · ${WEATHER_LABELS[this.state.weather]}</div>
                    <div style="display:flex;gap:var(--space-2);justify-content:center;margin-top:var(--space-3);">
                        <div style="background:rgba(0,0,0,0.2);border-radius:var(--radius-sm);padding:6px 12px;">
                            <div style="font-size:10px;opacity:0.85;">اوج</div>
                            <div style="font-weight:800;">${Utils.formatNumber(peakPower, 1)} kW</div>
                        </div>
                        <div style="background:rgba(0,0,0,0.2);border-radius:var(--radius-sm);padding:6px 12px;">
                            <div style="font-size:10px;opacity:0.85;">کل روز</div>
                            <div style="font-weight:800;">${Utils.formatNumber(stats.averageDaily, 1)} kWh</div>
                        </div>
                        <div style="background:rgba(0,0,0,0.2);border-radius:var(--radius-sm);padding:6px 12px;">
                            <div style="font-size:10px;opacity:0.85;">سالانه</div>
                            <div style="font-weight:800;">${Utils.formatNumber(stats.totalYearly, 0)} kWh</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- شبیه‌ساز ساعتی -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <h2 class="section__title">⏰ شبیه‌ساز ساعتی</h2>
                <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3);flex-wrap:wrap;">
                    <span style="font-size:var(--font-size-sm);color:var(--color-text-muted);">ساعت:</span>
                    <span style="background:linear-gradient(135deg, #f59e0b, #f97316);color:white;padding:4px 12px;border-radius:var(--radius-full);font-weight:700;font-family:var(--font-mono);">${Utils.toPersian(this.state.currentHour).padStart(2, '۰')}:۰۰</span>
                </div>
                <input type="range" id="hourSlider" min="0" max="23" step="1" value="${this.state.currentHour}" style="width:100%;height:8px;-webkit-appearance:none;background:linear-gradient(90deg, #1e3a8a 0%, #f59e0b 50%, #1e3a8a 100%);border-radius:4px;outline:none;">
                <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--color-text-muted);margin-top:6px;">
                    ${[0, 6, 9, 12, 15, 18, 23].map(h => `<span>${Utils.toPersian(h)}</span>`).join('')}
                </div>
            </div>

            <!-- نمودار ۲۴ ساعته -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <h2 class="section__title">📈 نمودار تولید ۲۴ ساعته</h2>
                <div style="position:relative;height:220px;">
                    <canvas id="hourlyChart" style="width:100%;height:100%;"></canvas>
                </div>
            </div>

            <!-- راهنمای هوشمند -->
            <div class="card anim-fade-up" style="background:linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(2,132,199,0.1) 100%);border:1px solid rgba(14,165,233,0.3);padding:var(--space-4);margin-bottom:var(--space-4);">
                <div style="display:flex;align-items:flex-start;gap:var(--space-3);">
                    <div style="font-size:32px;flex-shrink:0;">${hint.icon}</div>
                    <div style="flex:1;">
                        <h3 style="color:var(--color-sky-300);font-size:var(--font-size-md);margin:0 0 6px;">پیشنهاد هوشمند</h3>
                        <p style="margin:0 0 6px;font-size:var(--font-size-sm);line-height:1.7;">${Utils.escapeHTML(hint.text)}</p>
                        <p style="margin:0;font-size:var(--font-size-xs);color:var(--color-text-muted);">💡 ${Utils.escapeHTML(hint.tip)}</p>
                    </div>
                </div>
            </div>

            <!-- تأثیر زیست‌محیطی -->
            <div class="card anim-fade-up" style="background:linear-gradient(135deg, #10b981 0%, #059669 100%);color:white;padding:var(--space-4);margin-bottom:var(--space-4);">
                <h2 style="color:white;font-size:var(--font-size-md);margin:0 0 var(--space-3);">🌍 تأثیر سالانه</h2>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-2);">
                    <div style="background:rgba(0,0,0,0.2);border-radius:var(--radius-sm);padding:var(--space-2);text-align:center;">
                        <div style="font-size:10px;opacity:0.85;">تولید پاک</div>
                        <div style="font-weight:800;font-size:var(--font-size-md);">${Utils.formatNumber(stats.totalYearly, 0)} kWh</div>
                    </div>
                    <div style="background:rgba(0,0,0,0.2);border-radius:var(--radius-sm);padding:var(--space-2);text-align:center;">
                        <div style="font-size:10px;opacity:0.85;">کاهش CO₂</div>
                        <div style="font-weight:800;font-size:var(--font-size-md);">${Utils.formatNumber(stats.co2Saved, 0)} kg</div>
                    </div>
                    <div style="background:rgba(0,0,0,0.2);border-radius:var(--radius-sm);padding:var(--space-2);text-align:center;">
                        <div style="font-size:10px;opacity:0.85;">معادل درخت</div>
                        <div style="font-weight:800;font-size:var(--font-size-md);">🌳 ${Utils.toPersian(stats.treesEquivalent)}</div>
                    </div>
                    <div style="background:rgba(0,0,0,0.2);border-radius:var(--radius-sm);padding:var(--space-2);text-align:center;">
                        <div style="font-size:10px;opacity:0.85;">خودرو حذف شده</div>
                        <div style="font-weight:800;font-size:var(--font-size-md);">🚗 ${Utils.toPersian(Math.round(stats.co2Saved / 4600))}</div>
                    </div>
                </div>
            </div>

            <!-- اقدامات -->
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-2);">
                <button class="btn btn--secondary" data-action="pdf" style="flex-direction:column;padding:var(--space-3);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                    <span style="font-size:10px;margin-top:4px;">PDF</span>
                </button>
                <button class="btn btn--secondary" data-action="save" style="flex-direction:column;padding:var(--space-3);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    <span style="font-size:10px;margin-top:4px;">ذخیره</span>
                </button>
                <button class="btn btn--secondary" data-action="whatsapp" style="flex-direction:column;padding:var(--space-3);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                    <span style="font-size:10px;margin-top:4px;">واتساپ</span>
                </button>
                <button class="btn btn--secondary" data-action="reset" style="flex-direction:column;padding:var(--space-3);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
                    <span style="font-size:10px;margin-top:4px;">پاک</span>
                </button>
            </div>
        `;
    },

    _renderDiagram(stats, loc) {
        const systemKw = this.state.systemKw;
        const batteryKwh = systemKw * 1.5; // فرض: ۱.۵ برابر kW سیستم
        const dailyLoad = stats.averageDaily * 0.7; // مصرف روزانه

        return `
            <!-- شماتیک سیستم -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);padding:var(--space-4);">
                <h2 class="section__title">🔌 شماتیک هوشمند سیستم</h2>
                <div style="display:flex;flex-direction:column;align-items:center;gap:var(--space-3);position:relative;">

                    <!-- پنل خورشیدی -->
                    <div class="solar-node" id="node-panel" data-power="${Utils.formatNumber(systemKw, 1)}" style="background:linear-gradient(135deg, #f59e0b 0%, #f97316 100%);color:white;width:90%;max-width:280px;padding:var(--space-4);border-radius:var(--radius-md);text-align:center;box-shadow:0 8px 24px rgba(245,158,11,0.3);position:relative;">
                        <div style="font-size:48px;margin-bottom:4px;">☀️</div>
                        <div style="font-weight:800;font-size:var(--font-size-md);">پنل خورشیدی</div>
                        <div style="font-size:var(--font-size-sm);opacity:0.9;">${Utils.formatNumber(systemKw, 1)} kWp</div>
                        <div style="font-size:11px;opacity:0.85;margin-top:4px;">${Utils.formatNumber(stats.averageDaily, 1)} kWh/روز</div>
                    </div>

                    <!-- فلش DC -->
                    <div class="solar-arrow" style="display:flex;flex-direction:column;align-items:center;color:var(--color-sky-300);">
                        <div style="background:rgba(14,165,233,0.1);border:1px solid var(--color-sky-300);border-radius:var(--radius-sm);padding:2px 8px;font-size:10px;font-weight:700;">⚡ DC ${Math.round(systemKw * 1000 / 48)}A</div>
                        <div style="font-size:24px;line-height:1;">↓</div>
                    </div>

                    <!-- اینورتر -->
                    <div class="solar-node" id="node-inverter" style="background:linear-gradient(135deg, #10b981 0%, #059669 100%);color:white;width:90%;max-width:280px;padding:var(--space-4);border-radius:var(--radius-md);text-align:center;box-shadow:0 8px 24px rgba(16,185,129,0.3);">
                        <div style="font-size:48px;margin-bottom:4px;">🔄</div>
                        <div style="font-weight:800;font-size:var(--font-size-md);">اینورتر هیبرید</div>
                        <div style="font-size:var(--font-size-sm);opacity:0.9;">${Utils.formatNumber(systemKw, 1)} kW · ۹۷.۵٪</div>
                        <div style="font-size:11px;opacity:0.85;margin-top:4px;">⚡ AC ${Math.round(systemKw * 1000 / 220)}A</div>
                    </div>

                    <!-- فلش‌های خروجی -->
                    <div style="display:flex;width:100%;justify-content:space-around;position:relative;margin-top:var(--space-2);">
                        <!-- به سمت ۳ خروجی -->
                        <div style="position:absolute;top:0;left:50%;transform:translateX(-50%);font-size:24px;color:var(--color-text-muted);">↓</div>
                    </div>

                    <!-- سه خروجی -->
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-2);width:100%;">

                        <!-- باتری -->
                        <div class="solar-node" data-battery="1" style="background:linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);color:white;padding:var(--space-3);border-radius:var(--radius-md);text-align:center;box-shadow:0 8px 24px rgba(139,92,246,0.3);position:relative;">
                            <div style="font-size:36px;margin-bottom:4px;">🔋</div>
                            <div style="font-weight:700;font-size:var(--font-size-sm);">باتری</div>
                            <div style="font-size:11px;opacity:0.9;">${Utils.formatNumber(batteryKwh, 1)} kWh</div>
                            <div style="font-size:10px;opacity:0.85;margin-top:4px;">LiFePO4</div>
                            <div style="position:absolute;top:4px;right:4px;background:rgba(255,255,255,0.2);border-radius:var(--radius-sm);padding:1px 5px;font-size:9px;">${Math.round(Math.random() * 30 + 70)}٪</div>
                        </div>

                        <!-- لوازم -->
                        <div class="solar-node" style="background:linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);color:white;padding:var(--space-3);border-radius:var(--radius-md);text-align:center;box-shadow:0 8px 24px rgba(244,63,94,0.3);">
                            <div style="font-size:36px;margin-bottom:4px;">🏠</div>
                            <div style="font-weight:700;font-size:var(--font-size-sm);">لوازم</div>
                            <div style="font-size:11px;opacity:0.9;">${Utils.formatNumber(dailyLoad, 1)} kWh</div>
                            <div style="font-size:10px;opacity:0.85;margin-top:4px;">مصرف</div>
                            <div style="position:absolute;top:4px;right:4px;background:rgba(255,255,255,0.2);border-radius:var(--radius-sm);padding:1px 5px;font-size:9px;animation:pulse 1.5s infinite;">●</div>
                        </div>

                        <!-- شبکه -->
                        <div class="solar-node" style="background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);color:white;padding:var(--space-3);border-radius:var(--radius-md);text-align:center;box-shadow:0 8px 24px rgba(59,130,246,0.3);">
                            <div style="font-size:36px;margin-bottom:4px;">🌐</div>
                            <div style="font-weight:700;font-size:var(--font-size-sm);">شبکه</div>
                            <div style="font-size:11px;opacity:0.9;">${Math.random() > 0.5 ? '+' : '-'} ${Utils.formatNumber(Math.random() * 2, 2)} kW</div>
                            <div style="font-size:10px;opacity:0.85;margin-top:4px;">${Math.random() > 0.5 ? 'تزریق' : 'مصرف'}</div>
                            <div style="position:absolute;top:4px;right:4px;background:rgba(255,255,255,0.2);border-radius:var(--radius-sm);padding:1px 5px;font-size:9px;">${Math.random() > 0.5 ? '🔌' : '⚡'}</div>
                        </div>
                    </div>
                </div>

                <!-- راهنما -->
                <div style="background:rgba(14,165,233,0.1);border:1px solid rgba(14,165,233,0.3);border-radius:var(--radius-md);padding:var(--space-3);margin-top:var(--space-4);font-size:var(--font-size-sm);text-align:center;">
                    💡 برای مشاهده وضعیت لحظه‌ای، به تب «لحظه‌ای» بروید.
                </div>
            </div>

            <!-- مشخصات سیستم -->
            <h2 class="section__title anim-fade-up">⚙️ مشخصات سیستم</h2>
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="list" style="background:transparent;">
                    <div class="list-item" style="cursor:default;background:var(--color-bg-soft);margin-bottom:var(--space-2);">
                        <div class="list-item__icon" style="background:rgba(245,158,11,0.15);color:var(--color-sun-300);">☀️</div>
                        <div class="list-item__body">
                            <div class="list-item__title">ظرفیت نصب</div>
                            <div class="list-item__subtitle">${Math.ceil(systemKw * 1000 / 550)} پنل ۵۵۰W</div>
                        </div>
                        <div style="font-weight:800;color:var(--color-sun-300);">${Utils.formatNumber(systemKw, 1)} kWp</div>
                    </div>
                    <div class="list-item" style="cursor:default;background:var(--color-bg-soft);margin-bottom:var(--space-2);">
                        <div class="list-item__icon" style="background:rgba(16,185,129,0.15);color:var(--color-emerald-400);">🔄</div>
                        <div class="list-item__body">
                            <div class="list-item__title">اینورتر</div>
                            <div class="list-item__subtitle">هیبرید ۹۷.۵٪ راندمان</div>
                        </div>
                        <div style="font-weight:800;color:var(--color-emerald-400);">${Utils.formatNumber(systemKw, 1)} kW</div>
                    </div>
                    <div class="list-item" style="cursor:default;background:var(--color-bg-soft);margin-bottom:var(--space-2);">
                        <div class="list-item__icon" style="background:rgba(139,92,246,0.15);color:var(--color-violet-400);">🔋</div>
                        <div class="list-item__body">
                            <div class="list-item__title">باتری</div>
                            <div class="list-item__subtitle">LiFePO4 ۶۰۰۰ چرخه</div>
                        </div>
                        <div style="font-weight:800;color:var(--color-violet-400);">${Utils.formatNumber(batteryKwh, 1)} kWh</div>
                    </div>
                    <div class="list-item" style="cursor:default;background:var(--color-bg-soft);">
                        <div class="list-item__icon" style="background:rgba(59,130,246,0.15);color:#3b82f6;">🌐</div>
                        <div class="list-item__body">
                            <div class="list-item__title">شبکه</div>
                            <div class="list-item__subtitle">${this.state.systemKw >= 8 ? 'سه فاز ۴۰۰V' : 'تک فاز ۲۳۰V'}</div>
                        </div>
                        <div style="font-weight:800;color:#3b82f6;">${this.state.systemKw >= 8 ? '۳ph' : '۱ph'}</div>
                    </div>
                </div>
            </div>
        `;
    },

    _renderMonthly(stats) {
        const maxMonthly = Math.max(...stats.monthly.map(m => m.total));
        return `
            <h2 class="section__title anim-fade-up">📅 تولید ماهانه</h2>
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                ${stats.monthly.map((m, i) => {
                    const heightPct = (m.total / maxMonthly) * 100;
                    const seasonColor = {
                        spring: '#10b981', summer: '#f59e0b',
                        autumn: '#f97316', winter: '#0ea5e9'
                    }[m.season];
                    return `
                        <div style="display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-2);">
                            <div style="width:60px;font-size:var(--font-size-xs);color:var(--color-text-muted);">${PERSIA_MONTHS[i]}</div>
                            <div style="flex:1;background:var(--color-bg-soft);border-radius:var(--radius-sm);height:28px;position:relative;overflow:hidden;">
                                <div style="position:absolute;top:0;right:0;height:100%;width:${heightPct}%;background:linear-gradient(90deg, ${seasonColor}88, ${seasonColor});border-radius:var(--radius-sm);transition:width 0.5s;"></div>
                                <div style="position:absolute;top:50%;right:8px;transform:translateY(-50%);font-size:var(--font-size-xs);font-weight:700;color:${heightPct > 50 ? 'white' : 'var(--color-text)'};">${Utils.formatNumber(m.total, 0)} kWh</div>
                            </div>
                            <div style="width:30px;font-size:10px;text-align:center;opacity:0.7;">${SEASON_LABELS[m.season]?.split(' ')[1] || ''}</div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);">
                <div class="card card--glass" style="padding:var(--space-3);text-align:center;">
                    <div style="font-size:10px;color:var(--color-text-muted);">پرمصرف‌ترین ماه</div>
                    <div style="font-weight:800;font-size:var(--font-size-md);color:var(--color-sun-300);">${PERSIA_MONTHS[stats.monthly.findIndex(m => m.total === maxMonthly)]}</div>
                </div>
                <div class="card card--glass" style="padding:var(--space-3);text-align:center;">
                    <div style="font-size:10px;color:var(--color-text-muted);">کم‌مصرف‌ترین ماه</div>
                    <div style="font-weight:800;font-size:var(--font-size-md);color:var(--color-sky-300);">${PERSIA_MONTHS[stats.monthly.findIndex(m => m.total === Math.min(...stats.monthly.map(x => x.total)))]}</div>
                </div>
            </div>
        `;
    },

    attach() {
        // تب‌ها
        document.querySelectorAll('#tabSwitch button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.state.activeTab = btn.dataset.tab;
                this._refresh();
            });
        });

        // تنظیمات
        const sysKw = document.getElementById('sysKw');
        if (sysKw) {
            sysKw.addEventListener('input', () => {
                this.state.systemKw = parseFloat(sysKw.value) || 5;
                this._refresh();
            });
        }
        const locSelect = document.getElementById('locSelect');
        if (locSelect) {
            locSelect.addEventListener('change', () => {
                this.state.location = locSelect.value;
                this._refresh();
            });
        }
        const weatherSelect = document.getElementById('weatherSelect');
        if (weatherSelect) {
            weatherSelect.addEventListener('change', () => {
                this.state.weather = weatherSelect.value;
                this._refresh();
            });
        }

        // اسلایدر ساعت
        const hourSlider = document.getElementById('hourSlider');
        if (hourSlider) {
            hourSlider.addEventListener('input', () => {
                this.state.currentHour = parseInt(hourSlider.value);
                this._refresh();
            });
        }

        // اقدامات
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => this._handleAction(btn.dataset.action));
        });

        // به‌روزرسانی خودکار هر ۱ دقیقه (فقط در تب live)
        if (this.state.activeTab === 'live' && this._interval) {
            clearInterval(this._interval);
        }
        if (this.state.activeTab === 'live') {
            this._interval = setInterval(() => {
                this.state.currentHour = new Date().getHours();
                const hourSlider = document.getElementById('hourSlider');
                if (hourSlider) hourSlider.value = this.state.currentHour;
                this._refresh();
            }, 60000);
        }

        // نمودار
        this._drawChart();
    },

    _drawChart() {
        if (this.state.activeTab !== 'live') return;
        const canvas = document.getElementById('hourlyChart');
        if (!canvas) return;
        const loc = LOCATIONS.find(l => l.id === this.state.location) || LOCATIONS[0];
        const data = getHourlyProductionArray({
            systemKw: this.state.systemKw,
            psh: loc.psh,
            weather: this.state.weather,
            season: this.state.season
        });

        const labels = data.map(d => Utils.toPersian(d.hour));
        const values = data.map(d => Math.round(d.power * 10) / 10);

        // خط عمودی برای ساعت فعلی
        const hourMarker = data.map((d, i) => i === this.state.currentHour ? Math.max(...values) * 1.1 : null);

        drawAreaChart(canvas, {
            labels,
            datasets: [{
                label: 'توان (kW)',
                data: values,
                color: '#f59e0b',
                fill: true
            }]
        });

        // کشیدن خط ساعت فعلی
        setTimeout(() => {
            const ctx = canvas.getContext('2d');
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            const padding = { top: 20, right: 16, bottom: 30, left: 36 };
            const cw = w - padding.left - padding.right;
            const ch = h - padding.top - padding.bottom;
            const x = padding.left + (cw / 23) * this.state.currentHour;
            ctx.scale(dpr, dpr);
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, padding.top + ch);
            ctx.stroke();
            ctx.setLineDash([]);

            // نقطه
            const y = padding.top + ch - (values[this.state.currentHour] / Math.max(...values)) * ch;
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }, 50);
    },

    _handleAction(action) {
        if (action === 'pdf') {
            this._exportPDF();
        } else if (action === 'save') {
            this._saveSnapshot();
        } else if (action === 'whatsapp') {
            this._shareWhatsApp();
        } else if (action === 'reset') {
            this.state.systemKw = 5;
            this.state.currentHour = new Date().getHours();
            this._refresh();
            toast.success('تنظیمات بازنشانی شد');
        }
    },

    _exportPDF() {
        const w = window.open('', '_blank');
        if (!w) { toast.error('پنجره باز نشد'); return; }
        const loc = LOCATIONS.find(l => l.id === this.state.location) || LOCATIONS[0];
        const stats = getYearlyStats({ systemKw: this.state.systemKw, psh: loc.psh });
        w.document.write(`<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="UTF-8"><title>گزارش سولر زنده</title>
<style>@page{size:A4;margin:1.5cm}body{font-family:Tahoma;padding:20px}h1{color:#f59e0b;border-bottom:3px solid #f59e0b;padding-bottom:10px}</style></head><body>
<h1>⚡ گزارش سولر زنده - Solaren</h1>
<p><strong>تاریخ:</strong> ${new Date().toLocaleDateString('fa-IR')}</p>
<p><strong>شهر:</strong> ${Utils.escapeHTML(loc.name)} - ${loc.psh} kWh/m²/روز</p>
<p><strong>ظرفیت سیستم:</strong> ${Utils.formatNumber(this.state.systemKw, 1)} kWp</p>
<p><strong>ساعت فعلی:</strong> ${Utils.toPersian(this.state.currentHour).padStart(2, '۰')}:۰۰</p>
<p><strong>توان لحظه‌ای:</strong> ${Utils.formatNumber(calculateHourlyPower({ hour: this.state.currentHour, systemKw: this.state.systemKw, psh: loc.psh, season: this.state.season, weather: this.state.weather }), 2)} kW</p>
<h2>📊 آمار سالانه</h2>
<p>تولید سالانه: ${Utils.formatNumber(stats.totalYearly, 0)} kWh</p>
<p>کاهش CO₂: ${Utils.formatNumber(stats.co2Saved, 0)} کیلوگرم</p>
<p>معادل ${Utils.toPersian(stats.treesEquivalent)} درخت</p>
</body></html>`);
        w.document.close();
        w.focus();
        setTimeout(() => w.print(), 400);
    },

    _saveSnapshot() {
        const loc = LOCATIONS.find(l => l.id === this.state.location) || LOCATIONS[0];
        const snapshot = {
            id: 'snapshot-' + Date.now(),
            timestamp: Date.now(),
            systemKw: this.state.systemKw,
            location: loc.name,
            psh: loc.psh,
            weather: this.state.weather,
            season: this.state.season,
            currentHour: this.state.currentHour,
            currentPower: calculateHourlyPower({ hour: this.state.currentHour, systemKw: this.state.systemKw, psh: loc.psh, season: this.state.season, weather: this.state.weather })
        };
        try {
            const existing = JSON.parse(localStorage.getItem('solar-pwa:snapshots') || '[]');
            existing.unshift(snapshot);
            localStorage.setItem('solar-pwa:snapshots', JSON.stringify(existing.slice(0, 30)));
            toast.success('ذخیره شد');
        } catch (e) {
            toast.error('خطا در ذخیره');
        }
    },

    _shareWhatsApp() {
        const loc = LOCATIONS.find(l => l.id === this.state.location) || LOCATIONS[0];
        const currentPower = calculateHourlyPower({ hour: this.state.currentHour, systemKw: this.state.systemKw, psh: loc.psh, season: this.state.season, weather: this.state.weather });
        const text = `⚡ گزارش سولر - Solaren\n\n🏙️ شهر: ${loc.name}\n☀️ ظرفیت: ${Utils.formatNumber(this.state.systemKw, 1)} kWp\n⏰ ساعت: ${Utils.toPersian(this.state.currentHour).padStart(2, '۰')}:۰۰\n⚡ توان فعلی: ${Utils.formatNumber(currentPower, 2)} kW\n🌤️ آب و هوا: ${WEATHER_LABELS[this.state.weather]}`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    },

    _refresh() {
        const content = document.getElementById('tabContent');
        if (content) {
            content.style.opacity = '0';
            setTimeout(() => {
                const loc = LOCATIONS.find(l => l.id === this.state.location) || LOCATIONS[0];
                const stats = getYearlyStats({ systemKw: this.state.systemKw, psh: loc.psh, weather: this.state.weather, season: this.state.season });
                content.innerHTML = this._renderTab(stats, loc);
                content.style.opacity = '1';
                this._bindTabEvents();
                this._drawChart();
            }, 100);
        }
    },

    _bindTabEvents() {
        // اسلایدر ساعت در صورت وجود
        const hourSlider = document.getElementById('hourSlider');
        if (hourSlider) {
            hourSlider.addEventListener('input', () => {
                this.state.currentHour = parseInt(hourSlider.value);
                this._refresh();
            });
        }
        // اقدامات
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => this._handleAction(btn.dataset.action));
        });
    }
};
