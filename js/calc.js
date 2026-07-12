/**
 * Solar Calculation Engine v3 — Industry-Standard Algorithms
 * Formulas based on NREL, IEC, and Sandia National Labs research.
 */

import { Utils } from './utils.js';
import { findPanel, SOLAR_PANELS } from './data/panels.js';
import { findInverter, recommendInverter } from './data/inverters.js';
import { findBattery, recommendBattery } from './data/batteries.js';
import { ACCESSORIES } from './data/accessories.js';

/**
 * System loss/derate factors with descriptions.
 * Source: NREL PVWatts defaults
 */
export const LOSS_FACTORS = {
    soiling:        { value: 0.97, label: 'گرد و غبار و آلودگی',            impact: 'بستگی به منطقه' },
    shading:        { value: 0.97, label: 'سایه‌بانی',                      impact: 'بستگی به محل نصب' },
    snow:           { value: 0.98, label: 'برف (فصلی)',                   impact: 'فقط زمستان' },
    mismatch:       { value: 0.98, label: 'عدم تطابق ماژول‌ها',            impact: 'تفاوت در پنل‌ها' },
    wiring:         { value: 0.98, label: 'سیم‌کشی DC و AC',              impact: 'افت ولتاژ' },
    connections:    { value: 0.99, label: 'اتصالات',                       impact: 'مقاومت کانکتور' },
    lid:            { value: 0.985, label: 'تضعیف القایی نوری (LID)',     impact: 'سال اول' },
    nameplate:      { value: 0.98, label: 'تلورانس نام‌پلیت',             impact: '±۳٪' },
    age:            { value: 0.95, label: 'افت سال اول',                  impact: 'سال اول' },
    availability:   { value: 0.98, label: 'دسترس‌پذیری سیستم',           impact: 'خرابی و نگهداری' },
    temperature:    { value: 0.96, label: 'تلفات دمایی',                  impact: 'وابسته به اقلیم' },
    inverter:       { value: 0.97, label: 'راندمان اینورتر',              impact: 'تبدیل DC→AC' }
};

export const SYSTEM_DERATE = Object.values(LOSS_FACTORS).reduce((a, f) => a * f.value, 1);

/**
 * Calculate tilt angle optimization for a given latitude.
 * Best practice: tilt ≈ latitude for max annual yield
 * For summer: tilt = latitude - 15°
 * For winter: tilt = latitude + 15°
 */
export function calcOptimalTilt(latitude, season = 'annual') {
    if (season === 'summer') return Math.max(0, Math.round(latitude - 15));
    if (season === 'winter') return Math.min(90, Math.round(latitude + 15));
    return Math.round(latitude);
}

/**
 * Azimuth for maximum yield (true south in northern hemisphere, true north in southern)
 */
export function calcOptimalAzimuth(latitude) {
    return latitude >= 0 ? 180 : 0; // degrees
}

/**
 * Temperature-adjusted panel output.
 * Most panels have NOCT around 45°C and STC 25°C
 * Power loss: ~0.4% per °C above 25°C
 */
export function calcTemperatureDerate(ambientTempC, irradiance = 1000, noct = 45) {
    const cellTemp = ambientTempC + (noct - 20) * (irradiance / 800);
    const tempCoeff = -0.004; // %/°C typical
    return 1 + tempCoeff * (cellTemp - 25);
}

/**
 * Adjusted Peak Sun Hours based on tilt and azimuth deviation.
 */
export function calcAdjustedPSH(peakSunHours, tiltDeg, optimalTilt, azimuthDev = 0) {
    const tiltFactor = 1 - 0.002 * Math.abs(tiltDeg - optimalTilt);
    const azimuthFactor = Math.cos(azimuthDev * Math.PI / 180);
    return peakSunHours * tiltFactor * azimuthFactor;
}

/**
 * Calculate required PV array capacity.
 */
export function calcPVSize(dailyKWh, peakSunHours, derate = SYSTEM_DERATE) {
    if (peakSunHours <= 0) return 0;
    return dailyKWh / (peakSunHours * derate);
}

/**
 * Daily energy production (kWh)
 */
