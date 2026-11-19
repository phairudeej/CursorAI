import type { Product, ProductImage } from '../types'

export function formatPrice(price: number): string {
  return `฿${new Intl.NumberFormat('th-TH').format(price)}`
}

export function vehicleMeta(product: Pick<Product, 'brand' | 'model' | 'year'>): string {
  return [product.brand?.name, product.model?.name, product.year?.toString()]
    .filter((part): part is string => Boolean(part))
    .join(' | ')
}

export function coverImage(product: Product): ProductImage | null {
  return [...product.images].sort((left, right) => left.sortOrder - right.sortOrder)[0] ?? null
}

export function phoneHref(phone: string): string {
  return `tel:${phone}`
}
