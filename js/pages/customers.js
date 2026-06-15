function renderCustomers() {
  return `
  <div class="page">
    <div class="section-card" style="margin-bottom:20px">
      <div class="section-header">
        <h2>Yeni Müşteri Ekle</h2>
        <button class="btn btn-ghost btn-sm" id="toggle-customer-form">Formu Aç / Kapat</button>
      </div>
      <div class="section-body" id="customer-form-wrap">
        <form onsubmit="submitCustomer(event)">
          <div class="form-grid">
            <div class="form-group">
              <label>Ad Soyad *</label>
              <input name="name" placeholder="Ad Soyad" required />
            </div>
            <div class="form-group">
              <label>Telefon *</label>
              <input name="phone" type="tel" placeholder="05XX XXX XX XX" required />
            </div>
            <div class="form-group">
              <label>İşletme Adı</label>
              <input name="business" placeholder="İşletme adı" />
            </div>
            <div class="form-group">
              <label>Sektör</label>
              <select name="sector">
                <option value="">Seçiniz</option>
                ${SECTORS.map(s => `<option>${s}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Başlangıç Tarihi</label>
              <input name="startDate" type="date" />
            </div>
            <div class="form-group">
              <label>Durum</label>
              <select name="status">
                ${CUSTOMER_STATUS.map(s => `<option value="${s.val}">${s.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="grid-column:1/-1">
              <label>Hizmetler (birden fazla seçilebilir)</label>
              <div style="display:flex;flex-wrap:wrap;gap:8px;padding:10px;border:1.5px solid var(--border);border-radius:8px;background:var(--white)" id="service-checkboxes">
                ${SERVICE_LIST.map((s,i) => `
                  <label style="display:flex;align-items:center;gap:6px;font-size:.82rem;cursor:pointer;padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:var(--bg)">
                    <input type="checkbox" name="services" value="${s}" style="accent-color:var(--primary)"> ${s}
                  </label>`).join('')}
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Müşteri Ekle</button>
            <button type="reset" class="btn btn-ghost">Temizle</button>
          </div>
        </form>
      </div>
    </div>

    <div class="section-card">
      <div class="section-header">
        <h2>Mevcut Müşteriler <span id="customer-count" class="text-muted text-sm"></span></h2>
      </div>
      <div class="section-body">
        <div class="toolbar">
          <input class="search" type="text" placeholder="🔍  İsim veya işletme ara..." id="customer-search" oninput="filterCustomers()" />
          <select id="customer-filter-sector" onchange="filterCustomers()">
            <option value="">Tüm Sektörler</option>
            ${SECTORS.map(s => `<option>${s}</option>`).join('')}
          </select>
          <select id="customer-filter-status" onchange="filterCustomers()">
            <option value="">Tüm Durumlar</option>
            ${CUSTOMER_STATUS.map(s => `<option value="${s.val}">${s.label}</option>`).join('')}
          </select>
        </div>
        <div class="customer-grid" id="customer-grid"></div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal-overlay" id="customer-modal">
      <div class="modal">
        <div class="modal-header">
          <h3>Müşteri Düzenle</h3>
          <button class="modal-close" onclick="closeModal('customer-modal')">✕</button>
        </div>
        <div class="modal-body">
          <form onsubmit="updateCustomer(event)">
            <input type="hidden" id="edit-customer-id" />
            <div class="form-grid">
              <div class="form-group">
                <label>Ad Soyad *</label>
                <input id="edit-customer-name" required />
              </div>
              <div class="form-group">
                <label>Telefon</label>
                <input id="edit-customer-phone" />
              </div>
              <div class="form-group">
                <label>İşletme Adı</label>
                <input id="edit-customer-business" />
              </div>
              <div class="form-group">
                <label>Sektör</label>
                <select id="edit-customer-sector">
                  <option value="">Seçiniz</option>
                  ${SECTORS.map(s => `<option>${s}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Başlangıç Tarihi</label>
                <input id="edit-customer-start" type="date" />
              </div>
              <div class="form-group">
                <label>Durum</label>
                <select id="edit-customer-status">
                  ${CUSTOMER_STATUS.map(s => `<option value="${s.val}">${s.label}</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="grid-column:1/-1">
                <label>Hizmetler</label>
                <div style="display:flex;flex-wrap:wrap;gap:8px;padding:10px;border:1.5px solid var(--border);border-radius:8px" id="edit-service-checkboxes">
                  ${SERVICE_LIST.map(s => `
                    <label style="display:flex;align-items:center;gap:6px;font-size:.82rem;cursor:pointer;padding:4px 10px;border:1px solid var(--border);border-radius:6px;background:var(--bg)">
                      <input type="checkbox" class="edit-svc" value="${s}" style="accent-color:var(--primary)"> ${s}
                    </label>`).join('')}
                </div>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Güncelle</button>
              <button type="button" class="btn btn-ghost" onclick="closeModal('customer-modal')">İptal</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>`;
}

function initCustomers() {
  renderCustomerGrid();
  document.getElementById('toggle-customer-form').onclick = () => {
    document.getElementById('customer-form-wrap').classList.toggle('hidden');
  };
}

function submitCustomer(e) {
  e.preventDefault();
  const f = e.target;
  const services = [...f.querySelectorAll('input[name="services"]:checked')].map(x => x.value);
  Customers.add({
    name:      f.name.value.trim(),
    phone:     f.phone.value.trim(),
    business:  f.business.value.trim(),
    sector:    f.sector.value,
    startDate: f.startDate.value,
    status:    f.status.value,
    services
  });
  f.reset();
  renderCustomerGrid();
}

function renderCustomerGrid() {
  const q   = (document.getElementById('customer-search')?.value || '').toLowerCase();
  const sec = document.getElementById('customer-filter-sector')?.value || '';
  const st  = document.getElementById('customer-filter-status')?.value || '';

  let customers = Customers.all().filter(c =>
    (!q   || c.name.toLowerCase().includes(q) || (c.business||'').toLowerCase().includes(q)) &&
    (!sec || c.sector === sec) &&
    (!st  || c.status === st)
  );

  const cnt = document.getElementById('customer-count');
  if (cnt) cnt.textContent = `(${customers.length})`;

  const grid = document.getElementById('customer-grid');
  if (!grid) return;

  if (!customers.length) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="es-icon">👥</div><p>Müşteri bulunamadı.</p></div>`;
    return;
  }

  grid.innerHTML = customers.map(c => `
    <div class="customer-card">
      <div class="customer-card-head">
        <div class="customer-avatar">${initials(c.name)}</div>
        <div class="customer-card-info">
          <div class="name">${esc(c.name)}</div>
          <div class="biz">${esc(c.business) || '—'}</div>
        </div>
        ${badgeFor(CUSTOMER_STATUS, c.status)}
      </div>
      <div class="customer-card-meta">
        <span>📞 ${esc(c.phone) || '—'}</span>
        <span>🏢 ${esc(c.sector) || '—'}</span>
        <span>📅 ${c.startDate ? fmtDate(c.startDate) : '—'}</span>
      </div>
      ${c.services?.length ? `<div style="display:flex;flex-wrap:wrap;gap:5px">${c.services.map(s=>`<span class="badge badge-pink" style="font-size:.7rem">${s}</span>`).join('')}</div>` : ''}
      <div class="customer-card-footer">
        <button class="btn btn-ghost btn-sm" onclick="editCustomer(${c.id})">✏️ Düzenle</button>
        <button class="btn btn-danger btn-sm" onclick="deleteCustomer(${c.id})">🗑️</button>
      </div>
    </div>`).join('');
}

function filterCustomers() { renderCustomerGrid(); }

function editCustomer(id) {
  const c = Customers.find(id);
  if (!c) return;
  document.getElementById('edit-customer-id').value       = c.id;
  document.getElementById('edit-customer-name').value     = c.name;
  document.getElementById('edit-customer-phone').value    = c.phone || '';
  document.getElementById('edit-customer-business').value = c.business || '';
  document.getElementById('edit-customer-sector').value   = c.sector || '';
  document.getElementById('edit-customer-start').value    = c.startDate || '';
  document.getElementById('edit-customer-status').value   = c.status;
  document.querySelectorAll('.edit-svc').forEach(cb => {
    cb.checked = (c.services || []).includes(cb.value);
  });
  openModal('customer-modal');
}

function updateCustomer(e) {
  e.preventDefault();
  const id = Number(document.getElementById('edit-customer-id').value);
  const services = [...document.querySelectorAll('.edit-svc:checked')].map(x => x.value);
  Customers.update(id, {
    name:      document.getElementById('edit-customer-name').value.trim(),
    phone:     document.getElementById('edit-customer-phone').value.trim(),
    business:  document.getElementById('edit-customer-business').value.trim(),
    sector:    document.getElementById('edit-customer-sector').value,
    startDate: document.getElementById('edit-customer-start').value,
    status:    document.getElementById('edit-customer-status').value,
    services
  });
  closeModal('customer-modal');
  renderCustomerGrid();
}

function deleteCustomer(id) {
  if (!confirm('Bu müşteri silinsin mi?')) return;
  Customers.remove(id);
  renderCustomerGrid();
}
