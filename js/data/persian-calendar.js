/**
 * تقویم شمسی (جلالی) - بدون وابستگی خارجی
 * Persian/Jalali Calendar Utilities
 *
 * الگوریتم تبدیل بر اساس فرمول کسر ۲۹/۳۳
 */

const PERSIAN_MONTHS = [
    'حمل', 'ثور', 'جوزا', 'سرطان', 'اسد', 'سنبله',
    'میزان', 'عقرب', 'قوس', 'جدی', 'دلو', 'حوت'
];

const PERSIAN_MONTHS_EN = [
    'Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar',
    'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'
];

const PERSIAN_DAYS = [
    'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'
];

const PERSIAN_DAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/**
 * تبدیل میلادی به شمسی
 */
export function gregorianToJalali(gy, gm, gd) {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    const gy2 = gm > 2 ? gy + 1 : gy;
    let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) -
               Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) +
               gd + g_d_m[gm - 1];
    let jy = -1595 + (33 * Math.floor(days / 12053));
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
        jy += Math.floor((days - 1) / 365);
        days = (days - 1) % 365;
    }
    const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
    const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
    return [jy, jm, jd];
}

/**
 * تبدیل شمسی به میلادی
 */
export function jalaliToGregorian(jy, jm, jd) {
    const gy = jy <= 979 ? 621 : 1600;
    const jy2 = jy + 609;
    let days = 365 * jy + Math.floor(jy2 / 33) * 8 +
               Math.floor(((jy2 % 33) + 3) / 4) + 78 + jd +
               (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
    const gy2 = days / 36524;
    gy2;
    const gd = days - (365 * gy + Math.floor(gy / 4) - Math.floor(gy / 100) + Math.floor(gy / 400));
    return [gy, gm, gd];
}

function gm(gd) {
    // helper for above
    return 0;
}

/**
 * تعداد روزهای ماه شمسی
 */
export function getJalaliMonthDays(year, month) {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    // اسفند: ۲۹ یا ۳۰
    return isJalaliLeap(year) ? 30 : 29;
}

/**
 * سال شمسی کبیسه
 */
export function isJalaliLeap(year) {
    const breaks = [1, 5, 9, 13, 17, 22, 26, 30];
    const mod = year % 33;
    return breaks.includes(mod);
}

/**
 * تاریخ شمسی امروز
 */
export function todayJalali() {
    const now = new Date();
    return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/**
 * روز هفته شمسی برای یک تاریخ
 */
export function getJalaliDayOfWeek(jy, jm, jd) {
    // محاسبه تعداد روز از مبدأ
    let days = 0;
    for (let y = 1; y < jy; y++) {
        days += isJalaliLeap(y) ? 366 : 365;
    }
    for (let m = 1; m < jm; m++) {
        days += getJalaliMonthDays(jy, m);
    }
    days += jd - 1;
    // ۱ فروردین ۱ شمسی = ۲۲ مارس ۶۲۲ میلادی (شنبه)
    return (days + 0) % 7; // ۰ = شنبه
}

/**
 * فرمت تاریخ شمسی
 */
export function formatJalaliDate(jy, jm, jd, format = 'long') {
    const month = PERSIAN_MONTHS[jm - 1];
    const monthEn = PERSIAN_MONTHS_EN[jm - 1];
    const year = toPersianNum(jy);
    const day = toPersianNum(jd);

    if (format === 'long') return `${day} ${month} ${year}`;
    if (format === 'short') return `${year}/${toPersianNum(jm)}/${day}`;
    if (format === 'numeric') return `${year}/${toPersianNum(jm, 2)}/${toPersianNum(jd, 2)}`;
    if (format === 'month-year') return `${month} ${year}`;
    if (format === 'month-en') return `${monthEn} ${jy}`;
    return `${day} ${month} ${year}`;
}

/**
 * تبدیل عدد به اعداد فارسی
 */
export function toPersianNum(num, pad = 0) {
    let str = String(num);
    if (pad > 0) str = str.padStart(pad, '0');
    return str.replace(/\d/g, d => PERSIAN_DIGITS[+d]);
}

/**
 * نام روز هفته
 */
export function getDayName(jy, jm, jd) {
    return PERSIAN_DAYS[getJalaliDayOfWeek(jy, jm, jd)];
}

/**
 * محاسبه تاریخ شمسی برای یک تاریخ میلادی
 */
export function dateToJalali(date) {
    return gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

/**
 * محاسبه تاریخ میلادی از شمسی
 */
export function jalaliToDate(jy, jm, jd) {
    // استفاده از الگوریتم دقیق‌تر
    const gregorian = jalaliToGregorianCalc(jy, jm, jd);
    return new Date(gregorian[0], gregorian[1] - 1, gregorian[2]);
}

function jalaliToGregorianCalc(jy, jm, jd) {
    let gy = jy + 621;
    let gDayMarchEquinox = jy > 0 ? (jy + 38) % 4 === 0 ? 21 : 20 : 20;
    let marchDay = 0;

    // محاسبه تعداد روزها از ابتدای سال شمسی
    let daysFromFarvardin = 0;
    for (let m = 1; m < jm; m++) {
        daysFromFarvardin += getJalaliMonthDays(jy, m);
    }
    daysFromFarvardin += jd - 1;

    // تعداد روز از فروردین تا ۲۱ مارس همان سال شمسی
    // تقریب: اول فروردین ≈ ۲۱ مارس
    const totalDays = daysFromFarvardin + (gDayMarchEquinox - 1);

    // شروع از ۲۱ مارس سال میلادی معادل
    let gm = 3, gd = gDayMarchEquinox;
    while (totalDays > 0) {
        const daysInMonth = new Date(gy, gm, 0).getDate();
        if (totalDays >= daysInMonth - gd + 1) {
            totalDays -= (daysInMonth - gd + 1);
            gm++;
            if (gm > 12) { gm = 1; gy++; }
            gd = 1;
        } else {
            gd += totalDays;
            totalDays = 0;
        }
    }
    return [gy, gm, gd];
}

/**
 * مقایسه دو تاریخ شمسی
 */
export function compareJalali(a, b) {
    if (a[0] !== b[0]) return a[0] - b[0];
    if (a[1] !== b[1]) return a[1] - b[1];
    return a[2] - b[2];
}

/**
 * اضافه کردن روز به تاریخ شمسی
 */
export function addJalaliDays(jy, jm, jd, days) {
    let [y, m, d] = [jy, jm, jd];
    d += days;
    while (d > getJalaliMonthDays(y, m)) {
        d -= getJalaliMonthDays(y, m);
        m++;
        if (m > 12) { m = 1; y++; }
    }
    while (d < 1) {
        m--;
        if (m < 1) { m = 12; y--; }
        d += getJalaliMonthDays(y, m);
    }
    return [y, m, d];
}

/**
 * تفاوت دو تاریخ شمسی به روز
 */
export function diffJalaliDays(a, b) {
    const daysA = jalaliToDays(a[0], a[1], a[2]);
    const daysB = jalaliToDays(b[0], b[1], b[2]);
    return daysA - daysB;
}

function jalaliToDays(jy, jm, jd) {
    let days = 0;
    for (let y = 1; y < jy; y++) {
        days += isJalaliLeap(y) ? 366 : 365;
    }
    for (let m = 1; m < jm; m++) {
        days += getJalaliMonthDays(jy, m);
    }
    return days + jd;
}

/**
 * آیا تعطیل رسمی است
 */
export function isJalaliHoliday(jy, jm, jd) {
    // تعطیلات رسمی ایران + مناسبت‌ها
    const holidays = {
        '1-1': 'نوروز', '1-2': 'نوروز', '1-3': 'نوروز', '1-4': 'نوروز',
        '1-12': 'روز جمهوری اسلامی',
        '1-13': 'روز طبیعت',
        '3-14': 'رحلت امام خمینی',
        '3-15': 'قیام ۱۵ خرداد',
        '11-22': 'پیروزی انقلاب',
        '12-29': 'ملی شدن نفت'
    };
    const key = `${jm}-${jd}`;
    return holidays[key] || null;
}

/**
 * لیست ماه‌های شمسی
 */
export function getPersianMonths() { return PERSIAN_MONTHS; }
export function getPersianDays() { return PERSIAN_DAYS; }
export function getPersianDaysShort() { return PERSIAN_DAYS_SHORT; }

export default {
    gregorianToJalali,
    jalaliToGregorian: jalaliToGregorianCalc,
    getJalaliMonthDays,
    isJalaliLeap,
    todayJalali,
    getJalaliDayOfWeek,
    formatJalaliDate,
    toPersianNum,
    getDayName,
    dateToJalali,
    jalaliToDate,
    compareJalali,
    addJalaliDays,
    diffJalaliDays,
    isJalaliHoliday,
    getPersianMonths,
    getPersianDays,
    getPersianDaysShort
};
