/**
 * Recipe Extractor ELITE - Extrae datos estructurados de recetas
 */

import { cleanText, extractKeyword, parseDuration, formatNutrition } from '../utils/helpers.js';
import logger from '../utils/logger.js';

/**
 * Extrae JSON-LD de una página HTML
 */
function extractJsonLd(html) {
  const scripts = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  
  for (const script of scripts) {
    try {
      const content = script.replace(/<\/?script[^>]*>/gi, '').trim();
      const data = JSON.parse(content);
      
      const items = Array.isArray(data) ? data : [data];
      
      for (const item of items) {
        if (item['@type'] === 'Recipe') return item;
        
        if (item['@graph']) {
          const recipe = item['@graph'].find(g => g['@type'] === 'Recipe');
          if (recipe) return recipe;
        }
      }
    } catch {
      continue;
    }
  }
  
  return null;
}

function formatIngredients(ingredients) {
  if (!ingredients) return '';
  const list = Array.isArray(ingredients) ? ingredients : [ingredients];
  return list.map(i => `• ${cleanText(i)}`).join('\n');
}

function formatInstructions(instructions) {
  if (!instructions) return '';
  
  let steps = [];
  
  if (Array.isArray(instructions)) {
    instructions.forEach((inst, idx) => {
      if (typeof inst === 'string') {
        steps.push(`${idx + 1}. ${cleanText(inst)}`);
      } else if (inst.text) {
        steps.push(`${idx + 1}. ${cleanText(inst.text)}`);
      } else if (inst['@type'] === 'HowToSection') {
        if (inst.name) steps.push(`\n**${inst.name}**`);
        if (inst.itemListElement) {
          inst.itemListElement.forEach((item, i) => {
            steps.push(`${i + 1}. ${cleanText(item.text || item)}`);
          });
        }
      }
    });
  } else if (typeof instructions === 'string') {
    steps = instructions.split(/\n+/).map((s, i) => `${i + 1}. ${cleanText(s)}`);
  }
  
  return steps.join('\n');
}

function extractImage(recipe) {
  const img = recipe.image;
  if (!img) return '';
  if (typeof img === 'string') return img;
  if (Array.isArray(img)) return img[0]?.url || img[0] || '';
  if (img.url) return img.url;
  return '';
}

function generateFullRecipe(recipe) {
  const parts = [];
  
  if (recipe.name) {
    parts.push(`# ${cleanText(recipe.name)}\n`);
  }
  
  if (recipe.description) {
    parts.push(`${cleanText(recipe.description)}\n`);
  }
  
  const info = [];
  if (recipe.prepTime) info.push(`⏱️ Prep: ${parseDuration(recipe.prepTime)}`);
  if (recipe.cookTime) info.push(`🔥 Cook: ${parseDuration(recipe.cookTime)}`);
  if (recipe.totalTime) info.push(`⏰ Total: ${parseDuration(recipe.totalTime)}`);
  if (recipe.recipeYield) info.push(`🍽️ Serves: ${recipe.recipeYield}`);
  if (info.length) parts.push(info.join(' | ') + '\n');
  
  const nutrition = formatNutrition(recipe.nutrition);
  if (nutrition) parts.push(`📊 ${nutrition}\n`);
  
  if (recipe.recipeIngredient) {
    parts.push(`## Ingredients\n${formatIngredients(recipe.recipeIngredient)}\n`);
  }
  
  if (recipe.recipeInstructions) {
    parts.push(`## Instructions\n${formatInstructions(recipe.recipeInstructions)}\n`);
  }
  
  if (recipe.recipeNotes) {
    parts.push(`## Notes\n${cleanText(recipe.recipeNotes)}\n`);
  }
  
  return parts.join('\n');
}

export function extractRecipe(html, sourceUrl) {
  const jsonLd = extractJsonLd(html);
  
  if (!jsonLd) {
    logger.warn(`No JSON-LD found for ${sourceUrl}`);
    return null;
  }
  
  const fullRecipe = generateFullRecipe(jsonLd);
  
  if (fullRecipe.length < 300) {
    logger.warn(`Recipe too short (${fullRecipe.length} chars): ${sourceUrl}`);
    return null;
  }
  
  return {
    focusKeyword: extractKeyword(jsonLd.name, sourceUrl),
    fullRecipe,
    paa: jsonLd.keywords || '',
    imageUrl: extractImage(jsonLd),
    sourceUrl
  };
}

export default { extractRecipe };
