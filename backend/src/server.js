const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const gamification = require('./gamification');
const loansRoutes = require('./routes/loans');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// CORS setup for Vercel frontend with credentials
app.use(cors({
    origin: 'https://zhumashbankk.vercel.app',
    credentials: true
}));

// Multer setup for file uploads (in memory for now)
const upload = multer({ storage: multer.memoryStorage() });

// Gemini Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Log API Key status
if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY не установлен в .env файле');
} else {
    console.log('✅ GEMINI_API_KEY загружен (первые 20 символов):', process.env.GEMINI_API_KEY.substring(0, 20) + '...');
}

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---

// Register
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error("Registration Error:", error);

        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Пользователь с таким Email уже существует' });
        }

        res.status(500).json({ error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// --- LOANS ROUTES ---
app.use('/api/loans', authenticateToken, loansRoutes);

// --- DASHBOARD ROUTES ---

app.get('/api/dashboard', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 50
        });

        const allTransactions = await prisma.transaction.findMany({ where: { userId } });

        const income = allTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = allTransactions.filter(t => t.type === 'expense');
        const expense = expenses.reduce((sum, t) => sum + t.amount, 0);

        const balance = income - expense;

        const categoryMap = {};
        expenses.forEach(t => {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        });
        const categoryStats = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

        const budget = await prisma.budget.findFirst({
            where: { userId },
            orderBy: { id: 'desc' }
        });

        res.json({
            balance,
            income,
            expense,
            budget: budget ? budget.amount : 0,
            recentTransactions: transactions,
            categoryStats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

app.delete('/api/transactions', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        await prisma.transaction.deleteMany({
            where: { userId }
        });
        res.json({ message: 'All transactions deleted successfully' });
    } catch (error) {
        console.error('Failed to clear transactions:', error);
        res.status(500).json({ error: 'Failed to clear transactions' });
    }
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({ error: 'Invalid transaction ID' });
    }

    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: parseInt(id) }
        });

        if (!transaction || transaction.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized to delete this transaction' });
        }

        await prisma.transaction.delete({
            where: { id: parseInt(id) }
        });

        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
    const { amount, type, category, description } = req.body;
    const userId = req.user.userId;

    try {
        const transaction = await prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                type,
                category,
                description,
                userId
            }
        });

        if (type === 'expense') {
            const xpAmount = Math.min(Math.floor(amount / 100), 50);
            await gamification.addXp(userId, xpAmount, 'expense_logged', {
                category,
                amount
            });
            await gamification.checkAndUnlockAchievements(userId);
        }

        await gamification.updateStreak(userId);
        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ error: 'Failed to add transaction' });
    }
});

app.post('/api/budget', authenticateToken, async (req, res) => {
    const { amount } = req.body;
    const userId = req.user.userId;
    try {
        const budget = await prisma.budget.create({
            data: {
                amount: parseFloat(amount),
                month: new Date().toISOString().slice(0, 7),
                userId
            }
        });

        await gamification.unlockAchievement(userId, 'first_budget');
        res.status(201).json(budget);
    } catch (error) {
        res.status(400).json({ error: 'Failed to set budget' });
    }
});

