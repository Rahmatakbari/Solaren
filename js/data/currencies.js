/**
 * ماژول ماشین‌حساب چند ارزی و نرخ‌های لحظه‌ای
 * Multi-Currency Calculator with Live Rates
 */

const STORAGE_KEY = 'solar-pwa:exchange-rates';
const LAST_UPDATE_KEY = 'solar-pwa:exchange-update';

// نرخ‌های پایه (نسبت به دلار آمریکا) - آپدیت ۲۰۲۵/۲۰۲۶
// کاربر می‌تواند در تنظیمات نرخ‌ها را تغییر دهد
const DEFAULT_RATES = {
    USD: 1.0,        // دلار آمریکا (پایه)
    AFN: 71.5,       // افغانی افغانستان
    IRR: 42000,      // تومان ایران (ریال)
    IRT: 42000,      // تومان ایران (جدید)
    EUR: 0.92,       // یورو
    GBP: 0.79,       // پوند انگلیس
    AED: 3.67,       // درهم امارات
    PKR: 280,        // روپیه پاکستان
    INR: 84,         // روپیه هند
    CNY: 7.2,        // یوآن چین
    SAR: 3.75,       // ریال عربستان
    TRY: 32,         // لیر ترکیه
    RUB: 92          // روبل روسیه
};

export const CURRENCIES = {
    USD: { code: 'USD', symbol: '$', name: 'دلار آمریکا', nameEn: 'US Dollar', flag: '🇺🇸', decimals: 2 },
    AFN: { code: 'AFN', symbol: '؋', name: 'افغانی', nameEn: 'Afghan Afghani', flag: '🇦🇫', decimals: 0 },
    IRR: { code: 'IRR', symbol: '﷼', name: 'ریال ایران', nameEn: 'Iranian Rial', flag: '🇮🇷', decimals: 0 },
    IRT: { code: 'IRT', symbol: 'ت', name: 'تومان', nameEn: 'Iranian Toman', flag: '🇮🇷', decimals: 0 },
    EUR: { code: 'EUR', symbol: '€', name: 'یورو', nameEn: 'Euro', flag: '🇪🇺', decimals: 2 },
    GBP: { code: 'GBP', symbol: '£', name: 'پوند', nameEn: 'British Pound', flag: '🇬🇧', decimals: 2 },
    AED: { code: 'AED', symbol: 'د.إ', name: 'درهم امارات', nameEn: 'UAE Dirham', flag: '🇦🇪', decimals: 2 },
    PKR: { code: 'PKR', symbol: '₨', name: 'روپیه پاکستان', nameEn: 'Pakistani Rupee', flag: '🇵🇰', decimals: 0 },
    INR: { code: 'INR', symbol: '₹', name: 'روپیه هند', nameEn: 'Indian Rupee', flag: '🇮🇳', decimals: 2 },
    CNY: { code: 'CNY', symbol: '¥', name: 'یوآن چین', nameEn: 'Chinese Yuan', flag: '🇨🇳', decimals: 2 },
    SAR: { code: 'SAR', symbol: 'ر.س', name: 'ریال عربستان', nameEn: 'Saudi Riyal', flag: '🇸🇦', decimals: 2 },
    TRY: { code: 'TRY', symbol: '₺', name: 'لیر ترکیه', nameEn: 'Turkish Lira', flag: '🇹🇷', decimals: 2 },
    RUB: { code: 'RUB', symbol: '₽', name: 'روبل روسیه', nameEn: 'Russian Ruble', flag: '🇷🇺', decimals: 2 }
};

export function getRates() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        if (saved) return saved;
    } catch { /* silent */ }
    return { ...DEFAULT_RATES };
}

export function setRates(rates) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(rates));
        localStorage.setItem(LAST_UPDATE_KEY, new Date().toISOString());
    } catch { /* silent */ }
}

export function getLastUpdate() {
    try {
        return localStorage.getItem(LAST_UPDATE_KEY);
    } catch { return null; }
}

export function resetRates() {
    setRates({ ...DEFAULT_RATES });
}

export function convert(amount, from, to) {
    const rates = getRates();
    if (!rates[from] || !rates[to]) return 0;
    // تبدیل به دلار اول، بعد به ارز مقصد
    const inUSD = amount / rates[from];
    return inUSD * rates[to];
}

export function formatCurrency(amount, currencyCode) {
    const c = CURRENCIES[currencyCode] || CURRENCIES.USD;
    const num = Number(amount).toFixed(c.decimals);
    // تبدیل اعداد به فارسی
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    const formatted = num.replace(/\d/g, d => persianDigits[parseInt(d)]);
    return `${formatted} ${c.symbol}`;
}

export function getCurrency(code) {
    return CURRENCIES[code] || CURRENCIES.USD;
}

export function getCurrencyList() {
    return Object.values(CURRENCIES);
}

/**
 * محاسبه قیمت با حاشیه سود
 */
export function calculatePriceWithMargin(costPrice, marginPct, currency = 'USD') {
    const price = costPrice * (1 + marginPct / 100);
    return price;
}

/**
 * تبدیل قیمت پنل/اینورتر به همه ارزها
 */
export function getAllCurrencyPrices(amountUSD) {
    const rates = getRates();
    const result = {};
    Object.keys(CURRENCIES).forEach(code => {
        result[code] = convert(amountUSD, 'USD', code);
    });
    return result;
}

/**
 * نمایش قیمت در همه ارزها به صورت جدول
 */
export function formatMultiCurrencyTable(amountUSD) {
    const rates = getRates();
    return Object.keys(CURRENCIES).map(code => {
        const c = CURRENCIES[code];
        const value = amountUSD * rates[code];
        return {
            code,
            flag: c.flag,
            name: c.name,
            value,
            formatted: formatCurrency(value, code)
        };
    });
}
