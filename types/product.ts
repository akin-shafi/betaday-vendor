export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  isAvailable: boolean
  image: string | null
  businessId: string
  createdAt: string
  updatedAt: string
  views?: number
  orders?: number
}

export interface CreateProductData {
  name: string
  description: string
  price: number
  category: string
  isAvailable: boolean
  businessId: string
}

export interface UpdateProductData {
  name?: string
  description?: string
  price?: number
  category?: string
  isAvailable?: boolean
}

export interface ProductCategory {
  id: string
  name: string
  count?: number
  isPredefined?: boolean
}
