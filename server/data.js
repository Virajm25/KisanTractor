// Mock data for KisanTractor & Implements Ltd. (Plant 01 · Rajkot) — as on 09 Sep 2026

const vendorNames = [
  'ABC Steel Industries', 'Rajkot Hydraulics Pvt Ltd', 'Shakti Bearings Co.', 'Gujarat Fasteners',
  'Patel Electricals', 'Metro Forgings', 'Sai Rubber Works', 'Om Precision Tools',
];
const materials = [
  ['Steel Sheet 2mm', 'KG', 78], ['Hydraulic Hose', 'M', 1850], ['Bearing 6205', 'PCS', 420],
  ['Steel Rod 20mm', 'KG', 64], ['Hydraulic Pump', 'PCS', 18500], ['Wiring Kit', 'PCS', 2400],
  ['Control Unit', 'PCS', 9800], ['Blade Set', 'PCS', 1350],
];

const dashboard = {
  _id: 'dashboard',
  company: 'KisanTractor & Implements Ltd',
  plant: 'Plant 01',
  asOn: '09 September 2026',
  updatedAt: '08:42',
  metrics: [
    { key: 'sales', label: 'Sales', value: '₹1.32 Cr', note: '+12.4%', tone: 'green' },
    { key: 'production', label: 'Production', value: '17 / 20 Units', note: '85% plan', tone: 'green' },
    { key: 'inventory', label: 'Inventory', value: '₹48.6 Lakh', note: '-2.1%', tone: 'amber' },
    { key: 'receivables', label: 'Receivables', value: '₹24.8 Lakh', note: '₹8.4L overdue', tone: 'red' },
    { key: 'payables', label: 'Payables', value: '₹18.4 Lakh', note: 'Due this week', tone: 'amber' },
    { key: 'gross-margin', label: 'Gross Margin', value: '18.7%', note: '+1.8 pts', tone: 'green' },
  ],
  models: [
    { mark: 'MX', name: 'Model X', summary: '12 units · 8 completed · 3 in assembly · 1 delayed', progress: 68, tone: 'green' },
    { mark: 'MY', name: 'Model Y', summary: '8 units · 5 completed · 2 in production · 1 waiting', progress: 45, tone: 'amber' },
  ],
  materialAlerts: [
    { name: 'Steel Sheet', detail: 'Required 5,000 KG · Available 3,200 KG', gap: '−1,800 KG' },
    { name: 'Hydraulic Hose', detail: 'Required 150 · Available 90', gap: '−60' },
  ],
  attention: [
    { key: 'delayed-orders', text: '3 purchase orders delayed', to: '/procurement' },
    { key: 'consumption', text: 'Model X consumption above standard', to: '/consumption' },
    { key: 'qc', text: '2 QC approvals pending', to: '/quality' },
    { key: 'receivables', text: '₹8.4L customer receivables overdue', to: '/mis' },
  ],
};

const purchaseRequirements = [
  { _id: 'REQ-1', material: 'Steel Sheet 2mm', uom: 'KG', required: 5000, available: 3200, requiredBy: '12 Sep 2026', priority: 'High' },
  { _id: 'REQ-2', material: 'Hydraulic Hose', uom: '', required: 150, available: 90, requiredBy: '14 Sep 2026', priority: 'High' },
  { _id: 'REQ-3', material: 'Bearing 6205', uom: '', required: 200, available: 125, requiredBy: '16 Sep 2026', priority: 'Medium' },
];

const poStatuses = ['Awaiting Receipt', 'Delayed', 'Partially Received', 'Received', 'Awaiting Receipt', 'Delayed', 'Approved'];
const purchaseOrders = Array.from({ length: 14 }, (_, i) => {
  const [material, uom, rate] = i === 0 ? materials[0] : materials[i % materials.length];
  const qty = i === 0 ? 2000 : 100 * (1 + (i % 6)) * (uom === 'KG' ? 10 : 1);
  return {
    _id: `PO-2026-${String(418 - i).padStart(5, '0')}`,
    vendor: i === 0 ? vendorNames[0] : vendorNames[i % vendorNames.length],
    material, uom, qty, rate,
    expectedDelivery: `${String(12 + (i % 14)).padStart(2, '0')} Sep 2026`,
    status: i === 0 ? 'Awaiting Receipt' : poStatuses[i % poStatuses.length],
    pendingReceipt: i < 4,
  };
});

