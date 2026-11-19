import type { ListQuery, ProductSort } from '../types'

export type FilterDraft = {
  vehicleTypeId: string
  brandId: string
  modelId: string
  minPrice: string
  maxPrice: string
  minYear: string
  maxYear: string
}

export function emptyDraft(): FilterDraft {
  return {
    vehicleTypeId: '',
    brandId: '',
    modelId: '',
    minPrice: '',
    maxPrice: '',
    minYear: '',
    maxYear: '',
  }
}

export function cloneDraft(draft: FilterDraft): FilterDraft {
  return { ...draft }
}

function parseOptionalInt(raw: string): { ok: true; value?: number } | { ok: false } {
  const trimmed = raw.trim()
  if (!trimmed) return { ok: true }
  if (!/^-?\d+$/.test(trimmed)) return { ok: false }
  const value = Number(trimmed)
  if (!Number.isSafeInteger(value)) return { ok: false }
  return { ok: true, value }
}

export function validateDraft(draft: FilterDraft): string | null {
  const minPrice = parseOptionalInt(draft.minPrice)
  const maxPrice = parseOptionalInt(draft.maxPrice)
  if (!minPrice.ok || !maxPrice.ok) return 'กรุณากรอกราคาเป็นจำนวนเต็ม'
  if (
    minPrice.value !== undefined &&
    maxPrice.value !== undefined &&
    minPrice.value > maxPrice.value
  ) {
    return 'ราคาตั้งแต่ต้องไม่มากกว่าราคาถึง'
  }

  const minYear = parseOptionalInt(draft.minYear)
  const maxYear = parseOptionalInt(draft.maxYear)
  if (!minYear.ok || !maxYear.ok) return 'กรุณากรอกปีเป็นจำนวนเต็ม'
  if (minYear.value !== undefined && maxYear.value !== undefined && minYear.value > maxYear.value) {
    return 'ปีตั้งแต่ต้องไม่มากกว่าปีถึง'
  }

  return null
}

export function draftHasValue(draft: FilterDraft): boolean {
  return Object.values(draft).some((value) => value.trim() !== '')
}

export function toListQuery(draft: FilterDraft, page: number, pageSize: number, sort: ProductSort): ListQuery {
  const minPrice = parseOptionalInt(draft.minPrice)
  const maxPrice = parseOptionalInt(draft.maxPrice)
  const minYear = parseOptionalInt(draft.minYear)
  const maxYear = parseOptionalInt(draft.maxYear)
  return {
    page,
    pageSize,
    sort,
    vehicleTypeId: draft.vehicleTypeId ? Number(draft.vehicleTypeId) : undefined,
    brandId: draft.brandId ? Number(draft.brandId) : undefined,
    modelId: draft.modelId ? Number(draft.modelId) : undefined,
    minPrice: minPrice.ok ? minPrice.value : undefined,
    maxPrice: maxPrice.ok ? maxPrice.value : undefined,
    minYear: minYear.ok ? minYear.value : undefined,
    maxYear: maxYear.ok ? maxYear.value : undefined,
  }
}