export function calcDailyProduction(pvKw, peakSunHours, derate = SYSTEM_DERATE) {
    return pvKw * peakSunHours * derate;
}

/**
 * Annual production
 */
export function calcAnnualProduction(pvKw, peakSunHours, derate = SYSTEM_DERATE) {
    return calcDailyProduction(pvKw, peakSunHours, derate) * 365;
}

/**
 * Number of panels required
 */
export function calcPanelCount(pvKw, panelWatt = 550) {
    return Math.ceil((pvKw * 1000) / panelWatt);
}

/**
 * Battery capacity for backup (kWh)
 */
export function calcBatterySize(dailyKWh, backupHours, dod = 0.9, inverterEff = 0.95) {
    return (dailyKWh * backupHours) / (dod * inverterEff);
}

/**
 * Solar cable size (mm²) by voltage drop formula.
 * A = (2 × ρ × I × L) / (V × drop_pct)
 */
export function calcCableSize(current, length, systemV, maxDropPct = 3, rho = 0.0172) {
    const allowedDrop = (systemV * maxDropPct) / 100;
    const area = (2 * current * length * rho) / allowedDrop;
    const standards = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
    return standards.find((s) => s >= area) || standards[standards.length - 1];
}

/**
 * Calculate voltage drop on existing cable.
 */
export function calcVoltageDrop(current, length, systemV, cableArea, rho = 0.0172) {
    const drop = (2 * current * length * rho) / cableArea;
    return { volts: drop, percent: (drop / systemV) * 100 };
}

/**
 * Charge controller sizing
 */
export function calcChargeController(pvKw, batV, type = 'MPPT') {
    const pvCurrent = (pvKw * 1000) / batV;
    const safetyFactor = 1.25;
    return {
        type,
        minCurrent: pvCurrent * safetyFactor,
        recCurrent: Math.ceil(pvCurrent * safetyFactor / 10) * 10,
        minVoltage: type === 'MPPT' ? Math.ceil(batV * 1.3) : batV
    };
}

/**
 * Inverter sizing
 */
export function calcInverterSize(peakLoadW, systemV = 48) {
    return {
        continuousW: Math.ceil((peakLoadW * 1.25) / 100) * 100,
        surgeW: Math.ceil((peakLoadW * 3) / 100) * 100,
        voltage: systemV
    };
}

/**
 * Calculate string sizing for panels in series.
 * Returns max panels per string based on inverter max PV voltage and panel Voc.
 */
export function calcStringSize(inverter, panel) {
    const tempMin = -10; // coldest expected cell temp
    const tempCoeff = -0.003; // %/°C for Voc
    const vocCold = panel.voc * (1 + tempCoeff * (tempMin - 25));
    const maxSeries = Math.floor(inverter.maxPvV / vocCold);
    return {
        maxSeries: Math.max(1, maxSeries),
        vocAtMin: vocCold,
        minPanels: Math.max(1, Math.ceil(inverter.mpptV_min / panel.vmp || 1))
    };
}

/**
 * ROI calculation
 */
export function calcROI({ cost, yearlyProduction, electricityPrice, lifetime = 25, inflation = 0.03, degradation = 0.005 }) {
    const savings = [];
    let totalSavings = 0;
    for (let year = 1; year <= lifetime; year++) {
        const production = yearlyProduction * Math.pow(1 - degradation, year - 1);
        const price = electricityPrice * Math.pow(1 + inflation, year - 1);
        const annualSaving = production * price;
        savings.push({ year, production, price, saving: annualSaving });
        totalSavings += annualSaving;
    }
    const netProfit = totalSavings - cost;
    const payback = cost / (yearlyProduction * electricityPrice);
    const roi = (netProfit / cost) * 100;
    const lcoe = cost / (yearlyProduction * lifetime);
    return { savings, totalSavings, netProfit, payback, roi, lcoe, lifetime };
}

/**
 * Series/parallel panel configuration
 */
export function calcPanelConfig(numPanels, inverter, panel) {
    const stringSize = calcStringSize(inverter, panel);
    const seriesCount = Math.min(numPanels, stringSize.maxSeries);
    const parallelCount = Math.ceil(numPanels / seriesCount);
    const totalPanels = seriesCount * parallelCount;
    const stringV = seriesCount * panel.vmp;
    const stringVoc = seriesCount * panel.voc;
    const arrayCurrent = parallelCount * panel.imp;
    return { seriesCount, parallelCount, totalPanels, stringV, stringVoc, arrayCurrent };
}

