// SBA GENIUS PROXY SERVER v2.0
// Handles CORS for all external APIs
// Deploy to Render.com

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// API Keys from environment variables
const API_KEYS = {
  grok: process.env.GROK_API_KEY,
  oddsApi: process.env.ODDS_API_KEY,
  youcom: process.env.YOUCOM_API_KEY,
  betburger: process.env.BETBURGER_API_KEY,
  poe: process.env.POE_API_KEY,
  mistral: process.env.MISTRAL_API_KEY
};

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'SBA GENIUS Proxy v2.0',
    endpoints: ['/grok', '/odds-api', '/youcom', '/betburger', '/balldontlie'],
    keysConfigured: {
      grok: !!API_KEYS.grok,
      oddsApi: !!API_KEYS.oddsApi,
      youcom: !!API_KEYS.youcom,
      betburger: !!API_KEYS.betburger,
      poe: !!API_KEYS.poe,
      mistral: !!API_KEYS.mistral
    }
  });
});

// GROK (xAI)
app.post('/grok', async (req, res) => {
  try {
    const { model, messages, max_tokens } = req.body;
    const apiKey = req.headers.authorization?.replace('Bearer ', '') || API_KEYS.grok;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'No API key provided' });
    }
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, messages, max_tokens })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// THE ODDS API
app.post('/odds-api', async (req, res) => {
  try {
    const { sport, apiKey, regions = 'us', markets = 'h2h,spreads,totals' } = req.body;
    const key = apiKey || API_KEYS.oddsApi;
    
    if (!key) {
      return res.status(400).json({ error: 'No API key provided' });
    }
    
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${key}&regions=${regions}&markets=${markets}&oddsFormat=american`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Odds API returned ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// YOU.COM SEARCH API
app.post('/youcom', async (req, res) => {
  try {
    const { query, apiKey } = req.body;
    const key = apiKey || API_KEYS.youcom;
    
    if (!key) {
      return res.status(400).json({ error: 'No API key provided' });
    }
    
    let response = await fetch('https://api.ydc-index.io/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': key
      },
      body: JSON.stringify({ query, num_web_results: 5 })
    });
    
    if (!response.ok) {
      response = await fetch(`https://api.ydc-index.io/rag?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: { 'X-API-Key': key }
      });
    }
    
    if (!response.ok) {
      throw new Error(`You.com API returned ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// BETBURGER API
app.post('/betburger', async (req, res) => {
  try {
    const { endpoint = 'valuebets', accessToken, sport, perPage = 50 } = req.body;
    const key = accessToken || API_KEYS.betburger;
    
    if (!key) {
      return res.status(400).json({ error: 'No API key provided' });
    }
    
    const url = `https://api.betburger.com/api/v1/${endpoint}?access_token=${key}&sport=${sport}&per_page=${perPage}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      if (endpoint === 'valuebets') {
        const arbUrl = `https://api.betburger.com/api/v1/arbs?access_token=${key}&sport=${sport}&per_page=30`;
        const arbResponse = await fetch(arbUrl, { headers: { 'Accept': 'application/json' } });
        
        if (arbResponse.ok) {
          const data = await arbResponse.json();
          return res.json(data);
        }
      }
      throw new Error(`BetBurger API returned ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// BALLDONTLIE API (NBA Stats)
app.post('/balldontlie', async (req, res) => {
  try {
    const { player } = req.body;
    
    const searchUrl = `https://www.balldontlie.io/api/v1/players?search=${encodeURIComponent(player)}`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData.data || searchData.data.length === 0) {
      return res.json({ found: false });
    }
    
    const playerData = searchData.data[0];
    
    const statsUrl = `https://www.balldontlie.io/api/v1/season_averages?player_ids[]=${playerData.id}`;
    const statsResponse = await fetch(statsUrl);
    const statsData = await statsResponse.json();
    const stats = statsData.data?.[0];
    
    res.json({
      found: true,
      player: playerData,
      seasonAvg: stats?.pts?.toFixed(1),
      reb: stats?.reb?.toFixed(1),
      ast: stats?.ast?.toFixed(1),
      gamesPlayed: stats?.games_played
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GENERIC PROXY
app.post('/proxy', async (req, res) => {
  try {
    const { url, method = 'GET', headers = {}, body } = req.body;
    
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`SBA GENIUS Proxy v2.0 running on port ${PORT}`);
});
