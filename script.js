/* ===== Utilidades ===== */
function snapScroll(container, dir = 1){
  const card = container.querySelector('.snap');
  const gap = parseInt(getComputedStyle(container).gap || 16, 10);
  const width = card ? card.getBoundingClientRect().width : 320;
  container.scrollBy({ left: dir * (width + gap), behavior: 'smooth' });
}

/* ===== Carruseles (Noticias 1x2 y Videos 1x1) ===== */
document.querySelectorAll('.carousel').forEach(carousel=>{
  const viewport = carousel.querySelector('.viewport');
  const prev = carousel.querySelector('.arrow.prev');
  const next = carousel.querySelector('.arrow.next');

  if(prev) prev.addEventListener('click', ()=> snapScroll(viewport, -1));
  if(next) next.addEventListener('click', ()=> snapScroll(viewport, +1));

  // Teclado
  viewport?.addEventListener('keydown', e=>{
    if(e.key === 'ArrowRight') snapScroll(viewport, +1);
    if(e.key === 'ArrowLeft')  snapScroll(viewport, -1);
  });

  // Indicador (solo videos)
  const indicator = carousel.querySelector('.indicator');
  if(indicator){
    const currentEl = indicator.querySelector('.current');
    const cards = Array.from(viewport.querySelectorAll('.snap'));
    function update(){
      const left = viewport.getBoundingClientRect().left;
      let idx = 0, min = Infinity;
      cards.forEach((c,i)=>{
        const d = Math.abs(c.getBoundingClientRect().left - left);
        if(d < min){ min = d; idx = i; }
      });
      currentEl.textContent = String(idx+1);
    }
    viewport.addEventListener('scroll', ()=>{ clearTimeout(viewport._t); viewport._t = setTimeout(update, 120); });
    update();
  }
});

/* ===== Mega dropdowns: hover/teclado + soporte touch ===== */
document.querySelectorAll('.has-mega').forEach(item=>{
  const link = item.querySelector('.nav-link');
  const panel = item.querySelector('.mega');
  const grid  = panel?.querySelector('.mega-grid');

  const open  = ()=>{ item.classList.add('open'); link.setAttribute('aria-expanded','true'); grid && grid.focus({preventScroll:true}); };
  const close = ()=>{ item.classList.remove('open'); link.setAttribute('aria-expanded','false'); };

  item.addEventListener('mouseenter', open);
  item.addEventListener('mouseleave', close);
  panel?.addEventListener('focusout', e=>{ if(!panel.contains(e.relatedTarget) && e.relatedTarget !== link){ close(); } });

  // Touch: tap para abrir/cerrar
  link.addEventListener('touchend', (e)=>{ if(!item.classList.contains('open')){ e.preventDefault(); open(); } }, {passive:false});
  document.addEventListener('touchstart', (e)=>{ if(item.classList.contains('open') && !item.contains(e.target)) close(); }, {passive:true});

  // Ciclo con Tab
  grid?.addEventListener('keydown', e=>{
    const focusables = Array.from(grid.querySelectorAll('.mini-card'));
    const first = focusables[0], last = focusables[focusables.length-1];
    if(e.key === 'Tab'){
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
    if(e.key === 'Escape'){ close(); link.focus(); }
  });
});

/* ===== Seguimiento en Vivo — Standings (actualizados al 17-ago-2025) ===== */
/* Fuente oficial F1 (drivers/constructors) */
const DRIVERS = [
  {pos:1,  name:"Oscar Piastri",   team:"McLaren",        pts:284},
  {pos:2,  name:"Lando Norris",    team:"McLaren",        pts:275},
  {pos:3,  name:"Max Verstappen",  team:"Red Bull",       pts:187},
  {pos:4,  name:"George Russell",  team:"Mercedes",       pts:172},
  {pos:5,  name:"Charles Leclerc", team:"Ferrari",        pts:151},
  {pos:6,  name:"Lewis Hamilton",  team:"Ferrari",        pts:109},
  {pos:7,  name:"Kimi Antonelli",  team:"Mercedes",       pts:64},
  {pos:8,  name:"Alexander Albon", team:"Williams",       pts:54},
  {pos:9,  name:"Nico Hülkenberg", team:"Kick Sauber",    pts:37},
  {pos:10, name:"Esteban Ocon",    team:"Haas",           pts:27},
];

const TEAMS = [
  {pos:1, name:"McLaren",       pts:559},
  {pos:2, name:"Ferrari",       pts:260},
  {pos:3, name:"Mercedes",      pts:236},
  {pos:4, name:"Red Bull",      pts:194},
  {pos:5, name:"Williams",      pts:70},
  {pos:6, name:"Aston Martin",  pts:52},
  {pos:7, name:"Kick Sauber",   pts:51},
  {pos:8, name:"Racing Bulls",  pts:45},
  {pos:9, name:"Haas",          pts:35},
  {pos:10,name:"Alpine",        pts:20},
];

function paintStandings(){
  const dBody = document.getElementById('drivers-standings');
  const cBody = document.getElementById('constructors-standings
