/* The Journey of One Box · amyra-ind-usa-export · MIT License · https://games.edock.io/amyra-ind-usa-export */
/* ============ GAME STATE + UI ============ */
const $=s=>document.querySelector(s);
const panel=$('#panel'),overlay=$('#overlay'),toastEl=$('#toast'),popEl=$('#pop'),hintEl=$('#hint'),view=$('#view'),trackEl=$('#track');
const canvas=$('#game'),ctx=canvas.getContext('2d');
const SAVE_KEY='one-box-save-v2',BEST_KEY='one-box-best';
/* The written guide sits in guide/ next to the game. Hosts that cannot serve it (a local file, a Claude artifact) use the public copy. */
const GUIDE_URL=(()=>{try{if(/^https?:$/.test(location.protocol)&&/\/(index\.html)?$/.test(location.pathname)&&!/claude/.test(location.hostname))return new URL('guide/',location.href).href;}catch(e){}return 'https://games.edock.io/amyra-ind-usa-export/guide/';})();
const START_WALLET=500000,SEA0=2500,SEA1=3000,WORLD_W=4200,START_X=30;
const fmtINR=n=>{const neg=n<0;n=Math.abs(Math.round(n));let s=String(n);if(s.length>3){const last=s.slice(-3);let rest=s.slice(0,-3);rest=rest.replace(/\B(?=(\d{2})+(?!\d))/g,',');s=rest+','+last;}return (neg?'\u2212':'')+'\u20B9'+s;};
const fmtUSD=n=>'$'+(Math.abs(n)>=1000?Math.round(n).toLocaleString('en-US'):n.toFixed(2));
const both=n=>fmtUSD(n)+' ('+fmtINR(n*FX)+')';
let S=null,steps=[],walking=false,hurry=false,manual=0,arrived=false,toastT=null,trackBuilt=false,reopen=null,evSound='',card=null;
function fresh(){const s={product:null,brand:'',wallet:START_WALLET,spent:0,weeks:1,stamps:[],station:0,stepIdx:0,px:START_X,done:false,started:false,
  year:1,yearStart:START_WALLET,seed:Math.floor(Math.random()*1e9),mistakes:0,mehs:0,wrong:[],pending:null,history:[]};s.events=pickEvents(s);return s;}
/* Saves from before surprises, scores and years get the new fields. They get no surprises from the
   pool, because a surprise added to a stop the player is standing at would shift its steps. */
function upgrade(s){if(!s)return s;if(s.year==null)s.year=1;if(s.yearStart==null)s.yearStart=START_WALLET;if(s.seed==null)s.seed=Math.floor(Math.random()*1e9);if(!s.events)s.events=[];if(!s.wrong)s.wrong=[];if(s.mistakes==null)s.mistakes=0;if(s.mehs==null)s.mehs=0;if(!s.history)s.history=[];return s;}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));}catch(e){}}
function load(){try{const j=localStorage.getItem(SAVE_KEY);return j?upgrade(JSON.parse(j)):null;}catch(e){return null;}}
function getMuted(){try{return localStorage.getItem('one-box-muted')==='1';}catch(e){return false;}}
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;}
function hud(){$('#hud-spent').textContent=fmtINR(S.spent);$('#hud-week').textContent=String(S.weeks);$('#hud-week').nextElementSibling.textContent=t(S.weeks===1?'week':'weeks');$('#hud-wallet').textContent=fmtINR(S.wallet);$('#hud-stamps').textContent=S.stamps.length;updateTrack();}
function buildTrack(){trackEl.innerHTML='';STATIONS.forEach((st,i)=>{const b=el('button','tk');b.title=(i+1)+'. '+t(st.name);b.setAttribute('aria-label',b.title);b.appendChild(iconEl(st.icon,2));b.addEventListener('click',()=>{const status=t(!activeAt(i)?'done last year':i<S.station?'done':i===S.station?(arrived?'you are here':'next stop'):'later');toast((i+1)+'. '+t(st.name).toUpperCase()+' \u00B7 '+status.toUpperCase(),2200);AudioKit.sfx.blip();});trackEl.appendChild(b);});trackBuilt=true;if(S)updateTrack();}
function updateTrack(){if(!trackBuilt)return;const ks=trackEl.children;for(let i=0;i<ks.length;i++)ks[i].className='tk'+(i<S.station||!activeAt(i)?' done':i===S.station?' cur':'');}
function toast(msg,ms){toastEl.textContent=msg;toastEl.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>toastEl.classList.remove('show'),ms||1800);}
function spend(n){if(!n)return;S.wallet-=n;S.spent+=n;hud();const w=$('#hud-spent');w.style.color='#FFF';setTimeout(()=>w.style.color='',450);}
function gain(n){if(!n)return;S.wallet+=n;hud();AudioKit.sfx.cash();}
function addWeeks(n){if(!n)return;S.weeks+=n;hud();}
function earn(id){if(!STAMPS[id]||S.stamps.includes(id))return false;S.stamps.push(id);hud();AudioKit.sfx.stamp();popEl.innerHTML='';popEl.appendChild(el('div',null,t(STAMPS[id][0]).toUpperCase()));popEl.appendChild(el('small',null,t('stamp earned')));popEl.classList.remove('show');void popEl.offsetWidth;popEl.classList.add('show');setTimeout(()=>popEl.classList.remove('show'),1500);return true;}

