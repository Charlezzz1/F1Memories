/* ========= Carruseles con flechas (sin barras) ========= */
function setupCarousel(section){
  const track = section.querySelector('.track');
  const prev = section.querySelector('.arrow.prev');
  const next = section.querySelector('.arrow.next');

  let index = 0;
  const gap = 16;

  function cardWidth(){
    const first = track.children[0];
    if(!first) return 0;
    const rect = first.getBoundingClientRect();
    return rect.width + gap;
  }

  function visibleCount(){
    const vis = parseInt(section.dataset.visible || "1", 10);
    return Math.max(1, vis);
  }

  function clamp(val, min, max){ return Math.max(min, Math.min(max, val)); }
  function maxIndex(){
    const total = track.children.length;
    const vis = visibleCount();
    return Math.max(0, total - vis);
  }

  function go(dir){
    index = clamp(index + dir, 0, maxIndex());
    const x = -index * cardWidth();
    track.style.transform = `translateX(${x * 1}px)`;
    updateIndicator();
  }

  function updateIndicator(){
    const ind = section.querySelector('.indicator .current');
    const tot = section.querySelector('.indicator .total');
    if(ind && tot){
      ind.textContent = String(index + 1);
      tot.textContent = String(track.children.length);
    }
  }

  prev?.addEventListener('click', ()=>go(-1));
  next?.addEventListener('click', ()=>go(+1));
  updateIndicator();
}

// Inicializa todos los carouseles
document.querySelectorAll('.carousel').forEach(setupCarousel);


/* ========= SEGUIMIENTO EN VIVO (datos verificados) =========
 * Drivers (Top 5) al 03 Ago 2025 (tras Hungría):
 * 1) Piastri 284, 2) Norris 275, 3) Verstappen 187, 4) Russell 172, 5) Leclerc 151
 * Fuente: F1.com / ESPN:
 * - Drivers: https://www.formula1.com/en/results/2025/drivers  (verificado)
 * - Refuerzo: ESPN Standings 2025
 *
 * Constructores 2025 (Top 5):
 * McLaren 559, Ferrari 260, Mercedes 236, Red Bull 194, Williams 70
 * Fuente: F1.com Constructors 2025
 *
 * Última carrera (Hungría, 03 Ago 2025):
 * Ganó Lando Norris (McLaren) sobre Oscar Piastri (McLaren) y George Russell
 * Fuente: F1.com Race Result 2025 Hungary
 *
 * Próxima carrera:
 * Dutch GP (Zandvoort) — Domingo 31 Ago 2025
 * Fuentes: F1.com Dutch GP page / Dutch GP site
 */
const LIVE = {
  topDrivers: [
    { driver: "Oscar Piastri", pts: 284 },
    { driver: "Lando Norris", pts: 275 },
    { driver: "Max Verstappen", pts: 187 },
    { driver: "George Russell", pts: 172 },
    { driver: "Charles Leclerc", pts: 151 },
  ],
  constructors: [
    { team: "McLaren", pts: 559 },
    { team: "Ferrari", pts: 260 },
    { team: "Mercedes", pts: 236 },
    { team: "Red Bull Racing", pts: 194 },
    { team: "Williams", pts: 70 },
  ],
  lastRace: {
    name: "Hungría (Hungaroring)",
    date: "03 Ago 2025",
    result: "1) Lando Norris (McLaren) 2) Oscar Piastri (McLaren) 3) George Russell",
  },
  nextRace: {
    name: "Países Bajos (Zandvoort)",
    date: "31 Ago 2025",
  }
};

(function renderLive(){
  const dl = document.getElementById('live-top-drivers');
  const cl = document.getElementById('live-constructors');
  const last = document.getElementById('live-last-race');
  const next = document.getElementById('live-next-race');

  if(dl){
    dl.innerHTML = LIVE.topDrivers
      .map(d => `<li>${d.driver} — <strong>${d.pts}</strong></li>`)
      .join("");
  }
  if(cl){
    cl.innerHTML = LIVE.constructors
      .map(c => `<li>${c.team} — <strong>${c.pts}</strong></li>`)
      .join("");
  }
  if(last){ last.textContent = `${LIVE.lastRace.name} — ${LIVE.lastRace.date} · ${LIVE.lastRace.result}`; }
  if(next){ next.textContent = `${LIVE.nextRace.name} — ${LIVE.nextRace.date}`; }
})();

