import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');

app.use(cors());
app.use(express.json());

// Basic health check and environment verification
if (!process.env.GEMINI_API_KEY) console.warn("WARN: GEMINI_API_KEY is missing in .env");
if (!process.env.RESEND_API_KEY) console.warn("WARN: RESEND_API_KEY is missing in .env");

app.get('/', (req, res) => {
    res.send('OkokTechie Backend is running');
});

const openai = new OpenAI({ 
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/'
});

// Streaming chat endpoint
app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;
    try {
        const stream = await openai.chat.completions.create({
            model: 'gemini-2.5-flash',
            messages: [
                { role: 'system', content: 'You are an intelligent technical requirement gatherer. Ask one specific question at a time to refine the user\'s software requirement. Once clear, output the technical overview starting with the keyword SUMMARY_GENERATED.' },
                ...messages
            ],
            stream: true,
        });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/finalize-requirements', async (req, res) => {
    const { clientId, projectId, chatHistory, summary } = req.body;

    try {
        // 1. Save to Company Dashboard (Database)
        const requirement = await prisma.requirement.create({
            data: {
                projectId: projectId || `PRJ-${Date.now()}`,
                clientId: clientId || 'client123',
                details: summary,
                fullLog: JSON.stringify(chatHistory),
                status: 'NEW'
            }
        });

        // 2. Send Email to Client
        if (process.env.RESEND_API_KEY) {
            await resend.emails.send({
                from: 'OkokTechie <onboarding@resend.dev>',
                to: req.body.email || 'client@example.com',
                subject: 'Requirement Confirmed - ' + requirement.projectId,
                html: `<h3>Summary of your request:</h3><p>${summary}</p>`
            });
        }

        res.status(200).json({ success: true, message: "Dashboard updated and email sent.", requirement });
    } catch (error) {
        console.error('Error finalizing requirements:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET endpoint for the Company Dashboard
app.get('/api/requirements', async (req, res) => {
    try {
        const requirements = await prisma.requirement.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(requirements);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch requirements" });
    }
});

// PATCH endpoint to update status (e.g., from 'NEW' to 'REVIEWED')
app.patch('/api/requirements/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const updated = await prisma.requirement.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: "Update failed" });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
