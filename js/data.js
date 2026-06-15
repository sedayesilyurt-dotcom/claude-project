// ── Data Layer — LocalStorage ──

const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
  nextId(arr) { return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1; }
};

// Leads
const Leads = {
  all()          { return DB.get('leads'); },
  save(arr)      { DB.set('leads', arr); },
  add(lead)      { const arr = this.all(); lead.id = DB.nextId(arr); lead.createdAt = today(); arr.unshift(lead); this.save(arr); return lead; },
  update(id, d)  { const arr = this.all().map(x => x.id === id ? {...x, ...d} : x); this.save(arr); },
  remove(id)     { this.save(this.all().filter(x => x.id !== id)); },
  find(id)       { return this.all().find(x => x.id === id); }
};

// Meetings
const Meetings = {
  all()          { return DB.get('meetings'); },
  save(arr)      { DB.set('meetings', arr); },
  add(m)         { const arr = this.all(); m.id = DB.nextId(arr); arr.unshift(m); this.save(arr); return m; },
  update(id, d)  { const arr = this.all().map(x => x.id === id ? {...x, ...d} : x); this.save(arr); },
  remove(id)     { this.save(this.all().filter(x => x.id !== id)); },
  find(id)       { return this.all().find(x => x.id === id); }
};

// Customers
const Customers = {
  all()          { return DB.get('customers'); },
  save(arr)      { DB.set('customers', arr); },
  add(c)         { const arr = this.all(); c.id = DB.nextId(arr); c.createdAt = today(); arr.unshift(c); this.save(arr); return c; },
  update(id, d)  { const arr = this.all().map(x => x.id === id ? {...x, ...d} : x); this.save(arr); },
  remove(id)     { this.save(this.all().filter(x => x.id !== id)); },
  find(id)       { return this.all().find(x => x.id === id); }
};

// Payments
const Payments = {
  all()          { return DB.get('payments'); },
  save(arr)      { DB.set('payments', arr); },
  add(p)         { const arr = this.all(); p.id = DB.nextId(arr); arr.unshift(p); this.save(arr); return p; },
  update(id, d)  { const arr = this.all().map(x => x.id === id ? {...x, ...d} : x); this.save(arr); },
  remove(id)     { this.save(this.all().filter(x => x.id !== id)); },
  find(id)       { return this.all().find(x => x.id === id); }
};

// Services
const Services = {
  all()          { return DB.get('services'); },
  save(arr)      { DB.set('services', arr); },
  add(s)         { const arr = this.all(); s.id = DB.nextId(arr); arr.unshift(s); this.save(arr); return s; },
  update(id, d)  { const arr = this.all().map(x => x.id === id ? {...x, ...d} : x); this.save(arr); },
  remove(id)     { this.save(this.all().filter(x => x.id !== id)); },
  find(id)       { return this.all().find(x => x.id === id); }
};

// Settings
const Settings = {
  get()   { try { return JSON.parse(localStorage.getItem('settings') || '{}'); } catch { return {}; } },
  save(s) { localStorage.setItem('settings', JSON.stringify(s)); }
};

// ── Constants ──
const LEAD_SOURCES = [
  'WhatsApp Reklamı', 'Instagram DM Reklamı', 'Facebook Form Reklamı',
  'Web Site Formu', 'Organik Başvuru'
];
const LEAD_STATUS = [
  { val: 'yeni',      label: 'Yeni Lead',           cls: 'badge-blue'   },
  { val: 'iletisim',  label: 'İletişime Geçildi',   cls: 'badge-yellow' },
  { val: 'gorusme',   label: 'Görüşme Yapıldı',     cls: 'badge-purple' },
  { val: 'toplanti',  label: 'Toplantı Planlandı',  cls: 'badge-orange' },
  { val: 'satis',     label: 'Satış Yapıldı',       cls: 'badge-green'  },
  { val: 'donusmsuz', label: 'Dönüşüm Olmadı',      cls: 'badge-red'    }
];
const MEETING_TYPES = ['Zoom', 'Telefon Görüşmesi', 'WhatsApp Görüşmesi', 'Yüz Yüze'];
const MEETING_STATUS = [
  { val: 'planlandi',  label: 'Planlandı',     cls: 'badge-blue'   },
  { val: 'tamamlandi', label: 'Tamamlandı',    cls: 'badge-green'  },
  { val: 'iptal',      label: 'İptal Edildi',  cls: 'badge-red'    }
];
const SECTORS = ['Güzellik Merkezi', 'Emlak Danışmanı', 'Psikolog', 'Diyetisyen', 'Mobilya', 'Kuaför', 'Diğer'];
const SERVICE_LIST = [
  'Meta Reklam Yönetimi', 'Sosyal Medya Yönetimi', 'Danışmanlık',
  'İçerik Stratejisi', 'Eğitim', 'Reklam Kurulumu', 'Funnel Kurulumu', 'Diğer'
];
const CUSTOMER_STATUS = [
  { val: 'aktif',   label: 'Aktif',    cls: 'badge-green'  },
  { val: 'pasif',   label: 'Pasif',    cls: 'badge-gray'   },
  { val: 'duraklat',label: 'Duraklatıldı', cls: 'badge-yellow' }
];
const PAYMENT_STATUS = [
  { val: 'odendi',   label: 'Ödendi',   cls: 'badge-green'  },
  { val: 'bekliyor', label: 'Bekliyor', cls: 'badge-yellow' },
  { val: 'gecikti',  label: 'Gecikti',  cls: 'badge-red'    }
];

// ── Helpers ──
function today() { return new Date().toLocaleDateString('tr-TR'); }

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('tr-TR', {day:'2-digit', month:'2-digit', year:'numeric'});
}

function fmtMoney(n) {
  if (!n && n !== 0) return '—';
  return Number(n).toLocaleString('tr-TR') + ' ₺';
}

function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function badgeFor(arr, val) {
  const found = arr.find(x => x.val === val);
  return found ? `<span class="badge ${found.cls}">${found.label}</span>` : `<span class="badge badge-gray">${val}</span>`;
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
}

function getMonthName(i) {
  return ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'][i];
}
