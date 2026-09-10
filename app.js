const offers = [
  {id:'hershey',brand:"Hershey's",product:"Cookies 'n' Creme",category:'Food',mechanic:'Sample Program',headline:'Earn up to $200',funding:'Brand funded',timing:'Demo window',audience:'Eligible shoppers',status:'NEW',chi:5,budget:1000,tile1:'#61c8e7',tile2:'#244a83',label:'HERSHEY'},
  {id:'drpepper',brand:'Dr Pepper',product:'12 fl oz',category:'Drinks',mechanic:'BOGO',headline:'Earn up to $100',funding:'Brand funded',timing:'Demo window',audience:'Eligible shoppers',status:'NEW',chi:5,budget:750,tile1:'#9e1823',tile2:'#3c0f18',label:'DR PEPPER'},
  {id:'redbull',brand:'Red Bull',product:'12 fl oz',category:'Drinks',mechanic:'Sample Program',headline:'Earn up to $400',funding:'Brand funded',timing:'Demo window',audience:'Eligible shoppers',status:'NEW',chi:10,budget:1500,tile1:'#0c66c7',tile2:'#c62c2e',label:'RED BULL'},
  {id:'doritos',brand:'Doritos',product:'Cheese Supreme 20 oz',category:'Food',mechanic:'Free with $10 purchase',headline:'Earn up to $150',funding:'Brand funded',timing:'Demo window',audience:'Eligible shoppers',status:'OPEN',chi:5,budget:900,tile1:'#dc341f',tile2:'#e58910',label:'DORITOS'},
  {id:'crush',brand:'Crush',product:'12-Pack',category:'Drinks',mechanic:'Unlock offer + Chili Rewards',headline:'CHI-enabled shopper offer',funding:'Brand funded',timing:'Demo window',audience:'Eligible shoppers',status:'OPEN',chi:10,budget:2000,tile1:'#f26d1d',tile2:'#ffb429',label:'CRUSH'},
  {id:'icebreakers',brand:'Ice Breakers',product:'Ice Cubes Cinnamon',category:'Food',mechanic:'Sample Program',headline:'Earn up to $180',funding:'Brand funded',timing:'Demo window',audience:'Eligible shoppers',status:'OPEN',chi:5,budget:600,tile1:'#ce2430',tile2:'#8a1122',label:'ICE BREAKERS'},
  {id:'clean',brand:'Germ-X',product:'Hand Sanitizer',category:'Other',mechanic:'Sample Program',headline:'Earn up to $180',funding:'Brand funded',timing:'Demo window',audience:'Eligible shoppers',status:'OPEN',chi:5,budget:500,tile1:'#7dc96d',tile2:'#16786b',label:'GERM-X'}
];

let currentCategory = 'All';
let selectedOffer = null;
let stockState = null;
let buildTimer = null;
let accepted = [];
try { accepted = JSON.parse(localStorage.getItem('gftOfferWallAccepted') || '[]'); } catch (_) { accepted = []; }

const offerGrid = document.getElementById('offerGrid');
const searchInput = document.getElementById('searchInput');
const drawer = document.getElementById('offerDrawer');
const backdrop = document.getElementById('drawerBackdrop');

function offerVisual(o, extra=''){
  return `<div class="offer-visual ${extra}" style="--tile1:${o.tile1};--tile2:${o.tile2}"><b>${o.label}</b></div>`;
}

