import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connect, getDb, seed } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const col = (name) => getDb().collection(name);
// natural (insertion) order unless a sort is given
const all = (name, sort) => col(name).find().sort(sort || { $natural: 1 }).toArray();
const one = (name) => col(name).findOne();
const wrap = (fn) => async (req, res) => {
  try {
    if (!getDb()) return res.status(503).json({ error: 'Database not connected. Check MONGODB_URI in server/.env' });
    res.json(await fn(req));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

app.get('/api/health', (_req, res) => res.json({ ok: true, db: Boolean(getDb()) }));

app.get('/api/me', wrap(() => one('users')));

app.get('/api/dashboard', wrap(() => one('dashboard')));

app.get('/api/procurement', wrap(async () => {
  const [requirements, orders, requests, vendors] = await Promise.all([
    all('purchase_requirements'), all('purchase_orders', { _id: -1 }), all('purchase_requests', { _id: -1 }), all('vendors'),
  ]);
  return {
    requirements, orders, requests, vendors,
    materials: await col('stock_items').find({}, { projection: { _id: 1, material: 1, uom: 1 } }).toArray(),
    receipts: orders.filter((o) => o.pendingReceipt),
    selectedPO: orders[0],
  };
}));

app.get('/api/sales', wrap(async () => ({
  orders: await all('sales_orders'),
  customers: await all('customers'),
})));

app.get('/api/inventory', wrap(async () => ({
  summary: await one('inventory_summary'),
  items: await all('stock_items'),
})));

app.get('/api/production', wrap(() => all('production_orders')));

app.get('/api/quality', wrap(async () => ({
  inspection: await col('inspections').findOne({}),
  queue: await all('inspection_queue'),
  history: await all('inspection_history', { at: -1 }),
})));

app.post('/api/quality/:id/decision', wrap(async (req) => {
  const { decision } = req.body;
  if (!['approve', 'reject', 'rework'].includes(decision)) throw new Error('Invalid decision');
  const update = { decision };
  if (decision === 'approve') update['checks.$[c].result'] = 'PASS';
  await col('inspections').updateOne(
    { _id: req.params.id },
    { $set: update },
    decision === 'approve' ? { arrayFilters: [{ 'c.result': 'PENDING' }] } : {},
  );
  const doc = await col('inspections').findOne({ _id: req.params.id });
  await col('inspection_history').insertOne({
    _id: `H-${Date.now()}`, at: new Date(), serial: doc.serial, product: doc.title,
    outcome: { approve: 'Approved', reject: 'Rejected', rework: 'Sent for rework' }[decision], by: 'Anand Rao',
  });
  return doc;
}));

app.get('/api/trading', wrap(async () => ({
  summary: await one('trading_summary'),
  items: await all('trading_items'),
})));

app.get('/api/bom', wrap(() => one('products')));
app.get('/api/cost', wrap(() => all('cost_reports')));
app.get('/api/consumption', wrap(() => one('consumption')));
app.get('/api/mis', wrap(() => one('mis')));
app.get('/api/roles', wrap(() => all('roles')));

app.get('/api/search', wrap(async (req) => {
  const q = String(req.query.q || '').trim();
  if (!q) return [];
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const [stock, so, po, prod, cust] = await Promise.all([
    col('stock_items').find({ $or: [{ material: rx }, { _id: rx }] }).limit(5).toArray(),
    col('sales_orders').find({ $or: [{ _id: rx }, { customer: rx }, { product: rx }] }).limit(5).toArray(),
    col('purchase_orders').find({ $or: [{ _id: rx }, { vendor: rx }, { material: rx }] }).limit(5).toArray(),
    col('production_orders').find({ $or: [{ _id: rx }, { product: rx }] }).limit(5).toArray(),
    col('customers').find({ name: rx }).limit(5).toArray(),
  ]);
  return [
    ...stock.map((d) => ({ type: 'Item', label: d.material, sub: d._id, to: '/inventory' })),
    ...so.map((d) => ({ type: 'Sales order', label: d._id, sub: `${d.customer} · ${d.product}`, to: '/dispatch' })),
    ...po.map((d) => ({ type: 'Purchase order', label: d._id, sub: `${d.vendor} · ${d.material}`, to: '/procurement' })),
    ...prod.map((d) => ({ type: 'Production', label: d._id, sub: d.product, to: '/production' })),
    ...cust.map((d) => ({ type: 'Customer', label: d.name, sub: d.city, to: '/dispatch' })),
  ];
}));

// ---------- create / update endpoints ----------
const fail = (msg) => { throw new Error(msg); };
const str = (v, name) => String(v ?? '').trim() || fail(`${name} is required`);
const pos = (v, name) => (Number(v) > 0 ? Number(v) : fail(`${name} must be greater than 0`));
const nonNeg = (v, name) => (Number(v) >= 0 && v !== '' && v != null ? Number(v) : fail(`${name} must be 0 or more`));
const fmtDate = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) fail('Invalid date');
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
  return `${String(d.getDate()).padStart(2, '0')} ${mon} ${d.getFullYear()}`;
};
// next sequential id for ids shaped PREFIX + digits
async function nextId(name, prefix, width) {
  const docs = await col(name).find({ _id: new RegExp(`^${prefix}\\d+$`) }, { projection: { _id: 1 } }).toArray();
  const max = docs.reduce((m, d) => Math.max(m, Number(d._id.slice(prefix.length))), 0);
  return `${prefix}${String(max + 1).padStart(width, '0')}`;
}

