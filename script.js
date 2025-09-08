/* =========================
   F1 Memories — script.js
   ========================= */

/* --------- Carruseles (Noticias / Videos / Fotos) --------- */
document.querySelectorAll('.carousel').forEach(carousel=>{
  const track = carousel.querySelector('.track');
  const prev  = carousel.querySelector('.prev');
  const next  = carousel.querySelector('.next');
  const cols  = parseInt(carousel.dataset.cols || '3', 10);
  const gapPx = ()=> parseFloat(getComputedStyle(track).gap) || 16;
  const step  = ()=> (track.clientWidth - gapPx()*(cols-1))/cols + gapPx();

  prev?.addEventListener('click', ()=> track.scrollBy({left:-step(), behavior:'smooth'}));
  next?.addEventListener('click', ()=> track.scrollBy({left: step(), behavior:'smooth'}));
});

/* --------- Historia (1950–Actual con salto 10 años) --------- */
const years = Array.from({length: (new Date().getFullYear()-1950+1)}, (_,i)=>1950+i);
const list = document.getElementById('seasons');
const range = document.getElementById('yearRange');
let start=1950;
function renderYears(s=1950){
  if(!list) return;
  list.innerHTML='';
  years.filter(y=>y>=s && y<s+10).forEach(y=>{
    const li=document.createElement('li');
    li.textContent=y; li.tabIndex=0; li.setAttribute('role','button'); li.title=`Ver temporada ${y}`;
    list.appendChild(li);
  });
  range.textContent=`${s}–${s+9}`;
}
renderYears(start);
document.querySelectorAll('[data-jump]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const delta=parseInt(btn.dataset.jump,10);
    start = Math.min(Math.max(1950, start + delta), years[years.length-1]-9);
    renderYears(start);
  });
});

/* --------- Tabs --------- */
document.querySelectorAll('.tabs [role="tab"]').forEach(tab=>{
  tab.addEventListener('click',()=>{
    const name=tab.dataset.tab;
    tab.parentElement.querySelectorAll('[role="tab"]').forEach(t=>t.setAttribute('aria-selected', String(t===tab)));
    document.querySelectorAll('.tab-panel').forEach(p=>p.hidden=true);
    document.getElementById(`tab-${name}`).hidden=false;
  });
});

/* --------- Util: carga JSON con múltiples rutas (data y Data) --------- */
async function loadJSONPaths(paths){
  for(const p of paths){
    try{
      const r = await fetch(p, {cache:'no-store'});
      if(r.ok) return await r.json();
    }catch(e){}
  }
  return null;
}

/* --------- Seguimiento en Vivo (con fallbacks) --------- */
const FALLBACK_DRIVERS = [
  {"pos":1,"name":"Oscar Piastri","team":"McLaren","pts":324},
  {"pos":2,"name":"Lando Norris","team":"McLaren","pts":293},
  {"pos":3,"name":"Max Verstappen","team":"Red Bull Racing","pts":230},
  {"pos":4,"name":"George Russell","team":"Mercedes","pts":194},
  {"pos":5,"name":"Charles Leclerc","team":"Ferrari","pts":163},
  {"pos":6,"name":"Lewis Hamilton","team":"Ferrari","pts":117},
  {"pos":7,"name":"Alexander Albon","team":"Williams","pts":70},
  {"pos":8,"name":"Kimi Antonelli","team":"Mercedes","pts":66},
  {"pos":9,"name":"Isack Hadjar","team":"Racing Bulls","pts":38},
  {"pos":10,"name":"Nico H\u00fclkenberg","team":"Kick Sauber","pts":37}
];
const FALLBACK_TEAMS = [
  {"pos":1,"team":"McLaren","pts":617},
  {"pos":2,"team":"Ferrari","pts":280},
  {"pos":3,"team":"Mercedes","pts":260},
  {"pos":4,"team":"Red Bull Racing","pts":239},
  {"pos":5,"team":"Williams","pts":86},
  {"pos":6,"team":"Aston Martin","pts":62},
  {"pos":7,"team":"Racing Bulls","pts":61},
  {"pos":8,"team":"Kick Sauber","pts":55},
  {"pos":9,"team":"Haas","pts":44},
  {"pos":10,"team":"Alpine","pts":20}
];
const FALLBACK_CALENDAR = {
  "lastRound":14,
  "races":[
    {"round":16,"gp":"Italia","date":"05–07 Sep","circuit":"Monza","winner":"M. Verstappen","status":"done"},
    {"round":17,"gp":"Azerbaiy\u00e1n","date":"19–21 Sep","circuit":"Bak\u00fa","winner":null,"status":"next"}
  ]
};

