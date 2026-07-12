/**
 * پارامترها و برنامه‌های تنظیم اینورترها
 * Inverter Programming Parameters Database v2.0
 *
 * هر اینورتر برنامه‌های جداگانه برای On-Grid، Off-Grid و Hybrid دارد
 * سیستم بر اساس نوع و توان، برنامه مناسب را انتخاب می‌کند
 */

const P_GRID = {
    'P1_Grid_Settings': {
        name: 'تنظیمات شبکه برق',
        description: 'پارامترهای اتصال به شبکه برق شهری',
        icon: '⚡',
        settings: [
            { code: '01', name: 'ولتاژ نامی شبکه', value: 230, unit: 'V', range: '180-260V', critical: true, tip: 'برای ایران/افغانستان ۲۳۰ ولت تک‌فاز' },
            { code: '02', name: 'فرکانس نامی', value: 50, unit: 'Hz', range: '45-65Hz', critical: true, tip: 'ایران ۵۰ هرتز' },
            { code: '03', name: 'ولتاژ حد بالا', value: 253, unit: 'V', range: '230-280V', critical: true, tip: 'قطع ایمنی در ولتاژ بالا' },
            { code: '04', name: 'ولتاژ حد پایین', value: 207, unit: 'V', range: '180-230V', critical: true, tip: 'قطع ایمنی در ولتاژ پایین' },
            { code: '05', name: 'فرکانس حد بالا', value: 51.5, unit: 'Hz', range: '50-55Hz', critical: true },
            { code: '06', name: 'فرکانس حد پایین', value: 47.5, unit: 'Hz', range: '45-50Hz', critical: true },
            { code: '07', name: 'زمان تأخیر اتصال مجدد', value: 60, unit: 's', range: '30-600s', critical: false },
            { code: '08', name: 'زمان قطع در خطا', value: 5, unit: 's', range: '0-60s', critical: false },
            { code: '09', name: 'ولتاژ راه‌اندازی', value: 200, unit: 'V', range: '180-230V', critical: true },
            { code: '10', name: 'ضریب توان (Power Factor)', value: 1.0, unit: '', range: '0.8-1.0', critical: true, tip: 'برای جلوگیری از جریمه برق' }
        ]
    },
    'P2_PV_Settings': {
        name: 'تنظیمات ورودی PV',
        description: 'پارامترهای پنل‌های خورشیدی',
        icon: '☀️',
        settings: [
            { code: '01', name: 'ولتاژ حداکثر PV', value: 500, unit: 'V', range: '100-600V', critical: true },
            { code: '02', name: 'ولتاژ راه‌اندازی MPPT', value: 80, unit: 'V', range: '50-150V', critical: true },
            { code: '03', name: 'جریان حداکثر ورودی هر MPPT', value: 13, unit: 'A', range: '10-20A', critical: true },
            { code: '04', name: 'تعداد MPPT', value: 2, unit: '', range: '1-4', critical: true },
            { code: '05', name: 'حداکثر توان هر MPPT', value: 3500, unit: 'W', range: '1000-5000W', critical: true },
            { code: '06', name: 'MPPT1 محدوده ولتاژ', value: '80-500V', unit: '', range: 'MPPT Range', critical: false },
            { code: '07', name: 'MPPT2 محدوده ولتاژ', value: '80-500V', unit: '', range: 'MPPT Range', critical: false },
            { code: '08', name: 'حداکثر توان PV قابل اتصال', value: 4500, unit: 'W', range: '1000-8000W', critical: true, tip: 'معمولاً ۱.۵ برابر توان اینورتر' }
        ]
    }
};

