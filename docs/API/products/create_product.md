**Base Endpoint:** `http://localhost:3001`

**Validation / business rules**

- `201` เมื่อสร้างสินค้าสำเร็จ
- `400` เมื่อข้อมูลไม่ผ่านการตรวจ ตัวตอบกลับเป็น `{ error, fields }` โดย `fields` เป็นชื่อฟิลด์ที่ผิด
- `409` เมื่อ `name` ซ้ำกับสินค้าที่มีอยู่
- บังคับเฉพาะ `name`, `price` และรูปอย่างน้อย 1 รูป
- `price` เป็นจำนวนเต็มบาท ตั้งแต่ 0 ถึง 99,999,999
- ชื่อหรือคำอธิบายที่มีคีย์เวิร์ดผิดกฎหมายไม่ผ่านการตรวจ คำที่ห้ามอยู่ที่ตัวตรวจสอบของเซิร์ฟเวอร์
- รูปสินค้าและรูปโปรไฟล์รับเฉพาะ `.png` และ `.jpg` ผ่าน multer
- รูปสินค้าอย่างน้อย 1 รูป และไม่เกิน 4 รูป
- ส่ง `imageOrder` กับ `coverIndex` ทุกครั้ง `coverIndex` ต้องเป็น 0 และรายการแรกของ `imageOrder` คือภาพปก
- ถ้ามี `modelId` ต้องมี `brandId` และรุ่นนั้นต้องสังกัดยี่ห้อนั้น
- `sellerAvatar` ไม่ส่งได้ ผลลัพธ์เป็น null
- `viewCount` เริ่มที่ 0 ผู้เรียกกำหนดค่านี้ไม่ได้

---

CREATE_PRODUCT: หน้า admin ใช้สร้างรายการใหม่จาก modal

Method: POST
Path: `/api/products`

Path Params: -

Query Params: -

Request Body (`multipart/form-data`):

| Field | Type | Description |
| --- | --- | --- |
| name | string | ชื่อรถ ห้ามซ้ำ |
| description | string | คำอธิบาย ไม่ส่งหรือค่าว่างแล้วเก็บเป็น null |
| price | number | ราคาเป็นจำนวนเต็มบาท |
| vehicleTypeId | number | รหัสประเภท ไม่ส่งแล้วเก็บเป็น null |
| brandId | number | รหัสยี่ห้อ ไม่ส่งแล้วเก็บเป็น null |
| modelId | number | รหัสรุ่น ไม่ส่งแล้วเก็บเป็น null |
| year | number | ปีที่ผลิต ไม่ส่งแล้วเก็บเป็น null |
| sellerName | string | ชื่อผู้ขาย |
| sellerPhone | string | เบอร์โทร |
| sellerLineUrl | string | ลิงก์ไลน์ |
| sellerAvatar | File | รูปโปรไฟล์ `.png` หรือ `.jpg` ไม่บังคับ |
| images | File | รูปสินค้า `.png` หรือ `.jpg` ส่งได้ 1 ถึง 4 ไฟล์ ใช้ชื่อฟิลด์เดิมซ้ำได้ |
| imageOrder | string | JSON array ของดัชนีไฟล์ใน `images` เช่น `[0,1,2]` ลำดับนี้คือลำดับที่บันทึก |
| coverIndex | number | ต้องเป็น 0 |

Response Body:

เรคคอร์ด Product หลังบันทึก ใช้ฟิลด์ชุดเดียวกับ `RETRIEVE_PRODUCT` `images[0]` คือภาพปก และ `viewCount` เป็น 0

Error Handling:

| HTTP | When |
| --- | --- |
| 400 | ชื่อหรือราคาว่าง, ราคาติดลบหรือเกิน 99,999,999, คีย์เวิร์ดผิดกฎหมาย, รูปไม่ใช่ `.png`/`.jpg`, รูปน้อยกว่า 1 หรือมากกว่า 4, `coverIndex` ไม่ใช่ 0, `imageOrder` ไม่ครบหรือไม่ตรงกับไฟล์, รุ่นไม่สังกัดยี่ห้อ, หรือรหัสประเภท/ยี่ห้อ/รุ่นไม่มีอยู่ |
| 409 | ชื่อสินค้าซ้ำ `fields` มี `name` |
