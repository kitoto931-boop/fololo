/**
 * Helpers ELITE - Utilidades generales
 */

/**
 * Limpia texto HTML
 */
export function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normaliza URL para comparación
 */
export function normalizeUrl(url) {
  try {
    const parsed = new URL(url);
    let host = parsed.hostname.replace(/^www\./, '');
    return (host + parsed.pathname).replace(/\/$/, '').toLowerCase();
  } catch {
    return url.toLowerCase().replace(/\/$/, '');
  }
}

/**
 * Extrae slug de URL
 */
export function extractSlugFromUrl(url) {
  try {
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1]?.replace(/\.html?$/i, '') || '';
  } catch {
    return '';
  }
}

/**
 * Extrae focus keyword inteligente
 */
export function extractKeyword(title, url) {
  const STOP_WORDS = [
    'easy', 'quick', 'simple', 'best', 'perfect', 'amazing', 'delicious',
    'ultimate', 'classic', 'homemade', 'recipe', 'recipes', 'the', 'and',
    'how', 'to', 'make', 'minute', 'minutes', 'instant', 'fast', 'super'
  ];
  
  const source = title || extractSlugFromUrl(url);
  
  const words = source
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.includes(w))
    .slice(0, 4);
  
  return words
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || 'Recipe';
}

/**
 * Shuffle array (Fisher-Yates)
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Sleep helper
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry wrapper con backoff exponencial
 */
export async function retry(fn, maxAttempts = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(delay * attempt);
      }
    }
  }
  
  throw lastError;
}

/**
 * Parsea duración ISO 8601
 */
export function parseDuration(duration) {
  if (!duration) return '';
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  
  if (hours && minutes) return `${hours}h ${minutes}min`;
  if (hours) return `${hours}h`;
  if (minutes) return `${minutes}min`;
  return duration;
}

/**
 * Formatea nutrición
 */
export function formatNutrition(nutrition) {
  if (!nutrition) return '';
  const parts = [];
  if (nutrition.calories) parts.push(`Calorías: ${nutrition.calories}`);
  if (nutrition.proteinContent) parts.push(`Proteínas: ${nutrition.proteinContent}`);
  if (nutrition.carbohydrateContent) parts.push(`Carbohidratos: ${nutrition.carbohydrateContent}`);
  if (nutrition.fatContent) parts.push(`Grasas: ${nutrition.fatContent}`);
  return parts.join(' | ');
}