const mongoose = require('mongoose');

const recipeIngredientSchema = new mongoose.Schema(
    {
        ingredient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Ingredient',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 0.001
        }
    },
    { _id: false }
);

const recipeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        prepMinutes: {
            type: Number,
            required: true,
            min: 0
        },
        tags: {
            type: [String],
            default: []
        },
        ingredients: {
            type: [recipeIngredientSchema],
            required: true,
            validate: {
                validator: ingredients => ingredients.length > 0,
                message: 'A recipe must contain at least one ingredient'
            }
        },
        instructions: {
            type: String,
            required: true,
            trim: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Recipe', recipeSchema);
