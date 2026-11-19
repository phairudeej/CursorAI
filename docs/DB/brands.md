# Table Name: brands

Description: ตาราง master เก็บยี่ห้อรถ สำหรับตัวกรองหน้าแรกและช่องยี่ห้อในฟอร์ม admin เมื่อเปลี่ยนยี่ห้อ ฟอร์มต้องล้างรุ่นที่เลือกไว้ รุ่นสังกัดยี่ห้อผ่านตาราง `models`

Source: [AcceptanceCriteria.md — ตัวกรองยี่ห้อ, ฟิลด์ยี่ห้อ, และกฎเปลี่ยนยี่ห้อแล้วล้างรุ่น](../../AcceptanceCriteria.md)

## Fields

| Field Name | Required | Data Type | Description | Example |
| --- | --- | --- | --- | --- |
| id | Yes | INTEGER | Primary key | 1 |
| name | Yes | TEXT | ชื่อยี่ห้อที่แสดงบนการ์ด รายละเอียด ตัวกรอง และฟอร์ม | Isuzu |

- **Constraint:** `PRIMARY KEY (id)`
- **Constraint:** `UNIQUE (name)`
- **Required initial values:** ไม่มีรายการยี่ห้อใน `AcceptanceCriteria.md` และ `DefinitionOfDone.md` จึงไม่กำหนดค่า seed
