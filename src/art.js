/* The Journey of One Box · amyra-ind-usa-export · MIT License · https://games.edock.io/amyra-ind-usa-export */
/* ============ PIXEL ART ============ */
const PAL={k:'#1B1B24',w:'#FFFFFF',r:'#E8563F',R:'#B93A27',o:'#F2A93B',O:'#D98C1F',y:'#FFE66D',g:'#4CC96A',G:'#2E9A4B',b:'#4F8FE6',B:'#2F63B0',c:'#8ED0F5',p:'#F28CB1',n:'#8B5A2B',N:'#5C3A18',t:'#E6B98A',T:'#C9A06A',e:'#A7A7B3',d:'#5A5A6B',l:'#E4E4EC',m:'#C97B4A',M:'#8F4E2A',v:'#7B5CD6',i:'#2A2016',s:'#F5D6A8'};
const MAPS={
player0:[
'....kkkk....','...kkkkkk...','...kttttk...','...ktktkt...','...kttttk...','....tttt....',
'..kkkkkkkk..','.kTTTTTTTTk.','.kTToooTTTk.','.kTTTTTTTTk.','.kTTTTTTTTk.','..kkkkkkkk..',
'....bbbb....','...kbbbbk...','...kNNNNk...','...kN..Nk...','...kN..Nk...','..kkk..kkk..'],
player1:[
'....kkkk....','...kkkkkk...','...kttttk...','...ktktkt...','...kttttk...','....tttt....',
'..kkkkkkkk..','.kTTTTTTTTk.','.kTToooTTTk.','.kTTTTTTTTk.','.kTTTTTTTTk.','..kkkkkkkk..',
'....bbbb....','...kbbbbk...','..kNNNNNNk..','..kN....Nk..','.kN......Nk.','kkk......kkk'],
box:['.kkkkkkkkkk.','kTTTTTTTTTTk','kTTTkkkkTTTk','kTTTTTTTTTTk','kTTooooTTTTk','kTTTTTTTTTTk','kTTTTTTTTTTk','.kkkkkkkkkk.'],
coin:['..kkkk..','.kyyyyk.','kyyooyyk','kyoyyoyk','kyoyyoyk','kyyooyyk','.kyyyyk.','..kkkk..'],
star:['...kk...','..kyyk..','..kyyk..','kkyyyykk','kyyyyyyk','.kyyyyk.','.kyykyk.','.kk..kk.'],
bottle:['......kkkk......','.....kMMMMk.....','.....kMMMMk.....','......kmmk......','.....kmmmmk.....','....kmmmmmmk....','...kmmmmmmmmk...','...kmmwmmmmmk...','...kmmwmmmmmk...','...kmmwmmmmmk...','...kmmmmmmmmk...','...kmmmmmmmmk...','...kmmmmmmmmk...','...kMmmmmmMMk...','....kMMMMMMk....','.....kkkkkk.....'],
spice:['.....kkkkkk.....','....kNNNNNNk....','....kNNNNNNk....','.....kkkkkk.....','...kkllllllkk...','..kllrrrrrrllk..','..klrrrrrrrrlk..','..klrrrrrrrrlk..','..kwwwwwwwwwwk..','..kwwyoooywwwk..','..kwwoorrooywk..','..kwwwwwwwwwwk..','..klrrrrrrrrlk..','..klrrrrrrrrlk..','..kkllllllllkk..','...kkkkkkkkkk...'],
toy:['.......kk.......','......kyyk......','.......kk.......','.....kkkkkk.....','....krrrrrrk....','...kkkkkkkkkk...','...kooooooook...','..kkkkkkkkkkkk..','..kyyyyyyyyyyk..','.kkkkkkkkkkkkkk.','.kggggggggggggk.','kkkkkkkkkkkkkkkk','kbbbbbbbbbbbbbbk','kkkkkkkkkkkkkkkk','.kNNNNNNNNNNNNk.','..kkkkkkkkkkkk..'],
throw:['................','................','..kkkkkkkkkkkk..','.kcccccccccccck.','.kcccccccccccck.','.kwwwwwwwwwwwwk.','.kcccccccccccck.','.kkkkkkkkkkkkkk.','.kppppppppppppk.','.kwwwwwwwwwwwwk.','.kppppppppppppk.','.kkkkkkkkkkkkkk.','..kkkkkkkkkkkk..','....k.k.k.k.....','....k.k.k.k.....','................'],
balm:['................','................','................','...kkkkkkkkkk...','..kGGGGGGGGGGk..','..kggggggggggk..','..kkkkkkkkkkkk..','..kyyyyyyyyyyk..','..kyyyGyyrryyk..','..kyyGGGyyyyyk..','..kyyyGyyrryyk..','..kyyyyyyyyyyk..','..kOOOOOOOOOOk..','...kkkkkkkkkk...','................','................'],
heart:['..kk..kk..','.krrkkrrk.','krrrrrrrrk','krrwrrrrrk','krrrrrrrrk','.krrrrrrk.','..krrrrk..','...krrk...','....kk....'],
};
function drawMap(ctx,map,x,y,s){s=s||1;for(let r=0;r<map.length;r++){const row=map[r];for(let c=0;c<row.length;c++){const ch=row[c];if(ch==='.')continue;ctx.fillStyle=PAL[ch]||ch;ctx.fillRect(x+c*s,y+r*s,s,s);}}}

