'use strict';
(() => {
  const main=document.querySelector('main'), filters=main.querySelector('.filters');
  const divider=document.createElement('div');
  divider.className='filter-divider';
  divider.tabIndex=0;
  divider.setAttribute('role','separator');
  divider.setAttribute('aria-orientation','vertical');
  divider.setAttribute('aria-label','Resize map filters');
  divider.title='Drag to resize filters. Use left and right arrow keys when focused.';
  filters.id='healthcare-filters';
  const toggle=document.createElement('button');
  toggle.className='filter-collapse';
  toggle.type='button';
  toggle.setAttribute('aria-controls',filters.id);
  divider.append(toggle);filters.after(divider);
  let width=180, collapsed=false, dragging=false;
  function resize(value) {
    const notes=parseFloat(main.style.getPropertyValue('--notes-width'))||300;
    const max=Math.max(150,Math.min(420,main.clientWidth-notes-28-240));
    width=Math.max(150,Math.min(max,value));
    main.style.setProperty('--filters-width',width+'px');
    divider.setAttribute('aria-valuemin','150');
    divider.setAttribute('aria-valuemax',String(Math.round(max)));
    divider.setAttribute('aria-valuenow',String(Math.round(width)));
  }
  function sync() {
    main.classList.toggle('filters-collapsed',collapsed);
    filters.inert=collapsed&&matchMedia('(min-width:900px)').matches;
    toggle.textContent=collapsed?'›':'‹';
    toggle.setAttribute('aria-expanded',String(!collapsed));
    toggle.setAttribute('aria-label',collapsed?'Expand map filters':'Collapse map filters');
    toggle.title=collapsed?'Expand filters':'Collapse filters';
  }
  toggle.onclick=()=>{collapsed=!collapsed;sync();};
  divider.onpointerdown=e=>{
    if(e.target.closest('button')||collapsed)return;
    dragging=true;divider.setPointerCapture(e.pointerId);e.preventDefault();
  };
  divider.onpointermove=e=>{if(dragging)resize(e.clientX-main.getBoundingClientRect().left);};
  divider.onpointerup=divider.onpointercancel=()=>{dragging=false;};
  divider.onkeydown=e=>{
    if(e.target!==divider||collapsed)return;
    if(['ArrowLeft','ArrowRight','Home'].includes(e.key)){
      e.preventDefault();resize(e.key==='Home'?180:width+(e.key==='ArrowRight'?24:-24));
    }
  };
  window.addEventListener('resize',()=>{resize(width);sync();});
  resize(width);sync();
})();
