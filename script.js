/* Flechas para carruseles (sin barras visibles) */
function setupArrowCarousel(btn){
  const dir = parseInt(btn.dataset.dir,10);
  const targetSel = btn.dataset.target;
  const viewport = document.querySelector(targetSel);
  if(!viewport) return;
  btn.addEventListener('click', ()=>{
    const card = viewport.querySelector('.snap');
    const w = card ? card.getBoundingClientRect().width : 320;
    const gap = parseInt(getComputedStyle(viewport).gap || 16, 10);
    viewport.scrollBy({ left: (w+gap)*dir, behavior: 'smooth' });
  });
}
document.querySelectorAll('.arrow').forEach(setupArrowCarousel);

/* Tabs accesibles en Bloque Master */
const tabs = document.querySelectorAll('.tablist [role="tab"]');
const panels = [...document.querySelectorAll('[role="tabpanel"]')];
tabs.forEach(tab=>{
  tab.addEventListener('click', ()=>{
    tabs.forEach(t=>t.setAttribute('aria-selected', t===tab ? 'true':'false'));
    panels.forEach(p=>p.hidden = (p.id !== tab.getAttribute('aria-controls')));
  });
});

/* Historia: generar 1950..2025 y botón “Ir al final” */
(function(){
  const ul = document.getElementById('years-list');
  if(!ul) return;
  for(let y=1950; y<=2025; y++){
    const li = document.createElement('li'); li.textContent = String(y); ul.appendChild(li);
  }
  document.querySelectorAll('.jump').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      document.getElementById('years').scrollTo({ top: 99999, behavior: 'smooth' });
    });
  });
})();

/* Calendario: filas con orden de tu prompt */
(function(){
  const rows = [
    "Australia","China","Japón","Baréin","Arabia Saudita","Estados Unidos","Italia",
    "Mónaco","España","Canadá","Austria","Reino Unido","Bélgica","Hungría",
    "Países Bajos","Italia","Azerbaiyán","Singapur","Estados Unidos","México",
    "Brasil","Estados Unidos","Catar","Emiratos Árabes Unidos"
  ];
  const tbody = document.getElementById('cal-rows');
  if(!tbody) return;
  rows.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r}</td><td></td><td></td><td></td><td></td>`;
    tbody.appendChild(tr);
  });
})();
