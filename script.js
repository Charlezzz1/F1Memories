/* ==========
   Utilidad de scroll por “página”
   ========== */
function scrollByViewport(container, dir = 1){
  const delta = container.clientWidth * dir;
  container.scrollBy({ left: delta, behavior: 'smooth' });
}

/* ==========
   Carruseles con flechas (sin barra visible)
   ========== */
(function initNewsCarousel(){
  const wrap = document.querySelector('.carousel.grid-news');
  if(!wrap) return;
  const vp = wrap.querySelector('#news-viewport');
  wrap.querySelector('.arrow.prev').addEventListener('click', ()=>scrollByViewport(vp, -1));
  wrap.querySelector('.arrow.next').addEventListener('click', ()=>scrollByViewport(vp, +1));
})();

(function initVideosCarousel(){
  const wrap = document.querySelector('.carousel.videos');
  if(!wrap) return;
  const vp = wrap.querySelector('#videos-viewport');
  wrap.querySelector('.arrow.prev').addEventListener('click', ()=>scrollByViewport(vp, -1));
  wrap.querySelector('.arrow.next').addEventListener('click', ()=>scrollByViewport(vp, +1));
})();

/* ==========
   Cargar JSONs locales (Noticias y Videos)
   Estructuras:
   news.json = [{ "title": "...", "desc": "...", "date": "YYYY-MM-DD", "image": "img/...", "url": "..." }, ...]
   videos.json = [{ "title": "...", "duration": "mm:ss", "date": "YYYY-MM-DD", "thumb": "img/...", "url": "..." }, ...]
   ========== */
async function loadJSON(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error(`HTTP ${res.status} on ${path}`);
  return res.json();
}

(async function fillNewsFromJSON(){
  try{
    const data = await loadJSON('data/news.json');
    const vp = document.getElementById('news-viewport');
    if(!vp) return;

    // Esperamos al menos 12 para 2x3 x 2 páginas; si hay menos, igual funciona
    vp.innerHTML = data.map(item => `
      <article class="news-card grid-item">
        ${item.image ? `<a href="${item.url||'#'}" target="_blank" rel="noopener"><img class="media" src="${item.image}" alt=""></a>` : `<div class="media sk-16x9"></div>`}
        <h3>${item.title||'Noticia'}</h3>
        <p>${item.desc||''}</p>
        <time>${item.date||''}</time>
      </article>
    `).join('');
  }catch(err){
    console.error('news.json error', err);
  }
})();

(async function fillVideosFromJSON(){
  try{
    const data = await loadJSON('data/videos.json');
    const vp = document.getElementById('videos-viewport');
    if(!vp) return;

    vp.innerHTML = data.map(v => `
      <article class="video-card grid-item">
        ${v.thumb ? `<a href="${v.url||'#'}" target="_blank" rel="noopener"><img class="media" src="${v.thumb}" alt=""></a>` : `<div class="media sk-16x9"></div>`}
        <h3>${v.title||'Video'}</h3>
        <div class="meta">${v.duration||'--:--'} · ${v.date||''}</div>
      </article>
    `).join('');
  }catch(err){
    console.error('videos.json error', err);
  }
})();

/* ==========
   Historia: Años + Scroll continuo
   ========== */
(function fillYears(){
  const yearsUl = document.getElementById('years-list');
  const sc = document.getElementById('years-scroll');
  const btn = document.getElementById('scroll-years-btn');
  if(!yearsUl) return;
  const current = new Date().getFullYear();
  for(let y=1950; y<=current; y++){
    const li = document.createElement('li'); li.textContent = y; yearsUl.appendChild(li);
  }
  btn?.addEventListener('click', ()=> sc.scrollBy({ top: sc.scrollHeight, behavior: 'smooth' }));
})();

/* ==========
   Seguimiento en Vivo: Ergast API
   ========== */
