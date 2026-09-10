const offers = [
  {
    id: 'crush', brand: 'Keurig Dr Pepper · Crush', product: 'Crush 12-Pack', category: 'Drinks',
    headline: 'Sampling program + shopper reward', value: 'Brand funded', status: 'NEW',
    tile: 'CRUSH', bg: '#ffb33a', fg: '#8a2a00',
    timing: 'Limited time', funding: 'Brand-funded', mechanic: 'Sample + redemption', audience: 'Participating shoppers'
  },
  {
    id: 'hershey', brand: "Hershey's Cookies 'n' Creme", product: '1.55 oz bar', category: 'Food',
    headline: 'Sample Program, Earn up to $200', value: 'Up to $200', status: 'NEW',
    tile: 'HERSHEY', bg: '#7bd7f3', fg: '#23323b',
    timing: 'While supplies last', funding: 'Brand-funded', mechanic: 'Sampling', audience: 'Eligible shoppers'
  },
  {
    id: 'drpepper', brand: 'Dr Pepper', product: '12 fl oz.', category: 'Drinks',
    headline: 'BOGO, Earn up to $100', value: 'Up to $100', status: 'NEW',
    tile: 'DR\nPEPPER', bg: '#ffad35', fg: '#761421',
    timing: 'While supplies last', funding: 'Brand-funded', mechanic: 'BOGO', audience: 'Eligible shoppers'
  },
  {
    id: 'redbull', brand: 'Red Bull', product: '12 fl oz.', category: 'Drinks',
    headline: 'Sample Program, Earn up to $400', value: 'Up to $400', status: 'OPEN',
    tile: 'RED\nBULL', bg: '#76e2a0', fg: '#164a70',
    timing: 'While supplies last', funding: 'Brand-funded', mechanic: 'Sampling', audience: 'Eligible shoppers'
  },
  {
    id: 'doritos', brand: 'Doritos', product: 'Cheese Supreme 20 oz', category: 'Food',
    headline: 'Free with $10 purchase, Earn up to $150', value: 'Up to $150', status: 'OPEN',
    tile: 'DORITOS', bg: '#f4e74a', fg: '#6f1515',
    timing: 'While supplies last', funding: 'Brand-funded', mechanic: 'Basket threshold', audience: 'Eligible shoppers'
  },
  {
    id: 'germx', brand: 'Germ-X', product: 'Hand sanitizer 2 fl oz.', category: 'Other',
    headline: 'Sample Program, Earn up to $180', value: 'Up to $180', status: 'OPEN',
    tile: 'GERM-X', bg: '#ee1717', fg: '#fff',
    timing: 'While supplies last', funding: 'Brand-funded', mechanic: 'Sampling', audience: 'Eligible shoppers'
  },
  {
    id: 'icebreakers', brand: 'Ice Breakers', product: 'Ice Cubes Cinnamon 40 pc', category: 'Food',
    headline: 'Sample Program, Earn up to $120', value: 'Up to $120', status: 'OPEN',
    tile: 'ICE\nCUBES', bg: '#ffe34b', fg: '#7d1431',
    timing: 'While supplies last', funding: 'Brand-funded', mechanic: 'Sampling', audience: 'Eligible shoppers'
  }
];

let currentCategory = 'All';
let selectedOffer = null;
let stockState = null;
let buildTimer = null;

const offerList = document.getElementById('offerList');
const searchInput = document.getElementById('searchInput');
const listView = document.getElementById('listView');
const detailView = document.getElementById('detailView');
const showNewBtn = document.getElementById('showNewBtn');

function productTile(offer) {
  return `<div class="product-tile" style="background:${offer.bg};color:${offer.fg}">${offer.tile.replaceAll('\\n','<br>')}</div>`;
}

function renderOffers() {
  const q = searchInput.value.trim().toLowerCase();
  const filtered = offers.filter(o => {
    const categoryMatch = currentCategory === 'All' || o.category === currentCategory;
    const queryMatch = !q || `${o.brand} ${o.product} ${o.headline}`.toLowerCase().includes(q);
    return categoryMatch && queryMatch;
  });

  offerList.innerHTML = filtered.length ? filtered.map(o => `
    <article class="offer-card" data-id="${o.id}">
      ${productTile(o)}
      <div class="offer-copy">
        <div class="offer-brand">${o.brand} · ${o.product}</div>
        <h3>${o.headline}</h3>
        <div class="offer-meta"><span class="status-pill">${o.status}</span><small>${o.timing}</small></div>
      </div>
      <div class="offer-actions">
        <button class="review-btn" data-review="${o.id}">Review</button>
        <button class="more-link" data-review="${o.id}">Details</button>
      </div>
    </article>`).join('') : `<div class="empty">No offers match this filter.</div>`;

  const countLabel = document.getElementById('offerCountLabel');
  if (countLabel) countLabel.textContent = `${filtered.length} ${filtered.length === 1 ? 'offer' : 'offers'}`;
}

