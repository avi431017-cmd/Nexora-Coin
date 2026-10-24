import { useEffect, useMemo, useState } from 'react'
import {
  Activity, ArrowDownRight, ArrowUpRight, BarChart3, Bell, Check,
  ChevronDown, CircleHelp, Coins, Crown, Gauge, Gem, LayoutDashboard,
  Menu, Search, Settings, ShieldCheck, Sparkles, Timer, Users, Wallet,
  X, Zap
} from 'lucide-react'

type Coin = {
  id: string; symbol: string; name: string; image?: string;
  current_price: number; price_change_percentage_24h: number;
  market_cap: number; total_volume: number
}
type Tab = 'Overview' | 'Mining' | 'Markets' | 'Portfolio' | 'Transactions' | 'Admin'

const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: n < 1 ? 6 : 2 })
const usd = (n: number) => '$' + fmt(n)
const initialCoins: Coin[] = [
  { id:'bitcoin', symbol:'btc', name:'Bitcoin', current_price:67240, price_change_percentage_24h:2.41, market_cap:1320000000000, total_volume:32000000000 },
  { id:'ethereum', symbol:'eth', name:'Ethereum', current_price:2540, price_change_percentage_24h:1.23, market_cap:305000000000, total_volume:12500000000 },
  { id:'solana', symbol:'sol', name:'Solana', current_price:151.2, price_change_percentage_24h:-0.84, market_cap:69000000000, total_volume:2800000000 },
  { id:'binancecoin', symbol:'bnb', name:'BNB', current_price:592.1, price_change_percentage_24h:0.61, market_cap:86000000000, total_volume:1100000000 },
  { id:'ripple', symbol:'xrp', name:'XRP', current_price:0.542, price_change_percentage_24h:-1.16, market_cap:30500000000, total_volume:950000000 },
  { id:'dogecoin', symbol:'doge', name:'Dogecoin', current_price:0.164, price_change_percentage_24h:4.72, market_cap:23500000000, total_volume:1700000000 },
  { id:'cardano', symbol:'ada', name:'Cardano', current_price:0.451, price_change_percentage_24h:0.32, market_cap:16000000000, total_volume:390000000 },
  { id:'avalanche-2', symbol:'avax', name:'Avalanche', current_price:35.4, price_change_percentage_24h:-2.08, market_cap:13900000000, total_volume:270000000 }
]
const menu: {label:Tab; icon:any}[] = [
  {label:'Overview', icon:LayoutDashboard}, {label:'Mining', icon:Zap},
  {label:'Markets', icon:BarChart3}, {label:'Portfolio', icon:Wallet},
  {label:'Transactions', icon:Activity}, {label:'Admin', icon:ShieldCheck}
]

function NexoraCoin({ size = 78 }: { size?: number }) {
  return <div className="coin-wrap" style={{ width:size, height:size }} aria-label="NEXORA gold coin">
    <div className="coin">
      <div className="coin-rim"><div className="coin-face">
        <div className="coin-crown">♛</div><div className="coin-n">N</div><div className="coin-word">NEXORA</div>
      </div></div>
    </div>
  </div>
}

