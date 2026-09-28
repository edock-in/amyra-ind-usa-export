/* The Journey of One Box · amyra-ind-usa-export · MIT License · https://games.edock.io/amyra-ind-usa-export */
/* ============ CONTENT ============ */
const UNITS=300,FX=84;
const GAME_ID='amyra-ind-usa-export';
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
  bottle:{name:'Copper bottle',sprite:'bottle',price:24.99,cost:350,fba:5.5,duty:0.03,compliance:'coo',tag:'Light, tough, India-famous',kwOk:'copper water bottle',kwBad:['tamba bottle','jal patra']},
  spice:{name:'Spice blend',sprite:'spice',price:12.99,cost:120,fba:3.9,duty:0.02,compliance:'fda',tag:'Cheap to make, food rules apply',kwOk:'garam masala seasoning',kwBad:['masala powder packet','desi masala']},
  toy:{name:'Wooden toy',sprite:'toy',price:19.99,cost:220,fba:5.0,duty:0.0,compliance:'toy',tag:'Loved abroad, safety tests apply',kwOk:'wooden stacking toy',kwBad:['lattu khilona','kids wood item']},
  throw:{name:'Cotton throw',sprite:'throw',price:34.99,cost:600,fba:7.2,duty:0.09,compliance:'textile',tag:'Good price, bulky to ship',kwOk:'cotton throw blanket',kwBad:['chaddar','razai cover']}
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
  BATCH:['First batch','300 units, brand printed on.'],
  BR:['Brand Registry','Amazon agrees the brand is yours. Unlocks A+, Vine, protection.'],
  GS1:['GS1 barcode','Genuine barcode numbers for your listing.'],
  FDA:['FDA registered','Factory on the US food authority’s list, with a US agent.'],
  CPC:['CPC','Toy lab-tested to the US standard, certificate written.'],
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
const prodCost=s=>UNITS*PRODUCTS[s.product].cost;
const dutyINR=s=>Math.round(prodCost(s)*PRODUCTS[s.product].duty);
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
  detail:'Every country decides what is safe and honestly labelled. Food, skin products and children’s items have real checklists. Everything needs a permanent Made in India mark.',
  steps:s=>{const p=PRODUCTS[s.product],st=[];
   if(p.compliance==='fda'){st.push({prompt:'Food going to the USA.',one:true,choices:[{label:'Register factory with FDA',icon:'agent',ok:true,cost:25000,weeks:2,say:'Factory registered, US agent named. Each shipment gets announced in advance.',stamp:'FDA'}]});
     st.push({prompt:'Pick the label the USA accepts.',choices:[{label:'Nutrition panel, allergens',icon:'labelok',ok:true,cost:6000,say:'Correct format. Ingredients in order, allergens named.',stamp:'LABEL'},{label:'Plain Hindi label',icon:'labelbad',ok:false,say:'Customs can hold or destroy this. Redo it.'}]});}
   else if(p.compliance==='toy'){st.push({prompt:'A toy needs a lab test.',one:true,choices:[{label:'Send to approved lab',icon:'lab',ok:true,cost:60000,weeks:3,say:'Passed the US toy standard. Certificate written. Amazon opens the toy category.',stamp:'CPC'}]});
     st.push({prompt:'Pick the label the USA accepts.',choices:[{label:'Tracking label, age mark',icon:'labelok',ok:true,cost:3000,say:'Permanent tracking label on every toy.',stamp:'LABEL'},{label:'No label',icon:'labelbad',ok:false,say:'Every children’s item needs one. Redo it.'}]});}
   else if(p.compliance==='textile'){st.push({prompt:'Pick the label the USA accepts.',choices:[{label:'Fibre, care, origin',icon:'labelok',ok:true,cost:3000,say:'100% cotton, wash cold, Made in India. Sewn in.',stamp:'LABEL'},{label:'Brand name only',icon:'labelbad',ok:false,say:'US law wants fibre content and care instructions. Redo it.'}]});}
   else{st.push({prompt:'Any claims on the box?',choices:[{label:'Keeps water cool',icon:'labelok',ok:true,say:'A plain, true claim. Fine.'},{label:'Cures 40 diseases',icon:'labelbad',ok:false,say:'A health claim needs approval. Amazon will pull the listing.'}]});}
   st.push({prompt:'Country of origin mark.',choices:[{label:'Made in India, permanent',icon:'coo',ok:true,say:'Marked. US customs checks every import for this.',stamp:'COO'},{label:'Skip it',icon:'plainbox',ok:false,say:'Not optional. Shipments without it get held.'}]});
   return st;}},
 {id:'studio',x:2075,name:'Photo Studio',icon:'camera',title:'Build the listing',sub:'Photos sell. Words get found.',
  building:{type:'studio',w:60,h:44,wall:'#3A3446',accent:'#F28CB1',sign:'PHOTO STUDIO',signBg:'#F28CB1'},
  detail:'Shoppers decide from the first photo: pure white background, product filling the frame. Lower on the page, brand owners add picture-rich A+ content. Use the words Americans type, not the Hindi ones.',
  steps:s=>{const p=PRODUCTS[s.product];const kws=[{label:p.kwOk,icon:'search',ok:true,say:'That is what they type. Title, bullets, hidden keywords.'}].concat(p.kwBad.map(k=>({label:k,icon:'search',ok:false,say:'Nobody in Ohio searches that. Try again.'})));
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
     {label:'Me, with a customs bond',icon:'me',ok:true,cost:20000,say:'You are the importer, from India. Bond bought with your EIN.',stamp:'IOR'},
     {label:'A customs broker',icon:'broker',ok:true,cost:25000,say:'The broker imports in your name and files everything.',stamp:'IOR'}]},
   {prompt:'Customs issues the export paper.',one:true,choices:[{label:'Get the shipping bill',icon:'doc',ok:true,say:'Goods have officially left India. This paper stays open until the money comes home.',stamp:'SB'}]}]},
 {id:'usgate',x:3110,name:'US Customs',icon:'gate',title:'Welcome to America',sub:'Duty first, then the road opens.',
  building:{type:'gate',w:40,h:40,wall:'#E4E4EC',accent:'#4F8FE6',sign:'US CUSTOMS'},
  detail:'Duty depends on your product code and it changed several times in 2025 and 2026. Check the current rate before you set a price.',
  steps:[{prompt:'Pay the import duty.',one:true,choices:[{label:'Pay duty',icon:'dollar',ok:true,cost:s=>dutyINR(s),weeks:1,say:'Cleared. The truck rolls to the warehouse.'}]}]},
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


