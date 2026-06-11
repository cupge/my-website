async function getProducts() {
  const response = await fetch("/data/products.json");
  return response.json();
}

async function getProductById(id) {
  const products = await getProducts();
  return products.find((product) => product.id === id);
}

async function sendOrder(orderData) {
  // Future phase: POST this payload to a Google Apps Script endpoint connected to Google Sheets.
  console.log("CupGe order request", orderData);
  alert(t("form.sent"));
  return { ok: true };
}