const purchaseRequests = Array.from({ length: 8 }, (_, i) => {
  const [material, uom] = materials[i % materials.length];
  return {
    _id: `PR-2026-${String(212 - i).padStart(5, '0')}`,
    material, uom, qty: 50 * (i + 2),
    requestedBy: ['Production', 'Store', 'Maintenance', 'Production'][i % 4],
    requiredBy: `${String(13 + i).padStart(2, '0')} Sep 2026`,
    status: ['Pending Approval', 'Approved', 'Pending Approval', 'Converted to PO'][i % 4],
  };
});

const vendors = vendorNames.map((name, i) => ({
  _id: `V-${String(i + 1).padStart(3, '0')}`,
  name,
  city: ['Rajkot', 'Ahmedabad', 'Morbi', 'Surat', 'Vadodara', 'Jamnagar', 'Rajkot', 'Pune'][i],
  onTimePct: [96, 82, 91, 88, 94, 76, 89, 93][i],
  qualityPct: [98, 94, 97, 92, 99, 90, 95, 96][i],
  openPOs: [3, 2, 1, 2, 1, 2, 2, 1][i],
}));

const customers = [
  { _id: 'C-001', name: 'ABC Agro Services', city: 'Ahmedabad', since: 2022 },
  { _id: 'C-002', name: 'Kisan Seva Kendra', city: 'Rajkot', since: 2019 },
  { _id: 'C-003', name: 'Saurashtra Farm Tech', city: 'Junagadh', since: 2021 },
  { _id: 'C-004', name: 'Green Fields Traders', city: 'Surat', since: 2023 },
  { _id: 'C-005', name: 'Bharat Agri Mart', city: 'Vadodara', since: 2020 },
];

const salesOrders = [
  {
    _id: 'SO-2026-00381', customerId: 'C-001', customer: 'ABC Agro Services', city: 'Ahmedabad', since: 2022,
    product: 'Harvester X', qty: 5, orderValue: '₹24.5 Lakh', ready: 4, dispatchDate: '12 Sep 2026',
    paymentPct: 30, status: 'Dispatch scheduled', stage: 5,
    checks: [
      { label: 'Transporter assigned', done: true },
      { label: 'Delivery documents prepared', done: true },
      { label: 'Final machine pending QC', done: false },
    ],
  },
  {
    _id: 'SO-2026-00379', customerId: 'C-002', customer: 'Kisan Seva Kendra', city: 'Rajkot', since: 2019,
    product: 'Rotavator R2', qty: 12, orderValue: '₹31.2 Lakh', ready: 12, dispatchDate: '10 Sep 2026',
    paymentPct: 60, status: 'Ready to dispatch', stage: 4,
    checks: [
      { label: 'Transporter assigned', done: true },
      { label: 'Delivery documents prepared', done: false },
      { label: 'Final machine pending QC', done: true },
    ],
  },
  {
    _id: 'SO-2026-00377', customerId: 'C-003', customer: 'Saurashtra Farm Tech', city: 'Junagadh', since: 2021,
    product: 'Harvester Y', qty: 3, orderValue: '₹16.8 Lakh', ready: 1, dispatchDate: '18 Sep 2026',
    paymentPct: 20, status: 'In production', stage: 3,
    checks: [
      { label: 'Transporter assigned', done: false },
      { label: 'Delivery documents prepared', done: false },
      { label: 'Final machine pending QC', done: false },
    ],
  },
  {
    _id: 'SO-2026-00372', customerId: 'C-004', customer: 'Green Fields Traders', city: 'Surat', since: 2023,
    product: 'Harvester X', qty: 2, orderValue: '₹9.3 Lakh', ready: 2, dispatchDate: '08 Sep 2026',
    paymentPct: 100, status: 'Invoiced', stage: 6,
    checks: [
      { label: 'Transporter assigned', done: true },
      { label: 'Delivery documents prepared', done: true },
      { label: 'Final machine pending QC', done: true },
    ],
  },
];

