import React, { useState } from 'react';
import { Info, Plus } from 'lucide-react';
import { api, useApi } from '../api.js';
import { FormModal } from '../components/Modal.jsx';
import { Loading, Title, Toast } from '../components/Page.jsx';

const lakh = (n) => `₹${n.toFixed(1)}L`;

export default function Trading() {
  const state = useApi('/trading');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState(false);
  const d = state.data;
  if (!d) return <div className="page"><Loading state={state} /></div>;

  return (
    <div className="page">
      <Title eyebrow="Transactions / Trading" title="Trading Position" subtitle="A separate view for component trading alongside machine manufacturing">
        <button className="primary-btn" data-testid="new-trading-order" onClick={() => setModal(true)}>
          <Plus size={14} /> New trading order
        </button>
      </Title>

      <div className="metric-grid trading-metrics">
        {d.summary.cards.map((c) => (
          <div className="metric trading-metric" key={c.label}>
            <span>{c.label}</span><strong>{c.value}</strong>
            <small className={c.tone ? `text-${c.tone}` : ''} style={c.tone ? undefined : { color: 'var(--muted)' }}>{c.note}</small>
          </div>
        ))}
      </div>

      <div className="panel table-panel top-gap">
        <div className="panel-head">
          <div><div className="eyebrow">Trading book</div><h2>Component margin by item</h2></div>
          <div className="table-count">Trading only</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Item</th><th>Purchase value</th><th>Sales value</th><th>Margin</th><th>Margin %</th></tr></thead>
            <tbody>
              {d.items.map((t) => {
                const m = t.sales - t.purchase;
                const pct = (m / t.purchase) * 100;
                return (
                  <tr key={t._id}>
                    <td><strong>{t.item}</strong></td><td>{lakh(t.purchase)}</td><td>{lakh(t.sales)}</td>
                    <td>{lakh(m)}</td><td className={pct >= 15 ? 'text-green' : 'text-amber'}>{pct.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="trade-note">
        <Info size={18} />
        <div>
          <strong>Trading and manufacturing remain distinct</strong>
          <span>Trading stock does not enter the Model X production cost roll-up.</span>
        </div>
      </div>
      {modal && (
        <FormModal
          eyebrow="Trading" title="New trading order" submitLabel="Create order" onClose={() => setModal(false)}
          fields={[
            { name: 'item', label: 'Component / item', placeholder: 'e.g. Component D' },
            { name: 'purchase', label: 'Purchase value (₹ Lakh)', type: 'number', min: 0, step: '0.1', half: true },
            { name: 'sales', label: 'Sales value (₹ Lakh)', type: 'number', min: 0, step: '0.1', half: true },
          ]}
          onSubmit={async (v) => {
            const r = await api('/trading-items', { method: 'POST', body: JSON.stringify(v) });
            state.reload();
            setToast(`${r.item} added to trading book`);
          }}
        />
      )}
      {toast && <Toast text={toast} onDone={() => setToast('')} />}
    </div>
  );
}
