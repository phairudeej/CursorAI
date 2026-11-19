# Table Name: models

Description: ตาราง master เก็บรุ่นรถ โดยแต่ละรุ่นสังกัดยี่ห้อเดียว ใช้ในตัวกรองหน้าแรก (ลบชิปยี่ห้อแล้วต้องลบชิปรุ่น) และในช่องรุ่นของฟอร์ม admin ซึ่งขึ้นกับยี่ห้อที่เลือก

Source: [AcceptanceCriteria.md — ตัวกรองรุ่น, ฟิลด์รุ่น, เปลี่ยนยี่ห้อแล้วล้างรุ่น, ลบชิปยี่ห้อแล้วลบรุ่น](../../AcceptanceCriteria.md)

## Fields

| Field Name | Required | Data Type | Description | Example |
| --- | --- | --- | --- | --- |
| id | Yes | INTEGER | Primary key | 1 |
| brand_id | Yes | INTEGER | ยี่ห้อของรุ่นนี้ `FK → brands.id` | 1 |
| name | Yes | TEXT | ชื่อรุ่นที่แสดงบนการ์ด รายละเอียด ตัวกรอง และฟอร์ม | ELF |

- **Constraint:** `PRIMARY KEY (id)`
- **Constraint:** `FOREIGN KEY (brand_id) REFERENCES brands(id)`
- **Constraint:** `UNIQUE (brand_id, name)`
- **Required initial values:** ไม่มีรายการรุ่นใน `AcceptanceCriteria.md` และ `DefinitionOfDone.md` จึงไม่กำหนดค่า seed
