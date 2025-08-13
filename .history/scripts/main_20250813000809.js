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

  // Example: programmatic update of alert colors (kept for future use)
  function setAlertVariant(id, variant) {
    const el = root.querySelector('[data-alert-id="' + id + '"]');
    if (!el) return;
    el.setAttribute('data-variant', variant);
    const rect = el.querySelector('g > rect');
    if (rect) rect.setAttribute('fill', variant === 'danger' ? '#FF2828' : '#EA800E');
  }

  // Data dummy hardcoded
  const data = {
    inorganic_recyclable: { level: 20, volume: 45 },
    inorganic_non_recyclable: { level: 30, volume: 134 },
    organic: { level: 20, volume: 45 }
  };

  // Update function per spec
  function updateFill(binId, percent, volumeLiters) {
    const rect = root.getElementById('cupFill-' + binId);
    if (!rect) return;
    // Using actual bucket.svg coordinates: baseY aligns with ~175 (bottom of cup path), contentHeight approximated to inner cup height
    const contentHeight = 160; // adjustable based on real cup inner height
    const baseY = 175;
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


