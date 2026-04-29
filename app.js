

document.addEventListener('DOMContentLoaded', function() {
  
  const user = ShopNowDB.getUser();
  if (user && user.settings && user.settings.darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  
  const splash = document.getElementById('splash');
  if (!splash) return;
  
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
 
  if (currentPage === 'track-order.html') return;
  
 
  const hasAccount = ShopNowDB.hasUser();
  
  let redirectPage = null;
  
  if (currentPage === 'index.html') {
   
    redirectPage = hasAccount ? null : 'login.html';
  } else if (currentPage === 'login.html') {
   
    if (hasAccount) {
      redirectPage = 'index.html';
    } else {
      
      redirectPage = null;
    }
  }
  
 
  setTimeout(function() {
    splash.classList.add('hidden');
    setTimeout(function() {
      splash.style.display = 'none';
      
      if (redirectPage) {
        window.location.href = redirectPage;
      }
    }, 600);
  }, 2500);
});


let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}



function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  
  if (email && password) {
    
    const name = email.split('@')[0];
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    
    
    ShopNowDB.createUser(email, formattedName, '');
    
    showToast('Welcome back, ' + formattedName + '!');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }
}

function handleLogout() {
 
  ShopNowDB.deleteUser();
  showToast('You have been signed out');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 800);
}

function checkAuth() {
  
  return ShopNowDB.hasUser();
}

function requireAuth() {
  
  return ShopNowDB.hasUser();
}


function playTransition(callback) {
  const transition = document.getElementById('transition');
  if (!transition) {
    if (callback) callback();
    return;
  }
  
  
  transition.classList.add('active');
  

  setTimeout(function() {
    if (callback) callback();
    
    
    transition.classList.add('fade-out');
    
   
    setTimeout(function() {
      transition.classList.remove('active', 'fade-out');
    }, 400);
  }, 1200);
}


function navigateWithTransition(url) {
  playTransition(function() {
    window.location.href = url;
  });
}


function initTransitionLinks() {
  document.querySelectorAll('a[href$=".html"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
     
      if (href && !href.startsWith('http') && !href.startsWith('#')) {
        e.preventDefault();
        navigateWithTransition(href);
      }
    });
  });
}


document.addEventListener('DOMContentLoaded', function() {
  initTransitionLinks();
});



function toggleCard(header) {
  const body = header.nextElementSibling;
  const toggle = header.querySelector('.card-toggle');
  body.classList.toggle('open');
  toggle.classList.toggle('open');
}

function toggleSetting(el) {
  el.classList.toggle('active');
}

function saveProfile(event) {
  event.preventDefault();
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const email = document.getElementById('profileEmailInput').value;
  const phone = document.getElementById('phone').value;
  
  
  ShopNowDB.updateUser({
    name: firstName + ' ' + lastName,
    email: email,
    phone: phone
  });
  
  
  document.getElementById('profileName').textContent = firstName + ' ' + lastName;
  document.getElementById('profileEmail').textContent = email;
  document.getElementById('profileAvatar').textContent = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  
  showToast('Profile updated successfully!');
}

function initAccountPage() {
  if (!requireAuth()) return;
  
 
  const user = ShopNowDB.getUser() || { email: '', name: '', phone: '' };
  
  const nameParts = user.name.split(' ');
  const firstName = nameParts[0] || 'User';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  document.getElementById('profileEmail').textContent = user.email;
  document.getElementById('profileEmailInput').value = user.email;
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileAvatar').textContent = (firstName.charAt(0) + (lastName ? lastName.charAt(0) : '')).toUpperCase();
  document.getElementById('firstName').value = firstName;
  document.getElementById('lastName').value = lastName;
  document.getElementById('phone').value = user.phone || '';
  
  
  loadOrders();
  
  loadSettings();
}


