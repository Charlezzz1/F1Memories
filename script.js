/* ====== UI BÁSICA ====== */
// Carrusel (Noticias 2025)
document.querySelectorAll('.carousel').forEach(carousel=>{
  const track=carousel.querySelector('.track');
  const prev=carousel.querySelector('.prev');
  const next=carousel.querySelector('.next');
  function step(){return track.clientWidth/3 + 16} // ancho tarjeta aprox + gap
  prev?.addEventListener('click',()=>track.scrollBy({left:-step(),behavior:'smooth'}));
  next?.addEventListener('click',()=>track.scrollBy({left: step(),behavior:'smooth'}));
});

// Historia (Temporadas 1950–Actual con salto por décadas)
const years = Array.from({length: (new Date().getFullYear()-1950+1)}, (_,i)=>1950+i);
const list = document.getElementById('seasons');
const range = document.getElementById('yearRange');
let start=1950;
function renderYears(s=1950){
  if(!list) return;
  list.innerHTML='';
  const slice = years.filter(y=>y>=s && y<s+10);
  slice.forEach(y=>{
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

// Tabs (Pilotos / Escuderías / Calendario)
document.querySelectorAll('.tabs [role="tab"]').forEach(tab=>{
  tab.addEventListener('click',()=>{
    const name=tab.dataset.tab;
    tab.parentElement.querySelectorAll('[role="tab"]').forEach(t=>t.setAttribute('aria-selected', String(t===tab)));
    document.querySelectorAll('.tab-panel').forEach(p=>p.hidden=true);
    document.getElementById(`tab-${name}`).hidden=false;
  });
});

/* ====== DATOS (JSON locales) ====== */
async function loadJSON(path){ const r = await fetch(path); if(!r.ok) throw new Error(path); return r.json(); }

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
  const last = calendar.races.find(r => r.status === 'done' && r.round === calendar.lastRound);
  const next = calendar.races.find(r => r.status === 'next');
  if(last){
    document.getElementById('lastRace').textContent =
      `${last.gp} — ${last.date} | Ganador: ${last.winner}`;
  }
  if(next){
    document.getElementById('nextRace').textContent =
      `${next.gp} — ${next.date} | Circuito: ${next.circuit}`;
  }
}

(async function initData(){
  try{
    const [drivers, teams, calendar] = await Promise.all([
      loadJSON('./data/standings_drivers_2025.json'),
      loadJSON('./data/standings_teams_2025.json'),
      loadJSON('./data/calendar_2025.json')
    ]);
    paintStandings(drivers, teams);
    paintRaces(calendar);
  }catch(e){
    console.error('Error cargando datos', e);
  }
})();