const stockItems = [
  { _id: 'RM-ST-001', material: 'Steel Sheet 2mm', category: 'Raw Material', uom: 'KG', available: 3200, reserved: 1000, reorderLevel: 2500, rate: 78, status: 'Available', warehouse: 'Main Warehouse' },
  { _id: 'RM-BR-014', material: 'Bearing 6205', category: 'Component', uom: 'PCS', available: 125, reserved: 75, reorderLevel: 150, rate: 420, status: 'Low Stock', warehouse: 'Main Warehouse' },
  { _id: 'RM-HY-008', material: 'Hydraulic Hose', category: 'Component', uom: 'M', available: 90, reserved: 60, reorderLevel: 120, rate: 1850, status: 'Shortage', warehouse: 'Main Warehouse' },
  { _id: 'RM-ST-004', material: 'Steel Rod 20mm', category: 'Raw Material', uom: 'KG', available: 4860, reserved: 820, reorderLevel: 3000, rate: 64, status: 'Available', warehouse: 'Main Warehouse' },
  { _id: 'FG-HX-001', material: 'Harvester X', category: 'Finished Goods', uom: 'Units', available: 4, reserved: 3, reorderLevel: 2, rate: 465000, status: 'Reserved', warehouse: 'Finished Goods Yard' },
];

const inventorySummary = {
  _id: 'inventory-summary',
  plant: 'Plant 01', warehouse: 'Main Warehouse', asOn: '09 Sep 2026', itemCount: 128,
  cards: [
    { label: 'Total Stock Value', value: '₹48.6 Lakh', note: 'Across 4 stores' },
    { label: 'Raw Material', value: '₹29.4 Lakh', note: '60.5% of stock' },
    { label: 'WIP', value: '₹8.7 Lakh', note: '17 active orders' },
    { label: 'Finished Goods', value: '₹7.2 Lakh', note: '4 units ready' },
    { label: 'Trading Stock', value: '₹3.3 Lakh', note: '21 line items' },
  ],
};

const productionOrders = [
  {
    _id: 'PO-26091', product: 'Harvester X', plant: 'Plant 01', started: '02 Sep 2026', planned: 20, completed: 17, wip: 3,
    materialStatus: 'Material Available', status: 'In Production', expected: '10 Sep 2026',
    stages: [
      { name: 'Material Issue', state: 'Complete' }, { name: 'Fabrication', state: 'Complete' },
      { name: 'Machining', state: 'Complete' }, { name: 'Sub Assembly', state: 'Complete' },
      { name: 'Main Assembly', state: '65%' }, { name: 'QC', state: 'Pending' }, { name: 'Finished Goods', state: 'Queued' },
    ],
  },
  {
    _id: 'PO-26092', product: 'Harvester Y', plant: 'Plant 01', started: '03 Sep 2026', planned: 15, completed: 8, wip: 7,
    materialStatus: 'Material Shortage', status: 'Delayed', expected: '14 Sep 2026',
    stages: [
      { name: 'Material Issue', state: 'Complete' }, { name: 'Fabrication', state: 'Complete' },
      { name: 'Machining', state: 'Complete' }, { name: 'Sub Assembly', state: '40%' },
      { name: 'Main Assembly', state: 'Pending' }, { name: 'QC', state: 'Pending' }, { name: 'Finished Goods', state: 'Queued' },
    ],
  },
  {
    _id: 'PO-26087', product: 'Rotavator R2', plant: 'Plant 01', started: '28 Aug 2026', planned: 12, completed: 12, wip: 0,
    materialStatus: 'Material Available', status: 'Completed', expected: '06 Sep 2026',
    stages: [
      { name: 'Material Issue', state: 'Complete' }, { name: 'Fabrication', state: 'Complete' },
      { name: 'Machining', state: 'Complete' }, { name: 'Sub Assembly', state: 'Complete' },
      { name: 'Main Assembly', state: 'Complete' }, { name: 'QC', state: 'Complete' }, { name: 'Finished Goods', state: 'Complete' },
    ],
  },
];

const inspections = [
  {
    _id: 'FINAL-HX-26091-017', title: 'Harvester X', serial: 'HX-26091-017', decision: null,
    checks: [
      { name: 'Engine', result: 'PASS' }, { name: 'Hydraulic System', result: 'PASS' },
      { name: 'Blade Assembly', result: 'PASS' }, { name: 'Safety Check', result: 'PENDING' }, { name: 'Electrical', result: 'PASS' },
    ],
  },
];

const inspectionQueue = [
  { _id: 'Q-02', order: 2, title: 'Production QC', ref: 'Model X · PO-26091', status: 'Pending' },
  { _id: 'Q-01', order: 1, title: 'Incoming Material QC', ref: 'Steel Sheet · GRN-1048', status: 'Passed' },
  { _id: 'Q-03', order: 3, title: 'Final Equipment Inspection', ref: 'Model Y · HX-26092-004', status: 'Pending' },
];

