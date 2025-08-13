/* Accesibilidad básica y comportamiento de:
   - Carrusel Noticias (1x2) con drag + snap
   - Carrusel Videos (9x1) con flechas, teclado e indicador
   - Mega dropdowns (hover, foco, cierre al perder foco)
*/

// ===== Utilidades de scroll-snap =====
function snapScroll(container, dir = 1){
  const cardWidth = container.querySelector('.snap')?.getBoundingClientRect().width || 300;
  const gap = parseInt(getComputedStyle(container).gap || 16, 10);
  const delta = dir * (cardWidth + gap);
  container.scrollBy({ left: delta, behavior: 'smooth' });
}

// ===== Carrusel Noticias: drag + snap + teclado =====
document.querySelectorAll('.carousel.news .viewport').forEach(viewport => {
  let isDown = false, startX = 0, scrollLeft = 0;

  const start = (x) => {
    isDown = true;
    startX = x - viewport.getBoundingClientRect().left;
    scrollLeft = viewport.scrollLeft;
  };
  const move = (x) => {
    if(!isDown) return;
    const xPos = x - viewport.getBoundingClientRect().left;
    const walk = (xPos - startX);
    viewport.scrollLeft = scrollLeft - walk;
  };
  const end = () => { isDown = false; };

  viewport.addEventListener('mousedown', e => { viewport.classList.add('dragging'); start(e.pageX); });
  viewport.addEventListener('mousemove', e => move(e.pageX));
  ['mouseleave','mouseup'].forEach(ev => viewport.addEventListener(ev, end));
  viewport.addEventListener('mouseup', () => viewport.classList.remove('dragging'));

  // Touch
  viewport.addEventListener('touchstart', e => start(e.touches[0].pageX), {passive:true});
  viewport.addEventListener('touchmove', e => move(e.touches[0].pageX), {passive:true});
  viewport.addEventListener('touchend', end);

  // Teclado ← →
  viewport.addEventListener('keydown', e => {
    if(e.key === 'ArrowRight'){ snapScroll(viewport, +1); }
    if(e.key === 'ArrowLeft'){ snapScroll(viewport, -1); }
  });

  // Flechas ocultas visualmente pero accesibles
  const parent = viewport.closest('.carousel');
  parent.querySelectorAll('.arrow').forEach(btn=>{
    btn.addEventListener('click', () => snapScroll(viewport, parseInt(btn.dataset.dir,10)));
  });
});

// ===== Carrusel Videos: flechas, teclado, indicador =====
document.querySelectorAll('.carousel.videos').forEach(section => {
  const viewport = section.querySelector('.viewport');
  const prev = section.querySelector('.arrow.prev');
  const next = section.querySelector('.arrow.next');
  const currentEl = section.querySelector('.indicator .current');
  const totalEl = section.querySelector('.indicator .total');
  const cards = Array.from(section.querySelectorAll('.video-card'));
  const total = cards.length;
  let index = 0;

  // Set total
  if(totalEl) totalEl.textContent = String(total);

  function updateIndexByScroll(){
    const vwLeft = viewport.getBoundingClientRect().left;
    let closest = 0, minDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(card.getBoundingClientRect().left - vwLeft);
      if(dist < minDist){ minDist = dist; closest = i; }
    });
    index = closest;
    if(currentEl) currentEl.textContent = String(index+1);
  }

  function go(dir){
    index = Math.max(0, Math.min(total-1, index + dir));
    cards[index].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    if(currentEl) currentEl.textContent = String(index+1);
  }

  next.addEventListener('click', ()=>go(+1));
  prev.addEventListener('click', ()=>go(-1));

  viewport.addEventListener('scroll', () => {
    // inercia suave -> recalcular índice
    clearTimeout(viewport._t);
    viewport._t = setTimeout(updateIndexByScroll, 120);
  });

  // Teclado ← →
  viewport.addEventListener('keydown', e => {
    if(e.key === 'ArrowRight'){ go(+1); }
    if(e.key === 'ArrowLeft'){ go(-1); }
  });

  // Iniciar indicador
  updateIndexByScroll();
});

// ===== Mega dropdowns: apertura por hover/focus, cierre al perder foco =====
document.querySelectorAll('.has-mega').forEach(item => {
  const link = item.querySelector('.nav-link');
  const panel = item.querySelector('.mega');
  const grid = panel?.querySelector('.mega-grid');

  function open(){
    link.setAttribute('aria-expanded', 'true');
    // Llevar foco al panel para navegación con teclado
    grid && grid.focus({ preventScroll: true });
  }
  function close(){
    link.setAttribute('aria-expanded', 'false');
  }

  item.addEventListener('mouseenter', open);
  item.addEventListener('mouseleave', close);

  // Cerrar al perder foco del panel (focus out de todo el contenedor)
  panel.addEventListener('focusout', (e) => {
    if(!panel.contains(e.relatedTarget) && e.relatedTarget !== link){
      close();
    }
  });

  // Permitir Tab/Shift+Tab ciclo básico dentro del panel
  grid.addEventListener('keydown', (e)=>{
    const focusables = Array.from(grid.querySelectorAll('.mini-card'));
    const first = focusables[0], last = focusables[focusables.length-1];
    if(e.key === 'Tab'){
      if(e.shiftKey && document.activeElement === first){
        e.preventDefault(); last.focus();
      } else if(!e.shiftKey && document.activeElement === last){
        e.preventDefault(); first.focus();
      }
    }
    if(e.key === 'Escape'){ close(); link.focus(); }
  });
});

// ===== Tabla Calendario: data-labels en móvil =====
(function addLabelsForMobile(){
  const table = document.querySelector('.calendar');
  if(!table) return;
  const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
  table.querySelectorAll('tbody tr').forEach(row=>{
    row.querySelectorAll('td').forEach((td, idx)=>{
      td.setAttribute('data-label', headers[idx] || '');
    });
  });
})();

