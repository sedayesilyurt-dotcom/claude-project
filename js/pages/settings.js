function renderSettings() {
  const s = Settings.get();
  return `
  <div class="page">
    <div class="section-card">
      <div class="section-header"><h2>⚙️ Profil Ayarları</h2></div>
      <div class="section-body">
        <form onsubmit="saveSettings(event)">
          <div class="settings-grid">
            <div class="settings-section">
              <div class="form-group">
                <label>Ad Soyad</label>
                <input id="s-name" value="${esc(s.name||'')}" placeholder="Adınız Soyadınız" />
              </div>
              <div class="form-group">
                <label>E-posta</label>
                <input id="s-email" type="email" value="${esc(s.email||'')}" placeholder="ornek@mail.com" />
              </div>
              <div class="form-group">
                <label>Telefon</label>
                <input id="s-phone" value="${esc(s.phone||'')}" placeholder="05XX XXX XX XX" />
              </div>
              <div class="form-group">
                <label>Şirket / Ajans Adı</label>
                <input id="s-company" value="${esc(s.company||'')}" placeholder="Ajans adınız" />
              </div>
            </div>
            <div class="settings-section">
              <div class="form-group">
                <label>Para Birimi</label>
                <select id="s-currency">
                  <option value="TL" ${s.currency==='TL'?'selected':''}>₺ Türk Lirası</option>
                  <option value="USD" ${s.currency==='USD'?'selected':''}>$ Dolar</option>
                  <option value="EUR" ${s.currency==='EUR'?'selected':''}>€ Euro</option>
                </select>
              </div>
              <div class="form-group">
                <label>Hakkında / Bio</label>
                <textarea id="s-bio" placeholder="Kendiniz hakkında kısa bir not...">${esc(s.bio||'')}</textarea>
              </div>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">💾 Kaydet</button>
          </div>
        </form>
      </div>
    </div>

    <div class="section-card">
      <div class="section-header"><h2>🗂️ Veri Yönetimi</h2></div>
      <div class="section-body">
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <button class="btn btn-outline" onclick="exportData()">📥 Veriyi Dışa Aktar (JSON)</button>
          <button class="btn btn-ghost" onclick="document.getElementById('import-file').click()">📤 Veri İçe Aktar</button>
          <input type="file" id="import-file" accept=".json" style="display:none" onchange="importData(this)" />
          <button class="btn btn-danger" onclick="clearAllData()">🗑️ Tüm Verileri Sil</button>
        </div>
        <p class="text-muted mt-8">Veriler tarayıcınızın LocalStorage alanında saklanmaktadır. Farklı bir cihazda kullanmak için JSON ile dışa aktarın.</p>
      </div>
    </div>

    <div class="section-card">
      <div class="section-header"><h2>ℹ️ Hakkında</h2></div>
      <div class="section-body">
        <p class="text-sm" style="color:var(--text-muted);line-height:1.7">
          <strong>Reklam & Müşteri Yönetim Dashboard'u</strong><br>
          Sosyal medya ve Meta reklam uzmanları için tasarlanmış iş akışı yönetim aracı.<br>
          Versiyon 1.0 — Tüm veriler yerel olarak saklanmaktadır.
        </p>
      </div>
    </div>
  </div>`;
}

function initSettings() {}

function saveSettings(e) {
  e.preventDefault();
  Settings.save({
    name:     document.getElementById('s-name').value.trim(),
    email:    document.getElementById('s-email').value.trim(),
    phone:    document.getElementById('s-phone').value.trim(),
    company:  document.getElementById('s-company').value.trim(),
    currency: document.getElementById('s-currency').value,
    bio:      document.getElementById('s-bio').value.trim()
  });
  App.updateUserInfo();
  showToast('Ayarlar kaydedildi ✓');
}

function exportData() {
  const data = {
    leads:     Leads.all(),
    meetings:  Meetings.all(),
    customers: Customers.all(),
    payments:  Payments.all(),
    services:  Services.all(),
    settings:  Settings.get(),
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `dashboard-yedek-${new Date().toLocaleDateString('tr-TR').replace(/\./g,'-')}.json`;
  a.click();
}

function importData(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.leads)     DB.set('leads',     data.leads);
      if (data.meetings)  DB.set('meetings',  data.meetings);
      if (data.customers) DB.set('customers', data.customers);
      if (data.payments)  DB.set('payments',  data.payments);
      if (data.services)  DB.set('services',  data.services);
      if (data.settings)  DB.set('settings',  data.settings);
      showToast('Veriler başarıyla içe aktarıldı ✓');
      App.nav('overview');
    } catch {
      alert('Geçersiz dosya formatı!');
    }
  };
  reader.readAsText(file);
  input.value = '';
}

function clearAllData() {
  if (!confirm('Tüm veriler silinecek! Bu işlem geri alınamaz. Devam etmek istiyor musunuz?')) return;
  ['leads','meetings','customers','payments','services'].forEach(k => localStorage.removeItem(k));
  showToast('Tüm veriler silindi.');
  App.nav('overview');
}

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#2d2d2d;color:white;padding:12px 20px;border-radius:10px;font-size:.85rem;font-weight:600;z-index:999;box-shadow:0 4px 16px rgba(0,0,0,.2);transition:opacity .3s';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; }, 3000);
}