function App() {
  const [tab, setTab] = useState<Tab>('Overview')
  const [coins, setCoins] = useState<Coin[]>(initialCoins)
  const [marketLive, setMarketLive] = useState(false)
  const [query, setQuery] = useState('')
  const [watchlist, setWatchlist] = useState<string[]>(['bitcoin','ethereum'])
  const [mining, setMining] = useState<{startedAt:number; endsAt:number}|null>(() => {
    try { return JSON.parse(localStorage.getItem('nexora-mining') || 'null') } catch { return null }
  })
  const [now, setNow] = useState(Date.now())
  const [balance, setBalance] = useState(() => Number(localStorage.getItem('nexora-balance') || 1250))
  const [showNotice, setShowNotice] = useState(true)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [adminAmount, setAdminAmount] = useState('500')
  const [adminUser, setAdminUser] = useState('demo-user-001')
  const [demoRecords, setDemoRecords] = useState([
    { user:'demo-user-001', amount:100, currency:'USD', plan:'Gold Demo', date:'2026-10-20', status:'DEMO' },
    { user:'demo-user-002', amount:250, currency:'USD', plan:'Starter Demo', date:'2026-10-22', status:'DEMO' }
  ])
  const [toast, setToast] = useState('')

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    localStorage.setItem('nexora-balance', String(balance))
  }, [balance])

  useEffect(() => {
    if (mining) localStorage.setItem('nexora-mining', JSON.stringify(mining))
    else localStorage.removeItem('nexora-mining')
  }, [mining])

  useEffect(() => {
    let cancelled = false
    async function loadMarket() {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h')
        if (!response.ok) throw new Error('Market provider unavailable')
        const data = await response.json()
        if (!cancelled && Array.isArray(data) && data.length) {
          setCoins(data); setMarketLive(true)
        }
      } catch { if (!cancelled) setMarketLive(false) }
    }
    loadMarket()
    const id = window.setInterval(loadMarket, 120000)
    return () => { cancelled = true; window.clearInterval(id) }
  }, [])

  useEffect(() => {
    if (mining && now >= mining.endsAt) {
      // Demo-only local reward. Production must use a server-side atomic ledger.
      setBalance(v => v + 25)
      setMining(null)
      setToast('Demo mining session completed: +25 virtual NXR')
    }
  }, [now, mining])

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(''), 3500)
    return () => window.clearTimeout(id)
  }, [toast])

  const remaining = mining ? Math.max(0, Math.floor((mining.endsAt - now)/1000)) : 0
  const countdown = `${String(Math.floor(remaining/3600)).padStart(2,'0')}:${String(Math.floor((remaining%3600)/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`
  const filteredCoins = useMemo(() => coins.filter(c => `${c.name} ${c.symbol}`.toLowerCase().includes(query.toLowerCase())), [coins, query])
  const market = coins.slice(0, 6)
  const go = (next:Tab) => { setTab(next); setMobileMenu(false) }
  const startMining = () => {
    if (mining) return
    setMining({ startedAt:Date.now(), endsAt:Date.now() + 24*60*60*1000 })
    setToast('Demo mining started. This creates virtual coins only.')
  }
  const creditDemo = () => {
    const n = Number(adminAmount)
    if (!Number.isFinite(n) || n <= 0 || n > 100000000) { setToast('Enter a valid positive demo amount.'); return }
    setBalance(v => v + n)
    setToast(`${fmt(n)} virtual NXR credited to this browser demo balance.`)
  }
  const addRecord = () => {
    const n = Number(adminAmount)
    if (!Number.isFinite(n) || n <= 0) return setToast('Enter a valid demo amount.')
    setDemoRecords(r => [{user:adminUser, amount:n, currency:'USD', plan:'Admin-created Demo', date:new Date().toISOString().slice(0,10), status:'DEMO'}, ...r])
    setToast('Demo investment record added. No money was received.')
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu?'open':''}`}>
      <div className="brand"><NexoraCoin size={42}/><div><strong>NEXORA</strong><span>MINE THE FUTURE</span></div><button className="icon-btn close-menu" onClick={()=>setMobileMenu(false)}><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{menu.map(item => { const Icon=item.icon; return <button key={item.label} className={`nav-item ${tab===item.label?'active':''}`} onClick={()=>go(item.label)}><Icon size={18}/><span>{item.label}</span>{item.label==='Markets'&&<span className="nav-pill">LIVE</span>}</button> })}</nav>
      <div className="sidebar-bottom"><div className="help-card"><CircleHelp size={18}/><div><b>Need help?</b><span>Explore the demo</span></div></div><div className="profile-mini"><div className="avatar">D</div><div><b>Demo User</b><span>Free member</span></div><ChevronDown size={16}/></div></div>
    </aside>
    {mobileMenu && <div className="scrim" onClick={()=>setMobileMenu(false)} />}
    <main className="main">
      <header className="topbar">
        <button className="icon-btn menu-toggle" onClick={()=>setMobileMenu(true)}><Menu size={20}/></button>
        <div className="breadcrumb">Workspace <span>/</span> <b>{tab}</b></div>
        <div className="top-actions"><span className={`market-status ${marketLive?'online':''}`}><i/> {marketLive?'Market data connected':'Market demo data'}</span><button className="icon-btn" aria-label="Notifications" onClick={()=>setToast('You are all caught up.')}><Bell size={18}/></button><div className="avatar small">D</div></div>
      </header>
      <div className="content">
        {showNotice && <div className="demo-notice"><Sparkles size={16}/><span><b>DEMO ENVIRONMENT</b> · NXR is a virtual demo coin. No real funds, deposits, trading or blockchain mining.</span><button onClick={()=>setShowNotice(false)} aria-label="Dismiss"><X size={16}/></button></div>}
        {tab==='Overview' && <>
          <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line"/> NEXORA ECOSYSTEM</div><h1>Welcome to <em>NEXORA.</em></h1><p>Your digital mining journey starts here. Track virtual rewards and explore the crypto market.</p></div><div className="welcome-coin"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><NexoraCoin size={130}/></div></section>
          <section className="stats-grid">
            <div className="stat-card balance-card"><div className="stat-head"><span>Virtual NXR Balance</span><Coins size={18}/></div><div className="balance-number">{fmt(balance)} <small>NXR</small></div><div className="stat-foot"><span className="gold-dot"/> Demo balance only</div><div className="balance-watermark"><NexoraCoin size={100}/></div></div>
            <div className="stat-card"><div className="stat-head"><span>Mining Status</span><Gauge size={18}/></div><div className="stat-value">{mining?'Active':'Idle'}</div><div className="stat-foot">{mining?'Session in progress':'Ready to start a demo session'}</div><div className={`status-chip ${mining?'active-chip':''}`}><i/>{mining?'MINING':'STANDBY'}</div></div>
            <div className="stat-card"><div className="stat-head"><span>Virtual Rewards Earned</span><Gem size={18}/></div><div className="stat-value">+{fmt(Math.max(0,balance-1250))} <small>NXR</small></div><div className="stat-foot">Since this demo began</div><div className="stat-icon"><Sparkles size={22}/></div></div>
            <div className="stat-card"><div className="stat-head"><span>Market Watch</span><Activity size={18}/></div><div className="stat-value">{coins.length || '—'} <small>assets</small></div><div className="stat-foot">Provider data when available</div><div className="stat-icon"><BarChart3 size={22}/></div></div>
          </section>
          <section className="feature-grid">
            <div className="panel mining-panel"><div className="panel-top"><div><div className="eyebrow">VIRTUAL MINING</div><h2>Your mining station</h2></div><span className={`status-chip ${mining?'active-chip':''}`}><i/>{mining?'ACTIVE':'READY'}</span></div><div className="mining-center"><div className={`coin-stage ${mining?'is-mining':''}`}><div className="coin-glow"/><NexoraCoin size={112}/></div><div className="mining-speed"><span>DEMO HASHRATE</span><b>25 <small>H/s</small></b></div></div><div className="timer-box"><Timer size={17}/><span>{mining?'SESSION ENDS IN':'SESSION DURATION'}</span><b>{mining?countdown:'24:00:00'}</b></div><button className="primary-btn full" onClick={startMining} disabled={!!mining}><Zap size={17}/>{mining?'Mining session active':'Start free demo mining'}</button><p className="tiny-note">Completion reward: 25 virtual NXR · Simulation only</p></div>
            <div className="panel market-panel"><div className="panel-top"><div><div className="eyebrow">MARKET PULSE</div><h2>Top crypto assets</h2></div><button className="text-btn" onClick={()=>go('Markets')}>View all <ArrowUpRight size={15}/></button></div><div className="coin-list">{market.map(c=><CoinRow key={c.id} coin={c} onClick={()=>go('Markets')}/>)}</div><div className="market-foot"><span className={`tiny-live ${marketLive?'live':'demo'}`}><i/>{marketLive?'Provider market data':'Fallback sample data'}</span><span>Refresh ~2 min</span></div></div>
          </section>
          <section className="panel lower-market"><div className="panel-top"><div><div className="eyebrow">MARKET OVERVIEW</div><h2>Explore digital assets</h2></div><button className="secondary-btn" onClick={()=>go('Markets')}>Explore market <ArrowUpRight size={15}/></button></div><MarketTable coins={coins.slice(0,5)} watchlist={watchlist} toggleWatch={id=>setWatchlist(w=>w.includes(id)?w.filter(x=>x!==id):[...w,id])}/></section>
        </>}
        {tab==='Mining' && <><PageTitle eyebrow="VIRTUAL REWARDS" title="Mining station" description="Run a simulated mining session and earn virtual NXR for this demo."/><div className="mining-page-grid"><div className="panel mining-panel large-mining"><div className="mining-center"><div className={`coin-stage ${mining?'is-mining':''}`}><div className="coin-glow"/><NexoraCoin size={160}/></div><div className="eyebrow">NEXORA VIRTUAL NETWORK</div><h2>{mining?'Your session is running':'Ready when you are'}</h2><p>Simulated mining · No real blockchain activity</p></div><div className="timer-box"><Timer size={17}/><span>{mining?'TIME REMAINING':'SESSION LENGTH'}</span><b>{mining?countdown:'24:00:00'}</b></div><button className="primary-btn full" onClick={startMining} disabled={!!mining}><Zap size={17}/>{mining?'Session active':'Start demo mining'}</button></div><div className="panel info-panel"><div className="eyebrow">SESSION DETAILS</div><h2>Mining summary</h2><div className="detail-row"><span>Virtual hashrate</span><b>25 H/s</b></div><div className="detail-row"><span>Expected demo reward</span><b>25 NXR</b></div><div className="detail-row"><span>Session duration</span><b>24 hours</b></div><div className="detail-row"><span>Current balance</span><b>{fmt(balance)} NXR</b></div><div className="notice-box"><ShieldCheck size={18}/><span>This demo uses local browser storage. A secure server and database are required before multi-user use.</span></div></div></div></>}
        {tab==='Markets' && <><PageTitle eyebrow="CRYPTO MARKET" title="Market explorer" description="Browse market prices from the configured provider. Values are informational, not trading advice."/><div className="market-tools"><div className="searchbox"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search coin name or symbol..."/></div><div className="provider-badge"><i className={marketLive?'good':''}/>{marketLive?'Live provider data':'Fallback sample data'}</div></div><div className="panel"><MarketTable coins={filteredCoins} watchlist={watchlist} toggleWatch={id=>setWatchlist(w=>w.includes(id)?w.filter(x=>x!==id):[...w,id])}/><div className="table-foot">Prices in USD · Last fetched {marketLive?'from market provider':'sample fallback values'} · API availability and rate limits may affect updates.</div></div></>}
        {tab==='Portfolio' && <><PageTitle eyebrow="VIRTUAL ASSETS" title="Demo portfolio" description="Track simulated holdings using available market data. No real assets are held."/><div className="stats-grid two"><div className="stat-card balance-card"><div className="stat-head"><span>Virtual NXR</span><Coins size={18}/></div><div className="balance-number">{fmt(balance)} <small>NXR</small></div><div className="stat-foot">Not transferable · Demo only</div></div><div className="stat-card"><div className="stat-head"><span>Watchlist assets</span><Gem size={18}/></div><div className="stat-value">{watchlist.length}</div><div className="stat-foot">Saved in this session</div></div></div><div className="panel"><div className="panel-top"><div><div className="eyebrow">WATCHLIST</div><h2>Your favourite coins</h2></div><button className="text-btn" onClick={()=>go('Markets')}>Manage watchlist <ArrowUpRight size={15}/></button></div><MarketTable coins={coins.filter(c=>watchlist.includes(c.id))} watchlist={watchlist} toggleWatch={id=>setWatchlist(w=>w.includes(id)?w.filter(x=>x!==id):[...w,id])}/></div></>}
        {tab==='Transactions' && <><PageTitle eyebrow="ACTIVITY LEDGER" title="Transaction history" description="Sample activity from this local demo. Production needs a server-side immutable ledger."/><div className="panel"><div className="panel-top"><div><div className="eyebrow">RECENT ACTIVITY</div><h2>Virtual transactions</h2></div><span className="demo-badge">DEMO DATA</span></div><div className="transaction-row"><div className="tx-icon"><Coins size={18}/></div><div className="tx-main"><b>Initial demo balance</b><span>Virtual NXR · Browser demo</span></div><b className="positive">+1,250 NXR</b><span className="tx-date">Initial</span></div>{balance>1250&&<div className="transaction-row"><div className="tx-icon"><Sparkles size={18}/></div><div className="tx-main"><b>Demo reward / admin adjustment</b><span>Virtual NXR · Not a real transaction</span></div><b className="positive">+{fmt(balance-1250)} NXR</b><span className="tx-date">Updated locally</span></div>}<div className="table-foot">This starter stores demo data in your browser only. It is not an authoritative financial record.</div></div></>}
        {tab==='Admin' && <><PageTitle eyebrow="CONTROL CENTER" title="Admin console" description="Illustrative admin interface only. Secure role-based access is not configured in this starter."/><div className="admin-warning"><ShieldCheck size={19}/><span><b>Prototype mode:</b> These controls affect only this browser. Do not use this page for real users until server-side authentication, authorization, and audit logging are implemented.</span></div><div className="stats-grid"><div className="stat-card"><div className="stat-head"><span>Registered users</span><Users size={18}/></div><div className="stat-value">2 <small>sample</small></div><div className="stat-foot">Example data only</div></div><div className="stat-card"><div className="stat-head"><span>Virtual NXR in this browser</span><Coins size={18}/></div><div className="stat-value">{fmt(balance)}</div><div className="stat-foot">Local demo balance</div></div><div className="stat-card"><div className="stat-head"><span>Demo investment records</span><Wallet size={18}/></div><div className="stat-value">{demoRecords.length}</div><div className="stat-foot">Not real deposits</div></div></div><div className="admin-grid"><div className="panel"><div className="eyebrow">VIRTUAL COIN MANAGEMENT</div><h2>Credit demo NXR</h2><label className="field-label">Demo user ID<input value={adminUser} onChange={e=>setAdminUser(e.target.value)} /></label><label className="field-label">Virtual coin amount<input type="number" min="1" value={adminAmount} onChange={e=>setAdminAmount(e.target.value)} /></label><button className="primary-btn full" onClick={creditDemo}><Coins size={17}/>Credit virtual coins</button><p className="tiny-note">This prototype action changes only the local demo balance. It does not change any real user account.</p></div><div className="panel"><div className="eyebrow">DEMO INVESTMENT RECORDS</div><h2>Add demo record</h2><p className="muted">Record a hypothetical amount for UI testing. No money is collected.</p><button className="secondary-btn full" onClick={addRecord}>+ Add demo investment record</button><div className="record-list">{demoRecords.map((r,i)=><div className="record-row" key={i}><div><b>{r.user}</b><span>{r.plan} · {r.date}</span></div><div className="record-amount">${fmt(r.amount)}<small>{r.status} ONLY</small></div></div>)}</div></div></div></>}
        <footer className="footer"><div className="footer-brand"><NexoraCoin size={28}/><b>NEXORA</b><span>· MINE THE FUTURE</span></div><span>Virtual mining demo · Market data may be delayed</span><span>© 2026 NEXORA Demo</span></footer>
      </div>
    </main>
    {toast && <div className="toast"><Check size={17}/>{toast}<button onClick={()=>setToast('')}><X size={15}/></button></div>}
  </div>
}

function PageTitle({eyebrow,title,description}:{eyebrow:string;title:string;description:string}) {
  return <section className="page-title"><div className="eyebrow"><span className="eyebrow-line"/>{eyebrow}</div><h1>{title}</h1><p>{description}</p></section>
}

function CoinRow({coin,onClick}:{coin:Coin;onClick:()=>void}) {
  const positive = coin.price_change_percentage_24h >= 0
  return <button className="coin-row" onClick={onClick}><div className="asset-icon">{coin.image?<img src={coin.image} alt="" loading="lazy"/>:<span>{coin.symbol.slice(0,1).toUpperCase()}</span>}</div><div className="asset-name"><b>{coin.name}</b><span>{coin.symbol.toUpperCase()}</span></div><div className="asset-price"><b>{usd(coin.current_price)}</b><span className={positive?'positive':'negative'}>{positive?'+':''}{fmt(coin.price_change_percentage_24h)}%</span></div></button>
}

function MarketTable({coins,watchlist,toggleWatch}:{coins:Coin[];watchlist:string[];toggleWatch:(id:string)=>void}) {
  return <div className="table-scroll"><table><thead><tr><th>Asset</th><th>Price</th><th>24h change</th><th>Market cap</th><th>24h volume</th><th>Watchlist</th></tr></thead><tbody>{coins.map(c=>{const positive=c.price_change_percentage_24h>=0;return <tr key={c.id}><td><div className="table-asset"><div className="asset-icon">{c.image?<img src={c.image} alt="" loading="lazy"/>:<span>{c.symbol.slice(0,1).toUpperCase()}</span>}</div><div><b>{c.name}</b><span>{c.symbol.toUpperCase()}</span></div></div></td><td className="price-cell">{usd(c.current_price)}</td><td><span className={`change ${positive?'up':'down'}`}>{positive?<ArrowUpRight size={14}/>:<ArrowDownRight size={14}/>} {positive?'+':''}{fmt(c.price_change_percentage_24h)}%</span></td><td>{usd(c.market_cap)}</td><td>{usd(c.total_volume)}</td><td><button className={`watch-btn ${watchlist.includes(c.id)?'saved':''}`} onClick={()=>toggleWatch(c.id)} aria-label="Toggle watchlist">{watchlist.includes(c.id)?'★':'☆'}</button></td></tr>})}{!coins.length&&<tr><td colSpan={6} className="empty-state">No matching coins found.</td></tr>}</tbody></table></div>
}

export default App
