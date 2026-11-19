**Base Endpoint:** `http://localhost:3001`

**Validation / business rules**

- `200` เมื่อดึงรายการสำเร็จ รวมกรณีไม่มีสินค้าที่ตรงเงื่อนไข (`data` เป็นรายการว่าง)
- `400` เมื่อ query ใช้ไม่ได้: `page` หรือ `pageSize` น้อยกว่า 1, `sort` ไม่อยู่ในชุดที่รองรับ, ราคาหรือปีไม่ใช่จำนวน, `minPrice` มากกว่า `maxPrice`, หรือ `minYear` มากกว่า `maxYear`
- กรองได้หลายเงื่อนไขพร้อมกัน ทุกเงื่อนไขที่ส่งมาใช้ร่วมกัน
- `sort` ที่รองรับ: `newest` (ค่าเริ่มต้น), `views`, `price`, `price_desc`, `oldest` (`oldest` มีใน API แต่หน้าเว็บไม่แสดงตัวเลือกนี้)
- `pageSize` ค่าเริ่มต้น `10` หน้าแรกส่ง `12` และหน้า admin ส่ง `10`
- เปลี่ยนตัวกรองแล้วไคลเอนต์กลับไปหน้า 1 เอง API ใช้ค่า `page` ที่ส่งมา
- เรียง `newest` และ `oldest` ตามเวลาที่สร้างสินค้า, `views` ตามจำนวนครั้งที่เปิดรายละเอียด, `price` จากราคาต่ำไปสูง, `price_desc` จากราคาสูงไปต่ำ เมื่อค่าเท่ากันให้เรียง `id` จากมากไปน้อย

---

RETRIEVE_PRODUCTS: หน้าแรกใช้โหลดกริดสินค้า และหน้ารายละเอียดใช้โหลดสินค้าแนะนำ

Method: GET
Path: `/api/products`

Path Params: -

Query Params:

| Field | Type | Description | Default |
| --- | --- | --- | --- |
| page | number | หน้าที่ต้องการ เริ่มที่ 1 | 1 |
| pageSize | number | จำนวนรายการต่อหน้า | 10 |
| sort | string | `newest`, `oldest`, `views`, `price`, `price_desc` | `newest` |
| vehicleTypeId | number | กรองตามประเภท | - |
| brandId | number | กรองตามยี่ห้อ | - |
| modelId | number | กรองตามรุ่น | - |
| minPrice | number | ราคาตั้งแต่ (บาท) | - |
| maxPrice | number | ราคาถึง (บาท) | - |
| minYear | number | ปีที่ผลิตตั้งแต่ | - |
| maxYear | number | ปีที่ผลิตถึง | - |

Request Body: -

Response Body:

| Field | Type | Description |
| --- | --- | --- |
| data | Product[] | สินค้าในหน้านี้ |
| meta | PageMeta | ข้อมูลแบ่งหน้า |

**Record Object (PageMeta)**

| Field | Type | Description |
| --- | --- | --- |
| page | number | หน้าปัจจุบัน |
| pageSize | number | จำนวนต่อหน้าที่ใช้ |
| total | number | จำนวนสินค้าทั้งหมดที่ตรงเงื่อนไข |

**Record Object (Product)**

| Field | Type | Description |
| --- | --- | --- |
| id | number | รหัสสินค้า |
| name | string | ชื่อรถ |
| description | string \| null | คำอธิบาย |
| price | number | ราคาเป็นจำนวนเต็มบาท |
| year | number \| null | ปีที่ผลิต |
| vehicleType | VehicleType \| null | ประเภท |
| brand | Brand \| null | ยี่ห้อ |
| model | Model \| null | รุ่น |
| sellerName | string \| null | ชื่อผู้ขาย |
| sellerPhone | string \| null | เบอร์โทร |
| sellerLineUrl | string \| null | ลิงก์ไลน์ |
| sellerAvatar | string \| null | พาธรูปโปรไฟล์ที่ขึ้นต้นด้วย `/uploads/` เป็น null ได้ |
| viewCount | number | จำนวนครั้งที่เปิดหน้ารายละเอียด |
| createdAt | string | เวลาที่สร้างรายการ รูปแบบ ISO-8601 |
| images | ProductImage[] | รูปสินค้า เรียงตาม `sortOrder` ตำแหน่ง 0 คือภาพปก |

**Record Object (ProductImage)**

| Field | Type | Description |
| --- | --- | --- |
| id | number | รหัสรูป |
| url | string | พาธรูปที่ขึ้นต้นด้วย `/uploads/` |
| sortOrder | number | ลำดับรูป 0 ถึง 3 ค่า 0 คือภาพปก |

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

สินค้าแนะนำบนหน้ารายละเอียดเรียก operation นี้ด้วย `sort=newest` แล้วตัดสินค้าที่เปิดอยู่ทิ้งทางไคลเอนต์ และแสดง 4 รายการ การ์ดใช้รูปที่ `sortOrder` เป็น 0

Error Handling:

| HTTP | When |
| --- | --- |
| 400 | query ไม่ผ่านกฎด้านบน ตัวตอบกลับเป็น `{ error, fields }` |
