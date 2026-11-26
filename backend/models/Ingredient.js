
const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        normalizedName: {
            type: String,
            required: true,
            unique: true
        },
        unit: {
            type: String,
            required: true,
            trim: true
        },
        referenceVersion: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

ingredientSchema.pre('validate', function () {
    if (this.name) {
        this.normalizedName = this.name.trim().toLowerCase();
    }
});

module.exports = mongoose.model('Ingredient', ingredientSchema);