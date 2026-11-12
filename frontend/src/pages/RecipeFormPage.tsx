import { useState, type FormEvent, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.ts'
import RecipeIngredients, { type IngredientDraft } from '../components/RecipeIngredients'
import { isValidQuantity } from '../api/ingredients'
import { DIETARY_TAGS, createRecipe, getRecipe, type RecipeInput, updateRecipe } from '../api/recipes'

export default function RecipeFormPage() {

  const { id } = useParams()
  const isEdit = id !== undefined
  const { user } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [prepMinutes, setPrepMinutes] = useState('30')
  const [tags, setTags] = useState<string[]>([])
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([])
  const [instructions, setInstructions] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit || !user) return
    getRecipe(Number(id), user.id).then((recipe) => {
      if (!recipe) {
        setError('Recipe not found.')
      } else {
        setName(recipe.name)
        setPrepMinutes(recipe.prepMinutes.toString())
        setTags(recipe.tags)
        setIngredients(recipe.ingredients.map((i) => ({ ingredientId: i.ingredientId, quantity: i.quantity.toString() })))
        setInstructions(recipe.instructions)
      }
      setLoading(false)
    })
  }, [id, isEdit, user])


  function toggleTag(tag: string) {
    setTags(tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag])
  }

  function validate(): string {
    if (!name.trim()) return 'Name is required.'
    if (!Number.isInteger(Number(prepMinutes)) || Number(prepMinutes) <= 0) return 'Preparation time must be a positive integer.'
    if (ingredients.length === 0) return 'At least one ingredient is required.'
    if (ingredients.some((i) => !isValidQuantity(i.quantity))) return 'All ingredient quantities must be greater than zero.'
    return ''
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return

    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }

    const input: RecipeInput = {
      name: name.trim(),
      prepMinutes: Number(prepMinutes),
      tags,
      ingredients: ingredients.map((i) => ({ ingredientId: i.ingredientId, quantity: Number(i.quantity) })),
      instructions: instructions.trim(),
    }

    setSaving(true)
    try {
      if (isEdit) await updateRecipe(Number(id), user.id, input)
      else await createRecipe(user.id, input)
      navigate('/recipes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Saving failed.')
      setSaving(false)
    }
  }

  if (loading) return <p>Loading…</p>

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h1>{isEdit ? 'Edit recipe' : 'New recipe'}</h1>

      <label className="field">
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>

      <label className="field">
        Preparation time (minutes)
        <input type="number" value={prepMinutes} onChange={(e) => setPrepMinutes(e.target.value)} />
      </label>

      <fieldset className="field">
        <legend >Dietary tags</legend>
        <div className="tag-options">
          {DIETARY_TAGS.map((tag) => (
            <label className="checkbox" key={tag}>
              <input type="checkbox" checked={tags.includes(tag)} onChange={() => toggleTag(tag)} />
              {tag}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend >Ingredients</legend>
        <RecipeIngredients value={ingredients} onChange={setIngredients} />
      </fieldset>

      <label className="field">
        Instructions
        <textarea rows={4} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
      </label>

      {error && <p role="alert" className="error">{error}</p>}
      <div className="actions">
        <Link className="btn" to="/recipes">Cancel</Link>
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save recipe'}
        </button>
      </div>
    </form>
  )
}