function setFlow(stage) {
  const order = ['ping','review','inventory','build','ready'];
  const index = order.indexOf(stage);
  document.querySelectorAll('.flow-step').forEach((el, i) => {
    el.classList.toggle('active', i === index);
    el.classList.toggle('complete', i < index);
  });
}

function updateBRD(title, body, chips, stage) {
  document.getElementById('liveSpecTitle').textContent = title;
  document.getElementById('liveSpecBody').textContent = body;
  document.getElementById('specChips').innerHTML = chips.map(c => `<span>${c}</span>`).join('');
  setFlow(stage);
}

function openOffer(id) {
  clearTimeout(buildTimer);
  selectedOffer = offers.find(o => o.id === id);
  stockState = null;
  listView.classList.add('hidden');
  detailView.classList.remove('hidden');
  renderDetail('review');
  updateBRD(
    `${selectedOffer.brand} offer opened`,
    'The manager can now inspect the structured brand brief before making an inventory decision.',
    [selectedOffer.category, selectedOffer.mechanic, selectedOffer.funding],
    'review'
  );
}

function renderDetail(mode = 'review') {
  const o = selectedOffer;
  if (!o) return;

  if (mode === 'building') {
    detailView.innerHTML = `
      <button class="back-btn" id="backBtn">← Back to offers</button>
      <div class="detail-hero">
        <div class="detail-hero-top">${productTile(o)}<div><div class="mini-kicker">AI CAMPAIGN BUILD</div><h3>${o.brand}</h3><div class="detail-sub">GFT is structuring the accepted offer into campaign fields.</div></div></div>
      </div>
      <div class="detail-section">
        <div class="section-title">Build status</div>
        <div class="build-progress" id="progressRows">
          ${progressRow(1,'Normalize offer details','Working')}
          ${progressRow(2,'Save inventory eligibility','Queued')}
          ${progressRow(3,'Map reward + redemption mechanic','Queued')}
          ${progressRow(4,'Create grocer campaign draft','Queued')}
        </div>
      </div>`;
    document.getElementById('backBtn').addEventListener('click', backToOffers);
    runBuildProgress();
    return;
  }

  if (mode === 'ready') {
    detailView.innerHTML = `
      <button class="back-btn" id="backBtn">← Back to offers</button>
      <div class="success-card">
        <div class="success-icon">✓</div>
        <div class="mini-kicker">CAMPAIGN DRAFT READY</div>
        <h3>${o.brand}</h3>
        <p>The demo has completed the AI-assisted handoff. A live implementation would send the approved structured payload into GFT Rewards.</p>
      </div>
      <div class="detail-section">
        <div class="section-title">Campaign summary</div>
        <div class="detail-grid">
          ${field('Product', o.product)}
          ${field('Category', o.category)}
          ${field('Mechanic', o.mechanic)}
          ${field('Funding', o.funding)}
          ${field('Inventory', stockState === 'in' ? 'In stock' : 'Low stock')}
          ${field('Status', 'Draft ready')}
        </div>
      </div>
      <a class="open-gft" href="https://admin.gftrewards.com/" target="_blank" rel="noopener">Open GFT Rewards ↗</a>
      <button class="secondary-action" id="anotherOffer">Review another offer</button>`;
    document.getElementById('backBtn').addEventListener('click', backToOffers);
    document.getElementById('anotherOffer').addEventListener('click', backToOffers);
    return;
  }

  const out = stockState === 'out';
  detailView.innerHTML = `
    <button class="back-btn" id="backBtn">← Back to offers</button>
    <div class="detail-hero">
      <div class="detail-hero-top">
        ${productTile(o)}
        <div>
          <div class="mini-kicker">${o.status === 'NEW' ? 'NEW BRAND OFFER' : 'OPEN OFFER'}</div>
          <h3>${o.brand}</h3>
          <div class="detail-sub">${o.headline}</div>
        </div>
      </div>
      <div class="badge-row"><span class="badge">${o.category}</span><span class="badge">${o.funding}</span><span class="badge">${o.timing}</span></div>
    </div>

    <div class="detail-section">
      <div class="section-title">AI structured brief</div>
      <div class="detail-grid">
        ${field('Product', o.product)}
        ${field('Offer mechanic', o.mechanic)}
        ${field('Funding', o.funding)}
        ${field('Audience', o.audience)}
      </div>
      <div class="ai-summary" style="margin-top:10px">Manager task: confirm the product can be supported in store. The campaign build remains locked until an inventory state is selected.</div>
    </div>

    <div class="detail-section">
      <div class="section-title">Inventory check</div>
      <div class="stock-buttons">
        <button class="stock-btn ${stockState==='in'?'selected':''}" data-stock="in">✓ In stock</button>
        <button class="stock-btn ${stockState==='low'?'selected':''}" data-stock="low">◒ Low stock</button>
        <button class="stock-btn ${stockState==='out'?'selected':''}" data-stock="out">× Out of stock</button>
      </div>
      <div class="inventory-note">Demo control: select the store's inventory condition for this offer.</div>
    </div>

    ${out ? `<div class="detail-section"><div class="decline-box"><b>Offer cannot advance.</b><br>The product is marked out of stock. A production workflow could decline, defer, or send a restock request back to the brand or category team.</div><button class="secondary-action" id="notifyBrand">Notify brand / defer</button></div>` : ''}

    <button class="primary-action" id="buildBtn" ${!stockState || out ? 'disabled' : ''}>Accept & build campaign with AI</button>
  `;

  document.getElementById('backBtn').addEventListener('click', backToOffers);
  detailView.querySelectorAll('[data-stock]').forEach(btn => btn.addEventListener('click', () => chooseStock(btn.dataset.stock)));
  const buildBtn = document.getElementById('buildBtn');
  if (buildBtn) buildBtn.addEventListener('click', startBuild);
  const notifyBrand = document.getElementById('notifyBrand');
  if (notifyBrand) notifyBrand.addEventListener('click', () => {
    updateBRD('Offer deferred', 'The demo marked the offer as unable to advance because inventory was set to out of stock.', ['Out of stock','Defer','Brand feedback'], 'inventory');
    alert('Demo: the offer would be deferred and a brand feedback event recorded.');
  });
}

