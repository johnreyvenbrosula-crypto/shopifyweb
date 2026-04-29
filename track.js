
document.addEventListener('DOMContentLoaded', function() {
 
  if (!document.getElementById('orderId')) return;
  
  console.log('=== TRACK.JS LOADED ===');
  console.log('Page: track-order.html');
  console.log('ShopNowDB available:', typeof ShopNowDB !== 'undefined');
  
 
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order');
  
  console.log('URL order param:', orderId);
  console.log('Full URL:', window.location.href);
  
  if (!orderId) {
    
    console.log('No order ID in URL, showing search prompt');
    document.getElementById('successMessage').innerHTML = `
      <div class="success-icon">📦</div>
      <h1>Track Your Order</h1>
      <p>Enter your Order ID above to track your order status.</p>
    `;
    
    
    const deliveryAnim = document.querySelector('.delivery-animation');
    if (deliveryAnim) deliveryAnim.style.display = 'none';
    
    const orderDetails = document.querySelector('.order-details');
    if (orderDetails) orderDetails.style.display = 'none';
    
    
    const orderItemsSection = document.querySelector('.order-items-section');
    if (orderItemsSection) orderItemsSection.style.display = 'none';
    
    
    const estimatedDelivery = document.querySelector('.estimated-delivery');
    if (estimatedDelivery) estimatedDelivery.style.display = 'none';
    

    const trackActions = document.querySelector('.track-actions');
    if (trackActions) trackActions.style.display = 'none';
    
    return;
  }
  
  
  setTimeout(function() {
    console.log('=== DELAYED CHECK ===');
    console.log('ShopNowDB:', typeof ShopNowDB);
    if (typeof ShopNowDB !== 'undefined') {
      console.log('Calling loadOrderData with orderId:', orderId);
      loadOrderData();
    } else {
      console.error('ShopNowDB not found!');
      showNoOrderFound();
    }
  }, 300);
});


function trackOrderById() {
  const input = document.getElementById('trackOrderInput');
  const orderId = input.value.trim().toUpperCase();
  
  console.log('=== trackOrderById called ===');
  console.log('Input value:', orderId);
  
  if (!orderId) {
    alert('Please enter an Order ID');
    return;
  }
  
  console.log('Searching for order:', orderId);
  
  if (typeof ShopNowDB === 'undefined') {
    alert('Database not loaded. Please refresh the page.');
    return;
  }
  
  var allOrders = ShopNowDB.getOrders();
  console.log('All orders:', allOrders);
  console.log('Available IDs:', allOrders.map(function(o) { return o.orderId; }));
  
  var order = allOrders.find(function(o) { 
    return o.orderId.toUpperCase() === orderId; 
  });
  
  console.log('Found order:', order);
  
  if (order) {
    displayOrder(order);
  } else {
    alert('Order not found! Please check your Order ID.');
  }
}

