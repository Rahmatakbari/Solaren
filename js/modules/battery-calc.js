/**
 * Battery sizing calculator
 */
import { Utils } from '../utils.js';
import { SolarCalc } from '../calc.js';
import { findBattery } from '../data/batteries.js';

export const batteryCalc = {
    name: 'battery-calc',
    path: '#battery-calc',

    state: { dailyKWh: 10, backupHours: 4, voltage: 48, dod: 0.9, batteryType: 'LiFePO4' },

    render() {
        return `
            <h1 class="page-title anim-fade-up">محاسبه باتری</h1>
            <p class="page-subtitle anim-fade-up">ظرفیت و تعداد باتری مورد نیاز</p>

            <div class="card card--glass anim-fade-up">
                <div class="card__header">
                    <div class="card__icon card__icon--emerald">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><rect x="2" y="7" width="18" height="10" rx="2"/></svg>
                    </div>
                    <div>
                        <div class="card__title">محاسبه ظرفیت باتری</div>
                        <div class="card__subtitle">با در نظر گرفتن DoD و راندمان</div>
                    </div>
                </div>

                <div class="field">
                    <label class="field__label">مصرف روزانه (kWh)</label>
                    <div class="input-slider">
                        <input type="range" id="bcDaily" min="1" max="100" step="0.5" value="${this.state.dailyKWh}">
                        <input type="number" class="input" id="bcDailyV" min="1" max="100" step="0.5" value="${this.state.dailyKWh}">
                    </div>
                </div>

                <div class="field">
                    <label class="field__label">ساعات پشتیبان‌گیری</label>
                    <div class="input-slider">
                        <input type="range" id="bcBackup" min="1" max="48" step="1" value="${this.state.backupHours}">
                        <input type="number" class="input" id="bcBackupV" min="1" max="48" value="${this.state.backupHours}">
                    </div>
                </div>

                <div class="field">
                    <label class="field__label">ولتاژ سیستم</label>
                    <div class="switch-group" id="bcVolt">
                        <button class="${this.state.voltage === 12 ? 'is-active' : ''}" data-val="12">12V</button>
                        <button class="${this.state.voltage === 24 ? 'is-active' : ''}" data-val="24">24V</button>
                        <button class="${this.state.voltage === 48 ? 'is-active' : ''}" data-val="48">48V</button>
                    </div>
                </div>

                <div class="field">
                    <label class="field__label">نوع باتری</label>
                    <div class="switch-group" id="bcType">
                        <button class="${this.state.batteryType === 'LiFePO4' ? 'is-active' : ''}" data-val="LiFePO4">لیتیوم</button>
                        <button class="${this.state.batteryType === 'Lead-Acid' ? 'is-active' : ''}" data-val="Lead-Acid">سرب اسید</button>
                        <button class="${this.state.batteryType === 'Gel' ? 'is-active' : ''}" data-val="Gel">ژل</button>
                    </div>
                </div>

                <div id="bcResult" class="card card--emerald" style="padding:var(--space-5);margin-top:var(--space-4);color:white;">
                    <div style="text-align:center;">
                        <div style="opacity:0.85;font-size:var(--font-size-sm);">ظرفیت مورد نیاز</div>
                        <div id="bcSize" style="font-size:var(--font-size-5xl);font-weight:900;line-height:1;">-</div>
                        <div style="margin-top:var(--space-2);font-size:var(--font-size-sm);opacity:0.85;">kWh قابل استفاده</div>
                    </div>
                </div>

                <div class="card card--glass" style="margin-top:var(--space-4);padding:var(--space-4);" id="bcRecommendation">
                    <h3 style="font-size:var(--font-size-md);font-weight:700;margin-bottom:var(--space-3);">💡 پیشنهاد باتری</h3>
                    <div id="bcRecContent"></div>
                </div>
            </div>
        `;
    },

    attach() {
        const update = () => this._update();
        document.getElementById('bcDaily')?.addEventListener('input', (e) => {
            this.state.dailyKWh = +e.target.value;
            document.getElementById('bcDailyV').value = e.target.value;
            update();
        });
        document.getElementById('bcDailyV')?.addEventListener('input', (e) => {
            this.state.dailyKWh = +e.target.value;
            document.getElementById('bcDaily').value = e.target.value;
            update();
        });
        document.getElementById('bcBackup')?.addEventListener('input', (e) => {
            this.state.backupHours = +e.target.value;
            document.getElementById('bcBackupV').value = e.target.value;
            update();
        });
        document.getElementById('bcBackupV')?.addEventListener('input', (e) => {
            this.state.backupHours = +e.target.value;
            document.getElementById('bcBackup').value = e.target.value;
            update();
        });
        document.querySelectorAll('#bcVolt button').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.voltage = +btn.dataset.val;
                document.querySelectorAll('#bcVolt button').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                update();
            });
        });
        document.querySelectorAll('#bcType button').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.batteryType = btn.dataset.val;
                this.state.dod = btn.dataset.val === 'LiFePO4' ? 0.9 : btn.dataset.val === 'Gel' ? 0.6 : 0.5;
                document.querySelectorAll('#bcType button').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                update();
            });
        });
        update();
    },

    _update() {
        const dod = this.state.batteryType === 'LiFePO4' ? 0.9 : this.state.batteryType === 'Gel' ? 0.6 : 0.5;
        const eff = 0.95;
        const requiredKWh = SolarCalc.calcBatterySize(this.state.dailyKWh, this.state.backupHours, dod, eff);
        const sizeEl = document.getElementById('bcSize');
        if (sizeEl) sizeEl.textContent = Utils.formatNumber(requiredKWh, 2);

        // Find suitable battery
        const battery = findBattery(this._findSuitableId(requiredKWh, this.state.voltage, this.state.batteryType));
        if (!battery) return;
        const numUnits = Math.ceil(requiredKWh / battery.capacityKWh);
        const recEl = document.getElementById('bcRecContent');
        if (recEl) {
            recEl.innerHTML = `
                <div style="display:flex;align-items:center;gap:var(--space-3);">
                    <div style="width:48px;height:48px;border-radius:var(--radius-md);background:var(--gradient-emerald);color:white;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24"><rect x="2" y="7" width="18" height="10" rx="2"/></svg>
                    </div>
                    <div style="flex:1;">
                        <div style="font-weight:700;">${Utils.escapeHTML(battery.brand)} ${Utils.escapeHTML(battery.model)}</div>
                        <div style="color:var(--color-text-muted);font-size:var(--font-size-sm);">${battery.capacityKWh} kWh · ${battery.voltage}V · DoD ${battery.dod}%</div>
                    </div>
                </div>
                <div style="margin-top:var(--space-4);padding-top:var(--space-3);border-top:1px solid var(--color-border);">
                    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:var(--space-3);font-size:var(--font-size-sm);">
                        <div><span style="color:var(--color-text-dim);">تعداد مورد نیاز:</span> <strong>${Utils.toPersian(numUnits)} دستگاه</strong></div>
                        <div><span style="color:var(--color-text-dim);">ظرفیت کل:</span> <strong>${Utils.formatNumber(numUnits * battery.capacityKWh, 2)} kWh</strong></div>
                        <div><span style="color:var(--color-text-dim);">هزینه:</span> <strong>${Utils.formatNumber(numUnits * battery.price)} $</strong></div>
                        <div><span style="color:var(--color-text-dim);">عمر چرخه:</span> <strong>${Utils.toPersian(battery.cycles)}</strong></div>
                    </div>
                </div>
            `;
        }
    },

    _findSuitableId(requiredKWh, voltage, type) {
        const ids = { 'LiFePO4': ['b-pylontech-4.8', 'b-deye-5.1', 'b-deye-10.2', 'b-lifepo4-100'], 'Lead-Acid': ['b-tubular-150'], 'Gel': ['b-gel-200'] };
        const list = ids[type] || ids['LiFePO4'];
        for (const id of list) {
            const b = findBattery(id);
            if (b.capacityKWh >= requiredKWh * 0.7) return id;
        }
        return list[0];
    }
};
