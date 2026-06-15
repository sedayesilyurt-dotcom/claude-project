function renderServices() {
  return `
  <div class="page">
    <div class="section-card" style="margin-bottom:20px">
      <div class="section-header">
        <h2>Müşteriye Hizmet Ata</h2>
        <button class="btn btn-ghost btn-sm" id="toggle-service-form">Formu Aç / Kapat</button>
      </div>
      <div class="section-body" id="service-form-wrap">
        <form onsubmit="submitService(event)">
          <div class="form-grid">
            <div class="form-group">
              <label>Müşteri Adı *</label>
              <input name="client" placeholder="Ad Soyad" list="svc-customers-list" required />
              <datalist id="svc-customers-list"></datalist>
            </div>
            <div class="form-group">
              <label>Hizmet Türü *</label>
              <select name="type" required>
                <option value="">Seçiniz</option>
                ${SERVICE_LIST.map(s => `<option>${s}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Başlangıç Tarihi</label>
              <input name="startDate" type="date" />
            </div>
            <div class="form-group">
              <label>Bitiş Tarihi</label>
              <input name="endDate" type="date" />
            </div>
            <div class="form-group">
              <label>Aylık Ücret (₺)</label>
              <input name="price" type="number" min="0" placeholder="0" />
            </div>
            <div class="form-group">
              <label>Durum</label>
              <select name="status">
                <option value="aktif">Aktif</option>
                <option value="pasif">Pasif</option>
                <option value="tamamlandi">Tamamlandı</option>
              </select>
            </div>
            <div class="form-group" style="grid-column:1/-1">
              <label>Açıklama</label>
              <textarea name="desc" placeholder="Hizmet detayları..."></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Hizmet Ekle</button>
            <button type="reset" class="btn btn-ghost">Temizle</button>
          </div>
        </form>
      </div>
    </div>

    <div class="section-card">
      <div class="section-header">
        <h2>Hizmet Listesi <span id="service-count" class="text-muted text-sm"></span></h2>
      </div>
      <div class="section-body">
        <div class="toolbar">
          <input class="search" type="text" placeholder="🔍  Müşteri veya hizmet ara..." id="service-search" oninput="filterServices()" />
          <select id="service-filter-type" onchange="filterServices()">
            <option value="">Tüm Hizmetler</option>
            ${SERVICE_LIST.map(s => `<option>${s}</option>`).join('')}
          </select>
          <select id="service-filter-status" onchange="filterServices()">
            <option value="">Tüm Durumlar</option>
            <option value="aktif">Aktif</option>
            <option value="pasif">Pasif</option>
            <option value="tamamlandi">Tamamlandı</option>
          </select>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Müşteri</th>
                <th>Hizmet</th>
                <th>Başlangıç</th>
                <th>Bitiş</th>
                <th>Aylık Ücret</th>
                <th>Durum</th>
                <th>Açıklama</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="services-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal-overlay" id="service-modal">
      <div class="modal">
        <div class="modal-header">
          <h3>Hizmet Düzenle</h3>
          <button class="modal-close" onclick="closeModal('service-modal')">✕</button>
        </div>
        <div class="modal-body">
          <form onsubmit="updateService(event)">
            <input type="hidden" id="edit-service-id" />
            <div class="form-grid">
              <div class="form-group">
                <label>Müşteri</label>
                <input id="edit-service-client" />
              </div>
              <div class="form-group">
                <label>Hizmet</label>
                <select id="edit-service-type">
                  ${SERVICE_LIST.map(s => `<option>${s}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Başlangıç</label>
                <input id="edit-service-start" type="date" />
              </div>
              <div class="form-group">
                <label>Bitiş</label>
                <input id="edit-service-end" type="date" />
              </div>
              <div class="form-group">
                <label>Aylık Ücret (₺)</label>
                <input id="edit-service-price" type="number" min="0" />
              </div>
              <div class="form-group">
                <label>Durum</label>
                <select id="edit-service-status">
                  <option value="aktif">Aktif</option>
                  <option value="pasif">Pasif</option>
                  <option value="tamamlandi">Tamamlandı</option>
                </select>
              </div>
              <div class="form-group" style="grid-column:1/-1">
                <label>Açıklama</label>
                <textarea id="edit-service-desc"></textarea>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Güncelle</button>
              <button type="button" class="btn btn-ghost" onclick="closeModal('service-modal')">İptal</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>`;
}

function initServices() {
  const dl = document.getElementById('svc-customers-list');
  if (dl) {
    Customers.all().forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.name;
      dl.appendChild(opt);
    });
  }

  renderServicesTable();
  document.getElementById('toggle-service-form').onclick = () => {
    document.getElementById('service-form-wrap').classList.toggle('hidden');
  };
}

