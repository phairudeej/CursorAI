import { ApiError } from '../api/http'

const BLOCKED_ENGLISH = /\bgun\b/i
const BLOCKED_THAI = ['ปืน', 'เฮโรอีน']

export type ImageDraft =
  | { kind: 'existing'; id: number }
  | { kind: 'new'; file: File }

export type ProductFormFields = {
  name: string
  description: string
  price: string
  vehicleTypeId: string
  brandId: string
  modelId: string
  year: string
  sellerName: string
  sellerPhone: string
  sellerLineUrl: string
}

export function hasBlockedTerm(value: string): boolean {
  if (BLOCKED_ENGLISH.test(value)) return true
  return BLOCKED_THAI.some((word) => value.includes(word))
}

export function isJpgOrPng(file: File): boolean {
  const name = file.name.toLowerCase()
  const extensionOk = name.endsWith('.png') || name.endsWith('.jpg')
  const mimeOk =
    file.type === '' || file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg'
  return extensionOk && mimeOk
}

export function validateProductForm(fields: ProductFormFields, imageCount: number): Record<string, string> {
  const errors: Record<string, string> = {}
  const name = fields.name.trim()
  if (!name) errors.name = 'กรุณากรอกชื่อรถ'
  else if (hasBlockedTerm(name)) errors.name = 'ชื่อมีคีย์เวิร์ดที่ไม่อนุญาต'

  if (fields.description.trim() && hasBlockedTerm(fields.description)) {
    errors.description = 'รายละเอียดมีคีย์เวิร์ดที่ไม่อนุญาต'
  }

  const price = fields.price.trim()
  if (!price) errors.price = 'กรุณากรอกราคา'
  else if (!/^\d+$/.test(price) || Number(price) > 99_999_999) {
    errors.price = 'ราคาต้องเป็นจำนวนเต็มตั้งแต่ 0 ถึง 99,999,999'
  }

  const year = fields.year.trim()
  if (year && !/^-?\d+$/.test(year)) errors.year = 'ปีที่ผลิตต้องเป็นจำนวนเต็ม'

  if (imageCount < 1) errors.images = 'ต้องมีรูปอย่างน้อย 1 รูป'
  else if (imageCount > 4) errors.images = 'อัปโหลดได้ไม่เกิน 4 รูป'

  return errors
}

const API_FIELD_MESSAGE: Record<string, string> = {
  name: 'ชื่อสินค้าไม่ผ่านการตรวจสอบ',
  description: 'รายละเอียดมีคีย์เวิร์ดที่ไม่อนุญาต',
  price: 'ราคาต้องเป็นจำนวนเต็มตั้งแต่ 0 ถึง 99,999,999',
  images: 'รูปสินค้าต้องเป็นไฟล์ .png หรือ .jpg จำนวน 1 ถึง 4 รูป',
  imageOrder: 'ลำดับรูปไม่ถูกต้อง',
  coverIndex: 'ภาพปกต้องอยู่ตำแหน่งแรก',
  vehicleTypeId: 'ประเภทไม่ถูกต้อง',
  brandId: 'ยี่ห้อไม่ถูกต้อง',
  modelId: 'รุ่นไม่สอดคล้องกับยี่ห้อ',
  year: 'ปีที่ผลิตไม่ถูกต้อง',
  sellerAvatar: 'รูปโปรไฟล์ต้องเป็นไฟล์ .png หรือ .jpg',
  sellerName: 'ชื่อผู้ขายไม่ถูกต้อง',
  sellerPhone: 'เบอร์โทรไม่ถูกต้อง',
  sellerLineUrl: 'ลิงก์ไลน์ไม่ถูกต้อง',
}

export function errorsFromApi(error: ApiError): { formError: string; fields: Record<string, string> } {
  const fields: Record<string, string> = {}
  for (const field of error.fields) {
    fields[field] =
      error.status === 409 && field === 'name' ? 'ชื่อสินค้าซ้ำ' : (API_FIELD_MESSAGE[field] ?? error.message)
  }
  return { formError: error.message, fields }
}

export function buildProductFormData(
  mode: 'create' | 'edit',
  fields: ProductFormFields,
  images: ImageDraft[],
  avatarFile: File | null,
  clearAvatar: boolean,
): FormData {
  const body = new FormData()
  body.append('name', fields.name.trim())
  body.append('description', fields.description.trim())
  body.append('price', fields.price.trim())
  body.append('vehicleTypeId', fields.vehicleTypeId)
  body.append('brandId', fields.brandId)
  body.append('modelId', fields.modelId)
  body.append('year', fields.year.trim())
  body.append('sellerName', fields.sellerName.trim())
  body.append('sellerPhone', fields.sellerPhone.trim())
  body.append('sellerLineUrl', fields.sellerLineUrl.trim())
  body.append('coverIndex', '0')

  if (mode === 'create') {
    const files = images.flatMap((image) => (image.kind === 'new' ? [image.file] : []))
    files.forEach((file) => body.append('images', file))
    body.append('imageOrder', JSON.stringify(files.map((_, index) => index)))
  } else {
    const files: File[] = []
    const order = images.map((image) => {
      if (image.kind === 'existing') return { id: image.id }
      const fileIndex = files.length
      files.push(image.file)
      return { fileIndex }
    })
    files.forEach((file) => body.append('images', file))
    body.append('imageOrder', JSON.stringify(order))
  }

  if (avatarFile) body.append('sellerAvatar', avatarFile)
  else if (mode === 'edit' && clearAvatar) body.append('sellerAvatar', '')

  return body
}
