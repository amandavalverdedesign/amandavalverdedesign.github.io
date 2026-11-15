'use strict';
// Shared geometry for every relationship, including the original imported arrows.
const healthcareLayout = (() => {
  const svg = document.getElementById('map');
  const data = JSON.parse(document.getElementById('data').textContent);
  const ns = 'http://www.w3.org/2000/svg';
  const make = (name, attrs = {}) => {
    const node = document.createElementNS(ns, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  };
  const nodeById = new Map(data.nodes.map(n => [n.id, n]));
  const center = n => ({ x: n.x + n.w / 2, y: n.y + n.h / 2 });
  const sides = new Map();
  const ports = new Map();
  data.edges.forEach(edge => ['a', 'b'].forEach(end => {
    const n = nodeById.get(edge[end]), other = nodeById.get(edge[end === 'a' ? 'b' : 'a']);
    const a = center(n), b = center(other), dx = b.x - a.x, dy = b.y - a.y;
    const side = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'bottom' : 'top');
    const key = n.id + ':' + side;
    if (!sides.has(key)) sides.set(key, []);
    sides.get(key).push({ edge, end, n, side, order: side === 'left' || side === 'right' ? b.y : b.x });
  }));
  // Allocate distinct perimeter slots instead of piling arrowheads onto one point.
  sides.forEach(items => items.sort((a,b) => a.order-b.order).forEach((item,i) => {
    const { n, side, edge, end } = item, t = (i+1)/(items.length+1);
    const vertical = side === 'left' || side === 'right';
    const normal = { x: side === 'left' ? -1 : side === 'right' ? 1 : 0, y: side === 'top' ? -1 : side === 'bottom' ? 1 : 0 };
    ports.set(edge.id+end, { x: vertical ? n.x+(side==='right'?n.w:0)+normal.x*14 : n.x+24+t*(n.w-48), y: vertical ? n.y+24+t*(n.h-48) : n.y+(side==='bottom'?n.h:0)+normal.y*14, normal });
  }));
  const inside = (p,n,pad=12) => p.x>n.x-pad && p.x<n.x+n.w+pad && p.y>n.y-pad && p.y<n.y+n.h+pad;
  const curvePoint = (a,c,d,b,t) => {
    const u=1-t; return {x:u*u*u*a.x+3*u*u*t*c.x+3*u*t*t*d.x+t*t*t*b.x,y:u*u*u*a.y+3*u*u*t*c.y+3*u*t*t*d.y+t*t*t*b.y};
  };
  const routes = new Map();
  data.edges.forEach(edge => {
    const group=document.getElementById('edge-'+edge.id), a=ports.get(edge.id+'a'), b=ports.get(edge.id+'b');
    const distance=Math.hypot(b.x-a.x,b.y-a.y), nx=-(b.y-a.y)/(distance||1), ny=(b.x-a.x)/(distance||1);
    let best;
    for (const reach of [.25,.5,.8]) for (const bend of [0,180,-180,360,-360,650,-650,1000,-1000]) {
      const arm=Math.max(70,distance*reach);
      const c={x:a.x+a.normal.x*arm+nx*bend,y:a.y+a.normal.y*arm+ny*bend};
      const d={x:b.x+b.normal.x*arm+nx*bend,y:b.y+b.normal.y*arm+ny*bend};
      const samples=Array.from({length:81},(_,i)=>curvePoint(a,c,d,b,i/80));
      let score=Math.abs(bend)*.06+arm*.01;
      samples.forEach((p,i)=>{if(i>1&&i<79) data.nodes.forEach(n=>{if(inside(p,n))score+=1000;}); if(p.x<220||p.x>3880||p.y<220||p.y>3780)score+=500;});
      if(!best||score<best.score)best={c,d,samples,score};
    }
    const pathData=`M ${a.x} ${a.y} C ${best.c.x} ${best.c.y}, ${best.d.x} ${best.d.y}, ${b.x} ${b.y}`;
    const defs=make('defs');
    const marker=make('marker',{id:'health-arrow-'+edge.id,viewBox:'0 0 12 12',refX:10,refY:6,markerWidth:5,markerHeight:5,orient:'auto'});
    marker.append(make('path',{d:'M1 1 L10 6 L1 11',fill:'none',stroke:edge.secondaryColor||edge.color,'stroke-width':2,'stroke-linecap':'round','stroke-linejoin':'round'}));defs.append(marker);
    let stroke=edge.color;
    if(edge.secondaryColor){const gradient=make('linearGradient',{id:'health-flow-'+edge.id,gradientUnits:'userSpaceOnUse',x1:a.x,y1:a.y,x2:b.x,y2:b.y});gradient.append(make('stop',{offset:'0%','stop-color':edge.color}),make('stop',{offset:'100%','stop-color':edge.secondaryColor}));defs.append(gradient);stroke=`url(#health-flow-${edge.id})`;}
    const title=make('title');title.textContent=pathwayNotes[edge.id][0];
    const hit=make('path',{d:pathData,stroke:'transparent','stroke-width':18,fill:'none','pointer-events':'stroke'});
    const path=make('path',{d:pathData,stroke,'stroke-width':4,fill:'none','marker-end':`url(#health-arrow-${edge.id})`,'pointer-events':'none'});
    const label=make('g',{'class':'connection-label','pointer-events':'none'});
    const backdrop=make('rect',{fill:'#fff',rx:5,stroke:edge.color,'stroke-width':1});
    const text=make('text',{fill:'#242721','font-family':'Arial, sans-serif','text-anchor':'middle'});
    const leader=make('path',{fill:'none',stroke:edge.color,'stroke-width':1,'stroke-dasharray':'4 4'});label.append(leader,backdrop,text);group.replaceChildren(title,defs,hit,path,label);
    group.setAttribute('aria-label',edge.label+': '+pathwayNotes[edge.id][0]);
    routes.set(edge.id,{edge,group,path,label,backdrop,text,leader,samples:best.samples});
  });
  const overlaps=(a,b,pad=7)=>a.x<b.x+b.w+pad&&a.x+a.w+pad>b.x&&a.y<b.y+b.h+pad&&a.y+a.h+pad>b.y;
  const linesFor = text => {const lines=[''];text.split(/\s+/).forEach(word=>{if((lines.at(-1)+' '+word).length>32)lines.push('');lines[lines.length-1]+=(lines.at(-1)?' ':'')+word;});return lines;};
  let pending;
  function layout(selection, allowed) {
    cancelAnimationFrame(pending);
    pending=requestAnimationFrame(()=>{
      const matrix=svg.getScreenCTM();if(!matrix)return;
      const scale=Math.hypot(matrix.a,matrix.b), vb=svg.viewBox.baseVal;
      const occupied=data.nodes.map(n=>({x:n.x-10,y:n.y-10,w:n.w+20,h:n.h+20}));
      const ordered=[...routes.values()].sort((a,b)=>(b.edge.id===selection?.id?1:0)-(a.edge.id===selection?.id?1:0));
      ordered.forEach(route=>{
        const {edge,label,text,backdrop}=route;
        label.setAttribute('display','none');
        const relevant=!selection||(selection.type==='edge'?selection.id===edge.id:edge.a===selection.id||edge.b===selection.id);
        if(!allowed(edge)||!relevant||scale<.35)return;
        const lines=linesFor(pathwayNotes[edge.id][0]), font=13/scale, w=(Math.max(...lines.map(l=>l.length))*7+16)/scale,h=(lines.length*16+12)/scale;
        for(const t of [.5,.35,.65,.2,.8,.1,.9]){
          const p=route.samples[Math.round(t*80)];
          let placed=false;
          for(const [dx,dy] of [[0,-1],[0,1],[-1,0],[1,0],[-1,-1],[1,1],[1,-1],[-1,1],[0,-2],[0,2],[-2,0],[2,0],[0,-3],[0,3],[-3,0],[3,0]]){
            const box={x:p.x+dx*(w/2+18/scale)-w/2,y:p.y+dy*(h/2+18/scale)-h/2,w,h};
            if(box.x<vb.x||box.y<vb.y||box.x+w>vb.x+vb.width||box.y+h>vb.y+vb.height||occupied.some(b=>overlaps(box,b,8/scale)))continue;
            // Avoid covering other arrows as well as nodes and other labels.
            if(selection?.type!=='edge'&&[...routes.values()].some(r=>r!==route&&allowed(r.edge)&&r.samples.some(q=>q.x>box.x&&q.x<box.x+w&&q.y>box.y&&q.y<box.y+h)))continue;
            route.leader.setAttribute('d',`M ${p.x} ${p.y} L ${box.x+w/2} ${box.y+h/2}`);backdrop.setAttribute('x',box.x);backdrop.setAttribute('y',box.y);backdrop.setAttribute('width',w);backdrop.setAttribute('height',h);
            text.setAttribute('font-size',font);text.replaceChildren();lines.forEach((line,i)=>{const span=make('tspan',{x:box.x+w/2,y:box.y+(19+i*16)/scale});span.textContent=line;text.append(span);});
            label.removeAttribute('display');occupied.push(box);placed=true;break;
          }
          if(placed)break;
        }
      });
    });
  }
  function focus(id, view) {
    const route=routes.get(id);if(!route)return view;
    // Zoom only on explicit selection, never during subsequent pan/zoom.
    const matrix=svg.getScreenCTM(), scale=matrix?Math.hypot(matrix.a,matrix.b):0;
    if(route.label.getAttribute('display')!=='none'&&scale>=.35)return view;
    const width=Math.max(650,Math.min(view[2],Math.min(svg.clientWidth,svg.clientHeight*view[2]/view[3])/.65));
    const height=width*view[3]/view[2];
    const candidates=[40,28,52,16,64];
    const p=route.samples[candidates.find(i=>!data.nodes.some(n=>inside(route.samples[i],n,180)))??40];
    return [p.x-width/2,p.y-height/2,width,height];
  }
  return {layout,focus};
})();
