function renderReports() {
  return `
  <div class="page">
    <div class="grid2">
      <div class="section-card">
        <div class="section-header"><h2>📊 Reklam Kaynağına Göre Lead Dağılımı</h2></div>
        <div class="section-body">
          <div class="chart-container"><canvas id="chart-sources"></canvas></div>
        </div>
      </div>
      <div class="section-card">
        <div class="section-header"><h2>🎯 Lead Dönüşüm Oranı</h2></div>
        <div class="section-body">
          <div class="chart-container"><canvas id="chart-conversion"></canvas></div>
        </div>
      </div>
    </div>
    <div class="grid2">
      <div class="section-card">
        <div class="section-header"><h2>📅 Aylık Yeni Müşteri</h2></div>
        <div class="section-body">
          <div class="chart-container"><canvas id="chart-monthly"></canvas></div>
        </div>
      </div>
      <div class="section-card">
        <div class="section-header"><h2>🛠️ Hizmet Dağılımı</h2></div>
        <div class="section-body">
          <div class="chart-container"><canvas id="chart-services"></canvas></div>
        </div>
      </div>
    </div>
    <div class="section-card">
      <div class="section-header"><h2>💰 Aylık Tahsilat</h2></div>
      <div class="section-body">
        <div class="chart-container" style="height:200px"><canvas id="chart-payments"></canvas></div>
      </div>
    </div>
  </div>`;
}

function initReports() {
  setTimeout(() => {
    buildSourceChart();
    buildConversionChart();
    buildMonthlyChart();
    buildServicesChart();
    buildPaymentsChart();
  }, 50);
}

const COLORS = ['#c4637a','#d4889e','#e8a4b8','#f0c4d0','#a84f64','#f7dce5','#854f64','#ddb0bc'];

function buildSourceChart() {
  const leads = Leads.all();
  const counts = LEAD_SOURCES.map(s => leads.filter(l => l.source === s).length);
  const ctx = document.getElementById('chart-sources');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: { labels: LEAD_SOURCES, datasets: [{ data: counts, backgroundColor: COLORS, borderWidth: 2, borderColor: '#fff' }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } } } }
  });
}

function buildConversionChart() {
  const leads = Leads.all();
  const labels = LEAD_STATUS.map(s => s.label);
  const counts = LEAD_STATUS.map(s => leads.filter(l => l.status === s.val).length);
  const ctx = document.getElementById('chart-conversion');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Lead Sayısı', data: counts, backgroundColor: COLORS, borderRadius: 6 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { ticks: { font: { size: 10 } } } } }
  });
}

function buildMonthlyChart() {
  const customers = Customers.all();
  const now = new Date();
  const months = Array.from({length: 6}, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { label: getMonthName(d.getMonth()), year: d.getFullYear(), month: d.getMonth() };
  });
  const counts = months.map(m =>
    customers.filter(c => {
      if (!c.createdAt) return false;
      const parts = c.createdAt.split('.');
      if (parts.length < 3) return false;
      const d = new Date(parts[2], parts[1]-1, parts[0]);
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    }).length
  );
  const ctx = document.getElementById('chart-monthly');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: months.map(m => m.label),
      datasets: [{ label: 'Yeni Müşteri', data: counts, borderColor: '#c4637a', backgroundColor: 'rgba(196,99,122,.12)', tension: .4, fill: true, pointBackgroundColor: '#c4637a', pointRadius: 5 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
  });
}

function buildServicesChart() {
  const svcRecords = Services.all();
  const counts = SERVICE_LIST.map(s => svcRecords.filter(r => r.type === s).length);
  const ctx = document.getElementById('chart-services');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: { labels: SERVICE_LIST, datasets: [{ data: counts, backgroundColor: COLORS, borderWidth: 2, borderColor: '#fff' }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12 } } } }
  });
}

function buildPaymentsChart() {
  const payments = Payments.all();
  const now = new Date();
  const months = Array.from({length: 6}, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { label: getMonthName(d.getMonth()), year: d.getFullYear(), month: d.getMonth() };
  });
  const collected = months.map(m =>
    payments.filter(p => {
      if (p.status !== 'odendi' || !p.invoiceDate) return false;
      const d = new Date(p.invoiceDate);
      return d.getFullYear() === m.year && d.getMonth() === m.month;
    }).reduce((s, p) => s + (Number(p.amount)||0), 0)
  );
  const ctx = document.getElementById('chart-payments');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months.map(m => m.label),
      datasets: [{ label: 'Tahsilat (₺)', data: collected, backgroundColor: 'rgba(196,99,122,.7)', borderRadius: 6, borderSkipped: false }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });
}
