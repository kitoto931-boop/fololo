/**
 * RSS Service ELITE - Parser de RSS feeds
 */

import { XMLParser } from 'fast-xml-parser';
import logger from '../utils/logger.js';

const RSS_FEEDS = [
  { name: 'glonfo', url: 'https://glonfo.com/feed/' },
  { name: 'flavornectar', url: 'https://flavornectar.com/feed/' },
  { name: 'recipessin', url: 'https://www.recipessin.com/feed/' },
  { name: 'melissarecipes', url: 'https://melissarecipes.com/feed/' },
  { name: 'recipesbyaria', url: 'https://recipesbyaria.com/feed/' }
];

const parser = new XMLParser({ ignoreAttributes: false });

/**
 * Fetch y parsea un RSS feed
 */
export async function fetchFeed(feed) {
  try {
    const response = await fetch(feed.url, {
      headers: {
        'User-Agent': 'RecipeScraperElite/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const xml = await response.text();
    const result = parser.parse(xml);
    
    const channel = result.rss?.channel || result.feed;
    const items = channel?.item || channel?.entry || [];
    const itemArray = Array.isArray(items) ? items : [items];
    
    const recipes = itemArray.slice(0, 20).map(item => ({
      title: item.title || '',
      link: item.link?.['@_href'] || item.link || '',
      sourceName: feed.name
    })).filter(item => item.title && item.link);
    
    logger.info(`📡 ${feed.name}: ${recipes.length} items`);
    return recipes;
    
  } catch (error) {
    logger.error(`RSS error (${feed.name}): ${error.message}`);
    return [];
  }
}

/**
 * Fetch todos los RSS feeds
 */
export async function fetchAllFeeds() {
  const results = await Promise.all(RSS_FEEDS.map(fetchFeed));
  return results.flat();
}

export { RSS_FEEDS };
export default { fetchFeed, fetchAllFeeds, RSS_FEEDS };
