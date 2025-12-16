# 🍳 Recipe Scraper ELITE PRO MAX

Scraper automatizado de recetas que extrae datos estructurados de múltiples fuentes RSS y los guarda en Baserow.

## ✨ Features

- 📡 RSS Feed Parser - Extrae links de recetas de múltiples fuentes
- 🌐 Browserless Integration - Scraping con Chrome headless
- 📊 JSON-LD Extraction - Parsea datos estructurados de Schema.org
- 💾 Baserow Storage - Guarda recetas en base de datos
- ⏰ Cron Scheduling - Ejecución automática programada
- 🔄 Duplicate Detection - Evita recetas duplicadas
- 🏥 Health Checks - Endpoints de monitoreo

## 🚀 Quick Start

```bash
git clone https://github.com/kitoto931-boop/fololo.git
cd fololo
npm install
cp .env.example .env
npm start
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /status | Scraper status |
| POST | /trigger | Manual trigger |
| GET | /result | Last results |

## 📄 License

MIT