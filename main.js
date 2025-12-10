// ===== CONFIG =====
const ADMIN_USER = "rohit-x";
const ADMIN_PASS = "12/07/2008";

// ===== THEME =====
(function(){
  const body = document.body;
  const toggle = document.getElementById('modeToggle');
  const saved = localStorage.getItem('theme') || 'light';
  if(saved === 'dark') body.classList.add('dark');
  if(toggle){
    toggle.checked = (saved==='dark');
    toggle.addEventListener('change', ()=>{
      body.classList.toggle('dark', toggle.checked);
      localStorage.setItem('theme', toggle.checked ? 'dark' : 'light');
    });
  }
})();

// ===== PASSWORD EYE & STRENGTH =====
document.addEventListener('click', (e)=>{
  if(e.target && e.target.id === 'eyeBtn'){
    const inp = document.getElementById('password');
    if(!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
    e.target.textContent = inp.type === 'password' ? '🙈' : '👁';
  }
});
document.addEventListener('input', (e)=>{
  if(e.target && e.target.id === 'password'){
    const v = e.target.value; const msg = document.getElementById('strengthMsg');
    if(!msg) return;
    if(!v) msg.textContent='';
    else if(v.length < 6){ msg.textContent = '❌ Weak password'; msg.style.color='red'; }
    else if(/[A-Z]/.test(v) && /[0-9]/.test(v) && v.length >= 8){ msg.textContent = '✅ Strong password'; msg.style.color='green'; }
    else { msg.textContent = '⚠️ Medium password'; msg.style.color='orange'; }
  }
});

// ===== LOGIN =====
function login(){
  const u = (document.getElementById('username')||{}).value || (document.getElementById('user')||{}).value;
  const p = (document.getElementById('password')||{}).value || (document.getElementById('pass')||{}).value;
  const msg = document.getElementById('loginMsg') || document.getElementById('msg');
  if(u === ADMIN_USER && p === ADMIN_PASS){
    localStorage.setItem('isAdmin','true');
    localStorage.setItem('adminUser', ADMIN_USER);
    // redirect to notes/dashboard
    location.href = 'notes.html';
  } else {
    if(msg) msg.textContent = '❌ Wrong username or password';
  }
}
window.login = login;

// quick demo open (visitor)
function demoOpen(){ location.href='notes.html'; }
window.demoOpen = demoOpen;

// ===== PRESET LEARNING TREE =====
const PRESET = {
  "Class 6": {"Maths":["Numbers","Geometry"],"Science":["Food","Plants"]},
  "Class 9": {"Maths":["Number Systems","Algebra"],"Science":["Matter","Force"]},
  "Class 10": {"Maths":["Real Numbers","Trigonometry"],"Science":["Chemistry Basics","Motion"]},
  "Class 12": {"Mathematics":["Calculus","Trigonometry"],"Physics":["Electrostatics","Optics"]}
};

// Build learning tree on learning.html
function buildLearning(){
  const el = document.getElementById('learningTree');
  if(!el) return;
  el.innerHTML = '';
  Object.keys(PRESET).forEach(cls=>{
    const card = document.createElement('div'); card.className='card';
    card.style.cursor = 'pointer';
    card.innerHTML = `<strong>${cls}</strong><div class="small muted">${Object.keys(PRESET[cls]).length} subjects</div>`;
    card.onclick = ()=> showSubjects(cls);
    el.appendChild(card);
  });
}
function showSubjects(cls){
  const el = document.getElementById('learningTree');
  el.innerHTML = `<h4>${cls}</h4>`;
  const subs = PRESET[cls]||{};
  Object.keys(subs).forEach(s=>{
    const div = document.createElement('div'); div.className='card';
    div.innerHTML = `<strong>${s}</strong><div class="small muted">${subs[s].length} chapters</div>`;
    const list = document.createElement('div');
    list.className = 'notes-list';
    subs[s].forEach(ch=>{
      const r = document.createElement('div'); r.className='note-row';
      r.innerHTML = `<div>${ch} <span class="small muted"> - Coming Soon</span></div><div><button class="card-btn" disabled>View</button></div>`;
      list.appendChild(r);
    });
    el.appendChild(div); el.appendChild(list);
  });
}
window.buildLearning = buildLearning;

// ===== NOTES STORAGE (demo in localStorage) =====
function notesKey(){ return 'roitx_notes_vfinal'; }
function loadNotes(){ return JSON.parse(localStorage.getItem(notesKey()) || '[]'); }
function saveNotes(arr){ localStorage.setItem(notesKey(), JSON.stringify(arr)); }

function renderNotes(){
  const area = document.getElementById('notesArea');
  if(!area) return;
  const notes = loadNotes();
  if(notes.length === 0){ area.innerHTML = '<div class="muted">No notes uploaded yet.</div>'; return; }
  area.innerHTML = '';
  notes.forEach(n=>{
    const row = document.createElement('div'); row.className = 'note-row';
    const canDelete = localStorage.getItem('isAdmin') === 'true';
    row.innerHTML = `<div><strong>${n.name}</strong><div class="small muted">${n.cls} › ${n.subject} › ${n.chapter}</div></div>
      <div><a href="${n.dataURL}" download="${n.filename}" class="card-btn">⬇️</a> ${canDelete ? '<button class="card-btn" onclick="deleteNote(\\''+n.id+'\\')">🗑 Delete</button>' : ''}</div>`;
    area.appendChild(row);
  });
}
window.renderNotes = renderNotes;

// show/hide upload button for admin
function checkAdminUI(){
  const upBtn = document.getElementById('openUploadBtn');
  if(upBtn) upBtn.style.display = (localStorage.getItem('isAdmin') === 'true') ? 'inline-block' : 'none';
}
window.checkAdminUI = checkAdminUI;

// upload modal controls
function openUpload(){
  if(localStorage.getItem('isAdmin') !== 'true'){ alert('Only admin can upload.'); return; }
  document.getElementById('uploadModal').style.display = 'flex';
  const upClass = document.getElementById('upClass'), upSubject = document.getElementById('upSubject'), upChapter = document.getElementById('upChapter');
  upClass.innerHTML=''; upSubject.innerHTML=''; upChapter.innerHTML='';
  Object.keys(PRESET).forEach(c=> upClass.appendChild(optionEl(c)));
  upClass.onchange = ()=> { upSubject.innerHTML=''; Object.keys(PRESET[upClass.value]).forEach(s=> upSubject.appendChild(optionEl(s))); upSubject.onchange(); };
  upClass.onchange();
  upSubject.onchange = ()=> { upChapter.innerHTML = ''; (PRESET[upClass.value][upSubject.value]||[]).forEach(ch=> upChapter.appendChild(optionEl(ch))); };
}
function closeUpload(){ document.getElementById('uploadModal').style.display = 'none'; }
function optionEl(v){ const o = document.createElement('option'); o.value=o.text=v; return o; }

function uploadNote(){
  const f = document.getElementById('fileInput').files[0];
  if(!f){ alert('Choose file'); return; }
  const cls = document.getElementById('upClass').value, subject = document.getElementById('upSubject').value, chapter = document.getElementById('upChapter').value;
  const reader = new FileReader();
  reader.onload = function(e){
    const notes = loadNotes();
    const id = 'n'+Date.now();
    notes.unshift({ id, cls, subject, chapter, name: f.name, filename: f.name, dataURL: e.target.result, uploader: localStorage.getItem('adminUser')||'admin', ts: Date.now() });
    saveNotes(notes); closeUpload(); renderNotes(); alert('Uploaded');
  };
  reader.readAsDataURL(f);
}
window.uploadNote = uploadNote;

function deleteNote(id){
  if(localStorage.getItem('isAdmin') !== 'true'){ alert('Only admin can delete'); return; }
  let notes = loadNotes(); notes = notes.filter(n=> n.id !== id); saveNotes(notes); renderNotes();
}
window.deleteNote = deleteNote;

// ===== ASK AI (stub canned responses) =====
function askAI(){
  const q = (document.getElementById('aiq')||{}).value || '';
  const out = document.getElementById('aiAnswer');
  if(!out) return;
  const s = q.toLowerCase();
  if(!s) { out.innerText = 'Type a question...'; return; }
  if(s.includes('timetable')) out.innerText = 'Try 2 hours focused study + 30 min break; revise nightly.';
  else if(s.includes('how to study')) out.innerText = 'Active recall, spaced repetition, and practice papers help most.';
  else out.innerText = 'Good question — focus on short study sessions and regular revision.';
}
window.askAI = askAI;

// ===== SIMPLE CALCULATOR BUILD (DEGREE/RAD) =====
function buildCalc(){
  const container = document.getElementById('calc-app'); if(!container) return;
  container.innerHTML = '';
  const disp = document.createElement('input'); disp.id='calcDisp'; disp.readOnly=true; disp.style.width='100%'; disp.style.padding='10px'; container.appendChild(disp);
  const keys = ['7','8','9','/','sin','asin','4','5','6','*','cos','acos','1','2','3','-','tan','atan','0','.','%','+','sqrt','^','pi','e','(',')','ln','log','fact','AC','DEL','='];
  const grid = document.createElement('div'); grid.className='calc';
  keys.forEach(k=>{
    const b = document.createElement('button'); b.innerText = k; b.onclick = ()=> calcKey(k); grid.appendChild(b);
  });
  container.appendChild(grid);
  function calcKey(k){
    const deg = document.getElementById('degCheck') ? document.getElementById('degCheck').checked : true;
    if(k==='AC'){ disp.value=''; return; }
    if(k==='DEL'){ disp.value = disp.value.slice(0,-1); return; }
    if(k==='='){ try{ disp.value = evaluate(disp.value, deg); }catch(e){ disp.value='Err' } return; }
    if(k==='pi'){ disp.value += 'PI'; return; }
    if(k==='e'){ disp.value += 'E'; return; }
    if(k==='sqrt'){ disp.value += 'sqrt(' ; return; }
    if(['sin','cos','tan','asin','acos','atan','ln','log','fact'].includes(k)){ disp.value += k+'('; return; }
    if(k==='^'){ disp.value += '**'; return; }
    disp.value += k;
  }
}

function evaluate(expr, deg){
  if(!expr) return '';
  let e = expr.replace(/\s+/g,'');
  e = e.replace(/PI/g,'Math.PI').replace(/E/g,'Math.E');
  e = e.replace(/sqrt\(/g,'Math.sqrt(');
  e = e.replace(/ln\(/g,'Math.log(');
  e = e.replace(/log\(/g,'Math.log10?('); // placeholder
  e = e.replace(/asin\(/g,'Math.asin(').replace(/acos\(/g,'Math.acos(').replace(/atan\(/g,'Math.atan(');
  e = e.replace(/sin\(/g,'Math.sin(').replace(/cos\(/g,'Math.cos(').replace(/tan\(/g,'Math.tan(');
  if(deg){
    e = e.replace(/Math\.sin\(/g,'Math.sin((Math.PI/180)*(');
    e = e.replace(/Math\.cos\(/g,'Math.cos((Math.PI/180)*(');
    e = e.replace(/Math\.tan\(/g,'Math.tan((Math.PI/180)*(');
  }
  e = e.replace(/fact\((\d+)\)/g, function(m,n){ let r=1; for(let i=1;i<=Number(n);i++) r*=i; return r; });
  // safety check
  if(/[^0-9Math.PIa-zA-Z()+\-*/%.,*_\s]/.test(e)) throw 'Invalid';
  return Function('Math', 'return '+e)(Math);
}

// ===== INIT ON PAGE LOAD =====
document.addEventListener('DOMContentLoaded', ()=>{
  // show upload button if admin
  checkAdminUI();
  renderNotes();
  buildLearning();
  buildCalc();
  // wire quick elements
  const loginBtn = document.getElementById('loginBtn'); if(loginBtn) loginBtn.addEventListener('click', login);
  const eye = document.getElementById('eyeBtn'); if(eye) eye.addEventListener('click', ()=>{ const p = document.getElementById('password'); p.type = p.type==='password'?'text':'password'; eye.textContent = p.type==='password' ? '🙈' : '👁'; });
  // open upload if admin and on notes page
  if(location.pathname.endsWith('notes.html')){ checkAdminUI(); }
});