const P_BATTERY = {
    'P3_Battery_Settings': {
        name: 'تنظیمات باتری',
        description: 'پارامترهای باتری (سیستم‌های هیبرید و آفگرید)',
        icon: '🔋',
        settings: [
            { code: '01', name: 'نوع باتری', value: 'لیتیوم (LiFePO4)', unit: '', range: 'لیتیوم/سرب-اسید/ژل', critical: true },
            { code: '02', name: 'ولتاژ نامی باتری', value: 48, unit: 'V', range: '24/48/96/192V', critical: true },
            { code: '03', name: 'ظرفیت باتری', value: 100, unit: 'Ah', range: '50-1000Ah', critical: true },
            { code: '04', name: 'حداکثر جریان شارژ', value: 60, unit: 'A', range: '10-200A', critical: true },
            { code: '05', name: 'حداکثر جریان دشارژ', value: 60, unit: 'A', range: '10-200A', critical: true },
            { code: '06', name: 'ولتاژ شارژ کامل', value: 54.0, unit: 'V', range: '48-58V', critical: true },
            { code: '07', name: 'ولتاژ قطع دشارژ', value: 42.0, unit: 'V', range: '40-48V', critical: true },
            { code: '08', name: 'عمق دشارژ (DoD)', value: 80, unit: '%', range: '20-100%', critical: true, tip: 'برای افزایش عمر باتری ۸۰٪ توصیه می‌شود' },
            { code: '09', name: 'دمای قطع شارژ', value: 55, unit: '°C', range: '40-65°C', critical: false },
            { code: '10', name: 'جبران دمایی', value: 'فعال', unit: '', range: 'On/Off', critical: false }
        ]
    }
};

const P_OPERATION = {
    'P4_Grid_Operation': {
        name: 'عملکرد شبکه',
        description: 'تنظیمات تزریق و مصرف',
        icon: '🔌',
        settings: [
            { code: '01', name: 'حالت تزریق به شبکه', value: 'فعال', unit: '', range: 'On/Off', critical: true },
            { code: '02', name: 'حداکثر توان تزریق', value: 3000, unit: 'W', range: '0-10000W', critical: true, tip: 'طبق قرارداد با اداره برق' },
            { code: '03', name: 'اولویت منبع', value: 'PV > باتری > شبکه', unit: '', range: 'ترکیبی', critical: true, tip: 'اولویت مصرف از کدام منبع' },
            { code: '04', name: 'Power Factor قابل تنظیم', value: 1.0, unit: '', range: '0.8-1.0', critical: false },
            { code: '05', name: 'Q(V) - کنترل توان راکتیو', value: 'غیرفعال', unit: '', range: 'On/Off', critical: false },
            { code: '06', name: 'Anti-islanding', value: 'فعال', unit: '', range: 'On/Off', critical: true, tip: 'محافظت در برابر جزیره‌ای شدن' }
        ]
    },
    'P5_Protection': {
        name: 'محافظت‌ها',
        description: 'تنظیمات حفاظتی',
        icon: '🛡️',
        settings: [
            { code: '01', name: 'محافظت ولتاژ پایین', value: 'فعال', unit: '', range: 'On/Off', critical: true },
            { code: '02', name: 'محافظت ولتاژ بالا', value: 'فعال', unit: '', range: 'On/Off', critical: true },
            { code: '03', name: 'محافظت فرکانس پایین', value: 'فعال', unit: '', range: 'On/Off', critical: true },
            { code: '04', name: 'محافظت فرکانس بالا', value: 'فعال', unit: '', range: 'On/Off', critical: true },
            { code: '05', name: 'محافظت اضافه‌بار', value: 'فعال', unit: '', range: 'On/Off', critical: true },
            { code: '06', name: 'محافظت دمایی', value: 'فعال', unit: '', range: 'On/Off', critical: true },
            { code: '07', name: 'محافظت اتصال معکوس', value: 'فعال', unit: '', range: 'On/Off', critical: true },
            { code: '08', name: 'محافظت زمین (Ground Fault)', value: 'فعال', unit: '', range: 'On/Off', critical: true },
            { code: '09', name: 'محافظت DC Injection', value: 'فعال', unit: '', range: 'On/Off', critical: false },
            { code: '10', name: 'DC Switch', value: 'فعال', unit: '', range: 'On/Off', critical: false }
        ]
    },
    'P6_Communication': {
        name: 'ارتباطات',
        description: 'تنظیمات مانیتورینگ و ارتباطی',
        icon: '📡',
        settings: [
            { code: '01', name: 'WiFi', value: 'فعال', unit: '', range: 'On/Off', critical: false },
            { code: '02', name: 'RS485', value: 'فعال', unit: '', range: 'On/Off', critical: false },
            { code: '03', name: 'GPRS/4G', value: 'غیرفعال', unit: '', range: 'On/Off', critical: false },
            { code: '04', name: 'Bluetooth', value: 'فعال', unit: '', range: 'On/Off', critical: false },
            { code: '05', name: 'آدرس Modbus', value: 1, unit: '', range: '1-247', critical: false },
            { code: '06', name: 'Baud Rate', value: 9600, unit: 'bps', range: '4800-115200', critical: false },
            { code: '07', name: 'پروتکل', value: 'Modbus RTU', unit: '', range: 'Modbus/Sunspec', critical: false }
        ]
    }
};

