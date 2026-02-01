// SBA GENIUS PROXY SERVER v2.2
// FIXED: Correct API endpoints for You.com and BetBurger
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
    service: 'SBA GENIUS Proxy v2.2',
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
// YOU.COM SEARCH API - FIXED: Uses GET with /v1/search
// ═══════════════════════════════════════════════════════════════════════════
app.post('/youcom', async (req, res) => {
  try {
    const { query, apiKey } = req.body;
    const key = apiKey || API_KEYS.youcom;
    
    if (!key) {
      return res.status(400).json({ error: 'No API key provided' });
    }
    
    console.log('You.com request for:', query);
    
    // CORRECT: Use GET request with /v1/search endpoint
    const url = `https://api.ydc-index.io/v1/search?query=${encodeURIComponent(query)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': key
      }
    });
    
    console.log('You.com response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('You.com error:', response.status, errorText);
      throw new Error(`You.com API returned ${response.status}: ${errorText.substring(0, 100)}`);
    }
    
    const data = await response.json();
    console.log('You.com success, results:', data.results?.web?.length || 0);
    
    // Transform to expected format
    res.json({
      hits: data.results?.web || [],
      news: data.results?.news || [],
      snippets: data.results?.web?.map(r => r.snippets?.[0] || r.description) || [],
      sources: data.results?.web?.map(r => r.title) || []
    });
    
  } catch (error) {
    console.error('You.com error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// BETBURGER API - FIXED: Uses correct REST API endpoints
// Live: rest-api-lv.betburger.com
// Prematch: rest-api-pr.betburger.com
// ═══════════════════════════════════════════════════════════════════════════
app.post('/betburger', async (req, res) => {
  try {
    const { accessToken, sport, perPage = 50, live = false } = req.body;
    const key = accessToken || API_KEYS.betburger;
    
    if (!key) {
      return res.status(400).json({ error: 'No API key provided' });
    }
    
    console.log('BetBurger request for sport:', sport, 'live:', live);
    
    // Use correct BetBurger API endpoint
    const baseUrl = live ? 'https://rest-api-lv.betburger.com' : 'https://rest-api-pr.betburger.com';
    
    // Try valuebets endpoint
    let url = `${baseUrl}/api/v1/valuebets?access_token=${key}&per_page=${perPage}`;
    if (sport) url += `&sport=${sport}`;
    
    console.log('BetBurger trying:', url.replace(key, 'xxx'));
    
    let response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('BetBurger valuebets success, count:', data.valuebets?.length || data.bets?.length || 0);
      return res.json(data);
    }
    
    console.log('BetBurger valuebets failed:', response.status);
    
    // Try arbs endpoint
    url = `${baseUrl}/api/v1/arbs?access_token=${key}&per_page=${perPage}`;
    if (sport) url += `&sport=${sport}`;
    
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
    
    // Try the old API as fallback
    url = `https://api.betburger.com/api/v1/valuebets?access_token=${key}&per_page=${perPage}`;
    if (sport) url += `&sport=${sport}`;
    
    response = await fetch(url, {
      method: 'GET', 
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('BetBurger old API success');
      return res.json(data);
    }
    
    // All failed
    const errorText = await response.text();
    console.error('BetBurger all endpoints failed:', response.status, errorText.substring(0, 200));
    throw new Error(`BetBurger API returned ${response.status}`);
    
  } catch (error) {
    console.error('BetBurger error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// BALLDONTLIE API - Uses new API with key
// ═══════════════════════════════════════════════════════════════════════════
app.post('/balldontlie', async (req, res) => {
  try {
    const { player, apiKey } = req.body;
    const key = apiKey || API_KEYS.balldontlie;
    
    console.log('BallDontLie request for player:', player);
    
    if (!key) {
      return res.status(400).json({ 
        error: 'No BallDontLie API key',
        note: 'Add BALLDONTLIE_API_KEY to Render environment variables'
      });
    }
    
    // Search for player
    const searchUrl = `https://api.balldontlie.io/v1/players?search=${encodeURIComponent(player)}`;
    console.log('BallDontLie searching:', searchUrl);
    
    const searchResponse = await fetch(searchUrl, {
      headers: { 'Authorization': key }
    });
    
    console.log('BallDontLie search status:', searchResponse.status);
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('BallDontLie search failed:', searchResponse.status, errorText);
      throw new Error(`BallDontLie returned ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.data || searchData.data.length === 0) {
      console.log('BallDontLie: Player not found');
      return res.json({ found: false });
    }
    
    const playerData = searchData.data[0];
    console.log('BallDontLie found:', playerData.first_name, playerData.last_name, 'ID:', playerData.id);
    
    // Get season averages
    const statsUrl = `https://api.balldontlie.io/v1/season_averages?player_id=${playerData.id}`;
    const statsResponse = await fetch(statsUrl, {
      headers: { 'Authorization': key }
    });
    
    console.log('BallDontLie stats status:', statsResponse.status);
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      const stats = statsData.data?.[0];
      
      console.log('BallDontLie stats:', stats?.pts, 'pts,', stats?.reb, 'reb,', stats?.ast, 'ast');
      
      return res.json({
        found: true,
        player: playerData,
        seasonAvg: stats?.pts?.toFixed(1) || null,
        reb: stats?.reb?.toFixed(1) || null,
        ast: stats?.ast?.toFixed(1) || null,
        gamesPlayed: stats?.games_played || null
      });
    }
    
    // Return player without stats
    return res.json({
      found: true,
      player: playerData,
      seasonAvg: null,
      note: 'Stats endpoint failed'
    });
    
  } catch (error) {
    console.error('BallDontLie error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// TEST ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════
app.get('/test/youcom', async (req, res) => {
  try {
    const key = API_KEYS.youcom;
    if (!key) return res.json({ error: 'No YOUCOM_API_KEY set' });
    
    const url = `https://api.ydc-index.io/v1/search?query=${encodeURIComponent('NBA basketball news')}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'X-API-Key': key }
    });
    
    const status = response.status;
    const data = await response.json().catch(() => response.text());
    res.json({ status, hasResults: !!data?.results?.web?.length, data: typeof data === 'object' ? { resultsCount: data?.results?.web?.length } : data });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get('/test/betburger', async (req, res) => {
  try {
    const key = API_KEYS.betburger;
    if (!key) return res.json({ error: 'No BETBURGER_API_KEY set' });
    
    // Try prematch API
    const prUrl = `https://rest-api-pr.betburger.com/api/v1/valuebets?access_token=${key}&per_page=2`;
    const prResponse = await fetch(prUrl);
    const prStatus = prResponse.status;
    const prData = await prResponse.json().catch(() => prResponse.text());
    
    // Try live API  
    const lvUrl = `https://rest-api-lv.betburger.com/api/v1/arbs?access_token=${key}&per_page=2`;
    const lvResponse = await fetch(lvUrl);
    const lvStatus = lvResponse.status;
    const lvData = await lvResponse.json().catch(() => lvResponse.text());
    
    res.json({ 
      prematch: { status: prStatus, hasData: !!prData?.valuebets?.length || !!prData?.bets?.length },
      live: { status: lvStatus, hasData: !!lvData?.arbs?.length }
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get('/test/balldontlie', async (req, res) => {
  try {
    const key = API_KEYS.balldontlie;
    if (!key) return res.json({ error: 'No BALLDONTLIE_API_KEY set', note: 'Add it to Render env vars' });
    
    const url = `https://api.balldontlie.io/v1/players?search=LeBron`;
    const response = await fetch(url, {
      headers: { 'Authorization': key }
    });
    
    const status = response.status;
    const data = await response.json().catch(() => response.text());
    
    res.json({ 
      status, 
      hasData: !!data?.data?.length,
      playerFound: data?.data?.[0]?.first_name + ' ' + data?.data?.[0]?.last_name
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// GENERIC PROXY
// ═══════════════════════════════════════════════════════════════════════════
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
  console.log(`SBA GENIUS Proxy v2.2 running on port ${PORT}`);
  console.log('Keys configured:', Object.entries(API_KEYS).map(([k,v]) => `${k}:${v?'YES':'NO'}`).join(', '));
});
