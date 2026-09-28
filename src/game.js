/* The Journey of One Box · amyra-ind-usa-export · MIT License · https://games.edock.io/amyra-ind-usa-export */
/* ============ GAME STATE + UI ============ */
const $=s=>document.querySelector(s);
const panel=$('#panel'),overlay=$('#overlay'),toastEl=$('#toast'),popEl=$('#pop'),hintEl=$('#hint'),view=$('#view'),trackEl=$('#track');
const canvas=$('#game'),ctx=canvas.getContext('2d');
const SAVE_KEY='one-box-save-v2';
/* The written guide sits in guide/ next to the game. Hosts that cannot serve it (a local file, a Claude artifact) use the public copy. */
const GUIDE_URL=(()=>{try{if(/^https?:$/.test(location.protocol)&&/\/(index\.html)?$/.test(location.pathname)&&!/claude/.test(location.hostname))return new URL('guide/',location.href).href;}catch(e){}return 'https://games.edock.io/amyra-ind-usa-export/guide/';})();
const START_WALLET=500000,SEA0=2500,SEA1=3000,WORLD_W=4200,START_X=30;
const fmtINR=n=>{const neg=n<0;n=Math.abs(Math.round(n));let s=String(n);if(s.length>3){const last=s.slice(-3);let rest=s.slice(0,-3);rest=rest.replace(/\B(?=(\d{2})+(?!\d))/g,',');s=rest+','+last;}return (neg?'\u2212':'')+'\u20B9'+s;};
const fmtUSD=n=>'$'+(Math.abs(n)>=1000?Math.round(n).toLocaleString('en-US'):n.toFixed(2));
const both=n=>fmtUSD(n)+' ('+fmtINR(n*FX)+')';
let S=null,steps=[],walking=false,hurry=false,manual=0,arrived=false,toastT=null,applied=null,trackBuilt=false;
function fresh(){return {product:null,brand:'',wallet:START_WALLET,spent:0,weeks:1,stamps:[],station:0,stepIdx:0,px:START_X,done:false,started:false};}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));}catch(e){}}
function load(){try{const j=localStorage.getItem(SAVE_KEY);return j?JSON.parse(j):null;}catch(e){return null;}}
function getMuted(){try{return localStorage.getItem('one-box-muted')==='1';}catch(e){return false;}}
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
function hud(){$('#hud-spent').textContent=fmtINR(S.spent);$('#hud-week').textContent=String(S.weeks);$('#hud-week').nextElementSibling.textContent=S.weeks===1?'week':'weeks';$('#hud-wallet').textContent=fmtINR(S.wallet);$('#hud-stamps').textContent=S.stamps.length;updateTrack();}
function buildTrack(){trackEl.innerHTML='';STATIONS.forEach((st,i)=>{const b=el('button','tk');b.title=(i+1)+'. '+st.name;b.setAttribute('aria-label',b.title);b.appendChild(iconEl(st.icon,2));b.addEventListener('click',()=>{const status=i<S.station?'done':i===S.station?(arrived?'you are here':'next stop'):'later';toast((i+1)+'. '+st.name.toUpperCase()+' \u00B7 '+status.toUpperCase(),2200);AudioKit.sfx.blip();});trackEl.appendChild(b);});trackBuilt=true;}
function updateTrack(){if(!trackBuilt)return;const ks=trackEl.children;for(let i=0;i<ks.length;i++)ks[i].className='tk'+(i<S.station?' done':i===S.station?' cur':'');}
function toast(msg,ms){toastEl.textContent=msg;toastEl.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>toastEl.classList.remove('show'),ms||1800);}
function spend(n){if(!n)return;S.wallet-=n;S.spent+=n;hud();const w=$('#hud-spent');w.style.color='#FFF';setTimeout(()=>w.style.color='',450);}
function addWeeks(n){if(!n)return;S.weeks+=n;hud();}
function earn(id){if(!STAMPS[id]||S.stamps.includes(id))return false;S.stamps.push(id);hud();AudioKit.sfx.stamp();popEl.innerHTML='';popEl.appendChild(el('div',null,STAMPS[id][0].toUpperCase()));popEl.appendChild(el('small',null,'stamp earned'));popEl.classList.remove('show');void popEl.offsetWidth;popEl.classList.add('show');setTimeout(()=>popEl.classList.remove('show'),1500);return true;}
function computeSteps(){const st=STATIONS[S.station];steps=typeof st.steps==='function'?st.steps(S):st.steps;}

