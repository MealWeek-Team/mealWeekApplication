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

// Preserve ingredient listing access for regular users
router.get('/', getIngredients);

// Ingredient management requires admin access
router.use(requireAuth, requireAdmin);

router.post('/', createIngredient);
router.put('/:id', updateIngredient);
router.post('/:id/merge', mergeIngredient);
router.delete('/:id', deleteIngredient);

module.exports = router;
