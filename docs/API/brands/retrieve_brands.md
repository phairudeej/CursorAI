**Base Endpoint:** `http://localhost:3001`

**Validation / business rules**

- `200` เมื่อดึงรายการสำเร็จ รวมกรณียังไม่มียี่ห้อ (`data` เป็นรายการว่าง)
- ใช้เติมตัวเลือกยี่ห้อในตัวกรองหน้าแรกและฟอร์ม admin
- สเปกระบุให้เลือกยี่ห้อที่มีอยู่ ไม่มี operation สำหรับสร้าง แก้ หรือลบยี่ห้อ
- เรียงตาม `name` จากน้อยไปมาก ไม่แบ่งหน้า
- เมื่อผู้ใช้เปลี่ยนยี่ห้อ ฟอร์มล้างรุ่นที่เลือกไว้ทางไคลเอนต์ แล้วโหลดรุ่นจาก `RETRIEVE_MODELS`

---

RETRIEVE_BRANDS: ตัวกรองหน้าแรกและฟอร์ม admin ใช้โหลดตัวเลือกยี่ห้อ

Method: GET
Path: `/api/brands`

Path Params: -

Query Params: -

Request Body: -

Response Body:

| Field | Type | Description |
| --- | --- | --- |
| data | Brand[] | ยี่ห้อทั้งหมด |

**Record Object (Brand)**

| Field | Type | Description |
| --- | --- | --- |
| id | number | รหัสยี่ห้อ ส่งเป็น `brandId` ตอนกรองหรือบันทึกสินค้า |
| name | string | ชื่อยี่ห้อที่แสดงบนการ์ด รายละเอียด ตัวกรอง และฟอร์ม |

Error Handling:

| HTTP | When |
| --- | --- |
| - | ไม่มีกรณีผิดพลาดที่สเปกกำหนด |
