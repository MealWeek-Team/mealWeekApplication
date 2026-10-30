
import { useState } from 'react'

type Ingredient = {
  id: number
  name: string
  unit: string
}

// Temporary catalog for frontend development.
// Later, this will come from the backend.
const ingredientCatalog: Ingredient[] = [
  { id: 1, name: 'Flour', unit: 'g' },
  { id: 2, name: 'Milk', unit: 'ml' },
  { id: 3, name: 'Eggs', unit: 'pcs' },
  { id: 4, name: 'Sugar', unit: 'g' },
]

type RecipeIngredient = {
  ingredientId: number
  quantity: string
}

export default function RecipeIngredients() {
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([])

  // Add an ingredient without duplicates
  function addIngredient() {
    const available = ingredientCatalog.find(
      (item) =>
        !ingredients.some(
          (selected) => selected.ingredientId === item.id
        )
    )

    if (!available) return

    setIngredients((previous) => [
      ...previous,
      { ingredientId: available.id, quantity: '1' },
    ])
  }

  // Update an ingredient's quantity
  function updateQuantity(index: number, quantity: string) {
    setIngredients((previous) =>
      previous.map((item, i) =>
        i === index ? { ...item, quantity } : item
      )
    )
  }

  // Change the selected ingredient
  function changeIngredient(index: number, newId: number) {
    setIngredients((previous) => {
      if (
        previous.some(
          (item, i) => i !== index && item.ingredientId === newId
        )
      ) {
        return previous
      }

      return previous.map((item, i) =>
        i === index ? { ...item, ingredientId: newId } : item
      )
    })
  }

  // Remove an ingredient
  function removeIngredient(index: number) {
    setIngredients((previous) =>
      previous.filter((_, i) => i !== index)
    )
  }

  // Check whether a quantity is valid
  function isValidQuantity(quantity: string) {
    return (
      quantity.trim() !== '' &&
      Number.isFinite(Number(quantity)) &&
      Number(quantity) > 0
    )
  }

  const hasInvalidQuantity = ingredients.some(
    (item) => !isValidQuantity(item.quantity)
  )

  return (
    <div>
      <h2>Recipe Ingredients</h2>

      {ingredients.map((item, index) => {
        const ingredient = ingredientCatalog.find(
          (catalogItem) => catalogItem.id === item.ingredientId
        )

        return (
          <div
            key={item.ingredientId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '10px',
            }}
          >
            <select
              aria-label={`Ingredient ${index + 1}`}
              value={item.ingredientId}
              onChange={(e) =>
                changeIngredient(index, Number(e.target.value))
              }
            >
              {ingredientCatalog
                .filter(
                  (catalogItem) =>
                    catalogItem.id === item.ingredientId ||
                    !ingredients.some(
                      (selected) =>
                        selected.ingredientId === catalogItem.id
                    )
                )
                .map((catalogItem) => (
                  <option
                    key={catalogItem.id}
                    value={catalogItem.id}
                  >
                    {catalogItem.name}
                  </option>
                ))}
            </select>

            <input
              type="number"
              aria-label={`Quantity for ${ingredient?.name ?? 'ingredient'}`}
              min="0.01"
              step="any"
              value={item.quantity}
              style={{
                width: '100px',
                borderColor: isValidQuantity(item.quantity)
                  ? undefined
                  : 'red',
              }}
              aria-invalid={!isValidQuantity(item.quantity)}
              onChange={(e) =>
                updateQuantity(index, e.target.value)
              }
              onBlur={() => {
                const quantity = Number(item.quantity)

                if (isValidQuantity(item.quantity)) {
                  updateQuantity(index, String(quantity))
                }
              }}
            />

            <span>{ingredient?.unit}</span>

            <button
              type="button"
              onClick={() => removeIngredient(index)}
            >
              Remove
            </button>
          </div>
        )
      })}

      <button
        type="button"
        onClick={addIngredient}
        disabled={ingredients.length === ingredientCatalog.length}
      >
        + Add Ingredient
      </button>

      {hasInvalidQuantity && (
        <p
          role="alert"
          style={{ color: 'red', marginTop: '10px' }}
        >
          Quantity must be greater than zero.
        </p>
      )}
    </div>
  )
}
