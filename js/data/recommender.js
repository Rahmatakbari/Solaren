/**
 * موتور توصیه‌گر هوشمند تجهیزات
 * Smart Equipment Recommender Engine v2.0
 *
 * الگوریتم: امتیازدهی چندبعدی با وزن‌دهی پویا بر اساس نیاز کاربر
 */

import { SOLAR_PANELS } from './panels.js';
import { INVERTERS } from './inverters.js';
import { BATTERIES } from './batteries.js';
import { ACCESSORIES } from './accessories.js';
import { LOCATIONS } from './locations.js';

/**
 * محاسبه توان مورد نیاز از لیست بار
 */
export function calculateRequiredPower(appliances) {
    // appliances: [{ name, qty, watt, hoursPerDay }]
    let totalWh = 0;
    let peakW = 0;
    appliances.forEach((a) => {
        const w = (a.watt || 0) * (a.qty || 1);
        const wh = w * (a.hoursPerDay || 4);
        totalWh += wh;
        if (w > peakW) peakW = w;
    });
    return {
        dailyKWh: totalWh / 1000,
        peakKW: peakW / 1000,
        totalW: peakW
    };
}

/**
 * امتیازدهی پنل‌ها
 */
function scorePanel(panel, ctx) {
    let score = 100;
    const reasons = [];

    // راندمان بالاتر = بهتر
    if (panel.efficiency >= 22) {
        score += 25;
        reasons.push(`✅ راندمان عالی (${panel.efficiency}٪)`);
    } else if (panel.efficiency >= 21) {
        score += 15;
        reasons.push(`✅ راندمان بالا (${panel.efficiency}٪)`);
    } else if (panel.efficiency >= 19) {
        score += 5;
        reasons.push(`✓ راندمان مناسب (${panel.efficiency}٪)`);
    } else {
        score -= 5;
        reasons.push(`⚠️ راندمان پایین (${panel.efficiency}٪)`);
    }

    // گارانتی
    if (panel.warranty >= 25) {
        score += 15;
        reasons.push(`✅ گارانتی ${panel.warranty} سال`);
    } else if (panel.warranty >= 12) {
        score += 8;
    }

    // تکنولوژی
    if (panel.subType && (panel.subType.includes('TOPCon') || panel.subType.includes('HJT') || panel.subType.includes('N-Type'))) {
        score += 10;
        reasons.push('✅ تکنولوژی N-Type/TOPCon');
    } else if (panel.type === 'Mono') {
        score += 5;
    }

    // قیمت - هرچه ارزان‌تر بهتر (اما نه خیلی)
    const pricePerW = panel.price / panel.watt;
    if (pricePerW < 0.32) {
        score += 10;
        reasons.push('✅ قیمت مناسب');
    } else if (pricePerW > 0.45) {
        score -= 10;
        reasons.push('⚠️ قیمت بالا');
    }

    // اگر کاربر بودجه کم دارد
    if (ctx.priority === 'budget' && pricePerW < 0.33) {
        score += 20;
    } else if (ctx.priority === 'quality') {
        if (panel.efficiency >= 21.5) score += 20;
    }

    // اولویت برند
    if (ctx.preferredBrand && panel.brand.toLowerCase().includes(ctx.preferredBrand.toLowerCase())) {
        score += 30;
        reasons.push(`⭐ برند ترجیحی شما`);
    }

    return { score, reasons };
}

/**
 * امتیازدهی اینورترها
 */
