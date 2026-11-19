import { ApiError } from '../api/http'
import { hasBlockedTerm } from '../lib/productForm'
import type { ListQuery, Product, ProductImage, ProductList } from '../types'
import { MOCK_BRANDS, MOCK_MODELS, MOCK_VEHICLE_TYPES } from './catalog'

const MOCK_IMAGE = '/mock-truck.svg'

type SeedRow = {
  id: number
  name: string
  description: string | null
  price: number
  vehicleTypeId: number
  brandId: number
  modelId: number
  year: number
  sellerName: string
  sellerPhone: string
  sellerLineUrl: string
  sellerAvatar: string | null
  viewCount: number
  createdAt: string
  imageCount?: number
}

const SEED: SeedRow[] = [
  { id: 1, name: 'Isuzu ELF 2018', description: 'สภาพดี พร้อมโอน', price: 450000, vehicleTypeId: 1, brandId: 1, modelId: 1, year: 2018, sellerName: 'สมชาย', sellerPhone: '0811000001', sellerLineUrl: 'https://line.me/ti/p/~truck01', sellerAvatar: null, viewCount: 40, createdAt: '2026-01-21T03:00:00.000Z' },
  { id: 2, name: 'Isuzu FRR 2020', description: 'ใช้งานน้อย เอกสารครบ', price: 780000, vehicleTypeId: 1, brandId: 1, modelId: 2, year: 2020, sellerName: 'สมหญิง', sellerPhone: '0811000002', sellerLineUrl: 'https://line.me/ti/p/~truck02', sellerAvatar: null, viewCount: 15, createdAt: '2026-01-09T03:00:00.000Z' },
  { id: 3, name: 'Isuzu GXZ 2022', description: 'เครื่องเดิม ไม่เคยชนหนัก', price: 1850000, vehicleTypeId: 2, brandId: 1, modelId: 3, year: 2022, sellerName: 'วิชัย', sellerPhone: '0811000003', sellerLineUrl: 'https://line.me/ti/p/~truck03', sellerAvatar: null, viewCount: 88, createdAt: '2026-01-24T03:00:00.000Z' },
  { id: 4, name: 'Isuzu D-Max 2023', description: 'พร้อมใช้งานทันที', price: 620000, vehicleTypeId: 5, brandId: 1, modelId: 4, year: 2023, sellerName: 'นภา', sellerPhone: '0811000004', sellerLineUrl: 'https://line.me/ti/p/~truck04', sellerAvatar: null, viewCount: 5, createdAt: '2026-01-15T03:00:00.000Z' },
  { id: 5, name: 'Hino 300 2019', description: 'สภาพดี พร้อมโอน', price: 690000, vehicleTypeId: 1, brandId: 2, modelId: 5, year: 2019, sellerName: 'ประเสริฐ', sellerPhone: '0811000005', sellerLineUrl: 'https://line.me/ti/p/~truck05', sellerAvatar: null, viewCount: 120, createdAt: '2026-01-28T03:00:00.000Z' },
  { id: 6, name: 'Hino 500 2021', description: 'ใช้งานน้อย เอกสารครบ', price: 1290000, vehicleTypeId: 1, brandId: 2, modelId: 6, year: 2021, sellerName: 'มานะ', sellerPhone: '0811000006', sellerLineUrl: 'https://line.me/ti/p/~truck06', sellerAvatar: null, viewCount: 33, createdAt: '2026-01-19T03:00:00.000Z' },
  { id: 7, name: 'Hino 700 2017', description: 'เครื่องเดิม ไม่เคยชนหนัก', price: 980000, vehicleTypeId: 2, brandId: 2, modelId: 7, year: 2017, sellerName: 'อรุณ', sellerPhone: '0811000007', sellerLineUrl: 'https://line.me/ti/p/~truck07', sellerAvatar: null, viewCount: 210, createdAt: '2026-01-12T03:00:00.000Z' },
  { id: 8, name: 'Toyota Hilux Revo 2024', description: 'พร้อมใช้งานทันที', price: 759000, vehicleTypeId: 5, brandId: 3, modelId: 8, year: 2024, sellerName: 'กมล', sellerPhone: '0811000008', sellerLineUrl: 'https://line.me/ti/p/~truck08', sellerAvatar: null, viewCount: 64, createdAt: '2026-01-26T03:00:00.000Z' },
  { id: 9, name: 'Toyota Dyna 2016', description: null, price: 390000, vehicleTypeId: 1, brandId: 3, modelId: 9, year: 2016, sellerName: 'ธนา', sellerPhone: '0811000009', sellerLineUrl: 'https://line.me/ti/p/~truck09', sellerAvatar: null, viewCount: 9, createdAt: '2026-01-06T03:00:00.000Z' },
  { id: 10, name: 'Isuzu ELF 2020', description: 'สภาพพร้อมใช้งาน มีรูปหลายใบสำหรับทดสอบแกลเลอรี', price: 850000, vehicleTypeId: 1, brandId: 1, modelId: 1, year: 2020, sellerName: 'ทดสอบ', sellerPhone: '0811000010', sellerLineUrl: 'https://line.me/ti/p/~truck10', sellerAvatar: null, viewCount: 12, createdAt: '2026-01-22T03:00:00.000Z', imageCount: 3 },
  { id: 11, name: 'Mitsubishi Fuso Canter 2015', description: 'สภาพดี พร้อมโอน', price: 320000, vehicleTypeId: 1, brandId: 4, modelId: 10, year: 2015, sellerName: 'วราภรณ์', sellerPhone: '0811000011', sellerLineUrl: 'https://line.me/ti/p/~truck11', sellerAvatar: null, viewCount: 77, createdAt: '2026-01-11T03:00:00.000Z' },
  { id: 12, name: 'Mitsubishi Fuso Fighter 2020', description: 'ใช้งานน้อย เอกสารครบ', price: 1450000, vehicleTypeId: 4, brandId: 4, modelId: 11, year: 2020, sellerName: 'สุชาติ', sellerPhone: '0811000012', sellerLineUrl: 'https://line.me/ti/p/~truck12', sellerAvatar: null, viewCount: 18, createdAt: '2026-01-18T03:00:00.000Z' },
  { id: 13, name: 'UD Quester 2019', description: 'เครื่องเดิม ไม่เคยชนหนัก', price: 1680000, vehicleTypeId: 2, brandId: 5, modelId: 12, year: 2019, sellerName: 'พิมพ์', sellerPhone: '0811000013', sellerLineUrl: 'https://line.me/ti/p/~truck13', sellerAvatar: null, viewCount: 44, createdAt: '2026-01-04T03:00:00.000Z' },
  { id: 14, name: 'UD Croner 2021', description: 'พร้อมใช้งานทันที', price: 890000, vehicleTypeId: 1, brandId: 5, modelId: 13, year: 2021, sellerName: 'เอกชัย', sellerPhone: '0811000014', sellerLineUrl: 'https://line.me/ti/p/~truck14', sellerAvatar: null, viewCount: 3, createdAt: '2026-01-25T03:00:00.000Z' },
  { id: 15, name: 'Isuzu ELF 2016', description: 'สภาพดี พร้อมโอน', price: 520000, vehicleTypeId: 1, brandId: 1, modelId: 1, year: 2016, sellerName: 'จิรา', sellerPhone: '0811000015', sellerLineUrl: 'https://line.me/ti/p/~truck15', sellerAvatar: null, viewCount: 150, createdAt: '2026-01-13T03:00:00.000Z' },
  { id: 16, name: 'Hino 500 2018', description: 'ใช้งานน้อย เอกสารครบ', price: 1100000, vehicleTypeId: 3, brandId: 2, modelId: 6, year: 2018, sellerName: 'อนุชา', sellerPhone: '0811000016', sellerLineUrl: 'https://line.me/ti/p/~truck16', sellerAvatar: null, viewCount: 27, createdAt: '2026-01-16T03:00:00.000Z' },
  { id: 17, name: 'Isuzu GXZ 2014', description: 'เครื่องเดิม ไม่เคยชนหนัก', price: 750000, vehicleTypeId: 2, brandId: 1, modelId: 3, year: 2014, sellerName: 'ศิริ', sellerPhone: '0811000017', sellerLineUrl: 'https://line.me/ti/p/~truck17', sellerAvatar: null, viewCount: 301, createdAt: '2026-01-02T03:00:00.000Z' },
  { id: 18, name: 'Toyota Hilux Revo 2020', description: null, price: 540000, vehicleTypeId: 5, brandId: 3, modelId: 8, year: 2020, sellerName: 'ภาณุ', sellerPhone: '0811000018', sellerLineUrl: 'https://line.me/ti/p/~truck18', sellerAvatar: null, viewCount: 22, createdAt: '2026-01-08T03:00:00.000Z' },
  { id: 19, name: 'Hino 300 2022', description: 'พร้อมใช้งานทันที', price: 830000, vehicleTypeId: 1, brandId: 2, modelId: 5, year: 2022, sellerName: 'มัลลิกา', sellerPhone: '0811000019', sellerLineUrl: 'https://line.me/ti/p/~truck19', sellerAvatar: null, viewCount: 56, createdAt: '2026-01-20T03:00:00.000Z' },
  { id: 20, name: 'Mitsubishi Fuso Canter 2023', description: 'สภาพดี พร้อมโอน', price: 610000, vehicleTypeId: 1, brandId: 4, modelId: 10, year: 2023, sellerName: 'ชัยวัฒน์', sellerPhone: '0811000020', sellerLineUrl: 'https://line.me/ti/p/~truck20', sellerAvatar: null, viewCount: 8, createdAt: '2026-01-10T03:00:00.000Z' },
  { id: 21, name: 'UD Quester 2022', description: 'ใช้งานน้อย เอกสารครบ', price: 2100000, vehicleTypeId: 3, brandId: 5, modelId: 12, year: 2022, sellerName: 'อภิชาติ', sellerPhone: '0811000021', sellerLineUrl: 'https://line.me/ti/p/~truck21', sellerAvatar: null, viewCount: 91, createdAt: '2026-01-23T03:00:00.000Z' },
  { id: 22, name: 'Isuzu D-Max 2019', description: 'เครื่องเดิม ไม่เคยชนหนัก', price: 410000, vehicleTypeId: 5, brandId: 1, modelId: 4, year: 2019, sellerName: 'ปิยะ', sellerPhone: '0811000022', sellerLineUrl: 'https://line.me/ti/p/~truck22', sellerAvatar: null, viewCount: 134, createdAt: '2026-01-17T03:00:00.000Z' },
  { id: 23, name: 'Hino 700 2020', description: 'พร้อมใช้งานทันที', price: 1750000, vehicleTypeId: 4, brandId: 2, modelId: 7, year: 2020, sellerName: 'รัตนา', sellerPhone: '0811000023', sellerLineUrl: 'https://line.me/ti/p/~truck23', sellerAvatar: null, viewCount: 47, createdAt: '2026-01-05T03:00:00.000Z' },
  { id: 24, name: 'Toyota Dyna 2012', description: null, price: 250000, vehicleTypeId: 1, brandId: 3, modelId: 9, year: 2012, sellerName: 'สมศักดิ์', sellerPhone: '0811000024', sellerLineUrl: 'https://line.me/ti/p/~truck24', sellerAvatar: null, viewCount: 6, createdAt: '2026-01-01T03:00:00.000Z' },
  { id: 25, name: 'Isuzu FRR 2017', description: 'สภาพดี พร้อมโอน', price: 560000, vehicleTypeId: 4, brandId: 1, modelId: 2, year: 2017, sellerName: 'เกียรติ', sellerPhone: '0811000025', sellerLineUrl: 'https://line.me/ti/p/~truck25', sellerAvatar: null, viewCount: 19, createdAt: '2026-01-07T03:00:00.000Z' },
  { id: 26, name: 'UD Croner 2016', description: 'ใช้งานน้อย เอกสารครบ', price: 640000, vehicleTypeId: 3, brandId: 5, modelId: 13, year: 2016, sellerName: 'บุษบา', sellerPhone: '0811000026', sellerLineUrl: 'https://line.me/ti/p/~truck26', sellerAvatar: null, viewCount: 260, createdAt: '2026-01-03T03:00:00.000Z' },
  { id: 27, name: 'Hino 500 2024', description: 'เครื่องเดิม ไม่เคยชนหนัก', price: 1590000, vehicleTypeId: 1, brandId: 2, modelId: 6, year: 2024, sellerName: 'ธนพล', sellerPhone: '0811000027', sellerLineUrl: 'https://line.me/ti/p/~truck27', sellerAvatar: null, viewCount: 2, createdAt: '2026-01-27T03:00:00.000Z' },
  { id: 28, name: 'Mitsubishi Fuso Fighter 2013', description: 'พร้อมใช้งานทันที', price: 480000, vehicleTypeId: 2, brandId: 4, modelId: 11, year: 2013, sellerName: 'วาสนา', sellerPhone: '0811000028', sellerLineUrl: 'https://line.me/ti/p/~truck28', sellerAvatar: null, viewCount: 73, createdAt: '2026-01-14T03:00:00.000Z' },
]

