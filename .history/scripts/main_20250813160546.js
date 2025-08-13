// (function () {
//   const root = document;

//   // Navigate to detail when clicking anywhere on the left grid
//   const clickable = root.querySelector('.clickable-area');
//   if (clickable) {
//     clickable.addEventListener('click', function (ev) {
//       const target = ev.target;
//       if (target && (target.closest('[data-dismiss]') || target.closest('.switch') || target.closest('.status-panel') || target.closest('.alerts'))) return;
//       window.location.href = '../pages/detailpage.html';
//     });
//   }

//   // Close alert buttons
//   root.querySelectorAll('[data-dismiss]').forEach((btn) => {
//     btn.addEventListener('click', (e) => {
//       e.stopPropagation();
//       const alert = btn.closest('.alert');
//       if (alert) alert.remove();
//     });
//   });

//   // Example: programmatic update of alert colors (kept for future use)
//   function setAlertVariant(id, variant) {
//     const el = root.querySelector('[data-alert-id="' + id + '"]');
//     if (!el) return;
//     el.setAttribute('data-variant', variant);
//     const rect = el.querySelector('g > rect');
//     if (rect) rect.setAttribute('fill', variant === 'danger' ? '#FF2828' : '#EA800E');
//   }

//   // Data dummy hardcoded
//   const data = {
//     inorganic_recyclable: { level: 20, volume: 45 },
//     inorganic_non_recyclable: { level: 30, volume: 134 },
//     organic: { level: 20, volume: 45 }
//   };

//   // Update function per spec
//   function updateFill(binId, percent, volumeLiters) {
//     const rect = root.getElementById('cupFill-' + binId);
//     if (!rect) return;
//     // Using actual bucket.svg coordinates: baseY aligns with ~175 (bottom of cup path), contentHeight approximated to inner cup height
//     const contentHeight = 160; // adjustable based on real cup inner height
//     const baseY = 175;
//     const p = Math.max(0, Math.min(100, percent));
//     const newHeight = (p / 100) * contentHeight;
//     const newY = baseY - newHeight;
//     rect.setAttribute('height', String(newHeight));
//     rect.setAttribute('y', String(newY));
//     rect.setAttribute('fill', p >= 70 ? '#F04438' : '#3DDC97');

//     const item = root.querySelector('.bucket-item[data-id="' + binId + '"]');
//     if (!item) return;
//     const percentEl = item.querySelector('[data-percent]');
//     const literEl = item.querySelector('[data-liter]');
//     if (percentEl) {
//       percentEl.textContent = p + '%';
//       percentEl.classList.toggle('danger', p >= 70);
//     }
//     if (literEl) literEl.textContent = volumeLiters + ' Liter';
//   }

//   // Initialize
//   Object.entries(data).forEach(([id, val]) => {
//     updateFill(id, val.level, val.volume);
//   });
// })();


// scripts/main.js  (ES module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* === Firebase init === */
const firebaseConfig = {
  apiKey: "AIzaSyB58ZCJRJnjCrRyJrET4fN8pkwtj4ihXXU",
  authDomain: "nusabin-c9a6a.firebaseapp.com",
  projectId: "nusabin-c9a6a",
  storageBucket: "nusabin-c9a6a.firebasestorage.app",
  messagingSenderId: "898701407820",
  appId: "1:898701407820:web:0a81b2b2f887445fe1a6e9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* === DOM code kamu (dipertahankan) === */
const root = document;

// Klik kiri navigasi
const clickable = root.querySelector(".clickable-area");
if (clickable) {
  clickable.addEventListener("click", function (ev) {
    const t = ev.target;
    if (t && (t.closest("[data-dismiss]") || t.closest(".switch") || t.closest(".status-panel") || t.closest(".alerts"))) return;
    window.location.href = "../pages/detailpage.html";
  });
}

// Close alert
root.querySelectorAll("[data-dismiss]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const alert = btn.closest(".alert");
    if (alert) alert.remove();
  });
});

// Helper warna alert (opsional)
function setAlertVariant(id, variant) {
  const el = root.querySelector('[data-alert-id="'+id+'"]');
  if (!el) return;
  el.setAttribute("data-variant", variant);
  const rect = el.querySelector("g > rect");
  if (rect) rect.setAttribute("fill", variant === "danger" ? "#FF2828" : "#EA800E");
}

/* === Update tampilan cup fill === */
function updateFill(binId, percent, volumeLiters) {
  const rect = root.getElementById("cupFill-" + binId);
  if (!rect) return;

  const contentHeight = 160; // tinggi inner cup
  const baseY = 175;         // dasar cup (y)
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  const newHeight = (p / 100) * contentHeight;
  const newY = baseY - newHeight;

  rect.setAttribute("height", String(newHeight));
  rect.setAttribute("y", String(newY));
  rect.setAttribute("fill", p >= 70 ? "#0DC798" : "#3DDC97");

  const item = root.querySelector('.bucket-item[data-id="'+binId+'"]');
  if (!item) return;
  const percentEl = item.querySelector("[data-percent]");
  const literEl = item.querySelector("[data-liter]");
  if (percentEl) { percentEl.textContent = p + "%"; percentEl.classList.toggle("danger", p >= 70); }
  if (literEl) { literEl.textContent = (Number(volumeLiters) || 0) + " Liter"; }
}

/* === Ambil data Firestore (realtime) === */
const BIN_IDS = ["inorganic_non_recyclable", "inorganic_recyclable", "organic"];

BIN_IDS.forEach((id) => {
  const ref = doc(db, "bins", id);

  // realtime stream
  onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const { level = 0, volume = 0 } = snap.data();
      updateFill(id, level, volume);
    } else {
      updateFill(id, 0, 0);
    }
  });

  // one-shot fetch (agar UI kebaca cepat saat awal)
  getDoc(ref).then((snap) => {
    if (snap.exists()) {
      const { level = 0, volume = 0 } = snap.data();
      updateFill(id, level, volume);
    }
  });
});


/* === Idle redirect to lockscreen (3 minutes) === */
const IDLE_LIMIT_MS = 3 * 60 * 1000; // 180000 ms
let idleTimer = null;

function resetIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    window.location.href = "../pages/lockscreen.html";
  }, IDLE_LIMIT_MS);
}

// Reset timer on common user interactions
["load", "mousemove", "keydown", "touchstart", "click", "scroll", "visibilitychange"].forEach((evt) => {
  window.addEventListener(evt, resetIdleTimer, { passive: true });
});

// Kick off the initial timer
resetIdleTimer();


