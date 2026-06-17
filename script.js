// DATA STORE
const DB = {
  get: (k) => JSON.parse(localStorage.getItem(k) || 'null'),
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

// Init default data
if (!DB.get('students')) {
  DB.set('students', [
    { id: '240011001', name: 'Varsha Gupta', course: 'Diploma CS', sem: '4th', erp: '240011001010068', mobile: '9876543210', email: 'varsha@srmu.in', pass: 'student123', cgpa: '9.51',
      attendance: { 'Mathematics': {present:38, total:42}, 'Physics': {present:35, total:42}, 'C Programming': {present:40, total:42}, 'DBMS': {present:37, total:42}, 'OOP with C++': {present:41, total:42}, 'Computer Networks': {present:36, total:42} },
      marks: [{sub:'Mathematics',mid:42,end:78,total:120},{sub:'Physics',mid:38,end:72,total:110},{sub:'C Programming',mid:45,end:85,total:130},{sub:'DBMS',mid:40,end:76,total:116},{sub:'OOP with C++',mid:47,end:88,total:135}]
    }
  ]);
}

let currentRole = 'student';
let currentUser = null;
let editIdx = -1;

//  ROLE SWITCH 
function switchRole(role) {
  currentRole = role;
  document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('idLabel').textContent = role === 'admin' ? 'Admin ID' : 'Student ERP ID';
  document.getElementById('loginId').placeholder = role === 'admin' ? 'Enter Admin ID' : 'Enter ERP ID';
}

//  LOGIN 
function doLogin() {
  const id = document.getElementById('loginId').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  const err = document.getElementById('loginError');
  err.style.display = 'none';

  if (currentRole === 'admin') {
    if (id === 'admin' && pass === 'admin123') {
      currentUser = { role: 'admin', name: 'Admin' };
      showApp();
    } else {
      err.style.display = 'block';
    }
    return;
  }

  // Student login
  const students = DB.get('students');
  const student = students.find(s => (s.id === id || s.erp === id) && s.pass === pass);
  if (student) {
    currentUser = { role: 'student', ...student };
    showApp();
  } else {
    err.style.display = 'block';
  }
}

//  SHOW APP 
function showApp() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('app').style.display = 'block';

  const name = currentUser.name || 'Admin';
  document.getElementById('sidebarName').textContent = name.split(' ')[0];
  document.getElementById('sidebarRole').textContent = currentUser.role === 'admin' ? 'Administrator' : 'Student';
  document.getElementById('sidebarAva').textContent = name[0].toUpperCase();

  buildNav();
  navigate('dashboard');
}

