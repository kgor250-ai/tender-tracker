
// ==========================================
// CENTRALIZED DATA STORES & CANONICAL COUNTS PROVIDER
// ==========================================

const DEFAULT_TENDERS = [
  { id: "GJ/2026/105", title: "Road Construction Works - State Highway Package 4", dept: "PWD", pubDate: "01 Nov 2026", deadline: "30 Nov 2026", status: "Amended", cat: "Infrastructure", estimatedCost: "₹ 5,00,00,000", amendmentsCount: 2 },
  { id: "GJ/2026/104", title: "Supply of Advanced ICU Ventilators & Telemetry Systems", dept: "Health Dept.", pubDate: "31 Oct 2026", deadline: "25 Nov 2026", status: "Corrigendum", cat: "Medical", estimatedCost: "₹ 3,20,00,000", amendmentsCount: 1 },
  { id: "GJ/2026/103", title: "IT Infrastructure Upgrade & Data Center Cloud Setup", dept: "IT Dept.", pubDate: "30 Oct 2026", deadline: "15 Nov 2026", status: "Amended", cat: "IT", estimatedCost: "₹ 2,40,00,000", amendmentsCount: 2 },
  { id: "GJ/2026/102", title: "Turnkey Rooftop Solar PV System (250 kWp)", dept: "Energy Dept", pubDate: "28 Oct 2026", deadline: "20 Nov 2026", status: "Corrigendum", cat: "Infrastructure", estimatedCost: "₹ 1,00,00,000", amendmentsCount: 1 },
  { id: "GJ/2026/101", title: "Water Supply Pipeline Network & Distribution", dept: "Water Dept.", pubDate: "26 Oct 2026", deadline: "12 Nov 2026", status: "Published", cat: "Urban", estimatedCost: "₹ 4,10,00,000", amendmentsCount: 0 },
  { id: "GJ/2026/100", title: "Smart Classroom Digital Board Infrastructure", dept: "Education Dept.", pubDate: "25 Oct 2026", deadline: "14 Dec 2026", status: "Published", cat: "Education", estimatedCost: "₹ 1,75,00,000", amendmentsCount: 0 },
  { id: "GJ/2026/099", title: "Bridge Repair & Structural Rehabilitation", dept: "PWD", pubDate: "24 Oct 2026", deadline: "10 Nov 2026", status: "Live", cat: "Infrastructure", estimatedCost: "₹ 6,50,00,000", amendmentsCount: 3 },
  { id: "GJ/2026/098", title: "Hospital Biomedical Waste Management Solution", dept: "Health Dept.", pubDate: "22 Oct 2026", deadline: "08 Nov 2026", status: "Published", cat: "Medical", estimatedCost: "₹ 85,00,000", amendmentsCount: 0 },
  { id: "GJ/2026/097", title: "City-wide Smart CCTV Surveillance Network", dept: "Home Dept.", pubDate: "20 Oct 2026", deadline: "05 Nov 2026", status: "Amended", cat: "IT", estimatedCost: "₹ 8,75,00,000", amendmentsCount: 2 },
  { id: "GJ/2026/096", title: "Street Light LED Conversion & Smart Monitoring", dept: "Urban Dev", pubDate: "18 Oct 2026", deadline: "02 Nov 2026", status: "Published", cat: "Urban", estimatedCost: "₹ 2,10,00,000", amendmentsCount: 0 }
];

