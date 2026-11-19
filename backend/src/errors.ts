export class HttpError extends Error {
  readonly status: number;
  readonly fields: string[];

  constructor(status: number, message: string, fields: string[] = []) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.fields = fields;
  }
}

export const validationError = "ข้อมูลไม่ผ่านการตรวจสอบ";
export const duplicateNameError = "ชื่อสินค้าซ้ำ";
export const productNotFoundError = "ไม่พบสินค้า";