function loadOrders() {
  const orderList = document.getElementById('orderList');
  const orders = ShopNowDB.getOrders();
  
  if (orders.length === 0) {
    orderList.innerHTML = '<p style="text-align:center;color:var(--text2);padding:20px;">No orders yet. Start shopping to see your orders here!</p>';
    return;
  }
  
  
  const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  orderList.innerHTML = sortedOrders.map((order, index) => {
    const orderDate = new Date(order.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const totalItems = order.items.reduce((sum, item) => sum + (item.qty || 0), 0);
    const orderStatus = order.status || 'processing';
    const statusClass = orderStatus === 'delivered' ? 'status-delivered' : 
                       orderStatus === 'shipped' ? 'status-shipped' : 'status-processing';
    
    return `
      <div class="order-item" onclick="showOrderDetails(${index})" style="cursor:pointer;">
        <div class="order-info">
          <div class="order-emoji">📦</div>
          <div class="order-details">
            <h4>${totalItems} item${totalItems > 1 ? 's' : ''}</h4>
            <p>Order #${order.orderId} • ${orderDate}</p>
          </div>
        </div>
        <span class="order-status ${statusClass}">${orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}</span>
      </div>
    `;
  }).join('');
}


function showOrderDetails(index) {
  const orders = ShopNowDB.getOrders();
  const sortedOrders = [...orders].sort((a, b) => new Date(b.date) - new Date(a.date));
  const order = sortedOrders[index];
  
  if (!order) return;
  
  const orderDate = new Date(order.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  const itemsHtml = order.items.map(item => `
    <div class="panel-order-item">
      <div class="panel-order-image">${item.emoji || '📦'}</div>
      <div class="panel-order-info">
        <div class="panel-order-name">${item.name}</div>
        <div class="panel-order-qty">Qty: ${item.qty || 1}</div>
      </div>
      <div class="panel-order-price">$${((parseFloat(item.price) || 0) * (item.qty || 1)).toFixed(2)}</div>
    </div>
  `).join('');
  
  const paymentMethodText = order.paymentMethod === 'gcash' ? 'GCash' : 'Cash on Delivery';
  const orderStatus = order.status || 'processing';
  
  const content = `
    <div class="panel-info-section">
      <h3>📅 Order Info</h3>
      <div class="panel-info-row"><span>Order ID</span><span>#${order.orderId}</span></div>
      <div class="panel-info-row"><span>Date</span><span>${orderDate}</span></div>
      <div class="panel-info-row"><span>Status</span><span>${orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}</span></div>
      <div class="panel-info-row"><span>Payment</span><span>${paymentMethodText}</span></div>
    </div>
    
    <div class="panel-info-section">
      <h3>📍 Shipping Address</h3>
      <div class="panel-info-row"><span>Name</span><span>${order.name || 'N/A'}</span></div>
      <div class="panel-info-row"><span>Address</span><span>${order.address || 'N/A'}</span></div>
      <div class="panel-info-row"><span>City</span><span>${order.city || 'N/A'}</span></div>
      <div class="panel-info-row"><span>State</span><span>${order.state || 'N/A'}</span></div>
      <div class="panel-info-row"><span>ZIP</span><span>${order.zip || 'N/A'}</span></div>
      <div class="panel-info-row"><span>Country</span><span>${order.country || 'N/A'}</span></div>
    </div>
    
    <div class="panel-info-section">
      <h3>📞 Contact</h3>
      <div class="panel-info-row"><span>Phone</span><span>${order.phone || 'N/A'}</span></div>
      <div class="panel-info-row"><span>Email</span><span>${order.email || 'N/A'}</span></div>
    </div>
    
    <div class="panel-info-section">
      <h3>🛒 Items (${order.items.length})</h3>
      ${itemsHtml}
    </div>
    
    <div class="panel-total">Total: ${order.total}</div>
  `;
  
  document.getElementById('orderPanelContent').innerHTML = content;
  document.getElementById('orderPanel').classList.add('active');
  document.getElementById('panelOverlay').classList.add('active');
}


function closeOrderPanel() {
  document.getElementById('orderPanel').classList.remove('active');
  document.getElementById('panelOverlay').classList.remove('active');
}


function loadSettings() {
  const settingsList = document.getElementById('settingsList');
  const user = ShopNowDB.getUser() || {};
  const settings = user.settings || {
    emailNotifications: true,
    smsNotifications: false,
    newsletter: true,
    darkMode: false
  };
  
 
  if (settings.darkMode) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  
  settingsList.innerHTML = `
    <div class="settings-item">
      <div class="settings-item-left">
        <span>🌙 Dark Mode</span>
      </div>
      <div class="settings-toggle ${settings.darkMode ? 'active' : ''}" onclick="toggleDarkMode(this)"></div>
    </div>
    <div class="settings-item">
      <div class="settings-item-left">
        <span>Email Notifications</span>
      </div>
      <div class="settings-toggle ${settings.emailNotifications ? 'active' : ''}" onclick="toggleUserSetting('emailNotifications', this)"></div>
    </div>
    <div class="settings-item">
      <div class="settings-item-left">
        <span>SMS Notifications</span>
      </div>
      <div class="settings-toggle ${settings.smsNotifications ? 'active' : ''}" onclick="toggleUserSetting('smsNotifications', this)"></div>
    </div>
    <div class="settings-item">
      <div class="settings-item-left">
        <span>Newsletter Subscription</span>
      </div>
      <div class="settings-toggle ${settings.newsletter ? 'active' : ''}" onclick="toggleUserSetting('newsletter', this)"></div>
    </div>
  `;
}

function toggleDarkMode(element) {
  const isActive = element.classList.toggle('active');
  const theme = isActive ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  
  const user = ShopNowDB.getUser() || {};
  user.settings = user.settings || {};
  user.settings.darkMode = isActive;
  ShopNowDB.updateUser(user);
}


function toggleUserSetting(setting, element) {
  const user = ShopNowDB.getUser() || {};
  const settings = user.settings || {
    emailNotifications: true,
    smsNotifications: false,
    newsletter: true
  };
  
  settings[setting] = !settings[setting];
  element.classList.toggle('active');
  
  ShopNowDB.updateUser({ settings: settings });
  showToast('Setting updated!');
}



const products = [
  { id:1,  name:"Wireless Headphones",   cat:"Electronics", price:79.99,  rating:4.5, emoji:"🎧", bg:"#EEF4FB", badge:"sale", desc:"Premium over-ear headphones with active noise cancellation and 30-hour battery life." },
  { id:2,  name:"Running Shoes",          cat:"Fashion",     price:59.99,  rating:4.3, emoji:"👟", bg:"#F0F7EE", badge:null,   desc:"Lightweight and breathable mesh runners with responsive cushioning for all-day comfort." },
  { id:3,  name:"Coffee Maker",           cat:"Home",        price:49.99,  rating:4.7, emoji:"☕", bg:"#FBF4E8", badge:null,   desc:"12-cup programmable drip coffee maker with built-in grinder and thermal carafe." },
  { id:4,  name:"Yoga Mat",               cat:"Sports",      price:29.99,  rating:4.6, emoji:"🧘", bg:"#FBF0F4", badge:"new",  desc:"Eco-friendly 6mm non-slip yoga mat with alignment lines and carrying strap." },
  { id:5,  name:"Bluetooth Speaker",      cat:"Electronics", price:39.99,  rating:4.2, emoji:"🔊", bg:"#EEF4FB", badge:null,   desc:"Waterproof portable speaker with 360° surround sound and 20-hour playtime." },
  { id:6,  name:"Sunglasses",             cat:"Fashion",     price:24.99,  rating:4.0, emoji:"🕶️", bg:"#F0F7EE", badge:"sale", desc:"Polarized UV400 sunglasses with lightweight metal frame in a timeless aviator style." },
  { id:7,  name:"Air Fryer",              cat:"Home",        price:89.99,  rating:4.8, emoji:"🍟", bg:"#FBF4E8", badge:"new",  desc:"5.8-quart digital air fryer with 8 preset cooking modes and dishwasher-safe basket." },
  { id:8,  name:"Dumbbell Set",           cat:"Sports",      price:44.99,  rating:4.4, emoji:"🏋️", bg:"#FBF0F4", badge:null,   desc:"Adjustable dumbbell set from 5–52 lbs with quick-select dial and storage tray." },
  { id:9,  name:"Mechanical Keyboard",    cat:"Electronics", price:109.99, rating:4.6, emoji:"⌨️", bg:"#EEF4FB", badge:"new",  desc:"TKL mechanical keyboard with Cherry MX switches, per-key RGB and USB-C connectivity." },
  { id:10, name:"Canvas Backpack",        cat:"Fashion",     price:34.99,  rating:4.1, emoji:"🎒", bg:"#F0F7EE", badge:null,   desc:"30L waxed canvas backpack with 15\" laptop sleeve, padded straps and water-resistant coating." },
  { id:11, name:"Table Lamp",             cat:"Home",        price:19.99,  rating:4.3, emoji:"💡", bg:"#FBF4E8", badge:null,   desc:"Minimalist LED table lamp with touch dimmer, 3 color temperatures and USB charging port." },
  { id:12, name:"Insulated Water Bottle", cat:"Sports",      price:14.99,  rating:4.5, emoji:"🍶", bg:"#FBF0F4", badge:null,   desc:"32oz stainless steel bottle that keeps drinks cold 24hrs or hot 12hrs. BPA-free lid." },
  { id:13, name:"Smart Watch",            cat:"Electronics", price:149.99, rating:4.7, emoji:"⌚", bg:"#EEF4FB", badge:"new",  desc:"Health-focused smartwatch with GPS, heart rate monitor, SpO2 sensor and 7-day battery." },
  { id:14, name:"Linen Shirt",            cat:"Fashion",     price:42.99,  rating:4.2, emoji:"👕", bg:"#F0F7EE", badge:null,   desc:"100% breathable linen button-up in a relaxed fit. Pre-washed for an effortlessly worn look." },
  { id:15, name:"Scented Candle Set",     cat:"Home",        price:28.99,  rating:4.6, emoji:"🕯️", bg:"#FBF4E8", badge:"sale", desc:"Set of 3 hand-poured soy wax candles — cedar, vanilla and eucalyptus, 40hr burn each." },
  { id:16, name:"Jump Rope",              cat:"Sports",      price:11.99,  rating:4.4, emoji:"🪢", bg:"#FBF0F4", badge:null,   desc:"Speed jump rope with ball-bearing handles, adjustable PVC cable and digital counter." },
];

const categories = ["All", "Electronics", "Fashion", "Home", "Sports"];
let activecat = "All";
let cart = {};
let cartVisible = false;


function loadCartFromStorage() {
  const stored = localStorage.getItem('shopnow_cart');
  if (stored) {
    try {
      const items = JSON.parse(stored);
      items.forEach(item => {
        cart[item.id] = { product: item, qty: item.qty };
      });
    } catch(e) { cart = {}; }
  }
}


function saveCartToStorage() {
  const items = Object.values(cart).map(item => ({
    id: item.product.id,
    name: item.product.name,
    cat: item.product.cat,
    price: item.product.price,
    emoji: item.product.emoji,
    bg: item.product.bg,
    qty: item.qty
  }));
  localStorage.setItem('shopnow_cart', JSON.stringify(items));
}


function goToAccount() {
  if (checkAuth()) {
    window.location.href = 'myaccount.html';
  } else {
    window.location.href = 'login.html';
  }
}


function renderCats() {
  document.getElementById('catPills').innerHTML = categories.map(c =>
    `<button class="cat-pill${c === activecat ? ' active' : ''}" onclick="setcat('${c}')">${c}</button>`
  ).join('');
}

function setcat(c) { 
  activecat = c; 
  renderCats(); 
  renderProducts(); 
}


function starsHtml(r) {
  const full = Math.round(r);
  return '★'.repeat(full) + '☆'.repeat(5 - full) + ` <span style="color:var(--text2);font-size:10px">${r}</span>`;
}


function getFiltered() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const sort = document.getElementById('sortSelect').value;
  let list = products.filter(p =>
    (activecat === 'All' || p.cat === activecat) &&
    (!q || p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q))
  );
  if (sort === 'price-asc')  list.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  if (sort === 'rating')     list.sort((a, b) => b.rating - a.rating);
  return list;
}