/* ---- stops, steps and surprises ---- */
/* From year 2 a stop shows its year-2 fields, and a stop without any is passed as already done. */
const stationView=st=>S&&S.year>1&&st.y2?Object.assign({},st,st.y2):st;
const activeAt=i=>!S||S.year<2||!!STATIONS[i].y2;
/* A surprise decides whether it happens when the player reaches it, so it can react to picks made
   earlier at the same stop. `resolve` turns it into a normal step, or null to skip it. */
const resolve=x=>x&&x.lazy?x.lazy(S):x;
function computeSteps(){const st=STATIONS[S.station],v=stationView(st);const base=typeof v.steps==='function'?v.steps(S):v.steps;const y=Math.min(S.year,2);
  const ev=pos=>EVENTS.filter(e=>e.at===st.id&&(e.pos||'start')===pos&&(!e.years||e.years.includes(y))&&(e.auto||(S.events||[]).includes(e.id)))
    .map(e=>({lazy:s=>(e.when&&!e.when(s))?null:Object.assign({event:e},e.step(s))}));
  const end=base.findIndex(x=>x.kind==='end');
  steps=ev('start').concat(end<0?base.concat(ev('end')):base.slice(0,end).concat(ev('end'),base.slice(end)));}
const stepKey=()=>S.year+'|'+S.station+'|'+S.stepIdx;
const choiceKey=ch=>stepKey()+'|'+(Array.isArray(ch.label)?ch.label[0]+JSON.stringify(ch.label[1]):ch.label);
function isLast(){for(let i=S.stepIdx+1;i<steps.length;i++)if(resolve(steps[i]))return false;return true;}

/* ---- cards ---- */
function cardShell(v,ev){panel.innerHTML='';const c=el('div','card'+(ev?' event':''));
  if(ev){const rb=el('div','ribbon');rb.appendChild(iconEl('news',1));rb.appendChild(document.createTextNode(t('SURPRISE!')));c.appendChild(rb);}
  const head=el('div','card-head');head.appendChild(iconEl(ev?ev.icon:v.icon,3));const tt=el('div');tt.appendChild(el('div','card-title',t(ev?ev.title:v.title)));tt.appendChild(el('div','card-sub',ev?tf('Stop {n}: {place}',{n:S.station+1,place:v.name}):t(v.sub)));head.appendChild(tt);c.appendChild(head);panel.appendChild(c);panel.scrollTop=0;return c;}
function banner(c,st){if(!st.detail)return;const d=el('div','detail',t(st.detail));const b=el('button','more',t('Hide the explanation'));b.addEventListener('click',()=>{d.hidden=!d.hidden;b.textContent=t(d.hidden?'Show the explanation':'Hide the explanation');AudioKit.sfx.blip();});c.appendChild(d);c.appendChild(b);}
function sayBox(c,text,kind,cost,weeks,plus){let s=c.querySelector('.say');if(!s){s=el('div','say');c.appendChild(s);}s.className='say '+kind;s.innerHTML='';s.appendChild(iconEl(kind==='bad'?'cross':kind==='meh'?'clock':'check',3));const d=el('div');d.appendChild(el('div',null,tx(text)));const bits=[];if(cost)bits.push('\u2212'+fmtINR(cost));if(plus)bits.push('+'+fmtINR(plus));if(weeks)bits.push('+'+weeks+' '+t(weeks===1?'week':'weeks'));if(bits.length)d.appendChild(el('div','bits',bits.join('   \u00B7   ')));s.appendChild(d);s.scrollIntoView({block:'nearest',behavior:'smooth'});}
function actions(c,list){let a=c.querySelector('.actions');if(a)a.remove();a=el('div','actions');list.forEach(([label,cls,fn,icon])=>{const b=el('button','btn '+(cls||''));if(icon)b.appendChild(iconEl(icon,2));b.appendChild(document.createTextNode(label));b.addEventListener('click',()=>{AudioKit.sfx.blip();fn();});a.appendChild(b);});c.appendChild(a);return a;}

