function renderOverview() {
  const leads    = Leads.all();
  const meetings = Meetings.all();
  const customers = Customers.all();
  const payments  = Payments.all();

  const todayStr = today();
  const todayLeads = leads.filter(l => l.createdAt === todayStr).length;
  const contacted  = leads.filter(l => l.status !== 'yeni').length;
  const activeCust = customers.filter(c => c.status === 'aktif').length;
  const upcomingM  = meetings.filter(m => m.status === 'planlandi').length;
  const pending    = payments.filter(p => p.status === 'bekliyor' || p.status === 'gecikti');
  const pendingAmt = pending.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const collected  = payments.filter(p => p.status === 'odendi').reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const recentLeads = leads.slice(0, 5);
  const upcomingMeetings = meetings.filter(m => m.status === 'planlandi').slice(0, 5);

  return `
  <div class="page">
    <div class="stat-grid">
      ${statCard('c1','📋', leads.length, 'Toplam Lead')}
      ${statCard('c2','📅', todayLeads, 'Bugün Gelen Lead')}
      ${statCard('c3','💬', contacted, 'Görüşülen Lead')}
      ${statCard('c4','🗓️', upcomingM, 'Planlanan Toplantı')}
      ${statCard('c5','👥', activeCust, 'Aktif Müşteri')}
      ${statCard('c6','⏳', fmtMoney(pendingAmt), 'Bekleyen Tahsilat')}
      ${statCard('c7','💰', fmtMoney(collected), 'Toplam Tahsilat')}
    </div>

    <div class="grid2">
      <div class="section-card">
        <div class="section-header">
          <h2>Son Leadler</h2>
          <button class="btn btn-ghost btn-sm" onclick="App.nav('leads')">Tümünü Gör →</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Ad Soyad</th><th>Kaynak</th><th>Durum</th><th>Tarih</th></tr></thead>
            <tbody>
              ${recentLeads.length ? recentLeads.map(l => `
                <tr>
                  <td class="font-bold">${esc(l.name)}</td>
                  <td class="text-muted">${esc(l.source)}</td>
                  <td>${badgeFor(LEAD_STATUS, l.status)}</td>
                  <td class="text-muted">${l.createdAt || '—'}</td>
                </tr>`).join('') : `<tr><td colspan="4" class="table-empty">Henüz lead yok</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <div class="section-card">
        <div class="section-header">
          <h2>Yaklaşan Toplantılar</h2>
          <button class="btn btn-ghost btn-sm" onclick="App.nav('meetings')">Tümünü Gör →</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Müşteri</th><th>Tür</th><th>Tarih / Saat</th></tr></thead>
            <tbody>
              ${upcomingMeetings.length ? upcomingMeetings.map(m => `
                <tr>
                  <td class="font-bold">${esc(m.client)}</td>
                  <td class="text-muted">${esc(m.type)}</td>
                  <td class="text-muted">${fmtDate(m.date)} ${m.time || ''}</td>
                </tr>`).join('') : `<tr><td colspan="3" class="table-empty">Planlanmış toplantı yok</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-header">
        <h2>Lead Kaynağı Dağılımı</h2>
      </div>
      <div class="section-body">
        ${renderSourceBars(leads)}
      </div>
    </div>
  </div>`;
}

function statCard(cls, icon, value, label) {
  return `
  <div class="stat-card ${cls}">
    <div class="sc-icon">${icon}</div>
    <div>
      <div class="sc-value">${value}</div>
      <div class="sc-label">${label}</div>
    </div>
  </div>`;
}

function renderSourceBars(leads) {
  if (!leads.length) return '<p class="text-muted">Veri yok.</p>';
  const counts = {};
  LEAD_SOURCES.forEach(s => counts[s] = 0);
  leads.forEach(l => { if (counts[l.source] !== undefined) counts[l.source]++; });
  const max = Math.max(...Object.values(counts), 1);
  const colors = ['#c4637a','#d4889e','#e8a4b8','#f0c4d0','#f7dce5'];
  return `<div style="display:flex;flex-direction:column;gap:12px">` +
    Object.entries(counts).map(([src, cnt], i) => `
      <div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <span class="text-sm">${src}</span>
          <span class="text-sm font-bold">${cnt}</span>
        </div>
        <div style="background:var(--bg2);border-radius:20px;height:8px;overflow:hidden">
          <div style="background:${colors[i % colors.length]};height:100%;width:${(cnt/max)*100}%;border-radius:20px;transition:width .5s"></div>
        </div>
      </div>`).join('') + `</div>`;
}