function scoreInverter(inv, ctx) {
    let score = 100;
    const reasons = [];

    // تطابق توان
    const requiredW = ctx.requiredPower.totalW * 1.25; // ۲۵٪ حاشیه
    const powerRatio = inv.powerW / requiredW;
    if (powerRatio >= 1.0 && powerRatio <= 1.5) {
        score += 20;
        reasons.push(`✅ توان مناسب (${inv.powerKw} kW)`);
    } else if (powerRatio > 1.5 && powerRatio <= 2.0) {
        score += 5;
        reasons.push(`✓ توان بالاتر از نیاز`);
    } else if (powerRatio < 1.0) {
        score -= 30;
        reasons.push(`⚠️ توان کمتر از نیاز`);
    } else {
        score -= 10;
        reasons.push(`⚠️ توان خیلی بالاتر`);
    }

    // راندمان
    if (inv.eff >= 98) {
        score += 15;
        reasons.push(`✅ راندمان عالی (${inv.eff}٪)`);
    } else if (inv.eff >= 97) {
        score += 8;
    } else {
        score -= 5;
    }

    // نوع سیستم
    if (ctx.systemType === 'hybrid' && inv.type === 'Hybrid') {
        score += 20;
        reasons.push('✅ هیبرید - پشتیبانی باتری');
    } else if (ctx.systemType === 'on-grid' && (inv.type === 'String' || inv.type === 'Hybrid')) {
        score += 10;
    } else if (ctx.systemType === 'off-grid' && inv.type === 'Hybrid') {
        score += 15;
    }

    // MPPT
    if (inv.mppt >= 2) {
        score += 8;
        reasons.push(`✅ ${inv.mppt} ورودی MPPT`);
    }

    // فاز
    if (ctx.phase === '3ph' && inv.phase === '3ph') {
        score += 15;
        reasons.push('✅ سه فاز');
    } else if (ctx.phase === '1ph' && inv.phase === '1ph') {
        score += 5;
    }

    // گارانتی
    if (inv.warranty >= 10) {
        score += 10;
        reasons.push(`✅ گارانتی ${inv.warranty} سال`);
    } else if (inv.warranty >= 5) {
        score += 5;
    }

    // قیمت
    if (ctx.priority === 'budget' && inv.price < inv.powerKw * 100) {
        score += 15;
        reasons.push('✅ اقتصادی');
    } else if (ctx.priority === 'quality' && inv.eff >= 98) {
        score += 15;
    }

    return { score, reasons };
}

/**
 * امتیازدهی باتری‌ها
 */
function scoreBattery(bat, ctx) {
    let score = 100;
    const reasons = [];

    if (ctx.systemType === 'on-grid' && !ctx.needBattery) {
        return { score: 0, reasons: ['سیستم بدون باتری'] };
    }

    // تطابق ظرفیت
    const requiredKWh = ctx.requiredPower.dailyKWh * ctx.backupDays / (bat.dod / 100);
    const kwhRatio = bat.capacityKWh / requiredKWh;
    if (kwhRatio >= 0.8 && kwhRatio <= 1.5) {
        score += 20;
        reasons.push(`✅ ظرفیت مناسب (${bat.capacityKWh} kWh)`);
    } else if (kwhRatio > 1.5 && kwhRatio <= 2.5) {
        score += 10;
    } else if (kwhRatio > 2.5) {
        score -= 5;
        reasons.push('⚠️ ظرفیت بیش از نیاز');
    }

    // نوع باتری - لیتیوم بهتر
    if (bat.type === 'LiFePO4') {
        score += 25;
        reasons.push(`✅ LiFePO4 (${bat.cycles} چرخه)`);
    } else if (bat.type === 'Lead-Acid') {
        score -= 10;
        reasons.push('⚠️ سرب-اسید (عمر کمتر)');
    } else if (bat.type === 'Gel') {
        score += 5;
    }

    // DoD
    if (bat.dod >= 90) {
        score += 10;
        reasons.push(`✅ DoD ${bat.dod}٪`);
    } else if (bat.dod < 60) {
        score -= 10;
    }

    // ولتاژ
    if (bat.voltage === 48) {
        score += 5;
    }

    // چرخه عمر
    if (bat.cycles >= 6000) {
        score += 15;
        reasons.push(`✅ عمر طولانی`);
    } else if (bat.cycles >= 3000) {
        score += 5;
    }

    // قیمت
    const pricePerKwh = bat.price / bat.capacityKWh;
    if (ctx.priority === 'budget' && bat.type === 'Lead-Acid') {
        score += 25;
        reasons.push('✅ ارزان‌ترین گزینه');
    } else if (pricePerKwh < 300) {
        score += 10;
    } else if (pricePerKwh > 600) {
        score -= 5;
    }

    return { score, reasons };
}

/**
 * امتیازدهی کلی و ساخت BOM
 */
