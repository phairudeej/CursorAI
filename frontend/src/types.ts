export type VehicleType = {
  id: number
  name: string
}

export type Brand = {
  id: number
  name: string
}

export type Model = {
  id: number
  brandId: number
  name: string
}

export type ProductImage = {
  id: number
  url: string
  sortOrder: number
}

export type Product = {
  id: number
  name: string
  description: string | null
  price: number
  year: number | null
  vehicleType: VehicleType | null
  brand: Brand | null
  model: Model | null
  sellerName: string | null
  sellerPhone: string | null
  sellerLineUrl: string | null
  sellerAvatar: string | null
  viewCount: number
  createdAt: string
  images: ProductImage[]
}

export type PageMeta = {
  page: number
  pageSize: number
  total: number
}

export type ProductList = {
  data: Product[]
  meta: PageMeta
}

export type ProductSort = 'newest' | 'views' | 'price' | 'price_desc'

export type ListQuery = {
  page?: number
  pageSize?: number
  sort?: ProductSort | 'oldest'
  vehicleTypeId?: number
  brandId?: number
  modelId?: number
  minPrice?: number
  maxPrice?: number
  minYear?: number
  maxYear?: number
}

export const HOME_PAGE_SIZE = 12
export const ADMIN_PAGE_SIZE = 10