function renderOffers(){
  const q = searchInput.value.trim().toLowerCase();
  const rows = offers.filter(o => (currentCategory==='All'||o.category===currentCategory) && (!q || `${o.brand} ${o.product} ${o.mechanic} ${o.headline}`.toLowerCase().includes(q)));
  offerGrid.innerHTML = rows.length ? rows.map(o=>`
    <article class="offer-card">
      ${offerVisual(o)}
      <div class="offer-copy">
        <div class="offer-category">${o.category} • ${o.status}</div>
        <h3>${o.brand} ${o.product}</h3>
        <div class="offer-mechanic">${o.mechanic}</div>
        <div class="offer-earn">${o.headline}</div>
        <div class="offer-meta"><span>${o.timing}</span><span>Eligible store demo</span></div>
      </div>
      <div class="offer-side">
        <div class="chi-badge"><img src="assets/chili-rewards-mark.png" alt="" /> ${o.chi} CHI / shopper</div>
        <button class="review-button" data-review="${o.id}">${accepted.some(a=>a.id===o.id)?'View':'Review'}</button>
        <button class="more-button" data-review="${o.id}">More info</button>
      </div>
    </article>`).join('') : `<div class="empty-state">No offers match this view.</div>`;
  document.querySelectorAll('[data-review]').forEach(btn=>btn.addEventListener('click',()=>openOffer(btn.dataset.review)));
  updateMetrics();
}

function updateMetrics(){
  document.getElementById('newMetric').textContent = offers.filter(o=>o.status==='NEW').length;
  document.getElementById('openMetric').textContent = offers.length;
  document.getElementById('readyMetric').textContent = accepted.length;
  document.getElementById('chiMetric').textContent = accepted.reduce((sum,a)=>sum+(a.chi||0),0).toLocaleString();
}

function setBRD(stage,title,body,chips){
  const stages=['inbox','review','inventory','build','ready'];
  const idx=stages.indexOf(stage);
  document.querySelectorAll('.brd-step').forEach((el,i)=>{
    el.classList.toggle('active',i===idx);
    el.classList.toggle('complete',i<idx);
  });
  document.getElementById('stageCounter').textContent=`${idx+1} / 5`;
  document.getElementById('liveTitle').textContent=title;
  document.getElementById('liveBody').textContent=body;
  document.getElementById('liveChips').innerHTML=chips.map(x=>`<span>${x}</span>`).join('');
}

function openOffer(id){
  selectedOffer=offers.find(o=>o.id===id);
  stockState=null;
  clearTimeout(buildTimer);
  renderDrawer('review');
  drawer.classList.remove('hidden');backdrop.classList.remove('hidden');
  setBRD('review',`${selectedOffer.brand} offer opened`,'The manager is reviewing the brand brief before confirming whether the store can support the promotion.',[selectedOffer.category,selectedOffer.mechanic,'Human review']);
}

function closeDrawer(){drawer.classList.add('hidden');backdrop.classList.add('hidden');selectedOffer=null;stockState=null;clearTimeout(buildTimer)}

function field(label,value){return `<div class="field"><span>${label}</span><b>${value}</b></div>`}

