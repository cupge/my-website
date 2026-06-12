const SPREADSHEET_ID = "1EspRM9cXv2uwmoRiWXcOQIINE3pJI008sVYuBC_FEks";
const SALES_EMAIL = "sales@cupge.com";
const LEADS_SHEET = "Leads";
const PRODUCTS_SHEET = "Products";
const SETTINGS_SHEET = "Settings";
const DEFAULT_LAST_ORDER_NUMBER = 1024;

function doPost(e) {
  const payload = JSON.parse(e.postData.contents || "{}");
  const result = handleCupGeLead(payload);
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleCupGeLead(payload) {
  let leadId = String(Date.now());
  let sheetError = "";
  let emailError = "";
  const createdAt = new Date();

  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    ensureRequiredSheets(spreadsheet);
    leadId = getNextLeadId(spreadsheet);
    appendLead(spreadsheet, leadId, createdAt, payload);
    appendProducts(spreadsheet, leadId, payload.items || []);
  } catch (error) {
    sheetError = error && error.stack ? error.stack : String(error);
    console.error("CupGe Sheets write failed", sheetError);
  }

  try {
    sendSalesEmail(leadId, createdAt, payload, sheetError);
  } catch (error) {
    emailError = error && error.stack ? error.stack : String(error);
    console.error("CupGe email send failed", emailError);
  }

  if (emailError) {
    throw new Error(emailError);
  }

  return {
    ok: true,
    leadId,
    sheetsSaved: !sheetError,
    sheetError
  };
}

function ensureRequiredSheets(spreadsheet) {
  ensureSheet(spreadsheet, LEADS_SHEET, [
    "ID", "Дата", "Источник", "Тип", "Имя", "Телефон", "Компания", "Email", "Комментарий", "Сумма", "Валюта", "Статус"
  ]);
  ensureSheet(spreadsheet, PRODUCTS_SHEET, [
    "LeadID", "Товар", "Объем", "UnitType", "Количество", "Цена", "Сумма"
  ]);
  const settings = ensureSheet(spreadsheet, SETTINGS_SHEET, ["Key", "Value"]);
  if (settings.getLastRow() < 2) {
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
    const values = settings.getDataRange().getValues();
    let rowIndex = values.findIndex((row) => row[0] === "LastOrderNumber");
    if (rowIndex === -1) {
      settings.appendRow(["LastOrderNumber", DEFAULT_LAST_ORDER_NUMBER]);
      rowIndex = settings.getLastRow() - 1;
    }
    const current = Number(settings.getRange(rowIndex + 1, 2).getValue()) || DEFAULT_LAST_ORDER_NUMBER;
    const next = current + 1;
    settings.getRange(rowIndex + 1, 2).setValue(next);
    return String(next);
  } finally {
    lock.releaseLock();
  }
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
    item.productName || item.productId || "",
    item.volume || "",
    item.unitType || "",
    numberValue(item.quantity),
    numberValue(item.price),
    numberValue(item.lineTotal)
  ]);
  spreadsheet.getSheetByName(PRODUCTS_SHEET)
    .getRange(spreadsheet.getSheetByName(PRODUCTS_SHEET).getLastRow() + 1, 1, rows.length, rows[0].length)
    .setValues(rows);
}

function sendSalesEmail(leadId, createdAt, payload, sheetError) {
  const customer = payload.customer || {};
  const items = payload.items || [];
  const lines = items.map((item) => (
    `${item.productName || item.productId || ""} | ${item.volume || ""} | ${item.unitType || ""} | qty: ${item.quantity || 0} | price: ${item.price || 0} | sum: ${item.lineTotal || 0}`
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

function numberValue(value) {
  return Number(String(value || 0).replace(",", ".")) || 0;
}
