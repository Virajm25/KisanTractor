import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { rupee, useApi } from '../api.js';
import { Loading, Title } from '../components/Page.jsx';

export default function Cost() {
  const state = useApi('/cost');
  const [period, setPeriod] = useState(null);
  const [menu, setMenu] = useState(false);
  const reports = state.data;
  if (!reports) return <div className="page"><Loading state={state} /></div>;
  const c = reports.find((r) => r.period === period) || reports[0];
  const max = Math.max(...c.bridge.map((b) => b.amount));

  return (
    <div className="page">
      <Title eyebrow="Reports / Margin" title="Cost & Variance" subtitle="Understand where standard cost becomes actual cost">
        <div className="menu-wrap">
          <button className="outline-btn" data-testid="period-select" onClick={() => setMenu(!menu)}>
            {c.period} <ChevronDown size={13} />
          </button>
          {menu && (
            <div className="menu-pop">
              {reports.map((r) => (
                <button key={r._id} className={r.period === c.period ? 'active' : ''} onClick={() => { setPeriod(r.period); setMenu(false); }}>
                  {r.period}
                </button>
              ))}
            </div>
          )}
        </div>
      </Title>

      <div className="cost-hero">
        <div>
          <div className="eyebrow">{c.product}</div>
          <h2>Profitability at a glance</h2>
          <span>Production cost per completed machine</span>
        </div>
        <div className="profit-numbers">
          <div><span>Standard cost</span><strong>{c.standardCost}</strong></div>
          <div><span>Actual cost</span><strong>{c.actualCost}</strong></div>
          <div><span>Variance</span><strong>{c.variance}</strong><small>{c.variancePct}</small></div>
          <div className="margin-number"><span>Gross margin</span><strong>{c.grossMargin}</strong><small>{c.grossMarginPct}</small></div>
        </div>
      </div>

      <div className="panel variance-panel">
        <div className="eyebrow">Cost bridge</div>
        <h2>What moved the margin</h2>
        <div className="variance-bars">
          <div className="eyebrow" style={{ color: 'var(--muted)', margin: '18px 0 4px' }}>Above standard</div>
          {c.bridge.map((b) => (
            <div className="variance-bar" key={b.label}>
              <div><span>{b.label}</span><strong>+{rupee(b.amount)}</strong></div>
              <div className="bar-track"><i style={{ width: `${(b.amount / max) * 100}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="selling-line">
          <span>Selling price<strong>{c.sellingPrice}</strong></span>
          <span>Gross margin<strong>{c.grossMargin}</strong></span>
          <span>Margin %<strong>{c.grossMarginPct}</strong></span>
        </div>
      </div>
    </div>
  );
}
