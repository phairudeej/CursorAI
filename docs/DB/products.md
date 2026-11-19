# Table Name: products

Description: ตาราง transactional เก็บรายการรถหนึ่งแถวต่อหนึ่งสินค้า ใช้ที่หน้าแรก (`/`), หน้ารายละเอียด (`/products/:id`) และหน้า admin (`/admin`) รองรับตัวกรองประเภท ยี่ห้อ รุ่น ช่วงราคา ช่วงปี การเรียง (`newest`, `views`, `price`, `price_desc` และ `oldest` ที่มีใน API) การแบ่งหน้า และการเพิ่ม `view_count` เมื่อเปิดรายละเอียด ข้อมูลผู้ขายอยู่บนแถวสินค้านี้ เพราะสเปกไม่มีบัญชีผู้ขายแยก รูปหลายใบอยู่ใน `product_images`

Source: [AcceptanceCriteria.md — การ์ด, หน้ารายละเอียด, ฟอร์ม admin](../../AcceptanceCriteria.md), [DefinitionOfDone.md — sort, pagination, viewCount, validation ชื่อซ้ำและราคา, sellerAvatar เป็น null ได้](../../DefinitionOfDone.md)

## Fields

| Field Name | Required | Data Type | Description | Example |
| --- | --- | --- | --- | --- |
| id | Yes | INTEGER | Primary key อ้างใน `/products/:id` | 10 |
| name | Yes | TEXT | ชื่อรถ ห้ามซ้ำ ฟิลด์บังคับบนฟอร์ม | Isuzu ELF 2020 |
| description | No | TEXT | คำอธิบาย แสดงบนหน้ารายละเอียดเมื่อมีค่า | สภาพพร้อมใช้งาน |
| price | Yes | INTEGER | ราคาเป็นจำนวนเต็มบาท ฟิลด์บังคับ ต้องอยู่ระหว่าง 0 ถึง 99,999,999 | 850000 |
| vehicle_type_id | No | INTEGER | ประเภทรถ `FK → vehicle_types.id` ใช้กรองและแสดงในสเปก | 1 |
| brand_id | No | INTEGER | ยี่ห้อ `FK → brands.id` ใช้กรองและแสดงบนการ์ด | 1 |
| model_id | No | INTEGER | รุ่น `FK → models.id` ใช้กรองและแสดงบนการ์ด ต้องเป็นรุ่นของ `brand_id` | 1 |
| year | No | INTEGER | ปีที่ผลิต ใช้กรองแบบช่วงและแสดงบนการ์ด | 2020 |
| seller_name | No | TEXT | ชื่อผู้ขายบนการ์ดและหน้ารายละเอียด | สมชาย |
| seller_phone | No | TEXT | เบอร์โทร ใช้ลิงก์ `tel:` และปุ่มโทร | 0812345678 |
| seller_line_url | No | TEXT | ลิงก์ไลน์สำหรับปุ่ม LINE และแอดไลน์ | https://line.me/ti/p/~seller |
| seller_avatar | No | TEXT | พาธไฟล์รูปโปรไฟล์ เป็น null ได้ เมื่อว่าง UI ใช้ไอคอน UserRound | uploads/avatars/seller.jpg |
| view_count | Yes | INTEGER | จำนวนครั้งที่เปิดหน้ารายละเอียด ค่าเริ่มต้น 0 ใช้เรียง `views` | 12 |
| created_at | Yes | TEXT | เวลาที่สร้างรายการ รูปแบบ ISO-8601 ใช้เรียง `newest` (ค่าเริ่มต้น) และ `oldest` | 2026-11-05T03:00:00.000Z |

- **Constraint:** `PRIMARY KEY (id)`
- **Constraint:** `UNIQUE (name)`
- **Constraint:** `CHECK (price >= 0 AND price <= 99999999)`
- **Constraint:** `CHECK (view_count >= 0)`
- **Constraint:** `FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(id)`
- **Constraint:** `FOREIGN KEY (brand_id) REFERENCES brands(id)`
- **Constraint:** `FOREIGN KEY (model_id) REFERENCES models(id)`
- **Constraint:** ถ้ามี `model_id` ต้องมี `brand_id` และรุ่นนั้นต้องสังกัดยี่ห้อนั้น (เปลี่ยนยี่ห้อแล้วล้างรุ่น) — ตรวจในแอปพลิเคชัน
- **Constraint:** ต้องมีรูปใน `product_images` อย่างน้อย 1 รูป และไม่เกิน 4 รูป — ตรวจในแอปพลิเคชัน
- **Index:** `created_at`, `view_count`, `price`, `year` สำหรับการเรียงและกรองช่วง
