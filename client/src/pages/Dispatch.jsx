import React, { useState } from 'react';
import { ArrowUpRight, ChevronRight, CircleCheck, Clock3, FileText } from 'lucide-react';
import { api, initials, useApi } from '../api.js';
import { FormModal, inDays } from '../components/Modal.jsx';
import { Badge, Loading, Title, Toast } from '../components/Page.jsx';

const STEPS = ['Quotation', 'Order', 'Production', 'Ready', 'Dispatch', 'Invoice'];
const statusTone = (s) => ({ 'Dispatch scheduled': 'amber', 'Ready to dispatch': 'blue', Invoiced: 'green' }[s] || 'neutral');

export default function Dispatch() {
  const state = useApi('/sales');
  const [pick, setPick] = useState(null);
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState(false);
  const d = state.data;
  if (!d) return <div className="page"><Loading state={state} /></div>;

  const o = d.orders.find((x) => x._id === pick) || d.orders[0];
  const pct = Math.round((o.ready / o.qty) * 100);

  return (
    <div className="page">
      <Title eyebrow="Transactions / Sales & Dispatch" title="Orders & Dispatch" subtitle="Follow the customer promise from quotation to invoice">
        <button className="primary-btn" data-testid="new-sales-order" onClick={() => setModal(true)}>
          <FileText size={14} /> New sales order
        </button>
      </Title>

      <div className="pipeline">
        {STEPS.map((s, i) => {
          const n = i + 1;
          const cls = n < o.stage ? 'done' : n === o.stage ? 'current' : '';
          return (
            <div key={s} className={`pipeline-step ${cls}`}>
              <span>{n}</span><strong>{s}</strong>{n < STEPS.length && <ChevronRight size={15} />}
            </div>
          );
        })}
      </div>

      <div className="dispatch-layout">
        <div className="panel sales-order">
          <div className="panel-head" style={{ padding: '0 0 15px' }}>
            <div><div className="eyebrow">Selected sales order</div><h2>{o._id}</h2></div>
            <Badge tone={statusTone(o.status)}>{o.status}</Badge>
          </div>
          <div className="customer-line">
            <div className="customer-avatar">{initials(o.customer)}</div>
            <div><strong>{o.customer}</strong><span>{o.city} · Customer since {o.since}</span></div>
          </div>
          <div className="order-grid">
            <div><span>Product</span><strong>{o.product}</strong></div>
            <div><span>Quantity</span><strong>{o.qty} Units</strong></div>
            <div><span>Order value</span><strong>{o.orderValue}</strong></div>
            <div><span>Production</span><strong>{o.ready} / {o.qty} Ready</strong></div>
            <div><span>Dispatch</span><strong>{o.dispatchDate}</strong></div>
            <div><span>Payment</span><strong className={o.paymentPct >= 30 ? 'text-green' : 'text-amber'}>{o.paymentPct}% Received</strong></div>
          </div>
        </div>

        <div className="panel dispatch-card">
          <div className="eyebrow">Dispatch details</div>
          <h2>Shipment readiness</h2>
          <div className="dispatch-progress">
            <div><span>Ready machines</span><strong>{o.ready} / {o.qty}</strong></div>
            <div className="progress"><i style={{ width: `${pct}%` }} /></div>
          </div>
          {o.checks.map((c) => (
            <div key={c.label} className={`dispatch-check ${c.done ? '' : 'pending'}`}>
              {c.done ? <CircleCheck size={15} /> : <Clock3 size={15} />} {c.label}
            </div>
          ))}
          <button className="outline-btn full" data-testid="prepare-dispatch" onClick={async () => {
            await api(`/sales-orders/${o._id}/dispatch-pack`, { method: 'POST' });
            state.reload();
            setToast(`Dispatch pack prepared for ${o._id}`);
          }}>
            Prepare dispatch pack <ArrowUpRight size={13} />
          </button>
        </div>
      </div>

      <div className="panel table-panel top-gap">
        <div className="panel-head">
          <div><div className="eyebrow">Order book</div><h2>All sales orders</h2></div>
          <div className="table-count">{d.orders.length} orders</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Product</th><th>Qty</th><th>Value</th><th>Ready</th><th>Dispatch</th><th>Status</th></tr></thead>
            <tbody>
              {d.orders.map((x) => (
                <tr key={x._id} className="clickable-row" onClick={() => setPick(x._id)}>
                  <td><span className="mono">{x._id}</span></td><td><strong>{x.customer}</strong></td><td>{x.product}</td>
                  <td>{x.qty}</td><td>{x.orderValue}</td><td>{x.ready} / {x.qty}</td><td>{x.dispatchDate}</td>
                  <td><Badge tone={statusTone(x.status)}>{x.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <FormModal
          eyebrow="Sales" title="New sales order" submitLabel="Create order" onClose={() => setModal(false)}
          fields={[
            { name: 'customerId', label: 'Customer', type: 'select', options: d.customers.map((c) => ({ value: c._id, label: `${c.name} · ${c.city}` })) },
            { name: 'product', label: 'Product', type: 'select', options: ['Harvester X', 'Harvester Y', 'Rotavator R2'].map((p) => ({ value: p, label: p })), half: true },
            { name: 'qty', label: 'Quantity (units)', type: 'number', min: 1, half: true },
            { name: 'valueLakh', label: 'Order value (₹ Lakh)', type: 'number', min: 0, step: '0.1', half: true },
            { name: 'paymentPct', label: 'Advance received (%)', type: 'number', min: 0, defaultValue: 0, half: true },
            { name: 'dispatchDate', label: 'Dispatch date', type: 'date', defaultValue: inDays(10) },
          ]}
          onSubmit={async (v) => {
            const r = await api('/sales-orders', { method: 'POST', body: JSON.stringify(v) });
            state.reload();
            setPick(r._id);
            setToast(`${r._id} created`);
          }}
        />
      )}
      {toast && <Toast text={toast} onDone={() => setToast('')} />}
    </div>
  );
}