function getTenders() {
  const stored = localStorage.getItem('appTendersCatalog');
  if (stored) {
    try { 
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch (e) {}
  }
  return DEFAULT_TENDERS;
}

function saveTenders(items) {
  localStorage.setItem('appTendersCatalog', JSON.stringify(items));
  updateAllBadgesAndCounters();
}

// Review Queue Master Store
const DEFAULT_REVIEW_QUEUE = [
  {
    id: "GJ-2026-105",
    tenderId: "GJ/2026/105",
    title: "Road Construction Works - State Highway Package 4",
    corrigendumNo: "Corrigendum No. 02/2026",
    department: "PWD",
    submittedBy: "Rajesh Kumar (Tender Operator)",
    submittedDate: "07 Nov 2026",
    changesCount: 2,
    status: "PENDING"
  }
];

function getReviewQueue() {
  const stored = localStorage.getItem('appReviewQueue');
  let queue = DEFAULT_REVIEW_QUEUE;
  if (stored) {
    try { queue = JSON.parse(stored); } catch (e) {}
  }
  // Sync individual review statuses if stored
  return queue.map(item => {
    const individualStatus = localStorage.getItem('review_status_' + item.id);
    if (individualStatus) {
      return { ...item, status: individualStatus };
    }
    return item;
  });
}

function saveReviewQueue(items) {
  localStorage.setItem('appReviewQueue', JSON.stringify(items));
  updateAllBadgesAndCounters();
}

function getPendingReviewCount() {
  const queue = getReviewQueue();
  return queue.filter(r => r.status === 'PENDING').length;
}

// Collection Errors Master Store
const DEFAULT_COLLECTION_ERRORS = [
  { id: "err-1", portal: "tender.nprocure.com", error: "Connection Timeout (504 Gateway)", tenderId: "GJ/2026/088", resolved: false },
  { id: "err-2", portal: "eproc.gujarat.gov.in", error: "PDF OCR Parse Failure", tenderId: "GJ/2026/074", resolved: false },
  { id: "err-3", portal: "gem.gov.in", error: "Rate Limit 429 / CAPTCHA", tenderId: "GJ/2026/061", resolved: false }
];

function getCollectionErrors() {
  const stored = localStorage.getItem('appCollectionErrors');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return DEFAULT_COLLECTION_ERRORS;
}

function saveCollectionErrors(items) {
  localStorage.setItem('appCollectionErrors', JSON.stringify(items));
  updateAllBadgesAndCounters();
}

function getCollectionErrorCount() {
  return getCollectionErrors().filter(e => !e.resolved).length;
}

// Helper to calculate total amendments from version store + tenders
function getTotalAmendmentsCount() {
  const versions = getAllTendersStore();
  let count = 0;
  Object.values(versions).forEach(t => {
    if (t.versions && Array.isArray(t.versions)) {
      count += t.versions.filter(v => v.type !== 'Original Tender').length;
    }
  });
  // Also count any additional tenders with status Corrigendum/Amended
  const tenders = getTenders();
  tenders.forEach(t => {
    const key = t.id ? t.id.replace(/\//g, '-') : '';
    if (!versions[key] && !versions[t.id]) {
      if (t.amendmentsCount) count += t.amendmentsCount;
      else if (t.status === 'Corrigendum') count += 1;
      else if (t.status === 'Amended') count += 2;
    }
  });
  return count;
}

// Comprehensive System Counts Provider
function getSystemCounts(rangeKey = null) {
  const user = getActiveUser();
  let tenders = getTenders();

  // Role / Department filtering (Store owner / Dept officer principle)
  if (user && user.role !== 'ADMIN' && user.department) {
    tenders = tenders.filter(t => t.dept === user.department);
  }

  // Date range filtering
  if (rangeKey && rangeKey !== '30d' && rangeKey !== 'ytd') {
    if (rangeKey === 'today') {
      tenders = tenders.filter(t => (t.pubDate || '').includes('Today') || (t.pubDate || '').includes('Nov 2026'));
    } else if (rangeKey === '7d') {
      tenders = tenders.slice(0, Math.ceil(tenders.length * 0.7));
    }
  }

  const totalTenders = tenders.length;
  const totalAmendments = getTotalAmendmentsCount();
  const pendingReviews = getPendingReviewCount();
  const collectionErrors = getCollectionErrorCount();
  const notifications = getNotifications();
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return {
    totalTenders,
    totalAmendments,
    pendingReviews,
    collectionErrors,
    unreadNotifications,
    totalNotifications: notifications.length
  };
}

// Update all sidebar badges, top bar badges, and dashboard stats across entire app
function updateAllBadgesAndCounters() {
  const counts = getSystemCounts();

  // 1. Sidebar Review Queue Badge
  document.querySelectorAll('#nav-badge-review-sidebar, .review-badge-pill').forEach(el => {
    el.innerText = counts.pendingReviews;
    if (counts.pendingReviews === 0) {
      el.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300 review-badge-pill";
    } else {
      el.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white review-badge-pill";
    }
  });

  // 2. Notification Badges (Sidebar & Topbar)
  document.querySelectorAll('#nav-badge-notif-sidebar, .notif-badge-pill').forEach(el => {
    el.innerText = counts.unreadNotifications;
    if (counts.unreadNotifications === 0) {
      el.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300 notif-badge-pill";
    } else {
      el.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white notif-badge-pill";
    }
  });

  const topNotifBadge = document.getElementById('notification-badge');
  if (topNotifBadge) {
    topNotifBadge.innerText = counts.unreadNotifications;
    if (counts.unreadNotifications === 0) topNotifBadge.style.display = 'none';
    else topNotifBadge.style.display = 'flex';
  }

  const unreadPill = document.getElementById('unread-count-pill');
  if (unreadPill) {
    unreadPill.innerText = `${counts.unreadNotifications} New`;
  }

  // 3. Dashboard Stat Cards (if on dashboard)
  const statTenders = document.getElementById('stat-total-tenders');
  if (statTenders) statTenders.innerText = counts.totalTenders.toLocaleString();

  const statAmendments = document.getElementById('stat-total-amendments');
  if (statAmendments) statAmendments.innerText = counts.totalAmendments.toLocaleString();

  const statReviews = document.getElementById('stat-pending-reviews');
  if (statReviews) statReviews.innerText = counts.pendingReviews.toLocaleString();

  const statErrors = document.getElementById('stat-collection-errors');
  if (statErrors) statErrors.innerText = counts.collectionErrors.toLocaleString();
}

// shared.js - Centralized state and shared navigation logic

const DEFAULT_USER = {
  name: "Admin Officer",
  email: "admin@tender-tracker.local",
  role: "ADMIN",
  initial: "A"
};

function getActiveUser() {
  const stored = localStorage.getItem('activeUser') || sessionStorage.getItem('activeUser');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return DEFAULT_USER;
}

function setActiveUser(user) {
  localStorage.setItem('activeUser', JSON.stringify(user));
  sessionStorage.setItem('activeUser', JSON.stringify(user));
  window.dispatchEvent(new Event('userChanged'));
}

function switchRole(roleKey) {
  let user;
  if (roleKey === 'ADMIN') {
    user = {
      name: "Admin Officer",
      email: "admin@tender-tracker.local",
      role: "ADMIN",
      initial: "A"
    };
  } else if (roleKey === 'OPERATOR') {
    user = {
      name: "Rajesh Kumar (Operator)",
      email: "operator@tender-tracker.local",
      role: "TENDER_OPERATOR",
      initial: "O"
    };
  } else {
    user = {
      name: "Pooja Sharma (Viewer)",
      email: "viewer@contractor.com",
      role: "VIEWER",
      initial: "V"
    };
  }
  setActiveUser(user);
  if (typeof addAuditLog === 'function') {
    addAuditLog('User Role Switched', `Switched active role to ${user.role} (${user.name})`);
  }
  location.reload();
}

function logout() {
  localStorage.removeItem('activeUser');
  sessionStorage.removeItem('activeUser');
  if (typeof addAuditLog === 'function') {
    addAuditLog('User Sign Out', 'Active session terminated');
  }
  window.location.href = 'login.html';
}

// Centralized Audit Logging System
const DEFAULT_AUDIT_LOGS = [
  {
    timestamp: "26-Nov-2026 19:15:20",
    user: "Admin Officer (ADMIN)",
    action: "Catalog Master Update",
    details: "Tender catalog and amendment index synchronized",
    ip: "127.0.0.1",
    status: "SUCCESS"
  },
  {
    timestamp: "25-Nov-2026 15:58:24",
    user: "Admin Officer (ADMIN)",
    action: "Cancellation Module Initialized",
    details: "Tender Cancellation & Re-Tendering Tracker loaded",
    ip: "127.0.0.1",
    status: "SUCCESS"
  },
  {
    timestamp: "20-Nov-2026 15:40:12",
    user: "Admin Officer (ADMIN)",
    action: "Analytics Dashboard Refreshed",
    details: "Variance KPIs and charts calculated across 1,248 tenders",
    ip: "127.0.0.1",
    status: "SUCCESS"
  },
  {
    timestamp: "16-Nov-2026 19:42:01",
    user: "Crawler Worker #2 (SYSTEM)",
    action: "Scraper Auto-Ingest",
    details: "tender.nprocure.com / 12 items ingested",
    ip: "127.0.0.1",
    status: "SUCCESS"
  },
  {
    timestamp: "16-Nov-2026 18:30:15",
    user: "Admin Officer (ADMIN)",
    action: "User Role Matrix Updated",
    details: "RBAC Policy V2 Committed",
    ip: "192.168.1.104",
    status: "SUCCESS"
  }
];

function getAuditLogs() {
  const stored = localStorage.getItem('appAuditLogs');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return DEFAULT_AUDIT_LOGS;
}

function addAuditLog(action, details, status = "SUCCESS") {
  const logs = getAuditLogs();
  const user = getActiveUser();
  const now = new Date();
  const timeStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toTimeString().split(' ')[0];
  logs.unshift({
    timestamp: timeStr,
    user: `${user.name} (${user.role})`,
    action: action,
    details: details,
    ip: "127.0.0.1",
    status: status
  });
  localStorage.setItem('appAuditLogs', JSON.stringify(logs.slice(0, 100)));
}

function initSharedNav(activePage) {
  // Update user badge in top bar
  const user = getActiveUser();
  if (!sessionStorage.getItem('activeUser')) {
    try { sessionStorage.setItem('activeUser', JSON.stringify(user)); } catch (e) {}
  }
  const userNameEl = document.getElementById('nav-user-name');
  const userRoleEl = document.getElementById('nav-user-role');
  const userAvatarEl = document.getElementById('nav-user-avatar');

  if (userNameEl) userNameEl.innerText = user.name;
  if (userRoleEl) userRoleEl.innerText = user.role.replace('_', ' ');
  if (userAvatarEl) userAvatarEl.innerText = user.initial;

  // Wire Sign Out buttons
  document.querySelectorAll('a[href="login.html"]').forEach(link => {
    if (link.textContent.includes('Sign Out')) {
      link.onclick = (e) => {
        e.preventDefault();
        logout();
      };
    }
  });

  // Highlight active link in sidebar
  const navLinks = document.querySelectorAll('.sidebar-link');
  navLinks.forEach(link => {
    if (link.getAttribute('data-page') === activePage) {
      link.classList.add('bg-blue-600', 'text-white', 'font-bold');
      link.classList.remove('text-slate-300', 'hover:bg-slate-800');
    }
  });

  // Apply Role restrictions
  applyRoleRestrictions(user);

  // Initialize Notifications
  renderNotificationUI();
  updateAllBadgesAndCounters();

  // Restore active date range if element exists
  const savedRange = localStorage.getItem('selectedDateRange') || '30d';
  if (DATE_RANGE_LABELS[savedRange]) {
    const labelEl = document.getElementById('selected-date-range-label');
    if (labelEl) labelEl.innerText = DATE_RANGE_LABELS[savedRange];
    document.querySelectorAll('.date-range-check').forEach(check => {
      if (check.getAttribute('data-range') === savedRange) {
        check.classList.remove('hidden');
      } else {
        check.classList.add('hidden');
      }
    });
  }
}

function applyRoleRestrictions(user) {
  const isViewer = user.role === 'VIEWER';
  const isAdmin = user.role === 'ADMIN';

  // Toggle restricted buttons
  document.querySelectorAll('.btn-requires-operator').forEach(btn => {
    if (isViewer) {
      btn.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
      btn.title = "Action locked: Viewer has read-only access.";
    }
  });

  document.querySelectorAll('.btn-requires-admin').forEach(btn => {
    if (!isAdmin) {
      btn.classList.add('opacity-50', 'cursor-not-allowed', 'pointer-events-none');
      btn.title = "Action locked: Administrator privileges required.";
    }
  });
}

function toggleDropdown(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const isHidden = el.classList.contains('hidden');
  
  // Close all other dropdowns first for clean UX
  ['user-dropdown-menu', 'notification-dropdown-menu', 'date-range-dropdown'].forEach(menuId => {
    const otherEl = document.getElementById(menuId);
    if (otherEl && menuId !== id) otherEl.classList.add('hidden');
  });

  if (isHidden) {
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }
}

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('#user-menu-btn') && !e.target.closest('#user-dropdown-menu')) {
    const el = document.getElementById('user-dropdown-menu');
    if (el) el.classList.add('hidden');
  }
  if (!e.target.closest('#notification-bell-btn') && !e.target.closest('#notification-dropdown-menu')) {
    const el = document.getElementById('notification-dropdown-menu');
    if (el) el.classList.add('hidden');
  }
  if (!e.target.closest('#date-range-btn') && !e.target.closest('#date-range-dropdown')) {
    const el = document.getElementById('date-range-dropdown');
    if (el) el.classList.add('hidden');
  }
  if (!e.target.closest('[onclick*="sim-dropdown"]') && !e.target.closest('#sim-dropdown')) {
    const el = document.getElementById('sim-dropdown');
    if (el) el.classList.add('hidden');
  }
});

