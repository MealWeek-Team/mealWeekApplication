
import { type Ingredient, isValidQuantity } from '../api/ingredients'

// One row in the form; quantity is a string while the user is typing.

export type IngredientDraft = {
  ingredientId: string
  quantity: string
}

type Props = {
  catalog: Ingredient[]
  value: IngredientDraft[]
  onChange: (next: IngredientDraft[]) => void
}

export default function RecipeIngredients({ catalog, value: ingredients, onChange }: Props) {

  // Add an ingredient without duplicates
  function addIngredient() {
    const available = catalog.find(
      (item) =>
        !ingredients.some(
          (selected) => selected.ingredientId === item.id
        )
    )

    if (!available) return

    onChange(
      [
        ...ingredients,
        { ingredientId: available.id, quantity: '1' },
      ]
    )
  }

  // Update an ingredient's quantity
  function updateQuantity(index: number, quantity: string) {
    onChange(
      ingredients.map((item, i) =>
        i === index ? { ...item, quantity } : item
      )
    )
  }

  // Change the selected ingredient
  function changeIngredient(index: number, newId: string) {
    const isDuplicate = ingredients.some(
      (item, i) => i !== index && item.ingredientId === newId
    )
    if (isDuplicate) return

    onChange(
      ingredients.map((item, i) =>
        i === index ? { ...item, ingredientId: newId } : item
      )
    )
  }

  // Remove an ingredient
  function removeIngredient(index: number) {
    onChange(ingredients.filter((_, i) => i !== index))
  }

  const hasInvalidQuantity = ingredients.some(
    (item) => !isValidQuantity(item.quantity)
  )
  const hasAvailableIngredient = catalog.some(
    (item) => !ingredients.some((selected) => selected.ingredientId === item.id)
  )

  return (
    <div>
      {ingredients.map((item, index) => {
        const ingredient = catalog.find(
          (catalogItem) => catalogItem.id === item.ingredientId
        )

        return (
          <div
            key={item.ingredientId}
            className="ingredient-row">
            <select
              aria-label={`Ingredient ${index + 1}`}
              value={item.ingredientId}
              onChange={(e) =>
                changeIngredient(index, e.target.value)
              }
            >
              {catalog
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
              {!catalog.some((catalogItem) => catalogItem.id === item.ingredientId) && (
                <option value={item.ingredientId}>
                  Unknown ingredient ({item.ingredientId})
                </option>
              )}
            </select>

            <input
              type="number"
              aria-label={`Quantity for ${ingredient?.name ?? 'ingredient'}`}
              min="0.01"
              step="any"
              value={item.quantity}
              className={isValidQuantity(item.quantity) ? undefined : 'invalid'}
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

            <span className="unit" >{ingredient?.unit}</span>

            <button
              className="link-button"
              type="button"
              onClick={() => removeIngredient(index)}
            >
              Remove
            </button>
          </div>
        )
      })}

      <button
        className="btn"
        type="button"
        onClick={addIngredient}
        disabled={!hasAvailableIngredient}
      >
        + Add Ingredient
      </button>

      {hasInvalidQuantity && (
        <p
          role="alert"
          className="error"
        >
          Quantity must be greater than zero.
        </p>
      )}
    </div>
  )
}
