/**
 * Solar Shading & Obstacle Data
 * Common objects that cast shadows on solar panels
 */

export const OBSTACLE_TYPES = [
    { id: 'tree-small', name: 'درخت کوچک', heightRange: [2, 5], seasonal: true, description: 'درختان کوچک، درختچه‌ها' },
    { id: 'tree-medium', name: 'درخت متوسط', heightRange: [5, 10], seasonal: true, description: 'درختان میوه، درختان سایه متوسط' },
    { id: 'tree-large', name: 'درخت بزرگ', heightRange: [10, 20], seasonal: true, description: 'درختان بلند، نارون، چنار' },
    { id: 'building', name: 'ساختمان', heightRange: [3, 50], seasonal: false, description: 'ساختمان، خانه، دیوار' },
    { id: 'wall', name: 'دیوار', heightRange: [1, 5], seasonal: false, description: 'دیوارها و حصارها' },
    { id: 'chimney', name: 'دودکش / آنتن', heightRange: [1, 3], seasonal: false, description: 'دودکش، آنتن، دکل' },
    { id: 'mountain', name: 'کوه / تپه', heightRange: [20, 200], seasonal: false, description: 'کوه‌ها و تپه‌های اطراف' },
    { id: 'power-line', name: 'خط برق / تیر', heightRange: [8, 15], seasonal: false, description: 'تیرهای برق و تلفن' }
];

export const SEASONS = [
    { id: 'summer', name: 'تابستان', sunAngle: 'بالا', label: 'تابستان (۲۱ ژوئن)' },
    { id: 'spring', name: 'بهار/پاییز', sunAngle: 'متوسط', label: 'اعتدال (۲۱ مارس/سپتامبر)' },
    { id: 'winter', name: 'زمستان', sunAngle: 'پایین', label: 'زمستان (۲۱ دسامبر)' }
];

/**
 * Calculate sun position for a given location and time
 * Simplified solar geometry (NOAA algorithm approximation)
 * @param {number} latitude - درجه (مثبت = شمال)
 * @param {number} dayOfYear - 1-365
 * @param {number} hour - 0-24
 * @returns {object} { altitude (deg), azimuth (deg from south) }
 */
export function calcSunPosition(latitude, dayOfYear, hour) {
    // Solar declination
    const declination = 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180);
    // Hour angle
    const hourAngle = (hour - 12) * 15; // degrees

    const latRad = latitude * Math.PI / 180;
    const decRad = declination * Math.PI / 180;
    const haRad = hourAngle * Math.PI / 180;

    // Solar altitude (height above horizon)
    const sinAlt = Math.sin(latRad) * Math.sin(decRad) +
                  Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
    const altitude = Math.asin(sinAlt) * 180 / Math.PI;

    // Solar azimuth (from south, positive west)
    const cosAz = (Math.sin(decRad) - Math.sin(altitude * Math.PI / 180) * Math.sin(latRad)) /
                  (Math.cos(altitude * Math.PI / 180) * Math.cos(latRad));
    const azimuth = Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180 / Math.PI;

    return { altitude: Math.max(0, altitude), azimuth: hourAngle < 0 ? -azimuth : azimuth };
}

/**
 * Calculate shadow length
 * @param {number} obstacleHeight - meters
 * @param {number} sunAltitude - degrees above horizon
 * @returns {number} shadow length in meters
 */
export function calcShadowLength(obstacleHeight, sunAltitude) {
    if (sunAltitude <= 0) return Infinity; // sun below horizon
    return obstacleHeight / Math.tan(sunAltitude * Math.PI / 180);
}

/**
 * Calculate shading impact on a panel
 * @param {object} params
 * @param {number} params.obstacleHeight - obstacle height in m
 * @param {number} params.obstacleDistance - distance to obstacle in m
 * @param {number} params.panelTilt - panel tilt in degrees
 * @param {number} params.solarAltitude - sun altitude in degrees
 * @param {number} params.solarAzimuth - sun azimuth in degrees
 * @param {number} params.panelAzimuth - panel azimuth (180 = south)
 * @returns {object} { shaded: bool, percent: 0-100, recommendation }
 */
export function calcShadingImpact({ obstacleHeight, obstacleDistance, panelTilt, solarAltitude, solarAzimuth, panelAzimuth = 180 }) {
    if (solarAltitude <= 0) {
        return { shaded: true, percent: 100, reason: 'خورشید در افق' };
    }

    const shadowLength = calcShadowLength(obstacleHeight, solarAltitude);
    // Account for panel tilt - effective shadow direction
    const tiltRad = panelTilt * Math.PI / 180;
    const effectiveShadow = shadowLength * Math.cos(tiltRad);

    // Azimuth difference (0 = same direction as sun)
    const azDiff = Math.abs(solarAzimuth - panelAzimuth);
    const lateralShift = obstacleDistance * Math.tan(azDiff * Math.PI / 180);

    const totalDistance = effectiveShadow + lateralShift;

    if (totalDistance <= obstacleDistance) {
        const percent = Math.max(0, Math.min(100, (1 - (totalDistance / obstacleDistance)) * 100));
        return {
            shaded: percent > 5,
            percent: Math.round(percent * 10) / 10,
            shadowLength: Math.round(shadowLength * 10) / 10,
            totalDistance: Math.round(totalDistance * 10) / 10,
            reason: percent > 50 ? 'سایه شدید — نیاز به جابجایی پنل' : percent > 20 ? 'سایه جزئی' : 'بدون سایه'
        };
    }

    return { shaded: false, percent: 0, shadowLength: Math.round(shadowLength * 10) / 10, totalDistance: Math.round(totalDistance * 10) / 10, reason: 'بدون سایه' };
}

/**
 * Generate solar path for a day (every hour)
 */
export function generateSolarPath(latitude, dayOfYear) {
    const path = [];
    for (let hour = 5; hour <= 19; hour += 0.5) {
        const pos = calcSunPosition(latitude, dayOfYear, hour);
        path.push({ hour, ...pos });
    }
    return path;
}
