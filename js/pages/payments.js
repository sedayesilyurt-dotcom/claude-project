function renderPayments() {
  return `
  <div class="page">
    <div id="payment-summary-wrap"></div>

    <div class="section-card" style="margin-bottom:20px">
      <div class="section-header">
        <h2>Yeni Ödeme Ekle</h2>
        <button class="btn btn-ghost btn-sm" id="toggle-payment-form">Formu Aç / Kapat</button>
      </div>
      <div class="section-body" id="payment-form-wrap">
        <form onsubmit="submitPayment(event)">
          <div class="form-grid">
            <div class="form-group">
              <label>Müşteri Adı *</label>
              <input name="client" placeholder="Ad Soyad" list="customers-list" required />
              <datalist id="customers-list"></datalist>
            </div>
            <div class="form-group">
              <label>Hizmet *</label>
              <select name="service" required>
                <option value="">Seçiniz</option>
                ${SERVICE_LIST.map(s => `<option>${s}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Ücret (₺) *</label>
              <input name="amount" type="number" min="0" placeholder="0" required />
            </div>
            <div class="form-group">
              <label>Fatura Tarihi</label>
              <input name="invoiceDate" type="date" />
            </div>
            <div class="form-group">
              <label>Son Ödeme Tarihi</label>
              <input name="dueDate" type="date" />
            </div>
            <div class="form-group">
              <label>Durum</label>
              <select name="status">
                ${PAYMENT_STATUS.map(s => `<option value="${s.val}">${s.label}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Ödeme Ekle</button>
            <button type="reset" class="btn btn-ghost">Temizle</button>
          </div>
        </form>
      </div>
    </div>

    <div class="section-card">
      <div class="section-header">
        <h2>Ödeme Listesi <span id="payment-count" class="text-muted text-sm"></span></h2>
      </div>
      <div class="section-body">
        <div class="toolbar">
          <input class="search" type="text" placeholder="🔍  Müşteri ara..." id="payment-search" oninput="filterPayments()" />
          <select id="payment-filter-status" onchange="filterPayments()">
            <option value="">Tüm Durumlar</option>
            ${PAYMENT_STATUS.map(s => `<option value="${s.val}">${s.label}</option>`).join('')}
          </select>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Müşteri</th>
                <th>Hizmet</th>
                <th>Ücret</th>
                <th>Fatura Tarihi</th>
                <th>Son Ödeme</th>
                <th>Durum</th>
                <th></th>
              </tr>
            </thead>
            <tbody id="payments-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div class="modal-overlay" id="payment-modal">
      <div class="modal">
        <div class="modal-header">
          <h3>Ödeme Düzenle</h3>
          <button class="modal-close" onclick="closeModal('payment-modal')">✕</button>
        </div>
        <div class="modal-body">
          <form onsubmit="updatePayment(event)">
            <input type="hidden" id="edit-payment-id" />
            <div class="form-grid">
              <div class="form-group">
                <label>Müşteri Adı</label>
                <input id="edit-payment-client" />
              </div>
              <div class="form-group">
                <label>Hizmet</label>
                <select id="edit-payment-service">
                  ${SERVICE_LIST.map(s => `<option>${s}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Ücret (₺)</label>
                <input id="edit-payment-amount" type="number" min="0" />
              </div>
              <div class="form-group">
                <label>Fatura Tarihi</label>
                <input id="edit-payment-invoice" type="date" />
              </div>
              <div class="form-group">
                <label>Son Ödeme Tarihi</label>
                <input id="edit-payment-due" type="date" />
              </div>
              <div class="form-group">
                <label>Durum</label>
                <select id="edit-payment-status">
                  ${PAYMENT_STATUS.map(s => `<option value="${s.val}">${s.label}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="btn btn-primary">Güncelle</button>
              <button type="button" class="btn btn-ghost" onclick="closeModal('payment-modal')">İptal</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>`;
}

function initPayments() {
  // populate customer datalist
  const dl = document.getElementById('customers-list');
  if (dl) {
    Customers.all().forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.name;
      dl.appendChild(opt);
    });
  }

  renderPaymentSummary();
  renderPaymentsTable();

  document.getElementById('toggle-payment-form').onclick = () => {
    document.getElementById('payment-form-wrap').classList.toggle('hidden');
  };
}

function renderPaymentSummary() {
  const payments = Payments.all();
  const collected = payments.filter(p => p.status === 'odendi').reduce((s,p) => s + (Number(p.amount)||0), 0);
  const pending   = payments.filter(p => p.status === 'bekliyor').reduce((s,p) => s + (Number(p.amount)||0), 0);
  const overdue   = payments.filter(p => p.status === 'gecikti').reduce((s,p) => s + (Number(p.amount)||0), 0);
  const wrap = document.getElementById('payment-summary-wrap');
  if (wrap) wrap.innerHTML = `
    <div class="payment-summary">
      <div class="pay-sum-card green">
        <div class="psc-label">💰 Toplam Tahsilat</div>
        <div class="psc-value">${fmtMoney(collected)}</div>
      </div>
      <div class="pay-sum-card orange">
        <div class="psc-label">⏳ Bekleyen Tahsilat</div>
        <div class="psc-value">${fmtMoney(pending)}</div>
      </div>
      <div class="pay-sum-card red">
        <div class="psc-label">⚠️ Geciken Tahsilat</div>
        <div class="psc-value">${fmtMoney(overdue)}</div>
      </div>
    </div>`;
}

function submitPayment(e) {
  e.preventDefault();
  const f = e.target;
  Payments.add({
    client:      f.client.value.trim(),
    service:     f.service.value,
    amount:      Number(f.amount.value),
    invoiceDate: f.invoiceDate.value,
    dueDate:     f.dueDate.value,
    status:      f.status.value
  });
  f.reset();
  renderPaymentSummary();
  renderPaymentsTable();
}

function renderPaymentsTable() {
  const q  = (document.getElementById('payment-search')?.value || '').toLowerCase();
  const st = document.getElementById('payment-filter-status')?.value || '';

  let payments = Payments.all().filter(p =>
    (!q  || p.client.toLowerCase().includes(q)) &&
    (!st || p.status === st)
  );

  const cnt = document.getElementById('payment-count');
  if (cnt) cnt.textContent = `(${payments.length})`;

  const tbody = document.getElementById('payments-tbody');
  if (!tbody) return;

  if (!payments.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="table-empty">Ödeme bulunamadı.</td></tr>`;
    return;
  }

  tbody.innerHTML = payments.map((p, i) => `
    <tr>
      <td class="text-muted">${i+1}</td>
      <td class="font-bold">${esc(p.client)}</td>
      <td class="text-muted">${esc(p.service)}</td>
      <td class="font-bold" style="color:var(--primary)">${fmtMoney(p.amount)}</td>
      <td class="text-muted">${fmtDate(p.invoiceDate)}</td>
      <td class="text-muted">${fmtDate(p.dueDate)}</td>
      <td>
        <select onchange="quickStatusPayment(${p.id}, this.value)" style="border:1px solid var(--border);border-radius:6px;padding:4px 8px;font-size:.78rem;background:var(--white)">
          ${PAYMENT_STATUS.map(s => `<option value="${s.val}" ${p.status===s.val?'selected':''}>${s.label}</option>`).join('')}
        </select>
      </td>
      <td>
        <div class="flex gap-8">
          <button class="btn btn-ghost btn-sm btn-icon" onclick="editPayment(${p.id})">✏️</button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="deletePayment(${p.id})">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
}

function filterPayments() { renderPaymentsTable(); }

function quickStatusPayment(id, val) {
  Payments.update(id, { status: val });
  renderPaymentSummary();
}

function editPayment(id) {
  const p = Payments.find(id);
  if (!p) return;
  document.getElementById('edit-payment-id').value      = p.id;
  document.getElementById('edit-payment-client').value  = p.client;
  document.getElementById('edit-payment-service').value = p.service;
  document.getElementById('edit-payment-amount').value  = p.amount;
  document.getElementById('edit-payment-invoice').value = p.invoiceDate || '';
  document.getElementById('edit-payment-due').value     = p.dueDate || '';
  document.getElementById('edit-payment-status').value  = p.status;
  openModal('payment-modal');
}

function updatePayment(e) {
  e.preventDefault();
  const id = Number(document.getElementById('edit-payment-id').value);
  Payments.update(id, {
    client:      document.getElementById('edit-payment-client').value.trim(),
    service:     document.getElementById('edit-payment-service').value,
    amount:      Number(document.getElementById('edit-payment-amount').value),
    invoiceDate: document.getElementById('edit-payment-invoice').value,
    dueDate:     document.getElementById('edit-payment-due').value,
    status:      document.getElementById('edit-payment-status').value
  });
  closeModal('payment-modal');
  renderPaymentSummary();
  renderPaymentsTable();
}

function deletePayment(id) {
  if (!confirm('Bu ödeme silinsin mi?')) return;
  Payments.remove(id);
  renderPaymentSummary();
  renderPaymentsTable();
}
