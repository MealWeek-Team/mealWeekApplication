import { useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth.ts';
import { listMyRecipes, type Recipe, deleteRecipe, isUsedInPlan } from '../api/recipes';
import { Link } from 'react-router-dom';


export default function RecipesPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  useEffect(() => {
    if (!user) return
    listMyRecipes(user.id).then((list) => {
      setRecipes(list)
      setLoading(false)
    })

  }, [user])


  async function handleDelete(recipe: Recipe) {
    if (!user) return
    if (!window.confirm(`Delete "${recipe.name}"?`)) return

    setError('')
    try {
      await deleteRecipe(recipe.id, user.id)
      setRecipes((prev) => prev.filter((r) => r.id !== recipe.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <>
      <div className="page-header">
        <h1 >My Recipes</h1>
        <Link className="btn btn-primary" to="/recipes/new">+ New recipe</Link>
      </div>

      {error && <p role="alert" className="error">{error}</p>}

      {recipes.length === 0 ? (
        <p className="muted">No recipes yet. Create your first one.</p>
      ) : (
         <ul className="recipe-list">
        {recipes.map((r) => (
          <li key={r.id} className="card recipe-card">
            <div>
              <h2>{r.name}</h2>
              <p className="muted">
                {r.prepMinutes} min · {r.ingredients.length} ingredients
                {isUsedInPlan(r.id) && ' · used in a meal plan'}
              </p>
              <div className="tags">
                {r.tags.map((t) => <span key={t} className="tag">{t}</span>)}
              </div>
            </div>

            <div className="actions">
              <Link to={`/recipes/${r.id}/edit`} className="btn">Edit</Link>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleDelete(r)}
                disabled={isUsedInPlan(r.id)}
                title={isUsedInPlan(r.id) ? 'Used in a meal plan' : undefined}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
      )}

    </>

  )
}