function renderDrawer(mode){
  const o=selectedOffer;if(!o)return;
  if(mode==='building'){
    drawer.innerHTML=`
      <div class="drawer-top"><span class="drawer-label">AI CAMPAIGN BUILD</span><button class="close-button" id="closeDrawer" aria-label="Close">×</button></div>
      <div class="drawer-hero"><div class="drawer-brand-line">${offerVisual(o)}<div><h2>${o.brand}</h2><p>Structuring the accepted offer for GFT Rewards.</p></div></div></div>
      <div class="drawer-section"><h3>Build progress</h3><div class="build-list" id="buildList">
        ${buildRow(1,'Normalize brand offer','Working')}${buildRow(2,'Save store inventory eligibility','Queued')}${buildRow(3,'Map Chili Rewards configuration','Queued')}${buildRow(4,'Create GFT Rewards campaign draft','Queued')}
      </div></div>`;
    document.getElementById('closeDrawer').addEventListener('click',closeDrawer);
    runBuild();return;
  }
  if(mode==='ready'){
    const campaign=accepted.find(a=>a.id===o.id);
    drawer.innerHTML=`
      <div class="drawer-top"><span class="drawer-label">CAMPAIGN READY</span><button class="close-button" id="closeDrawer" aria-label="Close">×</button></div>
      <div class="success-panel"><div class="success-check">✓</div><h2>${o.brand} is ready</h2><p>The working demo created a structured campaign draft with store eligibility and Chili Rewards settings. The final launch remains a human-approved GFT Rewards action.</p></div>
      <div class="drawer-section"><h3>Campaign summary</h3><div class="field-grid">${field('Product',o.product)}${field('Mechanic',o.mechanic)}${field('Inventory',campaign?.stockLabel||'Approved')}${field('Shopper reward',`${o.chi} CHI`)}${field('Reward budget',`${o.budget.toLocaleString()} CHI demo`)}${field('Status','Draft ready')}</div>
        <div class="reward-flow"><span>Offer accepted</span><i>→</i><span>GFT campaign</span><i>→</i><span>Shopper action</span><i>→</i><span>${o.chi} CHI reward</span></div>
      </div>
      <a class="open-gft" href="https://admin.gftrewards.com/" target="_blank" rel="noopener">Open GFT Rewards</a>
      <button class="secondary-action" id="viewCampaigns">View demo campaigns</button>`;
    document.getElementById('closeDrawer').addEventListener('click',closeDrawer);
    document.getElementById('viewCampaigns').addEventListener('click',()=>{closeDrawer();switchView('campaigns')});return;
  }
  const out=stockState==='out';
  drawer.innerHTML=`
    <div class="drawer-top"><span class="drawer-label">OFFER REVIEW</span><button class="close-button" id="closeDrawer" aria-label="Close">×</button></div>
    <div class="drawer-hero"><div class="drawer-brand-line">${offerVisual(o)}<div><h2>${o.brand} ${o.product}</h2><p>${o.mechanic} • ${o.headline}</p></div></div><div class="drawer-tags"><span>${o.category}</span><span>${o.funding}</span><span>${o.timing}</span><span>${o.status}</span></div></div>
    <div class="drawer-section"><h3>AI-structured brand brief</h3><div class="field-grid">${field('Product',o.product)}${field('Offer mechanic',o.mechanic)}${field('Funding',o.funding)}${field('Audience',o.audience)}</div><div class="ai-note"><strong>Manager task:</strong><span>Confirm this product can be supported in store. The campaign build remains locked until inventory is selected.</span></div></div>
    <div class="drawer-section"><h3>Inventory gate</h3><div class="stock-buttons"><button class="stock-button ${stockState==='in'?'selected':''}" data-stock="in">In stock</button><button class="stock-button ${stockState==='low'?'selected':''}" data-stock="low">Low stock</button><button class="stock-button ${stockState==='out'?'selected':''}" data-stock="out">Out of stock</button></div><p class="stock-help">Demo control: the manager must confirm inventory before accepting the offer.</p>${out?'<div class="danger-box"><b>Build blocked.</b> This offer is marked out of stock and cannot advance in the demo.</div>':''}</div>
    <div class="drawer-section"><h3>Chili Rewards configuration</h3><div class="reward-config"><div class="reward-box"><span>SHOPPER REWARD</span><strong>${o.chi} CHI</strong><small>Demo value per qualifying shopper</small></div><div class="reward-box"><span>DEMO REWARD BUDGET</span><strong>${o.budget.toLocaleString()} CHI</strong><small>Illustrative only</small></div></div><div class="reward-flow"><span>Qualifying action</span><i>→</i><span>GFT wallet</span><i>→</i><span>${o.chi} CHI</span></div></div>
    <button id="buildButton" class="primary-action" ${!stockState||out?'disabled':''}>Accept & build in GFT Rewards</button>
    <button id="deferButton" class="secondary-action">Defer offer</button>`;
  document.getElementById('closeDrawer').addEventListener('click',closeDrawer);
  drawer.querySelectorAll('[data-stock]').forEach(btn=>btn.addEventListener('click',()=>chooseStock(btn.dataset.stock)));
  document.getElementById('buildButton').addEventListener('click',startBuild);
  document.getElementById('deferButton').addEventListener('click',()=>{showToast('Demo: offer deferred.');setBRD('inventory','Offer deferred','The offer remains outside campaign creation until the store chooses to review it again.',['Deferred','No campaign created','Manager controlled']);closeDrawer()});
}

