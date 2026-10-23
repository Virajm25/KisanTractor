import React, { useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  Banknote, BarChart3, Bell, Boxes, CalendarCheck, CalendarOff, ChevronDown, ChevronRight, CircleDollarSign,
  ClipboardList, Factory, FileText, LayoutDashboard, LineChart, Menu, Package, Percent, Scale, Search, Settings2,
  ShieldCheck, ShoppingCart, TrendingUp, Truck, UserCheck, Users, WalletCards, X,
} from 'lucide-react';
import { api, initials, useApi } from './api.js';
import Dashboard from './pages/Dashboard.jsx';
import Procurement from './pages/Procurement.jsx';
import Dispatch from './pages/Dispatch.jsx';
import Inventory from './pages/Inventory.jsx';
import Production from './pages/Production.jsx';
import Quality from './pages/Quality.jsx';
import Trading from './pages/Trading.jsx';
import Bom from './pages/Bom.jsx';
import Mis from './pages/Mis.jsx';
import Cost from './pages/Cost.jsx';
import Consumption from './pages/Consumption.jsx';
import Roles from './pages/Roles.jsx';

const NAV = [
  { group: 'Business Control', items: [{ key: 'business-control-dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/' }] },
  {
    group: 'Transactions',
    items: [
      { key: 'transactions-purchase', label: 'Purchase', icon: ShoppingCart, to: '/procurement' },
      { key: 'transactions-sales', label: 'Sales', icon: FileText, to: '/dispatch' },
      { key: 'transactions-inventory', label: 'Inventory', icon: Boxes, to: '/inventory' },
      { key: 'transactions-production', label: 'Production', icon: Factory, to: '/production' },
      { key: 'transactions-quality', label: 'Quality', icon: ShieldCheck, to: '/quality' },
      { key: 'transactions-trading', label: 'Trading', icon: Package, to: '/trading' },
      { key: 'transactions-dispatch', label: 'Dispatch', icon: Truck, to: '/dispatch' },
    ],
  },
  {
    group: 'Masters',
    items: [
      { key: 'masters-items', label: 'Items', icon: Settings2, to: '/inventory' },
      { key: 'masters-products-bom', label: 'Products / BOM', icon: ClipboardList, to: '/bom' },
      { key: 'masters-customers', label: 'Customers', icon: Users, to: '/dispatch' },
      { key: 'masters-vendors', label: 'Vendors', icon: Users, to: '/procurement' },
      { key: 'masters-warehouses', label: 'Warehouses', icon: Boxes, to: '/inventory' },
    ],
  },
  {
    group: 'Finance',
    items: [
      { key: 'finance-receivables', label: 'Receivables', icon: CircleDollarSign, to: '/mis' },
      { key: 'finance-payables', label: 'Payables', icon: WalletCards, to: '/mis' },
      { key: 'finance-expenses', label: 'Expenses', icon: Banknote, to: '/cost' },
      { key: 'finance-closing', label: 'Closing', icon: CalendarCheck, to: '/mis' },
    ],
  },
  {
    group: 'People',
    items: [
      { key: 'people-employees', label: 'Employees', icon: Users, to: '/roles' },
      { key: 'people-attendance', label: 'Attendance', icon: UserCheck, to: '/roles' },
      { key: 'people-leave', label: 'Leave', icon: CalendarOff, to: '/roles' },
    ],
  },
  {
    group: 'Reports',
    items: [
      { key: 'reports-inventory', label: 'Inventory', icon: BarChart3, to: '/inventory' },
      { key: 'reports-purchase', label: 'Purchase', icon: ShoppingCart, to: '/procurement' },
      { key: 'reports-production', label: 'Production', icon: Factory, to: '/production' },
      { key: 'reports-sales', label: 'Sales', icon: TrendingUp, to: '/dispatch' },
      { key: 'reports-variance', label: 'Variance', icon: Scale, to: '/consumption' },
      { key: 'reports-margin', label: 'Margin', icon: Percent, to: '/cost' },
      { key: 'reports-management-mis', label: 'Management MIS', icon: LineChart, to: '/mis' },
    ],
  },
];

