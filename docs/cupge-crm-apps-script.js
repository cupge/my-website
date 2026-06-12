const SPREADSHEET_ID = "1EspRM9cXv2uwmoRiWXcOQIINE3pJl008sVYuBC_FEks";
const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1EspRM9cXv2uwmoRiWXcOQIINE3pJl008sVYuBC_FEks/edit";
const SALES_EMAIL = "sales@cupge.com";
const LEADS_SHEET = "Leads";
const PRODUCTS_SHEET = "Products";
const SETTINGS_SHEET = "Settings";
const DEFAULT_LAST_ORDER_NUMBER = 1000;

function doGet(e) {
  const spreadsheet = getSpreadsheet();
  ensureRequiredSheets(spreadsheet);
  return jsonResponse({
    ok: true,
    spreadsheet: spreadsheet.getName(),
    nextLeadId: String(peekNextLeadId(spreadsheet))
  });
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const result = handleCupGeLead(payload);
    return jsonResponse(result);
  } catch (error) {
    return jsonResponse({
      ok: false,
      error: errorToString(error)
    });
  }
}

function testSetup() {
  const spreadsheet = getSpreadsheet();
  ensureRequiredSheets(spreadsheet);
  return `OK: ${spreadsheet.getName()}`;
}

function handleCupGeLead(payload) {
  validatePayload(payload);
  const createdAt = new Date();
  const spreadsheet = getSpreadsheet();
  ensureRequiredSheets(spreadsheet);
  const leadId = getNextLeadId(spreadsheet);

  try {
    appendLead(spreadsheet, leadId, createdAt, payload);
    appendProducts(spreadsheet, leadId, payload.items || []);
  } catch (error) {
    const sheetError = errorToString(error);
    sendSalesEmail(leadId, createdAt, payload, sheetError);
    throw new Error(`Google Sheets write failed: ${sheetError}`);
  }

  sendSalesEmail(leadId, createdAt, payload, "");

  return {
    ok: true,
    leadId,
    sheetsSaved: true,
    emailed: true
  };
}

function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (idError) {
    console.error("CupGe openById failed", idError && idError.stack ? idError.stack : String(idError));
    return SpreadsheetApp.openByUrl(SPREADSHEET_URL);
  }
}

function ensureRequiredSheets(spreadsheet) {
  ensureSheet(spreadsheet, LEADS_SHEET, [
    "ID", "Дата", "Источник", "Тип", "Имя", "Телефон", "Компания", "Email", "Комментарий", "Сумма", "Валюта", "Статус"
  ]);
  ensureSheet(spreadsheet, PRODUCTS_SHEET, [
    "LeadID", "Товар", "Объем", "UnitType", "Количество", "Цена", "Сумма"
  ]);
  const settings = ensureSheet(spreadsheet, SETTINGS_SHEET, ["Key", "Value"]);
  if (!getSettingRow(settings, "LastOrderNumber")) {
    settings.appendRow(["LastOrderNumber", DEFAULT_LAST_ORDER_NUMBER]);
  }
}

function ensureSheet(spreadsheet, name, headers) {
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }
  return sheet;
}

function getNextLeadId(spreadsheet) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const settings = spreadsheet.getSheetByName(SETTINGS_SHEET);
    let rowIndex = getSettingRow(settings, "LastOrderNumber");
    if (!rowIndex) {
      settings.appendRow(["LastOrderNumber", DEFAULT_LAST_ORDER_NUMBER]);
      rowIndex = settings.getLastRow();
    }
    const current = Number(settings.getRange(rowIndex, 2).getValue()) || DEFAULT_LAST_ORDER_NUMBER;
    const next = current + 1;
    settings.getRange(rowIndex, 2).setValue(next);
    return String(next);
  } finally {
    lock.releaseLock();
  }
}

function peekNextLeadId(spreadsheet) {
  const settings = spreadsheet.getSheetByName(SETTINGS_SHEET);
  const rowIndex = getSettingRow(settings, "LastOrderNumber");
  const current = rowIndex ? Number(settings.getRange(rowIndex, 2).getValue()) : DEFAULT_LAST_ORDER_NUMBER;
  return (current || DEFAULT_LAST_ORDER_NUMBER) + 1;
}

function getSettingRow(settings, key) {
  const values = settings.getDataRange().getValues();
  const index = values.findIndex((row) => row[0] === key);
  return index === -1 ? 0 : index + 1;
}

function appendLead(spreadsheet, leadId, createdAt, payload) {
  const customer = payload.customer || {};
  spreadsheet.getSheetByName(LEADS_SHEET).appendRow([
    leadId,
    createdAt,
    payload.source || "Website",
    payload.type || "Sale",
    customer.name || "",
    customer.phone || "",
    customer.company || "",
    customer.email || "",
    customer.message || "",
    numberValue(payload.total),
    payload.currency || "GEL",
    "New"
  ]);
}

function appendProducts(spreadsheet, leadId, items) {
  if (!items.length) return;
  const rows = items.map((item) => [
    leadId,
    item.productName || item.name || item.productId || "",
    item.volume || "",
    item.unitType || "",
    numberValue(item.quantity),
    numberValue(item.price || item.unitPrice),
    numberValue(item.lineTotal || item.total)
  ]);
  const productsSheet = spreadsheet.getSheetByName(PRODUCTS_SHEET);
  productsSheet
    .getRange(productsSheet.getLastRow() + 1, 1, rows.length, rows[0].length)
    .setValues(rows);
}

function sendSalesEmail(leadId, createdAt, payload, sheetError) {
  const customer = payload.customer || {};
  const items = payload.items || [];
  const lines = items.map((item) => (
    `${item.productName || item.name || item.productId || ""} | ${item.volume || ""} | ${item.unitType || ""} | qty: ${item.quantity || 0} | price: ${item.price || item.unitPrice || 0} | sum: ${item.lineTotal || item.total || 0}`
  )).join("\n");
  const body = [
    `New CupGe website order #${leadId}`,
    "",
    `Date: ${createdAt}`,
    `Source: ${payload.source || "Website"}`,
    `Type: ${payload.type || "Sale"}`,
    `Name: ${customer.name || ""}`,
    `Phone: ${customer.phone || ""}`,
    `Company: ${customer.company || ""}`,
    `Email: ${customer.email || ""}`,
    `Comment: ${customer.message || ""}`,
    `Total: ${payload.total || 0} ${payload.currency || "GEL"}`,
    "",
    "Products:",
    lines || "No products",
    "",
    sheetError ? `Google Sheets write error:\n${sheetError}` : "Google Sheets write: OK"
  ].join("\n");
  MailApp.sendEmail({
    to: SALES_EMAIL,
    subject: `CupGe website order #${leadId}`,
    body
  });
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Missing request payload");
  }
  if (!Array.isArray(payload.items) || !payload.items.length) {
    throw new Error("Order has no products");
  }
  const customer = payload.customer || {};
  if (!customer.name && !customer.phone && !customer.email) {
    throw new Error("Missing customer contact details");
  }
}

function numberValue(value) {
  return Number(String(value || 0).replace(",", ".")) || 0;
}

function errorToString(error) {
  return error && error.stack ? error.stack : String(error);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