function renderStep(){const st=STATIONS[S.station],v=stationView(st);let step=resolve(steps[S.stepIdx]);
  while(!step&&S.stepIdx<steps.length){S.stepIdx++;step=resolve(steps[S.stepIdx]);}
  if(!step){finishStation();return;}
  if(S.pending&&S.pending.stepKey!==stepKey())S.pending=null;
  const ev=step.event;const c=cardShell(v,ev);if(!ev)banner(c,v);card=c;
  if(ev&&evSound!==stepKey()){evSound=stepKey();AudioKit.sfx.news();}
  if(step.kind==='product'){c.appendChild(el('div','card-line',t('Tap the one your box will carry. You can change your mind before Next.')));const g=el('div','products');
    const sayProduct=p=>sayBox(c,['{name}. Factory cost about {cost} a piece, sells for {price} on Amazon USA.',{name:p.name,cost:fmtINR(p.cost),price:both(p.price)}],'good');
    Object.keys(PRODUCTS).forEach(k=>{const p=PRODUCTS[k];const b=el('button','prod'+(S.product===k?' sel':''));b.appendChild(iconEl(p.sprite,4));b.appendChild(el('div','lbl',t(p.name)));b.appendChild(el('div','price',both(p.price)));b.appendChild(el('div','tag',t(p.tag)));
      b.addEventListener('click',()=>{S.product=k;AudioKit.sfx.coin();g.querySelectorAll('.prod').forEach(x=>x.classList.toggle('sel',x===b));sayProduct(p);actions(c,[[t('Next'),'go',next]]);save();});g.appendChild(b);});c.appendChild(g);
    if(S.product){sayProduct(PRODUCTS[S.product]);actions(c,[[t('Next'),'go',next]]);}return;}
  if(step.kind==='brand'){c.appendChild(el('div','card-line',t('Name your brand. It goes on every box.')));const row=el('div','brand-in');const inp=el('input');inp.id='brand-input';inp.maxLength=14;inp.placeholder=t('BRAND NAME');inp.value=S.brand||['KARIGAR','MITTI','SAFAR','DESI ROOTS'][Math.floor(Math.random()*4)];row.appendChild(inp);c.appendChild(row);
    const named=()=>{inp.disabled=true;sayBox(c,['Searched the US trademark database: {brand} is free in your class.',{brand:S.brand}],'good');actions(c,[[t('Rename'),'sec',()=>{inp.disabled=false;inp.focus();const s=c.querySelector('.say');if(s)s.remove();actions(c,[[t('Name it'),'',go]]);}],[t('Next'),'go',next]]);};
    const go=()=>{const v=inp.value.trim().toUpperCase().slice(0,14);if(!v){inp.focus();return;}S.brand=v;AudioKit.sfx.coin();named();save();};
    inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!inp.disabled)go();});actions(c,[[t('Name it'),'',go]]);return;}
  if(step.kind==='end'){showEnd(true);doneCard();return;}
  c.appendChild(el('div','card-line',tx(step.prompt)));
  if(step.quote)c.appendChild(el('div','quote',tx(step.quote)));
  if(ev&&ev.shield&&S.stamps.includes(ev.shield)){const sh=el('div','shield');sh.appendChild(el('span','mini',ev.shield));sh.appendChild(el('span',null,tf('Your {stamp} stamp protects you here.',{stamp:STAMPS[ev.shield][0]})));c.appendChild(sh);}
  const grid=el('div','choices'+(step.one||step.choices.length===1?' one':''));
  step.choices.forEach(ch=>{const b=el('button','choice');if(ch.photo)b.appendChild(photoCanvas(PRODUCTS[S.product].sprite,ch.photo));else b.appendChild(iconEl(ch.icon||'doc',3));b.appendChild(el('div','lbl',ch.raw?ch.label:tx(ch.label)));
    if(ch.meta){const m=el('div','meta');ch.meta.forEach(([ic,n])=>{const w=el('span');for(let i=0;i<n;i++)w.appendChild(iconEl(ic,1));m.appendChild(w);});b.appendChild(m);}
    if(S.wrong.includes(choiceKey(ch))){b.classList.add('bad');b.disabled=true;}
    b.addEventListener('click',()=>pick(c,grid,step,ch,b));grid.appendChild(b);});
  c.appendChild(grid);
  /* a pick made before a reload or a language switch shows as made, with Change still possible */
  const p=S.pending;if(p){const i=step.choices.findIndex(ch=>choiceKey(ch)===p.key);if(i<0)S.pending=null;else{const bs=grid.querySelectorAll('.choice');bs.forEach(x=>x.disabled=true);bs[i].classList.add(p.ok===true?'ok':'meh');sayBox(c,step.choices[i].say,p.ok===true?'good':'meh',p.cost,p.weeks,p.gain);pickActions(c,grid);}}}
function pick(c,grid,step,ch,btn){const cost=typeof ch.cost==='function'?ch.cost(S):(ch.cost||0);const key=choiceKey(ch);
  if(ch.ok===false){AudioKit.sfx.error();btn.classList.add('bad');btn.disabled=true;if(!S.wrong.includes(key)){S.wrong.push(key);S.mistakes++;if(ch.penalty)spend(ch.penalty);if(ch.weeks)addWeeks(ch.weeks);}sayBox(c,ch.say,'bad',ch.penalty||0,ch.weeks||0);c.classList.remove('shake');void c.offsetWidth;c.classList.add('shake');save();return;}
  grid.querySelectorAll('.choice').forEach(x=>x.disabled=true);btn.classList.add(ch.ok===true?'ok':'meh');
  const prev={};if(ch.set)for(const k in ch.set){prev[k]=S[k];S[k]=ch.set[k];}
  if(cost)spend(cost);if(ch.weeks)addWeeks(ch.weeks);if(ch.gain)gain(ch.gain);
  const newStamp=(ch.stamp&&earn(ch.stamp))?ch.stamp:null;
  S.pending={key,stepKey:stepKey(),ok:ch.ok,cost,weeks:ch.weeks||0,gain:ch.gain||0,prev,set:ch.set||null,stamp:newStamp};
  AudioKit.sfx[ch.ok===true?'coin':'blip']();sayBox(c,ch.say,ch.ok===true?'good':'meh',cost,ch.weeks||0,ch.gain||0);pickActions(c,grid);save();}
function pickActions(c,grid){actions(c,[[t('Change'),'sec',()=>undo(c,grid)],[t(isLast()?'Done here':'Next'),'go',next]]);}
function undo(c,grid){const a=S.pending;if(!a)return;S.pending=null;if(a.cost){S.wallet+=a.cost;S.spent-=a.cost;}if(a.gain)S.wallet-=a.gain;if(a.weeks)S.weeks-=a.weeks;if(a.set)for(const k in a.set){if(a.prev[k]===undefined)delete S[k];else S[k]=a.prev[k];}if(a.stamp){const i=S.stamps.indexOf(a.stamp);if(i>-1)S.stamps.splice(i,1);}
  hud();grid.querySelectorAll('.choice').forEach(x=>{if(!x.classList.contains('bad'))x.disabled=false;x.classList.remove('ok','meh');});const s=c.querySelector('.say');if(s)s.remove();const ac=c.querySelector('.actions');if(ac)ac.remove();save();}
