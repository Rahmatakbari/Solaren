/**
 * نمودارهای تعاملی Canvas
 * Interactive Canvas Charts
 *
 * انواع: line, bar, pie, donut, area, sparkline
 */

const COLOR_PALETTE = [
    '#f59e0b', // sun
    '#0ea5e9', // sky
    '#8b5cf6', // violet
    '#10b981', // emerald
    '#ec4899', // pink
    '#f97316', // orange
    '#22d3ee', // cyan
    '#a78bfa'  // violet-300
];

function getThemeColors() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    return {
        text: isLight ? '#1e293b' : '#f8fafc',
        textMuted: isLight ? '#64748b' : '#94a3b8',
        grid: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
        surface: isLight ? '#ffffff' : '#151c2f',
        border: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'
    };
}

function setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width: rect.width, height: rect.height };
}

function drawText(ctx, text, x, y, options = {}) {
    const { size = 11, color = '#94a3b8', weight = '400', align = 'left', baseline = 'top' } = options;
    ctx.font = `${weight} ${size}px system-ui, -apple-system, sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    ctx.fillText(text, x, y);
}

/**
 * نمودار خطی (Line Chart)
 * data: { labels: [], datasets: [{ label, data, color }] }
 */
export function drawLineChart(canvas, data) {
    const { ctx, width, height } = setupCanvas(canvas);
    const colors = getThemeColors();
    const padding = { top: 20, right: 16, bottom: 30, left: 36 };
    const w = width - padding.left - padding.right;
    const h = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const allValues = data.datasets.flatMap(d => d.data);
    const max = Math.max(...allValues, 0);
    const min = Math.min(...allValues, 0);
    const range = max - min || 1;

    // grid
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (h / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + w, y);
        ctx.stroke();
        // value label
        const value = max - (range / 4) * i;
        drawText(ctx, formatNum(value), padding.left - 4, y, { size: 9, color: colors.textMuted, align: 'right', baseline: 'middle' });
    }

    // x labels
    const stepX = w / Math.max(1, data.labels.length - 1);
    data.labels.forEach((label, i) => {
        const x = padding.left + stepX * i;
        drawText(ctx, label, x, padding.top + h + 6, { size: 9, color: colors.textMuted, align: 'center' });
    });

    // lines
    data.datasets.forEach((dataset, dsIdx) => {
        const color = dataset.color || COLOR_PALETTE[dsIdx % COLOR_PALETTE.length];
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        dataset.data.forEach((v, i) => {
            const x = padding.left + stepX * i;
            const y = padding.top + h - ((v - min) / range) * h;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // area fill
        if (dataset.fill) {
            ctx.lineTo(padding.left + stepX * (dataset.data.length - 1), padding.top + h);
            ctx.lineTo(padding.left, padding.top + h);
            ctx.closePath();
            const grad = ctx.createLinearGradient(0, padding.top, 0, padding.top + h);
            grad.addColorStop(0, color + '40');
            grad.addColorStop(1, color + '00');
            ctx.fillStyle = grad;
            ctx.fill();
        }

        // points
        ctx.fillStyle = color;
        dataset.data.forEach((v, i) => {
            const x = padding.left + stepX * i;
            const y = padding.top + h - ((v - min) / range) * h;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });
    });
}

/**
 * نمودار میله‌ای (Bar Chart)
 */
export function drawBarChart(canvas, data) {
    const { ctx, width, height } = setupCanvas(canvas);
    const colors = getThemeColors();
    const padding = { top: 20, right: 16, bottom: 30, left: 36 };
    const w = width - padding.left - padding.right;
    const h = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const allValues = data.datasets.flatMap(d => d.data);
    const max = Math.max(...allValues, 0) * 1.1;

    // grid
    ctx.strokeStyle = colors.grid;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (h / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(padding.left + w, y);
        ctx.stroke();
        const value = max - (max / 4) * i;
        drawText(ctx, formatNum(value), padding.left - 4, y, { size: 9, color: colors.textMuted, align: 'right', baseline: 'middle' });
    }

    // bars
    const groupCount = data.labels.length;
    const datasetCount = data.datasets.length;
    const groupWidth = w / groupCount;
    const barWidth = (groupWidth * 0.7) / datasetCount;

    data.labels.forEach((label, i) => {
        const x0 = padding.left + groupWidth * i + groupWidth * 0.15;
        data.datasets.forEach((dataset, dsIdx) => {
            const v = dataset.data[i];
            const barH = (v / max) * h;
            const x = x0 + barWidth * dsIdx;
            const y = padding.top + h - barH;
            const color = dataset.color || COLOR_PALETTE[dsIdx % COLOR_PALETTE.length];
            const grad = ctx.createLinearGradient(0, y, 0, padding.top + h);
            grad.addColorStop(0, color);
            grad.addColorStop(1, color + '40');
            ctx.fillStyle = grad;
            roundRect(ctx, x, y, barWidth - 2, barH, 4);
            ctx.fill();
        });
        // x label
        drawText(ctx, label, padding.left + groupWidth * i + groupWidth / 2, padding.top + h + 6, { size: 9, color: colors.textMuted, align: 'center' });
    });
}

/**
 * نمودار دایره‌ای (Pie/Donut)
 */
export function drawDonutChart(canvas, data) {
    // data: { labels: [], values: [], colors: [] }
    const { ctx, width, height } = setupCanvas(canvas);
    const colors = getThemeColors();
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 20;
    const innerR = radius * 0.6;

    const total = data.values.reduce((s, v) => s + v, 0);
    if (total === 0) return;

    let startAngle = -Math.PI / 2;
    const segments = [];

    data.values.forEach((v, i) => {
        const angle = (v / total) * Math.PI * 2;
        const color = data.colors?.[i] || COLOR_PALETTE[i % COLOR_PALETTE.length];

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, startAngle + angle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        segments.push({
            label: data.labels[i],
            value: v,
            color,
            percent: (v / total) * 100,
            midAngle: startAngle + angle / 2
        });

        startAngle += angle;
    });

    // center text
    if (data.centerLabel) {
        drawText(ctx, data.centerLabel, cx, cy - 8, { size: 12, color: colors.textMuted, align: 'center', baseline: 'middle' });
    }
    if (data.centerValue) {
        drawText(ctx, data.centerValue, cx, cy + 10, { size: 18, color: colors.text, weight: '700', align: 'center', baseline: 'middle' });
    }

    return segments;
}

function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function formatNum(n) {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    if (n >= 100) return n.toFixed(0);
    if (n >= 10) return n.toFixed(1);
    return n.toFixed(2);
}

/**
 * نمودار کوچک (Sparkline) - برای نمایش در کارت‌ها
 */
export function drawSparkline(canvas, values, color = '#f59e0b') {
    const { ctx, width, height } = setupCanvas(canvas);
    ctx.clearRect(0, 0, width, height);

    if (values.length < 2) return;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const stepX = width / (values.length - 1);

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, color + '60');
    grad.addColorStop(1, color + '00');

    ctx.beginPath();
    values.forEach((v, i) => {
        const x = stepX * i;
        const y = height - ((v - min) / range) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    values.forEach((v, i) => {
        const x = stepX * i;
        const y = height - ((v - min) / range) * height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();
}

/**
 * نمودار مساحت (Area)
 */
export function drawAreaChart(canvas, data) {
    const ds = data.datasets.map(d => ({ ...d, fill: true }));
    drawLineChart(canvas, { ...data, datasets: ds });
}

/**
 * گیج (Gauge) برای درصد
 */
export function drawGauge(canvas, value, max = 100) {
    const { ctx, width, height } = setupCanvas(canvas);
    const colors = getThemeColors();
    ctx.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height * 0.75;
    const radius = Math.min(width, height) * 0.4;
    const startAngle = Math.PI;
    const endAngle = 0;

    // background
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // progress
    const progress = Math.min(1, Math.max(0, value / max));
    const progressEnd = startAngle + (endAngle - startAngle) * progress;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, progressEnd);
    const grad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(1, '#ec4899');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // value text
    drawText(ctx, Math.round(value) + '%', cx, cy - 8, { size: 24, color: colors.text, weight: '800', align: 'center', baseline: 'middle' });
}

/**
 * افزودن لیژند (Legend)
 */
export function drawLegend(canvas, items) {
    const { ctx, width, height } = setupCanvas(canvas);
    const colors = getThemeColors();
    ctx.clearRect(0, 0, width, height);

    const perRow = Math.floor(width / 100);
    items.forEach((item, i) => {
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        const x = col * 100 + 8;
        const y = row * 20 + 8;

        ctx.fillStyle = item.color;
        ctx.fillRect(x, y, 10, 10);

        drawText(ctx, item.label, x + 16, y, { size: 10, color: colors.text, baseline: 'top' });
        if (item.value !== undefined) {
            drawText(ctx, formatNum(item.value), x + 16, y + 11, { size: 8, color: colors.textMuted, baseline: 'top' });
        }
    });
}
