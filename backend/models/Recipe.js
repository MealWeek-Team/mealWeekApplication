const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        prepMinutes: { type: Number, min: 1 },
        tags: [{ type: String }],
        ingredients: [
            {
                ingredient: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Ingredient',
                    required: true,
                },
                quantity: { type: Number, min: 0, required: true },
            },
        ],
        instructions: { type: String, default: '' },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Recipe', recipeSchema);
