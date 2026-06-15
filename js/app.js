const PAGES = {
  overview:  { title: 'Genel Bakış',        render: renderOverview,  init: null          },
  leads:     { title: 'Reklam Leadleri',     render: renderLeads,     init: initLeads     },
  customers: { title: 'Mevcut Müşteriler',   render: renderCustomers, init: initCustomers },
  meetings:  { title: 'Toplantılar',         render: renderMeetings,  init: initMeetings  },
  payments:  { title: 'Ödemeler',            render: renderPayments,  init: initPayments  },
  services:  { title: 'Hizmetler',           render: renderServices,  init: initServices  },
  reports:   { title: 'Raporlar',            render: renderReports,   init: initReports   },
  settings:  { title: 'Ayarlar',             render: renderSettings,  init: initSettings  }
};

const App = {
  current: 'overview',

  init() {
    this.updateUserInfo();
    this.nav('overview');
    this.refreshBadge();

    document.getElementById('hamburger').onclick = () => this.toggleSidebar();
    document.getElementById('sidebar-overlay').onclick = () => this.closeSidebar();
  },

  nav(page) {
    if (!PAGES[page]) return;
    this.current = page;

    // update active nav
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });

    // update page title
    document.getElementById('page-title').textContent = PAGES[page].title;

    // render content
    document.getElementById('content').innerHTML = PAGES[page].render();

    // run init
    if (PAGES[page].init) PAGES[page].init();

    this.closeSidebar();
    window.scrollTo(0, 0);
  },

  toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('open');
  },

  closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
  },

  refreshBadge() {
    const newLeads = Leads.all().filter(l => l.status === 'yeni').length;
    const badge = document.getElementById('lead-badge');
    if (badge) {
      badge.textContent = newLeads;
      badge.style.display = newLeads ? 'inline' : 'none';
    }
  },

  updateUserInfo() {
    const s = Settings.get();
    const name = s.name || 'Kullanıcı';
    const el = document.getElementById('user-name');
    if (el) el.textContent = name;
    const av = document.getElementById('user-avatar');
    if (av) av.textContent = initials(name);
  }
};

// Modal helpers
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

// Close modal on overlay click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// Close modal on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

document.addEventListener('DOMContentLoaded', () => App.init());