/* ---- cards ---- */
function cardShell(st){panel.innerHTML='';const c=el('div','card');const head=el('div','card-head');head.appendChild(iconEl(st.icon,3));const tt=el('div');tt.appendChild(el('div','card-title',st.title));tt.appendChild(el('div','card-sub',st.sub));head.appendChild(tt);c.appendChild(head);panel.appendChild(c);panel.scrollTop=0;return c;}
function banner(c,st){if(!st.detail)return;const d=el('div','detail',st.detail);const b=el('button','more','Hide the explanation');b.addEventListener('click',()=>{d.hidden=!d.hidden;b.textContent=d.hidden?'Show the explanation':'Hide the explanation';AudioKit.sfx.blip();});c.appendChild(d);c.appendChild(b);}
function sayBox(c,text,kind,cost,weeks){let s=c.querySelector('.say');if(!s){s=el('div','say');c.appendChild(s);}s.className='say '+kind;s.innerHTML='';s.appendChild(iconEl(kind==='bad'?'cross':kind==='meh'?'clock':'check',3));const d=el('div');d.appendChild(el('div',null,text));const bits=[];if(cost)bits.push('\u2212'+fmtINR(cost));if(weeks)bits.push('+'+weeks+(weeks===1?' week':' weeks'));if(bits.length)d.appendChild(el('div','bits',bits.join('   \u00B7   ')));s.appendChild(d);s.scrollIntoView({block:'nearest',behavior:'smooth'});}
function actions(c,list){let a=c.querySelector('.actions');if(a)a.remove();a=el('div','actions');list.forEach(([label,cls,fn,icon])=>{const b=el('button','btn '+(cls||''));if(icon)b.appendChild(iconEl(icon,2));b.appendChild(document.createTextNode(label));b.addEventListener('click',()=>{AudioKit.sfx.blip();fn();});a.appendChild(b);});c.appendChild(a);return a;}

function renderStep(){const st=STATIONS[S.station];const step=steps[S.stepIdx];applied=null;if(!step){finishStation();return;}
  const c=cardShell(st);banner(c,st);
  if(step.kind==='product'){c.appendChild(el('div','card-line','Tap the one your box will carry. You can change your mind before Next.'));const g=el('div','products');Object.keys(PRODUCTS).forEach(k=>{const p=PRODUCTS[k];const b=el('button','prod'+(S.product===k?' sel':''));b.appendChild(iconEl(p.sprite,4));b.appendChild(el('div','lbl',p.name));b.appendChild(el('div','price',both(p.price)));b.appendChild(el('div','tag',p.tag));
      b.addEventListener('click',()=>{S.product=k;AudioKit.sfx.coin();g.querySelectorAll('.prod').forEach(x=>x.classList.toggle('sel',x===b));sayBox(c,p.name+'. Factory cost about '+fmtINR(p.cost)+' a piece, sells for '+both(p.price)+' on Amazon USA.','good');actions(c,[['Next','go',next]]);save();});g.appendChild(b);});c.appendChild(g);
    if(S.product){const p=PRODUCTS[S.product];sayBox(c,p.name+'. Factory cost about '+fmtINR(p.cost)+' a piece, sells for '+both(p.price)+' on Amazon USA.','good');actions(c,[['Next','go',next]]);}return;}
  if(step.kind==='brand'){c.appendChild(el('div','card-line','Name your brand. It goes on every box.'));const row=el('div','brand-in');const inp=el('input');inp.id='brand-input';inp.maxLength=14;inp.placeholder='BRAND NAME';inp.value=S.brand||['KARIGAR','MITTI','SAFAR','DESI ROOTS'][Math.floor(Math.random()*4)];row.appendChild(inp);c.appendChild(row);
    const go=()=>{const v=inp.value.trim().toUpperCase().slice(0,14);if(!v){inp.focus();return;}S.brand=v;inp.disabled=true;AudioKit.sfx.coin();sayBox(c,'Searched the US trademark database: '+v+' is free in your class.','good');actions(c,[['Rename','sec',()=>{inp.disabled=false;inp.focus();const s=c.querySelector('.say');if(s)s.remove();actions(c,[['Name it','',go]]);}],['Next','go',next]]);save();};
    inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!inp.disabled)go();});actions(c,[['Name it','',go]]);return;}
  if(step.kind==='end'){showEnd(true);doneCard();return;}
  c.appendChild(el('div','card-line',step.prompt));
  const grid=el('div','choices'+(step.one||step.choices.length===1?' one':''));
  step.choices.forEach(ch=>{const b=el('button','choice');if(ch.photo)b.appendChild(photoCanvas(PRODUCTS[S.product].sprite,ch.photo));else b.appendChild(iconEl(ch.icon||'doc',3));b.appendChild(el('div','lbl',ch.label));
    if(ch.meta){const m=el('div','meta');ch.meta.forEach(([ic,n])=>{const w=el('span');for(let i=0;i<n;i++)w.appendChild(iconEl(ic,1));m.appendChild(w);});b.appendChild(m);}
    b.addEventListener('click',()=>pick(c,grid,step,ch,b));grid.appendChild(b);});
  c.appendChild(grid);}