async function safeFetch(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

(async function loadStandings(){
  try{
    const drivers = await safeFetch('https://ergast.com/api/f1/current/driverStandings.json');
    const constructors = await safeFetch('https://ergast.com/api/f1/current/constructorStandings.json');

    const ds = drivers?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];
    const cs = constructors?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];

    const dEl = document.getElementById('live-drivers');
    const cEl = document.getElementById('live-constructors');

    if(dEl){
      dEl.innerHTML = `<ol>${ds.map(d => `<li>${d.position}. ${d.Driver.givenName} ${d.Driver.familyName} — <span class="muted">${d.points} pts</span></li>`).join('')}</ol>`;
    }
    if(cEl){
      cEl.innerHTML = `<ol>${cs.map(t => `<li>${t.position}. ${t.Constructor.name} — <span class="muted">${t.points} pts</span></li>`).join('')}</ol>`;
    }
  }catch(e){ console.error('Standings error', e); }
})();

(async function loadCalendar2025(){
  try{
    const cal = await safeFetch('https://ergast.com/api/f1/2025.json');
    const races = cal?.MRData?.RaceTable?.Races || [];
    const tbody = document.getElementById('calendar-body');
    if(!tbody) return;

    tbody.innerHTML = '';
    for(const race of races){
      const tr = document.createElement('tr');
      const name = `${race.raceName} (${race.Circuit.Location.locality}, ${race.Circuit.Location.country})`;
      tr.innerHTML = `
        <td data-label="Carrera">${name}</td>
        <td data-label="Fecha">${race.date}</td>
        <td data-label="Ganador"></td>
        <td data-label="Equipo"></td>
        <td data-label="Vueltas"></td>
      `;
      tbody.appendChild(tr);

      // Ganador si ya existe resultado
      try{
        const res = await safeFetch(`https://ergast.com/api/f1/2025/${race.round}/results.json?limit=1`);
        const rr = res?.MRData?.RaceTable?.Races?.[0]?.Results?.[0];
        if(rr){
          tr.children[2].textContent = `${rr.Driver.givenName} ${rr.Driver.familyName}`;
          tr.children[3].textContent = rr.Constructor?.name || '';
          tr.children[4].textContent = rr.laps || '';
        }
      }catch(_){}
    }

    const liveCal = document.getElementById('live-calendar');
    if(liveCal){
      const items = races.slice(0, 5).map(r => `<li>${r.round}. ${r.raceName} — ${r.date}</li>`).join('');
      liveCal.innerHTML = `<ul>${items}</ul>`;
    }
  }catch(e){ console.error('Calendar error', e); }
})();

(async function loadLastResult(){
  try{
    const res = await safeFetch('https://ergast.com/api/f1/current/last/results.json');
    const race = res?.MRData?.RaceTable?.Races?.[0];
    const out = document.getElementById('live-last-result');
    if(!race || !out) return;
    const winner = race.Results?.[0];
    out.innerHTML = `
      <div><strong>${race.raceName}</strong> — ${race.date}</div>
      <div>Ganador: ${winner.Driver.givenName} ${winner.Driver.familyName} (${winner.Constructor.name})</div>
      <div class="muted">Vueltas: ${winner.laps} · Tiempo: ${winner.Time?.time || '—'}</div>
    `;
  }catch(e){ console.error('Last result error', e); }
})();

/* ==========
   Mega dropdowns accesibles
   ========== */
document.querySelectorAll('.has-mega').forEach(item => {
  const link = item.querySelector('.nav-link');
  const panel = item.querySelector('.mega');
  const grid = panel?.querySelector('.mega-grid');

  function open(){ link.setAttribute('aria-expanded','true'); grid && grid.focus({ preventScroll:true }); }
  function close(){ link.setAttribute('aria-expanded','false'); }

  item.addEventListener('mouseenter', open);
  item.addEventListener('mouseleave', close);

  panel.addEventListener('focusout', (e)=>{
    if(!panel.contains(e.relatedTarget) && e.relatedTarget !== link){ close(); }
  });

  grid?.addEventListener('keydown', (e)=>{
    const focusables = Array.from(grid.querySelectorAll('.mini-card, .mini-link'));
    if(!focusables.length) return;
    const first = focusables[0], last = focusables.at(-1);
    if(e.key === 'Tab'){
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
    if(e.key === 'Escape'){ close(); link.focus(); }
  });
});

/* ==========
   Tabla móvil: data-labels
   ========== */
(function mobileLabels(){
  const table = document.getElementById('calendar-table');
  if(!table) return;
  const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
  table.querySelectorAll('tbody tr').forEach(row=>{
    row.querySelectorAll('td').forEach((td, i)=> td.setAttribute('data-label', headers[i]||''));
  });
})();
