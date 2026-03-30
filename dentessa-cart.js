/**
 * DentessaCart - Fully Reusable Shopping Cart Component
 * 
 * Usage:
 * ------
 * 1. Include this script on any page
 * 2. Add the cart HTML structure (see bottom of file)
 * 3. Call DentessaCart.addToCart({id, name, category, img})
 * 
 * Features:
 * - Fully modular - works on any page
 * - No jQuery dependency
 * - Stores cart state in memory (+ optional localStorage)
 * - Animated slide-in panel
 * - Integrates with DentessaInquiry
 */

const DentessaCart = (() => {
  let cartItems = [];
  const STORAGE_KEY = 'dentessa_cart_items';

  // DOM references - will be set when available
  let DOM = {
    panel: null,
    overlay: null,
    fab: null,
    closeBtn: null,
    itemsContainer: null,
    inquiryBtn: null
  };

  /**
   * Initialize DOM references
   * Call this after your HTML is loaded
   */
  const initDOM = () => {
    DOM = {
      panel: document.getElementById('dnt-cart-panel'),
      overlay: document.getElementById('dnt-cart-overlay'),
      fab: document.getElementById('dnt-cart-fab'),
      closeBtn: document.querySelector('.dnt-cart-close-btn'),
      itemsContainer: document.querySelector('.dnt-cart-items'),
      inquiryBtn: document.querySelector('.dnt-cart-inquiry-btn')
    };

    // Bind events if DOM elements exist
    if (DOM.closeBtn) DOM.closeBtn.addEventListener('click', closePanel);
    if (DOM.overlay) DOM.overlay.addEventListener('click', closePanel);
    if (DOM.fab) DOM.fab.addEventListener('click', openPanel);
    if (DOM.inquiryBtn) {
      DOM.inquiryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof DentessaInquiry !== 'undefined' && cartItems.length > 0) {
          const products = cartItems.map(item => item.name).join(', ');
          DentessaInquiry.open(`Cart Items: ${products}`);
        }
      });
    }
  };

  /**
   * Update cart UI elements
   */
  const updateUI = () => {
    const count = cartItems.length;
    
    // Update badges
    document.querySelectorAll('.dnt-cart-count-badge, .dnt-fab-badge').forEach(el => {
      el.textContent = count;
    });

    // Update items list
    if (!DOM.itemsContainer) return;

    if (count === 0) {
      DOM.itemsContainer.innerHTML = '<div class="dnt-cart-empty"><p>Your cart is empty</p></div>';
    } else {
      let html = '';
      cartItems.forEach((item, idx) => {
        html += `
          <div class="dnt-cart-item" data-index="${idx}">
            <div class="dnt-cart-item-img">
              <img src="${item.img}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60'">
            </div>
            <div class="dnt-cart-item-info">
              <p class="dnt-item-name">${escapeHTML(item.name)}</p>
              <p class="dnt-item-type">${escapeHTML(item.category || 'Product')}</p>
              <span style="font-size:11px;color:#999;">Qty: 1</span>
            </div>
            <button class="dnt-item-remove" data-index="${idx}" title="Remove item" style="
              position: absolute;
              top: 8px;
              right: 0;
              background: none;
              border: none;
              cursor: pointer;
              color: #ccc;
              font-size: 18px;
              padding: 4px 8px;
              transition: color 0.2s;
            ">✕</button>
          </div>
        `;
      });
      DOM.itemsContainer.innerHTML = html;

      // Bind remove buttons
      DOM.itemsContainer.querySelectorAll('.dnt-item-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          removeFromCart(parseInt(btn.dataset.index));
        });
        btn.addEventListener('mouseenter', () => btn.style.color = '#d9534f');
        btn.addEventListener('mouseleave', () => btn.style.color = '#ccc');
      });
    }

    // Persist to localStorage (optional)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.warn('localStorage unavailable');
    }
  };

  /**
   * Escape HTML to prevent XSS
   */
  const escapeHTML = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  };

  /**
   * Add product to cart
   * @param {Object} product - {id, name, category, img}
   */
  const addToCart = (product) => {
    if (!product.name) {
      console.warn('Product must have a name');
      return;
    }

    cartItems.push({
      id: product.id || Date.now(),
      name: product.name,
      category: product.category || 'Product',
      img: product.img || 'https://via.placeholder.com/60',
      timestamp: Date.now()
    });

    updateUI();
    openPanel();

    // Optional: Show toast notification
    if (window.showToast) {
      window.showToast(`Added "${product.name}" to cart`, 'success');
    }
  };

  /**
   * Remove item by index
   */
  const removeFromCart = (index) => {
    if (index >= 0 && index < cartItems.length) {
      const removed = cartItems.splice(index, 1)[0];
      updateUI();
      if (window.showToast) {
        window.showToast(`Removed "${removed.name}" from cart`, 'info');
      }
    }
  };

  /**
   * Open cart panel
   */
  const openPanel = () => {
    if (!DOM.panel) initDOM();
    if (DOM.panel) DOM.panel.classList.add('open');
    if (DOM.overlay) DOM.overlay.classList.add('active');
  };

  /**
   * Close cart panel
   */
  const closePanel = () => {
    if (DOM.panel) DOM.panel.classList.remove('open');
    if (DOM.overlay) DOM.overlay.classList.remove('active');
  };

  /**
   * Get cart items (read-only copy)
   */
  const getCartItems = () => {
    return JSON.parse(JSON.stringify(cartItems));
  };

  /**
   * Clear cart
   */
  const clearCart = () => {
    cartItems = [];
    updateUI();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  };

  /**
   * Load cart from localStorage (call on page load)
   */
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        cartItems = JSON.parse(stored);
        updateUI();
      }
    } catch (e) {
      console.warn('Could not load cart from storage');
    }
  };

  /**
   * Get cart item count
   */
  const getItemCount = () => cartItems.length;

  /**
   * Automatic initialization on DOM ready
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initDOM, 100);
    });
  } else {
    setTimeout(initDOM, 100);
  }

  // Public API
  return {
    addToCart,
    removeFromCart,
    openPanel,
    closePanel,
    getCartItems,
    clearCart,
    loadFromStorage,
    getItemCount,
    init: initDOM
  };
})();

/**
 * Optional: Auto-load from storage when page loads
 */