function field(label, value) {
  return `<div class="detail-field"><small>${label}</small><b>${value}</b></div>`;
}

function chooseStock(state) {
  stockState = state;
  renderDetail('review');
  if (state === 'in') {
    updateBRD('Inventory confirmed', 'The store marked the item in stock. The offer is now eligible for AI-assisted campaign build.', ['In stock','Manager approved','Build unlocked'], 'inventory');
  } else if (state === 'low') {
    updateBRD('Low stock flagged', 'The store marked inventory as low. The prototype still allows the campaign to advance with this constraint visible in the handoff.', ['Low stock','Constraint captured','Build unlocked'], 'inventory');
  } else {
    updateBRD('Out of stock', 'The offer is blocked from campaign build until inventory changes or the manager chooses a different store/product path.', ['Out of stock','Build blocked','Brand feedback'], 'inventory');
  }
}

function startBuild() {
  if (!stockState || stockState === 'out') return;
  renderDetail('building');
  updateBRD('AI handoff in progress', 'The demo is translating the approved offer and inventory state into GFT campaign fields.', ['Structured payload','Offer rules','Inventory eligibility'], 'build');
}

function progressRow(n, label, status) {
  return `<div class="progress-row" data-progress="${n}"><div class="progress-dot">${n}</div><div>${label}</div><div class="status">${status}</div></div>`;
}

function runBuildProgress() {
  const rows = [...detailView.querySelectorAll('.progress-row')];
  let i = 0;
  function next() {
    if (!rows[i]) {
      updateBRD('Campaign draft ready', 'The simulated workflow has completed. The manager can now open GFT Rewards to continue with the campaign draft.', ['Draft ready','Human approval','Open GFT Rewards'], 'ready');
      renderDetail('ready');
      return;
    }
    rows.forEach((row, idx) => {
      const status = row.querySelector('.status');
      if (idx < i) { row.classList.add('done'); status.textContent = 'Done'; }
      else if (idx === i) { status.textContent = 'Working'; }
      else { status.textContent = 'Queued'; }
    });
    buildTimer = setTimeout(() => {
      rows[i].classList.add('done');
      rows[i].querySelector('.status').textContent = 'Done';
      i += 1;
      next();
    }, 650);
  }
  next();
}

function backToOffers() {
  clearTimeout(buildTimer);
  detailView.classList.add('hidden');
  listView.classList.remove('hidden');
  selectedOffer = null;
  stockState = null;
  updateBRD('Waiting for manager action', 'Choose an offer on the right to see the BRD state change with the product workflow.', ['Offer wall','Inventory gate','AI campaign handoff'], 'ping');
}

document.getElementById('categoryRow').addEventListener('click', e => {
  if (!e.target.matches('[data-category]')) return;
  currentCategory = e.target.dataset.category;
  document.querySelectorAll('[data-category]').forEach(b => b.classList.toggle('active', b.dataset.category === currentCategory));
  renderOffers();
});

searchInput.addEventListener('input', renderOffers);
offerList.addEventListener('click', e => {
  const btn = e.target.closest('[data-review]');
  if (btn) openOffer(btn.dataset.review);
});
showNewBtn.addEventListener('click', () => {
  currentCategory = 'All';
  searchInput.value = '';
  document.querySelectorAll('[data-category]').forEach(b => b.classList.toggle('active', b.dataset.category === 'All'));
  renderOffers();
  const firstNew = document.querySelector('[data-id="crush"]');
  firstNew?.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
document.getElementById('notifBtn').addEventListener('click', () => {
  alert('Demo: 3 new brand opportunities are ready for store review.');
});

renderOffers();
