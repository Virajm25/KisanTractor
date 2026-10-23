import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Boxes, Briefcase, Factory, Layers, Wallet } from 'lucide-react';
import { useApi } from '../api.js';
import { Loading, Title } from '../components/Page.jsx';

const ICONS = { briefcase: Briefcase, factory: Factory, boxes: Boxes, wallet: Wallet };

export default function Roles() {
  const nav = useNavigate();
  const state = useApi('/roles');
  const roles = state.data;
  if (!roles) return <div className="page"><Loading state={state} /></div>;

  return (
    <div className="page">
      <Title eyebrow="People / Role-based home" title="Work starts with the right view" subtitle="Four home experiences for the people who move the business forward" />
      <div className="roles-grid">
        {roles.map((r) => {
          const Icon = ICONS[r.icon] || Briefcase;
          return (
            <button key={r._id} className="role-card" style={{ '--role-color': r.color }} onClick={() => nav(r.to)}>
              <div className="role-top"><span className="role-tag">{r.tag}</span><Icon size={18} /></div>
              <h2>{r.title}</h2>
              <p>{r.blurb}</p>
              <div className="role-footer"><span>Open home</span><ArrowRight size={14} /></div>
            </button>
          );
        })}
      </div>
      <div className="roles-note">
        <Layers size={20} />
        <div>
          <strong>One system, different starting points</strong>
          <span>Every role sees their next decision first — with the same material-to-margin backbone underneath.</span>
        </div>
      </div>
    </div>
  );
}
