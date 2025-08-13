(function () {
  const toggle = document.getElementById('dark-toggle');
  if (!toggle) return;

  const apply = (isDark) => {
    document.body.classList.toggle('dark', isDark);
    try { localStorage.setItem('theme-dark', isDark ? '1' : '0'); } catch (_) {}
  };

  // Restore previous preference
  let stored = null;
  try { stored = localStorage.getItem('theme-dark'); } catch (_) {}
  apply(stored === '1');
  toggle.checked = stored === '1';

  toggle.addEventListener('change', () => apply(toggle.checked));
})();


