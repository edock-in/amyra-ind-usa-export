/* Lists every line a player can read that has no Hinglish yet, and Hinglish lines nothing uses any more.
   Run it from the repository root:  node tools/hinglish-check.js
   It exits with 0 either way: a missing line shows in English, it never breaks the game. */
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const ctx={localStorage:{getItem:()=>null,setItem:()=>{}},console};
ctx.fmtINR=n=>'₹'+Math.round(n);ctx.both=n=>"$"+n;
vm.createContext(ctx);
vm.runInContext(read('src/content.js')+'\n'+read('src/hinglish.js')+'\n;this.__=({PRODUCTS,STAMPS,STATIONS,EVENTS,RANKS,quizSteps,HINGLISH});',ctx);
const {PRODUCTS,STAMPS,STATIONS,EVENTS,RANKS,quizSteps,HINGLISH}=ctx.__;
const used=new Map();const add=(x,where)=>{if(x==null)return;const k=Array.isArray(x)?x[0]:x;if(typeof k!=='string'||!/[a-z]/i.test(k))return;if(!used.has(k))used.set(k,where);};
for(const k in PRODUCTS){const p=PRODUCTS[k];add(p.name,'PRODUCTS');add(p.tag,'PRODUCTS');for(const f of ['ask','good','bad','why'])add(p.q[f],'PRODUCTS.q');}
for(const k in STAMPS){add(STAMPS[k][0],'STAMPS');add(STAMPS[k][1],'STAMPS');}
RANKS.forEach(r=>add(r[1],'RANKS'));
const addStep=(st,where)=>{if(!st||st.kind)return;add(st.prompt,where);add(st.quote,where);(st.choices||[]).forEach(c=>{if(!c.raw)add(c.label,where);add(c.say,where);});};
const allStamps=Object.keys(STAMPS);
/* Steps can depend on the product, on earlier picks and on the money left, so walk every product
   with a cautious and a risky set of picks, rich and poor. */
const states=[];for(const product in PRODUCTS)for(const risky of [false,true])for(const wallet of [1e7,0])for(const year of [1,2])
  states.push({product,year,wallet,seed:1,units:300,stamps:risky?allStamps.filter(x=>x!=='LUT'):allStamps,tmLater:risky,sticker:risky,taxLocked:risky,air:risky,noInspect:risky,makerPremium:risky,ior:risky?'broker':'self'});
for(const s of states){
  for(const st of STATIONS){const v=s.year>1?(st.y2?Object.assign({},st,st.y2):null):st;if(!v)continue;add(v.name,'STATIONS '+st.id);add(v.title,'STATIONS '+st.id);add(v.sub,'STATIONS '+st.id);add(v.detail,'STATIONS '+st.id);
    (typeof v.steps==='function'?v.steps(s):v.steps).forEach(x=>addStep(x,'STATIONS '+st.id));}
  EVENTS.forEach(e=>{add(e.title,'EVENTS '+e.id);addStep(e.step(s),'EVENTS '+e.id);});
  quizSteps(s).forEach(x=>addStep(x,'quiz'));}
/* UI text in game.js: the string literals inside t(...) and the first one inside tf(...) */
const unq=lit=>vm.runInNewContext(lit);
function literalsIn(src,name,firstOnly){const out=[];const re=new RegExp('(^|[^\\w.$])'+name+'\\(','g');let m;
  while((m=re.exec(src))){let i=m.index+m[0].length,depth=1;const lits=[];while(i<src.length&&depth){const ch=src[i];
    if(ch==="'"||ch==='"'){let j=i+1;while(src[j]!==ch){if(src[j]==='\\')j++;j++;}lits.push(unq(src.slice(i,j+1)));i=j+1;continue;}
    if(ch==='(')depth++;else if(ch===')')depth--;i++;}
    out.push(...(firstOnly?lits.slice(0,1):lits));}return out;}
const game=read('src/game.js');literalsIn(game,'t',false).forEach(x=>add(x,'game.js'));literalsIn(game,'tf',true).forEach(x=>add(x,'game.js'));
/* and templates handed over as ['text with {name}',{name:...}] */
for(const m of game.matchAll(/\[\s*('(?:[^'\\]|\\.)*\{\w+\}(?:[^'\\]|\\.)*')\s*,\s*\{/g))add(unq(m[1]),'game.js');
for(const m of read('src/body.html').matchAll(/data-t(?:-title)?="([^"]+)"/g))add(m[1],'body.html');
const missing=[...used].filter(([k])=>!(k in HINGLISH));const unused=Object.keys(HINGLISH).filter(k=>!used.has(k));
if(process.argv.includes('--list')){console.log(JSON.stringify([...used.keys()],null,1));process.exit(0);}
console.log(used.size+' lines a player can read, '+(used.size-missing.length)+' with Hinglish.');
if(missing.length){console.log('\nNo Hinglish yet (shows in English):');missing.forEach(([k,w])=>console.log('  ['+w+'] '+k));}
if(unused.length){console.log('\nHinglish nothing uses any more (safe to delete):');unused.forEach(k=>console.log('  '+k));}
if(process.env.GITHUB_ACTIONS){missing.forEach(([k,w])=>console.log('::warning title=No Hinglish yet::['+w+'] '+k));}
