<script setup lang="ts">
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { X } from '@lucide/vue'
import { brands, ensureCatalog, ensureModels, vehicleTypes } from '../api/catalog'
import { ApiError, mediaUrl, messageOf } from '../api/http'
import { createProduct, updateProduct } from '../api/products'
import {
  buildProductFormData,
  errorsFromApi,
  isJpgOrPng,
  validateProductForm,
  type ImageDraft,
  type ProductFormFields,
} from '../lib/productForm'
import type { Model, Product } from '../types'
import Button from './Button.vue'
import SellerAvatar from './SellerAvatar.vue'

type LocalImage = ImageDraft & { key: string; preview: string }

const props = defineProps<{ open: boolean; product: Product | null }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const fields = reactive<ProductFormFields>({
  name: '',
  description: '',
  price: '',
  vehicleTypeId: '',
  brandId: '',
  modelId: '',
  year: '',
  sellerName: '',
  sellerPhone: '',
  sellerLineUrl: '',
})
const images = ref<LocalImage[]>([])
const models = ref<Model[]>([])
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)
const clearAvatar = ref(false)
const fieldErrors = ref<Record<string, string>>({})
const formError = ref('')
const saving = ref(false)
const dragFrom = ref<number | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)
const avatarInput = ref<HTMLInputElement | null>(null)
let avatarObjectUrl: string | null = null
let ignoreClick = false

const mode = computed(() => (props.product ? 'edit' : 'create'))
const title = computed(() => (mode.value === 'edit' ? 'แก้ไขสินค้า' : 'สร้างรายการใหม่'))

function revokeAvatar() {
  if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl)
  avatarObjectUrl = null
}

function cleanup() {
  for (const image of images.value) {
    if (image.kind === 'new') URL.revokeObjectURL(image.preview)
  }
  images.value = []
  revokeAvatar()
  avatarFile.value = null
  avatarPreview.value = null
  clearAvatar.value = false
}

function fill(product: Product | null) {
  cleanup()
  fieldErrors.value = {}
  formError.value = ''
  fields.name = product?.name ?? ''
  fields.description = product?.description ?? ''
  fields.price = product ? String(product.price) : ''
  fields.vehicleTypeId = product?.vehicleType ? String(product.vehicleType.id) : ''
  fields.brandId = product?.brand ? String(product.brand.id) : ''
  fields.modelId = product?.model ? String(product.model.id) : ''
  fields.year = product?.year ? String(product.year) : ''
  fields.sellerName = product?.sellerName ?? ''
  fields.sellerPhone = product?.sellerPhone ?? ''
  fields.sellerLineUrl = product?.sellerLineUrl ?? ''
  images.value = [...(product?.images ?? [])]
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((image) => ({
      key: `existing-${image.id}`,
      kind: 'existing' as const,
      id: image.id,
      preview: mediaUrl(image.url) ?? '',
    }))
  avatarPreview.value = mediaUrl(product?.sellerAvatar)
}

async function loadModels(brandId: string) {
  if (!brandId) {
    models.value = []
    return
  }
  try {
    models.value = await ensureModels(Number(brandId))
  } catch (cause) {
    models.value = []
    formError.value = messageOf(cause)
  }
}

watch(
  () => props.open,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
    if (!open) {
      cleanup()
      return
    }
    void ensureCatalog().catch((cause: unknown) => {
      formError.value = messageOf(cause)
    })
    fill(props.product)
    void loadModels(fields.brandId)
  },
)

function onBrandChange() {
  fields.modelId = ''
  void loadModels(fields.brandId)
}

function addImages(fileList: FileList | null) {
  if (!fileList) return
  const nextErrors = { ...fieldErrors.value }
  delete nextErrors.images
  for (const file of fileList) {
    if (!isJpgOrPng(file)) {
      nextErrors.images = 'รองรับเฉพาะไฟล์ .png และ .jpg'
      continue
    }
    if (images.value.length >= 4) {
      nextErrors.images = 'อัปโหลดได้ไม่เกิน 4 รูป'
      break
    }
    images.value.push({
      key: crypto.randomUUID(),
      kind: 'new',
      file,
      preview: URL.createObjectURL(file),
    })
  }
  fieldErrors.value = nextErrors
}

function onImagesPicked(event: Event) {
  const input = event.target as HTMLInputElement
  addImages(input.files)
  input.value = ''
}

function removeImage(index: number) {
  const [removed] = images.value.splice(index, 1)
  if (removed?.kind === 'new') URL.revokeObjectURL(removed.preview)
}

function setCover(index: number) {
  if (ignoreClick || index === 0) return
  const next = images.value.slice()
  const [item] = next.splice(index, 1)
  if (!item) return
  next.unshift(item)
  images.value = next
}

