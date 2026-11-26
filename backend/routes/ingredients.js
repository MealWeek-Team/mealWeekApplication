
const express = require('express');

const { requireAuth, requireAdmin } = require('../middleware/auth');

const {
    getIngredients,
    createIngredient,
    updateIngredient,
    mergeIngredient,
    deleteIngredient
} = require('../controllers/ingredientController');

const router = express.Router();

// All ingredient catalog routes require admin access
router.use(requireAuth, requireAdmin);

// GET /api/ingredients
router.get('/', getIngredients);

// POST /api/ingredients
router.post('/', createIngredient);

// PUT /api/ingredients/:id
router.put('/:id', updateIngredient);

// POST /api/ingredients/:id/merge
router.post('/:id/merge', mergeIngredient);

// DELETE /api/ingredients/:id
router.delete('/:id', deleteIngredient);

module.exports = router;