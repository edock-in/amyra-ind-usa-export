/* The Journey of One Box · amyra-ind-usa-export · MIT License · https://games.edock.io/amyra-ind-usa-export */
/* ============ WORLD ============ */
const H=220,GROUND=194;
const REGIONS=[
  {name:'town',  x0:0,x1:750,top:'#7EC8F2',bot:'#FFE2A8',far:'#C98C4C',far2:'#E7B478',ground:'#C9A46A',road:'#6B5A45',song:'town'},
  {name:'street',x0:750,x1:1450,top:'#6FBDF0',bot:'#D6ECFA',far:'#7F8FA6',far2:'#AEBBCB',ground:'#B9B2A0',road:'#5A5A6B',song:'town'},
  {name:'works', x0:1450,x1:2150,top:'#86B8E0',bot:'#E8E1CF',far:'#8C7B6B',far2:'#B9A896',ground:'#A8A08C',road:'#4E4E5C',song:'town'},
  {name:'port',  x0:2150,x1:2500,top:'#F2A24E',bot:'#FFD9A0',far:'#3F5F86',far2:'#7A93B5',ground:'#8E8E8E',road:'#4E4E5C',song:'town'},
  {name:'sea',   x0:2500,x1:3000,top:'#1B1F4C',bot:'#3A4A8C',far:'#111433',far2:'#25305F',ground:'#1F6FA8',road:'#155A8C',song:'sea'},
  {name:'usa',   x0:3000,x1:3800,top:'#5EB2F0',bot:'#D8F0FF',far:'#5B6B85',far2:'#8F9DB5',ground:'#8FBF6A',road:'#40404E',song:'usa'},
  {name:'home',  x0:3800,x1:4200,top:'#F58A5B',bot:'#FFD79A',far:'#8E4F3A',far2:'#C77E5C',ground:'#C9A46A',road:'#6B5A45',song:'town'}
];
function hex2(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}
function lerpC(a,b,t){const A=hex2(a),B=hex2(b);return 'rgb('+Math.round(A[0]+(B[0]-A[0])*t)+','+Math.round(A[1]+(B[1]-A[1])*t)+','+Math.round(A[2]+(B[2]-A[2])*t)+')';}
function regionAt(x){for(let i=0;i<REGIONS.length;i++)if(x<REGIONS[i].x1)return i;return REGIONS.length-1;}
function paletteAt(x){const i=regionAt(x),r=REGIONS[i];const n=REGIONS[Math.min(i+1,REGIONS.length-1)];const d=r.x1-x;const t=d<160&&n!==r?1-d/160:0;
  const k=key=>t?lerpC(r[key],n[key],t):r[key];return {top:k('top'),bot:k('bot'),far:k('far'),far2:k('far2'),ground:k('ground'),road:k('road'),name:r.name,t};}
/* deterministic props */
function rnd(seed){let s=seed*9301+49297;s=s%233280;return s/233280;}
const PROPS=[];
(function(){let id=0;for(const r of REGIONS){for(let x=r.x0+40;x<r.x1;x+=60){const v=rnd(id++);let type=null;
  if(r.name==='town')type=v<.25?'palm':v<.4?'stall':v<.5?'rick':v<.6?'lamp':null;
  else if(r.name==='street')type=v<.3?'tree':v<.45?'lamp':v<.55?'bench':null;
  else if(r.name==='works')type=v<.25?'crate':v<.4?'lamp':v<.5?'tree':null;
  else if(r.name==='port')type=v<.5?'container':v<.65?'crane':null;
  else if(r.name==='usa')type=v<.3?'tree2':v<.42?'lamp':v<.5?'hydrant':null;
  else if(r.name==='home')type=v<.3?'palm':v<.45?'lamp':null;
  if(type)PROPS.push({x:x+Math.floor(v*30),type,v});}}})();