const P_HYBRID_EXTRA = {
    'P7_Hybrid_Mode': {
        name: 'حالت هیبرید',
        description: 'تنظیمات پیشرفته هیبرید',
        icon: '🔄',
        settings: [
            { code: '01', name: 'اولویت منبع', value: 'PV > باتری > شبکه', unit: '', range: 'حالت‌های مختلف', critical: true },
            { code: '02', name: 'شارژ از شبکه مجاز', value: 'غیرفعال', unit: '', range: 'On/Off', critical: true, tip: 'آیا باتری از شبکه شارژ شود؟' },
            { code: '03', name: 'زمان شروع شارژ شبکه', value: '00:00', unit: '', range: '00:00-23:59', critical: false },
            { code: '04', name: 'زمان پایان شارژ شبکه', value: '06:00', unit: '', range: '00:00-23:59', critical: false },
            { code: '05', name: 'حداکثر توان شارژ از شبکه', value: 2000, unit: 'W', range: '0-5000W', critical: false },
            { code: '06', name: 'حالت UPS', value: 'فعال', unit: '', range: 'On/Off', critical: true, tip: 'سوئیچ خودکار در قطع برق' },
            { code: '07', name: 'زمان سوئیچ UPS', value: 10, unit: 'ms', range: '5-50ms', critical: true, tip: 'هر چه کمتر بهتر' },
            { code: '08', name: 'ژنراتور پشتیبان', value: 'غیرفعال', unit: '', range: 'On/Off', critical: false },
            { code: '09', name: 'حداکثر توان ژنراتور', value: 5000, unit: 'W', range: '1000-10000W', critical: false },
            { code: '10', name: 'عملکرد در شب', value: 'فقط باتری', unit: '', range: 'حالت‌ها', critical: false }
        ]
    }
};

const P_OFFGRID_EXTRA = {
    'P7_OffGrid_Mode': {
        name: 'حالت آفگرید',
        description: 'تنظیمات مستقل از شبکه',
        icon: '🏔️',
        settings: [
            { code: '01', name: 'منبع تغذیه', value: 'فقط PV + باتری', unit: '', range: 'ترکیبی', critical: true },
            { code: '02', name: 'ولتاژ خروجی', value: 230, unit: 'V', range: '220-240V', critical: true },
            { code: '03', name: 'فرکانس خروجی', value: 50, unit: 'Hz', range: '50/60Hz', critical: true },
            { code: '04', name: 'حالت موج', value: 'سینوسی خالص', unit: '', range: 'Sine/Square', critical: true },
            { code: '05', name: 'توان پیوسته', value: 3000, unit: 'W', range: '500-10000W', critical: true },
            { code: '06', name: 'توان لحظه‌ای (Peak)', value: 6000, unit: 'W', range: '1.5x-3x', critical: true, tip: 'برای راه‌اندازی موتورها' },
            { code: '07', name: 'ژنراتور پشتیبان', value: 'فعال', unit: '', range: 'On/Off', critical: true },
            { code: '08', name: 'حد آستانه روشن شدن ژنراتور', value: 30, unit: '%', range: '10-50%', critical: false, tip: 'وقتی SOC کمتر از این مقدار شد' },
            { code: '09', name: 'حد آستانه خاموش شدن ژنراتور', value: 90, unit: '%', range: '80-100%', critical: false },
            { code: '10', name: 'تأخیر راه‌اندازی', value: 30, unit: 's', range: '5-300s', critical: false }
        ]
    }
};

