export type RecipeIngredient = {
    ingredientId: number
    quantity: number
}

export type Recipe = {
    id: number
    ownerId: number
    name: string
    prepMinutes: number
    tags: string[]
    ingredients: RecipeIngredient[]
    instructions: string
}
export const DIETARY_TAGS = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free']

// Data the form sends: a Recipe without the fields the "server" decides
export type RecipeInput = Omit<Recipe, 'id' | 'ownerId'>

const STORAGE_KEY = 'mealweek.recipes'

const SEED: Recipe[] = [
    {
        id: 1, ownerId: 1, name: 'Pasta with tomato sauce',

        prepMinutes: 30, tags: ['pasta', 'vegetarian'],
        ingredients: [{ ingredientId: 1, quantity: 200 }, { ingredientId: 2, quantity: 1 }],
        instructions: 'Cook pasta. Prepare sauce. Mix together.'
    },
    {
        id: 2, ownerId: 1, name: 'Pancakes',

        prepMinutes: 20, tags: ['vegetarian'],
        ingredients: [{ ingredientId: 3, quantity: 200 }, { ingredientId: 4, quantity: 300 }],
        instructions: 'Mix everything and fry on a hot pan.',
    }
]

const USED_IN_PLAN = new Set<number>([2])


function load(): Recipe[] {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : SEED
}

function save(recipes: Recipe[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes))
}

const wait = () => new Promise((resolve) => setTimeout(resolve, 500))

export async function listMyRecipes(ownerId: number): Promise<Recipe[]> {
    await wait()
    return load().filter((r) => r.ownerId === ownerId)
}


export function isUsedInPlan(id: number) {
    return USED_IN_PLAN.has(id)
}



export async function deleteRecipe(id: number, ownerId: number): Promise<void> {
    await wait()

    if (isUsedInPlan(id)) {
        throw new Error('Recipe is used in plan and cannot be deleted.')
    }

    const recipes = load()

    const exists = recipes.some((r) => r.id === id && r.ownerId === ownerId)
    if (!exists) {
        throw new Error('Recipe not found.')
    }

    const RemainingRecipes = recipes.filter((r) => r.id !== id || r.ownerId !== ownerId)
    save(RemainingRecipes)
}

export async function createRecipe(ownerId: number, input: RecipeInput): Promise<Recipe> {
    await wait()
    const recipes = load()
    const newId = recipes.length > 0 ? Math.max(...recipes.map((r) => r.id)) + 1 : 1
    const newRecipe: Recipe = { id: newId, ownerId, ...input }
    save([...recipes, newRecipe])

    return newRecipe
}

export async function getRecipe(id: number, ownerId: number): Promise<Recipe | null> {
    await wait()
    const recipes = load()
    const recipe = recipes.find((r) => r.id === id && r.ownerId === ownerId)
    return recipe || null
}

export async function updateRecipe(id: number, ownerId: number, input: RecipeInput): Promise<Recipe> {
    await wait()
    const recipes = load();
    const recipeIndex = recipes.findIndex((r) => r.id === id && r.ownerId === ownerId)
    if (recipeIndex === -1) {
        throw new Error("Recipe not found.")
    }
    const updatedRecipe: Recipe = { id, ownerId, ...input }
    recipes[recipeIndex] = updatedRecipe
    save(recipes)
    return updatedRecipe
}


