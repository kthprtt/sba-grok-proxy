// ═══════════════════════════════════════════════════════════════════════════
// 🏆 SBA GENIUS - GROK PROXY SERVER (SOCIAL PULSE™)
// ═══════════════════════════════════════════════════════════════════════════
// Deploy to Railway or Render to bypass CORS restrictions
// ═══════════════════════════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (or restrict to your domain)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'SBA GENIUS - SOCIAL PULSE™ Proxy',
    version: '1.0.0',
    endpoints: ['/grok', '/odds', '/espn']
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// GROK (xAI) PROXY - SOCIAL PULSE™
// ═══════════════════════════════════════════════════════════════════════════

const GROK_API_KEY = process.env.GROK_API_KEY || ''; // Set in environment variables

app.post('/grok', async (req, res) => {
  try {
    console.log('📱 SOCIAL PULSE™ request received');
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`
      },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Grok API error:', data);
      return res.status(response.status).json(data);
    }
    
    console.log('✅ SOCIAL PULSE™ response sent');
    res.json(data);
    
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// THE ODDS API PROXY - MARKET CONSENSUS™
// ═══════════════════════════════════════════════════════════════════════════

const ODDS_API_KEY = process.env.ODDS_API_KEY || ''; // Set in environment variables

app.get('/odds/:sport', async (req, res) => {
  try {
    const { sport } = req.params;
    const { markets, bookmakers } = req.query;
    
    console.log(`💹 MARKET CONSENSUS™ request for ${sport}`);
    
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=${markets || 'h2h,spreads,totals'}&oddsFormat=american`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Odds API error:', data);
      return res.status(response.status).json(data);
    }
    
    console.log(`✅ MARKET CONSENSUS™: ${data.length} events found`);
    res.json(data);
    
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Player props endpoint
app.get('/odds/:sport/props/:eventId', async (req, res) => {
  try {
    const { sport, eventId } = req.params;
    const { markets } = req.query;
    
    console.log(`💹 MARKET CONSENSUS™ props request for event ${eventId}`);
    
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/events/${eventId}/odds?apiKey=${ODDS_API_KEY}&regions=us&markets=${markets || 'player_points,player_rebounds,player_assists'}&oddsFormat=american`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    
    res.json(data);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ESPN API PROXY - LIVE FEED™
// ═══════════════════════════════════════════════════════════════════════════

app.get('/espn/:sport/scoreboard', async (req, res) => {
  try {
    const { sport } = req.params;
    
    const sportMap = {
      nba: 'basketball/nba',
      nfl: 'football/nfl',
      mlb: 'baseball/mlb',
      nhl: 'hockey/nhl',
      ncaab: 'basketball/mens-college-basketball',
      ncaaf: 'football/college-football'
    };
    
    const espnSport = sportMap[sport.toLowerCase()] || sport;
    console.log(`📊 LIVE FEED™ request for ${espnSport}`);
    
    const url = `https://site.api.espn.com/apis/site/v2/sports/${espnSport}/scoreboard`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`✅ LIVE FEED™: ${data.events?.length || 0} games found`);
    res.json(data);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ESPN Player stats
app.get('/espn/player/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { sport } = req.query;
    
    const sportMap = {
      nba: 'basketball/nba',
      nfl: 'football/nfl',
      mlb: 'baseball/mlb'
    };
    
    const espnSport = sportMap[sport?.toLowerCase()] || 'basketball/nba';
    
    const url = `https://site.api.espn.com/apis/common/v3/sports/${espnSport}/athletes/${playerId}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// REVERSE LINE MOVEMENT (RLM) DETECTOR
// ═══════════════════════════════════════════════════════════════════════════

app.post('/rlm/detect', async (req, res) => {
  try {
    const { openingLine, currentLine, publicMoneyPercent, side } = req.body;
    
    console.log('🔄 RLM Detection request');
    
    // RLM = Line moves OPPOSITE to where public money is going
    const lineMoved = currentLine - openingLine;
    const publicOnOver = side === 'over' ? publicMoneyPercent : (100 - publicMoneyPercent);
    
    let rlmDetected = false;
    let rlmStrength = 'none';
    let signal = 'neutral';
    
    // Public heavy on OVER but line DROPPED
    if (publicOnOver > 60 && lineMoved < -0.5) {
      rlmDetected = true;
      rlmStrength = lineMoved < -1.5 ? 'strong' : 'moderate';
      signal = 'sharp_under';
    }
    // Public heavy on UNDER but line ROSE
    else if (publicOnOver < 40 && lineMoved > 0.5) {
      rlmDetected = true;
      rlmStrength = lineMoved > 1.5 ? 'strong' : 'moderate';
      signal = 'sharp_over';
    }
    
    const result = {
      rlmDetected,
      rlmStrength,
      signal,
      analysis: {
        openingLine,
        currentLine,
        lineMoved: lineMoved.toFixed(1),
        publicMoneyPercent,
        publicSide: publicOnOver > 50 ? 'over' : 'under'
      },
      recommendation: rlmDetected 
        ? `⚠️ RLM DETECTED: Sharp money appears to be on the ${signal === 'sharp_over' ? 'OVER' : 'UNDER'}. Line moved ${Math.abs(lineMoved).toFixed(1)} points AGAINST ${publicOnOver > 50 ? 'public' : 'sharp'} money.`
        : 'No reverse line movement detected.'
    };
    
    console.log('✅ RLM result:', result);
    res.json(result);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// HISTORICAL TRACKING ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════

// In-memory storage (use Redis/DB in production)
const predictions = [];

app.post('/track/prediction', (req, res) => {
  try {
    const prediction = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...req.body,
      result: null // Will be updated later
    };
    
    predictions.push(prediction);
    console.log(`📊 Tracked prediction ${prediction.id}`);
    
    res.json({ success: true, id: prediction.id });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/track/result', (req, res) => {
  try {
    const { id, actualResult, hit } = req.body;
    
    const prediction = predictions.find(p => p.id === id);
    if (prediction) {
      prediction.result = actualResult;
      prediction.hit = hit;
      prediction.settledAt = new Date().toISOString();
      console.log(`✅ Updated prediction ${id}: ${hit ? 'HIT' : 'MISS'}`);
    }
    
    res.json({ success: true });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/track/stats', (req, res) => {
  try {
    const settled = predictions.filter(p => p.result !== null);
    const hits = settled.filter(p => p.hit);
    
    const stats = {
      total: predictions.length,
      settled: settled.length,
      pending: predictions.length - settled.length,
      hits: hits.length,
      misses: settled.length - hits.length,
      hitRate: settled.length > 0 ? ((hits.length / settled.length) * 100).toFixed(1) + '%' : 'N/A',
      bySport: {},
      byTier: {},
      byEdgeRange: {}
    };
    
    // Group by sport
    settled.forEach(p => {
      const sport = p.sport || 'unknown';
      if (!stats.bySport[sport]) {
        stats.bySport[sport] = { total: 0, hits: 0 };
      }
      stats.bySport[sport].total++;
      if (p.hit) stats.bySport[sport].hits++;
    });
    
    // Group by tier
    settled.forEach(p => {
      const tier = p.tier || 'unknown';
      if (!stats.byTier[tier]) {
        stats.byTier[tier] = { total: 0, hits: 0 };
      }
      stats.byTier[tier].total++;
      if (p.hit) stats.byTier[tier].hits++;
    });
    
    res.json(stats);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║  🏆 SBA GENIUS PROXY SERVER - RUNNING                                ║
╠═══════════════════════════════════════════════════════════════════════╣
║  Port: ${PORT}                                                           ║
║                                                                       ║
║  Endpoints:                                                           ║
║  • POST /grok           - SOCIAL PULSE™ (Twitter sentiment)          ║
║  • GET  /odds/:sport    - MARKET CONSENSUS™ (multi-book odds)        ║
║  • GET  /espn/:sport    - LIVE FEED™ (real-time stats)              ║
║  • POST /rlm/detect     - Reverse Line Movement detector             ║
║  • POST /track/prediction - Historical tracking                       ║
║  • GET  /track/stats    - Performance statistics                      ║
╚═══════════════════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