function pick(c,grid,step,ch,btn){const cost=typeof ch.cost==='function'?ch.cost(S):(ch.cost||0);
  if(ch.ok===false){AudioKit.sfx.error();btn.classList.add('bad');btn.disabled=true;if(ch.penalty)spend(ch.penalty);if(ch.weeks)addWeeks(ch.weeks);sayBox(c,ch.say,'bad',ch.penalty||0,ch.weeks||0);c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake');save();return;}
  grid.querySelectorAll('.choice').forEach(x=>x.disabled=true);btn.classList.add(ch.ok===true?'ok':'meh');
  const prev={};if(ch.set)for(const k in ch.set){prev[k]=S[k];S[k]=ch.set[k];}
  if(cost)spend(cost);if(ch.weeks)addWeeks(ch.weeks);
  const newStamp=(ch.stamp&&earn(ch.stamp))?ch.stamp:null;
  applied={cost,weeks:ch.weeks||0,prev,set:ch.set,stamp:newStamp};
  AudioKit.sfx[ch.ok===true?'coin':'blip']();sayBox(c,ch.say,ch.ok===true?'good':'meh',cost,ch.weeks||0);
  const last=S.stepIdx>=steps.length-1;actions(c,[['Change','sec',()=>undo(c,grid)],[last?'Done here':'Next','go',next]]);save();}
function undo(c,grid){if(!applied)return;const a=applied;applied=null;if(a.cost){S.wallet+=a.cost;S.spent-=a.cost;}if(a.weeks)S.weeks-=a.weeks;if(a.set)for(const k in a.set){if(a.prev[k]===undefined)delete S[k];else S[k]=a.prev[k];}if(a.stamp){const i=S.stamps.indexOf(a.stamp);if(i>-1)S.stamps.splice(i,1);}
  hud();grid.querySelectorAll('.choice').forEach(x=>{if(!x.classList.contains('bad'))x.disabled=false;x.classList.remove('ok','meh');});const s=c.querySelector('.say');if(s)s.remove();const ac=c.querySelector('.actions');if(ac)ac.remove();save();}
function next(){applied=null;S.stepIdx++;if(S.stepIdx>=steps.length)finishStation();else renderStep();save();}
function finishStation(){S.station++;S.stepIdx=0;arrived=false;hud();save();if(S.station>=STATIONS.length){showEnd(true);doneCard();return;}travelCard();}
function travelCard(){const nxt=STATIONS[S.station];panel.innerHTML='';const c=el('div','card');const head=el('div','card-head');head.appendChild(iconEl('walk',3));const tt=el('div');tt.appendChild(el('div','card-title','Next stop: '+nxt.name));tt.appendChild(el('div','card-sub',nxt.title));head.appendChild(tt);c.appendChild(head);
  const inSea=S.px<SEA0&&nxt.x>SEA1;c.appendChild(el('div','card-line',inSea?'The boxes board the ship. Long crossing ahead.':'Walk on. Hold the right side of the picture, or tap the button.'));
  const a=el('div','actions');const b=el('button','btn walk');b.appendChild(iconEl('walk',2));b.appendChild(document.createTextNode(inSea?'Set sail':'Walk'));
  b.addEventListener('click',()=>{AudioKit.sfx.blip();if(!walking){walking=true;hurry=false;b.textContent='Hurry!';if(inSea)AudioKit.sfx.horn();}else{hurry=true;b.textContent='Hurrying\u2026';}});
  a.appendChild(b);c.appendChild(a);panel.appendChild(c);panel.scrollTop=0;hintEl.classList.add('show');setTimeout(()=>hintEl.classList.remove('show'),3500);}
function arrive(){arrived=true;walking=false;hurry=false;const st=STATIONS[S.station];S.px=st.x-6;computeSteps();S.stepIdx=Math.min(S.stepIdx,steps.length-1);toast(st.name.toUpperCase());AudioKit.sfx.blip();hud();renderStep();save();}
function doneCard(){panel.innerHTML='';const c=el('div','card');const head=el('div','card-head');head.appendChild(iconEl('heart',3));const tt=el('div');tt.appendChild(el('div','card-title','Journey complete'));tt.appendChild(el('div','card-sub',(S.brand||'Your brand')+' went from a workshop in India to a home in America and the money came back.'));head.appendChild(tt);c.appendChild(head);
  c.appendChild(sessionPromo('end-card'));
  c.appendChild(el('div','card-line','Your results stay here. Close them, reopen them, or start over with another product.'));
  actions(c,[['See results','sec',()=>showEnd(false),'rupee'],['Passport','sec',showPassport,'stampbook'],['Play again, new product','go',restart,'walk']]);panel.appendChild(c);}
/* Links to Edock carry UTM tags so edock.io's analytics can see the visit came from this game.
   The game itself sends nothing. */
function tagged(url,campaign,placement){try{const u=new URL(url);u.searchParams.set('utm_source',GAME_ID);u.searchParams.set('utm_medium','game');u.searchParams.set('utm_campaign',campaign);u.searchParams.set('utm_content',placement);if(S&&S.product)u.searchParams.set('utm_term',S.product);return u.toString();}catch(e){return url;}}
function sessionPromo(placement){const live=Date.now()<Date.parse(SESSION.endsAt);const box=el('div','promo');
  box.appendChild(el('div','eyebrow','YOU MADE IT TO THE END'));
  box.appendChild(el('div','pitch',live?'That means you will enjoy our live online session. Ask real exporters everything this game could not answer.':'Keep going with Edock\u2019s live sessions, where people who export for real answer your questions.'));
  if(live){const ev=el('div','ev');const cal=el('div','cal');cal.appendChild(el('b',null,SESSION.month));cal.appendChild(el('span',null,SESSION.day));ev.appendChild(cal);const info=el('div');info.appendChild(el('div','ev-t',SESSION.title));info.appendChild(el('div','ev-m',SESSION.when));info.appendChild(el('div','ev-m',SESSION.host));ev.appendChild(info);box.appendChild(ev);}
  const a=el('a','cta');a.href=live?tagged(SESSION.url,SESSION.campaign,placement):tagged(SESSION.allUrl,SESSION.allCampaign,placement);a.target='_blank';a.rel='noopener';a.appendChild(iconEl('ticket',2));a.appendChild(document.createTextNode(live?'Save my seat \u00B7 from '+SESSION.price:'See upcoming sessions'));a.addEventListener('click',()=>AudioKit.sfx.coin());box.appendChild(a);
  box.appendChild(el('div','fine','Opens edock.io in a new tab.'));return box;}
function restart(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}closeOv();start(null);}

