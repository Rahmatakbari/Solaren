/**
 * موتور شبیه‌ساز ساعتی تولید سولر
 * Hourly Solar Production Simulator
 *
 * الگوریتم: منحنی سینوسی اصلاح‌شده برای ساعات روز
 * - صبح و عصر: کم
 * - ظهر: اوج (PSH peak)
 * - ابری: کاهش ۳۰-۷۰٪
 */

const HOURLY_FACTORS = {
    // ضریب تابش خورشید در هر ساعت از روز (۰-۲۴)
    0: 0,    1: 0,    2: 0,    3: 0,    4: 0,    5: 0,
    6: 0.05, 7: 0.20, 8: 0.40, 9: 0.65, 10: 0.85, 11: 0.95,
    12: 1.00, 13: 0.95, 14: 0.85, 15: 0.65, 16: 0.40, 17: 0.20,
    18: 0.05, 19: 0,   20: 0,   21: 0,   22: 0,   23: 0
};

const SEASONAL_FACTORS = {
    spring: 0.95,  // بهار (فروردین-خرداد)
    summer: 1.10,  // تابستان (تیر-شهریور)
    autumn: 0.90,  // پاییز (مهر-آذر)
    winter: 0.70   // زمستان (دی-اسفند)
};

const WEATHER_FACTORS = {
    sunny: 1.0,
    partly_cloudy: 0.75,
    cloudy: 0.45,
    rainy: 0.25,
    snowy: 0.30,
    dusty: 0.55
};

/**
 * محاسبه توان لحظه‌ای پنل بر اساس ساعت
 */
export function calculateHourlyPower({ hour, systemKw, psh, season = 'summer', weather = 'sunny', tiltLoss = 0.10, tempLoss = 0.05 }) {
    const hourFactor = HOURLY_FACTORS[hour] || 0;
    const seasonFactor = SEASONAL_FACTORS[season] || 1;
    const weatherFactor = WEATHER_FACTORS[weather] || 1;
    // توان = ظرفیت سیستم × ضریب ساعتی × ضریب فصل × ضریب آب و هوا × (1 - تلفات)
    const power = systemKw * hourFactor * seasonFactor * weatherFactor * (1 - tiltLoss) * (1 - tempLoss);
    return Math.max(0, power);
}

/**
 * محاسبه کل تولید روزانه (kWh)
 */
export function calculateDailyProduction({ systemKw, psh, season = 'summer', weather = 'sunny', tiltLoss = 0.10, tempLoss = 0.05 }) {
    let total = 0;
    for (let h = 0; h < 24; h++) {
        total += calculateHourlyPower({ hour: h, systemKw, psh, season, weather, tiltLoss, tempLoss });
    }
    return total;
}

/**
 * محاسبه آرایه ساعتی برای نمودار
 */
export function getHourlyProductionArray({ systemKw, psh, season = 'summer', weather = 'sunny', tiltLoss = 0.10, tempLoss = 0.05 }) {
    return Array.from({ length: 24 }, (_, h) => ({
        hour: h,
        power: calculateHourlyPower({ hour: h, systemKw, psh, season, weather, tiltLoss, tempLoss })
    }));
}

/**
 * محاسبه تولید ماهانه
 */
export function getMonthlyProduction({ systemKw, psh, weather = 'sunny', tiltLoss = 0.10, tempLoss = 0.05 }) {
    const monthSeasons = [
        'spring', 'spring', 'spring', 'summer', 'summer', 'summer',
        'autumn', 'autumn', 'autumn', 'winter', 'winter', 'winter'
    ];
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return monthSeasons.map((season, i) => {
        const daily = calculateDailyProduction({ systemKw, psh, season, weather, tiltLoss, tempLoss });
        return {
            month: i + 1,
            season,
            days: daysInMonth[i],
            daily: daily,
            total: daily * daysInMonth[i]
        };
    });
}

/**
 * محاسبه عملکرد سالانه
 */