function renderProducts() {
  const list = getFiltered();
  const grid = document.getElementById('productGrid');
  document.getElementById('resultsCount').textContent = list.length + ' products';

  if (!list.length) {
    grid.innerHTML = `<div class="no-results"><span>🔍</span>No products found. Try a different search or category.</div>`;
    return;
  }

  grid.innerHTML = list.map((p, i) => `
    <div class="card" style="animation-delay:${i * 35}ms" onclick="openModal(${p.id})">
      <div class="card-img" style="background:${p.bg}">
        ${p.badge ? `<span class="card-badge badge-${p.badge}">${p.badge === 'sale' ? '🔥 Sale' : '✦ New'}</span>` : ''}
        <div class="card-quick-info">
          <div class="card-quick-name">${p.name}</div>
          <div class="card-quick-price">$${p.price.toFixed(2)}</div>
        </div>
        <div class="card-emoji">${p.emoji}</div>
      </div>
      <div class="card-body">
        <div class="card-cat">${p.cat}</div>
        <div class="card-name">${p.name}</div>
        <div class="card-footer">
          <div class="price-block">
            <div class="card-price">$${p.price.toFixed(2)}</div>
            <div class="card-rating">${starsHtml(p.rating)}</div>
          </div>
          <button class="add-btn" onclick="event.stopPropagation(); addToCart(${p.id})" title="Add to cart">+</button>
        </div>
      </div>
    </div>`
  ).join('');
}