/* Icon DSL: ops separated by ';'  R x y w h col | O x y w h col | C cx cy r col | L x1 y1 x2 y2 col | T x y col text | M name x y (map) */
const ICONS={
factory:'R1 7 14 8 e;O1 7 14 8 k;L1 7 4 3 k;L4 3 4 7 k;L5 7 8 3 k;L8 3 8 7 k;L9 7 12 3 k;L12 3 12 7 k;R2 4 2 3 e;R6 4 2 3 e;R10 4 2 3 e;R3 1 2 4 d;R4 10 2 2 y;R8 10 2 2 y;R11 10 2 3 N',
chat:'R2 2 12 8 w;O2 2 12 8 k;R3 10 3 1 k;R3 11 2 1 k;R3 12 1 1 k;R4 5 2 2 k;R7 5 2 2 k;R10 5 2 2 k',
doc:'R3 1 10 14 w;O3 1 10 14 k;R5 4 6 1 e;R5 6 6 1 e;R5 8 6 1 e;R5 11 3 1 b;R6 12 2 1 b',
sign:'R3 1 10 14 w;O3 1 10 14 k;R5 4 6 1 e;R5 6 6 1 e;R5 8 6 1 e;R5 11 4 1 b;L9 14 14 9 O;L10 14 15 9 O;R13 8 2 2 k',
shrug:'C8 8 6 t;R4 3 8 2 k;R6 7 1 1 k;R9 7 1 1 k;R6 10 4 1 k;T11 4 k ?',
tm:'C8 8 7 o;C8 8 5 y;T3 6 k TM',
clock:'C8 8 7 w;R8 4 1 4 k;R8 8 3 1 k;R2 8 1 1 k;R13 8 1 1 k;R8 2 1 1 k;R8 13 1 1 k',
stamp:'R4 1 8 4 n;O4 1 8 4 k;R6 5 4 3 N;R2 8 12 4 k;R3 12 10 2 r',
lock:'R4 7 8 8 o;O4 7 8 8 k;R5 4 1 3 k;R10 4 1 3 k;R5 3 6 1 k;R7 10 2 2 k;R7 12 1 2 k',
bank:'R1 6 14 1 k;L1 6 8 1 k;L8 1 15 6 k;R3 2 10 4 w;R2 7 12 6 w;R3 7 2 6 e;R7 7 2 6 e;R11 7 2 6 e;R1 13 14 2 k;R4 3 8 1 e',
briefcase:'R2 5 12 9 n;O2 5 12 9 k;R6 3 4 1 k;R6 4 1 1 k;R9 4 1 1 k;R2 9 12 1 N;R7 8 2 3 y',
piggy:'C8 9 5 p;R12 8 3 3 p;O12 8 3 3 k;R6 7 1 1 k;R5 13 2 2 p;R9 13 2 2 p;R7 3 3 1 k;R8 4 1 1 k',
shop:'R1 3 14 3 r;R3 3 2 3 w;R7 3 2 3 w;R11 3 2 3 w;O1 3 14 3 k;R2 6 12 8 l;O2 6 12 8 k;R6 9 4 5 n;R3 8 2 2 c;R11 8 2 2 c',
cardok:'R1 4 14 9 w;O1 4 14 9 k;R3 6 3 4 t;R7 7 5 1 e;R7 9 5 1 e;R9 11 1 1 g;R10 12 1 1 g;R11 11 1 1 g;R12 10 1 1 g;R13 9 1 1 g',
cardx:'R1 4 14 9 w;O1 4 14 9 k;R3 6 3 4 t;R7 7 5 1 e;R7 9 5 1 e;L9 9 13 13 r;L13 9 9 13 r;L10 9 14 13 r',
tick:'R2 2 12 12 w;O2 2 12 12 k;L4 8 7 11 G;L5 8 8 11 G;L7 11 12 5 G;L8 11 13 5 G',
untick:'R2 2 12 12 w;O2 2 12 12 k',
fax:'R1 7 14 7 e;O1 7 14 7 k;R4 1 8 7 w;O4 1 8 7 k;R6 3 4 1 e;R6 5 4 1 e;R3 10 2 1 k;R6 10 2 1 k;R9 10 4 2 d',
sticker:'R1 4 14 10 T;O1 4 14 10 k;C8 9 3 w;C8 9 2 y;L2 5 4 5 e',
print:'R1 4 14 10 T;O1 4 14 10 k;R4 8 8 2 o;R4 11 5 1 O;R2 5 12 1 e',
plainbox:'R1 4 14 10 T;O1 4 14 10 k;R7 4 2 10 e;R2 5 12 1 e',
camera:'R1 5 14 9 d;O1 5 14 9 k;C8 9 3 c;C8 9 1 w;R3 3 4 2 d;O3 3 4 2 k;R11 3 2 2 r',
guard:'C8 5 3 t;R4 1 8 2 B;R3 3 10 1 B;R4 8 8 7 B;O4 8 8 7 k;R7 10 2 2 y;R6 6 1 1 k;R9 6 1 1 k',
barcode:'R1 3 14 10 w;O1 3 14 10 k;R3 5 1 6 k;R5 5 1 6 k;R6 5 2 6 k;R9 5 1 6 k;R11 5 1 6 k;R12 5 2 6 k',
barcode2:'R1 3 14 10 w;O1 3 14 10 k;R3 5 1 6 k;R5 5 1 6 k;R6 5 2 6 k;R9 5 1 6 k;R11 5 1 6 k;R12 5 2 6 k;R8 9 8 6 r;T9 10 w ₹',
lab:'R6 1 1 6 k;R10 1 1 6 k;R5 1 7 1 k;L6 7 3 13 k;L10 7 13 13 k;R3 13 11 2 k;R5 10 7 3 g;R4 12 9 1 g;R7 11 1 1 w;R6 8 5 1 c',
labelok:'R2 1 12 14 w;O2 1 12 14 k;R4 3 8 1 k;R4 5 5 1 e;R4 7 8 4 l;O4 7 8 4 k;R5 8 6 1 e;R5 9 4 1 e;R4 12 3 1 o;R7 12 2 1 w;R9 12 3 1 g',
labelbad:'R2 1 12 14 w;O2 1 12 14 k;R4 3 8 1 e;R4 5 3 1 e;L7 8 12 13 r;L8 8 13 13 r;L12 8 7 13 r;L13 8 8 13 r',
coo:'R2 4 12 3 o;R2 7 12 3 w;R2 10 12 3 g;O2 4 12 9 k;C8 8 1 b;R1 2 1 13 N',
agent:'C8 5 3 t;R5 1 6 2 k;R4 8 8 7 d;O4 8 8 7 k;R7 8 2 6 r;R6 6 1 1 k;R9 6 1 1 k',
broker:'C8 5 3 t;R5 1 6 2 n;R4 8 8 7 B;O4 8 8 7 k;R7 8 2 6 y;R6 5 2 2 k;R9 5 2 2 k;R6 6 1 1 w;R9 6 1 1 w',
cert:'R2 1 12 12 w;O2 1 12 12 k;R4 3 8 1 e;R4 5 8 1 e;R4 7 5 1 e;C11 11 2 r;R10 12 1 4 r;R12 12 1 4 r',
search:'C6 6 5 w;C6 6 4 c;C6 6 5 k;C6 6 4 w;C6 6 3 c;L10 10 14 14 k;L11 10 15 14 k',
page:'R2 1 12 14 w;O2 1 12 14 k;R4 3 8 5 c;O4 3 8 5 k;R5 6 2 2 g;R4 10 8 1 e;R4 12 6 1 e;T9 4 k A+',
plane:'R3 7 10 3 l;O3 7 10 3 k;R12 8 3 1 l;R5 4 3 3 l;O5 4 3 3 k;R6 10 5 2 l;O6 10 5 2 k;R7 8 1 1 b;R9 8 1 1 b;R11 8 1 1 b',
ship:'R2 9 12 5 R;O2 9 12 5 k;R4 7 8 2 w;O4 7 8 2 k;R6 4 4 3 w;O6 4 4 3 k;R8 2 2 2 k;R4 6 2 1 o;R7 6 2 1 g;R10 6 2 1 b;R1 14 3 1 c;R6 15 3 1 c;R11 14 3 1 c',
parcels:'R1 9 5 5 T;O1 9 5 5 k;R7 9 5 5 T;O7 9 5 5 k;R4 3 5 5 T;O4 3 5 5 k;R12 6 3 3 T;O12 6 3 3 k',
warehouse:'R0 3 16 2 d;R1 5 14 10 e;O1 5 14 10 k;R3 9 3 6 d;R7 9 3 6 d;R11 9 3 6 d;T2 6 k FBA',
me:'C8 8 5 t;R4 3 8 2 k;R3 4 1 3 k;R12 4 1 3 k;R6 7 1 1 k;R9 7 1 1 k;R6 10 4 1 k;R5 9 1 1 k;R10 9 1 1 k',
gate:'R2 3 2 12 d;O2 3 2 12 k;R1 14 5 2 d;R3 6 12 2 w;O3 6 12 2 k;R5 6 2 2 r;R9 6 2 2 r;R13 6 2 2 r',
megaphone:'R2 6 2 5 o;O2 6 2 5 k;R4 5 5 7 o;O4 5 5 7 k;R9 3 2 11 O;O9 3 2 11 k;R12 6 2 1 k;R12 8 3 1 k;R12 10 2 1 k',
vine:'C8 7 5 g;C8 7 5 G;C8 7 4 g;R8 8 1 7 G;L5 10 11 4 G;R2 12 2 1 g;R12 12 2 1 g',
fakestars:'R4 1 8 14 d;O4 1 8 14 k;R5 3 6 9 w;R6 4 1 1 y;R8 4 1 1 y;R10 4 1 1 y;R6 6 1 1 y;R8 6 1 1 y;R10 6 1 1 y;R6 8 1 1 y;R8 8 1 1 y;R10 8 1 1 y;L1 1 15 15 r;L2 1 15 14 r;L15 1 1 15 r',
reqreview:'R1 5 14 9 w;O1 5 14 9 k;L1 5 8 11 k;L8 11 15 5 k;M star 5 0',
house:'L1 8 8 1 k;L8 1 15 8 k;R3 5 10 3 r;R3 8 10 7 l;O3 8 10 7 k;R7 11 3 4 n;R4 9 2 2 c;R10 9 2 2 c;R1 15 14 1 k',
dollar:'C8 8 7 y;C8 8 6 o;C8 8 5 y;T5 5 G $',
rupee:'C8 8 7 y;C8 8 6 o;C8 8 5 y;T5 5 G ₹',
receipt:'R3 1 10 12 w;O3 1 10 12 k;R5 3 6 1 e;R5 5 6 1 e;R5 7 4 1 e;R5 9 6 1 g;R3 13 2 1 k;R6 13 2 1 k;R9 13 2 1 k;R12 13 1 1 k',
monitor:'R1 2 14 10 d;O1 2 14 10 k;R3 4 10 6 c;L5 7 7 9 G;L7 9 11 5 G;L6 7 8 9 G;R6 12 4 1 k;R4 13 8 1 k',
check:'L2 8 6 12 g;L3 8 7 12 g;L4 8 8 12 g;L6 12 14 4 g;L7 12 15 4 g;L8 12 15 5 g',
cross:'L3 3 13 13 r;L4 3 14 13 r;L2 3 12 13 r;L13 3 3 13 r;L14 3 4 13 r;L12 3 2 13 r',
walk:'R2 7 9 2 k;L9 3 13 8 k;L9 12 13 7 k;L10 3 14 8 k;L10 12 14 7 k',
wallet:'R1 4 14 10 n;O1 4 14 10 k;R1 7 14 1 N;R10 8 5 4 N;O10 8 5 4 k;R12 9 2 2 y',
stampbook:'R2 1 12 14 R;O2 1 12 14 k;R4 3 8 10 w;C8 8 3 r;R4 1 1 14 k',
note:'R9 2 2 9 k;R9 2 5 2 k;R13 2 1 4 k;C7 12 3 k;C12 10 2 k',
mute:'R9 2 2 9 e;R9 2 5 2 e;C7 12 3 e;L2 2 14 14 r;L3 2 15 14 r',
refund:'R2 6 12 9 c;O2 6 12 9 k;R4 4 8 2 l;O4 4 8 2 k;M coin 4 8;R7 1 2 3 k',
timer:'C8 9 6 w;C8 9 6 k;C8 9 5 w;R7 1 2 2 k;R8 5 1 4 k;R8 9 3 1 k;R4 11 8 1 r',
key:'C5 6 3 y;C5 6 3 k;C5 6 2 y;R7 5 8 2 y;O7 5 8 2 k;R12 7 1 2 y;R14 7 1 3 y',
ticket:'R1 4 14 9 y;O1 4 14 9 k;R1 7 2 3 k;R14 7 1 3 k;R10 5 1 1 k;R10 7 1 1 k;R10 9 1 1 k;R10 11 1 1 k;R4 6 4 1 r;R4 8 5 1 O;R4 10 3 1 O',
map:'R1 2 14 12 s;O1 2 14 12 k;L3 4 6 8 b;L6 8 10 6 b;L10 6 13 11 b;R4 10 2 2 g;R9 4 2 2 r',
diya:'R7 2 2 5 y;R8 1 1 1 o;R7 6 2 1 O;R8 3 1 2 w;R2 9 12 2 m;O2 9 12 2 k;R3 11 10 2 M;O3 11 10 2 k;R5 13 6 1 k;R1 8 2 1 k;R13 8 2 1 k',
phone:'R4 1 8 14 k;R5 3 6 9 c;R7 2 2 1 d;R7 13 2 1 w;R7 4 2 5 r;R7 10 2 1 r',
rain:'C5 5 3 l;C10 4 4 l;R2 5 13 4 l;O2 5 13 4 d;R3 4 11 1 l;L4 11 3 13 b;L8 11 7 13 b;L12 11 11 13 b;L6 14 5 15 b;L10 14 9 15 b',
news:'R1 3 14 11 w;O1 3 14 11 k;R3 5 10 2 k;R3 8 4 4 c;O3 8 4 4 k;R8 8 5 1 e;R8 10 5 1 e;R3 12 10 1 e;R13 2 2 2 r',
calendar:'R2 3 12 12 w;O2 3 12 12 k;R3 4 10 3 r;R4 1 1 4 k;R11 1 1 4 k;R4 9 2 2 e;R7 9 2 2 e;R10 9 2 2 e;R4 12 2 2 e;R7 12 2 2 G;R10 12 2 2 e',
onestar:'R1 3 14 11 w;O1 3 14 11 k;M star 2 5;R11 6 3 1 e;R11 8 3 1 e;R11 10 2 1 e',
trophy:'R4 2 8 6 y;O4 2 8 6 k;R2 3 2 1 k;R2 3 1 3 k;R3 6 1 1 k;R12 3 2 1 k;R13 3 1 3 k;R12 6 1 1 k;R6 3 1 3 w;R7 8 2 3 O;R5 11 6 1 O;R4 12 8 3 N;O4 12 8 3 k;R6 13 4 1 y',
share:'R2 6 9 9 w;O2 6 9 9 k;L6 10 13 3 G;L7 10 14 3 G;R10 2 5 1 G;R14 2 1 5 G',
};
const iconCache={};
function px(ctx,x,y,c){ctx.fillStyle=PAL[c]||c;ctx.fillRect(x,y,1,1);}
function line(ctx,x1,y1,x2,y2,c){let dx=Math.abs(x2-x1),dy=-Math.abs(y2-y1),sx=x1<x2?1:-1,sy=y1<y2?1:-1,err=dx+dy;for(;;){px(ctx,x1,y1,c);if(x1===x2&&y1===y2)break;const e2=2*err;if(e2>=dy){err+=dy;x1+=sx;}if(e2<=dx){err+=dx;y1+=sy;}}}
function circle(ctx,cx,cy,r,c){ctx.fillStyle=PAL[c]||c;for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++){if(x*x+y*y<=r*r+r*0.6)ctx.fillRect(cx+x,cy+y,1,1);}}
function drawIcon(ctx,name,ox,oy){const def=ICONS[name];if(!def){if(MAPS[name]){drawMap(ctx,MAPS[name],ox,oy,1);}return;}
  def.split(';').forEach(op=>{op=op.trim();if(!op)return;const t=op[0];const a=op.slice(1).trim().split(' ');
    if(t==='R'){ctx.fillStyle=PAL[a[4]]||a[4];ctx.fillRect(ox+ +a[0],oy+ +a[1],+a[2],+a[3]);}
    else if(t==='O'){const x=ox+ +a[0],y=oy+ +a[1],w=+a[2],h=+a[3],c=a[4];ctx.fillStyle=PAL[c]||c;ctx.fillRect(x,y,w,1);ctx.fillRect(x,y+h-1,w,1);ctx.fillRect(x,y,1,h);ctx.fillRect(x+w-1,y,1,h);}
    else if(t==='C'){circle(ctx,ox+ +a[0],oy+ +a[1],+a[2],a[3]);}
    else if(t==='L'){line(ctx,ox+ +a[0],oy+ +a[1],ox+ +a[2],oy+ +a[3],a[4]);}
    else if(t==='T'){ctx.fillStyle=PAL[a[2]]||a[2];ctx.font='6px "Press Start 2P",monospace';ctx.textBaseline='top';ctx.fillText(a.slice(3).join(' '),ox+ +a[0],oy+ +a[1]);}
    else if(t==='M'){drawMap(ctx,MAPS[a[0]],ox+ +a[1],oy+ +a[2],1);}
  });}
