/**
 * ═══════════════════════════════════════════════════════════
 *  CBSH Digital Library — Shared Utilities & Layout Builder
 *  Builds sidebar, topbar, and provides common helpers.
 * ═══════════════════════════════════════════════════════════
 */

const App = (() => {
  // ── Determine path prefix based on page location ─────
  function getPathPrefix() {
    const path = window.location.pathname;
    if (
      path.includes("/admin/") ||
      path.includes("/teacher/") ||
      path.includes("/student/")
    ) {
      return "../";
    }
    return "";
  }

  // ── Sidebar Navigation Config ────────────────────────
  const NAV_CONFIG = {
    admin: {
      title: "Admin Panel",
      items: [
        { section: "Overview" },
        {
          label: "Dashboard",
          icon: "bi-grid-1x2-fill",
          href: "dashboard.html",
        },
        { section: "Management" },
        {
          label: "Approve Users",
          icon: "bi-person-check-fill",
          href: "approve-users.html",
          badge: "pending",
        },
        {
          label: "View Materials",
          icon: "bi-journal-richtext",
          href: "view-materials.html",
        },
        {
          label: "View Quizzes",
          icon: "bi-patch-question-fill",
          href: "view-quizzes.html",
        },
        {
          label: "Student Tracking",
          icon: "bi-bar-chart-line-fill",
          href: "student-quiz-tracking.html",
        },
        { section: "System" },
        {
          label: "Activity Logs",
          icon: "bi-clock-history",
          href: "activity-logs.html",
        },
        {
          label: "Announcements",
          icon: "bi-megaphone-fill",
          href: "announcements.html",
        },
        {
          label: "Reports",
          icon: "bi-file-earmark-pdf-fill",
          href: "reports.html",
        },
        { label: "Settings", icon: "bi-gear-fill", href: "settings.html" },
      ],
    },
    teacher: {
      title: "Teacher Panel",
      items: [
        { section: "Overview" },
        {
          label: "Dashboard",
          icon: "bi-grid-1x2-fill",
          href: "dashboard.html",
        },
        { section: "Materials" },
        {
          label: "Upload Material",
          icon: "bi-cloud-arrow-up-fill",
          href: "upload-material.html",
        },
        {
          label: "My Materials",
          icon: "bi-journal-richtext",
          href: "my-materials.html",
        },
        { section: "Quizzes" },
        {
          label: "Create Quiz",
          icon: "bi-plus-circle-fill",
          href: "create-quiz.html",
        },
        {
          label: "My Quizzes",
          icon: "bi-patch-question-fill",
          href: "my-quizzes.html",
        },
        {
          label: "Quiz Analytics",
          icon: "bi-graph-up-arrow",
          href: "quiz-analytics.html",
        },
        { section: "Other" },
        {
          label: "Announcements",
          icon: "bi-megaphone-fill",
          href: "announcements.html",
        },
        { label: "My Profile", icon: "bi-person-circle", href: "profile.html" },
      ],
    },
    student: {
      title: "Student Panel",
      items: [
        { section: "Overview" },
        {
          label: "Dashboard",
          icon: "bi-grid-1x2-fill",
          href: "dashboard.html",
        },
        { section: "Library" },
        {
          label: "Browse Materials",
          icon: "bi-search",
          href: "browse-materials.html",
        },
        {
          label: "My Downloads",
          icon: "bi-download",
          href: "my-downloads.html",
        },
        {
          label: "Bookmarks",
          icon: "bi-bookmark-heart-fill",
          href: "bookmarks.html",
        },
        { section: "Quizzes" },
        {
          label: "Available Quizzes",
          icon: "bi-patch-question-fill",
          href: "available-quizzes.html",
        },
        {
          label: "Quiz Results",
          icon: "bi-trophy-fill",
          href: "quiz-results.html",
        },
        { section: "Other" },
        {
          label: "Announcements",
          icon: "bi-megaphone-fill",
          href: "announcements.html",
        },
        { label: "My Profile", icon: "bi-person-circle", href: "profile.html" },
      ],
    },
  };

  // ── Build Sidebar HTML ───────────────────────────────
  function buildSidebar(role) {
    const config = NAV_CONFIG[role];
    if (!config) return "";

    const user = AuthGuard.getUser();
    const currentPage = window.location.pathname.split("/").pop();
    const prefix = getPathPrefix();

    let navHtml = "";
    config.items.forEach((item) => {
      if (item.section) {
        navHtml += `<li class="sidebar-section-title">${item.section}</li>`;
      } else {
        const isActive = currentPage === item.href;
        const badgeHtml = item.badge
          ? `<span class="badge bg-danger ms-auto" id="sidebar-badge-${item.badge}">0</span>`
          : "";
        navHtml += `
          <li class="nav-item">
            <a class="nav-link ${isActive ? "active" : ""}" href="${item.href}">
              <i class="bi ${item.icon}"></i>
              <span>${item.label}</span>
              ${badgeHtml}
            </a>
          </li>`;
      }
    });

    return `
      <nav class="cbsh-sidebar" id="cbshSidebar">
        <div class="sidebar-brand">
          <img src="${prefix}assets/images/cbsh-logo.jpg" alt="CBSH">
          <div>
            <span class="sidebar-brand-text">CBSH Library</span>
            <span class="sidebar-brand-sub">${config.title}</span>
          </div>
        </div>
        <ul class="sidebar-nav">
          ${navHtml}
        </ul>
        <div class="sidebar-footer">
          <a class="nav-link" href="#" onclick="AuthGuard.logout(); return false;">
            <i class="bi bi-box-arrow-left"></i>
            <span>Logout</span>
          </a>
        </div>
      </nav>
      <div class="sidebar-overlay" id="sidebarOverlay"></div>`;
  }

  // ── Build Topbar HTML ────────────────────────────────
  function buildTopbar(pageTitle) {
    const user = AuthGuard.getUser();
    const prefix = getPathPrefix();
    const avatarUrl =
      user?.profile_picture_url || `${prefix}assets/images/default-avatar.png`;

    return `
      <header class="cbsh-topbar">
        <div class="d-flex align-items-center gap-3">
          <button class="sidebar-toggle" id="sidebarToggle" aria-label="Toggle sidebar">
            <i class="bi bi-list"></i>
          </button>
          <h1 class="page-title mb-0">${pageTitle}</h1>
        </div>
        <div class="topbar-actions">
          <button class="topbar-icon-btn" id="themeToggleBtn" aria-label="Toggle theme">
            <i class="bi bi-moon-fill" id="themeIcon"></i>
          </button>
          <div class="dropdown">
            <button class="d-flex align-items-center gap-2 bg-transparent border-0 text-decoration-none dropdown-toggle" type="button" data-bs-toggle="dropdown">
              <img src="${avatarUrl}" alt="avatar" class="user-avatar" onerror="this.src='${prefix}assets/images/default-avatar.png'">
              <span class="d-none d-md-inline text-secondary" style="font-size:0.875rem;">${user?.name || "User"}</span>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="profile.html"><i class="bi bi-person me-2"></i>Profile</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="#" onclick="AuthGuard.logout(); return false;"><i class="bi bi-box-arrow-left me-2"></i>Logout</a></li>
            </ul>
          </div>
        </div>
      </header>`;
  }

  // ── Initialize Page Layout ───────────────────────────
  /**
   * Call on every protected page to build the sidebar + topbar.
   * @param {string} pageTitle - Title shown in the topbar
   * @param {string} role - 'admin', 'teacher', or 'student'
   */
  function initLayout(pageTitle, role) {
    // Build & inject sidebar
    const sidebarContainer = document.getElementById("sidebarContainer");
    if (sidebarContainer) {
      sidebarContainer.innerHTML = buildSidebar(role);
    }

    // Build & inject topbar
    const topbarContainer = document.getElementById("topbarContainer");
    if (topbarContainer) {
      topbarContainer.innerHTML = buildTopbar(pageTitle);
    }

    // Setup sidebar toggle
    setupSidebarToggle();

    // Init theme toggle
    if (typeof ThemeToggle !== "undefined") {
      ThemeToggle.init();
    }

    // Init notification system (bell icon + polling)
    if (typeof Notifications !== "undefined") {
      Notifications.init();
    }

    // Load pending counts for admin
    if (role === "admin") {
      loadPendingUserCount();
    }
  }

  // ── Sidebar Toggle (mobile) ──────────────────────────
  function setupSidebarToggle() {
    const sidebar = document.getElementById("cbshSidebar");
    const overlay = document.getElementById("sidebarOverlay");
    const toggle = document.getElementById("sidebarToggle");

    if (toggle) {
      toggle.addEventListener("click", () => {
        sidebar?.classList.toggle("show");
        overlay?.classList.toggle("show");
      });
    }

    if (overlay) {
      overlay.addEventListener("click", () => {
        sidebar?.classList.remove("show");
        overlay?.classList.remove("show");
      });
    }
  }

  // ── Load Pending User Count (Admin Badge) ────────────
  async function loadPendingUserCount() {
    const res = await Insforge.DB.query("users", {
      filters: { status: "in.(pending,email_verified)" },
      select: "id",
    });
    const count = res.data?.length || 0;
    const badge = document.getElementById("sidebar-badge-pending");
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? "inline-block" : "none";
    }
  }

  // ══════════════════════════════════════════════════════
  //  UTILITY HELPERS
  // ══════════════════════════════════════════════════════

  /** Format date to readable string */
  function formatDate(dateStr, options = {}) {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const defaults = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-IN", { ...defaults, ...options });
  }

  /** Format date to relative time ("2 hours ago") */
  function timeAgo(dateStr) {
    if (!dateStr) return "—";
    const now = Date.now();
    const past = new Date(dateStr).getTime();
    const diff = now - past;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(dateStr);
  }

  /** Format file size to human-readable */
  function formatFileSize(bytes) {
    if (!bytes) return "—";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < units.length - 1) {
      size /= 1024;
      i++;
    }
    return `${size.toFixed(1)} ${units[i]}`;
  }

  /** Show loading overlay */
  function showLoading() {
    let overlay = document.getElementById("loadingOverlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "loadingOverlay";
      overlay.className = "loading-overlay";
      overlay.innerHTML = '<div class="cbsh-spinner"></div>';
      document.body.appendChild(overlay);
    }
    overlay.style.display = "flex";
  }

  /** Hide loading overlay */
  function hideLoading() {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.style.display = "none";
  }

  /** Show success toast using SweetAlert2 */
  function showSuccess(message, title = "Success") {
    Swal.fire({
      icon: "success",
      title,
      text: message,
      timer: 2500,
      showConfirmButton: false,
    });
  }

  /** Show error toast */
  function showError(message, title = "Error") {
    Swal.fire({ icon: "error", title, text: message });
  }

  /** Show confirmation dialog */
  async function confirm(title, text, confirmText = "Yes", icon = "warning") {
    const result = await Swal.fire({
      icon,
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: "Cancel",
    });
    return result.isConfirmed;
  }

  /** Populate a <select> element with subjects */
  function populateSubjects(selectId, includeAll = false) {
    const select = document.getElementById(selectId);
    if (!select) return;
    let html = includeAll
      ? '<option value="">All Subjects</option>'
      : '<option value="">Select Subject</option>';
    SUBJECTS.forEach((s) => {
      html += `<option value="${s}">${s}</option>`;
    });
    select.innerHTML = html;
  }

  /** Populate a <select> element with semesters */
  function populateSemesters(selectId, includeAll = false) {
    const select = document.getElementById(selectId);
    if (!select) return;
    let html = includeAll
      ? '<option value="">All Semesters</option>'
      : '<option value="">Select Semester</option>';
    for (let i = 1; i <= MAX_SEMESTERS; i++) {
      html += `<option value="${i}">Semester ${i}</option>`;
    }
    select.innerHTML = html;
  }

  /** Debounce helper */
  function debounce(func, wait = 300) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /** Sanitize text for safe DOM insertion */
  function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Public API ───────────────────────────────────────
  return {
    initLayout,
    getPathPrefix,
    formatDate,
    timeAgo,
    formatFileSize,
    showLoading,
    hideLoading,
    showSuccess,
    showError,
    confirm,
    populateSubjects,
    populateSemesters,
    debounce,
    escapeHtml,
    NAV_CONFIG,
  };
})();
