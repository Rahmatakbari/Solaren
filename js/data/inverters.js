/**
 * Inverter Database — String, Hybrid, Micro-inverters
 */
export const INVERTERS = [
    { id: 'inv-growatt-3000', brand: 'Growatt', model: 'MIN 3000TL-XH', type: 'Hybrid', phase: '1ph',
      powerW: 3000, powerKw: 3, mppt: 2, maxPvV: 500, maxPvW: 6000, batV: 48, eff: 97.5, warranty: 5, price: 380,
      features: ['Hybrid', 'WiFi', 'MPPT', 'مجهز به مانیتورینگ'] },
    { id: 'inv-growatt-5000', brand: 'Growatt', model: 'MOD 5000TL3-XH', type: 'Hybrid', phase: '3ph',
      powerW: 5000, powerKw: 5, mppt: 2, maxPvV: 1100, maxPvW: 7500, batV: 0, eff: 98.2, warranty: 5, price: 650,
      features: ['Hybrid', 'سه فاز', 'WiFi'] },
    { id: 'inv-growatt-10000', brand: 'Growatt', model: 'MOD 10KTL3-XH', type: 'Hybrid', phase: '3ph',
      powerW: 10000, powerKw: 10, mppt: 2, maxPvV: 1100, maxPvW: 15000, batV: 0, eff: 98.4, warranty: 5, price: 1100,
      features: ['Hybrid', 'سه فاز', 'WiFi', 'پشتیبانی باتری'] },
    { id: 'inv-deye-5000', brand: 'Deye', model: 'SUN-5K-SG04LP1-EU', type: 'Hybrid', phase: '1ph',
      powerW: 5000, powerKw: 5, mppt: 2, maxPvV: 500, maxPvW: 6500, batV: 48, eff: 97.6, warranty: 5, price: 620,
      features: ['Hybrid', 'پشتیبانی لیتیوم', 'WiFi', 'سه فاز خروجی'] },
    { id: 'inv-deye-10000', brand: 'Deye', model: 'SUN-10K-SG04LP3-EU', type: 'Hybrid', phase: '3ph',
      powerW: 10000, powerKw: 10, mppt: 2, maxPvV: 800, maxPvW: 13000, batV: 48, eff: 97.6, warranty: 5, price: 1180,
      features: ['Hybrid', 'سه فاز', 'لیتیوم', 'پارالل تا ۱۶ دستگاه'] },
    { id: 'inv-srne-3000', brand: 'SRNE', model: 'HESP 3K-LV', type: 'Hybrid', phase: '1ph',
      powerW: 3000, powerKw: 3, mppt: 2, maxPvV: 450, maxPvW: 4000, batV: 24, eff: 96.5, warranty: 3, price: 320,
      features: ['Hybrid', 'MPPT', 'WiFi', 'قیمت مناسب'] },
    { id: 'inv-srne-5000', brand: 'SRNE', model: 'HESP 5K-HV', type: 'Hybrid', phase: '1ph',
      powerW: 5000, powerKw: 5, mppt: 2, maxPvV: 500, maxPvW: 6500, batV: 48, eff: 97.0, warranty: 3, price: 480,
      features: ['Hybrid', 'ولتاژ بالا', 'WiFi'] },
    { id: 'inv-victron-3000', brand: 'Victron', model: 'MultiPlus-II 48/3000', type: 'Hybrid', phase: '1ph',
      powerW: 3000, powerKw: 3, mppt: 0, maxPvV: 0, maxPvW: 0, batV: 48, eff: 95.0, warranty: 5, price: 1450,
      features: ['Hybrid', 'سینوسی خالص', 'PowerAssist', 'صنعتی'] },
    { id: 'inv-sungrow-10000', brand: 'Sungrow', model: 'SH10.0RT', type: 'String', phase: '3ph',
      powerW: 10000, powerKw: 10, mppt: 2, maxPvV: 1100, maxPvW: 15000, batV: 0, eff: 98.4, warranty: 10, price: 1100,
      features: ['سه فاز', 'اینترنت', 'کارایی بالا'] },
    { id: 'inv-sungrow-20000', brand: 'Sungrow', model: 'SH20.0RT', type: 'String', phase: '3ph',
      powerW: 20000, powerKw: 20, mppt: 2, maxPvV: 1100, maxPvW: 30000, batV: 0, eff: 98.5, warranty: 10, price: 2100,
      features: ['سه فاز', 'صنعتی', 'اینترنت'] },
    { id: 'inv-fronius-8000', brand: 'Fronius', model: 'Symo 8.2-3-M', type: 'String', phase: '3ph',
      powerW: 8200, powerKw: 8.2, mppt: 2, maxPvV: 1000, maxPvW: 12300, batV: 0, eff: 98.0, warranty: 7, price: 1850,
      features: ['سه فاز', 'SnapINverter', 'اترنت'] },
    { id: 'inv-sma-10000', brand: 'SMA', model: 'Sunny Tripower 10.0', type: 'String', phase: '3ph',
      powerW: 10000, powerKw: 10, mppt: 2, maxPvV: 1000, maxPvW: 15000, batV: 0, eff: 98.0, warranty: 5, price: 1750,
      features: ['سه فاز', 'آلمانی', 'OptiTrac'] },
    { id: 'inv-huawei-10000', brand: 'Huawei', model: 'SUN2000-10KTL-M1', type: 'String', phase: '3ph',
      powerW: 10000, powerKw: 10, mppt: 2, maxPvV: 1100, maxPvW: 15000, batV: 0, eff: 98.6, warranty: 10, price: 1450,
      features: ['سه فاز', 'هوشمند', 'WiFi'] },
    { id: 'inv-mppt-micro', brand: 'Enphase', model: 'IQ7PLUS-72', type: 'Micro', phase: '1ph',
      powerW: 290, powerKw: 0.29, mppt: 1, maxPvV: 60, maxPvW: 350, batV: 0, eff: 97.5, warranty: 25, price: 145,
      features: ['میکرو', 'پنل به پنل', 'WiFi', '۲۵ سال گارانتی'] }
];

export function findInverter(id) { return INVERTERS.find((i) => i.id === id) || INVERTERS[0]; }

export function recommendInverter(loadW, type = 'auto') {
    const target = loadW * 1.25;
    let candidates = INVERTERS;
    if (type !== 'auto') candidates = candidates.filter((i) => i.type.toLowerCase() === type.toLowerCase());
    if (!candidates.length) candidates = INVERTERS;
    const sorted = [...candidates].sort((a, b) => a.powerW - b.powerW);
    return sorted.find((i) => i.powerW >= target) || sorted[sorted.length - 1];
}