export function generateRecommendations(input) {
    // input: { appliances, location, systemType, priority, phase, budget, backupDays, preferredBrand }

    const required = calculateRequiredPower(input.appliances || []);
    const location = LOCATIONS.find(l => l.id === input.location) || LOCATIONS[0];

    const ctx = {
        requiredPower: required,
        systemType: input.systemType || 'hybrid',
        priority: input.priority || 'balanced',
        phase: input.phase || '1ph',
        needBattery: input.systemType !== 'on-grid',
        backupDays: input.backupDays || 1,
        preferredBrand: input.preferredBrand || ''
    };

    // محاسبه تعداد پنل
    const systemLoss = 0.77; // تلفات استاندارد
    const targetPVkW = required.dailyKWh / (location.psh * systemLoss) * 1.2; // ۲۰٪ حاشیه
    const panelCount = Math.ceil((targetPVkW * 1000) / 555); // پنل مرجع ۵۵۵W

    // === امتیازدهی پنل‌ها ===
    const panelScores = SOLAR_PANELS.map(p => ({
        item: p,
        ...scorePanel(p, ctx),
        type: 'panel'
    })).sort((a, b) => b.score - a.score);

    // === امتیازدهی اینورترها ===
    const invScores = INVERTERS.map(i => ({
        item: i,
        ...scoreInverter(i, { ...ctx, requiredPower: required }),
        type: 'inverter'
    })).filter(x => x.score > 50).sort((a, b) => b.score - a.score);

    // محاسبه حداقل توان اینورتر مورد نیاز
    const minInvKw = Math.max(
        Math.ceil(required.totalW * 1.25 / 1000),  // ۲۵٪ حاشیه روی پیک بار
        Math.ceil(targetPVkW * 0.8)                  // حداقل برای پنل‌ها
    );
    const finalInverter = invScores.find(i => i.item.powerKw >= minInvKw) || invScores[invScores.length - 1];

    // === امتیازدهی باتری‌ها ===
    const batScores = BATTERIES.map(b => ({
        item: b,
        ...scoreBattery(b, ctx),
        type: 'battery'
    })).filter(x => x.score > 30).sort((a, b) => b.score - a.score);

    // === ساخت سه سناریو ===
    const scenarios = [];

    // اقتصادی
    const economic = buildScenario({
        name: 'اقتصادی',
        icon: '💰',
        description: 'کمترین هزینه با حفظ کیفیت قابل قبول',
        panels: panelScores.filter(p => p.item.price / p.item.watt < 0.35)[0] || panelScores[0],
        inverter: invScores.filter(i => i.item.powerKw >= minInvKw).slice(-1)[0] || finalInverter,
        battery: batScores.find(b => b.item.type === 'Lead-Acid') || batScores.find(b => b.item.type === 'LiFePO4') || batScores[0],
        ctx, required, location, panelCount
    });
    if (economic) scenarios.push(economic);

    // استاندارد
    const standard = buildScenario({
        name: 'استاندارد',
        icon: '⭐',
        description: 'بهترین تعادل بین قیمت و کیفیت',
        panels: panelScores[0],
        inverter: finalInverter,
        battery: batScores.find(b => b.item.type === 'LiFePO4') || batScores[0],
        ctx, required, location, panelCount
    });
    if (standard) scenarios.push(standard);

    // حرفه‌ای
    const premium = buildScenario({
        name: 'حرفه‌ای',
        icon: '💎',
        description: 'بهترین کیفیت و بیشترین گارانتی',
        panels: panelScores.find(p => p.item.efficiency >= 21.5 && p.item.warranty >= 25) || panelScores[0],
        inverter: invScores.filter(i => i.item.powerKw >= minInvKw && i.item.eff >= 98).slice(-1)[0] || finalInverter,
        battery: batScores.find(b => b.item.cycles >= 6000 && b.item.dod >= 90) || batScores[0],
        ctx, required, location, panelCount
    });
    if (premium) scenarios.push(premium);

    return {
        required,
        location,
        panelCount,
        scenarios,
        bestOverall: standard,
        allPanels: panelScores.slice(0, 5),
        allInverters: invScores.slice(0, 5),
        allBatteries: batScores.slice(0, 5)
    };
}

