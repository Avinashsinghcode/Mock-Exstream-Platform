import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

app.use(express.json());

const DB_DIR = path.join(process.cwd(), 'database');
const DB_FILE = path.join(DB_DIR, 'db.json');
const SEED_FILE = path.join(DB_DIR, 'seed_db.json');

if (!fs.existsSync(DB_FILE) && fs.existsSync(SEED_FILE)) {
    fs.copyFileSync(SEED_FILE, DB_FILE);
}

function readDB() {
    if (!fs.existsSync(DB_FILE)) return [];
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
}

function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/failed-jobs', (req, res) => {
    const { policyNumber, symbol, policy, mod, docType, policyDate, all } = req.query;
    let jobs = readDB();
    jobs = jobs.filter((job) => job.status === 'FAILED');
    if (all !== 'true') {
        if (policyNumber) jobs = jobs.filter((job) => job.policyNumber.includes(policyNumber));
        if (symbol) jobs = jobs.filter((job) => job.symbol.includes(symbol));
        if (policy) jobs = jobs.filter((job) => job.boundPolicy.includes(policy) || job.quotePolicy.includes(policy));
        if (mod) jobs = jobs.filter((job) => job.mod === mod);
        if (docType && docType !== 'Select an option') jobs = jobs.filter((job) => job.documentType === docType);
        if (policyDate) jobs = jobs.filter((job) => job.dateTime.startsWith(policyDate));
    }
    res.json(jobs.slice(0, 1000));
});

app.post('/api/regenerate', (req, res) => {
    const { jobIds } = req.body;
    if (!Array.isArray(jobIds)) return res.status(400).json({ error: 'jobIds must be an array' });
    const jobs = readDB();
    const results = [];
    const now = new Date().toISOString();
    for (const jobId of jobIds) {
        const jobIndex = jobs.findIndex((j) => j.id === jobId);
        if (jobIndex !== -1) {
            const job = jobs[jobIndex];
            if (job._correctMod) {
                job.status = 'RESOLVED';
                job.resultMessage = 'Document regenerated successfully';
            } else {
                job.status = 'ERROR';
                job.resultMessage = 'Error creating PDF';
            }
            job.processedTime = now;
            results.push({ id: job.id, boundPolicy: job.boundPolicy, quotePolicy: job.quotePolicy, documentType: job.documentType, result: job.resultMessage });
        }
    }
    writeDB(jobs);
    res.json({ success: true, results });
});

app.post('/api/reset-database', (req, res) => {
    if (fs.existsSync(SEED_FILE)) {
        fs.copyFileSync(SEED_FILE, DB_FILE);
        res.json({ success: true, message: 'Database reset successfully' });
    } else {
        res.status(500).json({ error: 'Seed file not found' });
    }
});

async function startServer() {
    try {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (e) {
        console.error('SERVER INIT ERROR:', e);
    }
}

startServer();
