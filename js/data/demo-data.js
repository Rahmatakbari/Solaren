/**
 * داده‌های نمونه برای حالت دمو
 * Demo Data
 */

export const DEMO_PROJECTS = [
    {
        id: 'demo-proj-1',
        name: 'خانه آقای احمدی - کابل',
        customer: 'علی احمدی',
        customerPhone: '0700123456',
        location: 'kabul',
        systemType: 'hybrid',
        phase: '1ph',
        totalCapacity: 5,
        totalCost: 4500,
        numPanels: 10,
        actualPvKw: 5.5,
        panel: 'p-jinko-550',
        inverter: 'inv-growatt-5000',
        battery: 'b-pylontech-4.8',
        status: 'completed',
        installDate: '2026-04-15',
        annualKWh: 8500,
        createdAt: '2026-04-01T10:00:00Z'
    },
    {
        id: 'demo-proj-2',
        name: 'مغازه طلا فروشی - هرات',
        customer: 'محمد رحیمی',
        customerPhone: '0799987654',
        location: 'herat',
        systemType: 'on-grid',
        phase: '3ph',
        totalCapacity: 10,
        totalCost: 7500,
        numPanels: 18,
        actualPvKw: 9.9,
        panel: 'p-trina-550',
        inverter: 'inv-growatt-10000',
        status: 'in-progress',
        installDate: '2026-06-20',
        annualKWh: 16500,
        createdAt: '2026-05-15T10:00:00Z'
    },
    {
        id: 'demo-proj-3',
        name: 'ویلا - مزار شریف',
        customer: 'فاطمه نوری',
        customerPhone: '0775444333',
        location: 'mazar',
        systemType: 'hybrid',
        phase: '3ph',
        totalCapacity: 15,
        totalCost: 12500,
        numPanels: 28,
        actualPvKw: 15.4,
        panel: 'p-jinko-550',
        inverter: 'inv-huawei-10000',
        battery: 'b-deye-10.2',
        status: 'completed',
        installDate: '2026-03-10',
        annualKWh: 24000,
        createdAt: '2026-02-20T10:00:00Z'
    }
];

export const DEMO_CUSTOMERS = [
    {
        id: 'demo-cust-1',
        name: 'علی احمدی',
        phone: '0700123456',
        email: 'ali@example.com',
        address: 'کابل، خیرخانه',
        loyaltyTier: 'gold',
        totalSpent: 4500,
        projects: 1,
        createdAt: '2026-04-01T10:00:00Z'
    },
    {
        id: 'demo-cust-2',
        name: 'محمد رحیمی',
        phone: '0799987654',
        email: 'rahimi@example.com',
        address: 'هرات، جاده ولایت',
        loyaltyTier: 'silver',
        totalSpent: 7500,
        projects: 1,
        createdAt: '2026-05-15T10:00:00Z'
    },
    {
        id: 'demo-cust-3',
        name: 'فاطمه نوری',
        phone: '0775444333',
        email: 'noori@example.com',
        address: 'مزار شریف، شهرنو',
        loyaltyTier: 'platinum',
        totalSpent: 12500,
        projects: 1,
        createdAt: '2026-02-20T10:00:00Z'
    }
];

export const DEMO_INVOICES = [
    {
        id: 'demo-inv-1',
        number: 'INV-2026-001',
        customer: 'علی احمدی',
        project: 'خانه آقای احمدی',
        date: '2026-04-15',
        total: 4500,
        status: 'paid',
        items: [
            { name: 'پنل Jinko 550W', qty: 10, price: 195, total: 1950 },
            { name: 'اینورتر Growatt 5kW', qty: 1, price: 650, total: 650 },
            { name: 'باتری Pylontech 4.8kWh', qty: 1, price: 1650, total: 1650 },
            { name: 'نصب و تجهیزات', qty: 1, price: 250, total: 250 }
        ]
    },
    {
        id: 'demo-inv-2',
        number: 'INV-2026-002',
        customer: 'محمد رحیمی',
        project: 'مغازه طلا فروشی',
        date: '2026-05-20',
        total: 7500,
        status: 'pending',
        items: [
            { name: 'پنل Trina 550W', qty: 18, price: 200, total: 3600 },
            { name: 'اینورتر Growatt 10kW', qty: 1, price: 1100, total: 1100 },
            { name: 'سازه و نصب', qty: 1, price: 2800, total: 2800 }
        ]
    }
];

export const DEMO_PAYMENTS = [
    {
        id: 'demo-pay-1',
        invoice: 'INV-2026-001',
        amount: 4500,
        date: '2026-04-20',
        method: 'نقدی',
        status: 'completed'
    },
    {
        id: 'demo-pay-2',
        invoice: 'INV-2026-002',
        amount: 3750,
        date: '2026-05-25',
        dueDate: '2026-07-30',
        method: 'اقساط',
        status: 'pending'
    }
];

export const DEMO_TASKS = [
    {
        id: 'demo-task-1',
        title: 'بازدید پروژه هرات',
        type: 'inspection',
        dueDate: '2026-07-20',
        status: 'pending',
        description: 'بررسی نهایی نصب پنل‌ها'
    },
    {
        id: 'demo-task-2',
        title: 'نصب پنل‌های مزار',
        type: 'install',
        dueDate: '2026-07-25',
        status: 'in-progress'
    }
];

export const DEMO_NOTES = [
    {
        id: 'demo-note-1',
        title: 'یادداشت مهم',
        text: 'مشتری احمدی خواستار اضافه کردن باتری دوم است. فردا تماس بگیرم.',
        color: 'sun',
        createdAt: Date.now() - 86400000
    },
    {
        id: 'demo-note-2',
        title: 'ایده جدید',
        text: 'می‌توان از پنل‌های bifacial برای پروژه‌های بزرگ استفاده کرد. راندمان ۲۵٪ بیشتر است.',
        color: 'emerald',
        createdAt: Date.now() - 172800000
    }
];

/**
 * بارگذاری همه داده‌های دمو
 */
export function loadDemoData() {
    const allKeys = [
        'solar-pwa:projects',
        'solar-pwa:customers',
        'solar-pwa:invoices',
        'solar-pwa:payments',
        'solar-pwa:tasks',
        'solar-pwa:notes',
        'solar-pwa:loyalty',
        'solar-pwa:activities'
    ];
    const data = {
        'solar-pwa:projects': DEMO_PROJECTS,
        'solar-pwa:customers': DEMO_CUSTOMERS,
        'solar-pwa:invoices': DEMO_INVOICES,
        'solar-pwa:payments': DEMO_PAYMENTS,
        'solar-pwa:tasks': DEMO_TASKS,
        'solar-pwa:notes': DEMO_NOTES,
        'solar-pwa:loyalty': [],
        'solar-pwa:activities': []
    };

    Object.keys(data).forEach(k => {
        localStorage.setItem(k, JSON.stringify(data[k]));
    });

    return allKeys.length;
}

export function clearDemoData() {
    return loadDemoData();
}
