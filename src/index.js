/**
 * Recipe Scraper ELITE PRO MAX
 * Servidor Express con cron scheduling
 */

import express from 'express';
import cron from 'node-cron';
import { runScraper, state } from './scraper.js';
import { checkHealth as checkBrowserless } from './services/browserless.js';
import { checkHealth as checkBaserow, getStats } from './services/baserow.js';
import logger from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3000;
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 */6 * * *';

app.use(express.json());

// Health check endpoint
app.get('/health', async (req, res) => {
  const [browserless, baserow] = await Promise.all([
    checkBrowserless(),
    checkBaserow()
  ]);
  
  const healthy = browserless && baserow;
  
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    services: {
      browserless: browserless ? 'ok' : 'error',
      baserow: baserow ? 'ok' : 'error'
    },
    scraper: {
      isRunning: state.isRunning,
      lastRun: state.lastRun,
      nextRun: state.nextRun
    },
    timestamp: new Date().toISOString()
  });
});

// Status endpoint
app.get('/status', async (req, res) => {
  const stats = await getStats();
  
  res.json({
    scraper: {
      isRunning: state.isRunning,
      lastRun: state.lastRun,
      lastResult: state.lastResult,
      nextRun: state.nextRun
    },
    database: {
      totalRecipes: stats.count
    },
    config: {
      cronSchedule: CRON_SCHEDULE
    },
    timestamp: new Date().toISOString()
  });
});

// Manual trigger endpoint
app.post('/trigger', async (req, res) => {
  const limit = parseInt(req.query.limit) || 8;
  
  if (state.isRunning) {
    return res.status(409).json({
      error: 'Scraper already running',
      lastRun: state.lastRun
    });
  }
  
  res.json({
    message: 'Scraper started',
    limit,
    timestamp: new Date().toISOString()
  });
  
  runScraper(limit);
});

// Last result endpoint
app.get('/result', (req, res) => {
  if (!state.lastResult) {
    return res.status(404).json({ error: 'No results yet' });
  }
  
  res.json({
    lastRun: state.lastRun,
    result: state.lastResult
  });
});

// Setup cron job
function setupCron() {
  if (!cron.validate(CRON_SCHEDULE)) {
    logger.error(`Invalid cron schedule: ${CRON_SCHEDULE}`);
    return;
  }
  
  cron.schedule(CRON_SCHEDULE, () => {
    logger.cron(`⏰ Cron triggered at ${new Date().toISOString()}`);
    runScraper(8);
  });
  
  state.nextRun = `Cron: ${CRON_SCHEDULE}`;
  logger.cron(`Cron scheduled: ${CRON_SCHEDULE}`);
}

// Start server
app.listen(PORT, () => {
  logger.header('🍳 RECIPE SCRAPER ELITE PRO MAX');
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  setupCron();
  
  logger.divider();
  logger.info('Endpoints:');
  logger.info('  GET  /health  - Health check');
  logger.info('  GET  /status  - Scraper status');
  logger.info('  POST /trigger - Manual trigger');
  logger.info('  GET  /result  - Last run result');
  logger.divider();
});

export default app;
