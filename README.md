# NEXORA — Virtual Mining & Crypto Market Demo

Premium black, metallic-gold and champagne-gold React starter for the NEXORA brand.

## Included in this starter
- Responsive luxury dashboard and consistent animated gold NEXORA coin motif
- Demo-only 24-hour mining timer and virtual NXR balance (browser storage)
- Cryptocurrency market data attempt via CoinGecko public market endpoint
- Search, watchlist, market table, demo portfolio, activity screen
- Illustrative admin interface for local demo coin credits and demo investment records
- No real deposits, withdrawals, trades or blockchain mining

## Run locally
Requirements: Node.js 20+ recommended.

```bash
npm install
npm run dev
```

## Important limitations before deployment
This is a UI starter, **not production-ready financial software**.

- Demo balance, mining timer, watchlist and admin controls use browser storage/local state and are not multi-user database records.
- The Admin screen is only a prototype. It has no secure admin authentication or server-side authorization. Do not expose it as a real admin system.
- The browser calls CoinGecko's public market endpoint. Availability, CORS, rate limits and refresh frequency may vary. For production, use a server-side API route and cache, and protect any API key in server environment variables.
- Before multi-user operation, configure Supabase Auth, PostgreSQL tables, Row Level Security, server-side reward calculations, atomic/unique reward claims, immutable transaction ledger, role-based admin authorization and audit logs.
- NXR is a virtual demo coin and has no real market value. Demo investment records are hypothetical and do not represent money received.
- Do not add real deposits, withdrawals, investment promises or real trading without appropriate legal/compliance review and a secure, independently tested implementation.

## Google AI Studio
You can use this source as a visual/functional reference or import the project into a GitHub repository and continue building. Google AI Studio access is not controlled by this generated bundle; you will need to open your own account to run or deploy it.