function next(){if(S.pending&&S.pending.ok==='meh')S.mehs++;S.pending=null;S.stepIdx++;if(S.stepIdx>=steps.length)finishStation();else renderStep();save();}
function finishStation(){S.station++;while(S.station<STATIONS.length&&!activeAt(S.station))S.station++;S.stepIdx=0;S.pending=null;arrived=false;hud();save();if(S.station>=STATIONS.length){showEnd(true);doneCard();return;}travelCard();}
function travelCard(){const nxt=STATIONS[S.station];panel.innerHTML='';const c=el('div','card');card=c;const head=el('div','card-head');head.appendChild(iconEl('walk',3));const tt=el('div');tt.appendChild(el('div','card-title',S.year>1?tf('Year {n} \u00B7 Next stop: {place}',{n:S.year,place:nxt.name}):tf('Next stop: {place}',{place:nxt.name})));tt.appendChild(el('div','card-sub',t(stationView(nxt).title)));head.appendChild(tt);c.appendChild(head);
  const inSea=S.px<SEA0&&nxt.x>SEA1;c.appendChild(el('div','card-line',t(inSea?'The boxes board the ship. Long crossing ahead.':'Walk on. Hold the right side of the picture, or tap the button.')));
  const a=el('div','actions');const b=el('button','btn walk');if(walking)b.textContent=t(hurry?'Hurrying\u2026':'Hurry!');else{b.appendChild(iconEl('walk',2));b.appendChild(document.createTextNode(t(inSea?'Set sail':'Walk')));}
  b.addEventListener('click',()=>{AudioKit.sfx.blip();if(!walking){walking=true;hurry=false;b.textContent=t('Hurry!');if(inSea)AudioKit.sfx.horn();}else{hurry=true;b.textContent=t('Hurrying\u2026');}});
  a.appendChild(b);c.appendChild(a);panel.appendChild(c);panel.scrollTop=0;hintEl.classList.add('show');setTimeout(()=>hintEl.classList.remove('show'),3500);}
function arrive(){arrived=true;walking=false;hurry=false;const st=STATIONS[S.station];S.px=st.x-6;computeSteps();S.stepIdx=Math.min(S.stepIdx,steps.length-1);toast(t(st.name).toUpperCase());AudioKit.sfx.blip();hud();renderStep();save();}
function doneCard(){panel.innerHTML='';const c=el('div','card');card=c;const head=el('div','card-head');head.appendChild(iconEl('heart',3));const tt=el('div');const brand=S.brand||t('Your brand');
  tt.appendChild(el('div','card-title',t(S.year>1?'Year complete':'Journey complete')));tt.appendChild(el('div','card-sub',S.year>1?tf('{brand} finished year {n}, and the money came home again.',{brand,n:S.year}):tf('{brand} went from a workshop in India to a home in America and the money came back.',{brand})));head.appendChild(tt);c.appendChild(head);
  c.appendChild(sessionPromo('end-card'));
  c.appendChild(el('div','card-line',t('Your results stay here. Share your score, run the business for another year, or start over with another product.')));
  actions(c,[[tf('Start year {n}',{n:S.year+1}),'go',nextYear,'calendar'],[t('See results'),'sec',()=>showEnd(false),'rupee'],[t('Share'),'sec',shareScore,'share'],[t('Passport'),'sec',showPassport,'stampbook'],[t('Play again, new product'),'sec',restart,'walk']]).classList.add('many');panel.appendChild(c);}
/* Links to Edock carry UTM tags so edock.io's analytics can see the visit came from this game.
   The game itself sends nothing. */
function tagged(url,campaign,placement){try{const u=new URL(url);u.searchParams.set('utm_source',GAME_ID);u.searchParams.set('utm_medium','game');u.searchParams.set('utm_campaign',campaign);u.searchParams.set('utm_content',placement);if(S&&S.product)u.searchParams.set('utm_term',S.product);return u.toString();}catch(e){return url;}}
function sessionPromo(placement){const live=Date.now()<Date.parse(SESSION.endsAt);const box=el('div','promo');
  box.appendChild(el('div','eyebrow',t('YOU MADE IT TO THE END')));
  box.appendChild(el('div','pitch',t(live?'That means you will enjoy our live online session. Ask real exporters everything this game could not answer.':'Keep going with Edock\u2019s live sessions, where people who export for real answer your questions.')));
  if(live){const ev=el('div','ev');const cal=el('div','cal');cal.appendChild(el('b',null,SESSION.month));cal.appendChild(el('span',null,SESSION.day));ev.appendChild(cal);const info=el('div');info.appendChild(el('div','ev-t',SESSION.title));info.appendChild(el('div','ev-m',SESSION.when));info.appendChild(el('div','ev-m',SESSION.host));ev.appendChild(info);box.appendChild(ev);}
  const a=el('a','cta');a.href=live?tagged(SESSION.url,SESSION.campaign,placement):tagged(SESSION.allUrl,SESSION.allCampaign,placement);a.target='_blank';a.rel='noopener';a.appendChild(iconEl('ticket',2));a.appendChild(document.createTextNode(live?tf('Save my seat \u00B7 from {price}',{price:SESSION.price}):t('See upcoming sessions')));a.addEventListener('click',()=>AudioKit.sfx.coin());box.appendChild(a);
  box.appendChild(el('div','fine',t('Opens edock.io in a new tab.')));return box;}
