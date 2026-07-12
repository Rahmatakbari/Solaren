/**
 * نرخ‌های تجهیزات سولر در افغانستان
 * Afghanistan Solar Equipment Rates
 *
 * این نرخ‌ها بر اساس بازار افغانستان تنظیم شده‌اند.
 * کاربر می‌تواند از طریق تنظیمات اپ، آن‌ها را به‌روزرسانی کند.
 */

const STORAGE_KEY = 'solar-pwa:afghanistan-rates';
const LAST_UPDATE_KEY = 'solar-pwa:afghanistan-rates-update';

// نرخ‌های پیش‌فرض (دلار آمریکا - USD)
const DEFAULT_RATES = {
    // پنل‌ها
    panel: {
        'p-jinko-550': 195,         // Jinko 550W
        'p-trina-550': 200,         // Trina 550W
        'p-longi-555': 195,         // Longi 555W
        'p-ja-solar-550': 190,      // JA Solar 550W
        'p-canadian-550': 210,      // Canadian Solar 550W
        'p-risen-550': 185,         // Risen 550W
        'p-tier-1-avg': 200,        // میانگین Tier 1
        'p-tier-2-avg': 170,        // میانگین Tier 2
        'p-tier-3-avg': 140         // میانگین Tier 3
    },
    // اینورترها
    inverter: {
        'inv-growatt-3000': 380,
        'inv-growatt-5000': 650,
        'inv-growatt-10000': 1100,
        'inv-deye-5000': 620,
        'inv-deye-10000': 1180,
        'inv-srne-3000': 320,
        'inv-sungrow-10000': 1200,
        'inv-huawei-10000': 1250,
        'inv-sma-5000': 950,
        'inv-fronius-5000': 1100,
        'inv-abb-5000': 1050
    },
    // باتری‌ها
    battery: {
        'b-pylontech-3.5': 1250,
        'b-pylontech-4.8': 1650,
        'b-deye-5.1': 1450,
        'b-deye-10.2': 2700,
        'b-lifepo4-100': 1180,
        'b-tubular-150': 280,
        'b-gel-200': 450
    },
    // تجهیزات جانبی
    accessories: {
        cable_dc_per_m: 2.5,        // کابل DC 6mm²
        cable_ac_per_m: 1.8,        // کابل AC 4mm²
        cable_bat_per_m: 12,        // کابل باتری 50mm²
        mc4_pair: 3.5,             // کانکتور MC4
        dc_breaker: 28,            // بریکر DC
        ac_breaker: 18,            // بریکر AC
        fuse: 8,                   // فیوز
        spd: 65,                   // محافظ برق
        grounding: 120,             // سیستم ارتینگ
        rail_per_m: 8,             // ریل
        mid_clamp: 1.5,           // گیره میانی
        end_clamp: 2,             // گیره انتهایی
        l_foot: 3.5,              // پایه L
        monitor: 45,               // مانیتور WiFi
        cabinet: 180,              // تابلو برق
        bat_cabinet: 220          // کابینت باتری
    },
    // نرخ نصب
    installation: {
        labor_per_kw: 50,          // دستمزد نصب به ازای هر kW
        permit_fixed: 30,          // هزینه مجوز ثابت
        permit_per_kw: 5,          // هزینه مجوز به ازای هر kW
        transport_pct: 3           // درصد هزینه حمل و نقل
    },
    // نرخ برق
    electricity: {
        afn_per_kwh: 5,            // نرخ برق افغانستان (افغانی)
        irr_per_kwh: 800,          // نرخ برق ایران (تومان)
        afn_per_usd: 71.5,         // نرخ دلار به افغانی
        irr_per_usd: 42000         // نرخ دلار به تومان
    },
    // مالیات و عوارض
    tax: {
        vat_pct: 10,               // مالیات بر ارزش افزوده (%)
        customs_pct: 5,            // گمرک (%)
        profit_margin_pct: 20       // حاشیه سود فروشنده (%)
    }
};

/**
 * دریافت نرخ‌ها
 */
export function getAfghanistanRates() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        if (saved) {
            // ترکیب با پیش‌فرض برای اطمینان از وجود همه کلیدها
            return {
                panel: { ...DEFAULT_RATES.panel, ...(saved.panel || {}) },
                inverter: { ...DEFAULT_RATES.inverter, ...(saved.inverter || {}) },
                battery: { ...DEFAULT_RATES.battery, ...(saved.battery || {}) },
                accessories: { ...DEFAULT_RATES.accessories, ...(saved.accessories || {}) },
                installation: { ...DEFAULT_RATES.installation, ...(saved.installation || {}) },
                electricity: { ...DEFAULT_RATES.electricity, ...(saved.electricity || {}) },
                tax: { ...DEFAULT_RATES.tax, ...(saved.tax || {}) }
            };
        }
    } catch { /* ignore */ }
    return JSON.parse(JSON.stringify(DEFAULT_RATES));
}

/**
 * ذخیره نرخ‌ها
 */
export function setAfghanistanRates(rates) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
        localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
        return true;
    } catch (e) {
        console.error('Failed to save rates:', e);
        return false;
    }
}

/**
 * بازنشانی به پیش‌فرض
 */
export function resetAfghanistanRates() {
    return setAfghanistanRates(DEFAULT_RATES);
}

/**
 * دریافت نرخ یک پنل
 */
export function getPanelRate(panelId) {
    const rates = getAfghanistanRates();
    return rates.panel[panelId] || rates.panel['p-tier-2-avg'] || 180;
}

/**
 * دریافت نرخ یک اینورتر
 */
export function getInverterRate(inverterId) {
    const rates = getAfghanistanRates();
    return rates.inverter[inverterId] || 800;
}

/**
 * دریافت نرخ یک باتری
 */
export function getBatteryRate(batteryId) {
    const rates = getAfghanistanRates();
    return rates.battery[batteryId] || 1500;
}

/**
 * محاسبه قیمت نهایی با احتساب مالیات، گمرک، و حاشیه سود
 */
export function calculateFinalPrice(basePriceUSD, tax = null) {
    const rates = getAfghanistanRates();
    const t = tax || rates.tax;
    const withCustoms = basePriceUSD * (1 + t.customs_pct / 100);
    const withVAT = withCustoms * (1 + t.vat_pct / 100);
    const withMargin = withVAT * (1 + t.profit_margin_pct / 100);
    return {
        base: basePriceUSD,
        withCustoms: Math.round(withCustoms),
        withVAT: Math.round(withVAT),
        withMargin: Math.round(withMargin),
        final: Math.round(withMargin)
    };
}

/**
 * محاسبه قیمت به افغانی
 */
export function toAfghani(usd) {
    const rates = getAfghanistanRates();
    return Math.round(usd * rates.electricity.afn_per_usd);
}

/**
 * محاسبه قیمت به تومان
 */
export function toToman(usd) {
    const rates = getAfghanistanRates();
    return Math.round(usd * rates.electricity.irr_per_usd);
}

/**
 * دریافت زمان آخرین به‌روزرسانی
 */
export function getRatesLastUpdate() {
    return localStorage.getItem(LAST_UPDATE_KEY);
}

/**
 * صادرات نرخ‌های پیش‌فرض
 */
export { DEFAULT_RATES };