/* ---- overlays ---- */
function ov(closable){overlay.innerHTML='';const box=el('div','ov');if(closable){const x=el('button','x','\u2715');x.title='Close';x.setAttribute('aria-label','Close');x.addEventListener('click',()=>{AudioKit.sfx.blip();closeOv();});box.appendChild(x);}overlay.appendChild(box);overlay.classList.add('show');overlay.scrollTop=0;return box;}
function closeOv(){overlay.classList.remove('show');overlay.innerHTML='';}
function logoCanvas(){const c=document.createElement('canvas');c.width=192;c.height=72;const x=c.getContext('2d');x.imageSmoothingEnabled=false;const g=x.createLinearGradient(0,0,0,72);g.addColorStop(0,'#7EC8F2');g.addColorStop(1,'#FFE2A8');x.fillStyle=g;x.fillRect(0,0,192,72);x.fillStyle='#C9A46A';x.fillRect(0,56,192,16);x.fillStyle='#6B5A45';x.fillRect(0,62,192,10);for(let i=0;i<192;i+=12){x.fillStyle='#FFE66D';x.fillRect(i,66,6,1);}
  x.save();x.translate(0,56-GROUND);drawBuilding(x,30,{type:'shop',w:40,h:30,wall:'#F7D9A6',accent:'#E8563F'},0);x.restore();drawMap(x,MAPS.player0,86,38,1);drawShip(x,120,44);x.fillStyle='rgba(31,111,168,.9)';x.fillRect(110,58,82,14);txt(x,'THE JOURNEY',96,8,'#1B1B24',8,'center');txt(x,'OF ONE BOX',96,20,'#B93A27',8,'center');return c;}