function buildScenario({ name, icon, description, panels, inverter, battery, ctx, required, location, panelCount }) {
    if (!panels || !inverter) return null;

    // تعداد واقعی پنل بر اساس انتخاب
    const actualPanelCount = panelCount;
    const pvTotalKW = (panels.item.watt * actualPanelCount) / 1000;

    // تعداد باتری
    let batteryCount = 0;
    let totalBatteryKWh = 0;
    if (ctx.needBattery && battery) {
        const targetKWh = required.dailyKWh * ctx.backupDays / (battery.item.dod / 100);
        batteryCount = Math.max(1, Math.ceil(targetKWh / battery.item.capacityKWh));
        totalBatteryKWh = batteryCount * battery.item.capacityKWh;
    }

    // هزینه‌ها
    const panelCost = panels.item.price * actualPanelCount;
    const inverterCost = inverter.item.price;
    const batteryCost = battery ? battery.item.price * batteryCount : 0;

    // تجهیزات جانبی
    const cableLength = actualPanelCount * 6 + 30; // متر
    const accessories = [
        { item: ACCESSORIES.find(a => a.id === 'acc-cable-dc-6'), qty: cableLength },
        { item: ACCESSORIES.find(a => a.id === 'acc-cable-ac-4'), qty: 25 },
        { item: ACCESSORIES.find(a => a.id === 'acc-mc4'), qty: actualPanelCount * 2 },
        { item: ACCESSORIES.find(a => a.id === 'acc-dc-breaker-32'), qty: 2 },
        { item: ACCESSORIES.find(a => a.id === 'acc-ac-breaker-40'), qty: 1 },
        { item: ACCESSORIES.find(a => a.id === 'acc-fuse-15'), qty: 1 },
        { item: ACCESSORIES.find(a => a.id === 'acc-lightning'), qty: 1 },
        { item: ACCESSORIES.find(a => a.id === 'acc-ground'), qty: 1 },
        { item: ACCESSORIES.find(a => a.id === 'acc-rail'), qty: Math.ceil(actualPanelCount * 1.2) },
        { item: ACCESSORIES.find(a => a.id === 'acc-mid-clamp'), qty: actualPanelCount - 1 },
        { item: ACCESSORIES.find(a => a.id === 'acc-end-clamp'), qty: 4 },
        { item: ACCESSORIES.find(a => a.id === 'acc-l-foot'), qty: Math.ceil(actualPanelCount / 2) * 2 },
        { item: ACCESSORIES.find(a => a.id === 'acc-monitor'), qty: 1 },
        { item: ACCESSORIES.find(a => a.id === 'acc-cabinet'), qty: 1 }
    ].filter(a => a.item);

    const accCost = accessories.reduce((s, a) => s + (a.item.price * a.qty), 0);
    const installationCost = (panelCost + inverterCost + batteryCost) * 0.15;

    const totalCost = panelCost + inverterCost + batteryCost + accCost + installationCost;

    // تحلیل عملکرد
    const expectedDailyKWh = pvTotalKW * location.psh * systemLoss;
    const expectedMonthlyKWh = expectedDailyKWh * 30;
    const expectedYearlyKWh = expectedDailyKWh * 365;

    // بازگشت سرمایه
    const electricityPrice = 0.15; // $/kWh
    const yearlySaving = expectedYearlyKWh * electricityPrice;
    const paybackYears = totalCost / yearlySaving;
    const lifetimeSavings = yearlySaving * 25 - totalCost;

    return {
        name,
        icon,
        description,
        panel: panels.item,
        panelReasons: panels.reasons,
        panelScore: panels.score,
        panelCount: actualPanelCount,
        pvTotalKW,
        inverter: inverter.item,
        inverterReasons: inverter.reasons,
        inverterScore: inverter.score,
        battery: battery ? battery.item : null,
        batteryReasons: battery ? battery.reasons : [],
        batteryScore: battery ? battery.score : 0,
        batteryCount,
        totalBatteryKWh,
        accessories,
        costs: {
            panels: panelCost,
            inverter: inverterCost,
            battery: batteryCost,
            accessories: Math.round(accCost),
            installation: Math.round(installationCost),
            total: Math.round(totalCost)
        },
        performance: {
            expectedDailyKWh: Math.round(expectedDailyKWh * 10) / 10,
            expectedMonthlyKWh: Math.round(expectedMonthlyKWh),
            expectedYearlyKWh: Math.round(expectedYearlyKWh),
            paybackYears: Math.round(paybackYears * 10) / 10,
            lifetimeSavings: Math.round(lifetimeSavings),
            yearlySaving: Math.round(yearlySaving)
        }
    };
}