const P_ONGRID_EXTRA = {
    'P7_OnGrid_Mode': {
        name: 'حالت آنگرید',
        description: 'تنظیمات متصل به شبکه',
        icon: '🔌',
        settings: [
            { code: '01', name: 'حالت کارکرد', value: 'تزریق به شبکه', unit: '', range: 'On-Grid', critical: true },
            { code: '02', name: 'تزریق صفر (Zero Export)', value: 'غیرفعال', unit: '', range: 'On/Off', critical: true, tip: 'اگر فعال شود تزریق به شبکه قطع می‌شود' },
            { code: '03', name: 'سنسور CT', value: 'نصب شده', unit: '', range: 'نصب/عدم نصب', critical: true, tip: 'برای کنترل تزریق صفر' },
            { code: '04', name: 'محدودیت تزریق', value: 100, unit: '%', range: '0-100%', critical: true },
            { code: '05', name: 'حداکثر نسبت DC/AC', value: 1.5, unit: '', range: '1.0-2.0', critical: false, tip: 'نسبت توان DC به AC' },
            { code: '06', name: 'MPPT چندگانه', value: 'فعال', unit: '', range: 'On/Off', critical: false },
            { code: '07', name: 'تابع ولتاژ-توان (Volt-Watt)', value: 'فعال', unit: '', range: 'On/Off', critical: false },
            { code: '08', name: 'تابع فرکانس-توان (Freq-Watt)', value: 'فعال', unit: '', range: 'On/Off', critical: false },
            { code: '09', name: 'ساعت کارکرد', value: '24/7', unit: '', range: 'بازه زمانی', critical: false },
            { code: '10', name: 'تأخیر خاموشی شب', value: 0, unit: 'min', range: '0-60min', critical: false }
        ]
    }
};

const P3PHASE = {
    'P1_Grid_3Phase': {
        name: 'تنظیمات شبکه ۳ فاز',
        description: 'پارامترهای شبکه سه‌فاز',
        icon: '⚡',
        settings: [
            { code: '01', name: 'ولتاژ نامی (فاز به فاز)', value: 400, unit: 'V', range: '380-440V', critical: true },
            { code: '02', name: 'ولتاژ نامی (فاز به نول)', value: 230, unit: 'V', range: '220-240V', critical: true },
            { code: '03', name: 'فرکانس نامی', value: 50, unit: 'Hz', range: '45-65Hz', critical: true },
            { code: '04', name: 'ولتاژ حد بالا', value: 440, unit: 'V', range: '400-480V', critical: true },
            { code: '05', name: 'ولتاژ حد پایین', value: 360, unit: 'V', range: '340-400V', critical: true },
            { code: '06', name: 'عدم تقارن ولتاژ', value: 5, unit: '%', range: '1-10%', critical: false },
            { code: '07', name: 'فرکانس حد بالا', value: 51.5, unit: 'Hz', range: '50-55Hz', critical: true },
            { code: '08', name: 'فرکانس حد پایین', value: 47.5, unit: 'Hz', range: '45-50Hz', critical: true },
            { code: '09', name: 'زمان تأخیر اتصال', value: 60, unit: 's', range: '30-600s', critical: false },
            { code: '10', name: 'Power Factor', value: 1.0, unit: '', range: '0.8-1.0', critical: true }
        ]
    }
};

/**
 * ساخت برنامه سفارشی بر اساس پارامترها
 */