app.post('/api/purchase-requests', wrap(async (req) => {
  const b = req.body;
  const item = (await col('stock_items').findOne({ _id: str(b.itemCode, 'Material') })) || fail('Unknown material');
  const doc = {
    _id: await nextId('purchase_requests', 'PR-2026-', 5),
    material: item.material, uom: item.uom === 'Units' ? '' : item.uom, qty: pos(b.qty, 'Quantity'),
    requestedBy: str(b.requestedBy, 'Requested by'), requiredBy: fmtDate(b.requiredBy),
    priority: b.priority || 'Medium', status: 'Pending Approval',
  };
  await col('purchase_requests').insertOne(doc);
  return doc;
}));

app.post('/api/purchase-orders/:id/receive', wrap(async (req) => {
  const r = await col('purchase_orders').findOneAndUpdate(
    { _id: req.params.id }, { $set: { status: 'Received', pendingReceipt: false } }, { returnDocument: 'after' },
  );
  return r || fail('Purchase order not found');
}));

app.post('/api/sales-orders', wrap(async (req) => {
  const b = req.body;
  const c = (await col('customers').findOne({ _id: str(b.customerId, 'Customer') })) || fail('Unknown customer');
  const qty = pos(b.qty, 'Quantity');
  const doc = {
    _id: await nextId('sales_orders', 'SO-2026-', 5),
    customerId: c._id, customer: c.name, city: c.city, since: c.since, product: str(b.product, 'Product'), qty,
    orderValue: `₹${pos(b.valueLakh, 'Order value').toFixed(1)} Lakh`, ready: 0, dispatchDate: fmtDate(b.dispatchDate),
    paymentPct: nonNeg(b.paymentPct ?? 0, 'Advance'), status: 'Order confirmed', stage: 2,
    checks: [
      { label: 'Transporter assigned', done: false },
      { label: 'Delivery documents prepared', done: false },
      { label: 'Final machine pending QC', done: false },
    ],
  };
  await col('sales_orders').insertOne(doc);
  return doc;
}));

app.post('/api/sales-orders/:id/dispatch-pack', wrap(async (req) => {
  const o = (await col('sales_orders').findOne({ _id: req.params.id })) || fail('Order not found');
  const checks = o.checks.map((c, i) => (i < 2 ? { ...c, done: true } : c));
  const allReady = o.ready >= o.qty;
  await col('sales_orders').updateOne({ _id: o._id }, { $set: { checks, status: allReady ? 'Ready to dispatch' : 'Dispatch scheduled', stage: Math.max(o.stage, allReady ? 5 : 4) } });
  return col('sales_orders').findOne({ _id: o._id });
}));

