// Paste the deployed Google Apps Script Web App URL here.
const CRM_ENDPOINT = "https://script.google.com/macros/s/AKfycbxLK0q-tbBrO7NgWhN7WxZ_EhuoVMrvCOICmIidxtz4JxawJIh44nlf4cGi464mODrM/exec";

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
  const clientLeadId = String(Date.now());
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
    clientLeadId,
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

  try {
    const response = await fetch(CRM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "CRM request failed");
    }
    return result;
  } catch (error) {
    console.warn("CupGe CRM response was not readable. Showing local order id.", error);
    return {
      ok: true,
      leadId: payload.clientLeadId,
      responsePending: true
    };
  }
}
