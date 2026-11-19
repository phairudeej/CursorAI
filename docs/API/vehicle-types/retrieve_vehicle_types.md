**Base Endpoint:** `http://localhost:3001`

**Validation / business rules**

- `200` เมื่อดึงรายการสำเร็จ รวมกรณียังไม่มีประเภท (`data` เป็นรายการว่าง)
- ใช้เติมตัวเลือกประเภทในตัวกรองหน้าแรกและฟอร์ม admin
- สเปกระบุให้เลือกประเภทที่มีอยู่ ไม่มี operation สำหรับสร้าง แก้ หรือลบประเภท
- เรียงตาม `name` จากน้อยไปมาก ไม่แบ่งหน้า

---

RETRIEVE_VEHICLE_TYPES: ตัวกรองหน้าแรกและฟอร์ม admin ใช้โหลดตัวเลือกประเภท

Method: GET
Path: `/api/vehicle-types`

Path Params: -

Query Params: -

Request Body: -

Response Body:

| Field | Type | Description |
| --- | --- | --- |
| data | VehicleType[] | ประเภททั้งหมด |

**Record Object (VehicleType)**

| Field | Type | Description |
| --- | --- | --- |
| id | number | รหัสประเภท ส่งเป็น `vehicleTypeId` ตอนกรองหรือบันทึกสินค้า |
| name | string | ชื่อประเภทที่แสดงในตัวกรอง ฟอร์ม และสเปก |

Error Handling:

| HTTP | When |
| --- | --- |
| - | ไม่มีกรณีผิดพลาดที่สเปกกำหนด |