function onDragStart(index: number, event: DragEvent) {
  if (index === 0) {
    event.preventDefault()
    return
  }
  dragFrom.value = index
  event.dataTransfer?.setData('text/plain', String(index))
}

function onDragOver(index: number, event: DragEvent) {
  if (index === 0 || dragFrom.value == null) return
  event.preventDefault()
}

function onDrop(index: number) {
  const from = dragFrom.value
  dragFrom.value = null
  ignoreClick = true
  window.setTimeout(() => {
    ignoreClick = false
  }, 0)
  if (from == null || from === 0 || index === 0 || from === index) return
  const next = images.value.slice()
  const [item] = next.splice(from, 1)
  if (!item) return
  next.splice(index, 0, item)
  images.value = next
}

function onAvatarPicked(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!isJpgOrPng(file)) {
    fieldErrors.value = { ...fieldErrors.value, sellerAvatar: 'รองรับเฉพาะไฟล์ .png หรือ .jpg' }
    return
  }
  revokeAvatar()
  avatarObjectUrl = URL.createObjectURL(file)
  avatarFile.value = file
  avatarPreview.value = avatarObjectUrl
  clearAvatar.value = false
  const next = { ...fieldErrors.value }
  delete next.sellerAvatar
  fieldErrors.value = next
}

function removeAvatar() {
  revokeAvatar()
  avatarFile.value = null
  avatarPreview.value = null
  clearAvatar.value = true
}

function requestClose() {
  if (saving.value) return
  emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') requestClose()
}

watch(
  () => props.open,
  (open) => {
    if (open) window.addEventListener('keydown', onKeydown)
    else window.removeEventListener('keydown', onKeydown)
  },
)

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
  cleanup()
})

