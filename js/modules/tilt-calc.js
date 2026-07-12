/**
 * Tilt & Azimuth angle calculator
 * Optimal angles for maximum solar yield
 */
import { Utils } from '../utils.js';
import { SolarCalc } from '../calc.js';
import { LOCATIONS } from '../data/locations.js';

export const tiltCalc = {
    name: 'tilt-calc',
    path: '#tilt-calc',

    state: { latitude: 34.5, season: 'annual', azimuth: 180 },

    render() {
        return `
            <h1 class="page-title anim-fade-up">محاسبه شیب و آزیموت</h1>
            <p class="page-subtitle anim-fade-up">بهینه‌سازی زاویه نصب پنل‌ها برای حداکثر تولید</p>

            <div class="card card--glass anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--sun">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    </div>
                    <div>
                        <div class="card__title">محاسبه زاویه بهینه</div>
                        <div class="card__subtitle">بر اساس عرض جغرافیایی</div>
                    </div>
                </div>

                <div class="field">
                    <label class="field__label">شهر / ولایت</label>
                    <select class="select" id="tcLocation">
                        <option value="">— انتخاب کنید —</option>
                        ${LOCATIONS.map((l) => `<option value="${34 + (Math.random() * 4 - 2)}" data-name="${Utils.escapeHTML(l.name)}">${Utils.escapeHTML(l.name)}</option>`).join('')}
                    </select>
                </div>

                <div class="field">
                    <label class="field__label field__label--required">عرض جغرافیایی (درجه)</label>
                    <div class="input-slider">
                        <input type="range" id="tcLat" min="20" max="42" step="0.5" value="${this.state.latitude}">
                        <input type="number" class="input" id="tcLatV" min="-90" max="90" step="0.5" value="${this.state.latitude}">
                    </div>
                    <p class="field__hint">مثال: کابل ≈ ۳۴.۵° · هرات ≈ ۳۴.۳° · قندهار ≈ ۳۱.۶°</p>
                </div>

                <div class="field">
                    <label class="field__label">فصل هدف</label>
                    <div class="switch-group" id="tcSeason">
                        <button class="${this.state.season === 'summer' ? 'is-active' : ''}" data-val="summer">تابستان</button>
                        <button class="${this.state.season === 'annual' ? 'is-active' : ''}" data-val="annual">سالانه</button>
                        <button class="${this.state.season === 'winter' ? 'is-active' : ''}" data-val="winter">زمستان</button>
                    </div>
                </div>
            </div>

            <div id="tcResult" class="card card--sun anim-scale-in" style="padding:var(--space-6);margin-top:var(--space-4);text-align:center;position:relative;overflow:hidden;">
                <div style="position:absolute;top:-30px;right:-30px;width:140px;height:140px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;color:var(--color-text-inverse);">
                    <p style="opacity:0.7;font-size:var(--font-size-sm);font-weight:600;">زاویه شیب بهینه</p>
                    <div id="tcTilt" style="font-size:80px;font-weight:900;line-height:1;letter-spacing:-2px;">-</div>
                    <p style="opacity:0.7;font-size:var(--font-size-md);font-weight:600;">درجه از افق</p>
                    <div style="margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid rgba(0,0,0,0.15);">
                        <p style="opacity:0.7;font-size:var(--font-size-sm);">آزیموت (جهت)</p>
                        <div id="tcAzimuth" style="font-size:var(--font-size-3xl);font-weight:800;">-</div>
                    </div>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">📋 راهنمای فصلی</h2>
                </div>
                <div class="list">
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__icon" style="background:rgba(245,158,11,0.15);color:var(--color-sun-300);">☀️</div>
                        <div class="list-item__body">
                            <div class="list-item__title">تابستان</div>
                            <div class="list-item__subtitle">عرض جغرافیایی - ۱۵ درجه</div>
                        </div>
                        <div style="font-weight:700;color:var(--color-sun-300);" id="tcSummer">-</div>
                    </div>
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__icon" style="background:rgba(14,165,233,0.15);color:var(--color-sky-300);">🌐</div>
                        <div class="list-item__body">
                            <div class="list-item__title">سالانه</div>
                            <div class="list-item__subtitle">برابر عرض جغرافیایی</div>
                        </div>
                        <div style="font-weight:700;color:var(--color-sky-300);" id="tcAnnual">-</div>
                    </div>
                    <div class="list-item" style="cursor:default;">
                        <div class="list-item__icon" style="background:rgba(14,165,233,0.15);color:var(--color-sky-300);">❄️</div>
                        <div class="list-item__body">
                            <div class="list-item__title">زمستان</div>
                            <div class="list-item__subtitle">عرض جغرافیایی + ۱۵ درجه</div>
                        </div>
                        <div style="font-weight:700;color:var(--color-sky-300);" id="tcWinter">-</div>
                    </div>
                </div>
            </div>

            <div class="card card--glass section anim-fade-up">
                <div class="card__header">
                    <h2 class="section__title">💡 نکات مهم</h2>
                </div>
                <ul style="padding-right:var(--space-5);line-height:2;color:var(--color-text-muted);font-size:var(--font-size-sm);">
                    <li>• شیب ۳۰-۳۵ درجه برای اکثر مناطق ایران و افغانستان ایده‌آل است</li>
                    <li>• آزیموت صفر (جنوب) در نیمکره شمالی حداکثر تولید را دارد</li>
                    <li>• شیب بیشتر = تمیز شدن بهتر پنل در باران</li>
                    <li>• برای سقف‌های شیبدار، از همان شیب سقف استفاده کنید</li>
                    <li>• فاصله ۱-۲ متر بین ردیف‌ها برای جلوگیری از سایه</li>
                </ul>
            </div>
        `;
    },

    attach() {
        const update = () => this._update();
        const slider = document.getElementById('tcLat');
        const value = document.getElementById('tcLatV');
        slider?.addEventListener('input', () => { value.value = slider.value; this.state.latitude = parseFloat(slider.value); update(); });
        value?.addEventListener('input', () => { slider.value = value.value; this.state.latitude = parseFloat(value.value); update(); });
        document.querySelectorAll('#tcSeason button').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.season = btn.dataset.val;
                document.querySelectorAll('#tcSeason button').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                update();
            });
        });
        update();
    },

    _update() {
        const lat = this.state.latitude;
        const summer = SolarCalc.calcOptimalTilt(lat, 'summer');
        const annual = SolarCalc.calcOptimalTilt(lat, 'annual');
        const winter = SolarCalc.calcOptimalTilt(lat, 'winter');
        const azimuth = SolarCalc.calcOptimalAzimuth(lat);

        const tilt = this.state.season === 'summer' ? summer : this.state.season === 'winter' ? winter : annual;
        const tiltEl = document.getElementById('tcTilt');
        const azEl = document.getElementById('tcAzimuth');
        if (tiltEl) tiltEl.textContent = Utils.toPersian(tilt) + '°';
        if (azEl) azEl.textContent = azimuth === 180 ? 'جنوب (۱۸۰°)' : 'شمال (۰°)';
        const sEl = document.getElementById('tcSummer');
        const aEl = document.getElementById('tcAnnual');
        const wEl = document.getElementById('tcWinter');
        if (sEl) sEl.textContent = Utils.toPersian(summer) + '°';
        if (aEl) aEl.textContent = Utils.toPersian(annual) + '°';
        if (wEl) wEl.textContent = Utils.toPersian(winter) + '°';
    }
};
