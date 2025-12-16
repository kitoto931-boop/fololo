/**
 * Browserless Service ELITE - Cliente para Browserless API
 */

import logger from '../utils/logger.js';
import { retry, sleep } from '../utils/helpers.js';

const CONFIG = {
  url: process.env.BROWSERLESS_URL || 'http://localhost:3000',
  token: process.env.BROWSERLESS_TOKEN || '',
  timeout: 30000,
  waitFor: 2000,
  rateLimit: 2000
};

let lastRequest = 0;

/**
 * Rate limiting - espera entre requests
 */
async function rateLimiter() {
  const now = Date.now();
  const elapsed = now - lastRequest;
  if (elapsed < CONFIG.rateLimit) {
    await sleep(CONFIG.rateLimit - elapsed);
  }
  lastRequest = Date.now();
}

/**
 * Obtiene HTML renderizado de una URL
 */
export async function scrapeUrl(url) {
  await rateLimiter();
  
  const endpoint = `${CONFIG.url}/content?token=${CONFIG.token}`;
  
  return retry(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);
    
    try {
      logger.scrape(`Fetching: ${url}`);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          waitFor: CONFIG.waitFor,
          gotoOptions: {
            waitUntil: 'networkidle2',
            timeout: CONFIG.timeout
          }
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Browserless error: ${response.status}`);
      }
      
      const html = await response.text();
      
      if (!html || html.length < 500) {
        throw new Error('Empty or too short response');
      }
      
      logger.success(`Scraped ${html.length} chars from ${url}`);
      return html;
      
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }, 3, 2000);
}

/**
 * Health check de Browserless
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${CONFIG.url}/pressure?token=${CONFIG.token}`);
    return response.ok;
  } catch {
    return false;
  }
}

export default { scrapeUrl, checkHealth };
