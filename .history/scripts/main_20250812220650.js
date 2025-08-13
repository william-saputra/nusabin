(function () {
  const root = document;

  // Navigate to detail when clicking anywhere on the left grid
  const clickable = root.querySelector('.clickable-area');
  if (clickable) {
    clickable.addEventListener('click', function (ev) {
      // ignore clicks from dedicated controls within alerts and switches
      const target = ev.target;
      if (target && (target.closest('[data-dismiss]') || target.closest('.switch') || target.closest('.status-panel'))) return;
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

  // Initialize bucket fill based on data-percent
  root.querySelectorAll('.bucket-item').forEach((item) => {
    const percent = Number(item.getAttribute('data-percent') || '0');
    const bucket = item.querySelector('.bucket');
    const water = item.querySelector('.bucket-water');
    if (!bucket || !water) return;

    // Compute fill height mapping: 0% => 0px, 100% => ~88px (fits inside SVG frame paddings)
    const maxFill = 88; // tuned visually to stay inside the svg inner area
    const clamped = Math.max(0, Math.min(100, percent));
    const height = Math.round((clamped / 100) * maxFill);
    water.style.height = height + 'px';

    // Color rule: >= 70% becomes red
    if (clamped >= 70) {
      bucket.classList.add('red');
    } else if (clamped >= 45) {
      bucket.classList.add('yellow');
    }

    // Update metrics text from dataset so the HTML can be dummy and JS authoritative
    const percentEl = item.querySelector('.percent');
    if (percentEl) percentEl.textContent = clamped + '%';
  });
})();