function chooseStock(state){
  stockState=state;renderDrawer('review');
  const labels={in:['Inventory confirmed','The store marked the product in stock. The offer is eligible to advance.',['In stock','Build unlocked','CHI configured']],low:['Low stock captured','The store marked inventory low. The constraint is carried into the campaign draft.',['Low stock','Constraint captured','Build unlocked']],out:['Out of stock','The offer is blocked from campaign build in this demo.',['Out of stock','Build blocked','Defer / revisit']]};
  const [t,b,c]=labels[state];setBRD('inventory',t,b,c);
}

function startBuild(){if(!stockState||stockState==='out')return;renderDrawer('building');setBRD('build','AI campaign build in progress','The accepted offer, store inventory state, and Chili Rewards configuration are being mapped into a GFT Rewards campaign draft.',['Structured payload','Inventory eligibility','CHI reward rules'])}
function buildRow(n,label,status){return `<div class="build-row" data-row="${n}"><div class="build-dot">${n}</div><div>${label}</div><div class="build-status">${status}</div></div>`}
function runBuild(){const rows=[...drawer.querySelectorAll('.build-row')];let i=0;function tick(){if(i>=rows.length){finishBuild();return}rows.forEach((r,idx)=>{const s=r.querySelector('.build-status');r.classList.toggle('done',idx<i);r.classList.toggle('working',idx===i);s.textContent=idx<i?'Done':idx===i?'Working':'Queued'});i++;buildTimer=setTimeout(tick,520)}tick()}
function finishBuild(){
  const o=selectedOffer;const stockLabel=stockState==='in'?'In stock':'Low stock';
  const existing=accepted.findIndex(a=>a.id===o.id);const item={id:o.id,brand:o.brand,product:o.product,chi:o.chi,budget:o.budget,stockLabel,createdAt:new Date().toISOString()};
  if(existing>=0)accepted[existing]=item;else accepted.push(item);
  try { localStorage.setItem('gftOfferWallAccepted',JSON.stringify(accepted)); } catch (_) {}
  updateMetrics();renderCampaigns();
  setBRD('ready','Campaign draft ready','The working demo completed the handoff package: offer details, inventory eligibility, and Chili Rewards configuration are ready for GFT Rewards.',['Draft ready','Human approval','Chili Rewards']);
  renderDrawer('ready');
}

function renderCampaigns(){
  const el=document.getElementById('campaignList');
  el.innerHTML=accepted.length?accepted.map(a=>`<div class="campaign-row"><div><b>${a.brand} ${a.product}</b><small>${a.stockLabel} • ${a.chi} CHI/shopper • ${a.budget.toLocaleString()} CHI demo budget</small></div><span>Draft ready</span></div>`).join(''):'<div class="empty-state">No demo campaigns yet. Accept an offer and complete the build flow to see it here.</div>';
}

function switchView(name){
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active-view'));
  document.getElementById(`${name}View`).classList.add('active-view');
  document.querySelectorAll('.nav-button').forEach(b=>b.classList.toggle('active',b.dataset.nav===name));
  if(name==='offers')setBRD('inbox','Offer inbox ready','Select an offer to start the store decision workflow.',['Offer intake','Inventory gate','Chili Rewards']);
}

function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1700)}

document.getElementById('filterPills').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;currentCategory=b.dataset.category;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));renderOffers()});
searchInput.addEventListener('input',renderOffers);
backdrop.addEventListener('click',closeDrawer);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!drawer.classList.contains('hidden'))closeDrawer()});
document.querySelectorAll('.nav-button').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.nav)));
document.querySelectorAll('[data-go]').forEach(btn=>btn.addEventListener('click',()=>switchView(btn.dataset.go)));

renderOffers();renderCampaigns();updateMetrics();
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}))}
