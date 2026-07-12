/**
 * دستیار هوشمند سولر - AI Solar Assistant
 * یک چت‌بات محلی با قابلیت تشخیص نیت و محاسبات سریع
 */
import { Utils } from '../utils.js';
import { toast } from '../ui.js';
import { KNOWLEDGE_BASE, detectIntent, parseQuickRequest, handleCalculation } from '../data/knowledge-base.js';
import { projects, customers, invoices } from '../store.js';

const STORAGE_CHAT = 'solar-pwa:ai-history';

function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_CHAT) || '[]');
    } catch { return []; }
}

function saveHistory(history) {
    try {
        localStorage.setItem(STORAGE_CHAT, JSON.stringify(history.slice(-50)));
    } catch { /* silent */ }
}

function addToHistory(msg) {
    const history = loadHistory();
    history.push(msg);
    saveHistory(history);
}

function clearHistory() {
    localStorage.removeItem(STORAGE_CHAT);
}

function getProjectStats() {
    try {
        const allProjects = projects.all();
        const allCustomers = customers.all();
        const allInvoices = invoices.all();

        return {
            projects: allProjects.length,
            activeProjects: allProjects.filter(p => p.status !== 'completed' && p.status !== 'cancelled').length,
            customers: allCustomers.length,
            invoices: allInvoices.length,
            totalRevenue: allInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0),
            totalCapacity: allProjects.reduce((s, p) => s + (p.totalCapacity || 0), 0)
        };
    } catch { return { projects: 0, customers: 0, invoices: 0 }; }
}

function formatMessage(text) {
    // تبدیل **bold** و *italic* و لیست‌ها به HTML
    if (!text) return '';
    let html = Utils.escapeHTML(text);
    // **bold**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--color-sun-300);">$1</strong>');
    // *italic*
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // `code`
    html = html.replace(/`(.+?)`/g, '<code style="background:rgba(0,0,0,0.2);padding:1px 4px;border-radius:3px;font-family:var(--font-mono);">$1</code>');
    // خطوط جدید
    html = html.replace(/\n/g, '<br>');
    return html;
}

