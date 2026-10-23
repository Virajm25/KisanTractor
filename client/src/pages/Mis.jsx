import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { useApi } from '../api.js';
import { downloadCsv } from '../utils.js';
import { Filters, Loading, Title, Toast } from '../components/Page.jsx';

function pathFor(points, max = 1.5, w = 600, h = 170) {
  const pts = points.map((p, i) => [(i / (points.length - 1)) * w, h - (p.value / max) * h]);
  let d = `M${pts[0][0]} ${pts[0][1].toFixed(0)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const cx = (x0 + x1) / 2;
    d += ` C${cx.toFixed(0)} ${y0.toFixed(0)} ${cx.toFixed(0)} ${y1.toFixed(0)} ${x1.toFixed(0)} ${y1.toFixed(0)}`;
  }
  return d;
}

export default function Mis() {
  const state = useApi('/mis');
  const [toast, setToast] = useState('');
  const m = state.data;
  if (!m) return <div className="page"><Loading state={state} /></div>;
  const line = pathFor(m.salesTrend);

  return (
    <div className="page">
      <Title eyebrow="Reports / Management MIS" title="Business MIS" subtitle="A monthly view of the operating position, not just the ledger">
        <button className="primary-btn" data-testid="export-mis" onClick={() => {
          downloadCsv(`management-mis-${m.month.replace(' ', '-').toLowerCase()}.csv`, [
            ['Management MIS', m.month],
            [],
            ['Monthly sales (₹ Cr)'], ...m.salesTrend.map((p) => [p.month, p.value]),
            [],
            ['Plan versus actual', 'Value', 'Achievement %'], ...m.planVsActual.map((r) => [r.label, r.text, r.pct]),
            [],
            ['KPI', 'Value', 'Note'], ...m.kpis.map((k) => [k.label, k.value, k.note]),
          ]);
          setToast('MIS exported');
        }}>
          <FileText size={14} /> Export MIS
        </button>
      </Title>

      <Filters
        items={[`Month: ${m.month}`, 'Plant: All plants', 'Product: All products', 'Business type: All', 'Customer: All', 'Vendor: All']}
        date="09 Sep 2026"
      />

      <div className="mis-grid top-gap">
        <div className="panel chart-panel">
          <div className="panel-head">
            <div><div className="eyebrow">Sales trend</div><h2>Monthly sales value</h2></div>
            <span className="chart-value">{m.salesTotal}</span>
          </div>
          <div className="chart sales-chart">
            <div className="chart-y"><span>1.5 Cr</span><span>1 Cr</span><span>50 L</span><span>0</span></div>
            <div className="chart-plot">
              <div className="grid-lines"><i /><i /><i /><i /></div>
              <svg viewBox="0 0 600 170" preserveAspectRatio="none">
                <path d={line} fill="none" stroke="#4A7C59" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                <path d={`${line} L600 170 L0 170Z`} fill="rgba(74,124,89,.09)" />
              </svg>
              <div className="chart-x">{m.salesTrend.map((p) => <span key={p.month}>{p.month}</span>)}</div>
            </div>
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-head"><div><div className="eyebrow">Operating mix</div><h2>Plan versus actual</h2></div></div>
          {m.planVsActual.map((r) => (
            <div className="mis-line" key={r.label}>
              <div><span>{r.label}</span><strong>{r.text}</strong></div>
              <div className="progress"><i className={`fill-${r.tone}`} style={{ width: `${r.pct}%` }} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="mis-kpis">
        {m.kpis.map((k) => (
          <div key={k.label}>
            <span>{k.label}</span><strong>{k.value}</strong><small className={k.tone ? `text-${k.tone}` : ''}>{k.note}</small>
          </div>
        ))}
      </div>
      {toast && <Toast text={toast} onDone={() => setToast('')} />}
    </div>
  );
}
