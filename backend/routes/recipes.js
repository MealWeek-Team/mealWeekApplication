
const express = require('express');

const { requireAuth } = require('../middleware/auth');

const {
    getRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe
} = require('../controllers/recipeController');

const { searchRecipes } = require('../controllers/searchController');

const router = express.Router();

// All recipe routes require authentication
router.use(requireAuth);

// GET /api/recipes
router.get('/', getRecipes);

// GET /api/recipes/search
router.get('/search', searchRecipes);

// GET /api/recipes/:id
router.get('/:id', getRecipeById);

// POST /api/recipes
router.post('/', createRecipe);

// PUT /api/recipes/:id
router.put('/:id', updateRecipe);

// DELETE /api/recipes/:id
router.delete('/:id', deleteRecipe);

module.exports = router;
