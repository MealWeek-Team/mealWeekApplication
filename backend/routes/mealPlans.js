
const express = require('express');

const { requireAuth } = require('../middleware/auth');

const {
    getMealPlans,
    createMealPlan,
    updateMealPlan,
    deleteMealPlan
} = require('../controllers/mealPlanController');

const router = express.Router();

// All meal plan routes require authentication
router.use(requireAuth);

// GET /api/meal-plans
router.get('/', getMealPlans);

// POST /api/meal-plans
router.post('/', createMealPlan);

// PUT /api/meal-plans/:id
router.put('/:id', updateMealPlan);

// DELETE /api/meal-plans/:id
router.delete('/:id', deleteMealPlan);

module.exports = router;