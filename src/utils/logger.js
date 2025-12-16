/**
 * Logger ELITE - Logs profesionales con timestamps y emojis
 */

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function timestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

export const logger = {
  info: (msg, ...args) => {
    console.log(`${COLORS.cyan}[${timestamp()}]${COLORS.reset} ℹ️  ${msg}`, ...args);
  },
  
  success: (msg, ...args) => {
    console.log(`${COLORS.green}[${timestamp()}]${COLORS.reset} ✅ ${msg}`, ...args);
  },
  
  warn: (msg, ...args) => {
    console.log(`${COLORS.yellow}[${timestamp()}]${COLORS.reset} ⚠️  ${msg}`, ...args);
  },
  
  error: (msg, ...args) => {
    console.error(`${COLORS.red}[${timestamp()}]${COLORS.reset} ❌ ${msg}`, ...args);
  },
  
  debug: (msg, ...args) => {
    if (process.env.DEBUG === 'true') {
      console.log(`${COLORS.magenta}[${timestamp()}]${COLORS.reset} 🔍 ${msg}`, ...args);
    }
  },
  
  scrape: (msg, ...args) => {
    console.log(`${COLORS.blue}[${timestamp()}]${COLORS.reset} 🔍 ${msg}`, ...args);
  },
  
  save: (msg, ...args) => {
    console.log(`${COLORS.green}[${timestamp()}]${COLORS.reset} 💾 ${msg}`, ...args);
  },
  
  cron: (msg, ...args) => {
    console.log(`${COLORS.magenta}[${timestamp()}]${COLORS.reset} ⏰ ${msg}`, ...args);
  },
  
  divider: () => {
    console.log(`${COLORS.cyan}${'═'.repeat(50)}${COLORS.reset}`);
  },
  
  header: (title) => {
    console.log(`\n${COLORS.bright}${COLORS.cyan}${'═'.repeat(50)}${COLORS.reset}`);
    console.log(`${COLORS.bright}${COLORS.cyan}  ${title}${COLORS.reset}`);
    console.log(`${COLORS.cyan}${'═'.repeat(50)}${COLORS.reset}\n`);
  },
  
  summary: (results) => {
    console.log(`\n${COLORS.bright}${COLORS.green}${'═'.repeat(50)}${COLORS.reset}`);
    console.log(`${COLORS.bright}${COLORS.green}  📊 RESUMEN DE EXTRACCIÓN${COLORS.reset}`);
    console.log(`${COLORS.green}${'═'.repeat(50)}${COLORS.reset}`);
    console.log(`  ✅ Recetas extraídas: ${results.extracted}`);
    console.log(`  ⏭️  Duplicados:        ${results.duplicates}`);
    console.log(`  ❌ Errores:           ${results.errors}`);
    console.log(`  ⏱️  Duración:          ${results.duration}s`);
    console.log(`${COLORS.green}${'═'.repeat(50)}${COLORS.reset}\n`);
  }
};

export default logger;