function showTitle(saved){const b=ov(false);const lg=logoCanvas();lg.className='logo';b.appendChild(lg);b.appendChild(el('h1',null,'From an Indian workshop to an American doorstep'));b.appendChild(el('p',null,'Carry one box through 17 stops. Tap, pick, stamp. Every price is in dollars and rupees. Music plays, so turn the sound up or tap the speaker to mute.'));
  const a=el('div','actions');const hasSave=saved&&saved.product&&!saved.done;
  if(hasSave){const c=el('button','btn go','Continue');c.addEventListener('click',()=>start(saved));a.appendChild(c);}
  const n=el('button','btn'+(hasSave?' sec':''),hasSave?'New game':'Tap to start');n.addEventListener('click',()=>start(null));a.appendChild(n);b.appendChild(a);
  b.appendChild(el('div','credits','A plain-words game about exporting from India and selling on Amazon USA. Example numbers at \u20B984 per dollar, not advice. Free and open source under the MIT license.'));}
function showPassport(){const b=ov(true);b.appendChild(el('h2',null,'Passport \u00B7 '+S.stamps.length+' / '+Object.keys(STAMPS).length+' stamps'));b.appendChild(el('p',null,'Tap a stamp to see what it means.'));const g=el('div','pass');
  Object.keys(STAMPS).forEach((id,i)=>{const got=S.stamps.includes(id);const s=el('div','stamp'+(got?' got':''));s.style.setProperty('--rot',((i*37)%9-4)+'deg');const seal=el('div','seal');seal.style.color=got?['#B93A27','#2F63B0','#2E9A4B','#D98C1F'][i%4]:'';seal.appendChild(document.createTextNode(id));seal.appendChild(el('small',null,STAMPS[id][0]));s.appendChild(seal);s.tabIndex=0;const show=()=>{$('#stamp-say').textContent=(got?'':'Not yet. ')+STAMPS[id][0]+': '+STAMPS[id][1];AudioKit.sfx.blip();};s.addEventListener('click',show);s.addEventListener('keydown',e=>{if(e.key==='Enter')show();});g.appendChild(s);});
  b.appendChild(g);const say=el('div');say.id='stamp-say';say.textContent='Every official word in this journey, collected as a stamp.';b.appendChild(say);
  const a=el('div','actions');const c=el('button','btn','Back to the road');c.addEventListener('click',()=>{AudioKit.sfx.blip();closeOv();});a.appendChild(c);
  const r=el('button','btn sec danger','Restart journey');r.addEventListener('click',()=>{AudioKit.sfx.blip();a.innerHTML='';const y=el('button','btn danger','Yes, start over');y.addEventListener('click',restart);const n=el('button','btn sec','Keep going');n.addEventListener('click',()=>{AudioKit.sfx.blip();closeOv();});a.appendChild(y);a.appendChild(n);});a.appendChild(r);b.appendChild(a);}
