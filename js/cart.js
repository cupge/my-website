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

function getItemDetails(item) {
  const isRetail = item.productId.startsWith("retail-");
  const baseId = isRetail ? item.productId.replace("retail-", "") : item.productId;
  const product = cachedProducts.find((entry) => entry.id === baseId);
  const rawPrice = isRetail ? product?.unitPrice : product?.cartonPrice;
  const price = Number(String(rawPrice || 0).replace(",", "."));
  const quantity = Math.max(1, Number(item.quantity) || 1);
  return {
    isRetail,
    product,
    quantity,
    lineTotal: price * quantity
  };
}

function formatCartPrice(value) {
  const normalized = Math.round((Number(value) || 0) * 100) / 100;
  return `${normalized.toFixed(2).replace(".", ",")} ${t("currency.gel")}`;
}

function renderCart() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = count;
  });

  const container = document.querySelector("[data-cart-items]");
  const totalContainer = document.querySelector("[data-cart-total]");
  if (!container) return;
  if (!cart.length) {
    container.innerHTML = `<p>${t("cart.empty")}</p>`;
    if (totalContainer) {
      totalContainer.hidden = true;
      totalContainer.innerHTML = "";
    }
    return;
  }

  container.innerHTML = cart.map((item) => {
    const { isRetail, product, lineTotal } = getItemDetails(item);
    const name = product ? `${getProductName(product)}${isRetail ? ` - ${t("catalog.retail")}` : ""}` : item.productId;
    return `
      <article class="cart-item">
        <strong>${name}</strong>
        <div class="cart-item-controls">
          <input type="number" min="1" value="${item.quantity}" data-cart-qty="${item.productId}" aria-label="Quantity">
          <span class="cart-unit">${isRetail ? t("cart.pieces") : t("cart.boxes")}</span>
          <button class="button button-secondary" type="button" data-cart-remove="${item.productId}">${t("cart.remove")}</button>
          <span class="cart-line-total">${formatCartPrice(lineTotal)}</span>
        </div>
      </article>
    `;
  }).join("");

  if (totalContainer) {
    const total = cart.reduce((sum, item) => sum + getItemDetails(item).lineTotal, 0);
    totalContainer.hidden = false;
    totalContainer.innerHTML = `
      <span>${t("cart.total")}</span>
      <strong>${formatCartPrice(total)}</strong>
    `;
  }
}