const CLOUDS=[];for(let i=0;i<40;i++)CLOUDS.push({x:i*230+rnd(i)*120,y:14+rnd(i+7)*40,w:18+rnd(i+3)*22});

function txt(ctx,s,x,y,col,size,align){ctx.font=(size||7)+'px "Press Start 2P",monospace';ctx.textBaseline='top';ctx.textAlign=align||'left';ctx.fillStyle=col;ctx.fillText(s,x,y);ctx.textAlign='left';}
function sign(ctx,x,y,s,bg,fg){ctx.font='6px "Press Start 2P",monospace';const w=Math.ceil(ctx.measureText(s).width)+8;ctx.fillStyle=PAL.k;ctx.fillRect(x-w/2-1,y-1,w+2,11);ctx.fillStyle=bg;ctx.fillRect(x-w/2,y,w,9);txt(ctx,s,x,y+2,fg,6,'center');}
function windows(ctx,x,y,w,h,cols,rows,col){const cw=Math.floor((w-6)/cols),ch=Math.floor((h-8)/rows);for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ctx.fillStyle=PAL.k;ctx.fillRect(x+4+c*cw,y+5+r*ch,cw-3,ch-3);ctx.fillStyle=col;ctx.fillRect(x+5+c*cw,y+6+r*ch,cw-5,ch-5);}}
function rect(ctx,x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h);}
function outline(ctx,x,y,w,h){ctx.fillStyle=PAL.k;ctx.fillRect(x,y,w,1);ctx.fillRect(x,y+h-1,w,1);ctx.fillRect(x,y,1,h);ctx.fillRect(x+w-1,y,1,h);}