// --- AI File Analysis (Бронебойная версия ПРЯМО В GEMINI) ---
app.post('/api/upload-statement', authenticateToken, upload.single('file'), async (req, res) => {
    console.log('--- START UPLOAD STATEMENT DIRECT TO GEMINI ---');

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не загружен' });
        }

        console.log('📄 Получен файл:', req.file.originalname, 'Размер:', req.file.size);

        const mimeType = req.file.mimetype;
        const isPdf = mimeType === 'application/pdf';
        const isImage = mimeType.startsWith('image/');

        if (!isPdf && !isImage) {
            return res.status(400).json({ error: 'Поддерживаются только PDF или изображения (JPG, PNG)' });
        }

        const filePart = {
            inlineData: {
                data: req.file.buffer.toString('base64'),
                mimeType: mimeType
            },
        };

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
        Ты - финансовый аналитик. Проанализируй этот документ (банковскую выписку).
        Извлеки ВСЕ транзакции.
        
        Верни ТОЛЬКО валидный JSON массив (без markdown, без слова json):
        [
            {
                "date": "YYYY-MM-DD",
                "amount": число (только цифры),
                "type": "income" или "expense",
                "category": "Выбери из: [Salary, Freelance, Investment, Gift, Food & Dining, Transport, Utilities, Entertainment, Shopping, Healthcare, Education, Other]",
                "description": "Название магазина или описание"
            }
        ]
        `;

        console.log('🚀 Отправляем файл в Gemini Flash Latest...');
        const result = await model.generateContent([prompt, filePart]);
        const response = await result.response;
        let textResponse = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        const jsonStart = textResponse.indexOf('[');
        const jsonEnd = textResponse.lastIndexOf(']');
        if (jsonStart !== -1 && jsonEnd !== -1) {
            textResponse = textResponse.substring(jsonStart, jsonEnd + 1);
        }

        const transactions = JSON.parse(textResponse);
        console.log(`✅ Успешно! Найдено ${transactions.length} транзакций.`);

        res.json({ transactions });

    } catch (error) {
        console.error('❌ Ошибка анализа файла:', error);
        res.status(500).json({
            error: 'Ошибка обработки файла нейросетью. Попробуйте скриншот или другой PDF.',
            details: error.message
        });
    }
});



// --- AI ADVISOR ROUTE ---
app.get('/api/ai/advisor', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { lang = 'en' } = req.query;

    try {
        // 1. Получаем данные из базы (Ваш оригинальный код)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [transactions, budget] = await Promise.all([
            prisma.transaction.findMany({
                where: { userId, date: { gte: startOfMonth } },
                orderBy: { date: 'desc' }
            }),
            prisma.budget.findFirst({
                where: { userId },
                orderBy: { id: 'desc' }
            })
        ]);

        const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const categories = {};
        transactions.filter(t => t.type === 'expense').forEach(t => {
            categories[t.category] = (categories[t.category] || 0) + t.amount;
        });

        // 2. ПРОВЕРКА КЛЮЧА
        // Если ключа нет — вернет демо-режим. Если ключ есть — этот блок пропустится.
        if (!process.env.GEMINI_API_KEY) {
            console.log('⚠️ GEMINI_API_KEY not configured. Using fallback advice.');
            return res.json({
                insights: ['Please configure API Key in .env file'],
                forecast: 'No API Key',
                summary: 'Demo mode'
            });
        }

        // 3. ЗАПУСК AI С НОВЫМ КЛЮЧОМ
        // Важно: инициализируем здесь, чтобы точно взялся новый ключ
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Используем актуальную модель gemini-1.5-flash
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
            You are a smart financial advisor. 
            Current month data: 
            - Income: ${income}
            - Expense: ${expense}
            - Budget: ${budget ? budget.amount : 'Not set'}
            - Categories: ${JSON.stringify(categories)}
            
            Respond in ${lang === 'ru' ? 'Russian' : lang === 'kz' ? 'Kazakh' : 'English'}.
            
            RETURN ONLY A JSON OBJECT (no markdown, no quotes around the block):
            { "insights": ["tip1", "tip2", "tip3"], "forecast": "prediction", "summary": "state" }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;

        // Чистим ответ от лишних символов
        let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        res.json(JSON.parse(text));

    } catch (error) {
        console.error('❌ Advisor Error Details:', error);
        // Если ошибка API (например, опять заблокировали), вернем заглушку, чтобы сайт не упал
        res.status(200).json({
            insights: [
                'AI Advisor is temporarily unavailable',
                'Please check your API Key',
                error.message || 'Unknown error'
            ],
            forecast: 'Unable to generate forecast',
            summary: 'System switched to offline mode.'
        });
    }
});

// --- AI CHAT ROUTE ---
app.post('/api/ai/chat', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { message, history = [], lang = 'en' } = req.body;

    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.json({ reply: "AI is offline (No API Key configured)." });
        }

        const recentTransactions = await prisma.transaction.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 20
        });

        // Инициализация AI с новым ключом
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const context = `
        Context: You are a helpful financial assistant for ZhumashBank.
        User's recent transactions: ${JSON.stringify(recentTransactions)}
        
        Respond in ${lang === 'ru' ? 'Russian' : lang === 'kz' ? 'Kazakh' : 'English'}.
        User Message: "${message}"
        `;

        // Создаем чат, но фильтруем историю, чтобы не было ошибок формата
        const chat = model.startChat({
            history: history.map(h => ({
                role: h.role === 'ai' ? 'model' : 'user', // Gemini требует роль 'model', а не 'ai'
                parts: [{ text: h.content || h.parts?.[0]?.text || "" }]
            })).slice(-10) // Берем последние 10 сообщений
        });

        const result = await chat.sendMessage(context);
        const response = await result.response;

        res.json({ reply: response.text() });

    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ reply: "Sorry, I am having trouble connecting to the AI right now." });
    }
});

app.get('/api/ai/investments', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { lang = 'en', currency = 'USD' } = req.query;

    try {
        const allTransactions = await prisma.transaction.findMany({ where: { userId } });
        const income = allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expense;

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `
        You are a high-end financial & investment advisor. 
        User Data: Balance: ${balance}, Total Income: ${income}, Total Expenses: ${expense}.
        All amounts provided above are in ${currency}.
        The user has a surplus/savings of ${balance} ${currency}. 
        
        Strict Requirements:
        1. Mandatory Stock Suggestions: You MUST suggest 2-3 specific, real-world stocks or ETFs suitable for this budget.
        2. Concrete Allocation Plan: Explain exactly how much of the ${balance} ${currency} should be invested in each suggestion and how much should be kept as a "safety cushion".
        3. Risk/Reward Forecast: For each recommendation, provide a specific forecast of potential annual profit (%) and potential drawdown/loss (%).
        4. Currency: All your financial advice, plans, and amounts MUST be expressed in ${currency}.
        5. Target Language: ${lang === 'ru' ? 'Russian' : lang === 'kz' ? 'Kazakh' : 'English'}.
        
        Return ONLY a JSON object:
        { 
          "investmentScore": 0-100, 
          "recommendations": [
            { 
              "title": "Exact Asset Name", 
              "description": "Explanation + Allocation: invest X amount in ${currency}. Profit: +Y%, Risk: -Z%.", 
              "type": "Stock/ETF/Crypto/Bond" 
            }
          ], 
          "businessIdeas": ["specific idea with startup cost in ${currency}"], 
          "analysis": "Mathematical breakdown of why this plan fits the balance of ${balance} ${currency}." 
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        res.json(JSON.parse(text));
    } catch (error) {
        console.error('Investment Error:', error);
        res.status(500).json({ error: 'Investments unavailable' });
    }
});

