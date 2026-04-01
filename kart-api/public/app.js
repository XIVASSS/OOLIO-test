const productGrid = document.querySelector('#product-grid');
const productCount = document.querySelector('#product-count');
const cartBody = document.querySelector('#cart-body');
const subtotalEl = document.querySelector('#subtotal');
const discountEl = document.querySelector('#discount');
const totalEl = document.querySelector('#total');
const confirmButton = document.querySelector('#submit-order');
const discountInput = document.querySelector('#discount-code');
const applyDiscountButton = document.querySelector('#apply-discount');
const discountMessage = document.querySelector('#discount-message');
const confirmationPanel = document.querySelector('#confirmation-panel');
const confirmationText = document.querySelector('#confirmation-text');
const newOrderButton = document.querySelector('#new-order');

const state = {
  products: [],
  cart: [],
  discountCode: '',
  discountLabel: '',
  discountValue: 0,
  orderPlaced: false
};

function formatMoney(value) {
  return `$${value.toFixed(2)}`;
}

function findCartItem(productId) {
  return state.cart.find((item) => item.product.id === productId);
}

function updateCart() {
  if (state.cart.length === 0) {
    cartBody.innerHTML = '<p class="empty-cart">Your cart is empty. Add a product to get started.</p>';
    confirmButton.disabled = true;
    discountMessage.textContent = '';
    state.discountCode = '';
    state.discountLabel = '';
    state.discountValue = 0;
    discountInput.value = '';
  } else {
    cartBody.innerHTML = '';
    state.cart.forEach((entry) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div class="cart-item-details">
          <p class="cart-item-name"><strong>${entry.product.name}</strong></p>
          <p>${entry.product.category}</p>
          <p>${formatMoney(entry.product.price)} × ${entry.quantity}</p>
        </div>
        <div class="cart-item-controls">
          <div class="quantity-group">
            <button type="button" data-action="decrease" data-id="${entry.product.id}">-</button>
            <span>${entry.quantity}</span>
            <button type="button" data-action="increase" data-id="${entry.product.id}">+</button>
          </div>
          <button type="button" class="remove-button" data-action="remove" data-id="${entry.product.id}">Remove</button>
        </div>
      `;
      cartBody.appendChild(itemEl);
    });
    confirmButton.disabled = false;
  }

  recalcTotals();
}

function recalcTotals() {
  const subtotal = state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = state.discountValue;
  const total = Math.max(0, subtotal - discount);
  subtotalEl.textContent = formatMoney(subtotal);
  discountEl.textContent = `-${formatMoney(discount)}`;
  totalEl.textContent = formatMoney(total);
}

function renderProducts() {
  productGrid.innerHTML = '';
  productCount.textContent = `${state.products.length} products available`;
  state.products.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image.thumbnail}" alt="${product.name}" />
      <div class="product-card-content">
        <p class="section-label">${product.category}</p>
        <h3>${product.name}</h3>
        <div class="product-meta">
          <span class="price-tag">${formatMoney(product.price)}</span>
          <button class="add-button" type="button" data-id="${product.id}">Add</button>
        </div>
      </div>
    `;
    productGrid.appendChild(card);
  });
}

function addToCart(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  const existing = findCartItem(productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ product, quantity: 1 });
  }
  updateCart();
}

function changeQuantity(productId, delta) {
  const item = findCartItem(productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity < 1) {
    state.cart = state.cart.filter((entry) => entry.product.id !== productId);
  }
  updateCart();
}

function removeItem(productId) {
  state.cart = state.cart.filter((entry) => entry.product.id !== productId);
  updateCart();
}

function applyDiscountCode() {
  const code = discountInput.value.trim().toUpperCase();
  state.discountCode = code;
  state.discountValue = 0;
  state.discountLabel = '';
  discountMessage.textContent = '';

  if (!code) {
    discountMessage.textContent = 'No discount code entered.';
    recalcTotals();
    return;
  }

  const subtotal = state.cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  if (subtotal <= 0) {
    discountMessage.textContent = 'Add items to cart before using a discount code.';
    recalcTotals();
    return;
  }

  if (code === 'HAPPYHOURS') {
    state.discountValue = Number((subtotal * 0.18).toFixed(2));
    state.discountLabel = 'HAPPYHOURS';
    discountMessage.textContent = `Discount applied: 18% off.`;
  } else if (code === 'BUYGETONE') {
    const lowest = Math.min(...state.cart.map((item) => item.product.price));
    state.discountValue = Number(lowest.toFixed(2));
    state.discountLabel = 'BUYGETONE';
    discountMessage.textContent = `Discount applied: lowest priced item free.`;
  } else {
    discountMessage.textContent = 'Unknown code. Try HAPPYHOURS or BUYGETONE.';
  }

  recalcTotals();
}

async function placeOrder() {
  if (state.cart.length === 0) return;
  confirmButton.disabled = true;
  confirmButton.textContent = 'Sending order…';

  const payload = {
    items: state.cart.map((item) => ({ productId: item.product.id, quantity: item.quantity }))
  };

  if (state.discountLabel) {
    payload.couponCode = state.discountLabel;
  }

  try {
    const response = await fetch('/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        api_key: 'apitest'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message || 'Unable to place order.');
    }

    const order = await response.json();
    state.orderPlaced = true;
    confirmationPanel.classList.remove('hidden');
    confirmationText.textContent = `Order #${order.id} confirmed. Total: ${formatMoney(order.total)}.`;
    confirmButton.textContent = 'Confirm Order';
    state.cart = [];
    updateCart();
  } catch (err) {
    alert(err.message);
    confirmButton.disabled = false;
    confirmButton.textContent = 'Confirm Order';
  }
}

function resetOrder() {
  state.orderPlaced = false;
  state.discountCode = '';
  state.discountValue = 0;
  state.discountLabel = '';
  discountInput.value = '';
  discountMessage.textContent = '';
  confirmationPanel.classList.add('hidden');
  updateCart();
}

async function loadProducts() {
  try {
    const response = await fetch('/product');
    const products = await response.json();
    state.products = products;
    renderProducts();
  } catch (error) {
    productGrid.innerHTML = '<p class="empty-cart">Unable to load products. Please try again later.</p>';
    productCount.textContent = 'Products unavailable';
  }
}

productGrid.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]');
  if (!button) return;
  addToCart(button.dataset.id);
});

cartBody.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;
  if (action === 'increase') {
    changeQuantity(id, 1);
  } else if (action === 'decrease') {
    changeQuantity(id, -1);
  } else if (action === 'remove') {
    removeItem(id);
  }
});

applyDiscountButton.addEventListener('click', applyDiscountCode);
confirmButton.addEventListener('click', placeOrder);
newOrderButton.addEventListener('click', resetOrder);

loadProducts();
