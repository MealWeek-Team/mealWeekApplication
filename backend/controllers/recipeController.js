
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');
const mongoose = require('mongoose');

// Validate ingredient references and lock them within the transaction
async function lockIngredients(ingredients, session) {
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return 'A recipe must contain at least one ingredient';
    }

    const ids = [];

    for (const item of ingredients) {
        if (
            !item ||
            typeof item !== 'object' ||
            !mongoose.isValidObjectId(item.ingredient)
        ) {
            return 'Invalid ingredient ID';
        }

        ids.push(String(item.ingredient));
    }

    const uniqueIds = [...new Set(ids)].sort();

    for (const id of uniqueIds) {
        const ingredient = await Ingredient.findOneAndUpdate(
            { _id: id },
            { $inc: { referenceVersion: 1 } },
            { new: true, session }
        );

        if (!ingredient) {
            return 'One or more ingredients do not exist';
        }
    }

    return null;
}

// GET /api/recipes
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
async function createRecipe(req, res) {
    let session;

    try {
        session = await mongoose.startSession();

        let createdRecipe;

        await session.withTransaction(async () => {
            const validationError = await lockIngredients(
                req.body.ingredients,
                session
            );

            if (validationError) {
                const error = new Error(validationError);
                error.statusCode = 400;
                throw error;
            }

            const recipes = await Recipe.create(
                [{
                    ...req.body,
                    createdBy: req.userId
                }],
                { session }
            );

            createdRecipe = recipes[0];
        });

        return res.status(201).json(createdRecipe);
    } catch (error) {
        console.error('Create recipe error:', error);

        if (
            error.statusCode ||
            error.name === 'ValidationError' ||
            error.name === 'CastError'
        ) {
            return res.status(error.statusCode || 400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: 'Failed to create recipe'
        });
    } finally {
        if (session) {
            await session.endSession();
        }
    }
}

// PUT /api/recipes/:id
async function updateRecipe(req, res) {
    let session;

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

        session = await mongoose.startSession();

        let updatedRecipe;

        await session.withTransaction(async () => {
            const recipe = await Recipe.findOne({
                _id: req.params.id,
                createdBy: req.userId
            }).session(session);

            if (!recipe) {
                const error = new Error('Recipe not found');
                error.statusCode = 404;
                throw error;
            }

            const ingredientsToLock = updates.ingredients === undefined
                ? recipe.ingredients
                : [...recipe.ingredients, ...(
                    Array.isArray(updates.ingredients)
                        ? updates.ingredients
                        : []
                )];

            const validationError = await lockIngredients(
                ingredientsToLock,
                session
            );

            if (validationError) {
                const error = new Error(validationError);
                error.statusCode = 400;
                throw error;
            }

            recipe.set(updates);
            updatedRecipe = await recipe.save({ session });
        });

        return res.status(200).json(updatedRecipe);
    } catch (error) {
        console.error('Update recipe error:', error);

        if (
            error.statusCode ||
            error.name === 'ValidationError' ||
            error.name === 'CastError'
        ) {
            return res.status(error.statusCode || 400).json({
                message: error.message
            });
        }

        return res.status(500).json({
            message: 'Failed to update recipe'
        });
    } finally {
        if (session) {
            await session.endSession();
        }
    }
}

// DELETE /api/recipes/:id
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