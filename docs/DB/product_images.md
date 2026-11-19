# Table Name: product_images

Description: ตาราง transactional เก็บรูปของสินค้า เรียงลำดับได้ สูงสุด 4 รูปต่อรายการ ตำแหน่ง `sort_order = 0` คือภาพปกเสมอ ใช้ในแกลเลอรีหน้ารายละเอียด การ์ดหน้าแรก (รูปปก) และช่องรูปในฟอร์ม admin เมื่อแก้หรือลบสินค้า แอปพลิเคชันลบไฟล์รูปที่ไม่ถูกใช้แล้วออกจากดิสก์

Source: [AcceptanceCriteria.md — อัปโหลดไม่เกิน 4 รูป, ปกอยู่ตำแหน่งแรก, ลากเรียงลำดับ, ต้องมีรูปอย่างน้อย 1](../../AcceptanceCriteria.md), [DefinitionOfDone.md — cover index 0, imageOrder, ลบไฟล์รูปเก่าเมื่อแก้หรือลบสินค้า](../../DefinitionOfDone.md)

## Fields

| Field Name | Required | Data Type | Description | Example |
| --- | --- | --- | --- | --- |
| id | Yes | INTEGER | Primary key คงที่เมื่อมีการสลับลำดับรูป | 1 |
| product_id | Yes | INTEGER | สินค้าเจ้าของรูป `FK → products.id` | 10 |
| file_path | Yes | TEXT | พาธไฟล์รูป `.png` หรือ `.jpg` ที่เสิร์ฟผ่าน `/uploads` | uploads/mock-truck.jpg |
| sort_order | Yes | INTEGER | ลำดับรูป 0 ถึง 3 ค่า 0 คือภาพปก | 0 |

- **Constraint:** `PRIMARY KEY (id)`
- **Constraint:** `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE`
- **Constraint:** `UNIQUE (product_id, sort_order)`
- **Constraint:** `CHECK (sort_order >= 0 AND sort_order <= 3)`
- **Constraint:** นามสกุลไฟล์เป็น `.png` หรือ `.jpg` และแต่ละสินค้ามี 1–4 แถว — ตรวจในแอปพลิเคชัน