function showEnd(fresh){S.done=true;save();if(fresh)AudioKit.sfx.win();const p=PRODUCTS[S.product];const gross=UNITS*p.price,amz=gross*0.15,fba=p.fba*UNITS,conv=(gross-amz-fba)*0.03,netUSD=gross-amz-fba-conv,netINR=Math.round(netUSD*FX);const refund=S.taxLocked?Math.round(prodCost(S)*0.18):0;const final=S.wallet+netINR+refund;const delta=final-START_WALLET;
  const perBatch=prodCost(S)+9000+(S.air?90000:35000)+dutyINR(S)+25000+20000+10200;const nextProfit=netINR-perBatch;
  const b=ov(true);b.appendChild(el('h1',null,(S.brand||'Your box')+' made it home'));b.appendChild(el('p',null,'300 units of '+p.name.toLowerCase()+' sold in the USA at '+both(p.price)+' each. Here is where the dollars went.'));
  const m=el('div','money');const bar=el('div','bar');const cols=['#E8563F','#F2A93B','#7B5CD6','#4CC96A'];[[amz],[fba],[conv],[netUSD]].forEach(([v],i)=>{const it=document.createElement('i');it.style.width=(v/gross*100)+'%';it.style.background=cols[i];bar.appendChild(it);});m.appendChild(bar);
  const lg=el('div','legend');[['Amazon fee',0],['Warehouse + delivery',1],['Currency change',2],['Yours',3]].forEach(([k,i])=>{const s=el('span');const sw=el('i');sw.style.background=cols[i];s.appendChild(sw);s.appendChild(document.createTextNode(k));lg.appendChild(s);});m.appendChild(lg);
  [['Customers paid',both(gross),''],['Amazon\u2019s 15% cut','\u2212'+both(amz),'neg'],['Warehouse and delivery fee','\u2212'+both(fba),'neg'],['Dollars to rupees, 3%','\u2212'+both(conv),'neg'],['Landed in your bank',fmtINR(netINR)+' ('+fmtUSD(netUSD)+')','pos']].forEach(([k,v,cls])=>{const r=el('div','row');r.appendChild(el('span',null,k));r.appendChild(el('span',cls,v));m.appendChild(r);});b.appendChild(m);
  const g=el('div','endgrid');[['You started with',fmtINR(START_WALLET),''],['You spent',fmtINR(S.spent),'neg'],['First batch result',(delta>=0?'+':'')+fmtINR(delta),delta>=0?'pos':'neg'],['Next batch, same 300 units',(nextProfit>=0?'+':'')+fmtINR(nextProfit),nextProfit>=0?'pos':'neg'],['Weeks on the road',String(S.weeks),''],['Stamps collected',S.stamps.length+' / '+Object.keys(STAMPS).length,'']].forEach(([k,v,cls])=>{const t=el('div','tile');t.appendChild(el('div','k',k));t.appendChild(el('div','v '+cls,v));g.appendChild(t);});b.appendChild(g);
  b.appendChild(el('p',null,delta>=0?'The first batch already paid for the setup. Everything from here is easier.':'The first batch paid for the setup: trademark, tests, photos, bond. Those never repeat. The next batch is where the profit lives.'));
  if(refund)b.appendChild(el('p',null,'Your 18% tax deposit came back after 7 months: '+fmtINR(refund)+'.'));
  b.appendChild(sessionPromo('end-results'));
  const a=el('div','actions');const pp=el('button','btn sec','Passport');pp.addEventListener('click',()=>{AudioKit.sfx.blip();showPassport();});a.appendChild(pp);const ag=el('button','btn go','Play again, new product');ag.addEventListener('click',()=>{AudioKit.sfx.blip();restart();});a.appendChild(ag);b.appendChild(a);
  const cr=el('div','credits');cr.innerHTML='Example numbers at \u20B984 per dollar. Rules and duty rates change; check before you spend. <a href="'+GUIDE_URL+'" target="_blank" rel="noopener">Read the full written guide</a>.';b.appendChild(cr);}

