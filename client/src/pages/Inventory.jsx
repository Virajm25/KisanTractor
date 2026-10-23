import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { api, num, rupee, useApi } from '../api.js';
import { FormModal } from '../components/Modal.jsx';
import { Badge, Filters, Loading, stockTone, Title, Toast } from '../components/Page.jsx';

export default function Inventory() {
  const state = useApi('/inventory');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState(false);
  const d = state.data;
  if (!d) return <div className="page"><Loading state={state} /></div>;
  const s = d.summary;

  return (
    <div className="page">
      <Title eyebrow="Transactions / Inventory" title="Material & Stock Control" subtitle="One view of raw material, WIP, finished goods and trading stock">
        <button className="primary-btn" data-testid="new-stock-item" onClick={() => setModal(true)}>
          <Plus size={14} /> New stock item
        </button>
      </Title>

      <Filters
        items={[`Plant: ${s.plant}`, `Warehouse: ${s.warehouse}`, 'Category: All categories', 'Status: All stock', `As on: ${s.asOn}`]}
        date={s.asOn}
      />

      <div className="metric-grid" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
        {s.cards.map((c) => (
          <div className="metric" key={c.label}>
            <span>{c.label}</span><strong>{c.value}</strong><small style={{ color: 'var(--muted)' }}>{c.note}</small>
          </div>
        ))}
      </div>

      <div className="panel table-panel top-gap">
        <div className="panel-head">
          <div><div className="eyebrow">Stock register</div><h2>Item-wise availability</h2></div>
          <div className="table-count">{s.itemCount} items · Sorted by status</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item code</th><th>Material</th><th>Category</th><th>UOM</th><th>Available</th><th>Reserved</th>
                <th>Reorder level</th><th>Avg. rate</th><th>Stock value</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {d.items.map((i) => (
                <tr key={i._id}>
                  <td><span className="mono">{i._id}</span></td><td><strong>{i.material}</strong></td><td>{i.category}</td><td>{i.uom}</td>
                  <td>{num(i.available)}</td><td>{num(i.reserved)}</td><td>{num(i.reorderLevel)}</td>
                  <td>{rupee(i.rate)}</td><td>{rupee(i.available * i.rate)}</td>
                  <td><Badge tone={stockTone(i.status)}>{i.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <FormModal
          eyebrow="Inventory" title="New stock item" submitLabel="Add item" onClose={() => setModal(false)}
          fields={[
            { name: 'code', label: 'Item code', placeholder: 'e.g. RM-ST-009', half: true },
            { name: 'material', label: 'Material / item name', half: true },
            { name: 'category', label: 'Category', type: 'select', options: ['Raw Material', 'Component', 'Finished Goods', 'Trading'].map((c) => ({ value: c, label: c })), half: true },
            { name: 'uom', label: 'Unit of measure', type: 'select', options: ['KG', 'PCS', 'M', 'Units'].map((c) => ({ value: c, label: c })), half: true },
            { name: 'warehouse', label: 'Warehouse', type: 'select', defaultValue: 'Main Warehouse', options: ['Main Warehouse', 'Finished Goods Yard'].map((c) => ({ value: c, label: c })) },
            { name: 'available', label: 'Opening stock', type: 'number', min: 0, step: 'any', half: true },
            { name: 'reserved', label: 'Reserved', type: 'number', min: 0, step: 'any', defaultValue: 0, half: true },
            { name: 'reorderLevel', label: 'Reorder level', type: 'number', min: 0, step: 'any', half: true },
            { name: 'rate', label: 'Avg. rate (₹)', type: 'number', min: 0, step: 'any', half: true },
          ]}
          onSubmit={async (v) => {
            const r = await api('/stock-items', { method: 'POST', body: JSON.stringify(v) });
            state.reload();
            setToast(`${r._id} added to stock register`);
          }}
        />
      )}
      {toast && <Toast text={toast} onDone={() => setToast('')} />}
    </div>
  );
}
