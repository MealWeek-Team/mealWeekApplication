import { apiFetch } from './clients'

export type Ingredient = {
  id: string
  name: string
  unit: string
  category?: string
}

export function getIngredientCatalog() {
  return apiFetch<Ingredient[]>('/api/ingredients')
}

export function isValidQuantity(quantity: string) {
  return (
    quantity.trim() !== '' &&
    Number.isFinite(Number(quantity)) &&
    Number(quantity) > 0
  )
}