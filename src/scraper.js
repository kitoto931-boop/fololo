/**
 * Scraper ELITE - Lógica principal de scraping
 */

import { scrapeUrl } from './services/browserless.js';
import { saveRecipe, isDuplicate } from './services/baserow.js';
import { fetchAllFeeds } from './services/rss.js';
import { extractRecipe } from './extractors/recipe.js';
import { shuffleArray, sleep } from './utils/helpers.js';
import logger from './utils/logger.js';

export const state = {
  isRunning: false,
  lastRun: null,
  lastResult: null,
  nextRun: null
};

export async function runScraper(limit = 8) {
  if (state.isRunning) {
    logger.warn('Scraper already running, skipping...');
    return { skipped: true };
  }
  
  state.isRunning = true;
  const startTime = Date.now();
  
  const results = {
    extracted: 0,
    duplicates: 0,
    errors: 0,
    duration: 0
  };
  
  try {
    logger.header('🚀 RECIPE SCRAPER ELITE - Starting extraction');
    
    logger.info('📡 Fetching RSS feeds...');
    const allRecipes = await fetchAllFeeds();
    logger.success(`Found ${allRecipes.length} recipe links from RSS feeds`);
    
    if (allRecipes.length === 0) {
      logger.warn('No recipes found in RSS feeds');
      return results;
    }
    
    const selected = shuffleArray(allRecipes).slice(0, limit);
    logger.info(`🎲 Selected ${selected.length} random recipes to process`);
    
    for (let i = 0; i < selected.length; i++) {
      const item = selected[i];
      logger.divider();
      logger.info(`[${i + 1}/${selected.length}] Processing: ${item.title}`);
      
      try {
        const duplicate = await isDuplicate(item.link);
        if (duplicate) {
          logger.warn(`⏭️ Duplicate found, skipping: ${item.link}`);
          results.duplicates++;
          continue;
        }
        
        const html = await scrapeUrl(item.link);
        const recipe = extractRecipe(html, item.link);
        
        if (!recipe) {
          logger.warn(`Could not extract recipe from: ${item.link}`);
          results.errors++;
          continue;
        }
        
        await saveRecipe(recipe);
        results.extracted++;
        await sleep(1500);
        
      } catch (error) {
        logger.error(`Error processing ${item.link}: ${error.message}`);
        results.errors++;
      }
    }
    
    results.duration = Math.round((Date.now() - startTime) / 1000);
    logger.summary(results);
    return results;
    
  } catch (error) {
    logger.error(`Scraper error: ${error.message}`);
    results.errors++;
    return results;
    
  } finally {
    state.isRunning = false;
    state.lastRun = new Date().toISOString();
    state.lastResult = results;
  }
}

export default { runScraper, state };
