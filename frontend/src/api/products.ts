import type { ListQuery, Product, ProductList } from '../types'
import {
  mockCreateProduct,
  mockDeleteProduct,
  mockGetProduct,
  mockListProducts,
  mockUpdateProduct,
} from '../mock/store'
import { apiRequest } from './http'
import { useMock } from './mode'

export function listProducts(query: ListQuery): Promise<ProductList> {
  if (useMock) return mockListProducts(query)
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue
    params.set(key, String(value))
  }
  const qs = params.toString()
  return apiRequest<ProductList>(`/api/products${qs ? `?${qs}` : ''}`)
}

export function getProduct(id: number): Promise<Product> {
  if (useMock) return mockGetProduct(id)
  return apiRequest<Product>(`/api/products/${id}`)
}

export function createProduct(body: FormData): Promise<Product> {
  if (useMock) return mockCreateProduct(body)
  return apiRequest<Product>('/api/products', { method: 'POST', body })
}

export function updateProduct(id: number, body: FormData): Promise<Product> {
  if (useMock) return mockUpdateProduct(id, body)
  return apiRequest<Product>(`/api/products/${id}`, { method: 'PUT', body })
}

export function deleteProduct(id: number): Promise<void> {
  if (useMock) return mockDeleteProduct(id)
  return apiRequest<void>(`/api/products/${id}`, { method: 'DELETE' })
}
