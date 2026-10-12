export const STORAGE_KEY = 'iita_cacao_demo_v5';

export const STATES = ['Oyo', 'Ondo', 'Osun', 'Ekiti', 'Ogun'];

export const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

export const PEOPLE = [
  { name: 'A. Ogunleye',   email: 'a.ogunleye@example.org',  role: 'Nursery Operator',   nursery: ['NUR-101', 'NUR-102', 'NUR-103'] },
  { name: 'Ngozi Eze',     email: 'n.eze@example.org',       role: 'Extension Officer',  state: 'Oyo' },
  { name: 'Dr. F. Adeniyi',email: 'f.adeniyi@example.org',   role: 'Inspector',          state: 'Oyo, Osun' },
  { name: 'Mr. K. Salami', email: 'k.salami@example.org',    role: 'Inspector',          state: 'Ondo, Ogun' },
  { name: 'Segun Balogun', email: 's.balogun@example.org',   role: 'Project Manager' },
  { name: 'Adaeze Nwosu',  email: 'a.nwosu@example.org',    role: 'Administrator' },
];

export const DESC = {
  'Administrator':      'Full access to all modules, users, and settings.',
  'Project Manager':    'Access to nurseries, production, verification, and reports.',
  'Inspector':          'Reviews and approves or rejects production records.',
  'Extension Officer':  'Records nurseries and production records for a state.',
  'Nursery Operator':   'Records and manages their own nursery and production.',
};

export const DISP = {
  Pending:    'Waiting',
  'In Review':'Being checked',
  Verified:   'Approved',
  Rejected:   'Not approved',
};

export const PERMISSIONS = {
  'Administrator':      ['nur', 'prod', 'verify', 'users', 'reports', 'settings'],
  'Project Manager':    ['nur', 'prod', 'verify', 'reports'],
  'Inspector':          ['verify'],
  'Extension Officer':  ['nur', 'prod'],
  'Nursery Operator':   ['nur', 'prod'],
};

// MODULE_CONFIGS (referred to as C in original)
export const MODULE_CONFIGS = {
  nur: {
    title: 'Nurseries',
    singular: 'Nursery',
    addLabel: 'Add Nursery',
    cols: ['ID', 'Name', 'Operator', 'State', 'LGA', 'Registered', 'Status'],
    fields: ['id', 'name', 'op', 'state', 'lga', 'date', 'status'],
    filterFields: [
      { key: 'state', label: 'All States', type: 'select', options: STATES },
      { key: 'status', label: 'All Statuses', type: 'select', options: ['Active', 'Pending', 'Inactive'] },
    ],
    hasDateRange: false,
    canAdd: ['nur'],
  },
  prod: {
    title: 'Production Records',
    singular: 'Production Record',
    addLabel: 'Add Record',
    cols: ['ID', 'Nursery', 'Variety', 'Qty', 'Date', 'Recorded By', 'Status'],
    fields: ['id', 'nur', 'variety', 'qty', 'date', 'by', 'status'],
    filterFields: [
      { key: 'nur', label: 'All Nurseries', type: 'select', optionsKey: 'nurNames' },
      { key: 'variety', label: 'All Varieties', type: 'select', optionsKey: 'varNames' },
      { key: 'status', label: 'All Statuses', type: 'select', options: ['Pending', 'In Review', 'Verified', 'Rejected'] },
    ],
    hasDateRange: true,
    canAdd: ['prod'],
  },
  vars: {
    title: 'Cocoa Varieties',
    singular: 'Variety',
    addLabel: 'Add Variety',
    cols: ['ID', 'Image', 'Name', 'Description', 'Attributes', 'Status'],
    fields: ['id', 'image', 'name', 'desc', 'attr', 'status'],
    filterFields: [
      { key: 'status', label: 'All Statuses', type: 'select', options: ['Active', 'Inactive'] },
    ],
    hasDateRange: false,
    canAdd: [],
  },
  insp: {
    title: 'Inspections',
    singular: 'Inspection',
    addLabel: 'Add Inspection',
    cols: ['ID', 'Nursery', 'Prod. Record', 'Inspector', 'Date', 'Summary', 'Status'],
    fields: ['id', 'nur', 'prod', 'by', 'date', 'sum', 'status'],
    filterFields: [
      { key: 'nur', label: 'All Nurseries', type: 'select', optionsKey: 'nurNames' },
      { key: 'status', label: 'All Statuses', type: 'select', options: ['Pending', 'In Review', 'Verified', 'Rejected'] },
    ],
    hasDateRange: true,
    canAdd: [],
  },
  dist: {
    title: 'Distribution',
    singular: 'Distribution Record',
    addLabel: 'Record Distribution',
    cols: ['ID', 'Nursery', 'Prod. Record', 'Variety', 'Qty', 'Recipient', 'Destination', 'Date', 'Status'],
    fields: ['id', 'nur', 'prod', 'variety', 'qty', 'to', 'dest', 'date', 'status'],
    filterFields: [
      { key: 'dest', label: 'All Destination States', type: 'select', options: STATES },
      { key: 'nur', label: 'All Nurseries', type: 'select', optionsKey: 'nurNames' },
      { key: 'variety', label: 'All Varieties', type: 'select', optionsKey: 'varNames' },
      { key: 'status', label: 'All Statuses', type: 'select', options: ['Received', 'In Transit', 'Recorded'] },
    ],
    hasDateRange: true,
    canAdd: ['prod', 'verify'],
  },
  users: {
    title: 'Users & Roles',
    singular: 'User',
    addLabel: 'Add User / Staff',
    cols: ['ID', 'Name', 'Email', 'Role', 'Scope', 'Status', 'Last Active'],
    fields: ['id', 'name', 'email', 'role', 'scope', 'status', 'last'],
    filterFields: [
      { key: 'role', label: 'All Roles', type: 'select', options: ['Administrator', 'Project Manager', 'Inspector', 'Extension Officer', 'Nursery Operator'] },
      { key: 'status', label: 'All Statuses', type: 'select', options: ['Active', 'Pending', 'Inactive'] },
      { key: 'scope', label: 'All States / Scope', type: 'select', options: STATES },
    ],
    hasDateRange: false,
    canAdd: ['users'],
  },
};

