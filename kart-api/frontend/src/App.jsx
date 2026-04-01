import { useEffect, useMemo, useState } from 'react';

const INITIAL_MESSAGE = 'Add items to the cart to start your order.';

function currency(value) {
  return `$${value.toFixed(2)}`;
}

const fallbackImageUrl = 'https://via.placeholder.com/500x500?text=Image+not+available';

function handleImageError(event) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = fallbackImageUrl;
}

function getDiscountAmount(cart, code) {
  if (!code) return 0;
  const normalized = code.trim().toUpperCase();
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  if (subtotal <= 0) return 0;
  if (normalized === 'HAPPYHOURS') {
    return Number((subtotal * 0.18).toFixed(2));
  }
  if (normalized === 'BUYGETONE') {
    const lowest = Math.min(...cart.map((item) => item.product.price));
    return Number(lowest.toFixed(2));
  }
  return 0;
}

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountStatus, setDiscountStatus] = useState(INITIAL_MESSAGE);
  const [loading, setLoading] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/product');
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError('Unable to load products.');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const cartQuantities = useMemo(
    () => new Map(cart.map((item) => [item.product.id, item.quantity])),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );

  const discountAmount = useMemo(() => getDiscountAmount(cart, discountCode), [cart, discountCode]);
  const total = Math.max(0, subtotal - discountAmount);
  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.product.id === product.id);
      if (existing) {
        return current.map((entry) =>
          entry.product.id === product.id ? { ...entry, quantity: entry.quantity + 1 } : entry
        );
      }
      return [...current, { product, quantity: 1 }];
    });
    setDiscountStatus(INITIAL_MESSAGE);
  };

  const updateCartItem = (productId, delta) => {
    setCart((current) => {
      const copy = current.map((entry) => ({ ...entry }));
      const index = copy.findIndex((entry) => entry.product.id === productId);
      if (index < 0) return copy;
      copy[index].quantity += delta;
      if (copy[index].quantity < 1) {
        copy.splice(index, 1);
      }
      return copy;
    });
  };

  const removeCartItem = (productId) => {
    setCart((current) => current.filter((entry) => entry.product.id !== productId));
  };

  const applyDiscount = () => {
    const code = discountCode.trim().toUpperCase();
    if (!code) {
      setDiscountStatus('Enter a discount code to apply.');
      return;
    }
    if (cart.length === 0) {
      setDiscountStatus('Add items to the cart before applying a code.');
      return;
    }
    if (code === 'HAPPYHOURS') {
      setDiscountStatus('18% discount applied.');
      return;
    }
    if (code === 'BUYGETONE') {
      setDiscountStatus('Lowest-priced item will be free.');
      return;
    }
    setDiscountStatus('Discount code not recognized.');
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setError('');
    setOrderSuccess(null);

    const payload = {
      items: cart.map((entry) => ({ productId: entry.product.id, quantity: entry.quantity }))
    };
    if (discountCode.trim()) {
      payload.couponCode = discountCode.trim().toUpperCase();
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
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Order failed.');
      }
      setOrderSuccess(data);
      setCart([]);
      setDiscountCode('');
      setDiscountStatus('Order confirmed.');
    } catch (err) {
      setError(err.message || 'Unable to place order.');
    }
  };

  const resetOrder = () => {
    setOrderSuccess(null);
    setError('');
    setDiscountStatus(INITIAL_MESSAGE);
  };

  const orderItems = useMemo(() => {
    if (!orderSuccess) return [];
    return orderSuccess.items.map((item) => {
      const product = orderSuccess.products.find((productItem) => productItem.id === item.productId);
      return { ...item, product };
    });
  }, [orderSuccess]);

  return (
    <div className="app-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Desserts</p>
          <h1>Sweet treats for every craving.</h1>
          <p className="page-copy">Add your favorites to the cart, apply a discount, and confirm your order.</p>
        </div>
        <div className="cart-summary-card">
          <p className="cart-summary-label">Your Cart</p>
          <p className="cart-summary-count">{totalItems} item{totalItems === 1 ? '' : 's'}</p>
          <p className="cart-summary-total">{currency(total)}</p>
        </div>
      </header>

      <main className="layout-grid">
        <section className="menu-panel">
          <div className="menu-heading">
            <div>
              <p className="section-label">Desserts</p>
              <h2>Inspired sweets for every mood</h2>
            </div>
            <p className="product-count">{loading ? 'Loading…' : `${products.length} items`}</p>
          </div>

          <div className="product-grid">
            {loading && <div className="empty-state">Loading products…</div>}
            {!loading && products.length === 0 && <div className="empty-state">No products found.</div>}
            {products.map((product) => {
              const quantity = cartQuantities.get(product.id) || 0;
              return (
                <article className={`product-card ${quantity > 0 ? 'product-card--active' : ''}`} key={product.id}>
                  <div className="product-image">
                    <img src={product.image.desktop} alt={product.name} onError={handleImageError} />
                    <button className="card-action" type="button" onClick={() => addToCart(product)}>
                      Add to Cart
                    </button>
                    {quantity > 0 && <span className="item-badge">{quantity}</span>}
                  </div>
                  <div className="product-copy">
                    <p className="product-category">{product.category}</p>
                    <h3>{product.name}</h3>
                    <div className="product-meta">
                      <span>{currency(product.price)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="cart-panel">
          <div className="cart-heading">
            <div>
              <p className="section-label">Your Cart</p>
              <h2>{cart.length ? `(${totalItems})` : '(0)'}</h2>
            </div>
          </div>

          <div className="cart-body">
            {!cart.length && (
              <div className="empty-cart-placeholder">
                <div className="empty-cart-illustration">🧁</div>
                <p>Your added items will appear here.</p>
              </div>
            )}
            {cart.map((entry) => (
              <div className="cart-item" key={entry.product.id}>
                <img className="cart-item-thumb" src={entry.product.image.mobile} alt={entry.product.name} onError={handleImageError} />
                <div className="cart-item-info">
                  <p className="cart-item-name">{entry.product.name}</p>
                  <p className="cart-item-detail">{entry.quantity}x · {currency(entry.product.price)} = {currency(entry.product.price * entry.quantity)}</p>
                </div>
                <button className="cart-remove" type="button" onClick={() => removeCartItem(entry.product.id)}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="discount-box">
            <div className="discount-label-row">
              <label htmlFor="discount">Discount code</label>
              <span className="discount-hint">Optional</span>
            </div>
            <input
              id="discount"
              placeholder="HAPPYHOURS or BUYGETONE"
              value={discountCode}
              onChange={(event) => setDiscountCode(event.target.value)}
            />
            <button type="button" className="apply-button" onClick={applyDiscount}>
              Apply code
            </button>
            <p className="discount-note">{discountStatus}</p>
          </div>

          <div className="summary-box">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{currency(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Discount</span>
              <span>-{currency(discountAmount)}</span>
            </div>
            <div className="summary-row total">
              <span>Order Total</span>
              <span>{currency(total)}</span>
            </div>
            <button className="primary-button" type="button" onClick={placeOrder} disabled={!cart.length}>
              Confirm Order
            </button>
          </div>

          {error && <div className="alert error">{error}</div>}
        </aside>
      </main>

      {orderSuccess && (
        <div className="modal-backdrop">
          <div className="order-modal">
            <div className="modal-top">
              <span className="modal-icon">✓</span>
              <div>
                <p className="modal-label">Order Confirmed</p>
                <p className="modal-copy">We hope you enjoy your food!</p>
              </div>
            </div>
            <div className="order-items">
              {orderItems.map((item) => (
                <div className="order-row" key={item.product.id}>
                  <img src={item.product.image.thumbnail} alt={item.product.name} onError={handleImageError} />
                  <div>
                    <p>{item.product.name}</p>
                    <p>{item.quantity}x @ {currency(item.product.price)}</p>
                  </div>
                  <span>{currency(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="order-total-row">
              <span>Order Total</span>
              <strong>{currency(orderSuccess.total)}</strong>
            </div>
            <button className="primary-button" type="button" onClick={resetOrder}>
              Start New Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