function buildProgram({ brand, model, type, powerKw, loadW, voltage, is3Phase, hasBattery, withGen }) {
    const prog = {
        brand,
        model,
        type: type === 'on-grid' ? 'On-Grid' : type === 'off-grid' ? 'Off-Grid' : 'Hybrid',
        powerKw,
        loadW,
        programs: {}
    };

    // P1: تنظیمات شبکه
    if (is3Phase) {
        prog.programs['P1_Grid'] = JSON.parse(JSON.stringify(P3PHASE['P1_Grid_3Phase']));
    } else {
        prog.programs['P1_Grid'] = JSON.parse(JSON.stringify(P_GRID['P1_Grid_Settings']));
    }

    // P2: تنظیمات PV
    prog.programs['P2_PV'] = JSON.parse(JSON.stringify(P_GRID['P2_PV_Settings']));
    // تنظیم توان PV
    if (prog.programs['P2_PV'].settings) {
        const pvMax = prog.programs['P2_PV'].settings.find(s => s.name.includes('حداکثر توان PV'));
        if (pvMax) pvMax.value = Math.ceil(powerKw * 1.5 * 1000);
        const vMax = prog.programs['P2_PV'].settings.find(s => s.name.includes('ولتاژ حداکثر'));
        if (vMax && is3Phase) vMax.value = 1000;
    }

    // P3: تنظیمات باتری
    if (hasBattery) {
        prog.programs['P3_Battery'] = JSON.parse(JSON.stringify(P_BATTERY['P3_Battery_Settings']));
        // تنظیم بر اساس توان
        if (prog.programs['P3_Battery'] && prog.programs['P3_Battery'].settings) {
            const maxCharge = prog.programs['P3_Battery'].settings.find(s => s.name.includes('حداکثر جریان شارژ'));
            if (maxCharge) maxCharge.value = Math.ceil(powerKw * 1000 / 48 * 1.2);
            const maxDischarge = prog.programs['P3_Battery'].settings.find(s => s.name.includes('حداکثر جریان دشارژ'));
            if (maxDischarge) maxDischarge.value = Math.ceil(powerKw * 1000 / 48 * 1.2);
            const capacity = prog.programs['P3_Battery'].settings.find(s => s.name.includes('ظرفیت باتری'));
            if (capacity) {
                // برای ۴ ساعت بکاپ
                const backupKwh = (loadW / 1000) * 4 / 0.8;
                capacity.value = Math.ceil(backupKwh * 1000 / 48);
            }
        }
    }

    // P4: عملکرد شبکه
    prog.programs['P4_Operation'] = JSON.parse(JSON.stringify(P_OPERATION['P4_Grid_Operation']));
    if (prog.programs['P4_Operation'] && prog.programs['P4_Operation'].settings) {
        const maxFeed = prog.programs['P4_Operation'].settings.find(s => s.name.includes('حداکثر توان تزریق'));
        if (maxFeed) maxFeed.value = Math.ceil(powerKw * 1000);
    }

    // P5: محافظت‌ها
    prog.programs['P5_Protection'] = JSON.parse(JSON.stringify(P_OPERATION['P5_Protection']));

    // P6: ارتباطات
    prog.programs['P6_Comm'] = JSON.parse(JSON.stringify(P_OPERATION['P6_Communication']));

    // P7: حالت خاص
    if (type === 'hybrid') {
        prog.programs['P7_Hybrid'] = JSON.parse(JSON.stringify(P_HYBRID_EXTRA['P7_Hybrid_Mode']));
        if (prog.programs['P7_Hybrid'] && prog.programs['P7_Hybrid'].settings) {
            const genPower = prog.programs['P7_Hybrid'].settings.find(s => s.name.includes('حداکثر توان ژنراتور'));
            if (genPower) genPower.value = withGen ? Math.ceil(powerKw * 1.2 * 1000) : 0;
        }
    } else if (type === 'off-grid') {
        prog.programs['P7_OffGrid'] = JSON.parse(JSON.stringify(P_OFFGRID_EXTRA['P7_OffGrid_Mode']));
        if (prog.programs['P7_OffGrid'] && prog.programs['P7_OffGrid'].settings) {
            const contPower = prog.programs['P7_OffGrid'].settings.find(s => s.name.includes('توان پیوسته'));
            if (contPower) contPower.value = Math.ceil(powerKw * 1000);
            const peakPower = prog.programs['P7_OffGrid'].settings.find(s => s.name.includes('توان لحظه‌ای'));
            if (peakPower) peakPower.value = Math.ceil(powerKw * 1000 * 2);
        }
    } else {
        prog.programs['P7_OnGrid'] = JSON.parse(JSON.stringify(P_ONGRID_EXTRA['P7_OnGrid_Mode']));
    }

    return prog;
}

