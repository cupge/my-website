// Paste the deployed Google Apps Script Web App URL here.
const CRM_ENDPOINT = "https://script.google.com/macros/s/AKfycbxkda-_6SmL2hntkPS7InpllPbVoQTgxwzlZwpHonJ2TVctyLw8w365WGDZDibY92U_/exec";

async function getProducts() {
  const response = await fetch("/data/products.json?v=20260612-retail-prices");
  return response.json();
}

async function getProductById(id) {
  const products = await getProducts();
  return products.find((product) => product.id === id);
}

function parsePrice(value) {
  return Number(String(value || 0).replace(",", ".")) || 0;
}

function buildCrmPayload(orderData) {
  const cartItems = orderData.items || [];
  const products = orderData.products || [];
  const crmItems = cartItems.map((item) => {
    const isRetail = item.productId.startsWith("retail-");
    const productId = isRetail ? item.productId.replace("retail-", "") : item.productId;
    const product = products.find((entry) => entry.id === productId);
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const price = isRetail ? parsePrice(product?.unitPrice) : parsePrice(product?.cartonPrice);
    return {
      productId,
      productName: product ? getProductName(product) : productId,
      volume: product?.volume ? `${product.volume} ml` : "",
      unitType: isRetail ? "retail" : "box",
      quantity,
      price,
      lineTotal: Math.round(price * quantity * 100) / 100
    };
  });
  const total = crmItems.reduce((sum, item) => sum + item.lineTotal, 0);
  return {
    source: "Website",
    type: "Sale",
    currency: "GEL",
    language: getCurrentLang(),
    pageUrl: window.location.href,
    customer: orderData.customer,
    items: crmItems,
    total: Math.round(total * 100) / 100
  };
}

async function sendOrder(orderData) {
  const payload = buildCrmPayload(orderData);
  if (!payload.items.length) {
    throw new Error("Cart is empty");
  }
  if (!CRM_ENDPOINT) {
    console.error("CupGe CRM endpoint is not configured.", payload);
    throw new Error("CRM endpoint is not configured");
  }

  const result = await sendOrderWithJsonp(payload);
  if (!result.ok) {
    throw new Error(result.error || "CRM request failed");
  }
  if (!result.leadId) {
    throw new Error("CRM response did not include an order number");
  }
  return result;
}

function sendOrderWithJsonp(payload) {
  return new Promise((resolve, reject) => {
    const callbackName = `cupgeCrmCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const url = new URL(CRM_ENDPOINT);
    let timeoutId;

    window[callbackName] = (result) => {
      cleanup();
      resolve(result || {});
    };

    function cleanup() {
      window.clearTimeout(timeoutId);
      delete window[callbackName];
      script.remove();
    }

    script.onerror = () => {
      cleanup();
      reject(new Error("CRM request failed"));
    };

    timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("CRM request timed out"));
    }, 20000);

    url.searchParams.set("callback", callbackName);
    url.searchParams.set("payload", JSON.stringify(payload));
    script.src = url.toString();
    document.head.appendChild(script);
  });
}