const flat = NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.group })));

function Sidebar({ open, onClose, active, onGo }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><Factory size={19} /></div>
        <div>
          <strong>KISAN<span>TRACTOR</span></strong>
          <small>Implements Ltd.</small>
        </div>
        <button className="mobile-close" data-testid="close-menu" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="plant-chip">
        <span className="status-dot" />
        <div><small>Active plant</small><strong>Plant 01 · Rajkot</strong></div>
        <ChevronDown size={14} />
      </div>
      <nav>
        {NAV.map((g) => (
          <div className="nav-group" key={g.group}>
            <div className="nav-label">{g.group}</div>
            {g.items.map((i) => {
              const Icon = i.icon;
              return (
                <button
                  key={i.key}
                  data-testid={`nav-${i.key}`}
                  className={`nav-item ${active === i.key ? 'active' : ''}`}
                  onClick={() => onGo(i)}
                >
                  <Icon size={15} /> {i.label}
                  {active === i.key && <span className="nav-pip" />}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="sidebar-foot">
        <div className="prototype-label"><span className="prototype-dot" /> Demo data</div>
        <div className="version">v1.0 · Plant 01</div>
      </div>
    </aside>
  );
}

function SearchBox() {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const box = useRef();

  useEffect(() => {
    if (!q.trim()) { setResults(null); return undefined; }
    const t = setTimeout(
      () => api(`/search?q=${encodeURIComponent(q)}`).then(setResults).catch(() => setResults([])),
      200,
    );
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const close = (e) => { if (!box.current?.contains(e.target)) setResults(null); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <label className="search" ref={box}>
      <Search size={15} />
      <input
        data-testid="global-search"
        placeholder="Search orders, items, customers..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {results && (
        <div className="search-results">
          {results.length === 0 && <div className="empty">No matches</div>}
          {results.map((r, i) => (
            <button key={i} onClick={() => { nav(r.to); setQ(''); setResults(null); }}>
              <strong>{r.label}</strong><span>{r.type} · {r.sub}</span>
            </button>
          ))}
        </div>
      )}
    </label>
  );
}

export default function App() {
  const loc = useLocation();
  const nav = useNavigate();
  const [menu, setMenu] = useState(false);
  const { data: me } = useApi('/me');

  const fromState = flat.find((i) => i.key === loc.state?.nav && i.to === loc.pathname);
  const current = fromState || flat.find((i) => i.to === loc.pathname);

  useEffect(() => { window.scrollTo(0, 0); setMenu(false); }, [loc.pathname]);

  const go = (i) => { nav(i.to, { state: { nav: i.key } }); setMenu(false); };

  return (
    <div className="app-shell">
      <Sidebar open={menu} onClose={() => setMenu(false)} active={current?.key} onGo={go} />
      <div className="main">
        <header className="topbar">
          <button className="mobile-menu" data-testid="open-menu" onClick={() => setMenu(true)}><Menu size={20} /></button>
          <div className="breadcrumbs">
            <span>{current?.group}</span><ChevronRight size={13} /><strong>{current?.label}</strong>
          </div>
          <div className="top-actions">
            <SearchBox />
            <button className="top-icon" data-testid="notifications-button"><Bell size={17} /><i /></button>
            <div className="user-menu" data-testid="user-profile">
              <div className="avatar">{me?.initials || initials(me?.name)}</div>
              <div><strong>{me?.name}</strong><span>{me?.role}</span></div>
              <ChevronDown size={14} />
            </div>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/procurement" element={<Procurement />} />
          <Route path="/dispatch" element={<Dispatch />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/production" element={<Production />} />
          <Route path="/quality" element={<Quality />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/bom" element={<Bom />} />
          <Route path="/mis" element={<Mis />} />
          <Route path="/cost" element={<Cost />} />
          <Route path="/consumption" element={<Consumption />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
}
