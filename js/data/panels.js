/**
 * Solar Panel Database
 * Common models with full electrical & physical specifications.
 * Prices are indicative — user can adjust in settings.
 */
export const SOLAR_PANELS = [
    {
        id: 'p-jinko-550',
        brand: 'Jinko Solar', model: 'Tiger Neo JKM550N-7RL3',
        type: 'Mono', subType: 'N-Type TOPCon',
        watt: 550, vmp: 41.8, imp: 13.16, voc: 49.9, isc: 13.99,
        efficiency: 21.3, weight: 28, size: '2274x1134x35', cells: 144,
        warranty: 25, price: 195, made: 'China'
    },
    {
        id: 'p-longi-555',
        brand: 'Longi', model: 'Hi-MO 5m LR5-72HBD-555M',
        type: 'Mono', subType: 'PERC',
        watt: 555, vmp: 49.95, imp: 11.11, voc: 41.85, isc: 11.92,
        efficiency: 21.5, weight: 27.5, size: '2278x1134x35', cells: 144,
        warranty: 25, price: 205, made: 'China'
    },
    {
        id: 'p-ja-460',
        brand: 'JA Solar', model: 'DeepBlue 3.0 JAM72S30-460/MR',
        type: 'Mono', subType: 'PERC',
        watt: 460, vmp: 41.7, imp: 11.04, voc: 49.9, isc: 11.65,
        efficiency: 20.7, weight: 24.5, size: '2115x1052x35', cells: 144,
        warranty: 25, price: 165, made: 'China'
    },
    {
        id: 'p-canadian-410',
        brand: 'Canadian Solar', model: 'HiKu6 CS6R-410MS',
        type: 'Mono', subType: 'PERC',
        watt: 410, vmp: 31.0, imp: 13.23, voc: 37.2, isc: 13.95,
        efficiency: 20.8, weight: 21.5, size: '1722x1134x30', cells: 108,
        warranty: 25, price: 145, made: 'Canada'
    },
    {
        id: 'p-trina-440',
        brand: 'Trina Solar', model: 'Vertex S+ TSM-NEG9RC.27-440',
        type: 'Mono', subType: 'N-Type i-TOPCon',
        watt: 440, vmp: 34.7, imp: 12.69, voc: 41.4, isc: 13.45,
        efficiency: 22.0, weight: 21.8, size: '1762x1134x30', cells: 108,
        warranty: 25, price: 165, made: 'China'
    },
    {
        id: 'p-risen-200',
        brand: 'Risen', model: 'RSM200-8-M',
        type: 'Mono', subType: 'PERC',
        watt: 200, vmp: 18.8, imp: 10.64, voc: 22.8, isc: 11.16,
        efficiency: 19.2, weight: 11, size: '1500x680x30', cells: 72,
        warranty: 25, price: 75, made: 'China'
    },
    {
        id: 'p-sunpower-400',
        brand: 'SunPower', model: 'Maxeon 6 AC',
        type: 'Mono', subType: 'IBC',
        watt: 400, vmp: 36.4, imp: 11.0, voc: 43.6, isc: 11.7,
        efficiency: 22.6, weight: 21.0, size: '1690x1046x40', cells: 66,
        warranty: 40, price: 320, made: 'USA'
    },
    {
        id: 'p-sharp-330',
        brand: 'Sharp', model: 'NU-JD330',
        type: 'Mono', subType: 'PERC',
        watt: 330, vmp: 34.6, imp: 9.54, voc: 41.1, isc: 10.16,
        efficiency: 19.6, weight: 18.5, size: '1684x1002x35', cells: 120,
        warranty: 25, price: 125, made: 'Japan'
    }
];

export function findPanel(id) { return SOLAR_PANELS.find((p) => p.id === id) || SOLAR_PANELS[0]; }