const systemLoss = 0.77;

/**
 * لیست پیش‌فرض وسایل خانگی
 */
export const DEFAULT_APPLIANCES = [
    { name: 'لامپ LED', qty: 8, watt: 12, hoursPerDay: 6 },
    { name: 'یخچال', qty: 1, watt: 200, hoursPerDay: 24 },
    { name: 'تلویزیون', qty: 1, watt: 100, hoursPerDay: 5 },
    { name: 'پنکه', qty: 3, watt: 75, hoursPerDay: 8 },
    { name: 'کولر گازی', qty: 1, watt: 1500, hoursPerDay: 8 }
];

/**
 * پیش‌تنظیم‌های آماده برای استفاده سریع
 */
export const APPLIANCE_PRESETS = {
    'house-small': [
        { name: 'لامپ LED', qty: 5, watt: 10, hoursPerDay: 6 },
        { name: 'یخچال کوچک', qty: 1, watt: 150, hoursPerDay: 24 },
        { name: 'تلویزیون', qty: 1, watt: 80, hoursPerDay: 5 },
        { name: 'پنکه', qty: 2, watt: 50, hoursPerDay: 6 }
    ],
    'house-medium': [
        { name: 'لامپ LED', qty: 10, watt: 12, hoursPerDay: 6 },
        { name: 'یخچال', qty: 1, watt: 200, hoursPerDay: 24 },
        { name: 'تلویزیون', qty: 1, watt: 100, hoursPerDay: 5 },
        { name: 'پنکه', qty: 3, watt: 75, hoursPerDay: 8 },
        { name: 'ماشین لباسشویی', qty: 1, watt: 500, hoursPerDay: 1 },
        { name: 'کولر آبی', qty: 1, watt: 200, hoursPerDay: 10 }
    ],
    'villa': [
        { name: 'لامپ LED', qty: 20, watt: 15, hoursPerDay: 6 },
        { name: 'یخچال', qty: 1, watt: 250, hoursPerDay: 24 },
        { name: 'فریزر', qty: 1, watt: 200, hoursPerDay: 24 },
        { name: 'تلویزیون', qty: 2, watt: 120, hoursPerDay: 5 },
        { name: 'ماشین لباسشویی', qty: 1, watt: 500, hoursPerDay: 2 },
        { name: 'ماشین ظرفشویی', qty: 1, watt: 1200, hoursPerDay: 1 },
        { name: 'کولر گازی', qty: 3, watt: 1800, hoursPerDay: 8 },
        { name: 'پمپ آب', qty: 1, watt: 750, hoursPerDay: 2 },
        { name: 'اجاق برقی', qty: 1, watt: 2000, hoursPerDay: 2 }
    ],
    'shop': [
        { name: 'روشنایی', qty: 10, watt: 40, hoursPerDay: 12 },
        { name: 'یخچال ویترینی', qty: 1, watt: 400, hoursPerDay: 24 },
        { name: 'کولر گازی', qty: 2, watt: 1500, hoursPerDay: 10 },
        { name: 'صندوق', qty: 1, watt: 50, hoursPerDay: 12 }
    ],
    'office': [
        { name: 'روشنایی', qty: 8, watt: 40, hoursPerDay: 10 },
        { name: 'کامپیوتر', qty: 4, watt: 200, hoursPerDay: 8 },
        { name: 'چاپگر', qty: 1, watt: 300, hoursPerDay: 2 },
        { name: 'کولر گازی', qty: 1, watt: 1500, hoursPerDay: 10 },
        { name: 'یخچال کوچک', qty: 1, watt: 100, hoursPerDay: 24 }
    ]
};