/* ========= CALENDARIO (orden oficial 2025; puedes reordenar si lo prefieres)
 * Fuentes oficiales calendario/resultados: F1.com schedule 2025 + results.
 * R1 Australia (Norris), R2 China (Piastri), R3 Japón (Verstappen), R4 Baréin (Piastri),
 * R5 Arabia Saudita (Piastri), R6 Miami (Piastri), R7 Emilia-Romagna (Verstappen),
 * R8 Mónaco (Norris), R9 España (Piastri), R10 Canadá (Russell),
 * R11 Austria (Norris), R12 Gran Bretaña (Norris),
 * R13 Bélgica (Piastri), R14 Hungría (Norris),
 * R15 Países Bajos (29–31 Ago), … hasta Abu Dabi.
 */
const CALENDAR_ROWS = [
  { gp: "Australia", date: "16 Mar 2025", winner: "Lando Norris", team: "McLaren", laps: "57" },
  { gp: "China", date: "23 Mar 2025", winner: "Oscar Piastri", team: "McLaren", laps: "56" },
  { gp: "Japón", date: "06 Abr 2025", winner: "Max Verstappen", team: "Red Bull", laps: "53" },
  { gp: "Baréin", date: "13 Abr 2025", winner: "Oscar Piastri", team: "McLaren", laps: "57" },
  { gp: "Arabia Saudita", date: "20 Abr 2025", winner: "Oscar Piastri", team: "McLaren", laps: "50" },
  { gp: "Miami (EE. UU.)", date: "04 May 2025", winner: "Oscar Piastri", team: "McLaren", laps: "57" },
  { gp: "Emilia-Romaña", date: "18 May 2025", winner: "Max Verstappen", team: "Red Bull", laps: "63" },
  { gp: "Mónaco", date: "25 May 2025", winner: "Lando Norris", team: "McLaren", laps: "78" },
  { gp: "España", date: "01 Jun 2025", winner: "Oscar Piastri", team: "McLaren", laps: "66" },
  { gp: "Canadá", date: "15 Jun 2025", winner: "George Russell", team: "Mercedes", laps: "70" },
  { gp: "Austria", date: "29 Jun 2025", winner: "Lando Norris", team: "McLaren", laps: "71" },
  { gp: "Gran Bretaña", date: "06 Jul 2025", winner: "Lando Norris", team: "McLaren", laps: "52" },
  { gp: "Bélgica", date: "27 Jul 2025", winner: "Oscar Piastri", team: "McLaren", laps: "44" },
  { gp: "Hungría", date: "03 Ago 2025", winner: "Lando Norris", team: "McLaren", laps: "70" },
  { gp: "Países Bajos", date: "31 Ago 2025", winner: "", team: "", laps: "" },
  { gp: "Italia (Monza)", date: "07 Sep 2025", winner: "", team: "", laps: "" },
  { gp: "Azerbaiyán", date: "21 Sep 2025", winner: "", team: "", laps: "" },
  { gp: "Singapur", date: "05 Oct 2025", winner: "", team: "", laps: "" },
  { gp: "Estados Unidos (Austin)", date: "19 Oct 2025", winner: "", team: "", laps: "" },
  { gp: "México", date: "26 Oct 2025", winner: "", team: "", laps: "" },
  { gp: "Brasil", date: "09 Nov 2025", winner: "", team: "", laps: "" },
  { gp: "Estados Unidos (Las Vegas)", date: "22 Nov 2025", winner: "", team: "", laps: "" },
  { gp: "Catar", date: "30 Nov 2025", winner: "", team: "", laps: "" },
  { gp: "Abu Dabi", date: "07 Dic 2025", winner: "", team: "", laps: "" },
];