function iconCanvas(name,scale){scale=scale||3;const key=name+'@'+scale;if(iconCache[key])return iconCache[key];
  const c=document.createElement('canvas');c.width=16*scale;c.height=16*scale;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
  const off=document.createElement('canvas');off.width=16;off.height=16;const o=off.getContext('2d');
  if(MAPS[name]&&!ICONS[name]){const m=MAPS[name];const w=m[0].length,h=m.length;drawMap(o,m,Math.floor((16-w)/2),Math.floor((16-h)/2),1);}else drawIcon(o,name,0,0);
  x.drawImage(off,0,0,16*scale,16*scale);iconCache[key]=c;return c;}
function iconEl(name,scale){const src=iconCanvas(name,scale||3);const c=document.createElement('canvas');c.width=src.width;c.height=src.height;c.getContext('2d').drawImage(src,0,0);c.setAttribute('aria-hidden','true');return c;}
/* product photo thumbnails for the listing station */
function photoCanvas(product,style){const c=document.createElement('canvas');c.width=48;c.height=48;const x=c.getContext('2d');x.imageSmoothingEnabled=false;
  if(style==='white'){x.fillStyle='#fff';x.fillRect(0,0,48,48);const off=document.createElement('canvas');off.width=16;off.height=16;drawMap(off.getContext('2d'),MAPS[product],0,0,1);x.drawImage(off,4,4,40,40);}
  else if(style==='clutter'){x.fillStyle='#8B5A2B';x.fillRect(0,0,48,48);x.fillStyle='#5C3A18';x.fillRect(0,30,48,18);const junk=['#E8563F','#4F8FE6','#A7A7B3','#FFE66D','#2E9A4B'];for(let i=0;i<9;i++){x.fillStyle=junk[i%5];x.fillRect((i*13)%44,(i*17)%40,9,7);}const off=document.createElement('canvas');off.width=16;off.height=16;drawMap(off.getContext('2d'),MAPS[product],0,0,1);x.drawImage(off,18,20,16,16);}
  else{x.fillStyle='#F5EEDC';x.fillRect(0,0,48,48);x.strokeStyle='#5A5A6B';x.lineWidth=2;x.setLineDash([3,3]);x.strokeRect(10,8,28,32);x.beginPath();x.moveTo(12,40);x.lineTo(36,12);x.stroke();x.font='8px "Press Start 2P"';x.fillStyle='#5A5A6B';x.fillText('?',20,28);}
  x.strokeStyle='#1B1B24';x.lineWidth=2;x.setLineDash([]);x.strokeRect(1,1,46,46);return c;}
document.fonts&&document.fonts.ready.then(()=>{for(const k in iconCache)delete iconCache[k];document.querySelectorAll('canvas[data-icon]').forEach(c=>{const s=iconCanvas(c.dataset.icon,3);c.width=s.width;c.height=s.height;c.getContext('2d').drawImage(s,0,0);});});
document.querySelectorAll('canvas[data-icon]').forEach(c=>{const s=iconCanvas(c.dataset.icon,3);c.width=s.width;c.height=s.height;c.getContext('2d').drawImage(s,0,0);});