function addToCart(id) {
  const p = products.find(x => x.id === id);
  if (!cart[id]) cart[id] = { product: p, qty: 0 };
  cart[id].qty++;
  
  ShopNowDB.addToCart(p, 1);
  updateCartUI();
  showToast(p.emoji + ' ' + p.name + ' added to cart');
}

function changeQty(id, delta) {
  if (!cart[id]) return;
  cart[id].qty += delta;
  if (cart[id].qty <= 0) delete cart[id];
 
  ShopNowDB.updateCartQty(id, cart[id] ? cart[id].qty : 0);
  updateCartUI();
}

function clearCart() { 
  cart = {}; 
  
  ShopNowDB.clearCart();
  updateCartUI(); 
}

function updateCartUI() {
  const items = Object.values(cart);
  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  const badge = document.getElementById('cartBadge');
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';

  const body = document.getElementById('cartBody');
  const foot = document.getElementById('cartFoot');

  if (!items.length) {
    body.innerHTML = `<div class="empty-state"><div class="empty-icon">🛒</div><p>Your cart is empty.<br>Add something!</p></div>`;
    foot.style.display = 'none';
  } else {
    body.innerHTML = items.map(({ product: p, qty }) => `
      <div class="cart-item">
        <div class="ci-emoji">${p.emoji}</div>
        <div class="ci-info">
          <div class="ci-name">${p.name}</div>
          <div class="ci-price">$${(p.price * qty).toFixed(2)}</div>
        </div>
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
          <span class="qty-num">${qty}</span>
          <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
        </div>
      </div>`
    ).join('');
    document.getElementById('subtotalEl').textContent = '$' + total.toFixed(2);
    document.getElementById('totalEl').textContent = '$' + total.toFixed(2);
    foot.style.display = 'block';
  }
}

