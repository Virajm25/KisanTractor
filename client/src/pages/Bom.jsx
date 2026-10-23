import React, { useState } from 'react';
import { Cog, Layers, Link2, Package, Settings2 } from 'lucide-react';
import { api, rupee, useApi } from '../api.js';
import { FormModal, inDays, Modal } from '../components/Modal.jsx';
import { Badge, Loading, Title, Toast } from '../components/Page.jsx';

export default function Bom() {
  const state = useApi('/bom');
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState(null);
  const p = state.data;
  if (!p) return <div className="page"><Loading state={state} /></div>;
  const total = p.cost.material + p.cost.labour + p.cost.overhead;

  return (
    <div className="page">
      <Title eyebrow="Masters / Product" title="Product Structure" subtitle="BOM governance for machines that leave the floor complete">
        <button className="outline-btn" data-testid="manage-versions" onClick={() => setModal('versions')}>
          <Layers size={14} /> Manage versions
        </button>
      </Title>

      <div className="bom-layout">
        <div className="panel bom-tree">
          <div className="eyebrow">Active product</div>
          <div className="product-heading">
            <div className="machine-icon"><Settings2 size={22} /></div>
            <div><h2>{p.name}</h2><span>{p.code} · {p.category}</span></div>
          </div>
          <div className="product-meta">
            <span>BOM Version<strong>{p.bomVersion}</strong></span>
            <Badge tone="green">{p.status}</Badge>
            <span>Effective from<strong>{p.effectiveFrom}</strong></span>
          </div>
          <div className="tree">
            <div className="tree-root"><Package size={15} /> <strong>{p.name.toUpperCase().replace('—', '').replace(/\s+/g, ' ')}</strong></div>
            <div className="tree-group">
              {p.bom.map((b) => (
                <div key={b.assembly}>
                  <div className="tree-branch"><Cog size={14} /> <strong>{b.assembly}</strong></div>
                  {b.parts.map((part) => <div className="tree-leaf" key={part}><span />{part}</div>)}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel cost-panel">
          <div className="eyebrow">Standard cost build-up</div>
          <h2>Cost per machine</h2>
          <div className="cost-line"><span>Standard material cost</span><strong>{rupee(p.cost.material)}</strong></div>
          <div className="cost-line"><span>Standard labour</span><strong>{rupee(p.cost.labour)}</strong></div>
          <div className="cost-line"><span>Standard overhead</span><strong>{rupee(p.cost.overhead)}</strong></div>
          <div className="total-line"><span>Standard production cost</span><strong>{rupee(total)}</strong></div>
          <div className="cost-note"><Link2 size={13} /> Linked to active production plan</div>
        </div>
      </div>
      {modal === 'versions' && (
        <Modal eyebrow={p.code} title="BOM versions" onClose={() => setModal(null)}>
          {(p.versions || []).map((v) => (
            <div className="version-row" key={v.version}>
              <div><strong>{v.version}</strong><small>{v.note} · effective {v.effectiveFrom}</small></div>
              <Badge tone={v.status === 'Active' ? 'green' : v.status === 'Draft' ? 'amber' : 'neutral'}>{v.status}</Badge>
              {v.status !== 'Active' && (
                <button className="outline-btn" onClick={async () => {
                  await api(`/bom/versions/${v.version}/activate`, { method: 'POST' });
                  state.reload();
                  setToast(`${v.version} is now the active BOM`);
                }}>Activate</button>
              )}
            </div>
          ))}
          <div className="action-row">
            <button className="primary-btn" onClick={() => setModal('new')}>Create new version</button>
          </div>
        </Modal>
      )}
      {modal === 'new' && (
        <FormModal
          eyebrow={p.code} title="New BOM version" submitLabel="Create draft" onClose={() => setModal(null)}
          fields={[
            { name: 'note', label: 'Change note', placeholder: 'What changed in this version?' },
            { name: 'effectiveFrom', label: 'Effective from', type: 'date', defaultValue: inDays(14) },
          ]}
          onSubmit={async (v) => {
            await api('/bom/versions', { method: 'POST', body: JSON.stringify(v) });
            state.reload();
            setToast('Draft BOM version created');
          }}
        />
      )}
      {toast && <Toast text={toast} onDone={() => setToast('')} />}
    </div>
  );
}
