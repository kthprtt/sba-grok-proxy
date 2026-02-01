// SBA GENIUS PROXY SERVER v3.0
// COMPLETE - All AI + Data APIs
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
  balldontlie: process.env.BALLDONTLIE_API_KEY,
  perplexity: process.env.PERPLEXITY_API_KEY,
  deepseek: process.env.DEEPSEEK_API_KEY,
  cohere: process.env.COHERE_API_KEY,
  openai: process.env.OPENAI_API_KEY,
  anthropic: process.env.ANTHROPIC_API_KEY,
  gemini: process.env.GEMINI_API_KEY
};

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'SBA GENIUS Proxy v3.0',
    endpoints: ['/grok', '/perplexity', '/deepseek', '/cohere', '/mistral', '/gemini', '/openai', '/anthropic', '/odds-api', '/youcom', '/balldontlie', '/proxy'],
    keysConfigured: Object.fromEntries(
      Object.entries(API_KEYS).map(([k, v]) => [k, !!v])
    )
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// AI ENGINES
// ═══════════════════════════════════════════════════════════════════════════

// GROK (xAI)
app.post('/grok', async (req, res) => {
  try {
    const { model = 'grok-3-mini', messages, max_tokens = 500 } = req.body;
    const apiKey = req.headers.authorization?.replace('Bearer ', '') || API_KEYS.grok;
    
    if (!apiKey) return res.status(400).json({ error: 'No API key' });
    
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

// PERPLEXITY
app.post('/perplexity', async (req, res) => {
  try {
    const { model = 'sonar', messages, max_tokens = 500, apiKey } = req.body;
    const key = apiKey || API_KEYS.perplexity;
    
    if (!key) return res.status(400).json({ error: 'No API key' });
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({ model, messages, max_tokens })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Perplexity error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// DEEPSEEK
app.post('/deepseek', async (req, res) => {
  try {
    const { model = 'deepseek-chat', messages, max_tokens = 500, apiKey } = req.body;
    const key = apiKey || API_KEYS.deepseek;
    
    if (!key) return res.status(400).json({ error: 'No API key' });
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({ model, messages, max_tokens })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('DeepSeek error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// COHERE
app.post('/cohere', async (req, res) => {
  try {
    const { model = 'command-a-03-2025', message, chat_history = [], apiKey } = req.body;
    const key = apiKey || API_KEYS.cohere;
    
    if (!key) return res.status(400).json({ error: 'No API key' });
    
    const response = await fetch('https://api.cohere.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({ model, message, chat_history })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Cohere error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// MISTRAL
app.post('/mistral', async (req, res) => {
  try {
    const { model = 'mistral-small-latest', messages, max_tokens = 500, apiKey } = req.body;
    const key = apiKey || API_KEYS.mistral;
    
    if (!key) return res.status(400).json({ error: 'No API key' });
    
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({ model, messages, max_tokens })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Mistral error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// GEMINI
app.post('/gemini', async (req, res) => {
  try {
    const { contents, apiKey } = req.body;
    const key = apiKey || API_KEYS.gemini;
    
    if (!key) return res.status(400).json({ error: 'No API key' });
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Gemini error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// OPENAI
app.post('/openai', async (req, res) => {
  try {
    const { model = 'gpt-4o-mini', messages, max_tokens = 500, apiKey } = req.body;
    const key = apiKey || API_KEYS.openai;
    
    if (!key) return res.status(400).json({ error: 'No API key' });
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({ model, messages, max_tokens })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('OpenAI error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ANTHROPIC (Claude)
app.post('/anthropic', async (req, res) => {
  try {
    const { model = 'claude-3-haiku-20240307', messages, max_tokens = 500, apiKey } = req.body;
    const key = apiKey || API_KEYS.anthropic;
    
    if (!key) return res.status(400).json({ error: 'No API key' });
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model, messages, max_tokens })
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Anthropic error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// DATA APIs
// ═══════════════════════════════════════════════════════════════════════════

// THE ODDS API
app.post('/odds-api', async (req, res) => {
  try {
    const { sport, apiKey, regions = 'us', markets = 'h2h,spreads,totals' } = req.body;
    const key = apiKey || API_KEYS.oddsApi;
    
    if (!key) return res.status(400).json({ error: 'No API key' });
    
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${key}&regions=${regions}&markets=${markets}&oddsFormat=american`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Odds API error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// YOU.COM
app.post('/youcom', async (req, res) => {
  try {
    const { query, apiKey } = req.body;
    const key = apiKey || API_KEYS.youcom;
    
    if (!key) return res.status(400).json({ error: 'No API key' });
    if (!query) return res.status(400).json({ error: 'No query provided' });
    
    console.log('You.com query:', query);
    
    const url = `https://ydc-index.io/v1/search?query=${encodeURIComponent(query)}&language=EN`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': key
      }
    });
    
    console.log('You.com status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('You.com error:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
    }
    
    const data = await response.json();
    
    res.json({
      hits: data.results?.web || [],
      news: data.results?.news || [],
      snippets: data.results?.web?.map(r => r.snippets?.[0] || r.description) || []
    });
  } catch (error) {
    console.error('You.com error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// BALLDONTLIE - Player Search + Stats
app.post('/balldontlie', async (req, res) => {
  try {
    const { player, apiKey, season = 2024 } = req.body;
    const key = apiKey || API_KEYS.balldontlie;
    
    if (!key) return res.status(400).json({ error: 'No API key', note: 'Add BALLDONTLIE_API_KEY' });
    
    // Use last name for search (works better with API)
    const searchTerm = player.includes(' ') ? player.split(' ').pop() : player;
    console.log('BallDontLie search for:', searchTerm, '(from:', player, ')');
    
    // Search for player
    const searchUrl = `https://api.balldontlie.io/v1/players?search=${encodeURIComponent(searchTerm)}`;
    const searchResponse = await fetch(searchUrl, {
      headers: { 'Authorization': key }
    });
    
    console.log('BallDontLie status:', searchResponse.status);
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('BallDontLie error:', errorText);
      throw new Error(`HTTP ${searchResponse.status}: ${errorText.substring(0, 100)}`);
    }
    
    const searchData = await searchResponse.json();
    console.log('BallDontLie results:', searchData.data?.length || 0);
    
    if (!searchData.data || searchData.data.length === 0) {
      return res.json({ found: false, note: 'Player not found', searchedFor: player });
    }
    
    // If full name provided, try to match both first and last name
    let playerData = searchData.data[0];
    if (player.includes(' ')) {
      const nameParts = player.toLowerCase().split(' ');
      const match = searchData.data.find(p => 
        nameParts.includes(p.first_name?.toLowerCase()) && 
        nameParts.includes(p.last_name?.toLowerCase())
      );
      if (match) playerData = match;
    }
    
    // Try to get season averages
    let stats = null;
    try {
      const statsUrl = `https://api.balldontlie.io/v1/season_averages?season=${season}&player_id=${playerData.id}`;
      const statsResponse = await fetch(statsUrl, {
        headers: { 'Authorization': key }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        stats = statsData.data?.[0];
      }
    } catch (statsError) {
      console.log('Stats fetch failed:', statsError.message);
    }
    
    return res.json({
      found: true,
      player: playerData,
      season: season,
      seasonAvg: stats?.pts?.toFixed(1) || null,
      reb: stats?.reb?.toFixed(1) || null,
      ast: stats?.ast?.toFixed(1) || null,
      gamesPlayed: stats?.games_played || null
    });
    
  } catch (error) {
    console.error('BallDontLie error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// BALLDONTLIE - Game Stats (L10 for hit rate) - ALL-STAR PLAN
app.post('/balldontlie/games', async (req, res) => {
  try {
    const { playerId, player, season = 2024, limit = 10, apiKey } = req.body;
    const key = apiKey || API_KEYS.balldontlie;
    
    if (!key) return res.status(400).json({ error: 'No API key' });
    
    let pid = playerId;
    
    // If no playerId, search for player first
    if (!pid && player) {
      const searchTerm = player.includes(' ') ? player.split(' ').pop() : player;
      const searchUrl = `https://api.balldontlie.io/v1/players?search=${encodeURIComponent(searchTerm)}`;
      const searchResponse = await fetch(searchUrl, { headers: { 'Authorization': key } });
      const searchData = await searchResponse.json();
      
      if (searchData.data?.length > 0) {
        // Match full name if provided
        if (player.includes(' ')) {
          const nameParts = player.toLowerCase().split(' ');
          const match = searchData.data.find(p => 
            nameParts.includes(p.first_name?.toLowerCase()) && 
            nameParts.includes(p.last_name?.toLowerCase())
          );
          pid = match?.id || searchData.data[0].id;
        } else {
          pid = searchData.data[0].id;
        }
      }
    }
    
    if (!pid) {
      return res.json({ error: 'Player not found', games: [] });
    }
    
    console.log('Fetching game stats for player ID:', pid);
    
    // Get recent game stats - ALL-STAR endpoint
    const gamesUrl = `https://api.balldontlie.io/v1/stats?player_ids[]=${pid}&seasons[]=${season}&per_page=${limit}`;
    const gamesResponse = await fetch(gamesUrl, {
      headers: { 'Authorization': key }
    });
    
    if (!gamesResponse.ok) {
      const errorText = await gamesResponse.text();
      console.error('Game stats error:', errorText);
      throw new Error(`HTTP ${gamesResponse.status}`);
    }
    
    const gamesData = await gamesResponse.json();
    console.log('Game stats found:', gamesData.data?.length || 0);
    
    // Format game stats
    const games = (gamesData.data || []).map(g => ({
      gameId: g.game?.id,
      date: g.game?.date,
      opponent: g.game?.home_team_id === g.team?.id ? 
        `vs ${g.game?.visitor_team_id}` : `@ ${g.game?.home_team_id}`,
      min: g.min,
      pts: g.pts,
      reb: g.reb,
      ast: g.ast,
      stl: g.stl,
      blk: g.blk,
      fg_pct: g.fg_pct,
      fg3m: g.fg3m,
      turnover: g.turnover
    }));
    
    // Calculate averages from these games
    const avgPts = games.length > 0 ? (games.reduce((s, g) => s + (g.pts || 0), 0) / games.length).toFixed(1) : null;
    const avgReb = games.length > 0 ? (games.reduce((s, g) => s + (g.reb || 0), 0) / games.length).toFixed(1) : null;
    const avgAst = games.length > 0 ? (games.reduce((s, g) => s + (g.ast || 0), 0) / games.length).toFixed(1) : null;
    
    res.json({
      playerId: pid,
      season,
      gamesFound: games.length,
      games,
      averages: {
        pts: avgPts,
        reb: avgReb,
        ast: avgAst
      }
    });
    
  } catch (error) {
    console.error('Game stats error:', error.message);
    res.status(500).json({ error: error.message, games: [] });
  }
});

// BALLDONTLIE - Player Injuries - ALL-STAR PLAN
app.post('/balldontlie/injuries', async (req, res) => {
  try {
    const { playerId, player, apiKey } = req.body;
    const key = apiKey || API_KEYS.balldontlie;
    
    if (!key) return res.status(400).json({ error: 'No API key' });
    
    let pid = playerId;
    
    // If no playerId, search for player first
    if (!pid && player) {
      const searchTerm = player.includes(' ') ? player.split(' ').pop() : player;
      const searchUrl = `https://api.balldontlie.io/v1/players?search=${encodeURIComponent(searchTerm)}`;
      const searchResponse = await fetch(searchUrl, { headers: { 'Authorization': key } });
      const searchData = await searchResponse.json();
      
      if (searchData.data?.length > 0) {
        if (player.includes(' ')) {
          const nameParts = player.toLowerCase().split(' ');
          const match = searchData.data.find(p => 
            nameParts.includes(p.first_name?.toLowerCase()) && 
            nameParts.includes(p.last_name?.toLowerCase())
          );
          pid = match?.id || searchData.data[0].id;
        } else {
          pid = searchData.data[0].id;
        }
      }
    }
    
    if (!pid) {
      return res.json({ error: 'Player not found', injuries: [] });
    }
    
    // Get injury status - ALL-STAR endpoint
    const injuryUrl = `https://api.balldontlie.io/v1/player_injuries?player_ids[]=${pid}`;
    const injuryResponse = await fetch(injuryUrl, {
      headers: { 'Authorization': key }
    });
    
    if (!injuryResponse.ok) {
      // May not have injury data
      return res.json({ playerId: pid, injuries: [], status: 'healthy' });
    }
    
    const injuryData = await injuryResponse.json();
    
    const injuries = (injuryData.data || []).map(inj => ({
      status: inj.status,
      description: inj.description,
      date: inj.date,
      returnDate: inj.return_date
    }));
    
    // Determine overall status
    let status = 'healthy';
    if (injuries.length > 0) {
      const latestStatus = injuries[0]?.status?.toLowerCase() || '';
      if (latestStatus.includes('out')) status = 'out';
      else if (latestStatus.includes('doubtful')) status = 'doubtful';
      else if (latestStatus.includes('questionable')) status = 'questionable';
      else if (latestStatus.includes('probable')) status = 'probable';
    }
    
    res.json({
      playerId: pid,
      injuries,
      status,
      isHealthy: status === 'healthy' || status === 'probable'
    });
    
  } catch (error) {
    console.error('Injuries error:', error.message);
    res.status(500).json({ error: error.message, injuries: [] });
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
    console.error('Proxy error:', error.message);
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
    
    const url = `https://ydc-index.io/v1/search?query=${encodeURIComponent('NBA news')}&language=EN`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'X-API-KEY': key }
    });
    
    const data = await response.json().catch(() => response.text());
    res.json({ status: response.status, hasResults: !!data?.results?.web?.length, count: data?.results?.web?.length });
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get('/test/balldontlie', async (req, res) => {
  try {
    const key = API_KEYS.balldontlie;
    if (!key) return res.json({ error: 'No BALLDONTLIE_API_KEY set' });
    
    // Try v1 first
    let url = `https://api.balldontlie.io/v1/players?search=LeBron`;
    let response = await fetch(url, { headers: { 'Authorization': key } });
    
    if (!response.ok) {
      // Try nba/v1
      url = `https://api.balldontlie.io/nba/v1/players?search=LeBron`;
      response = await fetch(url, { headers: { 'Authorization': key } });
    }
    
    const data = await response.json().catch(() => response.text());
    
    if (data?.data?.[0]) {
      res.json({ 
        status: response.status, 
        found: data.data[0].first_name + ' ' + data.data[0].last_name,
        playerId: data.data[0].id,
        endpoint: url
      });
    } else {
      res.json({ status: response.status, error: 'No results', data: data });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});

app.get('/test/all', async (req, res) => {
  const results = {};
  
  // Test each configured key
  for (const [name, key] of Object.entries(API_KEYS)) {
    results[name] = key ? 'configured' : 'missing';
  }
  
  res.json({ keys: results, timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`SBA GENIUS Proxy v3.0 running on port ${PORT}`);
  console.log('Configured keys:', Object.entries(API_KEYS).filter(([k,v]) => v).map(([k]) => k).join(', '));
});
