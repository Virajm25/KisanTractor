import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { api, num, rupee, useApi } from '../api.js';
import { FormModal, inDays, Modal } from '../components/Modal.jsx';
import { Badge, Loading, poTone, Title, Toast } from '../components/Page.jsx';

const pad = (n) => String(n).padStart(2, '0');
const withUom = (n, uom) => `${num(n)}${uom ? ` ${uom}` : ''}`;

function Table({ head, rows, onRow, selected }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className={onRow ? 'clickable-row' : ''} style={selected === r.key ? { background: '#f8fbf8' } : undefined} onClick={() => onRow?.(r.key)}>
              {r.cells.map((c, i) => <td key={i}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Procurement() {
  const state = useApi('/procurement');
  const [tab, setTab] = useState('requests');
  const [picked, setPicked] = useState(null);
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState(null);
  const d = state.data;
  if (!d) return <div className="page"><Loading state={state} /></div>;

  const po = d.orders.find((o) => o._id === picked) || d.selectedPO;
  const tabs = [
    ['requests', 'Purchase Requests', d.requests.length],
    ['orders', 'Purchase Orders', d.orders.length],
    ['receipts', 'Pending Receipts', d.receipts.length],
    ['vendors', 'Vendor Performance', null],
  ];

  const views = {
    requests: {
      eyebrow: 'Pending purchase requirements', title: 'Requirements against production plan', count: `${d.requirements.length} priorities`,
      head: ['Material', 'Required', 'Available', 'Shortage', 'Required by', 'Priority'],
      rows: d.requirements.map((r) => ({
        key: r._id,
        cells: [
          <strong>{r.material}</strong>, withUom(r.required, r.uom), withUom(r.available, r.uom),
          <span className="text-red">{withUom(r.required - r.available, r.uom)}</span>, r.requiredBy,
          <Badge tone={r.priority === 'High' ? 'red' : 'amber'}>{r.priority}</Badge>,
        ],
      })),
    },
    orders: {
      eyebrow: 'Purchase orders', title: 'All open purchase orders', count: `${d.orders.length} orders`,
      onRow: setPicked, selected: po._id,
      head: ['PO number', 'Vendor', 'Material', 'Quantity', 'Rate', 'Expected', 'Status'],
      rows: d.orders.map((o) => ({
        key: o._id,
        cells: [<span className="mono">{o._id}</span>, o.vendor, o.material, withUom(o.qty, o.uom), `${rupee(o.rate)} / ${o.uom}`, o.expectedDelivery, <Badge tone={poTone(o.status)}>{o.status}</Badge>],
      })),
    },
    receipts: {
      eyebrow: 'Goods receipt', title: 'Orders awaiting receipt', count: `${d.receipts.length} pending`,
      onRow: setPicked, selected: po._id,
      head: ['PO number', 'Vendor', 'Material', 'Quantity', 'Expected', 'Status'],
      rows: d.receipts.map((o) => ({
        key: o._id,
        cells: [<span className="mono">{o._id}</span>, o.vendor, o.material, withUom(o.qty, o.uom), o.expectedDelivery, <Badge tone={poTone(o.status)}>{o.status}</Badge>],
      })),
    },
    vendors: {
      eyebrow: 'Vendor performance', title: 'Delivery and quality scorecard', count: `${d.vendors.length} vendors`,
      head: ['Vendor', 'City', 'On-time delivery', 'Quality acceptance', 'Open POs'],
      rows: d.vendors.map((v) => ({
        key: v._id,
        cells: [
          <strong>{v.name}</strong>, v.city,
          <Badge tone={v.onTimePct >= 90 ? 'green' : v.onTimePct >= 85 ? 'amber' : 'red'}>{v.onTimePct}%</Badge>,
          `${v.qualityPct}%`, v.openPOs,
        ],
      })),
    },
  };
  const v = views[tab];

  return (
    <div className="page">
      <Title eyebrow="Transactions / Purchase" title="Material Procurement" subtitle="Plan shortages before they become production delays">
        <button className="primary-btn" data-testid="create-request" onClick={() => setModal('request')}>
          <Plus size={14} /> Create request
        </button>
      </Title>

      <div className="panel table-panel">
        <div className="panel-head">
          <div><div className="eyebrow">{v.eyebrow}</div><h2>{v.title}</h2></div>
          <div className="table-count">{v.count}</div>
        </div>
        <Table head={v.head} rows={v.rows} onRow={v.onRow} selected={v.selected} />
      </div>

      <div className="tab-row">
        {tabs.map(([k, label, n]) => (
          <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>
            {label}{n != null && <span>{pad(n)}</span>}
          </button>
        ))}
      </div>

      <div className="panel po-card">
        <div className="po-id">
          <div className="eyebrow">Selected purchase order</div>
          <h2>{po._id}</h2>
          <Badge tone={poTone(po.status)}>{po.status}</Badge>
        </div>
        <div className="po-details">
          <div><span>Vendor</span><strong>{po.vendor}</strong></div>
          <div><span>Material</span><strong>{po.material}</strong></div>
          <div><span>Quantity</span><strong>{withUom(po.qty, po.uom)}</strong></div>
          <div><span>Rate</span><strong>{rupee(po.rate)} / {po.uom}</strong></div>
          <div><span>Expected delivery</span><strong>{po.expectedDelivery}</strong></div>
        </div>
        <button className="outline-btn" data-testid="open-po" onClick={() => setModal('po')}>Open purchase order</button>
      </div>
      {modal === 'request' && (
        <FormModal
          eyebrow="Procurement" title="Create purchase request" submitLabel="Create request" onClose={() => setModal(null)}
          fields={[
            { name: 'itemCode', label: 'Material', type: 'select', options: d.materials.map((m) => ({ value: m._id, label: `${m.material} (${m._id})` })) },
            { name: 'qty', label: 'Quantity', type: 'number', min: 1, step: 'any', half: true },
            { name: 'priority', label: 'Priority', type: 'select', defaultValue: 'Medium', options: ['High', 'Medium', 'Low'].map((p) => ({ value: p, label: p })), half: true },
            { name: 'requestedBy', label: 'Requested by', type: 'select', defaultValue: 'Production', options: ['Production', 'Store', 'Maintenance', 'Quality'].map((p) => ({ value: p, label: p })), half: true },
            { name: 'requiredBy', label: 'Required by', type: 'date', defaultValue: inDays(7), half: true },
          ]}
          onSubmit={async (v) => {
            const r = await api('/purchase-requests', { method: 'POST', body: JSON.stringify(v) });
            setTab('requests');
            state.reload();
            setToast(`${r._id} created`);
          }}
        />
      )}
      {modal === 'po' && (
        <Modal eyebrow="Purchase order" title={po._id} onClose={() => setModal(null)}>
          <div className="order-grid" style={{ paddingTop: 0 }}>
            <div><span>Vendor</span><strong>{po.vendor}</strong></div>
            <div><span>Material</span><strong>{po.material}</strong></div>
            <div><span>Quantity</span><strong>{withUom(po.qty, po.uom)}</strong></div>
            <div><span>Rate</span><strong>{rupee(po.rate)} / {po.uom}</strong></div>
            <div><span>Value</span><strong>{rupee(po.qty * po.rate)}</strong></div>
            <div><span>Expected delivery</span><strong>{po.expectedDelivery}</strong></div>
          </div>
          <div style={{ margin: '20px 0 0' }}><Badge tone={poTone(po.status)}>{po.status}</Badge></div>
          <div className="action-row">
            {po.status !== 'Received' && (
              <button className="primary-btn" onClick={async () => {
                await api(`/purchase-orders/${po._id}/receive`, { method: 'POST' });
                setModal(null); state.reload(); setToast(`${po._id} marked as received`);
              }}>Mark as received</button>
            )}
            <button className="outline-btn" onClick={() => setModal(null)}>Close</button>
          </div>
        </Modal>
      )}
      {toast && <Toast text={toast} onDone={() => setToast('')} />}
    </div>
  );
}
