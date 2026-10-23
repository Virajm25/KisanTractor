import React from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';

export function Title({ eyebrow, title, subtitle, children }) {
  return (
    <div className="section-title">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1 data-testid="page-title">{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function Loading({ state }) {
  if (state.loading && !state.data) return <div className="state-msg">Loading…</div>;
  if (state.error) return <div className="state-msg error">{state.error}</div>;
  return null;
}

export function Badge({ tone = 'neutral', children }) {
  return <span data-testid="status-badge" className={`badge badge-${tone}`}>{children}</span>;
}

export function Filters({ items, date }) {
  return (
    <div className="filters">
      {items.map((f) => (
        <button key={f} className="filter" data-testid={`filter-${f.split(':')[0].toLowerCase()}`}>
          {f}<ChevronDown size={13} />
        </button>
      ))}
      {date && (
        <button className="filter filter-date" data-testid="filter-date"><CalendarDays size={13} /> {date}</button>
      )}
    </div>
  );
}

export function Toast({ text, onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [text]);
  return <div className="toast">{text}</div>;
}

export const stockTone = (s) => ({ Available: 'green', 'Low Stock': 'amber', Shortage: 'red', Reserved: 'blue' }[s] || 'neutral');
export const prodTone = (s) => ({ 'In Production': 'blue', Delayed: 'red', Completed: 'green' }[s] || 'neutral');
export const poTone = (s) => ({ 'Awaiting Receipt': 'amber', Delayed: 'red', Received: 'green', 'Partially Received': 'blue', Approved: 'green' }[s] || 'neutral');