function drawBuilding(ctx,sx,b,t){const w=b.w,h=b.h,x=sx-Math.floor(w/2),y=GROUND-h;
  rect(ctx,x,y,w,h,b.wall);outline(ctx,x,y,w,h);
  switch(b.type){
    case 'shop':rect(ctx,x-3,y-2,w+6,6,b.accent);outline(ctx,x-3,y-2,w+6,6);for(let i=0;i<w+6;i+=6)rect(ctx,x-3+i,y-1,3,4,'#FFF');windows(ctx,x,y+8,w,h-30,2,1,'#8ED0F5');break;
    case 'gov':rect(ctx,x-4,y-8,w+8,8,b.accent);outline(ctx,x-4,y-8,w+8,8);for(let i=0;i<4;i++){rect(ctx,x+4+i*Math.floor((w-8)/3.2),y+8,4,h-8,'#FFF');}rect(ctx,x-3,GROUND-3,w+6,3,PAL.d);break;
    case 'factory':for(let i=0;i<w;i+=12){ctx.fillStyle=b.accent;ctx.beginPath();ctx.moveTo(x+i,y);ctx.lineTo(x+i,y-9);ctx.lineTo(x+i+12,y);ctx.fill();}rect(ctx,x+w-12,y-22,6,22,PAL.d);outline(ctx,x+w-12,y-22,6,22);windows(ctx,x,y+2,w,h-22,3,1,'#FFE66D');
      const sm=(t*0.6)%1;for(let k=0;k<3;k++){const p=(sm+k/3)%1;rect(ctx,x+w-10+Math.sin(p*6)*3,y-24-p*20,4+p*4,3,'rgba(220,220,230,'+(0.7-p*0.6)+')');}break;
    case 'cafe':rect(ctx,x,y-6,w,6,b.accent);outline(ctx,x,y-6,w,6);windows(ctx,x,y+4,w,h-26,2,1,'#2A2016');rect(ctx,x+6,y+9,6,4,'#8ED0F5');rect(ctx,x+w-12,y+9,6,4,'#8ED0F5');break;
    case 'bank':rect(ctx,x-4,y-8,w+8,8,b.accent);outline(ctx,x-4,y-8,w+8,8);txt(ctx,'₹',sx,y-7,PAL.k,6,'center');for(let i=0;i<3;i++)rect(ctx,x+6+i*Math.floor((w-12)/2.4),y+8,5,h-8,'#FFF');break;
    case 'lab':rect(ctx,x,y-5,w,5,b.accent);outline(ctx,x,y-5,w,5);windows(ctx,x,y+4,w,h-26,3,1,'#B9F1FF');rect(ctx,x+w-8,y-12,4,8,PAL.e);break;
    case 'studio':rect(ctx,x,y-4,w,4,b.accent);windows(ctx,x,y+4,w,h-26,1,1,'#FFF');rect(ctx,x+6,y+12,w-12,2,PAL.k);break;
    case 'shed':for(let i=0;i<w;i+=8)rect(ctx,x+i,y-6,4,6,b.accent);rect(ctx,x,y-1,w,2,PAL.k);rect(ctx,x+8,y+10,w-16,h-30,PAL.d);outline(ctx,x+8,y+10,w-16,h-30);break;
    case 'gate':rect(ctx,x,y,w,h,b.wall);rect(ctx,x+w-6,y-10,4,h+10,PAL.d);rect(ctx,x-30,y+8,w+24,3,'#FFF');for(let i=0;i<w+24;i+=8)rect(ctx,x-30+i,y+8,4,3,PAL.r);outline(ctx,x-30,y+8,w+24,3);windows(ctx,x,y+4,w,h-24,1,1,'#8ED0F5');break;
    case 'warehouse':rect(ctx,x-4,y-6,w+8,6,b.accent);outline(ctx,x-4,y-6,w+8,6);for(let i=0;i<3;i++){rect(ctx,x+6+i*Math.floor((w-12)/3),y+h-26,Math.floor((w-12)/3)-6,26,PAL.d);outline(ctx,x+6+i*Math.floor((w-12)/3),y+h-26,Math.floor((w-12)/3)-6,26);}break;
    case 'house':ctx.fillStyle=b.accent;ctx.beginPath();ctx.moveTo(x-6,y);ctx.lineTo(sx,y-18);ctx.lineTo(x+w+6,y);ctx.fill();ctx.strokeStyle=PAL.k;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-6,y+0.5);ctx.lineTo(sx,y-17.5);ctx.lineTo(x+w+6,y+0.5);ctx.stroke();rect(ctx,x+4,y+6,8,8,'#8ED0F5');outline(ctx,x+4,y+6,8,8);rect(ctx,x+w-12,y+6,8,8,'#8ED0F5');outline(ctx,x+w-12,y+6,8,8);rect(ctx,x+8,y-14,4,8,PAL.d);break;
    case 'portal':rect(ctx,x,y-6,w,6,b.accent);outline(ctx,x,y-6,w,6);rect(ctx,x+8,y+8,w-16,14,PAL.k);rect(ctx,x+10,y+10,w-20,10,'#8ED0F5');txt(ctx,'e-BRC',sx,y+12,PAL.G,5,'center');break;
  }
  /* door */
  const dw=b.dw||12,dh=b.dh||20;rect(ctx,sx-dw/2,GROUND-dh,dw,dh,b.door||'#5C3A18');outline(ctx,sx-dw/2,GROUND-dh,dw,dh);rect(ctx,sx+dw/2-4,GROUND-dh/2,2,2,'#FFE66D');
  if(b.sign)sign(ctx,sx,y-(b.type==='gov'||b.type==='bank'||b.type==='warehouse'?22:b.type==='house'?32:b.type==='factory'?24:20),b.sign,b.signBg||'#FFF4DE',b.signFg||PAL.k);
}
function drawProp(ctx,x,p,t){switch(p.type){
  case 'palm':rect(ctx,x,GROUND-34,3,34,PAL.n);for(let a=-2;a<=2;a++){const dx=a*7,dy=-Math.abs(a)*3;rect(ctx,x+1+dx-(a<0?8:0),GROUND-36+dy,9,3,PAL.G);rect(ctx,x+1+dx-(a<0?8:0),GROUND-34+dy,9,2,PAL.g);}break;
  case 'tree':rect(ctx,x,GROUND-22,4,22,PAL.n);circle(ctx,x+2,GROUND-28,11,'G');circle(ctx,x+1,GROUND-30,8,'g');break;
  case 'tree2':rect(ctx,x,GROUND-26,4,26,PAL.N);circle(ctx,x+2,GROUND-32,10,'#2E7D4B');circle(ctx,x+3,GROUND-36,7,'#4CC96A');break;
  case 'lamp':rect(ctx,x,GROUND-40,2,40,PAL.d);rect(ctx,x-3,GROUND-44,8,5,PAL.k);rect(ctx,x-2,GROUND-43,6,3,'#FFE66D');break;
  case 'stall':rect(ctx,x,GROUND-22,26,22,'#F2A93B');outline(ctx,x,GROUND-22,26,22);for(let i=0;i<26;i+=6)rect(ctx,x+i,GROUND-24,3,4,PAL.r);rect(ctx,x+3,GROUND-14,20,10,'#8B5A2B');for(let i=0;i<5;i++)rect(ctx,x+4+i*4,GROUND-13,3,3,[PAL.r,PAL.y,PAL.g,PAL.o,PAL.p][i]);break;
  case 'rick':rect(ctx,x,GROUND-16,22,12,'#FFE66D');rect(ctx,x,GROUND-18,22,3,PAL.k);rect(ctx,x+2,GROUND-14,7,6,PAL.k);rect(ctx,x+12,GROUND-14,8,6,'#8ED0F5');rect(ctx,x+3,GROUND-4,4,4,PAL.k);rect(ctx,x+15,GROUND-4,4,4,PAL.k);rect(ctx,x+10,GROUND-4,4,4,PAL.k);break;
  case 'bench':rect(ctx,x,GROUND-8,16,3,PAL.n);rect(ctx,x+1,GROUND-5,2,5,PAL.d);rect(ctx,x+13,GROUND-5,2,5,PAL.d);break;
  case 'crate':rect(ctx,x,GROUND-10,10,10,PAL.T);outline(ctx,x,GROUND-10,10,10);rect(ctx,x+12,GROUND-8,8,8,PAL.T);outline(ctx,x+12,GROUND-8,8,8);break;
  case 'container':{const cols=[PAL.r,PAL.b,PAL.o,PAL.g,PAL.v];const n=1+Math.floor(p.v*3);for(let i=0;i<n;i++){rect(ctx,x,GROUND-12*(i+1),34,12,cols[(Math.floor(p.v*10)+i)%5]);outline(ctx,x,GROUND-12*(i+1),34,12);for(let k=4;k<34;k+=6)rect(ctx,x+k,GROUND-12*(i+1)+2,1,8,'rgba(0,0,0,.18)');}break;}
  case 'crane':rect(ctx,x,GROUND-70,5,70,PAL.o);outline(ctx,x,GROUND-70,5,70);rect(ctx,x-30,GROUND-70,70,4,PAL.o);outline(ctx,x-30,GROUND-70,70,4);rect(ctx,x+30,GROUND-66,1,20+Math.sin(t)*6,PAL.k);rect(ctx,x+26,GROUND-46+Math.sin(t)*6,9,6,PAL.b);break;
  case 'hydrant':rect(ctx,x,GROUND-8,4,8,PAL.r);rect(ctx,x-1,GROUND-9,6,2,PAL.r);break;
}}
function drawFar(ctx,camX,W,pal,name){const p=0.35;const off=Math.floor(camX*p);ctx.fillStyle=pal.far2;
  if(name==='town'||name==='home'){for(let i=Math.floor(off/60)-1;i<(off+W)/60+1;i++){const bx=i*60-off;const hh=20+rnd(i+100)*22;ctx.fillStyle=pal.far2;ctx.fillRect(bx,GROUND-hh,42,hh);if(rnd(i)>.6){ctx.fillStyle=pal.far;circle(ctx,bx+21,GROUND-hh-4,9,pal.far);ctx.fillRect(bx+20,GROUND-hh-16,2,6);}else{ctx.fillStyle=pal.far;ctx.fillRect(bx+8,GROUND-hh-8,26,8);}}}
  else if(name==='sea'){for(let i=0;i<60;i++){const sx=(i*137+13)%(W+200)-100,sy=(i*61)%(GROUND-60);ctx.fillStyle=(Math.floor(i+performance.now()/400)%7===0)?'#FFF':'#B9C4FF';ctx.fillRect(sx,sy,1,1);}circle(ctx,W-40,28,9,'#FFF1B0');}
  else if(name==='port'){for(let i=Math.floor(off/90)-1;i<(off+W)/90+1;i++){const bx=i*90-off;ctx.fillStyle=pal.far;ctx.fillRect(bx,GROUND-58,4,58);ctx.fillRect(bx-24,GROUND-58,60,3);ctx.fillRect(bx+20,GROUND-40,6,40);}}
  else{for(let i=Math.floor(off/34)-1;i<(off+W)/34+1;i++){const bx=i*34-off;const hh=(name==='usa'?40:22)+rnd(i+300)*(name==='usa'?60:26);ctx.fillStyle=(i%2)?pal.far:pal.far2;ctx.fillRect(bx,GROUND-hh,30,hh);ctx.fillStyle='rgba(255,255,220,.35)';for(let r=0;r<hh-6;r+=8)for(let c=0;c<3;c++)if(rnd(i*7+r+c)>.5)ctx.fillRect(bx+4+c*9,GROUND-hh+4+r,4,4);}}}
