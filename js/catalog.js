let activeFilter = "all";
let activeCatalogSection = "wholesale";

function getUnitPrice(product) {
  return product.unitPrice ? `${product.unitPrice} ${t("currency.gel")}` : t("price.onRequest");
}

function getCartId(product, saleType) {
  return saleType === "retail" ? `retail-${product.id}` : product.id;
}

function renderSpecs(product, saleType) {
  const baseSpecs = `
    <div><dt>${t("spec.dimensions")}</dt><dd>${product.dimensions}</dd></div>
    <div><dt>${t("spec.paperDensity")}</dt><dd>${product.paperDensity}</dd></div>
    <div><dt>${t("spec.coating")}</dt><dd>${product.coating}</dd></div>
  `;

  if (saleType === "retail") {
    return `
      ${baseSpecs}
      <div><dt>${t("spec.unitPrice")}</dt><dd>${getUnitPrice(product)}</dd></div>
    `;
  }

  return `
    ${baseSpecs}
    <div><dt>${t("spec.cartonQuantity")}</dt><dd>${product.cartonQuantity}</dd></div>
    <div><dt>${t("spec.cartonDimensions")}</dt><dd>${product.cartonDimensions}</dd></div>
    <div><dt>${t("spec.cartonWeight")}</dt><dd>${product.cartonWeight}</dd></div>
    <div><dt>${t("spec.cartonPrice")}</dt><dd>${product.cartonPrice} ${t("currency.gel")}</dd></div>
  `;
}

function renderCatalog(products) {
  const container = document.querySelector("[data-products]");
  if (!container) return;

  const visibleProducts = activeFilter === "all" ? products : products.filter((product) => product.group === activeFilter);

  container.innerHTML = visibleProducts.map((product) => {
    const [color, darkColor, logoColor] = cupColors[product.group];
    return `
      <article class="product-card" style="--cup-color: ${color}; --cup-color-dark: ${darkColor}; --cup-logo: ${logoColor}">
        <div class="product-visual" aria-hidden="true">
          <img src="${cupImages[product.group]}" alt="">
        </div>
        <div class="product-content">
          <h3>${getProductName(product)}</h3>
          <div class="product-volume">${product.volume} ml</div>
          <dl class="spec-list">
            ${renderSpecs(product, activeCatalogSection)}
          </dl>
          <button class="button button-primary" type="button" data-add-cart="${getCartId(product, activeCatalogSection)}">${t("cart.add")}</button>
        </div>
      </article>
    `;
  }).join("");
}