function submitService(e) {
  e.preventDefault();
  const f = e.target;
  Services.add({
    client:    f.client.value.trim(),
    type:      f.type.value,
    startDate: f.startDate.value,
    endDate:   f.endDate.value,
    price:     Number(f.price.value),
    status:    f.status.value,
    desc:      f.desc.value.trim()
  });
  f.reset();
  renderServicesTable();
}

function renderServicesTable() {
  const q   = (document.getElementById('service-search')?.value || '').toLowerCase();
  const tp  = document.getElementById('service-filter-type')?.value || '';
  const st  = document.getElementById('service-filter-status')?.value || '';

  let services = Services.all().filter(s =>
    (!q  || s.client.toLowerCase().includes(q) || s.type.toLowerCase().includes(q)) &&
    (!tp || s.type === tp) &&
    (!st || s.status === st)
  );

  const cnt = document.getElementById('service-count');
  if (cnt) cnt.textContent = `(${services.length})`;

  const tbody = document.getElementById('services-tbody');
  if (!tbody) return;

  if (!services.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="table-empty">Hizmet bulunamadı.</td></tr>`;
    return;
  }

  const stBadge = { aktif: 'badge-green', pasif: 'badge-gray', tamamlandi: 'badge-blue' };
  const stLabel = { aktif: 'Aktif', pasif: 'Pasif', tamamlandi: 'Tamamlandı' };

  tbody.innerHTML = services.map((s, i) => `
    <tr>
      <td class="text-muted">${i+1}</td>
      <td class="font-bold">${esc(s.client)}</td>
      <td><span class="badge badge-pink">${esc(s.type)}</span></td>
      <td class="text-muted">${fmtDate(s.startDate)}</td>
      <td class="text-muted">${fmtDate(s.endDate)}</td>
      <td class="font-bold" style="color:var(--primary)">${s.price ? fmtMoney(s.price) : '—'}</td>
      <td><span class="badge ${stBadge[s.status]||'badge-gray'}">${stLabel[s.status]||s.status}</span></td>
      <td style="max-width:140px" class="text-muted">${esc(s.desc?.slice(0,50) || '—')}</td>
      <td>
        <div class="flex gap-8">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="editService(${s.id})">✏️</button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="deleteService(${s.id})">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
}

function filterServices() { renderServicesTable(); }

function editService(id) {
  const s = Services.find(id);
  if (!s) return;
  document.getElementById('edit-service-id').value     = s.id;
  document.getElementById('edit-service-client').value = s.client;
  document.getElementById('edit-service-type').value   = s.type;
  document.getElementById('edit-service-start').value  = s.startDate || '';
  document.getElementById('edit-service-end').value    = s.endDate || '';
  document.getElementById('edit-service-price').value  = s.price || '';
  document.getElementById('edit-service-status').value = s.status;
  document.getElementById('edit-service-desc').value   = s.desc || '';
  openModal('service-modal');
}

function updateService(e) {
  e.preventDefault();
  const id = Number(document.getElementById('edit-service-id').value);
  Services.update(id, {
    client:    document.getElementById('edit-service-client').value.trim(),
    type:      document.getElementById('edit-service-type').value,
    startDate: document.getElementById('edit-service-start').value,
    endDate:   document.getElementById('edit-service-end').value,
    price:     Number(document.getElementById('edit-service-price').value),
    status:    document.getElementById('edit-service-status').value,
    desc:      document.getElementById('edit-service-desc').value.trim()
  });
  closeModal('service-modal');
  renderServicesTable();
}

function deleteService(id) {
  if (!confirm('Bu hizmet silinsin mi?')) return;
  Services.remove(id);
  renderServicesTable();
}
