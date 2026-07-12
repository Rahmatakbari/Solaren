/**
 * Complete Bill of Materials (BOM) Rules
 * Industry-standard quantities for solar systems
 */

export const BOM_RULES = {
    /**
     * Get complete BOM for a system of given size
     * @param {object} config
     * @param {number} config.systemKw - Total system size in kW
     * @param {string} config.systemType - 'on-grid' | 'off-grid' | 'hybrid'
     * @param {number} config.panelWatt - Panel wattage (450, 550, etc.)
     * @param {number} config.batteryKWh - Battery capacity in kWh (for off-grid/hybrid)
     * @param {number} config.backupHours - Backup autonomy hours
     * @param {number} config.stringConfig - 'auto' | 'series' | 'parallel'
     */
    generate(config) {
        const { systemKw, systemType, panelWatt = 550, batteryKWh = 0, backupHours = 4, stringConfig = 'auto' } = config;

        // ===== SOLAR PANELS =====
        const numPanels = Math.ceil((systemKw * 1000) / panelWatt);
        const panelCurrent = panelWatt === 550 ? 13.16 : panelWatt === 450 ? 10.85 : 10.76;
        const panelVoc = panelWatt === 550 ? 49.9 : panelWatt === 450 ? 49.7 : 44.4;
        const panelVmp = panelWatt === 550 ? 41.8 : panelWatt === 450 ? 41.7 : 37.2;
        const panelIsc = panelWatt === 550 ? 13.99 : panelWatt === 450 ? 11.42 : 11.65;

        // Series/parallel configuration
        const maxSeriesInverter = systemKw <= 5 ? 1000 : systemKw <= 20 ? 1100 : 1500;
        const maxSeries = Math.min(Math.floor(maxSeriesInverter / (panelVoc * 1.1)), 13);
        const seriesCount = stringConfig === 'parallel' ? 1 : Math.min(numPanels, maxSeries);
        const parallelCount = Math.ceil(numPanels / seriesCount);

        // ===== INVERTER =====
        const inverterKw = systemKw; // exact match (or 1.25x for safety)
        const inverterAmp = Math.ceil((systemKw * 1000) / 48) * 1.25; // for 48V
        const isThreePhase = systemKw >= 8;

        // ===== BATTERIES (off-grid/hybrid) =====
        let batteryConfig = null;
        if (systemType !== 'on-grid' && batteryKWh > 0) {
            const batteryVoltage = systemKw <= 5 ? 48 : 48; // Most use 48V
            const dod = 0.9;
            const requiredKWh = batteryKWh;
            const effectiveKWh = requiredKWh / dod;
            // Use 5kWh LiFePO4 modules as standard
            const module5kWh = Math.ceil(effectiveKWh / 5);
            const module10kWh = Math.ceil(effectiveKWh / 10);
            batteryConfig = {
                voltage: batteryVoltage,
                requiredKWh: effectiveKWh,
                module5kWh,
                module10kWh,
                // Or lead-acid 200Ah batteries
                leadAcid200Ah: Math.ceil((effectiveKWh * 1000) / (12 * 200)) * 4, // 4 in series for 48V
                // Cables between batteries
                interBatteryCables: module5kWh * 2 // 2 cables per battery
            };
        }

        // ===== CABLES =====
        // 1. DC cable from panels to inverter
        // Rule: ~0.5-1m per panel + 5-10m run + 2 (positive/negative)
        const panelStringLength = (seriesCount * 2.5) + 8; // approx
        const dcCableLength = parallelCount * panelStringLength;
        const dcCableSize = this._calcDCSize(panelCurrent * parallelCount, panelStringLength, 1000); // max system voltage

        // 2. AC cable from inverter to panel
        const acCableSize = this._calcACSize(systemKw, isThreePhase ? 380 : 220, 15);
        const acCableLength = 15; // typical

        // 3. Battery cable (if applicable)
        const batteryCableSize = systemType !== 'on-grid' ? 50 : 0;
        const batteryCableLength = 5; // typical

        // ===== PROTECTION =====
        // DC breakers
        const dcBreakerPerString = parallelCount;
        const dcBreakerMain = 1; // main DC disconnect
        // Calculate DC breaker size
        const dcBreakerAmp = Math.ceil(panelCurrent * 1.25);

        // AC breakers
        const acBreakerMain = 1;
        const acBreakerAmp = isThreePhase
            ? Math.ceil((systemKw * 1000) / (380 * 1.732 * 0.85))
            : Math.ceil((systemKw * 1000) / (220 * 0.85));

        // Fuses
        const dcFuses = parallelCount; // one per string
        const fuseAmp = Math.ceil(panelCurrent * 1.5);

        // SPD (Surge Protection Device)
        const dcSPD = 1;
        const acSPD = 1;

        // ===== MONITORING =====
        const wifiMonitor = 1; // for hybrid/string inverters
        const smartMeter = isThreePhase ? 1 : 0;

        // ===== MOUNTING =====
        // Rails: ~2m per panel
        const railLength = numPanels * 2.2;
        // Mid clamps: 2 per panel
        const midClamps = (numPanels - parallelCount) * 2; // shared between panels
        // End clamps: 4 (2 per end of row)
        const endClamps = parallelCount * 2;
        // L-feet for roof mounting: 1 per 1.5m
        const lFeet = Math.ceil(numPanels * 1.5);
        // Rail splices
        const railSplices = Math.max(0, Math.ceil(numPanels / 6) - 1);

        // ===== GROUNDING =====
        // Grounding rods
        const groundRods = Math.max(2, Math.ceil(systemKw / 3));
        // Grounding wire (6mm² bare copper)
        const groundWire = Math.max(20, numPanels * 1.5);
        // Grounding lugs
        const groundLugs = numPanels + 2; // 1 per panel + 2 for structure

        // ===== ENCLOSURES =====
        // DC combiner box (for >2 strings)
        const combinerBox = parallelCount > 2 ? 1 : 0;
        // AC distribution panel
        const acPanel = 1;
        // Battery enclosure (if needed)
        const batteryEnclosure = systemType !== 'on-grid' ? Math.ceil(batteryKWh / 10) : 0;

        // ===== MC4 CONNECTORS =====
        // 1 pair per panel + 1 pair for extension
        const mc4Pairs = numPanels * 2;

        // ===== CONDUIT =====
        // PVC conduit for cable protection
        const conduitLength = dcCableLength + acCableLength + batteryCableLength;

        // ===== ASSEMBLY =====
        return {
            panels: {
                count: numPanels,
                watt: panelWatt,
                totalKw: (numPanels * panelWatt / 1000).toFixed(2),
                panelCurrent, panelVoc, panelVmp, panelIsc,
                seriesCount, parallelCount,
                stringConfig: { series: seriesCount, parallel: parallelCount },
                configuration: this._describeStringConfig(seriesCount, parallelCount, panelWatt)
            },
            inverter: {
                powerKw: inverterKw,
                current: inverterAmp,
                threePhase: isThreePhase,
                type: this._recommendInverterType(systemType, systemKw),
                specs: {
                    mpptCount: parallelCount,
                    maxPvV: maxSeriesInverter,
                    ratedPower: systemKw
                }
            },
            batteries: batteryConfig,
            cables: {
                dc: { length: Math.ceil(dcCableLength), size: dcCableSize, type: 'سولار DC' },
                ac: { length: acCableLength, size: acCableSize, type: isThreePhase ? 'سه فاز' : 'تک فاز' },
                battery: { length: batteryCableLength, size: batteryCableSize, type: 'باتری' },
                ground: { length: Math.ceil(groundWire), size: 6, type: 'ارت مسی' }
            },
            protection: {
                dcBreakerPerString: { count: dcBreakerPerString, amp: dcBreakerAmp, voltage: 1000 },
                dcBreakerMain: { count: dcBreakerMain, amp: dcBreakerAmp * parallelCount, voltage: 1000 },
                dcFuses: { count: dcFuses, amp: fuseAmp, voltage: 1000 },
                acBreakerMain: { count: acBreakerMain, amp: acBreakerAmp, voltage: isThreePhase ? 400 : 230 },
                acSPD: { count: acSPD, type: 'Type 2' },
                dcSPD: { count: dcSPD, type: 'Type 2' }
            },
            connectors: {
                mc4: { count: mc4Pairs, type: 'MC4 جفت' },
                conduit: { length: Math.ceil(conduitLength), size: 25 }
            },
            mounting: {
                rails: { length: Math.ceil(railLength), type: 'آلومینیوم آنودایز' },
                midClamps: { count: Math.max(0, midClamps) },
                endClamps: { count: endClamps },
                lFeet: { count: lFeet },
                railSplices: { count: railSplices }
            },
            grounding: {
                rods: { count: groundRods, length: 1.5 },
                wire: { length: Math.ceil(groundWire), size: 6 },
                lugs: { count: groundLugs }
            },
            monitoring: {
                wifiMonitor: { count: wifiMonitor, type: 'WiFi/Ethernet' },
                smartMeter: { count: smartMeter, type: isThreePhase ? 'سه فاز' : 'تک فاز' }
            },
            enclosures: {
                combinerBox: { count: combinerBox, type: combinerBox ? `${parallelCount} رشته` : 'ندارد' },
                acPanel: { count: acPanel },
                batteryEnclosure: { count: batteryEnclosure }
            }
        };
    },

    _describeStringConfig(series, parallel, watt) {
        if (series === 1 && parallel > 1) return `${parallel} رشته موازی ${watt}W`;
        if (series > 1 && parallel === 1) return `${series} پنل سری ${watt}W`;
        return `${parallel} رشته موازی × ${series} پنل سری (${watt}W هرکدام)`;
    },

    _calcDCSize(current, length, voltage) {
        // A = (2 × I × L × ρ) / (V × 0.03)
        const rho = 0.0172;
        const drop = voltage * 0.03;
        const area = (2 * current * length * rho) / drop;
        const standards = [4, 6, 10, 16, 25, 35];
        return standards.find((s) => s >= area) || 35;
    },

    _calcACSize(powerKw, voltage, length) {
        const current = (powerKw * 1000) / (voltage * 0.85);
        const rho = 0.0172;
        const drop = voltage * 0.02;
        const area = (2 * current * length * rho) / drop;
        const standards = [2.5, 4, 6, 10, 16, 25];
        return standards.find((s) => s >= area) || 25;
    },

    _recommendInverterType(systemType, kw) {
        if (systemType === 'on-grid') return kw < 10 ? 'تک فاز String' : 'سه فاز String';
        if (systemType === 'off-grid') return 'هیبرید آفگرید';
        return 'هیبرید دو طرفه';
    }
};

/**
 * Connection diagrams (text-based)
 */
export const CONNECTION_GUIDE = {
    series: 'پنل‌ها را به ترتیب + به - به هم وصل کنید. ولتاژ‌ها جمع می‌شوند ولی جریان ثابت می‌ماند.',
    parallel: 'تمام + ها را به هم و تمام - ها را به هم وصل کنید. ولتاژ ثابت می‌ماند ولی جریان‌ها جمع می‌شوند.',
    seriesParallel: 'ابتدا پنل‌ها را سری کنید (هر رشته)، سپس رشته‌ها را موازی وصل کنید. ولتاژ و توان هر رشته ضرب در تعداد رشته‌ها.',
    mppt: 'هر MPPT اینورتر می‌تواند یک یا چند رشته مستقل داشته باشد. بهتر است رشته‌های با جهت یکسان در یک MPPT وصل شوند.',
    battery: 'باتری‌ها ابتدا سری شده تا به ولتاژ مورد نظر برسند (معمولاً ۴۸V)، سپس رشته‌های موازی برای افزایش ظرفیت.',
    grounding: 'تمام اجزای فلزی (پنل، سازه، تابلو) باید به سیستم ارت متصل شوند. مقاومت زمین باید کمتر از ۵ اهم باشد.'
};
