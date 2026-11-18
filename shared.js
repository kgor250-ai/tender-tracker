// shared.js - Centralized state and shared navigation logic

const DEFAULT_USER = {
  name: "Admin Officer",
  email: "admin@tender-tracker.local",
  role: "ADMIN",
  initial: "A"
};

function getActiveUser() {
  const stored = localStorage.getItem('activeUser');
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  return DEFAULT_USER;
}

function setActiveUser(user) {
  localStorage.setItem('activeUser', JSON.stringify(user));
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
  location.reload();
}

function initSharedNav(activePage) {
  // Update user badge in top bar
  const user = getActiveUser();
  const userNameEl = document.getElementById('nav-user-name');
  const userRoleEl = document.getElementById('nav-user-role');
  const userAvatarEl = document.getElementById('nav-user-avatar');

  if (userNameEl) userNameEl.innerText = user.name;
  if (userRoleEl) userRoleEl.innerText = user.role.replace('_', ' ');
  if (userAvatarEl) userAvatarEl.innerText = user.initial;

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

  // Restore active date range if element exists
  const savedRange = localStorage.getItem('selectedDateRange') || '30d';
  if (DATE_RANGE_DATA[savedRange]) {
    const labelEl = document.getElementById('selected-date-range-label');
    if (labelEl) labelEl.innerText = DATE_RANGE_DATA[savedRange].label;
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
});

// Notifications State & Logic
const DEFAULT_NOTIFICATIONS = [
  {
    id: 1,
    title: "Corrigendum 02 Published",
    time: "5m ago",
    desc: "GJ/2026/105 deadline extended to 30 Nov 2026 for Road Construction Works.",
    link: "tender-details.html",
    icon: "file-diff",
    color: "blue",
    read: false
  },
  {
    id: 2,
    title: "Verification Required",
    time: "22m ago",
    desc: "GJ/2026/104 specification clause 4.2 revised. Awaiting operator sign-off.",
    link: "review.html",
    icon: "alert-triangle",
    color: "amber",
    read: false
  },
  {
    id: 3,
    title: "Crawler Sync Completed",
    time: "1h ago",
    desc: "Gujarat E-Procurement adapter scraped 14 new updates successfully.",
    link: "collection-monitor.html",
    icon: "refresh-cw",
    color: "emerald",
    read: false
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
    }
    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }
  }
}

function markAllNotificationsAsRead() {
  const items = getNotifications().map(n => ({ ...n, read: true }));
  saveNotifications(items);
  showToast('All notifications marked as read', 'success');
}

function handleNotificationClick(id, link) {
  const items = getNotifications().map(n => n.id === id ? { ...n, read: true } : n);
  saveNotifications(items);
  if (link) {
    window.location.href = link;
  }
}

// Date Range Filter logic
const DATE_RANGE_DATA = {
  'today': {
    label: 'Today',
    tenders: '42',
    amendments: '12',
    reviews: '2',
    errors: '0'
  },
  '7d': {
    label: 'Last 7 Days',
    tenders: '318',
    amendments: '89',
    reviews: '6',
    errors: '1'
  },
  '30d': {
    label: 'Last 30 Days',
    tenders: '1,248',
    amendments: '326',
    reviews: '18',
    errors: '3'
  },
  '90d': {
    label: 'Last 90 Days',
    tenders: '3,420',
    amendments: '874',
    reviews: '41',
    errors: '7'
  },
  'ytd': {
    label: 'FY 2026-27',
    tenders: '5,120',
    amendments: '1,340',
    reviews: '68',
    errors: '12'
  }
};

function selectDateRange(key) {
  const data = DATE_RANGE_DATA[key];
  if (!data) return;
  
  localStorage.setItem('selectedDateRange', key);
  
  // Update button label
  const labelEl = document.getElementById('selected-date-range-label');
  if (labelEl) labelEl.innerText = data.label;
  
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

  // Animate stat cards if present
  const statTenders = document.getElementById('stat-total-tenders');
  const statAmendments = document.getElementById('stat-total-amendments');
  const statReviews = document.getElementById('stat-pending-reviews');
  const statErrors = document.getElementById('stat-collection-errors');

  if (statTenders) statTenders.innerText = data.tenders;
  if (statAmendments) statAmendments.innerText = data.amendments;
  if (statReviews) statReviews.innerText = data.reviews;
  if (statErrors) statErrors.innerText = data.errors;

  showToast(`Dashboard updated for: ${data.label}`, 'info');
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
  if (window.lucide && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }

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
