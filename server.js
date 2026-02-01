// SBA GENIUS PROXY SERVER v2.1
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
  mistral: process.env.MISTRAL_API_KEY,
  balldontlie: process.env.BALLDONTLIE_API_KEY
};

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'SBA GENIUS Proxy v2.1',
    endpoints: ['/grok', '/odds-api', '/youcom', '/betburger', '/balldontlie'],
    keysConfigured: {
      grok: !!API_KEYS.grok,
      oddsApi: !!API_KEYS.oddsApi,
      youcom: !!API_KEYS.youcom,
      betburger: !!API_KEYS.betburger,
      poe: !!API_KEYS.poe,
      mistral: !!API_KEYS.mistral,
      balldontlie: !!API_KEYS.balldontlie
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GROK (xAI)
// ═══════════════════════════════════════════════════════════════════════════
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
    console.error('Grok error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// THE ODDS API
// ═══════════════════════════════════════════════════════════════════════════
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
    console.error('Odds API error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// YOU.COM SEARCH API - Updated endpoints
// ═══════════════════════════════════════════════════════════════════════════
app.post('/youcom', async (req, res) => {
  try {
    const { query, apiKey } = req.body;
    const key = apiKey || API_KEYS.youcom;
    
    if (!key) {
      return res.status(400).json({ error: 'No API key provided' });
    }
    
    console.log('You.com request for:', query);
    
    // Try the news endpoint first (most reliable)
    let response = await fetch('https://api.ydc-index.io/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': key
      },
      body: JSON.stringify({ 
        q: query,
        count: 5
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('You.com news success');
      return res.json({
        source: 'news',
        hits: data.news?.results || [],
        snippets: data.news?.results?.map(r => r.description) || []
      });
    }
    
    // Try search endpoint
    response = await fetch('https://api.ydc-index.io/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': key
      },
      body: JSON.stringify({ 
        query: query,
        num_web_results: 5
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('You.com search success');
      return res.json({
        source: 'search',
        hits: data.hits || [],
        snippets: data.hits?.map(h => h.snippet) || []
      });
    }
    
    // Try RAG endpoint as last resort
    response = await fetch(`https://api.ydc-index.io/rag?query=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: { 'X-API-Key': key }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('You.com RAG success');
      return res.json({
        source: 'rag',
        answer: data.answer || '',
        hits: data.hits || [],
        snippets: data.hits?.map(h => h.snippet) || []
      });
    }
    
    // All endpoints failed
    const errorText = await response.text();
    console.error('You.com all endpoints failed:', response.status, errorText);
    throw new Error(`You.com API returned ${response.status}: ${errorText}`);
    
  } catch (error) {
    console.error('You.com error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// BETBURGER API - Updated with multiple endpoint attempts
// ═══════════════════════════════════════════════════════════════════════════
app.post('/betburger', async (req, res) => {
  try {
    const { endpoint = 'valuebets', accessToken, sport, perPage = 50 } = req.body;
    const key = accessToken || API_KEYS.betburger;
    
    if (!key) {
      return res.status(400).json({ error: 'No API key provided' });
    }
    
    console.log('BetBurger request for sport:', sport);
    
    // Try valuebets endpoint
    let url = `https://api.betburger.com/api/v1/valuebets?access_token=${key}&sport=${sport}&per_page=${perPage}`;
    let response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('BetBurger valuebets success, count:', data.valuebets?.length || 0);
      return res.json(data);
    }
    
    console.log('BetBurger valuebets failed:', response.status);
    
    // Try arbs endpoint
    url = `https://api.betburger.com/api/v1/arbs?access_token=${key}&sport=${sport}&per_page=30`;
    response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('BetBurger arbs success, count:', data.arbs?.length || 0);
      return res.json(data);
    }
    
    console.log('BetBurger arbs failed:', response.status);
    
    // Try middles endpoint
    url = `https://api.betburger.com/api/v1/middles?access_token=${key}&sport=${sport}&per_page=30`;
    response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('BetBurger middles success');
      return res.json(data);
    }
    
    // Try bets endpoint (general)
    url = `https://api.betburger.com/api/v1/bets?access_token=${key}&per_page=30`;
    response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('BetBurger bets success');
      return res.json(data);
    }
    
    // All endpoints failed - return error with status
    const errorText = await response.text();
    console.error('BetBurger all endpoints failed:', response.status, errorText);
    throw new Error(`BetBurger API returned ${response.status}: ${errorText.substring(0, 200)}`);
    
  } catch (error) {
    console.error('BetBurger error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// BALLDONTLIE API - NEW API (requires API key now)
// ═══════════════════════════════════════════════════════════════════════════
app.post('/balldontlie', async (req, res) => {
  try {
    const { player, apiKey } = req.body;
    const key = apiKey || API_KEYS.balldontlie;
    
    console.log('BallDontLie request for player:', player);
    
    if (!key) {
      return res.status(400).json({ 
        error: 'No BallDontLie API key provided',
        note: 'Add BALLDONTLIE_API_KEY to environment variables'
      });
    }
    
    // Use the NEW API endpoint
    const searchUrl = `https://api.balldontlie.io/v1/players?search=${encodeURIComponent(player)}`;
    const searchResponse = await fetch(searchUrl, {
      headers: { 'Authorization': key }
    });
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('BallDontLie search failed:', searchResponse.status, errorText);
      throw new Error(`BallDontLie API returned ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.data || searchData.data.length === 0) {
      console.log('BallDontLie: Player not found');
      return res.json({ found: false });
    }
    
    const playerData = searchData.data[0];
    console.log('BallDontLie: Found player', playerData.first_name, playerData.last_name);
    
    // Get season averages
    const statsUrl = `https://api.balldontlie.io/v1/season_averages?player_id=${playerData.id}`;
    const statsResponse = await fetch(statsUrl, {
      headers: { 'Authorization': key }
    });
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      const stats = statsData.data?.[0];
      
      console.log('BallDontLie: Got stats, pts:', stats?.pts);
      return res.json({
        found: true,
        player: playerData,
        seasonAvg: stats?.pts?.toFixed(1),
        reb: stats?.reb?.toFixed(1),
        ast: stats?.ast?.toFixed(1),
        gamesPlayed: stats?.games_played
      });
    }
    
    // Return player data even without stats
    return res.json({
      found: true,
      player: playerData,
      seasonAvg: null,
      note: 'Stats not available'
    });
    
  } catch (error) {
    console.error('BallDontLie error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GENERIC PROXY (for any API)
// ═══════════════════════════════════════════════════════════════════════════
app.post('/proxy', async (req, res) => {
  try {
    const { url, method = 'GET', headers = {}, body } = req.body;
    
    console.log('Generic proxy request to:', url);
    
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST ENDPOINTS - For debugging
// ═══════════════════════════════════════════════════════════════════════════
app.get('/test/youcom', async (req, res) => {
  try {
    const key = API_KEYS.youcom;
    if (!key) return res.json({ error: 'No YOUCOM_API_KEY set' });
    
    const response = await fetch('https://api.ydc-index.io/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': key
      },
      body: JSON.stringify({ q: 'NBA basketball', count: 2 })
    });
    
    const status = response.status;
    const data = await response.json().catch(() => response.text());
    res.json({ status, data });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get('/test/betburger', async (req, res) => {
  try {
    const key = API_KEYS.betburger;
    if (!key) return res.json({ error: 'No BETBURGER_API_KEY set' });
    
    const response = await fetch(`https://api.betburger.com/api/v1/bets?access_token=${key}&per_page=2`);
    const status = response.status;
    const data = await response.json().catch(() => response.text());
    res.json({ status, data });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get('/test/balldontlie', async (req, res) => {
  try {
    // Test old API
    const oldResponse = await fetch('https://www.balldontlie.io/api/v1/players?search=LeBron');
    const oldStatus = oldResponse.status;
    const oldData = await oldResponse.json().catch(() => 'parse error');
    
    res.json({ 
      oldApi: { status: oldStatus, hasData: !!oldData?.data?.length },
      note: 'New API requires key from https://www.balldontlie.io/'
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`SBA GENIUS Proxy v2.1 running on port ${PORT}`);
  console.log('Environment variables loaded:');
  console.log('  GROK_API_KEY:', API_KEYS.grok ? 'SET' : 'NOT SET');
  console.log('  ODDS_API_KEY:', API_KEYS.oddsApi ? 'SET' : 'NOT SET');
  console.log('  YOUCOM_API_KEY:', API_KEYS.youcom ? 'SET' : 'NOT SET');
  console.log('  BETBURGER_API_KEY:', API_KEYS.betburger ? 'SET' : 'NOT SET');
  console.log('  POE_API_KEY:', API_KEYS.poe ? 'SET' : 'NOT SET');
  console.log('  MISTRAL_API_KEY:', API_KEYS.mistral ? 'SET' : 'NOT SET');
  console.log('  BALLDONTLIE_API_KEY:', API_KEYS.balldontlie ? 'SET' : 'NOT SET');
});