let nextProductId = 100
let nextImageId = 1000
const products: Product[] = SEED.map(toProduct)

function findType(id: number | null) {
  return MOCK_VEHICLE_TYPES.find((item) => item.id === id) ?? null
}

function findBrand(id: number | null) {
  return MOCK_BRANDS.find((item) => item.id === id) ?? null
}

function findModel(id: number | null, brandId: number | null) {
  const model = MOCK_MODELS.find((item) => item.id === id) ?? null
  if (!model) return null
  if (brandId != null && model.brandId !== brandId) return null
  return model
}

function makeImages(productId: number, count: number): ProductImage[] {
  return Array.from({ length: count }, (_, index) => ({
    id: productId * 10 + index + 1,
    url: MOCK_IMAGE,
    sortOrder: index,
  }))
}

function toProduct(row: SeedRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price,
    year: row.year,
    vehicleType: findType(row.vehicleTypeId),
    brand: findBrand(row.brandId),
    model: findModel(row.modelId, row.brandId),
    sellerName: row.sellerName,
    sellerPhone: row.sellerPhone,
    sellerLineUrl: row.sellerLineUrl,
    sellerAvatar: row.sellerAvatar,
    viewCount: row.viewCount,
    createdAt: row.createdAt,
    images: makeImages(row.id, row.imageCount ?? 1),
  }
}

