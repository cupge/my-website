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

  document.querySelector("[data-order-form]")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.currentTarget).entries());
    await sendOrder({ customer: formData, items: getCart() });
  });

  window.addEventListener("cupge:language-changed", () => {
    renderCatalog(cachedProducts);
    renderCart();
  });
}

initApp();
