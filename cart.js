

document.addEventListener('DOMContentLoaded', function() {
  loadCartItems();
  updateOrderSummary();
});


function loadCartItems() {
  const cart = ShopNowDB.getCart();
  const cartItemsEl = document.getElementById('cartItems');
  const emptyCartEl = document.getElementById('emptyCart');
  const cartSummary = document.getElementById('cartSummary');
  
  if (cart.length === 0) {
    cartItemsEl.style.display = 'none';
    emptyCartEl.style.display = 'block';
    if (cartSummary) cartSummary.style.display = 'none';
    return;
  }
  
  cartItemsEl.style.display = 'flex';
  emptyCartEl.style.display = 'none';
  if (cartSummary) cartSummary.style.display = 'block';
  
  cartItemsEl.innerHTML = cart.map((item) => `
    <div class="cart-item">
      <div class="cart-item-img" style="background:${item.bg}">${item.emoji}</div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-cat">${item.cat}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
      </div>
      <div class="cart-item-actions">
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})" title="Remove">🗑️</button>
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
    </div>
  `).join('');
}


function changeQty(productId, delta) {
  const cart = ShopNowDB.getCart();
  const item = cart.find(i => i.id === productId);
  
  if (item) {
    const newQty = item.qty + delta;
    if (newQty <= 0) {
      ShopNowDB.removeFromCart(productId);
    } else {
      ShopNowDB.updateCartQty(productId, newQty);
    }
    loadCartItems();
    updateOrderSummary();
    updateCartBadge();
  }
}


function removeFromCart(productId) {
  ShopNowDB.removeFromCart(productId);
  loadCartItems();
  updateOrderSummary();
  updateCartBadge();
  showToast('Item removed from cart');
}


function updateOrderSummary() {
  const subtotal = ShopNowDB.getCartTotal();
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;
  
  document.getElementById('summarySubtotal').textContent = '$' + subtotal.toFixed(2);
  document.getElementById('summaryTax').textContent = '$' + tax.toFixed(2);
  document.getElementById('summaryTotal').textContent = '$' + total.toFixed(2);
}


function processCheckout(event) {
  event.preventDefault();
  
  console.log('=== CHECKOUT PROCESS ===');
  
  const cart = ShopNowDB.getCart();
  console.log('Cart items:', cart);
  
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }
  
 
  const orderData = {
    customer: {
      name: document.getElementById('checkoutName').value,
      email: document.getElementById('checkoutEmail').value,
      phone: document.getElementById('checkoutPhone').value
    },
    shipping: {
      address: document.getElementById('checkoutAddress').value,
      city: document.getElementById('checkoutCity').value,
      state: document.getElementById('checkoutState').value,
      zip: document.getElementById('checkoutZip').value,
      country: document.getElementById('checkoutCountry').value
    },
    items: cart,
    subtotal: ShopNowDB.getCartTotal(),
    tax: ShopNowDB.getCartTotal() * 0.08,
    total: ShopNowDB.getCartTotal() * 1.08
  };
  
  console.log('Order data to save:', orderData);
  
  
  const newOrder = ShopNowDB.createOrder(orderData);
  
  console.log('Order created:', newOrder.orderId);
  
  showToast('🎉 Order placed successfully!');
  
  setTimeout(() => {
    window.location.href = 'track-order.html?order=' + newOrder.orderId;
  }, 1500);
}


function updateCartBadge() {
  const count = ShopNowDB.getCartCount();
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}


function toggleCard(header) {
  const body = header.nextElementSibling;
  const toggle = header.querySelector('.card-toggle');
  body.classList.toggle('open');
  toggle.classList.toggle('open');
}