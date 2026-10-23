import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ChevronRight, Clock3, TriangleAlert } from 'lucide-react';
import { useApi } from '../api.js';
import { Badge, Loading, Title } from '../components/Page.jsx';

export default function Dashboard() {
  const nav = useNavigate();
  const state = useApi('/dashboard');
  const d = state.data;
  if (!d) return <div className="page"><Loading state={state} /></div>;

  return (
    <div className="page">
      <Title eyebrow="Business Control Centre" title="Today's Business Position" subtitle={`${d.company} · ${d.plant} · ${d.asOn}`}>
        <button className="outline-btn" data-testid="dashboard-refresh" onClick={state.reload}>
          <Clock3 size={14} /> Updated {d.updatedAt}
        </button>
      </Title>

      <div className="metric-grid">
        {d.metrics.map((m) => (
          <div className="metric" key={m.key} data-testid={`metric-${m.key}`}>
            <span>{m.label}</span><strong>{m.value}</strong><small className={`text-${m.tone}`}>{m.note}</small>
          </div>
        ))}
      </div>

      <div className="content-grid top-gap">
        <div className="panel production-panel">
          <div className="panel-head">
            <div><div className="eyebrow">Production position</div><h2>Machines on the floor</h2></div>
            <button className="text-btn" data-testid="view-production-button" onClick={() => nav('/production')}>
              View control <ArrowUpRight size={13} />
            </button>
          </div>
          {d.models.map((m) => (
            <div className="model-row" key={m.mark}>
              <div className={`model-mark ${m.mark === 'MY' ? 'model-y' : ''}`}>{m.mark}</div>
              <div className="model-copy">
                <strong>{m.name}</strong><span>{m.summary}</span>
                <div className="progress"><i style={{ width: `${m.progress}%` }} /></div>
              </div>
              <Badge tone={m.tone}>{m.progress}%</Badge>
            </div>
          ))}
        </div>

        <div className="panel alerts-panel">
          <div className="panel-head">
            <div><div className="eyebrow">Material alerts</div><h2>Shortages affecting plan</h2></div>
            <button className="icon-btn" data-testid="alerts-more" onClick={() => nav('/procurement')}><ChevronRight size={16} /></button>
          </div>
          {d.materialAlerts.map((a) => (
            <div className="alert-line" key={a.name} onClick={() => nav('/procurement')}>
              <div><strong>{a.name}</strong><span>{a.detail}</span></div>
              <b>{a.gap}</b>
            </div>
          ))}
        </div>
      </div>

      <div className="attention-band">
        <div className="attention-heading">
          <TriangleAlert size={22} />
          <div><div className="eyebrow">Attention required</div><strong>Four exceptions need an owner today</strong></div>
        </div>
        <div className="attention-items">
          {d.attention.map((a) => (
            <button key={a.key} data-testid={`attention-${a.key}`} onClick={() => nav(a.to)}>
              {a.text} <ChevronRight size={14} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