function loadOrderData() {
  console.log('=== loadOrderData START ===');
  console.log('ShopNowDB type:', typeof ShopNowDB);
  
  if (typeof ShopNowDB === 'undefined') {
    console.error('ShopNowDB is undefined!');
    showNoOrderFound();
    return;
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('order');
  console.log('Order ID from URL:', orderId);
  console.log('Full URL:', window.location.href);
  

  var allOrders = ShopNowDB.getOrders();
  console.log('All orders:', allOrders);
  console.log('Order count:', allOrders ? allOrders.length : 0);
  
  if (!allOrders || allOrders.length === 0) {
    console.log('No orders found in database');
    showNoOrderFound();
    return;
  }
  
  
  console.log('Available order IDs:', allOrders.map(function(o) { return o.orderId; }));
  
  var order = null;
  
  if (orderId) {
    console.log('Searching for order ID:', orderId);
    order = allOrders.find(function(o) { 
      return o.orderId.toUpperCase() === orderId.toUpperCase(); 
    });
    console.log('Search result:', order);
  } else {
    console.log('No order ID in URL, using latest order');
    order = allOrders[allOrders.length - 1];
    console.log('Latest order:', order);
  }
  
  if (order) {
    console.log('Order found! Calling displayOrder with:', order.orderId);
    displayOrder(order);
  } else {
    console.log('No order found');
    showNoOrderFound();
  }
  
  console.log('=== loadOrderData END ===');
}

function displayOrder(order) {
  console.log('=== displayOrder called ===');
  console.log('Displaying order:', order);
  console.log('Order fields:', Object.keys(order));
  
  
  console.log('=== DOM Element Check ===');
  console.log('successMessage:', document.getElementById('successMessage'));
  console.log('orderId:', document.getElementById('orderId'));
  console.log('orderDate:', document.getElementById('orderDate'));
  console.log('orderTotal:', document.getElementById('orderTotal'));
  console.log('orderItems:', document.getElementById('orderItems'));
  console.log('shippingAddress:', document.getElementById('shippingAddress'));
  console.log('itemsList:', document.getElementById('itemsList'));
  console.log('estimatedDate:', document.getElementById('estimatedDate'));
  
  
  document.getElementById('successMessage').innerHTML = `
    <div class="success-icon">🎉</div>
    <h1>Order Placed Successfully!</h1>
    <p>Thank you for your order. Here's your order tracking information.</p>
  `;
  
  // Update order ID
  const orderIdEl = document.getElementById('orderId');
  console.log('orderId element:', orderIdEl);
  orderIdEl.textContent = order.orderId || 'N/A';
  console.log('Set orderId to:', order.orderId);
  
  const orderDate = new Date(order.date);
  console.log('Order date:', order.date, 'Parsed:', orderDate);
  document.getElementById('orderDate').textContent = orderDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  
  console.log('Order total:', order.total);
 
  let totalValue = order.total;
  if (typeof totalValue === 'string') {
    totalValue = parseFloat(totalValue.replace('$', '')) || 0;
  }
  document.getElementById('orderTotal').textContent = '$' + (totalValue || 0).toFixed(2);
  
 
  console.log('Order items:', order.items);
  const totalItems = order.items.reduce((sum, item) => sum + (item.qty || 0), 0);
  document.getElementById('orderItems').textContent = totalItems + ' item' + (totalItems > 1 ? 's' : '');
  
 
  
  const shippingName = order.name || 'N/A';
  const shippingAddress = order.address || 'N/A';
  const shippingCity = order.city || '';
  const shippingState = order.state || '';
  const shippingZip = order.zip || '';
  const shippingCountry = order.country || '';
  
  console.log('Shipping info:', { name: shippingName, address: shippingAddress, city: shippingCity, state: shippingState, zip: shippingZip, country: shippingCountry });
  
  let addressText = shippingAddress;
  if (shippingCity) addressText += ', ' + shippingCity;
  if (shippingState) addressText += ', ' + shippingState;
  if (shippingZip) addressText += ' ' + shippingZip;
  if (shippingCountry) addressText += ', ' + shippingCountry;
  
  document.getElementById('shippingAddress').textContent = shippingName + '\n' + addressText;
  
  
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + Math.floor(Math.random() * 3) + 3);
  document.getElementById('estimatedDate').textContent = estimatedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
  
  const itemsList = document.getElementById('itemsList');
  console.log('itemsList element:', itemsList);
  console.log('order.items:', order.items);
  
  itemsList.innerHTML = order.items.map(item => {
    const qty = item.qty || 1;
    const price = parseFloat(item.price) || 0;
    return `
    <div class="order-item">
      <div class="order-item-img" style="background:${item.bg || '#f0f0f0'}">${item.emoji || '📦'}</div>
      <div class="order-item-info">
        <div class="order-item-name">${item.name || 'Unknown Item'}</div>
        <div class="order-item-qty">Qty: ${qty}</div>
      </div>
      <div class="order-item-price">$${(price * qty).toFixed(2)}</div>
    </div>
  `;
  }).join('');
  
  console.log('Items HTML set, checking visibility...');
  
 
  console.log('Showing order sections...');
  
  const deliveryAnim = document.querySelector('.delivery-animation');
  console.log('delivery-animation:', deliveryAnim, 'display before:', deliveryAnim ? deliveryAnim.style.display : 'N/A');
  if (deliveryAnim) {
    deliveryAnim.style.display = 'block';
    console.log('delivery-animation display set to block');
  }
  
  const orderDetails = document.querySelector('.order-details');
  console.log('order-details:', orderDetails, 'display before:', orderDetails ? orderDetails.style.display : 'N/A');
  if (orderDetails) {
    orderDetails.style.display = 'block';
    console.log('order-details display set to block');
  }
  
  const orderItemsSection = document.querySelector('.order-items-section');
  console.log('order-items-section:', orderItemsSection, 'display before:', orderItemsSection ? orderItemsSection.style.display : 'N/A');
  if (orderItemsSection) {
    orderItemsSection.style.display = 'block';
    console.log('order-items-section display set to block');
  }
  
  const estimatedDelivery = document.querySelector('.estimated-delivery');
  console.log('estimated-delivery:', estimatedDelivery, 'display before:', estimatedDelivery ? estimatedDelivery.style.display : 'N/A');
  if (estimatedDelivery) {
    estimatedDelivery.style.display = 'flex';
    console.log('estimated-delivery display set to flex');
  }
  
  const trackActions = document.querySelector('.track-actions');
  console.log('track-actions:', trackActions, 'display before:', trackActions ? trackActions.style.display : 'N/A');
  if (trackActions) {
    trackActions.style.display = 'flex';
    console.log('track-actions display set to flex');
  }
  
  console.log('=== displayOrder complete ===');
  
  simulateDeliveryProgress();
}


