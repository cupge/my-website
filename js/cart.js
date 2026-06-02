const cartKey = "cupge-cart";
let cachedProducts = [];

function getCart() {
  return JSON.parse(localStorage.getItem(cartKey) || "[]");
}

function saveCart(cart) {
  localStorage.setItem(cartKey, JSON.stringify(cart));
  renderCart();
}

function addToCart(productId) {
  const cart = getCart();
  const item = cart.find((entry) => entry.productId === productId);
  if (item) {
    item.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }
  saveCart(cart);
  alert(t("cart.added"));
}

function removeFromCart(productId) {
  saveCart(getCart().filter((item) => item.productId !== productId));
}

function updateCartQuantity(productId, quantity) {
  const nextQuantity = Math.max(1, Number(quantity) || 1);
  saveCart(getCart().map((item) => item.productId === productId ? { ...item, quantity: nextQuantity } : item));
}

function clearCart() {
  saveCart([]);
}

function renderCart() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = count;
  });

  const container = document.querySelector("[data-cart-items]");
  if (!container) return;
  if (!cart.length) {
    container.innerHTML = `<p>${t("cart.empty")}</p>`;
    return;
  }

  container.innerHTML = cart.map((item) => {
    const product = cachedProducts.find((entry) => entry.id === item.productId);
    const name = product ? getProductName(product) : item.productId;
    return `
      <article class="cart-item">
        <strong>${name}</strong>
        <div class="cart-item-controls">
          <input type="number" min="1" value="${item.quantity}" data-cart-qty="${item.productId}" aria-label="Quantity">
          <button class="button button-secondary" type="button" data-cart-remove="${item.productId}">${t("cart.remove")}</button>
        </div>
      </article>
    `;
  }).join("");
}