export const INVERTER_PROGRAMS = {
    // === Growatt 3kW - Hybrid (پیش‌فرض) ===
    'inv-growatt-3000': buildProgram({
        brand: 'Growatt', model: 'MIN 3000TL-XH', type: 'hybrid',
        powerKw: 3, loadW: 2000, voltage: 230, is3Phase: false, hasBattery: true
    }),

    'inv-growatt-5000': buildProgram({
        brand: 'Growatt', model: 'MIN 5000TL-XH', type: 'hybrid',
        powerKw: 5, loadW: 3500, voltage: 230, is3Phase: false, hasBattery: true
    }),

    'inv-growatt-10000': buildProgram({
        brand: 'Growatt', model: 'MOD 10000TL3-XH', type: 'hybrid',
        powerKw: 10, loadW: 7000, voltage: 400, is3Phase: true, hasBattery: true
    }),

    'inv-deye-5000': buildProgram({
        brand: 'Deye', model: 'SUN-5K-SG04LP3', type: 'hybrid',
        powerKw: 5, loadW: 3500, voltage: 230, is3Phase: false, hasBattery: true
    }),

    'inv-srne-3000': buildProgram({
        brand: 'SRNE', model: 'HESP 3K-LV', type: 'hybrid',
        powerKw: 3, loadW: 2000, voltage: 230, is3Phase: false, hasBattery: true
    }),

    'inv-sungrow-10000': buildProgram({
        brand: 'Sungrow', model: 'SH10RT', type: 'hybrid',
        powerKw: 10, loadW: 7000, voltage: 400, is3Phase: true, hasBattery: true
    }),

    'inv-huawei-10000': buildProgram({
        brand: 'Huawei', model: 'SUN2000-10KTL-M1', type: 'hybrid',
        powerKw: 10, loadW: 7000, voltage: 400, is3Phase: true, hasBattery: true
    }),

    '_default_3kW': buildProgram({
        brand: 'Generic', model: '3kW Hybrid', type: 'hybrid',
        powerKw: 3, loadW: 2000, voltage: 230, is3Phase: false, hasBattery: true
    })
};

/**
 * پیشنهاد برنامه اینورتر بر اساس توان، نوع سیستم و بار
 */
export function recommendInverterProgram(powerKw, type = 'hybrid', loadW = 2000, withGen = false) {
    // تشخیص سه‌فاز یا تک‌فاز
    const is3Phase = powerKw >= 8;
    const hasBattery = type === 'hybrid' || type === 'off-grid';

    // انتخاب نزدیک‌ترین اینورتر
    let templateKey = '_default_3kW';
    if (powerKw <= 3.5) templateKey = 'inv-growatt-3000';
    else if (powerKw <= 6) templateKey = 'inv-growatt-5000';
    else if (powerKw <= 8) templateKey = 'inv-deye-5000';
    else if (powerKw <= 12) templateKey = 'inv-growatt-10000';
    else if (powerKw <= 20) templateKey = 'inv-sungrow-10000';
    else templateKey = 'inv-huawei-10000';

    const base = INVERTER_PROGRAMS[templateKey] || INVERTER_PROGRAMS['_default_3kW'];

    // بازسازی برنامه بر اساس پارامترهای درخواستی
    return buildProgram({
        brand: base.brand,
        model: base.model,
        type,
        powerKw,
        loadW,
        voltage: is3Phase ? 400 : 230,
        is3Phase,
        hasBattery,
        withGen
    });
}

/**
 * دریافت لیست کلیدهای برنامه‌ها
 */
export function getProgramKeys() {
    return Object.keys(INVERTER_PROGRAMS).filter(k => k !== '_default_3kW');
}
