function renderMeetings() {
  return `
  <div class="page">
    <div class="section-card" style="margin-bottom:20px">
      <div class="section-header">
        <h2>Yeni Toplantı Ekle</h2>
        <button class="btn btn-ghost btn-sm" id="toggle-meeting-form">Formu Aç / Kapat</button>
      </div>
      <div class="section-body" id="meeting-form-wrap">
        <form onsubmit="submitMeeting(event)">
          <div class="form-grid">
            <div class="form-group">
              <label>Müşteri Adı *</label>
              <input name="client" placeholder="Ad Soyad" required />
            </div>
            <div class="form-group">
              <label>Tarih *</label>
              <input name="date" type="date" required />
            </div>
            <div class="form-group">
              <label>Saat *</label>
              <input name="time" type="time" required />
            </div>
            <div class="form-group">
              <label>Toplantı Türü *</label>
              <select name="type" required>
                <option value="">Seçiniz</option>
                ${MEETING_TYPES.map(t => `<option>${t}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Durum</label>
              <select name="status">
                ${MEETING_STATUS.map(s => `<option value="${s.val}">${s.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="grid-column:1/-1">
              <label>Notlar</label>
              <textarea name="note" placeholder="Toplantı notları..."></textarea>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Toplantı Ekle</button>
            <button type="reset" class="btn btn-ghost">Temizle</button>
          </div>
        </form>
      </div>
    </div>

    <div class="section-card">
      <div class="section-header">
        <h2>Toplantı Listesi <span id="meeting-count" class="text-muted text-sm"></span></h2>
      </div>
      <div class="section-body">
        <div class="toolbar">
          <input class="search" type="text" placeholder="🔍  Müşteri ara..." id="meeting-search" oninput="filterMeetings()" />
          <select id="meeting-filter-type" onchange="filterMeetings()">
            <option value="">Tüm Türler</option>
            ${MEETING_TYPES.map(t => `<option>${t}</option>`).join('')}
          </select>
          <select id="meeting-filter-status" onchange="filterMeetings()">
            <option value="">Tüm Durumlar</option>
            ${MEETING_STATUS.map(s => `<option value="${s.val}">${s.label}</option>`).join('')}
          </select>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Müşteri</th>
                <th>Tarih</th>
                <th>Saat</th>
                <th>Tür</th>
                <th>Durum</th>
                <th>Notlar</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="meetings-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal-overlay" id="meeting-modal">
      <div class="modal">
        <div class="modal-header">
          <h3>Toplantı Düzenle</h3>
          <button class="modal-close" onclick="closeModal('meeting-modal')">✕</button>
        </div>
        <div class="modal-body">
          <form onsubmit="updateMeeting(event)">
            <input type="hidden" id="edit-meeting-id" />
            <div class="form-grid">
              <div class="form-group">
                <label>Müşteri Adı *</label>
                <input id="edit-meeting-client" required />
              </div>
              <div class="form-group">
                <label>Tarih *</label>
                <input id="edit-meeting-date" type="date" required />
              </div>
              <div class="form-group">
                <label>Saat</label>
                <input id="edit-meeting-time" type="time" />
              </div>
              <div class="form-group">
                <label>Tür</label>
                <select id="edit-meeting-type">
                  ${MEETING_TYPES.map(t => `<option>${t}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Durum</label>
                <select id="edit-meeting-status">
                  ${MEETING_STATUS.map(s => `<option value="${s.val}">${s.label}</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="grid-column:1/-1">
                <label>Notlar</label>
                <textarea id="edit-meeting-note"></textarea>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Güncelle</button>
              <button type="button" class="btn btn-ghost" onclick="closeModal('meeting-modal')">İptal</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>`;
}

function initMeetings() {
  renderMeetingsTable();
  document.getElementById('toggle-meeting-form').onclick = () => {
    document.getElementById('meeting-form-wrap').classList.toggle('hidden');
  };
}

function submitMeeting(e) {
  e.preventDefault();
  const f = e.target;
  Meetings.add({
    client: f.client.value.trim(),
    date:   f.date.value,
    time:   f.time.value,
    type:   f.type.value,
    status: f.status.value,
    note:   f.note.value.trim()
  });
  f.reset();
  renderMeetingsTable();
}

function renderMeetingsTable() {
  const q   = (document.getElementById('meeting-search')?.value || '').toLowerCase();
  const tp  = document.getElementById('meeting-filter-type')?.value || '';
  const st  = document.getElementById('meeting-filter-status')?.value || '';

  let meetings = Meetings.all().filter(m =>
    (!q  || m.client.toLowerCase().includes(q)) &&
    (!tp || m.type === tp) &&
    (!st || m.status === st)
  );

  const cnt = document.getElementById('meeting-count');
  if (cnt) cnt.textContent = `(${meetings.length})`;

  const tbody = document.getElementById('meetings-tbody');
  if (!tbody) return;

  if (!meetings.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="table-empty">Toplantı bulunamadı.</td></tr>`;
    return;
  }

  tbody.innerHTML = meetings.map((m, i) => `
    <tr>
      <td class="text-muted">${i+1}</td>
      <td class="font-bold">${esc(m.client)}</td>
      <td>${fmtDate(m.date)}</td>
      <td>${m.time || '—'}</td>
      <td><span class="badge badge-pink">${esc(m.type)}</span></td>
      <td>
        <select onchange="quickStatusMeeting(${m.id}, this.value)" style="border:1px solid var(--border);border-radius:6px;padding:4px 8px;font-size:.78rem;background:var(--white)">
          ${MEETING_STATUS.map(s => `<option value="${s.val}" ${m.status===s.val?'selected':''}>${s.label}</option>`).join('')}
        </select>
      </td>
      <td style="max-width:160px">
        ${m.note ? `<div class="note-box">${esc(m.note.slice(0,60))}${m.note.length>60?'…':''}</div>` : '<span class="text-muted">—</span>'}
      </td>
      <td>
        <div class="flex gap-8">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="editMeeting(${m.id})">✏️</button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="deleteMeeting(${m.id})">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
}

function filterMeetings() { renderMeetingsTable(); }

function quickStatusMeeting(id, val) { Meetings.update(id, { status: val }); }

function editMeeting(id) {
  const m = Meetings.find(id);
  if (!m) return;
  document.getElementById('edit-meeting-id').value     = m.id;
  document.getElementById('edit-meeting-client').value = m.client;
  document.getElementById('edit-meeting-date').value   = m.date;
  document.getElementById('edit-meeting-time').value   = m.time || '';
  document.getElementById('edit-meeting-type').value   = m.type;
  document.getElementById('edit-meeting-status').value = m.status;
  document.getElementById('edit-meeting-note').value   = m.note || '';
  openModal('meeting-modal');
}

function updateMeeting(e) {
  e.preventDefault();
  const id = Number(document.getElementById('edit-meeting-id').value);
  Meetings.update(id, {
    client: document.getElementById('edit-meeting-client').value.trim(),
    date:   document.getElementById('edit-meeting-date').value,
    time:   document.getElementById('edit-meeting-time').value,
    type:   document.getElementById('edit-meeting-type').value,
    status: document.getElementById('edit-meeting-status').value,
    note:   document.getElementById('edit-meeting-note').value.trim()
  });
  closeModal('meeting-modal');
  renderMeetingsTable();
}

function deleteMeeting(id) {
  if (!confirm('Bu toplantı silinsin mi?')) return;
  Meetings.remove(id);
  renderMeetingsTable();
}
