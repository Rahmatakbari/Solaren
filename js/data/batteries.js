/**
 * Battery Database — Lithium & Lead-Acid for solar systems.
 */
export const BATTERIES = [
    { id: 'b-pylontech-3.5', brand: 'Pylontech', model: 'US3000C', type: 'LiFePO4', voltage: 48,
      capacityAh: 74, capacityKWh: 3.55, dod: 90, cycles: 6000, warranty: 10, price: 1250,
      features: ['لیتیوم فسفات', 'ماژولار', 'BMS داخلی'] },
    { id: 'b-pylontech-4.8', brand: 'Pylontech', model: 'US5000', type: 'LiFePO4', voltage: 48,
      capacityAh: 100, capacityKWh: 4.8, dod: 90, cycles: 6000, warranty: 10, price: 1650,
      features: ['لیتیوم فسفات', 'ماژولار', 'BMS داخلی'] },
    { id: 'b-deye-5.1', brand: 'Deye', model: 'GB-L 5.1', type: 'LiFePO4', voltage: 51.2,
      capacityAh: 100, capacityKWh: 5.12, dod: 90, cycles: 6000, warranty: 10, price: 1450,
      features: ['لیتیوم فسفات', 'ماژولار', 'CAN/RS485'] },
    { id: 'b-deye-10.2', brand: 'Deye', model: 'GB-L 10.2', type: 'LiFePO4', voltage: 51.2,
      capacityAh: 200, capacityKWh: 10.24, dod: 90, cycles: 6000, warranty: 10, price: 2700,
      features: ['لیتیوم فسفات', 'ماژولار', 'ظرفیت بالا'] },
    { id: 'b-lifepo4-100', brand: 'EPEVER', model: 'LFP-48100', type: 'LiFePO4', voltage: 48,
      capacityAh: 100, capacityKWh: 4.8, dod: 90, cycles: 5000, warranty: 5, price: 1180,
      features: ['لیتیوم فسفات', 'اقتصادی', 'BMS'] },
    { id: 'b-tubular-150', brand: 'Sukam', model: 'TT 150Ah', type: 'Lead-Acid', voltage: 12,
      capacityAh: 150, capacityKWh: 1.8, dod: 50, cycles: 1500, warranty: 3, price: 145,
      features: ['اسید سرب', 'توبولار', 'قیمت پایین'] },
    { id: 'b-gel-200', brand: 'Victron', model: 'Gel 220Ah', type: 'Gel', voltage: 12,
      capacityAh: 220, capacityKWh: 2.64, dod: 60, cycles: 1800, warranty: 5, price: 380,
      features: ['ژل', 'نگهداری آسان', 'طول عمر بالا'] }
];

export function findBattery(id) { return BATTERIES.find((b) => b.id === id) || BATTERIES[0]; }

export function recommendBattery(requiredKWh, systemVoltage = 48) {
    const candidates = BATTERIES.filter((b) => b.voltage === systemVoltage || b.voltage === 12);
    if (!candidates.length) return BATTERIES[0];
    const sorted = [...candidates].sort((a, b) => a.capacityKWh - b.capacityKWh);
    return sorted.find((b) => b.capacityKWh >= requiredKWh) || sorted[sorted.length - 1];
}