function drawSea(ctx,camX,W,t){rect(ctx,0,GROUND-30,W,H-GROUND+30,'#1F6FA8');for(let i=0;i<W+20;i+=10){const y=GROUND-26+Math.sin((i+camX)/12+t*3)*2;rect(ctx,i-((camX)%10),y,6,2,'#63B3E4');}for(let i=0;i<W+20;i+=14){const y=GROUND-8+Math.sin((i+camX)/9+t*2.4)*2;rect(ctx,i-((camX*1.2)%14),y,8,2,'#3F8FC8');}}
function drawShip(ctx,x,y){rect(ctx,x,y,96,22,PAL.R);outline(ctx,x,y,96,22);rect(ctx,x-6,y+4,8,18,PAL.R);rect(ctx,x+10,y-6,70,6,PAL.l);outline(ctx,x+10,y-6,70,6);rect(ctx,x+60,y-24,20,18,PAL.l);outline(ctx,x+60,y-24,20,18);rect(ctx,x+64,y-20,4,4,'#8ED0F5');rect(ctx,x+72,y-20,4,4,'#8ED0F5');rect(ctx,x+68,y-32,6,8,PAL.k);rect(ctx,x+67,y-27,8,2,PAL.r);const cols=[PAL.o,PAL.g,PAL.b,PAL.v];for(let i=0;i<4;i++){rect(ctx,x+14+i*11,y-14,10,8,cols[i]);outline(ctx,x+14+i*11,y-14,10,8);}for(let i=0;i<3;i++){rect(ctx,x+20+i*11,y-22,10,8,cols[(i+2)%4]);outline(ctx,x+20+i*11,y-22,10,8);}}
function drawClouds(ctx,camX,W){const off=camX*0.15;for(const c of CLOUDS){const x=((c.x-off)%(W+400)+W+400)%(W+400)-200;rect(ctx,x,c.y,c.w,6,'rgba(255,255,255,.85)');rect(ctx,x+4,c.y-4,c.w-8,4,'rgba(255,255,255,.85)');rect(ctx,x-3,c.y+2,c.w+6,3,'rgba(255,255,255,.85)');}}