//  NAV 
function buildNav() {
  const studentNav = [
    { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
    { id: 'profile', icon: '👤', label: 'My Profile' },
    { id: 'attendance', icon: '📅', label: 'Attendance' },
    { id: 'marks', icon: '📊', label: 'Marks / Grades' },
  ];
  const adminNav = [
    { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
    { id: 'students', icon: '👥', label: 'All Students' },
    { id: 'attendance', icon: '📅', label: 'Attendance' },
    { id: 'marks', icon: '📊', label: 'Marks' },
  ];

  const nav = currentUser.role === 'admin' ? adminNav : studentNav;
  document.getElementById('navLinks').innerHTML = nav.map(n =>
    `<div class="nav-item" id="nav-${n.id}" onclick="navigate('${n.id}')">
       <span class="nav-icon">${n.icon}</span> ${n.label}
     </div>`
  ).join('');
}

function navigate(page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById('nav-' + page);
  if (el) el.classList.add('active');

  if (currentUser.role === 'admin') renderAdmin(page);
  else renderStudent(page);
}


//  STUDENT VIEWS

function renderStudent(page) {
  const s = currentUser;
  const mc = document.getElementById('mainContent');

  if (page === 'dashboard') {
    const totalAtt = Object.values(s.attendance || {});
    const avgAtt = totalAtt.length
      ? Math.round(totalAtt.reduce((a, b) => a + (b.present/b.total*100), 0) / totalAtt.length)
      : 0;
    const avgMarks = s.marks ? Math.round(s.marks.reduce((a, m) => a + (m.end/(m.total-50)*100), 0) / s.marks.length) : 0;

    mc.innerHTML = `
      <div class="page-header">
        <h2>Welcome back, ${s.name.split(' ')[0]} 👋</h2>
        <p>Here's your academic overview for ${s.course} — ${s.sem} Semester</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="label">ERP ID</div>
          <div class="value" style="font-size:18px;margin-top:10px">${s.erp || s.id}</div>
          <span class="badge badge-blue">Student ID</span>
        </div>
        <div class="stat-card">
          <div class="label">Avg Attendance</div>
          <div class="value" style="color:${avgAtt>=75?'#22c55e':'#ef4444'}">${avgAtt}%</div>
          <span class="badge ${avgAtt>=75?'badge-green':'badge-yellow'}">${avgAtt>=75?'Good':'Low — Attend more classes'}</span>
        </div>
        <div class="stat-card">
          <div class="label">CGPA</div>
          <div class="value" style="color:#a78bfa">${s.cgpa || '—'}</div>
          <span class="badge badge-blue">This Semester</span>
        </div>
        <div class="stat-card">
          <div class="label">Course</div>
          <div class="value" style="font-size:16px;margin-top:10px">${s.course}</div>
          <span class="badge badge-yellow">${s.sem} Semester</span>
        </div>
      </div>

      <div class="section-title">📅 Attendance by Subject</div>
      <div class="profile-card">
        ${Object.entries(s.attendance || {}).map(([sub, d]) => {
          const pct = Math.round(d.present/d.total*100);
          const color = pct>=75?'#22c55e':pct>=60?'#f59e0b':'#ef4444';
          return `<div class="subject-row">
            <div>
              <div style="font-weight:600;font-size:14px">${sub}</div>
              <div style="color:var(--muted);font-size:12px">${d.present}/${d.total} classes</div>
            </div>
            <div style="text-align:right;min-width:140px">
              <div style="color:${color};font-weight:700;font-size:14px">${pct}%</div>
              <div class="bar" style="width:120px;margin-top:6px"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
            </div>
          </div>`;
        }).join('')}
      </div>`;
  }

  else if (page === 'profile') {
    mc.innerHTML = `
      <div class="page-header"><h2>My Profile</h2><p>Your personal & academic details</p></div>
      <div class="profile-card">
        <div class="profile-top">
          <div class="profile-avatar">${s.name[0]}</div>
          <div class="profile-info">
            <h3>${s.name}</h3>
            <p>${s.course} — ${s.sem} Semester</p>
          </div>
        </div>
        <div class="detail-grid">
          <div class="detail-item"><label>ERP ID</label><p>${s.erp || s.id}</p></div>
          <div class="detail-item"><label>Roll Number</label><p>${s.id}</p></div>
          <div class="detail-item"><label>Course</label><p>${s.course}</p></div>
          <div class="detail-item"><label>Semester</label><p>${s.sem}</p></div>
          <div class="detail-item"><label>Mobile</label><p>${s.mobile || '—'}</p></div>
          <div class="detail-item"><label>Email</label><p>${s.email || '—'}</p></div>
          <div class="detail-item"><label>CGPA</label><p>${s.cgpa || '—'}</p></div>
          <div class="detail-item"><label>University</label><p>SRMU, Lucknow</p></div>
        </div>
      </div>`;
  }

  else if (page === 'attendance') {
    mc.innerHTML = `
      <div class="page-header"><h2>My Attendance</h2><p>Subject-wise attendance tracker</p></div>
      <div class="table-card">
        <table>
          <thead><tr><th>Subject</th><th>Present</th><th>Total</th><th>Percentage</th><th>Status</th></tr></thead>
          <tbody>
            ${Object.entries(s.attendance || {}).map(([sub, d]) => {
              const pct = Math.round(d.present/d.total*100);
              const cls = pct>=75?'badge-green':pct>=60?'badge-yellow':'badge-yellow';
              const status = pct>=75?'✅ Good':pct>=60?'⚠️ Low':'❌ Shortage';
              return `<tr><td>${sub}</td><td>${d.present}</td><td>${d.total}</td>
                <td><b style="color:${pct>=75?'#22c55e':pct>=60?'#f59e0b':'#ef4444'}">${pct}%</b></td>
                <td><span class="chip ${cls}">${status}</span></td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  }

  else if (page === 'marks') {
    mc.innerHTML = `
      <div class="page-header"><h2>Marks & Grades</h2><p>Subject-wise internal and final marks</p></div>
      <div class="table-card">
        <table>
          <thead><tr><th>Subject</th><th>Mid Term</th><th>End Term</th><th>Total</th><th>Grade</th></tr></thead>
          <tbody>
            ${(s.marks || []).map(m => {
              const pct = Math.round(m.end/(m.total-50)*100);
              const grade = pct>=90?'A+':pct>=80?'A':pct>=70?'B+':pct>=60?'B':'C';
              const color = pct>=80?'#22c55e':pct>=60?'#a78bfa':'#f59e0b';
              return `<tr><td>${m.sub}</td><td>${m.mid}</td><td>${m.end}</td><td>${m.total}</td>
                <td><span class="chip" style="background:${color}22;color:${color}">${grade}</span></td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  }
}

// ═══════════════════════════════════════
//  ADMIN VIEWS
// ═══════════════════════════════════════
function renderAdmin(page) {
  const mc = document.getElementById('mainContent');
  const students = DB.get('students');

  if (page === 'dashboard') {
    mc.innerHTML = `
      <div class="page-header"><h2>Admin Dashboard 🛠️</h2><p>Overview of all students</p></div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="label">Total Students</div>
          <div class="value">${students.length}</div>
          <span class="badge badge-blue">Enrolled</span>
        </div>
        <div class="stat-card">
          <div class="label">Avg Attendance</div>
          <div class="value">${Math.round(students.reduce((a,s)=>{
            const vals=Object.values(s.attendance||{});
            return a+(vals.length?vals.reduce((x,v)=>x+v.present/v.total*100,0)/vals.length:0);
          },0)/students.length)}%</div>
          <span class="badge badge-green">Overall</span>
        </div>
        <div class="stat-card">
          <div class="label">Courses</div>
          <div class="value">${[...new Set(students.map(s=>s.course))].length}</div>
          <span class="badge badge-yellow">Active</span>
        </div>
      </div>

      <div class="section-title">Recent Students</div>
      <div class="table-card">
        <table>
          <thead><tr><th>Name</th><th>ERP ID</th><th>Course</th><th>Semester</th><th>Avg Att.</th></tr></thead>
          <tbody>
            ${students.slice(-5).map(s=>{
              const vals=Object.values(s.attendance||{});
              const avg=vals.length?Math.round(vals.reduce((x,v)=>x+v.present/v.total*100,0)/vals.length):0;
              return `<tr><td><b>${s.name}</b></td><td>${s.erp||s.id}</td><td>${s.course}</td><td>${s.sem}</td>
                <td style="color:${avg>=75?'#22c55e':'#f59e0b'}">${avg}%</td></tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  }

  else if (page === 'students') {
    mc.innerHTML = `
      <div class="page-header">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">
          <div><h2>All Students</h2><p>Manage student records</p></div>
          <div style="display:flex;gap:10px;align-items:center">
            <input class="search-input" placeholder="🔍  Search student..." oninput="filterStudents(this.value)" id="searchBox"/>
            <button class="btn btn-primary" onclick="openAddModal()">+ Add Student</button>
          </div>
        </div>
      </div>
      <div class="table-card">
        <table>
          <thead><tr><th>Name</th><th>ERP ID</th><th>Course</th><th>Sem</th><th>Mobile</th><th>Actions</th></tr></thead>
          <tbody id="studentTable">
            ${renderStudentRows(students)}
          </tbody>
        </table>
      </div>`;
  }

  else if (page === 'attendance') {
    mc.innerHTML = `
      <div class="page-header"><h2>Attendance Management</h2><p>Update student attendance</p></div>
      ${students.map((s, si) => `
        <div class="profile-card" style="margin-bottom:20px">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
            <div class="user-avatar" style="width:44px;height:44px;font-size:18px">${s.name[0]}</div>
            <div><b>${s.name}</b><div style="color:var(--muted);font-size:12px">${s.erp||s.id} — ${s.course}</div></div>
          </div>
          ${Object.entries(s.attendance||{}).map(([sub, d]) => {
            const pct=Math.round(d.present/d.total*100);
            return `<div class="subject-row">
              <div><div style="font-weight:600;font-size:14px">${sub}</div>
                <div style="color:var(--muted);font-size:12px">${d.present}/${d.total} — ${pct}%</div></div>
              <div class="att-controls">
                <button class="btn btn-sm btn-green" onclick="markAtt(${si},'${sub}',1)">✓ Present</button>
                <button class="btn btn-sm btn-danger" onclick="markAtt(${si},'${sub}',0)">✗ Absent</button>
              </div>
            </div>`;
          }).join('')}
        </div>`).join('')}`;
  }

  else if (page === 'marks') {
    mc.innerHTML = `
      <div class="page-header"><h2>Marks Management</h2><p>View all student marks</p></div>
      ${students.map(s => `
        <div class="profile-card" style="margin-bottom:20px">
          <div style="margin-bottom:14px"><b>${s.name}</b> <span style="color:var(--muted);font-size:13px">— ${s.course} ${s.sem} Sem</span></div>
          <table>
            <thead><tr><th>Subject</th><th>Mid</th><th>End</th><th>Total</th></tr></thead>
            <tbody>
              ${(s.marks||[]).map(m=>`<tr><td>${m.sub}</td><td>${m.mid}</td><td>${m.end}</td><td>${m.total}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>`).join('')}`;
  }
}

function renderStudentRows(list) {
  return list.map((s, i) => `
    <tr>
      <td><b>${s.name}</b></td>
      <td>${s.erp||s.id}</td>
      <td>${s.course}</td>
      <td>${s.sem}</td>
      <td>${s.mobile||'—'}</td>
      <td style="display:flex;gap:8px">
        <button class="btn btn-sm btn-ghost" onclick="editStudent(${i})">✏️ Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteStudent(${i})">🗑️</button>
      </td>
    </tr>`).join('');
}

function filterStudents(val) {
  const students = DB.get('students');
  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(val.toLowerCase()) ||
    (s.erp||s.id).includes(val)
  );
  document.getElementById('studentTable').innerHTML = renderStudentRows(filtered);
}

// ═══════ ATTENDANCE UPDATE ═══════
function markAtt(si, sub, present) {
  const students = DB.get('students');
  const att = students[si].attendance[sub];
  att.total += 1;
  att.present += present;
  DB.set('students', students);
  renderAdmin('attendance');
}

// ═══════ ADD / EDIT STUDENT ═══════
function openAddModal() {
  editIdx = -1;
  document.getElementById('modalTitle').textContent = 'Add New Student';
  ['fName','fErp','fCourse','fSem','fMobile','fEmail','fPass'].forEach(id => document.getElementById(id).value='');
  document.getElementById('addModal').classList.add('open');
}

function editStudent(i) {
  editIdx = i;
  const s = DB.get('students')[i];
  document.getElementById('modalTitle').textContent = 'Edit Student';
  document.getElementById('fName').value = s.name;
  document.getElementById('fErp').value = s.erp||s.id;
  document.getElementById('fCourse').value = s.course;
  document.getElementById('fSem').value = s.sem;
  document.getElementById('fMobile').value = s.mobile||'';
  document.getElementById('fEmail').value = s.email||'';
  document.getElementById('fPass').value = s.pass||'';
  document.getElementById('addModal').classList.add('open');
}

function closeModal() {
  document.getElementById('addModal').classList.remove('open');
}

function saveStudent() {
  const students = DB.get('students');
  const name = document.getElementById('fName').value.trim();
  const erp = document.getElementById('fErp').value.trim();
  if (!name || !erp) { alert('Name and ERP ID are required!'); return; }

  const newS = {
    id: erp, erp, name,
    course: document.getElementById('fCourse').value,
    sem: document.getElementById('fSem').value,
    mobile: document.getElementById('fMobile').value,
    email: document.getElementById('fEmail').value,
    pass: document.getElementById('fPass').value || 'student123',
    cgpa: '—',
    attendance: {
      'Mathematics':{present:0,total:0}, 'Physics':{present:0,total:0},
      'C Programming':{present:0,total:0}, 'DBMS':{present:0,total:0}
    },
    marks: []
  };

  if (editIdx >= 0) {
    newS.attendance = students[editIdx].attendance;
    newS.marks = students[editIdx].marks;
    students[editIdx] = newS;
  } else {
    students.push(newS);
  }

  DB.set('students', students);
  closeModal();
  navigate('students');
}

function deleteStudent(i) {
  if (!confirm('Delete this student? This cannot be undone.')) return;
  const students = DB.get('students');
  students.splice(i, 1);
  DB.set('students', students);
  navigate('students');
}

// ═══════ LOGOUT ═══════
function logout() {
  currentUser = null;
  document.getElementById('app').style.display = 'none';
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('loginId').value = '';
  document.getElementById('loginPass').value = '';
}

// Enter key login
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('loginPage').style.display !== 'none') doLogin();
});