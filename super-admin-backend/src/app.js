const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const tenantsRouter = require('./routes/tenants');
const authRouter = require('./routes/auth');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/tenants', tenantsRouter);

app.use((req, res) => res.status(404).json({ message: 'Not Found' }));
app.use((err, _req, res, _next) => res.status(err.status || 500).json({ message: err.message || 'Server error' }));

module.exports = app;
