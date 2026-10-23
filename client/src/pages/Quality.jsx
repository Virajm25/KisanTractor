import React, { useState } from 'react';
import { api, useApi } from '../api.js';
import { Modal } from '../components/Modal.jsx';
import { Badge, Loading, Title, Toast } from '../components/Page.jsx';

const resultTone = { PASS: 'green', PENDING: 'amber', FAIL: 'red' };

export default function Quality() {
  const state = useApi('/quality');
  const [toast, setToast] = useState('');
  const [history, setHistory] = useState(false);
  const d = state.data;
  if (!d) return <div className="page"><Loading state={state} /></div>;

  const i = d.inspection;
  const overall = i.decision === 'approve' ? 'Approved' : i.decision === 'reject' ? 'Rejected' : i.decision === 'rework' ? 'Sent for rework'
    : i.checks.every((c) => c.result === 'PASS') ? 'Ready' : 'Pending';
  const overallTone = { Approved: 'green', Ready: 'green', Rejected: 'red', 'Sent for rework': 'blue' }[overall] || 'amber';
  const headline = i.decision ? overall : 'Pending Final Approval';

  const decide = async (decision) => {
    try {
      await api(`/quality/${i._id}/decision`, { method: 'POST', body: JSON.stringify({ decision }) });
      state.reload();
      setToast(`${i.serial}: ${decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'sent for rework'}`);
    } catch (e) { setToast(e.message); }
  };

  return (
    <div className="page">
      <Title eyebrow="Transactions / Quality" title="Quality Control" subtitle="Inspection gates before a machine becomes a customer promise">
        <button className="outline-btn" data-testid="inspection-history" onClick={() => setHistory(true)}>Inspection history</button>
      </Title>

      <div className="quality-layout">
        <div className="panel inspection-card">
          <div className="panel-head" style={{ padding: 0 }}>
            <div><div className="eyebrow">Final equipment inspection</div><h2>{i.title}</h2></div>
            <Badge tone={overallTone}>{headline}</Badge>
          </div>
          <div className="serial">Serial / Batch<strong>{i.serial}</strong></div>
          {i.checks.map((c) => (
            <div className="inspection-row" key={c.name}>
              <span>{c.name}</span><Badge tone={resultTone[c.result]}>{c.result}</Badge>
            </div>
          ))}
          <div className="overall"><span>Overall</span><Badge tone={overallTone}>{overall}</Badge></div>
          <div className="action-row">
            <button className="primary-btn" data-testid="qc-approve" onClick={() => decide('approve')}>Approve</button>
            <button className="danger-btn" data-testid="qc-reject" onClick={() => decide('reject')}>Reject</button>
            <button className="outline-btn" data-testid="qc-rework" onClick={() => decide('rework')}>Send for rework</button>
          </div>
        </div>

        <div className="panel inspection-side">
          <div className="eyebrow">Inspection queue</div>
          <h2>Today's gates</h2>
          {d.queue.map((q) => (
            <div className="queue-item" key={q._id}>
              <span className="queue-number">{String(q.order).padStart(2, '0')}</span>
              <div><strong>{q.title}</strong><small>{q.ref}</small></div>
              <Badge tone={q.status === 'Passed' ? 'green' : 'amber'}>{q.status}</Badge>
            </div>
          ))}
        </div>
      </div>
      {history && (
        <Modal eyebrow="Quality" title="Inspection history" wide onClose={() => setHistory(false)}>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Serial / batch</th><th>Product</th><th>Outcome</th><th>By</th></tr></thead>
              <tbody>
                {d.history.map((h) => (
                  <tr key={h._id}>
                    <td>{new Date(h.at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td><span className="mono">{h.serial}</span></td><td>{h.product}</td>
                    <td><Badge tone={h.outcome === 'Approved' ? 'green' : h.outcome === 'Rejected' ? 'red' : 'blue'}>{h.outcome}</Badge></td>
                    <td>{h.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
      {toast && <Toast text={toast} onDone={() => setToast('')} />}
    </div>
  );
}