app.post('/api/stock-items', wrap(async (req) => {
  const b = req.body;
  const available = nonNeg(b.available, 'Opening stock');
  const reserved = nonNeg(b.reserved ?? 0, 'Reserved');
  const reorderLevel = nonNeg(b.reorderLevel, 'Reorder level');
  const doc = {
    _id: str(b.code, 'Item code').toUpperCase(), material: str(b.material, 'Material'), category: str(b.category, 'Category'),
    uom: str(b.uom, 'UOM'), available, reserved, reorderLevel, rate: pos(b.rate, 'Rate'),
    status: available <= reserved ? 'Shortage' : available < reorderLevel ? 'Low Stock' : 'Available',
    warehouse: b.warehouse || 'Main Warehouse',
  };
  if (await col('stock_items').findOne({ _id: doc._id })) fail(`Item code ${doc._id} already exists`);
  await col('stock_items').insertOne(doc);
  await col('inventory_summary').updateOne({}, { $inc: { itemCount: 1 } });
  return doc;
}));

app.post('/api/production-orders', wrap(async (req) => {
  const b = req.body;
  const stages = ['Material Issue', 'Fabrication', 'Machining', 'Sub Assembly', 'Main Assembly', 'QC', 'Finished Goods']
    .map((name) => ({ name, state: 'Pending' }));
  const doc = {
    _id: await nextId('production_orders', 'PO-', 5),
    product: str(b.product, 'Product'), plant: 'Plant 01', started: fmtDate(b.started || new Date()),
    planned: pos(b.planned, 'Planned quantity'), completed: 0, wip: 0,
    materialStatus: 'Material Available', status: 'Planned', expected: fmtDate(b.expected), stages,
  };
  await col('production_orders').insertOne(doc);
  return doc;
}));

app.post('/api/trading-items', wrap(async (req) => {
  const b = req.body;
  const doc = {
    _id: await nextId('trading_items', 'T-', 3), item: str(b.item, 'Item'),
    purchase: pos(b.purchase, 'Purchase value'), sales: pos(b.sales, 'Sales value'),
  };
  await col('trading_items').insertOne(doc);
  return doc;
}));

app.post('/api/bom/versions', wrap(async (req) => {
  const p = (await one('products')) || fail('No product');
  const last = (p.versions || []).map((v) => v.version).sort().pop() || p.bomVersion;
  const [maj, min] = last.replace('V', '').split('.').map(Number);
  const v = { version: `V${maj}.${min + 1}`, status: 'Draft', effectiveFrom: fmtDate(req.body.effectiveFrom), note: str(req.body.note, 'Change note') };
  await col('products').updateOne({ _id: p._id }, { $push: { versions: v } });
  return col('products').findOne({ _id: p._id });
}));

app.post('/api/bom/versions/:version/activate', wrap(async (req) => {
  const p = (await one('products')) || fail('No product');
  const target = (p.versions || []).find((v) => v.version === req.params.version) || fail('Version not found');
  const versions = p.versions.map((v) => ({ ...v, status: v.version === target.version ? 'Active' : v.status === 'Active' ? 'Superseded' : v.status }));
  await col('products').updateOne({ _id: p._id }, { $set: { versions, bomVersion: target.version, effectiveFrom: target.effectiveFrom } });
  return col('products').findOne({ _id: p._id });
}));

if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
}

try {
  await connect();
  console.log('MongoDB connected');
  if (process.env.SEED_ON_START !== 'false') {
    const n = await seed();
    if (n) console.log(`Seeded ${n} mock documents`);
  }
} catch (err) {
  console.error('MongoDB connection failed:', err.message);
  console.error('Set MONGODB_URI in server/.env and restart.');
}

export default app;