// Notifications State & Logic - Module 6: Notifications & Deadline Monitoring
const DEFAULT_NOTIFICATIONS = [
  {
    id: 1,
    title: "New Corrigendum 02 Published",
    time: "5m ago",
    desc: "Corrigendum No. 02/2026 published for GJ/2026/105 (Six Lane Ring Road Project). Scope and schedule amended.",
    link: "tender-details.html",
    icon: "file-diff",
    color: "blue",
    category: "CORRIGENDUM",
    tenderId: "GJ/2026/105",
    read: false
  },
  {
    id: 2,
    title: "Submission Deadline Changed (+10 Days)",
    time: "15m ago",
    desc: "Bid submission deadline for GJ/2026/105 officially extended from 20 Nov to 30 Nov 2026, 17:00 IST.",
    link: "deadlines.html",
    icon: "calendar-clock",
    color: "amber",
    category: "DEADLINE_CHANGE",
    tenderId: "GJ/2026/105",
    read: false
  },
  {
    id: 3,
    title: "Upcoming Deadline: ICU Ventilators",
    time: "45m ago",
    desc: "GJ/2026/104 bids close in 6 days (25 Nov 2026, 16:00 IST). Ensure EMD Bank Guarantee is uploaded.",
    link: "deadlines.html",
    icon: "alert-circle",
    color: "rose",
    category: "UPCOMING_DEADLINE",
    tenderId: "GJ/2026/104",
    read: false
  },
  {
    id: 4,
    title: "Latest Amendment v1.2 Available",
    time: "2h ago",
    desc: "Authoritative Master Specification v1.2 for Highway Project is compiled and ready for contractor download.",
    link: "latest-tender.html",
    icon: "file-check-2",
    color: "emerald",
    category: "LATEST_AMENDMENT",
    tenderId: "GJ/2026/105",
    read: false
  },
  {
    id: 5,
    title: "Pre-Bid Meeting Rescheduled",
    time: "3h ago",
    desc: "GJ/2026/089 Pre-bid conference shifted to virtual Webex mode on 12 Nov 2026.",
    link: "tender-details.html",
    icon: "video",
    color: "blue",
    category: "CORRIGENDUM",
    tenderId: "GJ/2026/089",
    read: true
  }
];

function getNotifications() {
  const stored = localStorage.getItem('appNotifications');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return DEFAULT_NOTIFICATIONS;
}

function saveNotifications(items) {
  localStorage.setItem('appNotifications', JSON.stringify(items));
  renderNotificationUI();
  updateAllBadgesAndCounters();
}