function showNoOrderFound() {
  document.getElementById('successMessage').innerHTML = `
    <div class="success-icon">🔍</div>
    <h1>Order Not Found</h1>
    <p>We couldn't find any order information. Please check your order ID and try again.</p>
  `;
  document.getElementById('orderId').textContent = '---';
  document.getElementById('orderDate').textContent = '---';
  document.getElementById('orderTotal').textContent = '$0.00';
  document.getElementById('orderItems').textContent = '0';
  document.getElementById('shippingAddress').textContent = '---';
  document.getElementById('itemsList').innerHTML = '<p style="text-align:center;color:var(--text2)">No order items found.</p>';
  
  const deliveryAnim = document.querySelector('.delivery-animation');
  if (deliveryAnim) deliveryAnim.style.display = 'none';
  

  const orderDetails = document.querySelector('.order-details');
  if (orderDetails) orderDetails.style.display = 'none';
  
 
  const orderItemsSection = document.querySelector('.order-items-section');
  if (orderItemsSection) orderItemsSection.style.display = 'none';
  
  
  const estimatedDelivery = document.querySelector('.estimated-delivery');
  if (estimatedDelivery) estimatedDelivery.style.display = 'none';
  

  const trackActions = document.querySelector('.track-actions');
  if (trackActions) trackActions.style.display = 'none';
}


function simulateDeliveryProgress() {
  const steps = document.querySelectorAll('.status-step');
  const times = [
    document.getElementById('time1'),
    document.getElementById('time2'),
    document.getElementById('time3'),
    document.getElementById('time4'),
    document.getElementById('time5')
  ];
  

  const now = new Date();
  times[0].textContent = 'Just now';
  
 
  let currentStep = 0;
  
  const progressInterval = setInterval(() => {
   
    if (currentStep < steps.length) {
      steps[currentStep].classList.add('active');
      
   
      if (currentStep > 0) {
        const stepTime = new Date(now);
        stepTime.setMinutes(stepTime.getMinutes() + (currentStep * 15));
        times[currentStep].textContent = stepTime.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        });
      }
      
      currentStep++;
      
      if (currentStep >= steps.length) {
        clearInterval(progressInterval);
      }
    }
  }, 2000); 
}