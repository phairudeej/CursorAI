import { ref } from 'vue'
import type { Brand, Model, VehicleType } from '../types'
import { mockBrands, mockModels, mockVehicleTypes } from '../mock/store'
import { apiRequest } from './http'
import { useMock } from './mode'

export const vehicleTypes = ref<VehicleType[]>([])
export const brands = ref<Brand[]>([])
export const modelsByBrand = ref<Record<number, Model[]>>({})

let catalogPromise: Promise<void> | null = null

export function ensureCatalog(): Promise<void> {
  if (!catalogPromise) {
    catalogPromise = (
      useMock
        ? Promise.resolve([mockVehicleTypes(), mockBrands()] as const)
        : Promise.all([
            apiRequest<{ data: VehicleType[] }>('/api/vehicle-types'),
            apiRequest<{ data: Brand[] }>('/api/brands'),
          ])
    )
      .then(([types, brandList]) => {
        vehicleTypes.value = types.data
        brands.value = brandList.data
      })
      .catch((error: unknown) => {
        catalogPromise = null
        throw error
      })
  }
  return catalogPromise
}

export async function ensureModels(brandId: number): Promise<Model[]> {
  const cached = modelsByBrand.value[brandId]
  if (cached) return cached
  const result = useMock
    ? mockModels(brandId)
    : await apiRequest<{ data: Model[] }>(`/api/models?brandId=${brandId}`)
  modelsByBrand.value = { ...modelsByBrand.value, [brandId]: result.data }
  return result.data
}