export const PAGES = [
  { key: 'home',     label: 'Dashboard',    icon: 'home',    perm: null },
  { key: 'nur',      label: 'Nurseries',    icon: 'leaf',    perm: 'nur' },
  { key: 'prod',     label: 'Production',   icon: 'box',     perm: 'prod' },
  { key: 'vars',     label: 'Varieties',    icon: 'dna',     perm: 'prod' },
  { key: 'insp',     label: 'Inspections',  icon: 'check',   perm: 'verify' },
  { key: 'dist',     label: 'Distribution', icon: 'truck',   perm: 'prod' },
  { key: 'users',    label: 'Users & Roles',icon: 'users',   perm: 'users' },
  { key: 'infographics', label: 'Infographics', icon: 'chart', perm: 'reports' },
  { key: 'reports',  label: 'Reports',      icon: 'clipboard', perm: 'reports' },
  { key: 'map',      label: 'Production map', icon: 'map',    perm: 'reports' },
  { key: 'settings', label: 'Settings',     icon: 'settings',perm: 'settings' },
  { key: 'notifications', label: 'Notifications', icon: 'bell', perm: null },
];

// SVG icon paths
export const IC = {
  home:     'M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z M9 21V12h6v9',
  leaf:     'M12 2C6 2 3 8 3 13s4 9 9 9c0-4-1-8-4-11 3 1 7 2 9 5 0-5-2-10-5-14z',
  box:      'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12',
  dna:      'M2 12h3m14 0h3 M5 12C5 6 9 3 12 3s7 3 7 9-4 9-7 9-7-3-7-9z M8.5 7.5C9.5 9 10 10.5 10 12s-.5 3-1.5 4.5 M15.5 7.5C14.5 9 14 10.5 14 12s.5 3 1.5 4.5',
  check:    'M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
  truck:    'M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z M19.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  users:    'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
  chart:    'M18 20V10 M12 20V4 M6 20v-6',
  map:      'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1116 0z M12 13a3 3 0 100-6 3 3 0 000 6',
  clipboard:'M6 4h12a2 2 0 012 2v15H4V6a2 2 0 012-2z M9 4V2h6v2 M8 10h8 M8 14h8 M8 18h5',
  settings: 'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
  bell:     'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0',
  search:   'M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z',
  menu:     'M3 12h18 M3 6h18 M3 18h18',
  close:    'M18 6L6 18 M6 6l12 12',
  plus:     'M12 5v14 M5 12h14',
  eye:      'M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z M12 15a3 3 0 100-6 3 3 0 000 6z',
  edit:     'M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z',
  download: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3',
  warn:     'M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01',
  info:     'M12 22a10 10 0 100-20 10 10 0 000 20z M12 16v-4 M12 8h.01',
  logout:   'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9',
  user:     'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z',
};

