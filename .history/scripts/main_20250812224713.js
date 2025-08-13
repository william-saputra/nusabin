(function () {
  const root = document;

  // Navigate to detail when clicking anywhere on the left grid
  const clickable = root.querySelector('.clickable-area');
  if (clickable) {
    clickable.addEventListener('click', function (ev) {
      const target = ev.target;
      if (target && (target.closest('[data-dismiss]') || target.closest('.switch') || target.closest('.status-panel') || target.closest('.alerts'))) return;
      window.location.href = '../pages/detail.html';
    });
  }

  // Close alert buttons
  root.querySelectorAll('[data-dismiss]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const alert = btn.closest('.alert');
      if (alert) alert.remove();
    });
  });

  // Data dummy hardcoded
  const data = {
    inorganic_recyclable: { level: 20, volume: 45 },
    inorganic_non_recyclable: { level: 70, volume: 134 },
    organic: { level: 20, volume: 45 }
  };

  // Update function per spec
  function updateFill(binId, percent, volumeLiters) {
    const rect = root.getElementById('cupFill-' + binId);
    if (!rect) return;
    const contentHeight = 160;
    const baseY = 180;
    const p = Math.max(0, Math.min(100, percent));
    const newHeight = (p / 100) * contentHeight;
    const newY = baseY - newHeight;
    rect.setAttribute('height', String(newHeight));
    rect.setAttribute('y', String(newY));
    rect.setAttribute('fill', p >= 70 ? '#F04438' : '#3DDC97');

    const item = root.querySelector('.bucket-item[data-id="' + binId + '"]');
    if (!item) return;
    const percentEl = item.querySelector('[data-percent]');
    const literEl = item.querySelector('[data-liter]');
    if (percentEl) {
      percentEl.textContent = p + '%';
      percentEl.classList.toggle('danger', p >= 70);
    }
    if (literEl) literEl.textContent = volumeLiters + ' Liter';
  }

  // Initialize
  Object.entries(data).forEach(([id, val]) => {
    updateFill(id, val.level, val.volume);
  });
})();


