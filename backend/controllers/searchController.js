
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');

// GET /api/recipes/search?q=tom&page=1&limit=10
async function searchRecipes(req, res) {
    try {
        const { q } = req.query;

        // Validate search query
        if (typeof q !== 'string' || !q.trim()) {
            return res.status(400).json({
                message: 'Search query is required'
            });
        }

        const searchTerm = q.trim();

        if (searchTerm.length > 100) {
            return res.status(400).json({
                message: 'Search query is too long'
            });
        }

        // Validate pagination parameters
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 10);

        if (
            !Number.isInteger(page) ||
            !Number.isInteger(limit) ||
            page < 1 ||
            limit < 1
        ) {
            return res.status(400).json({
                message: 'Page and limit must be positive integers'
            });
        }

        if (limit > 50) {
            return res.status(400).json({
                message: 'Limit cannot exceed 50'
            });
        }

        const skip = (page - 1) * limit;

        // Escape special regular expression characters
        const escapedTerm = searchTerm.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
        );

        // Case-insensitive partial matching
        const searchRegex = new RegExp(escapedTerm, 'i');

        // Find matching ingredients
        const matchingIngredients = await Ingredient.find({
            $or: [
                { name: searchRegex },
                { normalizedName: searchRegex }
            ]
        }).select('_id');

        const ingredientIds = matchingIngredients.map(
            ingredient => ingredient._id
        );

        // Search recipes by name or ingredient
        const searchConditions = [
            { name: searchRegex }
        ];

        if (ingredientIds.length > 0) {
            searchConditions.push({
                'ingredients.ingredient': {
                    $in: ingredientIds
                }
            });
        }

        const searchFilter = {
            $or: searchConditions
        };

        // Retrieve paginated results and total count
        const [recipes, totalRecipes] = await Promise.all([
            Recipe.find(searchFilter)
                .populate('ingredients.ingredient')
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit),

            Recipe.countDocuments(searchFilter)
        ]);

        return res.status(200).json({
            query: searchTerm,
            currentPage: page,
            totalPages: Math.ceil(totalRecipes / limit),
            totalRecipes,
            results: recipes
        });

    } catch (error) {
        console.error('Search recipes error:', error);

        return res.status(500).json({
            message: 'Failed to search recipes'
        });
    }
}

module.exports = { searchRecipes };