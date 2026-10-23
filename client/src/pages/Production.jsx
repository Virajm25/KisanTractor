import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { api, useApi } from '../api.js';
import { FormModal, inDays } from '../components/Modal.jsx';
import { Badge, Filters, Loading, prodTone, Title, Toast } from '../components/Page.jsx';

export default function Production() {
  const nav = useNavigate();
  const state = useApi('/production');
  const [open, setOpen] = useState(null);
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState(false);
  const orders = state.data;
  if (!orders) return <div className="page"><Loading state={state} /></div>;

  const sel = orders.find((o) => o._id === open);
  const active = orders.length;

  return (
    <div className="page">
      <Title eyebrow="Transactions / Production" title="Production Control" subtitle="Material → fabrication → assembly → machine readiness">
        <button className="primary-btn" data-testid="new-production-order" onClick={() => setModal(true)}>
          <Plus size={14} /> New production order
        </button>
      </Title>

      <Filters items={['Plant: Plant 01', 'Product: All models', 'Status: Active orders', 'As on: 09 Sep 2026']} date="09 Sep 2026" />

      <div className="panel table-panel">
        <div className="panel-head">
          <div><div className="eyebrow">Active production orders</div><h2>Plan versus floor position</h2></div>
          <div className="table-count">{String(active).padStart(2, '0')} active orders</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Production order</th><th>Product</th><th>Planned qty</th><th>Completed</th><th>WIP</th>
                <th>Material status</th><th>Production status</th><th>Expected completion</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="clickable-row" onClick={() => setOpen(o._id)}>
                  <td><span className="mono">{o._id}</span></td><td><strong>{o.product}</strong></td>
                  <td>{o.planned}</td><td>{o.completed}</td><td>{o.wip}</td>
                  <td><Badge tone={o.materialStatus === 'Material Available' ? 'green' : 'red'}>{o.materialStatus}</Badge></td>
                  <td><Badge tone={prodTone(o.status)}>{o.status}</Badge></td>
                  <td>{o.expected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sel && (
        <>
          <div className="scrim" onClick={() => setOpen(null)} />
          <aside className="detail-drawer">
            <button className="drawer-close" onClick={() => setOpen(null)}><X size={16} /></button>
            <div className="eyebrow">Production order</div>
            <h2 style={{ font: '600 22px Outfit', margin: 0 }}>{sel._id}</h2>
            <p className="subtitle">{sel.product} · {sel.plant} · Started {sel.started}</p>
            <div className="order-stats">
              <span>Planned<strong>{sel.planned}</strong></span>
              <span>Completed<strong>{sel.completed}</strong></span>
              <span>Remaining<strong>{sel.planned - sel.completed}</strong></span>
            </div>
            {sel.stages.map((s, i) => {
              const done = s.state === 'Complete';
              const current = /%$/.test(s.state);
              return (
                <div className="stage" key={s.name}>
                  <div className={`stage-dot ${done ? 'done' : current ? 'current' : ''}`}>{done ? '✓' : i + 1}</div>
                  {s.name}<em>{s.state}</em>
                </div>
              );
            })}
            <button className="outline-btn full" onClick={() => nav('/consumption')}>View material consumption</button>
          </aside>
        </>
      )}
      {modal && (
        <FormModal
          eyebrow="Production" title="New production order" submitLabel="Create order" onClose={() => setModal(false)}
          fields={[
            { name: 'product', label: 'Product', type: 'select', options: ['Harvester X', 'Harvester Y', 'Rotavator R2'].map((p) => ({ value: p, label: p })) },
            { name: 'planned', label: 'Planned quantity', type: 'number', min: 1, half: true },
            { name: 'started', label: 'Start date', type: 'date', half: true },
            { name: 'expected', label: 'Expected completion', type: 'date', defaultValue: inDays(10) },
          ]}
          onSubmit={async (v) => {
            const r = await api('/production-orders', { method: 'POST', body: JSON.stringify(v) });
            state.reload();
            setToast(`${r._id} created`);
          }}
        />
      )}
      {toast && <Toast text={toast} onDone={() => setToast('')} />}
    </div>
  );
}
