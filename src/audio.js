/* The Journey of One Box · amyra-ind-usa-export · MIT License · https://games.edock.io/amyra-ind-usa-export */
/* ============ AUDIO (generative chiptune, all synthesized) ============ */
const AudioKit=(()=>{
  let ctx=null,master=null,musicG=null,leadBus=null,sfxG=null,muted=false,timer=null,song=null,songName='',pending=null;
  let step=0,nextT=0,phrase=0,mel=[],arp=[],bass=[],seed=7;
  const f=n=>440*Math.pow(2,(n-69)/12);
  const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  function init(){if(ctx)return true;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;ctx=new AC();
    const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=6500;lp.connect(ctx.destination);
    master=ctx.createGain();master.gain.value=muted?0:0.6;master.connect(lp);
    musicG=ctx.createGain();musicG.gain.value=0.5;musicG.connect(master);
    leadBus=ctx.createGain();leadBus.gain.value=1;leadBus.connect(musicG);
    const dl=ctx.createDelay(1);dl.delayTime.value=0.31;const fb=ctx.createGain();fb.gain.value=0.3;const wet=ctx.createGain();wet.gain.value=0.22;
    leadBus.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(wet);wet.connect(musicG);
    sfxG=ctx.createGain();sfxG.gain.value=0.7;sfxG.connect(master);
    document.addEventListener('visibilitychange',()=>{if(!ctx)return;if(document.hidden)ctx.suspend();else ctx.resume();});return true;}
  function tone(t,dur,note,type,gain,dest,slide,vib){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f(note),t);if(slide)o.frequency.exponentialRampToValueAtTime(f(note+slide),t+dur);
    if(vib){const l=ctx.createOscillator(),lg=ctx.createGain();l.frequency.value=5.5;lg.gain.value=f(note)*0.004;l.connect(lg);lg.connect(o.frequency);l.start(t+0.08);l.stop(t+dur+0.05);}
    g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(gain,t+0.012);g.gain.exponentialRampToValueAtTime(Math.max(gain*0.35,0.0002),t+dur*0.85);g.gain.linearRampToValueAtTime(0.0001,t+dur);o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+0.05);}
  function noise(t,dur,gain,dest,freq,type){const len=Math.max(1,Math.floor(ctx.sampleRate*dur));const buf=ctx.createBuffer(1,len,ctx.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);const s=ctx.createBufferSource();s.buffer=buf;const g=ctx.createGain();g.gain.value=gain;const fl=ctx.createBiquadFilter();fl.type=type||'highpass';fl.frequency.value=freq||6000;s.connect(fl);fl.connect(g);g.connect(dest);s.start(t);}
  function kick(t,g){const o=ctx.createOscillator(),gn=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+0.12);gn.gain.setValueAtTime(g,t);gn.gain.exponentialRampToValueAtTime(0.0005,t+0.2);o.connect(gn);gn.connect(musicG);o.start(t);o.stop(t+0.22);}
  function snare(t,g){noise(t,0.11,g,musicG,1800,'bandpass');tone(t,0.07,55,'triangle',g*0.5,musicG,-10,false);}
  function tin(t,g){tone(t,0.09,79,'sine',g,musicG,-2,false);}
  const SONGS={
    town:{bpm:124,swing:0.09,root:62,scale:[0,2,4,5,7,9,10],chords:[[0],[6],[3],[0],[0],[3],[4],[0]],lead:'square',leadGain:0.10,bassW:'triangle',drums:'tabla',arpStyle:'pluck',
      hook:[74,0,0,72,0,69,0,72,74,0,0,77,0,74,0,72,69,0,0,67,0,69,0,72,69,0,0,0,0,0,65,67]},
    sea:{bpm:82,swing:0,root:57,scale:[0,2,3,5,7,9,10],chords:[[0],[3],[6],[4],[0],[2],[3],[4]],lead:'triangle',leadGain:0.15,bassW:'sine',drums:'soft',arpStyle:'flow',
      hook:[69,0,0,0,72,0,0,0,76,0,0,0,0,0,0,0,74,0,0,0,72,0,0,0,69,0,0,0,0,0,0,0]},
    usa:{bpm:136,swing:0.07,root:67,scale:[0,2,4,5,7,9,11],chords:[[0],[4],[5],[3],[0],[4],[3],[4]],lead:'square',leadGain:0.09,bassW:'square',drums:'rock',arpStyle:'pump',
      hook:[79,0,79,0,81,0,83,0,79,0,0,0,76,0,0,0,74,0,76,0,79,0,76,0,74,0,0,0,71,0,0,0]}
  };
  const deg=(d,oct)=>song.root+song.scale[((d%7)+7)%7]+12*Math.floor(d/7)+12*(oct||0);
  function nearestDeg(m){let best=7,bd=99;for(let d=0;d<24;d++){const dist=Math.abs(deg(d,0)-m);if(dist<bd){bd=dist;best=d;}}return best;}
  const RH=[[1,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0],[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],[1,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0],[1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0],[1,0,1,1,0,1,0,0,1,0,1,0,0,0,0,0],[0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0],[1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0]];
  function genPhrase(){mel=new Array(128).fill(0);arp=new Array(128).fill(0);bass=new Array(128).fill(0);let prev=7;const hookOn=phrase%2===0;const lift=phrase%4===3?7:0;
    for(let b=0;b<8;b++){const cd=song.chords[b][0],tones=[cd,cd+2,cd+4];
      for(let s=0;s<16;s++){const st=b*16+s;
        if(song.drums==='rock'){if(s%2===0)bass[st]=deg(cd,-1)+((s%8===6)?12:0);}
        else if(song.drums==='soft'){if(s===0)bass[st]=deg(cd,-1);if(s===8)bass[st]=deg(cd+4,-1);}
        else{if(s===0||s===6||s===8||s===12)bass[st]=deg(s===12?cd+4:cd,-1);}
        const pat=song.arpStyle==='flow'?[0,1,2,1]:song.arpStyle==='pump'?[0,0,1,2]:[0,2,1,2];
        if(song.arpStyle==='flow'||s%2===0){arp[st]=deg(tones[pat[(song.arpStyle==='flow'?s:s>>1)%4]],0)+(phrase%3===1?12:0);}}
      if(hookOn&&b<2){for(let s=0;s<16;s++)mel[b*16+s]=song.hook[b*16+s]?song.hook[b*16+s]+lift:0;prev=nearestDeg(song.hook[31]||song.hook[28]||song.root+12);continue;}
      const rh=RH[Math.floor(rnd()*RH.length)];
      for(let s=0;s<16;s++){if(!rh[s])continue;let d;
        if(s===0||s===8||rnd()<0.35){let best=tones[0],bd=99;for(const t of tones)for(const o of [0,7,14]){const c=t+o,dist=Math.abs(c-prev);if(dist<bd){bd=dist;best=c;}}d=best;if(rnd()<0.25)d=best+(rnd()<0.5?7:-7);}
        else{d=prev+[-2,-1,-1,1,1,2,3][Math.floor(rnd()*7)];}
        d=Math.max(5,Math.min(16,d));prev=d;mel[b*16+s]=deg(d,0)+lift;}
      if(b===7){for(let s=9;s<16;s++)mel[b*16+s]=0;mel[b*16+8]=deg(rnd()<0.6?7:11,0)+lift;prev=7;}}}
  function drums(t,i,b,s){const d=song.drums;const lastBar=b===7;
    if(d==='tabla'){if(s===0||s===8)kick(t,0.55);if(s===10&&b%2===1)kick(t,0.3);if(s===4||s===12)tin(t,0.18);if(s%2===1)noise(t,0.025,0.05,musicG,8000,'highpass');if(s===14)noise(t,0.05,0.08,musicG,6000,'highpass');}
    else if(d==='soft'){if(s===0)kick(t,0.35);if(s===4||s===8||s===12)noise(t,0.03,0.05,musicG,7000,'highpass');if(s%4===2)noise(t,0.05,0.03,musicG,4000,'bandpass');}
    else{if(s===0||s===8||(s===10&&b%2===1))kick(t,0.6);if(s===4||s===12)snare(t,0.3);if(s%2===0)noise(t,0.03,0.07,musicG,8000,'highpass');if(s===14)noise(t,0.09,0.06,musicG,6000,'highpass');}
    if(lastBar&&s>=12&&d!=='soft')snare(t,0.18+(s-12)*0.04);}
  function schedule(){if(!ctx||!song)return;while(nextT<ctx.currentTime+0.14){const i=step%128,b=Math.floor(i/16),s=i%16,st=60/song.bpm/4;
      if(s===0&&pending){song=SONGS[pending]||SONGS.town;songName=pending;pending=null;step=0;phrase=0;genPhrase();continue;}
      if(i===0){if(step>0)phrase++;genPhrase();}
      const t=nextT+((s%2===1)?song.swing*st:0);
      const m=mel[i];if(m){let len=1;while(len<6&&i+len<128&&!mel[i+len])len++;tone(t,st*len*0.92,m,song.lead,song.leadGain,leadBus,0,true);}
      const bn=bass[i];if(bn)tone(t,st*1.7,bn,song.bassW,song.bassW==='square'?0.11:0.3,musicG,0,false);
      const a=arp[i];if(a)tone(t,st*0.8,a,'square',0.035,leadBus,0,false);
      drums(t,i,b,s);nextT+=st;step++;}}
  function play(name){if(!init())return;if(ctx.state==='suspended')ctx.resume();if(!SONGS[name])name='town';if(songName===name)return;
    if(!timer){song=SONGS[name];songName=name;step=0;phrase=0;seed=(Date.now()%100000)|1;genPhrase();nextT=ctx.currentTime+0.05;timer=setInterval(schedule,40);}else pending=name;}
  function setMuted(m){muted=m;if(master&&ctx)master.gain.setTargetAtTime(m?0:0.6,ctx.currentTime,0.02);}
  const sfx={
    blip(){if(!ctx||muted)return;tone(ctx.currentTime,0.07,88,'square',0.16,sfxG,5,false);},
    coin(){if(!ctx||muted)return;const t=ctx.currentTime;tone(t,0.07,83,'square',0.18,sfxG,0,false);tone(t+0.07,0.16,88,'square',0.18,sfxG,0,false);},
    cash(){if(!ctx||muted)return;const t=ctx.currentTime;[76,80,83,88].forEach((n,i)=>tone(t+i*0.06,0.12,n,'square',0.16,sfxG,0,false));},
    stamp(){if(!ctx||muted)return;const t=ctx.currentTime;noise(t,0.12,0.9,sfxG,900,'lowpass');tone(t,0.16,45,'sine',0.5,sfxG,-12,false);},
    error(){if(!ctx||muted)return;const t=ctx.currentTime;tone(t,0.14,52,'sawtooth',0.14,sfxG,-3,false);tone(t+0.15,0.24,47,'sawtooth',0.14,sfxG,-5,false);},
    win(){if(!ctx||muted)return;const t=ctx.currentTime;[72,76,79,84].forEach((n,i)=>tone(t+i*0.09,0.2,n,'square',0.15,sfxG,0,false));tone(t+0.4,0.5,88,'square',0.13,sfxG,0,true);},
    step(){if(!ctx||muted)return;noise(ctx.currentTime,0.03,0.1,sfxG,1500,'lowpass');},
    horn(){if(!ctx||muted)return;const t=ctx.currentTime;tone(t,0.7,41,'sawtooth',0.16,sfxG,0,false);tone(t,0.7,48,'square',0.07,sfxG,0,false);}
  };
  return {init,play,setMuted,sfx,isMuted:()=>muted};
})();
