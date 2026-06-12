async function initApp() {
  cachedProducts = await getProducts();
  applyTranslations();
  renderCatalog(cachedProducts);
  renderCart();
  renderYoutubePreview();
  await renderSocialLinks();

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });

  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("active", item === button));
      renderCatalog(cachedProducts);
    });
  });

  document.querySelectorAll("[data-catalog-section]").forEach((button) => {
    button.addEventListener("click", () => {
      activeCatalogSection = button.dataset.catalogSection;
      document.querySelectorAll("[data-catalog-section]").forEach((item) => item.classList.toggle("active", item === button));
      renderCatalog(cachedProducts);
    });
  });

  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add-cart]");
    if (addButton) addToCart(addButton.dataset.addCart);

    const removeButton = event.target.closest("[data-cart-remove]");
    if (removeButton) removeFromCart(removeButton.dataset.cartRemove);
  });

  document.addEventListener("change", (event) => {
    const input = event.target.closest("[data-cart-qty]");
    if (input) updateCartQuantity(input.dataset.cartQty, input.value);
  });

  document.querySelector("[data-cart-open]")?.addEventListener("click", () => {
    document.querySelector("[data-cart-drawer]")?.classList.add("open");
  });

  document.querySelector("[data-cart-close]")?.addEventListener("click", () => {
    document.querySelector("[data-cart-drawer]")?.classList.remove("open");
  });

  document.querySelector("[data-cart-clear]")?.addEventListener("click", clearCart);
  document.querySelector("[data-cart-request]")?.addEventListener("click", () => {
    document.querySelector("[data-cart-drawer]")?.classList.remove("open");
    document.querySelector("#contacts")?.scrollIntoView({ behavior: "smooth" });
  });
  document.querySelector("[data-youtube-open]")?.addEventListener("click", openYoutubeChannel);
  document.querySelector("[data-order-modal-ok]")?.addEventListener("click", closeOrderSuccess);
  document.querySelector("[data-order-modal]")?.addEventListener("click", (event) => {
    if (event.target.matches("[data-order-modal]")) closeOrderSuccess();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeOrderSuccess();
  });

  document.querySelector("[data-order-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const result = await sendOrder({ customer: formData, items: getCart(), products: cachedProducts });
      clearCart();
      event.currentTarget.reset();
      const message = t("form.sent").replace("{id}", result.leadId);
      showCartToast(message);
      showOrderSuccess(message);
    } catch (error) {
      console.error("CupGe order submit failed", error);
      showCartToast(t("form.error"));
    }
  });

  window.addEventListener("cupge:language-changed", () => {
    renderCatalog(cachedProducts);
    renderCart();
  });
}

initApp();

function showOrderSuccess(message) {
  const modal = document.querySelector("[data-order-modal]");
  const messageNode = document.querySelector("[data-order-modal-message]");
  const okButton = document.querySelector("[data-order-modal-ok]");
  if (!modal || !messageNode || !okButton) {
    showCartToast(message);
    return;
  }
  messageNode.textContent = message;
  modal.hidden = false;
  modal.classList.add("open");
  okButton.focus();
}

function closeOrderSuccess() {
  const modal = document.querySelector("[data-order-modal]");
  if (!modal) return;
  modal.classList.remove("open");
  modal.hidden = true;
}