window.addEventListener('load', () => {
  if (typeof DentessaCart !== 'undefined') {
    DentessaCart.loadFromStorage();
  }
});

/**
 * ═══════════════════════════════════════════════════════════════
 * HTML STRUCTURE - Add this to your page:
 * ═══════════════════════════════════════════════════════════════

<!-- CART OVERLAY & PANEL -->
<div id="dnt-cart-overlay"></div>
<div id="dnt-cart-panel">
  <div class="dnt-cart-head">
    <h3>🛒 CART <span class="dnt-cart-count-badge">0</span></h3>
    <button class="dnt-cart-close-btn">✕</button>
  </div>
  <div class="dnt-cart-items">
    <div class="dnt-cart-empty">
      <p>Your cart is empty</p>
    </div>
  </div>
  <div class="dnt-cart-footer">
    <p style="font-size: 12px; color: #888; text-align: center; margin-bottom: 12px;">
      Submit your cart for B2B pricing
    </p>
    <button class="dnt-cart-inquiry-btn">SUBMIT INQUIRY</button>
  </div>
</div>

<!-- FLOATING CART BUTTON -->
<button id="dnt-cart-fab" title="View Cart">
  🛒
  <span class="dnt-fab-badge">0</span>
</button>

 * ═══════════════════════════════════════════════════════════════
 * CSS - Add this to your stylesheet:
 * ═══════════════════════════════════════════════════════════════

#dnt-cart-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(28,28,28,0.45);
  backdrop-filter: blur(3px);
  z-index: 88888;
}
#dnt-cart-overlay.active { display: block; }

#dnt-cart-panel {
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: 360px;
  max-width: 95vw;
  background: #fff;
  box-shadow: -8px 0 40px rgba(28,28,28,0.18);
  z-index: 88889;
  display: flex;
  flex-direction: column;
  transform: translateX(110%);
  transition: transform 0.32s cubic-bezier(0.34,1.1,0.64,1);
}
#dnt-cart-panel.open { transform: translateX(0); }

.dnt-cart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 22px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #1C1C1C;
}
.dnt-cart-head h3 {
  margin: 0;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 10px;
}
.dnt-cart-head h3 .dnt-cart-count-badge {
  background: #E8600A;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}
.dnt-cart-close-btn {
  background: rgba(255,255,255,0.12);
  border: none;
  color: #fff;
  width: 32px; height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.dnt-cart-close-btn:hover { background: rgba(255,255,255,0.22); }

.dnt-cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
.dnt-cart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #aaa;
  font-size: 14px;
  text-align: center;
  gap: 12px;
}

.dnt-cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f4f4f4;
  position: relative;
}
.dnt-cart-item:last-child { border-bottom: none; }
.dnt-cart-item-img {
  width: 60px; height: 60px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f5f5;
  border: 1px solid #eee;
}
.dnt-cart-item-img img {
  width: 100%; height: 100%;
  object-fit: cover;
}
.dnt-cart-item-info { flex: 1; min-width: 0; }
.dnt-cart-item-info .dnt-item-name {
  font-size: 13px;
  font-weight: 700;
  color: #1C1C1C;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dnt-cart-footer {
  padding: 16px 22px 22px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}
.dnt-cart-inquiry-btn {
  width: 100%;
  padding: 13px;
  background: #E8600A;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.2s;
}
.dnt-cart-inquiry-btn:hover { background: #c95208; }

#dnt-cart-fab {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 52px; height: 52px;
  background: #1C1C1C;
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 24px rgba(28,28,28,0.28);
  z-index: 8000;
  font-size: 24px;
  transition: background 0.2s, transform 0.2s;
}
#dnt-cart-fab:hover { background: #E8600A; transform: translateY(-2px); }
#dnt-cart-fab .dnt-fab-badge {
  position: absolute;
  top: -4px; right: -4px;
  background: #E8600A;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  min-width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

 * ═══════════════════════════════════════════════════════════════
 * USAGE EXAMPLES:
 * ═══════════════════════════════════════════════════════════════

// Add to cart from any button
document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    DentessaCart.addToCart({
      id: btn.dataset.productId,
      name: btn.dataset.productName,
      category: btn.dataset.category,
      img: btn.dataset.image
    });
  });
});

// Open cart programmatically
DentessaCart.openPanel();

// Get cart contents
const items = DentessaCart.getCartItems();
console.log(items);

// Clear cart
DentessaCart.clearCart();

// Get item count
const count = DentessaCart.getItemCount();

 */