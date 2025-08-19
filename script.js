// ===== script.js =====

// Subject chapters
const physics = [
  "Electric Charges & Fields", "Electrostatic Potential & Capacitance", "Current Electricity",
  "Moving Charges & Magnetism", "EM Induction & AC", "EM Waves", "Ray Optics",
  "Wave Optics", "Dual Nature", "Atoms & Nuclei", "Semiconductors"
];

const chemistry = [
  "Solutions", "Electrochemistry", "Chemical Kinetics", "d-Block Elements",
  "Coordination Compounds", "Haloalkanes & Haloarenes", "Alcohols, Phenols & Ethers",
  "Aldehydes & Ketones", "Amines", "Biomolecules"
];

const maths = [
  "Relations & Functions", "Matrices & Determinants", "Continuity & Differentiability",
  "Applications of Derivatives", "Integrals & Applications", "Differential Equations",
  "Vector Algebra", "3D Geometry", "Linear Programming"
];

const SUBJECT_MAP = { physics, chemistry, maths };

// Motivational Quotes
const quotes = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "Don’t watch the clock; do what it does. Keep going.",
  "Great things never come from comfort zones.",
  "Push yourself, because no one else is going to do it for you.",
  "The harder you work for something, the greater you’ll feel when you achieve it.",
  "Dream bigger. Do bigger.",
  "Don’t stop when you’re tired. Stop when you’re done."
];

function showRandomQuote(){
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("quote").textContent = q;
}

// LocalStorage Keys
const key = (subject, idx) => `pcm:${subject}:${idx}`;

function renderTracker(subject, elId){
  const list = SUBJECT_MAP[subject];
  const root = document.getElementById(elId);
  root.innerHTML = "";
  list.forEach((name, i) => {
    const id = key(subject, i);
    const checked = localStorage.getItem(id) === '1';
    const row = document.createElement('div');
    row.className = 'tracker-item';

    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.checked = checked; cb.setAttribute('data-k', id);
    cb.addEventListener('change', () => {
      localStorage.setItem(id, cb.checked ? '1' : '0');
      pill.textContent = cb.checked ? 'Done' : 'Pending';
      updateProgressBars();
    });

    const label = document.createElement('div');
    label.textContent = name;

    const pill = document.createElement('div');
    pill.className = 'pill';
    pill.textContent = checked ? 'Done' : 'Pending';

    row.append(cb, label, pill);
    root.appendChild(row);
  });
}

function progressFor(subject){
  const list = SUBJECT_MAP[subject];
  const total = list.length;
  const done = list.filter((_, i) => localStorage.getItem(key(subject, i)) === '1').length;
  return { total, done, pct: total ? Math.round(done*100/total) : 0 };
}

function updateProgressBars(){
  const P = progressFor('physics');
  const C = progressFor('chemistry');
  const M = progressFor('maths');
  document.getElementById('prog-phy').style.width = P.pct + '%';
  document.getElementById('prog-chem').style.width = C.pct + '%';
  document.getElementById('prog-math').style.width = M.pct + '%';
  document.getElementById('count-phy').textContent = P.done; document.getElementById('total-phy').textContent = P.total;
  document.getElementById('count-chem').textContent = C.done; document.getElementById('total-chem').textContent = C.total;
  document.getElementById('count-math').textContent = M.done; document.getElementById('total-math').textContent = M.total;
}

function exportProgress(){
  const data = {};
  for(const s of Object.keys(SUBJECT_MAP)){
    data[s] = SUBJECT_MAP[s].map((_, i) => localStorage.getItem(key(s, i)) === '1');
  }
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'pcm-progress.json'; a.click();
  URL.revokeObjectURL(url);
}

function importProgress(file){
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const json = JSON.parse(reader.result);
      const d = json.data || {};
      for(const s of Object.keys(SUBJECT_MAP)){
        const arr = d[s] || [];
        arr.forEach((v, i) => localStorage.setItem(key(s, i), v ? '1' : '0'));
      }
      renderAll();
      alert('Progress imported successfully.');
    } catch(e){ alert('Invalid file.'); }
  };
  reader.readAsText(file);
}

function resetProgress(){
  if(!confirm('Clear all saved progress?')) return;
  Object.keys(SUBJECT_MAP).forEach(s => SUBJECT_MAP[s].forEach((_, i) => localStorage.removeItem(key(s, i))));
  renderAll();
}

function renderAll(){
  renderTracker('physics', 'tracker-physics');
  renderTracker('chemistry', 'tracker-chem');
  renderTracker('maths', 'tracker-math');
  updateProgressBars();
  showRandomQuote();
}

// Event wiring
document.getElementById('btn-export').addEventListener('click', exportProgress);
document.getElementById('import-file').addEventListener('change', (e) => e.target.files[0] && importProgress(e.target.files[0]));
document.getElementById('btn-reset').addEventListener('click', resetProgress);
document.getElementById('btn-logout').addEventListener('click', () => {
  // Clear login status
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('username');
  
  // Redirect to login page
  window.location.href = 'login.html';
});

// Init
renderAll();