function clone(product: Product): Product {
  return {
    ...product,
    vehicleType: product.vehicleType ? { ...product.vehicleType } : null,
    brand: product.brand ? { ...product.brand } : null,
    model: product.model ? { ...product.model } : null,
    images: product.images.map((image) => ({ ...image })),
  }
}

function sortProducts(list: Product[], sort: ListQuery['sort']) {
  const next = list.slice()
  next.sort((left, right) => {
    let cmp = 0
    if (sort === 'views') cmp = right.viewCount - left.viewCount
    else if (sort === 'price') cmp = left.price - right.price
    else if (sort === 'price_desc') cmp = right.price - left.price
    else if (sort === 'oldest') cmp = left.createdAt.localeCompare(right.createdAt)
    else cmp = right.createdAt.localeCompare(left.createdAt)
    if (cmp !== 0) return cmp
    return right.id - left.id
  })
  return next
}

export function mockListProducts(query: ListQuery): Promise<ProductList> {
  const page = query.page ?? 1
  const pageSize = query.pageSize ?? 10
  if (page < 1 || pageSize < 1) {
    return Promise.reject(new ApiError(400, 'พารามิเตอร์ไม่ถูกต้อง', ['page']))
  }

  let list = products.slice()
  if (query.vehicleTypeId != null) {
    list = list.filter((item) => item.vehicleType?.id === query.vehicleTypeId)
  }
  if (query.brandId != null) list = list.filter((item) => item.brand?.id === query.brandId)
  if (query.modelId != null) list = list.filter((item) => item.model?.id === query.modelId)
  if (query.minPrice != null) list = list.filter((item) => item.price >= query.minPrice!)
  if (query.maxPrice != null) list = list.filter((item) => item.price <= query.maxPrice!)
  if (query.minYear != null) list = list.filter((item) => (item.year ?? 0) >= query.minYear!)
  if (query.maxYear != null) list = list.filter((item) => (item.year ?? 0) <= query.maxYear!)

  if (
    query.minPrice != null &&
    query.maxPrice != null &&
    query.minPrice > query.maxPrice
  ) {
    return Promise.reject(new ApiError(400, 'ช่วงราคาไม่ถูกต้อง', ['minPrice', 'maxPrice']))
  }
  if (query.minYear != null && query.maxYear != null && query.minYear > query.maxYear) {
    return Promise.reject(new ApiError(400, 'ช่วงปีไม่ถูกต้อง', ['minYear', 'maxYear']))
  }

  const sorted = sortProducts(list, query.sort ?? 'newest')
  const start = (page - 1) * pageSize
  return Promise.resolve({
    data: sorted.slice(start, start + pageSize).map(clone),
    meta: { page, pageSize, total: sorted.length },
  })
}

