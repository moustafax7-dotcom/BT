  // Intersection Observer for fade-in
  const sections = document.querySelectorAll('.fade-section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  sections.forEach(s => observer.observe(s));

  // Active nav
  const navLinks = document.querySelectorAll('.nav-tabs a');
  window.addEventListener('scroll', () => {
    let current = '';
    document.querySelectorAll('section[id]').forEach(sec => {
      if(window.scrollY >= sec.offsetTop - 140) current = sec.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#'+current);
    });
  });

  // ── GPA CALCULATOR ──
  const gradePoints = {
    'A+': 4.0, 'A': 3.8, 'A-': 3.5, 'B+': 3.2, 'B': 2.9, 'B-': 2.6,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.4, 'D': 1.2, 'D-': 1.0, 'F': 0.0
  };
  let gpaRowCount = 0;

  function addGpaRow(name='', credit=3, grade='A') {
    gpaRowCount++;
    const wrap = document.getElementById('gpaRows');
    const row = document.createElement('div');
    row.className = 'gpa-row';
    row.id = 'gpaRow-' + gpaRowCount;
    row.innerHTML = `
      <input type="text" placeholder="اسم المادة (مثلاً: Data Structures)" value="${name}" oninput="calcGpa()">
      <input type="number" min="1" max="6" value="${credit}" oninput="calcGpa()" title="عدد الساعات المعتمدة">
      <select onchange="calcGpa()">
        ${Object.keys(gradePoints).map(g => `<option value="${g}" ${g===grade?'selected':''}>${g}</option>`).join('')}
      </select>
      <button class="del-btn" onclick="removeGpaRow(${gpaRowCount})" title="حذف">✕</button>
    `;
    wrap.appendChild(row);
    calcGpa();
  }

  function removeGpaRow(id) {
    const row = document.getElementById('gpaRow-' + id);
    if (row) row.remove();
    calcGpa();
  }

  function resetGpaRows() {
    document.getElementById('gpaRows').innerHTML = '';
    gpaRowCount = 0;
    addGpaRow();
    addGpaRow();
    addGpaRow();
  }

  function calcGpa() {
    const rows = document.querySelectorAll('#gpaRows .gpa-row');
    let totalPoints = 0, totalCredits = 0;
    rows.forEach(row => {
      const credit = parseFloat(row.querySelector('input[type=number]').value) || 0;
      const grade = row.querySelector('select').value;
      const points = gradePoints[grade] ?? 0;
      totalPoints += credit * points;
      totalCredits += credit;
    });
    const gpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    document.getElementById('gpaResult').textContent = gpa.toFixed(2);
  }

  // init with 3 empty rows
  resetGpaRows();

  // ── CGPA CALCULATOR ──
  let cgpaRowCount = 0;

  function addCgpaRow(label='', credit=17, gpa=3.0) {
    cgpaRowCount++;
    const wrap = document.getElementById('cgpaRows');
    const row = document.createElement('div');
    row.className = 'gpa-row';
    row.id = 'cgpaRow-' + cgpaRowCount;
    row.innerHTML = `
      <input type="text" placeholder="اسم الترم (مثلاً: Semester 3)" value="${label}" oninput="calcCgpa()">
      <input type="number" min="1" max="21" value="${credit}" oninput="calcCgpa()" title="عدد الساعات المعتمدة في الترم">
      <input type="number" step="0.01" min="0" max="4" value="${gpa}" oninput="calcCgpa()" title="GPA الترم" style="width:100%; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); color:var(--text); border-radius:8px; padding:10px 12px; font-family:'Cairo',sans-serif; font-size:0.88rem;">
      <button class="del-btn" onclick="removeCgpaRow(${cgpaRowCount})" title="حذف">✕</button>
    `;
    wrap.appendChild(row);
    calcCgpa();
  }

  function removeCgpaRow(id) {
    const row = document.getElementById('cgpaRow-' + id);
    if (row) row.remove();
    calcCgpa();
  }

  function resetCgpaRows() {
    document.getElementById('cgpaRows').innerHTML = '';
    cgpaRowCount = 0;
    addCgpaRow('Semester 1', 17, 3.0);
    addCgpaRow('Semester 2', 17, 3.0);
  }

  function calcCgpa() {
    const rows = document.querySelectorAll('#cgpaRows .gpa-row');
    let totalPoints = 0, totalCredits = 0;
    rows.forEach(row => {
      const inputs = row.querySelectorAll('input[type=number]');
      const credit = parseFloat(inputs[0].value) || 0;
      const gpa = parseFloat(inputs[1].value) || 0;
      totalPoints += credit * gpa;
      totalCredits += credit;
    });
    const cgpa = totalCredits > 0 ? (totalPoints / totalCredits) : 0;
    document.getElementById('cgpaResult').textContent = cgpa.toFixed(2);
  }

  resetCgpaRows();

  // ── HOURS TO GRADUATE CALCULATOR ──
  const HOURS_STORAGE_KEY = 'eru_bt_hours_v1';

  function saveHoursState() {
    try {
      localStorage.setItem(HOURS_STORAGE_KEY, JSON.stringify({
        completed: document.getElementById('hoursCompleted').value,
        perSem: document.getElementById('hoursPerSem').value,
        summer: document.getElementById('hoursSummer').value,
      }));
    } catch(e) {}
  }

  function loadHoursState() {
    try {
      const s = JSON.parse(localStorage.getItem(HOURS_STORAGE_KEY));
      if (!s) return;
      if (s.completed !== undefined) document.getElementById('hoursCompleted').value = s.completed;
      if (s.perSem !== undefined) document.getElementById('hoursPerSem').value = s.perSem;
      if (s.summer !== undefined) document.getElementById('hoursSummer').value = s.summer;
    } catch(e) {}
  }

  function calcHours() {
    const completed = Math.max(0, Math.min(140, parseFloat(document.getElementById('hoursCompleted').value) || 0));
    const perSem = parseFloat(document.getElementById('hoursPerSem').value) || 17;
    const summer = parseFloat(document.getElementById('hoursSummer').value) || 0;

    const remaining = Math.max(0, 140 - completed);
    const percent = Math.round((completed / 140) * 100);

    let level = 1;
    if (completed >= 108) level = 4;
    else if (completed >= 72) level = 3;
    else if (completed >= 34) level = 2;

    // estimate semesters remaining (2 regular semesters/year + optional summer)
    const yearlyRate = (perSem * 2) + summer;
    const semestersRegular = perSem > 0 ? Math.ceil(remaining / perSem) : 0;

    document.getElementById('levelFill').style.width = percent + '%';
    document.getElementById('hCurrentLevel').textContent = level;
    document.getElementById('hRemaining').textContent = remaining;
    document.getElementById('hPercent').textContent = percent + '%';
    document.getElementById('hSemesters').textContent = semestersRegular;

    saveHoursState();
  }
  loadHoursState();
  calcHours();


  // ── INTERACTIVE CHECKLIST ──
  const clData = {
    common: {
      label: '📘 مشترك (Level 1-2)',
      levels: {
        'Level 1': [
          {type:'course', c:'ECO101', n:'Introduction to Microeconomics', cr:3},
          {type:'course', c:'MTH103', n:'Mathematics', cr:3},
          {type:'course', c:'MGT101', n:'Introduction to Management', cr:3},
          {type:'course', c:'IST103', n:'Fundamentals of Information Systems', cr:3},
          {type:'course', c:'COS101', n:'Introduction to Computer Science', cr:3},
          {type:'course', c:'HM003', n:'English Language 1', cr:2},
          {type:'course', c:'ECO102', n:'Introduction to Macroeconomics', cr:3},
          {type:'course', c:'ACC125', n:'Financial Accounting', cr:3},
          {type:'course', c:'COS102', n:'Introduction to Programming', cr:3},
          {type:'course', c:'IST104', n:'System Analysis and Design 1', cr:3},
          {type:'course', c:'STA103', n:'Statistics and Probability 1', cr:3},
          {type:'course', c:'HM004', n:'English Language 2', cr:2},
        ],
        'Level 2': [
          {type:'course', c:'IST205', n:'Database Systems 1', cr:3},
          {type:'course', c:'STA204', n:'Statistics and Probability 2', cr:3},
          {type:'course', c:'HM006', n:'Human Rights & Anti-corruption', cr:2},
          {type:'course', c:'ECO203', n:'Money & Banking', cr:3},
          {type:'course', c:'IST206', n:'System Analysis and Design 2', cr:3},
          {type:'course', c:'COS203', n:'Object Oriented Programming', cr:3},
          {type:'course', c:'HM001', n:'Russian Language 1', cr:2},
          {type:'course', c:'ACC226', n:'Fundamentals of Managerial Accounting', cr:3},
          {type:'course', c:'BUA201', n:'Introduction to Business Analytics', cr:3},
          {type:'course', c:'IST207', n:'Database System 2', cr:3},
          {type:'course', c:'FIN201', n:'Principles of Finance and Investment', cr:3},
          {type:'course', c:'HM005', n:'Scientific Thinking', cr:2},
          {type:'course', c:'MGT102', n:'Introduction to Marketing', cr:3},
          {type:'course', c:'HM002', n:'Russian Language 2', cr:2},
        ]
      }
    },

    BA: {
      label: '📊 Business Analytics',
      levels: {
        'Level 3': [
          {type:'course', c:'COS304', n:'Data Structures', cr:3},
          {type:'course', c:'STA305', n:'Statistical Computing', cr:3},
          {type:'course', c:'COS305', n:'Operating Systems', cr:3},
          {type:'course', c:'MIS301', n:'Digital Marketing and Social Media', cr:3},
          {type:'course', c:'BUA308', n:'Data Analysis for Business Applications', cr:3},
          {type:'course', c:'DAS305', n:'Data Warehouse', cr:3},
          {type:'course', c:'ARI301', n:'Introduction to Artificial Intelligence', cr:3},
          {type:'course', c:'BUA303', n:'Business Intelligence', cr:3},
          {type:'course', c:'BUA304', n:'Predictive Analytics', cr:3},
          {type:'elective', id:'BA-E1', label:'Elective 1', cr:3, options:[
            {c:'BIT303', n:'Networking & Telecommunications'},
          ]},
          {type:'elective', id:'BA-E2', label:'Elective 2', cr:3, options:[
            {c:'ECO414', n:'Econometrics for Time Series'},
            {c:'STA306', n:'Operations Research'},
            {c:'BUA302', n:'Marketing Analytics'},
            {c:'BUA306', n:'Supply Chain Analytics'},
            {c:'BUA307', n:'Special Topics in Business Analytics'},
          ]},
        ],
        'Level 4': [
          {type:'course', c:'HM009', n:'Scientific Research Methodology', cr:2},
          {type:'course', c:'DAS409', n:'Data Mining', cr:3},
          {type:'course', c:'BUA305', n:'Prescriptive Analytics', cr:3},
          {type:'course', c:'BUA422', n:'Graduation Project 1', cr:3},
          {type:'elective', id:'BA-E3', label:'Elective 3', cr:3, options:[
            {c:'ECO424', n:'Business Data Forecasting'},
            {c:'STA407', n:'Qualitative & Quantitative Analysis'},
          ]},
          {type:'elective', id:'BA-E4', label:'Elective 4', cr:3, options:[
            {c:'MGT416', n:'Strategic Management'},
            {c:'FIN410', n:'Investment Portfolio Management'},
            {c:'MIS409', n:'Project Management'},
          ]},
          {type:'course', c:'BIT406', n:'Data Security', cr:3},
          {type:'course', c:'DAS410', n:'Foundation of Big Data', cr:3},
          {type:'course', c:'BUA425', n:'Graduation Project 2', cr:3},
          {type:'elective', id:'BA-E5', label:'Elective 5', cr:3, options:[
            {c:'ARI413', n:'Machine Learning'},
            {c:'MIS304', n:'Financial Information Systems'},
            {c:'IST311', n:'Web Based Applications'},
          ]},
          {type:'elective', id:'BA-E6', label:'Elective 6', cr:3, options:[
            {c:'IST312', n:'Online Analytical Processing'},
            {c:'IST309', n:'Information Retrieval and Web Search'},
          ]},
        ]
      }
    },

    MIS: {
      label: '🖥️ Management Information Systems',
      levels: {
        'Level 3': [
          {type:'course', c:'COS304', n:'Data Structures', cr:3},
          {type:'course', c:'STA305', n:'Statistical Computing', cr:3},
          {type:'course', c:'COS305', n:'Operating Systems', cr:3},
          {type:'course', c:'MIS301', n:'Digital Marketing and Social Media', cr:3},
          {type:'course', c:'MGT306', n:'Production & Operations Management', cr:3},
          {type:'course', c:'MIS302', n:'Fundamentals of E-commerce', cr:3},
          {type:'course', c:'FIN410', n:'Investment Portfolio Management', cr:3},
          {type:'course', c:'MGT203', n:'Introduction to Human Resource Management', cr:3},
          {type:'course', c:'MIS303', n:'Advanced Topics in Information Systems', cr:3},
          {type:'elective', id:'MIS-E1', label:'Elective 1', cr:3, options:[
            {c:'IST311', n:'Web Based Applications'},
          ]},
          {type:'elective', id:'MIS-E2', label:'Elective 2', cr:3, options:[
            {c:'BUA302', n:'Marketing Analytics'},
            {c:'ECO327', n:'Foreign Trade'},
            {c:'POL203', n:'Principles of International Relations'},
            {c:'STA306', n:'Operations Research'},
            {c:'MIS305', n:'Multimedia'},
          ]},
        ],
        'Level 4': [
          {type:'course', c:'HM009', n:'Scientific Research Methodology', cr:2},
          {type:'course', c:'IST414', n:'Mobile Applications', cr:3},
          {type:'course', c:'BIT406', n:'Data Security', cr:3},
          {type:'course', c:'MIS422', n:'Graduation Project 1', cr:3},
          {type:'elective', id:'MIS-E3', label:'Elective 3', cr:3, options:[
            {c:'MGT427', n:'Creative Thinking'},
            {c:'ECO305', n:'Economics of Public Finance'},
            {c:'BUA306', n:'Supply Chain Analytics'},
          ]},
          {type:'elective', id:'MIS-E4', label:'Elective 4', cr:3, options:[
            {c:'COS310', n:'Software Engineering'},
            {c:'MIS409', n:'Project Management'},
            {c:'MIS406', n:'Contemporary Issues in Information Technology'},
          ]},
          {type:'course', c:'BIT303', n:'Networking and Telecommunications', cr:3},
          {type:'course', c:'BUA303', n:'Business Intelligence', cr:3},
          {type:'course', c:'MIS425', n:'Graduation Project 2', cr:3},
          {type:'elective', id:'MIS-E5', label:'Elective 5', cr:3, options:[
            {c:'MGT416', n:'Strategic Management'},
            {c:'MGT428', n:'Communication Skills'},
          ]},
          {type:'elective', id:'MIS-E6', label:'Elective 6', cr:3, options:[
            {c:'MIS407', n:'Advanced E-commerce'},
            {c:'MIS408', n:'Accounting Information Systems'},
            {c:'MIS304', n:'Financial Information Systems'},
          ]},
        ]
      }
    },

    MKI: {
      label: '📣 Marketing Intelligence',
      levels: {
        'Level 3': [
          {type:'course', c:'COS304', n:'Data Structures', cr:3},
          {type:'course', c:'STA305', n:'Statistical Computing', cr:3},
          {type:'course', c:'COS305', n:'Operating Systems', cr:3},
          {type:'course', c:'MIS301', n:'Digital Marketing and Social Media', cr:3},
          {type:'course', c:'MGT306', n:'Production & Operation Management', cr:3},
          {type:'course', c:'ARI301', n:'Introduction to Artificial Intelligence', cr:3},
          {type:'course', c:'BIT303', n:'Networking and Telecommunications', cr:3},
          {type:'course', c:'MKI301', n:'Introduction to Marketing Intelligence', cr:3},
          {type:'course', c:'MIS303', n:'Advanced Topics in Information Systems', cr:3},
          {type:'elective', id:'MKI-E1', label:'Elective 1', cr:3, options:[
            {c:'BUA302', n:'Marketing Analytics'},
            {c:'BUA306', n:'Supply Chain Analytics'},
            {c:'BUA304', n:'Predictive Analytics'},
            {c:'ECO327', n:'Foreign Trade'},
          ]},
          {type:'elective', id:'MKI-E2', label:'Elective 2', cr:3, options:[
            {c:'STA306', n:'Operations Research'},
            {c:'MIS305', n:'Multimedia'},
          ]},
        ],
        'Level 4': [
          {type:'course', c:'HM009', n:'Scientific Research Methodology', cr:2},
          {type:'course', c:'MKT401', n:'Marketing Research', cr:3},
          {type:'course', c:'MKT404', n:'E-Marketing', cr:3},
          {type:'course', c:'MKI401', n:'Graduation Project 1', cr:3},
          {type:'elective', id:'MKI-E3', label:'Elective 3', cr:3, options:[
            {c:'MKT402', n:'Consumer Behavior'},
            {c:'MGT413', n:'Public Relations'},
            {c:'MGT427', n:'Creative Thinking'},
          ]},
          {type:'elective', id:'MKI-E4', label:'Elective 4', cr:3, options:[
            {c:'MKT405', n:'New Product Planning'},
            {c:'MKT403', n:'Integrated Marketing Communications'},
            {c:'MIS409', n:'Project Management'},
          ]},
          {type:'course', c:'MKT406', n:'Brand Management', cr:3},
          {type:'course', c:'MKI403', n:'Customer Analytics', cr:3},
          {type:'course', c:'MKI402', n:'Graduation Project 2', cr:3},
          {type:'elective', id:'MKI-E5', label:'Elective 5', cr:3, options:[
            {c:'MKT407', n:'Marketing Strategy'},
            {c:'MGT428', n:'Communication Skills'},
          ]},
          {type:'elective', id:'MKI-E6', label:'Elective 6', cr:3, options:[
            {c:'MKI404', n:'Customer Relationship Management'},
            {c:'MKT408', n:'International Marketing'},
            {c:'MKT409', n:'Industrial Marketing Management'},
          ]},
        ]
      }
    },

    DBF: {
      label: '💳 Digital Banking & Fintech',
      levels: {
        'Level 3': [
          {type:'course', c:'COS304', n:'Data Structures', cr:3},
          {type:'course', c:'STA305', n:'Statistical Computing', cr:3},
          {type:'course', c:'COS305', n:'Operating Systems', cr:3},
          {type:'course', c:'MIS301', n:'Digital Marketing and Social Media', cr:3},
          {type:'course', c:'ECO427', n:'International Finance and Banking', cr:3},
          {type:'course', c:'BIT406', n:'Data Security', cr:3},
          {type:'course', c:'DBF301', n:'Principles of Digital Banking and Fintech', cr:3},
          {type:'course', c:'DBF302', n:'Valuation of Companies and Cash Flow Generating Assets', cr:3},
          {type:'course', c:'ECO310', n:'Econometrics', cr:3},
          {type:'elective', id:'DBF-E1', label:'Elective 1', cr:3, options:[
            {c:'COS320', n:'Distributed Systems'},
            {c:'MGT307', n:'Business Ethics and Corporate Social Responsibility'},
            {c:'MGT305', n:'Entrepreneurship and Small Enterprises Management'},
            {c:'ECO331', n:'Investment Theory and Practice'},
          ]},
          {type:'elective', id:'DBF-E2', label:'Elective 2', cr:3, options:[
            {c:'BIT303', n:'Networking & Telecommunications'},
            {c:'COS310', n:'Software Engineering'},
            {c:'MIS303', n:'Advanced Topics in Information Systems'},
          ]},
        ],
        'Level 4': [
          {type:'course', c:'HM009', n:'Scientific Research Methodology', cr:2},
          {type:'course', c:'MIS304', n:'Financial Information System', cr:3},
          {type:'course', c:'COS421', n:'Cryptography Fundamentals', cr:3},
          {type:'course', c:'ECO414', n:'Econometrics for Time Series', cr:3},
          {type:'course', c:'DBF403', n:'Graduation Project 1', cr:3},
          {type:'course', c:'ECO415', n:'International Monetary and Financial Systems', cr:3},
          {type:'elective', id:'DBF-E3', label:'Elective 3', cr:3, options:[
            {c:'DBF404', n:'Data Analytics for Accounting and Finance'},
            {c:'DBF405', n:'Trading Strategies'},
            {c:'FIN409', n:'Banking Management'},
          ]},
          {type:'course', c:'COS422', n:'Blockchain and Crypto Assets', cr:3},
          {type:'course', c:'DBF406', n:'Financial Derivatives', cr:3},
          {type:'course', c:'DBF407', n:'Graduation Project 2', cr:3},
          {type:'elective', id:'DBF-E4', label:'Elective 4', cr:3, options:[
            {c:'FIN314', n:'Financial Risk Management'},
            {c:'ECO424', n:'Business Data Forecasting'},
            {c:'DBF408', n:'Alternative Investment Funds'},
          ]},
          {type:'elective', id:'DBF-E5', label:'Elective 5', cr:3, options:[
            {c:'COS423', n:'Blockchain Application'},
            {c:'COS424', n:'Database Security'},
            {c:'COS425', n:'Distributed Computing'},
          ]},
        ]
      }
    }
  };

  let clCurrentTrack = 'BA';
  const CL_STORAGE_KEY = 'eru_bt_checklist_v2';

  function loadClState() {
    try { return JSON.parse(localStorage.getItem(CL_STORAGE_KEY)) || {}; }
    catch(e) { return {}; }
  }
  function saveClState(state) {
    try { localStorage.setItem(CL_STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
  }

  function renderClTabs() {
    const tabsWrap = document.getElementById('clTabs');
    tabsWrap.innerHTML = '';
    ['BA','MIS','MKI','DBF'].forEach(key => {
      const tab = document.createElement('div');
      tab.className = 'cl-tab' + (key === clCurrentTrack ? ' active' : '');
      tab.textContent = clData[key].label;
      tab.onclick = () => { clCurrentTrack = key; renderClTabs(); renderClList(); };
      tabsWrap.appendChild(tab);
    });
  }

  function renderClList() {
    const listWrap = document.getElementById('clList');
    listWrap.innerHTML = '';
    const state = loadClState();
    const track = clData[clCurrentTrack];

    const allGroups = [
      ['Level 1', clData.common.levels['Level 1']],
      ['Level 2', clData.common.levels['Level 2']],
      ['Level 3', track.levels['Level 3']],
      ['Level 4', track.levels['Level 4']],
    ];

    allGroups.forEach(([levelName, items]) => {
      const title = document.createElement('div');
      title.className = 'cl-level-title';
      title.textContent = levelName;
      listWrap.appendChild(title);

      items.forEach(item => {
        if (item.type === 'course') {
          const stateKey = clCurrentTrack + '::' + item.c;
          const checked = !!state[stateKey];

          const row = document.createElement('div');
          row.className = 'cl-item';
          row.innerHTML = `
            <input type="checkbox" ${checked ? 'checked' : ''}>
            <span class="cl-name ${checked ? 'done' : ''}">${item.n}</span>
            <span class="cl-credit">${item.cr} ساعة</span>
          `;
          const checkbox = row.querySelector('input');
          checkbox.addEventListener('change', () => {
            const st = loadClState();
            st[stateKey] = checkbox.checked;
            saveClState(st);
            row.querySelector('.cl-name').classList.toggle('done', checkbox.checked);
            updateClProgress();
          });
          listWrap.appendChild(row);

        } else if (item.type === 'elective') {
          const groupKey = clCurrentTrack + '::' + item.id;
          const selectedVal = state[groupKey] || '';

          const box = document.createElement('div');
          box.style.cssText = 'background:rgba(167,139,250,0.05); border:1px dashed rgba(167,139,250,0.3); border-radius:10px; padding:10px 12px; margin-bottom:6px;';
          box.innerHTML = `<div style="font-size:0.78rem; font-weight:700; color:var(--purple); margin-bottom:6px;">🔀 ${item.label} — اختر مادة واحدة (${item.cr} ساعة)</div>`;

          item.options.forEach(opt => {
            const radioRow = document.createElement('label');
            radioRow.className = 'cl-item';
            radioRow.style.padding = '6px 8px';
            radioRow.innerHTML = `
              <input type="radio" name="${groupKey}" value="${opt.c}" ${selectedVal===opt.c ? 'checked':''} style="accent-color:var(--purple)">
              <span class="cl-name ${selectedVal===opt.c ? 'done':''}">${opt.n}</span>
            `;
            const radio = radioRow.querySelector('input');
            radio.addEventListener('change', () => {
              const st = loadClState();
              st[groupKey] = opt.c;
              saveClState(st);
              renderClList();
            });
            box.appendChild(radioRow);
          });

          // option to clear selection
          if (selectedVal) {
            const clearBtn = document.createElement('div');
            clearBtn.style.cssText = 'font-size:0.72rem; color:var(--muted); cursor:pointer; padding:4px 8px;';
            clearBtn.textContent = '✕ إلغاء الاختيار';
            clearBtn.onclick = () => {
              const st = loadClState();
              delete st[groupKey];
              saveClState(st);
              renderClList();
            };
            box.appendChild(clearBtn);
          }

          listWrap.appendChild(box);
        }
      });
    });

    updateClProgress();
  }

  function updateClProgress() {
    const state = loadClState();
    const track = clData[clCurrentTrack];
    const allItems = [
      ...clData.common.levels['Level 1'],
      ...clData.common.levels['Level 2'],
      ...track.levels['Level 3'],
      ...track.levels['Level 4'],
    ];
    let total = 0, done = 0;
    allItems.forEach(item => {
      total += item.cr;
      if (item.type === 'course') {
        const stateKey = clCurrentTrack + '::' + item.c;
        if (state[stateKey]) done += item.cr;
      } else if (item.type === 'elective') {
        const groupKey = clCurrentTrack + '::' + item.id;
        if (state[groupKey]) done += item.cr;
      }
    });
    const pct = total > 0 ? Math.round((done/total)*100) : 0;
    document.getElementById('clProgressFill').style.width = pct + '%';
    document.getElementById('clDoneCredits').textContent = done;
    document.getElementById('clTotalCredits').textContent = total;
    document.getElementById('clPercentText').textContent = pct + '%';
  }

  renderClTabs();
  renderClList();

  // Animate bars on scroll
  const bars = document.querySelectorAll('.bar-fill');
  const barObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting) { e.target.style.width = e.target.style.width; }
    });
  }, { threshold: 0.5 });
  bars.forEach(b => { const w = b.style.width; b.style.width='0'; setTimeout(()=>{ b.style.width=w; },200); barObs.observe(b); });

  // ── DARK / LIGHT MODE TOGGLE ──
  const THEME_KEY = 'eru_bt_theme';
  const themeToggleBtn = document.getElementById('themeToggle');

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggleBtn) themeToggleBtn.textContent = theme === 'light' ? '☀️' : '🌙';
    try { localStorage.setItem(THEME_KEY, theme); } catch(e) {}
  }

  (function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch(e) {}
    if (!saved) {
      saved = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
    }
    applyTheme(saved);
  })();

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'light' ? 'dark' : 'light');
    });
  }

  // ── BACK TO TOP BUTTON ──
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      backToTopBtn.classList.toggle('show', window.scrollY > 480);
    });
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── COPY RESULT BUTTONS ──
  function flashCopyBtn(btn, successText) {
    if (!btn) return;
    const original = btn.textContent;
    btn.textContent = successText;
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1600);
  }

  function copyText(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => flashCopyBtn(btn, '✅ تم النسخ')).catch(() => fallbackCopy(text, btn));
    } else {
      fallbackCopy(text, btn);
    }
  }

  function fallbackCopy(text, btn) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); flashCopyBtn(btn, '✅ تم النسخ'); }
    catch(e) { flashCopyBtn(btn, '❌ حصل خطأ'); }
    document.body.removeChild(ta);
  }

  function copyGpaResult() {
    const val = document.getElementById('gpaResult').textContent;
    copyText(`معدل الترم (GPA) بتاعي: ${val}`, document.getElementById('copyGpaBtn'));
  }

  function copyCgpaResult() {
    const val = document.getElementById('cgpaResult').textContent;
    copyText(`المعدل التراكمي (CGPA) بتاعي: ${val}`, document.getElementById('copyCgpaBtn'));
  }

  function copyHoursResult() {
    const level = document.getElementById('hCurrentLevel').textContent;
    const remaining = document.getElementById('hRemaining').textContent;
    const percent = document.getElementById('hPercent').textContent;
    const semesters = document.getElementById('hSemesters').textContent;
    const text = `📊 حالتي في الكلية:\nالمستوى الحالي: ${level}\nساعات متبقية: ${remaining}\nنسبة الإنجاز: ${percent}\nترمات متبقية (تقريباً): ${semesters}`;
    copyText(text, document.getElementById('copyHoursBtn'));
  }

  // ── COMPARE TABLE: SORT & FILTER ──
  function getCompareRows() {
    return Array.from(document.querySelectorAll('#compareTbody tr'));
  }

  const compareOriginalOrder = getCompareRows();

  function sortCompare(mode, btn) {
    document.querySelectorAll('.sort-chip').forEach(c => c.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const tbody = document.getElementById('compareTbody');
    let rows = getCompareRows();

    if (mode === 'default') {
      rows = compareOriginalOrder.slice();
    } else if (mode === 'diff-asc') {
      rows.sort((a,b) => (+a.dataset.diff) - (+b.dataset.diff));
    } else if (mode === 'diff-desc') {
      rows.sort((a,b) => (+b.dataset.diff) - (+a.dataset.diff));
    } else if (mode === 'salary-asc') {
      rows.sort((a,b) => (+a.dataset.salary) - (+b.dataset.salary));
    }

    rows.forEach(r => tbody.appendChild(r));
  }

  function filterCompare(tag, btn) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const rows = getCompareRows();
    let visibleCount = 0;
    rows.forEach(row => {
      const focus = (row.dataset.focus || '').split(' ');
      const show = tag === 'all' || focus.includes(tag);
      row.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    const emptyMsg = document.getElementById('compareEmptyMsg');
    if (emptyMsg) emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none';
  }
