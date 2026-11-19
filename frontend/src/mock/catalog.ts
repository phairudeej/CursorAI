import type { Brand, Model, VehicleType } from '../types'

export const MOCK_VEHICLE_TYPES: VehicleType[] = [
  { id: 1, name: 'รถบรรทุก' },
  { id: 2, name: 'หัวลาก' },
  { id: 3, name: 'รถพ่วง' },
  { id: 4, name: 'รถดัมพ์' },
  { id: 5, name: 'รถกระบะ' },
]

export const MOCK_BRANDS: Brand[] = [
  { id: 1, name: 'Isuzu' },
  { id: 2, name: 'Hino' },
  { id: 3, name: 'Toyota' },
  { id: 4, name: 'Mitsubishi Fuso' },
  { id: 5, name: 'UD Trucks' },
]

export const MOCK_MODELS: Model[] = [
  { id: 1, brandId: 1, name: 'ELF' },
  { id: 2, brandId: 1, name: 'FRR' },
  { id: 3, brandId: 1, name: 'GXZ' },
  { id: 4, brandId: 1, name: 'D-Max' },
  { id: 5, brandId: 2, name: '300' },
  { id: 6, brandId: 2, name: '500' },
  { id: 7, brandId: 2, name: '700' },
  { id: 8, brandId: 3, name: 'Hilux Revo' },
  { id: 9, brandId: 3, name: 'Dyna' },
  { id: 10, brandId: 4, name: 'Canter' },
  { id: 11, brandId: 4, name: 'Fighter' },
  { id: 12, brandId: 5, name: 'Quester' },
  { id: 13, brandId: 5, name: 'Croner' },
]