export function getYearlyStats({ systemKw, psh, weather = 'sunny', tiltLoss = 0.10, tempLoss = 0.05 }) {
    const monthly = getMonthlyProduction({ systemKw, psh, weather, tiltLoss, tempLoss });
    const totalYearly = monthly.reduce((s, m) => s + m.total, 0);
    const totalDaily = totalYearly / 365;
    return {
        monthly,
        totalYearly,
        averageDaily: totalDaily,
        co2Saved: totalYearly * 0.5, // kg CO2
        treesEquivalent: Math.round((totalYearly * 0.5) / 22)
    };
}

/**
 * دریافت پیشنهاد هوشمند بر اساس ساعت
 */
export function getSmartHint(hour, currentPower, systemKw) {
    const h = parseInt(hour);
    if (h < 6 || h > 18) {
        return {
            text: '🌙 در حال حاضر شب است. سیستم در حالت standby یا استفاده از باتری/شبکه است.',
            icon: '🌙',
            tip: 'وسایل پرمصرف را به ساعات اوج منتقل کنید.'
        };
    }
    if (h >= 6 && h < 9) {
        return {
            text: '🌅 صبح بخیر! تولید در حال افزایش است. زمان مناسب برای روشن کردن وسایل.',
            icon: '🌅',
            tip: 'شارژ باتری‌ها شروع شده. می‌توانید وسایل برقی را روشن کنید.'
        };
    }
    if (h >= 9 && h < 12) {
        return {
            text: '☀️ تولید رو به افزایش است. نزدیک اوج هستیم!',
            icon: '☀️',
            tip: 'بهترین زمان برای استفاده از وسایل پرمصرف مثل ماشین لباسشویی.'
        };
    }
    if (h >= 12 && h < 14) {
        return {
            text: '🌞 ساعت اوج تولید! حداکثر توان سیستم در دسترس است.',
            icon: '🌞',
            tip: 'عالی‌ترین زمان برای شارژ باتری‌ها و استفاده از وسایل بزرگ.'
        };
    }
    if (h >= 14 && h < 17) {
        return {
            text: '☀️ تولید هنوز بالاست. کم کم در حال کاهش.',
            icon: '☀️',
            tip: 'آخرین فرصت برای شارژ باتری قبل از غروب.'
        };
    }
    if (h >= 17 && h < 19) {
        return {
            text: '🌇 غروب نزدیک است. تولید به سرعت کاهش می‌یابد.',
            icon: '🌇',
            tip: 'سیستم به باتری یا شبکه سوئیچ می‌کند. وسایل را آماده کنید.'
        };
    }
    return {
        text: '🌆 عصر است. از انرژی ذخیره شده استفاده می‌شود.',
        icon: '🌆',
        tip: 'مصرف را مدیریت کنید تا باتری‌ها تا صبح دوام بیاورند.'
    };
}

/**
 * دریافت فصل فعلی
 */
export function getCurrentSeason() {
    const m = new Date().getMonth() + 1;
    if (m >= 4 && m <= 6) return 'spring';
    if (m >= 7 && m <= 9) return 'summer';
    if (m >= 10 && m <= 12) return 'autumn';
    return 'winter';
}

/**
 * دریافت نام ماه فارسی
 */
export const PERSIA_MONTHS = [
    'حمل', 'ثور', 'جوزا', 'سرطان', 'اسد', 'سنبله',
    'میزان', 'عقرب', 'قوس', 'جدی', 'دلو', 'حوت'
];

/**
 * دریافت وضعیت آب و هوا (شبیه‌سازی)
 */
export function getWeather() {
    // شبیه‌سازی تصادفی بر اساس ساعت
    const hour = new Date().getHours();
    const seed = (new Date().getDate() + hour) % 10;
    if (seed < 5) return 'sunny';
    if (seed < 7) return 'partly_cloudy';
    if (seed < 9) return 'cloudy';
    return 'sunny';
}

export const WEATHER_LABELS = {
    sunny: 'آفتابی ☀️',
    partly_cloudy: 'نیمه ابری ⛅',
    cloudy: 'ابری ☁️',
    rainy: 'بارانی 🌧',
    snowy: 'برفی ❄️',
    dusty: 'غبارآلود 🌫'
};

export const SEASON_LABELS = {
    spring: 'بهار 🌸',
    summer: 'تابستان ☀️',
    autumn: 'پاییز 🍂',
    winter: 'زمستان ❄️'
};