function restart(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}closeOv();start(null);}
/* Another year with the same brand: the money carries over, the setup stays done, and the stamps
   that belong to one batch are earned again. */
function nextYear(){const r=yearResult();const hist=(S.history||[]).concat([{year:S.year,units:unitsOf(S),delta:r.delta,weeks:S.weeks,score:r.score}]);
  const keep={product:S.product,brand:S.brand,history:hist,ior:S.ior,makerPremium:S.makerPremium,
    year:S.year+1,wallet:r.final,yearStart:r.final,stamps:S.stamps.filter(id=>!PER_BATCH_STAMPS.includes(id))};
  S=Object.assign(fresh(),keep);S.events=pickEvents(S);S.station=0;while(!activeAt(S.station))S.station++;
  closeOv();S.started=true;walking=false;hurry=false;manual=0;arrived=false;curSong='';hud();AudioKit.sfx.win();toast(tf('YEAR {n}',{n:S.year}),2200);travelCard();save();}

/* ---- score and sharing ---- */
function yearResult(){const pay=payout(S);const refund=S.taxLocked?Math.round(prodCost(S)*0.18):0;const final=S.wallet+pay.netINR+refund;const start=S.yearStart==null?START_WALLET:S.yearStart;const score=scoreOf(S);return {pay,refund,final,start,delta:final-start,score,rank:rankOf(score)};}
function bestScore(score){let best=0;try{best=+localStorage.getItem(BEST_KEY)||0;if(score!=null&&score>best){best=score;localStorage.setItem(BEST_KEY,String(best));}}catch(e){}return best;}
function shareText(r){const v={brand:S.brand||'',product:t(PRODUCTS[S.product].name).toLowerCase(),weeks:S.weeks,rank:t(r.rank),score:r.score,n:S.year,units:fmtN(unitsOf(S)),url:GAME_URL};
  return S.year>1?tf('Year {n} of my export business: {units} {brand} {product}s sold in America. I ranked {rank} ({score}/100) in The Journey of One Box. Can you beat me? {url}',v)
    :tf('I took my {brand} {product} from India to America in {weeks} weeks and ranked {rank} ({score}/100) in The Journey of One Box. Can you beat me? {url}',v);}
