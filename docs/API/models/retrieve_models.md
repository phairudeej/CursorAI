**Base Endpoint:** `http://localhost:3001`

**Validation / business rules**

- `200` เมื่อดึงรายการสำเร็จ ถ้ายี่ห้อนั้นไม่มีรุ่น `data` เป็นรายการว่าง
- `400` เมื่อไม่ส่ง `brandId` หรือ `brandId` ไม่ใช่จำนวนเต็มบวก ตัวตอบกลับเป็น `{ error, fields }` และ `fields` มี `brandId`
- รุ่นผูกกับยี่ห้อเดียว ใช้เติมช่องรุ่นในตัวกรองและฟอร์มหลังเลือกยี่ห้อ
- ลบตัวกรองยี่ห้อแล้วไคลเอนต์ลบตัวกรองรุ่นเอง
- สเปกไม่มี operation สำหรับสร้าง แก้ หรือลบรุ่น
- เรียงตาม `name` จากน้อยไปมาก ไม่แบ่งหน้า

---

RETRIEVE_MODELS: ตัวกรองหน้าแรกและฟอร์ม admin ใช้โหลดรุ่นของยี่ห้อที่เลือก

Method: GET
Path: `/api/models`

Path Params: -

Query Params:

| Field | Type | Description | Default |
| --- | --- | --- | --- |
| brandId | number | รหัสยี่ห้อที่ต้องการดูรุ่น | - |

Request Body: -

Response Body:

| Field | Type | Description |
| --- | --- | --- |
| data | Model[] | รุ่นของยี่ห้อนั้น |

**Record Object (Model)**

| Field | Type | Description |
| --- | --- | --- |
| id | number | รหัสรุ่น ส่งเป็น `modelId` ตอนกรองหรือบันทึกสินค้า |
| brandId | number | รหัสยี่ห้อของรุ่นนี้ |
| name | string | ชื่อรุ่นที่แสดงบนการ์ด รายละเอียด ตัวกรอง และฟอร์ม |

Error Handling:

| HTTP | When |
| --- | --- |
| 400 | ไม่มี `brandId` หรือค่าไม่ใช่จำนวนเต็มบวก |
