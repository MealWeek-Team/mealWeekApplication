
const mongoose = require('mongoose');

const mealPlanSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        date: {
            type: String,
            required: true,
            match: /^\d{4}-\d{2}-\d{2}$/,
        },
        mealSlot: {
            type: String,
            required: true,
            enum: ['breakfast', 'lunch', 'dinner'],
        },
        recipe: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Recipe',
            required: true,
        },
        servings: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// One meal slot per user per day
mealPlanSchema.index(
    { user: 1, date: 1, mealSlot: 1 },
    { unique: true }
);

module.exports = mongoose.model('MealPlan', mealPlanSchema);