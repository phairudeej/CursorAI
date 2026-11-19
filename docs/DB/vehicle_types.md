# Table Name: vehicle_types

Description: ตาราง master เก็บประเภทของรถ สำหรับตัวเลือกในตัวกรองหน้าแรกและช่องประเภทในฟอร์ม admin และใช้แสดงในสเปกบนหน้ารายละเอียด

Source: [AcceptanceCriteria.md — ตัวกรอง «ข้อมูลรถ» (ประเภท) และฟิลด์ประเภทในฟอร์ม admin](../../AcceptanceCriteria.md)

## Fields

| Field Name | Required | Data Type | Description | Example |
| --- | --- | --- | --- | --- |
| id | Yes | INTEGER | Primary key | 1 |
| name | Yes | TEXT | ชื่อประเภทที่แสดงในตัวกรอง ฟอร์ม และสเปกรถ | รถบรรทุก |

- **Constraint:** `PRIMARY KEY (id)`
- **Constraint:** `UNIQUE (name)`
- **Required initial values:** ไม่มีรายการประเภทใน `AcceptanceCriteria.md` และ `DefinitionOfDone.md` จึงไม่กำหนดค่า seed
