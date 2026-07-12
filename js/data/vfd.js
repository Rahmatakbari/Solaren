/**
 * VFD (Variable Frequency Drive) Database — Motor speed control.
 */
export const VFDS = [
    { id: 'vfd-schneider-1500', brand: 'Schneider Electric', model: 'ATV310 HU15N4', powerW: 1500, powerHp: 2,
      voltage: 400, phases: '3ph', current: 4.1, type: 'Vector', warranty: 2, price: 240,
      features: ['Vector', 'PID', 'Modbus'] },
    { id: 'vfd-schneider-2200', brand: 'Schneider Electric', model: 'ATV310 HU22N4', powerW: 2200, powerHp: 3,
      voltage: 400, phases: '3ph', current: 5.8, type: 'Vector', warranty: 2, price: 310,
      features: ['Vector', 'PID', 'Modbus'] },
    { id: 'vfd-abb-1500', brand: 'ABB', model: 'ACS150-03E-04A1-4', powerW: 1500, powerHp: 2,
      voltage: 400, phases: '3ph', current: 4.1, type: 'V/F', warranty: 2, price: 285,
      features: ['V/F', 'PID', 'فلش‌اپ‌گرید'] },
    { id: 'vfd-abb-4000', brand: 'ABB', model: 'ACS150-03E-08A0-4', powerW: 4000, powerHp: 5.5,
      voltage: 400, phases: '3ph', current: 8.0, type: 'V/F', warranty: 2, price: 420,
      features: ['V/F', 'PID', 'بریک'] },
    { id: 'vfd-delta-2200', brand: 'Delta', model: 'VFD022E21A', powerW: 2200, powerHp: 3,
      voltage: 230, phases: '1ph', current: 11.0, type: 'Sensorless', warranty: 2, price: 235,
      features: ['تکفاز ورودی', 'سه فاز خروجی', 'Sensorless'] },
    { id: 'vfd-delta-3700', brand: 'Delta', model: 'VFD037E21A', powerW: 3700, powerHp: 5,
      voltage: 230, phases: '1ph', current: 17.0, type: 'Sensorless', warranty: 2, price: 320,
      features: ['تکفاز', 'Sensorless', 'PLC داخلی'] },
    { id: 'vfd-invt-5500', brand: 'INVT', model: 'GD20-055G-4', powerW: 5500, powerHp: 7.5,
      voltage: 400, phases: '3ph', current: 13.0, type: 'Vector', warranty: 2, price: 380,
      features: ['Vector', 'RS485', 'PID'] },
    { id: 'vfd-fuji-7500', brand: 'Fuji Electric', model: 'FRN7.5G1S-4J', powerW: 7500, powerHp: 10,
      voltage: 400, phases: '3ph', current: 17.0, type: 'Vector', warranty: 2, price: 580,
      features: ['Vector', 'IP20', 'ارتباطات'] },
    { id: 'vfd-siemens-11000', brand: 'Siemens', model: 'SINAMICS V20 11kW', powerW: 11000, powerHp: 15,
      voltage: 400, phases: '3ph', current: 25.0, type: 'V/F', warranty: 2, price: 850,
      features: ['V/F', 'Modbus', 'نمایشگر'] },
    { id: 'vfd-yaskawa-15000', brand: 'Yaskawa', model: 'A1000 15kW', powerW: 15000, powerHp: 20,
      voltage: 400, phases: '3ph', current: 32.0, type: 'Vector', warranty: 2, price: 1450,
      features: ['Vector', 'صنعتی', 'Encoder'] }
];

export function findVFD(id) { return VFDS.find((v) => v.id === id) || VFDS[0]; }

export function recommendVFD(motorW, phases = 'auto') {
    const target = motorW * 1.1;
    let candidates = VFDS;
    if (phases === '1ph' || phases === '3ph') candidates = candidates.filter((v) => v.phases === phases);
    if (!candidates.length) candidates = VFDS;
    const sorted = [...candidates].sort((a, b) => a.powerW - b.powerW);
    return sorted.find((v) => v.powerW >= target) || sorted[sorted.length - 1];
}