function toggleCart() {
 
  window.location.href = 'cart.html';
}

function checkout() {
  const count = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  if (!count) { showToast('Your cart is empty!'); return; }
  window.location.href = 'cart.html';
}


function openModal(id) {
  const p = products.find(x => x.id === id);
  document.getElementById('modalImg').textContent = p.emoji;
  document.getElementById('modalImg').style.background = p.bg;
  document.getElementById('modalCat').textContent = p.cat;
  document.getElementById('modalName').textContent = p.name;
  document.getElementById('modalDesc').textContent = p.desc;
  document.getElementById('modalPrice').textContent = '$' + p.price.toFixed(2);
  document.getElementById('modalRating').innerHTML = starsHtml(p.rating);
  document.getElementById('modalAddBtn').onclick = () => { addToCart(p.id); closeModal(); };
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modalOverlay')) return;
  document.getElementById('modalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}


function initShopNowPage() {
  loadCartFromStorage();
  renderCats();
  renderProducts();
  updateCartUI();
  
  
  document.getElementById('searchInput').addEventListener('input', renderProducts);
  document.getElementById('sortSelect').addEventListener('change', renderProducts);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}



document.addEventListener('DOMContentLoaded', function() {
  
  if (document.getElementById('loginForm')) {
    
    console.log('Login page initialized');
  } else if (document.getElementById('firstName')) {
    
    initAccountPage();
  } else if (document.getElementById('productGrid')) {
   
    initShopNowPage();
  }
});