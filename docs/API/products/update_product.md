**Base Endpoint:** `http://localhost:3001`

**Validation / business rules**

- `200` เมื่อแก้ไขสำเร็จ
- `400` เมื่อข้อมูลไม่ผ่านการตรวจ ตัวตอบกลับเป็น `{ error, fields }`
- `404` เมื่อไม่มีสินค้าตาม `id`
- `409` เมื่อ `name` ซ้ำกับสินค้าอื่น ไม่ชนกับชื่อเดิมของสินค้านี้
- กฎชื่อ ราคา คีย์เวิร์ดผิดกฎหมาย จำนวนรูป นามสกุลไฟล์ และความสัมพันธ์ยี่ห้อกับรุ่น ใช้ชุดเดียวกับ `CREATE_PRODUCT`
- หลังบันทึกภาพปกอยู่ที่ `sortOrder` 0 เสมอ `coverIndex` ที่ส่งมาต้องเป็น 0
- รูปสินค้าที่ไม่อยู่ใน `imageOrder` ถูกลบออกจากดิสก์
- ส่งไฟล์ `sellerAvatar` ใหม่แล้วให้แทนที่รูปเดิมและลบไฟล์เก่า ส่งค่าว่างเพื่อล้างรูปโปรไฟล์เป็น null ไม่ส่งฟิลด์นี้เพื่อคงรูปเดิม
- ลบสินค้าไม่ได้จาก operation นี้

---

UPDATE_PRODUCT: หน้า admin ใช้บันทึกการแก้ไขสินค้าจาก modal

Method: PUT
Path: `/api/products/:id`

Path Params:

| Field | Type | Description |
| --- | --- | --- |
| id | number | รหัสสินค้าที่แก้ |

Query Params: -

Request Body (`multipart/form-data`):

| Field | Type | Description |
| --- | --- | --- |
| name | string | ชื่อรถ ห้ามซ้ำกับสินค้าอื่น |
| description | string | คำอธิบาย ไม่ส่งหรือค่าว่างแล้วเก็บเป็น null |
| price | number | ราคาเป็นจำนวนเต็มบาท |
| vehicleTypeId | number | รหัสประเภท ไม่ส่งแล้วเก็บเป็น null |
| brandId | number | รหัสยี่ห้อ ไม่ส่งแล้วเก็บเป็น null และต้องสอดคล้องกับรุ่น |
| modelId | number | รหัสรุ่น ไม่ส่งแล้วเก็บเป็น null |
| year | number | ปีที่ผลิต ไม่ส่งแล้วเก็บเป็น null |
| sellerName | string | ชื่อผู้ขาย |
| sellerPhone | string | เบอร์โทร |
| sellerLineUrl | string | ลิงก์ไลน์ |
| sellerAvatar | File | รูปโปรไฟล์ใหม่ `.png` หรือ `.jpg` |
| images | File | ไฟล์รูปใหม่ `.png` หรือ `.jpg` ที่อ้างใน `imageOrder` |
| imageOrder | string | JSON array ของลำดับสุดท้าย แต่ละสมาชิกเป็น `{"id": number}` สำหรับรูปเดิม หรือ `{"fileIndex": number}` สำหรับไฟล์ใหม่ใน `images` |
| coverIndex | number | ต้องเป็น 0 สมาชิกแรกของ `imageOrder` คือภาพปก |

จำนวนรูปหลังรวมรูปเดิมที่คงไว้กับไฟล์ใหม่ต้องอยู่ระหว่าง 1 ถึง 4 ไฟล์ที่อัปโหลดต้องถูกอ้างใน `imageOrder` ครบทุกไฟล์ และรหัสรูปเดิมต้องเป็นของสินค้านี้

Response Body:

เรคคอร์ด Product หลังบันทึก ใช้ฟิลด์ชุดเดียวกับ `RETRIEVE_PRODUCT`

Error Handling:

| HTTP | When |
| --- | --- |
| 400 | ข้อมูลสินค้า รูป `imageOrder` หรือ `coverIndex` ไม่ผ่านกฎเดียวกับตอนสร้าง หรือรูปเดิมไม่อยู่ในสินค้านี้ |
| 404 | ไม่พบสินค้า |
| 409 | ชื่อซ้ำกับสินค้าอื่น `fields` มี `name` |