/**
 * Full system sizing — main calculator
 */
export function fullSystemSizing({ appliances, peakSunHours, systemType, backupHours = 4, panelWatt = 550, tiltDeg = null, ambientTempC = 25 }) {
    const totalWh = appliances.reduce((s, a) => s + (a.watt * (a.qty || 1) * a.hours), 0);
    const dailyKWh = totalWh / 1000;
    const peakLoadW = appliances.reduce((s, a) => s + (a.watt * (a.qty || 1)), 0);

    // Apply temperature derate
    const tempDerate = calcTemperatureDerate(ambientTempC);
    const effectiveDerate = SYSTEM_DERATE * tempDerate;

    // PV sizing
    const requiredPvKw = calcPVSize(dailyKWh, peakSunHours, effectiveDerate);
    const numPanels = calcPanelCount(requiredPvKw, panelWatt);
    const actualPvKw = (numPanels * panelWatt) / 1000;
    const annualKWh = calcAnnualProduction(actualPvKw, peakSunHours, effectiveDerate);

    // Inverter
    const inverter = recommendInverter(peakLoadW, systemType === 'hybrid' ? 'Hybrid' : 'auto');
    const inverterSizing = calcInverterSize(peakLoadW, inverter.batV || 48);

    // Battery
    let batteryKWh = 0;
    let battery = null;
    let numBatteries = 0;
    if (systemType !== 'on-grid') {
        const dod = 0.9;
        batteryKWh = calcBatterySize(dailyKWh, backupHours, dod);
        battery = recommendBattery(batteryKWh);
        numBatteries = Math.ceil(batteryKWh / battery.capacityKWh);
    }

    // Panel config
    const panel = findPanel(panelIdFromWatt(panelWatt));
    const panelConfig = calcPanelConfig(numPanels, inverter, panel);

    // Cost estimation
    const panelCost = numPanels * 195;
    const inverterCost = inverter.price;
    const batteryCost = battery ? numBatteries * battery.price : 0;
    const bosCost = (panelCost + inverterCost + batteryCost) * 0.20;
    const installationCost = actualPvKw * 120;
    const permitCost = actualPvKw * 15;
    const totalCost = panelCost + inverterCost + batteryCost + bosCost + installationCost + permitCost;

    // ROI projection
    const roi = calcROI({ cost: totalCost, yearlyProduction: annualKWh, electricityPrice: 0.10, lifetime: 25 });

    return {
        totalWh,
        dailyKWh,
        peakLoadW,
        requiredPvKw,
        actualPvKw,
        numPanels,
        panelWatt,
        annualKWh,
        inverter,
        inverterSizing,
        battery,
        numBatteries,
        batteryKWh,
        panelCost,
        inverterCost,
        batteryCost,
        bosCost,
        installationCost,
        permitCost,
        totalCost,
        systemDerate: effectiveDerate,
        panelConfig,
        roi,
        panel
    };
}

function panelIdFromWatt(watt) {
    if (watt >= 550) return 'p-jinko-550';
    if (watt >= 440) return 'p-trina-440';
    if (watt >= 410) return 'p-canadian-410';
    return 'p-risen-200';
}

/**
 * Format sizing result with Persian display strings
 */
export function formatSizingResult(r) {
    return {
        ...r,
        formatted: {
            dailyKWh: Utils.formatNumber(r.dailyKWh, 2),
            annualKWh: Utils.formatNumber(r.annualKWh, 0),
            requiredPvKw: Utils.formatNumber(r.requiredPvKw, 2),
            actualPvKw: Utils.formatNumber(r.actualPvKw, 2),
            numPanels: Utils.toPersian(r.numPanels),
            peakLoadW: Utils.formatNumber(r.peakLoadW, 0),
            batteryKWh: Utils.formatNumber(r.batteryKWh || 0, 2),
            numBatteries: Utils.toPersian(r.numBatteries || 0),
            totalCost: Utils.formatNumber(Math.round(r.totalCost)),
            panelCost: Utils.formatNumber(Math.round(r.panelCost)),
            inverterCost: Utils.formatNumber(Math.round(r.inverterCost)),
            batteryCost: Utils.formatNumber(Math.round(r.batteryCost)),
            bosCost: Utils.formatNumber(Math.round(r.bosCost)),
            installationCost: Utils.formatNumber(Math.round(r.installationCost)),
            permitCost: Utils.formatNumber(Math.round(r.permitCost)),
            payback: Utils.formatNumber(r.roi.payback, 1),
            netProfit: Utils.formatNumber(Math.round(r.roi.netProfit)),
            roi: Utils.formatNumber(r.roi.roi, 0)
        }
    };
}

