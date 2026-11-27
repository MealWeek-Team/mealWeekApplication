
const mongoose = require('mongoose');
const MealPlan = require('../models/MealPlan');
const Recipe = require('../models/Recipe');

// Validate YYYY-MM-DD and ensure it is a real calendar date
function isValidDate(date) {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    return !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date;
}

// GET /api/meal-plans
async function getMealPlans(req, res) {
    try {
        const filter = { user: req.userId };

        if (req.query.date) {
            if (!isValidDate(req.query.date)) {
                return res.status(400).json({
                    message: 'Invalid date format. Use YYYY-MM-DD'
                });
            }

            filter.date = req.query.date;
        }

        if (req.query.from || req.query.to) {
            const dateFilter = {};

            if (req.query.from) {
                if (!isValidDate(req.query.from)) {
                    return res.status(400).json({
                        message: 'Invalid start date. Use YYYY-MM-DD'
                    });
                }

                dateFilter.$gte = req.query.from;
            }

            if (req.query.to) {
                if (!isValidDate(req.query.to)) {
                    return res.status(400).json({
                        message: 'Invalid end date. Use YYYY-MM-DD'
                    });
                }

                dateFilter.$lte = req.query.to;
            }

            filter.date = dateFilter;
        }

        const mealPlans = await MealPlan.find(filter)
            .populate('recipe')
            .sort({ date: 1, mealSlot: 1 });

        return res.status(200).json(mealPlans);
    } catch (error) {
        console.error('Get meal plans error:', error);

        return res.status(500).json({
            message: 'Failed to retrieve meal plans'
        });
    }
}

// POST /api/meal-plans
async function createMealPlan(req, res) {
    try {
        const { date, mealSlot, recipe } = req.body;

        if (!isValidDate(date)) {
            return res.status(400).json({
                message: 'Invalid date format. Use YYYY-MM-DD'
            });
        }

        if (!['breakfast', 'lunch', 'dinner'].includes(mealSlot)) {
            return res.status(400).json({
                message: 'Invalid meal slot'
            });
        }

        if (!mongoose.isValidObjectId(recipe)) {
            return res.status(400).json({
                message: 'Invalid recipe ID'
            });
        }

        const existingRecipe = await Recipe.findOne({
            _id: recipe,
            createdBy: req.userId
        });

        if (!existingRecipe) {
            return res.status(404).json({
                message: 'Recipe not found'
            });
        }

        const mealPlan = await MealPlan.create({
            user: req.userId,
            date,
            mealSlot,
            recipe
        });

        return res.status(201).json(mealPlan);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'This meal slot already has a recipe'
            });
        }

        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({
                message: error.message
            });
        }

        console.error('Create meal plan error:', error);

        return res.status(500).json({
            message: 'Failed to create meal plan'
        });
    }
}

// PUT /api/meal-plans/:id
async function updateMealPlan(req, res) {
    try {
        const { id } = req.params;
        const { recipe } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid meal plan ID'
            });
        }

        if (!mongoose.isValidObjectId(recipe)) {
            return res.status(400).json({
                message: 'Invalid recipe ID'
            });
        }

        const existingRecipe = await Recipe.findOne({
            _id: recipe,
            createdBy: req.userId
        });

        if (!existingRecipe) {
            return res.status(404).json({
                message: 'Recipe not found'
            });
        }

        const mealPlan = await MealPlan.findOneAndUpdate(
            {
                _id: id,
                user: req.userId
            },
            {
                $set: { recipe }
            },
            {
                new: true,
                runValidators: true
            }
        ).populate('recipe');

        if (!mealPlan) {
            return res.status(404).json({
                message: 'Meal plan not found'
            });
        }

        return res.status(200).json(mealPlan);
    } catch (error) {
        console.error('Update meal plan error:', error);

        return res.status(500).json({
            message: 'Failed to update meal plan'
        });
    }
}

// DELETE /api/meal-plans/:id
async function deleteMealPlan(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid meal plan ID'
            });
        }

        const mealPlan = await MealPlan.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!mealPlan) {
            return res.status(404).json({
                message: 'Meal plan not found'
            });
        }

        return res.status(200).json({
            message: 'Meal plan deleted successfully'
        });
    } catch (error) {
        console.error('Delete meal plan error:', error);

        return res.status(500).json({
            message: 'Failed to delete meal plan'
        });
    }
}

module.exports = {
    getMealPlans,
    createMealPlan,
    updateMealPlan,
    deleteMealPlan
};