/* The picture people share: pixel art drawn small and scaled up, with sharp text drawn on top. */
function shareCard(r){const L=document.createElement('canvas');L.width=180;L.height=180;const x=L.getContext('2d');x.imageSmoothingEnabled=false;
  const g=x.createLinearGradient(0,0,0,150);g.addColorStop(0,'#7EC8F2');g.addColorStop(1,'#FFE2A8');x.fillStyle=g;x.fillRect(0,0,180,150);
  [[14,58,22],[128,40,26],[150,98,18]].forEach(([cx,cy,w])=>{x.fillStyle='rgba(255,255,255,.85)';x.fillRect(cx,cy,w,5);x.fillRect(cx+4,cy-3,w-8,3);});
  x.fillStyle='#C9A46A';x.fillRect(0,150,180,30);x.fillStyle='#6B5A45';x.fillRect(0,157,180,23);for(let i=0;i<180;i+=12){x.fillStyle='#FFE66D';x.fillRect(i,176,6,1);}
  x.save();x.translate(0,150-GROUND);drawBuilding(x,22,{type:'shop',w:30,h:26,wall:'#F7D9A6',accent:'#E8563F'},0);drawBuilding(x,158,{type:'house',w:30,h:22,wall:'#FFF4DE',accent:'#B93A27'},0);x.restore();
  drawMap(x,MAPS.player0,84,132,1);drawMap(x,MAPS[PRODUCTS[S.product].sprite],74,26,2);
  const C=document.createElement('canvas');C.width=1080;C.height=1080;const c=C.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(L,0,0,1080,1080);
  const T=(s,px,y,col,font,max)=>{c.font=font;c.fillStyle=col;c.textAlign='center';c.textBaseline='top';c.fillText(s,px,y,max||1000);};
  T('THE JOURNEY',540,54,'#1B1B24','40px "Press Start 2P",monospace');T('OF ONE BOX',540,108,'#B93A27','40px "Press Start 2P",monospace');
  if(S.brand){c.font='700 40px Rubik,sans-serif';const w=c.measureText(S.brand).width+48;c.fillStyle='#1B1B24';c.fillRect(540-w/2,362,w,58);T(S.brand,540,370,'#FFE66D','700 40px Rubik,sans-serif');}
  c.fillStyle='#1B1B24';c.fillRect(84,432,912,292);c.fillStyle='#FFF6E6';c.fillRect(90,438,900,280);
  T(tf('YEAR {n}',{n:S.year}),540,466,'#D98C1F','22px "Press Start 2P",monospace');T(t(r.rank).toUpperCase(),540,510,'#1B1B24','36px "Press Start 2P",monospace',860);
  T(tf('Score {n} / 100',{n:r.score}),540,574,'#2E9A4B','700 60px Rubik,sans-serif');
  T(tf('{weeks} weeks \u00B7 {wrong} wrong picks \u00B7 {stamps} stamps',{weeks:S.weeks,wrong:S.mistakes,stamps:S.stamps.length}),540,658,'#6B5A45','500 32px Rubik,sans-serif',860);
  T(t('Can you beat me? Play free:'),540,952,'#FFE66D','700 32px Rubik,sans-serif');T(GAME_URL.replace(/^https?:\/\//,''),540,1000,'#FFFFFF','700 34px Rubik,sans-serif',1020);
  return new Promise(res=>{try{C.toBlob(res,'image/png');}catch(e){res(null);}});}
/* Drawn once when the results open, so the share tap can hand the picture over at once:
   phones only open the share sheet straight from a tap. */
let cardBlob=null,cardFor='';
function prepareCard(r){const k=S.seed+'|'+S.year+'|'+r.score+'|'+LANG;if(cardFor===k)return;cardFor=k;cardBlob=null;const go=()=>shareCard(r).then(b=>{if(cardFor===k)cardBlob=b;});(document.fonts&&document.fonts.load?Promise.all([document.fonts.load('40px "Press Start 2P"'),document.fonts.load('700 40px Rubik')]).catch(()=>{}):Promise.resolve()).then(go);}
function shareScore(){const r=yearResult();const text=shareText(r);
  if(cardBlob&&navigator.canShare){const f=new File([cardBlob],'journey-of-one-box.png',{type:'image/png'});if(navigator.canShare({files:[f],text})){navigator.share({files:[f],text}).catch(()=>{});return;}}
  window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank','noopener');}
function savePicture(){const r=yearResult();const done=b=>{if(!b)return;const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='journey-of-one-box.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);};if(cardBlob)done(cardBlob);else shareCard(r).then(done);}
function scoreBlock(r,best){const w=el('div','score');const top=el('div','rank');top.appendChild(iconEl('trophy',3));const words=el('div');words.appendChild(el('div','rk',t(r.rank)));words.appendChild(el('div','sc',tf('Score {n} / 100',{n:r.score})+(best?'  \u00B7  '+tf('Best {n}',{n:best}):'')));top.appendChild(words);w.appendChild(top);
  const bits=el('div','bits');[[S.mistakes,t('wrong picks')],[S.mehs,t('costly picks')],[S.weeks,t(S.weeks===1?'week':'weeks')]].forEach(([n,k])=>{const s=el('span');s.appendChild(el('b',null,String(n)));s.appendChild(document.createTextNode(' '+k));bits.appendChild(s);});w.appendChild(bits);
  w.appendChild(el('div','how',tf('100 points, minus 6 for each wrong pick, 3 for each costly pick, and 1 for each week over {par}.',{par:parWeeks(S)})));
  const a=el('div','actions');[[t('Share on WhatsApp'),'go',shareScore,'share'],[t('Save picture'),'sec',savePicture,'camera']].forEach(([label,cls,fn,icon])=>{const b=el('button','btn '+cls);b.appendChild(iconEl(icon,2));b.appendChild(document.createTextNode(label));b.addEventListener('click',()=>{AudioKit.sfx.blip();fn();});a.appendChild(b);});w.appendChild(a);return w;}

/* ---- overlays ---- */
function ov(closable){overlay.innerHTML='';const box=el('div','ov');if(closable){const x=el('button','x','\u2715');x.title=t('Close');x.setAttribute('aria-label',x.title);x.addEventListener('click',()=>{AudioKit.sfx.blip();closeOv();});box.appendChild(x);}overlay.appendChild(box);overlay.classList.add('show');overlay.scrollTop=0;return box;}
function closeOv(){overlay.classList.remove('show');overlay.innerHTML='';reopen=null;}
function logoCanvas(){const c=document.createElement('canvas');c.width=192;c.height=72;const x=c.getContext('2d');x.imageSmoothingEnabled=false;const g=x.createLinearGradient(0,0,0,72);g.addColorStop(0,'#7EC8F2');g.addColorStop(1,'#FFE2A8');x.fillStyle=g;x.fillRect(0,0,192,72);x.fillStyle='#C9A46A';x.fillRect(0,56,192,16);x.fillStyle='#6B5A45';x.fillRect(0,62,192,10);for(let i=0;i<192;i+=12){x.fillStyle='#FFE66D';x.fillRect(i,66,6,1);}
  x.save();x.translate(0,56-GROUND);drawBuilding(x,30,{type:'shop',w:40,h:30,wall:'#F7D9A6',accent:'#E8563F'},0);x.restore();drawMap(x,MAPS.player0,86,38,1);drawShip(x,120,44);x.fillStyle='rgba(31,111,168,.9)';x.fillRect(110,58,82,14);txt(x,'THE JOURNEY',96,8,'#1B1B24',8,'center');txt(x,'OF ONE BOX',96,20,'#B93A27',8,'center');return c;}
function langSwitch(){const w=el('div','lang');w.setAttribute('role','group');w.setAttribute('aria-label','Language');
  [['en','English'],['hinglish','Hinglish']].forEach(([k,name])=>{const b=el('button',LANG===k?'on':'',name);b.setAttribute('aria-pressed',String(LANG===k));b.addEventListener('click',()=>{if(LANG!==k)setLang(k);AudioKit.sfx.blip();});w.appendChild(b);});return w;}
function showTitle(saved){const b=ov(false);reopen=()=>showTitle(saved);const lg=logoCanvas();lg.className='logo';b.appendChild(lg);b.appendChild(el('h1',null,t('From an Indian workshop to an American doorstep')));b.appendChild(el('p',null,t('Carry one box through 17 stops. Tap, pick, stamp. Every price is in dollars and rupees. Music plays, so turn the sound up or tap the speaker to mute.')));
  b.appendChild(langSwitch());
  const a=el('div','actions');const hasSave=saved&&saved.product;
  if(hasSave){const c=el('button','btn go',saved.done?t('See my results'):saved.year>1?tf('Continue year {n}',{n:saved.year}):t('Continue'));c.addEventListener('click',()=>start(saved));a.appendChild(c);}
  const n=el('button','btn'+(hasSave?' sec':''),t(hasSave?'New game':'Tap to start'));n.addEventListener('click',()=>start(null));a.appendChild(n);b.appendChild(a);
  b.appendChild(el('div','credits',t('A plain-words game about exporting from India and selling on Amazon USA. Example numbers at \u20B984 per dollar, not advice. Free and open source under the MIT license.')));}
function showPassport(){const b=ov(true);reopen=showPassport;b.appendChild(el('h2',null,tf('Passport \u00B7 {n} / {total} stamps',{n:S.stamps.length,total:Object.keys(STAMPS).length})));b.appendChild(el('p',null,t('Tap a stamp to see what it means.')));const g=el('div','pass');
  Object.keys(STAMPS).forEach((id,i)=>{const got=S.stamps.includes(id);const s=el('div','stamp'+(got?' got':''));s.style.setProperty('--rot',((i*37)%9-4)+'deg');const seal=el('div','seal');seal.style.color=got?['#B93A27','#2F63B0','#2E9A4B','#D98C1F'][i%4]:'';seal.appendChild(document.createTextNode(id));seal.appendChild(el('small',null,t(STAMPS[id][0])));s.appendChild(seal);s.tabIndex=0;const show=()=>{$('#stamp-say').textContent=(got?'':t('Not yet.')+' ')+t(STAMPS[id][0])+': '+t(STAMPS[id][1]);AudioKit.sfx.blip();};s.addEventListener('click',show);s.addEventListener('keydown',e=>{if(e.key==='Enter')show();});g.appendChild(s);});
  b.appendChild(g);const say=el('div');say.id='stamp-say';say.textContent=t('Every official word in this journey, collected as a stamp.');b.appendChild(say);
  const a=el('div','actions');const c=el('button','btn',t('Back to the road'));c.addEventListener('click',()=>{AudioKit.sfx.blip();closeOv();});a.appendChild(c);
  const r=el('button','btn sec danger',t('Restart journey'));r.addEventListener('click',()=>{AudioKit.sfx.blip();a.innerHTML='';const y=el('button','btn danger',t('Yes, start over'));y.addEventListener('click',restart);const n=el('button','btn sec',t('Keep going'));n.addEventListener('click',()=>{AudioKit.sfx.blip();closeOv();});a.appendChild(y);a.appendChild(n);});a.appendChild(r);b.appendChild(a);}
function showEnd(fresh){S.done=true;save();if(fresh)AudioKit.sfx.win();const p=PRODUCTS[S.product],r=yearResult(),pay=r.pay,u=unitsOf(S);const best=bestScore(fresh?r.score:null);prepareCard(r);
  const last=S.history&&S.history[S.history.length-1];const brand=S.brand||t('Your box');
  const b=ov(true);reopen=()=>showEnd(false);b.appendChild(el('h1',null,S.year>1?tf('{brand}: year {n} done',{brand,n:S.year}):tf('{brand} made it home',{brand})));b.appendChild(el('p',null,tf('{n} units of {product} sold in the USA at {price} each. Here is where the dollars went.',{n:fmtN(u),product:t(p.name).toLowerCase(),price:both(p.price)})));
  b.appendChild(scoreBlock(r,best));
  const m=el('div','money');const bar=el('div','bar');const cols=['#E8563F','#F2A93B','#7B5CD6','#4CC96A'];[pay.amz,pay.fba,pay.conv,pay.netUSD].forEach((v,i)=>{const it=document.createElement('i');it.style.width=(v/pay.gross*100)+'%';it.style.background=cols[i];bar.appendChild(it);});m.appendChild(bar);
  const lg=el('div','legend');[[t('Amazon fee'),0],[t('Warehouse + delivery'),1],[t('Currency change'),2],[t('Yours'),3]].forEach(([k,i])=>{const s=el('span');const sw=el('i');sw.style.background=cols[i];s.appendChild(sw);s.appendChild(document.createTextNode(k));lg.appendChild(s);});m.appendChild(lg);
  [[t('Customers paid'),both(pay.gross),''],[t('Amazon\u2019s 15% cut'),'\u2212'+both(pay.amz),'neg'],[t('Warehouse and delivery fee'),'\u2212'+both(pay.fba),'neg'],[t('Dollars to rupees, 3%'),'\u2212'+both(pay.conv),'neg'],[t('Landed in your bank'),fmtINR(pay.netINR)+' ('+fmtUSD(pay.netUSD)+')','pos']].forEach(([k,v,cls])=>{const row=el('div','row');row.appendChild(el('span',null,k));row.appendChild(el('span',cls,v));m.appendChild(row);});b.appendChild(m);
  const sign=n=>(n>=0?'+':'')+fmtINR(n),cls=n=>n>=0?'pos':'neg';let tiles;
  if(S.year>1)tiles=[[t('You started the year with'),fmtINR(r.start),''],[t('You spent'),fmtINR(S.spent),'neg'],[t('This year\u2019s result'),sign(r.delta),cls(r.delta)],[t('Last year\u2019s result'),last?sign(last.delta):'\u2013',last?cls(last.delta):''],[t('Weeks on the road'),String(S.weeks),''],[t('Stamps collected'),S.stamps.length+' / '+Object.keys(STAMPS).length,'']];
  else{const perBatch=prodCost(S)+9000+(S.air?90000:35000)+dutyINR(S)+25000+20000+10200;const nextProfit=pay.netINR-perBatch;
    tiles=[[t('You started with'),fmtINR(START_WALLET),''],[t('You spent'),fmtINR(S.spent),'neg'],[t('First batch result'),sign(r.delta),cls(r.delta)],[tf('Next batch, same {n} units',{n:UNITS}),sign(nextProfit),cls(nextProfit)],[t('Weeks on the road'),String(S.weeks),''],[t('Stamps collected'),S.stamps.length+' / '+Object.keys(STAMPS).length,'']];}
  const g=el('div','endgrid');tiles.forEach(([k,v,c])=>{const tile=el('div','tile');tile.appendChild(el('div','k',k));tile.appendChild(el('div','v '+c,v));g.appendChild(tile);});b.appendChild(g);
  if(S.year>1)b.appendChild(el('p',null,t(last&&r.delta>=last.delta?'Better than last year. The setup is paid for, so more of every sale is yours.':'Less than last year. A bigger batch ties up more cash, and costly picks add up.')));
  else b.appendChild(el('p',null,t(r.delta>=0?'The first batch already paid for the setup. Everything from here is easier.':'The first batch paid for the setup: trademark, tests, photos, bond. Those never repeat. The next batch is where the profit lives.')));
  if(r.refund)b.appendChild(el('p',null,tf('Your 18% tax deposit came back after 7 months: {amount}.',{amount:fmtINR(r.refund)})));
  b.appendChild(sessionPromo('end-results'));
  const a=el('div','actions');[[t('Passport'),'sec',showPassport],[t('Play again, new product'),'sec',restart],[tf('Start year {n}',{n:S.year+1}),'go',nextYear]].forEach(([label,c,fn])=>{const btn=el('button','btn '+c,label);btn.addEventListener('click',()=>{AudioKit.sfx.blip();fn();});a.appendChild(btn);});b.appendChild(a);
  const cr=el('div','credits');cr.appendChild(document.createTextNode(t('Example numbers at \u20B984 per dollar. Rules and duty rates change; check before you spend.')+' '));const gl=el('a',null,t('Read the full written guide'));gl.href=GUIDE_URL;gl.target='_blank';gl.rel='noopener';cr.appendChild(gl);cr.appendChild(document.createTextNode('.'));b.appendChild(cr);}

/* ---- language ---- */
function setLang(k){LANG=k==='hinglish'?'hinglish':'en';try{localStorage.setItem(LANG_KEY,LANG);}catch(e){}applyStaticText();if(trackBuilt)buildTrack();if(S&&S.started)hud();setMuteUI(AudioKit.isMuted());
  if(overlay.classList.contains('show')&&reopen)reopen();
  if(S&&S.started){if(S.done)doneCard();else if(arrived)renderStep();else travelCard();}}
function applyStaticText(){document.documentElement.lang=LANG==='hinglish'?'hi-Latn':'en';document.querySelectorAll('[data-t]').forEach(e=>{e.textContent=t(e.dataset.t);});document.querySelectorAll('[data-t-title]').forEach(e=>{e.title=t(e.dataset.tTitle);e.setAttribute('aria-label',e.title);});
  const lb=$('#btn-lang');lb.textContent=LANG==='hinglish'?'English':'Hinglish';lb.title=LANG==='hinglish'?'Switch to English':'Hinglish mein khelein';}

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
    if(i<cur||(S&&!activeAt(i))){rect(ctx,sx+16,GROUND-st.building.h-16,1,14,PAL.k);rect(ctx,sx+17,GROUND-st.building.h-16,8,6,PAL.g);rect(ctx,sx+18,GROUND-st.building.h-14,3,1,PAL.w);}
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
$('#btn-lang').addEventListener('click',()=>{setLang(LANG==='hinglish'?'en':'hinglish');AudioKit.sfx.blip();});
function setMuteUI(m){const b=$('#btn-mute');b.setAttribute('aria-pressed',m?'false':'true');b.title=t(m?'Music is off. Tap to turn on.':'Music is on. Tap to mute.');const c=b.querySelector('canvas');const s=iconCanvas(m?'mute':'note',3);c.width=s.width;c.height=s.height;c.getContext('2d').drawImage(s,0,0);}
$('#btn-mute').addEventListener('click',()=>{const m=!AudioKit.isMuted();AudioKit.setMuted(m);try{localStorage.setItem('one-box-muted',m?'1':'0');}catch(e){}setMuteUI(m);if(!m)AudioKit.sfx.blip();});
function start(saved){AudioKit.init();closeOv();S=saved||fresh();S.started=true;walking=false;hurry=false;manual=0;arrived=false;curSong='';if(!trackBuilt)buildTrack();hud();
  if(S.station>=STATIONS.length||S.done){S.station=Math.min(S.station,STATIONS.length-1);showEnd(false);doneCard();return;}
  while(S.station<STATIONS.length-1&&!activeAt(S.station))S.station++;
  const target=STATIONS[S.station];if(S.px>=target.x-6-0.01){S.px=target.x-6;arrive();}else travelCard();save();}

/* boot */
applyStaticText();AudioKit.setMuted(getMuted());setMuteUI(getMuted());resize();requestAnimationFrame(frame);
/* A finished game is offered too, so its results and the next year stay one tap away. */
const savedGame=load();showTitle(savedGame&&savedGame.product?savedGame:null);
