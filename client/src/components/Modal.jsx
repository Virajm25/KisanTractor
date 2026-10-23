import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export function Modal({ title, eyebrow, onClose, children, wide }) {
  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-label={title}>
        <button className="drawer-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2 className="modal-title">{title}</h2>
        {children}
      </div>
    </>
  );
}

const today = () => new Date().toISOString().slice(0, 10);
export const inDays = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

/**
 * fields: [{ name, label, type: text|number|date|select, options: [{value,label}], defaultValue, required, step, placeholder, half }]
 * onSubmit(values) may throw; the message is shown in the form.
 */
export function FormModal({ title, eyebrow, fields, submitLabel = 'Create', onSubmit, onClose }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.name, f.defaultValue ?? (f.type === 'date' ? today() : '')])));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <Modal title={title} eyebrow={eyebrow} onClose={onClose}>
      <form onSubmit={submit} className="form-grid">
        {fields.map((f) => (
          <label key={f.name} className={`field ${f.half ? 'half' : ''}`}>
            <span>{f.label}{f.required !== false && ' *'}</span>
            {f.type === 'select' ? (
              <select value={values[f.name]} required={f.required !== false} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}>
                <option value="" disabled>Select…</option>
                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <input
                type={f.type || 'text'} step={f.step} min={f.min} placeholder={f.placeholder} value={values[f.name]}
                required={f.required !== false} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
              />
            )}
          </label>
        ))}
        {error && <div className="form-error">{error}</div>}
        <div className="action-row form-actions">
          <button type="submit" className="primary-btn" disabled={busy}>{busy ? 'Saving…' : submitLabel}</button>
          <button type="button" className="outline-btn" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}
