/* The Journey of One Box · amyra-ind-usa-export · MIT License · https://games.edock.io/amyra-ind-usa-export */
/* ============ CONTENT ============ */
const UNITS=300,FX=84;
const GAME_ID='amyra-ind-usa-export';
/* The public address of the game, used in the share message. Forks change it to their own. */
const GAME_URL='https://games.edock.io/amyra-ind-usa-export';
/* The live session promoted at the end of the game. After endsAt the event card hides itself
   and the button points to all upcoming Edock sessions instead. */
const SESSION={
  title:'India to USA: Your first export on Amazon',
  host:'With Nishant Chaudhary, Business Head, Amyra Farms',
  when:'Fri, 2 Oct \u00B7 7:00 to 8:30 PM IST \u00B7 Zoom',
  month:'OCT',day:'2',price:'\u20B9249',
  url:'https://edock.io/guest/community?event=india-to-usa-your-first-export-on-amazon&tab=events',
  campaign:'india-to-usa-first-export-2oct',
  endsAt:'2026-10-02T20:30:00+05:30',
  allUrl:'https://edock.io/guest/community?tab=events',
  allCampaign:'edock-sessions'
};
const PRODUCTS={
  bottle:{name:'Copper bottle',sprite:'bottle',price:24.99,cost:350,fba:5.5,duty:0.03,compliance:'coo',tag:'Light, tough, India-famous',kwOk:'copper water bottle',kwBad:['tamba bottle','jal patra'],
    q:{ask:'Can I keep lemon water in it?',good:'No, plain water only',bad:'Yes, any drink',why:'Copper reacts with sour drinks. A false yes brings sick customers and returns.'}},
  spice:{name:'Spice blend',sprite:'spice',price:12.99,cost:120,fba:3.9,duty:0.02,compliance:'fda',tag:'Cheap to make, food rules apply',kwOk:'garam masala seasoning',kwBad:['masala powder packet','desi masala'],
    q:{ask:'Does it contain nuts? My son is allergic.',good:'Answer from the allergen label',bad:'Probably not',why:'A guess about allergies can put a child in hospital. Answer only from the label.'}},
  toy:{name:'Wooden toy',sprite:'toy',price:19.99,cost:220,fba:5.0,duty:0.0,compliance:'toy',tag:'Loved abroad, safety tests apply',kwOk:'wooden stacking toy',kwBad:['lattu khilona','kids wood item'],
    q:{ask:'Is it safe for my 1-year-old?',good:'No, it is for age 3 and up',bad:'Yes, any age',why:'Small parts can choke a baby. The age on the label is there for a reason.'}},
  throw:{name:'Cotton throw',sprite:'throw',price:34.99,cost:600,fba:7.2,duty:0.09,compliance:'textile',tag:'Good price, bulky to ship',kwOk:'cotton throw blanket',kwBad:['chaddar','razai cover'],
    q:{ask:'Can I wash it in hot water?',good:'No, wash cold, as the label says',bad:'Yes, hot is fine',why:'Hot water shrinks cotton. Every shrunk throw comes back as a return.'}},
  /* A camphor and menthol balm is an over-the-counter drug in the USA (FDA OTC Monograph M017). */
  balm:{name:'Pain relief balm',sprite:'balm',price:9.99,cost:70,fba:3.4,duty:0.0,compliance:'otc',tag:'India-famous, but a medicine in the US',kwOk:'pain relief balm',kwBad:['dard ka malham','sar dard balm'],
    q:{ask:'Can I use it on my 1-year-old?',good:'No, ask a doctor under age 2',bad:'Yes, it is all natural',why:'Camphor can harm small children. The label says: under 2 years, ask a doctor.'}}
};
const STAMPS={
  SAMPLE:['Golden sample','The one approved piece. Every unit must match it.'],
  DESIGN:['Design paper','Written proof the design and moulds are yours.'],
  TM:['Trademark','Your brand name booked in the USA. Pending is enough for Amazon.'],
  IEC:['IEC','India’s 10-digit exporter ID. Confirm it every year.'],
  GST:['GST number','Business tax number. Needed to export as a business.'],
  LUT:['LUT','Promise letter: export now, skip 18% tax upfront.'],
  ADC:['AD Code','Your bank’s code with customs, so foreign money can land.'],
  SELLER:['Seller account','Your shop on Amazon USA.'],
  EIN:['EIN','Free US tax number for your business.'],
  W8:['W-8BEN','Says you live outside the US. No 30% cut on payouts.'],
  BATCH:['First batch','The full run, brand printed on every unit.'],
  BR:['Brand Registry','Amazon agrees the brand is yours. Unlocks A+, Vine, protection.'],
  GS1:['GS1 barcode','Genuine barcode numbers for your listing.'],
  FDA:['FDA registered','Factory on the US food authority’s list, with a US agent.'],
  CPC:['CPC','Toy lab-tested to the US standard, certificate written.'],
  DRUG:['FDA drug listing','Balm listed with FDA as an over-the-counter medicine, with its own NDC number.'],
  LABEL:['US label','Fibre, care and origin, written the American way.'],
  COO:['Made in India','Country of origin marked for good. Every import needs it.'],
  LIST:['Listing live','Photos, words and A+ ready.'],
  SB:['Shipping bill','Customs proof the goods left India. Open until paid.'],
  IOR:['Importer of Record','The name that answers to US customs. Never Amazon.'],
  FBA:['In FBA','Stock inside Amazon’s warehouse.'],
  LAUNCH:['Launched','Ads on, honest reviews coming.'],
  FIRA:['FIRA','Bank receipt: the dollars arrived.'],
  EBRC:['e-BRC','Official closing certificate. Promise kept.']
};
/* Year 1 always makes UNITS. From year 2 the player picks the batch size, kept in s.units. */
const unitsOf=s=>s.units||UNITS;
const prodCost=s=>unitsOf(s)*PRODUCTS[s.product].cost;
const dutyINR=s=>Math.round(prodCost(s)*PRODUCTS[s.product].duty);
/* Sea freight has a fixed part, so bigger batches cost less per unit. Air is paid by weight. */
const shipCost=(n,air)=>air?n*300:20000+n*50;
/* Where the dollars from one batch go: Amazon's 15%, the warehouse fee, 3% lost converting to rupees. */
function payout(s){const p=PRODUCTS[s.product],n=unitsOf(s);const gross=n*p.price,amz=gross*0.15,fba=p.fba*n,conv=(gross-amz-fba)*0.03,netUSD=gross-amz-fba-conv;return {gross,amz,fba,conv,netUSD,netINR:Math.round(netUSD*FX)};}
/* A small seeded random, so a saved game gets the same surprises and questions when it reloads. */
function rng(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
function shuffle(list,r){const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const STATIONS=[
 {id:'bazaar',x:150,name:'Bazaar',icon:'shop',title:'Pick your product',sub:'What will your box carry?',
  building:{type:'shop',w:60,h:44,wall:'#F7D9A6',accent:'#E8563F',sign:'BAZAAR'},
  detail:'Pick something people abroad already buy and India makes well. Small, light, hard to break, not too cheap.',
  steps:[{kind:'product'}]},
 {id:'maker',x:350,name:'Workshop',icon:'factory',title:'Find your maker',sub:'Three workshops. Samples first.',
  building:{type:'factory',w:70,h:46,wall:'#C9A46A',accent:'#8B5A2B',sign:'WORKSHOP'},
  detail:'India makes things in clusters: brass in Moradabad, toys in Channapatna, textiles in Panipat. Get samples from three makers before choosing.',
  steps:[
   {prompt:'Which maker gets the order?',choices:[
     {label:'Maker A',icon:'factory',meta:[['star',3],['coin',3],['chat',1]],ok:'meh',cost:6000,weeks:2,say:'Great quality, pricey, slow to reply. It works, but budget more per unit.',set:{makerPremium:true},stamp:'SAMPLE'},
     {label:'Maker B',icon:'factory',meta:[['star',2],['coin',2],['chat',3]],ok:true,cost:6000,weeks:1,say:'Good quality, fair price, replies fast. The one you can build a brand on.',stamp:'SAMPLE'},
     {label:'Maker C',icon:'factory',meta:[['star',1],['coin',1],['chat',1]],ok:false,cost:3000,say:'Cheapest, no samples. The trial batch came back cracked. Try again.'}]},
   {prompt:'Who owns the design?',choices:[
     {label:'Sign a paper',icon:'sign',ok:true,cost:2000,say:'In writing: design, moulds and artwork are yours.',stamp:'DESIGN'},
     {label:'Handshake',icon:'shrug',ok:false,say:'Without paper, the maker can legally sell your design to the next buyer. Sign it.'}]}]},
 {id:'tm',x:575,name:'Cyber Café',icon:'tm',title:'Claim your brand name in the USA',sub:'Name it, check it is free, file it.',
  building:{type:'cafe',w:56,h:44,wall:'#8ED0F5',accent:'#2F63B0',sign:'CYBER CAFE',signBg:'#2F63B0',signFg:'#FFF'},
  detail:'A trademark is the government writing down that a name is yours, country by country. An Indian one means nothing in the USA. Amazon accepts a filed, still-pending application.',
  steps:[
   {kind:'brand',prompt:'Type your brand name'},
   {prompt:'File it in the US trademark office?',choices:[
     {label:'File now',icon:'tm',meta:[['coin',3]],ok:true,cost:45000,weeks:1,say:'Filed through a US attorney. You get a serial number today. Registration takes a year, but pending is enough.',stamp:'TM'},
     {label:'Later, save money',icon:'clock',ok:'meh',say:'Saved for now. Remember this moment.',set:{tmLater:true}}]}]},
 {id:'dgft',x:850,name:'DGFT',icon:'doc',title:'Get your exporter ID',sub:'Ten digits. Yours for life.',
  building:{type:'gov',w:80,h:50,wall:'#E4E4EC',accent:'#F2A93B',sign:'DGFT'},
  detail:'The Importer Exporter Code is India’s permission slip. Online, small fee, linked to your PAN. Re-confirm it every year or it switches off.',
  steps:[{prompt:'Apply online and stamp it.',one:true,choices:[{label:'Stamp my IEC',icon:'stamp',ok:true,cost:500,weeks:1,say:'Done. Every shipping document from now on carries this number.',stamp:'IEC'}]}]},
 {id:'gst',x:1040,name:'GST Office',icon:'lock',title:'Skip the upfront tax',sub:'Register, then sign a promise letter.',
  building:{type:'gov',w:80,h:50,wall:'#E4E4EC',accent:'#4CC96A',sign:'GST OFFICE'},
  detail:'Exports are tax-free, but the default makes you pay 18% first and claim it back months later. The Letter of Undertaking is a promise to bring the money home, so you skip paying. Renew every April.',
  steps:[
   {prompt:'Register your business for GST.',one:true,choices:[{label:'Register (via CA)',icon:'doc',ok:true,cost:2000,weeks:1,say:'You now have a GST number.',stamp:'GST'}]},
   {prompt:'How will you handle export tax?',choices:[
     {label:'Sign the promise letter',icon:'sign',ok:true,say:'LUT signed. No tax paid upfront. You promised to bring the money home within 9 months.',stamp:'LUT'},
     {label:'Pay 18% now, claim later',icon:'refund',ok:'meh',cost:s=>Math.round(prodCost(s)*0.18),say:'Legal, but that cash is now stuck in a refund queue for months.',set:{taxLocked:true}}]}]},
 {id:'bank',x:1230,name:'Bank',icon:'bank',title:'Give customs your bank code',sub:'So foreign money knows where to land.',
  building:{type:'bank',w:76,h:50,wall:'#FFF4DE',accent:'#2F63B0',sign:'BANK'},
  detail:'The AD Code is a 14-digit code from the branch holding your business account. You register it on the customs portal once per port. Without it the port cannot create your shipping bill.',
  steps:[
   {prompt:'Which account?',choices:[
     {label:'Business current a/c',icon:'briefcase',ok:true,say:'Right one. Separate business money means clean bank proofs later.'},
     {label:'Personal savings',icon:'piggy',ok:false,say:'Bank says no. Export money needs a business account.'}]},
   {prompt:'Register the code with customs.',one:true,choices:[{label:'Register AD Code',icon:'key',ok:true,weeks:1,say:'Registered on the customs portal. The port can now issue your papers.',stamp:'ADC'}]}]},
 {id:'seller',x:1410,name:'Seller Central',icon:'shop',title:'Open your Amazon USA shop',sub:'ID check, then the US tax office.',
  building:{type:'cafe',w:56,h:44,wall:'#FFE9B8',accent:'#F2A93B',sign:'SELLER CENTRAL'},
  detail:'Indian residents sign up through Amazon Global Selling with PAN, ID, bank account and IEC. For the USA add a free tax number (EIN) and a form that says you live outside the US, so Amazon does not keep 30% of your payouts.',
  steps:[
   {prompt:'Amazon checks your documents.',choices:[
     {label:'Names match everywhere',icon:'cardok',ok:true,cost:10200,weeks:2,say:'Verified on video call. Seller plan paid for 3 months.',stamp:'SELLER'},
     {label:'Ravi K. on one, Ravi Kumar on another',icon:'cardx',ok:false,say:'Rejected. Every document must match, letter for letter.'}]},
   {prompt:'Tax interview: do you live outside the USA?',choices:[
     {label:'Yes, sign W-8BEN',icon:'tick',ok:true,say:'No US tax will be held back from your payouts.',stamp:'W8'},
     {label:'Skip the form',icon:'untick',ok:false,say:'Amazon would keep up to 30% of every payout. Sign it.'}]},
   {prompt:'Get a free US tax number.',one:true,choices:[{label:'Fax form to the IRS',icon:'fax',ok:true,weeks:3,say:'EIN arrived by fax. Free, and no US company needed.',stamp:'EIN'}]}]},
 {id:'batch',x:1600,name:'Factory',icon:'print',title:'Make 300 units, brand on them',sub:'The name must be part of the product.',
  building:{type:'factory',w:96,h:52,wall:'#A7A7B3',accent:'#5A5A6B',sign:'FACTORY'},
  detail:'Amazon’s brand programme wants real photos of the brand printed, engraved or woven on, not a sticker and not a design file. So the first run comes before you can finish registering the brand.',
  steps:[
   {prompt:'How does your brand go on?',choices:[
     {label:'Printed and engraved',icon:'print',ok:true,cost:s=>prodCost(s)+9000,weeks:4,say:'Permanent. Exactly what Amazon wants to see.',stamp:'BATCH'},
     {label:'Paper sticker',icon:'sticker',ok:'meh',cost:s=>prodCost(s)+1500,weeks:3,say:'Cheaper today. Stickers peel, and Amazon knows it.',set:{sticker:true},stamp:'BATCH'},
     {label:'No brand, plain',icon:'plainbox',ok:false,say:'Then it is nobody’s product. Anyone can copy the listing.'}]},
   {prompt:'Check the batch before it leaves?',choices:[
     {label:'Hire an inspector',icon:'search',ok:true,cost:8000,say:'Inspector found 6 bad units. Fixed before shipping.'},
     {label:'Trust the maker',icon:'shrug',ok:'meh',say:'Saved a little. You will find out in the reviews.',set:{noInspect:true}}]},
   {prompt:'Photograph product and box with the brand.',one:true,choices:[{label:'Take the photos',icon:'camera',ok:true,say:'Plain table, good light, brand visible. Saved.'}]}]},
 {id:'br',x:1760,name:'Brand Registry',icon:'guard',title:'Prove the brand is yours',sub:'The guard checks two things.',
  building:{type:'cafe',w:56,h:44,wall:'#DEE8F8',accent:'#2F63B0',sign:'BRAND REGISTRY'},
  detail:'Brand Registry is free and unlocks rich pages, better ads and copycat takedowns. It needs a trademark that is filed or registered, and photos of the brand permanently on the product.',
  steps:s=>{const st=[];
   if(s.tmLater)st.push({prompt:'Guard: no trademark, no entry.',one:true,choices:[{label:'File it now',icon:'tm',ok:true,cost:45000,weeks:3,say:'Filed. Three weeks lost waiting for the serial number. Next time, file first.',stamp:'TM'}]});
   if(s.sticker)st.push({prompt:'Guard: a sticker? Rejected.',one:true,choices:[{label:'Reprint the boxes',icon:'print',ok:true,cost:9000,weeks:2,say:'Boxes reprinted with the brand on. Two weeks and ₹9,000 gone.'}]});
   st.push({prompt:'Upload the real photos and the serial number.',one:true,choices:[{label:'Submit',icon:'camera',ok:true,weeks:1,say:'Approved. Your listings are now locked to you.',stamp:'BR'}]});
   st.push({prompt:'Barcodes for the listing.',choices:[
     {label:'GS1 official',icon:'barcode',ok:true,cost:4500,say:'Genuine numbers, accepted first time.',stamp:'GS1'},
     {label:'Cheap ones on Telegram',icon:'barcode2',ok:false,say:'Rejected. Resold barcodes belong to someone else.'}]});
   return st;}},
 {id:'rules',x:1920,name:'Rules Lab',icon:'lab',title:'Pass the US product rules',sub:'India’s rules do not travel with the goods.',
  building:{type:'lab',w:70,h:48,wall:'#DDF2E4',accent:'#2E9A4B',sign:'RULES LAB'},
  detail:'Every country decides what is safe and honestly labelled. Food, medicines, skin products and children’s items have real checklists. Everything needs a permanent Made in India mark.',
  steps:s=>{const p=PRODUCTS[s.product],st=[];
   if(p.compliance==='fda'){st.push({prompt:'Food going to the USA.',one:true,choices:[{label:'Register factory with FDA',icon:'agent',ok:true,cost:25000,weeks:2,say:'Factory registered, US agent named. Each shipment gets announced in advance.',stamp:'FDA'}]});
     st.push({prompt:'Pick the label the USA accepts.',choices:[{label:'Nutrition panel, allergens',icon:'labelok',ok:true,cost:6000,say:'Correct format. Ingredients in order, allergens named.',stamp:'LABEL'},{label:'Plain Hindi label',icon:'labelbad',ok:false,say:'Customs can hold or destroy this. Redo it.'}]});}
   else if(p.compliance==='toy'){st.push({prompt:'A toy needs a lab test.',one:true,choices:[{label:'Send to approved lab',icon:'lab',ok:true,cost:60000,weeks:3,say:'Passed the US toy standard. Certificate written. Amazon opens the toy category.',stamp:'CPC'}]});
     st.push({prompt:'Pick the label the USA accepts.',choices:[{label:'Tracking label, age mark',icon:'labelok',ok:true,cost:3000,say:'Permanent tracking label on every toy.',stamp:'LABEL'},{label:'No label',icon:'labelbad',ok:false,say:'Every children’s item needs one. Redo it.'}]});}
   else if(p.compliance==='otc'){st.push({prompt:'A pain balm is a medicine in the USA. Its factory must be on FDA’s drug list.',choices:[
      {label:'Use a maker already listed',icon:'factory',ok:true,cost:40000,weeks:2,stamp:'DRUG',say:'Their factory is registered with FDA and pays the yearly fee. Your brand gets its own NDC number under it.'},
      {label:'Register a new factory',icon:'agent',ok:false,say:['A medicine factory pays FDA about {fee} a year before it sells a single tin. Too much for 300 tins. Work with a maker already on the list.',{fee:both(19188)}]}]});
     st.push({prompt:'Pick the label the USA accepts.',choices:[{label:'Drug Facts panel',icon:'labelok',ok:true,cost:6000,say:'Active ingredients with amounts, uses, warnings and directions, in the US format. Every OTC medicine carries one.',stamp:'LABEL'},{label:'Ayurvedic, cures 40 pains',icon:'labelbad',ok:false,say:'Cure claims and no warnings make it an unapproved drug in the US. Customs can refuse it.'}]});}
   else if(p.compliance==='textile'){st.push({prompt:'Pick the label the USA accepts.',choices:[{label:'Fibre, care, origin',icon:'labelok',ok:true,cost:3000,say:'100% cotton, wash cold, Made in India. Sewn in.',stamp:'LABEL'},{label:'Brand name only',icon:'labelbad',ok:false,say:'US law wants fibre content and care instructions. Redo it.'}]});}
   else{st.push({prompt:'Any claims on the box?',choices:[{label:'Keeps water cool',icon:'labelok',ok:true,say:'A plain, true claim. Fine.'},{label:'Cures 40 diseases',icon:'labelbad',ok:false,say:'A health claim needs approval. Amazon will pull the listing.'}]});}
   st.push({prompt:'Country of origin mark.',choices:[{label:'Made in India, permanent',icon:'coo',ok:true,say:'Marked. US customs checks every import for this.',stamp:'COO'},{label:'Skip it',icon:'plainbox',ok:false,say:'Not optional. Shipments without it get held.'}]});
   return st;}},
 {id:'studio',x:2075,name:'Photo Studio',icon:'camera',title:'Build the listing',sub:'Photos sell. Words get found.',
  building:{type:'studio',w:60,h:44,wall:'#3A3446',accent:'#F28CB1',sign:'PHOTO STUDIO',signBg:'#F28CB1'},
  detail:'Shoppers decide from the first photo: pure white background, product filling the frame. Lower on the page, brand owners add picture-rich A+ content. Use the words Americans type, not the Hindi ones.',
  steps:s=>{const p=PRODUCTS[s.product];const kws=[{label:p.kwOk,raw:true,icon:'search',ok:true,say:'That is what they type. Title, bullets, hidden keywords.'}].concat(p.kwBad.map(k=>({label:k,raw:true,icon:'search',ok:false,say:'Nobody in Ohio searches that. Try again.'})));
   for(let i=kws.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[kws[i],kws[j]]=[kws[j],kws[i]];}
   return [
    {prompt:'Pick the main photo.',choices:[
      {label:'White background, big',photo:'white',ok:true,cost:15000,weeks:1,say:'Amazon’s rule and the shopper’s favourite.'},
      {label:'On the kitchen table',photo:'clutter',ok:false,say:'Rejected as a main image. Too busy, product too small.'},
      {label:'A drawing of it',photo:'draw',ok:false,say:'Mock-ups are not allowed. Real photos only.'}]},
    {prompt:'Americans search for…',choices:kws},
    {prompt:'Add the picture-rich section.',one:true,choices:[{label:'Build A+ content',icon:'page',ok:true,say:'Banners, a comparison chart, the artisan’s story. Listing is live.',stamp:'LIST'}]}];}},
 {id:'port',x:2325,name:'Port',icon:'ship',title:'Ship the boxes',sub:'And decide who answers to US customs.',
  building:{type:'shed',w:100,h:46,wall:'#7F8FA6',accent:'#F2A93B',sign:'PORT · CUSTOMS'},
  detail:'A freight forwarder is a travel agent for cargo. Sea is cheap and slow, air is fast and pricey. On the US side someone must sign the customs entry and pay duty. Amazon refuses that role.',
  steps:[
   {prompt:'How do 300 units cross?',choices:[
     {label:'Ship',icon:'ship',meta:[['coin',1],['clock',3]],ok:true,cost:35000,weeks:7,say:'Cheap. About 7 weeks door to door.'},
     {label:'Plane',icon:'plane',meta:[['coin',3],['clock',1]],ok:'meh',cost:90000,weeks:1,set:{air:true},say:'There in a week, at nearly three times the price. Fine for a first small batch.'},
     {label:'300 small parcels',icon:'parcels',ok:false,say:'The duty-free parcel shortcut ended in 2025. Each one gets stopped. No.'}]},
   {prompt:'Who signs at US customs?',choices:[
     {label:'Amazon',icon:'warehouse',ok:false,say:'Amazon never acts as importer. The boxes would sit at the port.'},
     {label:'Me, with a customs bond',icon:'me',ok:true,cost:20000,say:'You are the importer, from India. Bond bought with your EIN.',stamp:'IOR',set:{ior:'self'}},
     {label:'A customs broker',icon:'broker',ok:true,cost:25000,say:'The broker imports in your name and files everything.',stamp:'IOR',set:{ior:'broker'}}]},
   {prompt:'Customs issues the export paper.',one:true,choices:[{label:'Get the shipping bill',icon:'doc',ok:true,say:'Goods have officially left India. This paper stays open until the money comes home.',stamp:'SB'}]}]},
 {id:'usgate',x:3110,name:'US Customs',icon:'gate',title:'Welcome to America',sub:'Answer the officer, pay duty, roll on.',
  building:{type:'gate',w:40,h:40,wall:'#E4E4EC',accent:'#4F8FE6',sign:'US CUSTOMS'},
  detail:'Duty depends on your product code and it changed several times in 2025 and 2026. Check the current rate before you set a price.',
  steps:s=>quizSteps(s).concat([{prompt:'Pay the import duty.',one:true,choices:[{label:'Pay duty',icon:'dollar',ok:true,cost:s=>dutyINR(s),weeks:1,say:'Cleared. The truck rolls to the warehouse.'}]}])},
 {id:'fba',x:3340,name:'FBA Warehouse',icon:'warehouse',title:'Stock in, launch on',sub:'Amazon stores, packs and ships for you.',
  building:{type:'warehouse',w:130,h:56,wall:'#B9C4D0',accent:'#F2A93B',sign:'FBA WAREHOUSE'},
  detail:'A new listing has no reviews, so search barely shows it. Ads buy the first visits. Amazon Vine gives free units to trusted reviewers for honest reviews. Fake reviews end accounts.',
  steps:[
   {prompt:'Boxes arrive with Amazon’s labels.',one:true,choices:[{label:'Check them in',icon:'parcels',ok:true,say:'Stock live. Amazon now packs every order and handles returns.',stamp:'FBA'}]},
   {prompt:'First month of ads?',choices:[
     {label:'Small budget',icon:'megaphone',meta:[['coin',1]],ok:'meh',cost:15000,say:'Slow start. Fewer visits, fewer sales.'},
     {label:'Steady budget',icon:'megaphone',meta:[['coin',2]],ok:true,cost:40000,say:'Enough clicks to learn which words sell.'},
     {label:'Everything',icon:'megaphone',meta:[['coin',3]],ok:'meh',cost:90000,say:'Money burns fast on a page with no reviews yet.'}]},
   {prompt:'How do you get the first reviews?',choices:[
     {label:'Amazon Vine',icon:'vine',ok:true,cost:17000,weeks:3,say:'Honest reviews from vetted reviewers. Sales begin.',stamp:'LAUNCH'},
     {label:'Request a Review button',icon:'reqreview',ok:true,weeks:4,say:'Free and allowed. Slower, but it adds up.',stamp:'LAUNCH'},
     {label:'Buy 50 five-star reviews',icon:'fakestars',ok:false,penalty:20000,say:'Account suspended. Money frozen. Appeal cost ₹20,000 and a month. Never again.',weeks:4}]}]},
 {id:'home',x:3590,name:'Customer',icon:'house',title:'Delivered',sub:'Someone in Ohio just paid for your box.',
  building:{type:'house',w:56,h:36,wall:'#FFF4DE',accent:'#B93A27',sign:'CUSTOMER'},
  detail:'The customer pays Amazon in dollars. Amazon keeps its fees and pays you every two weeks.',
  steps:[{prompt:'Ring the bell.',one:true,choices:[{label:'Deliver',icon:'heart',ok:true,say:'Five stars. Now the money has to come home.'}]}]},
 {id:'bank2',x:3910,name:'Your Bank',icon:'bank',title:'The money lands',sub:'Dollars in, rupees out, one receipt.',
  building:{type:'bank',w:76,h:50,wall:'#FFF4DE',accent:'#2F63B0',sign:'YOUR BANK'},
  detail:'Amazon pays roughly every 14 days. Dollars become rupees on the way. Each time, ask the bank for the receipt proving foreign money arrived.',
  steps:[{prompt:'Payout arrived. Ask for the receipt.',one:true,choices:[{label:'Collect FIRA',icon:'receipt',ok:true,say:'Receipt in your name, amount in dollars. Keep every one.',stamp:'FIRA'}]}]},
 {id:'portal',x:4075,name:'DGFT Portal',icon:'monitor',title:'Keep the promise',sub:'Match the receipt to the shipping bill.',
  building:{type:'portal',w:60,h:44,wall:'#E4E4EC',accent:'#F2A93B',sign:'DGFT PORTAL'},
  detail:'The bank receipt plus the shipping bill make the e-BRC, the government’s proof that the goods left and the money came home. It closes the LUT promise and unlocks export cash-back.',
  steps:[{prompt:'Generate the closing certificate.',one:true,choices:[{label:'Match and close',icon:'monitor',ok:true,say:'e-BRC issued. Promise kept. Shipment closed.',stamp:'EBRC'}]},{kind:'end'}]}
];



/* ============ YEAR 2 ============ */
/* After the first journey the player can run another year with the same brand. The setup is done,
   so only the stops listed here open; every other building is passed as already done. A field here
   replaces the station's own field for year 2 and later. */
const fmtN=n=>n.toLocaleString('en-IN');
/* Cash a batch of n units needs before Amazon pays: making, printing, sea freight, duty, ads, customs. */
const cashAtStart=s=>s.yearStart!=null?s.yearStart:s.wallet;
const y2Need=(s,n)=>{const p=PRODUCTS[s.product];return n*p.cost+9000+shipCost(n,false)+Math.round(n*p.cost*p.duty)+40000+25000;};
const Y2={
 dgft:{title:'Confirm your exporter ID',sub:'A yearly update, April to June.',
  detail:'Your IEC is yours for life, but DGFT switches it off if you skip the yearly update. Nothing changed? Confirm it anyway.',
  steps:[{prompt:'Log in to DGFT and confirm your details.',one:true,choices:[{label:'Update my IEC',icon:'stamp',ok:true,say:'Confirmed for this year. Every shipping paper keeps working.'}]}]},
 gst:{title:'File this year’s promise letter',sub:'An LUT lasts one financial year.',
  detail:'Every April, file a fresh Letter of Undertaking. Skip it and the next exports need 18% tax paid upfront.',
  steps:s=>[{prompt:'File the LUT for the new financial year.',one:true,choices:[{label:'File a fresh LUT',icon:'sign',ok:true,stamp:'LUT',
    say:s.stamps.includes('LUT')?'Filed online for the new year. No tax paid upfront.':'Your first LUT. This year no tax money gets stuck in a refund queue.'}]}]},
 batch:{title:'How big is this year’s batch?',sub:'Bigger batches tie up more cash.',
  detail:'The trademark, tests, photos and listing are done and paid for. Now it is about cash: bigger batches cost less per unit to ship, but every rupee sits in boxes until Amazon pays you.',
  steps:s=>[
   /* Judged on the money the year started with: nothing before this stop costs anything, and the
      wallet after a pick would make the picked size look unaffordable when the game reloads. */
   {prompt:['You have {cash} in the bank. How many units this year?',{cash:fmtINR(cashAtStart(s))}],choices:[300,600,1000].map((n,i)=>{const cash=cashAtStart(s),need=y2Need(s,n),label=['{n} units',{n:fmtN(n)}],icon=['box','parcels','warehouse'][i];
     const make={label,icon,meta:[['coin',i+1]],ok:true,cost:s=>n*PRODUCTS[s.product].cost+9000,weeks:4,set:{units:n},stamp:'BATCH',
       say:['The safe size. Same stock, same sales as last year.','Double the stock. Shipping each unit gets cheaper.','A big bet. Cheapest per unit, and the most cash tied up.'][i]};
     if(cash>=need)return make;
     /* The smallest batch always stays possible, so a poor year never leaves the player stuck. */
     if(i===0)return Object.assign(make,{ok:'meh',say:['Money is tight: this needs about {need} and you have {cash}. The bank lends you the gap until Amazon pays.',{need:fmtINR(need),cash:fmtINR(cash)}]});
     return {label,icon,ok:false,say:['That needs about {need} for making, shipping, duty and ads. You have {cash}. Pick a size you can pay for.',{need:fmtINR(need),cash:fmtINR(cash)}]};})},
   {prompt:'Check the batch before it leaves?',choices:[
     {label:'Hire an inspector',icon:'search',ok:true,cost:s=>Math.round(8000*unitsOf(s)/300/1000)*1000,say:'Bad units found and fixed before shipping. A bigger batch takes the inspector longer.'},
     {label:'Trust the maker',icon:'shrug',ok:'meh',say:'Saved a little. You will find out in the reviews.',set:{noInspect:true}}]}]},
 port:{title:'The new batch sets sail',sub:'Same route, bigger load.',
  detail:'Your freight forwarder and US customs setup carry over from last year. Only the load and the speed are new choices.',
  steps:s=>{const n=unitsOf(s);return [
   {prompt:['How do {n} units cross?',{n:fmtN(n)}],choices:[
     {label:'Ship',icon:'ship',meta:[['coin',1],['clock',3]],ok:true,cost:shipCost(n,false),weeks:7,say:'Cheap, and cheaper per unit the more you send. About 7 weeks.'},
     {label:'Plane',icon:'plane',meta:[['coin',3],['clock',1]],ok:'meh',cost:shipCost(n,true),weeks:1,set:{air:true},say:'Fast, but air is paid by weight. The bill grows with every unit.'}]},
   {prompt:'US customs, same as last year.',one:true,choices:[s.ior==='broker'
     ?{label:'Broker files the entry',icon:'broker',ok:true,cost:25000,say:'Your broker imports in your name again.'}
     :{label:'Renew the yearly bond',icon:'me',ok:true,cost:20000,say:'Bond renewed. You stay the importer.'}]},
   {prompt:'Customs issues the export paper.',one:true,choices:[{label:'Get the shipping bill',icon:'doc',ok:true,say:'A new shipping bill for this batch. It stays open until the money comes home.',stamp:'SB'}]}];}},
 usgate:{title:'Back in America',sub:'Pay duty, roll on.',
  steps:[{prompt:'Pay the import duty.',one:true,choices:[{label:'Pay duty',icon:'dollar',ok:true,cost:s=>dutyINR(s),weeks:1,say:'Cleared. The truck rolls to the warehouse.'}]}]},
 fba:{title:'Restock and sell',sub:'Your reviews carry over.',
  detail:'Last year’s reviews stay on the listing, so this batch starts with trust. Ads still bring the first visits.',
  steps:[
   {prompt:'Boxes arrive with Amazon’s labels.',one:true,choices:[{label:'Check them in',icon:'parcels',ok:true,say:'Stock live again, next to last year’s reviews.',stamp:'FBA'}]},
   {prompt:'Ads this year?',choices:[
     {label:'Small budget',icon:'megaphone',meta:[['coin',1]],ok:'meh',cost:15000,say:'Slow start. Fewer visits, fewer sales.'},
     {label:'Steady budget',icon:'megaphone',meta:[['coin',2]],ok:true,cost:40000,say:'Enough clicks to keep the listing near the top.'},
     {label:'Everything',icon:'megaphone',meta:[['coin',3]],ok:'meh',cost:90000,say:'More than the listing needs. Reviews do part of the work now.'}]}]},
 home:{title:'Delivered again',sub:'A repeat customer ordered two.'},
 bank2:{},
 portal:{}
};
STATIONS.forEach(st=>{if(Y2[st.id])st.y2=Y2[st.id];});
/* Year 2 skips the stamps that belong to one batch, so the player earns them again. */
const PER_BATCH_STAMPS=['BATCH','SB','FBA','FIRA','EBRC'];

/* ============ SURPRISES ============ */
/* Things that happen on the road. Each run draws a few from the pool (auto:false); the auto ones
   always happen when their `when` holds, so a risky pick earlier shows its cost later.
   at: the stop where it appears. pos: 'start' before the stop's own steps, 'end' after them.
   years: the years it can appear in (2 means year 2 and later). shield: a stamp that protects you.
   step: builds a normal step, so choices work exactly like everywhere else. */
const EVENTS=[
 {id:'diwali',at:'batch',pos:'start',icon:'diya',title:'Diwali week',
  step:()=>({prompt:'The workers go home for Diwali. The factory stops for a week.',one:true,choices:[{label:'Wait, then restart',icon:'clock',ok:true,weeks:1,say:'Happy Diwali. Next time, plan production around the festival season.'}]})},
 {id:'otp',at:'seller',pos:'end',icon:'phone',title:'A call from “Amazon”',years:[1],
  step:()=>({prompt:'A caller says he works for Amazon. He wants the OTP that just came to your phone.',choices:[
    {label:'Hang up and report it',icon:'guard',ok:true,say:'Right. Amazon never asks for an OTP or a password on a call.'},
    {label:'Read out the OTP',icon:'chat',ok:false,say:'He takes over your seller account and changes the bank details. Never share an OTP with anyone.'}]})},
 {id:'monsoon',at:'port',pos:'end',icon:'rain',title:'Monsoon at the port',when:s=>!s.air,
  step:()=>({prompt:'Heavy rain at the port. The cranes stop, and your ship sails late.',one:true,choices:[{label:'Wait it out',icon:'ship',ok:true,weeks:1,say:'One week lost. From June to September, add spare time to sea shipments.'}]})},
 {id:'exam',at:'usgate',pos:'start',icon:'guard',title:'Random customs check',shield:'COO',
  step:s=>({prompt:'US customs picks your boxes for a check. An officer opens one and looks closely.',one:true,choices:[{label:'Show the papers',icon:'doc',ok:true,weeks:0,
    say:{fda:'Made in India on every pack, and the FDA papers match. Cleared in two days.',toy:'Made in India on every toy, and the test certificate is ready. Cleared in two days.',textile:'Made in India and the fibre label are sewn in. Cleared in two days.',coo:'Made in India is marked on every bottle. Cleared in two days.',otc:'Made in India, the Drug Facts label and the NDC number all match FDA’s list. Cleared in two days.'}[PRODUCTS[s.product].compliance]}]})},
 {id:'question',at:'fba',pos:'end',icon:'chat',title:'A shopper has a question',
  step:s=>{const q=PRODUCTS[s.product].q;return {prompt:q.ask,choices:[
    {label:q.good,icon:'tick',ok:true,say:'Honest and quick. The answer stays on the page and helps the next shopper decide.'},
    {label:q.bad,icon:'untick',ok:false,say:q.why}]};}},
 {id:'lost',at:'fba',pos:'end',icon:'search',title:'Three units went missing',
  step:()=>({prompt:'Amazon’s warehouse lost 3 of your units.',choices:[
    {label:'File a claim',icon:'doc',ok:true,say:'Amazon pays you back for stock it loses. Check your stock report every month.'},
    {label:'Let it go',icon:'shrug',ok:'meh',say:'That was your money. Amazon pays back lost stock when you ask.'}]})},
 {id:'copycat',at:'home',pos:'start',icon:'guard',title:'A copycat on your page',shield:'BR',
  step:()=>({prompt:'Another seller is selling a cheap fake on your listing and taking your sales.',one:true,choices:[{label:'Report it in Brand Registry',icon:'guard',ok:true,say:'Removed in two days. Without Brand Registry, it can take weeks of emails.'}]})},
 {id:'rupee',at:'bank2',pos:'start',icon:'news',title:'Good news on the rupee',
  step:s=>({prompt:['The dollar now buys {now}, not {was}. Your payout is worth more.',{now:fmtINR(FX+2),was:fmtINR(FX)}],one:true,choices:[{label:'Nice!',icon:'rupee',ok:true,gain:Math.round(payout(s).netUSD*2),say:'Same dollars, more rupees. Rates move both ways, so never plan on it.'}]})},
 {id:'april',at:'bank2',pos:'start',icon:'calendar',title:'April: a new financial year',years:[1],
  step:s=>({prompt:'Months have passed. It is April, when two things need renewing.',one:true,choices:[{label:'Renew both',icon:'stamp',ok:true,
    say:s.stamps.includes('LUT')?'IEC confirmed on DGFT, fresh LUT filed on GST. Miss either and exporting gets harder.':'IEC confirmed on DGFT. You paid tax upfront, so there is no LUT to renew, and that refund is still in the queue.'}]})},
 /* consequences of earlier picks */
 {id:'makerBill',at:'batch',pos:'end',auto:true,when:s=>s.makerPremium,icon:'factory',title:'Maker A’s bill',
  step:()=>({prompt:'Maker A does great work, and charges for it: 15% more on every unit.',one:true,choices:[{label:'Pay the bill',icon:'rupee',ok:true,cost:s=>Math.round(prodCost(s)*0.15),say:'You were warned. Quality costs more, so budget for it.'}]})},
 {id:'cracks',at:'home',pos:'start',auto:true,when:s=>s.noInspect,icon:'onestar',title:'The reviews are in',
  step:s=>{const n=Math.round(unitsOf(s)*0.02);return {prompt:'Some customers got faulty units.',one:true,choices:[{label:'Refund them',icon:'refund',ok:true,cost:Math.round(n*PRODUCTS[s.product].price*FX),
    say:['{n} bad units an inspector would have caught reached customers. You pay the refunds, and two 1-star reviews stay on your page.',{n}]}]};}}
];
/* The pool events for one year, drawn once and saved with the game. */
function pickEvents(s){const y=Math.min(s.year||1,2);const pool=EVENTS.filter(e=>!e.auto&&(!e.years||e.years.includes(y))&&(y===1||STATIONS.some(st=>st.id===e.at&&st.y2)));
  return shuffle(pool,rng(s.seed*31+y)).slice(0,y===1?4:3).map(e=>e.id);}

/* ============ THE OFFICER'S QUESTIONS ============ */
/* At US customs, five quick questions about stamps already earned. */
function quizSteps(s){const r=rng(s.seed*17+1);const own=shuffle(s.stamps.filter(id=>STAMPS[id]),r).slice(0,5);
  return own.map((id,i)=>{const opts=shuffle([id].concat(shuffle(Object.keys(STAMPS).filter(k=>k!==id),r).slice(0,2)),r);
    return {prompt:['Officer’s question {i} of {n}: which stamp means this?',{i:i+1,n:own.length}],quote:STAMPS[id][1],
      choices:opts.map(k=>k===id?{label:STAMPS[k][0],icon:'stamp',ok:true,say:'Correct. The officer nods.'}
        :{label:STAMPS[k][0],icon:'stamp',ok:false,say:['No. {name} means: {meaning}',{name:STAMPS[k][0],meaning:STAMPS[k][1]}]})};});}

/* ============ SCORE ============ */
/* Start at 100. Lose 6 for every wrong pick, 3 for every costly pick you keep, and 1 for every week
   over the par for that year. */
const PAR_WEEKS=[32,15];
const RANKS=[[95,'Export champion'],[80,'Export pro'],[65,'Smart exporter'],[45,'Quick learner'],[0,'First-timer']];
const parWeeks=s=>PAR_WEEKS[Math.min(s.year||1,2)-1];
const scoreOf=s=>Math.max(0,Math.min(100,100-6*(s.mistakes||0)-3*(s.mehs||0)-Math.max(0,s.weeks-parWeeks(s))));
const rankOf=n=>RANKS.find(r=>n>=r[0])[1];
