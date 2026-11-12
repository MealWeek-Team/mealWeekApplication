
import { ingredientCatalog, isValidQuantity } from '../api/ingredients'

// One row in the form; quantity is a string while the user is typing.

export type IngredientDraft = {
  ingredientId: number
  quantity: string
}

type Props = {
  value: IngredientDraft[]
  onChange: (next: IngredientDraft[]) => void
}

export default function RecipeIngredients({ value: ingredients, onChange }: Props) {

  // Add an ingredient without duplicates
  function addIngredient() {
    const available = ingredientCatalog.find(
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
  function changeIngredient(index: number, newId: number) {
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

  return (
    <div>
      {ingredients.map((item, index) => {
        const ingredient = ingredientCatalog.find(
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
        disabled={ingredients.length === ingredientCatalog.length}
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
