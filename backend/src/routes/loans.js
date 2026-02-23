const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/loans
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId; // Provided by authenticateToken middleware in server.js
        const loans = await prisma.loan.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(loans);
    } catch (error) {
        console.error('Error fetching loans:', error);
        res.status(500).json({ error: 'Failed to fetch loans' });
    }
});

// POST /api/loans
router.post('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, amount, interestRate, termMonths, monthlyPayment, reason, aiEvaluation } = req.body;

        const loan = await prisma.loan.create({
            data: {
                userId,
                name,
                amount: parseFloat(amount),
                interestRate: parseFloat(interestRate),
                termMonths: parseInt(termMonths),
                monthlyPayment: parseFloat(monthlyPayment),
                reason,
                aiEvaluation
            }
        });

        res.status(201).json(loan);
    } catch (error) {
        console.error('Error creating loan:', error);
        res.status(500).json({ error: 'Failed to create loan' });
    }
});

// POST /api/loans/evaluate
router.post('/evaluate', async (req, res) => {
    try {
        const { reason, amount, lang = 'en' } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.json({
                evaluation: "Good reason (Offline mode)",
                isGood: true
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const languageMap = {
            'ru': 'Russian',
            'kz': 'Kazakh',
            'en': 'English'
        };
        const targetLanguage = languageMap[lang] || 'English';

        const prompt = `
        You are a strict but fair financial advisor. 
        A user wants to take a loan of ${amount} currency.
        Their reason for taking the loan is: "${reason}".
        
        Evaluate this reason. Is it a good financial decision (like investing in a business, education, or an essential asset like a home) or a bad one (like buying the latest iPhone, a luxury vacation, or consumer debt)?
        
        Respond ONLY with a JSON object.
        {
          "isGood": true or false,
          "evaluation": "Explain specifically why this is a good or bad reason and provide advice. If it's a bad reason, tell them explicitly that it is a bad reason to take a loan. Respond in ${targetLanguage}."
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        res.json(JSON.parse(text));
    } catch (error) {
        console.error('Error evaluating loan reason:', error);
        res.status(500).json({ error: 'Failed to evaluate loan reason' });
    }
});

// GET /api/loans/quote
router.get('/quote', async (req, res) => {
    try {
        const { lang = 'en' } = req.query;

        if (!process.env.GEMINI_API_KEY) {
            return res.json({ quote: "A penny saved is a penny earned." });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const languageMap = {
            'ru': 'Russian',
            'kz': 'Kazakh',
            'en': 'English'
        };
        const targetLanguage = languageMap[lang] || 'English';

        const prompt = `
        You are an inspiring financial coach.
        Provide a short, powerful, daily motivational quote (1-2 sentences) about paying off debt, achieving financial freedom, or smart money management.
        The quote must be in ${targetLanguage}.
        
        Return ONLY a JSON object:
        { "quote": "The quote text here" }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();

        res.json(JSON.parse(text));
    } catch (error) {
        console.error('Error generating quote:', error);
        res.status(500).json({ error: 'Failed to generate quote' });
    }
});

module.exports = router;
