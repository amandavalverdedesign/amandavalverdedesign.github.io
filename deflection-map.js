'use strict';
const {nodes,themes}=JSON.parse(document.getElementById('data').textContent),el=id=>document.getElementById(id),svg=el('map');
const kinds=['Predictable path','Emerging shift','Preferred future'],active=new Set(kinds),history=[];
let selected=null;
const placement={
 'Predictable path':'This sticky sits on the predictable path because it describes a constraint or reinforcing default that can persist without structural intervention. Its placement does not mean it is desirable or inevitable. Moving toward the preferred future requires changing the incentives, authority or everyday practices that reproduce it.',
 'Preferred future':'This sticky is aligned with the bold trajectory because it describes a desired change in how the system works, not simply a new product within the existing arrangement. Its position is an aspiration and a criterion for design decisions, not proof that the outcome will happen or that the stickies form a fixed sequence.',
 'Emerging shift':'This sticky sits between the trajectories because it is a possible opening for change. On its own it does not determine the future: it can reinforce existing power or help redistribute access, depending on implementation, ownership and who benefits.'};
kinds.forEach(k=>{const l=document.createElement('label');l.className='check';const c=document.createElement('input');c.type='checkbox';c.checked=true;c.onchange=()=>{c.checked?active.add(k):active.delete(k);render()};const sw=document.createElement('i');sw.style.background=nodes.find(n=>n.kind===k).color;l.append(c,sw,document.createTextNode(k));el('filters').append(l)});
const unique=nodes.filter((n,i)=>nodes.findIndex(v=>v.label===n.label)===i).sort((a,b)=>a.label.localeCompare(b.label));
unique.forEach(n=>{const o=document.createElement('option');o.value=n.id;o.textContent=n.label;el('node-select').append(o)});
function render(){nodes.forEach(n=>{const g=el('sticky-'+n.id);g.style.opacity=active.has(n.kind)&&(!selected||n.theme===selected.theme)?1:.2;g.setAttribute('aria-pressed',String(selected?.label===n.label))});el('clear-toolbar').disabled=!selected;el('clear-toolbar').classList.toggle('spotlight-active',!!selected)}
function add(tag,text,parent=el('notes')){const a=document.createElement(tag);a.textContent=text;parent.append(a);return a}
function button(text,action,parent){const b=add('button',text,parent);b.onclick=action;return b}
function show(id,push=true){if(push&&selected)history.push({id:selected.id,scroll:el('notes').scrollTop});selected=nodes.find(n=>n.id===id);const n=selected,p=el('notes');p.replaceChildren();p.scrollTop=0;
add('span','SYSTEMS-THINKING NOTES').className='eyebrow';if(history.length)button('← Back to '+nodes.find(n=>n.id===history.at(-1).id).label,()=>{const prev=history.pop();show(prev.id,false);p.scrollTop=prev.scroll;overflow()});
add('h2',n.label);add('p',n.kind+(n.comparison?' · FROM / TO comparison':' · Trajectory exercise')).className='selection-kind';add('p',n.note);
add('h3','Why it sits here');add('p',placement[n.kind]);
add('h3','Moving from FROM toward TO');add('p',themes[n.theme][1]);
add('h3','Design inquiry');add('p',themes[n.theme][2]);
add('h3','Related conditions, openings and outcomes');add('small','Curated by shared system influence: '+themes[n.theme][0]+'. These are interpretive links, not source-map arrows.');
const ul=add('ul','');kinds.forEach(k=>{const related=unique.filter(v=>v.theme===n.theme&&v.kind===k&&v.label!==n.label);if(!related.length)return;const li=add('li','',ul);add('strong',k,li);related.forEach(v=>{button(v.label+' →',()=>{show(v.id);focusSticky(v)},li);add('p',v.note,li)})});
button('Zoom to selected sticky',()=>focusSticky(n));button('Clear spotlight',clear).className='spotlight-active';el('node-select').value=unique.find(v=>v.label===n.label).id;render();requestAnimationFrame(overflow)}
function clear(){selected=null;history.length=0;el('node-select').value='';el('notes').replaceChildren();add('span','SYSTEMS-THINKING NOTES').className='eyebrow';add('h2','What changes the direction?');add('p','Select a sticky to examine its placement, its relationship to other conditions, and the design questions it raises for Power In Common.');add('h3','Predictable is not inevitable');add('p','Yellow stickies describe forces that can keep the system on its current course. Pink stickies articulate a preferred direction. Blue stickies describe emerging openings whose effect depends on choices and coordination.');add('h3','From aspiration to intervention');add('p','Solar by Nest connects renter and owner decisions with eligibility, permissions and potential savings. This exercise asks what else must change for those individual decisions to support collective resilience and broader access.');add('small','Use the comparison view to explore FROM and TO across seven system dimensions. Notes interpret the supplied exercise; they do not claim these futures have occurred.');render();requestAnimationFrame(overflow)}
let view=[0,0,3508,1800];function update(){svg.setAttribute('viewBox',view.join(' '));el('zoom').textContent=Math.round(3508/view[2]*100)+'%'}
function zoom(f){const w=Math.max(190,Math.min(5500,view[2]*f)),ratio=w/view[2],h=view[3]*ratio;view=[view[0]+(view[2]-w)/2,view[1]+(view[3]-h)/2,w,h];update()}
function focusSticky(n){view=[n.x-170,n.y-170,468,468];update()}
el('in').onclick=()=>zoom(.75);el('out').onclick=()=>zoom(1.33);el('fit').onclick=()=>{view=[0,0,3508,3298];update()};el('trajectory').onclick=()=>{view=[0,0,3508,1800];update()};el('compare').onclick=()=>{view=[0,1850,3508,1448];update()};el('clear-toolbar').onclick=clear;
el('reset').onclick=()=>{kinds.forEach(k=>active.add(k));document.querySelectorAll('#filters input').forEach(c=>c.checked=true);view=[0,0,3508,1800];update();clear()};
el('node-select').onchange=e=>{if(e.target.value){show(e.target.value);focusSticky(selected)}else clear()};
let drag=null,moved=false;
svg.onpointerdown=e=>{if(e.button!==0)return;moved=false;drag={x:e.clientX,y:e.clientY,v:[...view],target:e.target.closest('.map-node')};svg.setPointerCapture(e.pointerId)};
svg.onpointermove=e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5)moved=true;if(!moved)return;const scale=Math.max(drag.v[2]/svg.clientWidth,drag.v[3]/svg.clientHeight);view=[drag.v[0]-dx*scale,drag.v[1]-dy*scale,drag.v[2],drag.v[3]];update()};
svg.onpointerup=()=>{if(drag&&!moved){if(drag.target)show(drag.target.id.replace('sticky-',''));else clear()}drag=null};svg.onpointercancel=()=>drag=null;
nodes.forEach(n=>el('sticky-'+n.id).onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();show(n.id)}});
svg.addEventListener('wheel',e=>{if(e.ctrlKey){e.preventDefault();zoom(e.deltaY>0?1.1:.9)}},{passive:false});document.addEventListener('keydown',e=>{if(e.key==='Escape')clear()});
const more=document.createElement('div');more.className='notes-more';more.textContent='More notes and related stickies below ↓';el('notes').after(more);
function overflow(){const n=el('notes');more.hidden=n.scrollHeight<=n.clientHeight+2||n.scrollTop+n.clientHeight>=n.scrollHeight-5}el('notes').onscroll=overflow;new ResizeObserver(overflow).observe(el('notes'));update();clear();