function renderNotificationUI() {
  const items = getNotifications();
  const unreadCount = items.filter(n => !n.read).length;
  
  const badge = document.getElementById('notification-badge');
  const countPill = document.getElementById('unread-count-pill');
  if (badge) {
    if (unreadCount > 0) {
      badge.innerText = unreadCount;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  // Update sidebar notification badges
  document.querySelectorAll('#nav-badge-notif-sidebar, #nav-badge-deadlines-sidebar, .notif-badge-pill').forEach(el => {
    el.innerText = unreadCount;
  });
  if (countPill) {
    countPill.innerText = unreadCount > 0 ? `${unreadCount} New` : '0 New';
    countPill.className = unreadCount > 0 
      ? 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700'
      : 'px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500';
  }

  const container = document.getElementById('notification-items-container');
  if (container) {
    if (items.length === 0) {
      container.innerHTML = `
        <div class="py-8 text-center text-slate-400 space-y-1">
          <i data-lucide="bell-off" class="w-7 h-7 mx-auto opacity-50 mb-2"></i>
          <p class="font-bold text-xs text-slate-600">No notifications</p>
          <p class="text-[11px]">All tender updates have been cleared.</p>
        </div>
      `;
    } else {
      container.innerHTML = items.map(n => {
        const colorBg = n.color === 'blue' ? 'bg-blue-100 text-blue-600' : n.color === 'amber' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600';
        const readClass = n.read ? 'opacity-60 bg-white' : 'bg-slate-50/50';
        return `
          <div class="p-3.5 hover:bg-slate-100/70 transition-colors flex items-start gap-3 cursor-pointer ${readClass}" onclick="handleNotificationClick(${n.id}, '${n.link}')">
            <div class="w-8 h-8 rounded-xl ${colorBg} flex items-center justify-center shrink-0 mt-0.5">
              <i data-lucide="${n.icon}" class="w-4 h-4"></i>
            </div>
            <div class="flex-1 min-w-0 space-y-0.5">
              <div class="flex items-center justify-between gap-1">
                <span class="font-bold text-slate-900 truncate ${n.read ? 'font-medium text-slate-700' : ''}">${n.title}</span>
                <span class="text-[10px] text-slate-400 shrink-0">${n.time}</span>
              </div>
              <p class="text-[11px] text-slate-600 line-clamp-2">${n.desc}</p>
              <span class="inline-block text-[10px] font-bold text-blue-600">Open &rarr;</span>
            </div>
            ${!n.read ? '<div class="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2"></div>' : ''}
          </div>
        `;
      }).join('');
      container.innerHTML += `
        <div class="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
          <a href="notifications.html" class="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1">
            <span>Open Notification Center</span> &rarr;
          </a>
        </div>
      `;
    }
    if (window.lucide && typeof window.lucide.createIcons === 'function') { window.lucide.createIcons(); }
  }
}

function markAllNotificationsAsRead() {
  const items = getNotifications().map(n => ({ ...n, read: true }));
  saveNotifications(items);
  showToast('All notifications marked as read', 'success');
}

function deleteNotification(id) {
  const items = getNotifications().filter(n => n.id !== id);
  saveNotifications(items);
  showToast('Notification dismissed', 'info');
}

function addNotification(notif) {
  const items = getNotifications();
  const newNotif = {
    id: Date.now(),
    title: notif.title || "Tender Alert",
    time: "Just now",
    desc: notif.desc || "",
    link: notif.link || "notifications.html",
    icon: notif.icon || "bell",
    color: notif.color || "blue",
    category: notif.category || "CORRIGENDUM",
    tenderId: notif.tenderId || "GJ/2026/105",
    read: false
  };
  items.unshift(newNotif);
  saveNotifications(items);
  showToast(`New Notification: ${newNotif.title}`, 'info');
  return newNotif;
}

// Module 6: Upcoming Deadlines Data Provider
const DEFAULT_UPCOMING_DEADLINES = [
  {
    id: "GJ-2026-105",
    tenderRef: "GJ/2026/105",
    title: "Construction of Six-Lane Elevated Corridor on SG Highway",
    department: "Roads & Buildings Dept (PWD)",
    category: "Civil Works",
    estimatedCost: "₹ 24,50,00,000",
    emdAmount: "₹ 10,00,000",
    submissionDeadline: "30 Nov 2026, 17:00 IST",
    daysRemaining: 11,
    hoursRemaining: 6,
    status: "EXTENDED",
    urgencyLevel: "UPCOMING",
    originalDate: "15 Nov 2026",
    extensionDays: 15,
    corrigendumRef: "Corrigendum 02/2026",
    technicalOpening: "01 Dec 2026, 11:00 IST",
    portalLink: "https://tender-tracker.gov.in/gj2026105"
  },
  {
    id: "GJ-2026-104",
    tenderRef: "GJ/2026/104",
    title: "Supply of Advanced ICU Ventilators & Telemetry Systems",
    department: "Health Department",
    category: "Medical Equipment",
    estimatedCost: "₹ 3,20,00,000",
    emdAmount: "₹ 6,40,000",
    submissionDeadline: "25 Nov 2026, 16:00 IST",
    daysRemaining: 6,
    hoursRemaining: 4,
    status: "EXTENDED",
    urgencyLevel: "UPCOMING",
    originalDate: "18 Nov 2026",
    extensionDays: 7,
    corrigendumRef: "Corrigendum 01/2026",
    technicalOpening: "26 Nov 2026, 12:00 IST",
    portalLink: "https://tender-tracker.gov.in/gj2026104"
  },
  {
    id: "GJ-2026-089",
    tenderRef: "GJ/2026/089",
    title: "Turnkey Rooftop Solar PV System (250 kWp) with BESS",
    department: "Energy & Petrochemicals",
    category: "Solar Energy",
    estimatedCost: "₹ 1,00,00,000",
    emdAmount: "₹ 2,00,000",
    submissionDeadline: "20 Nov 2026, 15:00 IST",
    daysRemaining: 1,
    hoursRemaining: 18,
    status: "URGENT",
    urgencyLevel: "CRITICAL",
    originalDate: "10 Nov 2026",
    extensionDays: 10,
    corrigendumRef: "Corrigendum 01/2026",
    technicalOpening: "21 Nov 2026, 11:00 IST",
    portalLink: "https://tender-tracker.gov.in/gj2026089"
  },
  {
    id: "GJ-2026-044",
    tenderRef: "GJ/2026/044",
    title: "Deployment of Smart City Automated Water Metering SCADA",
    department: "Urban Development",
    category: "IoT / SCADA",
    estimatedCost: "₹ 8,75,00,000",
    emdAmount: "₹ 4,35,000",
    submissionDeadline: "21 Nov 2026, 18:00 IST",
    daysRemaining: 2,
    hoursRemaining: 8,
    status: "URGENT",
    urgencyLevel: "CRITICAL",
    originalDate: "21 Nov 2026",
    extensionDays: 0,
    corrigendumRef: "N/A (Original Schedule)",
    technicalOpening: "22 Nov 2026, 11:30 IST",
    portalLink: "https://tender-tracker.gov.in/gj2026044"
  },
  {
    id: "GJ-2026-012",
    tenderRef: "GJ/2026/012",
    title: "Comprehensive Annual Maintenance Contract for IT Datacenter",
    department: "Science & Technology",
    category: "IT Infrastructure",
    estimatedCost: "₹ 1,80,00,000",
    emdAmount: "₹ 90,000",
    submissionDeadline: "05 Dec 2026, 17:00 IST",
    daysRemaining: 16,
    hoursRemaining: 2,
    status: "NORMAL",
    urgencyLevel: "NORMAL",
    originalDate: "05 Dec 2026",
    extensionDays: 0,
    corrigendumRef: "N/A (Base NIT)",
    technicalOpening: "06 Dec 2026, 14:00 IST",
    portalLink: "https://tender-tracker.gov.in/gj2026012"
  }
];

function getUpcomingDeadlines() {
  const stored = localStorage.getItem('upcomingDeadlinesStore');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return DEFAULT_UPCOMING_DEADLINES;
}

function saveUpcomingDeadlines(items) {
  localStorage.setItem('upcomingDeadlinesStore', JSON.stringify(items));
}

function getEmailNotificationSettings() {
  const stored = localStorage.getItem('emailNotificationSettings');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return {
    enabled: true,
    email: "procurement-alerts@gujarat.gov.in",
    corrigendumAlerts: true,
    deadlineChangeAlerts: true,
    upcoming24hAlerts: true,
    digestFrequency: "IMMEDIATE"
  };
}

function saveEmailNotificationSettings(settings) {
  localStorage.setItem('emailNotificationSettings', JSON.stringify(settings));
  showToast('Email alert preferences saved successfully', 'success');
}

function handleNotificationClick(id, link) {
  const items = getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
  saveNotifications(items);
  if (link) {
    window.location.href = link;
  }
}

// Date Range Filter logic

const DATE_RANGE_LABELS = {
  'today': 'Today',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
  '90d': 'Last 90 Days',
  'ytd': 'FY 2026-27'
};

function selectDateRange(key) {
  const label = DATE_RANGE_LABELS[key] || 'Last 30 Days';
  localStorage.setItem('selectedDateRange', key);
  
  // Update button label
  const labelEl = document.getElementById('selected-date-range-label');
  if (labelEl) labelEl.innerText = label;
  
  // Close dropdown
  const dropdown = document.getElementById('date-range-dropdown');
  if (dropdown) dropdown.classList.add('hidden');
  
  // Update checkmarks
  document.querySelectorAll('.date-range-check').forEach(check => {
    if (check.getAttribute('data-range') === key) {
      check.classList.remove('hidden');
    } else {
      check.classList.add('hidden');
    }
  });

  // Calculate actual counts for this range
  const counts = getSystemCounts(key);

  const statTenders = document.getElementById('stat-total-tenders');
  const statAmendments = document.getElementById('stat-total-amendments');
  const statReviews = document.getElementById('stat-pending-reviews');
  const statErrors = document.getElementById('stat-collection-errors');

  if (statTenders) statTenders.innerText = counts.totalTenders.toLocaleString();
  if (statAmendments) statAmendments.innerText = counts.totalAmendments.toLocaleString();
  if (statReviews) statReviews.innerText = counts.pendingReviews.toLocaleString();
  if (statErrors) statErrors.innerText = counts.collectionErrors.toLocaleString();

  showToast(`Dashboard updated for: ${label}`, 'info');
}


// ==========================================
// MODULE 4: TENDER REVISION & VERSION MANAGEMENT
// ==========================================
const DEFAULT_TENDER_VERSIONS = {
  "GJ-2026-105": {
    tenderId: "GJ/2026/105",
    title: "Road Construction Works - State Highway Package 4",
    department: "Public Works Department (PWD)",
    category: "Infrastructure",
    location: "Gujarat, India",
    estimatedCost: "₹ 5,00,00,000",
    emdAmount: "₹ 10,00,000",
    tenderFee: "₹ 5,000",
    currentVersion: "v1.2",
    versions: [
      {
        version: "v1.0",
        type: "Original Tender",
        corrigendumNo: "N/A (Base Release)",
        publishDate: "01 Nov 2026",
        publishedBy: "Admin Officer (PWD)",
        status: "Superseded",
        description: "Initial release of Notice Inviting Tender (NIT) for Road Construction Works in Gujarat State Highway package 4.",
        documentRef: "NIT_GJ2026105_v1.0.pdf",
        values: {
          submissionDeadline: "20 Nov 2026, 17:00 IST",
          technicalBidOpening: "21 Nov 2026, 11:00 IST",
          financialBidOpening: "25 Nov 2026, 15:00 IST",
          eligibilityTurnover: "₹ 15,00,00,000 in last 3 financial years",
          emdAmount: "₹ 10,00,000",
          completionPeriod: "18 Calendar Months",
          preBidMeeting: "10 Nov 2026, 14:00 IST (Physical - PWD Gandhinagar)",
          technicalSpecs: "Clause 4.1: Bituminous Concrete Grade 2 as per IRC:111-2009 standards"
        },
        changedFields: []
      },
      {
        version: "v1.1",
        type: "Corrigendum 01",
        corrigendumNo: "Corrigendum No. 01/2026",
        publishDate: "03 Nov 2026",
        publishedBy: "Rajesh Kumar (Tender Operator)",
        status: "Superseded",
        description: "Clarification and relaxing of bidder financial criteria following contractor pre-bid representations.",
        documentRef: "Corrigendum_01_Clarifications.pdf",
        values: {
          submissionDeadline: "20 Nov 2026, 17:00 IST",
          technicalBidOpening: "21 Nov 2026, 11:00 IST",
          financialBidOpening: "25 Nov 2026, 15:00 IST",
          eligibilityTurnover: "₹ 10,00,00,000 in last 3 financial years",
          emdAmount: "₹ 10,00,000",
          completionPeriod: "18 Calendar Months",
          preBidMeeting: "12 Nov 2026, 14:00 IST (Virtual via Webex)",
          technicalSpecs: "Clause 4.1: Bituminous Concrete Grade 2 as per IRC:111-2009 standards"
        },
        changedFields: [
          {
            field: "Eligibility Turnover",
            key: "eligibilityTurnover",
            oldVal: "₹ 15,00,00,000 in last 3 financial years",
            newVal: "₹ 10,00,00,000 in last 3 financial years",
            status: "MODIFIED",
            reason: "Relaxed threshold to facilitate wider MSME infrastructure contractor participation"
          },
          {
            field: "Pre-Bid Meeting",
            key: "preBidMeeting",
            oldVal: "10 Nov 2026, 14:00 IST (Physical - PWD Gandhinagar)",
            newVal: "12 Nov 2026, 14:00 IST (Virtual via Webex)",
            status: "MODIFIED",
            reason: "Shifted to virtual platform to enable national contractors to attend"
          }
        ]
      },
      {
        version: "v1.2",
        type: "Corrigendum 02",
        corrigendumNo: "Corrigendum No. 02/2026",
        publishDate: "07 Nov 2026",
        publishedBy: "Rajesh Kumar (Tender Operator)",
        status: "Active (Latest)",
        description: "Official 10-day extension of bid submission deadline and technical bid opening schedule due to public holidays.",
        documentRef: "Corrigendum_02_Deadline_Extension.pdf",
        values: {
          submissionDeadline: "30 Nov 2026, 17:00 IST",
          technicalBidOpening: "01 Dec 2026, 11:00 IST",
          financialBidOpening: "05 Dec 2026, 15:00 IST",
          eligibilityTurnover: "₹ 10,00,00,000 in last 3 financial years",
          emdAmount: "₹ 10,00,000",
          completionPeriod: "18 Calendar Months",
          preBidMeeting: "12 Nov 2026, 14:00 IST (Virtual via Webex)",
          technicalSpecs: "Clause 4.1: Bituminous Concrete Grade 2 as per IRC:111-2009 standards"
        },
        changedFields: [
          {
            field: "Submission Deadline",
            key: "submissionDeadline",
            oldVal: "20 Nov 2026, 17:00 IST",
            newVal: "30 Nov 2026, 17:00 IST",
            status: "MODIFIED",
            reason: "10-day timeline extension approved by Chief Engineer"
          },
          {
            field: "Technical Bid Opening",
            key: "technicalBidOpening",
            oldVal: "21 Nov 2026, 11:00 IST",
            newVal: "01 Dec 2026, 11:00 IST",
            status: "MODIFIED",
            reason: "Rescheduled in alignment with the extended bid submission deadline"
          }
        ]
      }
    ]
  },
  "GJ-2026-104": {
    tenderId: "GJ/2026/104",
    title: "Supply of Advanced ICU Ventilators & Telemetry Systems",
    department: "Health Department",
    category: "Medical Supplies",
    location: "Civil Hospital, Ahmedabad",
    estimatedCost: "₹ 3,20,00,000",
    emdAmount: "₹ 6,40,000",
    tenderFee: "₹ 3,000",
    currentVersion: "v1.1",
    versions: [
      {
        version: "v1.0",
        type: "Original Tender",
        corrigendumNo: "N/A (Base Release)",
        publishDate: "31 Oct 2026",
        publishedBy: "Admin Officer (Health)",
        status: "Superseded",
        description: "Procurement notice for 40 units of ICU ventilator and telemetry monitor setup.",
        documentRef: "NIT_GJ2026104_v1.0.pdf",
        values: {
          submissionDeadline: "18 Nov 2026, 16:00 IST",
          technicalBidOpening: "19 Nov 2026, 12:00 IST",
          warrantyPeriod: "3 Years Comprehensive On-site",
          certificationRequired: "US FDA or European CE (Class IIb)",
          emdAmount: "₹ 6,40,000",
          deliveryPeriod: "60 Days from PO"
        },
        changedFields: []
      },
      {
        version: "v1.1",
        type: "Corrigendum 01",
        corrigendumNo: "Corrigendum No. 01/2026/MED",
        publishDate: "05 Nov 2026",
        publishedBy: "Rajesh Kumar (Tender Operator)",
        status: "Active (Latest)",
        description: "Technical specification amendment regarding certification equivalency and warranty terms extension.",
        documentRef: "Corrigendum_01_TechSpecs.pdf",
        values: {
          submissionDeadline: "25 Nov 2026, 16:00 IST",
          technicalBidOpening: "26 Nov 2026, 12:00 IST",
          warrantyPeriod: "5 Years Comprehensive On-site (Revised)",
          certificationRequired: "US FDA, European CE, or BIS Approved (ISO 13485)",
          emdAmount: "₹ 6,40,000",
          deliveryPeriod: "75 Days from PO"
        },
        changedFields: [
          {
            field: "Submission Deadline",
            key: "submissionDeadline",
            oldVal: "18 Nov 2026, 16:00 IST",
            newVal: "25 Nov 2026, 16:00 IST",
            status: "MODIFIED",
            reason: "Extended to allow OEM compliance documentation verification"
          },
          {
            field: "Warranty Period",
            key: "warrantyPeriod",
            oldVal: "3 Years Comprehensive On-site",
            newVal: "5 Years Comprehensive On-site (Revised)",
            status: "MODIFIED",
            reason: "Hospital board approved extended 5-year coverage requirement"
          },
          {
            field: "Certification Standards",
            key: "certificationRequired",
            oldVal: "US FDA or European CE (Class IIb)",
            newVal: "US FDA, European CE, or BIS Approved (ISO 13485)",
            status: "MODIFIED",
            reason: "Permitted indigenous Indian BIS certified equipment under Make In India"
          }
        ]
      }
    ]
  }
};

function getAllTendersStore() {
  const stored = localStorage.getItem('tenderVersionsStore');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return DEFAULT_TENDER_VERSIONS;
}

function saveTenderVersionsStore(store) {
  localStorage.setItem('tenderVersionsStore', JSON.stringify(store));
}

function getTenderVersionData(tenderKey) {
  const store = getAllTendersStore();
  return store[tenderKey] || store["GJ-2026-105"];
}

// Helper to register a new corrigendum and spawn the next version in real-time
function createNewTenderVersion(tenderKey, formData) {
  const store = getAllTendersStore();
  const tender = store[tenderKey];
  if (!tender) return null;

  const currentVer = tender.versions[tender.versions.length - 1];
  const nextVerNumber = "v1." + tender.versions.length;

  // Mark all previous versions as Superseded
  tender.versions.forEach(v => {
    v.status = "Superseded";
  });

  // Calculate changed fields
  const changedFields = [];
  const newValues = { ...currentVer.values };

  if (formData.submissionDeadline && formData.submissionDeadline !== currentVer.values.submissionDeadline) {
    changedFields.push({
      field: "Submission Deadline",
      key: "submissionDeadline",
      oldVal: currentVer.values.submissionDeadline,
      newVal: formData.submissionDeadline,
      status: "MODIFIED",
      reason: formData.reason || "Extended by corrigendum notification"
    });
    newValues.submissionDeadline = formData.submissionDeadline;
  }

  if (formData.eligibilityTurnover && formData.eligibilityTurnover !== currentVer.values.eligibilityTurnover) {
    changedFields.push({
      field: "Eligibility Turnover",
      key: "eligibilityTurnover",
      oldVal: currentVer.values.eligibilityTurnover,
      newVal: formData.eligibilityTurnover,
      status: "MODIFIED",
      reason: formData.reason || "Updated qualification threshold"
    });
    newValues.eligibilityTurnover = formData.eligibilityTurnover;
  }

  if (formData.emdAmount && formData.emdAmount !== currentVer.values.emdAmount) {
    changedFields.push({
      field: "EMD Amount",
      key: "emdAmount",
      oldVal: currentVer.values.emdAmount,
      newVal: formData.emdAmount,
      status: "MODIFIED",
      reason: formData.reason || "Revised deposit fee"
    });
    newValues.emdAmount = formData.emdAmount;
  }

  if (formData.customField && formData.customValue) {
    changedFields.push({
      field: formData.customField,
      key: "customField",
      oldVal: currentVer.values[formData.customField] || "None",
      newVal: formData.customValue,
      status: "MODIFIED",
      reason: formData.reason || "Administrative amendment"
    });
    newValues[formData.customField] = formData.customValue;
  }

  const activeUser = getActiveUser();

  const newVersionObj = {
    version: nextVerNumber,
    type: "Corrigendum 0" + tender.versions.length,
    corrigendumNo: formData.corrigendumNo || `Corrigendum No. 0${tender.versions.length}/2026`,
    publishDate: formData.publishDate || "Today, " + new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    publishedBy: `${activeUser.name} (${activeUser.role.replace('_', ' ')})`,
    status: "Active (Latest)",
    description: formData.description || "Administrative corrigendum revision.",
    documentRef: formData.documentRef || `Corrigendum_0${tender.versions.length}_Notice.pdf`,
    values: newValues,
    changedFields: changedFields
  };

  tender.versions.push(newVersionObj);
  tender.currentVersion = nextVerNumber;

  saveTenderVersionsStore(store);
  return newVersionObj;
}

// Sleek In-App Toast Notification (replaces disruptive browser alerts)
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const borderClass = type === 'success' ? 'border-emerald-500' : type === 'error' ? 'border-rose-500' : 'border-blue-500';
  const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-triangle' : 'info';
  const iconColor = type === 'success' ? 'text-emerald-400' : type === 'error' ? 'text-rose-400' : 'text-blue-400';

  toast.className = `bg-slate-900 border ${borderClass} text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 transform transition-all duration-300 translate-y-4 opacity-0 pointer-events-auto min-w-[280px] max-w-md`;
  toast.innerHTML = `
    <i data-lucide="${icon}" class="w-4 h-4 ${iconColor} shrink-0"></i>
    <span class="flex-1 leading-tight">${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide && typeof window.lucide.createIcons === 'function') { window.lucide.createIcons(); }

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-4', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-4');
    setTimeout(() => toast.remove(), 350);
  }, 3500);
}

// Global safeguard: Override native alert so NO browser popups can ever appear
window.alert = function(msg) {
  showToast(msg, 'info');
};


// ==========================================
// MODULE: TENDER DOCUMENT CHANGE COMPARISON & REPLACEMENT HISTORY
// ==========================================

const DEFAULT_DOCUMENT_CHANGES = [
  {
    id: "doc-chg-1",
    tenderId: "GJ/2026/105",
    tenderTitle: "Road Construction Works - State Highway Package 4",
    corrigendumRef: "Corrigendum 02/2026",
    documentType: "Bill of Quantities (BOQ)",
    changeType: "REPLACED",
    fileFormat: "EXCEL",
    originalDoc: {
      name: "Original_BOQ_Highway_Pkg4_v1.0.xlsx",
      size: "1.45 MB",
      sizeBytes: 1520435,
      uploadDate: "01 Nov 2026, 11:30 AM",
      version: "v1.0",
      uploadedBy: "Admin Officer (PWD)",
      hash: "e9b27a01f8d48f1a",
      sampleType: "boq-original"
    },
    revisedDoc: {
      name: "Revised_BOQ_Highway_Pkg4_v1.2.xlsx",
      size: "1.82 MB",
      sizeBytes: 1908408,
      uploadDate: "07 Nov 2026, 14:15 PM",
      version: "v1.2",
      uploadedBy: "Rajesh Kumar (Tender Operator)",
      hash: "3a8c449e21b090de",
      sampleType: "boq-revised"
    },
    deltaDetails: {
      sizeDelta: "+370 KB (+25.5%)",
      daysDelta: "+6 Days later",
      summary: "Item 4.2 Bituminous concrete quantity increased by 15%; Item 6.1 Drainage earthwork specification rates updated.",
      replacedReason: "Pre-bid contractor feedback and revised site geotechnical survey required updated quantities."
    },
    versionHistory: [
      { version: "v1.0", name: "Original_BOQ_Highway_Pkg4_v1.0.xlsx", date: "01 Nov 2026, 11:30 AM", author: "Admin Officer (PWD)", status: "Superseded", size: "1.45 MB", reason: "Initial NIT base release" },
      { version: "v1.1", name: "Draft_BOQ_Highway_Pkg4_v1.1.xlsx", date: "03 Nov 2026, 16:00 PM", author: "Rajesh Kumar (Operator)", status: "Superseded", size: "1.60 MB", reason: "Preliminary quantity adjustments" },
      { version: "v1.2", name: "Revised_BOQ_Highway_Pkg4_v1.2.xlsx", date: "07 Nov 2026, 14:15 PM", author: "Rajesh Kumar (Operator)", status: "Active (Master)", size: "1.82 MB", reason: "Official Corrigendum 02 approved schedule" }
    ]
  },
  {
    id: "doc-chg-2",
    tenderId: "GJ/2026/105",
    tenderTitle: "Road Construction Works - State Highway Package 4",
    corrigendumRef: "Corrigendum 01/2026",
    documentType: "Technical Specifications & Standards",
    changeType: "REPLACED",
    fileFormat: "WORD",
    originalDoc: {
      name: "Technical_Specifications_v1.0.docx",
      size: "820 KB",
      sizeBytes: 839680,
      uploadDate: "01 Nov 2026, 11:30 AM",
      version: "v1.0",
      uploadedBy: "Admin Officer (PWD)",
      hash: "7f4c19ae88931ab",
      sampleType: "techspecs-original"
    },
    revisedDoc: {
      name: "Revised_Technical_Specifications_v1.1.docx",
      size: "940 KB",
      sizeBytes: 962560,
      uploadDate: "03 Nov 2026, 15:45 PM",
      version: "v1.1",
      uploadedBy: "Rajesh Kumar (Tender Operator)",
      hash: "82de00ff34167f0",
      sampleType: "techspecs-revised"
    },
    deltaDetails: {
      sizeDelta: "+120 KB (+14.6%)",
      daysDelta: "+2 Days later",
      summary: "Clause 4.1 updated to allow IRC:111-2009 bituminous concrete standards; testing frequencies amended.",
      replacedReason: "Relaxed grading requirements to facilitate MSME vendor participation."
    },
    versionHistory: [
      { version: "v1.0", name: "Technical_Specifications_v1.0.docx", date: "01 Nov 2026, 11:30 AM", author: "Admin Officer (PWD)", status: "Superseded", size: "820 KB", reason: "NIT base publication" },
      { version: "v1.1", name: "Revised_Technical_Specifications_v1.1.docx", date: "03 Nov 2026, 15:45 PM", author: "Rajesh Kumar (Operator)", status: "Active (Master)", size: "940 KB", reason: "Corrigendum 01 amendment" }
    ]
  },
  {
    id: "doc-chg-3",
    tenderId: "GJ/2026/105",
    tenderTitle: "Road Construction Works - State Highway Package 4",
    corrigendumRef: "Corrigendum 02/2026",
    documentType: "Corrigendum Notice & Schedule Extension",
    changeType: "NEWLY_ADDED",
    fileFormat: "PDF",
    originalDoc: null,
    revisedDoc: {
      name: "Corrigendum_02_Deadline_Extension.pdf",
      size: "450 KB",
      sizeBytes: 460800,
      uploadDate: "07 Nov 2026, 14:15 PM",
      version: "v1.2",
      uploadedBy: "Rajesh Kumar (Tender Operator)",
      hash: "bc41e72093111a2",
      sampleType: "notice-pdf"
    },
    deltaDetails: {
      sizeDelta: "+450 KB (New File)",
      daysDelta: "Published 07 Nov 2026",
      summary: "Official Gazette notification extending bid submission deadline by 10 days to 30 Nov 2026, 17:00 IST.",
      replacedReason: "New public gazette order published under Chief Engineer authorization."
    },
    versionHistory: [
      { version: "v1.2", name: "Corrigendum_02_Deadline_Extension.pdf", date: "07 Nov 2026, 14:15 PM", author: "Rajesh Kumar (Operator)", status: "Active (Master)", size: "450 KB", reason: "Newly issued Corrigendum 02 notification" }
    ]
  },
  {
    id: "doc-chg-4",
    tenderId: "GJ/2026/105",
    tenderTitle: "Road Construction Works - State Highway Package 4",
    corrigendumRef: "Base NIT / Corrigendum 02",
    documentType: "General Conditions of Contract (GCC)",
    changeType: "UNCHANGED",
    fileFormat: "PDF",
    originalDoc: {
      name: "General_Conditions_of_Contract_GCC.pdf",
      size: "2.10 MB",
      sizeBytes: 2202009,
      uploadDate: "01 Nov 2026, 11:30 AM",
      version: "v1.0",
      uploadedBy: "Admin Officer (PWD)",
      hash: "45da9b32e855e8",
      sampleType: "gcc-pdf"
    },
    revisedDoc: {
      name: "General_Conditions_of_Contract_GCC.pdf",
      size: "2.10 MB",
      sizeBytes: 2202009,
      uploadDate: "01 Nov 2026, 11:30 AM",
      version: "v1.0",
      uploadedBy: "Admin Officer (PWD)",
      hash: "45da9b32e855e8",
      sampleType: "gcc-pdf"
    },
    deltaDetails: {
      sizeDelta: "0 KB (Identical)",
      daysDelta: "Unchanged since 01 Nov 2026",
      summary: "Standard state procurement contract clauses; no amendment issued.",
      replacedReason: "Baseline legal terms remain valid and unmodified across all corrigenda."
    },
    versionHistory: [
      { version: "v1.0", name: "General_Conditions_of_Contract_GCC.pdf", date: "01 Nov 2026, 11:30 AM", author: "Admin Officer (PWD)", status: "Active (Master)", size: "2.10 MB", reason: "Original tender legal conditions" }
    ]
  },
  {
    id: "doc-chg-5",
    tenderId: "GJ/2026/104",
    tenderTitle: "Supply of Advanced ICU Ventilators & Telemetry Systems",
    corrigendumRef: "Corrigendum 01/2026/MED",
    documentType: "Medical Equipment Technical Specifications",
    changeType: "REPLACED",
    fileFormat: "PDF",
    originalDoc: {
      name: "ICU_Ventilator_TechSpecs_v1.0.pdf",
      size: "1.15 MB",
      sizeBytes: 1205862,
      uploadDate: "31 Oct 2026, 10:00 AM",
      version: "v1.0",
      uploadedBy: "Admin Officer (Health)",
      hash: "12fa9103c877c9",
      sampleType: "ventilator-original"
    },
    revisedDoc: {
      name: "Revised_ICU_Ventilator_TechSpecs_v1.1.pdf",
      size: "1.30 MB",
      sizeBytes: 1363148,
      uploadDate: "05 Nov 2026, 16:30 PM",
      version: "v1.1",
      uploadedBy: "Rajesh Kumar (Tender Operator)",
      hash: "99de420ab34bc",
      sampleType: "ventilator-revised"
    },
    deltaDetails: {
      sizeDelta: "+150 KB (+13.0%)",
      daysDelta: "+5 Days later",
      summary: "Certification standards amended to permit BIS approved equivalent medical devices; warranty terms extended to 5 years.",
      replacedReason: "Government Make In India directive and civil hospital medical director approval."
    },
    versionHistory: [
      { version: "v1.0", name: "ICU_Ventilator_TechSpecs_v1.0.pdf", date: "31 Oct 2026, 10:00 AM", author: "Admin Officer (Health)", status: "Superseded", size: "1.15 MB", reason: "NIT base publication" },
      { version: "v1.1", name: "Revised_ICU_Ventilator_TechSpecs_v1.1.pdf", date: "05 Nov 2026, 16:30 PM", author: "Rajesh Kumar (Operator)", status: "Active (Master)", size: "1.30 MB", reason: "Corrigendum 01 approved tech spec revision" }
    ]
  }
];

function getDocumentChanges(tenderFilter = null) {
  const stored = localStorage.getItem('appDocumentChangesStore');
  let items = DEFAULT_DOCUMENT_CHANGES;
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) items = parsed;
    } catch (e) {}
  }
  if (tenderFilter && tenderFilter !== 'ALL') {
    return items.filter(d => d.tenderId === tenderFilter);
  }
  return items;
}

function saveDocumentChanges(items) {
  localStorage.setItem('appDocumentChangesStore', JSON.stringify(items));
}

// Helper to generate and download dummy files in Excel / PDF / Word format
function downloadDummySampleFile(docName, fileFormat, sampleType = 'boq') {
  let content = "";
  let mimeType = "text/plain";
  let extension = ".txt";

  if (fileFormat === 'EXCEL' || docName.endsWith('.xlsx') || docName.endsWith('.xls')) {
    // Generate Excel-compatible CSV with UTF-8 BOM
    mimeType = "application/vnd.ms-excel;charset=utf-8;";
    extension = ".xlsx";
    content = "\uFEFFItem No,Description of Work,Unit,Original Quantity,Revised Quantity,Unit Rate (INR),Estimated Amount (INR),Amendment Remarks\n"
      + "1.0,Earthwork excavation in road foundation,Cum,12500,12500,180.00,2250000.00,Unchanged baseline quantity\n"
      + "2.1,Granular Sub-Base (GSB) Grade-I 200mm,Cum,4200,4200,850.00,3570000.00,Unchanged specification\n"
      + "3.2,Wet Mix Macadam (WMM) 250mm,Cum,5600,5600,1250.00,7000000.00,Unchanged baseline\n"
      + "4.1,Dense Bituminous Macadam (DBM) 50mm,Cum,1800,2100,6200.00,13020000.00,REVISED: +300 Cum added via Corrigendum 02\n"
      + "4.2,Bituminous Concrete (BC) Grade-2 40mm,Cum,1450,1720,7400.00,12728000.00,REVISED: Quantity increased per geotechnical survey\n"
      + "5.0,Reinforced Cement Concrete Box Culvert M25,Cum,450,450,5800.00,2610000.00,Unchanged structural design\n"
      + "6.1,Side Drains with precast cover slabs,Meter,3200,3800,980.00,3724000.00,REVISED: +600M extended in village stretch\n"
      + "7.0,Road Safety Furniture & Thermoplastic Marking,Km,18,18,85000.00,1530000.00,Unchanged road safety schedule\n"
      + "TOTAL,,,,,₹ 4,64,32,000.00,REVISED SCHEDULE MASTER APPROVED\n";
  } else if (fileFormat === 'WORD' || docName.endsWith('.docx') || docName.endsWith('.doc')) {
    mimeType = "application/msword;charset=utf-8;";
    extension = ".docx";
    content = "========================================================================\n"
      + "STATE HIGHWAY PACKAGE 4 - TECHNICAL SPECIFICATION AMENDMENT\n"
      + "Document Version: " + docName + "\n"
      + "Governing Corrigendum: Corrigendum No. 02/2026\n"
      + "========================================================================\n\n"
      + "1. CLAUSE 4.1 - BITUMINOUS ROAD PAVEMENT STANDARDS\n"
      + "   [Original NIT Baseline]:\n"
      + "   Bituminous concrete shall conform strictly to IRC:111-2009 Grade 1 with VG-30 paving bitumen.\n\n"
      + "   [Revised Specification via Corrigendum 02]:\n"
      + "   Bituminous concrete shall conform to IRC:111-2009 Grade 2 standards with either VG-30 or VG-40 paving bitumen.\n"
      + "   Permitted indigenous testing certification from NABL accredited state laboratories.\n\n"
      + "2. CLAUSE 8.4 - DEFECT LIABILITY PERIOD\n"
      + "   Comprehensive defect liability period confirmed at 36 calendar months from completion certificate.\n\n"
      + "Authorizing Authority: Chief Engineer, Public Works Department (PWD), Gujarat\n";
  } else {
    // PDF text format
    mimeType = "application/pdf;charset=utf-8;";
    extension = ".pdf";
    content = "%PDF-1.4\n"
      + "% NOTICE INVITING TENDER / CORRIGENDUM OFFICIAL GAZETTE ORDER\n"
      + "Tender Ref: GJ/2026/105\n"
      + "Document: " + docName + "\n"
      + "Status: Verified & Signed by Procurement Authority\n\n"
      + "Official Corrigendum Notification:\n"
      + "1. The bid submission deadline for Tender No. GJ/2026/105 is extended by 10 calendar days.\n"
      + "2. New Submission Cut-off: 30 November 2026, 17:00 IST.\n"
      + "3. Technical Bid Opening: 01 December 2026, 11:00 IST.\n"
      + "All other baseline NIT terms and conditions remain unaltered.\n";
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = docName || ("Tender_Document_" + Date.now() + extension);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  if (window.showToast) {
    showToast(`Downloaded ${docName} (${fileFormat})`, 'success');
  }
}