const tradingItems = [
  { _id: 'T-A', item: 'Component A', purchase: 4.2, sales: 5.0 },
  { _id: 'T-B', item: 'Component B', purchase: 3.6, sales: 4.1 },
  { _id: 'T-C', item: 'Component C', purchase: 2.1, sales: 2.8 },
];
const tradingSummary = {
  _id: 'trading-summary',
  cards: [
    { label: 'Trading Purchase', value: '₹18.4 Lakh', note: 'September plan', tone: '' },
    { label: 'Trading Sales', value: '₹22.1 Lakh', note: '+14.8% vs Aug', tone: 'green' },
    { label: 'Gross Margin', value: '₹3.7 Lakh', note: 'Realised margin', tone: '' },
    { label: 'Margin %', value: '16.7%', note: 'Within target', tone: 'green' },
  ],
};

const products = [
  {
    _id: 'HAR-X-001', name: 'Harvester — Model X', code: 'HAR-X-001', category: 'Harvester', bomVersion: 'V2.1', status: 'Active',
    effectiveFrom: '01 Sep 2026',
    bom: [
      { assembly: 'Chassis Assembly', parts: ['Steel Sheet — 120 KG', 'Steel Rod — 38 KG', 'Fasteners — 42 PCS'] },
      { assembly: 'Cutting Assembly', parts: ['Blade — 12 PCS', 'Shaft — 2 PCS', 'Bearing — 8 PCS'] },
      { assembly: 'Hydraulic Assembly', parts: ['Hydraulic Pump — 1', 'Hose — 6 M', 'Valve — 4'] },
      { assembly: 'Electrical Assembly', parts: ['Wiring Kit — 1', 'Sensors — 6', 'Control Unit — 1'] },
    ],
    cost: { material: 284600, labour: 62000, overhead: 31500 },
    versions: [
      { version: 'V2.1', status: 'Active', effectiveFrom: '01 Sep 2026', note: 'Hose length revised, sensor count raised to 6' },
      { version: 'V2.0', status: 'Superseded', effectiveFrom: '01 Jun 2026', note: 'Hydraulic assembly redesign' },
      { version: 'V1.4', status: 'Superseded', effectiveFrom: '01 Jan 2026', note: 'Initial production release' },
    ],
  },
];

const inspectionHistory = [
  { _id: 'H-1', at: new Date('2026-09-08T16:20:00'), serial: 'HX-26091-016', product: 'Harvester X', outcome: 'Approved', by: 'Anand Rao' },
  { _id: 'H-2', at: new Date('2026-09-08T11:05:00'), serial: 'HY-26092-002', product: 'Harvester Y', outcome: 'Sent for rework', by: 'Anand Rao' },
  { _id: 'H-3', at: new Date('2026-09-05T15:40:00'), serial: 'RR-26087-012', product: 'Rotavator R2', outcome: 'Approved', by: 'Anand Rao' },
];

const costReports = [
  {
    _id: 'cost-model-x-2026-09', period: 'September 2026', product: 'MODEL X · HARVESTER',
    standardCost: '₹3.78L', actualCost: '₹4.02L', variance: '+₹24,000', variancePct: '+6.3%',
    grossMargin: '₹63,000', grossMarginPct: '13.6%', sellingPrice: '₹4.65L',
    bridge: [
      { label: 'Material rate', amount: 8400 }, { label: 'Material consumption', amount: 6800 },
      { label: 'Labour', amount: 4200 }, { label: 'Wastage', amount: 3100 }, { label: 'Other', amount: 1500 },
    ],
  },
  {
    _id: 'cost-model-x-2026-08', period: 'August 2026', product: 'MODEL X · HARVESTER',
    standardCost: '₹3.78L', actualCost: '₹3.95L', variance: '+₹17,000', variancePct: '+4.5%',
    grossMargin: '₹70,000', grossMarginPct: '15.1%', sellingPrice: '₹4.65L',
    bridge: [
      { label: 'Material rate', amount: 5600 }, { label: 'Material consumption', amount: 4800 },
      { label: 'Labour', amount: 3200 }, { label: 'Wastage', amount: 2200 }, { label: 'Other', amount: 1200 },
    ],
  },
  {
    _id: 'cost-model-x-2026-07', period: 'July 2026', product: 'MODEL X · HARVESTER',
    standardCost: '₹3.78L', actualCost: '₹3.91L', variance: '+₹13,000', variancePct: '+3.4%',
    grossMargin: '₹74,000', grossMarginPct: '15.9%', sellingPrice: '₹4.65L',
    bridge: [
      { label: 'Material rate', amount: 4100 }, { label: 'Material consumption', amount: 3700 },
      { label: 'Labour', amount: 2600 }, { label: 'Wastage', amount: 1700 }, { label: 'Other', amount: 900 },
    ],
  },
];

