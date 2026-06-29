# 📦 Catalog data note (proof-based)

> Why the `catalog` module reads what it reads. Verified live against the
> `oracle12` container (schema YSPOS23) as user `MOTECH_RO`, 2026-06-29.

## The canonical item tables are NOT present locally

`docs/DATA_MODEL.md §2.3` maps `Item` to `IAS_ITM_MST` + `IAS_ITM_DTL` +
`IAS_ITEM_PRICE`. In the current local dump these are **synonyms**, not tables:

```sql
SELECT synonym_name, table_owner, table_name
FROM   all_synonyms
WHERE  owner='YSPOS23'
  AND  synonym_name IN ('IAS_ITM_MST','IAS_ITM_DTL','ITEM_MOVEMENT');
-- IAS_ITM_MST   → IAS202623.IAS_ITM_MST
-- IAS_ITM_DTL   → IAS202623.IAS_ITM_DTL
-- ITEM_MOVEMENT → IAS202623.ITEM_MOVEMENT
```

The target schema **`IAS202623` does not exist** in this container:

```sql
SELECT COUNT(*) FROM all_objects WHERE owner='IAS202623';   -- 0
```

Consequently the catalog VIEWS that depend on those synonyms are **INVALID**
and cannot be queried (`ORA-04063`):
`IAS_V_ITM_UNT`, `IAS_ITM_DATA_VW`, `IAS_V_ITM_UNT_BARCODE`, `IAS_V_ITM_AVL_QTY`.

`IAS_ITEM_PRICE` / `IAS_POS_ITM_PRICE` do not exist as objects at all.

## What DOES exist with real data (and is what we read)

| object | type | rows | what we use |
|--------|------|------|-------------|
| `MV_ITEM_AVL_QTY` | materialized view | 1,280 distinct `I_CODE`, ~2,004 rows | item code + `W_CODE` + `AVL_QTY` (quantity authority) |
| `IAS_POS_BILL_DTL` | table | 41,945 sale lines (1,079 distinct items, 1,133 barcodes) | last-observed `I_PRICE`, `BARCODE`, `ITM_UNT`, `P_SIZE` per code |

## How the `catalog` module reconstructs an item

`OracleItemRepository` joins the **available-qty authority** with the
**last-observed sale attributes** (newest `BILL_NO/BILL_SRL` per `I_CODE`):

- `GET /api/v1/items` — list/search over `MV_ITEM_AVL_QTY.I_CODE`, ascending,
  cursor-paginated; search matches item code or barcode.
- `GET /api/v1/items/:code` — item + last price + per-warehouse `AVL_QTY` + total.
- `GET /api/v1/items/barcode/:bc` — resolves barcode → code via sale history, then detail.

### Documented limitations
- **Item name is `null`** — names live only in the absent `IAS202623` master.
  The DTO keeps the `name` field for forward-compatibility.
- **Price = last selling price observed in real sales**, not the live price-list
  price (`IAS_ITEM_PRICE` unavailable). Faithful to actual transactions.
- When `IAS202623` becomes reachable, swap the adapter to read the real master
  views — the port/DTO shape already accommodates `name` and price levels.

### Live proof (2026-06-29)
```
GET /api/v1/items?limit=3  →  1010010004 (unit حبه, price 7800),
                              1010010008 (قطمه, 3800),
                              1010010013 (كيس, barcode 6287002861172, 850)
GET /api/v1/items/1010010013       → price 850, stock [{W_CODE 2, qty -2}]
GET /api/v1/items/barcode/6287002861172 → resolves to code 1010010013
```