app.post('/api/ai/simulate', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { scenario, lang = 'en', currency = 'USD' } = req.body;

    try {
        const allTransactions = await prisma.transaction.findMany({ where: { userId } });
        const income = allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const expense = allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const balance = income - expense;

        const now = new Date();
        const currentMonth = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `
        You are a financial projection engine. 
        TODAY'S DATE: ${currentMonth} (${now.getFullYear()})
        Current State: Balance: ${balance}, Monthly Income: ${income}, Monthly Expenses: ${expense}, Currency: ${currency}.
        User Scenario: "${scenario}"
        
        Task: 
        Project the user's monthly balance for the next 60 months (5 years) STARTING FROM ${currentMonth}.
        Start the projection from the CURRENT MONTH: ${now.getMonth() + 1}/${now.getFullYear()}.
        Generate 60 consecutive months starting from now.
        Consider inflation, interest rates, and the specific events described in the scenario.
        
        IMPORTANT: 
        - First entry should be "${monthNames[now.getMonth()]} ${now.getFullYear()}"
        - Generate ALL 60 months sequentially with correct month and year progression
        
        Return ONLY a JSON object with this exact structure:
        {
          "projectedData": [
            { "month": "MonthName Year", "balance": number }, 
            ... 60 entries ...
          ],
          "milestones": [
            { "month": "MonthName Year", "title": "Short title", "description": "Explanation of event" }
          ],
          "summary": "AI summary of the scenario in ${lang === 'ru' ? 'Russian' : lang === 'kz' ? 'Kazakh' : 'English'}."
        }
        
        Language: ${lang === 'ru' ? 'Russian' : lang === 'kz' ? 'Kazakh' : 'English'}.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        res.json(JSON.parse(text));
    } catch (error) {
        console.error('Simulation Error:', error);
        res.status(500).json({ error: 'Simulation unavailable' });
    }
});

app.post('/api/transactions/batch', authenticateToken, async (req, res) => {
    const { transactions } = req.body;
    const userId = req.user.userId;
    try {
        const data = transactions.map(t => ({ ...t, userId, amount: parseFloat(t.amount), date: new Date(t.date) }));
        await prisma.transaction.createMany({ data });
        res.json({ message: 'Success' });
    } catch (error) {
        res.status(500).json({ error: 'Batch failed' });
    }
});

// --- RECEIPT SCANNER ENDPOINTS ---

app.post('/api/receipts/scan', authenticateToken, upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded' });
    }

    try {
        const userId = req.user.userId;

        const buffer = await sharp(req.file.buffer)
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
            .toBuffer();

        const ocrResult = await Tesseract.recognize(buffer, 'eng+rus+kaz', {
            logger: m => console.log('OCR Progress:', m.progress)
        });

        const ocrText = ocrResult.data.text;

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `
        This is an OCR text from a receipt or invoice. Extract the following information.
        
        OCR Text:
        ${ocrText}
        
        Return ONLY valid JSON (no markdown, no extra text):
        {
          "storeName": "store name or null",
          "total_amount": number (just the amount, currency will be added),
          "date": "YYYY-MM-DD" or null,
          "category": "Grocery|Food|Transport|Entertainment|Shopping|Healthcare|Education|Utilities|Other",
          "confidence": 0.0-1.0,
          "items": [
            {"name": "item name", "price": number, "quantity": 1}
          ] or null
        }
        `;

        const geminiResult = await model.generateContent(prompt);
        const geminiText = geminiResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        let parsedData;
        try {
            parsedData = JSON.parse(geminiText);
        } catch (e) {
            parsedData = {
                storeName: null, total_amount: 0, date: null, category: 'Other', confidence: 0.5, items: null
            };
        }

        const receipt = await prisma.receipt.create({
            data: {
                userId,
                photoUrl: `receipt_${Date.now()}.jpg`,
                storeName: parsedData.storeName,
                recognizedAmount: parsedData.total_amount || 0,
                recognizedDate: parsedData.date ? new Date(parsedData.date) : null,
                recognizedCategory: parsedData.category,
                confidence: parsedData.confidence || 0.5,
                rawOcrText: ocrText.substring(0, 5000),
                itemsJson: parsedData.items ? JSON.stringify(parsedData.items) : null
            }
        });

        const xpReward = 25 + Math.round(parsedData.confidence * 25);
        await gamification.addXp(userId, xpReward, 'receipt_scanned', {
            storeName: parsedData.storeName, amount: parsedData.total_amount, confidence: parsedData.confidence
        });

        await gamification.unlockAchievement(userId, 'first_receipt');
        await gamification.checkAndUnlockAchievements(userId);

        res.json({
            success: true,
            receipt: {
                id: receipt.id, storeName: parsedData.storeName, amount: parsedData.total_amount,
                date: parsedData.date, category: parsedData.category, confidence: parsedData.confidence,
                items: parsedData.items
            }
        });

    } catch (error) {
        console.error('Receipt Scan Error:', error);
        res.status(500).json({ error: 'Failed to scan receipt' });
    }
});

app.post('/api/receipts/:receiptId/confirm', authenticateToken, async (req, res) => {
    try {
        const { receiptId } = req.params;
        const { amount, category, date, description } = req.body;
        const userId = req.user.userId;

        const receipt = await prisma.receipt.findUnique({ where: { id: parseInt(receiptId) } });

        if (!receipt || receipt.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const transaction = await prisma.transaction.create({
            data: {
                userId, amount: parseFloat(amount), type: 'expense', category,
                description: description || receipt.storeName,
                date: new Date(date), receiptId: parseInt(receiptId)
            }
        });

        if (amount !== receipt.recognizedAmount || category !== receipt.recognizedCategory) {
            await prisma.receipt.update({
                where: { id: parseInt(receiptId) }, data: { manuallyEdited: true }
            });
        }

        res.json({ success: true, transactionId: transaction.id });
    } catch (error) {
        console.error('Receipt Confirm Error:', error);
        res.status(500).json({ error: 'Failed to confirm receipt' });
    }
});

app.get('/api/receipts', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const receipts = await prisma.receipt.findMany({
            where: { userId }, orderBy: { createdAt: 'desc' }, take: 50
        });

        res.json(receipts.map(r => ({ ...r, items: r.itemsJson ? JSON.parse(r.itemsJson) : null })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch receipts' });
    }
});

// --- ANOMALY DETECTION ENDPOINTS ---

app.post('/api/anomalies/check', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { transactionId } = req.body;

        const transaction = await prisma.transaction.findUnique({ where: { id: parseInt(transactionId) } });

        if (!transaction || transaction.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const history = await prisma.transaction.findMany({
            where: { userId, category: transaction.category, date: { gte: thirtyDaysAgo }, id: { not: transaction.id } }
        });

        if (history.length < 3) return res.json({ anomaly: false, reason: 'Not enough history' });

        const amounts = history.map(t => t.amount);
        const mean = amounts.reduce((a, b) => a + b) / amounts.length;
        const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2)) / amounts.length;
        const stdDev = Math.sqrt(variance);

        const zScore = (transaction.amount - mean) / stdDev;
        const isAnomaly = Math.abs(zScore) > 2;

        if (isAnomaly) {
            const percentageDiff = ((transaction.amount - mean) / mean * 100).toFixed(0);

            const alert = await prisma.alert.create({
                data: {
                    userId, type: 'SPIKE', category: transaction.category,
                    title: `${transaction.category}: +${Math.abs(percentageDiff)}% from normal`,
                    description: `Usually ${mean.toFixed(0)}, spent ${transaction.amount}`,
                    severity: Math.abs(zScore) > 3 ? 'high' : 'medium',
                    normalValue: mean, actualValue: transaction.amount, percentageDiff: parseFloat(percentageDiff),
                    recommendations: JSON.stringify([
                        'Was this planned?', 'Consider reducing spending in this category',
                        `You could save ${(transaction.amount - mean).toFixed(0)} if you reduce to average`
                    ])
                }
            });

            const xpReward = Math.abs(zScore) > 3 ? 75 : 50;
            await gamification.addXp(userId, xpReward, 'anomaly_detected', {
                category: transaction.category, severity: alert.severity, zScore
            });

            await gamification.unlockAchievement(userId, 'first_alert');
            return res.json({ anomaly: true, alert });
        }
        res.json({ anomaly: false });
    } catch (error) {
        console.error('Anomaly Check Error:', error);
        res.status(500).json({ error: 'Failed to check anomalies' });
    }
});

app.get('/api/anomalies/alerts', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const alerts = await prisma.alert.findMany({
            where: { userId }, orderBy: { createdAt: 'desc' }, take: 50
        });
        res.json(alerts.map(a => ({ ...a, recommendations: a.recommendations ? JSON.parse(a.recommendations) : [] })));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

// ========== GAMIFICATION ROUTES ==========

app.get('/api/gamification/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const gameProfile = await prisma.userGamification.findUnique({
            where: { userId },
            include: { achievements: { include: { achievement: true }, orderBy: { unlockedAt: 'desc' } } }
        });

        if (!gameProfile) {
            await gamification.initializeUserGamification(userId);
            const newProfile = await prisma.userGamification.findUnique({ where: { userId } });
            return res.json(newProfile);
        }

        res.json({
            ...gameProfile,
            levelInfo: gamification.LEVELS[gameProfile.level - 1],
            nextLevelXp: gamification.LEVELS[gameProfile.level] || null,
            petInfo: { emoji: gameProfile.petType, happiness: gameProfile.petHappiness }
        });
    } catch (error) {
        console.error('Error fetching gamification profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

app.post('/api/gamification/xp', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { amount, reason } = req.body;
        const result = await gamification.addXp(userId, amount, reason || 'manual');
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error adding XP:', error);
        res.status(500).json({ error: 'Failed to add XP' });
    }
});

app.post('/api/gamification/check-achievements', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const unlocked = await gamification.checkAndUnlockAchievements(userId);
        res.json({ success: true, unlockedAchievements: unlocked });
    } catch (error) {
        console.error('Error checking achievements:', error);
        res.status(500).json({ error: 'Failed to check achievements' });
    }
});

app.get('/api/gamification/achievements', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const allAchievements = await prisma.achievement.findMany();
        const userAchievements = await prisma.userAchievement.findMany({ where: { userId } });
        const userAchievementIds = new Set(userAchievements.map(a => a.achievementId));

        const achievements = allAchievements.map(ach => ({
            ...ach,
            unlocked: userAchievementIds.has(ach.id),
            unlockedAt: userAchievements.find(ua => ua.achievementId === ach.id)?.unlockedAt
        }));

        res.json({ total: achievements.length, unlocked: userAchievements.length, achievements });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ error: 'Failed to fetch achievements' });
    }
});

app.post('/api/gamification/streak', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await gamification.updateStreak(userId);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error updating streak:', error);
        res.status(500).json({ error: 'Failed to update streak' });
    }
});

app.post('/api/gamification/pet/feed', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await gamification.feedPet(userId);
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Error feeding pet:', error);
        res.status(500).json({ error: 'Failed to feed pet' });
    }
});

app.get('/api/gamification/leaderboard', authenticateToken, async (req, res) => {
    try {
        const type = req.query.type || 'global_xp';
        let leaderboard = await prisma.leaderboard.findUnique({ where: { type } });

        if (!leaderboard) {
            await gamification.updateLeaderboards();
            leaderboard = await prisma.leaderboard.findUnique({ where: { type } });
        }

        res.json({ type, entries: leaderboard ? JSON.parse(leaderboard.entriesJson) : [] });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    prisma.achievement.findMany().then(achievements => {
        if (achievements.length === 0) {
            console.log('Initializing achievements...');
            Promise.all(
                gamification.ACHIEVEMENTS_DB.map(ach =>
                    prisma.achievement.create({ data: ach }).catch(() => null)
                )
            ).then(() => console.log('Achievements initialized'));
        }
    });
});