export type Ingredient = {
  id: number
  name: string
  unit: string
}

// Temporary catalog for frontend development.
// Later, this will come from the backend.
export const ingredientCatalog: Ingredient[] = [
  { id: 1, name: 'Flour', unit: 'g' },
  { id: 2, name: 'Milk', unit: 'ml' },
  { id: 3, name: 'Eggs', unit: 'pcs' },
  { id: 4, name: 'Sugar', unit: 'g' },
]

export function isValidQuantity(quantity: string) {
    return (
      quantity.trim() !== '' &&
      Number.isFinite(Number(quantity)) &&
      Number(quantity) > 0
    )
  }