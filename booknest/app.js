(() => {
  'use strict';

  const INK = '#201e1d', RED = '#ec3013', DEEP = '#7c1405', SAND = '#eae9e9', SLATE = '#444141', CREAM = '#f8f4f4';

  const BOOKS = [
    { id: 1, title: 'The Salt Road Letters', author: 'Meera Kulkarni', cat: 'Fiction', price: 449, mrp: 699, rating: 4.8, reviews: 1284, badge: 'No. 1', bg: INK },
    { id: 2, title: 'Compound Advantage', author: 'Rohan Desai', cat: 'Business', price: 529, mrp: 899, rating: 4.7, reviews: 942, badge: 'No. 2', bg: RED },
    { id: 3, title: 'Systems That Scale', author: 'Priya Narayan', cat: 'Technology', price: 675, mrp: 1099, rating: 4.6, reviews: 611, badge: 'No. 3', bg: SLATE },
    { id: 4, title: 'Quiet Mornings', author: 'Aditi Shah', cat: 'Self-Help', price: 349, mrp: 550, rating: 4.9, reviews: 2031, badge: 'No. 4', bg: SAND },
    { id: 5, title: 'Physics for Class XII', author: 'S. R. Iyengar', cat: 'Education', price: 615, mrp: 850, rating: 4.5, reviews: 488, badge: 'No. 5', bg: DEEP },
    { id: 6, title: 'The Long Ledger', author: 'Kabir Menon', cat: 'Biography', price: 499, mrp: 799, rating: 4.7, reviews: 733, badge: 'No. 6', bg: INK },
    { id: 7, title: 'UPSC Prelims Compendium', author: 'BookNest Editorial', cat: 'Competitive Exams', price: 899, mrp: 1499, rating: 4.6, reviews: 1547, badge: 'No. 7', bg: RED },
    { id: 8, title: 'The Paper Elephant', author: 'Nila Raghavan', cat: "Children's Books", price: 299, mrp: 450, rating: 4.9, reviews: 1120, badge: 'No. 8', bg: SAND },
    { id: 9, title: 'After the Monsoon', author: 'Devika Sen', cat: 'Fiction', price: 399, mrp: 650, rating: 4.6, reviews: 214, badge: 'New', bg: SLATE },
    { id: 10, title: 'Interfaces, Honestly', author: 'Arjun Bhatt', cat: 'Technology', price: 749, mrp: 1200, rating: 4.8, reviews: 96, badge: 'New', bg: INK },
    { id: 11, title: 'The Founder’s Notebook', author: 'Sneha Pillai', cat: 'Business', price: 559, mrp: 899, rating: 4.5, reviews: 141, badge: 'New', bg: RED },
    { id: 12, title: 'Small Braveries', author: 'Tara Joshi', cat: "Children's Books", price: 279, mrp: 425, rating: 4.7, reviews: 88, badge: 'New', bg: SAND },
    { id: 13, title: 'Mathematics Made Plain', author: 'H. Krishnan', cat: 'Education', price: 585, mrp: 799, rating: 4.4, reviews: 302, badge: 'Restocked', bg: DEEP },
    { id: 14, title: 'One Life, Rewritten', author: 'Farah Qureshi', cat: 'Self-Help', price: 369, mrp: 599, rating: 4.6, reviews: 410, badge: 'Restocked', bg: SLATE }
  ];

  const COVERS = ['salt-road', 'compound', 'systems', 'quiet', 'physics', 'ledger', 'upsc', 'elephant', 'monsoon', 'interfaces', 'founder', 'braveries', 'maths', 'rewritten']
    .reduce((m, f, i) => (m[i + 1] = 'covers/' + f + '.png', m), {});

  const CATS = [
    { name: 'Fiction', count: 2140 }, { name: 'Education', count: 1875 },
    { name: 'Business', count: 1230 }, { name: 'Technology', count: 990 },
    { name: 'Self-Help', count: 1460 }, { name: "Children's Books", count: 1705 },
    { name: 'Biography', count: 820 }, { name: 'Competitive Exams', count: 2180 }
  ];

  const state = {
    view: 'store', cartOpen: false, menuOpen: false,
    query: '', category: null, showAll: false,
    cart: {}, wish: {}, pay: 'UPI', orderId: '', orderName: 'reader'
  };

  const HEADER_OFFSET = 90;

  function money(n) { return '₹' + n.toLocaleString('en-IN'); }
  function stars(r) { const f = Math.round(r); return '★★★★★'.slice(0, f) + '☆☆☆☆☆'.slice(0, 5 - f); }
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  function decorate(b, i) {
    return {
      ...b,
      cover: COVERS[b.id],
      rank: i == null ? '' : '#' + (i + 1),
      pill: /^No\./.test(b.badge) ? 'Bestseller' : b.badge,
      reviewsShort: b.reviews >= 1000 ? (b.reviews / 1000).toFixed(1) + 'k' : String(b.reviews),
      starsLabel: stars(b.rating),
      ratingLabel: b.rating + ' (' + b.reviews.toLocaleString('en-IN') + ')',
      priceLabel: money(b.price),
      mrpLabel: money(b.mrp),
      discountLabel: '−' + Math.round((1 - b.price / b.mrp) * 100) + '%',
      wished: !!state.wish[b.id]
    };
  }

  function jump(id) {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET, behavior: 'smooth' });
  }

  function addToCart(id) {
    state.cart[id] = (state.cart[id] || 0) + 1;
    state.cartOpen = true;
    render();
  }
  function buyNow(id) {
    state.cart[id] = (state.cart[id] || 0) + 1;
    state.view = 'checkout';
    state.cartOpen = false;
    render();
    window.scrollTo({ top: 0 });
  }
  function setQty(id, d) {
    const q = (state.cart[id] || 0) + d;
    if (q <= 0) delete state.cart[id]; else state.cart[id] = q;
    render();
  }
  function removeFromCart(id) { delete state.cart[id]; render(); }
  function toggleWish(id) { state.wish[id] = !state.wish[id]; render(); }
  function pickCategory(name) {
    state.category = name; state.query = ''; state.showAll = false;
    render();
    setTimeout(() => jump('results'), 60);
  }

  function cartItemsComputed() {
    return Object.keys(state.cart).map(id => {
      const b = BOOKS.find(x => x.id === +id);
      const qty = state.cart[id];
      return { ...b, qty, cover: COVERS[b.id], priceLabel: money(b.price), lineLabel: money(b.price * qty) };
    });
  }

  function bookCardResult(b) {
    return `
      <div class="result-card" style="display:flex;flex-direction:column;background:var(--color-neutral-100);transition:box-shadow .3s ease,transform .3s ease">
        <div style="position:relative">
          <div class="cover-zoom-wrap" style="position:relative;aspect-ratio:2/3;overflow:hidden;background:${b.bg}">
            <img class="cover-zoom" src="${b.cover}" alt="${esc(b.title)} — book cover" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s cubic-bezier(.2,.8,.2,1)" />
          </div>
          <button class="wish-btn-sm" data-action="wish" data-id="${b.id}" aria-label="Wishlist" style="position:absolute;top:10px;right:10px;width:34px;height:34px;border:0;background:#fff;cursor:pointer;display:grid;place-items:center;color:${b.wished ? RED : INK};box-shadow:var(--shadow-sm);transition:transform .2s ease">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${b.wished ? RED : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </button>
        </div>
        <div style="padding:16px;display:flex;flex-direction:column;gap:10px;flex:1">
          <div style="font-family:var(--font-heading);font-weight:800;font-size:16px;line-height:1.15">${esc(b.title)}</div>
          <div style="font-size:13px;color:var(--color-neutral-700)">${esc(b.author)}</div>
          <div style="display:flex;align-items:center;gap:8px;font-size:12px"><span style="color:var(--color-accent);letter-spacing:1px">${b.starsLabel}</span><span style="color:var(--color-neutral-700)">${esc(b.ratingLabel)}</span></div>
          <div style="display:flex;align-items:baseline;gap:8px;margin-top:auto"><span style="font-family:var(--font-heading);font-weight:800;font-size:19px">${b.priceLabel}</span><span style="font-size:13px;color:var(--color-neutral-600);text-decoration:line-through">${b.mrpLabel}</span><span style="margin-left:auto;font-size:11px;font-weight:700;letter-spacing:.06em;background:var(--color-accent-100);color:var(--color-accent-700);padding:3px 7px">${b.discountLabel}</span></div>
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary" data-action="add" data-id="${b.id}" style="flex:1;justify-content:flex-start">Add to Cart</button>
            <button class="btn btn-primary" data-action="buy" data-id="${b.id}" style="flex:1;justify-content:flex-start">Buy Now</button>
          </div>
        </div>
      </div>`;
  }

  function bookCardBestseller(b) {
    return `
      <div class="bs-card" style="display:flex;flex-direction:column;background:#fff;border:1px solid var(--color-neutral-300);transition:box-shadow .3s ease,transform .3s ease,border-color .3s ease">
        <div style="position:relative;padding:14px 14px 0">
          <div class="cover-zoom-wrap" style="position:relative;aspect-ratio:2/3;overflow:hidden;background:${b.bg}">
            <img class="cover-zoom" src="${b.cover}" alt="${esc(b.title)} — book cover" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .6s cubic-bezier(.2,.8,.2,1)" />
          </div>
          <span style="position:absolute;top:22px;left:22px;background:var(--color-accent);color:#fff;font-family:var(--font-heading);font-weight:800;font-size:13px;padding:5px 9px">${b.rank}</span>
          <span style="position:absolute;top:22px;right:22px;background:var(--color-accent-200);color:var(--color-accent-800);font-size:11px;font-weight:700;letter-spacing:.04em;padding:5px 9px">${esc(b.pill)}</span>
        </div>
        <div style="padding:16px;display:flex;flex-direction:column;gap:9px;flex:1">
          <div style="display:flex;align-items:center;gap:7px;font-size:12px"><span style="color:var(--color-accent);letter-spacing:1px">${b.starsLabel}</span><span style="color:var(--color-neutral-700)">(${b.reviewsShort})</span></div>
          <div style="font-family:var(--font-heading);font-weight:800;font-size:16px;line-height:1.2">${esc(b.title)}</div>
          <div style="font-size:13px;color:var(--color-neutral-700)">${esc(b.author)}</div>
          <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-top:auto;padding-top:4px">
            <span style="font-family:var(--font-heading);font-weight:800;font-size:20px;color:var(--color-accent-700)">${b.priceLabel}</span>
            <span style="font-size:13px;color:var(--color-neutral-600);text-decoration:line-through">${b.mrpLabel}</span>
            <span style="font-size:11px;font-weight:700;letter-spacing:.04em;background:var(--color-accent-100);color:var(--color-accent-700);padding:3px 7px">${b.discountLabel}</span>
          </div>
          <div style="display:flex;gap:8px;margin-top:6px">
            <button class="wish-btn-lg" data-action="wish" data-id="${b.id}" aria-label="Add to wishlist" style="width:40px;height:40px;flex:none;border:1px solid var(--color-neutral-300);background:#fff;cursor:pointer;display:grid;place-items:center;color:${b.wished ? RED : INK};transition:border-color .2s ease,transform .2s ease">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="${b.wished ? RED : 'none'}" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
            </button>
            <button class="btn btn-primary" data-action="add" data-id="${b.id}" style="flex:1;height:40px;gap:9px;justify-content:flex-start;padding-inline:12px">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
              Add to Cart
            </button>
          </div>
          <button class="btn btn-secondary" data-action="buy" data-id="${b.id}" style="height:38px;justify-content:flex-start">Buy Now</button>
        </div>
      </div>`;
  }

  function bookRowNewArrival(b) {
    return `
      <div style="display:grid;grid-template-columns:130px 1fr;gap:20px;padding:24px;border-bottom:1px solid var(--color-divider);border-right:1px solid var(--color-divider);align-items:start">
        <div style="position:relative;aspect-ratio:2/3;overflow:hidden;background:${b.bg}">
          <img src="${b.cover}" alt="${esc(b.title)} — book cover" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block" />
        </div>
        <div style="display:flex;flex-direction:column;gap:9px">
          <span class="tag tag-accent" style="align-self:flex-start">${esc(b.badge)}</span>
          <div style="font-family:var(--font-heading);font-weight:800;font-size:19px;line-height:1.15">${esc(b.title)}</div>
          <div style="font-size:13px;color:var(--color-neutral-700)">${esc(b.author)} · ${esc(b.cat)}</div>
          <div style="display:flex;align-items:center;gap:8px;font-size:12px"><span style="color:var(--color-accent);letter-spacing:1px">${b.starsLabel}</span><span style="color:var(--color-neutral-700)">${esc(b.ratingLabel)}</span></div>
          <div style="display:flex;align-items:baseline;gap:8px"><span style="font-family:var(--font-heading);font-weight:800;font-size:19px">${b.priceLabel}</span><span style="font-size:13px;color:var(--color-neutral-600);text-decoration:line-through">${b.mrpLabel}</span><span style="margin-left:auto;font-size:11px;font-weight:700;letter-spacing:.06em;background:var(--color-accent-100);color:var(--color-accent-700);padding:3px 7px">${b.discountLabel}</span></div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-secondary" data-action="add" data-id="${b.id}" style="justify-content:flex-start">Add to Cart</button>
            <button class="btn btn-primary" data-action="buy" data-id="${b.id}" style="justify-content:flex-start">Buy Now</button>
            <button class="btn btn-ghost" data-action="wish" data-id="${b.id}" style="justify-content:flex-start">${b.wished ? '♥ Wishlisted' : '♡ Wishlist'}</button>
          </div>
        </div>
      </div>`;
  }

  function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = CATS.map((c, i) => `
      <button class="cat-btn" data-action="pick-category" data-category="${esc(c.name)}" style="background:#fff;border:0;border-right:1px solid var(--color-divider);border-bottom:1px solid var(--color-divider);padding:24px 20px 20px;cursor:pointer;font:inherit;display:flex;flex-direction:column;gap:10px;min-height:150px;transition:background .25s ease,color .25s ease;text-align:left">
        <span style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.6">${String(i + 1).padStart(2, '0')}</span>
        <span style="font-family:var(--font-heading);font-weight:800;font-size:21px;line-height:1.1;letter-spacing:-.02em;margin-top:auto">${esc(c.name)}</span>
        <span style="font-size:12px;opacity:.7">${c.count} titles</span>
      </button>`).join('');
  }

  function renderFooterCategories() {
    const el = document.getElementById('footerCategories');
    el.innerHTML = CATS.map(c => `<a href="#results" data-action="pick-category" data-category="${esc(c.name)}" style="color:#fff;text-decoration:none;opacity:.85">${esc(c.name)}</a>`).join('');
  }

  function renderResults() {
    const s = state;
    const q = s.query.trim().toLowerCase();
    const isFiltering = !!(q || s.category || s.showAll);
    const section = document.getElementById('results');
    section.hidden = !isFiltering;
    if (!isFiltering) return;
    const matched = BOOKS.filter(b =>
      (!s.category || b.cat === s.category) &&
      (!q || (b.title + ' ' + b.author + ' ' + b.cat).toLowerCase().includes(q)));
    document.getElementById('resultsTitle').textContent = s.category ? s.category : (q ? 'Search results' : 'All Books');
    document.getElementById('resultsCount').textContent = matched.length;
    document.getElementById('resultsGrid').innerHTML = matched.map(b => bookCardResult(decorate(b))).join('');
  }

  function renderBestSellers() {
    document.getElementById('bestSellersGrid').innerHTML = BOOKS.slice(0, 8).map((b, i) => bookCardBestseller(decorate(b, i))).join('');
  }

  function renderNewArrivals() {
    document.getElementById('newArrivalsGrid').innerHTML = BOOKS.slice(8, 12).map(b => bookRowNewArrival(decorate(b))).join('');
  }

  function renderHeaderCounts() {
    const items = cartItemsComputed();
    const cartCount = items.reduce((t, i) => t + i.qty, 0);
    const wishIds = Object.keys(state.wish).filter(k => state.wish[k]);
    document.getElementById('cartCount').textContent = cartCount;
    document.getElementById('drawerCartCount').textContent = cartCount;
    document.getElementById('wishCount').textContent = wishIds.length;
  }

  function renderCartDrawer() {
    const items = cartItemsComputed();
    const subtotal = items.reduce((t, i) => t + i.price * i.qty, 0);
    const savings = items.reduce((t, i) => t + (i.mrp - i.price) * i.qty, 0);
    const shipping = subtotal === 0 || subtotal >= 499 ? 0 : 49;
    const wishIds = Object.keys(state.wish).filter(k => state.wish[k]);

    document.getElementById('cartEmptyMsg').hidden = items.length !== 0;
    document.getElementById('cartItemsList').innerHTML = items.map(i => `
      <div style="display:grid;grid-template-columns:56px 1fr;gap:14px;padding:16px 0;border-bottom:1px solid var(--color-divider)">
        <div style="aspect-ratio:2/3;overflow:hidden;background:${i.bg}">
          <img src="${i.cover}" alt="${esc(i.title)}" style="width:100%;height:100%;object-fit:cover;display:block" />
        </div>
        <div style="display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;justify-content:space-between;gap:10px">
            <div>
              <div style="font-family:var(--font-heading);font-weight:800;font-size:15px;line-height:1.2">${esc(i.title)}</div>
              <div style="font-size:12px;color:var(--color-neutral-700)">${esc(i.author)}</div>
            </div>
            <button class="btn btn-ghost" data-action="remove" data-id="${i.id}" aria-label="Remove" style="padding:0 4px;align-self:flex-start">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg>
            </button>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
            <div style="display:flex;align-items:center;border:1px solid var(--color-divider)">
              <button data-action="dec" data-id="${i.id}" aria-label="Decrease" style="width:30px;height:30px;border:0;background:transparent;cursor:pointer;font:inherit;font-size:16px">−</button>
              <span style="width:34px;text-align:center;font-size:14px;font-family:var(--font-heading);font-weight:800">${i.qty}</span>
              <button data-action="inc" data-id="${i.id}" aria-label="Increase" style="width:30px;height:30px;border:0;background:transparent;cursor:pointer;font:inherit;font-size:16px">+</button>
            </div>
            <span style="font-family:var(--font-heading);font-weight:800;font-size:15px">${i.lineLabel}</span>
          </div>
        </div>
      </div>`).join('');

    const wishlistSection = document.getElementById('wishlistSection');
    wishlistSection.hidden = wishIds.length === 0;
    document.getElementById('wishlistSectionCount').textContent = wishIds.length;
    document.getElementById('wishItemsList').innerHTML = wishIds.map(id => {
      const b = BOOKS.find(x => x.id === +id);
      return `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--color-divider)">
          <img src="${COVERS[b.id]}" alt="${esc(b.title)}" style="width:24px;height:34px;object-fit:cover;display:block" />
          <div style="flex:1"><div style="font-size:14px;font-family:var(--font-heading);font-weight:800">${esc(b.title)}</div><div style="font-size:12px;color:var(--color-neutral-700)">${money(b.price)}</div></div>
          <button class="btn btn-secondary" data-action="add" data-id="${b.id}" style="justify-content:flex-start">Add</button>
        </div>`;
    }).join('');

    document.getElementById('drawerSubtotal').textContent = money(subtotal);
    document.getElementById('drawerShipping').textContent = shipping === 0 ? 'Free' : money(shipping);
    document.getElementById('drawerTotal').textContent = money(subtotal + shipping);

    document.getElementById('cartScrim').style.opacity = state.cartOpen ? '1' : '0';
    document.getElementById('cartScrim').style.pointerEvents = state.cartOpen ? 'auto' : 'none';
    document.getElementById('cartDrawer').style.transform = state.cartOpen ? 'translateX(0)' : 'translateX(105%)';
    document.body.classList.toggle('cart-open', state.cartOpen);
  }

  function renderCheckoutSummary() {
    const items = cartItemsComputed();
    const subtotal = items.reduce((t, i) => t + i.price * i.qty, 0);
    const savings = items.reduce((t, i) => t + (i.mrp - i.price) * i.qty, 0);
    const shipping = subtotal === 0 || subtotal >= 499 ? 0 : 49;

    document.getElementById('checkoutItems').innerHTML = items.map(i => `
      <div style="display:grid;grid-template-columns:44px 1fr auto;gap:12px;padding:12px 0;border-bottom:1px solid var(--color-divider);align-items:center">
        <div style="aspect-ratio:2/3;overflow:hidden;background:${i.bg}"><img src="${i.cover}" alt="${esc(i.title)}" style="width:100%;height:100%;object-fit:cover;display:block" /></div>
        <div><div style="font-size:14px;font-family:var(--font-heading);font-weight:800;line-height:1.2">${esc(i.title)}</div><div style="font-size:12px;color:var(--color-neutral-700)">Qty ${i.qty} · ${i.priceLabel}</div></div>
        <div style="font-family:var(--font-heading);font-weight:800;font-size:14px">${i.lineLabel}</div>
      </div>`).join('');

    document.getElementById('checkoutSubtotal').textContent = money(subtotal);
    document.getElementById('checkoutShipping').textContent = shipping === 0 ? 'Free' : money(shipping);
    document.getElementById('checkoutSavings').textContent = money(savings);
    document.getElementById('checkoutTotal').textContent = money(subtotal + shipping);
  }

  function renderView() {
    document.getElementById('storeView').hidden = state.view !== 'store';
    document.getElementById('checkoutView').hidden = state.view !== 'checkout';
    document.getElementById('doneView').hidden = state.view !== 'done';
    if (state.view === 'done') {
      document.getElementById('orderName').textContent = state.orderName;
      document.getElementById('orderId').textContent = state.orderId;
    }
  }

  function renderMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.hidden = !state.menuOpen;
    document.getElementById('burgerBtn').setAttribute('aria-expanded', String(state.menuOpen));
    document.getElementById('burgerPath').setAttribute('d', state.menuOpen ? 'M18 6 6 18M6 6l12 12' : 'M3 6h18M3 12h18M3 18h18');
  }

  function render() {
    renderResults();
    renderBestSellers();
    renderNewArrivals();
    renderHeaderCounts();
    renderCartDrawer();
    renderCheckoutSummary();
    renderView();
    renderMenu();
  }

  function closeMenu() { if (state.menuOpen) { state.menuOpen = false; renderMenu(); } }
  function closeCartOnly() { state.cartOpen = false; renderCartDrawer(); }

  document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderFooterCategories();
    render();

    // Delegated clicks for data-action controls
    document.body.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (target) {
        const action = target.dataset.action;
        const id = target.dataset.id ? +target.dataset.id : null;
        switch (action) {
          case 'add': addToCart(id); break;
          case 'buy': buyNow(id); break;
          case 'wish': toggleWish(id); break;
          case 'inc': setQty(id, 1); break;
          case 'dec': setQty(id, -1); break;
          case 'remove': removeFromCart(id); break;
          case 'pick-category': e.preventDefault(); pickCategory(target.dataset.category); break;
        }
        return;
      }

      // In-page anchor navigation with sticky-header offset
      const anchor = e.target.closest('a[href^="#"]');
      if (anchor && anchor.getAttribute('href').length > 1) {
        const id = anchor.getAttribute('href').slice(1);
        if (document.getElementById(id)) {
          e.preventDefault();
          closeMenu();
          jump(id);
        }
      }
    });

    document.getElementById('wishlistNavBtn').addEventListener('click', () => { state.cartOpen = true; renderCartDrawer(); });
    document.getElementById('openCartBtn').addEventListener('click', () => { state.cartOpen = true; renderCartDrawer(); });
    document.getElementById('closeCartBtn').addEventListener('click', closeCartOnly);
    document.getElementById('cartScrim').addEventListener('click', closeCartOnly);
    document.getElementById('browseBooksBtn').addEventListener('click', closeCartOnly);
    document.getElementById('goCheckoutBtn').addEventListener('click', () => {
      state.view = 'checkout'; state.cartOpen = false; render(); window.scrollTo({ top: 0 });
    });
    document.getElementById('checkoutBackBtn').addEventListener('click', () => {
      state.view = 'store'; render(); window.scrollTo({ top: 0 });
    });
    document.getElementById('doneBackBtn').addEventListener('click', () => {
      state.view = 'store'; render(); window.scrollTo({ top: 0 });
    });

    document.getElementById('burgerBtn').addEventListener('click', () => { state.menuOpen = !state.menuOpen; renderMenu(); });

    document.getElementById('viewAllBtn').addEventListener('click', () => {
      state.showAll = true; state.category = null; state.query = '';
      render();
      setTimeout(() => jump('results'), 60);
    });
    document.getElementById('clearFiltersBtn').addEventListener('click', () => {
      state.query = ''; state.category = null; state.showAll = false;
      renderResults();
      const heroInput = document.getElementById('heroSearchInput');
      const menuInput = document.getElementById('menuSearchInput');
      if (heroInput) heroInput.value = '';
      if (menuInput) menuInput.value = '';
    });

    function runSearch(inputEl) {
      state.query = inputEl.value;
      renderResults();
      jump(state.query.trim() || state.category ? 'results' : 'bestsellers');
    }
    document.getElementById('heroSearchBtn').addEventListener('click', () => runSearch(document.getElementById('heroSearchInput')));
    document.getElementById('heroSearchInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') runSearch(e.target); });
    document.getElementById('menuSearchBtn').addEventListener('click', () => {
      state.query = document.getElementById('menuSearchInput').value;
      renderResults();
      closeMenu();
      setTimeout(() => jump('results'), 80);
    });
    document.getElementById('menuSearchInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        state.query = e.target.value; renderResults(); closeMenu();
        setTimeout(() => jump('results'), 80);
      }
    });

    document.getElementById('checkoutForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      state.orderId = 'BN-' + Math.floor(100000 + Math.random() * 899999);
      state.orderName = (fd.get('name') || '').toString().trim() || 'reader';
      state.pay = fd.get('pay') || 'UPI';
      state.view = 'done';
      render();
      window.scrollTo({ top: 0 });
    });

    document.getElementById('contactForm').addEventListener('submit', (e) => {
      e.preventDefault();
      document.getElementById('contactStatus').textContent = 'Thanks — your message is on its way to a bookseller. We reply within one working day.';
      e.target.reset();
    });

    document.getElementById('newsletterForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = e.target.querySelector('input');
      const btn = e.target.querySelector('button');
      const original = btn.textContent;
      btn.textContent = 'Subscribed';
      input.value = '';
      setTimeout(() => { btn.textContent = original; }, 2500);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1080 && state.menuOpen) closeMenu();
    });
  });
})();
