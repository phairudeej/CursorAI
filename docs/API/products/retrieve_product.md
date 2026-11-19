**Base Endpoint:** `http://localhost:3001`

**Validation / business rules**

- `200` เมื่อพบสินค้า
- `404` เมื่อไม่มีสินค้าตาม `id`
- ทุกครั้งที่เรียก operation นี้ให้เพิ่ม `viewCount` ของสินค้านั้นทีละ 1 แล้วส่งค่าหลังเพิ่มกลับไป ค่านี้ใช้เรียง `views` ในรายการสินค้า
- รูปใน `images` เรียงตาม `sortOrder` และตำแหน่ง 0 คือภาพปก
- `sellerAvatar` เป็น null ได้

---

RETRIEVE_PRODUCT: หน้ารายละเอียดสินค้าใช้โหลดแกลเลอรี สเปก และข้อมูลผู้ขาย

Method: GET
Path: `/api/products/:id`

Path Params:

| Field | Type | Description |
| --- | --- | --- |
| id | number | รหัสสินค้า |

Query Params: -

Request Body: -

Response Body:

ใช้ **Record Object (Product)** ชุดเดียวกับ `RETRIEVE_PRODUCTS` รวม `images`, `vehicleType`, `brand`, `model`

| Field | Type | Description |
| --- | --- | --- |
| id | number | รหัสสินค้า |
| name | string | ชื่อรถ |
| description | string \| null | คำอธิบาย แสดงเมื่อมีค่า |
| price | number | ราคาเป็นจำนวนเต็มบาท |
| year | number \| null | ปีที่ผลิต |
| vehicleType | VehicleType \| null | ประเภท สำหรับสเปก |
| brand | Brand \| null | ยี่ห้อ |
| model | Model \| null | รุ่น |
| sellerName | string \| null | ชื่อผู้ขาย |
| sellerPhone | string \| null | เบอร์โทร สำหรับลิงก์ `tel:` |
| sellerLineUrl | string \| null | ลิงก์ไลน์ สำหรับปุ่มแอดไลน์ |
| sellerAvatar | string \| null | พาธรูปโปรไฟล์ที่ขึ้นต้นด้วย `/uploads/` |
| viewCount | number | จำนวนครั้งที่เปิดหน้ารายละเอียด รวมครั้งนี้ |
| createdAt | string | เวลาที่สร้างรายการ รูปแบบ ISO-8601 |
| images | ProductImage[] | รูปทั้งหมดสำหรับแกลเลอรี ตำแหน่ง 0 คือภาพปก |

**Record Object (ProductImage)**

| Field | Type | Description |
| --- | --- | --- |
| id | number | รหัสรูป |
| url | string | พาธรูปที่ขึ้นต้นด้วย `/uploads/` |
| sortOrder | number | ลำดับรูป ค่า 0 คือภาพปก |

**Record Object (VehicleType)**

| Field | Type | Description |
| --- | --- | --- |
| id | number | รหัสประเภท |
| name | string | ชื่อประเภท |

**Record Object (Brand)**

| Field | Type | Description |
| --- | --- | --- |
| id | number | รหัสยี่ห้อ |
| name | string | ชื่อยี่ห้อ |

**Record Object (Model)**

| Field | Type | Description |
| --- | --- | --- |
| id | number | รหัสรุ่น |
| brandId | number | รหัสยี่ห้อของรุ่นนี้ |
| name | string | ชื่อรุ่น |

Error Handling:

| HTTP | When |
| --- | --- |
| 404 | ไม่พบสินค้า ตัวตอบกลับเป็น `{ error, fields }` และ `fields` ว่าง |