// Status class map
export const SC = {
  Verified:   'text-green-800 border-green-300 bg-green-50',
  Active:     'text-green-800 border-green-300 bg-green-50',
  Received:   'text-green-800 border-green-300 bg-green-50',
  Pending:    'text-amber-800 border-amber-300 bg-amber-50',
  'In Review':'text-blue-800  border-blue-300  bg-blue-50',
  'In Transit':'text-blue-800 border-blue-300  bg-blue-50',
  Recorded:   'text-blue-800  border-blue-300  bg-blue-50',
  Rejected:   'text-red-800   border-red-300   bg-red-50',
  Inactive:   'text-red-800   border-red-300   bg-red-50',
};

const mk = (p, s, keys, rows) =>
  rows.map((r, i) => {
    const a = r.split('|');
    const o = { id: p + (s + i) };
    keys.forEach((k, j) => (o[k] = a[j]));
    return o;
  });

export const SEED_DATA = () => ({
  nur: mk('NUR-', 101, ['name', 'op', 'state', 'lga', 'date', 'status'], [
    'Ibadan Cacao Hub|A. Ogunleye|Oyo|Ibadan North|2024-03-12|Active',
    'Ibadan Cacao Hub Extension|A. Ogunleye|Oyo|Ibadan North|2024-04-08|Active',
    'Oyo Cacao Seed Garden|A. Ogunleye|Oyo|Akinyele|2024-06-22|Active',
    'Ido Seedling Farm|B. Olatunji|Oyo|Ido|2024-05-02|Active',
    'Owo Cocoa Nursery|T. Akinwale|Ondo|Owo|2024-06-18|Active',
    'Ile-Oluji Seed Garden|F. Adegoke|Ondo|Ile Oluji/Okeigbo|2024-08-09|Pending',
    'Ondo East Plantlets|S. Fashola|Ondo|Ondo East|2025-01-21|Active',
    'Ife Cacao Propagation|M. Ajayi|Osun|Ife Central|2025-02-14|Active',
    'Ilesa Seedling Centre|K. Oladipo|Osun|Ilesa East|2025-03-30|Inactive',
    'Ikere Cocoa Gardens|R. Ogunbiyi|Ekiti|Ikere|2025-05-11|Active',
    'Ado-Ekiti Nursery|J. Famuyiwa|Ekiti|Ado Ekiti|2025-07-07|Pending',
    'Ijebu-Ode Cacao Farm|P. Sonuga|Ogun|Ijebu Ode|2025-08-19|Active',
    'Abeokuta Seed Garden|C. Adewale|Ogun|Abeokuta South|2025-10-03|Active',
    'Akure Planting Materials|E. Ilori|Ondo|Akure South|2026-02-16|Active',
  ]),
  vars: mk('CV-0', 1, ['name', 'image', 'desc', 'attr', 'status'], [
    'Hybrid Type A|/cacao-variety.svg|Placeholder hybrid planting material|Seed-propagated|Active',
    'Hybrid Type B|/cacao-variety.svg|Placeholder hybrid planting material|Seed-propagated|Active',
    'Local Selection C|/cacao-variety.svg|Placeholder locally selected material|Seed-propagated|Active',
    'Clonal Selection D|/cacao-variety.svg|Placeholder clonal material|Vegetative|Active',
    'Trial Material E|/cacao-variety.svg|Placeholder trial entry|Under evaluation|Inactive',
  ]),
  prod: mk('PR-', 2001, ['nur', 'variety', 'qty', 'date', 'by', 'status', 'planId'], [
    'Ibadan Cacao Hub|Hybrid Type A|12000|2026-04-14|Ngozi Eze|Verified|',
    'Ido Seedling Farm|Hybrid Type B|8500|2026-04-28|Ngozi Eze|Verified|',
    'Owo Cocoa Nursery|Local Selection C|15200|2026-05-09|Tunde Bello|Verified|PP-1002',
    'Ondo East Plantlets|Hybrid Type A|9800|2026-06-02|Tunde Bello|Pending|PP-1005',
    'Ife Cacao Propagation|Clonal Selection D|6400|2026-06-20|Amina Yusuf|Verified|PP-1003',
    'Ikere Cocoa Gardens|Hybrid Type B|11000|2026-07-11|Amina Yusuf|Verified|PP-1006',
    'Ijebu-Ode Cacao Farm|Hybrid Type A|13500|2026-07-25|Ngozi Eze|In Review|PP-1008',
    'Abeokuta Seed Garden|Local Selection C|7200|2026-08-13|Tunde Bello|Verified|PP-1009',
    'Akure Planting Materials|Hybrid Type B|10300|2026-09-03|Amina Yusuf|Pending|PP-1010',
    'Ibadan Cacao Hub|Clonal Selection D|5600|2026-09-18|Ngozi Eze|Pending|',
    'Owo Cocoa Nursery|Hybrid Type A|4000|2026-09-24|Tunde Bello|Rejected|',
    'Ibadan Cacao Hub|Hybrid Type B|7600|2026-09-27|A. Ogunleye|Verified|',
    'Ibadan Cacao Hub|Hybrid Type B|7800|2026-10-02|A. Ogunleye|Pending|',
    'Ibadan Cacao Hub|Local Selection C|4300|2026-10-09|A. Ogunleye|In Review|',
    'Ido Seedling Farm|Local Selection C|5100|2026-10-10|Ngozi Eze|Pending|',
    'Ife Cacao Propagation|Hybrid Type A|6900|2026-10-10|Ngozi Eze|Pending|',
    'Owo Cocoa Nursery|Clonal Selection D|4700|2026-10-10|Mr. K. Salami|In Review|',
    'Ibadan Cacao Hub Extension|Hybrid Type A|6200|2026-10-11|A. Ogunleye|Pending|',
    'Oyo Cacao Seed Garden|Local Selection C|4800|2026-10-11|A. Ogunleye|In Review|',
    'Oyo Cacao Seed Garden|Hybrid Type B|5300|2026-10-12|A. Ogunleye|Pending|',
  ]),
  insp: mk('INS-', 3001, ['nur', 'prod', 'by', 'date', 'sum', 'status'], [
    'Ibadan Cacao Hub|PR-2001|Dr. F. Adeniyi|2026-04-20|Counts and labelling match record|Verified',
    'Ido Seedling Farm|PR-2002|Dr. F. Adeniyi|2026-05-04|Counts and labelling match record|Verified',
    'Owo Cocoa Nursery|PR-2003|Mr. K. Salami|2026-05-15|Minor label corrections made|Verified',
    'Ondo East Plantlets|PR-2004|Mr. K. Salami|2026-06-08|Awaiting site visit|Pending',
    'Ife Cacao Propagation|PR-2005|Dr. F. Adeniyi|2026-06-26|Counts and labelling match record|Verified',
    'Ikere Cocoa Gardens|PR-2006|Mr. K. Salami|2026-07-17|Counts and labelling match record|Verified',
    'Ijebu-Ode Cacao Farm|PR-2007|Dr. F. Adeniyi|2026-08-01|Quantity under review|In Review',
    'Abeokuta Seed Garden|PR-2008|Mr. K. Salami|2026-08-19|Counts and labelling match record|Verified',
    'Owo Cocoa Nursery|PR-2011|Dr. F. Adeniyi|2026-09-30|Quantity could not be confirmed|Rejected',
    'Ibadan Cacao Hub|PR-2012|Dr. F. Adeniyi|2026-09-29|Counts and labelling match record|Verified',
    'Ibadan Cacao Hub|PR-2013|Dr. F. Adeniyi|2026-10-04|Awaiting site visit|Pending',
    'Ibadan Cacao Hub|PR-2014|Dr. F. Adeniyi|2026-10-09|Label review in progress|In Review',
    'Ido Seedling Farm|PR-2015|Dr. F. Adeniyi|2026-10-10|Awaiting nursery visit and count confirmation|Pending',
    'Ife Cacao Propagation|PR-2016|Dr. F. Adeniyi|2026-10-10|Evidence uploaded; inspector review not started|Pending',
    'Owo Cocoa Nursery|PR-2017|Mr. K. Salami|2026-10-10|Quantity and variety labels require a second check|In Review',
  ]),
  dist: mk('DST-', 5001, ['nur', 'prod', 'variety', 'qty', 'to', 'dest', 'date', 'status'], [
    'Ibadan Cacao Hub|PR-2001|Hybrid Type A|6000|Oyo Farmers Cooperative|Oyo|2026-05-02|Received',
    'Ido Seedling Farm|PR-2002|Hybrid Type B|4000|Ido Extension Unit|Oyo|2026-05-20|Received',
    'Owo Cocoa Nursery|PR-2003|Local Selection C|9000|Ondo Growers Association|Ondo|2026-06-01|Received',
    'Ife Cacao Propagation|PR-2005|Clonal Selection D|3000|Osun Smallholder Group|Osun|2026-07-10|In Transit',
    'Ikere Cocoa Gardens|PR-2006|Hybrid Type B|5500|Ekiti Cocoa Farmers|Ekiti|2026-08-04|Recorded',
    'Abeokuta Seed Garden|PR-2008|Local Selection C|3500|Ogun Planting Scheme|Ogun|2026-09-05|Recorded',
    'Ibadan Cacao Hub|PR-2012|Hybrid Type B|3000|Oyo Farmers Cooperative|Oyo|2026-10-03|Recorded',
  ]),
  plan: mk('PP-', 1001, ['nur', 'producer', 'state', 'variety', 'target', 'plantingDate', 'status', 'submittedBy', 'submittedDate'], [
    'Ibadan Cacao Hub|A. Ogunleye|Oyo|Hybrid Type B|25000|2026-11-15|Submitted|A. Ogunleye|2026-10-08',
    'Owo Cocoa Nursery|T. Akinwale|Ondo|Local Selection C|18000|2026-12-02|Validated|Ngozi Eze|2026-09-28',
    'Ife Cacao Propagation|M. Ajayi|Osun|Clonal Selection D|12000|2026-10-25|In Review|Amina Yusuf|2026-09-22',
    'Ido Seedling Farm|B. Olatunji|Oyo|Hybrid Type A|22000|2026-11-21|Approved|Ngozi Eze|2026-09-17',
    'Ondo East Plantlets|S. Fashola|Ondo|Hybrid Type A|30000|2027-01-08|Submitted|S. Fashola|2026-10-09',
    'Ikere Cocoa Gardens|R. Ogunbiyi|Ekiti|Hybrid Type B|14500|2026-12-14|Returned|Dr. F. Adeniyi|2026-09-25',
    'Ado-Ekiti Nursery|J. Famuyiwa|Ekiti|Trial Material E|9000|2027-01-18|In Review|Ngozi Eze|2026-10-02',
    'Ijebu-Ode Cacao Farm|P. Sonuga|Ogun|Hybrid Type A|27000|2026-11-30|Approved|Ngozi Eze|2026-09-12',
    'Abeokuta Seed Garden|C. Adewale|Ogun|Local Selection C|16000|2026-12-20|Submitted|C. Adewale|2026-10-07',
    'Akure Planting Materials|E. Ilori|Ondo|Hybrid Type B|24000|2027-01-12|In Review|Mr. K. Salami|2026-10-03',
  ]),
  users: mk('U-', 1, ['name', 'email', 'role', 'scope', 'status', 'last', 'lga', 'phone', 'organization', 'farmSize', 'nursery', 'userTypes'], [
    'Adaeze Nwosu|a.nwosu@example.org|Administrator|All states|Active|2026-10-08|Ibadan North|+234 803 111 2233|IITA Genetic Resources Center (GRC)|—|—|Administrator, Researcher',
    'Segun Balogun|s.balogun@example.org|Project Manager|All states|Active|2026-10-07|Ibadan Central|+234 802 444 5566|Cacao Transformation Programme|—|—|Project manager',
    'Dr. F. Adeniyi|f.adeniyi@example.org|Inspector|Oyo, Osun|Active|2026-10-06|Ibadan North|+234 805 777 8899|National Phytosanitary Service|—|—|Inspector, Regulator',
    'Mr. K. Salami|k.salami@example.org|Inspector|Ondo, Ogun|Active|2026-10-05|Akure South|+234 806 222 3344|Ondo State Seed Quality Agency|—|—|Inspector',
    'Ngozi Eze|n.eze@example.org|Extension Officer|Oyo|Active|2026-10-08|Ido|+234 807 888 9900|Oyo Agricultural Development Programme (OYSADEP)|—|—|Extension officer',
    'A. Ogunleye|a.ogunleye@example.org|Nursery Operator|NUR-101|Inactive|2026-09-12|Ibadan East|+234 803 555 1234|Ogunleye Cocoa Nurseries|5 hectares|Ibadan Cacao Hub|Farmer, Nursery operator',
    'Olumide Adeleke|o.adeleke@cocoagrowers.ng|Nursery Operator|Osun|Pending|Never|Ilesa East|+234 803 765 4321|Ilesa Cocoa Farmers Cooperative|3.5 hectares|Ilesa Central Nursery|Farmer, Cacao seed producer, Nursery operator',
    'Fatima Mohammed|f.mohammed@agridev.org|Extension Officer|Ondo|Pending|Never|Akure North|+234 809 123 4567|Ondo Cocoa Revitalization Taskforce|—|—|Extension officer, Agronomy',
    'Ibrahim Olatunji|i.olatunji@cocoanurseries.org|Nursery Operator|Oyo|Pending|Never|Ido|+234 803 987 6543|Ido Polybag Seedling Hub|4 hectares|Ido Seedling Farm|Farmer, Cacao seed producer, Nursery operator',
  ]),
  audit: [],
  mon: [18200, 21400, 19800, 24100, 26500, 23900, 28700, 31200, 27600, 29800, 33400, 30900],
});
