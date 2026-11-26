
const mongoose = require('mongoose');
const Ingredient = require('../models/Ingredient');
const Recipe = require('../models/Recipe');

// GET /api/ingredients
async function getIngredients(req, res) {
    try {
        const ingredients = await Ingredient.find().sort({ name: 1 });
        return res.status(200).json(ingredients);
    } catch (error) {
        console.error('Get ingredients error:', error);
        return res.status(500).json({
            message: 'Failed to retrieve ingredients'
        });
    }
}

// POST /api/ingredients
async function createIngredient(req, res) {
    try {
        const { name, unit } = req.body;

        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                message: 'Ingredient name is required'
            });
        }

        if (typeof unit !== 'string' || !unit.trim()) {
            return res.status(400).json({
                message: 'Ingredient unit is required'
            });
        }

        const ingredient = await Ingredient.create({
            name: name.trim(),
            unit: unit.trim()
        });

        return res.status(201).json(ingredient);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'This ingredient already exists'
            });
        }

        console.error('Create ingredients error:', error);
        return res.status(500).json({
            message: 'Failed to create ingredient'
        });
    }
}

// PUT /api/ingredients/:id
async function updateIngredient(req, res) {
    try {
        const { id } = req.params;
        const { name, unit } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid ingredient ID'
            });
        }

        if (
            (name !== undefined &&
                (typeof name !== 'string' || !name.trim())) ||
            (unit !== undefined &&
                (typeof unit !== 'string' || !unit.trim()))
        ) {
            return res.status(400).json({
                message: 'Invalid ingredient name or unit'
            });
        }

        if (name === undefined && unit === undefined) {
            return res.status(400).json({
                message: 'No updates provided'
            });
        }

        const ingredient = await Ingredient.findById(id);

        if (!ingredient) {
            return res.status(404).json({
                message: 'Ingredient not found'
            });
        }

        if (name !== undefined) ingredient.name = name.trim();
        if (unit !== undefined) ingredient.unit = unit.trim();

        await ingredient.save();

        return res.status(200).json(ingredient);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'An ingredient with this name already exists'
            });
        }

        console.error('Update ingredient error:', error);
        return res.status(500).json({
            message: 'Failed to update ingredient'
        });
    }
}

// POST /api/ingredients/:id/merge
async function mergeIngredient(req, res) {
    let session;

    try {
        const { id } = req.params;
        const targetId = req.body?.targetId;

        if (
            !mongoose.isValidObjectId(id) ||
            !mongoose.isValidObjectId(targetId)
        ) {
            return res.status(400).json({
                message: 'Invalid ingredient ID'
            });
        }

        const sourceId = new mongoose.Types.ObjectId(id);
        const targetObjectId = new mongoose.Types.ObjectId(targetId);

        if (sourceId.equals(targetObjectId)) {
            return res.status(400).json({
                message: 'Cannot merge an ingredient into itself'
            });
        }

        session = await mongoose.startSession();

        let result;

        await session.withTransaction(async () => {
            // Lock both ingredient records in a consistent order.
            const ids = [sourceId, targetObjectId].sort(
                (a, b) => a.toString().localeCompare(b.toString())
            );

            for (const ingredientId of ids) {
                const locked = await Ingredient.findOneAndUpdate(
                    { _id: ingredientId },
                    { $inc: { referenceVersion: 1 } },
                    { new: true, session }
                );

                if (!locked) {
                    const error = new Error('Ingredient not found');
                    error.statusCode = 404;
                    throw error;
                }
            }

            const source = await Ingredient.findById(sourceId).session(session);
            const target = await Ingredient.findById(targetObjectId).session(session);

            if (
                source.unit.trim().toLowerCase() !==
                target.unit.trim().toLowerCase()
            ) {
                const error = new Error(
                    'Cannot merge ingredients with different units'
                );
                error.statusCode = 409;
                throw error;
            }

            const recipes = await Recipe.find({
                'ingredients.ingredient': source._id
            }).session(session);

            for (const recipe of recipes) {
                const matchingEntries = recipe.ingredients.filter(
                    item =>
                        item.ingredient.equals(source._id) ||
                        item.ingredient.equals(target._id)
                );

                const combinedQuantity = matchingEntries.reduce(
                    (total, item) => total + item.quantity,
                    0
                );

                const firstIndex = recipe.ingredients.findIndex(
                    item =>
                        item.ingredient.equals(source._id) ||
                        item.ingredient.equals(target._id)
                );

                const updatedIngredients = recipe.ingredients.filter(
                    item =>
                        !item.ingredient.equals(source._id) &&
                        !item.ingredient.equals(target._id)
                );

                updatedIngredients.splice(firstIndex, 0, {
                    ingredient: target._id,
                    quantity: combinedQuantity
                });

                recipe.ingredients = updatedIngredients;
                await recipe.save({ session });
            }

            await Ingredient.deleteOne(
                { _id: source._id },
                { session }
            );

            result = {
                message: 'Ingredients merged successfully',
                mergedIngredient: source.name,
                targetIngredient: target.name,
                updatedRecipes: recipes.length
            };
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Merge ingredient error:', error);
        return res.status(error.statusCode || 500).json({
            message: error.message || 'Failed to merge ingredients'
        });
    } finally {
        if (session) await session.endSession();
    }
}

// DELETE /api/ingredients/:id
async function deleteIngredient(req, res) {
    let session;

    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'Invalid ingredient ID'
            });
        }

        session = await mongoose.startSession();

        await session.withTransaction(async () => {
            // Lock the ingredient before checking recipe references.
            const ingredient = await Ingredient.findOneAndUpdate(
                { _id: id },
                { $inc: { referenceVersion: 1 } },
                { new: true, session }
            );

            if (!ingredient) {
                const error = new Error('Ingredient not found');
                error.statusCode = 404;
                throw error;
            }

            const isUsed = await Recipe.exists({
                'ingredients.ingredient': ingredient._id
            }).session(session);

            if (isUsed) {
                const error = new Error(
                    'Ingredient is used in recipes. Rename or merge it instead.'
                );
                error.statusCode = 409;
                throw error;
            }

            await Ingredient.deleteOne(
                { _id: ingredient._id },
                { session }
            );
        });

        return res.status(200).json({
            message: 'Ingredient deleted successfully'
        });
    } catch (error) {
        console.error('Delete ingredient error:', error);
        return res.status(error.statusCode || 500).json({
            message: error.message || 'Failed to delete ingredient'
        });
    } finally {
        if (session) await session.endSession();
    }
}

module.exports = {
    getIngredients,
    createIngredient,
    updateIngredient,
    mergeIngredient,
    deleteIngredient
};