# SBA GENIUS PROXY SERVER

Proxy server for SBA GENIUS synthesis engine - enables SOCIAL PULSE™, MARKET CONSENSUS™, and LIVE FEED™.

## Endpoints

- `POST /grok` - SOCIAL PULSE™ (Twitter sentiment via Grok)
- `GET /odds/:sport` - MARKET CONSENSUS™ (multi-book odds)
- `GET /espn/:sport/scoreboard` - LIVE FEED™ (real-time stats)
- `POST /rlm/detect` - Reverse Line Movement detector
- `POST /track/prediction` - Historical tracking
- `GET /track/stats` - Performance statistics

## Deployment

### Deploy to Render

1. Fork/clone this repo
2. Go to https://render.com
3. Create new Web Service from this repo
4. Add environment variables in Render dashboard:
   - `GROK_API_KEY` = your xAI API key
   - `ODDS_API_KEY` = your Odds API key (optional)
   - `PORT` = 3000

### Deploy to Railway

1. Fork/clone this repo
2. Go to https://railway.app
3. Create new project from GitHub
4. Add environment variables in Railway dashboard

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROK_API_KEY` | Yes | xAI API key for Grok |
| `ODDS_API_KEY` | No | The Odds API key |
| `PORT` | No | Server port (default: 3000) |

## Testing

Once deployed, test with:

```bash
# Health check
curl https://your-app.onrender.com/

# Test ESPN
curl https://your-app.onrender.com/espn/nba/scoreboard
```

## License

MIT
