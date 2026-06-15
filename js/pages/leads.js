function renderLeads() {
  return `
  <div class="page">
    <div class="section-card" style="margin-bottom:20px">
      <div class="section-header">
        <h2>Yeni Lead Ekle</h2>
        <button class="btn btn-ghost btn-sm" id="toggle-lead-form">Formu Aç / Kapat</button>
      </div>
      <div class="section-body" id="lead-form-wrap">
        <form onsubmit="submitLead(event)">
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
              <label>E-posta</label>
              <input name="email" type="email" placeholder="ornek@mail.com" />
            </div>
            <div class="form-group">
              <label>Reklam Kaynağı *</label>
              <select name="source" required>
                <option value="">Seçiniz</option>
                ${LEAD_SOURCES.map(s => `<option>${s}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Durum</label>
              <select name="status">
                ${LEAD_STATUS.map(s => `<option value="${s.val}">${s.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="grid-column:1/-1">
              <label>Not</label>
              <textarea name="note" placeholder="Lead hakkında notlarınız..."></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Lead Ekle</button>
            <button type="reset" class="btn btn-ghost">Temizle</button>
          </div>
        </form>
      </div>
    </div>

    <div class="section-card">
      <div class="section-header">
        <h2>Lead Listesi <span id="lead-count" class="text-muted text-sm"></span></h2>
      </div>
      <div class="section-body">
        <div class="toolbar">
          <input class="search" type="text" placeholder="🔍  İsim veya telefon ara..." id="lead-search" oninput="filterLeads()" />
          <select id="lead-filter-source" onchange="filterLeads()">
            <option value="">Tüm Kaynaklar</option>
            ${LEAD_SOURCES.map(s => `<option>${s}</option>`).join('')}
          </select>
          <select id="lead-filter-status" onchange="filterLeads()">
            <option value="">Tüm Durumlar</option>
            ${LEAD_STATUS.map(s => `<option value="${s.val}">${s.label}</option>`).join('')}
          </select>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Ad Soyad</th>
                <th>Telefon</th>
                <th>E-posta</th>
                <th>Kaynak</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th>Not</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="leads-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal-overlay" id="lead-modal">
      <div class="modal">
        <div class="modal-header">
          <h3>Lead Düzenle</h3>
          <button class="modal-close" onclick="closeModal('lead-modal')">✕</button>
        </div>
        <div class="modal-body">
          <form onsubmit="updateLead(event)">
            <input type="hidden" id="edit-lead-id" />
            <div class="form-grid">
              <div class="form-group">
                <label>Ad Soyad *</label>
                <input id="edit-lead-name" required />
              </div>
              <div class="form-group">
                <label>Telefon *</label>
                <input id="edit-lead-phone" required />
              </div>
              <div class="form-group">
                <label>E-posta</label>
                <input id="edit-lead-email" type="email" />
              </div>
              <div class="form-group">
                <label>Kaynak</label>
                <select id="edit-lead-source">
                  ${LEAD_SOURCES.map(s => `<option>${s}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Durum</label>
                <select id="edit-lead-status">
                  ${LEAD_STATUS.map(s => `<option value="${s.val}">${s.label}</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="grid-column:1/-1">
                <label>Not</label>
                <textarea id="edit-lead-note"></textarea>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Güncelle</button>
              <button type="button" class="btn btn-ghost" onclick="closeModal('lead-modal')">İptal</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>`;
}

function initLeads() {
  renderLeadsTable();

  document.getElementById('toggle-lead-form').onclick = () => {
    const w = document.getElementById('lead-form-wrap');
    w.classList.toggle('hidden');
  };
}

function submitLead(e) {
  e.preventDefault();
  const f = e.target;
  Leads.add({
    name: f.name.value.trim(),
    phone: f.phone.value.trim(),
    email: f.email.value.trim(),
    source: f.source.value,
    status: f.status.value,
    note: f.note.value.trim()
  });
  f.reset();
  renderLeadsTable();
  App.refreshBadge();
}

function renderLeadsTable() {
  const q   = (document.getElementById('lead-search')?.value || '').toLowerCase();
  const src = document.getElementById('lead-filter-source')?.value || '';
  const st  = document.getElementById('lead-filter-status')?.value || '';

  let leads = Leads.all().filter(l =>
    (!q   || l.name.toLowerCase().includes(q) || (l.phone||'').includes(q)) &&
    (!src || l.source === src) &&
    (!st  || l.status === st)
  );

  const cnt = document.getElementById('lead-count');
  if (cnt) cnt.textContent = `(${leads.length})`;

  const tbody = document.getElementById('leads-tbody');
  if (!tbody) return;

  if (!leads.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="table-empty">Lead bulunamadı.</td></tr>`;
    return;
  }

  tbody.innerHTML = leads.map((l, i) => `
    <tr>
      <td class="text-muted">${i+1}</td>
      <td class="font-bold">${esc(l.name)}</td>
      <td>${esc(l.phone)}</td>
      <td class="text-muted">${esc(l.email) || '—'}</td>
      <td><span class="badge badge-pink">${esc(l.source)}</span></td>
      <td>
        <select onchange="quickStatusLead(${l.id}, this.value)" style="border:1px solid var(--border);border-radius:6px;padding:4px 8px;font-size:.78rem;background:var(--white)">
          ${LEAD_STATUS.map(s => `<option value="${s.val}" ${l.status===s.val?'selected':''}>${s.label}</option>`).join('')}
        </select>
      </td>
      <td class="text-muted">${l.createdAt || '—'}</td>
      <td style="max-width:140px">
        ${l.note ? `<div class="note-box">${esc(l.note.slice(0,60))}${l.note.length>60?'…':''}</div>` : '<span class="text-muted">—</span>'}
      </td>
      <td>
        <div class="flex gap-8">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="editLead(${l.id})" title="Düzenle">✏️</button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="deleteLead(${l.id})" title="Sil">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
}

function filterLeads() { renderLeadsTable(); }

function quickStatusLead(id, val) {
  Leads.update(id, { status: val });
  App.refreshBadge();
}

function editLead(id) {
  const l = Leads.find(id);
  if (!l) return;
  document.getElementById('edit-lead-id').value    = l.id;
  document.getElementById('edit-lead-name').value  = l.name;
  document.getElementById('edit-lead-phone').value = l.phone;
  document.getElementById('edit-lead-email').value = l.email || '';
  document.getElementById('edit-lead-source').value = l.source;
  document.getElementById('edit-lead-status').value = l.status;
  document.getElementById('edit-lead-note').value  = l.note || '';
  openModal('lead-modal');
}

function updateLead(e) {
  e.preventDefault();
  const id = Number(document.getElementById('edit-lead-id').value);
  Leads.update(id, {
    name:   document.getElementById('edit-lead-name').value.trim(),
    phone:  document.getElementById('edit-lead-phone').value.trim(),
    email:  document.getElementById('edit-lead-email').value.trim(),
    source: document.getElementById('edit-lead-source').value,
    status: document.getElementById('edit-lead-status').value,
    note:   document.getElementById('edit-lead-note').value.trim()
  });
  closeModal('lead-modal');
  renderLeadsTable();
  App.refreshBadge();
}

function deleteLead(id) {
  if (!confirm('Bu lead silinsin mi?')) return;
  Leads.remove(id);
  renderLeadsTable();
  App.refreshBadge();
}
