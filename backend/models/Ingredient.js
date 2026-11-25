const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        normalizedName: { type: String },
        category: { type: String },
        unit: { type: String },
        isActive: { type: Boolean, default: true },
    },
    {
        collection: 'ingredients',
        versionKey: false,
    }
);

module.exports = mongoose.model('Ingredient', ingredientSchema);
