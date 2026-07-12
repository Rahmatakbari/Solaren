/**
 * محاسبه سایز کابل + دیاگرام مدار
 * Wire Size Calculator with Visual Circuit Diagram
 */
import { Utils } from '../utils.js';
import { SolarCalc } from '../calc.js';

export const wireCalc = {
    name: 'wire-calc',
    path: '#wire-calc',

    state: {
        current: 30,
        length: 30,
        voltage: 48,
        dropPct: 3,
        material: 'copper', // copper | aluminum
        phase: 'dc' // dc | ac1 | ac3
    },

    render() {
        return `
            <h1 class="page-title anim-fade-up">⚡ محاسبه سایز کابل</h1>
            <p class="page-subtitle anim-fade-up">با دیاگرام مدار تعاملی و محاسبه حرفه‌ای</p>

            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div class="card__header">
                    <div class="card__icon card__icon--sky">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    </div>
                    <div>
                        <div class="card__title">محاسبه سطح مقطع</div>
                        <div class="card__subtitle">با فرمول استاندارد افت ولتاژ</div>
                    </div>
                </div>

                <div class="field">
                    <label class="field__label">جریان (آمپر)</label>
                    <div class="input-slider">
                        <input type="range" id="wcCurrent" min="1" max="500" step="1" value="${this.state.current}">
                        <input type="number" class="input" id="wcCurrentV" min="1" max="500" step="1" value="${this.state.current}">
                    </div>
                </div>

                <div class="field">
                    <label class="field__label">طول کابل (متر)</label>
                    <div class="input-slider">
                        <input type="range" id="wcLength" min="1" max="500" step="1" value="${this.state.length}">
                        <input type="number" class="input" id="wcLengthV" min="1" max="500" step="1" value="${this.state.length}">
                    </div>
                </div>

                <div class="field">
                    <label class="field__label">ولتاژ سیستم</label>
                    <select class="select" id="wcVoltage">
                        <option value="12" ${this.state.voltage === 12 ? 'selected' : ''}>12V DC (باتری)</option>
                        <option value="24" ${this.state.voltage === 24 ? 'selected' : ''}>24V DC (باتری)</option>
                        <option value="48" ${this.state.voltage === 48 ? 'selected' : ''}>48V DC (باتری/سولار)</option>
                        <option value="96" ${this.state.voltage === 96 ? 'selected' : ''}>96V DC (باتری لیتیوم)</option>
                        <option value="220" ${this.state.voltage === 220 ? 'selected' : ''}>220V AC (تک‌فاز)</option>
                        <option value="380" ${this.state.voltage === 380 ? 'selected' : ''}>380V AC (سه‌فاز)</option>
                    </select>
                </div>

                <div class="field">
                    <label class="field__label">افت ولتاژ مجاز (%)</label>
                    <div class="switch-group" id="wcDropGroup">
                        <button class="${this.state.dropPct === 1 ? 'is-active' : ''}" data-drop="1">۱٪</button>
                        <button class="${this.state.dropPct === 2 ? 'is-active' : ''}" data-drop="2">۲٪</button>
                        <button class="${this.state.dropPct === 3 ? 'is-active' : ''}" data-drop="3">۳٪</button>
                        <button class="${this.state.dropPct === 5 ? 'is-active' : ''}" data-drop="5">۵٪</button>
                    </div>
                    <p style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-top:6px;">
                        💡 پیشنهاد: ۳٪ برای DC، ۲٪ برای AC، ۱٪ برای مسافت‌های طولانی
                    </p>
                </div>

                <div class="field">
                    <label class="field__label">جنس هادی</label>
                    <div class="switch-group" id="wcMaterialGroup">
                        <button class="${this.state.material === 'copper' ? 'is-active' : ''}" data-mat="copper">مس (Cu)</button>
                        <button class="${this.state.material === 'aluminum' ? 'is-active' : ''}" data-mat="aluminum">آلومینیوم (Al)</button>
                    </div>
                </div>
            </div>

            <!-- دیاگرام مدار -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <h3 style="font-size:var(--font-size-md);font-weight:700;margin-bottom:var(--space-3);display:flex;align-items:center;gap:var(--space-2);">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/></svg>
                    دیاگرام مدار
                </h3>
                <div style="position:relative;background:linear-gradient(135deg, var(--color-bg-soft), var(--color-surface));border-radius:var(--radius-md);padding:var(--space-3);">
                    <canvas id="wireDiagram" style="width:100%;height:200px;display:block;"></canvas>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2);margin-top:var(--space-3);">
                    <div style="text-align:center;padding:var(--space-2);background:var(--color-bg-soft);border-radius:var(--radius-sm);">
                        <div style="font-size:10px;color:var(--color-text-muted);">ولتاژ منبع</div>
                        <div id="wcSrcV" style="font-weight:700;color:var(--color-sky-300);">-</div>
                    </div>
                    <div style="text-align:center;padding:var(--space-2);background:var(--color-bg-soft);border-radius:var(--radius-sm);">
                        <div style="font-size:10px;color:var(--color-text-muted);">ولتاژ مصرف‌کننده</div>
                        <div id="wcLoadV" style="font-weight:700;color:var(--color-emerald-400);">-</div>
                    </div>
                    <div style="text-align:center;padding:var(--space-2);background:var(--color-bg-soft);border-radius:var(--radius-sm);">
                        <div style="font-size:10px;color:var(--color-text-muted);">افت ولتاژ</div>
                        <div id="wcDrop" style="font-weight:700;color:var(--color-sun-300);">-</div>
                    </div>
                </div>
            </div>

            <!-- نتیجه -->
            <div class="card anim-scale-in" style="padding:var(--space-5);background:linear-gradient(135deg, #f59e0b 0%, #f97316 100%);color:white;margin-bottom:var(--space-4);position:relative;overflow:hidden;">
                <div style="position:absolute;top:-30px;right:-30px;width:160px;height:160px;background:rgba(255,255,255,0.1);border-radius:50%;filter:blur(30px);"></div>
                <div style="position:relative;">
                    <div style="font-size:var(--font-size-sm);opacity:0.85;">سطح مقطع پیشنهادی</div>
                    <div id="wcSize" style="font-size:3.5rem;font-weight:900;line-height:1;margin:4px 0;">-</div>
                    <div id="wcMaterialLabel" style="font-size:var(--font-size-sm);opacity:0.85;">هادی مس - با عایق PVC</div>
                </div>
            </div>

            <!-- اطلاعات تکمیلی -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);margin-bottom:var(--space-4);">
                <div class="card card--glass" style="padding:var(--space-3);">
                    <div style="font-size:10px;color:var(--color-text-muted);">توان (W)</div>
                    <div id="wcPower" style="font-size:var(--font-size-xl);font-weight:800;color:var(--color-text);">-</div>
                </div>
                <div class="card card--glass" style="padding:var(--space-3);">
                    <div style="font-size:10px;color:var(--color-text-muted);">مقاومت کابل</div>
                    <div id="wcRes" style="font-size:var(--font-size-xl);font-weight:800;color:var(--color-text);">-</div>
                </div>
                <div class="card card--glass" style="padding:var(--space-3);">
                    <div style="font-size:10px;color:var(--color-text-muted);">تلفات توان</div>
                    <div id="wcLoss" style="font-size:var(--font-size-xl);font-weight:800;color:var(--color-red-400);">-</div>
                </div>
                <div class="card card--glass" style="padding:var(--space-3);">
                    <div style="font-size:10px;color:var(--color-text-muted);">حداکثر جریان کابل</div>
                    <div id="wcMax" style="font-size:var(--font-size-xl);font-weight:800;color:var(--color-text);">-</div>
                </div>
            </div>

            <!-- جدول استاندارد با هایلایت -->
            <div class="card card--glass" style="margin-bottom:var(--space-4);">
                <h3 style="font-size:var(--font-size-md);font-weight:700;margin-bottom:var(--space-3);">📋 جدول استاندارد کابل</h3>
                <div class="list" id="wcTable">
                    ${this._renderTable()}
                </div>
            </div>

            <!-- راهنما -->
            <div class="card card--sky anim-fade-up" style="background:linear-gradient(135deg, rgba(14,165,233,0.1), rgba(2,132,199,0.1));border:1px solid rgba(14,165,233,0.3);">
                <h3 style="color:var(--color-sky-300);font-size:var(--font-size-md);font-weight:700;margin-bottom:var(--space-2);">💡 راهنما</h3>
                <ul style="font-size:var(--font-size-sm);line-height:1.8;color:var(--color-text-2);padding-right:20px;">
                    <li>برای DC از <strong>۳٪</strong> و برای AC از <strong>۲٪</strong> افت ولتاژ استفاده کنید</li>
                    <li>مس بهتر از آلومینیوم است، اما گران‌تر (ضریب ۱.۶)</li>
                    <li>همیشه یک سایز بزرگ‌تر انتخاب کنید برای حاشیه ایمنی</li>
                    <li>برای مسافت‌های بالای ۵۰ متر، ولتاژ بالاتر توصیه می‌شود</li>
                </ul>
            </div>
        `;
    },

    _renderTable() {
        const sizes = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
        const standardSize = this._getStandardSize();
        return sizes.map((s) => {
            const isStandard = s === standardSize;
            const maxA = Math.round(s * 7); // مس
            return `
                <div class="list-item ${isStandard ? 'is-highlighted' : ''}" style="cursor:default;padding:var(--space-2) var(--space-3);${isStandard ? 'background:linear-gradient(135deg, rgba(245,158,11,0.15), rgba(249,115,22,0.08));border:1px solid rgba(245,158,11,0.4);border-radius:var(--radius-md);' : ''}">
                    <div class="list-item__body">
                        <div class="list-item__title" style="font-size:var(--font-size-sm);font-weight:${isStandard ? '700' : '400'};">${s} mm² ${isStandard ? '⭐' : ''}</div>
                    </div>
                    <div style="font-size:var(--font-size-xs);color:${isStandard ? 'var(--color-sun-300)' : 'var(--color-text-dim)'};">حدود ${maxA} A</div>
                </div>
            `;
        }).join('');
    },

    _getStandardSize() {
        if (this.state.current <= 0 || this.state.length <= 0) return 0;
        return SolarCalc.calcCableSize(this.state.current, this.state.length, this.state.voltage, this.state.dropPct);
    },

    attach() {
        const update = () => this._update();
        document.getElementById('wcCurrent')?.addEventListener('input', (e) => {
            this.state.current = +e.target.value;
            document.getElementById('wcCurrentV').value = e.target.value;
            update();
        });
        document.getElementById('wcCurrentV')?.addEventListener('input', (e) => {
            this.state.current = +e.target.value || 0;
            document.getElementById('wcCurrent').value = Math.min(this.state.current, 500);
            update();
        });
        document.getElementById('wcLength')?.addEventListener('input', (e) => {
            this.state.length = +e.target.value;
            document.getElementById('wcLengthV').value = e.target.value;
            update();
        });
        document.getElementById('wcLengthV')?.addEventListener('input', (e) => {
            this.state.length = +e.target.value || 0;
            document.getElementById('wcLength').value = Math.min(this.state.length, 500);
            update();
        });
        document.getElementById('wcVoltage')?.addEventListener('change', (e) => {
            this.state.voltage = +e.target.value;
            update();
        });
        document.querySelectorAll('[data-drop]').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.dropPct = +btn.dataset.drop;
                document.querySelectorAll('[data-drop]').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                update();
            });
        });
        document.querySelectorAll('[data-mat]').forEach((btn) => {
            btn.addEventListener('click', () => {
                this.state.material = btn.dataset.mat;
                document.querySelectorAll('[data-mat]').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                update();
            });
        });
        update();
    },

    _update() {
        if (this.state.current <= 0 || this.state.length <= 0) return;

        const baseSize = SolarCalc.calcCableSize(this.state.current, this.state.length, this.state.voltage, this.state.dropPct);
        const size = this.state.material === 'aluminum' ? Math.ceil(baseSize * 1.6 * 10) / 10 : baseSize;
        const dropInfo = SolarCalc.calcVoltageDrop(this.state.current, this.state.length, this.state.voltage, size);

        const sizeEl = document.getElementById('wcSize');
        const dropEl = document.getElementById('wcDrop');
        const srcEl = document.getElementById('wcSrcV');
        const loadEl = document.getElementById('wcLoadV');
        const matLabel = document.getElementById('wcMaterialLabel');
        const powerEl = document.getElementById('wcPower');
        const resEl = document.getElementById('wcRes');
        const lossEl = document.getElementById('wcLoss');
        const maxEl = document.getElementById('wcMax');

        if (sizeEl) sizeEl.textContent = size + ' mm²';
        if (dropEl) dropEl.textContent = Utils.formatNumber(dropInfo.percent, 2) + ' %';
        if (srcEl) srcEl.textContent = this.state.voltage + ' V';
        if (loadEl) loadEl.textContent = Utils.formatNumber(this.state.voltage - dropInfo.volts, 1) + ' V';
        if (matLabel) matLabel.textContent = `هادی ${this.state.material === 'copper' ? 'مس' : 'آلومینیوم'} - با عایق PVC`;

        // محاسبات اضافی
        const power = this.state.current * this.state.voltage;
        if (powerEl) powerEl.textContent = Utils.formatNumber(power) + ' W';

        // مقاومت: R = ρ × L / A
        const rho = this.state.material === 'copper' ? 0.0175 : 0.0282;
        const resistance = (2 * rho * this.state.length) / size; // ضریب ۲ برای رفت و برگشت
        if (resEl) resEl.textContent = Utils.formatNumber(resistance, 3) + ' Ω';

        // تلفات توان
        const loss = this.state.current * this.state.current * resistance;
        if (lossEl) lossEl.textContent = Utils.formatNumber(loss, 1) + ' W';

        // حداکثر جریان کابل
        const maxAmp = Math.round(size * 7);
        if (maxEl) maxEl.textContent = maxAmp + ' A';

        // رسم دیاگرام
        this._drawDiagram(size, dropInfo);

        // به‌روزرسانی جدول
        const table = document.getElementById('wcTable');
        if (table) table.innerHTML = this._renderTable();
    },

    _drawDiagram(size, dropInfo) {
        const canvas = document.getElementById('wireDiagram');
        if (!canvas) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, rect.width, rect.height);

        const w = rect.width;
        const h = rect.height;
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        const lineColor = isLight ? '#1e293b' : '#f8fafc';
        const wireColor = '#0ea5e9';
        const sourceColor = '#10b981';
        const loadColor = '#f59e0b';
        const bgColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';

        // منبع (چپ)
        const srcX = 50;
        const srcY = h / 2;
        // مصرف‌کننده (راست)
        const loadX = w - 50;
        const loadY = h / 2;
        // سیم
        const yTop = srcY - 30;
        const yBot = srcY + 30;

        // پس‌زمینه
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, w, h);

        // منبع (باتری)
        ctx.fillStyle = sourceColor;
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        // بدنه باتری
        ctx.beginPath();
        ctx.roundRect(srcX - 22, srcY - 28, 44, 56, 6);
        ctx.fill();
        ctx.stroke();
        // سر باتری
        ctx.fillRect(srcX - 6, srcY - 32, 12, 4);
        ctx.fillRect(srcX - 6, srcY + 28, 12, 4);
        // علامت + و -
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', srcX, srcY - 14);
        ctx.fillText('−', srcX, srcY + 14);
        // ولتاژ
        ctx.fillStyle = lineColor;
        ctx.font = '11px sans-serif';
        ctx.fillText(this.state.voltage + 'V', srcX, srcY + 50);

        // مصرف‌کننده
        ctx.fillStyle = loadColor;
        ctx.beginPath();
        ctx.arc(loadX, loadY, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // نماد مصرف
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText('Ω', loadX, loadY);
        // توان
        ctx.fillStyle = lineColor;
        ctx.font = '11px sans-serif';
        ctx.fillText(this.state.current + 'A', loadX, loadY + 40);

        // سیم بالا
        ctx.strokeStyle = wireColor;
        ctx.lineWidth = Math.max(2, Math.min(8, size / 5));
        ctx.beginPath();
        ctx.moveTo(srcX, srcY - 20);
        ctx.lineTo(loadX, loadY - 20);
        ctx.stroke();

        // سیم پایین
        ctx.beginPath();
        ctx.moveTo(srcX, srcY + 20);
        ctx.lineTo(loadX, loadY + 20);
        ctx.stroke();

        // فلش جریان
        ctx.fillStyle = wireColor;
        const arrowX = (srcX + loadX) / 2;
        ctx.beginPath();
        ctx.moveTo(arrowX, srcY - 20);
        ctx.lineTo(arrowX - 6, srcY - 28);
        ctx.lineTo(arrowX + 6, srcY - 28);
        ctx.closePath();
        ctx.fill();

        // برچسب طول
        ctx.fillStyle = lineColor;
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`L = ${this.state.length} m`, arrowX, srcY - 50);

        // برچسب سایز
        ctx.fillText(`→ ${size} mm² →`, arrowX, srcY + 55);

        // برچسب افت ولتاژ
        if (dropInfo) {
            const dropColor = dropInfo.percent > 5 ? '#ef4444' : dropInfo.percent > 3 ? '#f59e0b' : '#10b981';
            ctx.fillStyle = dropColor;
            ctx.font = 'bold 14px sans-serif';
            ctx.fillText(`ΔV = ${dropInfo.volts.toFixed(2)}V (${dropInfo.percent.toFixed(2)}%)`, arrowX, srcY);
        }
    }
};