function generateResponse(userText) {
    if (!userText || !userText.trim()) return null;

    const text = userText.trim();

    // ابتدا محاسبات سریع
    const calc = handleCalculation(text);
    if (calc) {
        return { type: 'assistant', text: calc, category: 'calculation' };
    }

    // سپس intent detection
    const intent = detectIntent(text);
    if (intent) {
        let response;
        if (typeof intent.response === 'function') {
            response = intent.response();
        } else {
            const responses = intent.responses;
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        return { type: 'assistant', text: response, category: intent.id };
    }

    // سوالات مربوط به پروژه
    const norm = text.toLowerCase();
    if (norm.includes('پروژه') && (norm.includes('چند') || norm.includes('وضعیت') || norm.includes('آمار'))) {
        const stats = getProjectStats();
        return {
            type: 'assistant',
            text: `📊 **آمار پروژه‌های شما:**

- 📁 تعداد کل پروژه‌ها: **${Utils.toPersian(stats.projects)}**
- 🔄 پروژه‌های فعال: **${Utils.toPersian(stats.activeProjects)}**
- 👥 تعداد مشتریان: **${Utils.toPersian(stats.customers)}**
- 📄 تعداد فاکتورها: **${Utils.toPersian(stats.invoices)}**
- 💰 درآمد کل: **${Utils.formatNumber(stats.totalRevenue)} $**
- ⚡ ظرفیت نصب شده: **${Utils.formatNumber(stats.totalCapacity, 1)} kW**

${stats.activeProjects > 0 ? '✅ وضعیت کلی خوب است!' : '💡 می‌توانید پروژه جدید اضافه کنید.'}`,
            category: 'projects'
        };
    }

    // سوالات درباره اپ
    if (norm.includes('اپ') || norm.includes('برنامه') || norm.includes('امکانات')) {
        return {
            type: 'assistant',
            text: `📱 **امکانات اپ Solaren Pro:**

📐 **محاسبات:**
- برآورد سریع و دقیق
- محاسبه سیم و باتری
- محاسبه زاویه پنل
- تحلیل سایه‌اندازی

🛒 **تجهیزات:**
- کاتالوگ پنل، اینورتر، باتری، VFD
- سیستم برنامه‌ریزی خودکار اینورتر
- مقایسه تجهیزات

📋 **مدیریت:**
- پروژه‌ها
- مشتریان و CRM
- فاکتور با چاپ
- تیم و وظایف
- تقویم و پرداخت‌ها

📊 **تحلیل:**
- گزارش مالی (ROI، NPV، IRR)
- مانیتورینگ
- نگهداری و تعمیرات
- BOM خودکار

🎨 **طراحی:**
- طراح بصری روی سقف
- نقشه پروژه‌ها

برای رفتن به هر بخش، از منو استفاده کنید.`,
            category: 'app'
        };
    }

    // پیشنهاد بر اساس کلمات کلیدی عمومی
    if (norm.includes('سلام') || norm === 'hi' || norm === 'hello') {
        return {
            type: 'assistant',
            text: KNOWLEDGE_BASE.intents[0].responses[0],
            category: 'greeting'
        };
    }

    // پاسخ پیش‌فرض
    const fallbackResponses = [
        `🤔 سوال خوبیه! من در این زمینه‌ها می‌تونم کمک کنم:

- 💡 **محاسبات سریع**: بگید چند کیلووات یا چند اتاق
- 🏠 **انتخاب سیستم**: برای خانه، مغازه، ویلا
- 🔧 **عیب‌یابی**: مشکلات سیستم سولر
- 💰 **قیمت و اقتصاد**: برآورد هزینه
- ☀️ **تجهیزات**: پنل، اینورتر، باتری

می‌تونید سوال خودتون رو با کلمات کلیدی بپرسید، مثل «برای خانه ۳ اتاق چی نیاز دارم؟» یا «اینورتر چی بخرم؟»`,
        `💭 منظورتون رو دقیق‌تر بگید. مثلاً:

- «برای مغازه چند کیلووات لازمه؟»
- «باتری لیتیوم بهتره یا اسید؟»
- «اینورتر ۵ کیلووات چی پیشنهاد می‌کنی؟»
- «قیمت سیستم ۱۰ کیلووات چقدره؟»

یا یکی از پیشنهادات زیر رو بزنید 👇`,
        `❓ سوال شما رو متوجه نشدم. اما می‌تونم در این موارد کمک کنم:

🔢 محاسبه سایز سیستم
🛒 انتخاب تجهیزات
💰 برآورد قیمت
🔧 رفع مشکل
📐 راهنمای نصب

کلمه کلیدی بفرستید تا کمکتون کنم!`
    ];

    return {
        type: 'assistant',
        text: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
        category: 'fallback'
    };
}

export const aiAssistant = {
    name: 'ai-assistant',
    path: '#ai-assistant',

    state: {
        isTyping: false
    },

    render() {
        const history = loadHistory();
        const stats = getProjectStats();
        const isEmpty = history.length === 0;

        return `
            <h1 class="page-title anim-fade-up">🤖 دستیار هوشمند سولر</h1>
            <p class="page-subtitle anim-fade-up">پاسخگوی محلی - بدون نیاز به اینترنت</p>

            <!-- آمار سریع -->
            <div class="card card--glass anim-fade-up" style="margin-bottom:var(--space-4);">
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2);text-align:center;">
                    <div>
                        <div style="font-size:var(--font-size-2xl);font-weight:800;color:var(--color-sky-300);">${Utils.toPersian(stats.projects)}</div>
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">پروژه</div>
                    </div>
                    <div>
                        <div style="font-size:var(--font-size-2xl);font-weight:800;color:var(--color-emerald-400);">${Utils.toPersian(stats.customers)}</div>
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">مشتری</div>
                    </div>
                    <div>
                        <div style="font-size:var(--font-size-2xl);font-weight:800;color:var(--color-sun-300);">${Utils.toPersian(stats.invoices)}</div>
                        <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">فاکتور</div>
                    </div>
                </div>
            </div>

            <!-- پنجره چت -->
            <div class="card anim-fade-up" style="margin-bottom:var(--space-4);padding:0;overflow:hidden;">
                <div style="background:linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);color:white;padding:var(--space-4);display:flex;align-items:center;gap:var(--space-3);">
                    <div style="width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:22px;">🤖</div>
                    <div style="flex:1;">
                        <div style="font-weight:700;font-size:var(--font-size-md);">سولر AI</div>
                        <div style="font-size:var(--font-size-xs);opacity:0.85;display:flex;align-items:center;gap:6px;">
                            <span style="width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block;box-shadow:0 0 8px #22c55e;"></span>
                            آنلاین - محلی
                        </div>
                    </div>
                    <button class="btn-icon" id="clearChat" title="پاک کردن تاریخچه" style="background:rgba(255,255,255,0.15);color:white;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                    </button>
                </div>

                <div id="chatBox" style="height:380px;overflow-y:auto;padding:var(--space-3);background:var(--color-bg);">
                    ${isEmpty ? this._renderWelcome() : this._renderHistory(history)}
                </div>

                <!-- پیشنهادات سریع -->
                <div style="padding:var(--space-2) var(--space-3);background:var(--color-bg-soft);border-top:1px solid var(--color-border);">
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);margin-bottom:var(--space-2);">💡 پیشنهادات سریع:</div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;" id="quickSuggestions">
                        ${KNOWLEDGE_BASE.quickSuggestions.map((s, i) => `
                            <button class="quick-suggestion" data-suggestion="${Utils.escapeHTML(s.text)}" style="background:var(--color-surface-2);border:1px solid var(--color-border);border-radius:var(--radius-full);padding:6px 12px;font-size:var(--font-size-xs);cursor:pointer;color:var(--color-text);transition:all 0.2s;">
                                <span>${s.icon}</span> <span>${Utils.escapeHTML(s.text)}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <!-- ورودی پیام -->
                <div style="padding:var(--space-3);background:var(--color-bg-soft);border-top:1px solid var(--color-border);">
                    <div style="display:flex;gap:var(--space-2);align-items:flex-end;">
                        <textarea id="chatInput" placeholder="سوال خود را بنویسید..." rows="1" style="flex:1;background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-2) var(--space-3);color:var(--color-text);font-family:inherit;font-size:var(--font-size-sm);resize:none;max-height:100px;min-height:42px;outline:none;"></textarea>
                        <button id="sendBtn" style="background:linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%);color:white;border:none;border-radius:var(--radius-md);padding:var(--space-2) var(--space-3);cursor:pointer;display:flex;align-items:center;justify-content:center;min-width:42px;height:42px;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- قابلیت‌ها -->
            <h2 class="section__title anim-fade-up">🎯 قابلیت‌های دستیار</h2>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);margin-bottom:var(--space-4);">
                <div class="card card--glass card--hover" style="text-align:center;padding:var(--space-3);">
                    <div style="font-size:32px;margin-bottom:6px;">🔢</div>
                    <div style="font-size:var(--font-size-sm);font-weight:600;">محاسبات سریع</div>
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">kW, باتری, سیم</div>
                </div>
                <div class="card card--glass card--hover" style="text-align:center;padding:var(--space-3);">
                    <div style="font-size:32px;margin-bottom:6px;">💡</div>
                    <div style="font-size:var(--font-size-sm);font-weight:600;">پیشنهاد تجهیزات</div>
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">بر اساس نیاز</div>
                </div>
                <div class="card card--glass card--hover" style="text-align:center;padding:var(--space-3);">
                    <div style="font-size:32px;margin-bottom:6px;">🔧</div>
                    <div style="font-size:var(--font-size-sm);font-weight:600;">عیب‌یابی</div>
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">مشکلات رایج</div>
                </div>
                <div class="card card--glass card--hover" style="text-align:center;padding:var(--space-3);">
                    <div style="font-size:32px;margin-bottom:6px;">📊</div>
                    <div style="font-size:var(--font-size-sm);font-weight:600;">تحلیل پروژه</div>
                    <div style="font-size:var(--font-size-xs);color:var(--color-text-muted);">آمار و وضعیت</div>
                </div>
            </div>
        `;
    },

    _renderWelcome() {
        return `
            <div class="chat-msg chat-msg--assistant" style="margin-bottom:var(--space-3);">
                <div style="display:flex;align-items:flex-start;gap:var(--space-2);">
                    <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg, #7c3aed, #4f46e5);color:white;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">🤖</div>
                    <div style="background:linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.15));border:1px solid rgba(124,58,237,0.3);border-radius:var(--radius-md);padding:var(--space-3);max-width:85%;">
                        <div style="font-size:var(--font-size-sm);line-height:1.7;">
                            سلام! 👋 من <strong>دستیار هوشمند سولر</strong> شما هستم.<br><br>
                            می‌تونم در محاسبه سیستم، انتخاب تجهیزات، عیب‌یابی و مشاوره کمکتون کنم. <strong>کاملاً محلی و آفلاین</strong> کار می‌کنم.<br><br>
                            از پیشنهادات زیر استفاده کنید یا سوال خودتون رو بپرسید! 😊
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    _renderHistory(history) {
        return history.map(msg => this._renderMessage(msg)).join('');
    },

    _renderMessage(msg) {
        if (msg.type === 'user') {
            return `
                <div class="chat-msg chat-msg--user" style="margin-bottom:var(--space-3);text-align:left;">
                    <div style="display:inline-flex;align-items:flex-start;gap:var(--space-2);flex-direction:row-reverse;max-width:85%;">
                        <div style="width:32px;height:32px;border-radius:50%;background:var(--gradient-sun);color:white;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">👤</div>
                        <div style="background:var(--gradient-sun);color:white;border-radius:var(--radius-md);padding:var(--space-3);text-align:right;">
                            <div style="font-size:var(--font-size-sm);line-height:1.6;">${Utils.escapeHTML(msg.text)}</div>
                            <div style="font-size:10px;opacity:0.7;margin-top:4px;">${Utils.toPersian(new Date(msg.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }))}</div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="chat-msg chat-msg--assistant" style="margin-bottom:var(--space-3);">
                    <div style="display:flex;align-items:flex-start;gap:var(--space-2);">
                        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg, #7c3aed, #4f46e5);color:white;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">🤖</div>
                        <div style="background:linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.15));border:1px solid rgba(124,58,237,0.3);border-radius:var(--radius-md);padding:var(--space-3);max-width:85%;">
                            <div style="font-size:var(--font-size-sm);line-height:1.7;">${formatMessage(msg.text)}</div>
                            <div style="font-size:10px;color:var(--color-text-muted);margin-top:6px;">${Utils.toPersian(new Date(msg.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }))}</div>
                        </div>
                    </div>
                </div>
            `;
        }
    },

    attach() {
        const input = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        const chatBox = document.getElementById('chatBox');

        const send = () => {
            const text = input.value.trim();
            if (!text) return;

            // ارسال پیام کاربر
            const userMsg = { type: 'user', text, timestamp: Date.now() };
            addToHistory(userMsg);

            // نمایش پیام کاربر
            chatBox.insertAdjacentHTML('beforeend', this._renderMessage(userMsg));
            input.value = '';
            input.style.height = 'auto';
            chatBox.scrollTop = chatBox.scrollHeight;

            // نمایش "در حال تایپ"
            const typingDiv = document.createElement('div');
            typingDiv.id = 'typingIndicator';
            typingDiv.style.cssText = 'margin-bottom:var(--space-3);';
            typingDiv.innerHTML = `
                <div style="display:flex;align-items:center;gap:var(--space-2);">
                    <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg, #7c3aed, #4f46e5);color:white;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">🤖</div>
                    <div style="background:var(--color-surface);border:1px solid var(--color-border);border-radius:var(--radius-md);padding:var(--space-2) var(--space-3);">
                        <div class="typing-dots" style="display:flex;gap:4px;">
                            <span style="width:8px;height:8px;border-radius:50%;background:var(--color-violet-500);animation:typing 1.2s infinite;"></span>
                            <span style="width:8px;height:8px;border-radius:50%;background:var(--color-violet-500);animation:typing 1.2s infinite 0.2s;"></span>
                            <span style="width:8px;height:8px;border-radius:50%;background:var(--color-violet-500);animation:typing 1.2s infinite 0.4s;"></span>
                        </div>
                    </div>
                </div>
            `;
            chatBox.appendChild(typingDiv);
            chatBox.scrollTop = chatBox.scrollHeight;

            // پاسخ بعد از تاخیر
            const delay = 600 + Math.random() * 800;
            setTimeout(() => {
                const response = generateResponse(text);
                const aiMsg = { ...response, timestamp: Date.now() };
                addToHistory(aiMsg);

                const indicator = document.getElementById('typingIndicator');
                if (indicator) indicator.remove();

                chatBox.insertAdjacentHTML('beforeend', this._renderMessage(aiMsg));
                chatBox.scrollTop = chatBox.scrollHeight;
            }, delay);
        };

        sendBtn?.addEventListener('click', send);
        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
            }
        });
        // auto-resize
        input?.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 100) + 'px';
        });

        // پیشنهادات سریع
        document.querySelectorAll('.quick-suggestion').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.dataset.suggestion;
                if (input) {
                    input.value = text;
                    send();
                }
            });
        });

        // پاک کردن تاریخچه
        document.getElementById('clearChat')?.addEventListener('click', () => {
            if (confirm('تاریخچه چت پاک شود؟')) {
                clearHistory();
                const cb = document.getElementById('chatBox');
                if (cb) cb.innerHTML = this._renderWelcome();
                toast.success('تاریخچه پاک شد');
            }
        });
    }
};