/**
 * Build complete Bill of Materials
 */
export function buildBOM(sizing) {
    const items = [];
    if (sizing.numPanels > 0) {
        items.push({
            category: 'panels', icon: 'sun',
            name: `پنل ${sizing.panel.brand} ${sizing.panel.watt}W ${sizing.panel.type}`,
            qty: sizing.numPanels, unitPrice: sizing.panel.price, total: sizing.numPanels * sizing.panel.price
        });
    }
    if (sizing.inverter) {
        items.push({
            category: 'inverter', icon: 'sky',
            name: `انورتر ${sizing.inverter.brand} ${sizing.inverter.model}`,
            qty: 1, unitPrice: sizing.inverter.price, total: sizing.inverter.price
        });
    }
    if (sizing.numBatteries > 0 && sizing.battery) {
        items.push({
            category: 'battery', icon: 'emerald',
            name: `باتری ${sizing.battery.brand} ${sizing.battery.model}`,
            qty: sizing.numBatteries, unitPrice: sizing.battery.price, total: sizing.numBatteries * sizing.battery.price
        });
    }
    const cableLength = Math.ceil(sizing.numPanels * 0.5 + 20);
    const accItems = [
        { name: 'کابل DC 6mm² سولار', qty: cableLength, unitPrice: 2.5, cat: 'cable' },
        { name: 'کابل AC 4mm²', qty: 20, unitPrice: 1.8, cat: 'cable' },
        { name: 'کانکتور MC4 (جفت)', qty: Math.ceil(sizing.numPanels / 8) + 2, unitPrice: 3.5, cat: 'connector' },
        { name: 'بریکر DC 32A 1000V', qty: 2, unitPrice: 28, cat: 'breaker' },
        { name: 'بریکر AC 40A', qty: 1, unitPrice: 18, cat: 'breaker' },
        { name: 'محافظ برق (SPD)', qty: 1, unitPrice: 65, cat: 'protection' },
        { name: 'سیستم ارتینگ', qty: 1, unitPrice: 120, cat: 'protection' },
        { name: 'ریل آلومینیومی', qty: Math.ceil(sizing.numPanels * 0.4), unitPrice: 8, cat: 'mounting' },
        { name: 'گیره میانی پنل', qty: sizing.numPanels + 2, unitPrice: 1.5, cat: 'mounting' },
        { name: 'گیره انتهایی پنل', qty: 4, unitPrice: 2, cat: 'mounting' },
        { name: 'تابلو برق DC/AC', qty: 1, unitPrice: 180, cat: 'enclosure' },
        { name: 'نصب و راه‌اندازی', qty: 1, unitPrice: Math.round(sizing.actualPvKw * 120), cat: 'labor' }
    ];
    accItems.forEach((a) => {
        items.push({ category: a.cat, icon: 'violet', name: a.name, qty: a.qty, unitPrice: a.unitPrice, total: a.qty * a.unitPrice });
    });
    return items;
}

export const SolarCalc = {
    calcPVSize, calcDailyProduction, calcAnnualProduction, calcPanelCount, calcBatterySize,
    calcCableSize, calcVoltageDrop, calcChargeController, calcInverterSize, calcStringSize,
    calcOptimalTilt, calcOptimalAzimuth, calcTemperatureDerate, calcAdjustedPSH, calcPanelConfig,
    fullSystemSizing, formatSizingResult, buildBOM, calcROI, SYSTEM_DERATE, LOSS_FACTORS
};
