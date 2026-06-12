# CupGe CRM Google Sheets Integration

Spreadsheet ID:

```text
1EspRM9cXv2uwmoRiWXcOQIINE3pJl008sVYuBC_FEks
```

## Sheets

### Leads

```text
ID | Дата | Источник | Тип | Имя | Телефон | Компания | Email | Комментарий | Сумма | Валюта | Статус
```

One row per website request.

### Products

```text
LeadID | Товар | Объем | UnitType | Количество | Цена | Сумма
```

One row per cart item. `UnitType` is generated automatically:

- `box` for wholesale carton orders
- `retail` for retail piece orders

### Settings

Created automatically by Apps Script if missing.

```text
Key | Value
LastOrderNumber | 1000
```

## Deployment

1. Open the Google Spreadsheet.
2. Go to `Extensions` -> `Apps Script`.
3. Paste the contents of [cupge-crm-apps-script.js](cupge-crm-apps-script.js).
4. Deploy as `Web app`.
5. Execute as: `Me`.
6. Who has access: `Anyone`.
7. Copy the Web App URL.
8. Paste the URL into `CRM_ENDPOINT` in `js/api.js`.

The website sends product data dynamically from the cart and product catalog. New product types, new volumes, and future categories do not require Apps Script changes.