export function mockGetProduct(id: number): Promise<Product> {
  const found = products.find((item) => item.id === id)
  if (!found) return Promise.reject(new ApiError(404, 'ไม่พบสินค้า'))
  found.viewCount += 1
  return Promise.resolve(clone(found))
}

function readText(body: FormData, key: string): string {
  const value = body.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function readOptionalId(body: FormData, key: string): number | null {
  const raw = readText(body, key)
  if (!raw) return null
  const value = Number(raw)
  return Number.isInteger(value) ? value : NaN
}

async function fileToUrl(file: File): Promise<string> {
  return URL.createObjectURL(file)
}

async function buildFromForm(body: FormData, existing?: Product): Promise<Product> {
  const fields: string[] = []
  const name = readText(body, 'name')
  const description = readText(body, 'description')
  const priceRaw = readText(body, 'price')
  const yearRaw = readText(body, 'year')
  const vehicleTypeId = readOptionalId(body, 'vehicleTypeId')
  const brandId = readOptionalId(body, 'brandId')
  const modelId = readOptionalId(body, 'modelId')
  const sellerName = readText(body, 'sellerName')
  const sellerPhone = readText(body, 'sellerPhone')
  const sellerLineUrl = readText(body, 'sellerLineUrl')
  const coverIndex = readText(body, 'coverIndex')

  if (!name) fields.push('name')
  else if (hasBlockedTerm(name)) fields.push('name')
  if (description && hasBlockedTerm(description)) fields.push('description')

  if (!/^\d+$/.test(priceRaw) || Number(priceRaw) > 99_999_999) fields.push('price')
  if (yearRaw && !/^-?\d+$/.test(yearRaw)) fields.push('year')
  if (vehicleTypeId !== null && (Number.isNaN(vehicleTypeId) || !findType(vehicleTypeId))) {
    fields.push('vehicleTypeId')
  }
  if (brandId !== null && (Number.isNaN(brandId) || !findBrand(brandId))) fields.push('brandId')
  if (modelId !== null) {
    if (Number.isNaN(modelId) || !findModel(modelId, brandId)) fields.push('modelId')
  }
  if (coverIndex && coverIndex !== '0') fields.push('coverIndex')

  const duplicate = products.some(
    (item) => item.name === name && item.id !== existing?.id,
  )
  if (duplicate) {
    throw new ApiError(409, 'ชื่อสินค้าซ้ำ', ['name'])
  }

  let imageOrder: unknown = []
  const orderRaw = readText(body, 'imageOrder')
  if (orderRaw) {
    try {
      imageOrder = JSON.parse(orderRaw)
    } catch {
      fields.push('imageOrder')
    }
  }
  const newFiles = body.getAll('images').filter((item): item is File => item instanceof File)
  const images: ProductImage[] = []

  if (Array.isArray(imageOrder)) {
    for (const entry of imageOrder) {
      if (entry && typeof entry === 'object' && 'id' in entry) {
        const id = Number((entry as { id: number }).id)
        const previous = existing?.images.find((image) => image.id === id)
        if (!previous) {
          fields.push('imageOrder')
          break
        }
        images.push({ ...previous, sortOrder: images.length })
      } else if (entry && typeof entry === 'object' && 'fileIndex' in entry) {
        const fileIndex = Number((entry as { fileIndex: number }).fileIndex)
        const file = newFiles[fileIndex]
        if (!file) {
          fields.push('images')
          break
        }
        images.push({
          id: nextImageId++,
          url: await fileToUrl(file),
          sortOrder: images.length,
        })
      } else if (typeof entry === 'number') {
        const file = newFiles[entry]
        if (!file) {
          fields.push('images')
          break
        }
        images.push({
          id: nextImageId++,
          url: await fileToUrl(file),
          sortOrder: images.length,
        })
      }
    }
  }

  if (!existing && images.length === 0 && newFiles.length > 0) {
    for (const file of newFiles) {
      images.push({
        id: nextImageId++,
        url: await fileToUrl(file),
        sortOrder: images.length,
      })
    }
  }

  if (images.length < 1 || images.length > 4) fields.push('images')

  if (fields.length) {
    throw new ApiError(400, 'ข้อมูลไม่ผ่านการตรวจสอบ', fields)
  }

  let sellerAvatar = existing?.sellerAvatar ?? null
  if (body.has('sellerAvatar')) {
    const avatar = body.get('sellerAvatar')
    if (avatar instanceof File) sellerAvatar = await fileToUrl(avatar)
    else if (avatar === '') sellerAvatar = null
  }

  return {
    id: existing?.id ?? nextProductId++,
    name,
    description: description || null,
    price: Number(priceRaw),
    year: yearRaw ? Number(yearRaw) : null,
    vehicleType: vehicleTypeId != null ? findType(vehicleTypeId) : null,
    brand: brandId != null ? findBrand(brandId) : null,
    model: modelId != null ? findModel(modelId, brandId) : null,
    sellerName: sellerName || null,
    sellerPhone: sellerPhone || null,
    sellerLineUrl: sellerLineUrl || null,
    sellerAvatar,
    viewCount: existing?.viewCount ?? 0,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    images,
  }
}

export async function mockCreateProduct(body: FormData): Promise<Product> {
  const product = await buildFromForm(body)
  products.unshift(product)
  return clone(product)
}

export async function mockUpdateProduct(id: number, body: FormData): Promise<Product> {
  const index = products.findIndex((item) => item.id === id)
  if (index < 0) throw new ApiError(404, 'ไม่พบสินค้า')
  const product = await buildFromForm(body, products[index])
  products[index] = product
  return clone(product)
}

export function mockDeleteProduct(id: number): Promise<void> {
  const index = products.findIndex((item) => item.id === id)
  if (index < 0) return Promise.reject(new ApiError(404, 'ไม่พบสินค้า'))
  products.splice(index, 1)
  return Promise.resolve()
}

export function mockVehicleTypes() {
  return { data: MOCK_VEHICLE_TYPES.map((item) => ({ ...item })) }
}

export function mockBrands() {
  return { data: MOCK_BRANDS.map((item) => ({ ...item })) }
}

export function mockModels(brandId?: number) {
  const list = brandId == null ? MOCK_MODELS : MOCK_MODELS.filter((item) => item.brandId === brandId)
  return { data: list.map((item) => ({ ...item })) }
}
