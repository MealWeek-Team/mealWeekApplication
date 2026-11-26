
const Recipe = require('../models/Recipe');
const mongoose = require('mongoose');

// GET /api/recipes
// Get recipes belonging to the authenticated user
async function getRecipes(req, res) {
    try {
        const recipes = await Recipe.find({
            createdBy: req.userId
        });

        return res.status(200).json(recipes);
    } catch (error) {
        console.error('Get recipes error:', error);
        return res.status(500).json({
            message: 'Failed to retrieve recipes'
        });
    }
}

// GET /api/recipes/:id
// Get a single recipe
async function getRecipeById(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid recipe ID'
            });
        }

        const recipe = await Recipe.findOne({
            _id: req.params.id,
            createdBy: req.userId
        });

        if (!recipe) {
            return res.status(404).json({
                message: 'Recipe not found'
            });
        }

        return res.status(200).json(recipe);
    } catch (error) {
        console.error('Get recipe error:', error);
        return res.status(500).json({
            message: 'Failed to retrieve recipe'
        });
    }
}

// POST /api/recipes
// Create a new recipe
async function createRecipe(req, res) {
    try {
        const recipe = await Recipe.create({
            ...req.body,
            createdBy: req.userId
        });

        return res.status(201).json(recipe);
    } catch (error) {
        console.error('Create recipe error:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: 'Failed to create recipe'
        });
    }
}

// PUT /api/recipes/:id
// Update an existing recipe
async function updateRecipe(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid recipe ID'
            });
        }

        const updates = { ...req.body };

        // Prevent changing ownership through the request body
        delete updates.createdBy;
        delete updates._id;

        const recipe = await Recipe.findOneAndUpdate(
            {
                _id: req.params.id,
                createdBy: req.userId
            },
            updates,
            {
                new: true,
                runValidators: true
            }
        );

        if (!recipe) {
            return res.status(404).json({
                message: 'Recipe not found'
            });
        }

        return res.status(200).json(recipe);
    } catch (error) {
        console.error('Update recipe error:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: 'Failed to update recipe'
        });
    }
}

// DELETE /api/recipes/:id
// Delete an existing recipe
async function deleteRecipe(req, res) {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: 'Invalid recipe ID'
            });
        }

        const recipe = await Recipe.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.userId
        });

        if (!recipe) {
            return res.status(404).json({
                message: 'Recipe not found'
            });
        }

        return res.status(200).json({
            message: 'Recipe deleted successfully'
        });
    } catch (error) {
        console.error('Delete recipe error:', error);
        return res.status(500).json({
            message: 'Failed to delete recipe'
        });
    }
}

module.exports = {
    getRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe
};
