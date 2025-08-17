/* ====== UI ====== */
/* ====== Carruseles (Noticias y Videos) con paso dinámico por data-cols ====== */
document.querySelectorAll('.carousel').forEach(carousel=>{
  const track = carousel.querySelector('.track');
  const prev  = carousel.querySelector('.prev');
  const next  = carousel.querySelector('.next');

  // Por defecto 3 columnas (como Noticias). En Videos usamos data-cols="5".
  const cols = parseInt(carousel.dataset.cols || '3', 10);

  function gapPx(){
    // Lee el gap real del track para que el cálculo sea exacto
    const g = getComputedStyle(track).gap;
    return parseFloat(g) || 16;
  }
  function step(){
    const gap = gapPx();
    // Ancho de una tarjeta = (ancho del track - gaps) / columnas visibles
    const cardWidth = (track.clientWidth - gap*(cols - 1)) / cols;
    return cardWidth + gap; // nos movemos una tarjeta + su gap
  }

  prev?.addEventListener('click', ()=> track.scrollBy({ left: -step(), behavior:'smooth' }));
  next?.addEventListener('click', ()=> track.scrollBy({ left:  step(), behavior:'smooth' }));

  // (Opcional) recálculo en resize para mejorar la “sensación” del paso
  let rid;
  window.addEventListener('resize', ()=>{
    cancelAnimationFrame(rid);
    rid = requestAnimationFrame(()=>{/* no hace falta recomputar nada aquí, step() ya usa medidas actuales */});
  });
});


// Historia (1950–Actual)
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

// Tabs
document.querySelectorAll('.tabs [role="tab"]').forEach(tab=>{
  tab.addEventListener('click',()=>{
    const name=tab.dataset.tab;
    tab.parentElement.querySelectorAll('[role="tab"]').forEach(t=>t.setAttribute('aria-selected', String(t===tab)));
    document.querySelectorAll('.tab-panel').forEach(p=>p.hidden=true);
    document.getElementById(`tab-${name}`).hidden=false;
  });
});

/* ====== DATOS ====== */
async function safeLoad(path){
  try{
    const r = await fetch(path, {cache:'no-store'});
    if(!r.ok) throw new Error(r.statusText);
    return await r.json();
  }catch(e){
    console.warn('No se pudo cargar', path, e);
    return null;
  }
}

const FALLBACK_DRIVERS = [
  {"pos":1,"name":"Oscar Piastri","team":"McLaren","pts":284},
  {"pos":2,"name":"Lando Norris","team":"McLaren","pts":275},
  {"pos":3,"name":"Max Verstappen","team":"Red Bull Racing","pts":187},
  {"pos":4,"name":"George Russell","team":"Mercedes","pts":172},
  {"pos":5,"name":"Charles Leclerc","team":"Ferrari","pts":151},
  {"pos":6,"name":"Lewis Hamilton","team":"Ferrari","pts":109},
  {"pos":7,"name":"Kimi Antonelli","team":"Mercedes","pts":64},
  {"pos":8,"name":"Alexander Albon","team":"Williams","pts":54},
  {"pos":9,"name":"Nico Hülkenberg","team":"Kick Sauber","pts":37},
  {"pos":10,"name":"Esteban Ocon","team":"Haas","pts":27}
];
const FALLBACK_TEAMS = [
  {"pos":1,"team":"McLaren","pts":559},
  {"pos":2,"team":"Ferrari","pts":260},
  {"pos":3,"team":"Mercedes","pts":236},
  {"pos":4,"team":"Red Bull Racing","pts":194},
  {"pos":5,"team":"Williams","pts":70},
  {"pos":6,"team":"Aston Martin","pts":52},
  {"pos":7,"team":"Kick Sauber","pts":51},
  {"pos":8,"team":"Racing Bulls","pts":45},
  {"pos":9,"team":"Haas","pts":35},
  {"pos":10,"team":"Alpine","pts":20}
];
const FALLBACK_CALENDAR = {
  "lastRound":14,
  "races":[
    {"round":14,"gp":"Hungría","date":"01–03 Ago","circuit":"Budapest","winner":"L. Norris","status":"done"},
    {"round":15,"gp":"Países Bajos","date":"29–31 Ago","circuit":"Zandvoort","winner":null,"status":"next"}
  ]
};

function paintStandings(drivers, teams){
  const dBody = document.getElementById('tblDrivers');
  const tBody = document.getElementById('tblTeams');
  dBody.innerHTML = drivers.map(d =>
    `<tr><td>${d.pos}</td><td>${d.name}</td><td>${d.team}</td><td>${d.pts}</td></tr>`
  ).join('');
  tBody.innerHTML = teams.map(t =>
    `<tr><td>${t.pos}</td><td>${t.team}</td><td>${t.pts}</td></tr>`
  ).join('');
}

function paintRaces(calendar){
  const last = calendar.races.find(r=>r.status==='done' && r.round===calendar.lastRound) || calendar.races.find(r=>r.status==='done');
  const next = calendar.races.find(r=>r.status==='next');
  if(last){
    document.getElementById('lastRace').textContent = `${last.gp} — ${last.date} | Ganador: ${last.winner ?? '—'}`;
  }
  if(next){
    document.getElementById('nextRace').textContent = `${next.gp} — ${next.date} | Circuito: ${next.circuit}`;
  }
}

(async function init(){
  const [drivers, teams, calendar] = await Promise.all([
    safeLoad('./data/standings_drivers_2025.json'),
    safeLoad('./data/standings_teams_2025.json'),
    safeLoad('./data/calendar_2025.json')
  ]);
  paintStandings(drivers || FALLBACK_DRIVERS, teams || FALLBACK_TEAMS);
  paintRaces(calendar || FALLBACK_CALENDAR);
})();
