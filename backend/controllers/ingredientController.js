const Ingredient = require('../models/Ingredient');

async function getIngredients(req, res) {
    try {
        const ingredients = await Ingredient.find({ isActive: true })
            .select('_id name category unit')
            .sort({ name: 1 })
            .lean();

        return res.status(200).json(
            ingredients.map((ingredient) => ({
                id: ingredient._id.toString(),
                name: ingredient.name,
                category: ingredient.category,
                unit: ingredient.unit,
            }))
        );
    } catch (error) {
        console.error('Get ingredients error:', error);
        return res.status(500).json({
            message: 'Failed to retrieve ingredients',
        });
    }
}

module.exports = { getIngredients };