function paintStandings(drivers, teams){
  const dBody = document.getElementById('tblDrivers');
  const tBody = document.getElementById('tblTeams');
  if(dBody) dBody.innerHTML = drivers.map(d =>
    `<tr><td>${d.pos}</td><td>${d.name}</td><td>${d.team}</td><td>${d.pts}</td></tr>`
  ).join('');
  if(tBody) tBody.innerHTML = teams.map(t =>
    `<tr><td>${t.pos}</td><td>${t.team}</td><td>${t.pts}</td></tr>`
  ).join('');
}
function paintRaces(calendar){
  const last = calendar.races.find(r => r.status==='done' && r.round===calendar.lastRound) || calendar.races.find(r=>r.status==='done');
  const next = calendar.races.find(r => r.status==='next');
  const lastBox = document.getElementById('lastRace');
  const nextBox = document.getElementById('nextRace');
  if(lastBox && last){
    lastBox.textContent = `${last.gp} — ${last.date} | Ganador: ${last.winner ?? '—'}`;
  }
  if(nextBox && next){
    nextBox.textContent = `${next.gp} — ${next.date} | Circuito: ${next.circuit}`;
  }
}

(async function initLive(){
  const drivers = await loadJSONPaths([
    './data/standings_drivers_2025.json',
    './Data/standings_drivers_2025.json'
  ]) || FALLBACK_DRIVERS;

  const teams = await loadJSONPaths([
    './data/standings_teams_2025.json',
    './Data/standings_teams_2025.json'
  ]) || FALLBACK_TEAMS;

  const calendar = await loadJSONPaths([
    './data/calendar_2025.json',
    './Data/calendar_2025.json'
  ]) || FALLBACK_CALENDAR;

  paintStandings(drivers, teams);
  paintRaces(calendar);
})();

/* --------- Galería de fotos (auto desde GitHub) --------- */
/* Si prefieres no usar la API, puedes comentar todo este bloque y
   meter <figure class="vitem"><img src="./img/..."></figure> a mano. */
async function buildPhotoCarouselFromGitHub({ owner, repo, ref='main', dirs=[], targetSelector }){
  const container = document.querySelector(targetSelector);
  if(!container) return;
  const track = container.querySelector('.track');
  if(!track) return;

  const exts = ['.avif','.webp','.jpg','.jpeg','.png'];
  let files = [];

  for(const dir of dirs){
    try{
      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${dir}?ref=${ref}`;
      const res = await fetch(url, { cache: 'no-store' });
      if(!res.ok) continue;
      const list = await res.json();
      const imgs = list
        .filter(it => it.type === 'file' && exts.some(e => it.name.toLowerCase().endsWith(e)))
        .map(it => ({ name: it.name, path: `${dir}/${it.name}` }));
      if(imgs.length){ files = imgs; break; }
    }catch(e){}
  }

  if(!files.length){
    track.innerHTML = '<div class="vitem">No encontré imágenes. Colócalas en /img/terror/ (o ajusta dirs en script.js)</div>';
    return;
  }

  const frag = document.createDocumentFragment();
  for(const f of files){
    const raw = `https://raw.githubusercontent.com/Charlezzz1/F1Memories/${ref}/${f.path}`;
    const alt = f.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' ');
    const fig = document.createElement('figure');
    fig.className = 'vitem';
    fig.innerHTML = `
      <img src="${raw}" alt="${alt}" loading="lazy" decoding="async" width="400" height="400">
      <figcaption class="muted" style="font-size:.8rem;margin-top:6px">${alt}</figcaption>
    `;
    frag.appendChild(fig);
  }
  track.innerHTML = '';
  track.appendChild(frag);
}

/* Llama a la galería con TU carpeta real de fotos (ajusta 'dirs') */
buildPhotoCarouselFromGitHub({
  owner: 'Charlezzz1',
  repo: 'F1Memories',
  ref: 'main',
  // Deja una sola carpeta si sabes dónde están (recomendado):
  // dirs: ['img/terror'],
  dirs: ['img/terror','img/horror','images/terror','images/horror','img','images','fotos','Fotos'],
  targetSelector: '#photos-terror'
});