/* ============ LOOP + INPUT ============ */
let W=320,scale=2,camX=0,lastT=0,tt=0,curSong='',stepT=0;
function resize(){const r=view.getBoundingClientRect();if(!r.height)return;const dpr=Math.min(3,window.devicePixelRatio||1);const k=Math.max(2,Math.min(6,Math.round(r.height*dpr/H)));scale=k/dpr;W=Math.ceil(r.width/scale);const cssH=H*scale;canvas.width=W*k;canvas.height=H*k;canvas.style.width=(W*scale)+'px';canvas.style.height=cssH+'px';canvas.style.top=(r.height-cssH)+'px';ctx.setTransform(k,0,0,k,0,0);ctx.imageSmoothingEnabled=false;}
window.addEventListener('resize',resize);
function frameName(){return (walking||manual)?(Math.floor(tt*8)%2?'player1':'player0'):'player0';}
function drawArrow(c,x,y){c.fillStyle=PAL.k;c.fillRect(x-6,y,12,4);c.fillRect(x-4,y+4,8,3);c.fillRect(x-2,y+7,4,3);c.fillStyle=PAL.o;c.fillRect(x-5,y+1,10,2);c.fillRect(x-3,y+3,6,3);c.fillRect(x-1,y+6,2,3);}
function update(dt){if(!S||!S.started)return;const target=STATIONS[Math.min(S.station,STATIONS.length-1)];const sea=S.px>=SEA0&&S.px<SEA1;
  let v=0;if(walking)v=(hurry?200:95)*(sea?1.9:1);else if(manual)v=manual*85;
  if(v){const maxX=target.x-6;const nx=Math.max(20,Math.min(S.px+v*dt,maxX));if(nx!==S.px){S.px=nx;if(!sea){stepT+=dt;if(stepT>0.28){stepT=0;AudioKit.sfx.step();}}}
    if(!arrived&&S.station<STATIONS.length&&S.px>=maxX-0.01)arrive();}
  const rg=REGIONS[regionAt(S.px)];if(rg.song!==curSong){curSong=rg.song;AudioKit.play(curSong);}
  camX=Math.max(0,Math.min(S.px-W*0.35,WORLD_W-W));}
function draw(){const px0=S?S.px:START_X;const pal=paletteAt(px0);view.style.background=pal.top;
  const g=ctx.createLinearGradient(0,0,0,GROUND);g.addColorStop(0,pal.top);g.addColorStop(1,pal.bot);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const sea=pal.name==='sea';drawFar(ctx,camX,W,pal,pal.name);if(!sea)drawClouds(ctx,camX,W);
  if(sea)drawSea(ctx,camX,W,tt);else{rect(ctx,0,GROUND,W,H-GROUND,pal.ground);rect(ctx,0,GROUND+9,W,H-GROUND-9,pal.road);for(let x=-(camX%16);x<W;x+=16)rect(ctx,x,GROUND+16,8,1,'#FFE66D');}
  for(const p of PROPS){const sx=p.x-camX;if(sx<-80||sx>W+80)continue;drawProp(ctx,sx,p,tt);}
  const cur=S?S.station:0;
  STATIONS.forEach((st,i)=>{const sx=st.x-camX;if(sx<-140||sx>W+140)return;drawBuilding(ctx,sx,st.building,tt);
    if(i<cur){rect(ctx,sx+16,GROUND-st.building.h-16,1,14,PAL.k);rect(ctx,sx+17,GROUND-st.building.h-16,8,6,PAL.g);rect(ctx,sx+18,GROUND-st.building.h-14,3,1,PAL.w);}
    else if(i===cur&&!arrived&&S)drawArrow(ctx,sx,GROUND-st.building.h-30+Math.sin(tt*6)*3);});
  const px=px0-camX;
  if(sea){drawShip(ctx,px-40,GROUND-14);drawMap(ctx,MAPS[frameName()],px-6,GROUND-38,1);}else drawMap(ctx,MAPS[frameName()],px-6,GROUND-18,1);
  if(S&&S.brand){ctx.fillStyle='rgba(27,27,36,.75)';ctx.fillRect(px-18,GROUND-32,36,9);txt(ctx,S.brand.slice(0,8),px,GROUND-30,'#FFE66D',5,'center');}}
