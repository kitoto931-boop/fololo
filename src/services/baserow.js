/**
 * Baserow Service ELITE - Cliente para Baserow API
 */

import logger from '../utils/logger.js';
import { normalizeUrl } from '../utils/helpers.js';

const CONFIG = {
  url: process.env.BASEROW_URL || 'https://baserow.kaliman.io',
  token: process.env.BASEROW_TOKEN || '',
  tableId: process.env.BASEROW_TABLE_ID || '2'
};

/**
 * Guarda una receta en Baserow
 */
export async function saveRecipe(recipe) {
  const endpoint = `${CONFIG.url}/api/database/rows/table/${CONFIG.tableId}/?user_field_names=true`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${CONFIG.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'Focus keyword': recipe.focusKeyword || '',
      'Full Recipe': recipe.fullRecipe || '',
      'PAA': recipe.paa || '',
      'URL image': recipe.imageUrl || '',
      'Date Added': new Date().toISOString().split('T')[0]
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Baserow save error: ${response.status} - ${error}`);
  }
  
  const result = await response.json();
  logger.save(`Saved recipe: ${recipe.focusKeyword} (ID: ${result.id})`);
  return result;
}

/**
 * Verifica si una URL ya existe en Baserow
 */
export async function isDuplicate(url) {
  try {
    const normalized = normalizeUrl(url);
    const endpoint = `${CONFIG.url}/api/database/rows/table/${CONFIG.tableId}/?user_field_names=true&search=${encodeURIComponent(normalized)}`;
    
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Token ${CONFIG.token}`
      }
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.count > 0;
  } catch (error) {
    logger.warn(`Duplicate check failed: ${error.message}`);
    return false;
  }
}

/**
 * Obtiene estadísticas de la tabla
 */
export async function getStats() {
  try {
    const endpoint = `${CONFIG.url}/api/database/rows/table/${CONFIG.tableId}/?user_field_names=true&size=1`;
    
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Token ${CONFIG.token}`
      }
    });
    
    if (!response.ok) return { count: 0, error: true };
    
    const data = await response.json();
    return { count: data.count, error: false };
  } catch {
    return { count: 0, error: true };
  }
}

/**
 * Health check de Baserow
 */
export async function checkHealth() {
  try {
    const stats = await getStats();
    return !stats.error;
  } catch {
    return false;
  }
}

export default { saveRecipe, isDuplicate, getStats, checkHealth };