async function save() {
  const errors = validateProductForm(fields, images.value.length)
  fieldErrors.value = errors
  if (Object.keys(errors).length > 0) {
    formError.value = 'ข้อมูลไม่ผ่านการตรวจสอบ'
    return
  }
  saving.value = true
  formError.value = ''
  try {
    const body = buildProductFormData(mode.value, fields, images.value, avatarFile.value, clearAvatar.value)
    if (props.product) await updateProduct(props.product.id, body)
    else await createProduct(body)
    emit('saved')
    emit('close')
  } catch (cause) {
    if (cause instanceof ApiError) {
      const mapped = errorsFromApi(cause)
      formError.value = mapped.formError
      fieldErrors.value = mapped.fields
    } else {
      formError.value = messageOf(cause)
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-root">
      <button type="button" class="overlay" aria-label="ปิดหน้าต่าง" @click="requestClose" />
      <form class="modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title" @submit.prevent="save">
        <header class="modal-header">
          <h2 id="product-form-title">{{ title }}</h2>
          <button type="button" class="icon-btn" aria-label="ปิด" @click="requestClose"><X :size="18" /></button>
        </header>
        <div class="modal-body">
          <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>

          <section class="form-section">
            <h3>รูปรถ</h3>
            <p class="hint">ภาพปกอยู่ตำแหน่งแรก คลิกรูปอื่นเพื่อตั้งเป็นปก และลากรูปที่ไม่ใช่ปกเพื่อเรียงลำดับ</p>
            <div class="image-grid">
              <div
                v-for="(image, index) in images"
                :key="image.key"
                class="image-tile"
                :class="{ 'is-cover': index === 0, 'is-draggable': index > 0 }"
                :draggable="index > 0"
                @dragstart="onDragStart(index, $event)"
                @dragover="onDragOver(index, $event)"
                @drop="onDrop(index)"
                @click="setCover(index)"
              >
                <img :src="image.preview" alt="" />
                <span v-if="index === 0" class="cover-badge">ปก</span>
                <button type="button" class="tile-remove" aria-label="ลบรูป" @click.stop="removeImage(index)">
                  <X :size="14" />
                </button>
              </div>
              <button v-if="images.length < 4" type="button" class="image-add" @click="imageInput?.click()">
                เพิ่มรูป
              </button>
            </div>
            <input
              ref="imageInput"
              class="sr-only"
              type="file"
              accept=".png,.jpg,image/png,image/jpeg"
              multiple
              @change="onImagesPicked"
            />
            <p v-if="fieldErrors.images" class="field-error">{{ fieldErrors.images }}</p>
            <p v-if="fieldErrors.imageOrder" class="field-error">{{ fieldErrors.imageOrder }}</p>
            <p v-if="fieldErrors.coverIndex" class="field-error">{{ fieldErrors.coverIndex }}</p>
          </section>

          <section class="form-section">
            <h3>ข้อมูลรถ</h3>
            <div class="form-grid two">
              <label class="field span-2">
                <span>ชื่อรถ <abbr class="req" title="จำเป็น">*</abbr></span>
                <input v-model="fields.name" class="input" :class="{ 'is-invalid': fieldErrors.name }" placeholder="กรุณากรอกชื่อรถ" />
                <span v-if="fieldErrors.name" class="field-error">{{ fieldErrors.name }}</span>
              </label>
              <label class="field span-2">
                <span>รายละเอียด</span>
                <textarea v-model="fields.description" class="textarea" :class="{ 'is-invalid': fieldErrors.description }" rows="4" placeholder="กรุณากรอกรายละเอียด" />
                <span v-if="fieldErrors.description" class="field-error">{{ fieldErrors.description }}</span>
              </label>
              <label class="field">
                <span>ราคา <abbr class="req" title="จำเป็น">*</abbr></span>
                <input v-model="fields.price" class="input" :class="{ 'is-invalid': fieldErrors.price }" inputmode="numeric" placeholder="กรุณากรอกราคา" />
                <span v-if="fieldErrors.price" class="field-error">{{ fieldErrors.price }}</span>
              </label>
              <label class="field">
                <span>ปี</span>
                <input v-model="fields.year" class="input" :class="{ 'is-invalid': fieldErrors.year }" inputmode="numeric" placeholder="กรุณากรอกปี" />
                <span v-if="fieldErrors.year" class="field-error">{{ fieldErrors.year }}</span>
              </label>
              <label class="field">
                <span>ประเภท</span>
                <select v-model="fields.vehicleTypeId" class="select" :class="{ 'is-invalid': fieldErrors.vehicleTypeId }">
                  <option value="">กรุณาเลือกประเภท</option>
                  <option v-for="type in vehicleTypes" :key="type.id" :value="String(type.id)">{{ type.name }}</option>
                </select>
                <span v-if="fieldErrors.vehicleTypeId" class="field-error">{{ fieldErrors.vehicleTypeId }}</span>
              </label>
              <label class="field">
                <span>ยี่ห้อ</span>
                <select v-model="fields.brandId" class="select" :class="{ 'is-invalid': fieldErrors.brandId }" @change="onBrandChange">
                  <option value="">กรุณาเลือกยี่ห้อ</option>
                  <option v-for="brand in brands" :key="brand.id" :value="String(brand.id)">{{ brand.name }}</option>
                </select>
                <span v-if="fieldErrors.brandId" class="field-error">{{ fieldErrors.brandId }}</span>
              </label>
              <label class="field span-2">
                <span>รุ่น</span>
                <select v-model="fields.modelId" class="select" :disabled="!fields.brandId" :class="{ 'is-invalid': fieldErrors.modelId }">
                  <option value="">กรุณาเลือกรุ่น</option>
                  <option v-for="model in models" :key="model.id" :value="String(model.id)">{{ model.name }}</option>
                </select>
                <span v-if="fieldErrors.modelId" class="field-error">{{ fieldErrors.modelId }}</span>
              </label>
            </div>
          </section>

          <section class="form-section">
            <h3>ผู้ขาย</h3>
            <div class="avatar-row">
              <button type="button" class="avatar-picker" @click="avatarInput?.click()">
                <SellerAvatar :src="avatarPreview" :size="64" alt="" />
                <span>เลือกรูป</span>
              </button>
              <button v-if="avatarPreview" type="button" class="btn btn-ghost" @click="removeAvatar">ลบรูป</button>
              <input ref="avatarInput" class="sr-only" type="file" accept=".png,.jpg,image/png,image/jpeg" @change="onAvatarPicked" />
            </div>
            <p v-if="fieldErrors.sellerAvatar" class="field-error">{{ fieldErrors.sellerAvatar }}</p>
            <div class="form-grid two">
              <label class="field">
                <span>ชื่อผู้ขาย</span>
                <input v-model="fields.sellerName" class="input" placeholder="กรุณากรอกชื่อผู้ขาย" />
              </label>
              <label class="field">
                <span>เบอร์โทร</span>
                <input v-model="fields.sellerPhone" class="input" placeholder="กรุณากรอกเบอร์โทร" />
              </label>
              <label class="field span-2">
                <span>ลิงก์ไลน์</span>
                <input v-model="fields.sellerLineUrl" class="input" placeholder="กรุณากรอกลิงก์ไลน์" />
              </label>
            </div>
          </section>
        </div>
        <footer class="modal-footer">
          <Button variant="secondary" :disabled="saving" @click="requestClose">ยกเลิก</Button>
          <Button type="submit" :disabled="saving">{{ saving ? 'กำลังบันทึก' : 'บันทึกข้อมูล' }}</Button>
        </footer>
      </form>
    </div>
  </Teleport>
</template>