(function renderCalendar(){
  const tb = document.getElementById('calendar-body');
  if(!tb) return;
  tb.innerHTML = CALENDAR_ROWS.map(r => `
    <tr>
      <td data-label="Carrera">${r.gp}</td>
      <td data-label="Fecha">${r.date || ""}</td>
      <td data-label="Ganador">${r.winner || ""}</td>
      <td data-label="Equipo">${r.team || ""}</td>
      <td data-label="Vueltas">${r.laps || ""}</td>
    </tr>
  `).join("");
})();

/* ========= Historia ========= */
// Temporadas 1950–actualidad (año por línea)
(function renderYears(){
  const ul = document.getElementById('years-list');
  if(!ul) return;
  let out = "";
  for(let y=1950; y<=2025; y++) out += `<li>${y}</li>`;
  ul.innerHTML = out;
})();
document.getElementById('scroll-years')?.addEventListener('click', ()=>{
  const el = document.getElementById('years-scroll');
  el.scrollBy({ top: 160, behavior: 'smooth' });
});

// Escuderías históricas (DEMO parcial + guía para completar)
// Fuente sugerida para completar: Wikipedia “List of Formula One constructors”
const CONSTRUCTORS_PARTIAL = [
  "Ferrari","McLaren","Mercedes","Red Bull","Williams","Lotus","Brabham",
  "Renault","Benetton","Tyrrell","Jordan","Sauber","Minardi","Alfa Romeo",
  "Aston Martin","Haas","Alpine","Racing Bulls (Toro Rosso/AlphaTauri)",
  "BAR","Honda","Toyota","Jaguar","Arrows","Ligier","Prost","Super Aguri",
  "Manor/Marussia/Virgin","HRT","Spyker/Midland","Osella","Onyx","Andrea Moda",
];
(function renderConstructors(){
  const ul = document.getElementById('constructors-all');
  if(!ul) return;
  ul.innerHTML = CONSTRUCTORS_PARTIAL.map(n=>`<li>${n}</li>`).join("")
    + `<li>… (pegar listado completo desde Wikipedia)</li>`;
})();

// Pilotos históricos (DEMO parcial + guía para completar)
// Fuente sugerida para completar: Wikipedia “List of Formula One drivers”
const DRIVERS_PARTIAL = [
  "Juan Manuel Fangio","Alberto Ascari","Stirling Moss","Jim Clark","Graham Hill",
  "Jackie Stewart","Niki Lauda","Alain Prost","Ayrton Senna","Michael Schumacher",
  "Mika Häkkinen","Fernando Alonso","Sebastian Vettel","Lewis Hamilton","Max Verstappen"
];
(function renderDrivers(){
  const ul = document.getElementById('drivers-all');
  if(!ul) return;
  ul.innerHTML = DRIVERS_PARTIAL.map(n=>`<li>${n}</li>`).join("")
    + `<li>… (pegar listado completo desde Wikipedia)</li>`;
})();

/* ========= Accesibilidad en Megas (hover/focus, cierre al perder foco) ========= */
document.querySelectorAll('.has-mega').forEach(item => {
  const link = item.querySelector('.nav-link');
  const panel = item.querySelector('.mega');
  const grid = panel?.querySelector('.mega-grid');
  function open(){ link.setAttribute('aria-expanded','true'); grid && grid.focus({preventScroll:true}); }
  function close(){ link.setAttribute('aria-expanded','false'); }
  item.addEventListener('mouseenter', open);
  item.addEventListener('mouseleave', close);
  panel?.addEventListener('focusout', (e) => { if(!panel.contains(e.relatedTarget) && e.relatedTarget !== link){ close(); } });
  grid?.addEventListener('keydown', (e)=>{
    const focusables = Array.from(grid.querySelectorAll('.mini-card'));
    if(!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length-1];
    if(e.key === 'Tab'){
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
    if(e.key === 'Escape'){ close(); link.focus(); }
  });
});