const consumption = {
  _id: 'consumption-po-26091',
  order: 'PO-26091', product: 'Harvester X', done: 17, planned: 20,
  rows: [
    { material: 'Steel Sheet', uom: 'KG', standard: 2000, actual: 2140 },
    { material: 'Steel Rod', uom: 'KG', standard: 600, actual: 618 },
    { material: 'Bearing', uom: '', standard: 160, actual: 160 },
    { material: 'Hydraulic Hose', uom: 'M', standard: 120, actual: 128 },
  ],
  insight: { headline: 'Steel consumption is 7% above standard', reasons: ['Cutting wastage', 'BOM revision', 'Process loss', 'Measurement variance'] },
};

const mis = {
  _id: 'mis-2026-09',
  month: 'September 2026', salesTotal: '₹1.32 Cr',
  salesTrend: [
    { month: 'Apr', value: 0.62 }, { month: 'May', value: 0.74 }, { month: 'Jun', value: 0.71 },
    { month: 'Jul', value: 0.98 }, { month: 'Aug', value: 1.17 }, { month: 'Sep', value: 1.32 },
  ],
  planVsActual: [
    { label: 'Production', text: '17 / 20', pct: 85, tone: 'green' },
    { label: 'Purchase receipts', text: '₹42.6L / ₹48L', pct: 89, tone: 'amber' },
    { label: 'Gross margin', text: '18.7% / 20%', pct: 94, tone: 'green' },
    { label: 'Collections', text: '₹16.4L / ₹24.8L', pct: 66, tone: 'red' },
  ],
  kpis: [
    { label: 'Inventory value', value: '₹48.6L', note: '−2.1% vs Aug', tone: '' },
    { label: 'Receivables', value: '₹24.8L', note: '₹8.4L overdue', tone: 'red' },
    { label: 'Payables', value: '₹18.4L', note: '₹6.2L due this week', tone: '' },
    { label: 'Production output', value: '17 units', note: '85% of plan', tone: 'green' },
  ],
};

const roles = [
  { _id: 'director', tag: 'Owner / Director', title: 'Business Position', blurb: 'Exceptions · Sales · Production · Margin · Cash', color: '#2d4a3e', icon: 'briefcase', to: '/' },
  { _id: 'production', tag: 'Production Manager', title: 'Production Plan', blurb: 'WIP · Material availability · Consumption · Variance', color: '#b45309', icon: 'factory', to: '/production' },
  { _id: 'store', tag: 'Store Manager', title: 'Store Position', blurb: 'Receipts · Issues · Transfers · Stock · Shortages', color: '#1d4e89', icon: 'boxes', to: '/inventory' },
  { _id: 'accounts', tag: 'Accounts', title: 'Finance Position', blurb: 'Sales · Purchase · Receivables · Payables · Closing', color: '#4a7c59', icon: 'wallet', to: '/mis' },
];

const users = [{ _id: 'anand-rao', name: 'Anand Rao', initials: 'AR', role: 'Director', email: 'anand.rao@kisantractor.example' }];

export const collections = {
  dashboard: [dashboard],
  purchase_requirements: purchaseRequirements,
  purchase_orders: purchaseOrders,
  purchase_requests: purchaseRequests,
  vendors,
  customers,
  sales_orders: salesOrders,
  stock_items: stockItems,
  inventory_summary: [inventorySummary],
  production_orders: productionOrders,
  inspections,
  inspection_queue: inspectionQueue,
  inspection_history: inspectionHistory,
  trading_items: tradingItems,
  trading_summary: [tradingSummary],
  products,
  cost_reports: costReports,
  consumption: [consumption],
  mis: [mis],
  roles,
  users,
};
