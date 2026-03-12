/**
 * ═══════════════════════════════════════════════════════════
 *  CBSH Digital Library — Notification System
 *  Toast notifications and real-time notification bell.
 * ═══════════════════════════════════════════════════════════
 */

const Notifications = (() => {

  let unreadCount = 0;
  let pollInterval = null;

  // ── Initialize notification bell in topbar ──────────
  function init() {
    const user = AuthGuard.getUser();
    if (!user) return;

    // Add bell icon to topbar
    const topbar = document.querySelector('.cbsh-topbar .d-flex.align-items-center.gap-3');
    if (topbar) {
      const bellHtml = `
        <div id="notifBellWrapper">
          <button class="btn btn-sm btn-secondary position-relative" id="notifBellBtn" title="Notifications" onclick="Notifications.toggle()" style="border-radius:10px;">
            <i class="bi bi-bell-fill"></i>
            <span class="badge bg-danger rounded-pill position-absolute" id="notifBadge" style="top:-4px;right:-4px;font-size:0.625rem;display:none;">0</span>
          </button>
        </div>`;

      // Append so bell sits on the RIGHT of topbar actions
      topbar.insertAdjacentHTML('beforeend', bellHtml);

      // Build the dropdown as a BODY-level fixed element so it always renders
      // above the sidebar regardless of stacking contexts
      const dd = document.createElement('div');
      dd.id = 'notifDropdown';
      dd.style.cssText = 'display:none;position:fixed;width:360px;max-height:440px;overflow-y:auto;background:var(--bg-card);border:1px solid var(--border-card);border-radius:16px;box-shadow:0 12px 48px rgba(0,0,0,0.45);z-index:9990;';
      dd.innerHTML = `
        <div class="d-flex justify-content-between align-items-center p-3 border-bottom" style="border-color:var(--border-divider)!important;">
          <strong style="font-size:0.9375rem;">Notifications</strong>
          <button class="btn btn-sm btn-secondary" onclick="Notifications.markAllRead()" style="font-size:0.75rem;">Mark all read</button>
        </div>
        <div id="notifList"><div class="p-3 text-center" style="color:var(--text-disabled);font-size:0.875rem;">Loading...</div></div>
      `;
      document.body.appendChild(dd);
    }

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      const wrapper = document.getElementById('notifBellWrapper');
      if (wrapper && !wrapper.contains(e.target)) {
        document.getElementById('notifDropdown').style.display = 'none';
      }
    });

    // Initial load
    loadNotifications();

    // Poll every 30s
    pollInterval = setInterval(loadNotifications, 30000);
  }

  // ── Load notifications from DB ──────────────────────
  async function loadNotifications() {
    const user = AuthGuard.getUser();
    if (!user) return;

    const res = await Insforge.DB.query('notifications', {
      filters: { user_id: `eq.${user.id}` },
      order: 'created_at.desc',
      limit: 20
    });

    const items = res.data || [];
    unreadCount = items.filter(n => !n.read).length;
    updateBadge();
    renderNotifications(items);
  }

  // ── Update badge count ──────────────────────────────
  function updateBadge() {
    const badge = document.getElementById('notifBadge');
    if (!badge) return;
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  // ── Render notification list ────────────────────────
  function renderNotifications(items) {
    const list = document.getElementById('notifList');
    if (!list) return;

    if (items.length === 0) {
      list.innerHTML = '<div class="p-4 text-center" style="color:var(--text-disabled);"><i class="bi bi-bell" style="font-size:2rem;"></i><p class="mt-2" style="font-size:0.875rem;">No notifications</p></div>';
      return;
    }

    const iconMap = {
      info: { icon: 'bi-info-circle-fill', color: 'var(--accent-steel-blue)' },
      success: { icon: 'bi-check-circle-fill', color: 'var(--success)' },
      warning: { icon: 'bi-exclamation-triangle-fill', color: 'var(--warning)' },
      error: { icon: 'bi-x-circle-fill', color: 'var(--danger)' },
      default: { icon: 'bi-bell-fill', color: 'var(--accent-amber)' }
    };

    list.innerHTML = items.map(n => {
      const ic = iconMap[n.type] || iconMap.default;
      return `<div class="d-flex gap-2 p-3 border-bottom ${n.read ? '' : 'bg-opacity-10'}" style="border-color:var(--border-divider)!important;${n.read ? '' : 'background:rgba(212,146,42,0.04);'}cursor:pointer;" onclick="Notifications.markRead('${n.id}')">
        <i class="bi ${ic.icon}" style="color:${ic.color};font-size:1.125rem;flex-shrink:0;margin-top:2px;"></i>
        <div class="flex-grow-1">
          <div style="font-size:0.8125rem;${n.read ? 'color:var(--text-secondary);' : 'color:var(--text-primary);font-weight:500;'}">${App.escapeHtml(n.message)}</div>
          <span style="font-size:0.6875rem;color:var(--text-disabled);">${App.timeAgo(n.created_at)}</span>
        </div>
        ${n.read ? '' : '<span style="width:8px;height:8px;background:var(--accent-amber);border-radius:50%;flex-shrink:0;margin-top:6px;"></span>'}
      </div>`;
    }).join('');
  }

  // ── Toggle dropdown — anchored via fixed position to bell button ──
  function toggle() {
    const dd = document.getElementById('notifDropdown');
    const btn = document.getElementById('notifBellBtn');
    if (!dd || !btn) return;

    if (dd.style.display !== 'none') {
      dd.style.display = 'none';
      return;
    }

    // Anchor right edge of dropdown to right edge of bell button
    const rect = btn.getBoundingClientRect();
    const dropW = 360;
    let left = rect.right - dropW;
    if (left < 8) left = 8; // clamp inside viewport
    dd.style.top = (rect.bottom + 8) + 'px';
    dd.style.left = left + 'px';
    dd.style.display = '';
  }

  // ── Mark single notification as read ────────────────
  async function markRead(id) {
    await Insforge.DB.update('notifications', { id: `eq.${id}` }, { read: true });
    loadNotifications();
  }

  // ── Mark all as read ────────────────────────────────
  async function markAllRead() {
    const user = AuthGuard.getUser();
    if (!user) return;
    await Insforge.DB.update('notifications', { user_id: `eq.${user.id}`, read: 'eq.false' }, { read: true });
    loadNotifications();
  }

  // ── Create a notification (for use by other modules) ──
  async function create(userId, message, type = 'info') {
    return await Insforge.DB.insert('notifications', {
      user_id: userId,
      message,
      type,
      read: false
    });
  }

  // ── Cleanup ─────────────────────────────────────────
  function destroy() {
    if (pollInterval) clearInterval(pollInterval);
  }

  return {
    init,
    toggle,
    markRead,
    markAllRead,
    create,
    loadNotifications,
    destroy
  };
})();