function frame(ts){const dt=Math.min(0.05,(ts-lastT)/1000||0);lastT=ts;tt+=dt;update(dt);draw();requestAnimationFrame(frame);}

window.addEventListener('keydown',e=>{if(e.repeat)return;const k=e.key;
  if(k==='ArrowRight'||k==='d'||k==='D'){manual=1;e.preventDefault();}
  else if(k==='ArrowLeft'||k==='a'||k==='A'){manual=-1;e.preventDefault();}
  else if((k==='Enter'||k===' ')&&!overlay.classList.contains('show')&&document.activeElement.tagName!=='INPUT'&&document.activeElement.tagName!=='BUTTON'){const b=panel.querySelector('.btn.go, .btn.walk, .choices.one .choice:not(:disabled)');if(b){e.preventDefault();b.click();}}
  else if(k==='Escape'&&overlay.querySelector('.ov .x')){closeOv();}});
window.addEventListener('keyup',e=>{if(['ArrowRight','d','D','ArrowLeft','a','A'].includes(e.key))manual=0;});
view.addEventListener('pointerdown',e=>{if(!S||!S.started)return;const r=view.getBoundingClientRect();manual=(e.clientX-r.left)>r.width/2?1:-1;try{view.setPointerCapture(e.pointerId);}catch(err){}});
['pointerup','pointercancel','pointerleave'].forEach(ev=>view.addEventListener(ev,()=>{manual=0;}));
window.addEventListener('blur',()=>{manual=0;});
$('#btn-pass').addEventListener('click',()=>{if(!S||!S.started)return;AudioKit.sfx.blip();if(overlay.querySelector('.ov .x'))closeOv();else if(!overlay.classList.contains('show'))showPassport();});
function setMuteUI(m){const b=$('#btn-mute');b.setAttribute('aria-pressed',m?'false':'true');b.title=m?'Music is off. Tap to turn on.':'Music is on. Tap to mute.';const c=b.querySelector('canvas');const s=iconCanvas(m?'mute':'note',3);c.width=s.width;c.height=s.height;c.getContext('2d').drawImage(s,0,0);}
$('#btn-mute').addEventListener('click',()=>{const m=!AudioKit.isMuted();AudioKit.setMuted(m);try{localStorage.setItem('one-box-muted',m?'1':'0');}catch(e){}setMuteUI(m);if(!m)AudioKit.sfx.blip();});
function start(saved){AudioKit.init();closeOv();S=saved||fresh();S.started=true;walking=false;hurry=false;manual=0;arrived=false;applied=null;curSong='';if(!trackBuilt)buildTrack();hud();
  if(S.station>=STATIONS.length||S.done){S.station=Math.min(S.station,STATIONS.length-1);showEnd(false);doneCard();return;}
  const target=STATIONS[S.station];if(S.px>=target.x-6-0.01){S.px=target.x-6;arrive();}else travelCard();save();}

/* boot */
AudioKit.setMuted(getMuted());setMuteUI(getMuted());resize();requestAnimationFrame(frame);
const savedGame=load();showTitle(savedGame&&savedGame.product&&!savedGame.done?savedGame:null);
