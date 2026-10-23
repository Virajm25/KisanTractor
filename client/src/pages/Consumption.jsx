import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Lightbulb } from 'lucide-react';
import { num, useApi } from '../api.js';
import { downloadCsv } from '../utils.js';
import { Loading, Title, Toast } from '../components/Page.jsx';

export default function Consumption() {
  const nav = useNavigate();
  const state = useApi('/consumption');
  const [toast, setToast] = useState('');
  const c = state.data;
  if (!c) return <div className="page"><Loading state={state} /></div>;
  const u = (r, n) => `${num(n)}${r.uom ? ` ${r.uom}` : ''}`;

  return (
    <div className="page">
      <Title eyebrow="Production / Cost Control" title="Production Consumption" subtitle={`${c.product} — Production Order ${c.order} · ${c.done} of ${c.planned} units complete`}>
        <button className="outline-btn" data-testid="export-view" onClick={() => {
          downloadCsv(`consumption-${c.order}.csv`, [
            ['Production order', c.order, c.product],
            ['Material', 'UOM', 'Standard', 'Actual', 'Variance', 'Variance %'],
            ...c.rows.map((r) => [r.material, r.uom, r.standard, r.actual, r.actual - r.standard, `${(((r.actual - r.standard) / r.standard) * 100).toFixed(1)}%`]),
          ]);
          setToast('Consumption view exported');
        }}>
          <Download size={14} /> Export view
        </button>
      </Title>

      <div className="panel table-panel">
        <div className="panel-head">
          <div><div className="eyebrow">Material issue against standard</div><h2>Actual consumption</h2></div>
          <div className="table-count">Variance review</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Material</th><th>Standard</th><th>Actual</th><th>Variance</th><th>Variance %</th></tr></thead>
            <tbody>
              {c.rows.map((r) => {
                const v = r.actual - r.standard;
                const pct = (v / r.standard) * 100;
                const cls = v > 0 ? (pct >= 5 ? 'text-red' : 'text-amber') : '';
                return (
                  <tr key={r.material}>
                    <td><strong>{r.material}</strong></td><td>{u(r, r.standard)}</td><td>{u(r, r.actual)}</td>
                    <td className={cls}>{v > 0 ? '+' : ''}{num(v)}{r.uom ? ` ${r.uom}` : ''}</td>
                    <td className={cls}>{v > 0 ? '+' : ''}{v === 0 ? 0 : pct.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="insight-box top-gap">
        <div className="insight-label">
          <Lightbulb size={20} />
          <div><div className="eyebrow">Variance insight</div><h2>{c.insight.headline}</h2></div>
        </div>
        <p>Possible reasons recorded for review by the production manager.</p>
        <div className="reason-list">{c.insight.reasons.map((r) => <span key={r}>{r}</span>)}</div>
        <button className="primary-btn" data-testid="open-cost-analysis" onClick={() => nav('/cost')}>Open cost analysis</button>
      </div>
      {toast && <Toast text={toast} onDone={() => setToast('')} />}
    </div>
  );
}
