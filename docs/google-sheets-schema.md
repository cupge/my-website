# Google Sheets Structure

Use one spreadsheet for the first production version.

## Sheet: Products

| Column | Example |
|---|---|
| id | white-150 |
| category | cups |
| group | white |
| name_ka | თეთრი ქაღალდის ჭიქა |
| name_ru | Белый бумажный стакан |
| name_en | White Paper Cup |
| volume | 150 |
| dimensions | 63/45/60 mm |
| paperDensity | 180 gsm |
| coating | Single-side PE coating |
| cartonQuantity | 2000 pcs |
| cartonDimensions | 430/360/530 mm |
| cartonWeight | 9 kg |
| available | TRUE |

## Sheet: Orders

| Column | Example |
|---|---|
| order_id | ORD-20260602-0001 |
| created_at | 2026-06-02T13:00:00Z |
| name | Customer name |
| phone | +995... |
| email | info@example.com |
| message | Need quote |
| language | ka |
| status | new |

## Sheet: OrderItems

| Column | Example |
|---|---|
| order_id | ORD-20260602-0001 |
| product_id | white-150 |
| quantity | 2 |

## Apps Script Payload

Future `sendOrder()` can POST this shape:

```json
{
  "customer": {
    "name": "Customer name",
    "phone": "+995...",
    "email": "info@example.com",
    "message": "Need quote"
  },
  "items": [
    {
      "productId": "white-150",
      "quantity": 2
    }
  ],
  "language": "ka"
}
```
