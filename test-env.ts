import express from 'express';
import { createServer } from 'vite';

console.log('Express imported:', typeof express);
console.log('Vite createServer imported:', typeof createServer);

const app = express();
console.log('Express app created');

async function testVite() {
    try {
        const vite = await createServer({
            server: { middlewareMode: true },
            appType: 'spa'
        });
        console.log('Vite server created');
        process.exit(0);
    } catch (e) {
        console.error('Vite failed:', e);
        process.exit(1);
    }
}

testVite();
