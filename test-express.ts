import express from 'express';

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Express is working');
});

try {
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`Express server running on http://localhost:${PORT}`);
    });

    server.on('error', (e) => {
        console.error('Server error event:', e);
    });

} catch (e) {
    console.error('Catch block error:', e);
}

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});
