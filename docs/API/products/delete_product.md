**Base Endpoint:** `http://localhost:3001`

**Validation / business rules**

- `204` เมื่อลบสำเร็จ ไม่มีตัวตอบกลับ
- `404` เมื่อไม่มีสินค้าตาม `id` ตัวตอบกลับเป็น `{ error, fields }` และ `fields` ว่าง
- ลบแล้วให้ลบไฟล์รูปสินค้าและไฟล์รูปโปรไฟล์ของรายการนั้นออกจากดิสก์

---

DELETE_PRODUCT: หน้า admin ใช้ลบสินค้าจากตารางจัดการ

Method: DELETE
Path: `/api/products/:id`

Path Params:

| Field | Type | Description |
| --- | --- | --- |
| id | number | รหัสสินค้าที่ลบ |

Query Params: -

Request Body: -

Response Body: -

Error Handling:

| HTTP | When |
| --- | --- |
| 404 | ไม่พบสินค้า |
